const assert=require('node:assert/strict');
const { chromium }=require('playwright');
const { spawn }=require('node:child_process');
const { once }=require('node:events');
const server=spawn('python3',['-m','http.server','8765','--bind','127.0.0.1'],{stdio:'ignore'});
const base='http://127.0.0.1:8765/academy/';
(async()=>{
 let browser;
 try{
  for(let i=0;i<30;i++){try{const r=await fetch(base);if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,100));}
  browser=await chromium.launch({headless:true});
  for(const view of [{width:360,height:800},{width:390,height:844},{width:768,height:1024},{width:1440,height:900}]){
   for(const scheme of ['light','dark']){
    const ctx=await browser.newContext({viewport:view,colorScheme:scheme,deviceScaleFactor:1,isMobile:view.width<600,hasTouch:view.width<600});
    const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const theme=()=>page.locator('html').getAttribute('data-theme');
    const checkWidth=async()=>{const dims=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,viewport:document.documentElement.clientWidth}));assert(dims.scroll<=dims.viewport+1,'Horizontal overflow '+JSON.stringify(view)+' '+JSON.stringify(dims));};
    await page.goto(base);await page.locator('.course-card').first().waitFor();assert.equal(await theme(),scheme);
    await checkWidth();await page.locator('.course-card').first().click();await page.locator('.lesson-row').first().waitFor();assert.equal(await theme(),scheme);
    await checkWidth();await page.locator('.lesson-row').first().click();await page.locator('.reader h1').waitFor();assert.equal(await theme(),scheme);
    assert.equal(await page.locator('button[data-level-choice="0"]').getAttribute('aria-pressed'),'true');
    await page.locator('button[data-level-choice="1"]').click();await page.waitForURL('**/middle');await page.locator('.base-reading').waitFor();
    await page.locator('button[data-level-choice="2"]').click();await page.waitForURL('**/senior');
    await page.locator('button[data-level-choice="3"]').click();await page.waitForURL('**/god');await page.locator('.level-notice').waitFor();
    await page.locator('button[data-level-choice="0"]').click();await page.waitForURL('**/junior');
    await checkWidth();await page.locator('.reader h1').click();assert.equal(await theme(),scheme,'Clicking text must not toggle theme');
    await page.locator('.glossary summary').click();assert.equal(await theme(),scheme);assert(await page.locator('.glossary dd').first().isVisible());
    await page.locator('.diagram').first().scrollIntoViewIfNeeded();await checkWidth();
    const exercises=page.locator('.exercises summary');if(await exercises.count())await exercises.first().click();assert.equal(await theme(),scheme);
    const oldHash=await page.evaluate(()=>location.hash);
    const toc=page.locator('.mobile-toc');if(await toc.isVisible()){await toc.locator('summary').click();await toc.locator('button').first().click();}else await page.locator('.reader-toc button').first().click();
    assert.equal(await page.evaluate(()=>location.hash),oldHash,'TOC must not alter SPA route');assert.equal(await theme(),scheme);
    await page.locator('button[data-theme-toggle]').click();const changed=scheme==='light'?'dark':'light';assert.equal(await theme(),changed);
    await page.reload();await page.locator('.reader h1').waitFor();assert.equal(await theme(),changed,'Theme must persist reload');
    await page.emulateMedia({colorScheme:scheme});assert.equal(await theme(),changed,'Explicit choice must override OS');
    await page.locator('[data-complete]').click();assert.equal(await theme(),changed);assert(await page.locator('[data-complete]').textContent().then(t=>t.includes('Прочитано')));
    await page.locator('[data-search]').click();await page.locator('.search-field').fill('DNSSEC');await page.locator('.search-result').first().waitFor();await page.locator('.search-field').press('Escape');assert.equal(await page.locator('.search-modal').count(),0);assert.equal(await theme(),changed);
    await page.goto(base+'#/reference');await page.locator('[data-reference-search]').fill('rebase');assert(await page.locator('.ref-item:visible').count()>0);await checkWidth();
    await page.goto(base+'#/lesson/internet-tls');await page.locator('.reader h1').waitFor();await checkWidth();assert.equal(await theme(),changed);
    assert.deepEqual(errors,[],'Browser exceptions');console.log('PASS',view.width,scheme);
    await ctx.close();
   }
  }
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
