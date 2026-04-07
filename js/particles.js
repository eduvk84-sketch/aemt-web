// ============================================================
// AEMT — js/particles.js
// Canvas particle system for hero section
// Particles react to mouse movement
// ============================================================

(function() {
  'use strict';

  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const CONFIG = {
    count: 70,
    connectDist: 130,
    mouseRadius: 160,
    speed: 0.35,
    particleColor: 'rgba(200,148,42,',
    lineColor: 'rgba(200,148,42,',
    minRadius: 1.2,
    maxRadius: 2.8,
  };

  let W, H, particles = [];
  let mouse = { x: -9999, y: -9999 };
  let raf;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * CONFIG.speed;
    this.vy = (Math.random() - .5) * CONFIG.speed;
    this.r  = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
    this.opacity = .25 + Math.random() * .45;
  }

  Particle.prototype.update = function() {
    // Mouse repulsion
    const dx = this.x - mouse.x;
    const dy = this.y - mouse.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < CONFIG.mouseRadius) {
      const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
      this.x += dx / dist * force * 1.8;
      this.y += dy / dist * force * 1.8;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Wrap edges
    if (this.x < 0)  this.x = W;
    if (this.x > W)  this.x = 0;
    if (this.y < 0)  this.y = H;
    if (this.y > H)  this.y = 0;
  };

  Particle.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = CONFIG.particleColor + this.opacity + ')';
    ctx.fill();
  };

  function connect() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < CONFIG.connectDist) {
          const alpha = (1 - dist / CONFIG.connectDist) * .28;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = CONFIG.lineColor + alpha + ')';
          ctx.lineWidth = .8;
          ctx.stroke();
        }
      }
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < CONFIG.count; i++) {
      particles.push(new Particle());
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    connect();
    particles.forEach(p => { p.update(); p.draw(); });
    raf = requestAnimationFrame(loop);
  }

  function start() {
    resize();
    init();
    if (raf) cancelAnimationFrame(raf);
    loop();
  }

  // Mouse tracking (relative to canvas)
  const hero = document.getElementById('hero');
  if (hero) {
    hero.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', () => {
      mouse.x = -9999; mouse.y = -9999;
    });
  }

  window.addEventListener('resize', () => {
    resize();
    init();
  });

  // Start after DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
