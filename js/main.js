/* ============================================================
   KUROGANE MOTORS — 3D scroll assembly (Three.js + GSAP)
   Choreography modeled on a studio CG bike-assembly film:
   engine floats alone → frame embraces it → chassis attaches
   airborne → bike drops onto its wheels → matte-black bodywork
   → headlight ring ignition (front view) → tunnel run with
   streaking lights → showroom turntable finale.
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
scene.background = new THREE.Color(0x090a0e);
scene.fog = new THREE.Fog(0x090a0e, 6.5, 15);

const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 60);
const camState = { x: 1.9, y: 1.5, z: 2.6 };
const camTarget = { x: 0, y: 1.4, z: 0 };

const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

/* ---------- lights (cool studio, like the reference film) ---------- */
scene.add(new THREE.HemisphereLight(0x9db4d6, 0x0a0a0c, 0.7));

const keyLight = new THREE.DirectionalLight(0xf5f2ea, 2.4);
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

const rimLight = new THREE.DirectionalLight(0x88a8e8, 1.6);
rimLight.position.set(-5, 3, -5);
scene.add(rimLight);

const coolFill = new THREE.DirectionalLight(0x4a5cff, 0.5);
coolFill.position.set(0, 2, -6);
scene.add(coolFill);

/* two small floor light fixtures behind the bike (studio look) */
const matFix = new THREE.MeshBasicMaterial({ color: 0xe8f2ff, transparent: true, opacity: 1 });
const fixGroup = new THREE.Group();
const fixLights = [];
for (const s of [-1, 1]) {
  const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.1), matFix);
  fixture.position.set(s * 1.7, 0.045, -2.25);
  fixGroup.add(fixture);
  const l = new THREE.PointLight(0xdfeaff, 3, 7, 2);
  l.position.set(s * 1.7, 0.3, -2.1);
  fixGroup.add(l);
  fixLights.push(l);
}
scene.add(fixGroup);

/* ---------- glossy dark floor ---------- */
const ground = new THREE.Mesh(
  new THREE.CircleGeometry(18, 48),
  new THREE.MeshStandardMaterial({ color: 0x0a0b0e, roughness: 0.5, metalness: 0.35 })
);
ground.material.envMapIntensity = 0.25; // keep the dark floor dark
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* showroom turntable pedestal + top spot (finale) */
const matPedestal = new THREE.MeshBasicMaterial({ color: 0xe6edf6, transparent: true, opacity: 0 });
const pedestal = new THREE.Mesh(new THREE.CircleGeometry(1.45, 64), matPedestal);
pedestal.rotation.x = -Math.PI / 2;
pedestal.position.y = 0.004;
scene.add(pedestal);

const spotTarget = new THREE.Object3D();
scene.add(spotTarget);
const topSpot = new THREE.SpotLight(0xffffff, 0, 20, 0.35, 0.7, 1.2);
topSpot.position.set(0, 7, 0.6);
topSpot.target = spotTarget;
scene.add(topSpot);

/* ---------- materials (matte black + gold accents) ---------- */
const matTire = new THREE.MeshStandardMaterial({ color: 0x0e0e11, roughness: 0.95, metalness: 0 });
const matGun = new THREE.MeshStandardMaterial({ color: 0x2c2f36, roughness: 0.28, metalness: 0.92 });
const matDark = new THREE.MeshStandardMaterial({ color: 0x17171c, roughness: 0.5, metalness: 0.75 });
const matSteel = new THREE.MeshStandardMaterial({ color: 0xb9bfc7, roughness: 0.3, metalness: 1 });
const matFins = new THREE.MeshStandardMaterial({ color: 0x484c54, roughness: 0.4, metalness: 0.9 });
const matSeat = new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.85, metalness: 0.1 });
const matAccent = new THREE.MeshPhysicalMaterial({
  color: 0xc9962e, roughness: 0.24, metalness: 1, clearcoat: 0.6, clearcoatRoughness: 0.2
});
const matBlackMatte = new THREE.MeshPhysicalMaterial({
  color: 0x16181c, roughness: 0.55, metalness: 0.35, clearcoat: 0.18, clearcoatRoughness: 0.5
});
const matRing = new THREE.MeshStandardMaterial({
  color: 0x1a1a1e, emissive: 0xe8f2ff, emissiveIntensity: 0.12, roughness: 0.3, metalness: 0.4
});
const matTail = new THREE.MeshStandardMaterial({
  color: 0x330508, emissive: 0xff1626, emissiveIntensity: 0.8, roughness: 0.3
});
const matGlass = new THREE.MeshStandardMaterial({
  color: 0x1c2230, roughness: 0.08, metalness: 0.9, transparent: true, opacity: 0.4
});
[matTire, matGun, matDark, matSteel, matFins, matSeat, matAccent, matBlackMatte, matRing, matGlass]
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

