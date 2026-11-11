'use strict';

(() => {
  const $ = selector => document.querySelector(selector);
  const cover = $('#cover');
  const invitation = $('#invitation');
  const music = $('#music');
  const sound = $('#sound');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const foilPanels = [...document.querySelectorAll('.tile')];
  const guestURL = new URL(location.pathname, location.origin).href;
  const startTime = Date.parse('2026-12-27T12:00:00+05:00');
  let stage = 'closed';
  let clock = 0;
  let transition = 0;

  function syncMusic() {
    const playing = !music.paused && !music.ended;
    const action = playing ? 'Pause music' : 'Play music';
    sound.setAttribute('aria-pressed', String(playing));
    sound.setAttribute('aria-label', action);
    sound.title = action;
    sound.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
  }

  function playMusic() {
    const started = music.play();
    if (started) started.catch(syncMusic);
  }

  function updateClock() {
    const now = Date.now();
    let remains = Math.max(0, Math.ceil((startTime - now) / 1000));
    if (!remains) {
      const message = $('#count-greeting');
      $('.time-grid').hidden = true;
      $('#count-title').textContent = now < startTime + 12 * 3600 * 1000 ? 'Today is our Walima' : 'With love and gratitude';
      message.textContent = now < startTime + 12 * 3600 * 1000 ? 'We look forward to seeing you.' : 'Mussadiq & Unmber';
      message.hidden = false;
      clearInterval(clock);
      clock = 0;
      return;
    }
    for (const [unit, seconds] of [['days', 86400], ['hours', 3600], ['minutes', 60], ['seconds', 1]]) {
      $('[data-unit="' + unit + '"]').textContent = String(Math.floor(remains / seconds)).padStart(2, '0');
      remains %= seconds;
    }
  }

  function finishOpening(focusHero) {
    stage = 'open';
    invitation.classList.add('unfolded');
    cover.hidden = true;
    cover.classList.remove('opening');
    document.body.classList.remove('sealed');
    invitation.inert = false;
    sound.hidden = false;
    clearInterval(clock);
    clock = setInterval(updateClock, 1000);
    updateClock();
    if (focusHero) $('#couple').focus({preventScroll: true});
  }

  function openEnvelope() {
    if (stage !== 'closed') return;
    stage = 'opening';
    // Starting in the original touch handler also works with mobile audio policies.
    playMusic();
    cover.classList.add('opening');
    transition = window.setTimeout(() => finishOpening(true), reducedMotion.matches ? 30 : 1720);
  }

  // Paint the foil at the displayed size so the scratched line tracks the finger at any DPR.
  function paintFoil(ctx, w, h) {
    const gold = ctx.createLinearGradient(0, 0, w, h * .8);
    [[0,'#ac803c'],[.22,'#e3c68b'],[.46,'#f2db9b'],[.68,'#c4a05c'],[.84,'#e6c98d'],[1,'#a98242']]
      .forEach(([offset,color]) => gold.addColorStop(offset,color));
    ctx.fillStyle = gold;
    ctx.fillRect(0,0,w,h);
    // Fine engraved grain stays still while the visitor rubs away the surface.
    for (let row = 0; row < h; row += 2) {
      ctx.fillStyle = row % 6 === 0 ? 'rgba(100,68,30,.075)' : 'rgba(255,246,192,.1)';
      ctx.fillRect(0,row,w,.65);
    }
    ctx.strokeStyle = 'rgba(102,73,30,.47)';
    ctx.lineWidth = .8;
    ctx.strokeRect(4.5,4.5,w-9,h-9);
    ctx.strokeStyle = 'rgba(255,242,199,.73)';
    ctx.strokeRect(6.5,6.5,w-13,h-13);
    ctx.save();
    ctx.translate(w/2,h/2);
    const r = Math.min(w,h) * .19;
    // A tiny pressed jasmine flower at the center of each piece of foil.
    for (let petal = 0; petal < 8; petal++) {
      ctx.rotate(Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(0,-r*.16);
      ctx.bezierCurveTo(-r*.37,-r*.58,-r*.33,-r*.83,0,-r);
      ctx.bezierCurveTo(r*.33,-r*.83,r*.37,-r*.58,0,-r*.16);
      ctx.fillStyle = 'rgba(250,228,170,.27)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(103,76,33,.61)';
      ctx.stroke();
    }
    ctx.beginPath();ctx.arc(0,0,r*.2,0,Math.PI*2);ctx.fillStyle='#af8a44';ctx.fill();
    ctx.restore();
  }

  function setupTile(button) {
    const canvas = button.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, gesture = null;
    const rubbed = new Set();
    const label = button.parentElement.querySelector('.tile-label').textContent;
    function reveal() {
      if (button.classList.contains('revealed')) return;
      button.classList.add('revealed');
      button.setAttribute('aria-label', label + ': ' + button.dataset.value);
      if (foilPanels.every(panel => panel.classList.contains('revealed'))) {
        $('#date-result').textContent = 'Sunday, 27 December 2026';
      }
    }
    function draw() {
      if (!ctx) { reveal(); return; }
      w = Math.max(1,button.clientWidth); h = Math.max(1,button.clientHeight);
      const dpr = Math.min(2.5, Math.max(1, window.devicePixelRatio || 1));
      canvas.width = Math.round(w*dpr); canvas.height = Math.round(h*dpr);
      ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);
      ctx.globalCompositeOperation = 'source-over'; paintFoil(ctx,w,h);
      // Restore any partly rubbed areas if the visitor rotates the phone.
      if (rubbed.size) {
        ctx.globalCompositeOperation='destination-out';
        for (const cell of rubbed) ctx.fillRect((cell%14)*w/14,Math.floor(cell/14)*h/12,w/14+1,h/12+1);
      }
    }
    function localPoint(event) {
      const rect = button.getBoundingClientRect();
      return {x:(event.clientX-rect.left)*w/rect.width,y:(event.clientY-rect.top)*h/rect.height};
    }
    function scratch(from,to) {
      const radius = Math.max(12, Math.min(w,h)*.14);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = radius*2;ctx.lineCap = 'round';ctx.strokeStyle = '#000';
      ctx.beginPath();ctx.moveTo(from.x,from.y);ctx.lineTo(to.x,to.y);ctx.stroke();
      const dx=to.x-from.x,dy=to.y-from.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/radius));
      for (let n=0;n<=steps;n++) {
        const x=from.x+dx*n/steps,y=from.y+dy*n/steps;
        const left=Math.max(0,Math.floor((x-radius)*14/w)), right=Math.min(13,Math.floor((x+radius)*14/w));
        const top=Math.max(0,Math.floor((y-radius)*12/h)), bottom=Math.min(11,Math.floor((y+radius)*12/h));
        for(let row=top;row<=bottom;row++) for(let col=left;col<=right;col++) {
          if(Math.hypot((col+.5)*w/14-x,(row+.5)*h/12-y)<=radius) rubbed.add(row*14+col);
        }
      }
      if (rubbed.size>=42) reveal();
    }
    button.addEventListener('pointerdown', event => {
      if (!ctx || !event.isPrimary || event.button!==0 || button.classList.contains('revealed')) return;
      const point=localPoint(event);
      gesture={id:event.pointerId,previous:point,distance:0};
      button.setPointerCapture(event.pointerId);
    });
    button.addEventListener('pointermove', event => {
      if (!gesture || event.pointerId!==gesture.id || button.classList.contains('revealed')) return;
      const point=localPoint(event);
      gesture.distance+=Math.hypot(point.x-gesture.previous.x,point.y-gesture.previous.y);
      scratch(gesture.previous,point);gesture.previous=point;
    });
    button.addEventListener('pointerup', event => {
      if (!gesture || event.pointerId!==gesture.id) return;
      if(gesture.distance<6) reveal();
      gesture=null;
    });
    button.addEventListener('pointercancel',()=>{gesture=null;});
    button.addEventListener('lostpointercapture',()=>{gesture=null;});
    button.addEventListener('click',event=>{if(event.detail===0 || !('PointerEvent' in window)) reveal();});
    if ('ResizeObserver' in window) new ResizeObserver(draw).observe(button);
    else window.addEventListener('resize',draw);
    function reset() {
      rubbed.clear();gesture=null;button.classList.remove('revealed');
      button.setAttribute('aria-label','Reveal the '+label.toLowerCase());draw();
    }
    reset();return reset;
  }

  function closeEnvelope(focusSeal) {
    window.clearTimeout(transition);clearInterval(clock);clock=0;
    stage='closed';invitation.classList.remove('unfolded');music.pause();music.currentTime=0;sound.hidden=true;
    $('#date-result').textContent='';resetTiles.forEach(reset=>reset());
    $('#share-options').hidden=true;$('#share-status').textContent='';
    closeMap();
    cover.hidden=false;cover.classList.remove('opening');invitation.inert=true;
    document.body.classList.add('sealed');
    if (location.hash) history.replaceState(null,'',location.pathname+location.search);
    window.scrollTo({top:0,behavior:'instant'});
    if (focusSeal) $('#seal').focus({preventScroll:true});
  }

  const mapButton=$('#preview-map'), mapArea=$('#map-area');
  function closeMap(){
    mapArea.hidden=true;mapArea.replaceChildren();mapButton.setAttribute('aria-expanded','false');mapButton.textContent='Preview map';
  }
  mapButton.addEventListener('click',()=>{
    if(!mapArea.hidden){closeMap();return;}
    const map=document.createElement('iframe');map.title='Map showing Green Leaf Castle on Lahore–Kasur Road';
    map.src='https://maps.google.com/maps?q=31.4143125%2C74.3599375&z=16&output=embed';
    map.referrerPolicy='no-referrer-when-downgrade';mapArea.replaceChildren(map);mapArea.hidden=false;
    mapButton.setAttribute('aria-expanded','true');mapButton.textContent='Hide map';
  });
  mapButton.hidden=false;

  const options=$('#share-options'), shareText='Please join us for the Walima of Mussadiq and Unmber on Sunday, 27 December 2026 at 12:00 PM at Green Leaf Castle, Lahore.';
  options.querySelector('input').value=guestURL;
  $('#whatsapp').href='https://wa.me/?text='+encodeURIComponent(shareText+'\n'+guestURL);
  $('#share').addEventListener('click',async()=>{
    $('#share-status').textContent='';
    if(typeof navigator.share==='function') {
      try {await navigator.share({title:'Mussadiq & Unmber · Walima Invitation',text:shareText,url:guestURL});return;}
      catch (error) {if(error.name==='AbortError')return;}
    }
    options.hidden=!options.hidden;
    if(!options.hidden) $('#copy').focus({preventScroll:true});
  });
  $('#copy').addEventListener('click',async()=>{
    try {await navigator.clipboard.writeText(guestURL);$('#share-status').textContent='Invitation link copied.';}
    catch {const field=options.querySelector('input');field.focus();field.select();$('#share-status').textContent='The link is selected. Use Copy to share it.';}
  });
  $('#replay').addEventListener('click',()=>closeEnvelope(true));
  sound.addEventListener('click',()=>{if(music.paused)playMusic();else music.pause();});
  ['play','pause','ended','error'].forEach(event=>music.addEventListener(event,syncMusic));
  window.addEventListener('pagehide',()=>music.pause());
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',openEnvelope));
  const resetTiles=foilPanels.map(setupTile);
  $('.guest-actions').hidden=false;
  document.documentElement.classList.add('interactive');
  const deepLink=['#the-date','#walima','#venue','#contact','#welcome'].includes(location.hash);
  if(deepLink){finishOpening(false);requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:'instant'}));}
  else closeEnvelope(false);
})();
