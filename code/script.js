// 1. Duplicate marquee for seamless infinite loop
const mq = document.getElementById('mq');
if (mq) {
  mq.innerHTML += mq.innerHTML;
}

// 2. Scroll spine + percentage marker indicator
const fill = document.querySelector('#spine .fill'),
      pk = document.querySelector('#spine .packet'),
      pct = document.getElementById('pct'),
      marker = document.querySelector('.marker');

if (marker) marker.style.transition = 'opacity .3s';

addEventListener('scroll', () => {
  const h = document.documentElement;
  const maxScroll = h.scrollHeight - h.clientHeight;
  const p = maxScroll > 0 ? h.scrollTop / maxScroll : 0;
  if (fill) fill.style.height = (p * 100) + '%';
  if (pk) pk.style.top = `calc(${p * 100}% - 5px)`;
  if (pct) pct.textContent = Math.round(p * 100) + '%';
  if (marker) marker.style.opacity = p > 0.96 ? 0 : 1;
}, { passive: true });

// 3. Mobile Navigation Controls (Click outside & Escape key handlers)
const mb = document.querySelector('.menu-btn'), nl = document.getElementById('navlinks');
if (mb && nl) {
  mb.addEventListener('click', e => {
    e.stopPropagation();
    const open = nl.classList.toggle('open');
    mb.setAttribute('aria-expanded', open);
  });
  nl.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      nl.classList.remove('open');
      mb.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('click', e => {
    if (nl.classList.contains('open') && !nl.contains(e.target) && !mb.contains(e.target)) {
      nl.classList.remove('open');
      mb.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nl.classList.contains('open')) {
      nl.classList.remove('open');
      mb.setAttribute('aria-expanded', 'false');
    }
  });
}

// 4. Contact Form Integration (Safe null-checks & EmailJS fallback)
if (typeof emailjs !== 'undefined') {
  try {
    emailjs.init("VibRp2tZH1PQH9vb_");
  } catch (err) {
    console.warn("EmailJS init warning:", err);
  }
}

const cf = document.getElementById('cform');
if (cf) {
  cf.addEventListener('submit', e => {
    e.preventDefault();

    const nameEl = document.getElementById('cf-name');
    const emailEl = document.getElementById('cf-email');
    const msgEl = document.getElementById('cf-msg');
    const note = document.getElementById('cform-note');

    if (!nameEl || !emailEl || !msgEl) return;

    const params = {
      user_name: nameEl.value,
      user_email: emailEl.value,
      message: msgEl.value
    };

    if (typeof emailjs === 'undefined') {
      if (note) {
        note.style.color = '#ff6b6b';
        note.textContent = "Email service temporarily unavailable. Please email directly via link above.";
      }
      return;
    }

    if (note) {
      note.style.color = 'var(--lime)';
      note.textContent = "Transmitting message...";
    }

    emailjs.send("service_uyv0h79", "template_0yvdcsr", params)
    .then(() => {
      if (note) {
        note.style.color = 'var(--lime)';
        note.textContent = "Message sent successfully ✓";
      }
      cf.reset();
    })
    .catch(error => {
      if (note) {
        note.style.color = '#ff6b6b';
        note.textContent = "Message failed to send. Please try emailing directly.";
      }
      console.error("EmailJS submission error:", error);
    });
  });
}

// 5. Scroll Reveal Animations
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) {
    e.target.classList.add('in');
    io.unobserve(e.target);
  }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 6. Number Counter Animations
const io3 = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  io3.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, t0 = performance.now();
  (function step(t) {
    const k = Math.min((t - t0) / 1200, 1);
    el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + (end >= 200 ? '+' : '');
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}), { threshold: .6 });
document.querySelectorAll('[data-count]').forEach(el => io3.observe(el));

