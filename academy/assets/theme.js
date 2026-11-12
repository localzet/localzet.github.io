(function(){
"use strict";
const key="atlas-theme", root=document.documentElement, media=window.matchMedia("(prefers-color-scheme: dark)");
let explicit=null;
try{const v=localStorage.getItem(key);if(v==="light"||v==="dark")explicit=v;}catch{}
function current(){return explicit || (media.matches?"dark":"light");}
function apply(){const v=current();root.dataset.theme=v;root.style.colorScheme=v;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=v==="dark"?"#15191e":"#faf9f6";window.dispatchEvent(new Event("atlas-theme-change"));}
function toggle(){explicit=current()==="dark"?"light":"dark";try{localStorage.setItem(key,explicit)}catch{}apply();}
if(media.addEventListener)media.addEventListener("change",()=>{if(!explicit)apply();});
window.addEventListener("storage",e=>{if(e.key===key){explicit=e.newValue==="dark"||e.newValue==="light"?e.newValue:null;apply();}});
window.ATLAS_THEME={current,toggle};apply();
})();