/* --- engine (the film opens on it, floating alone) --- */
makePart('engine', v3(0, 0.5, 0), (g) => {
  const crank = box(0.54, 0.3, 0.32, matGun); crank.position.set(-0.04, 0.42, 0); g.add(crank);
  const block = box(0.34, 0.3, 0.3, matGun); block.position.set(0.1, 0.66, 0); block.rotation.z = -0.3; g.add(block);
  const head = box(0.36, 0.14, 0.32, matDark); head.position.set(0.17, 0.8, 0); head.rotation.z = -0.3; g.add(head);
  const finDir = v3(Math.sin(0.3), Math.cos(0.3), 0);
  for (let i = 0; i < 5; i++) {
    const f = box(0.37, 0.012, 0.32, matFins);
    f.position.copy(v3(0.07, 0.57, 0)).addScaledVector(finDir, i * 0.048);
    f.rotation.z = -0.3;
    g.add(f);
  }
  const clutch = cyl(0.12, 0.06, matDark); clutch.rotation.x = Math.PI / 2; clutch.position.set(-0.16, 0.42, 0.185); g.add(clutch);
  const gen = cyl(0.1, 0.05, matDark); gen.rotation.x = Math.PI / 2; gen.position.set(-0.16, 0.42, -0.185); g.add(gen);
  // radiator hanging in front of the block
  const rad = box(0.05, 0.3, 0.32, matDark); rad.position.set(0.35, 0.6, 0); rad.rotation.z = -0.15; g.add(rad);
});

/* --- trellis frame + gold rear shock --- */
makePart('frame', v3(0, 0.7, 0), (g) => {
  g.add(tube(v3(0.5, 1.04, 0), v3(0.6, 0.78, 0), 0.05, matGun));            // headstock
  g.add(tube(v3(0.48, 1.0, 0.06), v3(-0.34, 0.66, 0.06), 0.034, matGun));   // main spars
  g.add(tube(v3(0.48, 1.0, -0.06), v3(-0.34, 0.66, -0.06), 0.034, matGun));
  g.add(tube(v3(0.52, 0.96, 0), v3(0.2, 0.34, 0), 0.04, matGun));           // downtube
  g.add(tube(v3(0.2, 0.32, 0.07), v3(-0.32, 0.42, 0.07), 0.028, matGun));   // cradle
  g.add(tube(v3(0.2, 0.32, -0.07), v3(-0.32, 0.42, -0.07), 0.028, matGun));
  g.add(tube(v3(-0.28, 0.64, 0.05), v3(-0.74, 0.82, 0.05), 0.024, matGun)); // subframe
  g.add(tube(v3(-0.28, 0.64, -0.05), v3(-0.74, 0.82, -0.05), 0.024, matGun));
  // trellis diagonals
  g.add(tube(v3(0.32, 0.9, 0.062), v3(0.18, 0.55, 0.062), 0.018, matGun));
  g.add(tube(v3(0.32, 0.9, -0.062), v3(0.18, 0.55, -0.062), 0.018, matGun));
  g.add(tube(v3(0.08, 0.82, 0.062), v3(-0.06, 0.48, 0.062), 0.018, matGun));
  g.add(tube(v3(0.08, 0.82, -0.062), v3(-0.06, 0.48, -0.062), 0.018, matGun));
  // pivot plates
  const p1 = box(0.16, 0.3, 0.03, matDark); p1.position.set(-0.36, 0.5, 0.075); p1.rotation.z = 0.15; g.add(p1);
  const p2 = box(0.16, 0.3, 0.03, matDark); p2.position.set(-0.36, 0.5, -0.075); p2.rotation.z = 0.15; g.add(p2);
  // gold rear shock, proudly visible like in the film
  g.add(tube(v3(-0.38, 0.45, 0.02), v3(-0.26, 0.74, 0.02), 0.032, matAccent));
});

