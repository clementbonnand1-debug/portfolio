/* Clément Bonnand — Portfolio Vol. 1
   Two hands, one record, a turntable. Scroll = play. Drag = turn. */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
gsap.registerPlugin(ScrollTrigger);
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mobile = () => innerWidth <= 820;
const N = 12;
const TITLES = ["Cover", "Who's the guy", "Saint-Martin", "Atlantic coast & the road", "DC Shoes Europe", "Rotary Club & Surfattitude",
  "DC Shoes internships & summer jobs", "School of thought", "What I'm into", "On repeat", "AI Lab", "Let's talk"];
const LENS = ["0:00", "3:12", "4:01", "3:27", "5:48", "4:10", "3:36", "2:54", "3:03", "4:44", "3:58", "3:07"];

/* ---------------- loader ---------------- */
const ld = { v: 0 }, ldNum = $("#ldNum");
const ldTween = gsap.to(ld, { v: 90, duration: 2.5, ease: "power2.out", onUpdate: () => (ldNum.textContent = Math.round(ld.v)) });

/* ---------------- renderer / scene ---------------- */
const canvas = $("#gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.05, 200);

scene.add(new THREE.HemisphereLight(0xfff4e8, 0x0a0a12, 0.5));
const key = new THREE.DirectionalLight(0xfff1e0, 2.6); key.position.set(-4, 6, 7); scene.add(key);
const rim = new THREE.DirectionalLight(0xff5a24, 3.2); rim.position.set(6, 2, -6); scene.add(rim);
const fillLight = new THREE.PointLight(0x7f8cff, 6, 30, 1.6); fillLight.position.set(-5, -2, 4); scene.add(fillLight);

const rig = new THREE.Group(); scene.add(rig);

/* ---------------- textures (canvas) ---------------- */
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
function tex(cv) { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); return t; }
function mk(w, h = w) { const c = document.createElement("canvas"); c.width = w; c.height = h; return [c, c.getContext("2d")]; }

