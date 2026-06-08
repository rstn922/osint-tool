// ============================================
// IP Geolocation Module (Bahasa Indonesia)
// ============================================

const IpModule = (() => {
  let leafletMap = null;
  let lastResults = null;

  function init() {
    const searchBtn = document.getElementById('ip-search-btn');
    const searchInput = document.getElementById('ip-input');
    const myIpBtn = document.getElementById('ip-myip-btn');

    if (searchBtn) searchBtn.addEventListener('click', () => startSearch());
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startSearch(); });
    if (myIpBtn) myIpBtn.addEventListener('click', () => lookupMyIP());
  }

  async function lookupMyIP() {
    const input = document.getElementById('ip-input');
    try {
      const resp = await fetch('https://api.ipify.org?format=json');
      const data = await resp.json();
      input.value = data.ip;
      startSearch();
    } catch {
      UI.toast('Gagal mendeteksi IP Anda', 'error');
    }
  }

  async function startSearch() {
    const input = document.getElementById('ip-input');
    const ip = input?.value.trim();

    if (!ip) { UI.toast('Masukkan alamat IP', 'warning'); return; }

    const container = document.getElementById('ip-results');
    container.innerHTML = `<div class="glass-card-static"><p style="text-align:center;color:var(--text-tertiary);">⏳ Mencari lokasi IP...</p></div>`;

    try {
      const data = await API.ipLookup(ip);
      lastResults = data;

      if (data.status === 'fail') {
        container.innerHTML = `<div class="glass-card-static"><p style="color:var(--accent-red);text-align:center;">❌ ${data.message || 'IP tidak valid atau tidak ditemukan'}</p></div>`;
        return;
      }

      renderResults(data);
    } catch (error) {
      container.innerHTML = `<div class="glass-card-static"><p style="color:var(--accent-red);text-align:center;">❌ Gagal: ${error.message}</p></div>`;
    }
  }

  function renderResults(data) {
    const container = document.getElementById('ip-results');

    // Country flag emoji from country code
    const flag = countryCodeToFlag(data.countryCode);

    let html = `
      <!-- IP Overview -->
      <div class="glass-card-static mb-lg">
        <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);">
          <div style="font-size:3rem;">${flag}</div>
          <div>
            <h3 style="font-size:1.3rem;font-family:var(--font-mono);color:var(--accent-cyan);">${data.query}</h3>
            <p class="text-sm text-muted">${data.city}, ${data.regionName}, ${data.country}</p>
          </div>
        </div>

        <div class="info-grid">
          ${UI.createInfoItem('Alamat IP', data.query, true)}
          ${UI.createInfoItem('Benua', data.continent)}
          ${UI.createInfoItem('Negara', `${flag} ${data.country} (${data.countryCode})`)}
          ${UI.createInfoItem('Wilayah', `${data.regionName} (${data.region})`)}
          ${UI.createInfoItem('Kota', data.city)}
          ${UI.createInfoItem('Kode Pos', data.zip || 'N/A')}
          ${UI.createInfoItem('Latitude', data.lat?.toFixed(6))}
          ${UI.createInfoItem('Longitude', data.lon?.toFixed(6))}
          ${UI.createInfoItem('Zona Waktu', data.timezone)}
          ${UI.createInfoItem('ISP', data.isp)}
          ${UI.createInfoItem('Organisasi', data.org)}
          ${UI.createInfoItem('AS Number', data.as)}
          ${UI.createInfoItem('AS Name', data.asname)}
        </div>
      </div>

      <!-- Map -->
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🗺️ Lokasi di Peta</h3>
        <div class="map-container" id="ip-map"></div>
      </div>

      <!-- Search Links -->
      <div class="glass-card-static">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔗 Informasi Lebih Lanjut</h3>
        <div class="reverse-search-links">
          <a href="https://www.google.com/search?q=${data.query}" target="_blank" class="reverse-search-btn">🔍 Google</a>
          <a href="https://www.shodan.io/host/${data.query}" target="_blank" class="reverse-search-btn">🔎 Shodan</a>
          <a href="https://www.abuseipdb.com/check/${data.query}" target="_blank" class="reverse-search-btn">🛡️ AbuseIPDB</a>
          <a href="https://www.virustotal.com/gui/ip-address/${data.query}" target="_blank" class="reverse-search-btn">🦠 VirusTotal</a>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Init map
    if (data.lat && data.lon) {
      setTimeout(() => initMap(data.lat, data.lon, data.city), 100);
    }

    UI.toast('Lokasi IP berhasil ditemukan', 'success');
  }

  function initMap(lat, lng, city) {
    const mapEl = document.getElementById('ip-map');
    if (!mapEl || !window.L) return;

    if (leafletMap) leafletMap.remove();

    leafletMap = L.map('ip-map').setView([lat, lng], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(leafletMap);

    L.marker([lat, lng])
      .addTo(leafletMap)
      .bindPopup(`📍 ${city || ''} (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
      .openPopup();
  }

  function countryCodeToFlag(code) {
    if (!code || code.length !== 2) return '🌍';
    const offset = 127397;
    return String.fromCodePoint(...[...code.toUpperCase()].map(c => c.charCodeAt(0) + offset));
  }

  function getHTML() {
    return `
      <div class="module-header">
        <h2>🌐 Geolokasi IP</h2>
        <p>Temukan lokasi geografis, ISP, dan informasi jaringan dari alamat IP.</p>
      </div>
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">🌐</span>
          <input type="text" id="ip-input" placeholder="Masukkan alamat IP (contoh: 8.8.8.8)" autocomplete="off" spellcheck="false">
          <button class="search-btn" id="ip-myip-btn" style="background:var(--accent-purple);margin-right:var(--space-sm);">📡 IP Saya</button>
          <button class="search-btn" id="ip-search-btn">🔍 Cari</button>
        </div>
      </div>
      <div id="ip-results">
        <div class="empty-state">
          <div class="empty-state-icon">🌐</div>
          <p class="empty-state-text">Masukkan alamat IP atau klik "IP Saya" untuk memulai</p>
        </div>
      </div>
    `;
  }

  return { init, getHTML };
})();
