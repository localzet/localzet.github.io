#define _GNU_SOURCE
#include <arpa/inet.h>
#include <errno.h>
#include <netinet/in.h>
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/time.h>
#include <unistd.h>

#ifndef ATLAS_VERSION
#define ATLAS_VERSION "stable-v1"
#endif

#ifndef ATLAS_CANDIDATE
#define ATLAS_CANDIDATE 0
#endif

static volatile sig_atomic_t stopping;
static int listener = -1;

static int send_all(int socket_fd, const char *data, size_t length) {
  while (length > 0) {
    ssize_t sent = send(socket_fd, data, length, MSG_NOSIGNAL);
    if (sent < 0 && errno == EINTR) continue;
    if (sent <= 0) return -1;
    data += sent;
    length -= (size_t)sent;
  }
  return 0;
}

static void handle_request(int client) {
  char request[1024];
  size_t used = 0;

  while (used < sizeof(request) - 1) {
    ssize_t received = recv(client, request + used, sizeof(request) - 1 - used, 0);
    if (received < 0 && errno == EINTR) continue;
    if (received <= 0) return;
    used += (size_t)received;
    request[used] = '\0';
    if (strchr(request, '\n')) break;
  }

  char method[8] = {0};
  char path[128] = {0};
  if (sscanf(request, "%7s %127s", method, path) != 2) return;

  int status = 200;
  const char *reason = "OK";
  const char *body;
  if (strcmp(method, "GET") != 0) {
    status = 405;
    reason = "Method Not Allowed";
    body = "method not allowed\n";
  } else if (strcmp(path, "/health") == 0) {
    if (ATLAS_CANDIDATE) {
      status = 503;
      reason = "Service Unavailable";
      body = "candidate rejected\n";
    } else {
      body = "healthy\n";
    }
  } else if (strcmp(path, "/version") == 0) {
    body = ATLAS_VERSION "\n";
  } else {
    status = 404;
    reason = "Not Found";
    body = "not found\n";
  }

  char response[512];
  size_t body_length = strlen(body);
  int length = snprintf(response, sizeof(response),
                        "HTTP/1.1 %d %s\r\nContent-Type: text/plain\r\n"
                        "Content-Length: %zu\r\nConnection: close\r\n\r\n%s",
                        status, reason, body_length, body);
  if (length > 0 && (size_t)length < sizeof(response)) {
    send_all(client, response, (size_t)length);
  }
}

static void stop_server(int signal_number) {
  (void)signal_number;
  stopping = 1;
  if (listener >= 0) close(listener);
}

static int serve(void) {
  struct sigaction action = {0};
  action.sa_handler = stop_server;
  sigemptyset(&action.sa_mask);
  if (sigaction(SIGTERM, &action, NULL) != 0 || sigaction(SIGINT, &action, NULL) != 0) {
    perror("sigaction");
    return 1;
  }
  signal(SIGPIPE, SIG_IGN);

  listener = socket(AF_INET, SOCK_STREAM, 0);
  if (listener < 0) {
    perror("socket");
    return 1;
  }

  int reuse = 1;
  setsockopt(listener, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(reuse));

  struct sockaddr_in address = {0};
  address.sin_family = AF_INET;
  address.sin_addr.s_addr = htonl(INADDR_ANY);
  address.sin_port = htons(8080);
  if (bind(listener, (struct sockaddr *)&address, sizeof(address)) != 0 ||
      listen(listener, 16) != 0) {
    perror("listen");
    close(listener);
    listener = -1;
    return 1;
  }

  while (!stopping) {
    int client = accept(listener, NULL, NULL);
    if (client < 0) {
      if (errno == EINTR || stopping) continue;
      perror("accept");
      close(listener);
      listener = -1;
      return 1;
    }
    handle_request(client);
    close(client);
  }

  listener = -1;
  return 0;
}

static int check_health(void) {
  int socket_fd = socket(AF_INET, SOCK_STREAM, 0);
  if (socket_fd < 0) return 1;

  struct timeval timeout = {.tv_sec = 1, .tv_usec = 0};
  setsockopt(socket_fd, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout));
  setsockopt(socket_fd, SOL_SOCKET, SO_SNDTIMEO, &timeout, sizeof(timeout));

  struct sockaddr_in address = {0};
  address.sin_family = AF_INET;
  address.sin_addr.s_addr = htonl(INADDR_LOOPBACK);
  address.sin_port = htons(8080);
  if (connect(socket_fd, (struct sockaddr *)&address, sizeof(address)) != 0) {
    close(socket_fd);
    return 1;
  }

  const char request[] = "GET /health HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n";
  if (send_all(socket_fd, request, sizeof(request) - 1) != 0) {
    close(socket_fd);
    return 1;
  }

  char response[128] = {0};
  ssize_t received = recv(socket_fd, response, sizeof(response) - 1, 0);
  close(socket_fd);
  return received > 0 && strncmp(response, "HTTP/1.1 200 ", 13) == 0 ? 0 : 1;
}

int main(int argc, char **argv) {
  if (argc != 2) return 2;
  if (strcmp(argv[1], "serve") == 0) return serve();
  if (strcmp(argv[1], "health") == 0) return check_health();
  return 2;
}
