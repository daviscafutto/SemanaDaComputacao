/* ==========================================================================
   SEMANA DA COMPUTAÇÃO — script.js
   Toda a lógica da página: menu mobile, bolhas do hero, tentáculos do polvo,
   contagem regressiva, abas da programação e HUD de profundidade.
   ========================================================================== */

'use strict';

/* ---------- Configurações rápidas (edite aqui) ---------- */
/* Data e hora de início do evento (fuso de Brasília) */
const EVENT_START = new Date('2026-10-05T09:00:00-03:00');
/* Data e hora de término do evento */
const EVENT_END = new Date('2026-10-09T18:00:00-03:00');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   1. MENU MOBILE
   ========================================================================== */
(function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });

  /* Fecha o menu ao clicar em qualquer link */
  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ==========================================================================
   2. BOLHAS DO HERO
   ========================================================================== */
(function initBubbles() {
  const field = document.getElementById('bubbleField');
  if (!field || prefersReducedMotion) return;

  const TOTAL = 16;
  for (let i = 0; i < TOTAL; i++) {
    const b = document.createElement('span');
    b.className = 'bubble';

    const size = 6 + Math.random() * 22;           /* 6px a 28px */
    const left = Math.random() * 100;              /* posição horizontal em % */
    const duration = 9 + Math.random() * 10;       /* 9s a 19s de subida */
    const delay = Math.random() * -18;             /* começa em pontos diferentes */
    const drift = (Math.random() * 80 - 40).toFixed(0); /* deriva lateral */

    b.style.width = size + 'px';
    b.style.height = size + 'px';
    b.style.left = left + '%';
    b.style.animationDuration = duration + 's';
    b.style.animationDelay = delay + 's';
    b.style.setProperty('--drift', drift + 'px');

    field.appendChild(b);
  }
})();

/* ==========================================================================
   3. TENTÁCULOS DO POLVO (desenhados via SVG)
   8 braços em uma varredura assimétrica — como se estivessem sendo
   arrastados pela água enquanto o polvo nada de lado — em vez de
   pendurados simetricamente. Alguns braços recebem um nó bioluminescente
   que pulsa, como um impulso nervoso percorrendo o braço.
   ========================================================================== */
