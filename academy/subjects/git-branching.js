(function(){const data={
  "rows": [
    {
      "id": "git-branch-lab",
      "after": "git-undo",
      "min": 0,
      "title": "Ветки и граф: switch, branch и merge-base",
      "summary": "Создаём две линии разработки, ищем общего предка и проверяем границы удаления ветки.",
      "body": "## Ветка — изменяемое имя вершины графа\n\nСоздание ветки не копирует файлы и историю. Новая refs/heads/feature указывает на существующий коммит. Когда HEAD символически связан с feature и создаётся коммит, перемещается только эта ветка. При switch меняются HEAD, индекс и рабочие файлы, чтобы представить выбранное состояние. Незакоммиченные изменения, если их можно сохранить, могут перейти вместе с рабочим деревом; если переключение уничтожило бы изменения, Git обычно отказывается. Не считайте switch механизмом сохранения работы.\n\nДостижимость определяется родительскими связями. Если A достижим из B, то A — предок B (коммит считается собственным предком для проверки is-ancestor). merge-base ищет лучшие общие предки: при сложной истории их может быть несколько. У общего предка не обязательно самое раннее время. Даты и порядок строк log не определяют родословную.\n\n## Удаление имени и сохранность объектов\n\nbranch -d проверяет интеграцию в upstream либо HEAD, когда upstream не настроен. -D обходит проверку и может сделать работу недостижимой от обычных refs; наличие reflog или другого имени не гарантировано. Проверяйте не только статус, но и историю, которую удаляете. Не путайте локальную ветку, remote-tracking ref и ветку на сервере.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и запустите bash вне переопределённого Git-контекста (GIT_DIR, GIT_INDEX_FILE и подобные переменные). Скрипт создаёт временный каталог, не использует сеть и удаляет только созданный каталог при выходе. Начальный коммит Base общий для линий опыта.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit switch -c feature\necho feature > feature.txt\ngit add -- feature.txt\ngit commit -qm Feature\nfeature=$(git rev-parse HEAD)\ngit switch main\necho main > main.txt\ngit add -- main.txt\ngit commit -qm Main\nmain=$(git rev-parse HEAD)\ntest \"$(git merge-base main feature)\" = \"$base\"\ngit merge-base --is-ancestor \"$base\" main\nif git merge-base --is-ancestor feature main; then exit 1; fi\nif git branch -d feature 2>/dev/null; then exit 1; fi\ntest \"$(git rev-parse feature)\" = \"$feature\"\ntest \"$(git rev-parse main)\" = \"$main\"\ngit log --graph --oneline --all --decorate\ngit branch --no-merged main\necho 'PASS: branch graph and safe deletion'\n~~~\n\nswitch -c создаёт ветку и переключает на неё, branch без switch только меняет имена. merge-base --is-ancestor возвращает 0 при достижимости, 1 при её отсутствии, другие ошибки требуют отдельной обработки. --no-merged main показывает ветки, чьи вершины не достижимы из main. Здесь feature не интегрирована и безопасное удаление отклоняется. log --graph рисует граф, --all включает refs, --decorate показывает имена. В автоматизации используйте OID и коды возврата, а не расположение линий. Перед изменением ветки проверьте git status и git branch -vv; upstream не обязательно совпадает с ожидаемой целью слияния.\n\n## Самостоятельная работа\n\nСоздайте ветку checkpoint от base и сравните с main. Найдите общий предок feature и main, затем предскажите результат --is-ancestor в обоих направлениях. Выполните git branch --merged main и объясните, почему удаление ветки не удаляет объект немедленно.",
      "terms": [
        [
          "Branch",
          "Изменяемое имя коммита."
        ],
        [
          "DAG",
          "Граф родительских связей."
        ],
        [
          "Ancestor",
          "Достижимый предок."
        ],
        [
          "Merge base",
          "Лучший общий предок."
        ],
        [
          "Upstream",
          "Настроенная связь отслеживания."
        ]
      ],
      "steps": [
        [
          "Base",
          "Общая вершина"
        ],
        [
          "feature",
          "Новый коммит"
        ],
        [
          "main",
          "Другой коммит"
        ],
        [
          "merge-base",
          "Общий предок"
        ],
        [
          "branch -d",
          "Проверка интеграции"
        ]
      ],
      "question": [
        "Копирует ли branch весь проект?",
        "Нет, создаёт ссылку на существующий коммит."
      ],
      "sources": [
        "gitbranch-git-branch",
        "gitbranch-git-switch",
        "gitbranch-git-merge-base",
        "gitbranch-git-log"
      ],
      "pass": "PASS: branch graph and safe deletion",
      "junior": {
        "title": "Как работать с ветками без копирования проекта",
        "body": "## Зачем нужны ветки\n\nВы разрабатываете новую функцию, но основная версия проекта должна продолжать работать. Ветка — имя, которое указывает на сохранённый коммит. Можно начать работу с той же истории и сохранять изменения отдельно, не создавая копию всего каталога. Основная ветка часто называется main, но имя выбирает команда.\n\n## Практика\n\nВ новом каталоге вне существующего проекта выполните:\n\n~~~sh\nmkdir atlas-branches\ncd atlas-branches\ngit init -b main\ngit config user.name Student\ngit config user.email student@example.invalid\necho base > base.txt\ngit add base.txt\ngit commit -m Base\ngit switch -c feature\necho feature > feature.txt\ngit add feature.txt\ngit commit -m Feature\ngit switch main\ngit log --oneline --graph --all\n~~~\n\nswitch -c создаёт ветку и делает её текущей. После коммита и возврата на main файл feature.txt исчезнет из рабочей папки: его снимок хранится в feature. Переключитесь обратно командой git switch feature — файл появится снова. Перед сменой ветки проверяйте git status: не все незакоммиченные изменения можно перенести безопасно.\n\n## Проверка\n\nВыполните git branch: звёздочка показывает активную ветку. Попробуйте git switch main и git branch -d feature. Git должен отказаться удалить ещё не объединённую ветку. Не заменяйте -d на -D ради обхода предупреждения. Объясните, почему сохранение файла в ветке feature не меняет коммит main."
      }
    },
    {
      "id": "git-merge-lab",
      "after": "git-merge",
      "min": 0,
      "title": "Слияние веток: fast-forward, merge commit и squash",
      "summary": "Сравниваем три способа интеграции на одинаковых исходных снимках.",
      "body": "## Три способа интеграции\n\nFast-forward возможен, когда текущая вершина является предком другой: достаточно передвинуть ref. --ff-only запрещает интеграцию при расхождении истории. --no-ff создаёт merge commit даже если возможен fast-forward. Обычное слияние расходящихся веток строит результат на основе общего предка и двух сторон. Merge commit содержит ссылки на обоих родителей. Его дерево не обязано быть простой суммой патчей — результат может включать ручное разрешение конфликтов.\n\n--squash подготавливает суммарное состояние как обычный снимок, не записывая MERGE_HEAD. Последующий commit имеет одного родителя; исходная ветка не становится его предком только благодаря совпадению содержимого. Это меняет возможность последующего слияния, анализа истории и безопасного удаления ветки.\n\n## Выбор алгоритма\n\nСтратегия ort при слиянии двух вершин учитывает переименования и может строить синтетическую базу при нескольких общих предках. Стратегия -s ours оставляет дерево текущей стороны, хотя записывает родословную другой. Опция -X ours у соответствующей стратегии предпочитает текущую сторону в конфликтных фрагментах, но сохраняет неконфликтные изменения другой. Это разные действия; ни одно не гарантирует правильную бизнес-логику. Не выбирайте стратегию ради исчезновения конфликтов.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и запустите bash вне переопределённого Git-контекста (GIT_DIR, GIT_INDEX_FILE и подобные переменные). Скрипт создаёт временный каталог, не использует сеть и удаляет только созданный каталог при выходе. Начальный коммит Base общий для линий опыта.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit switch -c feature\necho feature > feature.txt\ngit add -- feature.txt\ngit commit -qm Feature\ntopic=$(git rev-parse HEAD)\ngit switch -c ff \"$base\"\ngit merge --ff-only feature\ntest \"$(git rev-parse HEAD)\" = \"$topic\"\ngit switch -c integrated \"$base\"\ngit merge --no-ff --no-edit feature\ntest \"$(git rev-parse HEAD^1)\" = \"$base\"\ntest \"$(git rev-parse HEAD^2)\" = \"$topic\"\nmerge_tree=$(git rev-parse 'HEAD^{tree}')\ngit switch -c squashed \"$base\"\ngit merge --squash feature\ntest -z \"$(git ls-files -u)\"\ntest \"$(git rev-parse HEAD)\" = \"$base\"\ngit commit -qm Squashed\ntest \"$(git rev-parse 'HEAD^{tree}')\" = \"$merge_tree\"\nif git rev-parse --verify HEAD^2 >/dev/null 2>&1; then exit 1; fi\nif git merge-base --is-ancestor feature HEAD; then exit 1; fi\ngit switch main\necho main > main.txt\ngit add -- main.txt\ngit commit -qm Main\nif git merge --ff-only feature 2>/dev/null; then exit 1; fi\ngit merge --no-edit feature\ntest -f main.txt && test -f feature.txt\ntest \"$(git rev-parse HEAD^2)\" = \"$topic\"\ngit log --graph --oneline --all\necho 'PASS: merge topology and squash'\n~~~\n\n--no-edit принимает автоматически сформированное сообщение; --ff-only не создаёт merge commit. Одинаковое дерево интеграции получается у integrated и squashed, но родословные различаются. HEAD^1 и HEAD^2 — первый и второй родители; HEAD^{tree} — дерево. merge-base --is-ancestor отличает интеграцию истории от совпадения файлов. Последняя ветка main реально расходится с feature и объединяет независимые пути. После любого merge запускайте тесты: отсутствие текстового конфликта не означает совместимости API или схем БД.\n\n## Самостоятельная работа\n\nДобавьте независимое изменение на обеих ветках, сравните git diff HEAD^1 HEAD и git diff HEAD^2 HEAD после merge. В отдельной лаборатории сравните -s ours и -X ours при конфликте и неконфликтной правке. Объясните, почему squash не делает feature предком целевой ветки.",
      "terms": [
        [
          "Fast-forward",
          "Перемещение ссылки без нового коммита."
        ],
        [
          "Merge commit",
          "Коммит с несколькими родителями."
        ],
        [
          "Squash",
          "Суммарное изменение без родительской связи."
        ],
        [
          "ort",
          "Стратегия трёхстороннего слияния."
        ],
        [
          "MERGE_HEAD",
          "Другая вершина незавершённого merge."
        ]
      ],
      "steps": [
        [
          "Base",
          "Общий предок"
        ],
        [
          "Две стороны",
          "Отдельные вершины"
        ],
        [
          "Merge",
          "Объединение"
        ],
        [
          "Tree",
          "Итоговый снимок"
        ],
        [
          "Parents",
          "История интеграции"
        ]
      ],
      "question": [
        "Одинаковые деревья гарантируют одинаковую историю?",
        "Нет, родительские связи могут отличаться."
      ],
      "sources": [
        "gitbranch-git-merge",
        "gitbranch-git-merge-base",
        "gitbranch-git-rev-parse",
        "gitbranch-git-log"
      ],
      "pass": "PASS: merge topology and squash",
      "junior": {
        "title": "Объединяем изменения из другой ветки",
        "body": "## Что происходит при merge\n\nВетка feature содержит новую функцию, а main — основную версию. Слияние позволяет добавить работу feature в main. Если main не менялась после создания feature, Git часто просто передвигает main вперёд. Это fast-forward. Если обе линии развивались отдельно, Git пытается объединить их изменения и может создать новый коммит с двумя родителями.\n\n## Практика\n\nВ новом учебном каталоге создайте репозиторий и настройте имя и email.\n\n~~~sh\ngit init -b main\ngit config user.name Student\ngit config user.email student@example.invalid\necho base > base.txt\ngit add base.txt\ngit commit -m Base\ngit switch -c feature\necho feature > feature.txt\ngit add feature.txt\ngit commit -m Feature\ngit switch main\necho main > main.txt\ngit add main.txt\ngit commit -m Main\ngit merge --no-edit feature\ngit log --graph --oneline --all\n~~~\n\nВ итоговом каталоге должны быть base.txt, main.txt и feature.txt. --no-edit принимает предложенное сообщение слияния. Если возник конфликт, не удаляйте файлы вслепую: Git показывает состояние через git status. В данном примере изменения независимы и конфликт не ожидается.\n\n## Проверка\n\nЗапустите git status и прочитайте граф. Объясните, почему feature не изменилась при merge в main. После проверки результата можно удалить локальное имя git branch -d feature. Сохранённые коммиты останутся достижимыми из main."
      }
    },
    {
      "id": "git-conflict-index-lab",
      "after": "git-conflicts",
      "min": 1,
      "title": "Конфликты изнутри: три стадии, diff3 и отмена",
      "summary": "Читаем base/ours/theirs из индекса, разрешаем конфликт и проверяем отмену слияния.",
      "body": "## Трёхсторонняя модель\n\nПри изменении пути в обеих ветках Git сравнивает общую базу, текущую сторону и другую сторону. Если автоматический результат неоднозначен, обычная stage 0 запись индекса заменяется конфликтными стадиями: 1 — база, 2 — ours, 3 — theirs. При add/add, удалениях и переименованиях набор записей может отличаться. Маркеры в рабочем файле — представление проблемы для человека, а не единственный источник истины. git ls-files -u показывает неразрешённые записи.\n\nВ merge ours — текущая сторона, theirs — присоединяемая. При rebase сторона ours обычно уже перенесённая история поверх новой базы, theirs — переносимый коммит. Не применяйте эти слова как «мой» и «чужой» без контекста операции.\n\n## Как выбрать решение\n\nmerge.conflictStyle=diff3 добавляет исходную базу между сторонами; zdiff3 может уменьшать повторения. Сначала прочитайте смысл изменения, затем сформируйте правильный итоговый файл и запустите тест. git add отмечает выбранный результат, заменяя конфликтные стадии stage 0. Отсутствие маркеров не доказывает, что индекс разрешён. git diff --check помогает обнаружить некоторые пробельные проблемы и маркеры, но не проверяет поведение программы.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и запустите bash вне переопределённого Git-контекста (GIT_DIR, GIT_INDEX_FILE и подобные переменные). Скрипт создаёт временный каталог, не использует сеть и удаляет только созданный каталог при выходе. Начальный коммит Base общий для линий опыта.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit config merge.conflictStyle diff3\ngit switch -c feature\necho theirs > base.txt\ngit commit -qam Theirs\ngit switch main\necho ours > base.txt\ngit commit -qam Ours\nours=$(git rev-parse HEAD)\nif git merge --no-edit feature; then exit 1; fi\ntest \"$(git show :1:base.txt)\" = base\ntest \"$(git show :2:base.txt)\" = ours\ntest \"$(git show :3:base.txt)\" = theirs\ngit ls-files -u\ngrep -F '|||||||' base.txt\ngit merge --abort\ntest \"$(git rev-parse HEAD)\" = \"$ours\"\ntest \"$(cat base.txt)\" = ours\ntest -z \"$(git status --porcelain)\"\nif git merge --no-edit feature; then exit 1; fi\nprintf 'combined\\n' > base.txt\ngit add -- base.txt\ntest -z \"$(git ls-files -u)\"\ngit diff --cached --check\ngit commit -qm 'Resolve semantic conflict'\ntest \"$(git show HEAD:base.txt)\" = combined\ntest \"$(git rev-parse HEAD^2)\" = \"$(git rev-parse feature)\"\necho 'PASS: conflict stages and abort'\n~~~\n\ngit show :N:PATH читает конкретную стадию, ls-files -u выводит конфликтные записи. grep проверяет разделитель базы в diff3. --abort отменяет незавершённое слияние; чистое исходное состояние позволяет проверить восстановление. В реальном проекте сохраните незакоммиченные изменения до merge, иначе abort может не восстановить их точно. После второго merge сознательно выбирается combined, а не одна из сторон. git commit завершает merge с двумя родителями. Для rebase используется rebase --continue, для cherry-pick — cherry-pick --continue; сначала выясните тип операции по git status.\n\n## Самостоятельная работа\n\nСоздайте конфликт add/add и сравните ls-files -u с опытом. Проверьте, какие стадии отсутствуют. Повторите с удалением файла на одной стороне; опишите решение через git rm или git add и проверку индекса.",
      "terms": [
        [
          "Stage 1",
          "Общая база."
        ],
        [
          "Stage 2",
          "Сторона ours."
        ],
        [
          "Stage 3",
          "Сторона theirs."
        ],
        [
          "diff3",
          "Маркеры с отображением базы."
        ],
        [
          "Unmerged",
          "Неразрешённая запись индекса."
        ]
      ],
      "steps": [
        [
          "Base",
          "Общие байты"
        ],
        [
          "Ours",
          "Текущая сторона"
        ],
        [
          "Theirs",
          "Другая сторона"
        ],
        [
          "Индекс",
          "Стадии 1–3"
        ],
        [
          "git add",
          "Результат stage 0"
        ]
      ],
      "question": [
        "Достаточно ли удалить маркеры?",
        "Нет, нужно выбрать смысл, обновить индекс и проверить результат."
      ],
      "sources": [
        "gitbranch-git-merge",
        "gitbranch-git-ls-files",
        "gitbranch-git-show",
        "gitbranch-git-config",
        "gitbranch-git-diff"
      ],
      "pass": "PASS: conflict stages and abort"
    },
    {
      "id": "git-rebase-lab",
      "after": "git-conflict-index-lab",
      "min": 1,
      "title": "Rebase: новая база, --onto и проверка родословной",
      "summary": "Переносим коммиты поверх другой истории и отделяем нужный диапазон.",
      "body": "## Перенос изменений, а не перемещение старых объектов\n\nRebase выбирает коммиты для воспроизведения на другой базе. Обычно создаётся новый commit с новым родителем; OID зависит от дерева, родителей и метаданных. В частном случае Git может ничего не переносить или сохранить существующие коммиты, если база не изменилась. Уже применённые эквивалентные изменения могут быть пропущены по правилам rebase. Количество новых объектов не обязательно равно числу исходных коммитов.\n\ngit rebase upstream обычно переносит текущую ветку поверх upstream. git rebase --onto NEW OLD BRANCH выбирает диапазон коммитов ветки относительно OLD и воспроизводит на NEW. Это позволяет отделить зависимую тему от другой ветки. Проверяйте набор до операции через git log OLD..BRANCH; точный выбор также зависит от опций и истории.\n\n## Безопасность переписывания\n\nНе переписывайте общую публичную историю без согласованного процесса. Создайте временную ветку на старой вершине, убедитесь в чистом рабочем дереве и проверьте результат тестами и графом. При конфликте разрешите файл, добавьте результат и выполните rebase --continue. --abort возвращает исходное положение попытки, --skip пропускает текущий патч и может потерять нужное изменение. --rebase-merges пытается воссоздать структуру слияний, а не сохранить исходные merge-коммиты.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и запустите bash вне переопределённого Git-контекста (GIT_DIR, GIT_INDEX_FILE и подобные переменные). Скрипт создаёт временный каталог, не использует сеть и удаляет только созданный каталог при выходе. Начальный коммит Base общий для линий опыта.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit switch -c dependency\necho dependency > dependency.txt\ngit add -- dependency.txt\ngit commit -qm Dependency\ngit switch -c topic\necho topic > topic.txt\ngit add -- topic.txt\ngit commit -qm Topic\nold=$(git rev-parse HEAD)\ngit branch before-rebase\ngit switch main\necho main > main.txt\ngit add -- main.txt\ngit commit -qm Main\nmain=$(git rev-parse HEAD)\ngit rebase --onto main dependency topic\ntest \"$(git rev-parse HEAD^)\" = \"$main\"\ntest \"$(git rev-parse HEAD)\" != \"$old\"\ntest -f topic.txt && test -f main.txt\ntest ! -e dependency.txt\ntest \"$(git rev-parse before-rebase)\" = \"$old\"\ngit range-diff dependency..before-rebase main..topic\ngit switch -c ordinary \"$old\"\ngit rebase main\ntest -f dependency.txt && test -f topic.txt\ntest \"$(git rev-list --count main..ordinary)\" = 2\ngit log --graph --oneline --all\necho 'PASS: rebase onto and ancestry'\n~~~\n\n--onto отделяет новую базу от границы выбора. В первом переносе topic оказывается над main, dependency.txt отсутствует: соответствующий коммит исключён. В обычном rebase main переносится и Dependency, и Topic. range-diff сравнивает серии патчей и помогает заметить смысловые изменения; он не заменяет тесты и проверку дерева. rev-list --count считает достижимые коммиты диапазона. before-rebase показывает, что старый объект не переписан на месте. Не удаляйте резервное имя до проверки. В конфликте rebase изучите конкретную стадию и переносимый патч, а не бытовой смысл ours/theirs.\n\n## Самостоятельная работа\n\nСоздайте два коммита с конфликтом на новой базе. В одном опыте выполните rebase --abort, во втором разрешите конфликт и rebase --continue с подходящим редактором. Сравните range-diff и тесты. Объясните, когда --onto удаляет ненужную зависимость, но не гарантирует компилируемость.",
      "terms": [
        [
          "Upstream",
          "Граница выбора истории."
        ],
        [
          "Onto",
          "Новая база переноса."
        ],
        [
          "Replay",
          "Воспроизведение изменения."
        ],
        [
          "Range-diff",
          "Сравнение серий патчей."
        ],
        [
          "Rebase merges",
          "Воссоздание структуры merge."
        ]
      ],
      "steps": [
        [
          "OLD",
          "Граница"
        ],
        [
          "Topic",
          "Выбранный патч"
        ],
        [
          "NEW",
          "Новая база"
        ],
        [
          "Replay",
          "Новый коммит"
        ],
        [
          "Проверка",
          "Граф и тесты"
        ]
      ],
      "question": [
        "Меняется ли старый commit при rebase?",
        "Нет, могут создаваться новые объекты и перемещаться ref."
      ],
      "sources": [
        "gitbranch-git-rebase",
        "gitbranch-git-range-diff",
        "gitbranch-git-rev-list",
        "gitbranch-git-log"
      ],
      "pass": "PASS: rebase onto and ancestry"
    },
    {
      "id": "git-interactive-rebase",
      "after": "git-rebase-lab",
      "min": 1,
      "title": "Интерактивный rebase: fixup, squash и порядок патчей",
      "summary": "Редактируем серию коммитов, проверяем autosquash и неизменность итогового дерева.",
      "body": "## Todo — программа переписывания истории\n\nИнтерактивный rebase представляет выбранные коммиты в порядке воспроизведения. pick применяет коммит, reword меняет сообщение, edit останавливает для правки, squash объединяет с предыдущим и предлагает отредактировать сообщение, fixup обычно отбрасывает сообщение присоединяемого коммита, drop исключает патч. exec запускает shell-команду и при ошибке может остановить операцию. Изменение порядка способно вызвать конфликты или изменить поведение: патчи имеют зависимости.\n\nДля локальной серии правок полезен git commit --fixup TARGET. Он создаёт отдельный коммит с маркером в сообщении, а rebase -i --autosquash помещает его рядом с целевым коммитом и меняет действие. Не смешивайте механическую чистку истории и изменение функциональности без проверки. --autosquash не гарантирует успешное слияние правок, особенно если они затрагивают общие строки.\n\n## Проверяем сохранность результата\n\nДо переписывания сохраните имя исходной вершины и снимок дерева. После сравните дерево, сообщения, число коммитов и range-diff. Равенство дерева подтверждает одинаковый итоговый снимок, но не качество промежуточных состояний, подписей, авторства или сообщений. Если команда требует, чтобы каждый коммит собирался, запускайте тест на каждом шаге через --exec или отдельную проверку истории.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и запустите bash вне переопределённого Git-контекста (GIT_DIR, GIT_INDEX_FILE и подобные переменные). Скрипт создаёт временный каталог, не использует сеть и удаляет только созданный каталог при выходе. Начальный коммит Base общий для линий опыта.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\necho 'feature v1' > feature.txt\ngit add -- feature.txt\ngit commit -qm 'Add feature'\ntarget=$(git rev-parse HEAD)\necho docs > docs.txt\ngit add -- docs.txt\ngit commit -qm 'Add docs'\necho 'feature v2' > feature.txt\ngit add -- feature.txt\ngit commit -q --fixup=\"$target\"\ngit branch before-edit\ntree=$(git rev-parse 'HEAD^{tree}')\nGIT_SEQUENCE_EDITOR=: git rebase -i --autosquash \"$base\"\ntest \"$(git rev-list --count \"$base\"..HEAD)\" = 2\ntest \"$(git log -2 --format=%s)\" = \"$(printf 'Add docs\\nAdd feature')\"\ntest \"$(git show HEAD~1:feature.txt)\" = 'feature v2'\ntest \"$(git rev-parse 'HEAD^{tree}')\" = \"$tree\"\ngit range-diff \"$base\"..before-edit \"$base\"..HEAD\necho 'PASS: interactive autosquash preserves snapshot'\n~~~\n\n--fixup принимает OID целевого коммита. GIT_SEQUENCE_EDITOR=: в лаборатории принимает автоматически сформированный todo; в реальной работе обязательно просмотрите список. -i включает интерактивный режим, --autosquash переставляет fixup. Проверка показывает два коммита вместо трёх, сообщения Add feature и Add docs, исправленная версия находится в первом. Снимок всей серии не изменился. --exec выполняет команду после создаваемых коммитов по правилам rebase, а с autosquash — после завершённых групп. Не запускайте чужие непроверенные команды из todo. Если нужна остановка для правки, следуйте git status и документации.\n\n## Самостоятельная работа\n\nИспользуйте reword и edit в отдельном репозитории, создайте коммит с двумя независимыми правками и разделите его. Сравните squash с fixup по сообщениям. Переставьте зависимые патчи, разберите конфликт и отмените попытку, если результат неверен.",
      "terms": [
        [
          "Todo",
          "Последовательность действий rebase."
        ],
        [
          "Fixup",
          "Присоединение правки к целевому коммиту."
        ],
        [
          "Squash",
          "Объединение с редактированием сообщения."
        ],
        [
          "Exec",
          "Команда проверки в серии."
        ],
        [
          "Snapshot",
          "Итоговое дерево."
        ]
      ],
      "steps": [
        [
          "Feature",
          "Целевой коммит"
        ],
        [
          "Docs",
          "Независимая правка"
        ],
        [
          "Fixup",
          "Исправление feature"
        ],
        [
          "Autosquash",
          "Перестановка и объединение"
        ],
        [
          "Дерево",
          "Проверка равенства"
        ]
      ],
      "question": [
        "Гарантирует ли одинаковое дерево работоспособность каждого коммита?",
        "Нет, промежуточные снимки нужно проверять отдельно."
      ],
      "sources": [
        "gitbranch-git-rebase",
        "gitbranch-git-commit",
        "gitbranch-git-range-diff"
      ],
      "pass": "PASS: interactive autosquash preserves snapshot"
    },
    {
      "id": "git-cherry-pick-lab",
      "after": "git-interactive-rebase",
      "min": 1,
      "title": "Cherry-pick: перенос исправлений и последовательностей",
      "summary": "Переносим выбранные изменения без объединения всей ветки.",
      "body": "## Перенос выбранного изменения\n\nCherry-pick применяет изменение, которое коммит внёс относительно родителя, к текущему состоянию. Обычно создаётся новый коммит; исходный не становится автоматически предком. Это полезно для backport исправления в поддерживаемую ветку, но создаёт дублирующиеся логические изменения в разных историях. Для merge-коммита нужно выбрать родительскую линию через -m номер; перенос не воспроизводит исходное слияние. Не выбирайте номер вслепую, сравните diff относительно каждого родителя.\n\nДля нескольких коммитов можно перечислить OID в нужном порядке. Диапазон A..B задаёт множество достижимых из B, исключая достижимые из A, а не список между двумя датами. Для нелинейной истории сначала исследуйте rev-list и зависимость патчей. --no-commit применяет изменения к рабочему дереву и индексу без немедленного коммита. -x может записать ссылку на исходный коммит для публичного backport; это не подпись и не гарантия одинакового поведения.\n\n## Конфликт и аудит\n\nПри конфликте cherry-pick останавливается. CHERRY_PICK_HEAD указывает на переносимый коммит в соответствующем состоянии. После разрешения и git add используется --continue; --abort отменяет последовательность, --skip пропускает коммит. Пустой результат может потребовать отдельного решения. Проверяйте функциональность на целевой ветке: патч мог зависеть от API, отсутствующего в старой версии.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и запустите bash вне переопределённого Git-контекста (GIT_DIR, GIT_INDEX_FILE и подобные переменные). Скрипт создаёт временный каталог, не использует сеть и удаляет только созданный каталог при выходе. Начальный коммит Base общий для линий опыта.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit switch -c topic\necho fix > fix.txt\ngit add -- fix.txt\ngit commit -qm Fix\nfix=$(git rev-parse HEAD)\necho docs > docs.txt\ngit add -- docs.txt\ngit commit -qm Docs\ndocs=$(git rev-parse HEAD)\ngit switch main\necho release > release.txt\ngit add -- release.txt\ngit commit -qm Release\nrelease=$(git rev-parse HEAD)\ngit cherry-pick -x \"$fix\"\ntest \"$(git rev-parse HEAD)\" != \"$fix\"\ntest \"$(git rev-parse HEAD^)\" = \"$release\"\ntest -f fix.txt && test ! -e docs.txt\ngit log -1 --format=%B | grep -F \"$fix\"\nif git merge-base --is-ancestor \"$fix\" HEAD; then exit 1; fi\ngit cherry-pick --no-commit \"$docs\"\ntest \"$(git rev-list --count \"$release\"..HEAD)\" = 1\ntest \"$(git show :docs.txt)\" = docs\ngit commit -qm 'Backport documentation'\ntest \"$(git rev-list --count \"$release\"..HEAD)\" = 2\ngit log --graph --oneline --all\necho 'PASS: selective cherry-pick and staging'\n~~~\n\n-x добавляет происхождение к сообщению чисто применённого коммита; grep ищет исходный OID. --no-commit оставляет подготовленное изменение, что подтверждается git show :docs.txt. До обычного commit число коммитов над release не меняется. Вершина исходного Fix не является предком новой истории, хотя файл совпадает. Это не merge и не rebase исходной ветки. Для автоматизации рассматривайте коды возврата, состояние индекса и тесты, а не только отсутствие ошибки.\n\n## Самостоятельная работа\n\nПеренесите связанные патчи в правильном порядке, затем попробуйте обратный порядок. Создайте merge-коммит и сравните его изменение относительно ^1 и ^2; исследуйте -m 1 только в одноразовой лаборатории. Объясните, почему обратная интеграция backport может встретить уже применённый патч.",
      "terms": [
        [
          "Backport",
          "Перенос исправления в другую линию."
        ],
        [
          "CHERRY_PICK_HEAD",
          "Переносимый коммит при остановке."
        ],
        [
          "Mainline",
          "Выбранный родитель merge."
        ],
        [
          "No-commit",
          "Применение без коммита."
        ],
        [
          "Patch",
          "Изменение относительно базы."
        ]
      ],
      "steps": [
        [
          "Topic",
          "Fix и Docs"
        ],
        [
          "Выбор",
          "Только Fix"
        ],
        [
          "Release",
          "Другая база"
        ],
        [
          "Cherry-pick",
          "Новый commit"
        ],
        [
          "Проверка",
          "Происхождение и тесты"
        ]
      ],
      "question": [
        "Становится ли исходный коммит предком после cherry-pick?",
        "Обычно нет, создаётся другой объект."
      ],
      "sources": [
        "gitbranch-git-cherry-pick",
        "gitbranch-gitrevisions",
        "gitbranch-git-rev-list",
        "gitbranch-git-merge-base"
      ],
      "pass": "PASS: selective cherry-pick and staging"
    },
    {
      "id": "git-rerere-lab",
      "after": "git-cherry-pick-lab",
      "min": 2,
      "title": "Rerere: повторное разрешение конфликтов и проверка результата",
      "summary": "Запоминаем решение, воспроизводим конфликт и проверяем индекс.",
      "body": "## Повторное использование решения\n\nПри долгой работе над веткой один и тот же текстовый конфликт может возникать несколько раз: во время пробного merge, rebase или обновления базы. Rerere (reuse recorded resolution) запоминает представление конфликтного состояния и результат разрешения. Когда Git распознаёт совместимый повтор конфликта, механизм пытается применить прежнее решение. Это не правило о том, какая сторона всегда правильная, и не семантическое понимание кода. Могут измениться окружающие условия, а повторённое решение стать ошибочным.\n\nrerere.enabled включает механизм; rerere.autoupdate управляет обновлением индекса при автоматическом повторном разрешении. При выключенном autoupdate рабочий файл может уже содержать решение, а индекс по-прежнему показывает неразрешённые стадии. Это удобно для проверки перед git add. git rerere status, diff и remaining помогают исследовать состояние; forget PATH позволяет отказаться от записанного решения для текущего конфликта. Не копируйте служебный кеш как универсальный артефакт CI без анализа конфиденциальности и совместимости.\n\n## Граница корректности\n\nМеханизм хранит сведения о конфликте в служебном кеше и не меняет родословную сам по себе. Он не гарантирует обработку всех видов конфликтов, например двоичных файлов или сложных ситуаций с путями. Проверяйте итог через diff, тесты и индекс. Повторное разрешение не равно завершённому merge; команда продолжения зависит от операции.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок как файл и запустите bash вне переопределённого Git-контекста (GIT_DIR, GIT_INDEX_FILE и подобные переменные). Скрипт создаёт временный каталог, не использует сеть и удаляет только созданный каталог при выходе. Начальный коммит Base общий для линий опыта.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit config rerere.enabled true\ngit config rerere.autoupdate false\ngit switch -c theirs\necho theirs > base.txt\ngit commit -qam Theirs\ngit switch main\necho ours > base.txt\ngit commit -qam Ours\nours=$(git rev-parse HEAD)\nif git merge --no-edit theirs; then exit 1; fi\nprintf 'reviewed resolution\\n' > base.txt\ngit rerere\ngit add -- base.txt\ngit commit -qm 'Resolve once'\ngit switch -c retry \"$ours\"\nif git merge --no-edit theirs; then exit 1; fi\ntest \"$(cat base.txt)\" = 'reviewed resolution'\ntest -n \"$(git ls-files -u)\"\ngit rerere diff\ngit add -- base.txt\ntest -z \"$(git ls-files -u)\"\ngit diff --cached --check\ngit commit -qm 'Reuse reviewed resolution'\ntest \"$(git show HEAD:base.txt)\" = 'reviewed resolution'\necho 'PASS: rerere replay and manual staging'\n~~~\n\nПервый merge намеренно конфликтует; git rerere записывает подготовленное человеком решение. Ветка retry создаётся от исходной вершины ours, поэтому повторяет тот же конфликт. Второй merge возвращает ненулевой код: даже если rerere восстановил рабочий файл, индекс ещё не разрешён при выключенном autoupdate. Проверяем фактическое содержимое и наличие стадий, затем осознанно выполняем git add. git rerere diff помогает увидеть изменение относительно записанного конфликтного состояния, но не заменяет обычный diff и тесты. Проверяйте результат даже при включённом autoupdate.\n\n## Самостоятельная работа\n\nПовторите опыт с rerere.autoupdate=true в новом репозитории и сравните ls-files -u. Измените конфликтующие строки и определите, распознаётся ли новый конфликт. Изучите rerere forget для ошибочного решения. Объясните, почему автоповтор текстовой правки может нарушить бизнес-логику.",
      "terms": [
        [
          "Rerere",
          "Повторное использование решения."
        ],
        [
          "Preimage",
          "Конфликтное состояние."
        ],
        [
          "Postimage",
          "Запомненный итог."
        ],
        [
          "Autoupdate",
          "Автоматическое обновление индекса."
        ],
        [
          "Semantic conflict",
          "Несовместимость по смыслу."
        ]
      ],
      "steps": [
        [
          "Первый конфликт",
          "Исходное состояние"
        ],
        [
          "Решение",
          "Ручная проверка"
        ],
        [
          "Кеш",
          "Запоминание"
        ],
        [
          "Повтор",
          "Восстановление файла"
        ],
        [
          "Индекс",
          "Ручное подтверждение"
        ]
      ],
      "question": [
        "Означает ли применённый rerere завершённый merge?",
        "Нет, нужно проверить индекс и завершить операцию."
      ],
      "sources": [
        "gitbranch-git-rerere",
        "gitbranch-git-merge",
        "gitbranch-git-config",
        "gitbranch-git-ls-files"
      ],
      "pass": "PASS: rerere replay and manual staging"
    }
  ],
  "sources": {
    "gitbranch-git-branch": {
      "title": "git-branch",
      "url": "https://git-scm.com/docs/git-branch",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-switch": {
      "title": "git-switch",
      "url": "https://git-scm.com/docs/git-switch",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-merge-base": {
      "title": "git-merge-base",
      "url": "https://git-scm.com/docs/git-merge-base",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-log": {
      "title": "git-log",
      "url": "https://git-scm.com/docs/git-log",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-merge": {
      "title": "git-merge",
      "url": "https://git-scm.com/docs/git-merge",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-rev-parse": {
      "title": "git-rev-parse",
      "url": "https://git-scm.com/docs/git-rev-parse",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-ls-files": {
      "title": "git-ls-files",
      "url": "https://git-scm.com/docs/git-ls-files",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-show": {
      "title": "git-show",
      "url": "https://git-scm.com/docs/git-show",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-config": {
      "title": "git-config",
      "url": "https://git-scm.com/docs/git-config",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-diff": {
      "title": "git-diff",
      "url": "https://git-scm.com/docs/git-diff",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-rebase": {
      "title": "git-rebase",
      "url": "https://git-scm.com/docs/git-rebase",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-range-diff": {
      "title": "git-range-diff",
      "url": "https://git-scm.com/docs/git-range-diff",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-rev-list": {
      "title": "git-rev-list",
      "url": "https://git-scm.com/docs/git-rev-list",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-commit": {
      "title": "git-commit",
      "url": "https://git-scm.com/docs/git-commit",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-cherry-pick": {
      "title": "git-cherry-pick",
      "url": "https://git-scm.com/docs/git-cherry-pick",
      "description": "Официальное руководство Git."
    },
    "gitbranch-gitrevisions": {
      "title": "gitrevisions",
      "url": "https://git-scm.com/docs/gitrevisions",
      "description": "Официальное руководство Git."
    },
    "gitbranch-git-rerere": {
      "title": "git-rerere",
      "url": "https://git-scm.com/docs/git-rerere",
      "description": "Официальное руководство Git."
    }
  }
};
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,E=window.ATLAS_EDITORIAL;
Object.assign(D.sources,data.sources);
for(const row of data.rows){const {after,min,terms,steps,question,pass,junior,...chapter}=row;D.lessons.push({...chapter,course:"git",minutes:Math.ceil(chapter.body.split(/\s+/).length/110)+30});L.minimum[row.id]=min;const i=L.order.git.indexOf(after);if(i<0)throw Error("Missing Git prerequisite "+after);L.order.git.splice(i+1,0,row.id);E[row.id]={intro:row.summary,terms,diagram:{title:"Механизм",steps,kind:"flow",caption:"Логические связи и порядок операций."},questions:[question]};if(junior){L.junior[row.id]=junior;L.juniorTerms[row.id]=terms.slice(0,4);L.juniorDiagrams[row.id]={title:"Как это работает",steps,kind:"flow",caption:"Основные шаги."};L.juniorQuestions[row.id]=question;}}
})();
