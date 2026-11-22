(function(){const data={
  "rows": [
    {
      "id": "git-lab-config",
      "after": "git-setup",
      "min": 0,
      "title": "Лаборатория Git: конфигурация, идентичность и первый коммит",
      "summary": "Создаём изолированный репозиторий, различаем настройки и проверяем первое сохранение.",
      "body": "## Настройки и границы репозитория\n\nGit выполняет команды в контексте репозитория. В обычной рабочей копии есть рабочее дерево и служебная область .git. git rev-parse --show-toplevel показывает корень рабочего дерева, --git-dir — путь служебной области. В linked worktree .git может быть файлом, а bare-репозиторий не имеет обычного рабочего дерева. Поэтому проверяйте контекст командой, а не наличием конкретной папки.\n\ngit config получает настройки из нескольких источников: системного, пользовательского, локального и при соответствующей конфигурации worktree. Командные -c KEY=VALUE задают настройку для одного запуска. Include и условные include добавляют настройки; --show-origin и --show-scope позволяют увидеть происхождение. Для параметров с несколькими значениями действуют особые правила. Не меняйте глобальный профиль ради практики.\n\n## Практика: изолированный репозиторий\n\nНужен Git 2.28 или новее для git init -b. Сохраните скрипт как setup-lab.sh и выполните bash setup-lab.sh. Он создаёт временный каталог, отключает влияние внешних конфигураций и не обращается к сети. Адрес example.invalid предназначен для примера.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1\nexport GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main \"$lab/repo\"\ncd \"$lab/repo\"\ngit config --local user.name 'Atlas Student'\ngit config --local user.email 'student@example.invalid'\ngit config --local core.autocrlf false\ngit config --show-origin --show-scope --get user.name\nprintf '# Atlas\\n' > README.md\ngit status --short\ngit add -- README.md\ngit diff --cached -- README.md\ngit commit -qm 'Add project README'\ngit log -1 --format='%s'\ntest -z \"$(git status --porcelain)\"\ngit rev-parse --show-toplevel\necho 'PASS: first commit'\n~~~\n\n-q уменьшает вывод, -b задаёт начальную ветку, --local записывает конфигурацию репозитория, --get читает значение. -- отделяет опции от пути. --cached показывает подготовленные изменения относительно HEAD (или пустого дерева до первого коммита). -m передаёт сообщение коммита; -q делает вывод короче. --porcelain подходит для автоматической проверки статуса. После коммита рабочее дерево и индекс согласованы, а ветка указывает на первый коммит. Скрипт рассчитан на обычную оболочку вне существующего Git-контекста с переопределёнными GIT_DIR/GIT_WORK_TREE; не запускайте его из нестандартной среды без проверки этих переменных.\n\n## Идентичность не равна авторизации\n\nuser.name и user.email — метаданные коммита, а не пароль к GitHub. Они не доказывают личность. Автор и коммитер могут отличаться при переносе патча, подпись коммита — отдельный механизм, доступ к удалённому репозиторию определяется аутентификацией и разрешениями сервера. Вывод полной конфигурации может содержать адреса, заголовки и другие чувствительные значения: не публикуйте его вслепую.\n\n## Самостоятельная работа\n\nСоздайте второй коммит и выведите историю с --oneline. Объясните разницу между локальной настройкой и настройкой для одного вызова. Проверьте, что корень репозитория — созданный каталог. Попробуйте git -c user.name='Temporary' config --get user.name и сравните с обычным запросом. Для следующей главы заведите новый пустой каталог; не удаляйте .git действующего проекта.",
      "terms": [
        [
          "Working tree",
          "Рабочие файлы проекта."
        ],
        [
          "Repository",
          "История и служебные структуры Git."
        ],
        [
          "Local config",
          "Настройки текущего репозитория."
        ],
        [
          "Author",
          "Автор изменения в метаданных."
        ],
        [
          "Committer",
          "Создатель конкретного объекта коммита."
        ]
      ],
      "steps": [
        [
          "Каталог",
          "git init"
        ],
        [
          "Настройки",
          "Локальная идентичность"
        ],
        [
          "Файл",
          "Рабочее дерево"
        ],
        [
          "git add",
          "Индекс"
        ],
        [
          "git commit",
          "История"
        ]
      ],
      "question": [
        "Предоставляет ли user.email доступ к GitHub?",
        "Нет, это метаданные коммита, а доступ проверяется отдельно."
      ],
      "sources": [
        "gitinitmanual",
        "gitconfigmanual",
        "gitstatusmanual",
        "gitcommitmanual",
        "gitrevparse"
      ],
      "junior": {
        "title": "Создаём безопасный учебный репозиторий",
        "body": "## Подготовка\n\nУстановите Git штатным способом для своей системы и выполните git --version. Для примера нужна версия не ниже 2.28. Репозиторий хранит историю файлов; он не обязан быть размещён на GitHub. Используйте новый каталог, чтобы не менять существующий проект.\n\n~~~sh\nmkdir atlas-git-first\ncd atlas-git-first\ngit init -b main\ngit config --local user.name 'Atlas Student'\ngit config --local user.email 'student@example.invalid'\n~~~\n\ngit init создаёт репозиторий, -b выбирает имя первой ветки. git config --local сохраняет настройки только в этом репозитории. Имя и email попадут в коммиты; для реального проекта используйте подходящую идентичность. Они не являются логином и паролем.\n\n## Первый коммит\n\n~~~sh\nprintf '# Atlas\\n' > README.md\ngit status --short\ngit add -- README.md\ngit commit -m 'Add project README'\ngit log --oneline\n~~~\n\nДо git add файл новый и не подготовлен. git add выбирает содержимое для следующего коммита, git commit сохраняет снимок в историю. -m задаёт сообщение, --oneline выводит историю кратко. Если команда не сработала, прочитайте сообщение и проверьте текущий каталог.\n\n## Проверяем себя\n\ngit status должен показать отсутствие изменений. Добавьте вторую строку в README, повторите git add и git commit с другим сообщением. Теперь история содержит два снимка. Объясните, почему сохранение файла редактором и коммит не одно и то же. Не публикуйте учебный репозиторий: для этих операций Интернет не нужен."
      }
    },
    {
      "id": "git-diff-status",
      "after": "git-index",
      "min": 0,
      "title": "Чтение изменений: git status, diff и частичное добавление",
      "summary": "Учимся различать подготовленные и неподготовленные изменения, читать патч и контролировать состав коммита.",
      "body": "## Три сравнения\n\nHEAD обозначает текущий коммит, если он существует. Индекс содержит подготовленное состояние будущего снимка. Рабочее дерево содержит текущие файлы. git diff по умолчанию сравнивает рабочее дерево с индексом для соответствующих отслеживаемых путей; новые untracked-файлы в обычный diff не попадают. git diff --cached сравнивает индекс с HEAD, а git diff HEAD — рабочее дерево с HEAD для отслеживаемых путей. Последняя команда не заменяет проверку индекса и не включает произвольные untracked-файлы. До первого коммита HEAD может отсутствовать.\n\ngit status --short использует две колонки XY для обычных путей: первая описывает отличие индекса от HEAD, вторая — рабочего дерева от индекса. ?? обозначает untracked, !! — ignored при соответствующем режиме. Конфликтные состояния имеют специальные сочетания. Для скриптов используйте --porcelain и при обработке произвольных имён -z, а не разбирайте человекочитаемый текст по пробелам.\n\n## Практика: две редакции одного файла\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\nprintf 'version one\\n' > note.txt\ngit add -- note.txt\ngit commit -qm 'Create note'\nprintf 'version two\\n' > note.txt\ngit add -- note.txt\nprintf 'version three\\n' > note.txt\ngit status --short\ngit diff -- note.txt\ngit diff --cached -- note.txt\ngit commit -qm 'Update note to version two'\ntest \"$(git show HEAD:note.txt)\" = 'version two'\ntest \"$(cat note.txt)\" = 'version three'\ntest \"$(git status --porcelain)\" = ' M note.txt'\necho 'PASS: staged snapshot preserved'\n~~~\n\nДо коммита ожидается MM note.txt: оба сравнения показывают изменения. После коммита сохранена версия two, хотя на диске уже three. Это не потеря данных: версия three остаётся в рабочем дереве. -p у git add позволяет интерактивно выбрать отдельные фрагменты (hunks), если Git может разделить их. git diff --stat показывает агрегат, --name-status перечисляет изменения путей, --check обнаруживает некоторые пробельные ошибки и конфликтные маркеры. Никакой из этих режимов не является полноценным тестом кода.\n\n## Самостоятельная работа\n\nСоздайте свой файл из двух несвязанных абзацев, измените оба и попробуйте git add -p. Проверьте git diff --cached до коммита и обычный diff после него. Если изменения попали в один hunk, изучите доступные варианты разделения или подготовьте изменения отдельными шагами. Объясните, почему git commit -a не подходит, если вы хотите сохранить только один из нескольких изменённых файлов: он подготавливает изменения и удаления уже отслеживаемых файлов. Не используйте его вслепую.",
      "terms": [
        [
          "HEAD",
          "Ссылка на текущую позицию истории."
        ],
        [
          "Index",
          "Подготовленный снимок."
        ],
        [
          "Working tree",
          "Файлы на диске."
        ],
        [
          "Hunk",
          "Фрагмент патча."
        ],
        [
          "Porcelain",
          "Стабильный интерфейс вывода для автоматизации."
        ]
      ],
      "steps": [
        [
          "HEAD",
          "Версия one"
        ],
        [
          "Индекс",
          "Версия two"
        ],
        [
          "Рабочее дерево",
          "Версия three"
        ],
        [
          "commit",
          "Сохраняется индекс"
        ],
        [
          "status",
          "Рабочая правка остаётся"
        ]
      ],
      "question": [
        "Почему коммит сохранил two вместо three?",
        "git add подготовил two, а последующая запись изменила только рабочее дерево."
      ],
      "sources": [
        "gitstatusmanual",
        "gitdiffmanual",
        "gitaddmanual",
        "gitcommitmanual",
        "gitshowmanual"
      ],
      "junior": {
        "title": "Как узнать, что попадёт в коммит",
        "body": "## Не все сохранённые файлы готовы к коммиту\n\nGit различает текущие файлы, подготовленные изменения и уже сохранённую историю. Если после git add снова изменить файл, новое содержимое не попадёт в следующий коммит автоматически.\n\n## Практика\n\nВ новом учебном репозитории с настроенным именем и email выполните:\n\n~~~sh\necho first > note.txt\ngit add -- note.txt\ngit commit -m 'Add note'\necho second > note.txt\ngit add -- note.txt\necho third > note.txt\ngit status --short\ngit diff\ngit diff --cached\n~~~\n\ngit status --short показывает короткий статус. MM означает, что файл изменён и в индексе, и в рабочей копии относительно соответствующих состояний. git diff показывает third относительно second, а git diff --cached — second относительно first. Знак минус в патче отмечает прежнюю строку, плюс — новую.\n\n~~~sh\ngit commit -m 'Update note'\ngit show HEAD:note.txt\ncat note.txt\n~~~\n\nПервая команда сохраняет подготовленную версию. Вторая показывает содержимое файла в текущем коммите, третья — на диске. Результаты second и third различаются.\n\n## Проверка\n\nПосмотрите git status. Объясните, зачем отдельно проверять подготовленный diff перед коммитом. Не добавляйте всё подряд, пока не понимаете состав изменения. На Middle рассмотрим частичное добавление, форматы статуса и ограничения каждого сравнения."
      }
    },
    {
      "id": "git-commit-quality",
      "after": "git-diff-status",
      "min": 0,
      "title": "Хорошие коммиты: границы изменения, сообщения и проверка истории",
      "summary": "Разбираем связность патча, автора и коммитера, проверяем историю на реальном репозитории.",
      "body": "## Коммит — единица объяснимого изменения\n\nКоммит хранит снимок дерева, ссылки на родителей, метаданные автора и коммитера и сообщение. Git вычисляет различия между снимками при просмотре. Хороший коммит имеет понятную цель, не смешивает механический формат и изменение поведения без необходимости, и по возможности оставляет проект в проверяемом состоянии. Размер сам по себе не критерий: изменение одной концепции может затрагивать несколько файлов.\n\nСообщение обычно содержит короткую тему и при необходимости пояснение после пустой строки. Объясняйте причину, последствия, ограничения и действительно выполненные проверки. Не записывайте «тесты пройдены», если их не выполняли. Conventional Commits — дополнительное соглашение команды, а не обязательное правило Git.\n\n## Практика: разделяем изменения\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\nprintf '# Project\\n' > README.md\ngit add -- README.md\ngit diff --cached --check\ngit commit -qm 'Document project purpose'\nprintf 'mode=demo\\n' > settings.ini\nprintf '\\nUsage: demo\\n' >> README.md\ngit add -- settings.ini\ngit diff --cached --check\ngit commit -qm 'Add default demo settings'\ngit add -- README.md\ngit commit -qm 'Document demo usage'\ngit log -3 --format='%s'\ngit show --stat HEAD\ntest \"$(git rev-list --count HEAD)\" = 3\ntest -z \"$(git status --porcelain)\"\necho 'PASS: three focused commits'\n~~~\n\nКоманды создают три последовательных снимка. -3 ограничивает число записей, --format='%s' показывает темы, show --stat — краткое изменение последнего коммита, rev-list --count считает достижимые коммиты от указанной ревизии. diff --cached --check не проверяет смысл, только некоторые ошибки представления. Перед сохранением реального патча запустите соответствующие тесты проекта.\n\n## Изменение последнего коммита\n\ngit commit --amend создаёт новый объект коммита вместо прежнего текущего коммита; --no-edit сохраняет сообщение. Это полезно для неопубликованного локального изменения, но не является редактированием объекта на месте. При изменении уже опубликованной истории необходимо согласовать последствия; если не уверены, создайте дополнительный коммит. Не публикуйте ключи и конфигурационные секреты: удаление файла следующим коммитом не удаляет его из прежних снимков.\n\n## Самостоятельная работа\n\nСоставьте два отдельных изменения: исправление ошибки и пояснение её причины в документации. Решите, должны ли они быть одним коммитом или двумя, с учётом возможности проверки и отката. Проверьте status, diff --cached и log. Напишите сообщение, отвечающее на вопрос «почему», а не только «какой файл изменён». В учебном репозитории исправьте сообщение неопубликованного коммита через --amend и сравните идентификаторы до и после.",
      "terms": [
        [
          "Commit",
          "Снимок и метаданные."
        ],
        [
          "Parent",
          "Предыдущий коммит в графе."
        ],
        [
          "Subject",
          "Краткая тема сообщения."
        ],
        [
          "Amend",
          "Создание замены последнего коммита."
        ],
        [
          "Atomic change",
          "Логически связанное изменение."
        ]
      ],
      "steps": [
        [
          "Правка",
          "Одна цель"
        ],
        [
          "Индекс",
          "Выбранные файлы"
        ],
        [
          "Проверка",
          "Diff и тесты"
        ],
        [
          "Коммит",
          "Сообщение и снимок"
        ],
        [
          "История",
          "Проверка результата"
        ]
      ],
      "question": [
        "Меняет ли amend прежний объект на месте?",
        "Нет, создаёт другой коммит и перемещает текущую ссылку."
      ],
      "sources": [
        "gitcommitmanual",
        "gitlogmanual",
        "gitshowmanual",
        "gitrevlistmanual",
        "gitdiffmanual"
      ],
      "junior": {
        "title": "Как писать понятные коммиты",
        "body": "## Одна понятная цель\n\nПредставьте, что вы исправили ошибку входа и одновременно поменяли цвет кнопки. Если эти изменения независимы, обычно удобнее сохранить их отдельно. Тогда коллега поймёт историю и сможет отменить одно изменение без второго. Коммит не обязан быть маленьким по числу строк, но должен иметь объяснимую цель.\n\n## Практика\n\nВ собственном учебном репозитории создайте два файла с разными задачами.\n\n~~~sh\necho 'mode=demo' > settings.ini\necho 'Usage: demo' > usage.txt\ngit status --short\ngit add -- settings.ini\ngit diff --cached\ngit commit -m 'Add demo settings'\ngit add -- usage.txt\ngit commit -m 'Document demo usage'\ngit log -2 --oneline\n~~~\n\nВы увидите два коммита. Первый сохраняет настройки, второй — описание использования. git diff --cached помогает проверить, что подготовлено именно нужное изменение. git log -2 показывает две последние записи.\n\n## Сообщения и ошибки\n\nВместо «fix» полезнее написать, что исправлено: например, «Fix missing input validation». При сложном изменении добавьте пояснение причины. Не указывайте проверки, которых не выполняли. Если случайно сохранили приватный ключ, нельзя считать его безопасным после удаления следующим коммитом: старый снимок может остаться доступным.\n\nОбъясните, почему сохранение нескольких несвязанных задач в одном коммите усложняет расследование ошибки. На Middle разберём метаданные, изменение последнего коммита и проверку патча."
      }
    },
    {
      "id": "git-history-reading",
      "after": "git-commit-quality",
      "min": 0,
      "title": "Чтение истории: log, show, blame и поиск изменений",
      "summary": "Находим изменение по истории, исследуем конкретный снимок и не путаем автора строки с причиной ошибки.",
      "body": "## История — граф, а не журнал сохранений редактора\n\nКаждый коммит имеет идентификатор и ссылки на родителей. git log обходит достижимые коммиты по выбранным правилам. --oneline сокращает представление, --graph рисует текстовый граф, --decorate показывает известные ссылки рядом с коммитами. Ограничение -- PATH отбирает историю с учётом правил упрощения по пути; результат не обязательно является полным списком всех достижимых коммитов. git show REV:PATH читает объект файла в указанном снимке, а git show REV показывает сведения о коммите и соответствующий diff по правилам команды.\n\n## Практика: найти изменение настройки\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\nprintf 'timeout=10\\n' > app.conf\ngit add -- app.conf\ngit commit -qm 'Set initial timeout'\nfirst=$(git rev-parse HEAD)\nprintf 'timeout=30\\n' > app.conf\ngit commit -qam 'Increase timeout'\ngit log --oneline -- app.conf\ngit show \"$first:app.conf\"\ngit log -S'timeout=30' --format='%s' -- app.conf\ngit blame -- app.conf\ntest \"$(git show \"$first:app.conf\")\" = 'timeout=10'\ntest \"$(git log -S'timeout=30' --format='%s' -- app.conf)\" = 'Increase timeout'\necho 'PASS: locate historical change'\n~~~\n\ngit log -SSTRING (pickaxe) ищет изменения числа вхождений строки, а -GREGEX ищет совпадающие добавленные или удалённые строки в патче. Это не универсальный полнотекстовый поиск по каждому снимку. git blame показывает последнее изменение соответствующих строк по своей модели; это не доказательство вины или авторства всего поведения. Перемещение и копирование строк, форматирование и история слияний усложняют результат. --follow для log работает с одним путём и имеет ограничения при переименовании. Для ответа на вопрос «когда появилась ошибка?» часто понадобится воспроизводящий тест и git bisect, а не только blame.\n\n## Самостоятельная работа\n\nДобавьте третью правку настройки и сравните git log -p -- app.conf с git show HEAD. Найдите коммит, который впервые добавил конкретное значение. Сформулируйте, какие доказательства нужны для объяснения регрессии: версия, тест, изменение поведения, а не просто фамилия из blame. Не переключайте рабочую ветку ради чтения старого файла, если достаточно git show REV:PATH.",
      "terms": [
        [
          "Revision",
          "Обозначение объекта истории."
        ],
        [
          "Reachability",
          "Достижимость по родителям."
        ],
        [
          "Pickaxe",
          "Поиск изменения вхождений."
        ],
        [
          "Blame",
          "Атрибуция строк по истории."
        ],
        [
          "Pathspec",
          "Выражение выбора путей."
        ]
      ],
      "steps": [
        [
          "Симптом",
          "Что изменилось"
        ],
        [
          "log",
          "Граф и сообщения"
        ],
        [
          "show",
          "Снимок и патч"
        ],
        [
          "pickaxe",
          "Поиск изменения"
        ],
        [
          "Тест",
          "Подтверждение причины"
        ]
      ],
      "question": [
        "Доказывает ли blame, что автор строки создал баг?",
        "Нет, он показывает атрибуцию строки, а причина требует отдельного анализа."
      ],
      "sources": [
        "gitlogmanual",
        "gitshowmanual",
        "gitblamemanual",
        "gitdiffmanual",
        "gitrevparse"
      ],
      "junior": {
        "title": "Как читать историю проекта",
        "body": "## Смотрим сохранённые изменения\n\nИстория нужна, чтобы понять, когда и почему изменился проект. git log показывает коммиты, git show позволяет изучить выбранный коммит. Не нужно менять текущие файлы, чтобы прочитать старый снимок.\n\n## Практика\n\nВ своём учебном репозитории выполните:\n\n~~~sh\necho 'timeout=10' > app.conf\ngit add -- app.conf\ngit commit -m 'Set initial timeout'\necho 'timeout=30' > app.conf\ngit add -- app.conf\ngit commit -m 'Increase timeout'\ngit log --oneline -- app.conf\ngit show HEAD~1:app.conf\ngit show HEAD:app.conf\n~~~\n\nHEAD — текущий коммит, HEAD~1 — его первый родитель. После двоеточия указан путь файла внутри снимка. Вы увидите сначала timeout=10, затем timeout=30. Команды show не меняют рабочие файлы. -- перед именем отделяет путь от других аргументов.\n\n## Кто изменил строку\n\n~~~sh\ngit blame -- app.conf\n~~~\n\nКоманда показывает сведения о коммите, которому Git приписывает строку. Это полезная подсказка, но не доказательство того, кто виноват в ошибке. Возможно, изменение было переносом кода или следствием другой правки.\n\nНайдите сообщение коммита, изменившего timeout, и объясните, как проверить, действительно ли это изменение вызвало проблему. На Middle рассмотрим граф истории и поиск по изменениям."
      }
    }
  ],
  "sources": {
    "gitinitmanual": {
      "title": "git-init",
      "url": "https://git-scm.com/docs/git-init",
      "description": "Официальная справка Git."
    },
    "gitconfigmanual": {
      "title": "git-config",
      "url": "https://git-scm.com/docs/git-config",
      "description": "Официальная справка Git."
    },
    "gitstatusmanual": {
      "title": "git-status",
      "url": "https://git-scm.com/docs/git-status",
      "description": "Официальная справка Git."
    },
    "gitcommitmanual": {
      "title": "git-commit",
      "url": "https://git-scm.com/docs/git-commit",
      "description": "Официальная справка Git."
    },
    "gitrevparse": {
      "title": "git-rev-parse",
      "url": "https://git-scm.com/docs/git-rev-parse",
      "description": "Официальная справка Git."
    },
    "gitdiffmanual": {
      "title": "git-diff",
      "url": "https://git-scm.com/docs/git-diff",
      "description": "Официальная справка Git."
    },
    "gitaddmanual": {
      "title": "git-add",
      "url": "https://git-scm.com/docs/git-add",
      "description": "Официальная справка Git."
    },
    "gitshowmanual": {
      "title": "git-show",
      "url": "https://git-scm.com/docs/git-show",
      "description": "Официальная справка Git."
    },
    "gitlogmanual": {
      "title": "git-log",
      "url": "https://git-scm.com/docs/git-log",
      "description": "Официальная справка Git."
    },
    "gitrevlistmanual": {
      "title": "git-rev-list",
      "url": "https://git-scm.com/docs/git-rev-list",
      "description": "Официальная справка Git."
    },
    "gitblamemanual": {
      "title": "git-blame",
      "url": "https://git-scm.com/docs/git-blame",
      "description": "Официальная справка Git."
    }
  }
};
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,E=window.ATLAS_EDITORIAL;
Object.assign(D.sources,data.sources);
for(const row of data.rows){const {after,min,terms,steps,question,junior,...chapter}=row;D.lessons.push({...chapter,course:"git",minutes:Math.ceil(chapter.body.split(/\s+/).length/110)+25});L.minimum[row.id]=min;const i=L.order.git.indexOf(after);if(i<0)throw Error("Missing Git prerequisite "+after);L.order.git.splice(i+1,0,row.id);E[row.id]={intro:row.summary,terms,diagram:{title:"Механизм",steps,kind:"flow",caption:"Основные связи и порядок работы."},questions:[question]};L.junior[row.id]=junior;L.juniorTerms[row.id]=terms.slice(0,4);L.juniorDiagrams[row.id]={title:"Как это работает",steps,kind:"flow",caption:"Основные шаги."};L.juniorQuestions[row.id]=question;}
})();