/* --- swingarm --- */
makePart('swingarm', v3(-0.52, 0.42, 0), (g) => {
  g.add(tube(v3(-0.34, 0.47, 0.1), v3(-0.72, 0.345, 0.1), 0.032, matGun));
  g.add(tube(v3(-0.34, 0.47, -0.1), v3(-0.72, 0.345, -0.1), 0.032, matGun));
  g.add(tube(v3(-0.45, 0.44, -0.1), v3(-0.45, 0.44, 0.1), 0.028, matGun));
});

/* --- wheels (gold rim stripe) --- */
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
    const disc = cyl(0.13, 0.012, matSteel, 32);
    disc.rotation.x = Math.PI / 2; disc.position.set(ax, ay, s); g.add(disc);
  }
}
makePart('rearWheel', v3(-0.72, 0.345, 0), (g) => buildWheel(g, -0.72, 0.345, false));
makePart('frontWheel', v3(0.78, 0.345, 0), (g) => buildWheel(g, 0.78, 0.345, true));

/* soft radial glow sprite for the headlight (no post-processing bloom) */
function makeGlowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.25, 'rgba(210,228,255,0.55)');
  grad.addColorStop(1, 'rgba(210,228,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
const glowMat = new THREE.SpriteMaterial({
  map: makeGlowTexture(), color: 0xdfeaff, transparent: true, opacity: 0,
  blending: THREE.AdditiveBlending, depthWrite: false
});

/* --- front end: gold USD forks, bars, mirrors, LED ring headlight --- */
let headlightPoint;
makePart('front', v3(0.62, 0.75, 0), (g) => {
  g.add(tube(v3(0.52, 1.02, 0.08), v3(0.66, 0.62, 0.08), 0.024, matAccent));   // gold upper tubes
  g.add(tube(v3(0.52, 1.02, -0.08), v3(0.66, 0.62, -0.08), 0.024, matAccent));
  g.add(tube(v3(0.64, 0.68, 0.08), v3(0.78, 0.35, 0.08), 0.034, matBlackMatte)); // lower legs
  g.add(tube(v3(0.64, 0.68, -0.08), v3(0.78, 0.35, -0.08), 0.034, matBlackMatte));
  const clampT = box(0.1, 0.05, 0.24, matDark); clampT.position.set(0.53, 1.0, 0); clampT.rotation.z = -0.34; g.add(clampT);
  const clampB = box(0.1, 0.05, 0.24, matDark); clampB.position.set(0.56, 0.9, 0); clampB.rotation.z = -0.34; g.add(clampB);
  const bar = cyl(0.021, 0.56, matGun); bar.rotation.x = Math.PI / 2; bar.position.set(0.5, 1.08, 0); g.add(bar);
  const gripL = cyl(0.028, 0.11, matSeat); gripL.rotation.x = Math.PI / 2; gripL.position.set(0.5, 1.08, 0.27); g.add(gripL);
  const gripR = cyl(0.028, 0.11, matSeat); gripR.rotation.x = Math.PI / 2; gripR.position.set(0.5, 1.08, -0.27); g.add(gripR);
  // bar-end mirrors (like the film's front shot)
  for (const s of [1, -1]) {
    g.add(tube(v3(0.5, 1.09, s * 0.28), v3(0.46, 1.19, s * 0.34), 0.009, matDark));
    const cap = cyl(0.045, 0.012, matDark);
    cap.rotation.z = Math.PI / 2;
    cap.position.set(0.455, 1.2, s * 0.345);
    g.add(cap);
  }
  // front fender
  const fender = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.03, 10, 26, 1.9), matBlackMatte);
  fender.position.set(0.78, 0.345, 0);
  fender.rotation.z = Math.PI / 2 - 0.95;
  fender.castShadow = true;
  g.add(fender);
  // round headlight with LED ring
  const housing = cyl(0.1, 0.09, matBlackMatte); housing.rotation.z = Math.PI / 2; housing.position.set(0.57, 1.02, 0); g.add(housing);
  const face = cyl(0.085, 0.012, matDark); face.rotation.z = Math.PI / 2; face.position.set(0.615, 1.02, 0); g.add(face);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.014, 10, 40), matRing);
  ring.rotation.y = Math.PI / 2;
  ring.position.set(0.628, 1.02, 0);
  g.add(ring);
  // small screen
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.16), matGlass);
  screen.position.set(0.52, 1.18, 0); screen.rotation.y = -Math.PI / 2; screen.rotation.z = -0.4; g.add(screen);
  headlightPoint = new THREE.PointLight(0xdfeaff, 0, 8, 2);
  headlightPoint.position.set(0.9, 1.0, 0);
  g.add(headlightPoint);
  const glow = new THREE.Sprite(glowMat);
  glow.scale.set(0.85, 0.85, 1);
  glow.position.set(0.68, 1.02, 0);
  g.add(glow);
});

