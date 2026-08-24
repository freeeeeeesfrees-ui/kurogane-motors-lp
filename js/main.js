/* ============================================================
   KUROGANE MOTORS — 3D scroll assembly (Three.js + GSAP)
   ============================================================ */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const gsap = window.gsap;
gsap.registerPlugin(window.ScrollTrigger);

/* ---------- renderer / scene / camera ---------- */
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(Math.max(window.innerWidth, 2), Math.max(window.innerHeight, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x08080a);
scene.fog = new THREE.Fog(0x08080a, 7, 16);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 60);
const camState = { x: 4.6, y: 2.0, z: 5.6 };
const camTarget = { x: 0, y: 1.05, z: 0 };

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* ---------- lights ---------- */
scene.add(new THREE.HemisphereLight(0x8899bb, 0x0a0a0c, 0.7));

const keyLight = new THREE.DirectionalLight(0xfff4e6, 2.3);
keyLight.position.set(3.5, 6, 4.5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -5;
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 20;
keyLight.shadow.bias = -0.0004;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0xff3b52, 2.2);
rimLight.position.set(-5, 3, -5);
scene.add(rimLight);

const coolFill = new THREE.DirectionalLight(0x4a5cff, 0.55);
coolFill.position.set(0, 2, -6);
scene.add(coolFill);

/* ---------- ground ---------- */
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(16, 48),
  new THREE.MeshStandardMaterial({ color: 0x0b0b0e, roughness: 0.5, metalness: 0.4 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(26, 52, 0x20202c, 0x14141c);
grid.position.y = 0.002;
grid.material.transparent = true;
grid.material.opacity = 0.35;
scene.add(grid);

/* ---------- materials ---------- */
const matTire = new THREE.MeshStandardMaterial({ color: 0x0e0e11, roughness: 0.95, metalness: 0 });
const matGun = new THREE.MeshStandardMaterial({ color: 0x2c2f36, roughness: 0.28, metalness: 0.92 });
const matDark = new THREE.MeshStandardMaterial({ color: 0x17171c, roughness: 0.5, metalness: 0.75 });
const matChrome = new THREE.MeshStandardMaterial({ color: 0xd6dade, roughness: 0.14, metalness: 1 });
const matFins = new THREE.MeshStandardMaterial({ color: 0x55585f, roughness: 0.4, metalness: 0.9 });
const matSeat = new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.85, metalness: 0.1 });
const matAccent = new THREE.MeshPhysicalMaterial({
  color: 0xc41230, roughness: 0.3, metalness: 0.55, clearcoat: 0.7, clearcoatRoughness: 0.2
});
const matBlackGloss = new THREE.MeshPhysicalMaterial({
  color: 0x14141b, roughness: 0.2, metalness: 0.6, clearcoat: 1, clearcoatRoughness: 0.1
});
const matLens = new THREE.MeshStandardMaterial({
  color: 0x222226, emissive: 0xfff3d6, emissiveIntensity: 0.25, roughness: 0.2, metalness: 0.6
});
const matTail = new THREE.MeshStandardMaterial({
  color: 0x330508, emissive: 0xff1626, emissiveIntensity: 0.8, roughness: 0.3
});
const matGlass = new THREE.MeshStandardMaterial({
  color: 0x1c2230, roughness: 0.08, metalness: 0.9, transparent: true, opacity: 0.4
});
[matTire, matGun, matDark, matChrome, matFins, matSeat, matAccent, matBlackGloss, matLens, matGlass]
  .forEach((m) => { m.envMapIntensity = 1.35; });

/* ---------- helpers ---------- */
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const UP = v3(0, 1, 0);

function tube(a, b, r, mat, seg = 16) {
  const dir = v3(0, 0, 0).subVectors(b, a);
  const len = dir.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(UP, dir.normalize());
  mesh.castShadow = true;
  return mesh;
}
function box(w, h, d, mat) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.castShadow = true;
  return m;
}
function cyl(r, h, mat, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), mat);
  m.castShadow = true;
  return m;
}

/* ---------- bike parts ----------
   holder(part center) > bob(idle float) > spinner(wheel spin) > inner(geometry) */
const bikeGroup = new THREE.Group();
scene.add(bikeGroup);
const parts = {};

