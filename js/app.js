// ============================================
// OSINT Intelligence Dashboard — App Controller
// ============================================

const App = (() => {
  let currentModule = 'dashboard';
  let searchHistory = [];

  // Module registry
  const modules = {
    username: { module: UsernameModule, label: 'Pencarian Username', icon: '👤' },
    email: { module: EmailModule, label: 'Investigasi Email', icon: '📧' },
    phone: { module: PhoneModule, label: 'Nomor Telepon', icon: '📱' },
    image: { module: ImageModule, label: 'Analisis Gambar', icon: '🖼️' },
    ip: { module: IpModule, label: 'Geolokasi IP', icon: '🌐' },
    domain: { module: DomainModule, label: 'Analisis Domain', icon: '🔗' },
    social: { module: SocialModule, label: 'Social Media', icon: '📱' },
  };

  /**
   * Initialize the app
   */
  function init() {
    // Set up navigation
    document.querySelectorAll('.nav-item[data-module]').forEach((item) => {
      item.addEventListener('click', () => {
        navigateTo(item.dataset.module);
      });
    });

    // Module cards on dashboard
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.module-card[data-module]');
      if (card) navigateTo(card.dataset.module);
    });

    // Mobile menu
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    if (menuBtn) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
      });
    }

    if (overlay) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.altKey) {
        const shortcuts = { '1': 'username', '2': 'email', '3': 'phone', '4': 'image', '5': 'ip', '6': 'domain', '7': 'social', '0': 'dashboard' };
        if (shortcuts[e.key]) {
          e.preventDefault();
          navigateTo(shortcuts[e.key]);
        }
      }
    });

    // Load search history
    try {
      searchHistory = JSON.parse(localStorage.getItem('osint-history') || '[]');
    } catch { }

    // Init animated background
    initBackground();

    // Show dashboard
    showDashboard();
  }

  /**
   * Navigate to module
   */
  function navigateTo(moduleId) {
    // Close mobile sidebar
    document.querySelector('.sidebar')?.classList.remove('open');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');

    // Update nav
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.module === moduleId);
    });

    // Update breadcrumb
    const breadcrumb = document.querySelector('.header-breadcrumb .current');
    if (breadcrumb) {
      const mod = modules[moduleId];
      breadcrumb.textContent = mod ? mod.label : 'Dashboard';
    }

    currentModule = moduleId;

    // Render module
    const pageContent = document.getElementById('page-content');

    if (moduleId === 'dashboard') {
      showDashboard();
      return;
    }

    const mod = modules[moduleId];
    if (!mod) return;

    pageContent.innerHTML = `
      <div class="disclaimer-banner" style="margin-bottom:var(--space-lg);">
        <span class="disclaimer-icon">⚠️</span>
        <span>Tool ini hanya untuk tujuan <strong>edukasi dan riset keamanan</strong>. Semua data berasal dari sumber publik. Penggunaan harus sesuai hukum yang berlaku.</span>
      </div>
      <div class="module-page active" id="module-${moduleId}">
        ${mod.module.getHTML()}
      </div>
    `;

    // Initialize module
    mod.module.init();
  }

  /**
   * Show dashboard
   */
  function showDashboard() {
    const pageContent = document.getElementById('page-content');

    const moduleCards = Object.entries(modules).map(([id, { label, icon, module }]) => {
      const colors = {
        username: '--accent-cyan',
        email: '--accent-purple',
        phone: '--accent-green',
        image: '--accent-yellow',
        ip: '--accent-blue',
        domain: '--accent-orange',
        social: '--accent-red',
      };
      const color = colors[id] || '--accent-cyan';

      const descriptions = {
        username: 'Cari keberadaan username di 120 platform sosial media, developer, gaming, dan layanan online.',
        email: 'Validasi email, cek MX records, Gravatar, dan temukan akun terkait.',
        phone: 'Analisis nomor telepon: deteksi negara, operator, dan tipe nomor.',
        image: 'Ekstrak metadata EXIF dari foto: lokasi GPS, info kamera, waktu pengambilan.',
        ip: 'Temukan lokasi geografis, ISP, dan informasi jaringan dari alamat IP.',
        domain: 'Analisis DNS records, HTTP headers, dan deteksi teknologi sebuah domain.',
        social: 'Ambil data profil publik dari GitHub, Reddit, Instagram, dan TikTok.',
      };

      return `
        <div class="module-card" data-module="${id}" style="--card-accent:var(${color})">
          <div class="module-card-icon" style="background:var(${color}-dim,rgba(0,212,255,0.15));color:var(${color});">${icon}</div>
          <h3>${label}</h3>
          <p>${descriptions[id]}</p>
        </div>
      `;
    }).join('');

    pageContent.innerHTML = `
      <div class="module-page active">
        <div class="dashboard-hero">
          <h2>OSINT Intelligence</h2>
          <p>Platform investigasi informasi publik yang powerful. Pilih modul di bawah untuk memulai pencarian.</p>
        </div>

        <div class="stats-row">
          <div class="stat-card">
            <div class="stat-value" id="dash-modules">7</div>
            <div class="stat-label">Modul Tersedia</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="dash-platforms">120</div>
            <div class="stat-label">Platform Tercakup</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" id="dash-searches">${searchHistory.length}</div>
            <div class="stat-label">Pencarian Hari Ini</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">🔒</div>
            <div class="stat-label">100% Legal</div>
          </div>
        </div>

        <div class="module-cards-grid">
          ${moduleCards}
        </div>
      </div>
    `;

    // Update breadcrumb
    const breadcrumb = document.querySelector('.header-breadcrumb .current');
    if (breadcrumb) breadcrumb.textContent = 'Dashboard';

    // Reset nav
    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.dataset.module === 'dashboard');
    });
  }

  /**
   * Animated particle background
   */
  function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles = [];
      const count = Math.min(Math.floor(canvas.width * canvas.height / 15000), 80);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.opacity})`;
        ctx.fill();

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });

      animId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });
  }

  return { init, navigateTo };
})();

// Boot
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
