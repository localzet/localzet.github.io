window.ATLAS_REFERENCE=[
  {
    "id": "linux",
    "title": "Linux и GNU",
    "scope": "Карта основных интерфейсов Bash, GNU coreutils, util-linux, iproute2 и systemd. Набор Linux-команд не имеет конечного глобального списка: каждый пакет добавляет свои программы. Полноту для конкретной машины проверяйте через compgen -c, man -k ., список установленных пакетов и справку утилит.",
    "check": "compgen -b | sort\ncompgen -c | sort -u\nman -k .\ninfo coreutils",
    "groups": [
      {
        "title": "Навигация и файловые операции",
        "entries": [
          {
            "name": "pwd",
            "description": "Текущий каталог",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/pwd-invocation.html",
            "specific": true,
            "options": [
              [
                "-P",
                "Физический путь без символических ссылок."
              ],
              [
                "-L",
                "Логический путь согласно окружению."
              ]
            ]
          },
          {
            "name": "ls",
            "description": "Список файлов",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/ls-invocation.html",
            "specific": true,
            "options": [
              [
                "-l",
                "Подробный формат."
              ],
              [
                "-a",
                "Включить скрытые имена, в том числе . и .."
              ],
              [
                "-h",
                "Человекочитаемые размеры вместе с -l или -s."
              ],
              [
                "-d",
                "Показать сами каталоги, а не их содержимое."
              ]
            ]
          },
          {
            "name": "dir",
            "description": "Список в кратком формате",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/dir-invocation.html",
            "specific": true
          },
          {
            "name": "vdir",
            "description": "Подробный список",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/vdir-invocation.html",
            "specific": true
          },
          {
            "name": "stat",
            "description": "Метаданные",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/stat-invocation.html",
            "specific": true,
            "options": [
              [
                "-c FORMAT",
                "Вывести указанный формат метаданных."
              ],
              [
                "-L",
                "Следовать символической ссылке."
              ]
            ]
          },
          {
            "name": "file",
            "description": "Определение формата",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-b",
                "Не выводить имя файла."
              ],
              [
                "-L",
                "Следовать символическим ссылкам."
              ]
            ]
          },
          {
            "name": "realpath",
            "description": "Канонический путь",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/realpath-invocation.html",
            "specific": true
          },
          {
            "name": "readlink",
            "description": "Разрешение ссылок",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/readlink-invocation.html",
            "specific": true,
            "options": [
              [
                "-f",
                "Канонизировать путь; последний компонент может отсутствовать."
              ]
            ]
          },
          {
            "name": "basename",
            "description": "Последний компонент пути",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/basename-invocation.html",
            "specific": true
          },
          {
            "name": "dirname",
            "description": "Каталог пути",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/dirname-invocation.html",
            "specific": true
          },
          {
            "name": "pathchk",
            "description": "Проверка имени пути",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/pathchk-invocation.html",
            "specific": true
          },
          {
            "name": "cp",
            "description": "Копирование",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/cp-invocation.html",
            "specific": true,
            "options": [
              [
                "-a",
                "Архивный режим с сохранением атрибутов по правилам GNU cp."
              ],
              [
                "-i",
                "Запросить подтверждение перед перезаписью."
              ],
              [
                "--reflink=auto",
                "Попробовать CoW-копирование, иначе обычная копия."
              ],
              [
                "--",
                "Конец опций перед именами файлов."
              ]
            ]
          },
          {
            "name": "mv",
            "description": "Перемещение",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html",
            "specific": true,
            "options": [
              [
                "-i",
                "Запросить подтверждение перезаписи."
              ],
              [
                "-n",
                "Не перезаписывать существующий файл; проверяйте семантику версии."
              ]
            ]
          },
          {
            "name": "rm",
            "description": "Удаление",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/rm-invocation.html",
            "specific": true,
            "options": [
              [
                "-i",
                "Запрашивать подтверждение."
              ],
              [
                "-r",
                "Рекурсивное удаление; применять только к известному каталогу."
              ],
              [
                "--",
                "Конец опций; не заменяет проверку пути."
              ]
            ]
          },
          {
            "name": "mkdir",
            "description": "Создание каталогов",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/mkdir-invocation.html",
            "specific": true,
            "options": [
              [
                "-p",
                "Создать недостающих родителей."
              ],
              [
                "-m MODE",
                "Задать права создаваемого каталога."
              ]
            ]
          },
          {
            "name": "rmdir",
            "description": "Удаление пустых каталогов",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/rmdir-invocation.html",
            "specific": true
          },
          {
            "name": "ln",
            "description": "Создание ссылок",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/ln-invocation.html",
            "specific": true,
            "options": [
              [
                "-s",
                "Создать символическую ссылку."
              ],
              [
                "-T",
                "Рассматривать назначение как обычный путь, не каталог (GNU)."
              ]
            ]
          },
          {
            "name": "touch",
            "description": "Временные метки",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/touch-invocation.html",
            "specific": true,
            "options": [
              [
                "-c",
                "Не создавать отсутствующий файл."
              ],
              [
                "-t STAMP",
                "Задать время в формате команды."
              ]
            ]
          },
          {
            "name": "truncate",
            "description": "Изменение длины файла",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/truncate-invocation.html",
            "specific": true,
            "options": [
              [
                "-s SIZE",
                "Изменить размер; сокращение уничтожает данные после новой границы."
              ]
            ]
          },
          {
            "name": "install",
            "description": "Установка файла с атрибутами",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/install-invocation.html",
            "specific": true
          },
          {
            "name": "mktemp",
            "description": "Безопасный временный объект",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/mktemp-invocation.html",
            "specific": true,
            "options": [
              [
                "-d",
                "Создать временный каталог."
              ],
              [
                "-p DIR",
                "Выбрать родительский каталог (GNU)."
              ]
            ]
          },
          {
            "name": "mkfifo",
            "description": "Именованный канал",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/mkfifo-invocation.html",
            "specific": true
          },
          {
            "name": "mknod",
            "description": "Специальный файл",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/mknod-invocation.html",
            "specific": true
          },
          {
            "name": "shred",
            "description": "Перезапись (ограничения носителя)",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/shred-invocation.html",
            "specific": true
          },
          {
            "name": "sync",
            "description": "Синхронизация данных",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sync-invocation.html",
            "specific": true
          },
          {
            "name": "find",
            "description": "Поиск по дереву",
            "url": "https://www.gnu.org/software/findutils/manual/html_mono/find.html",
            "specific": true,
            "options": [
              [
                "-type f",
                "Обычные файлы."
              ],
              [
                "-name PATTERN",
                "Шаблон имени, обычно заключают в кавычки."
              ],
              [
                "-maxdepth N",
                "Ограничить глубину обхода."
              ],
              [
                "-print0",
                "Вывести имена, разделённые NUL."
              ],
              [
                "-exec COMMAND {} +",
                "Передать группы найденных имён команде."
              ]
            ]
          },
          {
            "name": "xargs",
            "description": "Построение argv из ввода",
            "url": "https://www.gnu.org/software/findutils/manual/html_mono/find.html",
            "specific": true,
            "options": [
              [
                "-0",
                "Читать NUL-разделённые элементы."
              ],
              [
                "-r",
                "Не запускать команду на пустом вводе (GNU)."
              ],
              [
                "-n N",
                "Ограничить число аргументов за вызов."
              ]
            ]
          },
          {
            "name": "locate",
            "description": "Поиск по индексу",
            "url": "https://www.gnu.org/software/findutils/manual/html_mono/find.html",
            "specific": true
          }
        ]
      },
      {
        "title": "Текст, байты и потоки",
        "entries": [
          {
            "name": "cat",
            "description": "Объединение потоков",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/cat-invocation.html",
            "specific": true,
            "options": [
              [
                "-n",
                "Нумеровать строки."
              ],
              [
                "-A",
                "Показать управляющие символы в отображаемой форме (GNU)."
              ]
            ]
          },
          {
            "name": "tac",
            "description": "Строки в обратном порядке",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/tac-invocation.html",
            "specific": true
          },
          {
            "name": "nl",
            "description": "Нумерация строк",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/nl-invocation.html",
            "specific": true
          },
          {
            "name": "od",
            "description": "Дамп байтов",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/od-invocation.html",
            "specific": true
          },
          {
            "name": "base64",
            "description": "Кодирование Base64",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/base64-invocation.html",
            "specific": true
          },
          {
            "name": "base32",
            "description": "Кодирование Base32",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/base32-invocation.html",
            "specific": true
          },
          {
            "name": "basenc",
            "description": "Другие кодировки",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/basenc-invocation.html",
            "specific": true
          },
          {
            "name": "head",
            "description": "Начало",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/head-invocation.html",
            "specific": true,
            "options": [
              [
                "-n N",
                "Первые N строк."
              ],
              [
                "-c N",
                "Первые N байт."
              ]
            ]
          },
          {
            "name": "tail",
            "description": "Конец",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/tail-invocation.html",
            "specific": true,
            "options": [
              [
                "-n N",
                "Последние N строк."
              ],
              [
                "-f",
                "Следить за ростом файла."
              ],
              [
                "-F",
                "Следить по имени с повторными попытками (GNU)."
              ]
            ]
          },
          {
            "name": "sort",
            "description": "Сортировка",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sort-invocation.html",
            "specific": true,
            "options": [
              [
                "-n",
                "Числовой порядок."
              ],
              [
                "-r",
                "Обратный порядок."
              ],
              [
                "-k KEY",
                "Выбрать ключ сортировки."
              ],
              [
                "-u",
                "Вывести по одному элементу для равных ключей."
              ]
            ]
          },
          {
            "name": "uniq",
            "description": "Соседние дубликаты",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/uniq-invocation.html",
            "specific": true,
            "options": [
              [
                "-c",
                "Добавить число повторов."
              ],
              [
                "-d",
                "Вывести повторяющиеся соседние строки."
              ]
            ]
          },
          {
            "name": "cut",
            "description": "Выбор полей",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/cut-invocation.html",
            "specific": true,
            "options": [
              [
                "-d DELIM",
                "Разделитель полей."
              ],
              [
                "-f LIST",
                "Номера полей."
              ]
            ]
          },
          {
            "name": "paste",
            "description": "Объединение строк",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/paste-invocation.html",
            "specific": true
          },
          {
            "name": "join",
            "description": "Соединение по полю",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/join-invocation.html",
            "specific": true
          },
          {
            "name": "comm",
            "description": "Сравнение сортированных файлов",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/comm-invocation.html",
            "specific": true
          },
          {
            "name": "tr",
            "description": "Преобразование символов",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/tr-invocation.html",
            "specific": true,
            "options": [
              [
                "-d SET",
                "Удалить символы из набора."
              ],
              [
                "-s SET",
                "Сжать последовательности выбранных символов."
              ]
            ]
          },
          {
            "name": "wc",
            "description": "Подсчёт",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/wc-invocation.html",
            "specific": true,
            "options": [
              [
                "-l",
                "Количество переводов строки."
              ],
              [
                "-w",
                "Количество слов."
              ],
              [
                "-c",
                "Количество байт."
              ]
            ]
          },
          {
            "name": "tee",
            "description": "Дублирование потока",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/tee-invocation.html",
            "specific": true,
            "options": [
              [
                "-a",
                "Добавить в файл, а не перезаписать."
              ]
            ]
          },
          {
            "name": "split",
            "description": "Разбиение файла",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/split-invocation.html",
            "specific": true
          },
          {
            "name": "csplit",
            "description": "Разбиение по контексту",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/csplit-invocation.html",
            "specific": true
          },
          {
            "name": "fold",
            "description": "Перенос строк",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/fold-invocation.html",
            "specific": true
          },
          {
            "name": "fmt",
            "description": "Форматирование текста",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/fmt-invocation.html",
            "specific": true
          },
          {
            "name": "pr",
            "description": "Подготовка страниц",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/pr-invocation.html",
            "specific": true
          },
          {
            "name": "expand",
            "description": "Табы в пробелы",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/expand-invocation.html",
            "specific": true
          },
          {
            "name": "unexpand",
            "description": "Пробелы в табы",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/unexpand-invocation.html",
            "specific": true
          },
          {
            "name": "shuf",
            "description": "Случайная перестановка",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/shuf-invocation.html",
            "specific": true
          },
          {
            "name": "tsort",
            "description": "Топологическая сортировка",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/tsort-invocation.html",
            "specific": true
          },
          {
            "name": "grep",
            "description": "Поиск шаблонов",
            "url": "https://www.gnu.org/software/grep/manual/grep.html",
            "specific": true,
            "options": [
              [
                "-n",
                "Номера строк."
              ],
              [
                "-i",
                "Игнорировать регистр."
              ],
              [
                "-E",
                "Расширенные регулярные выражения."
              ],
              [
                "-F",
                "Искать фиксированные строки."
              ],
              [
                "-r",
                "Рекурсивный поиск."
              ],
              [
                "-q",
                "Не выводить строки; проверять код выхода."
              ]
            ]
          },
          {
            "name": "sed",
            "description": "Потоковое редактирование",
            "url": "https://www.gnu.org/software/sed/manual/sed.html",
            "specific": true,
            "options": [
              [
                "-n",
                "Не печатать строки автоматически."
              ],
              [
                "-E",
                "Расширенные регулярные выражения."
              ],
              [
                "-e SCRIPT",
                "Добавить сценарий обработки."
              ],
              [
                "-i[SUFFIX]",
                "Редактировать файлы на месте; сначала проверить без -i."
              ]
            ]
          },
          {
            "name": "awk",
            "description": "Обработка записей",
            "url": "https://www.gnu.org/software/gawk/manual/gawk.html",
            "specific": true,
            "options": [
              [
                "-F SEP",
                "Разделитель полей."
              ],
              [
                "-v NAME=VALUE",
                "Установить переменную до выполнения."
              ],
              [
                "-f FILE",
                "Прочитать программу из файла."
              ]
            ]
          },
          {
            "name": "diff",
            "description": "Различия",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-u",
                "Унифицированный diff."
              ],
              [
                "-r",
                "Рекурсивно сравнить каталоги."
              ]
            ]
          },
          {
            "name": "cmp",
            "description": "Побайтовое сравнение",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-s",
                "Только код результата, без обычного вывода."
              ]
            ]
          },
          {
            "name": "patch",
            "description": "Применение патча",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "less",
            "description": "Просмотр",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "xxd",
            "description": "Hex-дамп",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "jq",
            "description": "Обработка JSON",
            "url": "https://jqlang.org/manual/",
            "specific": true
          }
        ]
      },
      {
        "title": "Контрольные суммы, архивы и передача",
        "entries": [
          {
            "name": "cksum",
            "description": "Контрольные суммы",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/cksum-invocation.html",
            "specific": true
          },
          {
            "name": "md5sum",
            "description": "MD5 (не для криптографического доверия)",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/md5sum-invocation.html",
            "specific": true
          },
          {
            "name": "sha1sum",
            "description": "SHA-1 (устаревшая криптостойкость)",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sha1sum-invocation.html",
            "specific": true
          },
          {
            "name": "sha224sum",
            "description": "SHA-224",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sha224sum-invocation.html",
            "specific": true
          },
          {
            "name": "sha256sum",
            "description": "SHA-256",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sha256sum-invocation.html",
            "specific": true
          },
          {
            "name": "sha384sum",
            "description": "SHA-384",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sha384sum-invocation.html",
            "specific": true
          },
          {
            "name": "sha512sum",
            "description": "SHA-512",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sha512sum-invocation.html",
            "specific": true
          },
          {
            "name": "b2sum",
            "description": "BLAKE2",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/b2sum-invocation.html",
            "specific": true
          },
          {
            "name": "sum",
            "description": "Историческая контрольная сумма",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sum-invocation.html",
            "specific": true
          },
          {
            "name": "tar",
            "description": "Архивирование",
            "url": "https://www.gnu.org/software/tar/manual/tar.html",
            "specific": true,
            "options": [
              [
                "-c",
                "Создать архив."
              ],
              [
                "-t",
                "Перечислить содержимое."
              ],
              [
                "-x",
                "Извлечь в проверенный каталог."
              ],
              [
                "-z",
                "Использовать gzip."
              ],
              [
                "-f FILE",
                "Путь архива."
              ],
              [
                "-C DIR",
                "Изменить каталог для операции."
              ]
            ]
          },
          {
            "name": "gzip",
            "description": "Сжатие gzip",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-c",
                "Писать результат в stdout."
              ],
              [
                "-d",
                "Распаковать."
              ],
              [
                "-t",
                "Проверить целостность потока."
              ]
            ]
          },
          {
            "name": "gunzip",
            "description": "Распаковка gzip",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "bzip2",
            "description": "Сжатие bzip2",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "xz",
            "description": "Сжатие xz",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "zstd",
            "description": "Сжатие Zstandard",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "zip",
            "description": "ZIP-архив",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "unzip",
            "description": "Распаковка ZIP",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "rsync",
            "description": "Синхронизация файлов",
            "url": "https://download.samba.org/pub/rsync/rsync.1",
            "specific": true,
            "options": [
              [
                "-a",
                "Архивный режим."
              ],
              [
                "-n",
                "Пробный запуск без изменений."
              ],
              [
                "-v",
                "Подробности."
              ],
              [
                "--delete",
                "Удалять лишнее в назначении; сначала -n и проверка путей."
              ]
            ]
          },
          {
            "name": "scp",
            "description": "Копирование через SSH",
            "url": "https://man.openbsd.org/scp",
            "specific": true,
            "options": [
              [
                "-P PORT",
                "Порт SSH (заглавная P)."
              ],
              [
                "-r",
                "Копировать каталоги рекурсивно."
              ],
              [
                "-i FILE",
                "Ключ клиента."
              ]
            ]
          },
          {
            "name": "sftp",
            "description": "Передача через SFTP",
            "url": "https://man.openbsd.org/sftp",
            "specific": true
          }
        ]
      },
      {
        "title": "Права и учётные записи",
        "entries": [
          {
            "name": "id",
            "description": "Идентификаторы",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/id-invocation.html",
            "specific": true,
            "options": [
              [
                "-u",
                "Числовой UID."
              ],
              [
                "-g",
                "Основной GID."
              ],
              [
                "-G",
                "Все группы."
              ]
            ]
          },
          {
            "name": "groups",
            "description": "Группы",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/groups-invocation.html",
            "specific": true
          },
          {
            "name": "whoami",
            "description": "Эффективный пользователь",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/whoami-invocation.html",
            "specific": true
          },
          {
            "name": "who",
            "description": "Сессии",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/who-invocation.html",
            "specific": true
          },
          {
            "name": "users",
            "description": "Вошедшие пользователи",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/users-invocation.html",
            "specific": true
          },
          {
            "name": "logname",
            "description": "Имя login-сессии",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/logname-invocation.html",
            "specific": true
          },
          {
            "name": "chmod",
            "description": "Биты прав",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html",
            "specific": true,
            "options": [
              [
                "-R",
                "Рекурсивно изменить права; опасно без проверки дерева."
              ],
              [
                "--reference=FILE",
                "Взять mode с указанного файла (GNU)."
              ]
            ]
          },
          {
            "name": "chown",
            "description": "Владелец и группа",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/chown-invocation.html",
            "specific": true,
            "options": [
              [
                "-R",
                "Рекурсивно изменить владельца; только проверенное дерево."
              ],
              [
                "--reference=FILE",
                "Взять владельца и группу с указанного файла."
              ]
            ]
          },
          {
            "name": "chgrp",
            "description": "Группа",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/chgrp-invocation.html",
            "specific": true
          },
          {
            "name": "umask",
            "description": "Маска создания (builtin)",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "getfacl",
            "description": "Просмотр ACL",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "setfacl",
            "description": "Правка ACL",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "getfattr",
            "description": "Расширенные атрибуты",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "setfattr",
            "description": "Правка xattr",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "getent",
            "description": "Запрос NSS",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "passwd USER",
                "Запрос учётной записи через NSS."
              ],
              [
                "group GROUP",
                "Запрос группы через NSS."
              ]
            ]
          },
          {
            "name": "namei",
            "description": "Разбор компонентов пути",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "passwd",
            "description": "Пароль пользователя",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "useradd",
            "description": "Создание пользователя",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "usermod",
            "description": "Изменение пользователя",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "userdel",
            "description": "Удаление пользователя",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "groupadd",
            "description": "Создание группы",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "groupmod",
            "description": "Изменение группы",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "groupdel",
            "description": "Удаление группы",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "sudo",
            "description": "Выполнение по политике",
            "url": "https://www.sudo.ws/docs/man/sudo.man/",
            "specific": true,
            "options": [
              [
                "-l",
                "Показать разрешённые действия по политике."
              ],
              [
                "-u USER",
                "Запуск от указанного пользователя при наличии разрешения."
              ],
              [
                "-n",
                "Не запрашивать пароль интерактивно."
              ]
            ]
          },
          {
            "name": "su",
            "description": "Переход к другой идентичности",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "visudo",
            "description": "Безопасное редактирование sudoers",
            "url": "https://www.sudo.ws/docs/man/visudo.man/",
            "specific": true
          }
        ]
      },
      {
        "title": "Процессы и ресурсы",
        "entries": [
          {
            "name": "ps",
            "description": "Снимок процессов",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-p PID",
                "Выбрать PID."
              ],
              [
                "-o FORMAT",
                "Задать поля вывода."
              ],
              [
                "-e",
                "Выбрать все процессы."
              ]
            ]
          },
          {
            "name": "top",
            "description": "Интерактивный мониторинг",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-b",
                "Пакетный режим."
              ],
              [
                "-n N",
                "Число обновлений."
              ],
              [
                "-p PID",
                "Наблюдать выбранные PID."
              ]
            ]
          },
          {
            "name": "pgrep",
            "description": "Поиск PID",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-a",
                "Показать PID и командную строку."
              ],
              [
                "-x",
                "Точное совпадение имени."
              ]
            ]
          },
          {
            "name": "pkill",
            "description": "Сигналы по шаблону",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "kill",
            "description": "Отправка сигнала",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-TERM PID",
                "Запрос штатного завершения."
              ],
              [
                "-0 PID",
                "Проверить возможность сигнализации без доставки сигнала."
              ],
              [
                "-l",
                "Список сигналов."
              ]
            ]
          },
          {
            "name": "killall",
            "description": "Сигналы по имени",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "nice",
            "description": "Приоритет запуска",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/nice-invocation.html",
            "specific": true,
            "options": [
              [
                "-n N",
                "Добавить значение к nice запускаемой программы."
              ]
            ]
          },
          {
            "name": "renice",
            "description": "Изменение nice",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "taskset",
            "description": "CPU affinity",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "chrt",
            "description": "Политика планирования",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "ionice",
            "description": "Приоритет I/O",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "timeout",
            "description": "Ограничение времени",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/timeout-invocation.html",
            "specific": true,
            "options": [
              [
                "-s SIGNAL",
                "Сигнал при истечении времени."
              ],
              [
                "-k DURATION",
                "Дополнительное время до KILL; применять осознанно."
              ]
            ]
          },
          {
            "name": "time",
            "description": "Измерение выполнения",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "env",
            "description": "Окружение запуска",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/env-invocation.html",
            "specific": true
          },
          {
            "name": "printenv",
            "description": "Переменные окружения",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/printenv-invocation.html",
            "specific": true
          },
          {
            "name": "nohup",
            "description": "Запуск с обработкой hangup",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/nohup-invocation.html",
            "specific": true
          },
          {
            "name": "setsid",
            "description": "Новая сессия",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "sleep",
            "description": "Задержка",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/sleep-invocation.html",
            "specific": true
          },
          {
            "name": "free",
            "description": "Статистика памяти",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-h",
                "Человекочитаемые единицы."
              ],
              [
                "-s N",
                "Повтор через N секунд."
              ],
              [
                "-c N",
                "Число повторов."
              ]
            ]
          },
          {
            "name": "vmstat",
            "description": "Статистика VM/CPU/I/O",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-w",
                "Широкий формат."
              ],
              [
                "DELAY COUNT",
                "Интервал и число отчётов; первый может быть средним с загрузки."
              ]
            ]
          },
          {
            "name": "iostat",
            "description": "Статистика устройств",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-x",
                "Расширенные метрики устройства."
              ],
              [
                "-y",
                "Пропустить первый отчёт при интервальном выводе."
              ]
            ]
          },
          {
            "name": "pidstat",
            "description": "Статистика процессов",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "uptime",
            "description": "Время работы и load",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "lsof",
            "description": "Открытые файлы",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "strace",
            "description": "Системные вызовы",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-f",
                "Следовать потомкам."
              ],
              [
                "-c",
                "Агрегировать статистику."
              ],
              [
                "-e trace=LIST",
                "Выбрать вызовы."
              ],
              [
                "-o FILE",
                "Сохранить трассировку; проверять её на секреты."
              ],
              [
                "-T",
                "Показывать длительность вызова."
              ]
            ]
          },
          {
            "name": "perf",
            "description": "Измерение производительности",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "stat -e EVENT -- COMMAND",
                "Счётчики выбранной команды."
              ],
              [
                "record -- COMMAND",
                "Записать профиль при доступности."
              ],
              [
                "report",
                "Просмотреть записанный профиль."
              ]
            ]
          },
          {
            "name": "pmap",
            "description": "Отображения памяти",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "ulimit",
            "description": "Лимиты shell (builtin)",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "prlimit",
            "description": "Лимиты процесса",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          }
        ]
      },
      {
        "title": "Диски и файловые системы",
        "entries": [
          {
            "name": "df",
            "description": "Статистика файловых систем",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/df-invocation.html",
            "specific": true,
            "options": [
              [
                "-h",
                "Человекочитаемый размер."
              ],
              [
                "-T",
                "Тип файловой системы."
              ],
              [
                "-i",
                "Статистика inode."
              ]
            ]
          },
          {
            "name": "du",
            "description": "Занятые блоки дерева",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/du-invocation.html",
            "specific": true,
            "options": [
              [
                "-s",
                "Итог по аргументу."
              ],
              [
                "-h",
                "Человекочитаемый размер."
              ],
              [
                "-x",
                "Не пересекать границу ФС."
              ]
            ]
          },
          {
            "name": "lsblk",
            "description": "Блочные устройства",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-f",
                "Поля файловых систем."
              ],
              [
                "-o LIST",
                "Явно выбрать столбцы."
              ],
              [
                "-J",
                "JSON-представление."
              ]
            ]
          },
          {
            "name": "blkid",
            "description": "Сигнатуры и UUID",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "findmnt",
            "description": "Смонтированные ФС",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-t TYPES",
                "Фильтр по типам ФС."
              ],
              [
                "-o LIST",
                "Выбрать столбцы."
              ],
              [
                "--verify",
                "Проверить таблицу монтирования."
              ],
              [
                "--tab-file FILE",
                "Использовать указанный файл таблицы."
              ]
            ]
          },
          {
            "name": "mount",
            "description": "Монтирование",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-t TYPE",
                "Тип ФС."
              ],
              [
                "-o OPTIONS",
                "Параметры монтирования; сверять с ФС."
              ],
              [
                "--bind",
                "Дополнительное представление существующего пути."
              ]
            ]
          },
          {
            "name": "umount",
            "description": "Размонтирование",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "fdisk",
            "description": "Таблица разделов",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "sfdisk",
            "description": "Скриптовое управление разделами",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "parted",
            "description": "Разделы",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "mkfs",
            "description": "Создание файловой системы",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "fsck",
            "description": "Проверка ФС",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "e2fsck",
            "description": "Проверка ext2/3/4",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-f",
                "Принудительная проверка."
              ],
              [
                "-n",
                "Открыть только для чтения, отвечать «нет»."
              ],
              [
                "-p",
                "Автоматическое исправление допустимых проблем; не на смонтированном диске."
              ]
            ]
          },
          {
            "name": "tune2fs",
            "description": "Настройки ext",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "mkswap",
            "description": "Создание swap",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "swapon",
            "description": "Включение swap",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "swapoff",
            "description": "Отключение swap",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "fstrim",
            "description": "Discard свободных блоков",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "dd",
            "description": "Копирование блоков",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/dd-invocation.html",
            "specific": true
          },
          {
            "name": "lsns",
            "description": "Пространства имён",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "unshare",
            "description": "Новые пространства имён",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "--mount",
                "Новое mount namespace."
              ],
              [
                "--net",
                "Новое network namespace."
              ],
              [
                "--propagation private",
                "Изменить распространение mount-событий в новом пространстве."
              ]
            ]
          },
          {
            "name": "nsenter",
            "description": "Вход в namespace",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          }
        ]
      },
      {
        "title": "Система, загрузка и пакеты",
        "entries": [
          {
            "name": "uname",
            "description": "Сведения о ядре",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/uname-invocation.html",
            "specific": true,
            "options": [
              [
                "-r",
                "Версия работающего ядра."
              ],
              [
                "-m",
                "Архитектура машины."
              ],
              [
                "-a",
                "Основная сводка."
              ]
            ]
          },
          {
            "name": "arch",
            "description": "Архитектура",
            "url": "https://www.gnu.org/software/coreutils/manual/html_node/arch-invocation.html",
            "specific": true
          },
          {
            "name": "hostname",
            "description": "Имя хоста",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "hostnamectl",
            "description": "Сведения и настройка имени",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "lsmod",
            "description": "Загруженные модули",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "modinfo",
            "description": "Информация о модуле",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-F FIELD",
                "Вывести одно поле метаданных."
              ],
              [
                "-k VERSION",
                "Искать модуль для выбранной версии ядра."
              ]
            ]
          },
          {
            "name": "modprobe",
            "description": "Загрузка модуля с зависимостями",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "dmesg",
            "description": "Сообщения ядра",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "sysctl",
            "description": "Параметры ядра",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "systemctl",
            "description": "Управление unit",
            "url": "https://www.freedesktop.org/software/systemd/man/latest/systemctl.html",
            "specific": true,
            "options": [
              [
                "status UNIT",
                "Состояние unit и часть журнала."
              ],
              [
                "show UNIT -p PROPERTY",
                "Свойство менеджера."
              ],
              [
                "cat UNIT",
                "Основной файл и drop-in."
              ],
              [
                "--user",
                "Обращаться к пользовательскому менеджеру."
              ],
              [
                "daemon-reload",
                "Перечитать конфигурацию unit."
              ],
              [
                "enable --now UNIT",
                "Настроить активацию и запустить; изменение состояния."
              ]
            ]
          },
          {
            "name": "journalctl",
            "description": "Журнал",
            "url": "https://www.freedesktop.org/software/systemd/man/latest/journalctl.html",
            "specific": true,
            "options": [
              [
                "-b",
                "Текущая загрузка."
              ],
              [
                "-b -1",
                "Предыдущая загрузка, если сохранена."
              ],
              [
                "-u UNIT",
                "Журнал указанного unit."
              ],
              [
                "-k",
                "Сообщения ядра."
              ],
              [
                "-p warning",
                "Предупреждения и более серьёзные уровни."
              ],
              [
                "--since TIME",
                "Начало интервала."
              ],
              [
                "--no-pager",
                "Вывод без pager."
              ]
            ]
          },
          {
            "name": "systemd-analyze",
            "description": "Диагностика systemd",
            "url": "https://www.freedesktop.org/software/systemd/man/latest/systemd-analyze.html",
            "specific": true,
            "options": [
              [
                "verify FILE",
                "Статическая проверка unit."
              ],
              [
                "calendar EXPR",
                "Разбор календарного выражения."
              ],
              [
                "critical-chain",
                "Критическая цепочка активации."
              ]
            ]
          },
          {
            "name": "systemd-run",
            "description": "Transient unit",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "loginctl",
            "description": "Сессии logind",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "timedatectl",
            "description": "Время и зона",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "localectl",
            "description": "Локаль",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "apt",
            "description": "Debian/Ubuntu: пакеты",
            "url": "https://manpages.debian.org/stable/apt/apt.8.en.html",
            "specific": true
          },
          {
            "name": "apt-get",
            "description": "APT операции",
            "url": "https://manpages.debian.org/stable/apt/apt-get.8.en.html",
            "specific": true,
            "options": [
              [
                "-s install PACKAGE",
                "Симуляция установки."
              ],
              [
                "update",
                "Обновить индексы, не пакеты."
              ],
              [
                "upgrade",
                "Обновить по правилам команды; проверить план."
              ]
            ]
          },
          {
            "name": "apt-cache",
            "description": "APT метаданные",
            "url": "https://manpages.debian.org/stable/apt/apt-cache.8.en.html",
            "specific": true,
            "options": [
              [
                "policy PACKAGE",
                "Версии и приоритеты."
              ],
              [
                "depends PACKAGE",
                "Зависимости."
              ]
            ]
          },
          {
            "name": "dpkg",
            "description": "Debian-пакеты",
            "url": "https://manpages.debian.org/stable/dpkg/dpkg.1.en.html",
            "specific": true,
            "options": [
              [
                "-l",
                "Список известных пакетов."
              ],
              [
                "-L PACKAGE",
                "Файлы установленного пакета."
              ],
              [
                "-s PACKAGE",
                "Состояние пакета."
              ]
            ]
          },
          {
            "name": "dnf",
            "description": "Fedora/RHEL: пакеты",
            "url": "https://dnf.readthedocs.io/en/latest/command_ref.html",
            "specific": true,
            "options": [
              [
                "--cacheonly",
                "Использовать имеющийся кэш."
              ],
              [
                "repoquery --installed PACKAGE",
                "Запрос установленных пакетов при поддержке версии."
              ]
            ]
          },
          {
            "name": "rpm",
            "description": "RPM-пакеты",
            "url": "https://rpm.org/docs/",
            "specific": true,
            "options": [
              [
                "-q PACKAGE",
                "Запрос установленного пакета."
              ],
              [
                "-ql PACKAGE",
                "Список файлов."
              ],
              [
                "-qR PACKAGE",
                "Требования."
              ]
            ]
          },
          {
            "name": "pacman",
            "description": "Arch: пакеты",
            "url": "https://man.archlinux.org/man/pacman.8",
            "specific": true
          },
          {
            "name": "apk",
            "description": "Alpine: пакеты",
            "url": "https://wiki.alpinelinux.org/wiki/Alpine_Package_Keeper",
            "specific": true
          }
        ]
      },
      {
        "title": "Сети и протоколы",
        "entries": [
          {
            "name": "ip",
            "description": "Адреса, интерфейсы, маршруты",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-br addr",
                "Краткий вывод адресов."
              ],
              [
                "route get ADDRESS",
                "Решение маршрутизации для адреса."
              ],
              [
                "-n NAME link",
                "Интерфейсы выбранного netns."
              ],
              [
                "-s link",
                "Счётчики интерфейсов."
              ]
            ]
          },
          {
            "name": "ss",
            "description": "Сокеты",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-lnt",
                "Слушающие TCP-сокеты, числовые адреса."
              ],
              [
                "-tan",
                "Все TCP-состояния."
              ],
              [
                "-tin",
                "Доступная внутренняя TCP-информация."
              ],
              [
                "-p",
                "Процессы при наличии прав."
              ]
            ]
          },
          {
            "name": "tc",
            "description": "Управление очередями трафика",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-s qdisc show dev IFACE",
                "Очереди и счётчики интерфейса."
              ]
            ]
          },
          {
            "name": "bridge",
            "description": "Linux bridge",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "ethtool",
            "description": "Параметры сетевого устройства",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-i IFACE",
                "Сведения о драйвере."
              ],
              [
                "-k IFACE",
                "Возможности offload."
              ],
              [
                "-S IFACE",
                "Счётчики драйвера."
              ]
            ]
          },
          {
            "name": "nstat",
            "description": "Сетевые счётчики",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "ping",
            "description": "ICMP echo",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false,
            "options": [
              [
                "-c N",
                "Ограничить число запросов."
              ],
              [
                "-W SEC",
                "Время ожидания ответа по правилам iputils."
              ]
            ]
          },
          {
            "name": "tracepath",
            "description": "Путь и MTU",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "traceroute",
            "description": "Исследование маршрута",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "mtr",
            "description": "Статистика hops",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "dig",
            "description": "DNS-запросы",
            "url": "https://bind9.readthedocs.io/en/latest/manpages.html",
            "specific": true,
            "options": [
              [
                "+short",
                "Краткий ответ."
              ],
              [
                "@SERVER",
                "Выбрать DNS-сервер."
              ],
              [
                "-x ADDRESS",
                "Обратный DNS-запрос."
              ]
            ]
          },
          {
            "name": "host",
            "description": "DNS-поиск",
            "url": "https://bind9.readthedocs.io/en/latest/manpages.html",
            "specific": true
          },
          {
            "name": "nslookup",
            "description": "DNS-запросы",
            "url": "https://bind9.readthedocs.io/en/latest/manpages.html",
            "specific": true
          },
          {
            "name": "resolvectl",
            "description": "systemd-resolved",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "curl",
            "description": "HTTP и другие протоколы",
            "url": "https://curl.se/docs/manpage.html",
            "specific": true,
            "options": [
              [
                "--fail",
                "Ненулевой статус при HTTP-ошибке."
              ],
              [
                "--max-time SEC",
                "Предел длительности операции."
              ],
              [
                "-I",
                "HEAD для HTTP."
              ],
              [
                "-v",
                "Диагностика; может содержать секреты."
              ],
              [
                "-o FILE",
                "Сохранить ответ."
              ],
              [
                "-w FORMAT",
                "Вывести выбранные метрики."
              ]
            ]
          },
          {
            "name": "wget",
            "description": "Загрузка файлов",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "openssl",
            "description": "Криптографические операции",
            "url": "https://docs.openssl.org/master/man1/openssl/",
            "specific": true
          },
          {
            "name": "ssh",
            "description": "SSH-клиент",
            "url": "https://man.openbsd.org/ssh",
            "specific": true,
            "options": [
              [
                "-p PORT",
                "Порт SSH."
              ],
              [
                "-i FILE",
                "Путь ключа."
              ],
              [
                "-G",
                "Вывести конфигурацию без подключения."
              ],
              [
                "-F FILE",
                "Отдельный конфигурационный файл."
              ],
              [
                "-v",
                "Диагностика подключения."
              ]
            ]
          },
          {
            "name": "ssh-keygen",
            "description": "SSH-ключи",
            "url": "https://man.openbsd.org/ssh-keygen",
            "specific": true,
            "options": [
              [
                "-t TYPE",
                "Тип ключа."
              ],
              [
                "-f FILE",
                "Путь ключа."
              ],
              [
                "-l -f FILE",
                "Отпечаток ключа."
              ],
              [
                "-y -f FILE",
                "Получить публичный ключ из приватного."
              ]
            ]
          },
          {
            "name": "ssh-agent",
            "description": "Хранение SSH-ключей",
            "url": "https://man.openbsd.org/ssh-agent",
            "specific": true
          },
          {
            "name": "ssh-add",
            "description": "Управление ключами агента",
            "url": "https://man.openbsd.org/ssh-add",
            "specific": true
          },
          {
            "name": "tcpdump",
            "description": "Захват пакетов",
            "url": "https://www.tcpdump.org/manpages/tcpdump.1.html",
            "specific": true,
            "options": [
              [
                "-i IFACE",
                "Интерфейс захвата."
              ],
              [
                "-nn",
                "Без преобразования адресов и портов в имена."
              ],
              [
                "-c N",
                "Ограничить число пакетов."
              ],
              [
                "-w FILE",
                "Записать pcap."
              ],
              [
                "-r FILE",
                "Читать pcap."
              ]
            ]
          },
          {
            "name": "nft",
            "description": "Netfilter ruleset",
            "url": "https://netfilter.org/projects/nftables/manpage.html",
            "specific": true,
            "options": [
              [
                "list ruleset",
                "Прочитать правила текущего network namespace."
              ],
              [
                "-c -f FILE",
                "Проверить транзакцию без применения."
              ],
              [
                "-f FILE",
                "Применить файл правил; только с планом отката."
              ]
            ]
          },
          {
            "name": "iptables",
            "description": "Исторический интерфейс Netfilter",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "nc",
            "description": "Чтение/запись сетевых потоков",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          },
          {
            "name": "socat",
            "description": "Соединение потоков",
            "url": "https://man7.org/linux/man-pages/",
            "specific": false
          }
        ]
      },
      {
        "title": "Bash: основные встроенные команды",
        "entries": [
          {
            "name": "alias",
            "description": "Алиасы",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "unalias",
            "description": "Удаление алиасов",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "bg",
            "description": "Продолжить job в фоне",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "fg",
            "description": "Job на передний план",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "jobs",
            "description": "Список заданий",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "disown",
            "description": "Убрать job из таблицы",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "wait",
            "description": "Ожидание процесса",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "cd",
            "description": "Смена каталога",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "pushd",
            "description": "Добавление каталога в стек",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "popd",
            "description": "Извлечение каталога",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "dirs",
            "description": "Стек каталогов",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "read",
            "description": "Чтение строки",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false,
            "options": [
              [
                "-r",
                "Не обрабатывать обратный слеш как экранирование."
              ],
              [
                "-p PROMPT",
                "Показать приглашение в Bash."
              ]
            ]
          },
          {
            "name": "mapfile",
            "description": "Чтение в массив",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "printf",
            "description": "Форматированный вывод",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false,
            "options": [
              [
                "FORMAT ARG...",
                "Форматированный вывод; не используйте недоверенные данные как формат."
              ]
            ]
          },
          {
            "name": "echo",
            "description": "Вывод аргументов",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "test",
            "description": "Проверка условия",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "true",
            "description": "Успешный статус",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "false",
            "description": "Неуспешный статус",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "set",
            "description": "Опции и позиционные параметры",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false,
            "options": [
              [
                "-u",
                "Ошибка при раскрытии многих неустановленных переменных."
              ],
              [
                "-e",
                "Выход при некоторых ошибках; имеются исключения."
              ],
              [
                "-o pipefail",
                "Статус конвейера учитывает ошибки его команд."
              ]
            ]
          },
          {
            "name": "shopt",
            "description": "Опции Bash",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "shift",
            "description": "Сдвиг параметров",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "export",
            "description": "Передача переменных в окружение",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "unset",
            "description": "Удаление переменной/функции",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "declare",
            "description": "Атрибуты переменных",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "local",
            "description": "Локальная переменная",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "readonly",
            "description": "Константные атрибуты",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "return",
            "description": "Выход из функции",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "exit",
            "description": "Выход из shell",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "break",
            "description": "Выход из цикла",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "continue",
            "description": "Следующая итерация",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "trap",
            "description": "Обработчики сигналов",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false,
            "options": [
              [
                "COMMAND EXIT",
                "Действие при завершении оболочки."
              ],
              [
                "COMMAND TERM",
                "Обработчик SIGTERM по правилам shell."
              ]
            ]
          },
          {
            "name": "source",
            "description": "Чтение скрипта",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "exec",
            "description": "Замена процесса / FD",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "eval",
            "description": "Повторный разбор строки (опасно для недоверенного ввода)",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "command",
            "description": "Разрешение команды",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "type",
            "description": "Тип имени",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "hash",
            "description": "Кэш путей команд",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "help",
            "description": "Справка builtin",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "compgen",
            "description": "Генерация завершений",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          },
          {
            "name": "complete",
            "description": "Настройка завершений",
            "url": "https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html",
            "specific": false
          }
        ]
      },
      {
        "title": "Дополнительные интерфейсы Linux",
        "entries": [
          {
            "name": "readelf",
            "description": "Структура ELF",
            "url": "https://sourceware.org/binutils/docs/binutils/readelf.html",
            "options": [
              [
                "-h",
                "Заголовок ELF."
              ],
              [
                "-lW",
                "Сегменты без сокращения строк."
              ],
              [
                "-dW",
                "Динамические записи."
              ]
            ],
            "specific": true
          },
          {
            "name": "nm",
            "description": "Символы объектного файла",
            "url": "https://sourceware.org/binutils/docs/binutils/nm.html",
            "options": [
              [
                "-D",
                "Динамические символы."
              ],
              [
                "-C",
                "Деманглировать имена при поддержке."
              ]
            ],
            "specific": true
          },
          {
            "name": "losetup",
            "description": "Управление loop-устройствами",
            "url": "https://man7.org/linux/man-pages/man8/losetup.8.html",
            "options": [
              [
                "-a",
                "Список loop-устройств."
              ],
              [
                "--find --show FILE",
                "Подключить образ; только в выделенной VM."
              ],
              [
                "-d DEVICE",
                "Отсоединить точно известное устройство."
              ]
            ],
            "specific": true
          },
          {
            "name": "mdadm",
            "description": "Программный RAID",
            "url": "https://man7.org/linux/man-pages/man8/mdadm.8.html",
            "options": [
              [
                "--detail DEVICE",
                "Состояние массива."
              ],
              [
                "--examine DEVICE",
                "Метаданные компонента."
              ]
            ],
            "specific": true
          },
          {
            "name": "pvs",
            "description": "Физические тома LVM",
            "url": "https://man7.org/linux/man-pages/man8/pvs.8.html",
            "options": [
              [
                "-o LIST",
                "Выбрать поля."
              ],
              [
                "--devices LIST",
                "Ограничить список устройств при поддержке."
              ]
            ],
            "specific": true
          },
          {
            "name": "vgs",
            "description": "Группы LVM",
            "url": "https://man7.org/linux/man-pages/man8/vgs.8.html",
            "options": [
              [
                "-o LIST",
                "Выбрать поля."
              ]
            ],
            "specific": true
          },
          {
            "name": "lvs",
            "description": "Логические тома LVM",
            "url": "https://man7.org/linux/man-pages/man8/lvs.8.html",
            "options": [
              [
                "-a",
                "Включить внутренние тома."
              ],
              [
                "-o LIST",
                "Выбрать поля."
              ]
            ],
            "specific": true
          },
          {
            "name": "cryptsetup",
            "description": "Шифрованные отображения",
            "url": "https://man7.org/linux/man-pages/man8/cryptsetup.8.html",
            "options": [
              [
                "luksDump DEVICE",
                "Читать метаданные LUKS."
              ],
              [
                "status NAME",
                "Состояние отображения."
              ]
            ],
            "specific": true
          },
          {
            "name": "debugfs",
            "description": "Инспекция ext2/3/4",
            "url": "https://man7.org/linux/man-pages/man8/debugfs.8.html",
            "options": [
              [
                "-R COMMAND",
                "Выполнить команду."
              ],
              [
                "-w",
                "Разрешить запись; только собственная несмонтированная ФС."
              ]
            ],
            "specific": true
          },
          {
            "name": "dpkg-query",
            "description": "Запрос локальной базы dpkg",
            "url": "https://manpages.debian.org/unstable/dpkg/dpkg-query.1.en.html",
            "options": [
              [
                "-W PACKAGE",
                "Сведения об установленном пакете."
              ],
              [
                "-L PACKAGE",
                "Список файлов."
              ],
              [
                "-f FORMAT",
                "Формат вывода."
              ]
            ],
            "specific": true
          },
          {
            "name": "setpriv",
            "description": "Контекст запуска процесса",
            "url": "https://man7.org/linux/man-pages/man1/setpriv.1.html",
            "options": [
              [
                "--no-new-privs",
                "Запрет приобретения новых привилегий через exec."
              ]
            ],
            "specific": true
          },
          {
            "name": "udevadm",
            "description": "Инспекция udev",
            "url": "https://www.freedesktop.org/software/systemd/man/latest/udevadm.html",
            "options": [
              [
                "info --query=all --name=DEVICE",
                "Сведения об устройстве."
              ],
              [
                "settle",
                "Ожидать обработку текущей очереди событий."
              ]
            ],
            "specific": true
          },
          {
            "name": "cpio",
            "description": "Архивы cpio",
            "url": "https://www.gnu.org/software/cpio/manual/cpio.html",
            "options": [
              [
                "-o -H newc",
                "Создать архив newc."
              ],
              [
                "-it",
                "Перечислить содержимое."
              ],
              [
                "--null",
                "Читать NUL-разделённые имена."
              ]
            ],
            "specific": true
          }
        ]
      }
    ]
  },
  {
    "id": "git",
    "title": "Git",
    "scope": "Перечень охватывает основные встроенные семейства Git: porcelain, низкоуровневые команды и вспомогательные интерфейсы. Точный полный перечень установленной версии, включая плагины, алиасы и внешние git-*, доступен через git help -a; справочные руководства — git help -g.",
    "check": "git --version\ngit help -a\ngit help -g\ngit help revisions\ngit help gitcli",
    "groups": [
      {
        "title": "Начало, состояние и локальные изменения",
        "entries": [
          {
            "name": "init",
            "description": "Новый репозиторий",
            "url": "https://git-scm.com/docs/git-init",
            "specific": true
          },
          {
            "name": "clone",
            "description": "Клонирование",
            "url": "https://git-scm.com/docs/git-clone",
            "specific": true
          },
          {
            "name": "config",
            "description": "Настройки",
            "url": "https://git-scm.com/docs/git-config",
            "specific": true
          },
          {
            "name": "status",
            "description": "Состояние",
            "url": "https://git-scm.com/docs/git-status",
            "specific": true
          },
          {
            "name": "add",
            "description": "Подготовка снимка",
            "url": "https://git-scm.com/docs/git-add",
            "specific": true
          },
          {
            "name": "commit",
            "description": "Коммит",
            "url": "https://git-scm.com/docs/git-commit",
            "specific": true
          },
          {
            "name": "diff",
            "description": "Сравнение",
            "url": "https://git-scm.com/docs/git-diff",
            "specific": true
          },
          {
            "name": "restore",
            "description": "Восстановление файлов",
            "url": "https://git-scm.com/docs/git-restore",
            "specific": true
          },
          {
            "name": "reset",
            "description": "Сдвиг ссылок/состояния",
            "url": "https://git-scm.com/docs/git-reset",
            "specific": true
          },
          {
            "name": "rm",
            "description": "Удаление tracked paths",
            "url": "https://git-scm.com/docs/git-rm",
            "specific": true
          },
          {
            "name": "mv",
            "description": "Переименование",
            "url": "https://git-scm.com/docs/git-mv",
            "specific": true
          },
          {
            "name": "clean",
            "description": "Удаление untracked",
            "url": "https://git-scm.com/docs/git-clean",
            "specific": true
          },
          {
            "name": "stash",
            "description": "Временное состояние",
            "url": "https://git-scm.com/docs/git-stash",
            "specific": true
          },
          {
            "name": "apply",
            "description": "Применение патча",
            "url": "https://git-scm.com/docs/git-apply",
            "specific": true
          },
          {
            "name": "am",
            "description": "Применение почтовых патчей",
            "url": "https://git-scm.com/docs/git-am",
            "specific": true
          },
          {
            "name": "format-patch",
            "description": "Создание патчей",
            "url": "https://git-scm.com/docs/git-format-patch",
            "specific": true
          },
          {
            "name": "archive",
            "description": "Архив снимка",
            "url": "https://git-scm.com/docs/git-archive",
            "specific": true
          },
          {
            "name": "attributes",
            "description": "Правила атрибутов",
            "url": "https://git-scm.com/docs/gitattributes",
            "specific": true
          }
        ]
      },
      {
        "title": "История, ветки, сравнение",
        "entries": [
          {
            "name": "log",
            "description": "История",
            "url": "https://git-scm.com/docs/git-log",
            "specific": true
          },
          {
            "name": "show",
            "description": "Объект или коммит",
            "url": "https://git-scm.com/docs/git-show",
            "specific": true
          },
          {
            "name": "blame",
            "description": "Атрибуция строк",
            "url": "https://git-scm.com/docs/git-blame",
            "specific": true
          },
          {
            "name": "annotate",
            "description": "История строк",
            "url": "https://git-scm.com/docs/git-annotate",
            "specific": true
          },
          {
            "name": "grep",
            "description": "Поиск",
            "url": "https://git-scm.com/docs/git-grep",
            "specific": true
          },
          {
            "name": "bisect",
            "description": "Бинарный поиск регрессии",
            "url": "https://git-scm.com/docs/git-bisect",
            "specific": true
          },
          {
            "name": "branch",
            "description": "Ветки",
            "url": "https://git-scm.com/docs/git-branch",
            "specific": true
          },
          {
            "name": "checkout",
            "description": "Переключение/восстановление",
            "url": "https://git-scm.com/docs/git-checkout",
            "specific": true
          },
          {
            "name": "switch",
            "description": "Переключение веток",
            "url": "https://git-scm.com/docs/git-switch",
            "specific": true
          },
          {
            "name": "merge",
            "description": "Слияние",
            "url": "https://git-scm.com/docs/git-merge",
            "specific": true
          },
          {
            "name": "rebase",
            "description": "Перенос истории",
            "url": "https://git-scm.com/docs/git-rebase",
            "specific": true
          },
          {
            "name": "cherry-pick",
            "description": "Применение коммита",
            "url": "https://git-scm.com/docs/git-cherry-pick",
            "specific": true
          },
          {
            "name": "revert",
            "description": "Обратный коммит",
            "url": "https://git-scm.com/docs/git-revert",
            "specific": true
          },
          {
            "name": "rerere",
            "description": "Повтор решений конфликтов",
            "url": "https://git-scm.com/docs/git-rerere",
            "specific": true
          },
          {
            "name": "range-diff",
            "description": "Сравнение серий патчей",
            "url": "https://git-scm.com/docs/git-range-diff",
            "specific": true
          },
          {
            "name": "reflog",
            "description": "Журнал ссылок",
            "url": "https://git-scm.com/docs/git-reflog",
            "specific": true
          },
          {
            "name": "describe",
            "description": "Описание через теги",
            "url": "https://git-scm.com/docs/git-describe",
            "specific": true
          },
          {
            "name": "shortlog",
            "description": "Группировка коммитов",
            "url": "https://git-scm.com/docs/git-shortlog",
            "specific": true
          },
          {
            "name": "tag",
            "description": "Теги",
            "url": "https://git-scm.com/docs/git-tag",
            "specific": true
          },
          {
            "name": "notes",
            "description": "Заметки к объектам",
            "url": "https://git-scm.com/docs/git-notes",
            "specific": true
          },
          {
            "name": "replace",
            "description": "Замена отображаемых объектов",
            "url": "https://git-scm.com/docs/git-replace",
            "specific": true
          },
          {
            "name": "worktree",
            "description": "Дополнительные рабочие копии",
            "url": "https://git-scm.com/docs/git-worktree",
            "specific": true
          }
        ]
      },
      {
        "title": "Сеть и интеграция",
        "entries": [
          {
            "name": "remote",
            "description": "Удалённые репозитории",
            "url": "https://git-scm.com/docs/git-remote",
            "specific": true
          },
          {
            "name": "fetch",
            "description": "Получение объектов и refs",
            "url": "https://git-scm.com/docs/git-fetch",
            "specific": true
          },
          {
            "name": "pull",
            "description": "Получение и интеграция",
            "url": "https://git-scm.com/docs/git-pull",
            "specific": true
          },
          {
            "name": "push",
            "description": "Публикация refs",
            "url": "https://git-scm.com/docs/git-push",
            "specific": true
          },
          {
            "name": "ls-remote",
            "description": "Удалённые ссылки",
            "url": "https://git-scm.com/docs/git-ls-remote",
            "specific": true
          },
          {
            "name": "submodule",
            "description": "Вложенные репозитории",
            "url": "https://git-scm.com/docs/git-submodule",
            "specific": true
          },
          {
            "name": "bundle",
            "description": "Офлайн-обмен",
            "url": "https://git-scm.com/docs/git-bundle",
            "specific": true
          },
          {
            "name": "request-pull",
            "description": "Описание запроса на интеграцию",
            "url": "https://git-scm.com/docs/git-request-pull",
            "specific": true
          },
          {
            "name": "send-email",
            "description": "Отправка патчей",
            "url": "https://git-scm.com/docs/git-send-email",
            "specific": true
          },
          {
            "name": "credential",
            "description": "Интерфейс credential helpers",
            "url": "https://git-scm.com/docs/git-credential",
            "specific": true
          },
          {
            "name": "credential-cache",
            "description": "Кэш credentials",
            "url": "https://git-scm.com/docs/git-credential-cache",
            "specific": true
          },
          {
            "name": "credential-store",
            "description": "Хранение credentials",
            "url": "https://git-scm.com/docs/git-credential-store",
            "specific": true
          },
          {
            "name": "sparse-checkout",
            "description": "Ограничение рабочего дерева",
            "url": "https://git-scm.com/docs/git-sparse-checkout",
            "specific": true
          }
        ]
      },
      {
        "title": "Низкоуровневые объекты и ссылки",
        "entries": [
          {
            "name": "hash-object",
            "description": "Хеш и запись объекта",
            "url": "https://git-scm.com/docs/git-hash-object",
            "specific": true
          },
          {
            "name": "cat-file",
            "description": "Инспекция объекта",
            "url": "https://git-scm.com/docs/git-cat-file",
            "specific": true
          },
          {
            "name": "ls-tree",
            "description": "Дерево",
            "url": "https://git-scm.com/docs/git-ls-tree",
            "specific": true
          },
          {
            "name": "ls-files",
            "description": "Индекс и пути",
            "url": "https://git-scm.com/docs/git-ls-files",
            "specific": true
          },
          {
            "name": "write-tree",
            "description": "Дерево из index",
            "url": "https://git-scm.com/docs/git-write-tree",
            "specific": true
          },
          {
            "name": "read-tree",
            "description": "Загрузка дерева в index",
            "url": "https://git-scm.com/docs/git-read-tree",
            "specific": true
          },
          {
            "name": "commit-tree",
            "description": "Создание commit-объекта",
            "url": "https://git-scm.com/docs/git-commit-tree",
            "specific": true
          },
          {
            "name": "mktree",
            "description": "Создание tree",
            "url": "https://git-scm.com/docs/git-mktree",
            "specific": true
          },
          {
            "name": "mktag",
            "description": "Создание tag-объекта",
            "url": "https://git-scm.com/docs/git-mktag",
            "specific": true
          },
          {
            "name": "update-index",
            "description": "Низкоуровневая правка index",
            "url": "https://git-scm.com/docs/git-update-index",
            "specific": true
          },
          {
            "name": "update-ref",
            "description": "Изменение ref",
            "url": "https://git-scm.com/docs/git-update-ref",
            "specific": true
          },
          {
            "name": "symbolic-ref",
            "description": "Символическая ссылка",
            "url": "https://git-scm.com/docs/git-symbolic-ref",
            "specific": true
          },
          {
            "name": "show-ref",
            "description": "Перечень ссылок",
            "url": "https://git-scm.com/docs/git-show-ref",
            "specific": true
          },
          {
            "name": "for-each-ref",
            "description": "Итерация refs",
            "url": "https://git-scm.com/docs/git-for-each-ref",
            "specific": true
          },
          {
            "name": "rev-parse",
            "description": "Разрешение ревизий",
            "url": "https://git-scm.com/docs/git-rev-parse",
            "specific": true
          },
          {
            "name": "rev-list",
            "description": "Обход графа",
            "url": "https://git-scm.com/docs/git-rev-list",
            "specific": true
          },
          {
            "name": "merge-base",
            "description": "Общий предок",
            "url": "https://git-scm.com/docs/git-merge-base",
            "specific": true
          },
          {
            "name": "merge-tree",
            "description": "Слияние деревьев",
            "url": "https://git-scm.com/docs/git-merge-tree",
            "specific": true
          },
          {
            "name": "diff-tree",
            "description": "Сравнение деревьев",
            "url": "https://git-scm.com/docs/git-diff-tree",
            "specific": true
          },
          {
            "name": "diff-index",
            "description": "Сравнение index с деревом",
            "url": "https://git-scm.com/docs/git-diff-index",
            "specific": true
          },
          {
            "name": "diff-files",
            "description": "Сравнение рабочей копии с index",
            "url": "https://git-scm.com/docs/git-diff-files",
            "specific": true
          },
          {
            "name": "check-ignore",
            "description": "Проверка игнорирования",
            "url": "https://git-scm.com/docs/git-check-ignore",
            "specific": true
          },
          {
            "name": "check-attr",
            "description": "Атрибуты пути",
            "url": "https://git-scm.com/docs/git-check-attr",
            "specific": true
          },
          {
            "name": "check-ref-format",
            "description": "Проверка ref name",
            "url": "https://git-scm.com/docs/git-check-ref-format",
            "specific": true
          }
        ]
      },
      {
        "title": "Хранилище, обслуживание и диагностика",
        "entries": [
          {
            "name": "fsck",
            "description": "Проверка целостности",
            "url": "https://git-scm.com/docs/git-fsck",
            "specific": true
          },
          {
            "name": "gc",
            "description": "Сборка мусора",
            "url": "https://git-scm.com/docs/git-gc",
            "specific": true
          },
          {
            "name": "maintenance",
            "description": "Фоновое обслуживание",
            "url": "https://git-scm.com/docs/git-maintenance",
            "specific": true
          },
          {
            "name": "repack",
            "description": "Перепаковка",
            "url": "https://git-scm.com/docs/git-repack",
            "specific": true
          },
          {
            "name": "prune",
            "description": "Удаление недостижимых объектов",
            "url": "https://git-scm.com/docs/git-prune",
            "specific": true
          },
          {
            "name": "count-objects",
            "description": "Статистика",
            "url": "https://git-scm.com/docs/git-count-objects",
            "specific": true
          },
          {
            "name": "pack-objects",
            "description": "Создание pack",
            "url": "https://git-scm.com/docs/git-pack-objects",
            "specific": true
          },
          {
            "name": "unpack-objects",
            "description": "Распаковка объектов",
            "url": "https://git-scm.com/docs/git-unpack-objects",
            "specific": true
          },
          {
            "name": "verify-pack",
            "description": "Проверка pack",
            "url": "https://git-scm.com/docs/git-verify-pack",
            "specific": true
          },
          {
            "name": "index-pack",
            "description": "Индекс pack",
            "url": "https://git-scm.com/docs/git-index-pack",
            "specific": true
          },
          {
            "name": "pack-refs",
            "description": "Упаковка refs",
            "url": "https://git-scm.com/docs/git-pack-refs",
            "specific": true
          },
          {
            "name": "commit-graph",
            "description": "Граф коммитов",
            "url": "https://git-scm.com/docs/git-commit-graph",
            "specific": true
          },
          {
            "name": "multi-pack-index",
            "description": "Индекс нескольких pack",
            "url": "https://git-scm.com/docs/git-multi-pack-index",
            "specific": true
          },
          {
            "name": "verify-commit",
            "description": "Проверка подписи коммита",
            "url": "https://git-scm.com/docs/git-verify-commit",
            "specific": true
          },
          {
            "name": "verify-tag",
            "description": "Проверка подписи тега",
            "url": "https://git-scm.com/docs/git-verify-tag",
            "specific": true
          },
          {
            "name": "bugreport",
            "description": "Диагностический отчёт",
            "url": "https://git-scm.com/docs/git-bugreport",
            "specific": true
          },
          {
            "name": "diagnose",
            "description": "Архив диагностики",
            "url": "https://git-scm.com/docs/git-diagnose",
            "specific": true
          },
          {
            "name": "help",
            "description": "Справка",
            "url": "https://git-scm.com/docs/git-help",
            "specific": true
          }
        ]
      }
    ]
  },
  {
    "id": "docker",
    "title": "Docker",
    "scope": "Группы соответствуют публичной CLI reference Docker. Часть команд — плагины, экспериментальные функции, Docker Desktop или Swarm; наличие зависит от установки. Проверяйте docker --help и справку каждой группы. Не включаем команды неизвестных сторонних плагинов в обещание полноты.",
    "check": "docker version\ndocker --help\ndocker container --help\ndocker compose --help\ndocker buildx --help",
    "groups": [
      {
        "title": "Контейнеры",
        "entries": [
          {
            "name": "container",
            "description": "Управление контейнерами",
            "url": "https://docs.docker.com/reference/cli/docker/container/",
            "specific": true
          },
          {
            "name": "container attach",
            "description": "Подключение потоков",
            "url": "https://docs.docker.com/reference/cli/docker/container/attach/",
            "specific": true
          },
          {
            "name": "container commit",
            "description": "Снимок изменённого контейнера",
            "url": "https://docs.docker.com/reference/cli/docker/container/commit/",
            "specific": true
          },
          {
            "name": "container cp",
            "description": "Копирование файлов",
            "url": "https://docs.docker.com/reference/cli/docker/container/cp/",
            "specific": true
          },
          {
            "name": "container create",
            "description": "Создание",
            "url": "https://docs.docker.com/reference/cli/docker/container/create/",
            "specific": true
          },
          {
            "name": "container diff",
            "description": "Изменения rootfs",
            "url": "https://docs.docker.com/reference/cli/docker/container/diff/",
            "specific": true
          },
          {
            "name": "container exec",
            "description": "Дополнительный процесс",
            "url": "https://docs.docker.com/reference/cli/docker/container/exec/",
            "specific": true
          },
          {
            "name": "container export",
            "description": "Экспорт rootfs",
            "url": "https://docs.docker.com/reference/cli/docker/container/export/",
            "specific": true
          },
          {
            "name": "container inspect",
            "description": "Метаданные",
            "url": "https://docs.docker.com/reference/cli/docker/container/inspect/",
            "specific": true
          },
          {
            "name": "container kill",
            "description": "Отправка сигнала",
            "url": "https://docs.docker.com/reference/cli/docker/container/kill/",
            "specific": true
          },
          {
            "name": "container logs",
            "description": "Логи",
            "url": "https://docs.docker.com/reference/cli/docker/container/logs/",
            "specific": true
          },
          {
            "name": "container ls",
            "description": "Список",
            "url": "https://docs.docker.com/reference/cli/docker/container/ls/",
            "specific": true
          },
          {
            "name": "container pause",
            "description": "Приостановка",
            "url": "https://docs.docker.com/reference/cli/docker/container/pause/",
            "specific": true
          },
          {
            "name": "container port",
            "description": "Публикации портов",
            "url": "https://docs.docker.com/reference/cli/docker/container/port/",
            "specific": true
          },
          {
            "name": "container prune",
            "description": "Удаление остановленных",
            "url": "https://docs.docker.com/reference/cli/docker/container/prune/",
            "specific": true
          },
          {
            "name": "container rename",
            "description": "Переименование",
            "url": "https://docs.docker.com/reference/cli/docker/container/rename/",
            "specific": true
          },
          {
            "name": "container restart",
            "description": "Перезапуск",
            "url": "https://docs.docker.com/reference/cli/docker/container/restart/",
            "specific": true
          },
          {
            "name": "container rm",
            "description": "Удаление",
            "url": "https://docs.docker.com/reference/cli/docker/container/rm/",
            "specific": true
          },
          {
            "name": "container run",
            "description": "Создание и запуск",
            "url": "https://docs.docker.com/reference/cli/docker/container/run/",
            "specific": true
          },
          {
            "name": "container start",
            "description": "Запуск",
            "url": "https://docs.docker.com/reference/cli/docker/container/start/",
            "specific": true
          },
          {
            "name": "container stats",
            "description": "Ресурсы",
            "url": "https://docs.docker.com/reference/cli/docker/container/stats/",
            "specific": true
          },
          {
            "name": "container stop",
            "description": "Остановка",
            "url": "https://docs.docker.com/reference/cli/docker/container/stop/",
            "specific": true
          },
          {
            "name": "container top",
            "description": "Процессы",
            "url": "https://docs.docker.com/reference/cli/docker/container/top/",
            "specific": true
          },
          {
            "name": "container unpause",
            "description": "Возобновление",
            "url": "https://docs.docker.com/reference/cli/docker/container/unpause/",
            "specific": true
          },
          {
            "name": "container update",
            "description": "Изменение поддерживаемых параметров",
            "url": "https://docs.docker.com/reference/cli/docker/container/update/",
            "specific": true
          },
          {
            "name": "container wait",
            "description": "Ожидание завершения",
            "url": "https://docs.docker.com/reference/cli/docker/container/wait/",
            "specific": true
          }
        ]
      },
      {
        "title": "Образы и сборка",
        "entries": [
          {
            "name": "image",
            "description": "Управление образами",
            "url": "https://docs.docker.com/reference/cli/docker/image/",
            "specific": true
          },
          {
            "name": "image build",
            "description": "Сборка",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/build/",
            "specific": true
          },
          {
            "name": "image history",
            "description": "История",
            "url": "https://docs.docker.com/reference/cli/docker/image/history/",
            "specific": true
          },
          {
            "name": "image import",
            "description": "Импорт rootfs",
            "url": "https://docs.docker.com/reference/cli/docker/image/import/",
            "specific": true
          },
          {
            "name": "image inspect",
            "description": "Метаданные",
            "url": "https://docs.docker.com/reference/cli/docker/image/inspect/",
            "specific": true
          },
          {
            "name": "image load",
            "description": "Загрузка архива",
            "url": "https://docs.docker.com/reference/cli/docker/image/load/",
            "specific": true
          },
          {
            "name": "image ls",
            "description": "Список",
            "url": "https://docs.docker.com/reference/cli/docker/image/ls/",
            "specific": true
          },
          {
            "name": "image prune",
            "description": "Очистка",
            "url": "https://docs.docker.com/reference/cli/docker/image/prune/",
            "specific": true
          },
          {
            "name": "image pull",
            "description": "Получение",
            "url": "https://docs.docker.com/reference/cli/docker/image/pull/",
            "specific": true
          },
          {
            "name": "image push",
            "description": "Публикация",
            "url": "https://docs.docker.com/reference/cli/docker/image/push/",
            "specific": true
          },
          {
            "name": "image rm",
            "description": "Удаление",
            "url": "https://docs.docker.com/reference/cli/docker/image/rm/",
            "specific": true
          },
          {
            "name": "image save",
            "description": "Архив образа",
            "url": "https://docs.docker.com/reference/cli/docker/image/save/",
            "specific": true
          },
          {
            "name": "image tag",
            "description": "Новый тег",
            "url": "https://docs.docker.com/reference/cli/docker/image/tag/",
            "specific": true
          },
          {
            "name": "builder",
            "description": "Управление сборками",
            "url": "https://docs.docker.com/reference/cli/docker/builder/",
            "specific": true
          },
          {
            "name": "builder build",
            "description": "Сборка",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/build/",
            "specific": true
          },
          {
            "name": "builder prune",
            "description": "Очистка кэша",
            "url": "https://docs.docker.com/reference/cli/docker/builder/prune/",
            "specific": true
          },
          {
            "name": "buildx",
            "description": "Расширенная сборка",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/",
            "specific": true
          },
          {
            "name": "buildx build",
            "description": "BuildKit-сборка",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/build/",
            "specific": true
          },
          {
            "name": "buildx create",
            "description": "Builder instance",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/create/",
            "specific": true
          },
          {
            "name": "buildx inspect",
            "description": "Параметры builder",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/inspect/",
            "specific": true
          },
          {
            "name": "buildx ls",
            "description": "Список builders",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/ls/",
            "specific": true
          },
          {
            "name": "buildx bake",
            "description": "Декларация наборов сборок",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/bake/",
            "specific": true
          },
          {
            "name": "buildx du",
            "description": "Использование кэша",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/du/",
            "specific": true
          },
          {
            "name": "buildx prune",
            "description": "Очистка кэша",
            "url": "https://docs.docker.com/reference/cli/docker/buildx/prune/",
            "specific": true
          },
          {
            "name": "manifest",
            "description": "Манифесты образов",
            "url": "https://docs.docker.com/reference/cli/docker/manifest/",
            "specific": true
          }
        ]
      },
      {
        "title": "Сети, тома и контексты",
        "entries": [
          {
            "name": "network",
            "description": "Управление сетями",
            "url": "https://docs.docker.com/reference/cli/docker/network/",
            "specific": true
          },
          {
            "name": "network connect",
            "description": "Подключение",
            "url": "https://docs.docker.com/reference/cli/docker/network/connect/",
            "specific": true
          },
          {
            "name": "network create",
            "description": "Создание",
            "url": "https://docs.docker.com/reference/cli/docker/network/create/",
            "specific": true
          },
          {
            "name": "network disconnect",
            "description": "Отключение",
            "url": "https://docs.docker.com/reference/cli/docker/network/disconnect/",
            "specific": true
          },
          {
            "name": "network inspect",
            "description": "Сведения",
            "url": "https://docs.docker.com/reference/cli/docker/network/inspect/",
            "specific": true
          },
          {
            "name": "network ls",
            "description": "Список",
            "url": "https://docs.docker.com/reference/cli/docker/network/ls/",
            "specific": true
          },
          {
            "name": "network prune",
            "description": "Очистка",
            "url": "https://docs.docker.com/reference/cli/docker/network/prune/",
            "specific": true
          },
          {
            "name": "network rm",
            "description": "Удаление",
            "url": "https://docs.docker.com/reference/cli/docker/network/rm/",
            "specific": true
          },
          {
            "name": "volume",
            "description": "Управление томами",
            "url": "https://docs.docker.com/reference/cli/docker/volume/",
            "specific": true
          },
          {
            "name": "volume create",
            "description": "Создание",
            "url": "https://docs.docker.com/reference/cli/docker/volume/create/",
            "specific": true
          },
          {
            "name": "volume inspect",
            "description": "Сведения",
            "url": "https://docs.docker.com/reference/cli/docker/volume/inspect/",
            "specific": true
          },
          {
            "name": "volume ls",
            "description": "Список",
            "url": "https://docs.docker.com/reference/cli/docker/volume/ls/",
            "specific": true
          },
          {
            "name": "volume prune",
            "description": "Очистка",
            "url": "https://docs.docker.com/reference/cli/docker/volume/prune/",
            "specific": true
          },
          {
            "name": "volume rm",
            "description": "Удаление",
            "url": "https://docs.docker.com/reference/cli/docker/volume/rm/",
            "specific": true
          },
          {
            "name": "context",
            "description": "Контексты клиента",
            "url": "https://docs.docker.com/reference/cli/docker/context/",
            "specific": true
          },
          {
            "name": "context create",
            "description": "Создание",
            "url": "https://docs.docker.com/reference/cli/docker/context/create/",
            "specific": true
          },
          {
            "name": "context export",
            "description": "Экспорт",
            "url": "https://docs.docker.com/reference/cli/docker/context/export/",
            "specific": true
          },
          {
            "name": "context import",
            "description": "Импорт",
            "url": "https://docs.docker.com/reference/cli/docker/context/import/",
            "specific": true
          },
          {
            "name": "context inspect",
            "description": "Просмотр",
            "url": "https://docs.docker.com/reference/cli/docker/context/inspect/",
            "specific": true
          },
          {
            "name": "context ls",
            "description": "Список",
            "url": "https://docs.docker.com/reference/cli/docker/context/ls/",
            "specific": true
          },
          {
            "name": "context rm",
            "description": "Удаление",
            "url": "https://docs.docker.com/reference/cli/docker/context/rm/",
            "specific": true
          },
          {
            "name": "context show",
            "description": "Текущий контекст",
            "url": "https://docs.docker.com/reference/cli/docker/context/show/",
            "specific": true
          },
          {
            "name": "context update",
            "description": "Изменение",
            "url": "https://docs.docker.com/reference/cli/docker/context/update/",
            "specific": true
          },
          {
            "name": "context use",
            "description": "Переключение",
            "url": "https://docs.docker.com/reference/cli/docker/context/use/",
            "specific": true
          }
        ]
      },
      {
        "title": "Compose",
        "entries": [
          {
            "name": "compose",
            "description": "Проекты Compose",
            "url": "https://docs.docker.com/reference/cli/docker/compose/",
            "specific": true
          },
          {
            "name": "compose build",
            "description": "Сборка",
            "url": "https://docs.docker.com/reference/cli/docker/compose/build/",
            "specific": true
          },
          {
            "name": "compose config",
            "description": "Разрешённая конфигурация",
            "url": "https://docs.docker.com/reference/cli/docker/compose/config/",
            "specific": true
          },
          {
            "name": "compose create",
            "description": "Создание сервисов",
            "url": "https://docs.docker.com/reference/cli/docker/compose/create/",
            "specific": true
          },
          {
            "name": "compose down",
            "description": "Удаление ресурсов проекта",
            "url": "https://docs.docker.com/reference/cli/docker/compose/down/",
            "specific": true
          },
          {
            "name": "compose events",
            "description": "События",
            "url": "https://docs.docker.com/reference/cli/docker/compose/events/",
            "specific": true
          },
          {
            "name": "compose exec",
            "description": "Команда в сервисе",
            "url": "https://docs.docker.com/reference/cli/docker/compose/exec/",
            "specific": true
          },
          {
            "name": "compose images",
            "description": "Образы",
            "url": "https://docs.docker.com/reference/cli/docker/compose/images/",
            "specific": true
          },
          {
            "name": "compose kill",
            "description": "Сигнал",
            "url": "https://docs.docker.com/reference/cli/docker/compose/kill/",
            "specific": true
          },
          {
            "name": "compose logs",
            "description": "Логи",
            "url": "https://docs.docker.com/reference/cli/docker/compose/logs/",
            "specific": true
          },
          {
            "name": "compose ls",
            "description": "Проекты",
            "url": "https://docs.docker.com/reference/cli/docker/compose/ls/",
            "specific": true
          },
          {
            "name": "compose pause",
            "description": "Пауза",
            "url": "https://docs.docker.com/reference/cli/docker/compose/pause/",
            "specific": true
          },
          {
            "name": "compose port",
            "description": "Опубликованный порт",
            "url": "https://docs.docker.com/reference/cli/docker/compose/port/",
            "specific": true
          },
          {
            "name": "compose ps",
            "description": "Статусы",
            "url": "https://docs.docker.com/reference/cli/docker/compose/ps/",
            "specific": true
          },
          {
            "name": "compose pull",
            "description": "Получение образов",
            "url": "https://docs.docker.com/reference/cli/docker/compose/pull/",
            "specific": true
          },
          {
            "name": "compose push",
            "description": "Публикация",
            "url": "https://docs.docker.com/reference/cli/docker/compose/push/",
            "specific": true
          },
          {
            "name": "compose restart",
            "description": "Перезапуск",
            "url": "https://docs.docker.com/reference/cli/docker/compose/restart/",
            "specific": true
          },
          {
            "name": "compose rm",
            "description": "Удаление stopped containers",
            "url": "https://docs.docker.com/reference/cli/docker/compose/rm/",
            "specific": true
          },
          {
            "name": "compose run",
            "description": "Разовая задача",
            "url": "https://docs.docker.com/reference/cli/docker/compose/run/",
            "specific": true
          },
          {
            "name": "compose start",
            "description": "Запуск",
            "url": "https://docs.docker.com/reference/cli/docker/compose/start/",
            "specific": true
          },
          {
            "name": "compose stop",
            "description": "Остановка",
            "url": "https://docs.docker.com/reference/cli/docker/compose/stop/",
            "specific": true
          },
          {
            "name": "compose top",
            "description": "Процессы",
            "url": "https://docs.docker.com/reference/cli/docker/compose/top/",
            "specific": true
          },
          {
            "name": "compose unpause",
            "description": "Возобновление",
            "url": "https://docs.docker.com/reference/cli/docker/compose/unpause/",
            "specific": true
          },
          {
            "name": "compose up",
            "description": "Создание и запуск",
            "url": "https://docs.docker.com/reference/cli/docker/compose/up/",
            "specific": true
          },
          {
            "name": "compose version",
            "description": "Версия",
            "url": "https://docs.docker.com/reference/cli/docker/compose/version/",
            "specific": true
          },
          {
            "name": "compose wait",
            "description": "Ожидание остановки",
            "url": "https://docs.docker.com/reference/cli/docker/compose/wait/",
            "specific": true
          },
          {
            "name": "compose watch",
            "description": "Наблюдение за изменениями",
            "url": "https://docs.docker.com/reference/cli/docker/compose/watch/",
            "specific": true
          }
        ]
      },
      {
        "title": "Системные и дополнительные группы",
        "entries": [
          {
            "name": "system",
            "description": "Управление ресурсами Engine",
            "url": "https://docs.docker.com/reference/cli/docker/system/",
            "specific": true
          },
          {
            "name": "system df",
            "description": "Использование диска",
            "url": "https://docs.docker.com/reference/cli/docker/system/df/",
            "specific": true
          },
          {
            "name": "system events",
            "description": "События",
            "url": "https://docs.docker.com/reference/cli/docker/system/events/",
            "specific": true
          },
          {
            "name": "system info",
            "description": "Информация об Engine",
            "url": "https://docs.docker.com/reference/cli/docker/system/info/",
            "specific": true
          },
          {
            "name": "system prune",
            "description": "Очистка",
            "url": "https://docs.docker.com/reference/cli/docker/system/prune/",
            "specific": true
          },
          {
            "name": "inspect",
            "description": "Инспекция объекта",
            "url": "https://docs.docker.com/reference/cli/docker/inspect/",
            "specific": true
          },
          {
            "name": "login",
            "description": "Аутентификация registry",
            "url": "https://docs.docker.com/reference/cli/docker/login/",
            "specific": true
          },
          {
            "name": "logout",
            "description": "Выход registry",
            "url": "https://docs.docker.com/reference/cli/docker/logout/",
            "specific": true
          },
          {
            "name": "search",
            "description": "Поиск образов",
            "url": "https://docs.docker.com/reference/cli/docker/search/",
            "specific": true
          },
          {
            "name": "version",
            "description": "Версии клиента/сервера",
            "url": "https://docs.docker.com/reference/cli/docker/version/",
            "specific": true
          },
          {
            "name": "plugin",
            "description": "Плагины Engine",
            "url": "https://docs.docker.com/reference/cli/docker/plugin/",
            "specific": true
          },
          {
            "name": "swarm",
            "description": "Режим Swarm",
            "url": "https://docs.docker.com/reference/cli/docker/swarm/",
            "specific": true
          },
          {
            "name": "node",
            "description": "Узлы Swarm",
            "url": "https://docs.docker.com/reference/cli/docker/node/",
            "specific": true
          },
          {
            "name": "service",
            "description": "Сервисы Swarm",
            "url": "https://docs.docker.com/reference/cli/docker/service/",
            "specific": true
          },
          {
            "name": "stack",
            "description": "Стеки Swarm",
            "url": "https://docs.docker.com/reference/cli/docker/stack/",
            "specific": true
          },
          {
            "name": "config",
            "description": "Конфигурации Swarm",
            "url": "https://docs.docker.com/reference/cli/docker/config/",
            "specific": true
          },
          {
            "name": "secret",
            "description": "Секреты Swarm",
            "url": "https://docs.docker.com/reference/cli/docker/secret/",
            "specific": true
          },
          {
            "name": "checkpoint",
            "description": "Контрольные точки",
            "url": "https://docs.docker.com/reference/cli/docker/checkpoint/",
            "specific": true
          },
          {
            "name": "trust",
            "description": "Docker Content Trust",
            "url": "https://docs.docker.com/reference/cli/docker/trust/",
            "specific": true
          },
          {
            "name": "scout",
            "description": "Анализ образов",
            "url": "https://docs.docker.com/reference/cli/docker/scout/",
            "specific": true
          },
          {
            "name": "debug",
            "description": "Отладочное окружение",
            "url": "https://docs.docker.com/reference/cli/docker/debug/",
            "specific": true
          },
          {
            "name": "desktop",
            "description": "Docker Desktop",
            "url": "https://docs.docker.com/reference/cli/docker/desktop/",
            "specific": true
          },
          {
            "name": "init",
            "description": "Стартовые файлы проекта",
            "url": "https://docs.docker.com/reference/cli/docker/init/",
            "specific": true
          },
          {
            "name": "dhi",
            "description": "Hardened Images CLI",
            "url": "https://docs.docker.com/reference/cli/docker/dhi/",
            "specific": true
          },
          {
            "name": "mcp",
            "description": "Docker MCP Toolkit",
            "url": "https://docs.docker.com/reference/cli/docker/mcp/",
            "specific": true
          },
          {
            "name": "model",
            "description": "Model Runner",
            "url": "https://docs.docker.com/reference/cli/docker/model/",
            "specific": true
          },
          {
            "name": "offload",
            "description": "Docker Offload",
            "url": "https://docs.docker.com/reference/cli/docker/offload/",
            "specific": true
          },
          {
            "name": "pass",
            "description": "Секреты локального keychain",
            "url": "https://docs.docker.com/reference/cli/docker/pass/",
            "specific": true
          }
        ]
      }
    ]
  }
];