async function coverTexture() {
  const [c, x] = mk(2048);
  x.fillStyle = "#0c0b0a"; x.fillRect(0, 0, 2048, 2048);
  const img = await loadImg("../assets/img/me/sunset.webp");
  if (img) { const w = 2048, h = w * img.height / img.width; x.drawImage(img, 0, (2048 - h) / 2 + 60, w, h); }
  // top & bottom bands
  x.fillStyle = "#0c0b0a"; x.fillRect(0, 0, 2048, 300); x.fillRect(0, 1840, 2048, 208);
  x.fillStyle = "#f1eee8"; x.font = "900 132px Unbounded"; x.textBaseline = "top";
  const wC = x.measureText("CLÉMENT").width, wB = x.measureText("BONNAND").width, gap = (2048 - 140 - wC - wB);
  x.fillText("CLÉMENT", 70, 84);
  x.strokeStyle = "#f1eee8"; x.lineWidth = 5; x.strokeText("BONNAND", 70 + wC + gap, 84);
  x.font = "400 44px JB"; x.fillStyle = "#f1eee8";
  x.fillText("PORTFOLIO — VOL. 1", 70, 1910); x.textAlign = "right"; x.fillText("MARKETING & COMMUNICATION — 2027", 1978, 1910);
  // sticker
  x.save(); x.translate(1720, 1560); x.rotate(-0.25);
  x.fillStyle = "#ff4d1a"; x.beginPath(); x.arc(0, 0, 190, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#050505"; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = "900 56px Unbounded"; x.fillText("OPEN", 0, -62); x.fillText("TO WORK", 0, 4); x.font = "700 40px JB"; x.fillText("SEPT. 2027", 0, 72);
  x.restore();
  return tex(c);
}
function backTexture() {
  const [c, x] = mk(2048);
  x.fillStyle = "#ece7dd"; x.fillRect(0, 0, 2048, 2048);
  x.fillStyle = "#0c0b0a"; x.textBaseline = "top";
  x.font = "900 120px Unbounded"; x.fillText("CLÉMENT", 110, 110); x.fillText("BONNAND", 110, 240);
  x.font = "400 40px JB"; x.fillText("PORTFOLIO — VOL. 1 — 33⅓ RPM — STEREO", 114, 400);
  x.fillRect(110, 480, 1828, 6);
  const col = (side, list, x0) => {
    x.font = "900 64px Unbounded"; x.fillText(side, x0, 540);
    list.forEach((t, i) => { x.font = "400 40px JB"; x.fillText(String(t[0]).padStart(2, "0"), x0, 660 + i * 96); x.font = "700 46px Unbounded"; x.fillText(t[1], x0 + 90, 652 + i * 96); });
  };
  col("SIDE A", [[1, "Who's the guy"], [2, "Saint-Martin"], [3, "Atlantic coast"], [4, "DC Shoes Europe"], [5, "Rotary Club"], [6, "Surfattitude"]], 110);
  col("SIDE B", [[7, "DC internships"], [8, "Summer jobs"], [9, "School of thought"], [10, "What I'm into"], [11, "On repeat"], [12, "AI Lab"]], 1060);
  x.fillRect(110, 1300, 1828, 3);
  x.font = "400 36px Inter T";
  ["Produced, written & art directed by Clément Bonnand.", "Recorded between Saint-Martin, the Landes and the Basque coast.", "Master 2 — Marketing, Brand Strategy & Communication · INSEEC · 2027."].forEach((l, i) => x.fillText(l, 110, 1350 + i * 58));
  // barcode
  let bx = 1500; for (let i = 0; i < 60; i++) { const w = [3, 5, 8][(i * 7) % 3]; x.fillRect(bx, 1620, w, 220); bx += w + [3, 6, 4][(i * 5) % 3]; }
  x.font = "400 30px JB"; x.fillText("3 760 2027 0923 1", 1500, 1856);
  x.fillStyle = "#ff4d1a"; x.beginPath(); x.arc(250, 1780, 120, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#0c0b0a"; x.textAlign = "center"; x.textBaseline = "middle"; x.font = "900 44px Unbounded"; x.fillText("C.B", 250, 1780);
  return tex(c);
}
function grooveTexture() {
  const [c, x] = mk(2048); const C = 1024;
  x.fillStyle = "#0b0b0b"; x.fillRect(0, 0, 2048, 2048);
  for (let r = 1020; r > 300; r -= 2.2) { const a = 0.05 + 0.06 * Math.sin(r * 0.37) + 0.03 * Math.random(); x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 1; x.beginPath(); x.arc(C, C, r, 0, Math.PI * 2); x.stroke(); }
  // track gaps
  for (const r of [920, 820, 720, 610, 500, 410]) { x.strokeStyle = "rgba(0,0,0,.9)"; x.lineWidth = 6; x.beginPath(); x.arc(C, C, r, 0, Math.PI * 2); x.stroke(); }
  return tex(c);
}
function labelTexture(side) {
  const [c, x] = mk(1024); const C = 512;
  const A = side === "A";
  x.fillStyle = A ? "#ff4d1a" : "#ece7dd"; x.beginPath(); x.arc(C, C, 512, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#0c0b0a"; x.textAlign = "center"; x.textBaseline = "middle";
  x.font = "900 150px Unbounded"; x.fillText(A ? "A" : "B", C, 300);
  x.font = "900 62px Unbounded"; x.fillText("CLÉMENT", C, 640); x.fillText("BONNAND", C, 712);
  x.font = "400 34px JB"; x.fillText(A ? "SIDE A — STORY" : "SIDE B — WORK", C, 810); x.fillText("33⅓ RPM · VOL. 1 · 2027", C, 860);
  // ring text
  const ring = (A ? "PORTFOLIO · MARKETING · COMMUNICATION · BRAND · " : "OPEN TO WORK · SEPTEMBER 2027 · FULL-TIME · ").repeat(2);
  x.font = "400 30px JB"; x.save(); x.translate(C, C);
  for (let i = 0; i < ring.length; i++) { x.save(); x.rotate(i / ring.length * Math.PI * 2); x.fillText(ring[i], 0, -455); x.restore(); }
  x.restore();
  x.fillStyle = "#050505"; x.beginPath(); x.arc(C, C, 22, 0, Math.PI * 2); x.fill();
  return tex(c);
}

/* ---------------- objects ---------------- */
const SLEEVE = 3, DISC_R = 1.42;
const sleeveG = new THREE.Group(); rig.add(sleeveG);
const discG = new THREE.Group(); rig.add(discG);
const discSpin = new THREE.Group(); discG.add(discSpin);
const tt = new THREE.Group(); rig.add(tt);
const handMat = new THREE.MeshPhysicalMaterial({ color: 0xe9e3da, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4, transparent: true });
const armMat = new THREE.MeshStandardMaterial({ color: 0x070707, roughness: 0.9, transparent: true });

function buildTurntable() {
  const top = 0.225;
  const lacquer = new THREE.MeshPhysicalMaterial({ color: 0x111111, roughness: 0.32, clearcoat: 0.8, clearcoatRoughness: 0.2 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xd9d9d9, metalness: 1, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.6, metalness: 0.4 });
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.45, 4.3), lacquer); tt.add(plinth);
  const platter = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.14, 128), metal); platter.position.set(-0.55, top + 0.07, 0); tt.add(platter);
  const mat = new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.02, 96), new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1 })); mat.position.set(0, 0.08, 0); platter.add(mat);
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 16), metal); spindle.position.set(0, 0.12, 0); platter.add(spindle);
  // tonearm
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.22, 48), dark); base.position.set(1.95, top + 0.11, -1.25); tt.add(base);
  const pivot = new THREE.Group(); pivot.position.set(1.95, top + 0.32, -1.25); tt.add(pivot);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.9, 16), metal); tube.rotation.x = Math.PI / 2; tube.position.set(0, 0, 1.35); pivot.add(tube);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 0.38), dark); head.position.set(-0.05, -0.05, 2.85); head.rotation.y = 0.35; pivot.add(head);
  const cw = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 32), metal); cw.rotation.x = Math.PI / 2; cw.position.set(0, 0, -0.35); pivot.add(cw);
  const rest = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 12), dark); rest.position.set(2.25, top + 0.15, 1.2); tt.add(rest);
  // details
  const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32), new THREE.MeshStandardMaterial({ color: 0xff4d1a, emissive: 0xff3a10, emissiveIntensity: 0.6 })); btn.position.set(-2.3, top + 0.02, 1.65); tt.add(btn);
  for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.04, 0.16), dark); b.position.set(-1.8 + i * 0.42, top + 0.02, 1.7); tt.add(b); }
  const strobe = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 16), new THREE.MeshBasicMaterial({ color: 0xff2a00 })); strobe.position.set(-2.35, top + 0.04, -1.7); tt.add(strobe);
  tt.userData = { platter, pivot, platterTop: top + 0.14 + 0.02 };
}
buildTurntable();