// 7. 3D Spine-Leaf Fabric Hero Canvas
(function(){
  const canvas = document.getElementById('net3d');
  if (!canvas || !window.THREE) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const LIME = 0xd4ff3f, BG = 0x0b0b0d;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG, 10, 22);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0.9, 11);
  camera.lookAt(0, 0, 0);

  const rig = new THREE.Group(); scene.add(rig);
  const fab = new THREE.Group(); rig.add(fab);
  fab.position.set(2.5, 0.2, 0);
  fab.rotation.set(-0.10, -0.42, 0);

  const edgeMat = new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.75 });
  const edgeMatDim = new THREE.LineBasicMaterial({ color: LIME, transparent: true, opacity: 0.28 });
  const fillMat = new THREE.MeshBasicMaterial({ color: 0x121216 });
  
  function makeSwitch(w, h, d, dim) {
    const g = new THREE.Group();
    const geo = new THREE.BoxGeometry(w, h, d);
    g.add(new THREE.Mesh(geo, fillMat));
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo), dim ? edgeMatDim : edgeMat));
    return g;
  }

  const spines = [], leaves = [], hosts = [];
  for (let i = 0; i < 4; i++) {
    const s = makeSwitch(1.15, 0.24, 0.55);
    s.position.set((i - 1.5) * 2.0, 2.0, 0);
    fab.add(s); spines.push(s.position);
  }
  for (let i = 0; i < 8; i++) {
    const l = makeSwitch(0.78, 0.20, 0.5);
    l.position.set((i - 3.5) * 1.12, 0, 0);
    fab.add(l); leaves.push(l.position);
  }
  for (let i = 0; i < 16; i++) {
    const h = makeSwitch(0.30, 0.34, 0.30, true);
    h.position.set((i - 7.5) * 0.56, -1.7, ((i % 2) - 0.5) * 0.55);
    fab.add(h); hosts.push(h.position);
  }

  const links = [];
  spines.forEach(s => leaves.forEach(l => links.push([s, l])));
  hosts.forEach((h, i) => links.push([leaves[i >> 1], h]));
  const lpos = new Float32Array(links.length * 6);
  links.forEach(([a, b], k) => lpos.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6));
  const lgeo = new THREE.BufferGeometry();
  lgeo.setAttribute('position', new THREE.BufferAttribute(lpos, 3));
  fab.add(new THREE.LineSegments(lgeo, new THREE.LineBasicMaterial(
    { color: LIME, transparent: true, opacity: 0.13, blending: THREE.AdditiveBlending, depthWrite: false })));

  const grid = new THREE.GridHelper(34, 44, 0x1e1e24, 0x16161b);
  grid.position.y = -2.6; rig.add(grid);

  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(212,255,63,1)'); g.addColorStop(.45, 'rgba(212,255,63,.5)');
    g.addColorStop(1, 'rgba(212,255,63,0)');
    x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  
  const PK = 42, packets = [];
  const pkMat = new THREE.SpriteMaterial({ map: glowTex, color: LIME, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
  
  function newPath() {
    const l1 = leaves[Math.floor(Math.random() * 8)];
    const sp = spines[Math.floor(Math.random() * 4)];
    const l2 = leaves[Math.floor(Math.random() * 8)];
    const hi = Math.floor(Math.random() * 16);
    return Math.random() < 0.3
      ? [hosts[hi], leaves[hi >> 1], spines[Math.floor(Math.random() * 4)]]
      : [l1, sp, l2];
  }
  
  for (let i = 0; i < PK; i++) {
    const m = new THREE.Sprite(pkMat.clone());
    m.scale.set(0.16, 0.16, 1);
    packets.push({ m, path: newPath(), t: Math.random() * 2, s: 0.55 + Math.random() * 0.9 });
    fab.add(m);
  }

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', e => {
    tx = (e.clientX / innerWidth - 0.5);
    ty = (e.clientY / innerHeight - 0.5);
  }, { passive: true });

  // Passive Visibility Check (Eliminates forced reflow in render loop)
  let isCanvasVisible = true;
  const canvasObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      isCanvasVisible = entry.isIntersecting;
    });
  }, { threshold: 0 });
  canvasObserver.observe(canvas);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (w < 720) { fab.position.x = 0.4; camera.position.z = 14; }
    else { fab.position.x = 1.9; camera.position.z = 11; }
  }
  addEventListener('resize', resize, { passive: true });
  resize();

  const clock = new THREE.Clock(); let t0 = 0;
  (function frame() {
    requestAnimationFrame(frame);
    if (!isCanvasVisible) return;
    
    const dt = Math.min(clock.getDelta(), 0.05); t0 += dt;
    fab.rotation.y = -0.42 + Math.sin(t0 * 0.18) * 0.06;
    fab.position.y = 0.2 + Math.sin(t0 * 0.5) * 0.05;
    
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    rig.rotation.y = mx * 0.22; rig.rotation.x = my * 0.12;
    
    packets.forEach(p => {
      p.t += p.s * dt;
      if (p.t >= 2) { p.t = 0; p.path = newPath(); }
      const seg = p.t < 1 ? 0 : 1, tt = p.t % 1;
      p.m.position.lerpVectors(p.path[seg], p.path[seg + 1], tt);
      p.m.material.opacity = Math.sin(Math.min(p.t / 2, 1) * Math.PI) * 0.9 + 0.1;
    });
    
    renderer.render(scene, camera);
  })();
})();