(function(){
"use strict";
const prev=window.ATLAS_TEACHING;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const panel=(key,title,html)=>'<section class="teach-panel" data-teach="'+key+'" aria-label="'+esc(title)+'"><div class="teach-label">Учебный блок</div><h3>'+esc(title)+'</h3>'+html+'</section>';
const btn=(a,label,extra="")=>'<button type="button" class="teach-btn" data-history-action="'+a+'" '+extra+'>'+esc(label)+'</button>';
const statuses=[
 ["  ","A","A","A","Нет различий между тремя состояниями."],
 [" M","A","A","B","Только рабочий файл отличается от индекса."],
 ["M ","A","B","B","Только индекс отличается от HEAD."],
 ["MM","A","B","C","Индекс отличается от HEAD, а рабочий файл — от индекса."]
];
const file=(role,label,body)=>'<div class="teach-file '+role+'"><div class="teach-file-title">'+esc(label)+'</div><div class="teach-file-content">'+esc(body).replace(/\n/g,"<br>")+'</div></div>';
const values={A:"port=8080\ntimeout=10",B:"port=9090\ntimeout=10",C:"port=9090\ntimeout=30"};
const files=(h,i,w)=>'<div class="teach-files">'+file("head","HEAD",values[h])+file("index","Индекс",values[i])+file("work","Рабочий файл",values[w])+'</div>';
const diffLines=rows=>'<div class="teach-diff-lines">'+rows.map(([sign,txt])=>'<div class="'+(sign==="+"?"added":sign==="-"?"removed":"")+'"><span>'+esc(sign)+'</span>'+esc(txt)+'</div>').join('')+'</div>';
const hunks=[
 {id:"port",title:"Готовая правка: порт",rows:[["-","port=8080"],["+","port=9090"],[" ",""],[" ","# Atlas Notes"]]},
 {id:"timeout",title:"Эксперимент: время ожидания",rows:[[" ","# Notes"],[" ",""],["-","timeout=10"],["+","timeout=30"]]}
];
const initial=()=>({port:false,timeout:false,committed:false});
const stage=(s,action)=>{if(action==="reset")return initial();if(s.committed)return {...s};if(action==="port"||action==="timeout")return {...s,[action]:!s[action]};if(action==="commit"&&(s.port||s.timeout))return {...s,committed:true};return {...s};};
const stagedContent=s=>"port="+(s.port?"9090":"8080")+"\ntimeout="+(s.timeout?"30":"10");
const solved=s=>s.committed&&s.port&&!s.timeout;
const history=[
 {id:"A",msg:"Add initial service settings",port:8080,timeout:10,mode:null},
 {id:"B",msg:"Change service port",port:9090,timeout:10,mode:null},
 {id:"C",msg:"Add documented demo mode",port:9090,timeout:10,mode:"demo"},
 {id:"D",msg:"Clarify service startup instructions",port:9090,timeout:10,mode:"demo"},
 {id:"E",msg:"Increase request timeout",port:9090,timeout:30,mode:"demo"}
];
const snapshot=x=>"port="+x.port+"\ntimeout="+x.timeout+(x.mode?"\nmode="+x.mode:"");
const qs={
 "git-question-commit-all":{q:"Подготовлен только порт, timeout изменён на диске. Какая команда сохранит именно выбранный индекс?",a:["git commit -a -m 'Update'","git commit -m 'Change service port'","git add . && git commit -m 'Update'"],ok:1,f:["-a подготавливает изменения уже отслеживаемых файлов, включая timeout.","Верно: обычный commit без дополнительных путей и -a использует подготовленный индекс.","add . может подготовить и экспериментальную правку. Состав снимка изменится."]},
 "git-question-atomic":{q:"Добавили новую функцию и тест, проверяющий её. Какую границу коммита выбрать?",a:["Всегда по одному файлу","Один связный коммит функции и её теста, если вместе они образуют проверяемое изменение","Смешать с независимым форматированием"],ok:1,f:["Граница файла не обязательно совпадает с границей задачи.","Верно. Один проверяемый смысл может включать несколько файлов.","Форматирование может скрыть смысловой diff и усложнить review."]},
 "git-question-atomic-message":{q:"Какое сообщение лучше помогает понять изменение timeout?",a:["fix","Update app.conf","Increase request timeout to allow slow demo responses"],ok:2,f:["Слишком общее: непонятно, что исправлено.","Указан файл, но не смысл правки.","Верно. Указаны изменение и причина. Не утверждайте, что причина проверена, если это только предположение."]},
 "git-question-blame":{q:"Blame показал коммит, изменивший timeout. Доказано ли, что он вызвал дефект?",a:["Да, найден виновник","Нет, нужно воспроизвести дефект и сравнить поведение версий","Да, если коммит последний"],ok:1,f:["Blame приписывает строку коммиту, но не доказывает причинность.","Верно. История даёт наблюдение, а тест проверяет гипотезу.","Положение коммита в истории не доказывает причину дефекта."]}
};
const keys=["git-status-reader","git-hunk-explainer","git-stage-hunks","git-commit-grouping","git-commit-message","git-history-explorer","git-history-task",...Object.keys(qs)];
function render(key){
 if(key==="git-status-reader")return panel(key,"Прочитайте две колонки status",'<div class="teach-actions">'+statuses.map((x,i)=>btn("status-"+i,i===0?"Чисто":x[0].replace(/ /g,"·"),'aria-pressed="false"')).join("")+'</div><div data-history-files></div><div class="teach-xy"><div><small>Индекс ↔ HEAD</small><strong data-history-x></strong></div><div><small>Файл ↔ индекс</small><strong data-history-y></strong></div></div><p data-history-feedback aria-live="polite"></p><p class="teach-caption">Точка на кнопках обозначает пробел. В настоящем status это пробел, не символ точки. Модель только для обычного отслеживаемого файла.</p>');
 if(key==="git-hunk-explainer")return panel(key,"Из чего состоит unified diff",'<div class="teach-patch"><div class="teach-patch-meta">--- a/app.conf<br>+++ b/app.conf</div><div class="teach-patch-range">@@ -1,3 +1,3 @@</div>'+diffLines(hunks[0].rows)+'</div><div class="teach-key"><span><b>--- / +++</b> старый и новый путь</span><span><b>@@</b> диапазоны: начало и число строк</span><span class="minus"><b>−</b> удалённая строка</span><span class="plus"><b>+</b> добавленная строка</span><span><b>Пробел</b> неизменившийся контекст</span></div><p class="teach-caption">Сокращённый пример патча. Изменение строки выглядит как удаление прежней и добавление новой.</p>');
 if(key==="git-stage-hunks")return panel(key,"Выберите только готовую правку",'<p>Оба изменения уже на диске. Нужно сохранить порт 9090, но оставить timeout=30 неподготовленным. Выберите фрагменты, проверьте индекс и выполните commit.</p><div class="teach-hunks">'+hunks.map(h=>'<div class="teach-hunk"><b>'+esc(h.title)+'</b>'+diffLines(h.rows)+btn(h.id,"Подготовить фрагмент",'aria-pressed="false"')+'</div>').join("")+'</div><div data-history-files></div><div class="teach-actions">'+btn("commit","git commit")+btn("check","Проверить результат")+btn("reset","Начать заново")+'</div><p class="teach-feedback" data-history-feedback aria-live="polite">Выберите нужный фрагмент.</p>');
 if(key==="git-commit-grouping")return panel(key,"Разделяйте по смыслу, а не по файлам",'<div class="teach-groups"><div class="teach-group"><b>Одна связная задача</b>'+file("index","app.conf","mode=demo")+file("index","usage.txt","Как запустить demo")+'<div class="teach-group-end">↓ Один коммит: Add documented demo mode</div></div><div class="teach-group separate"><b>Независимая задача</b>'+file("work","note.txt","Уточнить инструкцию запуска")+'<div class="teach-group-end">↓ Отдельный коммит: Clarify instructions</div></div></div><p class="teach-caption">Связанные файлы сохраняются вместе, если это необходимо для согласованного состояния. Независимая правка имеет отдельную цель.</p>');
 if(key==="git-commit-message")return panel(key,"Сообщение, которое объясняет решение",'<div class="teach-message"><div><small>Неясно</small><code>fix</code></div><div><small>Понятно, что сделано</small><code>Increase request timeout</code></div><div><small>Понятно, зачем</small><code>Increase request timeout<br><br>Allow slow demo responses.</code></div></div><p class="teach-caption">Последний пример объясняет предполагаемую причину. В реальном проекте добавьте выполненные проверки и ограничения, если они существенны.</p>');
 if(key==="git-history-explorer")return panel(key,"Читайте историю, не меняя рабочую копию",'<div class="teach-history-nodes" role="group" aria-label="Выберите условный коммит">'+history.map(x=>btn("rev-"+x.id,x.id,'aria-pressed="false"')).join('<span aria-hidden="true">←</span>')+'</div><p class="teach-caption">A–E — условные имена коммитов, не настоящие OID. Стрелки указывают на родителей.</p><div data-history-files></div><p data-history-feedback aria-live="polite"></p>');
 if(key==="git-history-task")return panel(key,"Расследование: найдите первое появление timeout=30",'<p>Выберите коммит, который изменил значение с 10 на 30. Можно просматривать файлы в модели истории выше или исследовать патчи в настоящем Git.</p><div class="teach-answers">'+history.map(x=>btn("find-"+x.id,x.id+" · "+x.msg,'aria-pressed="false"')).join("")+'</div><p class="teach-feedback" data-history-feedback aria-live="polite">Выберите коммит и сравните его с родителем.</p>');
 if(qs[key]){const q=qs[key];return panel(key,"Проверьте себя",'<p>'+esc(q.q)+'</p><div class="teach-answers">'+q.a.map((a,i)=>btn("answer-"+i,a,'aria-pressed="false"')).join("")+'</div><p class="teach-feedback" data-history-feedback aria-live="polite">Выберите ответ.</p>');}
 return prev.render(key);
}
function mount(root){
 prev.mount(root);
 root.querySelectorAll("[data-teach]").forEach(node=>{
 const key=node.dataset.teach,find=s=>node.querySelector(s),out=find("[data-history-feedback]");
 const pressed=a=>node.querySelectorAll("[data-history-action]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.historyAction===a)));
 const listen=fn=>node.addEventListener("click",e=>{const b=e.target.closest("[data-history-action]");if(b)fn(b.dataset.historyAction,b);});
 if(key==="git-status-reader"){const draw=i=>{const x=statuses[i];pressed("status-"+i);find("[data-history-files]").innerHTML=files(x[1],x[2],x[3]);find("[data-history-x]").textContent=x[0][0]===" "?"·":x[0][0];find("[data-history-y]").textContent=x[0][1]===" "?"·":x[0][1];out.textContent=x[4];};listen(a=>{if(a.startsWith("status-"))draw(Number(a.slice(7)));});draw(3);}
 else if(key==="git-stage-hunks"){let s=initial();const draw=()=>{find("[data-history-files]").innerHTML='<div class="teach-files">'+file("head","HEAD",s.committed?stagedContent(s):values.A)+file("index","Индекс",stagedContent(s))+file("work","Рабочий файл",values.C)+'</div>';for(const h of hunks){const b=find('[data-history-action="'+h.id+'"]');b.setAttribute("aria-pressed",String(s[h.id]));b.textContent=s[h.id]?"Убрать из индекса":"Подготовить фрагмент";b.disabled=s.committed;}find('[data-history-action="commit"]').disabled=s.committed||(!s.port&&!s.timeout);};listen(a=>{if(a==="check"){out.dataset.result=solved(s)?"correct":"retry";out.textContent=solved(s)?"Верно: HEAD содержит port=9090, timeout=10; рабочий файл сохраняет timeout=30.":"Пока не готово. Сохраните только порт в одном коммите; эксперимент должен остаться на диске. Если уже сохранили оба, начните заново.";return;}s=stage(s,a);delete out.dataset.result;out.textContent=s.committed?"Коммит создан. Проверьте его снимок.":s.port||s.timeout?"Индекс обновлён. Проверьте выбранные строки.":"Индекс совпадает с HEAD.";draw();});draw();}
 else if(key==="git-history-explorer"){const draw=id=>{const x=history.find(v=>v.id===id),i=history.indexOf(x);pressed("rev-"+id);find("[data-history-files]").innerHTML='<div class="teach-files teach-two">'+file("head","Выбранный снимок "+id,snapshot(x))+file("work","Рабочая копия E",snapshot(history.at(-1)))+'</div>';out.textContent=x.msg+". "+(i?"Родитель: "+history[i-1].id+".":"Первый снимок, родителя нет.")+" Чтение не изменило рабочую копию.";};listen(a=>{if(a.startsWith("rev-"))draw(a.slice(4));});draw("E");}
 else if(key==="git-history-task"){listen(a=>{if(!a.startsWith("find-"))return;const x=history.find(v=>v.id===a.slice(5));pressed(a);out.dataset.result=x.id==="E"?"correct":"retry";out.textContent=x.id==="E"?"Верно: E изменил timeout с 10 на 30. Родитель D ещё содержит 10. Это факт изменения, не доказательство причины дефекта.":"В снимке "+x.id+" timeout="+x.timeout+". Найдите переход от 10 к 30, сравнив с родителем.";});}
 else if(qs[key]){const q=qs[key];listen(a=>{if(!a.startsWith("answer-"))return;const i=Number(a.slice(7));if(!q.a[i])return;pressed(a);out.dataset.result=i===q.ok?"correct":"retry";out.textContent=q.f[i];});}
 });
}
window.ATLAS_TEACHING={...prev,keys:[...prev.keys,...keys],render,mount,history,stageInitial:initial,stageStep:stage,stageSolved:solved,stagedContent,statuses};
})();
