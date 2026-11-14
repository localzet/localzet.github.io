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
    await page.locator('[data-teach="linux-layers"]').first().scrollIntoViewIfNeeded();await checkWidth();
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
    // Cumulative route coverage and independent course preferences.
    for(const course of ['linux','git','docker','devops','architecture','assembly','internet','python','shell','php','ai-engineering']){
      let previous=[];
      for(const level of ['junior','middle','senior','god']){
        await page.goto(base+'#/course/'+course+'/'+level);
        await page.locator('.lesson-row').first().waitFor();
        const current=await page.locator('.lesson-row').evaluateAll(rows=>rows.map(row=>row.getAttribute('href').split('/')[2]));
        assert(previous.every(id=>current.includes(id)),'Previous level lost a chapter '+course+' '+level);
        assert.equal(new Set(current).size,current.length);
        if(level==='god')assert.equal(current.length,previous.length);
        previous=current;await checkWidth();
      }
    }
    await page.goto(base+'#/course/git/junior');await page.locator('[data-level-choice="2"]').click();await page.waitForURL('**/git/senior');
    await page.goto(base+'#/course/linux');assert.equal(await page.locator('[data-level-choice="0"]').getAttribute('aria-pressed'),'true');
    await page.goto(base+'#/course/git');assert.equal(await page.locator('[data-level-choice="2"]').getAttribute('aria-pressed'),'true');
    await page.reload();await page.locator('.lesson-row').first().waitFor();assert.equal(await page.locator('[data-level-choice="2"]').getAttribute('aria-pressed'),'true');
    await page.goto(base+'#/lesson/git-merge/senior');await page.locator('.reader > .prose > [data-teach="git-audit-crisscross"]').waitFor();
    await page.locator('[data-complete]').click();await page.goto(base+'#/lesson/git-merge/junior');assert(await page.locator('[data-complete]').textContent().then(t=>t.includes('Прочитано')));
    await page.goto(base+'#/lesson/git-origins/junior');
    await page.locator('[data-teach="git-snapshots"]').waitFor();
    const offline=page.locator('[data-teach="git-question-offline"]');
    await offline.locator('[data-start-action="answer-2"]').click();assert.equal(await offline.locator('[data-start-feedback]').getAttribute('data-result'),'retry');
    await offline.locator('[data-start-action="answer-0"]').click();assert.equal(await offline.locator('[data-start-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-setup/junior');
    const first=page.locator('[data-teach="git-first-walk"]');
    await first.waitFor();
    for(let i=0;i<4;i++)await first.locator('[data-start-action="next"]').click();
    assert((await first.locator('[data-start-feedback]').textContent()).includes('status пуст'));assert((await first.locator('.teach-file.head').textContent()).includes('Запуск'));await checkWidth();
    await page.goto(base+'#/lesson/git-lab-config/junior');
    const scope=page.locator('[data-teach="git-config-scope"]');
    await scope.locator('[data-start-action="scope-command"]').click();assert((await scope.locator('[data-start-feedback]').textContent()).includes('Temporary'));
    await scope.locator('[data-start-action="scope-global"]').click();assert((await scope.locator('[data-start-feedback]').textContent()).includes('Developer'));await checkWidth();
    for(const id of ['git-origins','git-setup','git-lab-config']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.prose .teach-panel').first().waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/git-diff-status/junior');
    const staged=page.locator('[data-teach="git-stage-hunks"]');await staged.waitFor();
    await staged.locator('[data-history-action="port"]').click();
    assert((await staged.locator('.teach-file.index').textContent()).includes('port=9090'));
    assert((await staged.locator('.teach-file.index').textContent()).includes('timeout=10'));
    await staged.locator('[data-history-action="commit"]').click();
    await staged.locator('[data-history-action="check"]').click();
    assert.equal(await staged.locator('[data-history-feedback]').getAttribute('data-result'),'correct');
    await staged.locator('[data-history-action="reset"]').click();
    await staged.locator('[data-history-action="timeout"]').click();
    await staged.locator('[data-history-action="commit"]').click();
    await staged.locator('[data-history-action="check"]').click();
    assert.equal(await staged.locator('[data-history-feedback]').getAttribute('data-result'),'retry');await checkWidth();
    await page.goto(base+'#/lesson/git-commit-quality/junior');
    const atomic=page.locator('[data-teach="git-question-atomic"]');
    await atomic.locator('[data-history-action="answer-1"]').click();
    assert.equal(await atomic.locator('[data-history-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-history-reading/junior');
    const explorer=page.locator('[data-teach="git-history-explorer"]');
    await explorer.locator('[data-history-action="rev-D"]').click();
    assert((await explorer.locator('.teach-file.head').textContent()).includes('timeout=10'));
    assert((await explorer.locator('.teach-file.work').textContent()).includes('timeout=30'));
    const findChange=page.locator('[data-teach="git-history-task"]');
    await findChange.locator('[data-history-action="find-D"]').click();assert.equal(await findChange.locator('[data-history-feedback]').getAttribute('data-result'),'retry');
    await findChange.locator('[data-history-action="find-E"]').click();assert.equal(await findChange.locator('[data-history-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    for(const id of ['git-diff-status','git-commit-quality','git-history-reading']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.prose .teach-panel').first().waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/git-ignore-attributes/junior');
    const rules=page.locator('[data-teach="git-ignore-rules"]');await rules.waitFor();
    await rules.locator('[data-branch-action="rule-2"]').click();
    assert((await rules.locator('[data-branch-feedback]').textContent()).includes('Не игнорируется'));
    const ignoreTask=page.locator('[data-teach="git-ignore-task"]');
    await ignoreTask.locator('[data-branch-action="check"]').click();
    assert.equal(await ignoreTask.locator('[data-branch-feedback]').getAttribute('data-result'),'retry');
    for(const i of [1,3,4])await ignoreTask.locator('[data-branch-action="pick-'+i+'"]').click();
    await ignoreTask.locator('[data-branch-action="check"]').click();
    assert.equal(await ignoreTask.locator('[data-branch-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-undo/junior');
    const undo=page.locator('[data-teach="git-undo-play"]');
    await undo.locator('[data-branch-action="restore"]').click();
    await undo.locator('[data-branch-action="check"]').click();
    assert.equal(await undo.locator('[data-branch-feedback]').getAttribute('data-result'),'retry');
    await undo.locator('[data-branch-action="reset"]').click();
    await undo.locator('[data-branch-action="unstage"]').click();
    await undo.locator('[data-branch-action="check"]').click();
    assert.equal(await undo.locator('[data-branch-feedback]').getAttribute('data-result'),'correct');
    assert((await undo.locator('.teach-file.work').textContent()).includes('# draft'));await checkWidth();
    await page.goto(base+'#/lesson/git-branch-lab/junior');
    const branchWalk=page.locator('[data-teach="git-branch-walk"]');
    for(let i=0;i<4;i++)await branchWalk.locator('[data-branch-action="next"]').click();
    assert((await branchWalk.locator('[data-branch-feedback]').textContent()).includes('общего родителя A'));
    const ancestor=page.locator('[data-teach="git-branch-task"]');
    await ancestor.locator('[data-branch-action="ancestor-B"]').click();
    assert.equal(await ancestor.locator('[data-branch-feedback]').getAttribute('data-result'),'retry');
    await ancestor.locator('[data-branch-action="ancestor-A"]').click();
    assert.equal(await ancestor.locator('[data-branch-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    for(const id of ['git-ignore-attributes','git-undo','git-branch-lab']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.prose .teach-panel').first().waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/git-merge/junior');
    const topo=page.locator('.reader > .prose > [data-teach="git-merge-topology"]');await topo.waitFor();
    await topo.locator('[data-merge-action="mode-diverged"]').click();
    assert((await topo.locator('[data-merge-feedback]').textContent()).includes('Fast-forward невозможен'));
    await topo.locator('[data-merge-action="mode-merge"]').click();
    assert((await topo.locator('[data-merge-feedback]').textContent()).includes('два родителя'));
    const threeway=page.locator('.reader > .prose > [data-teach="git-threeway"]');
    await threeway.locator('[data-merge-action="case-3"]').click();
    assert((await threeway.locator('[data-merge-files]').textContent()).includes('Конфликт'));
    const modes=page.locator('.reader > .prose > [data-teach="git-merge-modes"]');
    await modes.locator('[data-merge-action="mode-squash"]').click();
    assert((await modes.locator('[data-merge-feedback]').textContent()).includes('одного родителя'));await checkWidth();
    await page.goto(base+'#/lesson/git-merge-lab/junior');
    const mergeTask=page.locator('.reader > .prose > [data-teach="git-merge-task"]');
    await mergeTask.locator('[data-merge-action="task-ff"]').click();assert.equal(await mergeTask.locator('[data-merge-feedback]').getAttribute('data-result'),'retry');
    await mergeTask.locator('[data-merge-action="task-merge"]').click();assert.equal(await mergeTask.locator('[data-merge-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-conflicts/junior');
    const editor=page.locator('.reader > .prose > [data-teach="git-conflict-editor"]');
    await editor.locator('[data-merge-action="check-editor"]').click();assert.equal(await editor.locator('[data-merge-feedback]').getAttribute('data-result'),'retry');
    await editor.locator('[data-merge-editor]').fill('port=9090\ntimeout=40\nmode=demo');await editor.locator('[data-merge-action="check-editor"]').click();assert.equal(await editor.locator('[data-merge-feedback]').getAttribute('data-result'),'retry');
    await editor.locator('[data-merge-editor]').fill('port=9090\ntimeout=45\nmode=demo');await editor.locator('[data-merge-action="check-editor"]').click();assert.equal(await editor.locator('[data-merge-feedback]').getAttribute('data-result'),'correct');
    await editor.locator('[data-merge-action="reset-editor"]').click();assert((await editor.locator('[data-merge-editor]').inputValue()).includes('<<<<<<<'));await checkWidth();
    for(const id of ['git-merge','git-merge-lab','git-conflicts']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.reader > .prose > .teach-panel').first().waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/git-remotes/junior');
    const remoteMap=page.locator('.reader > .prose > [data-teach="git-remote-map"]');await remoteMap.waitFor();await checkWidth();
    await page.goto(base+'#/lesson/git-fetch-push-lab/junior');
    const remoteWalk=page.locator('.reader > .prose > [data-teach="git-remote-walk"]');
    for(let i=0;i<3;i++)await remoteWalk.locator('[data-remote-action="next"]').click();
    assert((await remoteWalk.locator('[data-remote-feedback]').textContent()).includes('рабочий файл остаются на A'));
    await remoteWalk.locator('[data-remote-action="next"]').click();
    assert((await remoteWalk.locator('[data-remote-feedback]').textContent()).includes('main догоняет B'));
    const remoteRace=page.locator('.reader > .prose > [data-teach="git-remote-race"]');
    await remoteRace.locator('[data-remote-action="push"]').click();
    assert((await remoteRace.locator('[data-remote-feedback]').textContent()).includes('Push отклонён'));
    await remoteRace.locator('[data-remote-action="check"]').click();assert.equal(await remoteRace.locator('[data-remote-feedback]').getAttribute('data-result'),'retry');
    for(const action of ['fetch','merge','test','push','check'])await remoteRace.locator('[data-remote-action="'+action+'"]').click();
    assert.equal(await remoteRace.locator('[data-remote-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-team-review/junior');
    const gate=page.locator('.reader > .prose > [data-teach="git-review-gate"]');
    await gate.locator('[data-remote-action="test"]').click();assert.equal(await gate.locator('[data-remote-feedback]').getAttribute('data-result'),'retry');
    await gate.locator('[data-remote-action="integrate"]').click();assert.equal(await gate.locator('[data-remote-feedback]').getAttribute('data-result'),'retry');
    await gate.locator('[data-remote-action="fix"]').click();
    await gate.locator('[data-remote-action="test"]').click();assert.equal(await gate.locator('[data-remote-feedback]').getAttribute('data-result'),'correct');
    await gate.locator('[data-remote-action="integrate"]').click();assert((await gate.locator('[data-remote-gate]').textContent()).includes('Main обновлена'));await checkWidth();
    for(const id of ['git-remotes','git-fetch-push-lab','git-team-review']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.reader > .prose > .teach-panel').first().waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/git-stash-lab/junior');
    const stashTask=page.locator('.reader > .prose > [data-teach="git-stash-task"]');
    await stashTask.waitFor();
    for(const action of ['save','apply','drop','verify','check'])await stashTask.locator('[data-safety-action="'+action+'"]').click();
    assert.equal(await stashTask.locator('[data-safety-feedback]').getAttribute('data-result'),'retry');
    for(const action of ['reset','save','apply','verify','drop','check'])await stashTask.locator('[data-safety-action="'+action+'"]').click();
    assert.equal(await stashTask.locator('[data-safety-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-repository-security/junior');
    const secretHistory=page.locator('.reader > .prose > [data-teach="git-secret-history"]');
    await secretHistory.locator('[data-safety-action="secret-2"]').click();
    assert((await secretHistory.locator('[data-safety-view]').textContent()).includes('Да, в B'));
    const incidentTask=page.locator('.reader > .prose > [data-teach="git-secret-incident"]');
    await incidentTask.locator('[data-safety-action="incident-2"]').click();
    assert.equal(await incidentTask.locator('[data-safety-feedback]').getAttribute('data-result'),'retry');
    for(let i=0;i<4;i++)await incidentTask.locator('[data-safety-action="incident-'+i+'"]').click();
    assert((await incidentTask.locator('[data-safety-view]').textContent()).includes('4 / 4'));await checkWidth();
    await page.goto(base+'#/lesson/git-reflog-recovery/middle');
    const rescueTask=page.locator('.reader > .prose > [data-teach="git-rescue-task"]');
    await rescueTask.locator('[data-safety-action="branch"]').click();
    await rescueTask.locator('[data-safety-action="check"]').click();
    assert.equal(await rescueTask.locator('[data-safety-feedback]').getAttribute('data-result'),'retry');
    for(const action of ['reflog','show','branch','check'])await rescueTask.locator('[data-safety-action="'+action+'"]').click();
    assert.equal(await rescueTask.locator('[data-safety-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    for(const id of ['git-stash-lab','git-repository-security']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.reader > .prose > .teach-panel').first().waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/git-restore-reset-lab/junior');
    const resetModes=page.locator('.reader > .prose > [data-teach="git-reset-modes"]');await resetModes.waitFor();
    await resetModes.locator('[data-reset-action="mode-soft"]').click();
    assert.equal(await resetModes.locator('[data-reset-view] .teach-file.work .teach-file-content').textContent(),'C');
    await resetModes.locator('[data-reset-action="mode-hard"]').click();
    assert.equal(await resetModes.locator('[data-reset-view] .teach-file.work .teach-file-content').textContent(),'A');
    await resetModes.locator('[data-reset-action="mode-path"]').click();
    assert.equal(await resetModes.locator('[data-reset-view] .teach-file.head .teach-file-content').textContent(),'B');
    const resetChallenge=page.locator('.reader > .prose > [data-teach="git-reset-challenge"]');
    await resetChallenge.locator('[data-reset-action="choose-hard"]').click();
    assert.equal(await resetChallenge.locator('[data-reset-feedback]').getAttribute('data-result'),'retry');
    await resetChallenge.locator('[data-reset-action="choose-unstage"]').click();
    assert.equal(await resetChallenge.locator('[data-reset-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    const navLinks=await page.locator('.reader-nav a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
    assert.equal(navLinks.length,21);assert(navLinks[20].includes('git-junior-project'));assert(navLinks[15].includes('git-team-review'));assert(navLinks[16].includes('git-restore-reset-lab'));assert(navLinks[17].includes('git-revert-lab'));assert(navLinks[19].includes('git-repository-security'));
    await page.goto(base+'#/lesson/git-revert-lab/junior');
    const revertChoice=page.locator('.reader > .prose > [data-teach="git-revert-choice"]');
    await revertChoice.locator('[data-reset-action="bad-head"]').click();
    assert.equal(await revertChoice.locator('[data-reset-feedback]').getAttribute('data-result'),'retry');
    await revertChoice.locator('[data-reset-action="good"]').click();
    assert.equal(await revertChoice.locator('[data-reset-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-revert-lab/middle');
    const mainline=page.locator('.reader > .prose > [data-teach="git-revert-mainline"]');
    await mainline.locator('[data-reset-action="parent-2"]').click();
    assert((await mainline.locator('[data-reset-view]').textContent()).includes('guide.txt удаляется'));await checkWidth();
    await page.goto(base+'#/lesson/git-restore-reset-lab/middle');await page.locator('.reader > .prose > .teach-panel').first().waitFor();await checkWidth();
    await page.goto(base+'#/lesson/git-junior-project/junior');
    const capstone=page.locator('.reader > .prose > [data-teach="git-capstone-checklist"]');await capstone.waitFor();
    await capstone.locator('[data-capstone-task="0"]').check();assert((await capstone.locator('[data-capstone-progress]').textContent()).includes('1 / 6'));
    await capstone.locator('[data-capstone-task="0"]').uncheck();assert((await capstone.locator('[data-capstone-progress]').textContent()).includes('0 / 6'));
    const hint=page.locator('.reader > .prose > [data-teach="git-capstone-hints"] details').first();await hint.locator('summary').click();assert(await hint.locator('a').isVisible());
    const checkerLink=page.locator('.reader > .prose > [data-teach="git-capstone-checker"] a');assert.equal(await checkerLink.getAttribute('href'),'./exercises/check-git-junior.sh');
    await checkWidth();
    await page.goto(base+'#/lesson/git-junior-project/middle');await page.locator('.reader > .prose > [data-teach="git-capstone-defense"]').waitFor();await checkWidth();
    await page.goto(base+'#/lesson/git-objects/middle');
    const inspector=page.locator('.reader > .prose > [data-teach="git-object-inspector"]');await inspector.waitFor();
    await inspector.locator('[data-object-action="node-blob"]').click();
    assert((await inspector.locator('[data-object-feedback]').textContent()).includes('двумя путями'));
    const snapshot=page.locator('.reader > .prose > [data-teach="git-object-snapshot"]');await snapshot.locator('[data-object-action="snapshot-empty"]').click();
    assert((await snapshot.locator('[data-object-view]').textContent()).includes('R → R'));await checkWidth();
    await page.goto(base+'#/lesson/git-object-bytes/middle');
    const byteHash=page.locator('.reader > .prose > [data-teach="git-byte-hash"]');
    await byteHash.locator('[data-object-oid][data-oid="ef8830e002dfd923433910fc79ea39aad9f92067"]').waitFor();
    await byteHash.locator('[data-object-text]').fill('кот');
    await byteHash.locator('[data-object-oid][data-oid="580fca29dba2afc77ec4d0f721d75b7d584d3822"]').waitFor();
    await byteHash.locator('[data-object-hash]').selectOption('SHA-256');
    await byteHash.locator('[data-object-oid][data-oid="5a2c8265e6c719d8a2a5057ed1c48d3586d0cc847de93d851d59639c45ef7cb6"]').waitFor();await checkWidth();
    await page.goto(base+'#/lesson/git-ref-model/middle');
    const refStates=page.locator('.reader > .prose > [data-teach="git-ref-states"]');await refStates.locator('[data-object-action="ref-detached"]').click();
    assert((await refStates.locator('[data-object-feedback]').textContent()).includes('main всё ещё B'));
    const cas=page.locator('.reader > .prose > [data-teach="git-ref-cas"]');
    for(const action of ['read1','read2','write1','write2'])await cas.locator('[data-object-action="'+action+'"]').click();
    assert((await cas.locator('[data-object-feedback]').textContent()).includes('Отказ'));
    assert.equal(await cas.locator('[data-object-view] .teach-file.head .teach-file-content').textContent(),'B');
    for(const action of ['read2','write2'])await cas.locator('[data-object-action="'+action+'"]').click();
    assert.equal(await cas.locator('[data-object-view] .teach-file.head .teach-file-content').textContent(),'C');await checkWidth();
    await page.goto(base+'#/lesson/git-index-format/middle');
    const indexLayout=page.locator('.reader > .prose > [data-teach="git-index-layout"]');await indexLayout.waitFor();
    await indexLayout.locator('[data-index-action="field-5"]').click();assert((await indexLayout.locator('[data-index-feedback]').textContent()).includes('SHA-1'));
    const alternate=page.locator('.reader > .prose > [data-teach="git-index-alternate"]');await alternate.locator('[data-index-action="alt-other"]').click();
    assert((await alternate.locator('[data-index-view]').textContent()).includes('blob third'));await checkWidth();
    await page.goto(base+'#/lesson/git-conflict-index-lab/middle');
    const stages=page.locator('.reader > .prose > [data-teach="git-stage-cases"]');await stages.locator('[data-index-action="case-add"]').click();
    assert((await stages.locator('[data-index-view] .teach-file.head').textContent()).includes('Нет записи'));
    await stages.locator('[data-index-action="case-delete"]').click();assert((await stages.locator('[data-index-view] .teach-file.work').textContent()).includes('Нет записи'));
    const stageResolve=page.locator('.reader > .prose > [data-teach="git-stage-resolution"]');
    for(const a of ['edit','tree','check'])await stageResolve.locator('[data-index-action="'+a+'"]').click();assert.equal(await stageResolve.locator('[data-index-feedback]').getAttribute('data-result'),'retry');
    for(const a of ['test','add','tree','check'])await stageResolve.locator('[data-index-action="'+a+'"]').click();assert.equal(await stageResolve.locator('[data-index-feedback]').getAttribute('data-result'),'correct');await checkWidth();
    await page.goto(base+'#/lesson/git-revision-ranges/middle');
    const ranges=page.locator('.reader > .prose > [data-teach="git-revision-sets"]');await ranges.locator('[data-index-action="range-sym"]').click();assert((await ranges.locator('[data-index-feedback]').textContent()).includes('{C, D, E, F}'));
    await ranges.locator('[data-index-action="range-md"]').click();assert((await ranges.locator('[data-index-feedback]').textContent()).includes('{C, D, M}'));
    const revisionDiff=page.locator('.reader > .prose > [data-teach="git-revision-diff"]');await revisionDiff.locator('[data-index-action="diff-reverse"]').click();assert((await revisionDiff.locator('[data-index-feedback]').textContent()).includes('дерево B с деревом D'));
    const revisionParents=page.locator('.reader > .prose > [data-teach="git-revision-parents"]');await revisionParents.locator('[data-index-action="rev-chain"]').click();assert((await revisionParents.locator('[data-index-feedback]').textContent()).includes('M → F → E'));await checkWidth();
    await page.goto(base+'#/lesson/git-rebase-lab/middle');
    const onto=page.locator('.reader > .prose > [data-teach="git-rebase-onto"]');await onto.waitFor();
    await onto.locator('[data-rewrite-action="graph-ordinary"]').click();assert((await onto.locator('[data-rewrite-feedback]').textContent()).includes('D, T1 и T2'));
    await onto.locator('[data-rewrite-action="graph-onto"]').click();assert((await onto.locator('[data-rewrite-feedback]').textContent()).includes('только T1 и T2'));
    const rebaseContext=page.locator('.reader > .prose > [data-teach="git-rebase-conflict"]');
    await rebaseContext.locator('[data-rewrite-action="context-rebase"]').click();assert((await rebaseContext.locator('[data-rewrite-feedback]').textContent()).includes('строящаяся история'));await checkWidth();
    await page.goto(base+'#/lesson/git-interactive-rebase/middle');
    const todo=page.locator('.reader > .prose > [data-teach="git-todo-workbench"]');
    await todo.locator('[data-rewrite-action="check-todo"]').click();assert.equal(await todo.locator('[data-rewrite-feedback]').getAttribute('data-result'),'retry');
    await todo.locator('[data-rewrite-action="up-2"]').click();await todo.locator('[data-todo-select="1"]').selectOption('fixup');
    await todo.locator('[data-rewrite-action="check-todo"]').click();assert.equal(await todo.locator('[data-rewrite-feedback]').getAttribute('data-result'),'correct');
    const checkpoints=page.locator('.reader > .prose > [data-teach="git-todo-checkpoints"]');await checkpoints.locator('[data-rewrite-action="series-clean"]').click();
    assert((await checkpoints.locator('[data-rewrite-feedback]').textContent()).includes('каждый промежуточный'));await checkWidth();
    await page.goto(base+'#/lesson/git-cherry-pick-lab/middle');
    const pickScope=page.locator('.reader > .prose > [data-teach="git-pick-scope"]');await pickScope.locator('[data-rewrite-action="scope-stage"]').click();assert((await pickScope.locator('[data-rewrite-feedback]').textContent()).includes('HEAD ещё не переместился'));
    const pickDependency=page.locator('.reader > .prose > [data-teach="git-pick-dependency"]');
    await pickDependency.locator('[data-rewrite-action="dep-alone"]').click();assert((await pickDependency.locator('[data-rewrite-view]').textContent()).includes('FAIL'));
    await pickDependency.locator('[data-rewrite-action="dep-adapt"]').click();assert((await pickDependency.locator('[data-rewrite-view]').textContent()).includes('PASS'));await checkWidth();
    {
    await page.goto(base+'#/lesson/git-bisect-lab/middle');
    const search=page.locator('.reader > .prose > [data-teach="git-bisect-search"]');await search.waitFor();
    for(let i=0;i<3;i++)await search.locator('[data-diag-action="test"]').click();
    assert((await search.locator('[data-diag-feedback]').textContent()).includes('Первая плохая версия: 5'));
    await search.locator('[data-diag-action="reset"]').click();
    for(let i=0;i<6;i++)await search.locator('[data-diag-action="skip"]').click();
    assert((await search.locator('[data-diag-feedback]').textContent()).includes('Неоднозначность'));await checkWidth();
    await page.goto(base+'#/lesson/git-refspec-lab/middle');
    const filter=page.locator('.reader > .prose > [data-teach="git-refspec-filter"]');await filter.locator('[data-diag-action="map-exclude"]').click();
    assert((await filter.locator('[data-diag-feedback]').textContent()).includes('1 / 4'));
    const prune=page.locator('.reader > .prose > [data-teach="git-refspec-prune"]');await prune.locator('[data-diag-action="prune-after"]').click();
    assert((await prune.locator('[data-diag-feedback]').textContent()).includes('локальная ветка осталась'));await checkWidth();
    await page.goto(base+'#/lesson/git-push-lease/middle');
    const lease=page.locator('.reader > .prose > [data-teach="git-lease-background"]');
    for(const a of ['peer','fetch','explicit'])await lease.locator('[data-diag-action="'+a+'"]').click();
    assert((await lease.locator('[data-diag-feedback]').textContent()).includes('Отказ: ожидался A'));
    await lease.locator('[data-diag-action="implicit"]').click();assert((await lease.locator('[data-diag-feedback]').textContent()).includes('ожидание совпало'));
    assert.equal(await lease.locator('[data-diag-view] .teach-file.head .teach-file-content').textContent(),'B');await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-tags-mirror/middle');
    const publish=page.locator('.reader > .prose > [data-teach="git-tag-publish"]');await publish.waitFor();
    await publish.locator('[data-release-action="tag-follow"]').click();assert((await publish.locator('[data-release-feedback]').textContent()).includes('Выбранные метки: v1.'));
    await publish.locator('[data-release-action="tag-all"]').click();assert((await publish.locator('[data-release-feedback]').textContent()).includes('v1, light, v2'));
    const mirror=page.locator('.reader > .prose > [data-teach="git-mirror-plan"]');
    await mirror.locator('[data-release-action="preview"]').click();assert((await mirror.locator('[data-release-view] .teach-file.index').textContent()).includes('extra'));
    await mirror.locator('[data-release-action="sync"]').click();assert(!(await mirror.locator('[data-release-view] .teach-file.index').textContent()).includes('extra'));await checkWidth();
    await page.goto(base+'#/lesson/git-hooks-lab/middle');
    const hook=page.locator('.reader > .prose > [data-teach="git-hook-index"]');
    await hook.locator('[data-release-action="commit"]').click();assert((await hook.locator('[data-release-feedback]').textContent()).includes('Отказ'));
    await hook.locator('[data-release-action="add"]').click();await hook.locator('[data-release-action="commit"]').click();assert((await hook.locator('[data-release-feedback]').textContent()).includes('Commit B'));
    const request=page.locator('.reader > .prose > [data-teach="git-hook-request"]');await request.locator('[data-release-action="request-both"]').click();assert((await request.locator('[data-release-feedback]').textContent()).includes('весь запрос отклонён'));await checkWidth();
    await page.goto(base+'#/lesson/git-signatures-lab/middle');
    const trust=page.locator('.reader > .prose > [data-teach="git-signature-trust"]');await trust.locator('[data-release-action="trust-revoked"]').click();assert((await trust.locator('[data-release-view]').textContent()).includes('Не принимает'));
    const rewrite=page.locator('.reader > .prose > [data-teach="git-signature-rewrite"]');await rewrite.locator('[data-release-action="rewrite-signed"]').click();assert((await rewrite.locator('[data-release-view]').textContent()).includes('C · прежний объект'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-dependencies-lab/middle');
    const pin=page.locator('.reader > .prose > [data-teach="git-dependency-pin"]');await pin.waitFor();
    await pin.locator('[data-dep-action="switch"]').click();assert.equal(await pin.locator('[data-dep-view] .teach-file.index .teach-file-content').textContent(),'L1');
    for(const a of ['edit','add','commit'])await pin.locator('[data-dep-action="'+a+'"]').click();
    assert.equal(await pin.locator('[data-dep-view] .teach-file.head .teach-file-content').textContent(),'L2');
    assert((await pin.locator('[data-dep-feedback]').textContent()).includes('незакоммиченные байты'));
    const available=page.locator('.reader > .prose > [data-teach="git-dependency-availability"]');
    await available.locator('[data-dep-action="checkout"]').click();assert((await available.locator('[data-dep-feedback]').textContent()).includes('FAIL'));
    await available.locator('[data-dep-action="publish"]').click();await available.locator('[data-dep-action="checkout"]').click();assert((await available.locator('[data-dep-feedback]').textContent()).includes('PASS'));await checkWidth();
    await page.goto(base+'#/lesson/git-attributes-lab/middle');
    const eol=page.locator('.reader > .prose > [data-teach="git-attribute-eol"]');
    await eol.locator('[data-dep-action="eol-crlf"]').click();assert.equal(await eol.locator('[data-dep-view] .teach-file.head .teach-file-content').textContent(),'6f 6e 65 0a');
    await eol.locator('[data-dep-action="eol-binary"]').click();assert.equal(await eol.locator('[data-dep-view] .teach-file.head .teach-file-content').textContent(),'6f 6e 65 0d 0a');
    const norm=page.locator('.reader > .prose > [data-teach="git-attribute-renormalize"]');
    await norm.locator('[data-dep-action="rule"]').click();await norm.locator('[data-dep-action="renorm"]').click();
    assert.equal(await norm.locator('[data-dep-view] .teach-file.head .teach-file-content').textContent(),'CRLF');assert.equal(await norm.locator('[data-dep-view] .teach-file.index .teach-file-content').textContent(),'LF');
    await norm.locator('[data-dep-action="commit"]').click();assert.equal(await norm.locator('[data-dep-view] .teach-file.head .teach-file-content').textContent(),'LF');
    const filter=page.locator('.reader > .prose > [data-teach="git-attribute-filter"]');await filter.locator('[data-dep-action="filter-fail"]').click();assert((await filter.locator('[data-dep-feedback]').textContent()).includes('add отказал'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-middle-project/middle');
    const pro=page.locator('.reader > .prose > [data-teach="git-pro-checklist"]');await pro.waitFor();
    await pro.locator('[data-pro-task="0"]').check();
    assert((await pro.locator('[data-pro-progress]').textContent()).includes('1 / 7'));
    await pro.locator('[data-pro-task="0"]').uncheck();
    assert((await pro.locator('[data-pro-progress]').textContent()).includes('0 / 7'));
    const proHint=page.locator('.reader > .prose > [data-teach="git-pro-hints"] details').first();await proHint.locator('summary').click();assert(await proHint.locator('a').isVisible());
    const proLink=page.locator('.reader > .prose > [data-teach="git-pro-checker"] a');
    assert.equal(await proLink.getAttribute('href'),'./exercises/check-git-middle.sh');
    const proNav=await page.locator('.reader-nav a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
    assert(proNav.at(-1).includes('git-middle-project'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-revisions/middle');
    const reviewNav=await page.locator('.reader-nav a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
    assert.equal(reviewNav.length,43);assert(reviewNav[20].includes('git-junior-project'));assert(reviewNav[21].includes('git-objects'));assert(reviewNav[42].includes('git-middle-project'));
    const selector=page.locator('.reader > .prose > [data-teach="git-selector-types"]');await selector.waitFor();
    await selector.locator('[data-review-action="select-index"]').click();assert((await selector.locator('[data-review-view]').textContent()).includes('Blob: staged'));
    const pathspec=page.locator('.reader > .prose > [data-teach="git-selector-paths"]');await pathspec.locator('[data-review-action="path-literal"]').click();assert((await pathspec.locator('[data-review-feedback]').textContent()).includes('1 / 5'));
    await pathspec.locator('[data-review-action="path-recursive"]').click();assert((await pathspec.locator('[data-review-feedback]').textContent()).includes('5 / 5'));await checkWidth();
    await page.goto(base+'#/lesson/git-recovery/middle');
    const incident=page.locator('.reader > .prose > [data-teach="git-incident-reach"]');
    await incident.locator('[data-review-action="rescue"]').click();assert((await incident.locator('[data-review-feedback]').textContent()).includes('Сначала проверьте'));
    await incident.locator('[data-review-action="inspect"]').click();await incident.locator('[data-review-action="rescue"]').click();
    assert.equal(await incident.locator('[data-review-view] .teach-file.index .teach-file-content').textContent(),'C');
    const integrity=page.locator('.reader > .prose > [data-teach="git-incident-integrity"]');await integrity.locator('[data-review-action="integrity-missing"]').click();assert((await integrity.locator('[data-review-feedback]').textContent()).includes('ошибка связности'));await checkWidth();
    await page.goto(base+'#/lesson/git-command-atlas/middle');
    const choice=page.locator('.reader > .prose > [data-teach="git-atlas-choice"]');
    await choice.locator('[data-review-action="choose-1"]').click();assert.equal(await choice.locator('[data-review-feedback]').getAttribute('data-result'),'retry');
    for(const [i,answer] of [0,1,2,0,1].entries()){
      if(i>0)await choice.locator('[data-review-action="next"]').click();
      await choice.locator('[data-review-action="choose-'+answer+'"]').click();assert.equal(await choice.locator('[data-review-feedback]').getAttribute('data-result'),'correct');
    }
    assert((await choice.locator('[data-review-progress]').textContent()).includes('решено 5 / 5'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-pack-storage/senior');
    const delta=page.locator('.reader > .prose > [data-teach="git-pack-delta"]');await delta.waitFor();
    await delta.locator('[data-storage-action="insert"]').click();assert((await delta.locator('[data-storage-feedback]').textContent()).includes('Следуйте порядку'));
    await delta.locator('[data-storage-action="copy"]').click();await delta.locator('[data-storage-action="insert"]').click();assert((await delta.locator('[data-storage-feedback]').textContent()).includes('Результат восстановлен'));
    const fan=page.locator('.reader > .prose > [data-teach="git-pack-fanout"]');await fan.locator('[data-storage-action="fan-18"]').click();assert((await fan.locator('[data-storage-feedback]').textContent()).includes('[1, 3)'));
    await fan.locator('[data-storage-action="fan-19"]').click();assert((await fan.locator('[data-storage-feedback]').textContent()).includes('совпадений: 0'));await checkWidth();
    await page.goto(base+'#/lesson/git-plumbing-commit/senior');
    const build=page.locator('.reader > .prose > [data-teach="git-plumb-build"]');
    await build.locator('[data-storage-action="publish"]').click();assert((await build.locator('[data-storage-feedback]').textContent()).includes('предыдущую стадию'));
    for(const a of ['blob','index','tree','commit','publish'])await build.locator('[data-storage-action="'+a+'"]').click();
    assert((await build.locator('[data-storage-feedback]').textContent()).includes('Main остаётся A'));
    const txn=page.locator('.reader > .prose > [data-teach="git-plumb-transaction"]');
    for(const a of ['peer','prepare'])await txn.locator('[data-storage-action="'+a+'"]').click();
    assert((await txn.locator('[data-storage-feedback]').textContent()).includes('Prepare отказал'));
    assert.equal(await txn.locator('.teach-file.head .teach-file-content').textContent(),'A');
    for(const a of ['inspect','prepare','commit'])await txn.locator('[data-storage-action="'+a+'"]').click();
    assert((await txn.locator('[data-storage-feedback]').textContent()).includes('Обе ссылки теперь C'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-rerere-lab/senior');
    const rr=page.locator('.reader > .prose > [data-teach="git-rerere-policy"]');await rr.waitFor();
    await rr.locator('[data-wt-action="test"]').click();assert((await rr.locator('[data-wt-feedback]').textContent()).includes('FAIL'));
    for(const a of ['forget','edit','record','test','add','commit'])await rr.locator('[data-wt-action="'+a+'"]').click();
    assert((await rr.locator('[data-wt-feedback]').textContent()).includes('Merge завершён'));
    const rrMode=page.locator('.reader > .prose > [data-teach="git-rerere-stages"]');await rrMode.locator('[data-wt-action="mode-on"]').click();
    assert((await rrMode.locator('[data-wt-feedback]').textContent()).includes('MERGE_HEAD'));await checkWidth();
    await page.goto(base+'#/lesson/git-worktree-lab/senior');
    const wt=page.locator('.reader > .prose > [data-teach="git-worktree-state"]');await wt.waitFor();
    for(const a of ['stage-main','edit-hot','stage-hot','commit-hot'])await wt.locator('[data-wt-action="'+a+'"]').click();
    assert((await wt.locator('.teach-file.head .teach-file-content').textContent()).includes('Index staged'));
    assert.equal(await wt.locator('.teach-file.index .teach-file-content').textContent(),'B');
    const life=page.locator('.reader > .prose > [data-teach="git-worktree-lifecycle"]');
    for(const a of ['lock','remove'])await life.locator('[data-wt-action="'+a+'"]').click();
    assert((await life.locator('[data-wt-feedback]').textContent()).includes('заблокировано'));
    for(const a of ['unlock','edit','remove'])await life.locator('[data-wt-action="'+a+'"]').click();
    assert((await life.locator('[data-wt-feedback]').textContent()).includes('незакоммиченные'));
    for(const a of ['commit','remove'])await life.locator('[data-wt-action="'+a+'"]').click();
    assert((await life.locator('[data-wt-feedback]').textContent()).includes('ветка experiment'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-transport-v2/senior');
    const pkt=page.locator('.reader > .prose > [data-teach="git-wire-pkt"]');await pkt.waitFor();
    await pkt.locator('[data-wire-action="pkt-utf"]').click();assert.equal(await pkt.locator('.teach-file.index .teach-file-content').textContent(),'0007');
    await pkt.locator('[data-wire-action="pkt-empty"]').click();assert.equal(await pkt.locator('.teach-file.index .teach-file-content').textContent(),'0004');
    await pkt.locator('[data-wire-action="pkt-flush"]').click();assert((await pkt.locator('[data-wire-view]').textContent()).includes('0000'));
    const wire=page.locator('.reader > .prose > [data-teach="git-wire-negotiate"]');
    for(const a of ['want','have','pack','ref'])await wire.locator('[data-wire-action="'+a+'"]').click();
    assert((await wire.locator('[data-wire-feedback]').textContent()).includes('HEAD остаётся B'));await checkWidth();
    await page.goto(base+'#/lesson/git-shallow-partial/senior');
    const depth=page.locator('.reader > .prose > [data-teach="git-clone-depth"]');await depth.waitFor();
    await depth.locator('[data-wire-action="depth-3"]').click();assert((await depth.locator('[data-wire-feedback]').textContent()).includes('A4'));
    const clone=page.locator('.reader > .prose > [data-teach="git-clone-lazy"]');
    for(const a of ['filter','sparse','offline','read'])await clone.locator('[data-wire-action="'+a+'"]').click();
    assert((await clone.locator('[data-wire-feedback]').textContent()).includes('FAIL'));
    for(const a of ['offline','read'])await clone.locator('[data-wire-action="'+a+'"]').click();
    assert((await clone.locator('[data-wire-feedback]').textContent()).includes('PASS'));
    assert((await clone.locator('.teach-file.work .teach-file-content').textContent()).includes('app + корневые'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-maintenance-lab/senior');
    const structure=page.locator('.reader > .prose > [data-teach="git-maint-structures"]');await structure.waitFor();
    await structure.locator('[data-maint-action="struct-midx"]').click();assert((await structure.locator('[data-maint-view]').textContent()).includes('OID → pack + offset'));
    const bits=page.locator('.reader > .prose > [data-teach="git-maint-bitmap"]');
    await bits.locator('[data-maint-action="bits-union"]').click();assert.equal(await bits.locator('.maint-bits .on').count(),8);
    await bits.locator('[data-maint-action="bits-intersection"]').click();assert.equal(await bits.locator('.maint-bits .on').count(),4);
    await bits.locator('[data-maint-action="bits-difference"]').click();assert.equal(await bits.locator('.maint-bits .on').count(),2);
    const measure=page.locator('.reader > .prose > [data-teach="git-maint-measure"]');
    await measure.locator('[data-maint-action="measure-repeat"]').click();assert((await measure.locator('[data-maint-feedback]').textContent()).includes('Медианы равны'));
    const ret=page.locator('.reader > .prose > [data-teach="git-maint-retention"]');
    await ret.locator('[data-maint-action="maintain"]').click();assert((await ret.locator('[data-maint-feedback]').textContent()).includes('Сначала проверьте'));
    for(const a of ['inspect','rescue','backup','maintain'])await ret.locator('[data-maint-action="'+a+'"]').click();
    assert((await ret.locator('[data-maint-feedback]').textContent()).includes('refs и снимки совпадают'));await checkWidth();
    }
    {
    await page.goto(base+'#/lesson/git-senior-project/senior');
    const enterprise=page.locator('.reader > .prose > [data-teach="git-enterprise-checklist"]');await enterprise.waitFor();
    await enterprise.locator('[data-enterprise-task="0"]').check();
    assert((await enterprise.locator('[data-enterprise-progress]').textContent()).includes('1 / 7'));
    await enterprise.locator('[data-enterprise-task="0"]').uncheck();
    assert((await enterprise.locator('[data-enterprise-progress]').textContent()).includes('0 / 7'));
    const enterpriseHint=page.locator('.reader > .prose > [data-teach="git-enterprise-hints"] details').first();
    await enterpriseHint.locator('summary').click();assert(await enterpriseHint.locator('a').isVisible());
    const enterpriseLink=page.locator('.reader > .prose > [data-teach="git-enterprise-checker"] a');
    assert.equal(await enterpriseLink.getAttribute('href'),'./exercises/check-git-senior.sh');
    const enterpriseNav=await page.locator('.reader-nav a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
    assert.equal(enterpriseNav.length,51);assert(enterpriseNav[42].includes('git-middle-project'));assert(enterpriseNav[50].includes('git-senior-project'));await checkWidth();
    }
    await page.goto(base+'#/lesson/git-index/junior');
    const walkthrough=page.locator('[data-teach="git-walkthrough"]');
    await walkthrough.waitFor();
    for(let i=0;i<3;i++)await walkthrough.locator('[data-teach-action="next"]').click();
    assert.equal(await walkthrough.locator('[data-teach-status]').textContent(),'MM note.txt');
    await walkthrough.locator('[data-teach-action="next"]').click();
    assert.equal(await walkthrough.locator('[data-teach-status]').textContent(),' M note.txt');
    assert((await walkthrough.locator('.teach-file.work').textContent()).includes('TODO'));
    assert(!(await walkthrough.locator('.teach-file.head').textContent()).includes('TODO'));
    const diff=page.locator('[data-teach="git-diff-view"]');
    await diff.locator('[data-teach-action="diff-1"]').click();
    assert((await diff.locator('[data-teach-diff]').textContent()).includes('Порт: 8080'));
    assert(!(await diff.locator('[data-teach-diff]').textContent()).includes('TODO'));
    const quiz=page.locator('[data-teach="git-question-diff"]');
    await quiz.locator('[data-teach-action="answer-0"]').click();
    assert.equal(await quiz.locator('[data-teach-feedback]').getAttribute('data-result'),'retry');
    await quiz.locator('[data-teach-action="answer-1"]').click();
    assert.equal(await quiz.locator('[data-teach-feedback]').getAttribute('data-result'),'correct');
    const challenge=page.locator('[data-teach="git-challenge"]');
    await challenge.locator('[data-teach-action="check"]').click();
    assert.equal(await challenge.locator('[data-teach-feedback]').getAttribute('data-result'),'retry');
    for(const action of ['port','add','todo','commit','check'])await challenge.locator('[data-teach-action="'+action+'"]').click();
    assert.equal(await challenge.locator('[data-teach-feedback]').getAttribute('data-result'),'correct');
    await checkWidth();
    await page.goto(base+'#/lesson/git-index/middle');
    await page.locator('[data-teach="git-undo-matrix"]').waitFor();await checkWidth();
    await page.goto(base+'#/lesson/git-index/junior');await page.locator('.atlas-lab').waitFor();await page.locator('[data-lab-action="edit"]').click();await page.locator('[data-lab-action="add"]').click();await page.locator('[data-lab-action="edit"]').click();await page.locator('[data-lab-action="commit"]').click();assert.equal(await page.locator('[data-git-head]').textContent(),'V1');assert.equal(await page.locator('[data-git-work]').textContent(),'V2');await checkWidth();
    await page.goto(base+'#/lesson/internet-cidr-lab/middle');await page.locator('[data-ip]').fill('192.0.2.130');await page.locator('[data-prefix]').fill('26');assert((await page.locator('[data-ip-results]').textContent()).includes('192.0.2.128/26'));await page.locator('[data-prefix]').fill('33');assert((await page.locator('[data-ip-results]').textContent()).includes('Ошибка'));await checkWidth();
    await page.goto(base+'#/lesson/internet-tcp/junior');await page.locator('[data-lab-action="next"]').click();await page.locator('[data-lab-action="drop"]').click();assert((await page.locator('[data-tcp-message]').textContent()).includes('потерян'));await page.locator('[data-lab-action="next"]').click();for(let i=0;i<6;i++)await page.locator('[data-lab-action="next"]').click();assert.equal(await page.locator('[data-tcp-client]').textContent(),'ESTABLISHED');assert((await page.locator('[data-tcp-message]').textContent()).includes('105'));await checkWidth();
    await page.goto(base+'#/articles');await page.locator('.article-card').first().waitFor();assert.equal(await page.locator('.article-card').count(),8);await checkWidth();await page.locator('.article-card[href="#/article/choose-database"]').click();await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('базу данных'));await checkWidth();
    await page.goto(base+'#/lesson/python-start/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('Python'));await checkWidth();
    await page.goto(base+'#/lesson/linux-network-admin/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).toLowerCase().includes('сеть'));await checkWidth();
    await page.goto(base+'#/lesson/linux-systemd/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('службу'));await checkWidth();
    await page.goto(base+'#/lesson/linux-scheduler/senior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('Планировщик'));await checkWidth();
    for(const id of ['linux-lvm-raid','linux-block-io']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    for(const id of ['linux-mmu','linux-mmap-cow','linux-io-uring']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    for(const id of ['linux-firmware','linux-initramfs']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/linux-boot/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('запускает Linux'));await checkWidth();
    for(const id of ['linux-netns','linux-netfilter','linux-seccomp-landlock']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/linux-security-basics/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('защитить'));await checkWidth();
    for(const id of ['linux-kbuild','linux-driver-model','linux-irq-dma','linux-futex-rcu']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/linux-upstream/senior');await page.locator('.reader h1').waitFor();await checkWidth();
    await page.goto(base+'#/lesson/linux-mmu/senior');await page.locator('[data-mmu-address]').fill('0x41234567');assert((await page.locator('[data-mmu-result]').textContent()).includes('0x567'));await page.locator('[data-mmu-address]').fill('bad!');assert((await page.locator('[data-mmu-result]').textContent()).includes('Ошибка'));await checkWidth();
    await page.goto(base+'#/lesson/linux-mmap-cow/middle');await page.locator('[data-lab-action="fork"]').click();await page.locator('[data-lab-action="write"]').click();assert.equal(await page.locator('[data-cow-parent]').textContent(),'A · 7');assert.equal(await page.locator('[data-cow-child]').textContent(),'B · 9');await checkWidth();
    await page.goto(base+'#/lesson/linux-service-dependencies/middle');await page.locator('[data-teach="linux-dep-ready"] .linux-visual-node').first().waitFor();await page.locator('[data-unit-after]').selectOption('1');assert((await page.locator('[data-unit-result]').textContent()).includes('только A'));await page.locator('[data-unit-wants]').selectOption('1');assert((await page.locator('[data-unit-result]').textContent()).includes('B → A'));await checkWidth();
    await page.goto(base+'#/lesson/linux-storage-lab/middle');await page.locator('.diagram-art svg').waitFor();await checkWidth();
    await page.goto(base+'#/lesson/linux-senior-project/senior');await page.locator('.reader h1').waitFor();await checkWidth();
    await page.goto(base+'#/reference');await page.locator('[data-reference-search]').fill('readelf');const refItem=page.locator('[data-ref-item]:visible').filter({hasText:'readelf'}).first();await refItem.locator('.ref-options summary').click();assert((await refItem.textContent()).includes('-lW'));await checkWidth();
    for(const id of ['linux-elf','linux-special-fs','linux-mount-overlay','linux-packet-diagnostics']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.reader h1').waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/linux-memory/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('Оперативная'));await checkWidth();
    await page.goto(base+'#/lesson/internet-tls');await page.locator('.reader h1').waitFor();await checkWidth();assert.equal(await theme(),changed);
    for(const id of ['git-lab-config','git-diff-status','git-commit-quality','git-history-reading']){await page.goto(base+'#/lesson/'+id+'/junior');await page.locator('.reader h1').waitFor();await checkWidth();await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.reader h1').waitFor();await checkWidth();}
    for(const [id,level] of [["git-object-bytes","middle"],["git-ref-model","middle"],["git-index-format","middle"],["git-pack-storage","senior"],["git-plumbing-commit","senior"]]){await page.goto(base+'#/lesson/'+id+'/'+level);await page.locator('.reader h1').waitFor();await checkWidth();}
    for(const [id,level] of [["git-branch-lab","junior"],["git-branch-lab","middle"],["git-merge-lab","junior"],["git-merge-lab","middle"],["git-conflict-index-lab","middle"],["git-rebase-lab","middle"],["git-interactive-rebase","middle"],["git-cherry-pick-lab","middle"],["git-rerere-lab","senior"]]){await page.goto(base+'#/lesson/'+id+'/'+level);await page.locator('.reader h1').waitFor();await checkWidth();}
    for(const [id,level] of [["git-restore-reset-lab","junior"],["git-restore-reset-lab","middle"],["git-revert-lab","junior"],["git-revert-lab","middle"],["git-stash-lab","junior"],["git-stash-lab","middle"],["git-reflog-recovery","middle"],["git-revision-ranges","middle"],["git-bisect-lab","middle"],["git-worktree-lab","senior"]]){await page.goto(base+'#/lesson/'+id+'/'+level);await page.locator('.reader h1').waitFor();await checkWidth();}
    for(const [id,level] of [["git-fetch-push-lab","junior"],["git-fetch-push-lab","middle"],["git-refspec-lab","middle"],["git-push-lease","middle"],["git-transport-v2","senior"],["git-shallow-partial","senior"],["git-tags-mirror","middle"]]){await page.goto(base+'#/lesson/'+id+'/'+level);await page.locator('.reader h1').waitFor();await checkWidth();}
    for(const [id,level] of [["git-hooks-lab","middle"],["git-signatures-lab","middle"],["git-dependencies-lab","middle"],["git-attributes-lab","middle"],["git-maintenance-lab","senior"],["git-repository-security","junior"],["git-repository-security","middle"],["git-team-review","junior"],["git-team-review","middle"]]){await page.goto(base+'#/lesson/'+id+'/'+level);await page.locator('.reader h1').waitFor();await checkWidth();}
    for(const [id,key] of [['git-diff-status','git-hunk-explainer'],['git-commit-quality','git-commit-grouping']]){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.reader > .prose > [data-teach="'+key+'"]').waitFor();await checkWidth();}
    {
    await page.goto(base+'#/lesson/linux-history/junior');
    const layer=page.locator('.reader > .prose > [data-teach="linux-layer-choice"]');await layer.waitFor();
    await layer.locator('[data-lin-action="layer-package"]').click();assert((await layer.locator('[data-lin-view]').textContent()).includes('пакетный менеджер'));
    await page.goto(base+'#/lesson/linux-lab-start/junior');
    const linuxPath=page.locator('.reader > .prose > [data-teach="linux-path-walk"]');
    await linuxPath.locator('[data-lin-action="www"]').click();assert((await linuxPath.locator('[data-lin-view]').textContent()).endsWith('/www'));
    await linuxPath.locator('[data-lin-action="logs"]').click();assert((await linuxPath.locator('[data-lin-feedback]').textContent()).includes('не найден'));
    await linuxPath.locator('[data-lin-action="parent"]').click();await linuxPath.locator('[data-lin-action="logs"]').click();assert((await linuxPath.locator('[data-lin-view]').textContent()).endsWith('/logs'));await checkWidth();
    await page.goto(base+'#/lesson/linux-shell/junior');
    const linuxArgv=page.locator('.reader > .prose > [data-teach="linux-shell-argv"]');
    await linuxArgv.locator('[data-lin-action="argv-split"]').click();assert.equal(await linuxArgv.locator('.linux-start-args .teach-file').count(),3);
    await linuxArgv.locator('[data-lin-action="argv-quoted"]').click();assert.equal(await linuxArgv.locator('.linux-start-args .teach-file').count(),2);
    const linuxPipe=page.locator('.reader > .prose > [data-teach="linux-shell-pipe"]');
    await linuxPipe.locator('[data-lin-action="uniq"]').click();assert((await linuxPipe.locator('[data-lin-feedback]').textContent()).includes('порядку'));
    for(const a of ['grep','sort','uniq'])await linuxPipe.locator('[data-lin-action="'+a+'"]').click();
    assert((await linuxPipe.locator('[data-lin-view]').textContent()).includes('2 ERROR timeout'));await checkWidth();
    await page.goto(base+'#/lesson/linux-shell/middle');
    const linuxStatus=page.locator('.reader > .prose > [data-teach="linux-shell-status"]');
    await linuxStatus.locator('[data-lin-action="status-on"]').click();assert.equal(await linuxStatus.locator('.teach-file.index .teach-file-content').textContent(),'1');
    const linuxStreams=page.locator('.reader > .prose > [data-teach="linux-shell-streams"]');
    await linuxStreams.locator('[data-lin-action="stream-reverse"]').click();assert.equal(await linuxStreams.locator('.teach-file.work .teach-file-content').textContent(),'Терминал');await checkWidth();
    }
        // Every Git reading edition, including previous-level navigation and sources.
    if((view.width===1440&&scheme==='light')||(view.width===360&&scheme==='dark')){
      const routes=await page.evaluate(()=>{const L=window.ATLAS_LEVELS,D=window.ATLAS_DATA;
        return [L.juniorOrder.git,L.middleOrder.git,L.seniorOrder.git].flatMap((order,n)=>order.map((id,i)=>({
          id,level:['junior','middle','senior'][n],title:n===0?L.junior[id].title:D.lessons.find(l=>l.id===id).title,
          markers:[...(n===0?L.junior[id].body:D.lessons.find(l=>l.id===id).body+(n===2&&L.advanced[id]?'\n\n'+L.advanced[id]:'')).matchAll(/^:::learn ([a-z0-9-]+)$/gm)].map(m=>m[1]),
          prev:order[i-1]||null,next:order[i+1]||null,count:order.length
        })));});
      assert.equal(routes.length,115);
      for(const r of routes){
        await page.goto(base+'#/lesson/'+r.id+'/'+r.level);
        await page.locator('.reader h1').waitFor();
        assert.equal(await page.locator('.reader h1').textContent(),r.title,r.id+' '+r.level);
        assert.deepEqual(await page.locator('.reader > .prose > [data-teach]').evaluateAll(nodes=>nodes.map(n=>n.dataset.teach)),r.markers,r.id+' markers');
        assert.equal(await page.locator('.reader-nav a').count(),r.count);
        assert.equal(await page.locator('.reader-nav a.current').getAttribute('href'),'#/lesson/'+r.id+'/'+r.level);
        const foot=await page.locator('.reader-foot a').evaluateAll(links=>links.map(a=>a.getAttribute('href')));
        if(r.prev)assert(foot.includes('#/lesson/'+r.prev+'/'+r.level),r.id+' previous');
        if(r.next)assert(foot.includes('#/lesson/'+r.next+'/'+r.level),r.id+' next');
        else assert(foot.includes('#/course/git/'+r.level),r.id+' course');
        assert(await page.locator('.source-section a').count()>0,r.id+' sources');
        assert.equal(await page.locator('[data-complete]').count(),1,r.id+' progress');
        const linkTargets=await page.locator('.reader > .prose [href^="./exercises/"]').evaluateAll(links=>links.map(a=>a.href));
        for(const target of linkTargets)assert((await page.request.get(target)).ok(),target);
        await checkWidth();
      }
      await page.goto(base+'#/lesson/git-merge/senior');
      const criss=page.locator('.reader > .prose > [data-teach="git-audit-base-question"]');await criss.waitFor();
      await criss.locator('[data-audit-answer="a"]').click();assert.equal(await criss.locator('[data-audit-feedback]').getAttribute('data-result'),'retry');
      await criss.locator('[data-audit-answer="bc"]').click();assert.equal(await criss.locator('[data-audit-feedback]').getAttribute('data-result'),'correct');
      await page.locator('.base-reading summary').click();assert(await page.locator('.base-reading a[href="#/course/git/junior"]').isVisible());await checkWidth();
      console.log('PASS: all 115 Git editions in '+view.width+' '+scheme);
    }
    for(const [id,key,needle] of [['linux-vfs','linux-vfs-life','inode B'],['linux-search-text','linux-text-fields','timeout 2'],['linux-bash-scripts','linux-script-flow','exit 0']]) {
      for(const level of ['junior','middle']) {
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="3"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        await checkWidth();
      }
    }
    await page.goto(base+'#/lesson/linux-vfs/junior');
    const vfsQuiz=page.locator('.reader > .prose > [data-teach="linux-vfs-check"]');
    await vfsQuiz.locator('[data-linux-next="0"]').click();
    assert.equal(await vfsQuiz.locator('[data-linux-next-feedback]').getAttribute('data-result'),'retry');
    await vfsQuiz.locator('[data-linux-next="1"]').click();
    assert.equal(await vfsQuiz.locator('[data-linux-next-feedback]').getAttribute('data-result'),'correct');
    for(const [id,key,choice,needle] of [['linux-permissions','linux-access-mode',1,'Группа: чтение'],['linux-accounts','linux-user-session',1,'Старый процесс'],['linux-processes','linux-proc-life',2,'PID 101']]){
      for(const level of ['junior','middle']){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        await checkWidth();
      }
    }
    for(const [id,key,choice,needle] of [['linux-network-admin','linux-net-socket',3,'404'],['linux-signals','linux-signal-flow',3,'exit 0'],['linux-monitoring','linux-monitor-symptom',2,'Available']]){
      for(const level of ['junior','middle']){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        await checkWidth();
      }
    }
    for(const [id,key,choice,needle] of [['linux-systemd','linux-unit-state',0,'HTTP'],['linux-journal','linux-log-chain',2,'exit=2'],['linux-timers','linux-timer-flow',3,'exit 2']]){
      for(const level of ['junior','middle']){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        await checkWidth();
      }
    }
    for(const [id,key,choice,needle] of [['linux-disks','linux-disk-stack',3,'/data/atlas'],['linux-packages','linux-pkg-graph',1,'bash'],['linux-security-basics','linux-sec-boundary',2,'127.0.0.1']]){
      for(const level of ['junior','middle']){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        assert.equal(await panel.locator('.linux-visual-node[aria-current="step"]').count(),1);
        assert.equal(await panel.locator('.linux-visual-node').count(),4);
        await checkWidth();
      }
    }
    for(const [id,key,choice,needle,levels] of [['linux-boot','linux-boot-chain',3,'PID 1',['junior','middle']],['linux-memory','linux-mem-map',1,'MMU',['junior','middle']],['linux-service-dependencies','linux-dep-ready',2,'Type=notify',['middle']]]){
      for(const level of levels){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        assert.equal(await panel.locator('.linux-visual-node[aria-current="step"]').count(),1);
        await checkWidth();
      }
    }
    for(const [id,key,level,choice,needle] of [['linux-recovery','linux-recover-flow','middle',2,'Сравнение'],['linux-cli-atlas','linux-cli-question','middle',3,'curl'],['linux-capstone','linux-final-contract','junior',2,'Независимая копия']]){
      await page.goto(base+'#/lesson/'+id+'/'+level);
      const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
      await panel.locator('[data-linux-next="'+choice+'"]').click();
      assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
      await checkWidth();
    }
    for(const [id,key,choice,needle] of [['linux-package-trust','linux-trust-chain',2,'Хеш'],['linux-ssh-admin','linux-ssh-identities',1,'Host key']]){
      for(const level of ['junior','middle']){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        assert.equal(await panel.locator('.linux-visual-node[aria-current="step"]').count(),1);
        await checkWidth();
      }
    }
    for(const [id,key,choice,needle] of [['linux-elf','linux-elf-chain',2,'PT_INTERP'],['linux-syscalls','linux-syscall-chain',3,'errno'],['linux-ipc','linux-ipc-pipe',3,'EOF']]){
      for(const level of ['middle','senior']){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        assert.equal(await panel.locator('.linux-visual-node[aria-current="step"]').count(),1);
        await checkWidth();
      }
    }
    for(const [id,key,choice,needle] of [['linux-special-fs','linux-special-map',1,'Атрибуты'],['linux-ext4','linux-ext4-layout',2,'Диапазон'],['linux-cow-filesystems','linux-cow-snapshot',3,'A:0']]){
      for(const level of ['middle','senior']){
        await page.goto(base+'#/lesson/'+id+'/'+level);
        const panel=page.locator('.reader > .prose > [data-teach="'+key+'"]');
        await panel.locator('[data-linux-next="'+choice+'"]').click();
        assert((await panel.locator('[data-linux-next-view]').textContent()).includes(needle));
        assert.equal(await panel.locator('.linux-visual-node[aria-current="step"]').count(),1);
        await checkWidth();
      }
    }
    // Exhaustive Linux lesson navigation in one desktop context; other views
    // still exercise all course routes and representative lessons.
    if(view.width===1440&&scheme==='light'){
      const routes=await page.evaluate(()=>{const L=window.ATLAS_LEVELS,D=window.ATLAS_DATA;return ['junior','middle','senior'].flatMap((level,n)=>L.order.linux.filter(id=>L.minimum[id]<=n).map(id=>({id,level,title:n===0?L.junior[id].title:D.lessons.find(l=>l.id===id).title})));});
      assert.equal(routes.length,133);
      for(const r of routes){
        await page.goto(base+'#/lesson/'+r.id+'/'+r.level);
        await page.locator('.reader h1').waitFor();
        assert.equal(await page.locator('.reader h1').textContent(),r.title,r.id+' '+r.level);
        assert.equal(await page.locator('.source-section a').first().count(),1,r.id+' source');
        assert.equal(await page.locator('[data-complete]').count(),1,r.id+' progress');
        await checkWidth();
      }
      console.log('PASS: all 133 Linux Junior/Middle/Senior lesson routes');
    }
    assert.deepEqual(errors,[],'Browser exceptions');console.log('PASS',view.width,scheme);
    await ctx.close();
   }
  }
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