/* --- bodywork (matte black tank, seat, tail) --- */
makePart('body', v3(-0.1, 0.85, 0), (g) => {
  const tank = new THREE.Mesh(new THREE.SphereGeometry(0.5, 36, 24), matBlackMatte);
  tank.scale.set(0.62, 0.26, 0.38);
  tank.position.set(0.12, 0.88, 0);
  tank.rotation.z = -0.12;
  tank.castShadow = true;
  g.add(tank);
  const seat = box(0.42, 0.06, 0.24, matSeat); seat.position.set(-0.28, 0.83, 0); seat.rotation.z = 0.06; g.add(seat);
  const tail = box(0.32, 0.11, 0.2, matBlackMatte); tail.position.set(-0.57, 0.87, 0); tail.rotation.z = 0.18; g.add(tail);
  const tlight = box(0.02, 0.05, 0.14, matTail); tlight.position.set(-0.73, 0.91, 0); tlight.rotation.z = 0.18; g.add(tlight);
  const panL = box(0.24, 0.16, 0.02, matBlackMatte); panL.position.set(-0.42, 0.68, 0.13); panL.rotation.z = 0.2; g.add(panL);
  const panR = box(0.24, 0.16, 0.02, matBlackMatte); panR.position.set(-0.42, 0.68, -0.13); panR.rotation.z = 0.2; g.add(panR);
});

/* --- exhaust (steel headers + low muffler) --- */
makePart('exhaust', v3(-0.2, 0.3, 0.14), (g) => {
  const curve = new THREE.CatmullRomCurve3([
    v3(0.28, 0.68, 0.1), v3(0.5, 0.45, 0.14), v3(0.38, 0.26, 0.15),
    v3(-0.1, 0.22, 0.15), v3(-0.45, 0.28, 0.16)
  ]);
  const pipe = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.036, 12), matSteel);
  pipe.castShadow = true;
  g.add(pipe);
  const muffler = tube(v3(-0.45, 0.28, 0.16), v3(-0.85, 0.5, 0.18), 0.075, matSteel, 20);
  g.add(muffler);
  const tip = cyl(0.05, 0.04, matSeat);
  tip.position.set(-0.85, 0.5, 0.18);
  tip.quaternion.setFromUnitVectors(UP, v3(-0.4, 0.22, 0.02).normalize());
  g.add(tip);
});

/* ---------- tunnel light bars (ride sequence) ---------- */
const barMat = new THREE.MeshBasicMaterial({
  color: 0xdfe9ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false
});
const barsGroup = new THREE.Group();
const barData = [];
/* rows are placed behind and in front of the bike relative to the ride
   camera (which sits around z=2.4), so the streaks frame the machine;
   foreground rows are thinner because they pass close to the lens */
const barRows = [
  [-3.4, 0.7, 0.05], [-3.4, 1.8, 0.05], [-2.6, 1.2, 0.05], [-2.6, 2.4, 0.05], // far wall
  [1.3, 0.3, 0.028], [1.3, 1.7, 0.028]                                        // foreground
];
for (const [z, y, s] of barRows) {
  for (let i = 0; i < 7; i++) {
    const len = 2 + Math.random() * 2;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, s, s), barMat);
    mesh.position.set(-14 + i * 4 + Math.random() * 2.5, y, z);
    barsGroup.add(mesh);
    barData.push({ mesh, speed: 28 + Math.random() * 8 });
  }
}
scene.add(barsGroup);

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
  fixGroup.visible = false;
  pedestal.visible = false;
  const prevRing = matRing.emissiveIntensity;
  matRing.emissiveIntensity = 2.5;
  const prevRot = bikeGroup.rotation.y;
  bikeGroup.rotation.y = -0.5;
  const colorways = [
    ['thumb-zero1', 0xc9962e],
    ['thumb-zeros', 0x9ba3ad],
    ['thumb-zerocafe', 0x2e5f4a]
  ];
  for (const [id, color] of colorways) {
    matAccent.color.setHex(color);
    tr.render(scene, tc);
    const img = document.getElementById(id);
    if (img) img.src = tr.domElement.toDataURL('image/png');
  }
  matAccent.color.setHex(0xc9962e);
  bikeGroup.rotation.y = prevRot;
  matRing.emissiveIntensity = prevRing;
  scene.background = prevBg;
  scene.fog = prevFog;
  ground.visible = true;
  fixGroup.visible = true;
  pedestal.visible = true;
  scene.remove(fillA, fillB);
  tr.dispose();
}