(function initTentacles() {
  const group = document.getElementById('octoTentacles');
  if (!group) return;

  const NS = 'http://www.w3.org/2000/svg';

  /* 8 braços — origem (x no manto), curvatura (todas tendendo para o
     mesmo lado, como se a correnteza os puxasse), comprimento, largura
     na base, atraso da animação e uma ondulação leve. */
  const tentacles = [
    { x: 142.9, curve: 14,  len: 150, width: 18, delay: 0.0,  waveAmp: 5, wavePhase: 0.2, glow: false },
    { x: 159.6, curve: 26,  len: 172, width: 20, delay: 0.5,  waveAmp: 6, wavePhase: 1.0, glow: true },
    { x: 176.3, curve: 35,  len: 192, width: 22, delay: 1.0,  waveAmp: 5, wavePhase: 0.5, glow: false },
    { x: 193.0, curve: 41,  len: 206, width: 23, delay: 0.2,  waveAmp: 4, wavePhase: 1.7, glow: false },
    { x: 209.8, curve: 44,  len: 206, width: 23, delay: 0.7,  waveAmp: 4, wavePhase: 0.3, glow: true },
    { x: 226.5, curve: 46,  len: 194, width: 22, delay: 1.2,  waveAmp: 5, wavePhase: 1.3, glow: false },
    { x: 241.7, curve: 44,  len: 176, width: 20, delay: 0.4,  waveAmp: 6, wavePhase: 0.8, glow: false },
    { x: 255.4, curve: 40,  len: 154, width: 18, delay: 0.9,  waveAmp: 5, wavePhase: 1.5, glow: true },
  ];

  const START_Y = 208; /* onde os tentáculos "nascem" (base do manto) */

  /* Ponto de uma curva quadrática de Bézier */
  function qPoint(p0, p1, p2, t) {
    const mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
    };
  }

  tentacles.forEach((cfg) => {
    const p0 = { x: cfg.x, y: START_Y };
    const p1 = { x: cfg.x + cfg.curve * 0.4, y: START_Y + cfg.len * 0.55 };
    const p2 = { x: cfg.x + cfg.curve, y: START_Y + cfg.len };

    const STEPS = 22;
    const leftSide = [];
    const rightSide = [];
    const centers = [];

    for (let i = 0; i <= STEPS; i++) {
      const t = i / STEPS;
      const pt = qPoint(p0, p1, p2, t);
      pt.x += Math.sin(t * Math.PI * 2.2 + cfg.wavePhase) * cfg.waveAmp * t;
      centers.push(pt);
      const half = (cfg.width / 2) * (1 - t * 0.92);
      leftSide.push({ x: pt.x - half, y: pt.y });
      rightSide.push({ x: pt.x + half, y: pt.y });
    }

    let d = 'M ' + leftSide[0].x.toFixed(1) + ' ' + leftSide[0].y.toFixed(1);
    leftSide.slice(1).forEach((p) => { d += ' L ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
    rightSide.reverse().forEach((p) => { d += ' L ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1); });
    d += ' Z';

    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'octo-tentacle');
    g.style.transformOrigin = cfg.x + 'px ' + START_Y + 'px';
    g.style.animationDelay = cfg.delay + 's';
    if (prefersReducedMotion) g.style.animation = 'none';

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    g.appendChild(path);

    /* Ventosas em duas fileiras alternadas */
    let side = 1;
    for (let i = 3; i <= STEPS - 2; i += 2) {
      const c = centers[i];
      const t = i / STEPS;
      const half = (cfg.width / 2) * (1 - t * 0.92);
      const sucker = document.createElementNS(NS, 'ellipse');
      const r = Math.max(1.2, 2.4 * (1 - t) + 0.8);
      const offset = half * 0.42 * side;
      sucker.setAttribute('cx', (c.x + offset).toFixed(1));
      sucker.setAttribute('cy', c.y.toFixed(1));
      sucker.setAttribute('rx', r.toFixed(1));
      sucker.setAttribute('ry', (r * 0.72).toFixed(1));
      sucker.setAttribute('opacity', '0.55');
      g.appendChild(sucker);
      side *= -1;
    }

    /* Nó bioluminescente pulsante em alguns braços — um "impulso nervoso"
       viajando pelo tentáculo, no mesmo ciano dos vigias do submarino. */
    if (cfg.glow) {
      const c = centers[Math.round(STEPS * 0.62)];
      const dot = document.createElementNS(NS, 'circle');
      dot.setAttribute('cx', c.x.toFixed(1));
      dot.setAttribute('cy', c.y.toFixed(1));
      dot.setAttribute('r', '4.5');
      dot.setAttribute('fill', 'url(#glowDot)');
      dot.setAttribute('class', 'octo-bio-dot');
      dot.style.animationDelay = (cfg.delay * 0.6) + 's';
      if (prefersReducedMotion) dot.style.animation = 'none';
      g.appendChild(dot);
    }

    group.appendChild(g);
  });
})();

/* ==========================================================================
   4. CONTAGEM REGRESSIVA
   ========================================================================== */
(function initCountdown() {
  const elDays = document.getElementById('cdDays');
  const elHours = document.getElementById('cdHours');
  const elMinutes = document.getElementById('cdMinutes');
  const elSeconds = document.getElementById('cdSeconds');
  const elStatus = document.getElementById('countdownStatus');
  if (!elDays) return;

  const pad = (n) => String(n).padStart(2, '0');

  function tick() {
    const now = Date.now();
    const diff = EVENT_START.getTime() - now;

    if (diff <= 0) {
      elDays.textContent = elHours.textContent = elMinutes.textContent = elSeconds.textContent = '00';
      if (now <= EVENT_END.getTime()) {
        elStatus.textContent = 'O mergulho começou! Estamos em plena Semana da Computação 🐙';
      } else {
        elStatus.textContent = 'Esta edição já terminou. Até a próxima!';
      }
      clearInterval(timer);
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    elDays.textContent = pad(days);
    elHours.textContent = pad(hours);
    elMinutes.textContent = pad(minutes);
    elSeconds.textContent = pad(seconds);
  }

  tick();
  const timer = setInterval(tick, 1000);
})();

/* ==========================================================================
   5. ABAS DA PROGRAMAÇÃO
   ========================================================================== */
(function initTabs() {
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.tab-panel'));
  if (!tabs.length) return;

  function select(tab) {
    tabs.forEach((t) => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    panels.forEach((p) => {
      p.hidden = p.id !== tab.getAttribute('aria-controls');
    });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));

    /* Navegação por setas do teclado */
    tab.addEventListener('keydown', (e) => {
      let target = null;
      if (e.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') target = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') target = tabs[0];
      if (e.key === 'End') target = tabs[tabs.length - 1];
      if (target) {
        e.preventDefault();
        target.focus();
        select(target);
      }
    });
  });
})();

/* ==========================================================================
   6. HUD DE PROFUNDIDADE (lateral, desktop)
   ========================================================================== */
(function initDepthHud() {
  const elValue = document.getElementById('depthValue');
  const elZone = document.getElementById('depthZone');
  if (!elValue || !elZone) return;

  const sections = Array.from(document.querySelectorAll('[data-depth]'));
  if (!sections.length) return;

  let currentDepth = 0;
  let targetDepth = 0;

  /* Descobre qual seção está no meio da tela */
  function update() {
    const mid = window.innerHeight / 2;
    let active = sections[0];
    for (const s of sections) {
      const rect = s.getBoundingClientRect();
      if (rect.top <= mid) active = s;
    }
    targetDepth = Number(active.dataset.depth) || 0;
    elZone.textContent = active.dataset.zone || '';
  }

  /* Anima o número suavemente até o alvo */
  function animate() {
    const delta = targetDepth - currentDepth;
    if (Math.abs(delta) > 0.5) {
      currentDepth += delta * (prefersReducedMotion ? 1 : 0.08);
    } else {
      currentDepth = targetDepth;
    }
    elValue.textContent = Math.round(currentDepth) + 'm';
    requestAnimationFrame(animate);
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
  animate();
})();
