(function(){
"use strict";
const prev=window.ATLAS_TEACHING,esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const panel=(key,title,html)=>'<section class="teach-panel" data-teach="'+key+'" aria-label="'+esc(title)+'"><div class="teach-label">Учебный блок Linux</div><h3>'+esc(title)+'</h3>'+html+'</section>';
const btn=(a,label,extra="")=>'<button type="button" class="teach-btn" data-lin-action="'+a+'" '+extra+'>'+esc(label)+'</button>';
const file=(role,label,body)=>'<div class="teach-file '+role+'"><div class="teach-file-title">'+esc(label)+'</div><div class="teach-file-content">'+esc(body).replace(/\n/g,"<br>")+'</div></div>';
const layers=[["Приложение","Python · браузер · редактор","work"],["Userspace","Bash · libc · утилиты · службы","index"],["Ядро","Процессы · память · ФС · сеть","head"],["Оборудование","CPU · RAM · накопители · сеть","work"]];
const cases={driver:["Не обнаружен накопитель","Ядро и устройство","uname -r; сведения об устройстве. Это начало диагностики."],package:["Не устанавливается пакет","Дистрибутив и пакетный менеджер","os-release; версия менеджера и журнал ошибки."],quote:["Путь с пробелом стал двумя аргументами","Shell","type; версия Bash; точный текст команды."]};
const paths={root:"/tmp/atlas/atlas-service",www:"/tmp/atlas/atlas-service/www",logs:"/tmp/atlas/atlas-service/logs"};
function pathStep(dir,action){if(action==="parent")return "root";if(action==="www"||action==="logs"||action==="root")return action;return dir;}
const argvCases={quoted:{line:'cat "two words.log"',args:["cat","two words.log"],msg:"Кавычки сохраняют один операнд с пробелом."},split:{line:"cat two words.log",args:["cat","two","words.log"],msg:"Два операнда вместо одного."},glob:{line:"printf '%s\\n' *.txt",args:["printf","%s\\n","a.txt","b.txt"],msg:"Bash раскрыл glob до запуска команды."},literal:{line:"printf '%s\\n' '*.txt'",args:["printf","%s\\n","*.txt"],msg:"Одинарные кавычки сохраняют шаблон буквально."}};
const streams={default:{out:"Терминал",err:"Терминал",msg:"Два отдельных потока могут отображаться в одном терминале."},out:{out:"out.log",err:"Терминал",msg:"Перенаправлен только stdout."},both:{out:"both.log",err:"both.log",msg:"Сначала stdout направлен в файл, затем stderr получил его назначение."},reverse:{out:"out.log",err:"Терминал",msg:"stderr получил старое назначение stdout, до изменения stdout."},separate:{out:"out.log",err:"err.log",msg:"Оба потока направлены в разные файлы."}};
const lines=["INFO start","ERROR timeout","INFO ready","ERROR timeout","ERROR disk"];
function pipeStep(stage,a){if(a==="reset")return 0;return a===["grep","sort","uniq"][stage]?stage+1:stage;}
const pipeOutput=s=>s===0?lines:s===1?lines.filter(x=>x.startsWith("ERROR")):s===2?lines.filter(x=>x.startsWith("ERROR")).sort():["1 ERROR disk","2 ERROR timeout"];
const questions={
"linux-lab-question":{q:"Как безопасно проверить новую команду, которая создаёт файл?",a:["Сначала sudo","Новая учебная папка, pwd, справка и проверка результата","Запустить в / без проверки"],ok:1,f:["Привилегии увеличивают риск.","Верно. Проверьте контекст и эффект до выполнения.","Неизвестный путь может затронуть систему."]},
"linux-shell-question":{q:"grep не нашёл WARNING в существующем журнале. Что означает статус 1?",a:["Файл обязательно повреждён","Совпадений нет; это отдельный ожидаемый результат","Pipeline гарантированно успешно обработал все данные"],ok:1,f:["У GNU grep ошибка обычно имеет статус 2.","Верно. Отсутствие совпадения не равно ошибке чтения.","Итог pipeline зависит от статусов и pipefail."]}
};
const keys=["linux-layers","linux-history-timeline","linux-layer-choice","linux-interface","linux-lab-boundary","linux-path-walk","linux-command-parts","linux-shell-argv","linux-shell-streams","linux-shell-pipe","linux-shell-status",...Object.keys(questions)];
function render(key){
 if(key===keys[0])return panel(key,"От приложения к ресурсам",'<div class="linux-start-stack">'+layers.map(([a,b,c])=>file(c,a,b)).join('<div class="linux-start-arrow">↓ запрос / интерфейс</div>')+'</div><p class="teach-caption">Дистрибутив собирает совместимые компоненты и задаёт правила обновления. Оболочка — часть userspace.</p>');
 if(key===keys[1])return panel(key,"От разделения времени к GNU/Linux",'<div class="linux-start-timeline">'+[["1960-е","Многопользовательские системы","Разделение ресурсов и файлов"],["1969","UNIX","Малые программы, общие интерфейсы"],["1983","GNU","Свободные Unix-подобные инструменты"],["1991","Linux","Ядро, развиваемое независимо"],["Сегодня","Дистрибутивы","Интеграция и поддержка"]].map(([a,b,c])=>'<div><b>'+a+'</b><strong>'+b+'</strong><small>'+c+'</small></div>').join("")+'</div>');
 if(key===keys[2])return panel(key,"К какому слою относится проблема?",'<div class="teach-actions">'+Object.entries(cases).map(([a,b])=>btn("layer-"+a,b[0],'aria-pressed="false"')).join("")+'</div><div data-lin-view></div><p data-lin-feedback aria-live="polite"></p>');
 if(key===keys[3])return panel(key,"API и ABI — разные контракты",'<div class="linux-start-stack">'+file("work","Исходный код","Python os.open / C open")+ '<div class="linux-start-arrow">↓ API</div>'+file("index","Библиотека / обёртка","Подготавливает вызов")+ '<div class="linux-start-arrow">↓ syscall ABI</div>'+file("head","Ядро","Проверки и файловый интерфейс")+'</div><p class="teach-caption">Один API не обязательно равен одному системному вызову.</p>');
 if(key===keys[4])return panel(key,"Выберите безопасную границу эксперимента",'<div class="teach-files">'+file("head","Временная папка","Обычный пользователь · файлы и shell")+file("index","Контейнер","Изолированные контексты · общее ядро с хостом")+file("work","Отдельная VM","Собственное ядро · виртуальные устройства")+'</div><p>Для первых упражнений достаточно отдельной папки; для экспериментов с загрузкой и дисками нужна отдельная VM. Snapshot не заменяет backup.</p>');
 if(key===keys[5])return panel(key,"Текущий каталог и относительный путь",'<p>Учебная модель: из atlas-service можно перейти в www или logs. Кнопка «В корень проекта» — абсолютный путь, не корень ОС.</p><div data-lin-view></div><div class="teach-actions">'+[["www","cd www (из проекта)"],["logs","cd logs (из проекта)"],["parent","cd .. (из дочернего)"],["root","В корень проекта"]].map(([a,b])=>btn(a,b)).join("")+'</div><p data-lin-feedback aria-live="polite"></p>');
 if(key===keys[6])return panel(key,"Из чего состоит команда",'<div class="teach-files">'+file("head","Имя команды","ls")+file("index","Опция","-l")+file("work","Операнд","www")+'</div><p class="teach-caption">Оболочка передаёт отдельные аргументы. COMMAND [OPTION] FILE... в справке — обозначение, не буквальная команда.</p>');
 if(key===keys[7])return panel(key,"Что попадёт в argv?",'<div class="teach-actions">'+[["quoted","С кавычками"],["split","Без кавычек"],["glob","Glob"],["literal","Литеральный glob"]].map(([a,b])=>btn("argv-"+a,b,'aria-pressed="false"')).join("")+'</div><div data-lin-view></div><p data-lin-feedback aria-live="polite"></p>');
 if(key===keys[8])return panel(key,"Куда направятся stdout и stderr?",'<div class="teach-actions">'+[["default","По умолчанию"],["out","> out.log"],["both","> both.log 2>&1"],["reverse","2>&1 > out.log"],["separate","> out.log 2> err.log"]].map(([a,b])=>btn("stream-"+a,b,'aria-pressed="false"')).join("")+'</div><div data-lin-view></div><p data-lin-feedback aria-live="polite"></p>');
 if(key===keys[9])return panel(key,"Соберите pipeline обработки журнала",'<p>Сначала отберите ERROR, затем отсортируйте и посчитайте соседние одинаковые строки.</p><div data-lin-view></div><div class="teach-actions">'+[["grep","grep -F ERROR"],["sort","sort"],["uniq","uniq -c"],["reset","Сначала"]].map(([a,b])=>btn(a,b)).join("")+'</div><p data-lin-feedback aria-live="polite"></p>');
 if(key===keys[10])return panel(key,"Скрытый отказ в pipeline false | true",'<div class="teach-actions">'+btn("status-off","Pipefail off",'aria-pressed="false"')+btn("status-on","Pipefail on",'aria-pressed="false"')+'</div><div data-lin-view></div><p data-lin-feedback aria-live="polite"></p>');
 if(questions[key]){const q=questions[key];return panel(key,"Проверьте себя",'<p>'+esc(q.q)+'</p><div class="teach-answers">'+q.a.map((a,i)=>btn("answer-"+i,a,'aria-pressed="false"')).join("")+'</div><p class="teach-feedback" data-lin-feedback aria-live="polite">Выберите ответ.</p>');}
 return prev.render(key);
}
function mount(root){prev.mount(root);root.querySelectorAll("[data-teach]").forEach(n=>{
 const key=n.dataset.teach,out=n.querySelector("[data-lin-feedback]"),view=n.querySelector("[data-lin-view]");
 const listen=fn=>n.addEventListener("click",e=>{const b=e.target.closest("[data-lin-action]");if(b)fn(b.dataset.linAction);});
 const pressed=a=>n.querySelectorAll("[data-lin-action][aria-pressed]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.linAction===a)));
 if(key===keys[2]){const draw=a=>{pressed(a);const c=cases[a.slice(6)];view.innerHTML=file("index","Начните с",c[1]);out.textContent=c[2];};listen(draw);draw("layer-driver");}
 else if(key===keys[5]){let dir="root";const draw=()=>{view.innerHTML=file("head","pwd",paths[dir]);};listen(a=>{if((a==="www"||a==="logs")&&dir!=="root"){out.textContent="Относительный путь не найден в этой модели. Сначала вернитесь в проект.";return;}if(a==="parent"&&dir==="root"){out.textContent="За границы проекта в этой модели не выходим.";return;}dir=pathStep(dir,a);draw();out.textContent="Текущий каталог изменён: "+dir;});draw();out.textContent="Начинаем в каталоге проекта.";}
 else if(key===keys[7]){const draw=a=>{pressed(a);const c=argvCases[a.slice(5)];view.innerHTML=file("head","Ввод",c.line)+'<div class="linux-start-args">'+c.args.map((x,i)=>file("index","argv["+i+"]",x)).join("")+'</div>';out.textContent=c.msg;};listen(draw);draw("argv-quoted");}
 else if(key===keys[8]){const draw=a=>{pressed(a);const c=streams[a.slice(7)];view.innerHTML='<div class="teach-files teach-two">'+file("head","stdout (1)",c.out)+file("work","stderr (2)",c.err)+'</div>';out.textContent=c.msg;};listen(draw);draw("stream-default");}
 else if(key===keys[9]){let stage=0;const draw=()=>{view.innerHTML=file("index",["Вход","После grep","После sort","После uniq -c"][stage],pipeOutput(stage).join("\n"));};listen(a=>{const before=stage;stage=pipeStep(stage,a);draw();out.textContent=a==="reset"?"Начальный журнал.":stage===before?"Следуйте порядку обработки.":stage===3?"Итог: три ошибки, две группы.":"Этап выполнен.";});draw();out.textContent="Выберите первую операцию.";}
 else if(key===keys[10]){const draw=a=>{pressed(a);const on=a==="status-on";view.innerHTML='<div class="teach-files">'+file("work","false","1")+file("head","true","0")+file("index","Итог pipeline",on?"1":"0")+'</div>';out.textContent=on?"Pipefail сообщает ненулевой статус.":"Статус последней команды скрывает отказ первой."};listen(draw);draw("status-off");}
 else if(questions[key]){const q=questions[key];listen(a=>{const i=Number(a.slice(7));if(!q.a[i])return;pressed(a);out.dataset.result=i===q.ok?"correct":"retry";out.textContent=q.f[i];});}
});}
window.ATLAS_TEACHING={...prev,keys:[...prev.keys,...keys],render,mount,linuxPathStep:pathStep,linuxPipeStep:pipeStep,linuxPipeOutput:pipeOutput,linuxArgvCases:argvCases,linuxStreams:streams};
})();
(function(){'use strict';const prev=window.ATLAS_TEACHING;const panels={
  "linux-vfs-links": {
    "title": "Имя, объект и данные",
    "cases": [
      [
        "Исходник",
        "logs/service.log → inode A",
        "байты: журнал Atlas",
        "Имя связывает каталог с объектом."
      ],
      [
        "Hard link",
        "links/hard.log → inode A",
        "те же байты",
        "Оба имени ссылаются на один объект."
      ],
      [
        "Symlink",
        "links/soft.log → ../logs/service.log",
        "разрешение пути → inode A",
        "Ссылка хранит путь, а не второе имя inode A."
      ],
      [
        "Копия",
        "links/copy.log → inode B",
        "независимые байты",
        "Изменение A не меняет B."
      ]
    ]
  },
  "linux-vfs-life": {
    "title": "Жизненный цикл открытого файла",
    "cases": [
      [
        "Открыть",
        "service.log → inode A",
        "FD 3 → открытое описание → A",
        "Имя и открытое описание независимы."
      ],
      [
        "Удалить имя",
        "service.log отсутствует",
        "FD 3 → A, nlink=0",
        "Объект остаётся доступным через FD."
      ],
      [
        "Создать снова",
        "service.log → inode B",
        "FD 3 → A",
        "Старый процесс не переключился на B."
      ],
      [
        "Закрыть FD",
        "service.log → inode B",
        "FD 3 закрыт",
        "A может быть освобождён при отсутствии других ссылок."
      ]
    ]
  },
  "linux-vfs-check": {
    "title": "Проверьте прогноз",
    "q": "После удаления исходного имени осталась жёсткая ссылка. Что произойдёт?",
    "a": [
      "Данные всегда исчезнут",
      "Жёсткая ссылка продолжит открывать тот же объект",
      "Ссылка автоматически станет симлинком"
    ],
    "ok": 1,
    "feedback": [
      "Удаление имени не уничтожает объект с другими ссылками.",
      "Верно: имя удалено, объект ещё имеет ссылку.",
      "Тип ссылки не меняется."
    ]
  },
  "linux-text-search": {
    "title": "Выберите область поиска",
    "cases": [
      [
        "find",
        "find logs -name '*.log'",
        "имена файлов",
        "Ищет пути, не строки журнала."
      ],
      [
        "grep",
        "grep '^ERROR ' logs/service.log",
        "строки с уровнем ERROR",
        "Проверяет содержимое известного файла."
      ],
      [
        "awk",
        "awk '$1==\"ERROR\"'",
        "записи по первому полю",
        "Позволяет работать с полями и счётчиками."
      ]
    ]
  },
  "linux-text-fields": {
    "title": "Из записи в счётчик",
    "cases": [
      [
        "Вход",
        "INFO ERROR text\\nERROR timeout\\nERROR disk\\nERROR timeout",
        "4 строки",
        "INFO ERROR text не является ошибкой уровня ERROR."
      ],
      [
        "Фильтр",
        "ERROR timeout\\nERROR disk\\nERROR timeout",
        "3 записи",
        "Проверяется первое поле."
      ],
      [
        "Группировка",
        "timeout → 2\\ndisk → 1",
        "2 причины",
        "Счётчик увеличивается для второго поля."
      ],
      [
        "Отчёт",
        "disk 1\\ntimeout 2",
        "стабильный порядок",
        "Сортировка не меняет счётчики."
      ]
    ]
  },
  "linux-text-check": {
    "title": "Проверьте прогноз",
    "q": "Как безопасно передать имена с переводом строки?",
    "a": [
      "for f in $(find ...)",
      "find -print0 и NUL-совместимый потребитель",
      "Разделять по пробелам"
    ],
    "ok": 1,
    "feedback": [
      "Разбиение разрушит границы имён.",
      "Верно: NUL не может входить в имя файла.",
      "Пробел допустим внутри имени."
    ]
  },
  "linux-script-flow": {
    "title": "Ветвление отчёта",
    "cases": [
      [
        "Нет аргумента",
        "argc = 0",
        "stderr: usage · exit 2",
        "Нельзя выбирать файл наугад."
      ],
      [
        "Нет файла",
        "argc = 1 · missing.log",
        "stderr: cannot read · exit 2",
        "Ошибка входа, не нулевой отчёт."
      ],
      [
        "Чистый журнал",
        "INFO ready",
        "stdout: 0 · exit 0",
        "Ноль событий — корректный результат."
      ],
      [
        "Есть ошибки",
        "ERROR disk × 2",
        "stdout: 2 · exit 0",
        "Число событий не является статусом программы."
      ]
    ]
  },
  "linux-script-status": {
    "title": "Статус выполнения и данные",
    "cases": [
      [
        "Совпадение",
        "grep → 0",
        "данные найдены",
        "Продолжить обработку."
      ],
      [
        "Нет совпадения",
        "grep → 1",
        "пустая выборка",
        "Это ожидаемый исход при поиске."
      ],
      [
        "Ошибка чтения",
        "grep → 2",
        "stderr: диагностика",
        "Не выдавать успешный отчёт."
      ]
    ]
  },
  "linux-script-check": {
    "title": "Проверьте контракт",
    "q": "Отчёт напечатал 3 ошибки. Какой статус нужен при успешном чтении?",
    "a": [
      "3",
      "0",
      "2"
    ],
    "ok": 1,
    "feedback": [
      "Число событий — данные stdout.",
      "Верно: обработка успешна.",
      "2 обозначает ошибку входа в нашем контракте."
    ]
  }
};const keys=Object.keys(panels);const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));const file=(role,label,body)=>'<div class="teach-file '+role+'"><div class="teach-file-title">'+esc(label)+'</div><div class="teach-file-content">'+esc(body).replace(/\\n|\n/g,'<br>')+'</div></div>';function render(key){const p=panels[key];if(!p)return prev.render(key);const labels=p.cases?p.cases.map(c=>c[0]):p.a;return '<section class="teach-panel" data-teach="'+key+'" aria-label="'+esc(p.title)+'"><div class="teach-label">Учебный блок Linux</div><h3>'+esc(p.title)+'</h3>'+(p.q?'<p>'+esc(p.q)+'</p>':'<p>Выберите состояние и сравните модель с опытом в терминале.</p>')+'<div class="teach-actions">'+labels.map((label,i)=>'<button type="button" class="teach-btn" data-linux-next="'+i+'" aria-pressed="false">'+esc(label)+'</button>').join('')+'</div><div data-linux-next-view></div><p class="teach-feedback" data-linux-next-feedback aria-live="polite"></p></section>';}function mount(root){prev.mount(root);root.querySelectorAll('[data-teach]').forEach(n=>{const p=panels[n.dataset.teach];if(!p)return;const view=n.querySelector('[data-linux-next-view]'),out=n.querySelector('[data-linux-next-feedback]');const draw=i=>{n.querySelectorAll('[data-linux-next]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.linuxNext)===i)));if(p.cases){const c=p.cases[i];view.innerHTML='<div class="teach-files teach-two">'+file('index','Вход / имя',c[1])+file('head','Объект / результат',c[2])+'</div>';out.textContent=c[3];}else{out.dataset.result=i===p.ok?'correct':'retry';out.textContent=p.feedback[i];}};n.addEventListener('click',e=>{const b=e.target.closest('[data-linux-next]');if(b)draw(Number(b.dataset.linuxNext));});if(p.cases)draw(0);else out.textContent='Выберите ответ.';});}window.ATLAS_TEACHING={...prev,keys:[...prev.keys,...keys],render,mount,linuxNextPanels:panels};})();
