#!/usr/bin/env bash
set -Eeuo pipefail

readonly label_key="com.localzet.atlas.lab"
readonly project_key="com.localzet.atlas.project"
readonly lab_id="docker-capstone-$(date -u +%Y%m%d%H%M%S)-${RANDOM}-$$"
readonly network_name="${lab_id}-net"
readonly stable_tag="localzet/atlas-docker-capstone:${lab_id}-stable"
readonly candidate_tag="localzet/atlas-docker-capstone:${lab_id}-candidate"
readonly source_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

build_dir=""
cleanup_failed=0
created_container=""

refuse() {
  printf 'Отказ: %s\n' "$1" >&2
  exit 2
}

if [[ "${ATLAS_DOCKER_PROJECT:-}" != "1" ]]; then
  refuse 'для создания изолированных ресурсов задайте ATLAS_DOCKER_PROJECT=1.'
fi

if [[ -n "${DOCKER_HOST:-}" || -n "${DOCKER_CONTEXT:-}" ]]; then
  refuse 'DOCKER_HOST и DOCKER_CONTEXT должны быть не заданы; выберите локальный context командой docker context use.'
fi

command -v docker >/dev/null || refuse 'команда docker не найдена.'
command -v cc >/dev/null || refuse 'нужен C-компилятор cc.'
command -v tar >/dev/null || refuse 'команда tar не найдена.'
command -v curl >/dev/null || refuse 'команда curl не найдена.'

context_name="$(docker context show)" || refuse 'не удалось прочитать Docker context.'
endpoint="$(docker context inspect "$context_name" --format '{{(index .Endpoints "docker").Host}}')" ||
  refuse 'не удалось прочитать endpoint Docker context.'