function makePart(name, center, build) {
  const holder = new THREE.Group();
  holder.position.copy(center);
  const bob = new THREE.Group();
  const spinner = new THREE.Group();
  const inner = new THREE.Group();
  inner.position.copy(center.clone().negate());
  holder.add(bob);
  bob.add(spinner);
  spinner.add(inner);
  build(inner);
  holder.userData = { center: center.clone(), scatter: 0, phase: Math.random() * Math.PI * 2 };
  bikeGroup.add(holder);
  parts[name] = { holder, bob, spinner, ud: holder.userData };
  return parts[name];
}

/* --- frame (trellis) --- */
makePart('frame', v3(0, 0.7, 0), (g) => {
  g.add(tube(v3(0.5, 1.04, 0), v3(0.6, 0.78, 0), 0.05, matAccent));            // headstock
  g.add(tube(v3(0.48, 1.0, 0.06), v3(-0.34, 0.66, 0.06), 0.034, matAccent));   // main spars
  g.add(tube(v3(0.48, 1.0, -0.06), v3(-0.34, 0.66, -0.06), 0.034, matAccent));
  g.add(tube(v3(0.52, 0.96, 0), v3(0.2, 0.34, 0), 0.04, matAccent));           // downtube
  g.add(tube(v3(0.2, 0.32, 0.07), v3(-0.32, 0.42, 0.07), 0.028, matAccent));   // cradle
  g.add(tube(v3(0.2, 0.32, -0.07), v3(-0.32, 0.42, -0.07), 0.028, matAccent));
  g.add(tube(v3(-0.28, 0.64, 0.05), v3(-0.74, 0.82, 0.05), 0.024, matAccent)); // subframe
  g.add(tube(v3(-0.28, 0.64, -0.05), v3(-0.74, 0.82, -0.05), 0.024, matAccent));
  // trellis diagonals
  g.add(tube(v3(0.32, 0.9, 0.062), v3(0.18, 0.55, 0.062), 0.018, matAccent));
  g.add(tube(v3(0.32, 0.9, -0.062), v3(0.18, 0.55, -0.062), 0.018, matAccent));
  g.add(tube(v3(0.08, 0.82, 0.062), v3(-0.06, 0.48, 0.062), 0.018, matAccent));
  g.add(tube(v3(0.08, 0.82, -0.062), v3(-0.06, 0.48, -0.062), 0.018, matAccent));
  // pivot plates
  const p1 = box(0.16, 0.3, 0.03, matGun); p1.position.set(-0.36, 0.5, 0.075); p1.rotation.z = 0.15; g.add(p1);
  const p2 = box(0.16, 0.3, 0.03, matGun); p2.position.set(-0.36, 0.5, -0.075); p2.rotation.z = 0.15; g.add(p2);
});

/* --- engine --- */
makePart('engine', v3(0, 0.5, 0), (g) => {
  const crank = box(0.54, 0.3, 0.32, matGun); crank.position.set(-0.04, 0.42, 0); g.add(crank);
  const block = box(0.34, 0.3, 0.3, matGun); block.position.set(0.1, 0.66, 0); block.rotation.z = -0.3; g.add(block);
  const head = box(0.36, 0.14, 0.32, matDark); head.position.set(0.17, 0.8, 0); head.rotation.z = -0.3; g.add(head);
  // cooling fins along the leaning cylinder bank
  const finDir = v3(Math.sin(0.3), Math.cos(0.3), 0);
  for (let i = 0; i < 5; i++) {
    const f = box(0.37, 0.012, 0.32, matFins);
    f.position.copy(v3(0.07, 0.57, 0)).addScaledVector(finDir, i * 0.048);
    f.rotation.z = -0.3;
    g.add(f);
  }
  const clutch = cyl(0.12, 0.06, matChrome); clutch.rotation.x = Math.PI / 2; clutch.position.set(-0.16, 0.42, 0.185); g.add(clutch);
  const gen = cyl(0.1, 0.05, matChrome); gen.rotation.x = Math.PI / 2; gen.position.set(-0.16, 0.42, -0.185); g.add(gen);
});

/* --- swingarm --- */
makePart('swingarm', v3(-0.52, 0.42, 0), (g) => {
  g.add(tube(v3(-0.34, 0.47, 0.1), v3(-0.72, 0.345, 0.1), 0.032, matGun));
  g.add(tube(v3(-0.34, 0.47, -0.1), v3(-0.72, 0.345, -0.1), 0.032, matGun));
  g.add(tube(v3(-0.45, 0.44, -0.1), v3(-0.45, 0.44, 0.1), 0.028, matGun));
  // rear shock
  g.add(tube(v3(-0.4, 0.46, 0), v3(-0.3, 0.72, 0), 0.03, matAccent));
});