const hands = {};
const CHAINS = [["thumb-metacarpal", "thumb-phalanx-proximal", "thumb-phalanx-distal", "thumb-tip"]]
  .concat(["index", "middle", "ring", "pinky"].map(f => [f + "-finger-metacarpal", f + "-finger-phalanx-proximal", f + "-finger-phalanx-intermediate", f + "-finger-phalanx-distal", f + "-finger-tip"]));
function fk(h, rot) {
  const B = h.bones, E = new THREE.Matrix4(), inv = new THREE.Matrix4(), pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  for (const ch of CHAINS) {
    let prevNew = null, prevRest = null;
    for (const n of ch) {
      const b = B[n]; if (!b) continue;
      const rest = b.userData.m0, r = rot[n];
      E.makeRotationFromEuler(new THREE.Euler(...(r || [0, 0, 0])));
      const M = prevNew ? prevNew.clone().multiply(inv.copy(prevRest).invert().multiply(rest)).multiply(E) : rest.clone().multiply(E);
      M.decompose(pos, q, sc); b.position.copy(pos); b.quaternion.copy(q);
      prevNew = M; prevRest = rest;
    }
  }
}
const FING = c => { const o = {}; for (const f of ["index", "middle", "ring", "pinky"]) { o[f + "-finger-phalanx-proximal"] = [-c, 0, 0]; o[f + "-finger-phalanx-intermediate"] = [-c * .7, 0, 0]; o[f + "-finger-phalanx-distal"] = [-c * .4, 0, 0]; } return o; };
const THUMB = P => ({ "thumb-metacarpal": P.slice(0, 3), "thumb-phalanx-proximal": P.slice(3, 6), "thumb-phalanx-distal": P.slice(6, 9) });
// solved offline (see repo history): grips relative to the held object
const GRIP = {
  sR: { p: [1.5964, -0.4875, 0.0945], q: [-0.5691, -0.41967, 0.5691, -0.41967], s: 8, thumb: [-0.399, -0.304, -0.002, -0.186, 0.121, 0, -0.213, -0.198, 0.002], curl: .04 },
  sL: { p: [-1.6187, -0.5031, 0.0801], q: [0.5691, -0.41967, 0.5691, 0.41967], s: 8, thumb: [-0.38, 0.346, -0.003, -0.177, -0.12, -0.005, -0.205, 0.187, -0.003], curl: .04 },
  dR: { p: [1.4764, -0.4875, 0.1395], q: [-0.5691, -0.41967, 0.5691, -0.41967], s: 8, thumb: [-0.428, -0.381, 0.001, -0.2, 0.106, 0.006, -0.213, -0.159, 0.002], curl: .06 },
};
const gripMat = g => new THREE.Matrix4().compose(new THREE.Vector3(...g.p), new THREE.Quaternion(...g.q), new THREE.Vector3(g.s, g.s, g.s));

