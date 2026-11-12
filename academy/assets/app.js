(function academyApp(){
"use strict";
const D=window.ATLAS_DATA; const E=window.ATLAS_EDITORIAL||{}; const $=s=>document.querySelector(s); const root=$("#app"); if(!D){root.innerHTML="Ошибка загрузки курса";return;}
const courses=D.courses, lessons=D.lessons; const routeCourse=id=>"#/course/"+id; const routeLesson=id=>"#/lesson/"+id;
const theme=window.ATLAS_THEME;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const completed=()=>{try{return JSON.parse(localStorage.getItem("atlas-done-v1")||"[]")}catch{return []}};
const saveDone=ids=>{try{localStorage.setItem("atlas-done-v1",JSON.stringify(ids))}catch{}};
const count=c=>lessons.filter(l=>l.course===c.id).length;
const getLesson=id=>lessons.find(l=>l.id===id);
const getCourse=id=>courses.find(c=>c.id===id);
const pct=c=>{const ls=lessons.filter(l=>l.course===c.id);return ls.length?Math.round(ls.filter(l=>completed().includes(l.id)).length/ls.length*100):0};
const slug=s=>s.toLowerCase().replace(/[^a-zа-яё0-9 -]/gi,"").replace(/\s+/g,"-").replace(/-+/g,"-");
const parseInline=s=>{
 let x=safe(s); x=x.replace(/`([^`]+)`/g,(_,t)=>"<code>"+t+"</code>");
 x=x.replace(/§([^§]+)§/g,(_,t)=>"<code>"+t+"</code>");
 x=x.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
 x=x.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,(_,label,url)=>'<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+"</a>");
 return x;
};
const figure=diagram=>{
 if(!diagram)return "";
 const {title,caption,steps,kind="flow"}=diagram;
 return '<figure class="diagram" aria-label="'+safe(title)+'"><div class="diagram-title">'+safe(title)+'</div><ol class="diagram-steps '+(kind==="stack"?"stack":"")+'">'+steps.map((step,i)=>'<li><span class="diagram-number">'+String(i+1).padStart(2,"0")+'</span><div><strong>'+safe(step[0])+'</strong><span>'+safe(step[1])+'</span></div></li>').join("")+'</ol><figcaption>'+safe(caption)+'</figcaption></figure>';
};
const study=l=>{
 const e=E[l.id];if(!e)return "";
 return '<section class="study-box"><h2>Что вы поймёте в этой главе</h2><p>'+safe(e.intro)+'</p><details class="glossary"><summary>Термины перед чтением <span>'+e.terms.length+'</span></summary><dl>'+e.terms.map(([term,meaning])=>'<dt>'+safe(term)+'</dt><dd>'+safe(meaning)+'</dd>').join("")+'</dl></details></section>';
};
const check=l=>{
 const e=E[l.id];if(!e||!e.questions?.length)return "";
 return '<section class="study-box exercises"><h2>Проверьте понимание</h2>'+e.questions.map(([q,a],i)=>'<details><summary>'+String(i+1)+'. '+safe(q)+'</summary><p>'+safe(a)+'</p></details>').join("")+'</section>';
};
const renderMd=(md,diagram)=>{
 const lines=md.replace(/\r/g,"").trim().split("\n"); const out=[]; let para=[],list=null,code=null,quote=[],headings=0,inserted=false;
 const flushP=()=>{if(para.length){out.push("<p>"+parseInline(para.join(" "))+"</p>");para=[]}};
 const flushL=()=>{if(list){out.push("</"+list+">");list=null}};
 const flushQ=()=>{if(quote.length){out.push("<blockquote>"+parseInline(quote.join(" "))+"</blockquote>");quote=[]}};
 for(const line of lines){
  const trim=line.trim();
  if(code!==null){if((trim.startsWith("```")||trim.startsWith("~~~"))){out.push("<pre><code>"+safe(code.join("\n"))+"</code></pre>");code=null;}else code.push(line);continue}
  if((trim.startsWith("```")||trim.startsWith("~~~"))){flushP();flushL();flushQ();code=[];continue}
  if(!trim){flushP();flushL();flushQ();continue}
  const h=/^(#{2,3})\s+(.+)$/.exec(trim);
  if(h){flushP();flushL();flushQ();const n=h[1].length;if(n===2&&++headings===2&&diagram){out.push(figure(diagram));inserted=true;}out.push("<h"+n+' id="'+slug(h[2])+'">'+parseInline(h[2])+"</h"+n+">");continue}
  if(trim.startsWith("> ")){flushP();flushL();quote.push(trim.slice(2));continue}
  flushQ();
  const ul=/^[-*]\s+(.+)$/.exec(trim), ol=/^\d+\.\s+(.+)$/.exec(trim);
  if(ul||ol){flushP();const next=ul?"ul":"ol";if(list!==next){flushL();out.push("<"+next+">");list=next;}out.push("<li>"+parseInline((ul||ol)[1])+"</li>");continue}
  flushL();para.push(trim);
 }
 flushP();flushL();flushQ();if(code)out.push("<pre><code>"+safe(code.join("\n"))+"</code></pre>");
 if(diagram&&!inserted)out.push(figure(diagram)); return out.join("\n");
};
const home=()=>{
 const total=lessons.length, chapters=courses.reduce((a,c)=>a+c.roadmap.reduce((x,g)=>x+g.topics.length,0),0);
 return '<section class="hero"><div class="container hero-grid"><div><span class="eyebrow">Открытая техническая библиотека</span><h1>Понимай <span class="gradient-word">систему.</span><br>Не заучивай.</h1><p>Инженерный атлас на русском: от первых транзисторов до процессов Linux, от Git-объектов до BGP и TLS. Механизмы, история, команды, исходники, стандарты и лабораторные работы.</p><div class="hero-actions"><a class="btn primary" href="#/" data-scroll="catalog">Исследовать курсы ↗</a><a class="btn" href="#/course/internet">Начать с устройства Интернета →</a></div></div><div class="orbit" aria-hidden="true"><div class="terminal-caption">system / architecture / fundamentals</div><div class="terminal-code"><div class="t-dim">$ trace --from=hardware --to=internet</div><div><span class="t-key">01</span> CPU → ABI → kernel</div><div><span class="t-key">02</span> process → namespace → container</div><div><span class="t-key">03</span> filesystem → Git objects</div><div><span class="t-key">04</span> TCP/IP → DNS → TLS</div><div><span class="t-violet">05</span> design → build → deliver</div><div class="t-dim">✓ understand, then automate.</div></div><div class="orb-note"><strong>Главный принцип:</strong> каждое понятие раскрываем от причины появления до границ применимости.</div></div></div></section><div class="container"><div class="stat-bar"><div class="stat"><strong>07</strong><span>направлений</span></div><div class="stat"><strong>'+total+'</strong><span>развёрнутых глав</span></div><div class="stat"><strong>'+chapters+'+</strong><span>тем в дорожной карте</span></div><div class="stat"><strong>100%</strong><span>русский язык, бесплатно</span></div></div><section id="catalog"><div class="section-head"><div><span class="eyebrow">Каталог</span><h2 class="section-title">От машинного к распределённому</h2><div class="section-sub">Каждое направление содержит опубликованные главы и подробный план следующих.</div></div></div><div class="course-grid">'+courses.map(c=>'<a class="course-card" href="'+routeCourse(c.id)+'" style="--tone:'+c.color+'"><div class="card-top"><span class="course-glyph">'+safe(c.glyph)+'</span><span class="card-badge">'+count(c)+' глав · '+c.roadmap.length+' разделов</span></div><h3>'+safe(c.title)+'</h3><p>'+safe(c.description)+'</p><div class="card-bottom"><span>'+pct(c)+'% прочитано</span><b>Открыть курс ↗</b></div></a>').join("")+'</div></section><section><div class="section-head"><div><span class="eyebrow">Методология</span><h2 class="section-title">Не шпаргалки, а понимание</h2></div></div><div class="info-grid"><div class="info-box"><span class="num">01 / ГЕНЕЗИС</span><h3>Зачем это придумали</h3><p>Исторический контекст, конкурировавшие подходы, компромиссы и причины современных решений.</p></div><div class="info-box"><span class="num">02 / МЕХАНИЗМ</span><h3>Что внутри</h3><p>Структуры данных, протоколы, границы ОС и процессора, алгоритмы и форматы на уровне байтов.</p></div><div class="info-box"><span class="num">03 / ПРАКТИКА</span><h3>Проверяй гипотезы</h3><p>Лабораторные команды, диагностика, контрольные вопросы и ссылки на первоисточники.</p></div></div></section></div>';
};
const coursePage=c=>{
 let own=lessons.filter(l=>l.course===c.id);
 return '<div class="container"><div class="breadcrumbs"><a href="#/">Атлас</a><span>/</span><b>'+safe(c.title)+'</b></div><section class="course-hero"><span class="eyebrow">Учебное направление / '+safe(c.id)+'</span><h1>'+safe(c.title)+'</h1><p>'+safe(c.longDescription)+'</p><div class="hint"><span class="tag">'+own.length+' опубликованные главы</span><span class="tag">'+c.roadmap.reduce((n,x)=>n+x.topics.length,0)+' тем в программе</span><span class="tag">от основ до internals</span></div></section><div class="course-layout"><main id="main"><div class="section-head"><div><span class="eyebrow">Читать сейчас</span><h2 class="section-title">Опубликованные главы</h2></div></div><div class="lesson-list">'+own.map((l,i)=>'<a class="lesson-row" href="'+routeLesson(l.id)+'"><span class="lesson-num">'+String(i+1).padStart(2,"0")+'</span><div><h3>'+safe(l.title)+(completed().includes(l.id)?" ✓":"")+'</h3><p>'+safe(l.summary)+' · '+l.minutes+' мин</p></div><span class="arrow">↗</span></a>').join("")+'</div><div class="section-head" style="margin-top:60px"><div><span class="eyebrow">Полная карта предмета</span><h2 class="section-title">Программа развития</h2><div class="section-sub">Темы ниже — структура будущих глав, а не выданный за написанный текст.</div></div></div>'+c.roadmap.map((g,i)=>'<div class="outline-group"><h3>'+String(i+1).padStart(2,"0")+' — '+safe(g.title)+'</h3><ul>'+g.topics.map(t=>'<li>'+safe(t)+'</li>').join("")+'</ul></div>').join("")+'</main><aside><div class="sidebox"><h3>Твой прогресс</h3><p>'+own.filter(l=>completed().includes(l.id)).length+' из '+own.length+' опубликованных глав</p><div class="progress-track"><div class="progress-fill" style="width:'+pct(c)+'%"></div></div><p>Сохраняется только в этом браузере. Аккаунт не нужен.</p></div><div class="sidebox"><h3>Статус библиотеки</h3><p>Это развиваемая энциклопедия. Список тем шире текущих публикаций; полнота подтверждается содержимым каждой главы и ссылками, а не маркетинговыми обещаниями.</p></div></aside></div></div>';
};
const lessonPage=l=>{
 const c=getCourse(l.course), own=lessons.filter(x=>x.course===c.id), ix=own.findIndex(x=>x.id===l.id);
 const toc=[...l.body.matchAll(/^#{2,3}\s+(.+)$/gm)].map(x=>x[1]);
 const sources=(l.sources||[]).map(id=>D.sources[id]).filter(Boolean);
 const next=own[ix+1] || null, prev=own[ix-1]||null; const e=E[l.id];
 return '<div class="container"><div class="breadcrumbs"><a href="#/">Атлас</a><span>/</span><a href="'+routeCourse(c.id)+'">'+safe(c.title)+'</a><span>/</span><b>'+safe(l.title)+'</b></div><div class="reader-layout"><aside class="reader-side"><details class="chapter-menu"><summary>'+safe(c.title)+' · главы курса</summary><nav class="reader-nav">'+own.map((x,i)=>'<a href="'+routeLesson(x.id)+'" class="'+(x.id===l.id?"current":"")+'">'+String(i+1).padStart(2,"0")+' '+safe(x.title)+'</a>').join("")+'</nav></details></aside><main id="main" class="reader"><span class="eyebrow">Техническая энциклопедия / '+String(ix+1).padStart(2,"0")+'</span><h1>'+safe(l.title)+'</h1><div class="reader-meta"><span class="tag">'+l.minutes+' минут</span><span class="tag">Теория + практика</span><span class="tag">Обновление: '+safe(D.updated)+'</span></div><p class="reader-intro">'+safe(l.summary)+'</p>'+study(l)+'<details class="mobile-toc"><summary>Оглавление главы</summary><nav class="toc-links">'+toc.map(h=>'<button type="button" data-toc="'+slug(h)+'">'+safe(h)+'</button>').join("")+'</nav></details><div class="prose">'+renderMd(l.body,e?.diagram)+'</div>'+check(l)+'<section class="source-section"><h2>Первоисточники и дальнейшее чтение</h2>'+(sources.length?'<ul>'+sources.map(s=>'<li><a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer">'+safe(s.title)+' ↗</a><small>'+safe(s.description)+'</small></li>').join("")+'</ul>':"<p>Подборка источников для этой главы дополняется.</p>")+'</section><div class="reader-foot"><button class="check-btn '+(completed().includes(l.id)?"checked":"")+'" data-complete="'+safe(l.id)+'">'+(completed().includes(l.id)?"✓ Прочитано":"○ Отметить прочитанным")+'</button>'+ (prev?'<a class="btn" href="'+routeLesson(prev.id)+'">← Предыдущая</a>':'') +(next?'<a class="btn" href="'+routeLesson(next.id)+'">Следующая глава →</a>':'<a class="btn" href="'+routeCourse(c.id)+'">К программе курса →</a>')+'</div><div class="reader-warning">Команды выполняй в лабораторной среде. Некоторые примеры меняют состояние системы; всегда проверяй параметры в <code>man</code> и <code>--help</code>.</div></main><aside class="reader-toc"><div class="reader-heading">На этой странице</div><nav class="toc-links">'+toc.map(h=>'<button type="button" data-toc="'+slug(h)+'">'+safe(h)+'</button>').join("")+'</nav></aside></div></div>';
};
const footer=()=>'<div class="container"><footer class="footer"><span>© '+new Date().getFullYear()+' LOCALZET ATLAS · Учись думать системно.</span><span>Открытый исходный код · <a href="https://github.com/localzet/localzet.github.io/tree/main/academy" target="_blank" rel="noopener noreferrer">GitHub ↗</a> · <a href="#/">К началу</a></span></footer></div>';
const header=()=>'<header class="topbar"><a class="brand" href="#/"><span class="brand-icon">A</span>LOCALZET <em>/ ATLAS</em></a><nav class="navlinks"><a href="#/" class="active">Атлас</a><a href="#/" data-scroll="catalog">Направления</a><a href="#/course/internet">Интернет</a></nav><div class="spacer"></div><div class="header-actions"><button class="search-btn" data-search aria-label="Поиск по курсам"><span class="magnify">⌕</span> Поиск по атласу <kbd>/</kbd></button><button type="button" class="icon-btn theme-button" data-theme-toggle aria-label="Сменить цветовую тему" title="Сменить цветовую тему"></button><a class="pill-btn" href="https://github.com/localzet/localzet.github.io/tree/main/academy" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></header>';
function draw(){
 let hash=location.hash||"#/";try{hash=decodeURI(hash)}catch{}const seg=hash.slice(2).split("/");let body;
 if(seg[0]==="course"&&getCourse(seg[1]))body=coursePage(getCourse(seg[1]));
 else if(seg[0]==="lesson"&&getLesson(seg[1]))body=lessonPage(getLesson(seg[1]));
 else body=home();
 root.innerHTML=header()+body+footer(); updateThemeButton(); const menu=root.querySelector(".chapter-menu");if(menu)menu.open=window.matchMedia("(min-width: 1000px)").matches;
 document.title=(seg[0]==="lesson"&&getLesson(seg[1])?getLesson(seg[1]).title+" — ":seg[0]==="course"&&getCourse(seg[1])?getCourse(seg[1]).title+" — ":"")+"Localzet Atlas";
 if(location.hash.startsWith("#/"))window.scrollTo({top:0,behavior:"instant"});
}
function openSearch(){
 if(document.querySelector(".search-modal"))return;
 const modal=document.createElement("div");modal.className="search-modal";modal.innerHTML='<div class="search-panel" role="dialog" aria-modal="true" aria-label="Поиск"><input class="search-field" aria-label="Поисковый запрос" placeholder="Найти тему, утилиту, механизм, RFC..."><div class="search-results"></div><div class="search-help">Esc — закрыть · Enter — открыть первый результат · Поиск локальный, без отправки данных</div></div>';
 document.body.append(modal);const input=modal.querySelector("input"),results=modal.querySelector(".search-results");
 function query(){
 const q=input.value.trim().toLocaleLowerCase("ru");if(!q){results.innerHTML='<div class="search-empty">Введите название механизма, команды или предмета.</div>';return}
 const found=[];
 courses.forEach(c=>{if((c.title+" "+c.description+" "+c.roadmap.map(x=>x.topics.join(" ")).join(" ")).toLowerCase().includes(q))found.push({name:c.title,sub:"Направление",href:routeCourse(c.id)})});
 lessons.forEach(l=>{if((l.title+" "+l.summary+" "+l.body+" "+(E[l.id]?.terms||[]).flat().join(" ")).toLowerCase().includes(q))found.push({name:l.title,sub:getCourse(l.course).title+" · глава",href:routeLesson(l.id)})});
 results.innerHTML=found.slice(0,60).map(x=>'<a class="search-result" href="'+x.href+'"><b>'+safe(x.name)+'</b><small>'+safe(x.sub)+'</small></a>').join("")||'<div class="search-empty">Совпадений не найдено. Попробуйте более короткий запрос.</div>';
 }
 input.addEventListener("input",query);input.addEventListener("keydown",e=>{if(e.key==="Enter"){const a=results.querySelector("a");if(a){location.hash=a.getAttribute("href");modal.remove();}}});
 modal.addEventListener("click",e=>{if(e.target===modal||e.target.closest(".search-result"))modal.remove()});
 input.focus();query();
}
document.addEventListener("click",e=>{
 const s=e.target.closest("[data-search]");if(s){openSearch();return}
 const t=e.target.closest("button[data-theme-toggle]");if(t){theme.toggle();updateThemeButton();return;}
 const b=e.target.closest("[data-complete]");if(b){const id=b.dataset.complete;const d=completed();saveDone(d.includes(id)?d.filter(x=>x!==id):[...d,id]);const pos=window.scrollY;draw();window.scrollTo(0,pos);}
 const toc=e.target.closest("[data-toc]");if(toc){document.getElementById(toc.dataset.toc)?.scrollIntoView({behavior:"smooth",block:"start"});return}
 const skip=e.target.closest(".skip");if(skip){e.preventDefault();(document.getElementById("main")||document.getElementById("catalog"))?.scrollIntoView();return}
 const sc=e.target.closest("[data-scroll]");if(sc){e.preventDefault();if(location.hash!=="#/"){location.hash="#/";setTimeout(()=>document.getElementById(sc.dataset.scroll)?.scrollIntoView({behavior:"smooth"}),30)}else document.getElementById(sc.dataset.scroll)?.scrollIntoView({behavior:"smooth"});return}
});
document.addEventListener("keydown",e=>{
 if(e.key==="Escape")document.querySelector(".search-modal")?.remove();
 if((e.key==="/"&&!/INPUT|TEXTAREA/.test(document.activeElement.tagName))||((e.metaKey||e.ctrlKey)&&e.key==="k")){e.preventDefault();if(!document.querySelector(".search-modal"))openSearch();}
});
function updateThemeButton(){const button=root.querySelector("button[data-theme-toggle]");if(!button)return;const dark=theme.current()==="dark";button.textContent=dark?"☀":"☾";button.setAttribute("aria-label",dark?"Включить светлую тему":"Включить тёмную тему");button.title=button.getAttribute("aria-label");}
window.addEventListener("atlas-theme-change",updateThemeButton);
window.addEventListener("hashchange",draw);draw();
})();