[[ "$endpoint" == unix://* ]] || refuse 'разрешён только локальный Unix socket Docker Engine.'
socket_path="${endpoint#unix://}"
[[ -S "$socket_path" ]] || refuse 'Unix socket текущего Docker context недоступен локально.'
readonly endpoint

docker_host() {
  command docker --host "$endpoint" "$@"
}

[[ -n "$(docker_host version --format '{{.Server.Version}}')" ]] || refuse 'Docker Engine недоступен.'

libc_archive="$(cc -print-file-name=libc.a)"
[[ -f "$libc_archive" ]] || refuse 'для автономного scratch-образа нужен установленный static libc.'

build_dir="$(mktemp -d "${TMPDIR:-/tmp}/atlas-docker-capstone.XXXXXX")"

cleanup() {
  local status=$?
  trap - EXIT
  set +e

  local resource_id resources
  if resources="$(docker_host ps -aq --filter "label=${label_key}=${lab_id}" 2>/dev/null)"; then
    while IFS= read -r resource_id; do
      [[ -n "$resource_id" ]] || continue
      docker_host rm -f "$resource_id" >/dev/null || cleanup_failed=1
    done <<< "$resources"
  else
    cleanup_failed=1
  fi

  if resources="$(docker_host network ls -q --filter "label=${label_key}=${lab_id}" 2>/dev/null)"; then
    while IFS= read -r resource_id; do
      [[ -n "$resource_id" ]] || continue
      docker_host network rm "$resource_id" >/dev/null || cleanup_failed=1
    done <<< "$resources"
  else
    cleanup_failed=1
  fi

  if resources="$(docker_host image ls -q --no-trunc --filter "label=${label_key}=${lab_id}" 2>/dev/null)"; then
    while IFS= read -r resource_id; do
      [[ -n "$resource_id" ]] || continue
      docker_host image rm "$resource_id" >/dev/null || cleanup_failed=1
    done <<< "$resources"
  else
    cleanup_failed=1
  fi

  if [[ -n "$build_dir" && -d "$build_dir" ]]; then
    rm -rf -- "$build_dir" || cleanup_failed=1
  fi

  if [[ "$status" -eq 0 && "$cleanup_failed" -ne 0 ]]; then status=1; fi
  if [[ "$cleanup_failed" -ne 0 ]]; then
    printf 'Ошибка: не все ресурсы лаборатории %s удалось удалить. Проверьте только метку %s=%s.\n' \
      "$lab_id" "$label_key" "$lab_id" >&2
  fi
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

compile_image() {
  local version="$1"
  local candidate="$2"
  local tag="$3"
  local image_root="$build_dir/root-${candidate}"
  mkdir -p "$image_root"

  cc -std=c11 -O2 -static -s \
    "-DATLAS_VERSION=\"${version}\"" \
    "-DATLAS_CANDIDATE=${candidate}" \
    "$source_dir/atlas-httpd.c" -o "$image_root/atlas-httpd"
  chmod 0555 "$image_root/atlas-httpd"

  tar --numeric-owner --owner=0 --group=0 -C "$image_root" -cf - . |
    docker_host import \
      --change 'USER 10001:10001' \
      --change 'ENTRYPOINT ["/atlas-httpd"]' \
      --change 'CMD ["serve"]' \
      --change 'HEALTHCHECK --interval=2s --timeout=1s --retries=2 --start-period=1s CMD ["/atlas-httpd","health"]' \
      --change "LABEL ${project_key}=docker-capstone" \
      --change "LABEL ${label_key}=${lab_id}" \
      - "$tag" >/dev/null
}

start_release() {
  local name="$1"
  local image="$2"
  local port="$3"
  local publish="127.0.0.1:${port}:8080"
  if [[ "$port" == "auto" ]]; then publish='127.0.0.1::8080'; fi

  docker_host run --pull=never --detach \
    --name "$name" \
    --label "${project_key}=docker-capstone" \
    --label "${label_key}=${lab_id}" \
    --network "$network_name" \
    --publish "$publish" \
    --read-only \
    --user 10001:10001 \
    --cap-drop ALL \
    --security-opt no-new-privileges:true \
    --memory 64m \
    --cpus 0.25 \
    --pids-limit 16 \
    "$image" serve >/dev/null
}

container_image_id() {
  docker_host inspect --format '{{.Image}}' "$1"
}

host_port() {
  docker_host inspect --format '{{(index (index .NetworkSettings.Ports "8080/tcp") 0).HostPort}}' "$1"
}

wait_health() {
  local container="$1"
  local expected="$2"
  local actual
  for _ in {1..30}; do
    actual="$(docker_host inspect --format '{{.State.Health.Status}}' "$container" 2>/dev/null || true)"
    [[ "$actual" == "$expected" ]] && return 0
    sleep 1
  done
  printf 'Ошибка: контейнер %s не перешёл в health=%s.\n' "$container" "$expected" >&2
  docker_host inspect --format 'status={{.State.Status}} health={{.State.Health.Status}}' "$container" >&2 || true
  return 1
}

expect_http() {
  local path="$1"
  local expected_status="$2"
  local expected_body="$3"
  local actual_status=""
  local actual_body=""

  for _ in {1..20}; do
    actual_status="$(curl --silent --max-time 2 --output "$build_dir/response" \
      --write-out '%{http_code}' "http://127.0.0.1:${release_port}${path}" 2>/dev/null || true)"
    actual_body="$(cat "$build_dir/response" 2>/dev/null || true)"
    if [[ "$actual_status" == "$expected_status" && "$actual_body" == "$expected_body" ]]; then
      return 0
    fi
    sleep 1
  done

  printf 'Ошибка: %s ожидал HTTP %s с телом %s; получено HTTP %s с телом %s.\n' \
    "$path" "$expected_status" "$expected_body" "$actual_status" "$actual_body" >&2
  return 1
}

printf 'Лаборатория: %s\n' "$lab_id"
docker_host network create \
  --label "${project_key}=docker-capstone" \
  --label "${label_key}=${lab_id}" \
  "$network_name" >/dev/null

compile_image 'stable-v1' 0 "$stable_tag"
compile_image 'candidate-v2' 1 "$candidate_tag"
stable_image_id="$(docker_host image inspect --format '{{.Id}}' "$stable_tag")"

start_release "${lab_id}-stable" "$stable_image_id" auto
created_container="${lab_id}-stable"
release_port="$(host_port "$created_container")"
[[ "$release_port" =~ ^[0-9]+$ ]] || refuse 'Engine не назначил локальный порт релизу.'
wait_health "$created_container" healthy
expect_http /health 200 healthy
expect_http /version 200 stable-v1
printf 'Исходный релиз: healthy, stable-v1, 127.0.0.1:%s\n' "$release_port"

docker_host rm -f "$created_container" >/dev/null
created_container=""
start_release "${lab_id}-candidate" "$candidate_tag" "$release_port"
created_container="${lab_id}-candidate"
wait_health "$created_container" unhealthy
expect_http /health 503 'candidate rejected'
expect_http /version 200 candidate-v2
printf 'Кандидат отклонён: unhealthy, HTTP 503, candidate-v2\n'

docker_host rm -f "$created_container" >/dev/null
created_container=""
start_release "${lab_id}-rollback" "$stable_image_id" "$release_port"
created_container="${lab_id}-rollback"
[[ "$(container_image_id "$created_container")" == "$stable_image_id" ]] ||
  refuse 'контейнер отката использует другой image ID.'
wait_health "$created_container" healthy
expect_http /health 200 healthy
expect_http /version 200 stable-v1
printf 'Откат подтверждён: прежний image ID восстановлен на 127.0.0.1:%s; health=healthy\n' \
  "$release_port"