async function loadHands() {
  const L = new GLTFLoader();
  for (const side of ["right", "left"]) {
    const g = await L.loadAsync(`./models/${side}.glb`);
    const root = g.scene, holder = new THREE.Group();
    holder.matrixAutoUpdate = false;
    root.traverse(o => { if (o.isMesh) { o.material = handMat; o.frustumCulled = false; } });
    holder.add(root); rig.add(holder);
    const bones = {}; root.traverse(o => { if (/finger|thumb|wrist/.test(o.name)) bones[o.name] = o; });
    for (const b of Object.values(bones)) { b.updateMatrix(); b.userData.m0 = b.matrix.clone(); }
    // black sleeve / forearm hides the wrist cut and melts into the background
    const w = bones["wrist"].position;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.042, 0.6, 24), armMat);
    arm.position.set(w.x, w.y + 0.3, w.z); root.add(arm);
    hands[side] = { root, holder, bones, arm };
  }
  fk(hands.left, { ...FING(GRIP.sL.curl), ...THUMB(GRIP.sL.thumb) });
}

/* ---------------- record + sleeve ---------------- */
async function buildRecord() {
  await Promise.all([document.fonts.load("900 100px Unbounded"), document.fonts.load("700 40px Unbounded"), document.fonts.load("400 30px JB"), document.fonts.load("400 30px 'Inter T'")]);
  const [cover] = await Promise.all([coverTexture()]);
  const edge = new THREE.MeshStandardMaterial({ color: 0x1a1816, roughness: 0.8 });
  const sleeve = new THREE.Mesh(new THREE.BoxGeometry(SLEEVE, SLEEVE, 0.05), [edge, edge, edge, edge,
    new THREE.MeshStandardMaterial({ map: cover, roughness: 0.55 }), new THREE.MeshStandardMaterial({ map: backTexture(), roughness: 0.6 })]);
  sleeveG.add(sleeve);
  const vinyl = new THREE.MeshPhysicalMaterial({ color: 0xffffff, map: grooveTexture(), roughness: 0.32, metalness: 0.1, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(DISC_R, DISC_R, 0.02, 160), [new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.4 }), vinyl, vinyl]);
  disc.rotation.x = Math.PI / 2; discSpin.add(disc);
  const la = new THREE.Mesh(new THREE.CircleGeometry(0.52, 96), new THREE.MeshStandardMaterial({ map: labelTexture("A"), roughness: 0.7 }));
  la.position.z = 0.0112; discSpin.add(la);
  const lb = new THREE.Mesh(new THREE.CircleGeometry(0.52, 96), new THREE.MeshStandardMaterial({ map: labelTexture("B"), roughness: 0.7 }));
  lb.position.z = -0.0112; lb.rotation.y = Math.PI; discSpin.add(lb);
}

