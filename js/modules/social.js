// ============================================
// Social Media Scraping Module (Bahasa Indonesia)
// ============================================

const SocialModule = (() => {
  let lastResults = null;

  function init() {
    const searchBtn = document.getElementById('social-search-btn');
    const searchInput = document.getElementById('social-input');
    if (searchBtn) searchBtn.addEventListener('click', () => startSearch());
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startSearch(); });
  }

  async function startSearch() {
    const input = document.getElementById('social-input');
    const platformSelect = document.getElementById('social-platform');
    const query = input?.value.trim();
    const platform = platformSelect?.value || 'github';

    if (!query) { UI.toast('Masukkan username atau URL profil', 'warning'); return; }

    const container = document.getElementById('social-results');
    const platformNames = { github: 'GitHub', reddit: 'Reddit', instagram: 'Instagram', tiktok: 'TikTok' };
    container.innerHTML = `<div class="glass-card-static"><p style="text-align:center;color:var(--text-tertiary);">⏳ Mengambil data dari ${platformNames[platform] || platform}...</p></div>`;

    try {
      const resp = await fetch('/api/social-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, query }),
      });
      const data = await resp.json();
      lastResults = data;

      if (data.error) {
        container.innerHTML = `<div class="glass-card-static"><p style="color:var(--accent-red);text-align:center;">❌ ${data.error}</p></div>`;
        return;
      }

      renderResults(platform, data);
    } catch (error) {
      container.innerHTML = `<div class="glass-card-static"><p style="color:var(--accent-red);text-align:center;">❌ Gagal: ${error.message}</p></div>`;
    }
  }

  function renderResults(platform, data) {
    const container = document.getElementById('social-results');

    const renderers = {
      github: renderGitHub,
      reddit: renderReddit,
      instagram: renderInstagram,
      tiktok: renderTikTok,
    };

    const renderer = renderers[platform] || renderGeneric;
    container.innerHTML = renderer(data);
    UI.toast(`Data dari ${platform} berhasil diambil`, 'success');
  }

  // ---- GitHub Renderer ----
  function renderGitHub(data) {
    const u = data.profile || {};
    return `
      <div class="glass-card-static mb-lg">
        <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);flex-wrap:wrap;">
          ${u.avatar_url ? `<img src="${u.avatar_url}" alt="Avatar" style="width:80px;height:80px;border-radius:var(--radius-lg);border:1px solid var(--border-color);">` : ''}
          <div>
            <h3 style="font-size:1.3rem;color:var(--accent-cyan);">${u.name || u.login || 'N/A'}</h3>
            <p class="text-sm text-muted">@${u.login || 'N/A'}</p>
            ${u.bio ? `<p class="text-sm mt-sm" style="color:var(--text-secondary);">${u.bio}</p>` : ''}
          </div>
        </div>
        <div class="info-grid">
          ${UI.createInfoItem('Nama', u.name || 'Tidak diatur')}
          ${UI.createInfoItem('Username', u.login, true)}
          ${UI.createInfoItem('Bio', u.bio || 'Tidak ada')}
          ${UI.createInfoItem('Lokasi', u.location || 'Tidak diatur')}
          ${UI.createInfoItem('Perusahaan', u.company || 'Tidak diatur')}
          ${UI.createInfoItem('Website', u.blog || 'Tidak ada')}
          ${UI.createInfoItem('Email Publik', u.email || 'Tidak tersedia')}
          ${UI.createInfoItem('Twitter', u.twitter_username ? `@${u.twitter_username}` : 'Tidak diatur')}
          ${UI.createInfoItem('Repository Publik', u.public_repos?.toString() || '0')}
          ${UI.createInfoItem('Gists Publik', u.public_gists?.toString() || '0')}
          ${UI.createInfoItem('Pengikut', u.followers?.toString() || '0')}
          ${UI.createInfoItem('Mengikuti', u.following?.toString() || '0')}
          ${UI.createInfoItem('Bergabung', UI.formatDate(u.created_at))}
          ${UI.createInfoItem('Terakhir Aktif', UI.formatDate(u.updated_at))}
        </div>
      </div>

      ${data.repos && data.repos.length > 0 ? `
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📦 Repository Terbaru (${data.repos.length})</h3>
        <div style="max-height:400px;overflow-y:auto;">
          ${data.repos.map(r => `
            <div style="padding:var(--space-sm) 0;border-bottom:1px solid var(--border-color);">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <a href="${r.html_url}" target="_blank" class="text-cyan text-sm fw-600" style="text-decoration:none;">${r.name}</a>
                <div style="display:flex;gap:var(--space-md);">
                  <span class="text-sm text-muted">⭐ ${r.stargazers_count}</span>
                  <span class="text-sm text-muted">🍴 ${r.forks_count}</span>
                </div>
              </div>
              ${r.description ? `<p class="text-sm text-muted" style="margin-top:2px;">${r.description}</p>` : ''}
              ${r.language ? `<span class="badge badge-purple" style="margin-top:4px;">${r.language}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      ${data.events && data.events.length > 0 ? `
      <div class="glass-card-static">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📊 Aktivitas Terbaru</h3>
        <div style="max-height:300px;overflow-y:auto;">
          ${data.events.slice(0, 15).map(e => `
            <div style="padding:var(--space-sm) 0;border-bottom:1px solid var(--border-color);display:flex;justify-content:space-between;">
              <span class="text-sm">${formatEventType(e.type)} ${e.repo?.name ? `di <span class="text-cyan">${e.repo.name}</span>` : ''}</span>
              <span class="text-sm text-muted">${UI.formatDate(e.created_at)}</span>
            </div>
          `).join('')}
        </div>
      </div>` : ''}
    `;
  }

  // ---- Reddit Renderer ----
  function renderReddit(data) {
    const u = data.profile || {};
    return `
      <div class="glass-card-static mb-lg">
        <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);">
          ${u.icon_img ? `<img src="${u.icon_img.split('?')[0]}" alt="Avatar" style="width:80px;height:80px;border-radius:var(--radius-lg);border:1px solid var(--border-color);">` : '<div style="font-size:3rem;">🤖</div>'}
          <div>
            <h3 style="font-size:1.3rem;color:var(--accent-cyan);">u/${u.name || 'N/A'}</h3>
            ${u.subreddit?.public_description ? `<p class="text-sm mt-sm" style="color:var(--text-secondary);">${u.subreddit.public_description}</p>` : ''}
          </div>
        </div>
        <div class="info-grid">
          ${UI.createInfoItem('Username', u.name, true)}
          ${UI.createInfoItem('ID', u.id || 'N/A')}
          ${UI.createInfoItem('Total Karma', u.total_karma?.toLocaleString() || '0')}
          ${UI.createInfoItem('Link Karma', u.link_karma?.toLocaleString() || '0')}
          ${UI.createInfoItem('Comment Karma', u.comment_karma?.toLocaleString() || '0')}
          ${UI.createInfoItem('Akun Terverifikasi', u.verified ? '✅ Ya' : '❌ Tidak')}
          ${UI.createInfoItem('Memiliki Gold', u.is_gold ? '✅ Ya' : '❌ Tidak')}
          ${UI.createInfoItem('Bergabung', u.created_utc ? UI.formatDate(new Date(u.created_utc * 1000)) : 'N/A')}
        </div>
      </div>
    `;
  }

  // ---- Instagram Renderer ----
  function renderInstagram(data) {
    const u = data.profile || {};
    return `
      <div class="glass-card-static mb-lg">
        <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);flex-wrap:wrap;">
          ${u.profilePicture ? `<img src="${u.profilePicture}" alt="Avatar" style="width:80px;height:80px;border-radius:var(--radius-lg);border:2px solid var(--accent-purple);object-fit:cover;" onerror="this.style.display='none'">` : '<div style="font-size:3rem;">📸</div>'}
          <div>
            <h3 style="font-size:1.3rem;color:var(--accent-purple);">
              ${u.fullName || u.username || 'N/A'}
              ${u.verified ? '<span title="Verified" style="color:var(--accent-blue);margin-left:6px;">✓</span>' : ''}
            </h3>
            <p class="text-sm text-muted">@${u.username || 'N/A'}</p>
            ${u.bio ? `<p class="text-sm mt-sm" style="color:var(--text-secondary);max-width:500px;">${u.bio}</p>` : ''}
          </div>
        </div>

        <div class="stats-row" style="margin-bottom:var(--space-lg);">
          <div class="stat-card">
            <div class="stat-value" style="font-size:1.5rem;">${u.posts || '—'}</div>
            <div class="stat-label">Postingan</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="font-size:1.5rem;">${u.followers || '—'}</div>
            <div class="stat-label">Pengikut</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="font-size:1.5rem;">${u.following || '—'}</div>
            <div class="stat-label">Mengikuti</div>
          </div>
        </div>

        <div class="info-grid">
          ${UI.createInfoItem('Username', `@${u.username}`, true)}
          ${UI.createInfoItem('Nama Lengkap', u.fullName || 'Tidak tersedia')}
          ${UI.createInfoItem('Bio', u.bio || 'Tidak ada')}
          ${UI.createInfoItem('Terverifikasi', u.verified ? '✅ Ya' : '❌ Tidak')}
          ${UI.createInfoItem('Akun Privat', u.isPrivate ? '🔒 Ya' : '🌐 Tidak (Publik)')}
          ${UI.createInfoItem('Link Profil', u.profileUrl || 'N/A')}
        </div>

        <div class="reverse-search-links" style="margin-top:var(--space-lg);">
          <a href="https://www.instagram.com/${u.username}/" target="_blank" class="reverse-search-btn">📸 Buka Instagram</a>
          <a href="https://www.google.com/search?q=site:instagram.com+%22${u.username}%22" target="_blank" class="reverse-search-btn">🔍 Google Dorking</a>
          <a href="https://imginn.com/${u.username}/" target="_blank" class="reverse-search-btn">👁️ Viewer Alternatif</a>
        </div>
      </div>
    `;
  }

  // ---- TikTok Renderer ----
  function renderTikTok(data) {
    const u = data.profile || {};
    return `
      <div class="glass-card-static mb-lg">
        <div style="display:flex;align-items:center;gap:var(--space-lg);margin-bottom:var(--space-lg);flex-wrap:wrap;">
          ${u.profilePicture ? `<img src="${u.profilePicture}" alt="Avatar" style="width:80px;height:80px;border-radius:var(--radius-lg);border:2px solid var(--accent-red);object-fit:cover;" onerror="this.style.display='none'">` : '<div style="font-size:3rem;">🎵</div>'}
          <div>
            <h3 style="font-size:1.3rem;color:var(--accent-red);">
              ${u.fullName || u.username || 'N/A'}
              ${u.verified ? '<span title="Verified" style="color:var(--accent-blue);margin-left:6px;">✓</span>' : ''}
            </h3>
            <p class="text-sm text-muted">@${u.username || 'N/A'}</p>
            ${u.bio ? `<p class="text-sm mt-sm" style="color:var(--text-secondary);max-width:500px;">${u.bio}</p>` : ''}
          </div>
        </div>

        <div class="stats-row" style="margin-bottom:var(--space-lg);">
          <div class="stat-card">
            <div class="stat-value" style="font-size:1.5rem;">${u.followers || '—'}</div>
            <div class="stat-label">Pengikut</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="font-size:1.5rem;">${u.following || '—'}</div>
            <div class="stat-label">Mengikuti</div>
          </div>
          <div class="stat-card">
            <div class="stat-value" style="font-size:1.5rem;">${u.likes || '—'}</div>
            <div class="stat-label">Total Likes</div>
          </div>
          ${u.videos ? `
          <div class="stat-card">
            <div class="stat-value" style="font-size:1.5rem;">${u.videos}</div>
            <div class="stat-label">Video</div>
          </div>` : ''}
        </div>

        <div class="info-grid">
          ${UI.createInfoItem('Username', `@${u.username}`, true)}
          ${UI.createInfoItem('Nama Lengkap', u.fullName || 'Tidak tersedia')}
          ${UI.createInfoItem('Bio', u.bio || 'Tidak ada')}
          ${UI.createInfoItem('Terverifikasi', u.verified ? '✅ Ya' : '❌ Tidak')}
          ${UI.createInfoItem('Akun Privat', u.isPrivate ? '🔒 Ya' : '🌐 Tidak (Publik)')}
          ${u.region ? UI.createInfoItem('Region', u.region) : ''}
          ${u.diggCount ? UI.createInfoItem('Disukai (Digg)', u.diggCount) : ''}
          ${UI.createInfoItem('Link Profil', u.profileUrl || 'N/A')}
        </div>

        <div class="reverse-search-links" style="margin-top:var(--space-lg);">
          <a href="https://www.tiktok.com/@${u.username}" target="_blank" class="reverse-search-btn">🎵 Buka TikTok</a>
          <a href="https://www.google.com/search?q=site:tiktok.com+%22${u.username}%22" target="_blank" class="reverse-search-btn">🔍 Google Dorking</a>
          <a href="https://www.google.com/search?q=%22${u.username}%22+tiktok" target="_blank" class="reverse-search-btn">🌐 Cari di Web</a>
        </div>
      </div>
    `;
  }

  // ---- Generic Renderer ----
  function renderGeneric(data) {
    return `
      <div class="glass-card-static">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📄 Data Mentah</h3>
        <pre style="background:var(--bg-input);padding:var(--space-md);border-radius:var(--radius-md);overflow-x:auto;font-family:var(--font-mono);font-size:0.8rem;color:var(--text-secondary);max-height:500px;overflow-y:auto;">${JSON.stringify(data, null, 2)}</pre>
      </div>
    `;
  }

  function formatEventType(type) {
    const map = {
      PushEvent: '📤 Push',
      CreateEvent: '✨ Buat',
      DeleteEvent: '🗑️ Hapus',
      WatchEvent: '⭐ Star',
      ForkEvent: '🍴 Fork',
      IssuesEvent: '🐛 Issue',
      IssueCommentEvent: '💬 Komentar',
      PullRequestEvent: '🔀 Pull Request',
      PullRequestReviewEvent: '👀 Review PR',
      ReleaseEvent: '🏷️ Release',
      PublicEvent: '🌍 Public',
    };
    return map[type] || `📌 ${type.replace('Event', '')}`;
  }

  function exportResults() {
    if (!lastResults) { UI.toast('Belum ada hasil', 'warning'); return; }
    UI.exportJSON(lastResults, 'social-scrape.json');
  }

  function getHTML() {
    return `
      <div class="module-header">
        <h2>📱 Social Media Scraping</h2>
        <p>Ambil data profil publik dari berbagai platform media sosial.</p>
      </div>
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">📱</span>
          <select id="social-platform" style="background:var(--bg-input);border:1px solid var(--border-color);color:var(--text-primary);font-family:var(--font-sans);font-size:0.85rem;padding:var(--space-sm) var(--space-md);border-radius:var(--radius-md);outline:none;cursor:pointer;">
            <option value="github">🐙 GitHub</option>
            <option value="reddit">🤖 Reddit</option>
            <option value="instagram">📸 Instagram</option>
            <option value="tiktok">🎵 TikTok</option>
          </select>
          <input type="text" id="social-input" placeholder="Masukkan username" autocomplete="off" spellcheck="false">
          <button class="search-btn" id="social-search-btn">🔍 Ambil Data</button>
        </div>
      </div>
      <div class="disclaimer-banner">
        <span class="disclaimer-icon">ℹ️</span>
        <span>Modul ini mengambil data dari API publik dan meta tags halaman profil. Hanya data yang bersifat publik yang ditampilkan. Instagram & TikTok menggunakan teknik scraping meta tags sehingga hasilnya bisa bervariasi.</span>
      </div>
      <div id="social-results">
        <div class="empty-state">
          <div class="empty-state-icon">📱</div>
          <p class="empty-state-text">Pilih platform dan masukkan username untuk mengambil data profil</p>
        </div>
      </div>
    `;
  }

  return { init, getHTML, exportResults };
})();