/* --- wheels --- */
function buildWheel(g, ax, ay, discBothSides) {
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.075, 18, 44), matTire);
  tire.position.set(ax, ay, 0); tire.castShadow = true; g.add(tire);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.02, 10, 36), matAccent);
  rim.position.set(ax, ay, 0); rim.castShadow = true; g.add(rim);
  for (let i = 0; i < 5; i++) {
    const sp = box(0.035, 0.4, 0.035, matGun);
    sp.position.set(ax, ay, 0);
    sp.rotation.z = (i / 5) * Math.PI * 2;
    g.add(sp);
  }
  const hub = cyl(0.06, 0.1, matGun); hub.rotation.x = Math.PI / 2; hub.position.set(ax, ay, 0); g.add(hub);
  const sides = discBothSides ? [0.062, -0.062] : [0.062];
  for (const s of sides) {
    const disc = cyl(0.13, 0.012, matChrome, 32);
    disc.rotation.x = Math.PI / 2; disc.position.set(ax, ay, s); g.add(disc);
  }
}
makePart('rearWheel', v3(-0.72, 0.345, 0), (g) => buildWheel(g, -0.72, 0.345, false));
makePart('frontWheel', v3(0.78, 0.345, 0), (g) => buildWheel(g, 0.78, 0.345, true));

/* --- front end (forks, bars, fender, headlight) --- */
let headlightPoint;
makePart('front', v3(0.62, 0.75, 0), (g) => {
  g.add(tube(v3(0.52, 1.02, 0.08), v3(0.66, 0.62, 0.08), 0.024, matChrome));   // upper fork tubes
  g.add(tube(v3(0.52, 1.02, -0.08), v3(0.66, 0.62, -0.08), 0.024, matChrome));
  g.add(tube(v3(0.64, 0.68, 0.08), v3(0.78, 0.35, 0.08), 0.034, matBlackGloss)); // lower legs
  g.add(tube(v3(0.64, 0.68, -0.08), v3(0.78, 0.35, -0.08), 0.034, matBlackGloss));
  const clampT = box(0.1, 0.05, 0.24, matGun); clampT.position.set(0.53, 1.0, 0); clampT.rotation.z = -0.34; g.add(clampT);
  const clampB = box(0.1, 0.05, 0.24, matGun); clampB.position.set(0.56, 0.9, 0); clampB.rotation.z = -0.34; g.add(clampB);
  const bar = cyl(0.021, 0.56, matGun); bar.rotation.x = Math.PI / 2; bar.position.set(0.5, 1.08, 0); g.add(bar);
  const gripL = cyl(0.028, 0.11, matSeat); gripL.rotation.x = Math.PI / 2; gripL.position.set(0.5, 1.08, 0.27); g.add(gripL);
  const gripR = cyl(0.028, 0.11, matSeat); gripR.rotation.x = Math.PI / 2; gripR.position.set(0.5, 1.08, -0.27); g.add(gripR);
  // front fender (arc over wheel)
  const fender = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.03, 10, 26, 1.9), matBlackGloss);
  fender.position.set(0.78, 0.345, 0);
  fender.rotation.z = Math.PI / 2 - 0.95;
  fender.castShadow = true;
  g.add(fender);
  // round headlight
  const housing = cyl(0.095, 0.1, matBlackGloss); housing.rotation.z = Math.PI / 2; housing.position.set(0.58, 1.02, 0); g.add(housing);
  const lens = cyl(0.08, 0.02, matLens); lens.rotation.z = Math.PI / 2; lens.position.set(0.635, 1.02, 0); g.add(lens);
  // small screen
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.16), matGlass);
  screen.position.set(0.52, 1.18, 0); screen.rotation.y = -Math.PI / 2; screen.rotation.z = -0.4; g.add(screen);
  headlightPoint = new THREE.PointLight(0xfff2d0, 0, 7, 2);
  headlightPoint.position.set(0.85, 1.0, 0);
  g.add(headlightPoint);
});