/* ---------------- choreography params ---------------- */
const P = {
  sx: 0, sy: 0, sz: 0, srx: 0, sry: 0, srz: 0,      // sleeve
  out: 0, free: 0,                                    // disc out of sleeve, blend to free pose
  dx: 0.3, dy: 0.05, dz: 0.4, drx: 0.08, dry: -0.25, drz: 0, spin: 0,
  grip: 0, away: 0, bob: 1,
  tty: -9, arm: 0, play: 0,
  cx: 0, cy: 0.15, cz: 11, tx: 0, ty: 0, tz: 0, vo: 0, vy: 0.12, name: 1,
};
function buildTimeline() {
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  const at = (t, vars, d = 0.6) => tl.to(P, { ...vars, duration: d }, t);
  const side = () => (mobile() ? 0 : 0.17);
  // 01 — flip to the back cover
  at(1.02, { sry: Math.PI, srx: 0.04, cz: 8.4, cy: 0.1, vo: side(), vy: () => (mobile() ? 0.2 : 0), name: 0 }, 0.7);
  // 02 — turn back to front 3/4, grab the disc, pull it out
  at(2.02, { sry: Math.PI * 2 - 0.42, srx: 0.06, cz: 8.8 }, 0.55);
  at(2.5, { grip: 1 }, 0.2);
  at(2.62, { out: 1.95 }, 0.36);
  // 03 — sleeve flies away, the record comes to the front
  at(3.02, { sx: -14, sz: -7, sry: Math.PI * 2 + 0.6, srz: 0.5, free: 1, cz: 7.4 }, 0.7);
  // 04 — show side A, tilted
  at(4.02, { dry: 0.6, drx: 0.3, spin: Math.PI * 0.6, dx: 0.2, cz: 7.0 }, 0.7);
  // 05 — flip to side B
  at(5.02, { dry: 0.3, drx: Math.PI - 0.25, spin: Math.PI * 1.2 }, 0.7);
  // 06 — close-up on the label
  at(6.02, { cx: 0.5, cy: 0.3, cz: 4.8, tx: 0.3, ty: 0.05, dry: -0.25, drx: Math.PI + 0.15, spin: Math.PI * 1.7 }, 0.7);
  // 07 — the turntable rises, record goes flat above the platter
  at(7.02, { tty: -2.43, bob: 0, dx: -0.55, dy: -1.1, dz: 0, drx: Math.PI / 2, dry: 0, drz: 0, spin: Math.PI * 2,
    cx: 0.6, cy: 4.6, cz: 7.6, tx: 0, ty: -1.9, tz: 0 }, 0.8);
  // 08 — drop it, hand lets go, needle down
  at(8.02, { dy: -2.035 }, 0.4);
  at(8.42, { away: 1 }, 0.4);
  at(8.55, { arm: 1 }, 0.4);
  at(8.6, { play: 1 }, 0.3);
  // 09 — orbit while playing
  at(9.02, { cx: 4.4, cy: 3.6, cz: 4.6, tx: -0.3, ty: -2.0 }, 0.8);
  // 10 — high angle
  at(10.02, { cx: -3.4, cy: 6.4, cz: 3.8, tx: -0.4, ty: -2.0 }, 0.8);
  // 11 — top-down over the spinning label, centred
  at(11.02, { cx: -0.55, cy: 12.5, cz: 0.02, tx: -0.55, ty: -2.0, tz: 0, vo: 0, vy: 0 }, 0.8);
  tl.set({}, {}, N);
  return tl;
}

/* ---------------- per-frame compose ---------------- */
const tmpM = new THREE.Matrix4(), mA = new THREE.Matrix4(), mB = new THREE.Matrix4();
const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), vA = new THREE.Vector3(), vB = new THREE.Vector3(), sA = new THREE.Vector3(), sB = new THREE.Vector3();
const eul = new THREE.Euler(0, 0, 0, "YXZ");
const drag = { x: 0, y: 0, tx: 0, ty: 0 };
let time = 0, platterAngle = 0;

