(function(){
"use strict";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const lines={A:["Запуск"],B:["Запуск","Порт: 8080"],C:["Запуск","Порт: 8080","TODO: проверить настройки"]};
const files=(h,i,w,changed=[])=>'<div class="teach-files">'+[["head","HEAD","Сохранено",h],["index","Индекс","Выбрано",i],["work","Рабочий файл","На диске",w]].map(([key,title,desc,v])=>'<div class="teach-file '+key+(changed.includes(key)?' changed':'')+'"><div class="teach-file-title"><span>'+title+'</span><small>'+desc+'</small></div><div class="teach-file-name">note.txt</div><div class="teach-file-content">'+lines[v].map((s,j)=>'<div class="'+(j===0?'':j===1?'port':'todo')+'">'+esc(s)+'</div>').join('')+'</div>'+(changed.includes(key)?'<span class="teach-changed">Изменилось</span>':'')+'</div>').join('')+'</div>';
const panel=(key,title,body)=>'<section class="teach-panel" data-teach="'+key+'" aria-label="'+esc(title)+'"><div class="teach-label">Учебный блок</div><h3>'+esc(title)+'</h3>'+body+'</section>';
const button=(action,label,extra='')=>'<button type="button" class="teach-btn" data-teach-action="'+esc(action)+'" '+extra+'>'+esc(label)+'</button>';
const flow='<svg class="teach-flow" viewBox="0 0 560 104" role="img" aria-label="git add переносит рабочие байты в индекс, git commit сохраняет индекс в коммите"><path d="M465 33 H296" fill="none" stroke="var(--teach-work)" stroke-width="3"/><path d="m304 26 -9 7 9 7" fill="none" stroke="var(--teach-work)" stroke-width="3"/><path d="M266 69 H96" fill="none" stroke="var(--teach-index)" stroke-width="3"/><path d="m104 62 -9 7 9 7" fill="none" stroke="var(--teach-index)" stroke-width="3"/><text x="380" y="22" text-anchor="middle" fill="var(--teach-work)">git add</text><text x="180" y="58" text-anchor="middle" fill="var(--teach-index)">git commit</text><text x="280" y="96" text-anchor="middle" fill="var(--sub)" font-size="11">Редактирование меняет только рабочий файл</text></svg>';
const walkthrough=[
 {cmd:"Начало: сохранён первый коммит",h:"A",i:"A",w:"A",status:"чисто",changed:[],why:"Все три версии одинаковы. Ни подготовленных, ни неподготовленных изменений."},
 {cmd:"Редактируем файл: добавляем порт",h:"A",i:"A",w:"B",status:" M note.txt",changed:["work"],why:"Редактор меняет рабочие байты. Индекс и HEAD ещё содержат прежний текст. Вторая колонка status — M."},
 {cmd:"git add note.txt",h:"A",i:"B",w:"B",status:"M  note.txt",changed:["index"],why:"Git подготовил текущую версию файла. HEAD не переместился. Первая колонка status — M."},
 {cmd:"Снова редактируем файл: добавляем TODO",h:"A",i:"B",w:"C",status:"MM note.txt",changed:["work"],why:"TODO есть на диске, но не в индексе. HEAD отличается от индекса, а индекс — от рабочего файла."},
 {cmd:"git commit -m 'Указать порт'",h:"B",i:"B",w:"C",status:" M note.txt",changed:["head"],why:"Новый коммит содержит порт, но не TODO. Рабочий файл не перезаписан: TODO остался как неподготовленная правка."}
];
const diffs=[
 {label:"git diff",from:"Индекс",to:"Рабочий файл",rows:[[" ","Запуск"],[" ","Порт: 8080"],["+","TODO: проверить настройки"]],why:"Сравниваем выбранную версию с рабочей. Показывается только TODO: порт уже подготовлен."},
 {label:"git diff --cached",from:"HEAD",to:"Индекс",rows:[[" ","Запуск"],["+","Порт: 8080"]],why:"Сравниваем последний коммит с подготовленным снимком. В новый коммит войдёт только порт."},
 {label:"git diff HEAD",from:"HEAD",to:"Рабочий файл",rows:[[" ","Запуск"],["+","Порт: 8080"],["+","TODO: проверить настройки"]],why:"Сравниваем рабочую версию с текущим коммитом. Видны обе правки, но это не означает, что обе подготовлены."}
];
const quizzes={
 "git-question-diff":{q:"Порт подготовлен, TODO ещё нет. Как проверить именно содержимое будущего коммита?",answers:["git diff","git diff --cached","git diff HEAD"],correct:1,feedback:["Обычный diff сравнивает рабочую копию с индексом. Он покажет TODO, а не подготовленный порт.","Верно. --cached сравнивает HEAD и индекс: виден подготовленный порт.","Это сравнение HEAD с рабочим файлом. Оно показывает обе правки, даже неподготовленную."]},
 "git-question-restore":{q:"Вы случайно подготовили TODO. Нужно исключить его из коммита, но сохранить на диске. Что выбрать?",answers:["git restore -- note.txt","git restore --staged -- note.txt","git reset --hard HEAD"],correct:1,feedback:["Эта команда заменяет рабочую версию из индекса. Она не отменяет staging.","Верно. Индекс восстановится из HEAD, а рабочий файл останется неизменным.","Hard reset заменяет рабочее дерево и индекс: TODO может быть уничтожен."]}
};
const matrix=[["git add","—","✓","—"],["git commit","✓","—","—"],["restore --staged","—","✓","—"],["restore --worktree","—","—","✓"],["reset --soft","✓","—","—"],["reset --mixed","✓","✓","—"],["reset --hard","✓","✓","✓"]];
const keys=["git-three-states","git-walkthrough","git-diff-view","git-question-diff","git-question-restore","git-undo-matrix","git-challenge"];
function render(key){
 if(key==="git-three-states")return panel(key,"Три версии одного файла",files("A","B","C")+flow+'<p class="teach-caption">Пример после подготовки порта и добавления черновика. Стрелки показывают направление передачи данных, а не копирование всей папки.</p>');
 if(key==="git-walkthrough")return panel(key,"Пошаговый разбор",'<div class="teach-step-head"><span data-teach-counter></span><span data-teach-command></span></div><div data-teach-files></div><div class="teach-terminal"><span>git status --short</span><pre data-teach-status></pre></div><p data-teach-feedback aria-live="polite"></p><div class="teach-actions">'+button("prev","← Назад")+button("next","Следующий шаг →")+button("restart","Сначала")+'</div>');
 if(key==="git-diff-view")return panel(key,"Какие версии сравнивает diff?",'<div class="teach-actions" role="group" aria-label="Выберите сравнение">'+diffs.map((d,i)=>button("diff-"+i,d.label,'aria-pressed="false"')).join('')+'</div><div data-teach-diff></div><p data-teach-feedback aria-live="polite"></p>');
 if(quizzes[key]){const q=quizzes[key];return panel(key,"Проверьте себя",'<p>'+esc(q.q)+'</p><div class="teach-answers">'+q.answers.map((s,i)=>button("answer-"+i,s,'aria-pressed="false"')).join('')+'</div><p class="teach-feedback" data-teach-feedback aria-live="polite">Выберите ответ. Можно попробовать снова.</p>');}
 if(key==="git-undo-matrix")return panel(key,"Что меняется при команде?",'<div class="teach-matrix"><table><thead><tr><th>Команда</th><th class="head">HEAD</th><th class="index">Индекс</th><th class="work">Файлы</th></tr></thead><tbody>'+matrix.map(row=>'<tr>'+row.map((s,i)=>'<'+(i===0?'th scope="row"':'td')+' class="'+(i===0?'':["","head","index","work"][i])+(s==="✓"?" changed":"")+'">'+esc(s)+'</'+(i===0?'th':'td')+'>').join('')+'</tr>').join('')+'</tbody></table></div><p class="teach-caption">Типичная успешная операция с отслеживаемым файлом и существующим HEAD. ✓ — затрагиваемое состояние; — — сохраняется. Hard reset потенциально уничтожает незаписанные данные.</p>');
 if(key==="git-challenge")return panel(key,"Задание: сохраните порт, но не TODO",'<p>Начальное состояние чистое. Получите HEAD и индекс с портом, а рабочий файл — с портом и TODO. Не уничтожайте черновик. Все действия только в модели.</p><div data-teach-files></div><div class="teach-actions">'+[["port","Добавить порт"],["todo","Добавить TODO"],["add","git add"],["commit","git commit"],["unstage","restore --staged"],["restore","git restore"],["reset","Начать заново"],["check","Проверить результат"]].map(([a,b])=>button(a,b)).join('')+'</div><p class="teach-feedback" data-teach-feedback aria-live="polite">Выберите первое действие.</p>');
 return "";
}
const initial=()=>({h:"A",i:"A",w:"A",commits:0});
function challengeStep(s,a){
 s={...s};
 if(a==="port"&&s.w==="A")s.w="B";
 if(a==="todo"&&s.w==="B")s.w="C";
 if(a==="add")s.i=s.w;
 if(a==="commit"&&s.i!==s.h){s.h=s.i;s.commits++;}
 if(a==="unstage")s.i=s.h;
 if(a==="restore")s.w=s.i;
 if(a==="reset")return initial();
 return s;
}
const solved=s=>s.h==="B"&&s.i==="B"&&s.w==="C"&&s.commits===1;
function mount(root){
 root.querySelectorAll("[data-teach]").forEach(node=>{
 const key=node.dataset.teach,find=s=>node.querySelector(s),feedback=find("[data-teach-feedback]");
 if(key==="git-walkthrough"){
 let step=0;
 const draw=()=>{const x=walkthrough[step];find("[data-teach-counter]").textContent=(step+1)+" / "+walkthrough.length;find("[data-teach-command]").textContent=x.cmd;find("[data-teach-files]").innerHTML=files(x.h,x.i,x.w,x.changed);find("[data-teach-status]").textContent=x.status;feedback.textContent=x.why;find('[data-teach-action="prev"]').disabled=step===0;find('[data-teach-action="next"]').disabled=step===walkthrough.length-1;};
 node.addEventListener("click",e=>{const a=e.target.closest("[data-teach-action]")?.dataset.teachAction;if(a==="next")step=Math.min(step+1,4);else if(a==="prev")step=Math.max(step-1,0);else if(a==="restart")step=0;else return;draw();});draw();
 }else if(key==="git-diff-view"){
 const draw=i=>{const d=diffs[i];node.querySelectorAll("[data-teach-action]").forEach((b,j)=>b.setAttribute("aria-pressed",String(j===i)));find("[data-teach-diff]").innerHTML='<div class="teach-diff-header"><span>'+esc(d.from)+'</span><span>→</span><span>'+esc(d.to)+'</span></div><div class="teach-diff-lines">'+d.rows.map(([sign,t])=>'<div class="'+(sign==="+"?"added":"")+'"><span>'+esc(sign)+'</span>'+esc(t)+'</div>').join('')+'</div>';feedback.textContent=d.why;};
 node.addEventListener("click",e=>{const a=e.target.closest("[data-teach-action]")?.dataset.teachAction;if(a?.startsWith("diff-"))draw(Number(a.slice(5)));});draw(0);
 }else if(quizzes[key]){
 const q=quizzes[key];node.addEventListener("click",e=>{const b=e.target.closest("[data-teach-action]");if(!b)return;const i=Number(b.dataset.teachAction.slice(7));if(!Number.isInteger(i)||!q.answers[i])return;node.querySelectorAll("[data-teach-action]").forEach(x=>x.setAttribute("aria-pressed",String(x===b)));feedback.dataset.result=i===q.correct?"correct":"retry";feedback.textContent=q.feedback[i];});
 }else if(key==="git-challenge"){
 let s=initial();const draw=()=>{find("[data-teach-files]").innerHTML=files(s.h,s.i,s.w);find('[data-teach-action="port"]').disabled=s.w!=="A";find('[data-teach-action="todo"]').disabled=s.w!=="B";};
 node.addEventListener("click",e=>{const a=e.target.closest("[data-teach-action]")?.dataset.teachAction;if(!a)return;if(a==="check"){feedback.dataset.result=solved(s)?"correct":"retry";feedback.textContent=solved(s)?"Задание выполнено: порт сохранён, TODO остался на диске, создан один коммит.":"Пока не совпало. Сравните три версии и число новых коммитов: "+s.commits+". Нужны HEAD = порт, индекс = порт, рабочий файл = порт + TODO, один коммит.";return;}s=challengeStep(s,a);delete feedback.dataset.result;feedback.textContent="Новых коммитов: "+s.commits+". Проверьте, какая версия изменилась.";draw();});draw();
 }
 });
}
window.ATLAS_TEACHING={render,mount,keys,walkthrough,diffs,quizzes,initial,challengeStep,solved};
})();
