// ============================================
// Email Investigation Module (Bahasa Indonesia)
// ============================================

const EmailModule = (() => {
  let lastResults = null;

  function init() {
    const searchBtn = document.getElementById('email-search-btn');
    const searchInput = document.getElementById('email-input');
    if (searchBtn) searchBtn.addEventListener('click', () => startSearch());
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startSearch(); });
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function startSearch() {
    const input = document.getElementById('email-input');
    const email = input?.value.trim().toLowerCase();

    if (!email) { UI.toast('Masukkan alamat email', 'warning'); return; }
    if (!validateEmail(email)) { UI.toast('Format email tidak valid', 'error'); return; }

    const resultsContainer = document.getElementById('email-results');
    resultsContainer.innerHTML = `<div class="glass-card-static"><p style="text-align:center;color:var(--text-tertiary);">⏳ Menganalisis email...</p></div>`;

    try {
      const resp = await fetch('/api/email-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json();
      lastResults = data;
      renderResults(email, data);
    } catch (error) {
      resultsContainer.innerHTML = `<div class="glass-card-static"><p style="color:var(--accent-red);">❌ Gagal menganalisis email: ${error.message}</p></div>`;
    }
  }

  function renderResults(email, data) {
    const container = document.getElementById('email-results');
    const [localPart, domain] = email.split('@');

    // Gravatar
    const gravatarHash = API.md5(email);
    const gravatarUrl = `https://www.gravatar.com/avatar/${gravatarHash}?s=200&d=404`;

    let html = `
      <!-- Email Overview -->
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📧 Ringkasan Email</h3>
        <div class="info-grid">
          ${UI.createInfoItem('Email Lengkap', email, true)}
          ${UI.createInfoItem('Nama Lokal', localPart)}
          ${UI.createInfoItem('Domain', domain)}
          ${UI.createInfoItem('Format Valid', data.validFormat ? '✅ Ya' : '❌ Tidak')}
          ${UI.createInfoItem('MX Record', data.hasMx ? '✅ Ditemukan' : '⚠️ Tidak ditemukan')}
          ${UI.createInfoItem('Tipe', data.type || 'Tidak diketahui')}
        </div>
      </div>

      <!-- Gravatar -->
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">👻 Gravatar</h3>
        <div style="display:flex;align-items:center;gap:var(--space-lg);flex-wrap:wrap;">
          <img src="${gravatarUrl}" alt="Gravatar" style="width:80px;height:80px;border-radius:var(--radius-lg);border:1px solid var(--border-color);"
               onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2280%22 height=%2280%22><rect fill=%22%23111827%22 width=%2280%22 height=%2280%22/><text fill=%22%2364748b%22 x=%2240%22 y=%2245%22 text-anchor=%22middle%22 font-size=%2214%22>N/A</text></svg>';this.style.opacity='0.5'">
          <div>
            <p class="text-sm" style="color:var(--text-secondary);">Hash MD5: <span class="text-mono text-cyan">${gravatarHash}</span></p>
            <a href="https://gravatar.com/${gravatarHash}" target="_blank" class="result-link mt-sm">Lihat profil Gravatar →</a>
          </div>
        </div>
      </div>

      <!-- MX Records -->
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📬 MX Records (Mail Server)</h3>
        ${data.mxRecords && data.mxRecords.length > 0
          ? UI.createDataTable(data.mxRecords.map((mx, i) => [`Server ${i + 1}`, mx]))
          : '<p class="text-sm text-muted">Tidak ada MX record ditemukan</p>'
        }
      </div>

      <!-- Breach Check -->
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔓 Analisis Keamanan</h3>
        <div class="info-grid">
          ${UI.createInfoItem('Disposable Email', data.isDisposable ? '⚠️ Ya (email sementara)' : '✅ Bukan disposable')}
          ${UI.createInfoItem('Provider', data.provider || domain)}
          ${UI.createInfoItem('Kemungkinan Nama', data.possibleName || extractNameFromEmail(localPart))}
        </div>
        <div class="mt-md">
          <p class="text-sm text-muted">💡 Tip: Cek manual di <a href="https://haveibeenpwned.com/account/${encodeURIComponent(email)}" target="_blank" class="text-cyan">Have I Been Pwned</a> untuk data breach.</p>
        </div>
      </div>

      <!-- Linked Accounts Search -->
      <div class="glass-card-static">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔗 Cari Akun Terkait</h3>
        <div class="reverse-search-links">
          <a href="https://www.google.com/search?q=%22${encodeURIComponent(email)}%22" target="_blank" class="reverse-search-btn">🔍 Google Search</a>
          <a href="https://www.google.com/search?q=%22${encodeURIComponent(localPart)}%22+site:github.com" target="_blank" class="reverse-search-btn">🐙 GitHub</a>
          <a href="https://www.google.com/search?q=%22${encodeURIComponent(email)}%22+site:linkedin.com" target="_blank" class="reverse-search-btn">💼 LinkedIn</a>
          <a href="https://www.google.com/search?q=%22${encodeURIComponent(email)}%22+site:twitter.com+OR+site:x.com" target="_blank" class="reverse-search-btn">𝕏 Twitter</a>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  function extractNameFromEmail(localPart) {
    // Try to extract name from email local part
    const cleaned = localPart
      .replace(/[._-]/g, ' ')
      .replace(/\d+/g, '')
      .trim();

    if (!cleaned) return 'Tidak dapat dideteksi';

    return cleaned
      .split(' ')
      .filter(w => w.length > 1)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ') || 'Tidak dapat dideteksi';
  }

  function exportResults() {
    if (!lastResults) { UI.toast('Belum ada hasil', 'warning'); return; }
    UI.exportJSON(lastResults, 'email-investigation.json');
  }

  function getHTML() {
    return `
      <div class="module-header">
        <h2>📧 Investigasi Email</h2>
        <p>Analisis alamat email: validasi, MX records, Gravatar, dan cari akun terkait.</p>
      </div>
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">📧</span>
          <input type="email" id="email-input" placeholder="Masukkan alamat email (contoh: user@gmail.com)" autocomplete="off" spellcheck="false">
          <button class="search-btn" id="email-search-btn">🔍 Analisis</button>
        </div>
      </div>
      <div id="email-results">
        <div class="empty-state">
          <div class="empty-state-icon">📧</div>
          <p class="empty-state-text">Masukkan alamat email untuk memulai investigasi</p>
        </div>
      </div>
    `;
  }

  return { init, getHTML, exportResults };
})();
