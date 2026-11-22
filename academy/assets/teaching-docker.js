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
    keys: [...previous.keys, ...keys],
    render,
    mount,
    dockerFlows: flows,
    dockerQuestions: questions,
    dockerChecklists: checklists
  };
})();
