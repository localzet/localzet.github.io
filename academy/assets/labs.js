(function atlasLabs(){
"use strict";
const escape=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const ipToNumber=value=>{
 const a=String(value).trim().split(".");
 if(a.length!==4||a.some(x=>!/^\d{1,3}$/.test(x)||Number(x)>255))return null;
 return a.reduce((n,x)=>(n*256+Number(x))>>>0,0);
};
const toIP=n=>[24,16,8,0].map(b=>(n>>>b)&255).join(".");
function subnet(address,prefix){
 const ip=ipToNumber(address);
 if(ip===null||!Number.isInteger(prefix)||prefix<0||prefix>32)return null;
 const size=2**(32-prefix),mask=(2**32-size)>>>0,network=(ip&mask)>>>0,last=network+size-1;
 return {ip:toIP(ip),mask:toIP(mask),network:toIP(network),last:toIP(last),size,
 firstHost:toIP(prefix>=31?network:network+1),lastHost:toIP(prefix>=31?last:last-1),
 hostCount:prefix>=31?size:size-2,prefix,binary:ip.toString(2).padStart(32,"0")};
}
const gitInitial=()=>({head:"A",index:"A",work:"A",history:0,serial:0});
function gitStep(state,action){
 const s={...state};
 switch(action){
 case "edit": s.serial++;s.work="V"+s.serial;break;
 case "add":s.index=s.work;break;
 case "unstage":s.index=s.head;break;
 case "restore":s.work=s.index;break;
 case "commit":if(s.index!==s.head){s.head=s.index;s.history++;}break;
 case "reset":return gitInitial();
 }
 return s;
}
const gitStatus=s=>(s.index!==s.head?"M":" ")+(s.work!==s.index?"M":" ");
const TCP_STATES=[
 ["CLOSED","LISTEN","Клиент ещё не начал соединение."],
 ["SYN-SENT","LISTEN","Клиент отправил SYN, seq=100."],
 ["SYN-SENT","SYN-RECEIVED","Сервер получил SYN и отправил SYN+ACK, seq=500, ack=101."],
 ["ESTABLISHED","SYN-RECEIVED","Клиент получил SYN+ACK и отправил ACK, seq=101, ack=501."],
 ["ESTABLISHED","ESTABLISHED","Сервер получил ACK. Обе стороны готовы к передаче."],
 ["ESTABLISHED","ESTABLISHED","Клиент отправил 4 байта, seq=101."],
 ["ESTABLISHED","ESTABLISHED","Сервер получил 4 байта и отправил ACK=105."],
 ["ESTABLISHED","ESTABLISHED","Клиент получил ACK=105. Байты подтверждены."]
];
function tcpStep(state,action){
 if(action==="reset")return {step:0,lost:false,message:TCP_STATES[0][2]};
 if(action==="drop"&&state.step===1&&!state.lost)return {...state,lost:true,message:"SYN потерян. Сервер остаётся в LISTEN; клиент ждёт повторной передачи."};
 if(action==="next"&&state.lost)return {...state,lost:false,message:"Истёк условный таймер. Клиент повторно отправил SYN с seq=100."};
 if(action==="next"&&state.step<TCP_STATES.length-1){const step=state.step+1;return {step,lost:false,message:TCP_STATES[step][2]};}
 return state;
}
const frame=(title,description,body)=>'<section class="atlas-lab" aria-label="'+escape(title)+'"><span class="eyebrow">Интерактивная практика</span><h2>'+escape(title)+'</h2><p>'+escape(description)+'</p>'+body+'</section>';
const button=(action,label)=>'<button type="button" class="btn lab-btn" data-lab-action="'+action+'">'+escape(label)+'</button>';
function gitLab(node){
 let s=gitInitial();
 node.innerHTML=frame("Три состояния Git","Нажимайте команды по очереди. В учебной модели меняются только три версии одного файла; настоящий репозиторий не затрагивается.",
 '<div class="lab-state-grid"><div class="lab-state"><small>HEAD · коммит</small><strong data-git-head></strong></div><div class="lab-state"><small>Индекс · staged</small><strong data-git-index></strong></div><div class="lab-state"><small>Рабочая копия</small><strong data-git-work></strong></div></div><div class="lab-controls">'+button("edit","Изменить файл")+button("add","git add")+button("commit","git commit")+button("unstage","restore --staged")+button("restore","git restore")+button("reset","Начать заново")+'</div><pre class="lab-output" aria-live="polite" data-git-status></pre><p class="lab-note">Эксперимент: измените файл, выполните add, снова измените файл и сделайте commit. Сравните HEAD с рабочей копией.</p>');
 const draw=()=>{
  node.querySelector("[data-git-head]").textContent=s.head;
  node.querySelector("[data-git-index]").textContent=s.index;
  node.querySelector("[data-git-work]").textContent=s.work;
  const status=gitStatus(s);
  node.querySelector("[data-git-status]").textContent="$ git status --short\n"+(status==="  "?"(нет изменений)":status+" note.txt")+"\n\nНовых коммитов: "+s.history+"\nПервая колонка — индекс, вторая — рабочая копия.";
 };
 node.addEventListener("click",e=>{const b=e.target.closest("[data-lab-action]");if(b){s=gitStep(s,b.dataset.labAction);draw();}});
 draw();
}
function ipLab(node){
 node.innerHTML=frame("IPv4 и маска подсети","Измените IPv4-адрес и длину префикса. Модель вычисляет адрес сети, маску и диапазон адресов, а также показывает границу сетевых и хостовых битов.",
 '<div class="lab-inputs"><label>IPv4-адрес<input data-ip type="text" inputmode="decimal" value="192.0.2.130" autocomplete="off" spellcheck="false"></label><label>Префикс /<input data-prefix type="number" min="0" max="32" step="1" value="26"></label></div><div class="lab-bits" data-ip-bits aria-label="32 бита адреса"></div><div class="lab-legend"><span class="bit-net">Сетевые биты</span><span class="bit-host">Хостовые биты</span></div><dl class="lab-results" aria-live="polite" data-ip-results></dl><p class="lab-note">Для обычных подсетей /0–/30 исключены первый и последний адреса. /31 рассматривается как point-to-point по RFC 3021; /32 обозначает один адрес. Специальные и зарезервированные диапазоны не проверяются.</p>');
 const draw=()=>{
  const p=node.querySelector("[data-prefix]").value.trim(),a=node.querySelector("[data-ip]").value;
  const result=/^\d+$/.test(p)?subnet(a,Number(p)):null;
  const bits=node.querySelector("[data-ip-bits]"),out=node.querySelector("[data-ip-results]");
  if(!result){bits.innerHTML="";out.innerHTML="<dt>Ошибка</dt><dd>Укажите четыре октета 0–255 и префикс от 0 до 32.</dd>";return;}
  bits.innerHTML=Array.from(result.binary,(b,i)=>'<span class="'+(i<result.prefix?"bit-net":"bit-host")+(i%8===0?" octet-start":"")+'">'+b+'</span>').join("");
  const rows=[["Маска",result.mask],["Сеть",result.network+"/"+result.prefix],["Последний адрес",result.last],["Диапазон узлов",result.firstHost+" – "+result.lastHost],["Всего адресов",result.size.toLocaleString("ru-RU")],["Адресов узлов",result.hostCount.toLocaleString("ru-RU")]];
  out.innerHTML=rows.map(([k,v])=>'<dt>'+escape(k)+'</dt><dd>'+escape(v)+'</dd>').join("");
 };
 node.addEventListener("input",draw);draw();
}
function tcpLab(node){
 let s=tcpStep({}, "reset");
 node.innerHTML=frame("TCP: от SYN до подтверждения данных","Пройдите обмен по шагам, посмотрите состояния клиента и сервера. На шаге отправки первого SYN можно имитировать потерю пакета.",
 '<div class="lab-state-grid tcp-state-grid"><div class="lab-state"><small>Клиент</small><strong data-tcp-client></strong></div><div class="lab-state"><small>Сервер</small><strong data-tcp-server></strong></div></div><div class="tcp-track" data-tcp-track aria-hidden="true"></div><pre class="lab-output" aria-live="polite" data-tcp-message></pre><div class="lab-controls">'+button("next","Следующий шаг")+button("drop","Потерять SYN")+button("reset","Сначала")+'</div><p class="lab-note">Упрощённый обмен: фиксированные номера, без опций, параллельных передач, закрытия и реального таймера. ACK подтверждает байты TCP, а не бизнес-операцию приложения.</p>');
 const draw=()=>{
  node.querySelector("[data-tcp-client]").textContent=TCP_STATES[s.step][0];
  node.querySelector("[data-tcp-server]").textContent=TCP_STATES[s.step][1];
  const labels=["SYN","SYN+ACK","ACK","DATA","ACK"];
  const threshold=[1,2,3,5,6];
  node.querySelector("[data-tcp-track]").innerHTML=labels.map((l,i)=>'<div class="tcp-packet '+(s.step>=threshold[i]?"sent":"")+'">'+(i===1||i===4?"← ":"→ ")+l+'</div>').join("");
  node.querySelector("[data-tcp-message]").textContent="Шаг "+s.step+" из "+(TCP_STATES.length-1)+"\n"+s.message;
  node.querySelector('[data-lab-action="drop"]').disabled=s.step!==1||s.lost;
  node.querySelector('[data-lab-action="next"]').disabled=s.step===TCP_STATES.length-1;
 };
 node.addEventListener("click",e=>{const b=e.target.closest("[data-lab-action]");if(b){s=tcpStep(s,b.dataset.labAction);draw();}});
 draw();
}
function mmuModel(value){
 const raw=String(value).trim();
 if(!/^(?:0x)?[0-9a-f]{1,12}$/i.test(raw))return null;
 const n=BigInt("0x"+raw.replace(/^0x/i,""));
 if(n>0x7fffffffffffn)return null;
 return {indices:[39n,30n,21n,12n].map(s=>Number((n>>s)&511n)),offset:Number(n&4095n),binary:n.toString(2).padStart(48,"0")};
}
const cowInitial=()=>({parent:"A",child:null,a:7,b:null});
function cowStep(s,action){
 if(action==="reset")return cowInitial();
 if(action==="fork"&&s.child===null)return {...s,child:"A"};
 if(action==="write"&&s.child!==null)return {...s,child:"B",b:9};
 return s;
}
function unitModel(wants,after,already){
 const included=Boolean(wants||already);
 return {included,ordered:included&&Boolean(after),text:!included?"Запускается только A":after?"B → A: задан порядок запуска":"A и B: относительный порядок не задан"};
}
function mmuLab(node){
 node.innerHTML=frame("Разложение виртуального адреса","Учебная x86-64 модель: нижняя canonical-область, четыре уровня, страницы 4 КиБ. Введите шестнадцатеричный адрес.",
 '<div class="lab-inputs"><label>Виртуальный адрес (hex)<input data-mmu-address type="text" value="0x41234567" autocomplete="off" spellcheck="false"></label></div><div class="lab-bits" data-mmu-bits aria-label="48 бит виртуального адреса"></div><dl class="lab-results" aria-live="polite" data-mmu-result></dl><p class="lab-note">Индексы выбирают записи таблиц, а не показывают физические адреса. Не моделируются TLB, LA57, huge pages и содержимое PTE.</p>');
 const draw=()=>{
  const m=mmuModel(node.querySelector("[data-mmu-address]").value),bits=node.querySelector("[data-mmu-bits]"),result=node.querySelector("[data-mmu-result]");
  if(!m){bits.innerHTML="";result.innerHTML="<dt>Ошибка</dt><dd>Введите адрес 0x0–0x7fffffffffff.</dd>";return;}
  bits.innerHTML=Array.from(m.binary,(b,i)=>'<span class="'+(Math.floor(i/9)%2===0?"bit-net":"bit-host")+(i===0||i===9||i===18||i===27||i===36?" octet-start":"")+'">'+b+'</span>').join("");
  result.innerHTML=["PML4","PDPT","PD","PT","Смещение"].map((key,i)=>"<dt>"+key+"</dt><dd>"+(i===4?"0x"+m.offset.toString(16):m.indices[i])+"</dd>").join("");
 };node.addEventListener("input",draw);draw();
}
function cowLab(node){
 let s=cowInitial();
 node.innerHTML=frame("Copy-on-Write после fork","Сначала родитель имеет страницу A. Создайте дочерний процесс и измените его байт. Модель не выделяет настоящую память.",
 '<div class="lab-state-grid"><div class="lab-state"><small>Родитель</small><strong data-cow-parent></strong></div><div class="lab-state"><small>Ребёнок</small><strong data-cow-child></strong></div><div class="lab-state"><small>Физические страницы</small><strong data-cow-frames></strong></div></div><div class="lab-controls">'+button("fork","fork")+button("write","Запись ребёнка")+button("reset","Сначала")+'</div><pre class="lab-output" aria-live="polite" data-cow-result></pre><p class="lab-note">Модель приватной страницы, один байт, без swap, huge pages и оптимизаций реального ядра.</p>');
 const draw=()=>{
  node.querySelector("[data-cow-parent]").textContent="A · "+s.a;
  node.querySelector("[data-cow-child]").textContent=s.child===null?"—":s.child+" · "+(s.child==="A"?s.a:s.b);
  node.querySelector("[data-cow-frames]").textContent=s.b===null?"1":"2";
  node.querySelector("[data-cow-result]").textContent=s.child===null?"Один владелец A.":s.child==="A"?"Оба процесса используют A; приватная запись потребует отдельного состояния.":"Родитель: 7, ребёнок: 9. В модели создалась страница B.";
  node.querySelector('[data-lab-action="fork"]').disabled=s.child!==null;
  node.querySelector('[data-lab-action="write"]').disabled=s.child===null||s.child==="B";
 };
 node.addEventListener("click",e=>{const b=e.target.closest("[data-lab-action]");if(b){s=cowStep(s,b.dataset.labAction);draw();}});draw();
}
function unitLab(node){
 node.innerHTML=frame("Зависимость и порядок systemd","Выберите директивы A.service и наличие B.service в транзакции. Посмотрите, что действительно следует из конфигурации.",
 '<div class="lab-inputs"><label>Wants=B.service<select data-unit-wants><option value="0">Нет</option><option value="1">Да</option></select></label><label>After=B.service<select data-unit-after><option value="0">Нет</option><option value="1">Да</option></select></label><label>B уже включена в транзакцию<select data-unit-already><option value="0">Нет</option><option value="1">Да</option></select></label></div><pre class="lab-output" data-unit-result aria-live="polite"></pre><p class="lab-note">Упрощённая транзакция без конфликтов, циклов и ошибок. Стрелка означает порядок запуска, не готовность приложения.</p>');
 const draw=()=>{const flag=k=>node.querySelector("[data-unit-"+k+"]").value==="1";node.querySelector("[data-unit-result]").textContent=unitModel(flag("wants"),flag("after"),flag("already")).text;};node.addEventListener("change",draw);draw();
}
const labFor={"git-index":gitLab,"git-undo":gitLab,"internet-cidr-lab":ipLab,"internet-local-network":ipLab,"internet-tcp":tcpLab,"linux-mmu":mmuLab,"linux-mmap-cow":cowLab,"linux-service-dependencies":unitLab};
window.ATLAS_LABS={has:id=>Boolean(labFor[id]),mount:(root,id)=>{const node=root.querySelector("[data-atlas-lab]");if(node&&labFor[id])labFor[id](node);},subnet,gitInitial,gitStep,gitStatus,tcpStep,mmuModel,cowInitial,cowStep,unitModel};
})();
