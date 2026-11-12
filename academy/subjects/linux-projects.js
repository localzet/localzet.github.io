(function(){const data={
  "rows": [
    {
      "id": "linux-storage-lab",
      "after": "linux-lvm-raid",
      "min": 1,
      "title": "Лаборатория хранения: RAID, LVM и LUKS на одноразовых образах",
      "summary": "Собираем многоуровневое хранилище в отдельной VM; проверяем запись, чтение и корректную очистку.",
      "body": "## Архитектура эксперимента\n\nДва файла служат одноразовыми виртуальными дисками. Loop device предоставляет блочный интерфейс над файлом. MD RAID1 объединяет два устройства в зеркальный массив, LVM создаёт физический том, группу и логический том, LUKS создаёт зашифрованное отображение, ext4 размещается поверх него. Это учебная комбинация, а не рекомендация для всех серверов. RAID не заменяет резервную копию, LVM не шифрует данные сам по себе, LUKS не обеспечивает резервирование, а ext4 не знает, какие физические носители лежат в основании.\n\n## Подготовка и границы\n\nИспользуйте отдельную одноразовую Linux VM со снимком, без подключённых рабочих дисков. Нужны losetup, mdadm, lvm2, cryptsetup, e2fsprogs, udev, root и поддержка loop, md, device-mapper. Не выполняйте этот скрипт на рабочем сервере или внутри контейнера с доступом к устройствам хоста. Он создаёт исключительно собственные файлы и идентификаторы. Если ядро или инструменты не поддерживают операцию, остановитесь и разберите причину.\n\n## Практика: создание стека\n\nСохраните как storage-stack.sh. Запуск в выделенной VM: sudo env ATLAS_DISPOSABLE_VM=1 bash storage-stack.sh. Для LVM явно ограничиваем список устройств через --devices; требуется версия LVM с этой опцией. Не убирайте её для совместимости со старым окружением.\n\n~~~sh\nset -euo pipefail\ntest \"${ATLAS_DISPOSABLE_VM:-}\" = 1\ntest \"$(id -u)\" = 0\nlab=$(mktemp -d)\nid=\"atlas$(date +%s)$$\"\na=\"\"; b=\"\"; md=\"/dev/md/$id\"\nvg=\"vg_$id\"; map=\"crypt_$id\"\nmd_created=0; vg_created=0; crypt_open=0\ncleanup() {\n    set +e\n    if ((crypt_open)); then\n        cryptsetup close \"$map\" || return 1\n    fi\n    if ((vg_created)); then\n        vgremove -fy --devices \"$md\" \"$vg\" || return 1\n        pvremove -y --devices \"$md\" \"$md\" || return 1\n    fi\n    if ((md_created)); then\n        mdadm --stop \"$md\" || return 1\n    fi\n    if test -n \"$b\"; then losetup -d \"$b\" || return 1; fi\n    if test -n \"$a\"; then losetup -d \"$a\" || return 1; fi\n    rm -rf -- \"$lab\"\n}\ntrap 'cleanup || { echo \"Cleanup failed: inspect $lab $md $vg $map\" >&2; exit 1; }' EXIT\ntest ! -e \"$md\"\ntest ! -e \"/dev/mapper/$map\"\nif vgs \"$vg\" >/dev/null 2>&1; then exit 1; fi\ntruncate -s 128M \"$lab/a.img\" \"$lab/b.img\"\na=$(losetup --find --show \"$lab/a.img\")\nb=$(losetup --find --show \"$lab/b.img\")\nmdadm --create \"$md\" --metadata=1.2 --level=1 \\\n    --raid-devices=2 --run \"$a\" \"$b\"\nmd_created=1\nudevadm settle\npvcreate --devices \"$md\" \"$md\"\nvgcreate --devices \"$md\" \"$vg\" \"$md\"\nvg_created=1\nlvcreate --devices \"$md\" -L 64M -n data \"$vg\"\nudevadm settle\nlv=\"/dev/$vg/data\"\nhead -c 32 /dev/urandom > \"$lab/key\"\nchmod 600 \"$lab/key\"\ncryptsetup luksFormat --type luks2 --batch-mode \\\n    --key-file \"$lab/key\" \"$lv\"\ncryptsetup open --key-file \"$lab/key\" \"$lv\" \"$map\"\ncrypt_open=1\nudevadm settle\ndev=\"/dev/mapper/$map\"\nmkfs.ext4 -q \"$dev\"\nprintf 'atlas storage\\n' > \"$lab/note\"\ndebugfs -w -R \"write $lab/note /note\" \"$dev\"\ndebugfs -R 'cat /note' \"$dev\" > \"$lab/readback\"\ncmp \"$lab/note\" \"$lab/readback\"\ne2fsck -fn \"$dev\"\nlsblk -o NAME,TYPE,SIZE,FSTYPE\necho 'PASS: storage stack readback'\n~~~\n\nОжидается PASS и последующее освобождение объектов. debugfs изменяет только собственную несмонтированную ФС; не применяйте его к смонтированным устройствам. -f у e2fsck принудительно проверяет, -n открывает только для чтения и отвечает «нет» на исправления. mdadm может выполнять синхронизацию в фоне; этот опыт не измеряет скорость и не доказывает отказоустойчивость. Не используйте результаты для оценки производительности реальных дисков.\n\nЕсли создание завершилось частично или очистка не удалась, не повторяйте команды наугад: запишите уникальные имена, состояние lsblk, /proc/mdstat и LVM. Проверьте, что объекты относятся к данной VM. Снимок позволяет вернуться к исходному состоянию. Ключ учебный и удаляется; настоящие ключи требуют самостоятельной стратегии хранения и восстановления.\n\n## Самостоятельная работа\n\nНарисуйте зависимости от файлов до ext4 и объясните порядок очистки сверху вниз. Отдельно спроектируйте проверку отказа одного участника RAID1 и восстановление из резервной копии, не выполняя сбой на реальных устройствах. Запишите критерии: данные прочитаны, проверка ФС завершилась, отображение LUKS, группа, массив и loop-устройства удалены.",
      "terms": [
        [
          "Loop device",
          "Блочное устройство поверх файла."
        ],
        [
          "MD RAID",
          "Программный массив Linux."
        ],
        [
          "PV/VG/LV",
          "Уровни LVM."
        ],
        [
          "LUKS",
          "Формат зашифрованного тома."
        ],
        [
          "Readback",
          "Проверка фактического чтения записанных данных."
        ]
      ],
      "steps": [
        [
          "Файлы",
          "Два образа"
        ],
        [
          "Loop",
          "Блочные устройства"
        ],
        [
          "RAID1",
          "Зеркало"
        ],
        [
          "LVM",
          "Логический том"
        ],
        [
          "LUKS",
          "Шифрование"
        ],
        [
          "ext4",
          "Файловая система"
        ]
      ],
      "question": [
        "Почему нельзя остановить MD до закрытия LUKS и LVM?",
        "Верхние слои ещё могут использовать нижнее устройство."
      ],
      "sources": [
        "mdmanual",
        "lvmmanual",
        "cryptsetupdocs",
        "e2fsckmanual",
        "losetupmanual",
        "debugfsmanual"
      ]
    },
    {
      "id": "linux-middle-project",
      "after": "linux-capstone",
      "min": 1,
      "title": "Итоговый проект Middle: эксплуатация локального сервиса",
      "summary": "Проверяем жизненный цикл, HTTP, отказ, резервное копирование, журнал и systemd-конфигурацию.",
      "body": "## Задача\n\nВы отвечаете за небольшой локальный сервис. Нужно доказать, что он запускается от обычного пользователя, отвечает на запрос, корректно сообщает об отсутствующем ресурсе, сохраняет данные и прекращает работу по сигналу. Используем Python HTTP-сервер для статического файла: это учебная модель, не production-сервер. Сеть только loopback, порт выбирает ядро, временный каталог принадлежит процессу.\n\n## Практика: автоматизированная приёмка\n\nНужны Python 3, curl, tar, systemd-analyze для следующего шага. Создайте middle-project.sh и запустите bash middle-project.sh без sudo.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\npid=\"\"\ncleanup() {\n    if test -n \"$pid\"; then\n        kill -TERM \"$pid\" 2>/dev/null || true\n        wait \"$pid\" 2>/dev/null || true\n    fi\n    rm -rf -- \"$lab\"\n}\ntrap cleanup EXIT\nmkdir \"$lab/www\" \"$lab/restore\"\nprintf 'atlas middle\\n' > \"$lab/www/index.html\"\nchmod 600 \"$lab/www/index.html\"\ncat > \"$lab/server.py\" <<'PY'\nimport functools\nimport http.server\nimport sys\n\nhandler = functools.partial(\n    http.server.SimpleHTTPRequestHandler, directory=sys.argv[1]\n)\nwith http.server.ThreadingHTTPServer((\"127.0.0.1\", 0), handler) as server:\n    print(server.server_port, flush=True)\n    server.serve_forever()\nPY\npython3 \"$lab/server.py\" \"$lab/www\" > \"$lab/port\" 2> \"$lab/http.log\" &\npid=$!\nfor i in $(seq 1 50); do\n    test -s \"$lab/port\" && break\n    kill -0 \"$pid\"\n    sleep 0.1\ndone\ntest -s \"$lab/port\"\nport=$(cat \"$lab/port\")\nbase=\"http://127.0.0.1:$port\"\ncurl --fail --silent --show-error --max-time 3 \"$base/\" > \"$lab/response\"\ncmp \"$lab/www/index.html\" \"$lab/response\"\nstatus=$(curl --silent --show-error --max-time 3 \\\n    -o /dev/null -w '%{http_code}' \"$base/absent\")\ntest \"$status\" = 404\ngrep 'GET /absent' \"$lab/http.log\"\ntar -czf \"$lab/backup.tar.gz\" -C \"$lab/www\" .\ntar -xzf \"$lab/backup.tar.gz\" -C \"$lab/restore\"\ncmp \"$lab/www/index.html\" \"$lab/restore/index.html\"\nkill -TERM \"$pid\"\nwait \"$pid\" || true\npid=\"\"\nif curl --fail --silent --max-time 2 \"$base/\" >/dev/null; then\n    echo 'Unexpected listener' >&2\n    exit 1\nfi\necho 'PASS: service, failure, restore, shutdown'\n~~~\n\nКод завершения 0 означает, что проверены HTTP 200 с нужным содержимым, 404, журнал, восстановление и остановка. Ожидание порта ограничено пятью секундами. Проверка curl после остановки относится к текущему адресу, но в теории другой процесс может занять освободившийся порт. Не воспринимайте её как универсальный тест отсутствия всех служб. cleanup удаляет только созданный каталог и завершает собственный процесс при ошибке.\n\n## Конфигурация службы\n\nДля учебной VM спроектируйте unit для существующего каталога приложения. Не копируйте пути примера в /etc/systemd/system без подготовки пользователя, файлов и проверки. Создайте atlas-middle.service в пустом каталоге и выполните systemd-analyze verify ./atlas-middle.service. Пример предполагает /usr/bin/python3 и назначенный локальный порт, приложение с явным каталогом:\n\n~~~ini\n[Unit]\nDescription=Atlas local HTTP example\n\n[Service]\nType=exec\nExecStart=/usr/bin/python3 -m http.server 18080 --bind 127.0.0.1 --directory /srv/atlas-example/public\nNoNewPrivileges=yes\nRestart=on-failure\nRestartSec=2s\n~~~\n\nЭто конфигурация для статической проверки, не команда запуска: замените /srv/atlas-example/public на собственный отдельный каталог с публичными учебными данными, доступный только предусмотренному пользователю. Для пользовательского менеджера используйте user unit и доступный ему путь. Для системного unit нужен выделенный User= и соответствующая политика. Type=exec подтверждает запуск программы, но HTTP-готовность проверяется запросом. NoNewPrivileges ограничивает приобретение новых привилегий через exec, не заменяя файловую политику.\n\n## Самостоятельная работа\n\nЗамените учебный ответ, добавьте проверку хеша и ограничение размера архива. В собственной VM установите адаптированный пользовательский unit и проверьте start, status, журнал, stop и restart. Составьте runbook для отказа 404, отказа соединения и повреждения архива. Критерии приёмки: успешная автоматическая проверка, проверенный unit, объяснение трёх отказов, отчёт о восстановлении, отсутствие открытого внешнего интерфейса и оставленных процессов.",
      "terms": [
        [
          "Runbook",
          "Последовательность диагностических действий."
        ],
        [
          "Readiness",
          "Проверка готовности приложения."
        ],
        [
          "Loopback",
          "Локальная сеть хоста."
        ],
        [
          "Smoke test",
          "Быстрая проверка ключевого поведения."
        ],
        [
          "Restore",
          "Восстановление сохранённых данных."
        ]
      ],
      "steps": [
        [
          "Подготовка",
          "Файлы и права"
        ],
        [
          "Запуск",
          "Loopback и случайный порт"
        ],
        [
          "Проверки",
          "200, 404, журнал"
        ],
        [
          "Восстановление",
          "Архив и cmp"
        ],
        [
          "Остановка",
          "Сигнал и тест отказа"
        ]
      ],
      "question": [
        "Почему успешный start службы не доказывает готовность HTTP?",
        "Запуск процесса и готовность обслуживать запросы — разные события."
      ],
      "sources": [
        "systemdservice",
        "systemdanalyze",
        "curlmanual",
        "tarmanual",
        "pythonhttpserver"
      ]
    },
    {
      "id": "linux-senior-project",
      "after": "linux-middle-project",
      "min": 2,
      "title": "Итоговый проект Senior: исследование памяти и системных вызовов",
      "summary": "Измеряем процесс, проверяем COW и сетевой обмен, собираем воспроизводимый отчёт с ограничениями.",
      "body": "## Исследовательская задача\n\nСервис резервирует память и обрабатывает запросы. Требуется отличить виртуальный диапазон от резидентной памяти, проверить семантику приватных страниц после fork и объяснить сетевые системные вызовы. Нельзя делать выводы о производительности из одного прогона. В этой модели работаем с небольшими диапазонами, loopback и собственным процессом, не меняем параметры ядра.\n\n## Практика: измерительный сценарий\n\nСоздайте senior_project.py. Нужен Python 3 на Linux. Скрипт резервирует максимум 8 МиБ на прогон и завершает дочерний процесс. Системные счётчики зависят от среды, но функциональные инварианты проверяются строго.\n\n~~~python\nimport json\nimport mmap\nimport os\nimport resource\nimport socket\nimport sys\n\nsize = int(sys.argv[1]) * 1024 * 1024\nassert size in (1024 * 1024, 8 * 1024 * 1024)\n\ndef usage():\n    return resource.getrusage(resource.RUSAGE_SELF).ru_minflt\n\ndef status():\n    result = {}\n    with open(\"/proc/self/status\", encoding=\"utf-8\") as f:\n        for line in f:\n            key, _, value = line.partition(\":\")\n            if key in (\"VmSize\", \"VmRSS\"):\n                result[key] = value.strip()\n    return result\n\nwith mmap.mmap(-1, size, flags=mmap.MAP_PRIVATE,\n               prot=mmap.PROT_READ | mmap.PROT_WRITE) as area:\n    before = status()\n    f0 = usage()\n    for offset in range(0, size, mmap.PAGESIZE):\n        area[offset] = 7\n    faults = usage() - f0\n    after = status()\n    child = os.fork()\n    if child == 0:\n        area[0] = 9\n        os._exit(0 if area[0] == 9 else 1)\n    _, code = os.waitpid(child, 0)\n    assert os.waitstatus_to_exitcode(code) == 0\n    assert area[0] == 7\n\nwith socket.socket() as listener:\n    listener.settimeout(2)\n    listener.bind((\"127.0.0.1\", 0))\n    listener.listen(1)\n    with socket.create_connection(listener.getsockname(), timeout=2) as client:\n        conn, _ = listener.accept()\n        with conn:\n            conn.settimeout(2)\n            client.sendall(b\"atlas\")\n            data = b\"\"\n            while len(data) < 5:\n                chunk = conn.recv(5 - len(data))\n                if not chunk:\n                    raise RuntimeError(\"unexpected EOF\")\n                data += chunk\n            assert data == b\"atlas\"\n\nprint(json.dumps({\n    \"bytes\": size, \"before\": before, \"after\": after,\n    \"minor_fault_delta\": faults, \"cow\": \"pass\", \"socket\": \"pass\"\n}, sort_keys=True))\n~~~\n\n~~~sh\npython3 senior_project.py 1\npython3 senior_project.py 8\nstrace -f -c -o trace-summary.txt python3 senior_project.py 8\ncat trace-summary.txt\n~~~\n\nЗапуски печатают JSON, фиксируют состояние памяти и проверяют COW и TCP. -f у strace включает потомков, -c агрегирует вызовы, -o сохраняет отчёт. Счётчик minor faults не обязан равняться числу страниц; VmRSS из status — оценка по правилам ядра и может запаздывать. Не сравнивайте абсолютные показатели двух запусков без учёта начального состояния, THP и фоновой работы.\n\n## Матрица эксперимента\n\nПовторите каждый размер пять раз в одинаковых условиях. Сохраните uname -r, версию Python, getconf PAGESIZE и доступные параметры THP. Не меняйте их ради красивого результата. Сравните диапазон измерений, а не только максимальное значение. Отдельно измерьте запуск без strace: трассировка вносит накладные расходы. В своей VM при доступности perf можно добавить task-clock, page-faults и context-switches; запрет доступа фиксируется как ограничение, не обходится.\n\nСопоставьте данные с /proc/self/smaps_rollup, memory.current и memory.stat собственной cgroup, если доступны. RSS процесса и память группы не обязаны совпадать: учитываются разные объекты и границы. Используйте точную конфигурацию при сравнении.\n\n## Самостоятельная работа\n\nСформулируйте гипотезу о первом обращении к памяти. Затем измените только размер диапазона и проверьте, что семантические тесты проходят для обоих размеров. Составьте отчёт: гипотеза, окружение, исходный код, сырые данные, диапазоны, объяснение различий, ограничения. Отдельно предложите измерение задержки event loop и объясните, зачем нужна нагрузка с контролируемой частотой запросов. Приёмка: два размера, положительные проверки COW/TCP, отчёт strace, корректная интерпретация без искусственного требования фиксированного числа faults и без утверждения о производительности production.",
      "terms": [
        [
          "Baseline",
          "Исходное измерение для сравнения."
        ],
        [
          "Minor fault",
          "Разрешение отсутствующего отображения без необходимого I/O."
        ],
        [
          "COW",
          "Приватное изменение разделяемой памяти."
        ],
        [
          "Инвариант",
          "Условие, которое должно сохраняться."
        ],
        [
          "Воспроизводимость",
          "Описанные условия повторного эксперимента."
        ]
      ],
      "steps": [
        [
          "Гипотеза",
          "Первое обращение"
        ],
        [
          "Эксперимент",
          "Два размера mmap"
        ],
        [
          "COW",
          "Проверка fork"
        ],
        [
          "TCP",
          "Локальный обмен"
        ],
        [
          "Трассировка",
          "Системные вызовы"
        ],
        [
          "Отчёт",
          "Данные и ограничения"
        ]
      ],
      "question": [
        "Почему нельзя требовать ровно 2048 minor faults при 8 МиБ?",
        "Размер страниц, THP, фоновые обращения и правила учёта могут менять наблюдаемое число."
      ],
      "sources": [
        "mmapManual",
        "forkmanual",
        "stracemanual",
        "processaddrs",
        "cgroups",
        "pythonresource"
      ]
    }
  ],
  "sources": {
    "losetupmanual": {
      "title": "losetup(8)",
      "url": "https://man7.org/linux/man-pages/man8/losetup.8.html",
      "description": "Официальная документация используемого интерфейса."
    },
    "debugfsmanual": {
      "title": "debugfs(8)",
      "url": "https://man7.org/linux/man-pages/man8/debugfs.8.html",
      "description": "Официальная документация используемого интерфейса."
    },
    "pythonhttpserver": {
      "title": "Python http.server",
      "url": "https://docs.python.org/3/library/http.server.html",
      "description": "Официальная документация используемого интерфейса."
    },
    "pythonresource": {
      "title": "Python resource",
      "url": "https://docs.python.org/3/library/resource.html",
      "description": "Официальная документация используемого интерфейса."
    }
  }
};
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,E=window.ATLAS_EDITORIAL;
Object.assign(D.sources,data.sources);
for(const row of data.rows){const {after,min,terms,steps,question,...chapter}=row;
D.lessons.push({...chapter,course:"linux",minutes:Math.ceil(chapter.body.split(/\s+/).length/110)+40});
L.minimum[row.id]=min;const i=L.order.linux.indexOf(after);if(i<0)throw Error("Missing Linux prerequisite "+after);L.order.linux.splice(i+1,0,row.id);
E[row.id]={intro:row.summary,terms,diagram:{title:"Архитектура эксперимента",steps,kind:"flow",caption:"Порядок действий и границы проверки."},questions:[question]};}
})();
