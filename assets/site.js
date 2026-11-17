
(function(){
  'use strict';
  const toggle=document.querySelector('.nav-toggle');
  const links=document.querySelector('.nav-links');
  if(toggle&&links){
    toggle.addEventListener('click',()=>{const open=links.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});
    links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{links.classList.remove('open');toggle.setAttribute('aria-expanded','false');}));
  }
  const sections=[...document.querySelectorAll('main section[id]')];
  const nav=[...document.querySelectorAll('.nav-links a')];
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){nav.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));}})},{rootMargin:'-35% 0px -55% 0px',threshold:0});
    sections.forEach(s=>observer.observe(s));
  }
  const modal=document.getElementById('bib-modal');
  const code=document.getElementById('bib-code');
  const status=document.getElementById('bib-copy-status');
  const copyBtn=document.getElementById('bib-copy');
  let lastFocus=null;
  function openBib(id,source){
    const tpl=document.getElementById(id); if(!tpl) return;
    lastFocus=source||document.activeElement;
    code.textContent=tpl.content.textContent.trim(); status.textContent='';
    modal.hidden=false; modal.setAttribute('aria-hidden','false'); document.body.classList.add('modal-open');
    requestAnimationFrame(()=>modal.querySelector('.bib-close').focus());
  }
  function closeBib(){if(modal.hidden)return;modal.hidden=true;modal.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');if(lastFocus)lastFocus.focus();}
  document.querySelectorAll('[data-bib-id]').forEach(btn=>btn.addEventListener('click',()=>openBib(btn.dataset.bibId,btn)));
  document.querySelectorAll('[data-close-bib]').forEach(el=>el.addEventListener('click',closeBib));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeBib();});
  async function copyText(text){
    if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return;}
    const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
  }
  copyBtn.addEventListener('click',async()=>{try{await copyText(code.textContent);status.textContent='Copied to clipboard.';copyBtn.querySelector('span').textContent='Copied';setTimeout(()=>{copyBtn.querySelector('span').textContent='Copy BibTeX';},1300);}catch(_){status.textContent='Copy failed. Select the text manually.';}});


  // Accessibility menu: same controls as the TCAL/UserWay-style menu, re-skinned for this personal site.
  const a11yWidget=document.getElementById('accessibility-widget');
  if(a11yWidget){
    const trigger=a11yWidget.querySelector('.a11y-trigger');
    const panel=a11yWidget.querySelector('.a11y-panel');
    const close=a11yWidget.querySelector('.a11y-close');
    const key='gpapad-a11y-v2';
    const defaults={oversized:false,contrast:false,links:false,text:0,spacing:0,motion:false,images:false,dyslexia:false,cursor:false,tooltips:false,lineheight:0,align:0,saturation:0};
    let state={...defaults};
    try{state={...defaults,...JSON.parse(localStorage.getItem(key)||'{}')}}catch(_){state={...defaults}}
    const save=()=>{try{localStorage.setItem(key,JSON.stringify(state))}catch(_){}};
    const badge=k=>k==='text'?(state.text?state.text+'/3':'Off'):k==='spacing'?(state.spacing?state.spacing+'/2':'Off'):k==='lineheight'?(state.lineheight?state.lineheight+'/2':'Off'):k==='align'?['Off','Left','Center','Right'][state.align]:k==='saturation'?['Off','Low','Grayscale'][state.saturation]:(state[k]?'On':'Off');
    const refreshTooltips=()=>{
      document.querySelectorAll('a,button,[title],[aria-label]').forEach(el=>{
        const label=el.getAttribute('title')||el.getAttribute('aria-label');
        if(label) el.setAttribute('data-a11y-tooltip',label);
      });
    };
    // Bigger Text must work even though this site intentionally uses many fixed px sizes.
    // Cache each text-bearing element's original computed size once, then apply a
    // controlled multiplier without compounding nested font sizes.
    const textScale=[1,1.12,1.24,1.36];
    const fontCache=new WeakMap();
    const textTargets=()=>[...document.body.querySelectorAll('*')].filter(el=>{
      if(el.closest('svg')||['SCRIPT','STYLE','IMG','PICTURE','SOURCE','VIDEO','AUDIO','CANVAS','IFRAME'].includes(el.tagName))return false;
      return [...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim().length);
    });
    const applyBiggerText=()=>{
      const scale=textScale[state.text]||1;
      textTargets().forEach(el=>{
        if(!fontCache.has(el)){
          const computed=parseFloat(window.getComputedStyle(el).fontSize);
          fontCache.set(el,{base:Number.isFinite(computed)?computed:16,inline:el.style.fontSize||''});
        }
        const rec=fontCache.get(el);
        el.style.fontSize=scale===1?rec.inline:(rec.base*scale).toFixed(2)+'px';
      });
    };
    const apply=()=>{
      const r=document.documentElement,b=document.body;
      r.classList.remove('a11y-text-1','a11y-text-2','a11y-text-3');
      applyBiggerText();
      [['contrast','a11y-contrast'],['links','a11y-links'],['motion','a11y-pause'],['images','a11y-hide-images'],['dyslexia','a11y-dyslexia'],['cursor','a11y-cursor'],['tooltips','a11y-tooltips']].forEach(([k,c])=>b.classList.toggle(c,!!state[k]));
      b.classList.remove('a11y-spacing-1','a11y-spacing-2'); if(state.spacing)b.classList.add('a11y-spacing-'+state.spacing);
      b.classList.remove('a11y-line-1','a11y-line-2'); if(state.lineheight)b.classList.add('a11y-line-'+state.lineheight);
      b.classList.remove('a11y-align-left','a11y-align-center','a11y-align-right'); if(state.align)b.classList.add('a11y-align-'+['','left','center','right'][state.align]);
      b.classList.remove('a11y-sat-low','a11y-sat-none'); if(state.saturation===1)b.classList.add('a11y-sat-low'); if(state.saturation===2)b.classList.add('a11y-sat-none');
      a11yWidget.classList.toggle('oversized',!!state.oversized);
      Object.keys(defaults).forEach(k=>{const bt=a11yWidget.querySelector('[data-a11y="'+k+'"]');if(!bt)return;const on=typeof state[k]==='boolean'?state[k]:state[k]>0;bt.classList.toggle('is-active',on);if(bt.hasAttribute('aria-pressed'))bt.setAttribute('aria-pressed',String(on));const st=bt.querySelector('.a11y-state');if(st)st.textContent=badge(k)});
      refreshTooltips();
    };
    const setOpen=o=>{panel.hidden=!o;trigger.setAttribute('aria-expanded',String(o));if(o)requestAnimationFrame(()=>close.focus())};
    trigger.addEventListener('click',()=>setOpen(panel.hidden));
    close.addEventListener('click',()=>{setOpen(false);trigger.focus()});
    document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='u'){e.preventDefault();setOpen(panel.hidden)}else if(e.key==='Escape'&&!panel.hidden){setOpen(false);trigger.focus()}});
    a11yWidget.querySelectorAll('[data-a11y]').forEach(bt=>bt.addEventListener('click',()=>{
      const a=bt.dataset.a11y;
      if(a==='reset'){state={...defaults};save();apply();return}
      if(a==='text')state.text=(state.text+1)%4;
      else if(a==='spacing'||a==='lineheight')state[a]=(state[a]+1)%3;
      else if(a==='align')state.align=(state.align+1)%4;
      else if(a==='saturation')state.saturation=(state.saturation+1)%3;
      else state[a]=!state[a];
      save();apply();
    }));
    apply();
  }


})();
