(function () {
  const previous = window.ATLAS_TEACHING;
  const esc = value => String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const panel = (key, title, body) => '<section class="teach-panel docker-panel" data-teach="' + key + '" aria-label="' + esc(title) + '"><div class="teach-label">Docker · учебный блок</div><h3>' + esc(title) + '</h3>' + body + '</section>';

  const flows = {
    "docker-origin-route": {
      title: "От команды к процессу",
      steps: [
        ["CLI", "Клиент формирует запрос к выбранному Engine.", "blue"],
        ["Engine API", "Daemon проверяет образ и конфигурацию запуска.", "violet"],
        ["Runtime", "Создаются требуемые пространства имён, mounts и cgroup.", "amber"],
        ["Процесс", "Целевой процесс использует ядро среды выполнения.", "green"]
      ]
    },
    "docker-isolation-boundaries": {
      title: "Три независимые границы",
      steps: [
        ["Namespaces", "Меняют видимость PID, mount, network и других ресурсов.", "violet"],
        ["Cgroups", "Учитывают и ограничивают CPU, память, задачи и I/O.", "blue"],
        ["Полномочия", "User namespace и capabilities определяют доступные права.", "amber"],
        ["Политики", "Seccomp и LSM добавляют ограничения системных действий.", "green"]
      ]
    },
    "docker-images-cache": {
      title: "Что зависит от каких входов",
      steps: [
        ["FROM", "Базовый образ и выбранная версия задают начальные слои.", "blue"],
        ["COPY manifest", "Манифест зависимостей становится входом шага установки.", "violet"],
        ["RUN install", "Кэш зависит от инструкции и манифеста зависимостей.", "amber"],
        ["COPY source", "Изменение исходников не инвалидирует установку зависимостей.", "green"]
      ]
    },
    "dockerfile-build-flow": {
      title: "Путь от каталога к процессу",
      steps: [
        ["Build context", "Builder получает разрешённые файлы проекта.", "blue"],
        ["Инструкции", "FROM создаёт стадию, RUN и COPY задают шаги сборки.", "violet"],
        ["Конфигурация", "Итоговая стадия задаёт пользователя и команду по умолчанию.", "amber"],
        ["Runtime", "Engine запускает процесс с выбранными аргументами.", "green"]
      ]
    },
    "docker-runtime-lifecycle": {
      title: "Состояния процесса и контейнера",
      steps: [
        ["Образ", "Файлы и конфигурация задают шаблон запуска.", "blue"],
        ["Running", "Engine запускает главный процесс контейнера.", "green"],
        ["Stopping", "Процесс получает сигнал и время на завершение.", "amber"],
        ["Stopped", "Код выхода и метаданные доступны для диагностики.", "violet"]
      ]
    },
    "docker-network-route": {
      title: "От клиента к сокету контейнера",
      steps: [
        ["Клиент", "Подключается к выбранному адресу хоста.", "blue"],
        ["Публикация", "Engine направляет опубликованный порт в сеть контейнера.", "violet"],
        ["Bridge / veth", "Пакет проходит по настроенному сетевому пути.", "amber"],
        ["Listener", "Процесс принимает соединение на нужном адресе и порту.", "green"]
      ]
    },
    "docker-volume-lifecycle": {
      title: "Какие данные переживают пересоздание",
      steps: [
        ["Writable layer", "Запись относится к одному экземпляру контейнера.", "blue"],
        ["Удаление", "Writable layer этого экземпляра исчезает.", "amber"],
        ["Named volume", "Отдельный ресурс можно подключить к новому контейнеру.", "green"],
        ["Backup", "Копия считается полезной после проверки восстановления.", "violet"]
      ]
    },
    "docker-compose-flow": {
      title: "От YAML к работающему стеку",
      steps: [
        ["Compose file", "Фиксирует желаемые сервисы, сети и тома.", "blue"],
        ["Config", "Переменные и объединённые файлы влияют на итог.", "violet"],
        ["Engine", "Создаёт сеть, mounts и контейнеры проекта.", "amber"],
        ["Application", "Сервисы должны пережить задержки и отказы зависимостей.", "green"]
      ]
    },
    "docker-health-flow": {
      title: "От процесса к сигналу готовности",
      steps: [
        ["Running", "Главный процесс ещё существует.", "blue"],
        ["Probe", "HEALTHCHECK выполняет заданную команду.", "violet"],
        ["Health", "Результат обновляется после проверок и retries.", "amber"],
        ["Consumer", "Другой компонент решает, направлять ли трафик.", "green"]
      ]
    },
    "docker-diagnostics-flow": {
      title: "От симптома к проверяемой гипотезе",
      steps: [
        ["Симптом", "Запишите влияние и время начала.", "blue"],
        ["Состояние", "Проверьте status, exit code и health.", "violet"],
        ["Доказательства", "Сверьте логи, события и ресурсы.", "amber"],
        ["Проверка", "Выберите read-only наблюдение, способное опровергнуть гипотезу.", "green"]
      ]
    },
    "docker-command-map": {
      title: "Объект, команда, побочный эффект",
      steps: [
        ["Объект", "Определите: image, container, network, volume или Compose.", "blue"],
        ["Действие", "Выберите inspect, list, run, start, stop или export.", "violet"],
        ["Эффект", "Уточните чтение, создание, изменение или удаление.", "amber"],
        ["Проверка", "Сверьте help, context и целевые объекты.", "green"]
      ]
    },
    "docker-rollback-flow": {
      title: "Health gate и восстановление релиза",
      steps: [
        ["Исходная версия", "Зафиксируйте image ID и проверьте stable-v1.", "blue"],
        ["Кандидат", "Запустите новую версию на том же loopback endpoint.", "violet"],
        ["Health gate", "503 и unhealthy означают, что кандидат не готов.", "amber"],
        ["Откат", "Восстановите точный image ID и проверьте версию и health.", "green"]
      ]
    }
  };

  const questions = {
    "docker-origin-choice": {
      question: "Что запускается при старте обычного Linux-контейнера?",
      answers: [
        "Полная гостевая ОС со своим ядром",
        "Процесс, ограниченный механизмами ядра среды выполнения",
        "Только неизменяемый образ, без процесса"
      ],
      correct: 1,
      feedback: [
        "Это описание ближе к виртуальной машине: контейнер обычно не запускает собственное ядро.",
        "Верно. Образ задаёт файлы и конфигурацию, а контейнер запускает процесс в общей среде ядра.",
        "Образ сам по себе не является выполняющимся процессом."
      ]
    },
    "docker-isolation-choice": {
      question: "Какой механизм ограничивает число задач, включая потоки, в cgroup v2?",
      answers: [
        "PID namespace",
        "pids.max",
        "network namespace"
      ],
      correct: 1,
      feedback: [
        "PID namespace меняет видимость идентификаторов, но не задаёт квоту на число задач.",
        "Верно. pids.max задаёт предел задач cgroup и её потомков согласно иерархии.",
        "Network namespace изолирует сетевое представление, не число задач."
      ]
    },
    "docker-images-choice": {
      question: "Какой порядок лучше сохраняет кэш зависимостей при изменении только исходника приложения?",
      answers: [
        "Сначала COPY всего проекта, затем установка",
        "Сначала COPY манифеста зависимостей и установка, затем COPY исходников",
        "Сначала CMD, затем FROM"
      ],
      correct: 1,
      feedback: [
        "Изменение исходника инвалидирует ранний шаг и зависимые от него инструкции.",
        "Верно. Пока манифест зависимостей и базовый образ прежние, шаг установки может использовать кэш.",
        "FROM задаёт базовый образ и должен предшествовать остальным инструкциям стадии."
      ]
    },
    "dockerfile-cmd-choice": {
      question: "Есть ENTRYPOINT [\"cat\"] и CMD [\"/app/message.txt\"]. Что выполнит docker run IMAGE /etc/alpine-release?",
      answers: [
        "cat /app/message.txt, аргумент команды игнорируется",
        "cat /etc/alpine-release, аргумент заменяет CMD",
        "Запустит второе ядро Alpine в контейнере"
      ],
      correct: 1,
      feedback: [
        "Аргументы после имени образа обычно заменяют CMD в этой конфигурации.",
        "Верно. ENTRYPOINT остаётся cat, а переданный путь заменяет аргумент CMD.",
        "ENTRYPOINT и CMD формируют процесс контейнера; они не создают гостевое ядро."
      ]
    },
    "docker-runtime-choice": {
      question: "Контейнер имеет статус running. Что это подтверждает?",
      answers: [
        "Все пользовательские запросы обслуживаются успешно",
        "Главный процесс контейнера всё ещё работает",
        "Последняя резервная копия восстановима"
      ],
      correct: 1,
      feedback: [
        "Статус процесса не проверяет весь путь пользовательского запроса.",
        "Верно. Running описывает состояние контейнера, но не готовность приложения.",
        "Состояние контейнера не подтверждает наличие или качество backup."
      ]
    },
    "docker-network-choice": {
      question: "Что означает публикация -p 127.0.0.1:8080:80?",
      answers: [
        "Порт 8080 хоста направляется на порт 80 контейнера через loopback хоста",
        "EXPOSE открывает порт 80 на всех интерфейсах",
        "Контейнеру выдаётся постоянный адрес 127.0.0.1"
      ],
      correct: 0,
      feedback: [
        "Верно. Адрес слева задаёт bind loopback хоста, порт справа относится к контейнеру. Для Engine до 28.0.0 учитывайте предупреждение о соседях в той же L2-сети.",
        "EXPOSE сам по себе не публикует порт, а этот параметр задаёт bind address.",
        "127.0.0.1 здесь — адрес хоста для публикации, не адрес контейнера."
      ]
    },
    "docker-volume-choice": {
      question: "Что следует считать резервной копией важных данных?",
      answers: [
        "Любой volume, подключённый к контейнеру",
        "Файл в writable layer работающего контейнера",
        "Отдельную проверенную копию с процедурой восстановления"
      ],
      correct: 2,
      feedback: [
        "Volume отделяет данные от lifecycle контейнера, но сам не создаёт backup.",
        "Writable layer принадлежит экземпляру контейнера и не подходит как надёжная копия.",
        "Верно. Проверка восстановления подтверждает, что копия пригодна для цели."
      ]
    },
    "docker-compose-choice": {
      question: "Что гарантирует короткая форма depends_on?",
      answers: [
        "Зависимый сервис уже принимает запросы",
        "Задаёт порядок запуска, но не готовность приложения",
        "Создаёт резервную копию томов перед запуском"
      ],
      correct: 1,
      feedback: [
        "Порядок запуска сам по себе не доказывает готовность зависимости.",
        "Верно. Для ожидания стартового health состояния нужна поддерживаемая форма условия; дальнейший отказ приложение всё равно должно пережить.",
        "Compose не создаёт backup автоматически через depends_on."
      ]
    },
    "docker-health-choice": {
      question: "Что делает статус unhealthy в обычном Docker Engine?",
      answers: [
        "Всегда завершает процесс и запускает его заново",
        "Отмечает провал настроенного healthcheck; сам по себе не перезапускает процесс",
        "Доказывает, что причина отказа — внешний API"
      ],
      correct: 1,
      feedback: [
        "Healthcheck сообщает состояние; самостоятельная политика перезапуска не следует из этого статуса.",
        "Верно. Сигнал нужно интерпретировать и использовать согласно модели сервиса.",
        "Probe не устанавливает первопричину без дополнительных наблюдений."
      ]
    },
    "docker-diagnostics-choice": {
      question: "Контейнер завершился с кодом 137. Что следует заключить?",
      answers: [
        "Это всегда OOM kill",
        "Процесс получил SIGKILL; причину уточняют по OOMKilled, событиям и контексту",
        "Это штатный код приложения при успешном завершении"
      ],
      correct: 1,
      feedback: [
        "137 не отличает OOM от ручного SIGKILL или истечения stop timeout.",
        "Верно. Код обозначает сигнал, а не первопричину.",
        "Для обычного успешного завершения чаще используется код 0."
      ]
    },
    "docker-command-choice": {
      question: "Как сохранить Docker-образ с его слоями для переноса?",
      answers: [
        "docker image save IMAGE",
        "docker container export CONTAINER",
        "docker logs CONTAINER"
      ],
      correct: 0,
      feedback: [
        "Верно. image save сохраняет образ и нужные слои в архив.",
        "export выдаёт файловую систему контейнера, а не исходное представление образа с его слоями.",
        "logs показывает вывод процесса и не сохраняет образ."
      ]
    },
    "docker-rollback-choice": {
      question: "Какие наблюдения подтверждают, что лабораторный откат восстановил исходную версию?",
      answers: [
        "Контейнер имеет статус running",
        "Image ID совпадает с исходным, /health отвечает 200, /version показывает stable-v1",
        "Кандидат получил unhealthy и должен перезапуститься автоматически"
      ],
      correct: 1,
      feedback: [
        "running подтверждает существование процесса, но не готовность приложения и не версию артефакта.",
        "Верно. Проверяются исходный image ID, health endpoint и версия, а не только состояние процесса.",
        "Healthcheck сообщает состояние; он сам по себе не запускает политику отката или рестарта."
      ]
    }
  };

  const checklists = {
    "docker-origin-check": [
      "Различил образ, контейнер и виртуальную машину.",
      "Проследил запрос от CLI до процесса.",
      "Проверил выбранный context и состояние Engine."
    ],
    "docker-isolation-check": [
      "Отделил видимость ресурсов от квот cgroups.",
      "Сопоставил memory.max, cpu.max и pids.max с разными пределами.",
      "Назвал остаточные риски полномочий и Docker socket."
    ],
    "docker-images-check": [
      "Предсказал кэш после изменения исходника и манифеста зависимостей.",
      "Отличил изменяемый тег от digest.",
      "Объяснил, почему удаление в позднем слое не удаляет ранние байты."
    ],
    "dockerfile-check": [
      "Отделил build context от остальной файловой системы хоста.",
      "Различил инструкции сборки и параметры запуска процесса.",
      "Проверил пользователя и содержимое итоговой стадии."
    ],
    "docker-runtime-check": [
      "Сохранил status, exit code и временную линию отказа.",
      "Отделил running от готовности обслуживать запросы.",
      "Проверил остановку и место постоянных данных."
    ],
    "docker-network-check": [
      "Проследил путь от адреса клиента до listener.",
      "Проверил bind address и опубликованные порты.",
      "Не менял сеть или firewall ради учебной диагностики."
    ],
    "docker-volume-check": [
      "Определил, где физически находятся нужные данные.",
      "Различил writable layer, named volume и bind mount.",
      "Назвал backup и проверку восстановления."
    ],
    "docker-compose-check": [
      "Прочитал итоговую конфигурацию до запуска.",
      "Проверил порты, сети и жизненный цикл томов.",
      "Учёл готовность и отказ зависимого сервиса."
    ],
    "docker-health-check": [
      "Определил точное свойство, которое измеряет probe.",
      "Разделил health status и решение о трафике или рестарте.",
      "Проверил ожидаемые false positive и false negative."
    ],
    "docker-diagnostics-check": [
      "Сохранил временные метки и важные статусы до изменений.",
      "Подкрепил гипотезу независимыми наблюдениями.",
      "Выбрал безопасную проверку и условие восстановления."
    ],
    "docker-command-check": [
      "Подобрал команду для нужного Docker-объекта.",
      "Различил сохранение образа и экспорт файловой системы.",
      "Выделил команды, которые могут изменить или удалить данные."
    ],
    "docker-rollback-check": [
      "Проверил выбранный Engine и границу публикации host-порта.",
      "Записал health и HTTP-ответ кандидата до удаления контейнера.",
      "Сверил исходный image ID, health и версию после восстановления."
    ]
  };

  const keys = [...Object.keys(flows), ...Object.keys(questions), ...Object.keys(checklists)];

  function render(key) {
    if (flows[key]) {
      const flow = flows[key];
      const buttons = flow.steps.map((step, index) =>
        '<button type="button" class="docker-flow-step tone-' + step[2] + '" data-docker-action="step-' + index + '" aria-pressed="' + (index === 0) + '">' +
        '<span class="docker-step-number">' + (index + 1) + '</span><strong>' + esc(step[0]) + '</strong><small>' + esc(step[1]) + '</small></button>'
      ).join("");
      return panel(key, flow.title,
        '<div class="docker-flow" role="group" aria-label="' + esc(flow.title) + '">' + buttons + '</div>' +
        '<p class="docker-flow-detail" data-docker-detail aria-live="polite"></p>' +
        '<div class="teach-actions">' +
        '<button type="button" class="teach-btn" data-docker-action="prev">← Назад</button>' +
        '<button type="button" class="teach-btn" data-docker-action="next">Следующий шаг →</button>' +
        '<button type="button" class="teach-btn" data-docker-action="reset">Сначала</button></div>');
    }

    if (questions[key]) {
      const quiz = questions[key];
      return panel(key, "Проверьте модель",
        '<p>' + esc(quiz.question) + '</p><div class="teach-answers" role="group" aria-label="Варианты ответа">' +
        quiz.answers.map((answer, index) =>
          '<button type="button" class="teach-btn" data-docker-action="answer-' + index + '" aria-pressed="false">' + esc(answer) + '</button>'
        ).join("") + '</div><p class="docker-feedback" data-docker-feedback aria-live="polite">Выберите ответ. При ошибке прочитайте объяснение и попробуйте снова.</p>');
    }

    if (checklists[key]) {
      const tasks = checklists[key];
      return panel(key, "Проверьте свою работу",
        '<p>Отметки служат личной проверкой и не оценивают выполнение команд.</p><div class="docker-checklist">' +
        tasks.map((task, index) =>
          '<label><input type="checkbox" data-docker-task="' + index + '"><span>' + esc(task) + '</span></label>'
        ).join("") + '</div><p class="docker-progress" data-docker-progress aria-live="polite">0 / ' + tasks.length + ' · проверено</p>');
    }

    return previous.render(key);
  }

  function mount(root) {
    previous.mount(root);
    root.querySelectorAll("[data-teach]").forEach(node => {
      const key = node.dataset.teach;

      if (flows[key]) {
        const buttons = [...node.querySelectorAll('[data-docker-action^="step-"]')];
        const detail = node.querySelector("[data-docker-detail]");
        let current = 0;
        const draw = () => {
          buttons.forEach((button, index) => {
            button.setAttribute("aria-pressed", String(index === current));
            if (index === current) button.setAttribute("aria-current", "step");
            else button.removeAttribute("aria-current");
          });
          detail.textContent = flows[key].steps[current][1];
          node.querySelector('[data-docker-action="prev"]').disabled = current === 0;
          node.querySelector('[data-docker-action="next"]').disabled = current === buttons.length - 1;
        };
        node.addEventListener("click", event => {
          const action = event.target.closest("[data-docker-action]")?.dataset.dockerAction;
          if (!action) return;
          if (action === "next") current = Math.min(current + 1, buttons.length - 1);
          else if (action === "prev") current = Math.max(current - 1, 0);
          else if (action === "reset") current = 0;
          else if (action.startsWith("step-")) current = Number(action.slice(5));
          else return;
          draw();
        });
        draw();
      } else if (questions[key]) {
        const quiz = questions[key];
        node.addEventListener("click", event => {
          const button = event.target.closest("[data-docker-action^='answer-']");
          if (!button) return;
          const index = Number(button.dataset.dockerAction.slice(7));
          const feedback = node.querySelector("[data-docker-feedback]");
          node.querySelectorAll("[data-docker-action^='answer-']").forEach(item =>
            item.setAttribute("aria-pressed", String(item === button))
          );
          feedback.dataset.result = index === quiz.correct ? "correct" : "retry";
          feedback.textContent = quiz.feedback[index];
        });
      } else if (checklists[key]) {
        const tasks = [...node.querySelectorAll("[data-docker-task]")];
        const progress = node.querySelector("[data-docker-progress]");
        node.addEventListener("change", () => {
          const checked = tasks.filter(task => task.checked).length;
          progress.textContent = checked + " / " + tasks.length + " · проверено";
        });
      }
    });
  }

  window.ATLAS_TEACHING = {
    ...previous,
    keys: [...new Set([...previous.keys, ...keys])],
    render,
    mount,
    dockerFlows: flows,
    dockerQuestions: questions,
    dockerChecklists: checklists
  };
})();
