(function(){
const add=(id,title,summary,minutes,sources,body)=>window.ATLAS_DATA.lessons.push({id,course:"docker",title,summary,minutes,sources,body});
add("docker-origin","Контейнеры не виртуальные машины","История от chroot до Docker, shared kernel, OCI и устройство Engine.",28,["docker","oci","namespaces"],`
## История: изоляция появилась до Docker

В 1979 году в UNIX появился механизм §chroot§, меняющий видимый корень путей, но сам по себе **не обеспечивающий полноценную защиту**. Затем развивались FreeBSD jails, Solaris Zones и Linux namespaces/cgroups; LXC позволял собирать из них контейнеры. Docker, публично представленный в 2013 году, сделал создание образов, передачу, воспроизводимый запуск и удобный CLI массовой практикой.

Контейнер — не «маленькая виртуальная машина». В обычном Linux-контейнере процессы запускаются **на том же ядре**, что и хост, но видят ограниченные пространства ресурсов. VM имеет собственное гостевое ядро поверх гипервизора; контейнер обычно делит ядро с хостом. На macOS и Windows Linux-контейнеры часто работают внутри Linux VM — важное уточнение к лозунгу «без виртуализации».

## Кто что делает

- §docker§ — клиент, отправляющий запросы Docker Engine API;
- §dockerd§ — демон, управляющий контейнерами, образами, сетью и volume;
- §containerd§ — управление жизненным циклом контейнера и образов на более низком уровне;
- §runc§ — runtime, который создаёт контейнерную среду по OCI Runtime Specification;
- **OCI** — независимые спецификации image, runtime и distribution, делающие компоненты совместимыми.

Архитектура развивается; фактическую цепочку взаимодействия следует проверять в документации конкретных версий Engine, containerd и интеграции snapshotter.

## Что происходит при docker run

Клиент формирует запрос → daemon проверяет image, конфигурацию сети и volume → runtime создаёт набор namespaces и cgroup → настраивает mount/rootfs, security policy и параметры запуска → выполняется целевой процесс. Если он завершается, контейнер считается stopped, даже если «внутри него» остались файлы в writable layer.

~~~sh
docker version
docker info
docker image ls
docker container ls -a
docker context ls
~~~

§docker version§ показывает версии клиента и сервера; это важно при несовпадении API. §docker info§ раскрывает storage driver, cgroup driver, security options и runtime. Эти параметры нельзя игнорировать при объяснении проблем воспроизводимости.

## Почему контейнер не гарантирует безопасность

Изоляция состоит из независимых механизмов. Процесс контейнера может иметь опасные capabilities, доступ к Docker socket, уязвимый kernel syscall path или разделённые mount. Режим §--privileged§ резко расширяет привилегии. Публикация порта делает сервис достижимым согласно сетевой конфигурации — это не «только внутри Docker».

Контейнер удобен для доставки и ограничения окружения, но его безопасность определяется политикой прав, конфигурацией хоста, версиями ядра и цепочкой поставки образов.
`);
add("docker-isolation","Namespaces и cgroups: сердце контейнера","PID, mount, network, user namespaces, ресурсные лимиты и границы изоляции.",35,["namespaces","cgroups","oci","man"],`
## Пространства имён меняют видимость

Linux namespaces дают процессам разные представления некоторых глобальных ресурсов. §pid§ namespace влияет на видимость идентификаторов процессов; §mnt§ — на mount tree; §net§ — на interfaces, маршруты и sockets; §uts§ — на hostname; §ipc§ — на некоторые IPC-ресурсы; §user§ — на отображение UID/GID и capabilities; §cgroup§ — на видимость cgroup paths; §time§ — на часть clocks.

Namespace не создаёт вторую операционную систему. В контейнере один и тот же процесс может выглядеть PID 1 для своего PID namespace, но иметь другой PID на хосте. Parent/child namespaces имеют особые правила: PID в ancestor namespace обычно видны иначе, чем из descendant.

~~~sh
lsns
readlink /proc/self/ns/pid
readlink /proc/self/ns/mnt
cat /proc/self/cgroup
~~~

§lsns§ собирает информацию о namespaces. §/proc/PID/ns/*§ содержит специальные ссылки на namespace-объекты; сравнение inode помогает понять, в одном ли namespace процессы.

## Cgroups ограничивают ресурсы

Control groups — отдельный механизм: не скрывают процессы, а группируют задачи для учёта и ограничения CPU, памяти, I/O и числа процессов. В cgroup v2 единая иерархия с контроллерами. Например, §memory.max§ ограничивает использование памяти группы, §cpu.max§ задаёт квоту CPU, §pids.max§ — число задач. Поддержка контроллеров и делегирование зависят от системы.

~~~sh
mount | grep cgroup
cat /sys/fs/cgroup/cgroup.controllers
cat /sys/fs/cgroup/memory.current 2>/dev/null
cat /sys/fs/cgroup/cpu.stat 2>/dev/null
~~~

Это лишь read-only исследование. Не изменяй значения контроллеров на production без понимания иерархии и systemd delegation.

## Что изолирует filesystem

Rootfs контейнера обычно собран из слоёв образа и writable layer через overlayfs или другой snapshotter. §pivot_root§ или похожая схема меняет корень файловой системы процесса. Mount namespace может ограничивать видимость смонтированных путей, но bind mount хостового каталога предоставляет доступ к реальным данным хоста согласно правам.

## От UID 0 до реальной власти

Root внутри container не всегда равен root на хосте: user namespace может отображать UID 0 в непривилегированный внешний UID. Но отсутствие §userns§ и чрезмерные capabilities оставляют значительную силу процессу. Security boundary усиливают seccomp, AppArmor/SELinux, read-only rootfs, drop capabilities и запрет Docker socket.

**Модель безопасности:** namespaces — изолируют представление; cgroups — контролируют ресурсы; capabilities/LSM/seccomp — ограничивают полномочия; network policy — регулирует коммуникацию. Только их сочетание создаёт полезную границу.
`);
add("docker-images","Образ Docker: слои, digest и Dockerfile","Как устроено OCI-хранилище, почему cache invalidation влияет на сборку и что делает BuildKit.",34,["dockerfile","oci","dockerref"],`
## Образ — это не запущенный контейнер

OCI image описывает конфигурацию и набор filesystem layers. Manifest ссылается на config и слои по digest; image index может указывать на разные архитектуры. Тег вроде §myapp:latest§ — изменяемое имя, а digest — адрес содержимого. Запуск по digest уменьшает неопределённость версии, но не заменяет проверку происхождения и подлинности.

Слои образа применяются последовательно, создавая файловое дерево. Удаление большого файла в следующем слое не обязательно исключает его байты из прежнего слоя — поэтому секреты нельзя записывать в image на раннем шаге, а потом «удалять». Writable layer контейнера живёт отдельно от immutable слоёв исходного image.

## Dockerfile как описание вычисления

~~~dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER 10001:10001
CMD ["python", "-m", "http.server", "8080"]
~~~

Это пример **структуры инструкций**, а не готовый production-image для произвольного приложения. §FROM§ задаёт базовый image; §WORKDIR§ устанавливает каталог; §COPY§ копирует из build context; §RUN§ выполняется **во время сборки**; §CMD§ задаёт команду по умолчанию **при запуске**. §ENTRYPOINT§ задаёт основной исполняемый компонент; их взаимодействие зависит от exec/shell forms. §EXPOSE§ описывает порт, но не публикует его в сеть хоста.

## Почему порядок инструкций важен

При изменении исходников не стоит заново скачивать все зависимости, если lockfile не поменялся. Кэш сборки учитывает зависимости операций и используемые входные данные. Поэтому сначала часто копируют манифесты зависимостей, устанавливают их и только затем копируют приложение. BuildKit поддерживает cache mounts, secrets mounts и многостадийную сборку.

~~~sh
docker build --progress=plain -t atlas-demo:dev .
docker image inspect atlas-demo:dev
docker history --no-trunc atlas-demo:dev
~~~

Команда запускается **только в каталоге с подходящим Dockerfile**. §--progress=plain§ раскрывает этапы сборки, §inspect§ показывает metadata, §history§ — историю image. Эти результаты не гарантируют, что секретов нет в слоях.

## Multi-stage и supply chain

Multi-stage build позволяет использовать компиляторы на стадии сборки, не перенося их в runtime image. Для воспроизводимости важны pinned versions/digests, lockfiles, provenance, SBOM, vulnerability scanning и система обновлений. Маленький образ необязательно безопаснее во всех смыслах: важнее минимальная поверхность атаки, поддерживаемость и скорость исправлений.

## Типовые ошибки

- Установка пакетов без pinning приводит к дрейфу сборки.
- Секреты в §ARG§ или §ENV§ могут оказаться в metadata/history.
- Неправильный §.dockerignore§ увеличивает build context и позволяет случайно отправить приватные файлы daemon.
- Запуск от root без необходимости увеличивает последствия компрометации.
`);
add("docker-runtime","Сеть, тома и жизненный цикл контейнера","veth, bridge, NAT, DNS, сигналы PID 1, inspect и healthcheck.",34,["docker","dockerref","compose"],`
## Почему контейнер видит свою сеть

В стандартной bridge-сети Docker контейнер получает собственный network namespace; veth-пара связывает его с linux bridge на хосте. Сеть хоста маршрутизирует/транслирует трафик согласно правилам, которые настраивает Docker. Конкретная реализация зависит от backend, версий Engine, firewall и режима rootless.

Команда §-p 127.0.0.1:8080:80§ публикует порт контейнера 80 на loopback хоста 8080. А §-p 8080:80§ обычно привязывает публикацию ко всем подходящим адресам хоста — потенциально делая сервис доступным извне. Не полагайся на «container private» без проверки firewall.

~~~sh
docker network ls
docker network inspect bridge
docker container ls --format '{{.Names}} {{.Ports}}'
docker volume ls
docker system df
~~~

## Тома против writable layer

Writable layer контейнера предназначен для эфемерных изменений. Удаление контейнера обычно удаляет его writable layer. Volume — отдельный ресурс хранения, который может переживать пересоздание контейнеров; bind mount напрямую отображает путь хоста. Нельзя смешивать понятия **volume**, **mount**, **backup** и **replication**: volume не является резервной копией.

## PID 1 и завершение процесса

Docker останавливает контейнер, посылая сигнал основному процессу (обычно SIGTERM с последующим SIGKILL после timeout). Приложение должно уметь корректно завершать работу: прекращать приём новых запросов, завершать активные операции и закрывать ресурсы. Shell-form ENTRYPOINT может изменить доставку сигналов; exec-form обычно предпочтительнее. Если основной процесс создаёт детей и не обрабатывает их завершение, полезна init-обёртка.

## Healthcheck не равен uptime

Запущенный процесс может не обслуживать запросы. §HEALTHCHECK§ проверяет выбранное свойство готовности/живости; неверная проверка может объявить здоровый сервис больным или наоборот. Не смешивай readiness для трафика и liveness для перезапуска: эти решения несут разные последствия.

## Диагностика без «перезагрузите всё»

~~~sh
docker ps -a
docker inspect CONTAINER_NAME
docker logs --tail 100 CONTAINER_NAME
docker stats --no-stream
docker exec CONTAINER_NAME ps -ef
~~~

Указание §CONTAINER_NAME§ — placeholder. §docker exec§ работает только с работающим контейнером и может не найти §ps§ в минимальном образе. Сначала проверь container exit code, OOMKilled, монтирования, published ports и runtime logs. Если приложение перезапускается, причина может быть в коде, лимите памяти, health policy или внешней зависимости.
`);
add("docker-compose","Docker Compose: декларация, зависимости и ограничения","Service, network, volume, healthcheck, depends_on и детерминированное окружение.",30,["compose","dockerfile","dockerref"],`
## Почему Compose — не «bash с YAML»

Compose описывает желаемую композицию сервисов, их конфигурацию, сети и volume. Клиент вычисляет и применяет изменения через контейнерный runtime. Это удобный инструмент для dev/staging и небольших производственных инсталляций, но он не превращается автоматически в полноценную multi-host оркестрацию.

~~~yaml
services:
  web:
    image: nginx:stable-alpine
    ports:
      - "127.0.0.1:8080:80"
    restart: unless-stopped
    read_only: true
  worker:
    image: busybox:stable
    command: ["sh", "-c", "sleep 3600"]
    restart: "no"
~~~

Это демонстрационная конфигурация без постоянных данных. §restart: unless-stopped§ задаёт политику рестарта после выхода; §read_only§ делает rootfs контейнера read-only, но не запрещает writable volumes/tmpfs. Публикация через §127.0.0.1§ уменьшает поверхность внешнего доступа.

## Основные команды и аргументы

~~~sh
docker compose config          # валидировать и развернуть конфигурацию
docker compose up -d          # создать / обновить и запустить в фоне
docker compose ps             # статусы
docker compose logs -f web    # следить за журналом сервиса web
docker compose exec web sh    # выполнить shell, если она есть
docker compose down           # остановить и удалить объекты проекта
~~~

§docker compose down -v§ **удаляет volume проекта** и может уничтожить постоянные данные: никогда не используй его на рабочем окружении автоматически. §up --build§ запускает пересборку там, где это применимо, но сам по себе не является политикой обновления безопасности.

## Зависимости и готовность

§depends_on§ в краткой форме помогает управлять порядком создания/старта, но не гарантирует, что БД готова принимать запросы. Подробная форма с §condition: service_healthy§ позволяет ждать успешного healthcheck, однако настоящая устойчивость приложения всё равно требует обработку временных отказов, retries с backoff и идемпотентность.

## Границы Compose в production

Следи за уязвимостями images, хранением секретов, логированием, резервными копиями, лимитами, host upgrades и доставкой обновлений. У Compose нет встроенной модели автоматического распределения workload по множеству узлов и самовосстановления кластера. Когда требуется multi-node scheduling, используй подходящую систему оркестрации, но не внедряй Kubernetes ради модного названия.
`);
})();