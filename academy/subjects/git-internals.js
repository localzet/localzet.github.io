(function(){const data={
  "rows": [
    {
      "id": "git-object-bytes",
      "after": "git-objects",
      "min": 1,
      "title": "Объектная база: байты, OID и дерево снимка",
      "summary": "Воспроизводим хеш blob, исследуем loose object, режимы дерева и типы меток.",
      "body": "## Адресация по содержимому\n\nЛогический объект Git содержит тип и полезную нагрузку. OID вычисляется по ASCII-заголовку (тип, пробел, десятичный размер в байтах), нулевому байту NUL и самой нагрузке. Пять байт atlas без перевода строки отличаются от шести байт atlas с LF. Имя файла не входит в blob, поэтому одинаковое сохранённое содержимое можно использовать в нескольких деревьях. При добавлении Git может применять clean-фильтры и нормализацию конца строк; байты на диске не всегда совпадают с blob.\n\nLoose object хранится в zlib-сжатом виде вместе с заголовком. В обычной SHA-1 базе первые две hex-цифры OID образуют подкаталог objects, остальные — имя файла. SHA-256 использует 64 hex-символа вместо 40. Не фиксируйте длину идентификатора в универсальном скрипте и не путайте хеш несжатого объекта с контрольной суммой сжатого файла.\n\n## Снимок и граф\n\nTree хранит отсортированные записи режима, имени и бинарного OID. Режимы: 100644 обычный файл, 100755 исполняемый, 120000 символьная ссылка, 040000 поддерево, 160000 gitlink. Git не сохраняет полный chmod, владельца, время модификации или пустые каталоги как обычные элементы снимка. Commit содержит ссылку на корневое дерево, ноль или больше родителей, автора, коммитера и сообщение. Annotated tag — отдельный объект с целевым OID и метаданными; lightweight tag — лишь ref. Одинаковые деревья не гарантируют одинаковые коммиты.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.29 или новее и стандартные утилиты Linux. Сохраните блок в файл и запустите через bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт не использует сеть, создаёт новый временный каталог и удаляет только его при выходе.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\nprintf 'atlas\\n' > note.txt\noid=$(git hash-object -w --no-filters note.txt)\ntest \"$oid\" = \"$(printf 'blob 6\\000atlas\\n' | sha1sum | cut -d' ' -f1)\"\ntest \"$(git cat-file -t \"$oid\")\" = blob\ntest \"$(git cat-file -s \"$oid\")\" = 6\ngit cat-file -p \"$oid\"\ntest -f \".git/objects/${oid:0:2}/${oid:2}\"\ncp note.txt copy.txt\ngit add -- note.txt copy.txt\ngit commit -qm 'Store identical bytes'\ngit ls-tree HEAD\ntest \"$(git rev-parse HEAD:note.txt)\" = \"$(git rev-parse HEAD:copy.txt)\"\ntest \"$(git cat-file -t 'HEAD^{tree}')\" = tree\ngit tag -a v1 -m Release\ngit tag light\ntest \"$(git cat-file -t v1)\" = tag\ntest \"$(git cat-file -t light)\" = commit\ntest \"$(git rev-parse 'v1^{}')\" = \"$(git rev-parse HEAD)\"\necho 'PASS: object bytes and identity'\n~~~\n\n-w записывает объект, --no-filters хеширует исходные байты, -t сообщает тип, -s размер нагрузки, -p выводит содержимое. sha1sum вычисляет хеш последовательности, cut выбирает первое поле. ls-tree показывает режим, тип, OID и имя. REV:PATH разрешает путь внутри дерева, ^{tree} требует дерево, ^{} раскрывает аннотированную метку. Ожидается одинаковый OID обоих файлов и разные типы меток. Проверять файл в objects уместно только в созданной лаборатории; cat-file работает независимо от loose, pack или alternates. Хеш не доказывает личность автора: для этого нужны проверяемая подпись и политика доверия.\n\n## Самостоятельная работа\n\nИзмените букву, затем только имя файла и сравните OID. Создайте исполняемый файл и подкаталог, изучите git ls-tree -r HEAD. Повторите расчёт в отдельном репозитории git init --object-format=sha256 с sha256sum. Объясните, почему два коммита с одинаковым деревом могут иметь разные OID.",
      "terms": [
        [
          "OID",
          "Идентификатор объекта."
        ],
        [
          "Blob",
          "Байты содержимого."
        ],
        [
          "Tree",
          "Записи каталога."
        ],
        [
          "Loose object",
          "Отдельный сжатый объект."
        ],
        [
          "Annotated tag",
          "Самостоятельный объект метки."
        ]
      ],
      "steps": [
        [
          "Байты",
          "Содержимое"
        ],
        [
          "Заголовок",
          "Тип + размер + NUL"
        ],
        [
          "Хеш",
          "OID"
        ],
        [
          "Tree",
          "Имя → OID"
        ],
        [
          "Commit",
          "Ссылка на tree"
        ]
      ],
      "question": [
        "Могут ли два пути ссылаться на один blob?",
        "Да, имя хранится в tree."
      ],
      "sources": [
        "gitinternal-git-hash-object",
        "gitinternal-git-cat-file",
        "gitinternal-git-ls-tree",
        "gitinternal-git-tag",
        "gitinternal-git-rev-parse"
      ],
      "pass": "PASS: object bytes and identity"
    },
    {
      "id": "git-ref-model",
      "after": "git-object-bytes",
      "min": 1,
      "title": "HEAD, refs и атомарное перемещение ссылок",
      "summary": "Различаем symbolic ref, detached HEAD и проверку ожидаемого OID.",
      "body": "## Имена объектов не являются объектами\n\nRef — изменяемое имя, по которому Git находит объект. Ветки в refs/heads/ указывают на коммиты, refs/tags/ могут указывать на разные типы объектов, refs/remotes/ обычно представляют известное локально состояние удалённых веток. HEAD чаще всего символическая ссылка на текущую ветку. При detached HEAD он непосредственно указывает на коммит. Если HEAD указывает на ещё не созданную ветку, это unborn HEAD, а не повреждение базы. При новом коммите в обычной ветке меняется её ref, прежний объект не перезаписывается.\n\nПолное имя refs/heads/release снимает неоднозначность с refs/tags/release. Короткие имена удобны интерактивно, но в автоматизации явно указывайте пространство имён и проверяйте тип. git rev-parse --verify с ^{commit} проверяет разрешение выражения в коммит или метку, раскрываемую в коммит.\n\n## Согласованное обновление\n\nПри файловом backend Git использует блокировки и обновления refs; могут существовать loose refs и packed-refs. Возможны и другие backend, например reftable. Не редактируйте служебные файлы вручную. git update-ref может проверять ожидаемый старый OID перед обновлением. Это локальный аналог compare-and-swap: если другой процесс переместил ссылку, команда отклонит запись. Он не меняет рабочие файлы и индекс как switch, поэтому для обычной смены веток применяют высокоуровневые команды.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.29 или новее и стандартные утилиты Linux. Сохраните блок в файл и запустите через bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт не использует сеть, создаёт новый временный каталог и удаляет только его при выходе.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ntest \"$(git symbolic-ref HEAD)\" = refs/heads/main\nif git rev-parse --verify HEAD >/dev/null 2>&1; then exit 1; fi\necho first > note.txt\ngit add -- note.txt\ngit commit -qm First\nfirst=$(git rev-parse HEAD)\necho second > note.txt\ngit commit -qam Second\nsecond=$(git rev-parse HEAD)\ngit branch checkpoint \"$first\"\ngit update-ref -m 'Advance checkpoint' refs/heads/checkpoint \"$second\" \"$first\"\nif git update-ref refs/heads/checkpoint \"$first\" \"$first\" 2>/dev/null; then exit 1; fi\ntest \"$(git rev-parse refs/heads/checkpoint)\" = \"$second\"\ngit switch --detach \"$first\"\nif git symbolic-ref -q HEAD; then exit 1; fi\ntest \"$(git rev-parse HEAD)\" = \"$first\"\ngit switch main\ntest \"$(git symbolic-ref HEAD)\" = refs/heads/main\ngit for-each-ref --format='%(refname) %(objectname)' refs/heads\ngit pack-refs --all\ntest \"$(git rev-parse refs/heads/checkpoint)\" = \"$second\"\necho 'PASS: refs and guarded update'\n~~~\n\nsymbolic-ref читает символическую ссылку; -q подавляет диагностику detached HEAD, сохраняя ненулевой код возврата. update-ref получает имя, новый OID и ожидаемый старый OID; -m задаёт пояснение для reflog, если журнал ведётся. Обновляется не активная main, а checkpoint. Первая операция успешна, вторая с устаревшим ожиданием отклонена. pack-refs --all меняет хранение ссылок, не их смысл. for-each-ref --format выводит выбранные поля. Reflog записывает локальные перемещения поддерживаемых ссылок, но не является журналом удалённого сервера или резервной копией. Detached HEAD нормален для исследования; сохраните ценное изменение именованной веткой перед уходом.\n\n## Самостоятельная работа\n\nСоздайте тег и ветку с одинаковым коротким именем, сравните полные refs. Изучите start, prepare, commit у update-ref --stdin. Объясните, почему update-ref не заменяет git switch и почему условное обновление локального ref не блокирует удалённый сервер.",
      "terms": [
        [
          "Ref",
          "Именованная ссылка."
        ],
        [
          "Symref",
          "Ссылка на другое имя."
        ],
        [
          "Unborn HEAD",
          "Ветка ещё без коммита."
        ],
        [
          "Detached HEAD",
          "HEAD прямо на коммите."
        ],
        [
          "CAS",
          "Обновление при совпадении старого значения."
        ]
      ],
      "steps": [
        [
          "HEAD",
          "refs/heads/main"
        ],
        [
          "Ref",
          "Текущий OID"
        ],
        [
          "Проверка",
          "Ожидаемый OID"
        ],
        [
          "Запись",
          "Новый OID"
        ],
        [
          "Объект",
          "Старый не переписывается"
        ]
      ],
      "question": [
        "Почему второй update-ref отклонён?",
        "Ожидаемый OID уже устарел."
      ],
      "sources": [
        "gitinternal-git-symbolic-ref",
        "gitinternal-git-update-ref",
        "gitinternal-git-for-each-ref",
        "gitinternal-git-pack-refs",
        "gitinternal-gitrepository-layout",
        "gitinternal-git-switch"
      ],
      "pass": "PASS: refs and guarded update"
    },
    {
      "id": "git-index-format",
      "after": "git-history-reading",
      "min": 1,
      "title": "Индекс изнутри: записи, стадии и отдельный staging",
      "summary": "Читаем DIRC и формируем альтернативный снимок без изменения обычного индекса.",
      "body": "## Индекс — не каталог копий файлов\n\nИндекс хранит пути, режимы и OID, стадии и метаданные, помогающие быстро определить изменение файла. Stage 0 — обычная подготовленная запись; при неразрешённом конфликте возможны stage 1 (base), 2 и 3 (стороны). Не каждый конфликт содержит все три стадии. Индекс обычно представляет будущий снимок, но при конфликте его нельзя безусловно преобразовать в дерево. Метаданные stat ускоряют сравнение, не являются содержимым и не определяют OID.\n\nОбычный файл индекса имеет сигнатуру DIRC, номер версии, число записей, отсортированные записи, расширения и контрольный хеш. Версии 2, 3 и 4 различаются кодированием и флагами. Cache-tree позволяет повторно использовать вычисленные поддеревья; split index и sparse index меняют представление. Не пишите универсальный парсер по одному дампу. git ls-files --stage показывает логические записи независимо от бинарного варианта. Skip-worktree используется в том числе для sparse checkout; assume-unchanged — подсказка оптимизации. Ни один флаг не является универсальным способом игнорировать правки отслеживаемого файла.\n\n## Альтернативный индекс\n\nGIT_INDEX_FILE выбирает другой файл индекса. Это полезно при формировании отдельного снимка без изменения обычного staging. Объектная база остаётся общей, рабочее дерево тоже: некоторые команды могут его менять. Не экспортируйте переменную глобально, ограничивайте её действие конкретным вызовом.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.29 или новее и стандартные утилиты Linux. Сохраните блок в файл и запустите через bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт не использует сеть, создаёт новый временный каталог и удаляет только его при выходе.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\necho first > note.txt\ngit add -- note.txt\ngit commit -qm First\necho second > note.txt\ngit add -- note.txt\necho third > note.txt\ngit ls-files --stage\ntest \"$(git show :note.txt)\" = second\ntest \"$(cat note.txt)\" = third\nindex=$(git rev-parse --git-path index)\ntest \"$(head -c 4 \"$index\")\" = DIRC\nnormal_tree=$(git write-tree)\nalt=\"$lab/alternate-index\"\nGIT_INDEX_FILE=\"$alt\" git read-tree HEAD\nGIT_INDEX_FILE=\"$alt\" git add -- note.txt\nalt_tree=$(GIT_INDEX_FILE=\"$alt\" git write-tree)\ntest \"$(git show \"$alt_tree:note.txt\")\" = third\ntest \"$(git show \"$normal_tree:note.txt\")\" = second\ntest \"$(git write-tree)\" = \"$normal_tree\"\ntest \"$(git show :note.txt)\" = second\necho 'PASS: independent index snapshots'\n~~~\n\n--stage выводит режим, OID, номер стадии и путь. :PATH обозначает обычную запись, :1:PATH — конкретную конфликтную стадию, если она есть. rev-parse --git-path вычисляет путь с учётом структуры Git; head -c 4 читает четыре байта. read-tree HEAD заполняет альтернативный индекс деревом HEAD без -u, не меняя рабочие файлы. write-tree создаёт дерево, не коммит. Обычный индекс хранит second, альтернативный — third. Проверяйте git status и git diff --cached перед коммитом. Файл индекса содержит OID и метаданные, а не все байты объектов. Если скопировать только индекс без объектной базы, снимок может не восстановиться. В linked worktree путь к индексу может отличаться.\n\n## Самостоятельная работа\n\nИзучите git ls-files --debug, не парсите его человекочитаемый вывод как стабильный API. В альтернативном индексе добавьте и удалите пути, сравните деревья через git diff-tree -r. Прочитайте спецификацию DIRC и объясните, почему при конфликте нужно разрешить записи перед write-tree.",
      "terms": [
        [
          "DIRC",
          "Сигнатура индекса."
        ],
        [
          "Stage",
          "Номер стадии."
        ],
        [
          "Cache-tree",
          "Кеш поддеревьев."
        ],
        [
          "GIT_INDEX_FILE",
          "Путь альтернативного индекса."
        ],
        [
          "Stat cache",
          "Метаданные проверки."
        ]
      ],
      "steps": [
        [
          "HEAD",
          "first"
        ],
        [
          "Index",
          "second"
        ],
        [
          "Working tree",
          "third"
        ],
        [
          "Другой index",
          "third"
        ],
        [
          "write-tree",
          "Два разных дерева"
        ]
      ],
      "question": [
        "Меняет ли альтернативный index обычный staging?",
        "Нет, но база объектов и рабочее дерево общие."
      ],
      "sources": [
        "gitinternal-gitformat-index",
        "gitinternal-git-ls-files",
        "gitinternal-git-read-tree",
        "gitinternal-git-write-tree",
        "gitinternal-git-update-index",
        "gitinternal-git-rev-parse"
      ],
      "pass": "PASS: independent index snapshots"
    },
    {
      "id": "git-pack-storage",
      "after": "git-ref-model",
      "min": 2,
      "title": "Packfiles, delta compression и проверка объектной базы",
      "summary": "Измеряем хранение и проверяем неизменность OID после упаковки.",
      "body": "## Хранение не равно модели истории\n\nLoose-объекты удобны при частых мелких записях, но большое число файлов создаёт накладные расходы. Pack объединяет объекты в файл с заголовком PACK, версией, числом объектов и контрольной суммой в конце. Для части записей хранится сжатая полная нагрузка, для других — delta относительно базового объекта. OFS_DELTA определяет базу относительным смещением, REF_DELTA — OID. При чтении восстанавливаются исходные байты, логический OID сохраняется. Выбор базы — эвристика упаковщика; она не обязана соответствовать родителю коммита или истории одного пути.\n\nФайл .idx содержит структуры поиска OID, смещения и контрольные данные. Таблица fanout с 256 накопительными значениями по первому байту хеша сужает диапазон поиска. Multi-pack-index объединяет информацию о нескольких packs. Commit-graph и bitmap ускоряют некоторые обходы, но не заменяют объекты. Форматы зависят от версии, обращайтесь к спецификации.\n\n## Достижимость и очистка\n\nОбъект достижим, если до него можно пройти по связям от выбранных корней. В контексте проверки и retention могут учитываться refs, reflogs и индекс. Недостижимый объект не обязательно повреждён: он может быть результатом отменённой операции. fsck проверяет структуру и связность объектов, не бизнес-правильность изменения. Упаковка и удаление — разные действия. Не запускайте gc --prune=now в рабочем репозитории: немедленное удаление может конфликтовать с параллельной записью и уничтожить данные восстановления.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.29 или новее и стандартные утилиты Linux. Сохраните блок в файл и запустите через bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт не использует сеть, создаёт новый временный каталог и удаляет только его при выходе.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\nfor n in $(seq 1 12); do\n  awk 'BEGIN {for(i=0;i<500;i++) print \"atlas common line \" i}' > note.txt\n  echo \"revision $n\" >> note.txt\n  git add -- note.txt\n  git commit -qm \"Revision $n\"\ndone\noid=$(git rev-parse HEAD:note.txt)\ngit count-objects -v\ngit repack -ad\ngit count-objects -v\nset -- .git/objects/pack/*.idx\ntest -f \"$1\"\ngit verify-pack -v \"$1\" > \"$lab/pack-report\"\ngrep -F \"$oid \" \"$lab/pack-report\"\ntest \"$(git rev-parse HEAD:note.txt)\" = \"$oid\"\ntest \"$(git cat-file -p \"$oid\" | tail -n 1)\" = 'revision 12'\ngit fsck --full\necho 'PASS: packed object identity'\n~~~\n\ncount-objects -v показывает число loose и packed объектов и объёмы. repack -a переупаковывает объекты, -d удаляет избыточные packs; здесь это допустимо только в одноразовой лаборатории. verify-pack -v читает pack через idx, показывает тип, размеры, смещение, для delta — глубину и базу. Не привязывайте тест к наличию конкретной delta: алгоритм может выбрать иное представление. Ожидается тот же OID и те же байты после упаковки, fsck без ошибок. Сравнивать размер только по числу объектов нельзя: учитывайте размеры pack и index, ФС и сжатие. При эксплуатации измеряйте время чтения, CPU и размер хранилища.\n\n## Самостоятельная работа\n\nПовторите для случайных байтов и похожих текстовых версий, сравните время упаковки и размеры. Создайте недостижимый blob через hash-object -w и изучите fsck --unreachable в одноразовой лаборатории. Найдите описание fanout и delta в gitformat-pack; объясните различия SHA-256 и SHA-1 pack.",
      "terms": [
        [
          "Pack",
          "Контейнер объектов."
        ],
        [
          "Delta",
          "Восстановление от базы."
        ],
        [
          "Pack index",
          "Поиск OID и смещения."
        ],
        [
          "Fanout",
          "Таблица диапазонов."
        ],
        [
          "Reachability",
          "Достижимость от корней."
        ]
      ],
      "steps": [
        [
          "Loose",
          "Отдельные файлы"
        ],
        [
          "Repack",
          "Компрессия и delta"
        ],
        [
          "Pack + idx",
          "Хранение"
        ],
        [
          "Чтение",
          "Восстановление"
        ],
        [
          "OID",
          "Логическая идентичность"
        ]
      ],
      "question": [
        "Обязана ли delta ссылаться на родительский коммит?",
        "Нет, упаковщик выбирает базу независимо от родословной."
      ],
      "sources": [
        "gitinternal-gitformat-pack",
        "gitinternal-git-repack",
        "gitinternal-git-count-objects",
        "gitinternal-git-verify-pack",
        "gitinternal-git-fsck",
        "gitinternal-git-gc"
      ],
      "pass": "PASS: packed object identity"
    },
    {
      "id": "git-plumbing-commit",
      "after": "git-index-format",
      "min": 2,
      "title": "Plumbing: создаём коммит вручную из объектов",
      "summary": "Собираем blob, index, tree, commit и ref без git add и git commit.",
      "body": "## Из каких операций складывается коммит\n\nPorcelain — команды повседневной работы, plumbing — низкоуровневые операции чтения и записи структур. git commit делает больше, чем записывает объект: учитывает выбранный индекс, сообщение, автора, hooks и состояние репозитория, обновляет ссылку и выполняет другие действия согласно режиму. Нельзя заменить его произвольным набором plumbing-команд без учёта проверок. Но для понимания графа полезно построить минимальный снимок вручную.\n\nhash-object -w записывает blob. update-index --cacheinfo помещает в индекс готовый режим, OID и путь без чтения соответствующего рабочего файла. write-tree преобразует индекс в дерево. commit-tree получает дерево, родителей и сообщение, печатает OID созданного коммита. Он не перемещает текущую ветку. update-ref публикует новый OID под именем в локальном пространстве refs. Пока нет имени или другой связи достижимости, объект может быть недостижимым.\n\n## Границы атомарности\n\nПубликация ссылки после записи необходимых объектов — важный порядок. Условное обновление старого OID защищает ссылку от потерянного обновления, но не делает весь shell-сценарий транзакцией над рабочим деревом. Если запись объектов завершилась, а update-ref не удался, объекты могут остаться без имени. Не удаляйте их напрямую. Для нескольких ссылок изучайте транзакции update-ref --stdin; они не заменяют координацию с другими процессами и не синхронизируют рабочие файлы.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.29 или новее и стандартные утилиты Linux. Сохраните блок в файл и запустите через bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт не использует сеть, создаёт новый временный каталог и удаляет только его при выходе.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\nprintf 'first\\n' > note.txt\nblob=$(git hash-object -w --no-filters note.txt)\ngit update-index --add --cacheinfo \"100644,$blob,note.txt\"\ntree=$(git write-tree)\nfirst=$(git commit-tree \"$tree\" -m First)\ntest \"$(git cat-file -t \"$first\")\" = commit\nif git rev-parse --verify HEAD >/dev/null 2>&1; then exit 1; fi\ngit update-ref refs/heads/main \"$first\" ''\ntest \"$(git rev-parse HEAD)\" = \"$first\"\nprintf 'second\\n' > note.txt\nblob=$(git hash-object -w --no-filters note.txt)\ngit update-index --cacheinfo \"100644,$blob,note.txt\"\ntree=$(git write-tree)\nsecond=$(git commit-tree \"$tree\" -p \"$first\" -m Second)\ngit update-ref refs/heads/main \"$second\" \"$first\"\ntest \"$(git rev-parse HEAD^)\" = \"$first\"\ntest \"$(git show HEAD:note.txt)\" = second\ntest -z \"$(git status --porcelain)\"\ngit log --oneline --graph\ngit fsck --full\necho 'PASS: commit assembled with plumbing'\n~~~\n\n--add разрешает добавить новый путь, --cacheinfo принимает режим, OID и путь. commit-tree -p задаёт родителя (корневой коммит без него), -m сообщение. Пустой третий аргумент update-ref требует отсутствия ссылки. Для второго коммита проверяется первый OID. Рабочий файл заранее записан теми же байтами, поэтому после публикации статус чистый. В общем случае update-ref не синхронизирует рабочую копию. Первый commit-tree создал объект, но HEAD остался unborn; после update-ref история доступна по HEAD. fsck --full проверяет целостность, не подписи и тесты проекта. В обычной работе используйте porcelain, не обходите hooks и правила команды.\n\n## Самостоятельная работа\n\nСформируйте два коммита с одним деревом и разными сообщениями, сравните OID. В отдельной ветке создайте коммит с двумя -p и прочитайте через cat-file -p. Найдите описание переменных автора и коммитера в руководстве commit-tree. Объясните, какие проверки porcelain не следует обходить.",
      "terms": [
        [
          "Plumbing",
          "Низкоуровневые операции."
        ],
        [
          "Porcelain",
          "Пользовательские команды."
        ],
        [
          "commit-tree",
          "Запись коммита."
        ],
        [
          "Parent",
          "Родительская связь."
        ],
        [
          "Publication",
          "Обновление ref."
        ]
      ],
      "steps": [
        [
          "hash-object",
          "Blob"
        ],
        [
          "update-index",
          "Путь → blob"
        ],
        [
          "write-tree",
          "Tree"
        ],
        [
          "commit-tree",
          "Commit"
        ],
        [
          "update-ref",
          "Имя → commit"
        ]
      ],
      "question": [
        "Почему commit-tree не изменил HEAD?",
        "Он записывает объект; имя меняет отдельная операция."
      ],
      "sources": [
        "gitinternal-git-hash-object",
        "gitinternal-git-update-index",
        "gitinternal-git-write-tree",
        "gitinternal-git-commit-tree",
        "gitinternal-git-update-ref"
      ],
      "pass": "PASS: commit assembled with plumbing"
    }
  ],
  "sources": {
    "gitinternal-git-hash-object": {
      "title": "git-hash-object",
      "url": "https://git-scm.com/docs/git-hash-object",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-cat-file": {
      "title": "git-cat-file",
      "url": "https://git-scm.com/docs/git-cat-file",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-ls-tree": {
      "title": "git-ls-tree",
      "url": "https://git-scm.com/docs/git-ls-tree",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-tag": {
      "title": "git-tag",
      "url": "https://git-scm.com/docs/git-tag",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-rev-parse": {
      "title": "git-rev-parse",
      "url": "https://git-scm.com/docs/git-rev-parse",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-symbolic-ref": {
      "title": "git-symbolic-ref",
      "url": "https://git-scm.com/docs/git-symbolic-ref",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-update-ref": {
      "title": "git-update-ref",
      "url": "https://git-scm.com/docs/git-update-ref",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-for-each-ref": {
      "title": "git-for-each-ref",
      "url": "https://git-scm.com/docs/git-for-each-ref",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-pack-refs": {
      "title": "git-pack-refs",
      "url": "https://git-scm.com/docs/git-pack-refs",
      "description": "Официальное руководство Git."
    },
    "gitinternal-gitrepository-layout": {
      "title": "gitrepository-layout",
      "url": "https://git-scm.com/docs/gitrepository-layout",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-switch": {
      "title": "git-switch",
      "url": "https://git-scm.com/docs/git-switch",
      "description": "Официальное руководство Git."
    },
    "gitinternal-gitformat-index": {
      "title": "gitformat-index",
      "url": "https://git-scm.com/docs/gitformat-index",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-ls-files": {
      "title": "git-ls-files",
      "url": "https://git-scm.com/docs/git-ls-files",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-read-tree": {
      "title": "git-read-tree",
      "url": "https://git-scm.com/docs/git-read-tree",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-write-tree": {
      "title": "git-write-tree",
      "url": "https://git-scm.com/docs/git-write-tree",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-update-index": {
      "title": "git-update-index",
      "url": "https://git-scm.com/docs/git-update-index",
      "description": "Официальное руководство Git."
    },
    "gitinternal-gitformat-pack": {
      "title": "gitformat-pack",
      "url": "https://git-scm.com/docs/gitformat-pack",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-repack": {
      "title": "git-repack",
      "url": "https://git-scm.com/docs/git-repack",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-count-objects": {
      "title": "git-count-objects",
      "url": "https://git-scm.com/docs/git-count-objects",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-verify-pack": {
      "title": "git-verify-pack",
      "url": "https://git-scm.com/docs/git-verify-pack",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-fsck": {
      "title": "git-fsck",
      "url": "https://git-scm.com/docs/git-fsck",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-gc": {
      "title": "git-gc",
      "url": "https://git-scm.com/docs/git-gc",
      "description": "Официальное руководство Git."
    },
    "gitinternal-git-commit-tree": {
      "title": "git-commit-tree",
      "url": "https://git-scm.com/docs/git-commit-tree",
      "description": "Официальное руководство Git."
    }
  }
};
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,E=window.ATLAS_EDITORIAL;
Object.assign(D.sources,data.sources);
for(const row of data.rows){const {after,min,terms,steps,question,pass,...chapter}=row;D.lessons.push({...chapter,course:"git",minutes:Math.ceil(chapter.body.split(/\s+/).length/110)+30});L.minimum[row.id]=min;const i=L.order.git.indexOf(after);if(i<0)throw Error("Missing Git prerequisite "+after);L.order.git.splice(i+1,0,row.id);E[row.id]={intro:row.summary,terms,diagram:{title:"Механизм",steps,kind:"flow",caption:"Логические связи между структурами."},questions:[question]};}
})();