/* ============================================================
   SCATTER + SCROLL TIMELINE
   ============================================================
   The engine hovers alone at center stage; every other part
   waits deep in the dark background haze and flies in on cue. */
const SCATTER = {
  engine:     { p: [0, 0.25, 0],      r: [0.06, 0.35, 0.04] },
  frame:      { p: [-5.5, 3.4, -1.2], r: [0.5, 0.7, 0.4] },
  swingarm:   { p: [-5.0, 0.6, 1.5],  r: [0.3, -0.9, 0.6] },
  rearWheel:  { p: [-4.8, 3.2, -0.8], r: [0.8, 0.4, 0.2] },
  frontWheel: { p: [4.5, 2.6, -0.8],  r: [-0.5, 0.7, 0.4] },
  front:      { p: [4.8, 0.7, 1.2],   r: [0.4, 0.3, 0.9] },
  body:       { p: [0.6, 4.3, -1.8],  r: [-0.3, 0.9, 0.3] },
  exhaust:    { p: [-1.5, 3.2, 1.8],  r: [0.7, -0.4, -0.7] }
};
const FLOAT_Y = 0.55; // the whole machine assembles airborne, then drops

function scatterParts() {
  for (const name in SCATTER) {
    const { holder, ud } = parts[name];
    const s = SCATTER[name];
    holder.position.set(ud.center.x + s.p[0], ud.center.y + s.p[1], ud.center.z + s.p[2]);
    holder.rotation.set(s.r[0], s.r[1], s.r[2]);
    ud.scatter = 1;
  }
  bikeGroup.position.y = FLOAT_Y;
  bikeGroup.rotation.y = -0.15;
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

  /* HERO — the engine alone, floating in the dark (film opening) */
  tl.to('.hero-inner', { autoAlpha: 0, y: -80, duration: 5, ease: 'power1.in' }, 0.5);
  tl.to(bikeGroup.rotation, { y: 0.35, duration: 12 }, 1);
  cam(4, 9, [2.2, 1.45, 3.0], [0, 1.35, 0]);
  capIn('#cap1', 5); capOut('#cap1', 12.5);

  /* STEP 2 — the frame arrives and embraces the engine */
  cam(14, 9, [2.6, 1.25, 3.7], [0.05, 1.05, 0]);
  tl.to(bikeGroup.rotation, { y: -0.2, duration: 10 }, 14);
  assemble('engine', 15, 6);   // engine settles into its final slot
  assemble('frame', 15.5, 7.5);
  capIn('#cap2', 15.5); capOut('#cap2', 23.5);

  /* STEP 3 — chassis attaches airborne, then the bike drops onto its wheels */
  cam(25, 12, [2.5, 0.85, 4.1], [0, 0.72, 0]);
  tl.to(bikeGroup.rotation, { y: -0.55, duration: 13 }, 25);
  assemble('swingarm', 25, 4.5);
  assemble('rearWheel', 26.5, 4.5);
  assemble('front', 28.5, 5);
  assemble('frontWheel', 30.5, 4.5);
  assemble('exhaust', 32, 4.5);
  tl.to(bikeGroup.position, { y: 0, duration: 3, ease: 'power3.in' }, 36.5); // touchdown
  tl.to(camTarget, { y: 0.55, duration: 3.5 }, 36);
  capIn('#cap3', 26); capOut('#cap3', 38.5);

  /* STEP 4 — matte-black bodywork + close-up beauty glide */
  cam(41, 5, [1.7, 1.05, 2.1], [0.35, 0.85, 0]);
  cam(46.5, 5.5, [-0.5, 0.95, 2.0], [-0.35, 0.8, 0]);
  tl.to(bikeGroup.rotation, { y: 0.12, duration: 10 }, 41);
  assemble('body', 41.5, 6);
  capIn('#cap4', 42.5); capOut('#cap4', 51);

  /* IGNITION — front view, the LED ring wakes up (film front shot) */
  cam(53, 5, [4.4, 0.95, 0.9], [0.55, 0.9, 0]);
  tl.to(bikeGroup.rotation, { y: -0.04, duration: 5 }, 53);
  tl.to(matRing, { emissiveIntensity: 6, duration: 1.6, ease: 'power4.in' }, 56);
  tl.to(headlightPoint, { intensity: 12, duration: 2 }, 56);
  tl.to(glowMat, { opacity: 0.85, duration: 2, ease: 'power3.in' }, 56);
  cam(58, 3, [4.15, 0.95, 0.75], [0.55, 0.9, 0]);
  capIn('#cap5', 54); capOut('#cap5', 60.5);

  /* RIDE — tunnel run: streaking light bars past a rolling machine */
  cam(61, 5, [3.9, 0.8, 2.4], [0.45, 0.7, 0]);
  tl.to(bikeGroup.rotation, { y: -0.12, duration: 5 }, 61);
  tl.to(speed, { v: 1, duration: 6, ease: 'power2.in' }, 61);
  tl.to(barMat, { opacity: 0.7, duration: 4 }, 62);
  for (const l of fixLights) tl.to(l, { intensity: 0, duration: 3 }, 62);
  tl.to(matFix, { opacity: 0, duration: 3 }, 62);
  capIn('#cap6', 63.5); capOut('#cap6', 71);
  // subtle banking left / right, like lane changes in the tunnel
  tl.to(bikeGroup.rotation, { x: 0.045, duration: 3 }, 66);
  tl.to(bikeGroup.rotation, { x: -0.04, duration: 3.5 }, 70);
  tl.to(bikeGroup.rotation, { x: 0, duration: 2.5 }, 74);
  // exit: nose lifts and the bike launches past the camera
  tl.to(bikeGroup.rotation, { z: 0.05, duration: 2.5, ease: 'power2.out' }, 74);
  tl.to(bikeGroup.rotation, { z: 0, duration: 2.5 }, 77.5);
  tl.to(bikeGroup.position, { x: 9.5, duration: 6, ease: 'power2.in' }, 74);
  tl.to(camTarget, { x: 2.0, duration: 6 }, 74);
  tl.to(barMat, { opacity: 0, duration: 4 }, 77);

  /* FINALE — hard cut to the showroom turntable (film ending) */
  tl.set(bikeGroup.position, { x: 0, y: 0 }, 82);
  tl.set(bikeGroup.rotation, { x: 0, y: -0.5, z: 0 }, 82);
  tl.set(speed, { v: 0 }, 82);
  tl.set(camState, { x: 3.3, y: 1.3, z: 4.6 }, 82);
  tl.set(camTarget, { x: 0, y: 0.62, z: 0 }, 82);
  tl.to(matPedestal, { opacity: 0.75, duration: 4, ease: 'power2.out' }, 82);
  tl.to(topSpot, { intensity: 120, duration: 4 }, 82);
  for (const l of fixLights) tl.to(l, { intensity: 6, duration: 4 }, 84);
  tl.to(matFix, { opacity: 1, duration: 4 }, 84);
  tl.to(bikeGroup.rotation, { y: -2.1, duration: 18, ease: 'none' }, 82); // slow turntable
  capIn('#cap7', 84.5); capOut('#cap7', 93);

  /* OUTRO CTA */
  tl.fromTo('.stage-outro', { autoAlpha: 0 }, { autoAlpha: 1, duration: 5, ease: 'power2.out' }, 93);
  tl.set('.stage-outro', { pointerEvents: 'auto' }, 95);
  tl.to({}, { duration: 2 }, 98); // tail padding

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

  // idle float on parts that are still detached
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

  // wheel spin (slow idle while floating, fast during the tunnel run)
  rearSpin += dt * (0.8 * parts.rearWheel.ud.scatter + 26 * speed.v);
  frontSpin += dt * (0.8 * parts.frontWheel.ud.scatter + 26 * speed.v);
  parts.rearWheel.spinner.rotation.z = -rearSpin;
  parts.frontWheel.spinner.rotation.z = -frontSpin;

  // tunnel light bars streak past
  if (barMat.opacity > 0.001) {
    for (const b of barData) {
      b.mesh.position.x -= b.speed * speed.v * dt;
      if (b.mesh.position.x < -14) b.mesh.position.x += 28;
    }
  }
  barsGroup.visible = barMat.opacity > 0.001;

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
scatterParts();        // then stage the opening: engine alone, parts in the dark
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
