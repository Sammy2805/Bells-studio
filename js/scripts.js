// Lightweight interactions: reveal on scroll, tilt, magnetic CTA, profile parallax
document.addEventListener('DOMContentLoaded',()=>{
  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('is-visible'); });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Tilt for elements with .tilt
  const tiltEls = document.querySelectorAll('.tilt');
  tiltEls.forEach(el=>{
    el.addEventListener('pointermove',e=>{
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      const rx = dy * -8; const ry = dx * 10;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
    });
    el.addEventListener('pointerleave',()=> el.style.transform='');
  });

  // Play overlay keyboard support
  document.querySelectorAll('.item.media').forEach(el=>{
    el.addEventListener('click',()=> playMedia(el));
    el.addEventListener('keydown',e=>{ if(e.key==='Enter' || e.key===' ') playMedia(el); });
  });
  function playMedia(el){
    // Replace poster with a <video> element when triggered (deferred load)
    if(el.dataset.playing) return;
    const img = el.querySelector('img');
    const video = document.createElement('video');
    video.src=''; // user should replace with actual motion file
    video.autoplay=true; video.loop=true; video.muted=true; video.playsInline=true; video.style.width='100%';
    if(img) el.replaceChild(video,img);
    el.dataset.playing = '1';
  }

  // Magnetic CTA
  const magnetic = document.querySelector('.magnetic');
  if(magnetic){
    const wrap = magnetic.parentElement;
    wrap.addEventListener('pointermove',e=>{
      const r = wrap.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2));
      const dy = (e.clientY - (r.top + r.height/2));
      magnetic.style.transform = `translate(${dx*0.08}px, ${dy*0.08}px) scale(1.02)`;
    });
    wrap.addEventListener('pointerleave',()=> magnetic.style.transform='');
  }

  // Contact CTA smooth scroll (hooks #contact-cta)
  const contactBtn = document.getElementById('contact-cta');
  if(contactBtn){
    contactBtn.addEventListener('click', (ev)=>{
      ev.preventDefault();
      const target = document.getElementById('contact');
      if(!target) return;
      const header = document.querySelector('.site-header');
      const headerH = header ? header.getBoundingClientRect().height : 0;
      const top = window.scrollY + target.getBoundingClientRect().top - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
      // focus first form control after scrolling
      setTimeout(()=>{
        const first = target.querySelector('input, textarea, button');
        if(first) first.focus({preventScroll:true});
      }, 550);
    });
  }

    // WhatsApp copy + toast
    const waBtn = document.getElementById('whatsapp-btn');
    function showToast(msg){
      let t = document.getElementById('toast');
      if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
      t.textContent = msg; t.classList.add('show');
      clearTimeout(t._hide);
      t._hide = setTimeout(()=> t.classList.remove('show'), 2200);
    }
    if(waBtn){
      waBtn.addEventListener('click', (e)=>{
        // copy visible phone number to clipboard as fallback and show toast
        const num = waBtn.dataset.wa;
        if(num){
          navigator.clipboard?.writeText(num).then(()=>{
            showToast('WhatsApp number copied to clipboard');
          }).catch(()=>{
            showToast('Opening WhatsApp...');
          });
        }
      });
    }
  // Profile parallax + tilt
  const profile = document.getElementById('profile');
  if(profile){
    const frame = profile.querySelector('.profile-frame') || profile;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(!prefersReduced){
      frame.addEventListener('pointermove',e=>{
        const r = frame.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width/2)) / r.width;
        const dy = (e.clientY - (r.top + r.height/2)) / r.height;
        const tx = dx * 8; const ty = dy * 8;
        const rx = dy * -6; const ry = dx * 8;
        frame.style.transform = `translate(${tx}px, ${ty}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      frame.addEventListener('pointerleave',()=> frame.style.transform='');
    }
  }

  // Gallery filtering
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryItems = document.querySelectorAll('#gallery .item');
  function filterGallery(category){
    galleryItems.forEach(it=>{
      const cat = it.dataset.category || '';
      if(category==='all' || cat===category){
        it.style.display = '';
      } else {
        it.style.display = 'none';
      }
    });
  }
  filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      filterGallery(btn.dataset.filter);
    });
  });

  // Lightbox: click any .item img to open full view
  const galleryImgs = document.querySelectorAll('#gallery .item img');
  let lbIndex = -1;
  const imgs = Array.from(galleryImgs).map(i=>i.getAttribute('src'));
  function createLightbox(){
    let lb = document.getElementById('lightbox');
    if(lb) return lb;
    lb = document.createElement('div'); lb.id='lightbox'; lb.className='lightbox';
    lb.innerHTML = `
      <div class="lb-content"><img src="" alt=""/></div>
      <button class="lb-close" aria-label="Close">✕</button>
      <button class="lb-prev" aria-label="Previous">◀</button>
      <button class="lb-next" aria-label="Next">▶</button>
    `;
    document.body.appendChild(lb);
    return lb;
  }
  function openLightbox(index){
    const lb = createLightbox();
    const img = lb.querySelector('img');
    lb.classList.add('show');
    lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
    lb.querySelector('.lb-prev').addEventListener('click', ()=>showIndex(lbIndex-1));
    lb.querySelector('.lb-next').addEventListener('click', ()=>showIndex(lbIndex+1));
    showIndex(index);
    document.addEventListener('keydown', onKey);
  }
  function closeLightbox(){
    const lb = document.getElementById('lightbox'); if(!lb) return;
    lb.classList.remove('show');
    document.removeEventListener('keydown', onKey);
  }
  function showIndex(i){
    const lb = document.getElementById('lightbox'); if(!lb) return;
    if(i<0) i = imgs.length-1; if(i>=imgs.length) i=0; lbIndex = i;
    const img = lb.querySelector('img'); img.src = imgs[lbIndex]; img.alt = `Image ${lbIndex+1}`;
  }
  function onKey(e){ if(e.key==='Escape') closeLightbox(); if(e.key==='ArrowLeft') showIndex(lbIndex-1); if(e.key==='ArrowRight') showIndex(lbIndex+1); }
  galleryImgs.forEach((img, idx)=>{
    img.style.cursor='zoom-in';
    img.addEventListener('click',()=> openLightbox(idx));
  });

});
