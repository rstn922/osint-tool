// ============================================
// Domain Analysis Module (Bahasa Indonesia)
// ============================================

const DomainModule = (() => {
  let lastResults = null;

  function init() {
    const searchBtn = document.getElementById('domain-search-btn');
    const searchInput = document.getElementById('domain-input');
    if (searchBtn) searchBtn.addEventListener('click', () => startSearch());
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startSearch(); });
  }

  function cleanDomain(input) {
    let domain = input.trim().toLowerCase();
    domain = domain.replace(/^(https?:\/\/)/, '');
    domain = domain.replace(/\/.*$/, '');
    domain = domain.replace(/^www\./, '');
    return domain;
  }

  async function startSearch() {
    const input = document.getElementById('domain-input');
    const rawDomain = input?.value.trim();

    if (!rawDomain) { UI.toast('Masukkan nama domain', 'warning'); return; }

    const domain = cleanDomain(rawDomain);

    if (!domain || !domain.includes('.')) {
      UI.toast('Format domain tidak valid', 'error');
      return;
    }

    const container = document.getElementById('domain-results');
    container.innerHTML = `<div class="glass-card-static"><p style="text-align:center;color:var(--text-tertiary);">⏳ Menganalisis domain ${domain}...</p></div>`;

    try {
      const resp = await fetch('/api/domain-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await resp.json();
      lastResults = data;
      renderResults(domain, data);
    } catch (error) {
      container.innerHTML = `<div class="glass-card-static"><p style="color:var(--accent-red);text-align:center;">❌ Gagal menganalisis: ${error.message}</p></div>`;
    }
  }

  function renderResults(domain, data) {
    const container = document.getElementById('domain-results');

    let html = `
      <!-- Domain Overview -->
      <div class="glass-card-static mb-lg">
        <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);">
          <div style="font-size:2.5rem;">🌐</div>
          <div>
            <h3 style="font-size:1.3rem;font-family:var(--font-mono);color:var(--accent-cyan);">${domain}</h3>
            <p class="text-sm text-muted">Analisis domain lengkap</p>
          </div>
        </div>
        <div class="info-grid">
          ${UI.createInfoItem('Domain', domain, true)}
          ${UI.createInfoItem('IP Address', data.ip || 'N/A')}
          ${UI.createInfoItem('Status', data.reachable ? '✅ Aktif' : '❌ Tidak aktif')}
        </div>
      </div>

      <!-- DNS Records -->
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📋 DNS Records</h3>

        <div class="tabs-container">
          <button class="tab-btn active" onclick="DomainModule.switchTab('dns-a')">A Records</button>
          <button class="tab-btn" onclick="DomainModule.switchTab('dns-aaaa')">AAAA</button>
          <button class="tab-btn" onclick="DomainModule.switchTab('dns-mx')">MX</button>
          <button class="tab-btn" onclick="DomainModule.switchTab('dns-ns')">NS</button>
          <button class="tab-btn" onclick="DomainModule.switchTab('dns-txt')">TXT</button>
        </div>

        <div class="tab-panel active" id="panel-dns-a">
          ${renderDNSRecords(data.dns?.A, 'A Record')}
        </div>
        <div class="tab-panel" id="panel-dns-aaaa">
          ${renderDNSRecords(data.dns?.AAAA, 'AAAA Record')}
        </div>
        <div class="tab-panel" id="panel-dns-mx">
          ${renderDNSRecords(data.dns?.MX, 'MX Record')}
        </div>
        <div class="tab-panel" id="panel-dns-ns">
          ${renderDNSRecords(data.dns?.NS, 'NS Record')}
        </div>
        <div class="tab-panel" id="panel-dns-txt">
          ${renderDNSRecords(data.dns?.TXT, 'TXT Record')}
        </div>
      </div>

      <!-- HTTP Headers -->
      ${data.headers ? `
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📡 HTTP Headers</h3>
        ${UI.createDataTable(Object.entries(data.headers).map(([k, v]) => [k, v]))}
      </div>` : ''}

      <!-- Technology Hints -->
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔧 Deteksi Teknologi</h3>
        <div class="info-grid">
          ${UI.createInfoItem('Server', data.headers?.server || data.headers?.Server || 'Tidak terdeteksi')}
          ${UI.createInfoItem('X-Powered-By', data.headers?.['x-powered-by'] || data.headers?.['X-Powered-By'] || 'Tidak terdeteksi')}
          ${UI.createInfoItem('Content-Type', data.headers?.['content-type'] || data.headers?.['Content-Type'] || 'N/A')}
        </div>
      </div>

      <!-- External Links -->
      <div class="glass-card-static">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔗 Informasi Lebih Lanjut</h3>
        <div class="reverse-search-links">
          <a href="https://www.whois.com/whois/${domain}" target="_blank" class="reverse-search-btn">📋 WHOIS</a>
          <a href="https://www.ssllabs.com/ssltest/analyze.html?d=${domain}" target="_blank" class="reverse-search-btn">🔒 SSL Labs</a>
          <a href="https://builtwith.com/${domain}" target="_blank" class="reverse-search-btn">🔧 BuiltWith</a>
          <a href="https://web.archive.org/web/*/${domain}" target="_blank" class="reverse-search-btn">🕰️ Wayback Machine</a>
          <a href="https://securityheaders.com/?q=${domain}" target="_blank" class="reverse-search-btn">🛡️ Security Headers</a>
          <a href="https://dnsdumpster.com/" target="_blank" class="reverse-search-btn">🗃️ DNS Dumpster</a>
          <a href="https://www.virustotal.com/gui/domain/${domain}" target="_blank" class="reverse-search-btn">🦠 VirusTotal</a>
        </div>
      </div>
    `;

    container.innerHTML = html;
    UI.toast('Analisis domain selesai', 'success');
  }

  function renderDNSRecords(records, label) {
    if (!records || records.length === 0) {
      return `<p class="text-sm text-muted">Tidak ada ${label} ditemukan</p>`;
    }
    return UI.createDataTable(records.map((r, i) => [`${label} ${i + 1}`, typeof r === 'object' ? JSON.stringify(r) : r]));
  }

  function switchTab(tabId) {
    // Hide all panels
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    // Show selected
    const panel = document.getElementById(`panel-${tabId}`);
    if (panel) panel.classList.add('active');

    // Highlight button (find by text content matching)
    event.target.classList.add('active');
  }

  function getHTML() {
    return `
      <div class="module-header">
        <h2>🔗 Analisis Domain</h2>
        <p>Analisis DNS records, HTTP headers, dan informasi teknis dari sebuah domain.</p>
      </div>
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">🔗</span>
          <input type="text" id="domain-input" placeholder="Masukkan domain (contoh: google.com)" autocomplete="off" spellcheck="false">
          <button class="search-btn" id="domain-search-btn">🔍 Analisis</button>
        </div>
      </div>
      <div id="domain-results">
        <div class="empty-state">
          <div class="empty-state-icon">🔗</div>
          <p class="empty-state-text">Masukkan nama domain untuk memulai analisis</p>
        </div>
      </div>
    `;
  }

  return { init, getHTML, switchTab };
})();
