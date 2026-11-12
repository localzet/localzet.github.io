(function(){
const add=(course,id,title,summary,minutes,sources,body)=>window.ATLAS_DATA.lessons.push({id,course,title,summary,minutes,sources,body});
add("linux","linux-cli-atlas","Справочник Linux CLI: команды, опции, ошибки","Практический маршрут по основным GNU, util-linux, iproute2 и systemd утилитам с расшифровкой флагов.",52,["man","posix","systemd","proc"],`
## Сначала выясни происхождение команды

Одинаковое имя утилиты не гарантирует идентичное поведение на GNU/Linux, BusyBox и BSD. Shell builtin (например, §cd§, §read§, §printf§ в некоторых оболочках) может отличаться от внешнего бинарника. Чтобы определить реальную реализацию, начни с §type -a NAME§, §command -V NAME§, §NAME --version§ (если есть) и §man NAME§.

Синтаксис большинства Unix CLI использует короткие ключи §-a§, длинные §--all§, аргументы ключей вида §-o value§ или §--output=value§, а также маркер §--§, завершающий разбор опций. Но это **конвенции**, а не абсолютный стандарт: в некоторых командах, например §find§, аргументы образуют выражение с собственной грамматикой.

## Файловая система, пути, поиск

- §pwd -P§ — физический путь, разрешая символические ссылки в отличие от логической оболочки.
- §ls -la --color=auto§ — подробная выдача, включая скрытые имена; цвет — расширение GNU.
- §stat -c '%i %s %a %n' FILE§ — inode, размер, права и имя.
- §file -b FILE§ — определить предполагаемый тип по содержимому, без префикса имени.
- §find DIR -type f -name '*.conf' -print§ — рекурсивный поиск по типу и маске.
- §find DIR -maxdepth 1 -type f§ — ограничить глубину обхода.
- §find DIR -mtime -7§ — файлы с временем изменения менее семи 24-часовых периодов; семантика округления требует чтения man.
- §find DIR -print0 | xargs -0 ...§ — передача произвольных имён без ловушек пробелов.
- §locate PATTERN§ / §plocate§ — поиск по **индексу**, поэтому свежие файлы могут отсутствовать.
- §du -sh DIR§ — суммарный usage блоков дерева каталогов; §-s§ summary, §-h§ human-readable.
- §df -hT§ — свободное место файловых систем с типом ФС.
- §realpath -e PATH§ — канонический путь при требовании существования компонентов.
- §readlink -f PATH§ — разрешение symlinks; поведение при отсутствующих компонентах зависит от ключей и реализации.
- §findmnt -T PATH§ — файловая система, содержащая путь; §-o SOURCE,TARGET,FSTYPE,OPTIONS§ выбирает поля.
- §lsblk -f§ — блочные устройства с filesystem metadata; §-o NAME,SIZE,TYPE,MOUNTPOINTS§ — выбранные колонки.
- §blkid§ — сигнатуры/UUID устройств (доступ зависит от прав).
- §mount§, §umount§ — подключение/отключение файловых систем; на production перед изменением нужна оценка влияния на работающие процессы.

## Изменение файлов и каталоги

- §cp -a SOURCE DEST§ — рекурсивное копирование с сохранением атрибутов в поддерживаемом объёме.
- §mv -- SOURCE DEST§ — перемещение/переименование; между ФС может выполняться копирование и удаление, а не атомарный rename.
- §rm -i FILE§ — интерактивное удаление; §rm -rf§ разрушителен и требует проверки пути.
- §mkdir -p A/B§ — создание родителей при необходимости.
- §ln SOURCE HARDLINK§ — hard link, §ln -s TARGET LINK§ — symlink.
- §touch -m FILE§ — изменение mtime.
- §truncate -s SIZE FILE§ — задать размер (не путать физическое выделение блоков).
- §install -m 0755 SRC DST§ — установить файл с правами; часто удобнее для deploy, чем cp+chmod.
- §rsync -av --dry-run SRC/ DST/§ — предварительное моделирование копирования; слэш после source меняет семантику.
- §tar -czf archive.tar.gz DIR§ — архив с gzip, §tar -tf archive.tar.gz§ — список содержимого.
- §sha256sum FILE§ — digest для проверки целостности байтов.

## Потоки и обработка текста

- §cat FILE§ — вывод содержимого; §less -R FILE§ — интерактивное чтение.
- §head -n 20 FILE§ и §tail -n 50 FILE§ — начало и конец; §tail -F§ — следование за именем при log rotation.
- §wc -l FILE§ — число newline, не обязательно логических записей.
- §sort -u§ — сортировка с уникализацией (результат зависит от locale).
- §uniq -c§ — подсчёт **соседних** одинаковых строк, часто после sort.
- §cut -d: -f1§ — поле с разделителем двоеточие.
- §tr '[:upper:]' '[:lower:]'§ — преобразование символов с учётом locale.
- §grep -Rni -- 'ERROR' DIR§ — рекурсивный поиск, номер строки, ignore-case.
- §grep -E 'a|b'§ — extended regex; §grep -F§ — буквальное сопоставление.
- §sed -n '1,10p'§ — печать диапазона; §sed -i§ изменяет файлы и имеет различия GNU/BSD.
- §awk -F: '{print $1}'§ — поле 1 с ':'; AWK — самостоятельный язык.
- §tee -a FILE§ — сохранить stdout в файл и передать дальше, append.
- §xargs -r -0 COMMAND§ — нулевые разделители, не запускать при пустом вводе (GNU -r).
- §diff -u OLD NEW§ — unified diff; §cmp§ сравнивает байты, §patch -p1§ применяет патч с удалением одного компонента пути.

## Процессы, права, учётные записи

- §ps -eo pid,ppid,stat,comm,args§ — заданные поля; §ps aux§ — распространённый формат, но это не буквальный POSIX-синтаксис.
- §pgrep -a NAME§ — PID и командная строка; §pkill -TERM NAME§ — послать SIGTERM процессам по шаблону.
- §kill -TERM PID§ / §kill -KILL PID§ — послать сигнал; SIGKILL нельзя перехватить обычным handler.
- §nice -n 10 COMMAND§ — изменить nice при запуске; §renice -n 5 -p PID§ — у существующей задачи.
- §taskset -cp PID§ — показать affinity; изменение требует осторожности.
- §timeout 10s COMMAND§ — ограничение времени исполнения, со своими опциями signal/kill-after.
- §time COMMAND§ — измерение времени и ресурсов; встроенная и внешняя реализации могут отличаться.
- §id -u§ / §id -G§ — UID и группы; §groups USER§ — группы пользователя.
- §getent passwd USER§ — обращение через NSS, полезно при LDAP/SSSD.
- §chmod 0644 FILE§ — права владельца/группы/прочих; §chmod u+x FILE§ — добавить execute владельцу.
- §chown USER:GROUP FILE§ — смена владельца; требует прав.
- §umask 027§ — маска прав новых объектов в shell.
- §getfacl FILE§ / §setfacl -m u:USER:r FILE§ — ACL, если поддерживается системой.
- §sudo -l§ — разрешённые sudo-команды; §sudo -u USER COMMAND§ — запуск от другой идентичности.

## Linux и systemd

- §uname -r§ — версия ядра; §cat /etc/os-release§ — сведения о дистрибутиве.
- §systemctl status UNIT§ — состояние unit и журнал; §systemctl show UNIT -p ExecStart§ — отдельное свойство.
- §systemctl list-units --type=service --state=failed§ — неуспешные сервисы.
- §systemctl cat UNIT§ — unit и drop-ins; §systemctl edit UNIT§ — изменение конфигурации.
- §journalctl -u UNIT -b -n 100 --no-pager§ — последние записи юнита в текущей загрузке.
- §journalctl -k -b§ — журнал kernel; §journalctl --since '1 hour ago'§ — фильтрация времени.
- §systemd-analyze blame§ / §critical-chain§ — ориентиры диагностики загрузки.
- §sysctl -a§ — значения tunables; §sysctl -w§ изменяет параметры ядра и требует понимания последствий.
- §dmesg --level=err,warn§ — kernel ring buffer с фильтрацией уровней.
- §strace -f -e trace=network COMMAND§ — трассировка syscalls дочерних процессов по сети.
- §lsof -iTCP:443 -sTCP:LISTEN§ — программа, слушающая TCP 443.
- §perf stat COMMAND§ — доступные performance counters.

## Сеть и безопасность

- §ip -br a§ — адреса, §ip route§ — маршруты, §ip route get DEST§ — выбор локального маршрута.
- §ip neigh§ — кеш соседей ARP/NDP, §ip link§ — интерфейсы.
- §ss -tlpn§ — TCP listeners с PID/именем процесса, при разрешённых правах.
- §ss -s§ — агрегаты сокетов.
- §ping -c 4 HOST§ — ICMP echo; отсутствие ответа не всегда означает недоступность сервиса.
- §tracepath HOST§ / §traceroute HOST§ / §mtr HOST§ — исследование hops, результатов нельзя трактовать как абсолютный путь.
- §dig NAME A +short§ — DNS-запись, §dig +trace NAME§ — итеративная трассировка иерархии.
- §resolvectl status§ — состояние systemd-resolved, если используется.
- §curl -vI URL§ — headers + подробности подключения; §curl --resolve DOMAIN:443:IP URL§ — подключение к IP с заданным именем для проверки.
- §openssl s_client -connect HOST:443 -servername HOST§ — анализ TLS.
- §tcpdump -ni IFACE 'tcp port 443'§ — захват пакетов, может требовать повышенных прав.
- §nft list ruleset§ — текущая конфигурация nftables, §ethtool IFACE§ — состояние link и драйвера.
- §ssh -vvv USER@HOST§ — отладка SSH клиента; не публикуй полученные секретные подробности без фильтрации.

## Как выучить параметры глубоко

Переходи от этой карты к **man page конкретной версии**. Для каждой команды выпиши: синтаксис, обязательные/необязательные аргументы, поведение при ошибке, exit code, эффекты на filesystem/network, ограничения безопасности и отличия GNU/BusyBox/BSD. Это способ построить действительно точный справочник, а не собирать неактуальные списки на тысячи неизвестных ключей.
`);
add("git","git-command-atlas","Справочник Git CLI: porcelain и plumbing","Семейства команд, важные опции и прямой путь от привычных действий к объектам и refs.",49,["gitdocs","gitbook","gitobjects"],`
## Глобальные опции и правила CLI

§git -C PATH COMMAND§ запускает Git в указанном каталоге; §git -c key=value COMMAND§ временно переопределяет конфигурацию; §git --no-pager COMMAND§ отключает pager. §git --version§ выводит версию. Полный перечень команд и опций постоянно зависит от версии: канонический источник — §git help -a§, §git help -g§ и §git help <command>§ установленного Git.

**Porcelain** — человекоориентированные команды; **plumbing** — низкоуровневые операции над хранилищем. Разделение не является абсолютной границей безопасности или стабильности, но помогает понять, какие команды строят удобные workflows поверх объектной модели.

## Создание репозитория, изменения, снимки

- §git init [-b main]§ — новая база Git, §-b§ выбирает начальное имя ветки.
- §git clone --depth N URL§ — shallow clone с ограничением глубины истории.
- §git status --short --branch§ — сжатое состояние и ветка.
- §git add -A§ — stage изменённых, удалённых, новых отслеживаемых и неотслеживаемых файлов в соответствующей области.
- §git add -p§ — выбор отдельных изменений (hunks).
- §git rm --cached PATH§ — убрать путь из index, сохранив файл в working tree.
- §git mv OLD NEW§ — переименование файла с учётом index; в истории Git переименование выводится эвристически из сходства содержимого.
- §git diff --cached§ — staged изменения относительно HEAD.
- §git diff --stat§ / §--check§ / §--word-diff§ — сводка, ошибки пробелов, пословное сравнение.
- §git commit -m MESSAGE§ — коммит, §--amend§ — замена предыдущего коммита новым.
- §git restore PATH§ / §--staged§ / §--source=COMMIT§ — восстановление файла из выбранного состояния.
- §git reset --soft|--mixed|--hard TARGET§ — различные степени изменения ref, index и working tree.
- §git revert COMMIT§ — новый коммит с обратными изменениями.
- §git clean -ndx§ — предварительный показ удаляемых неотслеживаемых/ignored файлов; §-fdx§ удаляет их и опасен.

## История и граф

- §git log --graph --oneline --all --decorate§ — топология коммитов.
- §git log --first-parent§ — история по основной родительской цепочке.
- §git log -- path§ — коммиты, затронувшие путь.
- §git show COMMIT:path§ — версия файла в данном коммите.
- §git blame -L 10,40 FILE§ — атрибуция строк по истории, не истинное «авторство идеи».
- §git bisect start/bad/good§ — бинарный поиск коммита, внёсшего регрессию.
- §git grep -n PATTERN§ — поиск в tracked content.
- §git describe --tags --always§ — описание версии через reachable tags.
- §git rev-parse HEAD§ / §HEAD^{tree}§ — разрешение revision expressions.
- §git merge-base A B§ — общий предок для сравнения/слияния.
- §git reflog --all§ — локальные изменения ссылок.

## Ветки, merge и rebase

- §git branch -avv§ — локальные, remote-tracking ветки и tracking info.
- §git switch -c FEATURE§ — создать и переключиться, §git switch -§ — предыдущая ветка.
- §git merge --no-ff FEATURE§ — создать merge commit при возможности.
- §git rebase -i BASE§ — интерактивное переписывание серии коммитов.
- §git rebase --onto NEWBASE OLD BASEBRANCH§ — перенос диапазона на новую базу.
- §git rebase --continue|--abort|--skip§ — управление остановленной операцией.
- §git cherry-pick -x COMMIT§ — перенести изменение с указанием исходного OID.
- §git rerere§ — reuse recorded resolution, вспомогательное запоминание решений конфликтов.
- §git stash push -u -m MESSAGE§ — временно сохранить изменения, включая untracked файлы.
- §git stash list§ / §git stash pop§ / §git stash apply§ — список и восстановление.
- §git worktree add PATH BRANCH§ — отдельная рабочая директория на общей базе.

## Remote, refs и доставка

- §git remote -v§ / §git remote add NAME URL§ — конфигурация источника.
- §git fetch --prune REMOTE§ — обновить refs и убрать локальные ссылки на исчезнувшие удалённые ветки согласно refspec.
- §git pull --rebase§ — fetch и rebase, не путай с простым fetch.
- §git push -u REMOTE BRANCH§ — первый push и upstream tracking.
- §git push --force-with-lease§ — контролируемое переписывание remote ref.
- §git ls-remote URL§ — прочитать рекламируемые удалённые refs.
- §git tag -a v1.0 -m MESSAGE§ — annotated tag, §git tag -v TAG§ — проверка подписи при её наличии.
- §git bundle create FILE --all§ — перенос части истории без сети в bundle.
- §git submodule update --init --recursive§ — загрузка вложенных репозиториев.
- §git sparse-checkout set PATHS§ — ограниченный working tree, не удаление объектов.

## Plumbing: непосредственная работа с объектами

- §git hash-object -w FILE§ — создать blob из байтов.
- §git cat-file -t OID§ / §-p§ / §-s§ — тип, содержимое, размер объекта.
- §git ls-tree -r HEAD§ — дерево коммита.
- §git ls-files --stage§ — index в виде mode/OID/stage.
- §git write-tree§ — записать tree из index.
- §git commit-tree TREE -p PARENT -m MESSAGE§ — создать commit напрямую.
- §git update-ref REF OID§ — изменить ссылку, §git symbolic-ref HEAD§ — прочитать symbolic ref.
- §git show-ref§ / §git for-each-ref§ — перечисление refs.
- §git rev-list --objects --all§ — reachable objects.
- §git verify-pack -v PACK.idx§ — структура packfile.
- §git count-objects -v§ — статистика хранения.
- §git fsck --full§ — проверка объектной базы.
- §git gc§ / §git maintenance run§ / §git repack§ — обслуживание; применять после оценки влияния на объекты и reflog.

## Почему нельзя знать все опции «одной таблицей»

Git содержит множество version-specific команд и plumbing-интерфейсов. Кроме параметров Git, есть pathspec magic, revision syntax (§A..B§, §A...B§, §~§, §^§, §^{tree}§), шаблоны ignore, конфиг-секции, protocol options и environment variables. Их точные правила лучше хранить как **отдельные справочники**, прямо связанные с man страницами. Поведение §git reset§ невозможно объяснить одним списком флагов без модели HEAD/index/worktree.
`);
add("docker","docker-command-atlas","Справочник Docker CLI и Compose","Главные команды, опции безопасности, сборки и работы с контейнерами без потери контекста.",45,["dockerref","dockerfile","compose","docker"],`
## Структура CLI

Современный Docker CLI группирует операции: §docker container§, §docker image§, §docker network§, §docker volume§, §docker system§, §docker builder§, §docker compose§. Существуют короткие алиасы вроде §docker ps§ (≈ §docker container ls§) и §docker images§ (≈ §docker image ls§). Уточняй поддержку версий через §docker version§ и §docker COMMAND --help§.

Docker CLI — клиент; часть флагов обрабатывает клиент, часть передаётся Engine API, а некоторые зависят от runtime/platform. Нельзя ожидать, что каждая опция из Linux Engine будет работать идентично в Docker Desktop, rootless или Windows containers.

## Lifecycle контейнера

- §docker container create IMAGE§ — создать объект, не запуская основной процесс.
- §docker container start ID§ — запустить созданный контейнер.
- §docker run -d --name NAME IMAGE§ — создать + запустить в detached режиме.
- §docker run --rm IMAGE COMMAND§ — удалить контейнер при завершении; не добавляй §--rm§ для данных, которые могут требовать forensic inspection.
- §docker run -it IMAGE sh§ — §-i§ stdin, §-t§ псевдотерминал.
- §docker run --init IMAGE§ — минимальный init для обработки сигналов и reaping.
- §docker stop -t 30 ID§ — timeout graceful-stop перед принудительным завершением.
- §docker kill --signal=TERM ID§ — отправить конкретный сигнал, не всегда аналог штатного stop.
- §docker restart ID§ — перезапуск.
- §docker rm ID§ — удалить остановленный контейнер.
- §docker ps -a --format '{{.Names}} {{.Status}}'§ — выбрать поля списка.
- §docker logs --tail 100 -f ID§ — последние 100 строк с follow.
- §docker inspect --format '{{json .State}}' ID§ — выбор структурированной информации.
- §docker stats --no-stream§ — разовый замер использования ресурсов.
- §docker exec -it ID sh§ — запустить команду в существующем контейнере.
- §docker cp ID:/path ./path§ — скопировать данные через Docker API.
- §docker top ID§ — процессная информация контейнера, §docker events§ — события engine.

## Изоляция, ресурсы и безопасность

- §docker run --memory=512m --cpus=1.5 IMAGE§ — ресурсы через cgroups в применимых окружениях.
- §docker run --pids-limit=200 IMAGE§ — ограничение числа задач.
- §docker run --user 10001:10001 IMAGE§ — UID/GID внутри контейнера.
- §docker run --read-only --tmpfs /tmp IMAGE§ — read-only корень и временная writable область.
- §docker run --cap-drop=ALL IMAGE§ — убрать capabilities; добавляй необходимые явно.
- §docker run --security-opt no-new-privileges IMAGE§ — запретить получение новых привилегий через exec-переходы согласно механизму ядра.
- §docker run --network=none IMAGE§ — контейнер без обычной сети Docker; не абсолютная защита от всех каналов взаимодействия.
- §docker run -p 127.0.0.1:8080:80 IMAGE§ — публикация 80 контейнера на loopback 8080 хоста.
- §docker run -v mydata:/data IMAGE§ — именованный volume.
- §docker run --mount type=bind,src=/host,dst=/data,readonly IMAGE§ — bind mount хостового каталога.
- §docker run --health-cmd='CMD' ...§ — проверка здоровья; тонкие параметры timeout/interval/retries проверяй по CLI version.
- §docker run --privileged IMAGE§ — высокорисковое расширение полномочий; не использовать без строгого обоснования.

## Сборка и images

- §docker build -t app:dev .§ — build context и метка результата.
- §docker build --file Dockerfile.prod --tag app:prod .§ — другой Dockerfile.
- §docker build --target builder .§ — конкретная стадия multi-stage.
- §docker build --no-cache .§ — игнорирование обычного build cache; не заменяет обновление всех удалённых зависимостей.
- §docker build --progress=plain .§ — подробные сообщения BuildKit.
- §docker image ls§ / §docker image inspect IMAGE§ / §docker history IMAGE§ — изображения и metadata.
- §docker pull IMAGE@sha256:DIGEST§ — образ по digest.
- §docker tag SOURCE TARGET§ — создать новую ссылку/тег, не перекомпилировать образ.
- §docker push REGISTRY/IMAGE:TAG§ — отправить в registry после auth.
- §docker save -o image.tar IMAGE§ / §docker load -i image.tar§ — формат сохранения образа.
- §docker export ID > rootfs.tar§ / §docker import rootfs.tar§ — экспорт filesystem, **не сохраняет все метаданные образа и его слои**.
- §docker image prune§ / §docker builder prune§ — удаление неиспользуемых артефактов, требуется проверять последствия.

## Сеть, диски и эксплуатация

- §docker network ls§, §docker network inspect NET§ — смотреть сети и настройки.
- §docker network create NET§ — создать пользовательскую сеть.
- §docker network connect NET ID§ — подключить контейнер к сети.
- §docker volume ls§ / §docker volume inspect VOLUME§ — реестр и свойства томов.
- §docker system df -v§ — оценка дискового использования.
- §docker system prune --dry-run§ — **не универсальная поддерживаемая комбинация**; не полагайся на dry-run без проверки help. Команды prune могут удалить объекты, нужные для расследования.
- §docker context ls§ / §docker context use NAME§ — выбор engine endpoint.

## Compose

- §docker compose config§ — развернуть и проверить YAML.
- §docker compose --profile test up -d§ — активировать нужный профиль.
- §docker compose up -d --build§ — запуск и пересборка.
- §docker compose ps§, §logs -f SERVICE§, §exec SERVICE COMMAND§ — эксплуатация.
- §docker compose run --rm SERVICE COMMAND§ — разовый контейнер сервиса.
- §docker compose down§ — убрать сервисы проекта, сети по политике; §down -v§ удаляет volumes проекта и опасен для данных.
- §docker compose pull§ — обновить образы, не означает автоматического безопасного deploy.

## Продвинутый ориентир

Список выше — **практическая карта**, не реестр всех subcommands/flags/version gates. Источник исчерпывающего синтаксиса конкретной версии — официальная Docker CLI reference и вывод §docker help§, §docker COMMAND --help§. Для каждого флага отдельно проверяй default, требуется ли rootless, поддержка storage/network backend, последствия на хосте и поведение при перезапуске.
`);
})();