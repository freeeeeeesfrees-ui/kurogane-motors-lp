/* ============================================================
   KUROGANE MOTORS — scroll-scrubbed assembly film
   The hero stage plays a 200-frame WebP sequence extracted from
   the assembly film. Scroll position drives the playhead through
   a piecewise time map, so each chapter of the film (engine →
   frame → chassis → bodywork → ignition → tunnel → showroom)
   gets its own scroll range and caption.
   ============================================================ */
(() => {
  const gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger);

  /* ---------- frame sequence ---------- */
  const FRAME_COUNT = 200;
  const FPS = 10;
  const frameSrc = (i) =>
    (window.FRAME_DATA && window.FRAME_DATA[i]) ||
    `frames/f_${String(i + 1).padStart(3, '0')}.webp`;

  /* film chapters: [timelineStart, timelineEnd, videoStart(s), videoEnd(s)] */
  const SEGMENTS = [
    [0, 13, 0.0, 1.2],     // engine floats alone
    [13, 25, 1.2, 2.6],    // frame embraces it
    [25, 38, 2.6, 4.3],    // chassis + wheels attach
    [38, 52, 4.3, 8.3],    // bodywork close-ups
    [52, 64, 8.3, 11.2],   // front view, ignition
    [64, 80, 11.2, 15.3],  // tunnel run
    [80, 100, 15.3, 19.9]  // showroom finale
  ];
  const T_MAX = 100;

  function videoTimeAt(t) {
    if (t <= 0) return SEGMENTS[0][2];
    for (const [t0, t1, v0, v1] of SEGMENTS) {
      if (t <= t1) return v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
    }
    return SEGMENTS[SEGMENTS.length - 1][3];
  }
  const frameAt = (t) =>
    Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(videoTimeAt(t) * FPS)));

  /* ---------- canvas drawing (cover fit) ---------- */
  const canvas = document.getElementById('webgl');
  const ctx = canvas.getContext('2d');
  const frames = new Array(FRAME_COUNT);
  const loaded = new Array(FRAME_COUNT).fill(false);
  let currentFrame = -1;

  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    drawFrame(currentFrame < 0 ? 0 : currentFrame, true);
  }

  function drawFrame(i, force) {
    if (i === currentFrame && !force) return;
    // fall back to the nearest already-loaded frame while preloading
    let j = i;
    while (j > 0 && !loaded[j]) j--;
    if (!loaded[j]) return;
    const img = frames[j];
    const cw = canvas.width, ch = canvas.height;
    if (!cw || !ch) return;
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    currentFrame = i;
  }

  /* ---------- preload with loader progress ---------- */
  const loaderBar = document.querySelector('.loader-bar i');
  loaderBar.style.animation = 'none';
  loaderBar.style.width = '0%';
  let loadedCount = 0;

  function preload() {
    return new Promise((resolve) => {
      for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => {
          loaded[i] = img.complete && img.naturalWidth > 0;
          loadedCount++;
          loaderBar.style.width = `${Math.round((loadedCount / FRAME_COUNT) * 100)}%`;
          if (i === 0) { fitCanvas(); }
          if (loadedCount === FRAME_COUNT) resolve();
        };
        img.src = frameSrc(i);
        frames[i] = img;
      }
    });
  }

  /* ---------- captions timeline (scrubbed) ---------- */
  function buildTimeline() {
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: '#stage',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.6,
        onUpdate: (self) => drawFrame(frameAt(self.progress * T_MAX))
      }
    });

    const capIn = (sel, t) =>
      tl.fromTo(sel, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 3, ease: 'power2.out' }, t);
    const capOut = (sel, t) =>
      tl.to(sel, { autoAlpha: 0, y: -40, duration: 2.5, ease: 'power2.in' }, t);

    tl.to('.hero-inner', { autoAlpha: 0, y: -80, duration: 5, ease: 'power1.in' }, 0.5);

    capIn('#cap1', 4.5); capOut('#cap1', 11);   // engine
    capIn('#cap2', 14.5); capOut('#cap2', 23);  // frame
    capIn('#cap3', 26.5); capOut('#cap3', 36);  // chassis
    capIn('#cap4', 39.5); capOut('#cap4', 50);  // bodywork
    capIn('#cap5', 53.5); capOut('#cap5', 62);  // ignition
    capIn('#cap6', 66); capOut('#cap6', 77);    // tunnel
    capIn('#cap7', 83); capOut('#cap7', 93);    // showroom + specs

    tl.fromTo('.stage-outro', { autoAlpha: 0 }, { autoAlpha: 1, duration: 5, ease: 'power2.out' }, 93.5);
    tl.set('.stage-outro', { pointerEvents: 'auto' }, 95);
    tl.to({}, { duration: 2 }, 98); // tail padding

    return tl;
  }

  /* ---------- boot ---------- */
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  preload().then(() => {
    drawFrame(0, true);
    buildTimeline();
    window.ScrollTrigger.refresh();
    gsap.to('#loader', {
      autoAlpha: 0, duration: 0.7, delay: 0.2,
      onComplete: () => { document.getElementById('loader').style.display = 'none'; }
    });
  });

  /* ============================================================
     UI — header state / float CTA / reveals / form
     ============================================================ */
  const header = document.getElementById('header');
  const floatCta = document.getElementById('floatCta');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    floatCta.classList.toggle('show', y > window.innerHeight * 1.2);
  }, { passive: true });

  gsap.utils.toArray('.reveal').forEach((el) => {
    gsap.from(el, {
      y: 44, autoAlpha: 0, duration: 0.9, ease: 'power2.out',
      delay: parseFloat(el.dataset.delay || 0),
      scrollTrigger: { trigger: el, start: 'top 86%' }
    });
  });

  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const done = form.querySelector('.form-done');
    done.hidden = false;
    gsap.from(done, { y: 20, autoAlpha: 0, duration: 0.6, ease: 'power2.out' });
    form.querySelector('.btn-l').disabled = true;
    form.querySelector('.btn-l').style.opacity = 0.4;
    done.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();