/* --- bodywork (tank, seat, tail) --- */
makePart('body', v3(-0.1, 0.85, 0), (g) => {
  const tank = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 24), matBlackGloss);
  tank.scale.set(0.62, 0.26, 0.38);
  tank.position.set(0.12, 0.88, 0);
  tank.rotation.z = -0.12;
  tank.castShadow = true;
  g.add(tank);
  const seat = box(0.42, 0.06, 0.24, matSeat); seat.position.set(-0.28, 0.83, 0); seat.rotation.z = 0.06; g.add(seat);
  const tail = box(0.32, 0.11, 0.2, matBlackGloss); tail.position.set(-0.57, 0.87, 0); tail.rotation.z = 0.18; g.add(tail);
  const tlight = box(0.02, 0.05, 0.14, matTail); tlight.position.set(-0.73, 0.91, 0); tlight.rotation.z = 0.18; g.add(tlight);
  const panL = box(0.24, 0.16, 0.02, matBlackGloss); panL.position.set(-0.42, 0.68, 0.13); panL.rotation.z = 0.2; g.add(panL);
  const panR = box(0.24, 0.16, 0.02, matBlackGloss); panR.position.set(-0.42, 0.68, -0.13); panR.rotation.z = 0.2; g.add(panR);
});

/* --- exhaust --- */
makePart('exhaust', v3(-0.2, 0.3, 0.14), (g) => {
  const curve = new THREE.CatmullRomCurve3([
    v3(0.28, 0.68, 0.1), v3(0.5, 0.45, 0.14), v3(0.38, 0.22, 0.15),
    v3(-0.1, 0.18, 0.15), v3(-0.45, 0.28, 0.16)
  ]);
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.036, 12), matChrome);
  pipe.castShadow = true;
  g.add(pipe);
  const muffler = tube(v3(-0.45, 0.28, 0.16), v3(-0.85, 0.5, 0.18), 0.075, matGun, 20);
  g.add(muffler);
  const tip = cyl(0.05, 0.04, matSeat);
  tip.position.set(-0.85, 0.5, 0.18);
  tip.quaternion.setFromUnitVectors(UP, v3(-0.4, 0.22, 0.02).normalize());
  g.add(tip);
});

/* ---------- speed lines ---------- */
const lineMat = new THREE.MeshBasicMaterial({
  color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
});
const linesGroup = new THREE.Group();
const lineData = [];
for (let i = 0; i < 54; i++) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.012), lineMat);
  const s = 1.2 + Math.random() * 2.4;
  mesh.scale.x = s;
  mesh.position.set(-10 + Math.random() * 20, 0.15 + Math.random() * 2.3, -2.5 + Math.random() * 5);
  linesGroup.add(mesh);
  lineData.push({ mesh, speed: 16 + Math.random() * 14 });
}
scene.add(linesGroup);

/* ============================================================
   LINEUP THUMBNAILS — capture 3 colorways while assembled
   ============================================================ */
function captureThumbnails() {
  const tr = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  tr.setSize(640, 442);
  tr.setClearColor(0x000000, 0);
  tr.toneMapping = THREE.ACESFilmicToneMapping;
  tr.toneMappingExposure = 1.9;
  const tc = new THREE.PerspectiveCamera(30, 640 / 442, 0.1, 60);
  tc.position.set(1.35, 1.0, 4.8);
  tc.lookAt(0.05, 0.72, 0);
  // studio setup just for the catalog shots: cutout look, strong fills
  const fillA = new THREE.DirectionalLight(0xffffff, 5);
  fillA.position.set(2, 2.5, 5);
  const fillB = new THREE.DirectionalLight(0xdde4ff, 2.2);
  fillB.position.set(-3, 1.5, 2);
  scene.add(fillA, fillB);
  const prevBg = scene.background;
  const prevFog = scene.fog;
  scene.background = null;
  scene.fog = null;
  ground.visible = false;
  grid.visible = false;
  const prevRot = bikeGroup.rotation.y;
  bikeGroup.rotation.y = -0.5;
  const colorways = [
    ['thumb-zero1', 0xc41230],
    ['thumb-zeros', 0x9ba3ad],
    ['thumb-zerocafe', 0x2e5f4a]
  ];
  for (const [id, color] of colorways) {
    matAccent.color.setHex(color);
    tr.render(scene, tc);
    const img = document.getElementById(id);
    if (img) img.src = tr.domElement.toDataURL('image/png');
  }
  matAccent.color.setHex(0xc41230);
  bikeGroup.rotation.y = prevRot;
  scene.background = prevBg;
  scene.fog = prevFog;
  ground.visible = true;
  grid.visible = true;
  scene.remove(fillA, fillB);
  tr.dispose();
}

/* ============================================================
   SCATTER + SCROLL TIMELINE
   ============================================================ */
