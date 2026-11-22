(function(){const data={
  "rows": [
    {
      "id": "git-restore-reset-lab",
      "after": "git-rerere-lab",
      "min": 0,
      "title": "Restore и reset: управление тремя состояниями",
      "summary": "Отличаем отмену staging, восстановление файла и перемещение ветки; проверяем soft, mixed и hard.",
      "body": "## Сначала определите, какие данные нужно сохранить\n\nGit имеет рабочее дерево, индекс и снимок HEAD. Один путь может иметь разные байты во всех трёх местах. git restore PATH обычно копирует содержимое индекса в рабочий файл; это уничтожает незаписанные изменения выбранного пути. git restore --staged PATH по умолчанию восстанавливает индекс из HEAD, оставляя рабочий файл. --source REV задаёт другой источник; --staged --worktree одновременно меняет оба назначения. Без --staged источник по умолчанию — индекс; при --staged — HEAD. Восстановление не перемещает ветку.\n\nУ reset есть две принципиально разные формы. git reset REV -- PATH обновляет индекс выбранных путей, не перемещая HEAD. git reset --soft REV переносит текущую вершину, сохраняя индекс и рабочее дерево; --mixed (по умолчанию для формы с коммитом) также приводит индекс к указанному снимку, оставляя рабочие файлы; --hard обновляет все три состояния и может удалить незакоммиченные данные, включая мешающие записи неотслеживаемых путей. --merge и --keep имеют дополнительные ограничения при локальных изменениях, их не следует считать безопасной универсальной заменой.\n\n## Предел восстановления\n\nРезервная ветка сохраняет только достижимые из неё коммиты, но не произвольные изменения рабочего дерева. Для несохранённых байтов используйте внешнюю копию или осознанно сохраните изменения, прежде чем выполнять разрушительное действие. Начните с git status, git diff и git diff --cached. Для опубликованной истории чаще нужен revert, а не reset.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок в файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и другими служебными переменными. Скрипт создаёт временный репозиторий, отключает внешние конфигурации, не использует сеть и удаляет только созданный каталог. Не переносите разрушительные команды из лаборатории в рабочий проект без проверки состояния и резервной копии.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nprintf 'second\\n' > base.txt\ngit add -- base.txt\nprintf 'third\\n' > base.txt\ngit restore --staged -- base.txt\ntest \"$(git show :base.txt)\" = base\ntest \"$(cat base.txt)\" = third\ngit add -- base.txt\ngit restore --worktree -- base.txt\ntest \"$(cat base.txt)\" = third\ngit commit -qm Second\ntip=$(git rev-parse HEAD)\ngit branch checkpoint \"$tip\"\ngit reset --soft \"$base\"\ntest \"$(git rev-parse HEAD)\" = \"$base\"\ntest \"$(git show :base.txt)\" = third\ntest \"$(cat base.txt)\" = third\ngit reset --mixed \"$base\"\ntest \"$(git show :base.txt)\" = base\ntest \"$(cat base.txt)\" = third\ngit restore --worktree -- base.txt\ntest \"$(cat base.txt)\" = base\ngit reset --hard \"$tip\"\ntest \"$(git rev-parse HEAD)\" = \"$tip\"\ntest \"$(git show :base.txt)\" = third\ntest \"$(cat base.txt)\" = third\ntest -z \"$(git status --porcelain)\"\necho 'PASS: restore and reset states'\n~~~\n\n-- отделяет параметры от путей, --worktree явно выбирает рабочее дерево. После restore --staged индекс содержит base, но диск — third. После soft ветка указывает на Base, индекс и диск сохраняют third; mixed заменяет индекс, restore меняет диск. Последний hard возвращает все три состояния к сохранённому коммиту. Этот опыт не доказывает восстановимость никогда не записанных байтов: checkpoint удерживает конкретный коммит, а не каждое состояние файла. При использовании reset в detached HEAD меняется непосредственное значение HEAD, а не именованная ветка.\n\n## Самостоятельная работа\n\nВ новом репозитории создайте три отличающихся версии файла. Предскажите результаты restore --source HEAD --worktree и restore --source HEAD --staged --worktree. Повторите reset HEAD -- base.txt и подтвердите, что OID HEAD не изменился. Составьте таблицу команды, источника, назначения и возможной потери данных.",
      "terms": [
        [
          "Working tree",
          "Редактируемые файлы."
        ],
        [
          "Index",
          "Подготовленный снимок."
        ],
        [
          "HEAD",
          "Текущий коммит или ссылка на него."
        ],
        [
          "Soft reset",
          "Перемещение вершины без смены индекса."
        ],
        [
          "Hard reset",
          "Обновление вершины, индекса и файлов."
        ]
      ],
      "steps": [
        [
          "Диагностика",
          "status и два diff"
        ],
        [
          "Источник",
          "index или commit"
        ],
        [
          "Назначение",
          "Рабочий файл / staging / ref"
        ],
        [
          "Проверка",
          "Сравнение трёх состояний"
        ]
      ],
      "question": [
        "Сохраняет ли резервная ветка незакоммиченный текст?",
        "Нет, она удерживает коммиты, а не произвольные рабочие байты."
      ],
      "sources": [
        "gitrecovery-git-restore",
        "gitrecovery-git-reset",
        "gitrecovery-git-status",
        "gitrecovery-git-diff"
      ],
      "pass": "PASS: restore and reset states",
      "junior": {
        "title": "Как отменить подготовку файла, не потеряв правки",
        "body": "## Три версии одного файла\n\nКогда вы редактируете файл, Git не записывает каждое нажатие клавиши в историю. Рабочая папка содержит текущий текст. Индекс хранит подготовленную версию для будущего коммита, HEAD обозначает последний выбранный коммит. Если вы случайно добавили файл в индекс, не нужно удалять его или сбрасывать весь проект.\n\n## Практика\n\nСоздайте новый учебный каталог и выполните:\n\n~~~sh\ngit init -b main\ngit config user.name Student\ngit config user.email student@example.invalid\necho first > note.txt\ngit add note.txt\ngit commit -m First\necho second > note.txt\ngit add note.txt\ngit restore --staged -- note.txt\ngit status --short\ngit diff -- note.txt\ncat note.txt\n~~~\n\nПосле restore --staged файл по-прежнему содержит second, а изменение больше не подготовлено к коммиту. Это полезно, когда вы случайно добавили лишнюю правку. git diff показывает оставшееся изменение, cat печатает содержимое файла.\n\n## Важно\n\nОбычная команда git restore -- note.txt имеет другой результат: она восстанавливает рабочий файл из индекса и может уничтожить несохранённую правку. Не выполняйте её, пока не решили, что изменение действительно не нужно. Команда git reset --hard ещё более разрушительна, поэтому не используйте её как универсальную отмену. Если сомневаетесь, сначала сохраните копию файла вне репозитория. Проверьте, что HEAD всё ещё указывает на первый коммит, а рабочий текст сохранился."
      }
    },
    {
      "id": "git-revert-lab",
      "after": "git-restore-reset-lab",
      "min": 0,
      "title": "Revert: обратный коммит и отмена merge",
      "summary": "Отменяем опубликованное изменение без переписывания истории и исследуем mainline.",
      "body": "## Обратное изменение вместо перемещения вершины\n\ngit revert вычисляет обратное изменение выбранного коммита относительно его родителя и применяет к текущему состоянию. Если удаётся, создаёт новый коммит. Исходный коммит остаётся достижимым, поэтому revert удобен для общей ветки. Это не возврат всего проекта к старому снимку: последующие независимые изменения сохраняются, а пересекающиеся могут конфликтовать. --no-commit применяет обратные изменения к индексу и рабочему дереву без немедленного коммита, позволяя собрать контролируемую серию.\n\nДля merge-коммита нужно указать mainline: git revert -m 1 MERGE выбирает первого родителя как линию, относительно которой отменяется изменение merge. Это не номер ветки, а номер родителя объекта, начиная с 1. Сначала изучите git show --no-patch --pretty=raw MERGE и diff относительно родителей. Revert merge отменяет данные, но не родительские связи: последующие merge той же истории могут не вернуть прежние изменения, поскольку Git уже считает коммиты интегрированными. Возврат обратного коммита или новая серия исправлений требуют отдельной оценки.\n\n## Безопасная отмена\n\nПеред revert проверьте состояние и тесты. При конфликте git status показывает пути, после осмысленного разрешения используйте add и revert --continue. --abort отменяет незавершённую операцию. Отмена кода не отменяет внешние эффекты: миграции базы, опубликованные сообщения и вызовы API могут требовать отдельного компенсирующего действия.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок в файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и другими служебными переменными. Скрипт создаёт временный репозиторий, отключает внешние конфигурации, не использует сеть и удаляет только созданный каталог. Не переносите разрушительные команды из лаборатории в рабочий проект без проверки состояния и резервной копии.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\necho feature > feature.txt\ngit add -- feature.txt\ngit commit -qm Feature\nfeature=$(git rev-parse HEAD)\necho unrelated > unrelated.txt\ngit add -- unrelated.txt\ngit commit -qm Unrelated\ngit revert --no-edit \"$feature\"\ntest ! -e feature.txt\ntest -f unrelated.txt\ngit merge-base --is-ancestor \"$feature\" HEAD\ngit switch -c topic\necho topic > topic.txt\ngit add -- topic.txt\ngit commit -qm Topic\ntopic=$(git rev-parse HEAD)\ngit switch main\ngit merge --no-ff --no-edit topic\nmerge=$(git rev-parse HEAD)\ngit revert -m 1 --no-edit \"$merge\"\ntest ! -e topic.txt\ngit merge-base --is-ancestor \"$topic\" HEAD\ngit merge --no-edit topic\ntest ! -e topic.txt\ngit revert --no-edit HEAD\ntest \"$(cat topic.txt)\" = topic\ntest -z \"$(git status --porcelain)\"\necho 'PASS: revert preserves ancestry'\n~~~\n\n--no-edit принимает предложенное сообщение. Первый revert убирает feature.txt, но unrelated.txt остаётся, а Feature сохраняется в графе. После revert merge коммит Topic достижим, поэтому повторный merge topic сообщает, что история уже интегрирована, и файл не возвращается. В лаборатории HEAD после такого merge всё ещё обратный коммит; его revert возвращает topic.txt. В реальном проекте не отменяйте HEAD наугад — установите точный OID и проверьте содержимое. -m 1 не всегда является нужным выбором; порядок родителей определяется созданным merge.\n\n## Самостоятельная работа\n\nСоздайте два последовательных изменения одной строки и попробуйте отменить первое: исследуйте конфликт, затем abort. В новом опыте примените revert --no-commit к двум независимым изменениям, проверьте diff --cached и сохраните один обратный коммит. Объясните, почему revert миграции не обязательно возвращает данные.",
      "terms": [
        [
          "Revert",
          "Новый обратный коммит."
        ],
        [
          "Mainline",
          "Выбранный родитель merge."
        ],
        [
          "Compensation",
          "Отдельное действие для внешнего эффекта."
        ],
        [
          "Revert of revert",
          "Отмена обратного изменения."
        ]
      ],
      "steps": [
        [
          "Feature",
          "Исходный коммит"
        ],
        [
          "Следующая правка",
          "Независимое изменение"
        ],
        [
          "Revert",
          "Обратный патч"
        ],
        [
          "Граф",
          "Оба коммита сохранены"
        ]
      ],
      "question": [
        "Удаляет ли revert исходный коммит из истории?",
        "Нет, создаёт новый обратный коммит."
      ],
      "sources": [
        "gitrecovery-git-revert",
        "gitrecovery-git-merge",
        "gitrecovery-git-show",
        "gitrecovery-git-diff"
      ],
      "pass": "PASS: revert preserves ancestry",
      "junior": {
        "title": "Как отменить коммит в общей ветке",
        "body": "## Почему не стоит просто удалять историю\n\nПредставьте, что команда уже получила ваш коммит, но в нём оказалась ошибка. Если переписать историю, коллеги могут продолжить работу с прежними коммитами. Git предлагает revert: он создаёт новый коммит, который отменяет изменение, сохраняя старую историю.\n\n## Практика\n\nВ новом учебном каталоге выполните:\n\n~~~sh\ngit init -b main\ngit config user.name Student\ngit config user.email student@example.invalid\necho base > base.txt\ngit add base.txt\ngit commit -m Base\necho broken > broken.txt\ngit add broken.txt\ngit commit -m 'Add broken file'\ngit revert --no-edit HEAD\ngit log --oneline\ngit status --short\n~~~\n\nФайл broken.txt исчезнет, но в истории будут три коммита: исходный Base, добавление файла и обратный коммит. --no-edit принимает предложенное Git сообщение. Команда не удаляет старую запись и не требует переписывания общей ветки.\n\n## Проверка\n\nДобавьте отдельный файл и сохраните его. Найдите в истории исходный коммит с ошибкой и убедитесь, что он остаётся доступным. В реальном проекте перед revert проверьте, какой именно коммит требуется отменить. Если Git сообщает о конфликте, прочитайте git status и не удаляйте данные вслепую. Помните: revert исходного кода сам по себе не отменяет отправленные письма, изменённые данные или другие действия программы вне Git."
      }
    },
    {
      "id": "git-stash-lab",
      "after": "git-revert-lab",
      "min": 0,
      "title": "Stash: временные снимки, индекс и безопасное применение",
      "summary": "Сохраняем staged, unstaged и untracked, восстанавливаем индекс и изучаем внутреннюю структуру stash.",
      "body": "## Что именно сохраняется\n\ngit stash push сохраняет изменения отслеживаемых файлов в служебной истории и обычно очищает рабочее дерево и индекс до HEAD. -u (--include-untracked) дополнительно сохраняет неотслеживаемые файлы, но не ignored; -a (--all) включает и игнорируемые, что может затронуть секреты, сборочные артефакты и большие каталоги. --keep-index оставляет подготовленные изменения в рабочей копии; --staged сохраняет только подготовленное по правилам команды. Используйте эти режимы после проверки статуса, а не как замену резервной копии.\n\nStash обычно представлен merge-подобным коммитом: первый родитель — HEAD на момент сохранения, второй — снимок индекса, при сохранении untracked/ignored добавляется дополнительный родитель. Само дерево stash представляет сохранённое состояние отслеживаемых рабочих файлов. refs/stash указывает на последнее сохранение, предыдущие записи доступны через reflog. stash@{0} — позиция, которая меняется при добавлении или удалении записей.\n\n## Применение и границы\n\nstash apply оставляет запись, pop пытается применить и удалить её при успехе. При конфликте pop обычно не удаляет запись. --index пытается восстановить и подготовленное состояние, но при конфликте это может не удаться. Предпочитайте apply, затем проверку двух diff и только после этого drop. stash branch позволяет создать ветку на исходной базе сохранения; это полезно при расхождении истории. Stash локален, не передаётся обычным push и не обеспечивает долгосрочной сохранности.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок в файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и другими служебными переменными. Скрипт создаёт временный репозиторий, отключает внешние конфигурации, не использует сеть и удаляет только созданный каталог. Не переносите разрушительные команды из лаборатории в рабочий проект без проверки состояния и резервной копии.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nprintf 'staged\\n' > base.txt\ngit add -- base.txt\nprintf 'working\\n' > base.txt\necho untracked > new.txt\ngit stash push -u -m 'Atlas draft'\ntest -z \"$(git status --porcelain)\"\ntest \"$(cat base.txt)\" = base\nstash=$(git rev-parse refs/stash)\ntest \"$(git rev-parse \"$stash^1\")\" = \"$base\"\ntest \"$(git show \"$stash^2:base.txt\")\" = staged\ntest \"$(git show \"$stash:base.txt\")\" = working\ntest \"$(git show \"$stash^3:new.txt\")\" = untracked\ngit stash list\ngit stash apply --index \"$stash\"\ntest \"$(git show :base.txt)\" = staged\ntest \"$(cat base.txt)\" = working\ntest \"$(cat new.txt)\" = untracked\ntest \"$(git rev-parse refs/stash)\" = \"$stash\"\ngit stash drop 'stash@{0}'\nif git rev-parse --verify refs/stash >/dev/null 2>&1; then exit 1; fi\necho 'PASS: stash index and untracked snapshots'\n~~~\n\npush -u включает new.txt; -m задаёт описание. rev-parse разрешает ссылку в OID, show REV:PATH читает путь из снимка. В опыте ^1 — исходный коммит, ^2 — индекс, ^3 — untracked. После apply --index сохранены разные staged и рабочие версии и новый файл. drop удаляет запись, а не гарантирует немедленное удаление всех объектов. Здесь запись одна и проверен OID, поэтому stash@{0} однозначен. В реальной работе перепроверьте список перед drop, особенно если выполнялись другие операции. Не сохраняйте реальные секреты в stash: они попадут в объектную базу.\n\n## Самостоятельная работа\n\nВ новом репозитории сравните stash push без -u и с -u. Добавьте игнорируемый учебный файл и исследуйте --all, не используя настоящие секреты. Смоделируйте конфликт при применении stash на изменённой базе; сохраните запись до проверки результата. Объясните, почему stash не является удалённой резервной копией.",
      "terms": [
        [
          "Stash",
          "Временное сохранение изменений."
        ],
        [
          "refs/stash",
          "Ссылка на последнюю запись."
        ],
        [
          "Untracked",
          "Неотслеживаемый путь."
        ],
        [
          "Apply",
          "Применение без удаления записи."
        ],
        [
          "Pop",
          "Применение с удалением при успехе."
        ]
      ],
      "steps": [
        [
          "HEAD",
          "Исходная база"
        ],
        [
          "Index",
          "Подготовленные байты"
        ],
        [
          "Working tree",
          "Рабочие байты"
        ],
        [
          "Stash",
          "Снимки и родители"
        ],
        [
          "Apply",
          "Восстановление и проверка"
        ]
      ],
      "question": [
        "Гарантирует ли pop сохранение записи при успехе?",
        "Нет, при успехе запись обычно удаляется."
      ],
      "sources": [
        "gitrecovery-git-stash",
        "gitrecovery-git-reflog",
        "gitrecovery-git-show",
        "gitrecovery-git-rev-parse"
      ],
      "pass": "PASS: stash index and untracked snapshots",
      "junior": {
        "title": "Как временно отложить незавершённую работу",
        "body": "## Сохраняем черновик на время\n\nИногда нужно переключиться на другую задачу, а текущая работа ещё не готова к коммиту. Stash позволяет временно сохранить изменения в локальном репозитории. Это удобно, но не заменяет резервную копию: другой компьютер не получит stash автоматически.\n\n## Практика\n\nВ отдельном учебном каталоге выполните:\n\n~~~sh\ngit init -b main\ngit config user.name Student\ngit config user.email student@example.invalid\necho first > note.txt\ngit add note.txt\ngit commit -m First\necho draft > note.txt\necho new > draft.txt\ngit stash push -u -m 'My draft'\ngit status --short\ngit stash list\ngit stash apply\ngit status --short\ncat note.txt\ncat draft.txt\n~~~\n\n-u сохраняет также новые неотслеживаемые файлы. После push рабочая папка снова соответствует коммиту, а после apply обе правки возвращаются. git stash list показывает сохранённые записи. Команда apply не удаляет запись, поэтому вы можете проверить результат.\n\n## Проверка и ограничения\n\nЕсли черновик восстановился правильно, запись можно удалить командой git stash drop после проверки списка. Не выполняйте drop, пока не убедились, что нужные данные на месте. Если применение сообщает о конфликте, прочитайте git status. Игнорируемые файлы обычно не сохраняются с -u; не рассчитывайте на stash для хранения паролей и важных личных файлов. Для длительной работы лучше создать отдельную ветку и осмысленные коммиты."
      }
    },
    {
      "id": "git-reflog-recovery",
      "after": "git-stash-lab",
      "min": 1,
      "title": "Reflog, достижимость и восстановление потерянных коммитов",
      "summary": "Восстанавливаем вершину после reset, находим недостижимый объект и отделяем восстановление от гарантий.",
      "body": "## Локальная история перемещений\n\nОбычный git log обходит родительские связи коммитов; reflog записывает обновления конкретной ссылки или HEAD, когда журнал ведётся. Выражение HEAD@{1} означает предыдущую запись журнала HEAD, а не родителя текущего коммита. main@{1} относится к журналу ветки main. HEAD~1 — первый родитель в графе, поэтому эти выражения могут давать совершенно разные объекты.\n\nReflog хранится локально и зависит от конфигурации, срока хранения и операций обслуживания. Удаление ветки может удалить её журнал; HEAD может сохранять часть событий, но не гарантированно. Даты в reflog — локальные события перемещения, не обязательно время создания коммита. Начинайте восстановление с read-only команд: git reflog, git show и rev-parse. Создайте отдельную ветку на найденном OID до изменения текущего состояния.\n\n## Недостижимые объекты\n\nКоммиты могут перестать быть достижимыми через обычные refs после reset или удаления ветки, но оставаться в базе. git fsck --unreachable --no-reflogs показывает объекты, недостижимые с учётом выбранных корней без reflog; это не список только повреждённых объектов и не гарантия сохранности. Индекс также может удерживать объекты. Dangling — объект, на который не ссылается другой рассматриваемый объект; это не синоним любого unreachable. Никогда не запускайте немедленную очистку до исследования. Если байты никогда не попали в объектную базу, Git может не иметь возможности их вернуть.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок в файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и другими служебными переменными. Скрипт создаёт временный репозиторий, отключает внешние конфигурации, не использует сеть и удаляет только созданный каталог. Не переносите разрушительные команды из лаборатории в рабочий проект без проверки состояния и резервной копии.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\necho saved > saved.txt\ngit add -- saved.txt\ngit commit -qm 'Saved work'\nlost=$(git rev-parse HEAD)\ngit reset --hard \"$base\"\ntest ! -e saved.txt\ntest \"$(git rev-parse 'HEAD@{1}')\" = \"$lost\"\ngit reflog --format='%h %gs'\ngit fsck --no-reflogs --unreachable > \"$lab/unreachable\"\ngrep -F \"unreachable commit $lost\" \"$lab/unreachable\"\ngit show \"$lost:saved.txt\"\ngit branch recovered \"$lost\"\ntest \"$(git show recovered:saved.txt)\" = saved\ngit switch recovered\ntest \"$(cat saved.txt)\" = saved\ntest \"$(git rev-parse main)\" = \"$base\"\ngit fsck --full\necho 'PASS: reflog and unreachable recovery'\n~~~\n\nreset --hard здесь намеренно выполняется в одноразовой копии после коммита. До него HEAD указывает на Saved work; после — на Base. HEAD@{1} в контролируемом сценарии возвращает потерянную вершину, а fsck с --no-reflogs показывает её недостижимость через обычные корни. git branch recovered создаёт новое имя, не переписывая main. show позволяет прочитать файл до переключения. В реальном случае позиции журнала меняются, поэтому сохраните точный найденный OID; не копируйте HEAD@{1} вслепую. Не используйте gc --prune=now или reflog expire для проверки восстановления в настоящем репозитории.\n\n## Самостоятельная работа\n\nСоздайте ещё один коммит, затем переключите ветку и сравните HEAD@{1}, main@{1}, HEAD~1. Запишите blob через hash-object -w без добавления в индекс и исследуйте fsck --unreachable. Объясните различия между объектом, который сохранился без ссылки, и текстом, который был только в редакторе.",
      "terms": [
        [
          "Reflog",
          "Локальный журнал обновлений ссылки."
        ],
        [
          "Reachability",
          "Достижимость по графу."
        ],
        [
          "Dangling",
          "Объект без входящей ссылки в проверяемом наборе."
        ],
        [
          "Rescue branch",
          "Имя, сохраняющее найденный коммит."
        ],
        [
          "Retention",
          "Политика срока хранения."
        ]
      ],
      "steps": [
        [
          "Коммит",
          "Сохранённая работа"
        ],
        [
          "Reset",
          "Перемещение main"
        ],
        [
          "Reflog / fsck",
          "Поиск OID"
        ],
        [
          "Rescue branch",
          "Удержание объекта"
        ],
        [
          "Проверка",
          "Чтение снимка"
        ]
      ],
      "question": [
        "Равны ли HEAD@{1} и HEAD~1?",
        "Не обязательно: первое — журнал, второе — родитель."
      ],
      "sources": [
        "gitrecovery-git-reflog",
        "gitrecovery-git-fsck",
        "gitrecovery-git-reset",
        "gitrecovery-git-branch",
        "gitrecovery-gitrevisions"
      ],
      "pass": "PASS: reflog and unreachable recovery"
    },
    {
      "id": "git-revision-ranges",
      "after": "git-reflog-recovery",
      "min": 1,
      "title": "Диапазоны ревизий: множества, родители и сравнение веток",
      "summary": "Разбираем A..B, A...B, ^, ~ и различия log и diff на реальном DAG.",
      "body": "## Ревизии и множества достижимости\n\nHEAD^1 обозначает первого родителя, HEAD^2 — второго родителя merge-коммита, HEAD~N проходит N первых родителей. Суффиксы применяются последовательно; HEAD~2 и HEAD^2 имеют разный смысл. Git позволяет задавать OID, имена refs, выражения и пути через REV:PATH. При неоднозначных именах используйте полное пространство refs и --verify.\n\nВ командах обхода истории A..B — множество коммитов, достижимых из B, но не из A. Это эквивалентно B ^A. A...B — симметрическая разность достижимых множеств, то есть коммиты только с одной из сторон. --left-right маркирует, с какой стороны пришёл коммит, --count считает их. Это не диапазоны дат. --first-parent ограничивает обход первыми родителями и отвечает на иной вопрос, например о последовательности интеграций в основную ветку.\n\n## Одинаковое написание, разные команды\n\ngit diff A B и git diff A..B сравнивают конечные деревья A и B. git diff A...B сравнивает выбранную merge-base A и B с деревом B; при нескольких лучших базах выбор и диагностическое поведение зависят от версии и команды. Это не симметрическая разность коммитов. Для обзора PR часто интересен diff общей базы с topic, а для сравнения развернутых версий — два конечных дерева. Не переносите семантику git log на git diff механически.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок в файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и другими служебными переменными. Скрипт создаёт временный репозиторий, отключает внешние конфигурации, не использует сеть и удаляет только созданный каталог. Не переносите разрушительные команды из лаборатории в рабочий проект без проверки состояния и резервной копии.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit switch -c topic\necho topic > topic.txt\ngit add -- topic.txt\ngit commit -qm Topic\ntopic=$(git rev-parse HEAD)\ngit switch main\necho main > main.txt\ngit add -- main.txt\ngit commit -qm Main\nmain=$(git rev-parse HEAD)\ntest \"$(git rev-list --count main..topic)\" = 1\ntest \"$(git rev-list --count topic..main)\" = 1\ntest \"$(git rev-list --count main...topic)\" = 2\ntest \"$(git rev-list --left-right --count main...topic)\" = \"$(printf '1\\t1')\"\ntest \"$(git diff --name-only main...topic)\" = topic.txt\ntest \"$(git diff --name-only main..topic)\" = \"$(printf 'main.txt\\ntopic.txt')\"\ngit merge --no-edit topic\ntest \"$(git rev-parse HEAD^1)\" = \"$main\"\ntest \"$(git rev-parse HEAD^2)\" = \"$topic\"\ntest \"$(git rev-parse HEAD~2)\" = \"$base\"\ngit log --first-parent --oneline\ngit log --graph --oneline --all\necho 'PASS: revision sets and diff semantics'\n~~~\n\nrev-list --count выдаёт число выбранных коммитов, --left-right --count — два числа, разделённые табуляцией. diff --name-only показывает имена путей: между конечными снимками отличаются main.txt и topic.txt, от общей базы до topic — только topic.txt. После merge HEAD^2 указывает на Topic, HEAD~2 на Base. --first-parent скрывает часть деталей интегрированной линии при обходе, но не удаляет коммиты. Для скриптов с произвольными именами файлов используйте подходящий NUL-формат, а не разбирайте вывод по строкам; лаборатория использует фиксированные имена.\n\n## Самостоятельная работа\n\nНарисуйте множества достижимости для веток с двумя уникальными коммитами, затем сравните rev-list A..B и A...B. Добавьте merge и посмотрите --first-parent. Сравните diff A B, A..B и A...B в обоих направлениях; объясните, почему перестановка концов тройной точки меняет diff.",
      "terms": [
        [
          "Revision",
          "Выражение, разрешаемое в объект."
        ],
        [
          "Reachable set",
          "Множество достижимых коммитов."
        ],
        [
          "Symmetric difference",
          "Коммиты только одной стороны."
        ],
        [
          "First parent",
          "Первый родитель коммита."
        ],
        [
          "Merge base",
          "Общий лучший предок."
        ]
      ],
      "steps": [
        [
          "A",
          "Левая история"
        ],
        [
          "B",
          "Правая история"
        ],
        [
          "A..B",
          "B без A"
        ],
        [
          "A...B",
          "Только одна сторона"
        ],
        [
          "diff",
          "Сравнение деревьев"
        ]
      ],
      "question": [
        "Равна ли семантика log A...B и diff A...B?",
        "Нет, log выбирает множество коммитов, diff сравнивает деревья."
      ],
      "sources": [
        "gitrecovery-gitrevisions",
        "gitrecovery-git-rev-list",
        "gitrecovery-git-diff",
        "gitrecovery-git-log",
        "gitrecovery-git-merge-base"
      ],
      "pass": "PASS: revision sets and diff semantics"
    },
    {
      "id": "git-bisect-lab",
      "after": "git-revision-ranges",
      "min": 1,
      "title": "Bisect: воспроизводимый поиск регрессии",
      "summary": "Автоматизируем проверку коммитов, находим первое плохое состояние и учитываем skip.",
      "body": "## От наблюдаемого дефекта к предикату\n\ngit bisect ищет границу между известным хорошим и плохим состоянием. Он выбирает коммиты для проверки с учётом графа достижимости, стремясь уменьшить число оставшихся кандидатов. Для линейной истории с устойчивым монотонным признаком это похоже на двоичный поиск; при сложном DAG, нескольких причинах, исправлениях и повторных регрессиях результат зависит от выбранных границ и проверяемого свойства. Коммит, найденный bisect, не обязательно объясняет корневую причину без анализа.\n\nСформулируйте воспроизводимый тест, который отличает хорошее состояние от плохого. git bisect run запускает команду на выбранных снимках. Код 0 означает good, 1–127 кроме 125 — bad; 125 — skip (невозможно проверить этот снимок). Другие коды останавливают или нарушают автоматический поиск по правилам команды. Ошибка запуска теста с кодом 126/127 может быть неверно воспринята как bad, поэтому проверяйте окружение и наличие зависимостей до начала.\n\n## Рабочее состояние и ограничения\n\nBisect обычно переключает HEAD на проверяемые коммиты. Перед поиском сохраните работу, используйте чистую копию или отдельный worktree. Не запускайте произвольный исторический код с доступом к секретам, сети и рабочим данным. Тестовый скрипт удобно хранить вне проверяемого дерева, чтобы он не исчезал при переключениях. git bisect log показывает решения, replay воспроизводит журнал, reset завершает поиск и возвращает исходное состояние по правилам команды.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок в файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и другими служебными переменными. Скрипт создаёт временный репозиторий, отключает внешние конфигурации, не использует сеть и удаляет только созданный каталог. Не переносите разрушительные команды из лаборатории в рабочий проект без проверки состояния и резервной копии.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nfor n in $(seq 1 8); do\n  printf '%s\\n' \"$n\" > version.txt\n  if [ \"$n\" -ge 5 ]; then echo broken > behavior.txt; else echo good > behavior.txt; fi\n  git add -- version.txt behavior.txt\n  git commit -qm \"Version $n\"\n  if [ \"$n\" = 1 ]; then good=$(git rev-parse HEAD); fi\n  if [ \"$n\" = 5 ]; then expected=$(git rev-parse HEAD); fi\ndone\nbad=$(git rev-parse HEAD)\ncat > \"$lab/check.sh\" <<'SH'\n#!/bin/sh\n[ -f behavior.txt ] || exit 125\ngrep -qx good behavior.txt\nSH\nchmod +x \"$lab/check.sh\"\ngit bisect start \"$bad\" \"$good\"\ngit bisect run \"$lab/check.sh\"\ntest \"$(git rev-parse HEAD)\" = \"$expected\"\ngit bisect log > \"$lab/bisect-log\"\ngrep -F \"$expected\" \"$lab/bisect-log\"\ngit bisect reset\ntest \"$(git rev-parse HEAD)\" = \"$bad\"\ntest \"$(git symbolic-ref HEAD)\" = refs/heads/main\ntest -z \"$(git status --porcelain)\"\necho 'PASS: automated bisect finds first bad'\n~~~\n\nВосемь коммитов моделируют стабильный переход к broken начиная с версии 5. good и bad — установленные границы, внешний скрипт возвращает 0 для good, 1 для broken, 125 при отсутствии файла. git bisect run сам классифицирует проверяемые снимки; итоговая проверка OID подтверждает конкретный коммит Version 5. bisect reset возвращает исходную ветку. В настоящем проекте предварительно проверьте тест на обеих границах, фиксируйте версии инструментов и повторяйте нестабильные проверки. Если skip оставляет несколько кандидатов, не объявляйте один найденный коммит точной причиной.\n\n## Самостоятельная работа\n\nИзмените тест так, чтобы одна промежуточная версия возвращала 125, и посмотрите, когда Git может однозначно указать границу. Добавьте позднее исправление и повторную регрессию, выберите другие good/bad границы. Сравните git bisect log и replay в новой лаборатории.",
      "terms": [
        [
          "Bisect",
          "Поиск границы хорошего и плохого состояния."
        ],
        [
          "Predicate",
          "Проверяемое свойство."
        ],
        [
          "Good / bad",
          "Классы результата теста."
        ],
        [
          "Skip",
          "Невозможность классификации."
        ],
        [
          "Regression",
          "Ухудшение поведения."
        ]
      ],
      "steps": [
        [
          "Границы",
          "Известные good и bad"
        ],
        [
          "Кандидат",
          "Выбранный коммит"
        ],
        [
          "Тест",
          "Код результата"
        ],
        [
          "Сужение",
          "Оставшийся граф"
        ],
        [
          "Результат",
          "Проверка причины"
        ]
      ],
      "question": [
        "Гарантирует ли bisect корневую причину ошибки?",
        "Нет, он ищет границу для выбранного теста и истории."
      ],
      "sources": [
        "gitrecovery-git-bisect",
        "gitrecovery-git-rev-list",
        "gitrecovery-git-worktree"
      ],
      "pass": "PASS: automated bisect finds first bad"
    },
    {
      "id": "git-worktree-lab",
      "after": "git-bisect-lab",
      "min": 2,
      "title": "Worktree: несколько рабочих деревьев и изоляция операций",
      "summary": "Создаём отдельную рабочую копию ветки, сравниваем общую базу и отдельные индексы.",
      "body": "## Общий репозиторий, отдельное состояние\n\ngit worktree позволяет использовать несколько рабочих деревьев одного репозитория без полноценного копирования объектной базы. Основное и linked worktree имеют собственный HEAD, индекс и рабочие файлы; большинство refs и объектов общие. Некоторые служебные refs и состояния операций относятся к конкретному дереву. В linked worktree .git часто является текстовым файлом, указывающим на служебный каталог, а не обычной директорией. git rev-parse --git-dir и --git-common-dir помогают корректно определить пути.\n\nОбычная ветка не должна одновременно быть checkout в двух worktree: Git по умолчанию защищает от этого, поскольку ref общий, а индексы и файлы независимы. Можно использовать разные ветки либо detached HEAD для чтения снимка. --force обходит некоторые проверки, но не решает проблему согласования. git worktree add -b NAME PATH REV создаёт ветку и рабочее дерево от выбранного коммита; --detach PATH REV создаёт дерево без активной ветки.\n\n## Эксплуатация\n\nОтдельные деревья удобны для срочного hotfix, сравнения версий и bisect без переключения основной копии. Они разделяют объектную базу, поэтому не являются независимыми резервными копиями или границей безопасности. Конфигурация по умолчанию в значительной части общая; extensions.worktreeConfig и git config --worktree позволяют разделять некоторые настройки при корректной настройке расширения. git worktree list --porcelain пригоден для инструментов; worktree remove удаляет рабочее дерево и его регистрацию, но не ветку. prune очищает устаревшие служебные записи; lock защищает дерево от некоторых автоматических операций. Не удаляйте внутренние каталоги вручную.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux. Сохраните блок в файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и другими служебными переменными. Скрипт создаёт временный репозиторий, отключает внешние конфигурации, не использует сеть и удаляет только созданный каталог. Не переносите разрушительные команды из лаборатории в рабочий проект без проверки состояния и резервной копии.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit worktree add -b hotfix \"$lab/hotfix\" \"$base\"\ntest -f \"$lab/hotfix/.git\"\ntest \"$(git -C \"$lab/hotfix\" symbolic-ref HEAD)\" = refs/heads/hotfix\ntest \"$(git symbolic-ref HEAD)\" = refs/heads/main\nif git worktree add \"$lab/duplicate\" main 2>/dev/null; then exit 1; fi\necho staged > base.txt\ngit add -- base.txt\ntest \"$(git show :base.txt)\" = staged\ntest \"$(git -C \"$lab/hotfix\" show :base.txt)\" = base\necho fix > \"$lab/hotfix/fix.txt\"\ngit -C \"$lab/hotfix\" add -- fix.txt\ngit -C \"$lab/hotfix\" commit -qm Hotfix\nhotfix=$(git rev-parse hotfix)\ntest \"$(git show \"$hotfix:fix.txt\")\" = fix\ntest \"$(git rev-parse HEAD)\" = \"$base\"\ngit worktree add --detach \"$lab/inspect\" \"$hotfix\"\ntest \"$(cat \"$lab/inspect/fix.txt\")\" = fix\ngit worktree list --porcelain\ngit worktree remove \"$lab/inspect\"\ngit worktree remove \"$lab/hotfix\"\ntest \"$(git rev-parse hotfix)\" = \"$hotfix\"\ntest \"$(git show :base.txt)\" = staged\necho 'PASS: worktree isolates index and shares objects'\n~~~\n\ngit -C PATH запускает команду в другом каталоге. Основной индекс хранит staged, индекс hotfix — base. После коммита Hotfix объект доступен из основного дерева по общей ссылке, хотя main не перемещалась. Попытка создать второе дерево на main отклоняется. Detached дерево читает снимок hotfix без занятия ветки. remove удаляет чистые рабочие деревья; ветка hotfix и подготовленная правка основной копии сохраняются. В реальном проекте перед remove проверьте status целевого дерева, не применяйте --force ради обхода защиты. Для диагностики путей используйте rev-parse --git-path index, а не предположение о структуре .git.\n\n## Самостоятельная работа\n\nСоздайте отдельный detached worktree для старого коммита и выполните в нём read-only проверку. Сравните git rev-parse --git-dir, --git-common-dir и --git-path index в обеих копиях. Попробуйте удалить дерево с незаписанной правкой и объясните отказ. Исследуйте worktree lock и unlock без ручного удаления файлов.",
      "terms": [
        [
          "Linked worktree",
          "Дополнительное рабочее дерево."
        ],
        [
          "Common dir",
          "Общая служебная область."
        ],
        [
          "Per-worktree index",
          "Отдельный индекс."
        ],
        [
          "Detached HEAD",
          "Работа со снимком без ветки."
        ],
        [
          "Worktree lock",
          "Защита регистрации дерева."
        ]
      ],
      "steps": [
        [
          "Общая база",
          "Объекты и большинство refs"
        ],
        [
          "main",
          "HEAD и index A"
        ],
        [
          "hotfix",
          "HEAD и index B"
        ],
        [
          "Коммит",
          "Общий объект"
        ],
        [
          "Remove",
          "Удаление дерева, не ветки"
        ]
      ],
      "question": [
        "Является ли worktree независимой резервной копией?",
        "Нет, объекты и большинство refs общие."
      ],
      "sources": [
        "gitrecovery-git-worktree",
        "gitrecovery-git-rev-parse",
        "gitrecovery-git-config",
        "gitrecovery-gitrepository-layout"
      ],
      "pass": "PASS: worktree isolates index and shares objects"
    }
  ],
  "sources": {
    "gitrecovery-git-restore": {
      "title": "git-restore",
      "url": "https://git-scm.com/docs/git-restore",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-reset": {
      "title": "git-reset",
      "url": "https://git-scm.com/docs/git-reset",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-status": {
      "title": "git-status",
      "url": "https://git-scm.com/docs/git-status",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-diff": {
      "title": "git-diff",
      "url": "https://git-scm.com/docs/git-diff",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-revert": {
      "title": "git-revert",
      "url": "https://git-scm.com/docs/git-revert",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-merge": {
      "title": "git-merge",
      "url": "https://git-scm.com/docs/git-merge",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-show": {
      "title": "git-show",
      "url": "https://git-scm.com/docs/git-show",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-stash": {
      "title": "git-stash",
      "url": "https://git-scm.com/docs/git-stash",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-reflog": {
      "title": "git-reflog",
      "url": "https://git-scm.com/docs/git-reflog",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-rev-parse": {
      "title": "git-rev-parse",
      "url": "https://git-scm.com/docs/git-rev-parse",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-fsck": {
      "title": "git-fsck",
      "url": "https://git-scm.com/docs/git-fsck",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-branch": {
      "title": "git-branch",
      "url": "https://git-scm.com/docs/git-branch",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-gitrevisions": {
      "title": "gitrevisions",
      "url": "https://git-scm.com/docs/gitrevisions",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-rev-list": {
      "title": "git-rev-list",
      "url": "https://git-scm.com/docs/git-rev-list",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-log": {
      "title": "git-log",
      "url": "https://git-scm.com/docs/git-log",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-merge-base": {
      "title": "git-merge-base",
      "url": "https://git-scm.com/docs/git-merge-base",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-bisect": {
      "title": "git-bisect",
      "url": "https://git-scm.com/docs/git-bisect",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-worktree": {
      "title": "git-worktree",
      "url": "https://git-scm.com/docs/git-worktree",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-git-config": {
      "title": "git-config",
      "url": "https://git-scm.com/docs/git-config",
      "description": "Официальное руководство Git."
    },
    "gitrecovery-gitrepository-layout": {
      "title": "gitrepository-layout",
      "url": "https://git-scm.com/docs/gitrepository-layout",
      "description": "Официальное руководство Git."
    }
  }
};
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,E=window.ATLAS_EDITORIAL;
Object.assign(D.sources,data.sources);
for(const row of data.rows){const {after,min,terms,steps,question,pass,junior,...chapter}=row;D.lessons.push({...chapter,course:"git",minutes:Math.ceil(chapter.body.split(/\s+/).length/110)+30});L.minimum[row.id]=min;const i=L.order.git.indexOf(after);if(i<0)throw Error("Missing Git prerequisite "+after);L.order.git.splice(i+1,0,row.id);E[row.id]={intro:row.summary,terms,diagram:{title:"Механизм",steps,kind:"flow",caption:"Логические связи и порядок операций."},questions:[question]};if(junior){L.junior[row.id]=junior;L.juniorTerms[row.id]=terms.slice(0,4);L.juniorDiagrams[row.id]={title:"Как это работает",steps,kind:"flow",caption:"Основные шаги."};L.juniorQuestions[row.id]=question;}}
})();