function blendMatrix(m1, m2, t, out) {
  m1.decompose(vA, qA, sA); m2.decompose(vB, qB, sB);
  vA.lerp(vB, t); qA.slerp(qB, t); sA.lerp(sB, t);
  return out.compose(vA, qA, sA);
}
function compose(dt) {
  time += dt;
  const bob = P.bob;
  // sleeve
  sleeveG.position.set(P.sx, P.sy + Math.sin(time * 1.3) * 0.06 * bob, P.sz);
  sleeveG.rotation.set(P.srx + Math.sin(time * 0.9) * 0.03 * bob, P.sry + Math.sin(time * 0.7) * 0.05 * bob, P.srz);
  sleeveG.updateMatrix();
  // disc: inside the sleeve (offset along sleeve x) blended with its free pose
  const inSleeve = mA.copy(sleeveG.matrix).multiply(tmpM.makeTranslation(P.out, 0, 0));
  eul.set(P.drx, P.dry, P.drz);
  const freeM = mB.compose(vB.set(P.dx, P.dy + Math.sin(time * 1.3) * 0.05 * bob, P.dz), qB.setFromEuler(eul), sB.set(1, 1, 1));
  const discM = P.free <= 0 ? inSleeve.clone() : P.free >= 1 ? freeM.clone() : blendMatrix(inSleeve.clone(), freeM.clone(), P.free, new THREE.Matrix4());
  discM.decompose(discG.position, discG.quaternion, discG.scale);
  discG.updateMatrix();
  // disc spin (own axis) + platter
  if (P.play > 0) platterAngle -= dt * 3.49 * P.play; // 33⅓ rpm
  discSpin.rotation.z = P.spin - platterAngle * (P.dy < -2.0 ? 1 : 0);
  if (tt.userData.platter) tt.userData.platter.rotation.y = platterAngle;
  tt.position.y = P.tty; tt.visible = P.tty > -8.9;
  if (tt.userData.pivot) { tt.userData.pivot.rotation.y = lerp(0, -0.68, clamp(P.arm * 1.3, 0, 1)); tt.userData.pivot.rotation.x = lerp(-0.03, 0.072, clamp(P.arm * 2 - 1, 0, 1)); }

  // hands
  if (hands.left) {
    const L = hands.left;
    L.holder.matrix.copy(sleeveG.matrix).multiply(gripMat(GRIP.sL));
    L.holder.visible = P.sx > -13;
    const R = hands.right;
    const onSleeve = mA.copy(sleeveG.matrix).multiply(gripMat(GRIP.sR));
    const onDisc = mB.copy(discG.matrix).multiply(gripMat(GRIP.dR));
    const hm = P.grip <= 0 ? onSleeve : P.grip >= 1 ? onDisc : blendMatrix(onSleeve.clone(), onDisc.clone(), P.grip, new THREE.Matrix4());
    if (P.away > 0) hm.premultiply(tmpM.makeTranslation(P.away * 2.2, P.away * 3.2, P.away * 1.2));
    R.holder.matrix.copy(hm);
    R.holder.matrixWorldNeedsUpdate = true; L.holder.matrixWorldNeedsUpdate = true;
    const g = P.grip, th = GRIP.sR.thumb.map((v, i) => lerp(v, GRIP.dR.thumb[i], g));
    fk(R, { ...FING(lerp(GRIP.sR.curl, GRIP.dR.curl, g) - P.away * 0.25), ...THUMB(th.map(v => v * (1 - P.away * 0.6))) });
    handMat.opacity = 1; armMat.opacity = 1;
    R.holder.visible = P.away < 0.98;
  }
  // drag spring
  drag.x += (drag.tx - drag.x) * 0.08; drag.y += (drag.ty - drag.y) * 0.08;
  if (!dragging) { drag.tx *= 0.92; drag.ty *= 0.92; }
  rig.rotation.set(drag.x, drag.y, 0);
  // camera
  camera.position.set(P.cx, P.cy, P.cz);
  camera.lookAt(P.tx, P.ty, P.tz);
  const W = innerWidth, H = innerHeight;
  camera.setViewOffset(W, H, -P.vo * W, P.vy * H, W, H);
  // hero name
  heroName.style.opacity = P.name; heroName.style.transform = `scale(${1 + (1 - P.name) * 0.25})`;
}

