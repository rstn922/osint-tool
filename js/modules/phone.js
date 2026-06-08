// ============================================
// Phone Number Lookup Module (Bahasa Indonesia)
// ============================================

const PhoneModule = (() => {
  // Country codes database
  const COUNTRY_CODES = {
    '1': { country: 'Amerika Serikat / Kanada', flag: '🇺🇸', code: 'US/CA' },
    '7': { country: 'Rusia', flag: '🇷🇺', code: 'RU' },
    '20': { country: 'Mesir', flag: '🇪🇬', code: 'EG' },
    '27': { country: 'Afrika Selatan', flag: '🇿🇦', code: 'ZA' },
    '30': { country: 'Yunani', flag: '🇬🇷', code: 'GR' },
    '31': { country: 'Belanda', flag: '🇳🇱', code: 'NL' },
    '33': { country: 'Prancis', flag: '🇫🇷', code: 'FR' },
    '34': { country: 'Spanyol', flag: '🇪🇸', code: 'ES' },
    '39': { country: 'Italia', flag: '🇮🇹', code: 'IT' },
    '44': { country: 'Inggris', flag: '🇬🇧', code: 'GB' },
    '49': { country: 'Jerman', flag: '🇩🇪', code: 'DE' },
    '55': { country: 'Brasil', flag: '🇧🇷', code: 'BR' },
    '60': { country: 'Malaysia', flag: '🇲🇾', code: 'MY' },
    '61': { country: 'Australia', flag: '🇦🇺', code: 'AU' },
    '62': { country: 'Indonesia', flag: '🇮🇩', code: 'ID' },
    '63': { country: 'Filipina', flag: '🇵🇭', code: 'PH' },
    '65': { country: 'Singapura', flag: '🇸🇬', code: 'SG' },
    '66': { country: 'Thailand', flag: '🇹🇭', code: 'TH' },
    '81': { country: 'Jepang', flag: '🇯🇵', code: 'JP' },
    '82': { country: 'Korea Selatan', flag: '🇰🇷', code: 'KR' },
    '84': { country: 'Vietnam', flag: '🇻🇳', code: 'VN' },
    '86': { country: 'Tiongkok', flag: '🇨🇳', code: 'CN' },
    '90': { country: 'Turki', flag: '🇹🇷', code: 'TR' },
    '91': { country: 'India', flag: '🇮🇳', code: 'IN' },
    '92': { country: 'Pakistan', flag: '🇵🇰', code: 'PK' },
    '93': { country: 'Afghanistan', flag: '🇦🇫', code: 'AF' },
    '94': { country: 'Sri Lanka', flag: '🇱🇰', code: 'LK' },
    '95': { country: 'Myanmar', flag: '🇲🇲', code: 'MM' },
    '212': { country: 'Maroko', flag: '🇲🇦', code: 'MA' },
    '234': { country: 'Nigeria', flag: '🇳🇬', code: 'NG' },
    '380': { country: 'Ukraina', flag: '🇺🇦', code: 'UA' },
    '852': { country: 'Hong Kong', flag: '🇭🇰', code: 'HK' },
    '855': { country: 'Kamboja', flag: '🇰🇭', code: 'KH' },
    '880': { country: 'Bangladesh', flag: '🇧🇩', code: 'BD' },
    '966': { country: 'Arab Saudi', flag: '🇸🇦', code: 'SA' },
    '971': { country: 'UAE', flag: '🇦🇪', code: 'AE' },
  };

  // Indonesian operators
  const ID_OPERATORS = {
    '0811': 'Telkomsel (Halo)', '0812': 'Telkomsel', '0813': 'Telkomsel',
    '0821': 'Telkomsel', '0822': 'Telkomsel', '0823': 'Telkomsel',
    '0851': 'Telkomsel', '0852': 'Telkomsel', '0853': 'Telkomsel',
    '0814': 'Indosat', '0815': 'Indosat', '0816': 'Indosat',
    '0855': 'Indosat', '0856': 'Indosat', '0857': 'Indosat', '0858': 'Indosat',
    '0817': 'XL Axiata', '0818': 'XL Axiata', '0819': 'XL Axiata',
    '0859': 'XL Axiata', '0877': 'XL Axiata', '0878': 'XL Axiata',
    '0831': 'AXIS', '0832': 'AXIS', '0833': 'AXIS', '0838': 'AXIS',
    '0895': 'Three (3)', '0896': 'Three (3)', '0897': 'Three (3)', '0898': 'Three (3)', '0899': 'Three (3)',
    '0881': 'Smartfren', '0882': 'Smartfren', '0883': 'Smartfren',
    '0884': 'Smartfren', '0885': 'Smartfren', '0886': 'Smartfren',
    '0887': 'Smartfren', '0888': 'Smartfren', '0889': 'Smartfren',
  };

  let lastResults = null;

  function init() {
    const searchBtn = document.getElementById('phone-search-btn');
    const searchInput = document.getElementById('phone-input');
    if (searchBtn) searchBtn.addEventListener('click', () => startSearch());
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startSearch(); });
  }

  function parsePhone(raw) {
    let cleaned = raw.replace(/[\s\-\(\)\.]/g, '');
    let international = false;
    let countryCode = '';
    let localNumber = cleaned;

    if (cleaned.startsWith('+')) {
      international = true;
      cleaned = cleaned.substring(1);
      // Try matching country codes (3, 2, 1 digit)
      for (let len = 3; len >= 1; len--) {
        const prefix = cleaned.substring(0, len);
        if (COUNTRY_CODES[prefix]) {
          countryCode = prefix;
          localNumber = cleaned.substring(len);
          break;
        }
      }
    } else if (cleaned.startsWith('00')) {
      international = true;
      cleaned = cleaned.substring(2);
      for (let len = 3; len >= 1; len--) {
        const prefix = cleaned.substring(0, len);
        if (COUNTRY_CODES[prefix]) {
          countryCode = prefix;
          localNumber = cleaned.substring(len);
          break;
        }
      }
    } else if (cleaned.startsWith('0')) {
      // Assume Indonesian local number
      countryCode = '62';
      localNumber = cleaned.substring(1);
    }

    const countryInfo = COUNTRY_CODES[countryCode] || null;
    let operator = null;

    // Detect Indonesian operator
    if (countryCode === '62') {
      const localWith0 = '0' + localNumber;
      for (let len = 4; len >= 3; len--) {
        const prefix = localWith0.substring(0, len);
        if (ID_OPERATORS[prefix]) {
          operator = ID_OPERATORS[prefix];
          break;
        }
      }
    }

    // Determine number type
    let numberType = 'Tidak diketahui';
    if (localNumber.length >= 9 && localNumber.length <= 12) numberType = 'Seluler (Mobile)';
    else if (localNumber.length >= 6 && localNumber.length <= 8) numberType = 'Telepon Tetap (Landline)';

    return {
      original: raw,
      cleaned: `+${countryCode}${localNumber}`,
      countryCode,
      localNumber,
      countryInfo,
      operator,
      numberType,
      international,
      valid: countryCode !== '' && localNumber.length >= 6,
    };
  }

  async function startSearch() {
    const input = document.getElementById('phone-input');
    const phone = input?.value.trim();

    if (!phone) { UI.toast('Masukkan nomor telepon', 'warning'); return; }

    const parsed = parsePhone(phone);
    lastResults = parsed;
    renderResults(parsed);
  }

  function renderResults(data) {
    const container = document.getElementById('phone-results');

    if (!data.valid) {
      container.innerHTML = `
        <div class="glass-card-static">
          <p style="color:var(--accent-red);text-align:center;">
            ❌ Nomor telepon tidak valid atau kode negara tidak dikenali.<br>
            <span class="text-sm text-muted">Gunakan format internasional: +62812xxxx atau 0812xxxx</span>
          </p>
        </div>`;
      return;
    }

    const ci = data.countryInfo;

    let html = `
      <!-- Phone Overview -->
      <div class="glass-card-static mb-lg">
        <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);">
          <div style="font-size:3rem;">${ci ? ci.flag : '📱'}</div>
          <div>
            <h3 style="font-size:1.3rem;font-family:var(--font-mono);color:var(--accent-cyan);">${data.cleaned}</h3>
            <p class="text-sm text-muted">${ci ? ci.country : 'Negara tidak diketahui'}</p>
          </div>
        </div>

        <div class="info-grid">
          ${UI.createInfoItem('Nomor Asli', data.original)}
          ${UI.createInfoItem('Format Internasional', data.cleaned, true)}
          ${UI.createInfoItem('Kode Negara', data.countryCode ? `+${data.countryCode}` : 'N/A')}
          ${UI.createInfoItem('Negara', ci ? `${ci.flag} ${ci.country}` : 'Tidak diketahui')}
          ${UI.createInfoItem('Kode ISO', ci ? ci.code : 'N/A')}
          ${UI.createInfoItem('Nomor Lokal', data.localNumber)}
          ${UI.createInfoItem('Tipe Nomor', data.numberType)}
          ${UI.createInfoItem('Operator / Carrier', data.operator || 'Tidak terdeteksi')}
        </div>
      </div>

      <!-- Search Links -->
      <div class="glass-card-static">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔗 Cari Nomor Ini</h3>
        <div class="reverse-search-links">
          <a href="https://www.google.com/search?q=%22${encodeURIComponent(data.cleaned)}%22" target="_blank" class="reverse-search-btn">🔍 Google</a>
          <a href="https://www.google.com/search?q=%22${encodeURIComponent(data.original)}%22" target="_blank" class="reverse-search-btn">🔍 Google (format asli)</a>
          <a href="https://wa.me/${data.countryCode}${data.localNumber}" target="_blank" class="reverse-search-btn">💬 Cek WhatsApp</a>
          <a href="https://www.truecaller.com/search/id/${data.localNumber}" target="_blank" class="reverse-search-btn">📞 Truecaller</a>
        </div>
      </div>
    `;

    container.innerHTML = html;
    UI.toast('Analisis nomor telepon selesai', 'success');
  }

  function getHTML() {
    return `
      <div class="module-header">
        <h2>📱 Pencarian Nomor Telepon</h2>
        <p>Analisis nomor telepon: deteksi negara, operator, tipe nomor, dan cari informasi terkait.</p>
      </div>
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">📱</span>
          <input type="tel" id="phone-input" placeholder="Masukkan nomor telepon (contoh: +6281234567890)" autocomplete="off" spellcheck="false">
          <button class="search-btn" id="phone-search-btn">🔍 Analisis</button>
        </div>
      </div>
      <div class="disclaimer-banner">
        <span class="disclaimer-icon">💡</span>
        <span>Mendukung format: +62812xxx, 0812xxx, 00628xxx. Deteksi operator khusus Indonesia (Telkomsel, Indosat, XL, Three, Smartfren, AXIS).</span>
      </div>
      <div id="phone-results">
        <div class="empty-state">
          <div class="empty-state-icon">📱</div>
          <p class="empty-state-text">Masukkan nomor telepon untuk memulai analisis</p>
        </div>
      </div>
    `;
  }

  return { init, getHTML };
})();
