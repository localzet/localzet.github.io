(function(){const data={
  "rows": [
    {
      "id": "git-fetch-push-lab",
      "after": "git-remotes",
      "min": 0,
      "title": "Remote, fetch, pull и push: две независимые копии",
      "summary": "Воспроизводим обмен коммитами и различаем локальную ветку, upstream и состояние сервера.",
      "body": "## Три ссылки вместо одной\n\nRemote — именованный набор настроек для взаимодействия с другим репозиторием, обычно URL и refspec. origin не специальное имя протокола: его выбирают при clone или remote add. Локальная main, refs/remotes/origin/main и refs/heads/main на сервере — три разных значения. Remote-tracking ref отражает последнее полученное или известное Git состояние, а не гарантированно актуальную серверную вершину. Upstream задаёт связь локальной ветки с другой ссылкой через branch.main.remote и branch.main.merge.\n\nFetch получает необходимые объекты и обновляет выбранные локальные refs; обычный fetch не меняет файлы активной ветки. Pull выполняет fetch и затем интеграцию согласно параметрам: merge, rebase или только fast-forward. Явный --ff-only безопасно отказывается объединять расходящиеся линии. Push отправляет необходимые объекты и запрашивает обновление серверных refs. Сервер проверяет права, политику и допустимость обновления; успешный push не означает автоматический деплой.\n\n## Диагностика перед обменом\n\ngit remote -v показывает адреса получения и отправки, branch -vv — upstream и локальное сравнение с ним. git ls-remote запрашивает состояние удалённых refs, не обновляя локальные tracking refs. Чтобы сравнить истории, сначала выполните fetch, затем log или rev-list. Не размещайте токены в URL: он может попасть в конфигурацию, историю команд и журналы.\n\n## Практика: локальный сервер и две копии\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и выполните bash вне переопределённого Git-контекста. Скрипт создаёт временный каталог, отключает внешние настройки, использует только локальные репозитории и удаляет только созданный каталог при выходе. Сервер — bare-репозиторий без рабочего дерева; peer — вторая рабочая копия. Ни одна команда не обращается к реальному удалённому серверу.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit init -q --bare -b main \"$lab/server.git\"\ngit remote add origin \"$lab/server.git\"\ngit push -q -u origin main\ngit clone -q \"$lab/server.git\" \"$lab/peer\"\ngit -C \"$lab/peer\" config user.name 'Atlas Peer'\ngit -C \"$lab/peer\" config user.email 'peer@example.invalid'\ngit -C \"$lab/peer\" config commit.gpgsign false\necho peer > \"$lab/peer/peer.txt\"\ngit -C \"$lab/peer\" add -- peer.txt\ngit -C \"$lab/peer\" commit -qm Peer\ngit -C \"$lab/peer\" push -q origin main\npeer=$(git -C \"$lab/peer\" rev-parse HEAD)\ntest \"$(git rev-parse origin/main)\" = \"$base\"\ntest \"$(git ls-remote origin refs/heads/main | cut -f1)\" = \"$peer\"\ngit fetch -q origin\ntest \"$(git rev-parse origin/main)\" = \"$peer\"\ntest \"$(git rev-parse HEAD)\" = \"$base\"\ntest ! -e peer.txt\ngit pull --ff-only origin main\ntest \"$(git rev-parse HEAD)\" = \"$peer\"\ntest \"$(cat peer.txt)\" = peer\necho local > local.txt\ngit add -- local.txt\ngit commit -qm Local\ngit push origin main\ntest \"$(git --git-dir=\"$lab/server.git\" rev-parse main)\" = \"$(git rev-parse HEAD)\"\ngit branch -vv\necho 'PASS: fetch pull and push across clones'\n~~~\n\npush -u в подготовке сохраняет upstream при успешной отправке. peer изменяет сервер, но локальный origin/main остаётся на Base до fetch. ls-remote показывает серверный OID, fetch обновляет tracking ref, а pull --ff-only передвигает main и обновляет рабочее дерево. В конце push публикует локальный коммит. Проверка через --git-dir допустима только потому, что bare-сервер находится в лаборатории; в настоящем проекте используется ls-remote или интерфейс сервера. В случае расхождения --ff-only откажется продолжать: выберите способ интеграции осознанно.\n\n## Самостоятельная работа\n\nСоздайте независимые коммиты в двух копиях, отправьте один и выполните fetch во второй. Сравните git rev-list --left-right --count HEAD...origin/main. Попробуйте pull --ff-only и объясните отказ. Затем в отдельном опыте объедините изменения и проверьте результат перед push.",
      "terms": [
        [
          "Remote",
          "Именованные настройки другого репозитория."
        ],
        [
          "Tracking ref",
          "Локальное известное состояние удалённой ветки."
        ],
        [
          "Upstream",
          "Связь для интеграции и сравнения."
        ],
        [
          "Fetch",
          "Получение объектов и refs."
        ],
        [
          "Push",
          "Запрос обновления серверных refs."
        ]
      ],
      "steps": [
        [
          "Peer",
          "Новый коммит"
        ],
        [
          "Push",
          "Серверная ветка"
        ],
        [
          "Fetch",
          "origin/main"
        ],
        [
          "Pull",
          "Локальная main"
        ],
        [
          "Push",
          "Публикация своей работы"
        ]
      ],
      "question": [
        "Обновляет ли fetch рабочие файлы обычной активной ветки?",
        "Нет, для интеграции нужен отдельный шаг."
      ],
      "sources": [
        "gitremote-git-remote",
        "gitremote-git-fetch",
        "gitremote-git-pull",
        "gitremote-git-push",
        "gitremote-git-ls-remote",
        "gitremote-git-branch"
      ],
      "pass": "PASS: fetch pull and push across clones",
      "junior": {
        "title": "Как обмениваться работой через удалённый репозиторий",
        "body": "## Git и сервер\n\nУ каждого разработчика есть локальная история. Чтобы передать изменения коллегам, нужен общий репозиторий. Remote — имя настроенного адреса, например origin. Коммит сначала сохраняется локально, а push отправляет его на сервер. Fetch получает чужие изменения, но не объединяет их с вашей веткой.\n\n## Практика без Интернета\n\nВ новом учебном каталоге выполните:\n\n~~~sh\ngit init --bare -b main server.git\ngit clone server.git project\ncd project\ngit config user.name Student\ngit config user.email student@example.invalid\necho hello > README.md\ngit add README.md\ngit commit -m First\ngit push -u origin main\ncd ..\ngit clone server.git colleague\ncat colleague/README.md\n~~~\n\nBare-репозиторий хранит историю без обычной рабочей папки. clone создаёт локальную копию, push -u отправляет коммит и настраивает связь ветки с удалённой. Во второй копии должен появиться README.md.\n\n## Проверка\n\nВ colleague настройте имя и email, измените README, сохраните коммит и отправьте его командой git push. В project выполните git fetch и посмотрите git status. Рабочий файл пока не изменился. Затем git pull --ff-only получит обновление без создания merge-коммита, если ваша ветка не расходилась с сервером. Если команда отказывает, не используйте принудительную отправку: сначала исследуйте историю. Для опыта не требуется аккаунт GitHub и не нужно публиковать какие-либо данные в Интернет."
      }
    },
    {
      "id": "git-refspec-lab",
      "after": "git-fetch-push-lab",
      "min": 1,
      "title": "Refspec, tracking и удаление ссылок",
      "summary": "Управляем отображением имён, выбранными ветками и prune без изменения локальной истории.",
      "body": "## Отображение пространства имён\n\nRefspec описывает соответствие источника и назначения. При fetch типичная запись +refs/heads/*:refs/remotes/origin/* означает получение веток сервера в локальное пространство tracking refs; плюс разрешает принудительное обновление соответствующих ссылок по правилам fetch. При push направление обратное: refs/heads/topic:refs/heads/review публикует локальную ветку под другим серверным именем. Источник и назначение зависят от команды; не переносите refspec между ними механически.\n\nWildcard позволяет сопоставлять семейства refs. Отрицательный fetch refspec с префиксом ^ исключает источники, не имеет назначения и не является отрицательным push refspec. Настройки remote.NAME.fetch могут иметь несколько значений; команда с явным refspec позволяет запросить выбранный набор. Для надёжных скриптов используйте полные имена, чтобы не спутать одноимённые ветку и тег.\n\n## Удаление и prune\n\ngit push origin :refs/heads/review запрашивает удаление серверной ссылки; --delete предоставляет удобную форму. Это изменение общей истории именования, поэтому проверяйте адрес, имя и права. fetch --prune удаляет локальные tracking refs, которым больше не соответствует источник согласно refspec, но не удаляет обычные локальные ветки. При нестандартных отображениях, особенно с тегами, последствия prune могут быть шире. --prune-tags требует отдельного внимания: теги обычно находятся в общем локальном пространстве, а не в пространстве конкретного remote.\n\n## Практика: локальный сервер и две копии\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и выполните bash вне переопределённого Git-контекста. Скрипт создаёт временный каталог, отключает внешние настройки, использует только локальные репозитории и удаляет только созданный каталог при выходе. Сервер — bare-репозиторий без рабочего дерева; peer — вторая рабочая копия. Ни одна команда не обращается к реальному удалённому серверу.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit init -q --bare -b main \"$lab/server.git\"\ngit remote add origin \"$lab/server.git\"\ngit push -q -u origin main\ngit clone -q \"$lab/server.git\" \"$lab/peer\"\ngit -C \"$lab/peer\" config user.name 'Atlas Peer'\ngit -C \"$lab/peer\" config user.email 'peer@example.invalid'\ngit -C \"$lab/peer\" config commit.gpgsign false\ngit switch -c topic\necho review > review.txt\ngit add -- review.txt\ngit commit -qm Review\ntopic=$(git rev-parse HEAD)\ngit push origin refs/heads/topic:refs/heads/review\ntest \"$(git ls-remote origin refs/heads/review | cut -f1)\" = \"$topic\"\ngit -C \"$lab/peer\" fetch origin refs/heads/review:refs/remotes/origin/review\ntest \"$(git -C \"$lab/peer\" rev-parse refs/remotes/origin/review)\" = \"$topic\"\ngit -C \"$lab/peer\" switch -c local-review --track origin/review\ntest \"$(git -C \"$lab/peer\" rev-parse --abbrev-ref 'HEAD@{upstream}')\" = origin/review\ngit push origin --delete review\ngit -C \"$lab/peer\" fetch --prune origin\nif git -C \"$lab/peer\" show-ref --verify --quiet refs/remotes/origin/review; then exit 1; fi\ntest \"$(git -C \"$lab/peer\" rev-parse local-review)\" = \"$topic\"\ntest \"$(git rev-parse topic)\" = \"$topic\"\ngit config --get-all remote.origin.fetch\necho 'PASS: refspec mapping and prune'\n~~~\n\n--track настраивает upstream новой ветки; HEAD@{upstream} разрешает её связь, а не родителя HEAD. После удаления review с сервера prune убирает origin/review во второй копии, но local-review и исходная topic остаются. show-ref --verify --quiet проверяет точное имя через код возврата. В реальном проекте проверьте remote -v, ls-remote и конфигурацию refspec, прежде чем удалять ссылки. Удаление имени не гарантирует уничтожения объектов на сервере.\n\n## Самостоятельная работа\n\nСоздайте несколько веток на учебном сервере и отдельный remote с fetch refspec для одного семейства. Добавьте отрицательный refspec, проверьте git config --get-all и результат fetch. Перед экспериментом с prune перечислите ожидаемые удалённые ссылки. Объясните, почему git fetch --prune не является удалением веток коллег на сервере.",
      "terms": [
        [
          "Refspec",
          "Отображение источника на назначение."
        ],
        [
          "Wildcard",
          "Шаблон семейства имён."
        ],
        [
          "Prune",
          "Очистка устаревших локальных отображений."
        ],
        [
          "Upstream",
          "Связь локальной ветки с источником."
        ],
        [
          "Delete ref",
          "Запрос удаления ссылки на сервере."
        ]
      ],
      "steps": [
        [
          "Локальная topic",
          "Источник push"
        ],
        [
          "Сервер review",
          "Назначение"
        ],
        [
          "origin/review",
          "Отображение fetch"
        ],
        [
          "Удаление",
          "Серверная ссылка"
        ],
        [
          "Prune",
          "Локальная tracking ref"
        ]
      ],
      "question": [
        "Удалит ли обычный fetch --prune локальную ветку local-review?",
        "Нет, если она не входит в нестандартное отображение refspec."
      ],
      "sources": [
        "gitremote-git-fetch",
        "gitremote-git-push",
        "gitremote-git-config",
        "gitremote-git-branch",
        "gitremote-git-check-ref-format"
      ],
      "pass": "PASS: refspec mapping and prune"
    },
    {
      "id": "git-push-lease",
      "after": "git-refspec-lab",
      "min": 1,
      "title": "Конкурентный push: non-fast-forward и force-with-lease",
      "summary": "Моделируем параллельную работу и отклонение устаревшего ожидания.",
      "body": "## Почему сервер отклоняет обновление\n\nОбычный push ветки допускает fast-forward: старая вершина сервера должна быть предком новой. Если коллега отправил независимый коммит, ваша ветка не включает его историю, поэтому сервер обычно отвергает обновление. Это защита от потери чужой работы. Сначала fetch и исследование графа, затем merge или rebase в рамках правил команды. Не превращайте non-fast-forward в автоматический force.\n\nForce позволяет отправить историю, которая не является продолжением старой. --force-with-lease=REF:EXPECT требует совпадения текущего серверного значения с явно ожидаемым OID. Это проверка на потерянное обновление, не блокировка: после чтения старого состояния другой участник может изменить сервер. Пустое EXPECT означает ожидание отсутствующей ссылки. Форма без явного OID использует локальное известное состояние и может взаимодействовать с фоновым fetch; для критичной автоматизации фиксируйте ожидаемую вершину явно.\n\n## Дополнительные границы\n\nLease не гарантирует прохождение тестов, корректность переписанной истории или отсутствие намеренно отброшенных коммитов. Серверные правила могут запретить даже lease-подтверждённый push. --atomic просит выполнить несколько обновлений целиком или ни одного при поддержке сервера. --dry-run полезен для проверки намерения, но не резервирует серверное состояние. Никогда не обходите защищённую ветку ради успешного результата команды.\n\n## Практика: локальный сервер и две копии\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и выполните bash вне переопределённого Git-контекста. Скрипт создаёт временный каталог, отключает внешние настройки, использует только локальные репозитории и удаляет только созданный каталог при выходе. Сервер — bare-репозиторий без рабочего дерева; peer — вторая рабочая копия. Ни одна команда не обращается к реальному удалённому серверу.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit init -q --bare -b main \"$lab/server.git\"\ngit remote add origin \"$lab/server.git\"\ngit push -q -u origin main\ngit clone -q \"$lab/server.git\" \"$lab/peer\"\ngit -C \"$lab/peer\" config user.name 'Atlas Peer'\ngit -C \"$lab/peer\" config user.email 'peer@example.invalid'\ngit -C \"$lab/peer\" config commit.gpgsign false\necho first > local.txt\ngit add -- local.txt\ngit commit -qm Local\ngit push -q origin main\nexpected=$(git rev-parse HEAD)\ngit -C \"$lab/peer\" pull -q --ff-only\necho peer > \"$lab/peer/peer.txt\"\ngit -C \"$lab/peer\" add -- peer.txt\ngit -C \"$lab/peer\" commit -qm Peer\ngit -C \"$lab/peer\" push -q origin main\npeer=$(git -C \"$lab/peer\" rev-parse HEAD)\ngit commit --amend -qm 'Local revised'\nif git push origin main 2>/dev/null; then exit 1; fi\nif git push --force-with-lease=\"refs/heads/main:$expected\" origin main 2>/dev/null; then exit 1; fi\ntest \"$(git ls-remote origin refs/heads/main | cut -f1)\" = \"$peer\"\ngit fetch -q origin\ngit branch preserve-peer origin/main\ngit rebase origin/main\ntest -f peer.txt\ngit push origin main\ngit merge-base --is-ancestor \"$peer\" HEAD\ngit switch -c private-topic\ngit push -q origin private-topic\nold=$(git rev-parse HEAD)\ngit commit --amend -qm 'Private topic revised'\ngit push --force-with-lease=\"refs/heads/private-topic:$old\" origin private-topic\ntest \"$(git ls-remote origin refs/heads/private-topic | cut -f1)\" = \"$(git rev-parse HEAD)\"\necho 'PASS: stale lease rejected and private lease accepted'\n~~~\n\nВ опыте коллега продвигает main после того, как локальная копия запомнила expected. Обычный push и lease со старым OID отклоняются. Восстановление через fetch и rebase сохраняет коммит peer в родословной. Поскольку исходное изменение Local уже присутствует на сервере, Git может пропустить эквивалентный патч; проверяем наличие peer и достижимость, а не обязательное создание нового коммита. Принудительный lease в последней части разрешён только для отдельной учебной ветки с известным OID. Это не рекомендация переписывать общую main.\n\n## Самостоятельная работа\n\nВоспроизведите два конкурентных обновления отдельной ветки. Сохраните ожидаемый OID, затем выполните fetch после чужого push и сравните явный lease с неявным. Исследуйте --atomic с двумя refs и серверным запретом одной операции. Объясните, почему проверки веток и право на force остаются ответственностью сервера.",
      "terms": [
        [
          "Non-fast-forward",
          "Обновление без сохранения старой вершины как предка."
        ],
        [
          "Lease",
          "Проверка ожидаемого значения."
        ],
        [
          "Lost update",
          "Потеря чужого обновления."
        ],
        [
          "Atomic push",
          "Согласованное обновление нескольких refs."
        ],
        [
          "Branch protection",
          "Серверная политика обновления."
        ]
      ],
      "steps": [
        [
          "Ожидание",
          "OID A"
        ],
        [
          "Peer push",
          "Сервер → B"
        ],
        [
          "Lease A",
          "Отказ"
        ],
        [
          "Fetch/rebase",
          "Интеграция B"
        ],
        [
          "Push",
          "Сохранение истории"
        ]
      ],
      "question": [
        "Даёт ли force-with-lease право обходить серверные правила?",
        "Нет, сервер может отклонить операцию."
      ],
      "sources": [
        "gitremote-git-push",
        "gitremote-git-fetch",
        "gitremote-git-rebase",
        "gitremote-git-receive-pack"
      ],
      "pass": "PASS: stale lease rejected and private lease accepted"
    },
    {
      "id": "git-transport-v2",
      "after": "git-push-lease",
      "min": 2,
      "title": "Транспорт Git: upload-pack, receive-pack и protocol v2",
      "summary": "Исследуем обмен capabilities, ls-refs и fetch на локальном транспорте без сети.",
      "body": "## Транспорт и протокол — разные слои\n\nGit может работать с локальным путём, file://, SSH, HTTP(S) и git://. Локальный clone по пути может оптимизировать копирование объектов и не использовать обычный сетевой обмен; file:// запускает локальный транспорт через серверные команды. SSH предоставляет защищённый канал и аутентификацию, а сервер запускает Git-сервис. Smart HTTP использует HTTP-запросы для обмена протоколом Git; dumb HTTP читает опубликованные статические файлы и не имеет тех же возможностей. git:// сам по себе не обеспечивает шифрование или аутентификацию, поэтому не подходит для передачи чувствительных данных.\n\nДля получения объектов используется upload-pack; для отправки — receive-pack. Git protocol v2 вводит обмен возможностями и отдельные команды, в частности ls-refs и fetch. Пакетные строки pkt-line имеют четырёхсимвольный шестнадцатеричный префикс длины, специальные пакеты обозначают границы; данные pack передаются по правилам согласованной возможности. Не путайте версию протокола с версией Git, HTTP или форматом pack.\n\n## Согласование объектов\n\nПри fetch клиент сообщает желаемые вершины (want) и известные объекты (have) по правилам согласования; сервер определяет нужное множество и строит pack. Delta-сжатие уменьшает передачу, но выбор базы не является родительской связью коммита. В protocol v2 набор возможностей зависит от сервера; v2 fetch не означает, что push использует тот же обмен. GIT_TRACE_PACKET помогает исследовать сообщения, но журнал может раскрыть имена refs и OID; другие виды trace могут раскрывать URL, заголовки или чувствительные данные.\n\n## Практика: локальный сервер и две копии\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и выполните bash вне переопределённого Git-контекста. Скрипт создаёт временный каталог, отключает внешние настройки, использует только локальные репозитории и удаляет только созданный каталог при выходе. Сервер — bare-репозиторий без рабочего дерева; peer — вторая рабочая копия. Ни одна команда не обращается к реальному удалённому серверу.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit init -q --bare -b main \"$lab/server.git\"\ngit remote add origin \"$lab/server.git\"\ngit push -q -u origin main\ngit clone -q \"$lab/server.git\" \"$lab/peer\"\ngit -C \"$lab/peer\" config user.name 'Atlas Peer'\ngit -C \"$lab/peer\" config user.email 'peer@example.invalid'\ngit -C \"$lab/peer\" config commit.gpgsign false\nurl=\"file://$lab/server.git\"\nGIT_TRACE_PACKET=\"$lab/clone.trace\" git -c protocol.version=2 clone -q \"$url\" \"$lab/probe\"\ngrep -F 'version 2' \"$lab/clone.trace\"\ngrep -F 'command=ls-refs' \"$lab/clone.trace\"\ngrep -F 'command=fetch' \"$lab/clone.trace\"\necho next > next.txt\ngit add -- next.txt\ngit commit -qm Next\ngit push -q origin main\ntip=$(git rev-parse HEAD)\nGIT_TRACE_PACKET=\"$lab/fetch.trace\" git -C \"$lab/probe\" -c protocol.version=2 fetch -q origin\ngrep -F 'command=fetch' \"$lab/fetch.trace\"\ngrep -F \"want $tip\" \"$lab/fetch.trace\"\ntest \"$(git -C \"$lab/probe\" rev-parse origin/main)\" = \"$tip\"\ntest \"$(git -C \"$lab/probe\" rev-parse HEAD)\" = \"$base\"\ngit -C \"$lab/probe\" cat-file -t \"$tip\"\necho 'PASS: protocol v2 ls-refs and fetch'\n~~~\n\nfile:// принуждает использовать транспорт вместо оптимизации прямого локального clone. protocol.version=2 запрашивает версию 2; в лаборатории обе стороны — установленный Git. Trace записывает пакетные сообщения в временные файлы. Проверяются version 2, ls-refs, fetch и want нового OID. Не требуем фиксированного набора have или числа пакетов: алгоритм и настройки согласования могут отличаться. После fetch объект и origin/main доступны, HEAD остаётся на Base. Практика подтверждает локальное взаимодействие upload-pack, но не проверяет SSH-аутентификацию, TLS, HTTP-прокси или возможности внешнего хостинга.\n\n## Самостоятельная работа\n\nСравните трассировки protocol.version=0 и 2 на локальном file://. Найдите объявления capabilities и границы pkt-line в документации. Создайте длинную разошедшуюся историю и изучите have/ack без предположений о фиксированном порядке. Опишите отдельно, где проверяются идентичность SSH-сервера, TLS-сертификат и права доступа к refs.",
      "terms": [
        [
          "Upload-pack",
          "Сервис выдачи объектов."
        ],
        [
          "Receive-pack",
          "Сервис приёма push."
        ],
        [
          "Pkt-line",
          "Формат пакетных строк."
        ],
        [
          "Capability",
          "Согласованная возможность."
        ],
        [
          "Want / have",
          "Запросы и сведения об известных объектах."
        ]
      ],
      "steps": [
        [
          "Транспорт",
          "file:// или защищённый канал"
        ],
        [
          "Capabilities",
          "Версия и возможности"
        ],
        [
          "ls-refs",
          "Объявление ссылок"
        ],
        [
          "fetch",
          "Согласование объектов"
        ],
        [
          "Pack",
          "Получение данных"
        ]
      ],
      "question": [
        "Означает ли protocol v2 шифрование канала?",
        "Нет, защиту канала определяет транспорт."
      ],
      "sources": [
        "gitremote-gitprotocol-v2",
        "gitremote-gitprotocol-pack",
        "gitremote-gitprotocol-common",
        "gitremote-git-upload-pack",
        "gitremote-git-receive-pack",
        "gitremote-git-fetch"
      ],
      "pass": "PASS: protocol v2 ls-refs and fetch"
    },
    {
      "id": "git-shallow-partial",
      "after": "git-transport-v2",
      "min": 2,
      "title": "Shallow и partial clone: границы истории и ленивые объекты",
      "summary": "Сравниваем усечение родословной с фильтрацией blob и проверяем ленивую загрузку.",
      "body": "## Два разных способа сократить clone\n\nShallow clone с --depth=N ограничивает доступную историю выбранной вершины или вершин. Git хранит границы shallow и рассматривает соответствующие коммиты как корни для некоторых обходов, хотя в исходных объектах могут быть родители. Это меняет результаты log, merge-base, blame, describe и других операций. --deepen увеличивает глубину относительно текущей границы, --unshallow пытается получить полную историю, если сервер сам располагает ею. --single-branch и --no-tags ограничивают другие аспекты получения refs и не равнозначны depth.\n\nPartial clone с --filter=blob:none сохраняет нужные коммиты и деревья, но сервер может не отправить blob до первого запроса. Promisor remote обещает возможность получить недостающие объекты; Git отмечает соответствующие packs и конфигурацию. Это другая модель, чем shallow: история может быть полной, содержимое файлов — отсутствовать локально до чтения. Checkout обычно загружает нужные blob, поэтому для демонстрации отложенной загрузки используем --no-checkout.\n\n## Цена оптимизации\n\nСервер должен поддерживать выбранный фильтр. При отсутствии поддержки Git может предупредить и получить больше объектов. Ленивые запросы делают некоторые команды зависимыми от доступности remote, добавляют задержки и сетевой обмен. Нельзя считать partial clone полностью автономной копией. Sparse checkout определяет, какие пути отображаются в рабочем дереве, и может сочетаться с partial clone, но сам по себе не гарантирует уменьшения объектной базы. Для резервных копий проверяйте полноту объектов отдельно.\n\n## Практика: локальный сервер и две копии\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и выполните bash вне переопределённого Git-контекста. Скрипт создаёт временный каталог, отключает внешние настройки, использует только локальные репозитории и удаляет только созданный каталог при выходе. Сервер — bare-репозиторий без рабочего дерева; peer — вторая рабочая копия. Ни одна команда не обращается к реальному удалённому серверу.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit init -q --bare -b main \"$lab/server.git\"\ngit remote add origin \"$lab/server.git\"\ngit push -q -u origin main\ngit clone -q \"$lab/server.git\" \"$lab/peer\"\ngit -C \"$lab/peer\" config user.name 'Atlas Peer'\ngit -C \"$lab/peer\" config user.email 'peer@example.invalid'\ngit -C \"$lab/peer\" config commit.gpgsign false\nfor n in $(seq 1 5); do\n  printf 'version %s\\n' \"$n\" > payload.txt\n  git add -- payload.txt\n  git commit -qm \"Version $n\"\ndone\ngit push -q origin main\nurl=\"file://$lab/server.git\"\ngit clone -q --depth=1 \"$url\" \"$lab/shallow\"\ntest \"$(git -C \"$lab/shallow\" rev-parse --is-shallow-repository)\" = true\ntest \"$(git -C \"$lab/shallow\" rev-list --count HEAD)\" = 1\ngit -C \"$lab/shallow\" fetch -q --unshallow\ntest \"$(git -C \"$lab/shallow\" rev-parse --is-shallow-repository)\" = false\ntest \"$(git -C \"$lab/shallow\" rev-list --count HEAD)\" = 6\ngit --git-dir=\"$lab/server.git\" config uploadpack.allowFilter true\ngit clone -q --filter=blob:none --no-checkout \"$url\" \"$lab/partial\"\ntest \"$(git -C \"$lab/partial\" config --get remote.origin.promisor)\" = true\ntest \"$(git -C \"$lab/partial\" rev-list --count HEAD)\" = 6\nblob=$(git -C \"$lab/partial\" rev-parse HEAD:payload.txt)\ngit -C \"$lab/partial\" rev-list --objects --missing=print HEAD > \"$lab/missing\"\ngrep -Fx \"?$blob\" \"$lab/missing\"\ntest \"$(git -C \"$lab/partial\" cat-file -p \"$blob\")\" = 'version 5'\ngit -C \"$lab/partial\" rev-list --objects --missing=print HEAD > \"$lab/after\"\nif grep -Fx \"?$blob\" \"$lab/after\"; then exit 1; fi\necho 'PASS: shallow history and lazy blob fetch'\n~~~\n\nВ shallow-копии сначала один видимый коммит, после --unshallow — шесть. Для фильтра сервер специально настроен в одноразовой лаборатории. --missing=print показывает отсутствующие объекты с префиксом ?, не загружая их обычным обходом. rev-parse HEAD:payload.txt разрешает OID через дерево. cat-file запрашивает blob у promisor remote и проверяет байты; повторная проверка подтверждает его появление. Здесь используется file://, а не прямой локальный clone, иначе оптимизация могла бы обойти фильтр. Не проверяются лимиты, аутентификация и серверные политики внешнего хостинга.\n\n## Самостоятельная работа\n\nСравните count-objects -vH в полном, shallow и partial клонах. Выполните checkout в partial и исследуйте изменение списка missing. Отключите доступ к учебному серверу только после сохранения копий и определите, какие операции требуют недостающих объектов. Объясните, почему shallow и sparse checkout не заменяют полную историю.",
      "terms": [
        [
          "Shallow",
          "История с искусственной границей."
        ],
        [
          "Partial clone",
          "Клон с отсутствующими обещанными объектами."
        ],
        [
          "Promisor remote",
          "Источник обещанных объектов."
        ],
        [
          "Blob filter",
          "Правило исключения содержимого."
        ],
        [
          "Sparse checkout",
          "Выбор отображаемых путей."
        ]
      ],
      "steps": [
        [
          "Полная история",
          "Коммиты и объекты"
        ],
        [
          "Depth",
          "Граница коммитов"
        ],
        [
          "Filter",
          "Отсутствующие blob"
        ],
        [
          "Запрос",
          "Ленивая загрузка"
        ],
        [
          "Проверка",
          "Полнота и доступность"
        ]
      ],
      "question": [
        "Одинаковы ли --depth и --filter=blob:none?",
        "Нет, они ограничивают разные части модели."
      ],
      "sources": [
        "gitremote-git-clone",
        "gitremote-git-fetch",
        "gitremote-git-rev-list",
        "gitremote-git-cat-file",
        "gitremote-gitprotocol-v2",
        "gitremote-partial-clone"
      ],
      "pass": "PASS: shallow history and lazy blob fetch"
    },
    {
      "id": "git-tags-mirror",
      "after": "git-shallow-partial",
      "min": 1,
      "title": "Теги, релизы и зеркалирование репозиториев",
      "summary": "Различаем аннотированный тег и релиз, проверяем mirror refs и безопасное резервирование.",
      "body": "## Тег и релиз — разные сущности\n\nLightweight tag — именованная ссылка на объект; annotated tag — отдельный объект с метаданными, сообщением и целевым OID, на который указывает refs/tags/NAME. Тег может указывать не только на коммит. git show и rev-parse TAG^{} позволяют исследовать содержимое и раскрыть аннотированный тег. Подпись тега — дополнительный механизм доверия; она требует проверки ключа и политики. Наличие имени v1.0 не доказывает, что артефакт был собран из соответствующего исходного кода. Release на платформе может включать описания, вложенные бинарники и другие данные вне Git.\n\nОбычный push ветки не отправляет все теги. git push origin TAG публикует выбранный тег, --tags отправляет все теги, --follow-tags дополнительно публикует подходящие отсутствующие аннотированные теги, достижимые из отправляемых refs. Не переписывайте публичные теги без согласованной процедуры: пользователи могли уже получить прежний объект.\n\n## Зеркало и резервная копия\n\ngit clone --mirror создаёт bare-репозиторий с отображением всех refs источника по правилам mirror. git push --mirror стремится синхронизировать все refs назначения, включая принудительное обновление и удаление отсутствующих в источнике. Это опасно для чужого или общего сервера; используйте отдельное пустое назначение и проверяйте refs. Mirror не гарантирует сохранение reflog, hooks, локальной конфигурации, рабочих файлов, объектов за пределами доступных refs или данных платформы. Для полноценной стратегии восстановления учитывайте LFS, submodules, релизные артефакты и серверные настройки. Проверяйте восстановление, а не только факт создания копии.\n\n## Практика: локальный сервер и две копии\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и выполните bash вне переопределённого Git-контекста. Скрипт создаёт временный каталог, отключает внешние настройки, использует только локальные репозитории и удаляет только созданный каталог при выходе. Сервер — bare-репозиторий без рабочего дерева; peer — вторая рабочая копия. Ни одна команда не обращается к реальному удалённому серверу.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit init -q --bare -b main \"$lab/server.git\"\ngit remote add origin \"$lab/server.git\"\ngit push -q -u origin main\ngit clone -q \"$lab/server.git\" \"$lab/peer\"\ngit -C \"$lab/peer\" config user.name 'Atlas Peer'\ngit -C \"$lab/peer\" config user.email 'peer@example.invalid'\ngit -C \"$lab/peer\" config commit.gpgsign false\ngit tag -a v1 -m 'Release v1'\ngit tag light\ngit push -q origin main\ntest -z \"$(git ls-remote origin refs/tags/v1)\"\ngit push -q origin --follow-tags main\ntest -n \"$(git ls-remote origin refs/tags/v1)\"\ntest -z \"$(git ls-remote origin refs/tags/light)\"\ngit push -q origin refs/tags/light\ngit switch -c maintenance\necho patch > patch.txt\ngit add -- patch.txt\ngit commit -qm Maintenance\ngit push -q origin maintenance\ngit clone -q --mirror \"file://$lab/server.git\" \"$lab/mirror.git\"\ntest \"$(git --git-dir=\"$lab/mirror.git\" cat-file -t refs/tags/v1)\" = tag\ntest \"$(git --git-dir=\"$lab/mirror.git\" cat-file -t refs/tags/light)\" = commit\ngit init -q --bare -b main \"$lab/backup.git\"\ngit --git-dir=\"$lab/mirror.git\" push --mirror \"$lab/backup.git\"\ngit --git-dir=\"$lab/server.git\" for-each-ref --format='%(refname) %(objectname)' > \"$lab/source.refs\"\ngit --git-dir=\"$lab/backup.git\" for-each-ref --format='%(refname) %(objectname)' > \"$lab/backup.refs\"\ncmp \"$lab/source.refs\" \"$lab/backup.refs\"\ngit --git-dir=\"$lab/backup.git\" fsck --full\necho 'PASS: tags and mirror ref integrity'\n~~~\n\nВ опыте обычный push не публикует v1, --follow-tags отправляет аннотированный v1, но не lightweight light. После явной публикации light и maintenance mirror получает все созданные refs. push --mirror выполняется только в новом пустом backup.git. for-each-ref выводит сопоставимые имена и OID, cmp подтверждает совпадение, fsck проверяет целостность объектов. Это проверка Git-снимков, не восстановление целого GitHub-проекта. HEAD bare-репозитория не является обычной refs/* и не переносится push --mirror как настройка default branch.\n\n## Самостоятельная работа\n\nВ одноразовом сервере добавьте ветку, которую нет в зеркале, и изучите вывод push --mirror --dry-run; объясните риск удаления. Создайте git bundle с нужными refs, проверьте bundle verify и восстановите отдельный клон. Составьте список данных платформы, которые необходимо резервировать отдельно.",
      "terms": [
        [
          "Annotated tag",
          "Самостоятельный объект метки."
        ],
        [
          "Lightweight tag",
          "Обычная именованная ссылка."
        ],
        [
          "Release",
          "Публикация версии и артефактов."
        ],
        [
          "Mirror",
          "Зеркальное отображение refs."
        ],
        [
          "Bundle",
          "Переносимый пакет Git-истории."
        ]
      ],
      "steps": [
        [
          "Теги",
          "Публикация выбранных refs"
        ],
        [
          "Mirror clone",
          "Все доступные refs"
        ],
        [
          "Mirror push",
          "Пустое назначение"
        ],
        [
          "Сравнение",
          "Имена и OID"
        ],
        [
          "Fsck",
          "Целостность объектов"
        ]
      ],
      "question": [
        "Сохраняет ли зеркало Git все данные платформы?",
        "Нет, данные релизов, настройки и другие сущности могут находиться вне Git."
      ],
      "sources": [
        "gitremote-git-tag",
        "gitremote-git-push",
        "gitremote-git-clone",
        "gitremote-git-bundle",
        "gitremote-git-fsck"
      ],
      "pass": "PASS: tags and mirror ref integrity"
    }
  ],
  "sources": {
    "gitremote-git-remote": {
      "title": "git-remote",
      "url": "https://git-scm.com/docs/git-remote",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-fetch": {
      "title": "git-fetch",
      "url": "https://git-scm.com/docs/git-fetch",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-pull": {
      "title": "git-pull",
      "url": "https://git-scm.com/docs/git-pull",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-push": {
      "title": "git-push",
      "url": "https://git-scm.com/docs/git-push",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-ls-remote": {
      "title": "git-ls-remote",
      "url": "https://git-scm.com/docs/git-ls-remote",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-branch": {
      "title": "git-branch",
      "url": "https://git-scm.com/docs/git-branch",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-config": {
      "title": "git-config",
      "url": "https://git-scm.com/docs/git-config",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-check-ref-format": {
      "title": "git-check-ref-format",
      "url": "https://git-scm.com/docs/git-check-ref-format",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-rebase": {
      "title": "git-rebase",
      "url": "https://git-scm.com/docs/git-rebase",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-receive-pack": {
      "title": "git-receive-pack",
      "url": "https://git-scm.com/docs/git-receive-pack",
      "description": "Официальное руководство Git."
    },
    "gitremote-gitprotocol-v2": {
      "title": "gitprotocol-v2",
      "url": "https://git-scm.com/docs/gitprotocol-v2",
      "description": "Официальное руководство Git."
    },
    "gitremote-gitprotocol-pack": {
      "title": "gitprotocol-pack",
      "url": "https://git-scm.com/docs/gitprotocol-pack",
      "description": "Официальное руководство Git."
    },
    "gitremote-gitprotocol-common": {
      "title": "gitprotocol-common",
      "url": "https://git-scm.com/docs/gitprotocol-common",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-upload-pack": {
      "title": "git-upload-pack",
      "url": "https://git-scm.com/docs/git-upload-pack",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-clone": {
      "title": "git-clone",
      "url": "https://git-scm.com/docs/git-clone",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-rev-list": {
      "title": "git-rev-list",
      "url": "https://git-scm.com/docs/git-rev-list",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-cat-file": {
      "title": "git-cat-file",
      "url": "https://git-scm.com/docs/git-cat-file",
      "description": "Официальное руководство Git."
    },
    "gitremote-partial-clone": {
      "title": "partial-clone",
      "url": "https://git-scm.com/docs/partial-clone",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-tag": {
      "title": "git-tag",
      "url": "https://git-scm.com/docs/git-tag",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-bundle": {
      "title": "git-bundle",
      "url": "https://git-scm.com/docs/git-bundle",
      "description": "Официальное руководство Git."
    },
    "gitremote-git-fsck": {
      "title": "git-fsck",
      "url": "https://git-scm.com/docs/git-fsck",
      "description": "Официальное руководство Git."
    }
  }
};
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,E=window.ATLAS_EDITORIAL;
Object.assign(D.sources,data.sources);
for(const row of data.rows){const {after,min,terms,steps,question,pass,junior,...chapter}=row;D.lessons.push({...chapter,course:"git",minutes:Math.ceil(chapter.body.split(/\s+/).length/110)+30});L.minimum[row.id]=min;const i=L.order.git.indexOf(after);if(i<0)throw Error("Missing Git prerequisite "+after);L.order.git.splice(i+1,0,row.id);E[row.id]={intro:row.summary,terms,diagram:{title:"Механизм",steps,kind:"flow",caption:"Логические связи и порядок операций."},questions:[question]};if(junior){L.junior[row.id]=junior;L.juniorTerms[row.id]=terms.slice(0,4);L.juniorDiagrams[row.id]={title:"Как это работает",steps,kind:"flow",caption:"Основные шаги."};L.juniorQuestions[row.id]=question;}}
})();