const SCATTER = {
  frame:      { p: [-1.3, 1.1, -1.4], r: [0.6, 0.9, 0.5] },
  engine:     { p: [1.5, 1.5, 0.9],   r: [1.1, 0.4, -0.7] },
  swingarm:   { p: [-2.3, 0.7, 0.8],  r: [0.4, -1.2, 0.9] },
  rearWheel:  { p: [-1.7, 1.7, -0.9], r: [0.9, 0.5, 0.2] },
  frontWheel: { p: [2.1, 1.2, -1.1],  r: [-0.6, 0.8, 0.6] },
  front:      { p: [1.9, 0.5, 1.3],   r: [0.5, 0.4, 1.2] },
  body:       { p: [0.2, 1.55, 0.6],  r: [-0.4, 1.1, 0.35] },
  exhaust:    { p: [-0.7, 0.4, 1.9],  r: [0.8, -0.5, -0.9] }
};

function scatterParts() {
  for (const name in SCATTER) {
    const { holder, ud } = parts[name];
    const s = SCATTER[name];
    holder.position.set(ud.center.x + s.p[0], ud.center.y + s.p[1], ud.center.z + s.p[2]);
    holder.rotation.set(s.r[0], s.r[1], s.r[2]);
    ud.scatter = 1;
  }
}

const speed = { v: 0 };

function buildTimeline() {
  const tl = gsap.timeline({
    defaults: { ease: 'power2.inOut' },
    scrollTrigger: {
      trigger: '#stage',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1
    }
  });

  const assemble = (name, t, dur) => {
    const { holder, ud } = parts[name];
    tl.to(holder.position, { x: ud.center.x, y: ud.center.y, z: ud.center.z, duration: dur }, t);
    tl.to(holder.rotation, { x: 0, y: 0, z: 0, duration: dur }, t);
    tl.to(ud, { scatter: 0, duration: dur * 0.6, ease: 'power1.out' }, t);
  };
  const capIn = (sel, t) =>
    tl.fromTo(sel, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 3, ease: 'power2.out' }, t);
  const capOut = (sel, t) =>
    tl.to(sel, { autoAlpha: 0, y: -40, duration: 2.5, ease: 'power2.in' }, t);
  const cam = (t, dur, pos, tgt) => {
    tl.to(camState, { x: pos[0], y: pos[1], z: pos[2], duration: dur }, t);
    tl.to(camTarget, { x: tgt[0], y: tgt[1], z: tgt[2], duration: dur }, t);
  };

  /* hero out */
  tl.to('.hero-inner', { autoAlpha: 0, y: -80, duration: 5, ease: 'power1.in' }, 0.5);

  /* STEP 1 — frame */
  cam(6, 9, [2.7, 1.35, 4.3], [0.1, 0.75, 0]);
  tl.to(bikeGroup.rotation, { y: -0.15, duration: 9 }, 6);
  assemble('frame', 7, 8);
  capIn('#cap1', 7.5); capOut('#cap1', 15.5);

  /* STEP 2 — engine */
  cam(16, 9, [2.0, 1.0, 3.3], [0.05, 0.6, 0]);
  tl.to(bikeGroup.rotation, { y: 0.4, duration: 9 }, 16);
  assemble('engine', 16.5, 8);
  capIn('#cap2', 17); capOut('#cap2', 25.5);

  /* STEP 3 — wheels & suspension */
  cam(26, 12, [2.5, 0.75, 4.1], [0, 0.5, 0]);
  tl.to(bikeGroup.rotation, { y: -0.55, duration: 12 }, 26);
  assemble('swingarm', 26, 6);
  assemble('rearWheel', 28.5, 6.5);
  assemble('front', 31, 6.5);
  assemble('frontWheel', 33.5, 6.5);
  capIn('#cap3', 27.5); capOut('#cap3', 38.5);

  /* STEP 4 — bodywork & exhaust */
  cam(41, 10, [2.9, 1.25, 4.5], [0, 0.7, 0]);
  tl.to(bikeGroup.rotation, { y: 0.2, duration: 10 }, 41);
  assemble('body', 42, 7);
  assemble('exhaust', 45, 7);
  capIn('#cap4', 42.5); capOut('#cap4', 51);

  /* COMPLETE — 360° showcase */
  cam(53, 10, [2.9, 1.1, 4.5], [0, 0.58, 0]);
  tl.to(bikeGroup.rotation, { y: 0.2 + Math.PI * 2, duration: 12, ease: 'none' }, 53);
  capIn('#cap5', 54.5); capOut('#cap5', 63.5);

  /* RIDE OFF */
  cam(66, 10, [3.2, 0.85, 6.0], [0.5, 0.6, 0]);
  tl.to(bikeGroup.rotation, { y: 0.2 + Math.PI * 2 - 0.28, duration: 8 }, 66);
  tl.to(speed, { v: 1, duration: 6, ease: 'power2.in' }, 66);
  tl.to(matLens, { emissiveIntensity: 4, duration: 3 }, 66);
  tl.to(headlightPoint, { intensity: 8, duration: 3 }, 66);
  capIn('#cap6', 67); capOut('#cap6', 75);
  tl.to(lineMat, { opacity: 0.5, duration: 4 }, 68);
  tl.to(bikeGroup.rotation, { z: 0.09, duration: 3, ease: 'power2.out' }, 73);
  tl.to(bikeGroup.rotation, { z: 0, duration: 3, ease: 'power1.inOut' }, 77);
  tl.to(bikeGroup.position, { x: 11.5, duration: 16, ease: 'power2.in' }, 72);
  tl.to(camTarget, { x: 3.2, duration: 14 }, 76);
  tl.to(camState, { x: 2.4, y: 1.0, z: 6.6, duration: 14 }, 76);
  tl.to(lineMat, { opacity: 0, duration: 5 }, 88);

  /* OUTRO CTA */
  tl.fromTo('.stage-outro', { autoAlpha: 0 }, { autoAlpha: 1, duration: 6, ease: 'power2.out' }, 86);
  tl.set('.stage-outro', { pointerEvents: 'auto' }, 88);
  tl.to({}, { duration: 2 }, 92); // tail padding

  return tl;
}

