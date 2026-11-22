(function(){const data={
  "rows": [
    {
      "id": "git-hooks-lab",
      "after": "git-tags-mirror",
      "min": 1,
      "title": "Hooks: локальные проверки и серверная политика",
      "summary": "Проверяем отказ pre-commit и pre-receive, отличаем удобство от принудительного контроля.",
      "body": "## События и границы доверия\n\nHook — исполняемая программа, которую Git вызывает в определённой точке операции. pre-commit запускается до записи обычного коммита, commit-msg получает путь к файлу сообщения, pre-push получает сведения об отправляемых ссылках, post-commit выполняется после записи. На сервере pre-receive получает строки старый OID, новый OID, имя ref через стандартный ввод; update вызывается для отдельных refs, post-receive — после успешного обновления. Ненулевой код pre-receive отклоняет весь запрос. Post-hook не может отменить уже совершённое обновление простым ненулевым кодом.\n\nGit ищет hooks в служебной области или по core.hooksPath. Файлы должны быть исполняемыми на Unix. Обычный clone не устанавливает произвольные hooks из рабочего дерева автоматически. Команда может хранить проверенные скрипты в версии и документировать установку, но запуск кода из недоверенного репозитория требует осознанного решения. Условия запуска и рабочая директория зависят от hook; серверные push hooks выполняются в Git-каталоге.\n\n## Проверка удобства не равна политике\n\nНекоторые локальные hooks обходятся --no-verify, а пользователь может изменить свою конфигурацию. Поэтому критичные правила применяют на сервере и в обязательных CI-проверках. Hooks должны возвращать понятную диагностику и ограничивать время выполнения. Не выводите секреты и не передавайте непроверенные параметры в shell. Сервер должен учитывать гонки и полномочия; один локальный скрипт не заменяет branch protection.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux; для подписей дополнительно OpenSSH с ssh-keygen. Сохраните блок как файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт создаёт временный каталог, отключает внешние настройки, не использует сеть и удаляет только созданный каталог при выходе. Не переносите локальные исключения безопасности в рабочую конфигурацию.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nmkdir -p \"$lab/hooks\"\ngit config core.hooksPath \"$lab/hooks\"\ncat > \"$lab/hooks/pre-commit\" <<'SH'\n#!/bin/sh\nif git diff --cached --name-only | grep -qx forbidden.txt; then\n  echo 'forbidden path' >&2\n  exit 1\nfi\nSH\nchmod +x \"$lab/hooks/pre-commit\"\necho demo > forbidden.txt\ngit add -- forbidden.txt\nif git commit -qm Rejected; then exit 1; fi\ntest \"$(git rev-parse HEAD)\" = \"$base\"\ngit restore --staged -- forbidden.txt\nrm -- forbidden.txt\necho allowed > allowed.txt\ngit add -- allowed.txt\ngit commit -qm Allowed\ngit init -q --bare -b main \"$lab/server.git\"\ngit remote add origin \"$lab/server.git\"\ngit push -q origin main\ncat > \"$lab/server.git/hooks/pre-receive\" <<'SH'\n#!/bin/sh\nwhile read -r old new ref; do\n  if [ \"$ref\" = refs/heads/blocked ]; then\n    echo 'blocked branch' >&2\n    exit 1\n  fi\ndone\nSH\nchmod +x \"$lab/server.git/hooks/pre-receive\"\ngit branch blocked\nif git push origin blocked; then exit 1; fi\ntest -z \"$(git ls-remote origin refs/heads/blocked)\"\ngit push origin main:refs/heads/review\ntest -n \"$(git ls-remote origin refs/heads/review)\"\necho 'PASS: client and server hooks reject independently'\n~~~\n\nЛокальный pre-commit отказывает при подготовленном forbidden.txt; HEAD остаётся Base. Это демонстрация фиксированного имени, а не универсальный сканер произвольных путей: для общего случая нужен NUL-вывод и подходящий парсер. Серверный pre-receive независимо отклоняет создание blocked и разрешает review. read -r не интерпретирует обратные слеши; ref передаётся Git. В рабочей системе используйте проверенную серверную инфраструктуру и правила доступа, а не копируйте учебный запрет имени.\n\n## Самостоятельная работа\n\nДобавьте commit-msg, проверяющий непустую тему сообщения. Смоделируйте попытку push двух refs, один из которых запрещён, и подтвердите отсутствие частичного обновления при отказе pre-receive. Исследуйте различия update и pre-receive. Опишите, какие проверки должны быть обязательными в CI, а какие удобно выполнять локально.",
      "terms": [
        [
          "Hook",
          "Программа, вызываемая на событие Git."
        ],
        [
          "Pre-commit",
          "Локальная проверка перед записью."
        ],
        [
          "Pre-receive",
          "Серверная проверка запроса push."
        ],
        [
          "core.hooksPath",
          "Настроенный каталог hooks."
        ],
        [
          "Exit status",
          "Результат выполнения программы."
        ]
      ],
      "steps": [
        [
          "Изменение",
          "Индекс"
        ],
        [
          "Pre-commit",
          "Локальная проверка"
        ],
        [
          "Commit",
          "Снимок"
        ],
        [
          "Push",
          "Запрос серверу"
        ],
        [
          "Pre-receive",
          "Разрешение или отказ"
        ]
      ],
      "question": [
        "Можно ли считать локальный hook обязательной серверной политикой?",
        "Нет, локальную проверку пользователь может изменить или обойти."
      ],
      "sources": [
        "gitteam-githooks",
        "gitteam-git-config",
        "gitteam-git-commit",
        "gitteam-git-receive-pack"
      ],
      "pass": "PASS: client and server hooks reject independently"
    },
    {
      "id": "git-signatures-lab",
      "after": "git-hooks-lab",
      "min": 1,
      "title": "Подписи коммитов и тегов: идентичность и доверие",
      "summary": "Создаём временный SSH-ключ, подписываем объекты и проверяем доверенное и недоверенное состояние.",
      "body": "## Хеш, подпись и автор — разные вещи\n\nOID связывает объект с его содержимым, но не доказывает личность автора. Поля author и committer задаются локально. Криптографическая подпись позволяет проверить, что подписывающий владел соответствующим ключом и подписанные данные не изменились. Для утверждения об идентичности нужна отдельная связь публичного ключа с доверенной личностью и политика действительности ключей. Git поддерживает OpenPGP, SSH и X.509 через соответствующие программы и настройки gpg.format. SSH-подпись не равна входу на сервер по SSH.\n\ngit commit -S создаёт подписанный коммит, git tag -s — подписанную аннотированную метку. verify-commit и verify-tag проверяют подпись; вывод log --show-signature помогает при расследовании. Подпись относится к конкретным байтам объекта. Rebase и amend могут создавать другие объекты; старую подпись нельзя автоматически считать подписью новой истории.\n\n## Доверенные ключи\n\nДля SSH-подписей allowed signers связывает principal с публичным ключом. Проверка должна опираться на независимо полученные доверенные ключи, не на список, изменённый тем же непроверенным коммитом. В реальной организации нужны отзыв, ротация, правила истечения, защита закрытого ключа и разделение ключей. Метка Verified на хостинге зависит от его политики и не гарантирует качество кода, безопасность сборки или принадлежность артефакта.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux; для подписей дополнительно OpenSSH с ssh-keygen. Сохраните блок как файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт создаёт временный каталог, отключает внешние настройки, не использует сеть и удаляет только созданный каталог при выходе. Не переносите локальные исключения безопасности в рабочую конфигурацию.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nssh-keygen -q -t ed25519 -N '' -f \"$lab/signing\"\ngit config gpg.format ssh\ngit config user.signingkey \"$lab/signing\"\nprintf 'student@example.invalid %s\\n' \"$(cat \"$lab/signing.pub\")\" > \"$lab/allowed\"\ngit config gpg.ssh.allowedSignersFile \"$lab/allowed\"\necho signed > signed.txt\ngit add -- signed.txt\ngit commit -q -S -m Signed\ngit verify-commit HEAD\ngit tag -s v1 -m 'Signed release'\ngit verify-tag v1\ntest \"$(git rev-parse 'v1^{}')\" = \"$(git rev-parse HEAD)\"\nssh-keygen -q -t ed25519 -N '' -f \"$lab/other\"\nprintf 'other@example.invalid %s\\n' \"$(cat \"$lab/other.pub\")\" > \"$lab/untrusted\"\nif git -c gpg.ssh.allowedSignersFile=\"$lab/untrusted\" verify-commit HEAD; then exit 1; fi\ngit verify-commit HEAD\ngit log -1 --show-signature\necho 'PASS: SSH commit and tag trust verification'\n~~~\n\nssh-keygen -t ed25519 создаёт ключ; -N '' задаёт пустую парольную фразу только для одноразового учебного ключа. allowed содержит principal и публичную часть. -S и -s подписывают коммит и метку. С доверенным списком обе проверки успешны; замена списка на другой ключ через -c приводит к отказу verify-commit. Исходный подписанный объект при этом не изменяется. В работе не создавайте бесконтрольные незашифрованные постоянные ключи и не копируйте закрытый ключ в репозиторий. CI проверяет локальную SSH-подпись, а не доверие конкретного хостинга.\n\n## Самостоятельная работа\n\nСоздайте второй подписанный коммит, сравните OID после amend с новым подписанием. Проверьте unsigned-коммит через verify-commit. Изучите gpg.ssh.revocationFile и спроектируйте процедуру отзыва ключа. Сравните локальную проверку с политикой обязательной подписи на сервере.",
      "terms": [
        [
          "Signature",
          "Криптографическое доказательство владения ключом."
        ],
        [
          "Principal",
          "Идентификатор доверенной стороны."
        ],
        [
          "Allowed signers",
          "Список доверенных публичных ключей."
        ],
        [
          "Revocation",
          "Отзыв доверия к ключу."
        ],
        [
          "OID",
          "Идентификатор подписанного объекта."
        ]
      ],
      "steps": [
        [
          "Байты объекта",
          "Данные"
        ],
        [
          "Закрытый ключ",
          "Подпись"
        ],
        [
          "Публичный ключ",
          "Проверка"
        ],
        [
          "Политика",
          "Доверие principal"
        ],
        [
          "Результат",
          "Код проверки"
        ]
      ],
      "question": [
        "Доказывает ли успешная подпись отсутствие вредоносного кода?",
        "Нет, подпись подтверждает подписанные данные и ключ, не качество содержимого."
      ],
      "sources": [
        "gitteam-git-commit",
        "gitteam-git-tag",
        "gitteam-git-verify-commit",
        "gitteam-git-verify-tag",
        "gitteam-git-config"
      ],
      "pass": "PASS: SSH commit and tag trust verification"
    },
    {
      "id": "git-dependencies-lab",
      "after": "git-signatures-lab",
      "min": 1,
      "title": "Submodules и subtree: управление версиями зависимостей",
      "summary": "Исследуем gitlink, обновление закреплённой версии и границы вложенных репозиториев.",
      "body": "## Вложенный проект как отдельная история\n\nSubmodule связывает путь в основном репозитории с конкретным коммитом другого репозитория. В дереве основного проекта запись имеет режим 160000 (gitlink); она хранит OID коммита зависимости, а не её файлы. .gitmodules — версионируемое описание путей и URL, локальная конфигурация содержит дополнительные настройки. Вложенный репозиторий имеет собственные refs, индекс и историю. Клонирование основного проекта не обязательно получает содержимое зависимости без --recurse-submodules или submodule update --init.\n\nОбычный submodule update извлекает закреплённый коммит, часто в detached HEAD. Для обновления зависимости сначала получите и проверьте её новую версию, затем подготовьте изменившийся gitlink в основном репозитории. Публикация основного коммита не публикует автоматически коммит вложенного проекта; он должен быть доступен другим разработчикам. --remote использует настроенный источник обновления, но не отменяет необходимость зафиксировать новый OID в родительском проекте.\n\n## Выбор механизма\n\nSubtree интегрирует файлы зависимости в историю основного проекта, иногда с сохранением или squash истории внешнего проекта. Обычный checkout получает файлы без отдельного init, но синхронизация с upstream требует дисциплины. Git subtree может поставляться как дополнительный скрипт и зависит от установки. Vendoring фиксирует копию исходников; пакетный менеджер обычно лучше решает распространение и разрешение версий. Выбор определяется лицензией, обновлением, воспроизводимостью и требованиями к аудиту. Не запускайте произвольные команды из .gitmodules; протоколы и URL должны соответствовать политике доверия.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux; для подписей дополнительно OpenSSH с ssh-keygen. Сохраните блок как файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт создаёт временный каталог, отключает внешние настройки, не использует сеть и удаляет только созданный каталог при выходе. Не переносите локальные исключения безопасности в рабочую конфигурацию.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\ngit init -q -b main \"$lab/library\"\ngit -C \"$lab/library\" config user.name Library\ngit -C \"$lab/library\" config user.email library@example.invalid\necho v1 > \"$lab/library/lib.txt\"\ngit -C \"$lab/library\" add lib.txt\ngit -C \"$lab/library\" commit -qm V1\nv1=$(git -C \"$lab/library\" rev-parse HEAD)\ngit -c protocol.file.allow=always submodule add \"$lab/library\" vendor/library\ngit commit -qm 'Pin library V1'\ntest \"$(git ls-tree HEAD vendor/library | cut -d' ' -f1)\" = 160000\ntest \"$(git rev-parse HEAD:vendor/library)\" = \"$v1\"\necho v2 > \"$lab/library/lib.txt\"\ngit -C \"$lab/library\" commit -qam V2\nv2=$(git -C \"$lab/library\" rev-parse HEAD)\ngit -C vendor/library fetch -q origin\ngit -C vendor/library switch --detach \"$v2\"\ngit add -- vendor/library\ngit commit -qm 'Pin library V2'\ngit clone -q \"$lab/repo\" \"$lab/consumer\"\ngit -C \"$lab/consumer\" -c protocol.file.allow=always submodule update --init\ntest \"$(git -C \"$lab/consumer/vendor/library\" rev-parse HEAD)\" = \"$v2\"\ntest \"$(cat \"$lab/consumer/vendor/library/lib.txt\")\" = v2\ntest \"$(git -C \"$lab/consumer\" rev-parse HEAD:vendor/library)\" = \"$v2\"\necho 'PASS: submodule pinned gitlink reproduced'\n~~~\n\nprotocol.file.allow=always используется исключительно для конкретных вызовов с доверенным локальным учебным источником, не записывается глобально. git ls-tree проверяет режим gitlink. После обновления вложенной копии git add vendor/library подготавливает новый OID, не копирует файлы библиотеки в основное дерево. Независимый consumer воспроизводит закреплённую V2 через update --init. В рабочем проекте сначала опубликуйте зависимость в доступном репозитории, проверьте права и URL. Не ослабляйте политику протоколов ради случайно полученного .gitmodules.\n\n## Самостоятельная работа\n\nВ отдельном опыте измените файл внутри submodule без коммита и исследуйте status и diff --submodule. Сравните update --init и update --remote, затем закрепите OID. Если доступна команда git subtree, создайте учебную интеграцию через subtree add --prefix и сравните тип записи дерева с gitlink.",
      "terms": [
        [
          "Gitlink",
          "Запись дерева с OID вложенного коммита."
        ],
        [
          "Submodule",
          "Отдельный репозиторий, связанный с путём."
        ],
        [
          ".gitmodules",
          "Версионируемое описание зависимости."
        ],
        [
          "Subtree",
          "Интеграция файлов в основную историю."
        ],
        [
          "Vendoring",
          "Хранение копии исходников зависимости."
        ]
      ],
      "steps": [
        [
          "Library",
          "Отдельная история"
        ],
        [
          "Gitlink",
          "Закреплённый OID"
        ],
        [
          "Update",
          "Получение версии"
        ],
        [
          "Parent commit",
          "Новый pin"
        ],
        [
          "Consumer",
          "Воспроизведение"
        ]
      ],
      "question": [
        "Хранятся ли файлы submodule в дереве родительского коммита?",
        "Нет, gitlink хранит ссылку на конкретный коммит."
      ],
      "sources": [
        "gitteam-git-submodule",
        "gitteam-gitsubmodules",
        "gitteam-gitmodules",
        "gitteam-git-ls-tree",
        "gitteam-git-config"
      ],
      "pass": "PASS: submodule pinned gitlink reproduced"
    },
    {
      "id": "git-attributes-lab",
      "after": "git-dependencies-lab",
      "min": 1,
      "title": "Attributes, фильтры, окончания строк и Git LFS",
      "summary": "Проверяем канонические байты blob и рабочую копию, разбираем фильтры и внешнее хранение.",
      "body": "## Атрибуты управляют представлением файлов\n\n.gitattributes задаёт правила для путей: text, eol, diff, merge, filter, working-tree-encoding и другие атрибуты. Правила могут происходить из разных уровней, включая .git/info/attributes; git check-attr помогает увидеть итоговое значение. text управляет нормализацией окончаний строк, eol задаёт представление в рабочем дереве. Например, text eol=crlf может хранить LF в blob и выдавать CRLF при checkout. Включение правила не переписывает существующую историю: для переиндексации отслеживаемых файлов используют git add --renormalize после анализа diff.\n\nClean-фильтр преобразует рабочие байты при добавлении, smudge-фильтр — при извлечении, process-фильтр может обслуживать несколько путей. Их реализация определяется конфигурацией, а не только строкой в .gitattributes. Не устанавливайте незнакомые исполняемые фильтры. Преобразование должно быть воспроизводимым, иначе появятся неожиданные изменения. Атрибуты diff и merge выбирают механизмы сравнения и объединения; они не делают произвольный бинарный формат безопасно сливаемым.\n\n## Git LFS\n\nGit LFS — дополнительная система хранения: в Git хранится небольшой текстовый pointer с версией спецификации, SHA-256 OID и размером, а содержимое большого файла передаётся отдельному LFS-сервису. Это не обычная delta-компрессия и не partial clone Git. Для воспроизводимого checkout нужны соответствующий клиент, доступ к объектам LFS и политика хранения сервера. Удаление файла из последнего коммита не обязательно удаляет старые Git или LFS-объекты. Не следует считать mirror Git полной резервной копией LFS.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux; для подписей дополнительно OpenSSH с ssh-keygen. Сохраните блок как файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт создаёт временный каталог, отключает внешние настройки, не использует сеть и удаляет только созданный каталог при выходе. Не переносите локальные исключения безопасности в рабочую конфигурацию.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nprintf '*.txt text eol=crlf\\n' > .gitattributes\nprintf 'one\\r\\ntwo\\r\\n' > note.txt\ngit add -- .gitattributes note.txt\ngit commit -qm Normalize\ngit check-attr text eol -- note.txt\ngit show HEAD:note.txt > \"$lab/blob\"\nprintf 'one\\ntwo\\n' > \"$lab/expected-lf\"\ncmp \"$lab/blob\" \"$lab/expected-lf\"\nrm -- note.txt\ngit restore -- note.txt\nprintf 'one\\r\\ntwo\\r\\n' > \"$lab/expected-crlf\"\ncmp note.txt \"$lab/expected-crlf\"\ntest -z \"$(git status --porcelain)\"\ngit config filter.atlas.clean 'tr a-z A-Z'\ngit config filter.atlas.smudge cat\ngit config filter.atlas.required true\nprintf '\\n*.demo filter=atlas\\n' >> .gitattributes\nprintf 'demo\\n' > example.demo\ngit add -- .gitattributes example.demo\ngit commit -qm 'Demonstrate clean filter'\ntest \"$(git show HEAD:example.demo)\" = DEMO\ntest \"$(cat example.demo)\" = demo\ntest -z \"$(git status --porcelain)\"\necho 'PASS: attributes canonical bytes and clean filter'\n~~~\n\ncmp сравнивает байты, а не визуальное отображение текста. Первый тест подтверждает LF в blob и CRLF после restore. Второй демонстрирует clean-фильтр с фиксированными ASCII-байтами: lowercase на диске и uppercase в объекте. smudge=cat не восстанавливает исходный регистр; это намеренно упрощённый пример необратимого преобразования, не производственная настройка. required заставляет Git считать ошибку фильтра существенной. Для LFS в данной лаборатории нет внешнего сервера и не проверяется загрузка больших объектов.\n\n## Самостоятельная работа\n\nДобавьте ранее сохранённый CRLF-файл, измените атрибуты, исследуйте git add --renormalize и diff --cached. Сравните git check-attr --all с правилами в .git/info/attributes. Изучите pointer LFS и спроектируйте резервирование Git и LFS отдельно; не отправляйте большие учебные данные на реальный сервис.",
      "terms": [
        [
          "Attribute",
          "Правило для пути."
        ],
        [
          "Clean filter",
          "Преобразование при добавлении."
        ],
        [
          "Smudge filter",
          "Преобразование при извлечении."
        ],
        [
          "EOL",
          "Представление конца строки."
        ],
        [
          "LFS pointer",
          "Ссылка на внешний объект большого файла."
        ]
      ],
      "steps": [
        [
          "Рабочие байты",
          "CRLF / вход фильтра"
        ],
        [
          "Clean",
          "Нормализация"
        ],
        [
          "Blob",
          "Канонические байты"
        ],
        [
          "Checkout",
          "Smudge / EOL"
        ],
        [
          "Рабочий файл",
          "Выбранное представление"
        ]
      ],
      "question": [
        "Обязан ли blob совпадать побайтно с рабочим файлом?",
        "Нет, атрибуты и фильтры могут преобразовать представление."
      ],
      "sources": [
        "gitteam-gitattributes",
        "gitteam-git-check-attr",
        "gitteam-git-add",
        "gitteam-git-config",
        "gitteam-lfs"
      ],
      "pass": "PASS: attributes canonical bytes and clean filter"
    },
    {
      "id": "git-maintenance-lab",
      "after": "git-attributes-lab",
      "min": 2,
      "title": "Maintenance: commit-graph, multi-pack-index и целостность",
      "summary": "Создаём несколько packs, строим вспомогательные индексы и проверяем неизменность истории.",
      "body": "## Ускорение без смены логической модели\n\nGit использует разные структуры для ускорения чтения и обхода. Commit-graph хранит сведения о коммитах и родителях, поколения и при соответствующем режиме Bloom-фильтры изменённых путей. Он может ускорить поиск предков и историю по путям, но не является заменой объектной базы. Bloom-фильтр допускает ложноположительные совпадения; окончательное решение требует проверки. Multi-pack-index (MIDX) сопоставляет OID с pack и смещением, позволяя эффективно обращаться к нескольким packs без немедленной полной переупаковки.\n\ngit maintenance предоставляет задачи обслуживания: commit-graph, loose-objects, incremental-repack и другие, в зависимости от версии и конфигурации. git gc объединяет некоторые операции обслуживания и очистки. Repack изменяет физическое представление, сохраняя идентичность логических объектов. Политика хранения недостижимых объектов зависит от reflog, возраста и конфигурации; немедленный prune может уничтожить данные восстановления и конфликтовать с параллельной записью.\n\n## Измерения и диагностика\n\nПеред изменением обслуживания измеряйте число объектов, размеры, время типовых операций и нагрузку. Не делайте вывод только из числа packs. commit-graph verify и multi-pack-index verify проверяют соответствующие структуры, fsck проверяет объектную базу и связность. Успешная проверка не гарантирует корректность приложения или наличие всех внешних LFS-объектов. Для критичного сервера нужны резервное копирование, наблюдение за конкурентными операциями и проверенное восстановление. Не редактируйте pack или index вручную.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux; для подписей дополнительно OpenSSH с ssh-keygen. Сохраните блок как файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт создаёт временный каталог, отключает внешние настройки, не использует сеть и удаляет только созданный каталог при выходе. Не переносите локальные исключения безопасности в рабочую конфигурацию.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nfor n in $(seq 1 8); do\n  echo \"$n\" > series.txt\n  git add -- series.txt\n  git commit -qm \"Series $n\"\n  if [ \"$n\" = 4 ]; then git repack -d; fi\ndone\ngit repack -d\ntip=$(git rev-parse HEAD)\ntree=$(git rev-parse 'HEAD^{tree}')\nbefore=$(git rev-list --count HEAD)\ngit count-objects -v\ngit commit-graph write --reachable --changed-paths\ngit commit-graph verify\ngit multi-pack-index write\ngit multi-pack-index verify\ntest -f \"$(git rev-parse --git-path objects/pack/multi-pack-index)\"\ngit maintenance run --task=commit-graph\ntest \"$(git rev-parse HEAD)\" = \"$tip\"\ntest \"$(git rev-parse 'HEAD^{tree}')\" = \"$tree\"\ntest \"$(git rev-list --count HEAD)\" = \"$before\"\ntest \"$(git show HEAD:series.txt)\" = 8\ngit fsck --full\necho 'PASS: maintenance indexes preserve history'\n~~~\n\nrepack -d упаковывает ещё не упакованные достижимые объекты в обычном режиме и удаляет избыточные packs. Две серии позволяют создать отдельные packs. commit-graph write --reachable --changed-paths строит граф с информацией об изменённых путях; verify проверяет его. multi-pack-index write и verify создают и проверяют общий индекс. maintenance run --task=commit-graph запускает конкретную задачу, не устанавливает периодическое расписание. Проверяем неизменность вершины, дерева, числа коммитов и содержимого после обслуживания. Не запускаем немедленное удаление объектов.\n\n## Самостоятельная работа\n\nСравните время rev-list и log -- PATH до и после построения графа на более длинной синтетической истории, повторите измерение несколько раз. Изучите git count-objects -vH и git verify-pack -v. Составьте план обслуживания сервера с отдельной политикой хранения и восстановлением из резервной копии.",
      "terms": [
        [
          "Commit-graph",
          "Вспомогательная структура обхода."
        ],
        [
          "Bloom filter",
          "Вероятностный фильтр путей."
        ],
        [
          "MIDX",
          "Индекс нескольких packs."
        ],
        [
          "Maintenance",
          "Набор задач обслуживания."
        ],
        [
          "Retention",
          "Правила сохранения объектов."
        ]
      ],
      "steps": [
        [
          "Объекты",
          "Несколько packs"
        ],
        [
          "Граф",
          "Ускорение обхода"
        ],
        [
          "MIDX",
          "Ускорение поиска"
        ],
        [
          "Maintenance",
          "Обновление структур"
        ],
        [
          "Verify",
          "Проверка и неизменность OID"
        ]
      ],
      "question": [
        "Меняет ли commit-graph write OID коммитов?",
        "Нет, он строит вспомогательные данные."
      ],
      "sources": [
        "gitteam-git-maintenance",
        "gitteam-git-gc",
        "gitteam-git-repack",
        "gitteam-git-commit-graph",
        "gitteam-git-multi-pack-index",
        "gitteam-gitformat-commit-graph",
        "gitteam-gitformat-pack",
        "gitteam-git-fsck"
      ],
      "pass": "PASS: maintenance indexes preserve history"
    },
    {
      "id": "git-repository-security",
      "after": "git-maintenance-lab",
      "min": 0,
      "title": "Безопасность Git: секреты, доверие к репозиторию и история",
      "summary": "Проверяем .gitignore, отслеживаемые файлы и сохранность удалённого значения в истории.",
      "body": "## Секрет не должен попадать в объектную базу\n\n.gitignore исключает подходящие неотслеживаемые пути из обычного добавления. Он не удаляет уже отслеживаемые файлы и не гарантирует отсутствие секретов в других путях. git add -f может намеренно обойти исключение. Для конфигурации храните безопасные шаблоны, секреты передавайте через подходящий менеджер секретов или локальное окружение. До коммита проверяйте git status и diff --cached; автоматический сканер дополняет, но не заменяет проверку.\n\nЕсли настоящий ключ попал в опубликованный репозиторий, сначала отзовите или ротируйте его через соответствующий сервис, оцените возможное использование и ограничьте доступ. Простое удаление файла следующим коммитом не удаляет старые объекты. Переписывание истории требует согласования с владельцами, резервирования, учёта клонов, forks, кешей, refs, LFS и политики хостинга. Даже переписанная история не гарантирует уничтожения всех копий. Не публикуйте реальные секреты в учебных примерах и отчётах.\n\n## Доверие к окружению\n\nКод из репозитория, сборочные сценарии, hooks, фильтры, submodules и внешние инструменты могут выполнять действия с правами пользователя. Изучайте их до запуска, ограничивайте доступ к секретам и рабочим данным. safe.directory предназначен для доверенных исключений проверки владения; не отключайте защиту широким wildcard. URL remotes и конфигурация могут содержать чувствительные данные. Не выводите полную конфигурацию или трассировки в публичный CI без редактирования. Подпись объекта не делает произвольный код безопасным.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux; для подписей дополнительно OpenSSH с ssh-keygen. Сохраните блок как файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт создаёт временный каталог, отключает внешние настройки, не использует сеть и удаляет только созданный каталог при выходе. Не переносите локальные исключения безопасности в рабочую конфигурацию.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\nprintf '.env\\n*.secret\\n' > .gitignore\nprintf 'TOKEN=atlas-demo-not-a-real-secret\\n' > .env\ngit add -- .gitignore\ngit commit -qm Ignore\ngit check-ignore -q .env\ntest -z \"$(git ls-files -- .env)\"\ngit add -f -- .env\ngit commit -qm 'Simulated accidental tracking'\nleak=$(git rev-parse HEAD)\nprintf 'TOKEN=atlas-demo-rotated\\n' > .env\ngit add -- .env\ntest \"$(git show :.env)\" = 'TOKEN=atlas-demo-rotated'\ngit restore --staged -- .env\ngit rm -f -- .env\ngit commit -qm 'Remove tracked placeholder'\ntest ! -e .env\ntest -z \"$(git ls-files -- .env)\"\ntest \"$(git show \"$leak:.env\")\" = 'TOKEN=atlas-demo-not-a-real-secret'\ngit merge-base --is-ancestor \"$leak\" HEAD\necho 'PASS: ignored tracked and historical placeholder'\n~~~\n\nВсе значения в опыте вымышленные. check-ignore -q проверяет исключение кодом возврата, ls-files — отслеживаемые записи. -f у add намеренно демонстрирует ошибку только с безопасной заглушкой. После первого коммита .env отслеживается, поэтому обычный add подготавливает новое значение несмотря на ignore. git rm -f удаляет учебный файл с локальной правкой; в реальном проекте не применяйте принудительное удаление без сохранения нужных данных. После коммита удаления старый объект остаётся доступным через leak. Это показывает, почему удаление последней версии не является очисткой истории или отзывом ключа.\n\n## Самостоятельная работа\n\nСоздайте .env.example с безопасным шаблоном и исключите настоящий .env. Сравните check-ignore -v и ls-files. Составьте план реагирования на вымышленную утечку: отзыв, оценка доступа, уведомление, очистка истории по согласованию и повторная проверка. Не используйте настоящие ключи для эксперимента.",
      "terms": [
        [
          "Secret",
          "Данные, дающие доступ к ресурсу."
        ],
        [
          "Ignored",
          "Неотслеживаемый путь, исключённый правилом."
        ],
        [
          "Tracked",
          "Путь в индексе."
        ],
        [
          "Rotation",
          "Замена скомпрометированного ключа."
        ],
        [
          "Trust boundary",
          "Граница доверия к коду и окружению."
        ]
      ],
      "steps": [
        [
          "Проверка",
          "status / diff"
        ],
        [
          "Ignore",
          "Исключение новых путей"
        ],
        [
          "Коммит",
          "Снимок сохраняется"
        ],
        [
          "Удаление",
          "Новый снимок"
        ],
        [
          "Реагирование",
          "Отзыв и согласованная очистка"
        ]
      ],
      "question": [
        "Удаляет ли .gitignore секрет из уже существующего коммита?",
        "Нет, старые объекты остаются в истории."
      ],
      "sources": [
        "gitteam-gitignore",
        "gitteam-git-check-ignore",
        "gitteam-git-add",
        "gitteam-git-config",
        "gitteam-git-rm"
      ],
      "pass": "PASS: ignored tracked and historical placeholder",
      "junior": {
        "title": "Как не отправить секреты в Git",
        "body": "## Что нельзя сохранять в истории\n\nПароли, токены, закрытые ключи и реальные конфигурации с доступом к сервисам не должны попадать в коммиты. Git хранит старые снимки, поэтому удаление файла после публикации не обязательно удаляет его прежнюю версию. Используйте безопасные шаблоны и отдельное хранилище секретов.\n\n## Практика с вымышленным значением\n\nВ отдельном учебном каталоге выполните:\n\n~~~sh\ngit init -b main\ngit config user.name Student\ngit config user.email student@example.invalid\necho .env > .gitignore\necho 'TOKEN=demo-placeholder' > .env\ngit add .gitignore\ngit commit -m Ignore\ngit status --short --ignored\ngit check-ignore -v .env\n~~~\n\nВ выводе видно, что .env игнорируется. Не используйте настоящий токен. Файл .gitignore сам должен быть отслеживаемым, чтобы правила были у команды. Если файл уже был сохранён в Git, добавление имени в .gitignore не перестанет отслеживать его автоматически.\n\n## Проверка перед коммитом\n\nПосмотрите git status и git diff --cached до сохранения. Не добавляйте все файлы вслепую. Если реальный ключ уже опубликован, считайте его потенциально скомпрометированным, отзовите или замените через сервис и сообщите ответственным за безопасность проекта. Не пытайтесь исправить утечку только удалением файла. Объясните, почему старая история может содержать данные даже после нового коммита."
      }
    },
    {
      "id": "git-team-review",
      "after": "git-repository-security",
      "min": 0,
      "title": "Командная работа: Pull Request, review и стратегии ветвления",
      "summary": "Моделируем проверяемую feature-ветку, обновление базы и интеграцию только после тестов.",
      "body": "## Процесс выбирают под команду и продукт\n\nPull Request или Merge Request — сущность платформы для обсуждения и проверки изменения, не объект формата Git. Она обычно связывает исходную и целевую ветки, diff, обсуждения, проверки и разрешения. Git хранит историю, а платформа применяет правила доступа и обязательных проверок. Review должен оценивать требования, корректность, тесты, безопасность, миграции и эксплуатационные последствия, а не только стиль.\n\nTrunk-based development предпочитает короткие ветки и частую интеграцию в основную линию, иногда с feature flags. GitFlow использует более длительные линии разработки и релизные ветки; он может быть полезен при соответствующем релизном цикле, но добавляет интеграционные издержки. Для нескольких поддерживаемых версий часто нужны release branches и контролируемые backports. Не существует универсальной стратегии для всех команд. Merge, squash и rebase меняют историю по-разному; выберите политику с учётом аудита и bisect.\n\n## Проверяем именно интегрируемое состояние\n\nCI на feature не обязательно проверяет результат объединения с новой main. Перед интеграцией важно проверить актуальное состояние, а при высокой конкурентности использовать очередь слияния или эквивалентную серверную проверку. Required checks и review должны применяться к нужному коммиту или результату слияния. Локальный зелёный тест не обеспечивает серверную блокировку. Автор описывает причину, область изменения, тесты, миграции и риски; reviewer проверяет факты и запрашивает исправления. Не записывайте непроведённые проверки как успешные.\n\n## Практика: одноразовый репозиторий\n\nНужны Bash, Git 2.34 или новее и стандартные утилиты Linux; для подписей дополнительно OpenSSH с ssh-keygen. Сохраните блок как файл и выполните bash вне существующего Git-контекста с переопределёнными GIT_DIR, GIT_INDEX_FILE и подобными переменными. Скрипт создаёт временный каталог, отключает внешние настройки, не использует сеть и удаляет только созданный каталог при выходе. Не переносите локальные исключения безопасности в рабочую конфигурацию.\n\n~~~sh\nset -euo pipefail\nlab=$(mktemp -d)\ntrap 'rm -rf -- \"$lab\"' EXIT\nexport GIT_CONFIG_NOSYSTEM=1 GIT_CONFIG_GLOBAL=/dev/null\ngit init -q -b main --object-format=sha1 \"$lab/repo\"\ncd \"$lab/repo\"\ngit config user.name 'Atlas Student'\ngit config user.email 'student@example.invalid'\ngit config core.autocrlf false\ngit config commit.gpgsign false\ngit config tag.gpgSign false\ngit config gc.auto 0\ngit config rerere.enabled false\ngit config merge.conflictStyle merge\ngit config rebase.autoStash false\ngit config rebase.autoSquash false\necho base > base.txt\ngit add -- base.txt\ngit commit -qm Base\nbase=$(git rev-parse HEAD)\necho 2 > limit.txt\ngit add -- limit.txt\ngit commit -qm 'Set limit'\ngit switch -c feature\necho 3 > limit.txt\ngit commit -qam 'Increase limit'\ngit switch main\necho 4 > capacity.txt\ngit add -- capacity.txt\ngit commit -qm 'Set capacity'\nmain=$(git rev-parse HEAD)\ngit diff --stat main...feature\ngit switch feature\ngit rebase main\ngit switch -c candidate main\ngit merge --no-ff --no-edit feature\nlimit=$(cat limit.txt)\ncapacity=$(cat capacity.txt)\ntest \"$limit\" -le \"$capacity\"\ntest \"$(git rev-parse HEAD^1)\" = \"$main\"\ncandidate=$(git rev-parse HEAD)\ngit switch main\ngit merge --ff-only candidate\ntest \"$(git rev-parse HEAD)\" = \"$candidate\"\ngit branch -d candidate feature\ngit log --graph --oneline --all\necho 'PASS: review candidate checked before integration'\n~~~\n\nВ опыте main получает ограничение capacity независимо от feature. После rebase создаётся candidate, объединяющая актуальную основную вершину и проверяемую feature. Тест сравнивает числовые значения лимита и ёмкости; только после успеха основная ветка перемещается к кандидату. --ff-only не создаёт другой итоговый коммит. Это локальная модель проверки интегрируемого дерева, а не реализация GitHub PR, merge queue или обязательного server-side gate. В реальной системе main могла бы измениться во время теста; используйте серверную проверку актуальности.\n\n## Самостоятельная работа\n\nИзмените capacity на 1 и убедитесь, что тест кандидата отклоняет несовместимую функцию. Составьте описание PR с причиной, тестами и рисками. Выберите модель ветвления для SaaS с ежедневным релизом и для продукта с несколькими поддерживаемыми версиями, аргументируйте различия.",
      "terms": [
        [
          "PR / MR",
          "Запрос на обсуждение и интеграцию."
        ],
        [
          "Review",
          "Проверка изменения коллегами."
        ],
        [
          "Trunk-based",
          "Частая интеграция в основную линию."
        ],
        [
          "Merge queue",
          "Серверная очередь проверяемых слияний."
        ],
        [
          "Required check",
          "Обязательная проверка перед интеграцией."
        ]
      ],
      "steps": [
        [
          "Feature",
          "Изолированная правка"
        ],
        [
          "Review",
          "Diff и смысл"
        ],
        [
          "Актуальная main",
          "Новая база"
        ],
        [
          "Candidate",
          "Проверка результата"
        ],
        [
          "Integration",
          "Публикация по политике"
        ]
      ],
      "question": [
        "Гарантирует ли зелёный тест старой feature корректность после слияния с новой main?",
        "Нет, нужно проверить актуальное интегрируемое состояние."
      ],
      "sources": [
        "gitteam-git-merge",
        "gitteam-git-rebase",
        "gitteam-git-diff",
        "gitteam-git-branch"
      ],
      "pass": "PASS: review candidate checked before integration",
      "junior": {
        "title": "Как подготовить изменение к проверке коллегами",
        "body": "## Работа в команде\n\nКогда вы закончили задачу, коллеги должны понимать, что изменилось и как проверить результат. Обычно работу сохраняют в отдельной ветке и открывают Pull Request или Merge Request на платформе. Это запрос на обсуждение и объединение, а не специальный тип коммита Git.\n\n## Практика\n\nВ новом учебном репозитории с настроенным именем и email выполните:\n\n~~~sh\necho initial > README.md\ngit add README.md\ngit commit -m Initial\ngit switch -c docs\necho usage >> README.md\ngit add README.md\ngit commit -m 'Document usage'\ngit diff main...docs\ngit log --oneline main..docs\n~~~\n\nПредполагается, что репозиторий создан через git init -b main. Сравнение показывает изменение документации, а log — коммиты ветки docs, которых нет в main. В реальном проекте отправьте свою ветку на согласованный сервер и откройте запрос на проверку.\n\n## Что написать в запросе\n\nОбъясните цель, важные изменения, выполненные проверки и известные ограничения. Не обещайте, что тесты прошли, если их не запускали. Перед объединением проверьте актуальное состояние основной ветки. Если reviewer обнаружил ошибку, исправьте её и повторите проверку. Не объединяйте изменение только потому, что Git не показал конфликта: смысловые проблемы могут быть незаметны инструменту."
      }
    }
  ],
  "sources": {
    "gitteam-githooks": {
      "title": "githooks",
      "url": "https://git-scm.com/docs/githooks",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-config": {
      "title": "git-config",
      "url": "https://git-scm.com/docs/git-config",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-commit": {
      "title": "git-commit",
      "url": "https://git-scm.com/docs/git-commit",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-receive-pack": {
      "title": "git-receive-pack",
      "url": "https://git-scm.com/docs/git-receive-pack",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-tag": {
      "title": "git-tag",
      "url": "https://git-scm.com/docs/git-tag",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-verify-commit": {
      "title": "git-verify-commit",
      "url": "https://git-scm.com/docs/git-verify-commit",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-verify-tag": {
      "title": "git-verify-tag",
      "url": "https://git-scm.com/docs/git-verify-tag",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-submodule": {
      "title": "git-submodule",
      "url": "https://git-scm.com/docs/git-submodule",
      "description": "Официальное руководство Git."
    },
    "gitteam-gitsubmodules": {
      "title": "gitsubmodules",
      "url": "https://git-scm.com/docs/gitsubmodules",
      "description": "Официальное руководство Git."
    },
    "gitteam-gitmodules": {
      "title": "gitmodules",
      "url": "https://git-scm.com/docs/gitmodules",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-ls-tree": {
      "title": "git-ls-tree",
      "url": "https://git-scm.com/docs/git-ls-tree",
      "description": "Официальное руководство Git."
    },
    "gitteam-gitattributes": {
      "title": "gitattributes",
      "url": "https://git-scm.com/docs/gitattributes",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-check-attr": {
      "title": "git-check-attr",
      "url": "https://git-scm.com/docs/git-check-attr",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-add": {
      "title": "git-add",
      "url": "https://git-scm.com/docs/git-add",
      "description": "Официальное руководство Git."
    },
    "gitteam-lfs": {
      "title": "Git LFS pointer specification",
      "url": "https://github.com/git-lfs/git-lfs/blob/main/docs/spec.md",
      "description": "Спецификация формата pointer проекта Git LFS."
    },
    "gitteam-git-maintenance": {
      "title": "git-maintenance",
      "url": "https://git-scm.com/docs/git-maintenance",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-gc": {
      "title": "git-gc",
      "url": "https://git-scm.com/docs/git-gc",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-repack": {
      "title": "git-repack",
      "url": "https://git-scm.com/docs/git-repack",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-commit-graph": {
      "title": "git-commit-graph",
      "url": "https://git-scm.com/docs/git-commit-graph",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-multi-pack-index": {
      "title": "git-multi-pack-index",
      "url": "https://git-scm.com/docs/git-multi-pack-index",
      "description": "Официальное руководство Git."
    },
    "gitteam-gitformat-commit-graph": {
      "title": "gitformat-commit-graph",
      "url": "https://git-scm.com/docs/gitformat-commit-graph",
      "description": "Официальное руководство Git."
    },
    "gitteam-gitformat-pack": {
      "title": "gitformat-pack",
      "url": "https://git-scm.com/docs/gitformat-pack",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-fsck": {
      "title": "git-fsck",
      "url": "https://git-scm.com/docs/git-fsck",
      "description": "Официальное руководство Git."
    },
    "gitteam-gitignore": {
      "title": "gitignore",
      "url": "https://git-scm.com/docs/gitignore",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-check-ignore": {
      "title": "git-check-ignore",
      "url": "https://git-scm.com/docs/git-check-ignore",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-rm": {
      "title": "git-rm",
      "url": "https://git-scm.com/docs/git-rm",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-merge": {
      "title": "git-merge",
      "url": "https://git-scm.com/docs/git-merge",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-rebase": {
      "title": "git-rebase",
      "url": "https://git-scm.com/docs/git-rebase",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-diff": {
      "title": "git-diff",
      "url": "https://git-scm.com/docs/git-diff",
      "description": "Официальное руководство Git."
    },
    "gitteam-git-branch": {
      "title": "git-branch",
      "url": "https://git-scm.com/docs/git-branch",
      "description": "Официальное руководство Git."
    }
  }
};
const D=window.ATLAS_DATA,L=window.ATLAS_LEVELS,E=window.ATLAS_EDITORIAL;
Object.assign(D.sources,data.sources);
for(const row of data.rows){const {after,min,terms,steps,question,pass,junior,...chapter}=row;D.lessons.push({...chapter,course:"git",minutes:Math.ceil(chapter.body.split(/\s+/).length/110)+30});L.minimum[row.id]=min;const i=L.order.git.indexOf(after);if(i<0)throw Error("Missing Git prerequisite "+after);L.order.git.splice(i+1,0,row.id);E[row.id]={intro:row.summary,terms,diagram:{title:"Механизм",steps,kind:"flow",caption:"Логические связи и порядок операций."},questions:[question]};if(junior){L.junior[row.id]=junior;L.juniorTerms[row.id]=terms.slice(0,4);L.juniorDiagrams[row.id]={title:"Как это работает",steps,kind:"flow",caption:"Основные шаги."};L.juniorQuestions[row.id]=question;}}
})();