/* ---------------- interaction ---------------- */
let dragging = false, downX = 0, downY = 0, moved = false;
canvas.addEventListener("pointerdown", e => { dragging = true; moved = false; downX = e.clientX; downY = e.clientY; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", e => {
  if (!dragging) return;
  const dx = e.clientX - downX, dy = e.clientY - downY;
  if (Math.hypot(dx, dy) > 6) moved = true;
  if (!moved) return;
  if (e.pointerType === "touch" && Math.abs(dy) > Math.abs(dx)) return; // let vertical swipes scroll
  drag.ty = clamp(dx / innerWidth * 3.2, -1.4, 1.4); drag.tx = clamp(dy / innerHeight * 2.2, -0.8, 0.8);
});
const endDrag = () => { if (dragging && !moved) goTo(current + 1); dragging = false; };
canvas.addEventListener("pointerup", endDrag);
canvas.addEventListener("pointercancel", () => (dragging = false));
addEventListener("keydown", e => {
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); goTo(current + 1); }
  if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); goTo(current - 1); }
  if (e.key === "Escape") { closeTl(); lbClose(); }
});

/* ---------------- chapters / player ---------------- */
const heroName = $(".hero-name");
const chs = $$(".ch");
let current = -1, st = null;
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
const chapterY = i => (clamp(i, 0, N - 1) + (i === 0 ? 0 : 0.8)) / N * maxScroll();
function goTo(i) { i = clamp(i, 0, N - 1); window.scrollTo({ top: chapterY(i), behavior: "smooth" }); }
function showChapter(i) {
  if (i === current) return;
  const prev = chs[current];
  if (prev) { prev.classList.remove("on"); gsap.to(prev, { autoAlpha: 0, y: -20, duration: 0.35, ease: "power2.in", overwrite: true }); }
  current = i;
  const el = chs[i];
  el.classList.add("on");
  gsap.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.15, overwrite: true });
  gsap.from(el.querySelectorAll("h2,h3,p,li,dl,figure,.strip,.btn,.mail,.row"), { y: 18, opacity: 0, duration: 0.6, stagger: 0.025, ease: "power3.out", delay: 0.2, overwrite: false, clearProps: "opacity,transform" });
  $("#pNum").textContent = String(i).padStart(2, "0");
  $("#pTitle").textContent = TITLES[i];
  $("#next").textContent = i === N - 1 ? "↺" : "▶";
}
function onProgress(p) {
  const i = clamp(Math.floor(p * N + 0.1), 0, N - 1);
  showChapter(i);
  $("#barFill").style.width = (p * 100) + "%";
  const s = Math.round(p * 42 * 60);
  $("#pTime").textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
}
$("#next").addEventListener("click", () => goTo(current === N - 1 ? 0 : current + 1));
$("#prev").addEventListener("click", () => goTo(current - 1));
$$("[data-go]").forEach(a => a.addEventListener("click", e => { e.preventDefault(); goTo(+a.dataset.go); }));
const bar = $("#bar");
for (let i = 1; i < N; i++) { const t = document.createElement("i"); t.style.left = (i / N * 100) + "%"; $("#ticks").appendChild(t); }
bar.addEventListener("click", e => { const r = bar.getBoundingClientRect(); window.scrollTo({ top: (e.clientX - r.left) / r.width * maxScroll(), behavior: "smooth" }); });
// tracklist overlay
const tlEl = $("#tracklist");
TITLES.forEach((t, i) => { const li = document.createElement("li"); li.innerHTML = `<button>${t}<span>${LENS[i]}</span></button>`; li.querySelector("button").onclick = () => { closeTl(); goTo(i); }; $("#tlList").appendChild(li); });
function closeTl() { tlEl.classList.remove("open"); tlEl.setAttribute("aria-hidden", "true"); }
$("#tlBtn").onclick = () => { tlEl.classList.add("open"); tlEl.setAttribute("aria-hidden", "false"); };
$("#tlClose").onclick = closeTl;

