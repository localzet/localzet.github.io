(function academyApp(){
"use strict";
const D=window.ATLAS_DATA; const E=window.ATLAS_EDITORIAL||{};const L=window.ATLAS_LEVELS; const $=s=>document.querySelector(s); const root=$("#app"); if(!D){root.innerHTML="Ошибка загрузки курса";return;}
const courses=D.courses, lessons=D.lessons, articles=window.ATLAS_ARTICLES||[];
const levelKeys=["junior","middle","senior","god"];
const levelNumber=v=>levelKeys.indexOf(String(v).toLowerCase());
const minLevel=l=>L.minimum[l.id]??1;
const lessonOrder=l=>L.order[l.course]?.indexOf(l.id)??-1;
lessons.sort((a,b)=>courses.findIndex(c=>c.id===a.course)-courses.findIndex(c=>c.id===b.course)||lessonOrder(a)-lessonOrder(b));
const readObject=key=>{try{const x=JSON.parse(localStorage.getItem(key)||"{}");return x&&typeof x==="object"&&!Array.isArray(x)?x:{}}catch{return {}}};
const preferences=readObject("atlas-levels-v1");
const preferred=id=>{const n=levelNumber(preferences[id]);return n<0?0:n};
const setLevel=(id,n)=>{preferences[id]=levelKeys[n];try{localStorage.setItem("atlas-levels-v1",JSON.stringify(preferences))}catch{}};
const routeCourse=(id,n=preferred(id))=>"#/course/"+id+"/"+levelKeys[n];
const routeLesson=(id,n)=>{const l=lessons.find(x=>x.id===id);return "#/lesson/"+id+"/"+levelKeys[Math.max(n??preferred(l.course),minLevel(l))]};
const visibleLessons=(id,n)=>lessons.filter(l=>l.course===id&&minLevel(l)<=n);
const titleFor=(l,n)=>n===0&&L.junior[l.id]?L.junior[l.id].title:l.title;
const bodyFor=(l,n)=>n===0&&L.junior[l.id]?L.junior[l.id].body:l.body+(n>=2&&L.advanced[l.id]?"\n\n"+L.advanced[l.id]:"");
const countText=(n,forms=["глава","главы","глав"])=>n+" "+forms[n%100>=11&&n%100<=14?2:n%10===1?0:n%10>=2&&n%10<=4?1:2];
const theme=window.ATLAS_THEME;
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const readLevels=readObject("atlas-progress-v2");
// Preserve previous full-text reading marks without claiming new Senior supplements.
try{if(localStorage.getItem("atlas-progress-v2")===null){const old=JSON.parse(localStorage.getItem("atlas-done-v1")||"[]");if(Array.isArray(old)){for(const id of old){const lesson=lessons.find(l=>l.id===id);if(lesson)readLevels[id]=Math.max(1,minLevel(lesson));}localStorage.setItem("atlas-progress-v2",JSON.stringify(readLevels));}}}catch{}
const equivalentLevel=(l,n)=>Math.min(n,L.advanced[l.id]?2:Math.max(1,minLevel(l)));
const isDone=(l,n)=>Number.isInteger(readLevels[l.id])&&readLevels[l.id]>=equivalentLevel(l,n);
const toggleDone=(l,n)=>{const v=equivalentLevel(l,n);if(isDone(l,n)){if(v>minLevel(l))readLevels[l.id]=v-1;else delete readLevels[l.id];}else readLevels[l.id]=v;try{localStorage.setItem("atlas-progress-v2",JSON.stringify(readLevels))}catch{}};
const count=c=>lessons.filter(l=>l.course===c.id).length;
const getLesson=id=>lessons.find(l=>l.id===id);
const getCourse=id=>courses.find(c=>c.id===id);
const pct=(c,n=preferred(c.id))=>{const ls=visibleLessons(c.id,n);return ls.length?Math.round(ls.filter(l=>isDone(l,n)).length/ls.length*100):0};
const levelPicker=(c,n,lesson)=>'<section class="level-picker" aria-label="Уровень курса"><div class="level-picker-head"><strong>Уровень обучения</strong><span>Настройка для каждого курса отдельно</span></div><div class="level-options" role="group" aria-label="Выберите уровень">'+L.names.map((name,i)=>'<button type="button" class="level-option'+(n===i?" selected":"")+'" data-level-choice="'+i+'" data-course-id="'+safe(c.id)+'"'+(lesson?' data-lesson-id="'+safe(lesson.id)+'"':'')+' aria-pressed="'+(n===i)+'"><b>'+name+'</b><small>'+safe(["Основы","Уверенная практика","Внутреннее устройство","Максимальная глубина"][i])+'</small></button>').join("")+'</div><p class="level-description">'+safe(L.descriptions[n])+' '+safe(L.courses[c.id].labels[n])+'.</p>'+(n===3?'<div class="level-notice">God пока включает весь Senior и план будущих исследований. Новые главы максимального уровня ещё не опубликованы.</div>':'')+'</section>';
const futurePage=c=>'<section class="outline-group god-plan"><h3>God — план исследовательского уровня</h3><p>Это запланированные направления, а не опубликованные уроки.</p><ul>'+L.courses[c.id].future.map(t=>'<li>'+safe(t)+'</li>').join("")+'</ul></section>';
const slug=s=>s.toLowerCase().replace(/[^a-zа-яё0-9 -]/gi,"").replace(/\s+/g,"-").replace(/-+/g,"-");
const parseInline=s=>{
 let x=safe(s); x=x.replace(/`([^`]+)`/g,(_,t)=>"<code>"+t+"</code>");
 x=x.replace(/§([^§]+)§/g,(_,t)=>"<code>"+t+"</code>");
 x=x.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
 x=x.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,(_,label,url)=>'<a href="'+url+'" target="_blank" rel="noopener noreferrer">'+label+"</a>");
 return x;
};
const figure=(diagram,id)=>{
 if(!diagram)return "";
 const {title,caption,steps,kind="flow"}=diagram;
 return '<figure class="diagram" aria-label="'+safe(title)+'"><div class="diagram-title">'+safe(title)+'</div>'+(window.ATLAS_FIGURES?.[id]?'<div class="diagram-art" tabindex="0">'+window.ATLAS_FIGURES[id]+'</div>':'')+'<ol class="diagram-steps '+ (kind==="stack"?"stack":kind==="compare"?"compare":"") +'">'+steps.map((step,i)=>'<li><span class="diagram-number">'+String(i+1).padStart(2,"0")+'</span><div><strong>'+safe(step[0])+'</strong><span>'+safe(step[1])+'</span></div></li>').join("")+'</ol><figcaption>'+safe(caption)+'</figcaption></figure>';
};
const study=(l,n)=>{
 const e=E[l.id];if(!e)return "";const terms=n===0?(L.juniorTerms?.[l.id]||e.terms):e.terms;
 return '<section class="study-box"><h2>Что вы поймёте в этой главе</h2><p>'+safe(n===0?'Разберём тему на простых примерах и закрепим её на практике.':e.intro)+'</p><details class="glossary"><summary>Термины перед чтением <span>'+terms.length+'</span></summary><dl>'+terms.map(([term,meaning])=>'<dt>'+safe(term)+'</dt><dd>'+safe(meaning)+'</dd>').join("")+'</dl></details></section>';
};
const check=(l,n)=>{
 const e=E[l.id];const qs=n===0&&L.juniorQuestions?.[l.id]?[L.juniorQuestions[l.id]]:e?.questions;if(!qs?.length)return "";
 return '<section class="study-box exercises"><h2>Проверьте понимание</h2>'+qs.map(([q,a],i)=>'<details><summary>'+String(i+1)+'. '+safe(q)+'</summary><p>'+safe(a)+'</p></details>').join("")+'</section>';
};
const renderMd=(md,diagram,id)=>{
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
  if(h){flushP();flushL();flushQ();const n=h[1].length;if(n===2&&++headings===2&&diagram){out.push(figure(diagram,id));inserted=true;}out.push("<h"+n+' id="'+slug(h[2])+'">'+parseInline(h[2])+"</h"+n+">");continue}
  if(trim.startsWith("> ")){flushP();flushL();quote.push(trim.slice(2));continue}
  flushQ();
  const ul=/^[-*]\s+(.+)$/.exec(trim), ol=/^\d+\.\s+(.+)$/.exec(trim);
  if(ul||ol){flushP();const next=ul?"ul":"ol";if(list!==next){flushL();out.push("<"+next+">");list=next;}out.push("<li>"+parseInline((ul||ol)[1])+"</li>");continue}
  flushL();para.push(trim);
 }
 flushP();flushL();flushQ();if(code)out.push("<pre><code>"+safe(code.join("\n"))+"</code></pre>");
 if(diagram&&!inserted)out.push(figure(diagram,id)); return out.join("\n");
};
const home=()=>{
 const total=lessons.length, chapters=courses.reduce((a,c)=>a+c.roadmap.reduce((x,g)=>x+g.topics.length,0),0);
 return '<section class="hero"><div class="container hero-grid"><div><span class="eyebrow">Открытая техническая библиотека</span><h1>Понимай <span class="gradient-word">систему.</span><br>Не заучивай.</h1><p>Инженерный атлас на русском: от первых транзисторов до процессов Linux, от Git-объектов до BGP и TLS. Механизмы, история, команды, исходники, стандарты и практические задания.</p><div class="hero-actions"><a class="btn primary" href="#/" data-scroll="catalog">Исследовать курсы ↗</a><a class="btn" href="#/reference">Справочник команд →</a><a class="btn" href="#/articles">Практические статьи →</a></div></div><div class="orbit" aria-hidden="true"><div class="terminal-caption">system / architecture / fundamentals</div><div class="terminal-code"><div class="t-dim">$ trace --from=hardware --to=internet</div><div><span class="t-key">01</span> CPU → ABI → kernel</div><div><span class="t-key">02</span> process → namespace → container</div><div><span class="t-key">03</span> filesystem → Git objects</div><div><span class="t-key">04</span> TCP/IP → DNS → TLS</div><div><span class="t-violet">05</span> design → build → deliver</div><div class="t-dim">✓ understand, then automate.</div></div><div class="orb-note"><strong>Главный принцип:</strong> каждое понятие раскрываем от причины появления до границ применимости.</div></div></div></section><div class="container"><div class="stat-bar"><div class="stat"><strong>'+String(courses.length).padStart(2,"0")+'</strong><span>направлений</span></div><div class="stat"><strong>'+total+'</strong><span>развёрнутых глав</span></div><div class="stat"><strong>'+chapters+'+</strong><span>тем в дорожной карте</span></div><div class="stat"><strong>4</strong><span>уровня обучения</span></div></div><section id="catalog"><div class="section-head"><div><span class="eyebrow">Каталог</span><h2 class="section-title">От машинного к распределённому</h2><div class="section-sub">Каждое направление содержит опубликованные главы и подробный план следующих.</div></div></div><div class="course-grid">'+courses.map(c=>'<a class="course-card" href="'+routeCourse(c.id)+'" style="--tone:'+c.color+'"><div class="card-top"><span class="course-glyph">'+safe(c.glyph)+'</span><span class="card-badge">'+countText(count(c))+' · '+c.roadmap.length+' разделов</span></div><h3>'+safe(c.title)+'</h3><p>'+safe(c.description)+'</p><div class="card-bottom"><span>'+L.names[preferred(c.id)]+' · '+pct(c)+'% прочитано</span><b>Открыть курс ↗</b></div></a>').join("")+'</div></section><section class="articles-preview"><div class="section-head"><div><span class="eyebrow">Инженерная практика</span><h2 class="section-title">Как принимать решения и выпускать продукты</h2><div class="section-sub">От разговора с заказчиком и выбора стека до командной работы и coding agents.</div></div><a class="btn" href="#/articles">Все статьи →</a></div><div class="article-grid">'+articles.slice(0,4).map(articleCard).join("")+'</div></section><section><div class="section-head"><div><span class="eyebrow">Методология</span><h2 class="section-title">Не шпаргалки, а понимание</h2></div></div><div class="info-grid"><div class="info-box"><span class="num">01 / ГЕНЕЗИС</span><h3>Зачем это придумали</h3><p>Исторический контекст, конкурировавшие подходы, компромиссы и причины современных решений.</p></div><div class="info-box"><span class="num">02 / МЕХАНИЗМ</span><h3>Что внутри</h3><p>Структуры данных, протоколы, границы ОС и процессора, алгоритмы и форматы на уровне байтов.</p></div><div class="info-box"><span class="num">03 / ПРАКТИКА</span><h3>Проверяйте гипотезы</h3><p>Практические задания, диагностика, контрольные вопросы и ссылки на первоисточники.</p></div></div></section></div>';
};
const coursePage=(c,n)=>{
 const own=visibleLessons(c.id,n), all=lessons.filter(l=>l.course===c.id), done=own.filter(l=>isDone(l,n)).length;
 const roadmap=n>=2?'<div class="section-head roadmap-heading"><div><span class="eyebrow">Полная карта предмета</span><h2 class="section-title">Программа дальнейшего развития</h2><div class="section-sub">План охвата, а не перечень готовых глав.</div></div></div>'+c.roadmap.map((g,i)=>'<div class="outline-group"><h3>'+String(i+1).padStart(2,"0")+' — '+safe(g.title)+'</h3><ul>'+g.topics.map(t=>'<li>'+safe(t)+'</li>').join("")+'</ul></div>').join(""):'<details class="outline-group"><summary>Полная программа курса (включая будущие темы)</summary><p>Расширенная программа доступна на Senior и God.</p><ul>'+c.roadmap.map(g=>'<li>'+safe(g.title)+'</li>').join("")+'</ul></details>';
 return '<div class="container"><div class="breadcrumbs"><a href="#/">Атлас</a><span>/</span><b>'+safe(c.title)+'</b></div><section class="course-hero"><span class="eyebrow">Учебное направление</span><h1>'+safe(c.title)+'</h1><p>'+safe(c.longDescription)+'</p><div class="hint"><span class="tag">'+countText(own.length)+' · '+L.names[n]+'</span><span class="tag">'+countText(all.length)+' всего</span></div></section>'+levelPicker(c,n)+'<div class="course-layout"><main id="main"><div class="section-head"><div><span class="eyebrow">Маршрут · '+L.names[n]+'</span><h2 class="section-title">Главы курса</h2><div class="section-sub">'+(n===0?'Начните с первой главы и двигайтесь последовательно.':'Этот маршрут включает все темы предыдущих уровней. Знакомые главы раскрываются подробнее.')+'</div></div></div><div class="lesson-list">'+own.map((l,i)=>'<a class="lesson-row" href="'+routeLesson(l.id,n)+'"><span class="lesson-num">'+String(i+1).padStart(2,"0")+'</span><div><h3>'+safe(titleFor(l,n))+(isDone(l,n)?" ✓":"")+'</h3><p>'+(n===0?'Понятное объяснение и практика':safe(l.summary))+' · '+(n===0?Math.max(3,Math.ceil(bodyFor(l,n).split(/\s+/).length/110)):l.minutes)+' мин</p></div><span class="level-chip">'+L.names[minLevel(l)]+'</span><span class="arrow">↗</span></a>').join("")+'</div>'+(n===3?futurePage(c):'')+roadmap+'</main><aside><div class="sidebox"><h3>Ваш прогресс · '+L.names[n]+'</h3><p>'+done+' из '+own.length+'</p><div class="progress-track"><div class="progress-fill" style="width:'+pct(c,n)+'%"></div></div><p>Завершение более подробного материала засчитывает базовый.</p></div><div class="sidebox"><h3>Как устроены уровни</h3><p>Junior → Middle → Senior → God. Это глубина изложения, а не оценка квалификации. Для разных дисциплин можно выбрать разные уровни.</p></div></aside></div></div>';
};
const lessonPage=(l,n)=>{
 const c=getCourse(l.course), own=visibleLessons(c.id,n), ix=own.findIndex(x=>x.id===l.id), body=bodyFor(l,n), title=titleFor(l,n), e=E[l.id];
 const toc=[...body.matchAll(/^#{2,3}\s+(.+)$/gm)].map(x=>x[1]);
 const sources=(l.sources||[]).map(id=>D.sources[id]).filter(Boolean), next=own[ix+1],prev=own[ix-1];
 const tocLinks=()=>toc.map(h=>'<button type="button" data-toc="'+slug(h)+'">'+safe(h)+'</button>').join("");
 const base=n>=1&&L.junior[l.id]?'<details class="base-reading"><summary>Базовое объяснение и практика (Junior)</summary><div class="prose">'+renderMd(L.junior[l.id].body,L.juniorDiagrams[l.id],null).replace(/ id="[^"]*"/g,"")+'</div></details>':'';
 const diagram=n===0?(L.juniorDiagrams?.[l.id]||e?.diagram):e?.diagram;
 return '<div class="container"><div class="breadcrumbs"><a href="#/">Атлас</a><span>/</span><a href="'+routeCourse(c.id,n)+'">'+safe(c.title)+'</a><span>/</span><b>'+safe(title)+'</b></div><div class="reader-level">'+levelPicker(c,n,l)+'</div><div class="reader-layout"><aside class="reader-side"><details class="chapter-menu"><summary>'+safe(c.title)+' · главы курса</summary><nav class="reader-nav">'+own.map((x,i)=>'<a href="'+routeLesson(x.id,n)+'" class="'+(x.id===l.id?"current":"")+'">'+String(i+1).padStart(2,"0")+' '+safe(titleFor(x,n))+'</a>').join("")+'</nav></details></aside><main id="main" class="reader"><span class="eyebrow">Глава '+String(ix+1).padStart(2,"0")+' · '+L.names[n]+'</span><h1>'+safe(title)+'</h1><div class="reader-meta"><span class="tag">'+(n===0?Math.max(3,Math.ceil(body.split(/\s+/).length/110)):l.minutes+(n>=2&&L.advanced[l.id]?4:0))+' мин · ориентир</span><span class="tag">Теория и практика</span></div><p class="reader-intro">'+safe(n===0?'Начните с объяснения, затем повторите практический пример.':l.summary)+'</p>'+study(l,n)+(['linux','git','docker'].includes(l.course)?'<a class="reference-link" href="#/reference">↗ Справочник команд и аргументов</a>':'')+'<details class="mobile-toc"><summary>Оглавление главы</summary><nav class="toc-links">'+tocLinks()+'</nav></details><div class="prose">'+renderMd(body,diagram,n===0?'junior-'+l.id:l.id)+(n>=2&&L.advancedDiagrams?.[l.id]?figure(L.advancedDiagrams[l.id],null):'')+'</div>'+(window.ATLAS_LABS?.has(l.id)?'<div data-atlas-lab></div>':'')+base+check(l,n)+'<section class="source-section"><h2>Первоисточники и дальнейшее чтение</h2>'+(sources.length?'<ul>'+sources.map(s=>'<li><a href="'+safe(s.url)+'" target="_blank" rel="noopener noreferrer">'+safe(s.title)+' ↗</a><small>'+safe(s.description)+'</small></li>').join("")+'</ul>':'<p>Подборка источников дополняется.</p>')+'</section><div class="reader-foot"><button class="check-btn '+(isDone(l,n)?"checked":"")+'" data-complete="'+safe(l.id)+'" data-reading-level="'+n+'">'+(isDone(l,n)?"✓ Прочитано":"○ Отметить прочитанным")+'</button>'+(prev?'<a class="btn" href="'+routeLesson(prev.id,n)+'">← Предыдущая</a>':'')+(next?'<a class="btn" href="'+routeLesson(next.id,n)+'">Следующая глава →</a>':'<a class="btn" href="'+routeCourse(c.id,n)+'">К программе курса →</a>')+'</div><div class="reader-warning">Выполняйте команды в учебной среде. Некоторые примеры меняют состояние системы; проверяйте параметры в <code>man</code> и <code>--help</code>.</div></main><aside class="reader-toc"><div class="reader-heading">На этой странице</div><nav class="toc-links">'+tocLinks()+'</nav></aside></div></div>';
};

const articleCard=a=>'<a class="article-card" href="#/article/'+safe(a.id)+'"><span class="eyebrow">'+safe(a.category)+'</span><h3>'+safe(a.title)+'</h3><p>'+safe(a.summary)+'</p><span class="article-read">Читать статью →</span></a>';
const articlesPage=()=>'<div class="container"><div class="breadcrumbs"><a href="#/">Атлас</a><span>/</span><b>Статьи</b></div><section class="course-hero"><span class="eyebrow">Инженерная практика</span><h1>Практические статьи</h1><p>Руководства по проектированию, работе с заказчиком, выбору технологий, командной разработке и ИИ. Не зависят от уровня выбранного курса.</p></section><main id="main">'+[...new Set(articles.map(a=>a.category))].map(category=>'<section class="article-category"><h2 class="section-title">'+safe(category)+'</h2><div class="article-grid">'+articles.filter(a=>a.category===category).map(articleCard).join("")+'</div></section>').join("")+'</main></div>';
const articlePage=a=>'<div class="container"><div class="breadcrumbs"><a href="#/">Атлас</a><span>/</span><a href="#/articles">Статьи</a><span>/</span><b>'+safe(a.category)+'</b></div><div class="article-reading"><main id="main" class="reader"><span class="eyebrow">'+safe(a.category)+'</span><h1>'+safe(a.title)+'</h1><p class="reader-intro">'+safe(a.summary)+'</p><div class="prose">'+renderMd(a.body,a.diagram,null)+'</div><section class="source-section"><h2>Первоисточники и дальнейшее чтение</h2><ul>'+a.sources.map(s=>'<li><a target="_blank" rel="noopener noreferrer" href="'+safe(s.url)+'">'+safe(s.title)+' ↗</a></li>').join("")+'</ul></section><div class="reader-foot"><a class="btn" href="#/articles">← Все статьи</a></div></main></div><section class="article-category"><h2 class="section-title">Другие статьи</h2><div class="article-grid">'+articles.filter(x=>x.id!==a.id).slice(0,3).map(articleCard).join("")+'</div></section></div>';

const referencePage=()=>{
 const refs=window.ATLAS_REFERENCE||[];
 return '<main class="container reference-page" id="main"><div class="breadcrumbs"><a href="#/">Атлас</a><span>/</span><b>Справочник</b></div><div class="course-hero"><span class="eyebrow">Справочник интерфейсов</span><h1>Команды и первоисточники</h1><p>Каталог команд по назначению. Найдите неизвестную утилиту, изучите её синтаксис и параметры в официальной документации, а затем проверьте их на установленной версии.</p></div><label class="reference-search">Фильтр по названию или назначению<input type="search" data-reference-search placeholder="Например: rebase, journal, volume"></label><p class="reference-count" aria-live="polite"></p>'+refs.map(r=>'<section class="ref-section"><h2>'+safe(r.title)+'</h2><p>'+safe(r.scope)+'</p><pre class="ref-check"><code>'+safe(r.check)+'</code></pre>'+r.groups.map(g=>'<details class="ref-group"><summary>'+safe(g.title)+' <span>'+g.entries.length+'</span></summary><div class="ref-grid">'+g.entries.map(e=>'<article class="ref-item" data-ref-item data-index="'+safe((r.title+" "+e.name+" "+e.description+" "+(e.options||[]).flat().join(" ")).toLowerCase())+'"><div><strong><code>'+safe(r.id==="linux"?e.name:r.id+" "+e.name)+'</code></strong><p>'+safe(e.description)+'</p>'+(e.options?.length?'<details class="ref-options"><summary>Параметры и подкоманды ('+e.options.length+')</summary><dl>'+e.options.map(([flag,meaning])=>'<dt><code>'+safe(flag)+'</code></dt><dd>'+safe(meaning)+'</dd>').join('')+'</dl></details>':'')+'</div><a href="'+safe(e.url)+'" target="_blank" rel="noopener noreferrer">'+(e.specific?"Справка":"Каталог")+' ↗</a></article>').join("")+'</div></details>').join("")+'</section>').join("")+'</main>';
};
function filterReference(input){
 const q=input.value.trim().toLowerCase();let count=0;
 root.querySelectorAll("[data-ref-item]").forEach(item=>{const show=!q||item.dataset.index.includes(q);item.hidden=!show;if(show)count++;});
 root.querySelectorAll(".ref-group").forEach(g=>{const show=Array.from(g.querySelectorAll("[data-ref-item]")).some(e=>!e.hidden);g.hidden=!show;if(q&&show)g.open=true;});
 root.querySelectorAll(".ref-section").forEach(s=>s.hidden=!Array.from(s.querySelectorAll(".ref-group")).some(g=>!g.hidden));
 const status=root.querySelector(".reference-count");if(status)status.textContent="Найдено интерфейсов: "+count;
}
const footer=()=>'<div class="container"><footer class="footer"><span>© '+new Date().getFullYear()+' LOCALZET ATLAS · Системное понимание технологий.</span><span><a href="#/articles">Статьи</a> · <a href="#/reference">Справочник команд</a> · <a href="https://github.com/localzet/localzet.github.io/tree/main/academy" target="_blank" rel="noopener noreferrer">GitHub ↗</a> · <a href="#/">К началу</a></span></footer></div>';
const header=()=>'<header class="topbar"><a class="brand" href="#/"><span class="brand-icon">A</span>LOCALZET <em>/ ATLAS</em></a><nav class="navlinks"><a href="#/" class="active">Атлас</a><a href="#/" data-scroll="catalog">Направления</a><a href="#/reference">Справочник</a><a href="#/articles">Статьи</a></nav><div class="spacer"></div><div class="header-actions"><button class="search-btn" data-search aria-label="Поиск по курсам"><span class="magnify">⌕</span> Поиск по атласу <kbd>/</kbd></button><button type="button" class="icon-btn theme-button" data-theme-toggle aria-label="Сменить цветовую тему" title="Сменить цветовую тему"></button><a class="pill-btn" href="https://github.com/localzet/localzet.github.io/tree/main/academy" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div></header>';
function draw(){
 let hash=location.hash||"#/";try{hash=decodeURI(hash)}catch{}const seg=hash.slice(2).split("/");let body;
 if(seg[0]==="course"&&getCourse(seg[1])){const c=getCourse(seg[1]),n=levelNumber(seg[2]);body=coursePage(c,n<0?preferred(c.id):n);}
 else if(seg[0]==="lesson"&&getLesson(seg[1])){const l=getLesson(seg[1]),n=levelNumber(seg[2]);body=lessonPage(l,Math.max(minLevel(l),n<0?preferred(l.course):n));}
 else if(seg[0]==="reference")body=referencePage();
 else if(seg[0]==="articles")body=articlesPage();
 else if(seg[0]==="article"&&articles.some(a=>a.id===seg[1]))body=articlePage(articles.find(a=>a.id===seg[1]));
 else body=home();
 root.innerHTML=header()+body+footer(); if(seg[0]==='lesson')window.ATLAS_LABS?.mount(root,seg[1]); updateThemeButton(); const refInput=root.querySelector("[data-reference-search]");if(refInput){refInput.addEventListener("input",()=>filterReference(refInput));filterReference(refInput);} const menu=root.querySelector(".chapter-menu");if(menu)menu.open=window.matchMedia("(min-width: 1000px)").matches;
 document.title=(seg[0]==="lesson"&&getLesson(seg[1])?titleFor(getLesson(seg[1]),Math.max(minLevel(getLesson(seg[1])),levelNumber(seg[2])<0?preferred(getLesson(seg[1]).course):levelNumber(seg[2])))+" — ":seg[0]==="course"&&getCourse(seg[1])?getCourse(seg[1]).title+" — ":seg[0]==="article"?(articles.find(a=>a.id===seg[1])?.title||"Статья")+" — ":seg[0]==="articles"?"Статьи — ":"")+"Localzet Atlas";
 if(location.hash.startsWith("#/"))window.scrollTo({top:0,behavior:"instant"});
}
function openSearch(){
 if(document.querySelector(".search-modal"))return;
 const modal=document.createElement("div");modal.className="search-modal";modal.innerHTML='<div class="search-panel" role="dialog" aria-modal="true" aria-label="Поиск"><input class="search-field" aria-label="Поисковый запрос" placeholder="Найти тему, утилиту, механизм, RFC..."><div class="search-results"></div><div class="search-help">Esc — закрыть · Enter — открыть первый результат · Поиск локальный, без отправки данных</div></div>';
 document.body.append(modal);const input=modal.querySelector("input"),results=modal.querySelector(".search-results");
 function query(){
 const q=input.value.trim().toLocaleLowerCase("ru");if(!q){results.innerHTML='<div class="search-empty">Введите название механизма, команды или предмета.</div>';return}
 const found=[];
 articles.forEach(a=>{if((a.title+" "+a.summary+" "+a.body).toLowerCase().includes(q))found.push({name:a.title,sub:"Статья · "+a.category,href:"#/article/"+a.id});});
 courses.forEach(c=>{if((c.title+" "+c.description+" "+c.roadmap.map(x=>x.topics.join(" ")).join(" ")).toLowerCase().includes(q))found.push({name:c.title,sub:"Направление",href:routeCourse(c.id)})});
 lessons.forEach(l=>{const base=(l.title+" "+l.summary+" "+l.body+" "+(E[l.id]?.terms||[]).flat().join(" ")).toLowerCase(), beginner=((L.junior[l.id]?.title||"")+" "+(L.junior[l.id]?.body||"")+" "+(L.juniorTerms?.[l.id]||[]).flat().join(" ")).toLowerCase(), senior=(L.advanced[l.id]||"").toLowerCase();if(!base.includes(q)&&!beginner.includes(q)&&!senior.includes(q))return;let n=Math.max(minLevel(l),preferred(l.course));if(n===0&&!beginner.includes(q))n=1;if(n<2&&!base.includes(q)&&!beginner.includes(q)&&senior.includes(q))n=2;found.push({name:titleFor(l,n),sub:getCourse(l.course).title+" · "+L.names[n],href:routeLesson(l.id,n)});});
 results.innerHTML=found.slice(0,60).map(x=>'<a class="search-result" href="'+x.href+'"><b>'+safe(x.name)+'</b><small>'+safe(x.sub)+'</small></a>').join("")||'<div class="search-empty">Совпадений не найдено. Попробуйте более короткий запрос.</div>';
 }
 input.addEventListener("input",query);input.addEventListener("keydown",e=>{if(e.key==="Enter"){const a=results.querySelector("a");if(a){location.hash=a.getAttribute("href");modal.remove();}}});
 modal.addEventListener("click",e=>{if(e.target===modal||e.target.closest(".search-result"))modal.remove()});
 input.focus();query();
}
document.addEventListener("click",e=>{
 const s=e.target.closest("[data-search]");if(s){openSearch();return}
 const t=e.target.closest("button[data-theme-toggle]");if(t){theme.toggle();updateThemeButton();return;}
 const choice=e.target.closest("button[data-level-choice]");if(choice){const n=Number(choice.dataset.levelChoice),c=choice.dataset.courseId,l=getLesson(choice.dataset.lessonId);if(!Number.isInteger(n)||n<0||n>3||!getCourse(c))return;setLevel(c,n);const dest=l&&minLevel(l)<=n?routeLesson(l.id,n):routeCourse(c,n);if(location.hash===dest)draw();else location.hash=dest;return;}
 const b=e.target.closest("[data-complete]");if(b){const l=getLesson(b.dataset.complete);toggleDone(l,Number(b.dataset.readingLevel));const pos=window.scrollY;draw();window.scrollTo(0,pos);return;}
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