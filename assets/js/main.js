/* Clément Bonnand — portfolio
   ink, paper & a lot of GSAP */
(() => {
  "use strict";
  gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = () => innerWidth <= 760;
  const rand = (a, b) => a + Math.random() * (b - a);
  const AI = "assets/img/ai/";

  /* ---------- data ---------- */
  const range = (pfx, nums) => nums.map(n => `${AI}${pfx}-${String(n).padStart(2, "0")}.webp`);
  const BEAUTY = range("beauty", [3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,25,26,27,28]);
  const GIFT = range("gift", [3,4,5,6,7,8]);
  const CATEGORY = range("category", [3,4,5,6,8,9,10,11,12,13,14]);
  const LIFE = range("lifestyle", [1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,23,24,26,27,28,29,30,31,32,33,34,35,36]);
  const PHONES = [1,2,3,4,5,6].map(n => `${AI}phone-${n}.webp`);
  const CAROUSEL = [1,3,5,7,9,11].map(n => `${AI}carousel-${n}.webp`);
  const groups = {};

  /* ---------- lenis ---------- */
  let lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  $$('a[href^="#"]').forEach(a => a.addEventListener("click", e => {
    const t = $(a.getAttribute("href"));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t, { duration: 1.6 }) : t.scrollIntoView({ behavior: "smooth" });
  }));

  /* ---------- boiling lines ---------- */
  const turb = $("#boilTurb");
  if (!reduced && turb) {
    let s = 0;
    setInterval(() => { s = (s + 1) % 4; turb.setAttribute("seed", s + 1); }, 120);
  }

  /* ---------- torn paper edges ---------- */
  function tornPolygon(j = 1.4, n = 22) {
    const pts = [];
    const jit = () => rand(0, j);
    for (let i = 0; i <= n; i++) pts.push(`${(i / n) * 100}% ${jit()}%`);
    for (let i = 1; i <= n; i++) pts.push(`${100 - jit()}% ${(i / n) * 100}%`);
    for (let i = n - 1; i >= 0; i--) pts.push(`${(i / n) * 100}% ${100 - jit()}%`);
    for (let i = n - 1; i > 0; i--) pts.push(`${jit()}% ${(i / n) * 100}%`);
    return `polygon(${pts.join(",")})`;
  }
  $$(".torn img").forEach(img => (img.style.clipPath = tornPolygon(1.6, 26)));

  /* ---------- hand-drawn paths: prep ---------- */
  $$(".circled svg path, .underlined svg path, .circled-big svg path, .scribble-circle path, .hero-note .arrow path").forEach(p => {
    p.setAttribute("pathLength", "1");
    p.style.strokeDasharray = "1";
    p.style.strokeDashoffset = "1";
  });
  const drawPath = (paths, opts = {}) => gsap.to(paths, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: .15, ...opts });

  /* ---------- split headings ---------- */
  const splits = new Map();
  $$("[data-split]").forEach(el => {
    const s = new SplitText(el, { type: "chars,lines", linesClass: "split-line" });
    splits.set(el, s);
    gsap.set(s.chars, { yPercent: 110, rotate: () => rand(-14, 14), opacity: 0 });
  });
  function revealSplit(el, delay = 0) {
    const s = splits.get(el);
    if (!s) return;
    gsap.to(s.chars, { yPercent: 0, rotate: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: .035, delay });
  }

  /* ---------- loader ---------- */
  const tornD = (() => {
    let d = "M0 0 L1000 0 L1000 6";
    for (let x = 1000; x >= 0; x -= 20) d += ` L${x} ${rand(4, 34).toFixed(1)}`;
    return d + " L0 0 Z";
  })();
  $("#tornPath").setAttribute("d", tornD);

  const words = ["mixing the ink", "tuning the bass", "sharpening ideas", "waxing the board", "calling the artists"];
  const num = $("#loadNum"), wordEl = $("#loadWord");
  const counter = { v: 0 };
  let wi = 0;
  const wordTimer = setInterval(() => { wi = (wi + 1) % words.length; wordEl.textContent = words[wi]; }, 420);
  const assetsReady = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    new Promise(r => { const i = $(".hero-photo img"); i.complete ? r() : (i.onload = i.onerror = r); }),
    new Promise(r => setTimeout(r, reduced ? 200 : 1900)),
  ]);
  gsap.to(counter, { v: 86, duration: reduced ? .2 : 1.7, ease: "power2.out", onUpdate: () => num.textContent = String(Math.round(counter.v)).padStart(2, "0") });
  assetsReady.then(() => {
    gsap.to(counter, {
      v: 100, duration: .4, onUpdate: () => num.textContent = String(Math.round(counter.v)).padStart(2, "0"),
      onComplete: () => {
        clearInterval(wordTimer);
        gsap.timeline()
          .to(".loader-inner", { y: -60, opacity: 0, duration: .5, ease: "power3.in" })
          .to("#loader", { yPercent: -112, duration: 1.05, ease: "expo.inOut" }, "-=.1")
          .add(() => { document.body.classList.remove("is-loading"); $("#loader").style.display = "none"; lenis && lenis.start(); ScrollTrigger.refresh(); })
          .add(heroIntro, "-=.6");
      }
    });
  });

  /* ---------- hero ---------- */
  function heroIntro() {
    $$(".hero [data-split]").forEach((el, i) => revealSplit(el, i * .18));
    drawPath($$(".hero-circle path"), { delay: .9, duration: 1.3 });
    gsap.from(".hero-photo", { y: 120, rotate: 12, scale: .8, opacity: 0, duration: 1.6, ease: "expo.out", delay: .3 });
    gsap.from(".hero-kicker, .hero-line, .hero-avail", { y: 30, opacity: 0, duration: .9, stagger: .1, ease: "power3.out", delay: .9 });
    gsap.from(".nav > *", { y: -40, opacity: 0, duration: .9, stagger: .08, ease: "power3.out", delay: .4 });
  }
  gsap.to(".hero-left", { yPercent: -10, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-photo", { yPercent: 10, rotate: -2, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  /* ---------- scroll velocity ---------- */
  let velocity = 0;
  ScrollTrigger.create({ onUpdate: self => { velocity = self.getVelocity(); } });

  /* ---------- marquee + belts (loop with velocity) ---------- */
  function looper(track, baseSpeed, dir) {
    const inner = track.innerHTML;
    track.innerHTML = inner + inner + inner;
    let x = 0, w = 0;
    const measure = () => { w = track.scrollWidth / 3; };
    measure(); addEventListener("resize", measure); addEventListener("load", measure);
    $$("img", track).forEach(i => i.addEventListener("load", measure));
    let hover = false;
    track.addEventListener("mouseenter", () => hover = true);
    track.addEventListener("mouseleave", () => hover = false);
    let boost = 0;
    gsap.ticker.add((t, dt) => {
      boost += ((Math.abs(velocity) / 220) - boost) * .08;
      const sp = (hover ? .15 : 1) * baseSpeed * (1 + Math.min(boost, 9));
      const d = dir * (velocity < -10 ? -1 : 1);
      x -= sp * d * (dt / 16.67);
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
  }
  if (!reduced) looper($("[data-marquee]"), 1.1, 1);

  /* ---------- brief ---------- */
  $$("[data-speed]").forEach(el => {
    gsap.to(el, { yPercent: parseFloat(el.dataset.speed) * 100, ease: "none", scrollTrigger: { trigger: el.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.from(".brief-photos figure", { scale: .85, rotate: -8, opacity: 0, duration: 1.2, ease: "expo.out", stagger: .15, scrollTrigger: { trigger: ".brief", start: "top 75%" } });
  $$(".brief [data-split], .story [data-split], .playlist [data-split], .school [data-split], .skills [data-split]").forEach(el => {
    ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => revealSplit(el) });
  });
  $$("section:not(.hero) .circled svg path, section:not(.hero) .underlined svg path, .circled-big svg path").forEach(p => {
    ScrollTrigger.create({ trigger: p.closest("span"), start: "top 85%", once: true, onEnter: () => drawPath(p, { delay: .3 }) });
  });
  gsap.from(".facts li", { x: -40, opacity: 0, stagger: .08, duration: .8, ease: "power3.out", scrollTrigger: { trigger: ".facts", start: "top 85%" } });

  /* ---------- story ---------- */
  $$(".count").forEach(c => {
    const o = { v: 0 };
    ScrollTrigger.create({ trigger: c, start: "top 85%", once: true, onEnter: () => gsap.to(o, { v: +c.dataset.count, duration: 1.8, ease: "power3.out", onUpdate: () => c.textContent = Math.round(o.v) }) });
  });
  $$(".ch-big").forEach(t => gsap.from(t, { xPercent: -20, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 85%" } }));
  $$(".ch-body > *").forEach(el => gsap.from(el, { y: 60, opacity: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  if (!reduced) {
  }
  $$(".coast-img, .road-img").forEach(f => gsap.fromTo(f, { y: 80 }, { y: -80, ease: "none", scrollTrigger: { trigger: f, start: "top bottom", end: "bottom top", scrub: true } }));

  /* ---------- playlist ---------- */
  const SIDE_A = [["Luther", "rap FR"], ["Rounhaa", "rap FR"], ["Khali", "rap FR"], ["Laylow", "rap FR"], ["Asinine", "rap FR"], ["Ajna", "rap FR"], ["Biga Ranx", "reggae FR"]];
  const SIDE_B = [["Bob Marley", "reggae"], ["Fontaines D.C.", "post-punk"], ["Daft Punk", "french touch"], ["Steve Lacy", "r&b / indie"], ["Lana Del Rey", "dream pop"], ["Tame Impala", "psych"], ["Radiohead", "alt rock"], ["Gorillaz", "alt / hip-hop"]];
  const deck = $(".deck"), vinyl = $("#vinyl"), vNow = $("#vNow"), vSide = $("#vSide"), eqBars = $$("#eq i");
  let playing = false, spin = 0, spinSpeed = .25;
  function fillSide(sel, list, side) {
    list.forEach(([name, tag]) => {
      const li = document.createElement("li"); li.className = "track";
      const ini = name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
      li.innerHTML = `<a href="https://open.spotify.com/search/${encodeURIComponent(name)}" target="_blank" rel="noopener" data-cursor="play"><span class="t-badge b${(name.length + side.charCodeAt(0)) % 4}" style="--r:${rand(-12, 12).toFixed(0)}deg">${ini}</span><span class="t-name">${name}</span><span class="t-tag">${tag}<em>listen on spotify ↗</em></span></a>`;
      const set = () => { vNow.textContent = name; vSide.textContent = "side " + side + " · " + tag; };
      li.addEventListener("mouseenter", () => { set(); playing = true; deck.classList.add("playing"); });
      li.addEventListener("mouseleave", () => { if (!$(".track.on")) { playing = false; deck.classList.remove("playing"); } });
      li.addEventListener("click", () => { $$(".track.on").forEach(t => t.classList.remove("on")); li.classList.add("on"); set(); playing = true; deck.classList.add("playing"); });
      $(sel).appendChild(li);
    });
  }
  fillSide("#sideA", SIDE_A, "A"); fillSide("#sideB", SIDE_B, "B");
  vinyl.addEventListener("click", () => { playing = !playing; deck.classList.toggle("playing", playing); });
  gsap.ticker.add((t, dt) => {
    const target = playing ? 3.2 : .25 + Math.min(Math.abs(velocity) / 400, 3);
    spinSpeed += (target - spinSpeed) * .05;
    spin = (spin + spinSpeed * dt / 16.67) % 360;
    vinyl.style.transform = `rotate(${spin}deg)`;
  });
  setInterval(() => eqBars.forEach(b => b.style.height = (playing ? rand(4, 34) : 4) + "px"), 130);
  gsap.from(".track", { x: 60, opacity: 0, duration: .8, stagger: .04, ease: "power3.out", scrollTrigger: { trigger: ".tracks", start: "top 85%" } });
  gsap.from(".deck", { rotate: -90, scale: .6, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".playlist", start: "top 60%" } });

  /* ---------- work: horizontal ---------- */
  ScrollTrigger.matchMedia({
    "(min-width: 761px)": () => {
      const track = $(".work-track");
      const dist = () => track.scrollWidth - innerWidth;
      const tw = gsap.to(track, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: ".work", start: "top top", end: () => "+=" + dist(), pin: ".work-pin", scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
      });
      $$(".case").forEach((c, i) => {
        gsap.from(c, { y: 120, rotate: i % 2 ? -10 : 10, opacity: .2, ease: "power2.out",
          scrollTrigger: { trigger: c, containerAnimation: tw, start: "left 95%", end: "left 55%", scrub: true } });
      });
    },
    "(max-width: 760px)": () => {
      $$(".case").forEach(c => gsap.from(c, { y: 80, opacity: 0, duration: .9, ease: "power3.out", scrollTrigger: { trigger: c, start: "top 88%" } }));
    }
  });
  gsap.from(".work-intro h2", { scale: .6, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".work", start: "top 70%" } });

  /* ---------- school ---------- */
  gsap.from(".school-list li", { y: 60, opacity: 0, duration: .9, stagger: .12, ease: "power3.out", scrollTrigger: { trigger: ".school-list", start: "top 85%" } });

  /* ---------- AI lab: page turns pink ---------- */
  const paper = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim();
  const pink = getComputedStyle(document.documentElement).getPropertyValue("--pink").trim();
  ScrollTrigger.create({
    trigger: "#ailab", start: "top 55%", end: "bottom 45%", refreshPriority: -1,
    onToggle: self => gsap.to("body", { backgroundColor: self.isActive ? pink : paper, duration: .7, ease: "power2.out" })
  });
  gsap.from(".ai-title", { scale: .4, rotate: -8, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".ai-hero", start: "top 60%" } });
  $$(".ai-star").forEach((s, i) => gsap.to(s, { rotate: i % 2 ? -360 : 360, ease: "none", scrollTrigger: { trigger: "#ailab", start: "top bottom", end: "bottom top", scrub: 1 } }));
  $$(".chap-title").forEach(t => gsap.from(t, { scale: .7, y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: t, start: "top 85%" } }));

  // lightbox registration helper
  function figure(src, group, i, cls = "") {
    const f = document.createElement("figure");
    if (cls) f.className = cls;
    f.dataset.lb = group; f.dataset.i = i; f.dataset.cursor = "view";
    f.innerHTML = `<img src="${src}" alt="AI-generated concept visual for DC Shoes" ${group === "beauty" ? 'width="900" height="506"' : ""} loading="lazy" draggable="false">`;
    return f;
  }
  // beauty belts
  groups.beauty = BEAUTY;
  const half = Math.ceil(BEAUTY.length / 2);
  [["#belt1", BEAUTY.slice(0, half), 0], ["#belt2", BEAUTY.slice(half), half]].forEach(([sel, list, off]) => {
    const t = $(sel);
    list.forEach((src, i) => t.appendChild(figure(src, "beauty", i + off, "belt-item")));
  });
  if (!reduced) { looper($("#belt1"), .7, 1); looper($("#belt2"), .7, -1); }
  // lifestyle tunnel
  groups.life = LIFE;
  const stage = $("#tunnelStage");
  const cards = LIFE.map((src, i) => {
    const f = figure(src, "life", i, "t-card");
    stage.appendChild(f);
    const ang = i * 2.399963; // golden angle
    const r = rand(.55, 1);
    return { el: f, ang, r, z0: 0, rot: rand(-8, 8) };
  });
  const SP = 300, N = cards.length, DEPTH = N * SP + 1800;
  function layoutTunnel(p) {
    const W = innerWidth, H = innerHeight, mob = isMobile();
    const rx = mob ? W * .26 : W * .34, ry = mob ? H * .3 : H * .3;
    for (let i = 0; i < N; i++) {
      const c = cards[i];
      const z = -i * SP - 1200 + p * DEPTH;
      const op = Math.max(0, Math.min(1, (z + 4600) / 1800)) * Math.max(0, Math.min(1, (650 - z) / 450));
      const x = Math.cos(c.ang) * rx * c.r, y = Math.sin(c.ang) * ry * c.r;
      c.el.style.transform = `translate(-50%,-50%) translate3d(${x}px,${y}px,${z}px) rotate(${c.rot}deg)`;
      c.el.style.opacity = op;
      c.el.style.visibility = op <= 0.01 ? "hidden" : "visible";
    }
  }
  layoutTunnel(0);
  ScrollTrigger.create({
    trigger: "#tunnel", start: "top top", end: () => "+=" + innerHeight * 4.5, pin: true, scrub: true,
    onUpdate: self => {
      layoutTunnel(self.progress);
      gsap.set(".tunnel-word", { scale: 1 + self.progress * 2.4, opacity: Math.max(0, 1 - self.progress * 1.1) });
    }
  });
  addEventListener("resize", () => layoutTunnel(0));

  // phones
  groups.phones = PHONES;
  PHONES.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src; img.alt = "Instagram mockup — DC Shoes Winter 27 (AI concept)"; img.loading = "lazy";
    img.dataset.lb = "phones"; img.dataset.i = i; img.dataset.cursor = "view";
    $("#phones").appendChild(img);
    gsap.fromTo(img, { y: 120 + i * 30 }, { y: -60 - (i % 3) * 40, ease: "none", scrollTrigger: { trigger: "#phones", start: "top bottom", end: "bottom top", scrub: true } });
  });
  /* ---------- lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("img", lb), lbCount = $(".lb-count", lb);
  let lbGroup = null, lbI = 0;
  function lbShow() {
    const list = groups[lbGroup];
    lbImg.src = list[lbI];
    lbCount.textContent = `${String(lbI + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    gsap.fromTo(lbImg, { scale: .92, opacity: 0 }, { scale: 1, opacity: 1, duration: .45, ease: "power3.out" });
  }
  function lbOpen(g, i) { lbGroup = g; lbI = i; lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); lenis && lenis.stop(); lbShow(); }
  function lbClose() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); lenis && lenis.start(); }
  const lbStep = d => { const n = groups[lbGroup].length; lbI = (lbI + d + n) % n; lbShow(); };
  document.addEventListener("click", e => {
    const t = e.target.closest("[data-lb]");
    if (t) lbOpen(t.dataset.lb, +t.dataset.i);
  });
  $(".lb-close").onclick = lbClose;
  $(".lb-prev").onclick = () => lbStep(-1);
  $(".lb-next").onclick = () => lbStep(1);
  lb.addEventListener("click", e => { if (e.target === lb) lbClose(); });
  addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowRight") lbStep(1);
    if (e.key === "ArrowLeft") lbStep(-1);
  });

  /* ---------- skills physics ---------- */
  const SKILLS = [
    ["Marketing", 1], ["Communication", 0], ["Seasonal marketing", 2], ["Event marketing", 4], ["Photo shoots", 0],
    ["Social media ads", 1], ["AI imagery", 2], ["Shopify", 5], ["Data analysis", 0], ["Seeding", 4], ["English C1", 5], ["Español B1", 5], ["Artist relations", 3]
  ];
  (function physics() {
    const pit = $("#pit");
    const { Engine, Bodies, Composite, Runner, Mouse, MouseConstraint, Body, Events } = Matter;
    const engine = Engine.create({ gravity: { y: 1.1 } });
    const runner = Runner.create();
    let W = pit.clientWidth, H = pit.clientHeight, walls = [];
    const chips = SKILLS.map(([label, k]) => {
      const el = document.createElement("span");
      el.className = `chip k${k}`; el.textContent = label;
      pit.appendChild(el);
      return { el, body: null };
    });
    function buildWalls() {
      Composite.remove(engine.world, walls);
      const t = 200;
      walls = [
        Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),
        Bodies.rectangle(-t / 2, H / 2, t, H * 6, { isStatic: true }),
        Bodies.rectangle(W + t / 2, H / 2, t, H * 6, { isStatic: true }),
      ];
      Composite.add(engine.world, walls);
    }
    let started = false;
    function start() {
      if (started) return; started = true;
      W = pit.clientWidth; H = pit.clientHeight; buildWalls();
      chips.forEach((c, i) => {
        const w = c.el.offsetWidth, h = c.el.offsetHeight;
        c.w = w; c.h = h;
        c.body = Bodies.rectangle(rand(w / 2 + 10, W - w / 2 - 10), -h - i * 70, w, h, { chamfer: { radius: h / 2 - 1 }, restitution: .45, friction: .2, angle: rand(-.5, .5) });
        Composite.add(engine.world, c.body);
      });
      if (fine) {
        const mouse = Mouse.create(pit);
        ["mousewheel", "DOMMouseScroll", "wheel"].forEach(ev => mouse.element.removeEventListener(ev, mouse.mousewheel));
        const mc = MouseConstraint.create(engine, { mouse, constraint: { stiffness: .2, render: { visible: false } } });
        Composite.add(engine.world, mc);
      } else {
        pit.addEventListener("click", () => chips.forEach(c => Body.applyForce(c.body, c.body.position, { x: rand(-.03, .03), y: -rand(.05, .09) })));
      }
      Runner.run(runner, engine);
    }
    Events.on(engine, "afterUpdate", () => {
      for (const c of chips) {
        if (!c.body) continue;
        const { x, y } = c.body.position;
        c.el.style.transform = `translate(${x - c.w / 2}px,${y - c.h / 2}px) rotate(${c.body.angle}rad)`;
      }
    });
    ScrollTrigger.create({
      trigger: pit, start: "top 70%", end: "bottom top",
      onEnter: start,
      onToggle: self => { if (started) runner.enabled = self.isActive; },
    });
    chips.forEach(c => (c.el.style.transform = "translate(-999px,-999px)"));
    addEventListener("resize", () => { if (!started) return; W = pit.clientWidth; H = pit.clientHeight; buildWalls(); });
  })();

  /* ---------- off duty ---------- */
  $$(".stamp").forEach(s => s.style.setProperty("--r", rand(-5, 5).toFixed(1) + "deg"));
  gsap.from(".stamp", { scale: 0, rotate: () => rand(-40, 40), duration: .7, ease: "back.out(2)", stagger: .05, scrollTrigger: { trigger: "#stamps", start: "top 85%" } });
  gsap.from(".passions li", { xPercent: -30, opacity: 0, duration: 1, ease: "expo.out", stagger: .08, scrollTrigger: { trigger: ".passions", start: "top 80%" } });

  /* ---------- contact ---------- */
  const big = $("#repel");
  big.innerHTML = big.textContent.trim().split(" ").map(w => `<span class="wd">${w.split("").map(ch => `<span class="ch">${ch}</span>`).join("")}</span>`).join(" ");
  const chs = $$(".ch", big);
  gsap.from(chs, { yPercent: 120, rotate: () => rand(-30, 30), opacity: 0, duration: 1.1, ease: "expo.out", stagger: .03, scrollTrigger: { trigger: big, start: "top 85%" } });
  if (fine && !reduced) {
    const q = chs.map(c => ({ c, x: gsap.quickTo(c, "x", { duration: .6, ease: "power3" }), y: gsap.quickTo(c, "y", { duration: .6, ease: "power3" }), r: gsap.quickTo(c, "rotate", { duration: .6, ease: "power3" }) }));
    $(".contact").addEventListener("mousemove", e => {
      q.forEach(o => {
        const b = o.c.getBoundingClientRect();
        const dx = b.left + b.width / 2 - e.clientX, dy = b.top + b.height / 2 - e.clientY;
        const d = Math.hypot(dx, dy), R = 190;
        if (d < R) { const f = (1 - d / R) * 70; o.x(dx / d * f); o.y(dy / d * f); o.r(dx / d * f * .4); }
        else { o.x(0); o.y(0); o.r(0); }
      });
    });
  }
  gsap.from(".thanks", { scale: .5, rotate: -6, opacity: 0, duration: 1.3, ease: "expo.out", scrollTrigger: { trigger: ".thanks", start: "top 92%" } });
  const toast = $("#toast");
  $("#mail").addEventListener("click", async () => {
    const m = $("#mail").dataset.mail;
    try { await navigator.clipboard.writeText(m); toast.textContent = "email copied ✶"; }
    catch { location.href = "mailto:" + m; return; }
    toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 1800);
  });

  /* ---------- magnetic ---------- */
  if (fine) $$("[data-magnetic], .sticker").forEach(el => {
    const x = gsap.quickTo(el, "x", { duration: .5, ease: "power3" }), y = gsap.quickTo(el, "y", { duration: .5, ease: "power3" });
    el.addEventListener("mousemove", e => { const b = el.getBoundingClientRect(); x((e.clientX - b.left - b.width / 2) * .35); y((e.clientY - b.top - b.height / 2) * .35); });
    el.addEventListener("mouseleave", () => { x(0); y(0); });
  });

  /* ---------- scramble links ---------- */
  const glyphs = "!<>-_\\/[]{}—=+*^?#✶";
  $$("[data-scramble]").forEach(a => {
    const orig = a.textContent;
    a.addEventListener("mouseenter", () => {
      let f = 0;
      const id = setInterval(() => {
        a.textContent = orig.split("").map((c, i) => i < f / 2 ? orig[i] : (c === " " ? " " : glyphs[Math.floor(Math.random() * glyphs.length)])).join("");
        if (++f > orig.length * 2) { clearInterval(id); a.textContent = orig; }
      }, 28);
    });
  });

  /* ---------- cursor ---------- */
  const cur = $("#cursor"), label = $(".c-label", cur);
  let mx = innerWidth / 2, my = innerHeight / 2;
  if (fine) {
    const cx = gsap.quickTo(cur, "x", { duration: .18, ease: "power3" }), cy = gsap.quickTo(cur, "y", { duration: .18, ease: "power3" });
    addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; cx(mx); cy(my); cur.classList.add("on"); });
    document.addEventListener("mouseover", e => {
      const t = e.target.closest("[data-cursor], a, button, .chip");
      cur.classList.remove("is-label", "is-link");
      if (!t) return;
      if (t.dataset.cursor) { label.textContent = t.dataset.cursor; cur.classList.add("is-label"); }
      else cur.classList.add("is-link");
    });
    addEventListener("mousedown", () => gsap.to(".c-ring", { scale: .75, duration: .15 }));
    addEventListener("mouseup", () => gsap.to(".c-ring", { scale: 1, duration: .3 }));
  }

  /* ---------- ink trail ---------- */
  const cv = $("#ink"), ctx = cv.getContext("2d");
  let inkOn = fine && !reduced, pts = [], dpr = Math.min(devicePixelRatio || 1, 2);
  const tog = $("#inkToggle");
  if (!inkOn) tog.style.display = "none";
  tog.addEventListener("click", () => {
    inkOn = !inkOn; tog.querySelector("b").textContent = inkOn ? "on" : "off"; tog.setAttribute("aria-pressed", inkOn);
    if (!inkOn) ctx.clearRect(0, 0, cv.width, cv.height);
  });
  function sizeInk() { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  sizeInk(); addEventListener("resize", sizeInk);
  let last = null, lastW = 4;
  if (fine) addEventListener("mousemove", e => {
    if (!inkOn || document.body.classList.contains("is-loading")) return;
    const p = { x: e.clientX, y: e.clientY };
    if (last) {
      const d = Math.hypot(p.x - last.x, p.y - last.y);
      const w = Math.max(1.2, Math.min(9, 10 - d * .18));
      lastW += (w - lastW) * .35;
      ctx.strokeStyle = "rgba(14,14,14,.9)"; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = lastW;
      ctx.beginPath(); ctx.moveTo(last.x, last.y);
      ctx.quadraticCurveTo(last.x, last.y, (last.x + p.x) / 2, (last.y + p.y) / 2); ctx.lineTo(p.x, p.y); ctx.stroke();
      // splatter
      if (d > 40 && Math.random() < .25) { ctx.fillStyle = "rgba(14,14,14,.85)"; ctx.beginPath(); ctx.arc(p.x + rand(-14, 14), p.y + rand(-14, 14), rand(1, 3.5), 0, 6.3); ctx.fill(); }
    }
    last = p;
  });
  // scrolling moves the paper: smear the ink away
  gsap.ticker.add(() => {
    if (!inkOn) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,.055)"; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.restore();
    if (Math.abs(velocity) > 50) last = null;
  });
  document.addEventListener("mouseleave", () => (last = null));

  addEventListener("load", () => ScrollTrigger.refresh());
  // late images (lazy) change heights: refresh, debounced
  let rT;
  document.addEventListener("load", e => {
    if (e.target.tagName !== "IMG") return;
    clearTimeout(rT); rT = setTimeout(() => ScrollTrigger.refresh(), 250);
  }, true);
})();