/* ---------------- playlist ---------------- */
const SA = [["Luther", "rap FR"], ["Rounhaa", "rap FR"], ["Khali", "rap FR"], ["Laylow", "rap FR"], ["Asinine", "rap FR"], ["Ajna", "rap FR"], ["Biga Ranx", "reggae FR"]];
const SB = [["Bob Marley", "reggae"], ["Fontaines D.C.", "post-punk"], ["Daft Punk", "french touch"], ["Steve Lacy", "r&b / indie"], ["Lana Del Rey", "dream pop"], ["Tame Impala", "psych"], ["Radiohead", "alt rock"], ["Gorillaz", "alt / hip-hop"]];
function fill(sel, list) {
  list.forEach(([n, tag]) => {
    const ini = n.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const li = document.createElement("li");
    li.innerHTML = `<a href="https://open.spotify.com/search/${encodeURIComponent(n)}" target="_blank" rel="noopener"><span class="t-badge">${ini}</span><span class="t-name">${n}</span></a>`;
    li.addEventListener("mouseenter", () => ($("#nowPlaying").textContent = "now playing: " + n + " — " + tag));
    $(sel).appendChild(li);
  });
}
fill("#sideA", SA); fill("#sideB", SB);

/* ---------------- AI strip + lightbox ---------------- */
const AI = "../assets/img/ai/";
const STRIP = ["beauty-03", "lifestyle-02", "beauty-09", "lifestyle-07", "phone-1", "beauty-14", "lifestyle-12", "category-03", "lifestyle-18", "phone-4", "beauty-20", "lifestyle-29", "gift-05", "lifestyle-33", "phone-6"];
STRIP.forEach(n => { const i = document.createElement("img"); i.src = AI + n + ".webp"; i.alt = "AI concept visual for DC Shoes"; i.loading = "lazy"; $("#strip").appendChild(i); });
const lb = $("#lightbox");
$("#strip").addEventListener("click", e => { if (e.target.tagName === "IMG") { $("img", lb).src = e.target.src; lb.classList.add("open"); } });
function lbClose() { lb.classList.remove("open"); }
lb.addEventListener("click", lbClose);
$("#mail").addEventListener("click", async () => {
  const m = $("#mail").dataset.mail;
  try { await navigator.clipboard.writeText(m); } catch { location.href = "mailto:" + m; return; }
  $("#toast").classList.add("show"); setTimeout(() => $("#toast").classList.remove("show"), 1600);
});

/* ---------------- resize / loop / boot ---------------- */
function resize() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.fov = mobile() ? 42 : 32;
  camera.updateProjectionMatrix();
}
addEventListener("resize", () => { resize(); ScrollTrigger.refresh(); });
resize();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  compose(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}

(async function boot() {
  await Promise.all([buildRecord(), loadHands()]);
  const tl = buildTimeline();
  st = ScrollTrigger.create({
    trigger: "#scroll", start: "top top", end: "bottom bottom", scrub: 0.9, animation: tl,
    snap: { inertia: false, snapTo: v => { const s = v * N; const c = clamp(Math.round(s - 0.8), 0, N - 1); return (c === 0 && s < 0.5 ? 0 : c + 0.8) / N; }, duration: { min: 0.25, max: 0.9 }, delay: 0.12, ease: "power2.inOut" },
    onUpdate: self => onProgress(self.progress),
  });
  compose(0); renderer.compile(scene, camera); renderer.render(scene, camera);
  requestAnimationFrame(loop);
  ldTween.kill();
  gsap.to(ld, { v: 100, duration: 0.3, onUpdate: () => (ldNum.textContent = Math.round(ld.v)), onComplete: () => {
    document.body.classList.remove("is-loading");
    gsap.to("#loader", { autoAlpha: 0, duration: 0.8, ease: "power2.out" });
    gsap.from(P, { cz: 15, cy: 2, duration: 2.2, ease: "expo.out" });
    gsap.from(".hero-name span", { yPercent: 100, opacity: 0, duration: 1.4, stagger: 0.12, ease: "expo.out" });
    onProgress(st.progress); showChapter(current < 0 ? 0 : current);
  } });
})();
window.__P = P;
