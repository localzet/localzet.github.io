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
    await page.goto(base+'#/lesson/git-merge/senior');await page.getByRole('heading',{name:'Углубление: три стадии индекса при конфликте'}).waitFor();
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
    await page.goto(base+'#/lesson/linux-network-admin/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('сеть'));await checkWidth();
    await page.goto(base+'#/lesson/linux-systemd/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('службами'));await checkWidth();
    await page.goto(base+'#/lesson/linux-scheduler/senior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('Планировщик'));await checkWidth();
    for(const id of ['linux-ext4','linux-cow-filesystems','linux-lvm-raid','linux-block-io']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    for(const id of ['linux-mmu','linux-mmap-cow','linux-syscalls','linux-io-uring']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    for(const id of ['linux-firmware','linux-initramfs','linux-service-dependencies']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/linux-boot/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('запускает Linux'));await checkWidth();
    for(const id of ['linux-netns','linux-netfilter','linux-seccomp-landlock']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/linux-security-basics/junior');await page.locator('.reader h1').waitFor();assert((await page.locator('.reader h1').textContent()).includes('защитить'));await checkWidth();
    for(const id of ['linux-kbuild','linux-driver-model','linux-irq-dma','linux-futex-rcu']){await page.goto(base+'#/lesson/'+id+'/senior');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    await page.goto(base+'#/lesson/linux-upstream/senior');await page.locator('.reader h1').waitFor();await checkWidth();
    await page.goto(base+'#/lesson/linux-mmu/senior');await page.locator('[data-mmu-address]').fill('0x41234567');assert((await page.locator('[data-mmu-result]').textContent()).includes('0x567'));await page.locator('[data-mmu-address]').fill('bad!');assert((await page.locator('[data-mmu-result]').textContent()).includes('Ошибка'));await checkWidth();
    await page.goto(base+'#/lesson/linux-mmap-cow/middle');await page.locator('[data-lab-action="fork"]').click();await page.locator('[data-lab-action="write"]').click();assert.equal(await page.locator('[data-cow-parent]').textContent(),'A · 7');assert.equal(await page.locator('[data-cow-child]').textContent(),'B · 9');await checkWidth();
    await page.goto(base+'#/lesson/linux-service-dependencies/middle');await page.locator('[data-unit-after]').selectOption('1');assert((await page.locator('[data-unit-result]').textContent()).includes('только A'));await page.locator('[data-unit-wants]').selectOption('1');assert((await page.locator('[data-unit-result]').textContent()).includes('B → A'));await checkWidth();
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
    for(const id of ['git-diff-status','git-commit-quality']){await page.goto(base+'#/lesson/'+id+'/middle');await page.locator('.diagram-art svg').waitFor();await checkWidth();}
    // Exhaustive Linux lesson navigation in one desktop context; other views
    // still exercise all course routes and representative lessons.
    if(view.width===1440&&scheme==='light'){
      const routes=await page.evaluate(()=>{const L=window.ATLAS_LEVELS,D=window.ATLAS_DATA;return ['junior','middle','senior'].flatMap((level,n)=>L.order.linux.filter(id=>L.minimum[id]<=n).map(id=>({id,level,title:n===0?L.junior[id].title:D.lessons.find(l=>l.id===id).title})));});
      assert.equal(routes.length,132);
      for(const r of routes){
        await page.goto(base+'#/lesson/'+r.id+'/'+r.level);
        await page.locator('.reader h1').waitFor();
        assert.equal(await page.locator('.reader h1').textContent(),r.title,r.id+' '+r.level);
        assert.equal(await page.locator('.source-section a').first().count(),1,r.id+' source');
        assert.equal(await page.locator('[data-complete]').count(),1,r.id+' progress');
        await checkWidth();
      }
      console.log('PASS: all 132 Linux Junior/Middle/Senior lesson routes');
    }
    assert.deepEqual(errors,[],'Browser exceptions');console.log('PASS',view.width,scheme);
    await ctx.close();
   }
  }
 }finally{if(browser)await browser.close();server.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
