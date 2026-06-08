// ============================================
// OSINT Intelligence Dashboard — UI Utilities
// ============================================

const UI = (() => {
  /**
   * Show toast notification
   */
  function toast(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  /**
   * Set progress bar
   */
  function setProgress(containerId, current, total, label = 'Scanning...') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('active');
    const fill = container.querySelector('.progress-fill');
    const labelEl = container.querySelector('.progress-label');
    const countEl = container.querySelector('.progress-count');

    const percent = Math.round((current / total) * 100);
    fill.style.width = `${percent}%`;
    labelEl.textContent = label;
    countEl.textContent = `${current}/${total}`;

    if (current >= total) {
      setTimeout(() => {
        container.classList.remove('active');
      }, 1000);
    }
  }

  /**
   * Create result card HTML
   */
  function createResultCard(data) {
    const {
      platform,
      icon,
      url,
      status, // 'found', 'not-found', 'error', 'checking'
      username,
      delay = 0,
    } = data;

    const statusClass = `status-${status}`;
    const statusText = {
      found: 'Found',
      'not-found': 'Not Found',
      error: 'Error',
      checking: 'Checking...',
    };

    const card = document.createElement('div');
    card.className = `result-card ${statusClass}`;
    card.style.animationDelay = `${delay}ms`;
    card.dataset.platform = platform;

    let linkHtml = '';
    if (status === 'found' && url) {
      linkHtml = `<a href="${url}" target="_blank" rel="noopener" class="result-link">
        View Profile →
      </a>`;
    }

    card.innerHTML = `
      <div class="result-card-header">
        <div class="result-card-icon">${icon}</div>
        <div>
          <div class="result-card-title">${platform}</div>
          <div class="result-card-subtitle">${username ? `@${username}` : ''}</div>
        </div>
        <span class="badge badge-${status === 'found' ? 'green' : status === 'error' ? 'red' : status === 'checking' ? 'yellow' : 'cyan'}" style="margin-left:auto;">
          ${statusText[status]}
        </span>
      </div>
      ${linkHtml}
    `;

    return card;
  }

  /**
   * Create info grid item
   */
  function createInfoItem(label, value, highlight = false) {
    return `
      <div class="info-item">
        <div class="info-item-label">${label}</div>
        <div class="info-item-value ${highlight ? 'highlight' : ''}">${value || 'N/A'}</div>
      </div>
    `;
  }

  /**
   * Create skeleton loader
   */
  function createSkeleton(width = '100%', height = '20px') {
    return `<div class="skeleton" style="width:${width};height:${height};"></div>`;
  }

  /**
   * Create data table
   */
  function createDataTable(rows) {
    let html = '<table class="data-table"><tbody>';
    rows.forEach(([label, value]) => {
      html += `<tr><td class="label">${label}</td><td class="value">${value || 'N/A'}</td></tr>`;
    });
    html += '</tbody></table>';
    return html;
  }

  /**
   * Animate counter
   */
  function animateCounter(element, target, duration = 1000) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      element.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /**
   * Export results to JSON
   */
  function exportJSON(data, filename = 'osint-results.json') {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast('Results exported successfully', 'success');
  }

  /**
   * Format timestamp
   */
  function formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Escape HTML
   */
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /**
   * Clear container
   */
  function clearResults(containerId) {
    const el = document.getElementById(containerId);
    if (el) el.innerHTML = '';
  }

  return {
    toast,
    setProgress,
    createResultCard,
    createInfoItem,
    createSkeleton,
    createDataTable,
    animateCounter,
    exportJSON,
    formatDate,
    escapeHtml,
    clearResults,
  };
})();