/* ============================================================
   RENDER LOOP
   ============================================================ */
const clock = new THREE.Clock();
let elapsed = 0;
let mouseX = 0, mouseY = 0, mx = 0, my = 0;
let rearSpin = 0, frontSpin = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;

  // idle float on scattered parts
  for (const name in parts) {
    const { bob, ud } = parts[name];
    const s = ud.scatter;
    if (s > 0.001) {
      bob.position.y = Math.sin(elapsed * 1.2 + ud.phase) * 0.1 * s;
      bob.rotation.x = Math.sin(elapsed * 0.7 + ud.phase) * 0.16 * s;
      bob.rotation.y = Math.cos(elapsed * 0.5 + ud.phase * 1.7) * 0.2 * s;
    } else {
      bob.position.y = 0; bob.rotation.x = 0; bob.rotation.y = 0;
    }
  }

  // wheel spin (slow idle while floating, fast during ride)
  rearSpin += dt * (0.8 * parts.rearWheel.ud.scatter + 26 * speed.v);
  frontSpin += dt * (0.8 * parts.frontWheel.ud.scatter + 26 * speed.v);
  parts.rearWheel.spinner.rotation.z = -rearSpin;
  parts.frontWheel.spinner.rotation.z = -frontSpin;

  // speed lines
  if (lineMat.opacity > 0.001) {
    for (const l of lineData) {
      l.mesh.position.x -= l.speed * speed.v * dt;
      if (l.mesh.position.x < -11) l.mesh.position.x += 22;
    }
  }
  linesGroup.visible = lineMat.opacity > 0.001;

  // camera (with slight mouse parallax)
  mx += (mouseX - mx) * 0.04;
  my += (mouseY - my) * 0.04;
  camera.position.set(camState.x + mx * 0.28, camState.y - my * 0.14, camState.z);
  camera.lookAt(camTarget.x, camTarget.y, camTarget.z);

  // follow viewport changes even when no resize event fires
  if (lastVW !== window.innerWidth || lastVH !== window.innerHeight) {
    lastVW = window.innerWidth;
    lastVH = window.innerHeight;
    fitRenderer();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
let lastVW = 0, lastVH = 0;

function fitRenderer() {
  const w = window.innerWidth, h = window.innerHeight;
  if (!w || !h) return;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
}
window.addEventListener('resize', fitRenderer);

/* ============================================================
   BOOT
   ============================================================ */
captureThumbnails();   // capture while assembled
scatterParts();        // then explode for the story
buildTimeline();
tick();

gsap.to('#loader', {
  autoAlpha: 0, duration: 0.7, delay: 0.3,
  onComplete: () => { document.getElementById('loader').style.display = 'none'; }
});

/* ============================================================
   UI — header state / float CTA / reveals / form
   ============================================================ */
const header = document.getElementById('header');
const floatCta = document.getElementById('floatCta');
const stageH = () => document.getElementById('stage').offsetHeight;

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
