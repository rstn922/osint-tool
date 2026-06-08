// ============================================
// Image EXIF Analysis Module (Bahasa Indonesia)
// ============================================

const ImageModule = (() => {
  let currentFile = null;
  let lastResults = null;
  let leafletMap = null;

  function init() {
    const dropZone = document.getElementById('image-drop-zone');
    const fileInput = document.getElementById('image-file-input');

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) handleFile(files[0]);
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) handleFile(e.target.files[0]);
      });
    }
  }

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      UI.toast('File harus berupa gambar (JPG, PNG, dll)', 'error');
      return;
    }

    currentFile = file;
    const reader = new FileReader();

    reader.onload = (e) => {
      const preview = document.getElementById('image-preview-container');
      const previewImg = document.getElementById('image-preview-img');
      const quickInfo = document.getElementById('image-quick-info');

      preview.classList.add('active');
      previewImg.src = e.target.result;

      // Basic file info
      quickInfo.innerHTML = `
        <div class="info-grid">
          ${UI.createInfoItem('Nama File', file.name)}
          ${UI.createInfoItem('Ukuran', formatFileSize(file.size))}
          ${UI.createInfoItem('Tipe', file.type)}
          ${UI.createInfoItem('Terakhir Diubah', UI.formatDate(file.lastModified))}
        </div>
      `;

      // Extract EXIF
      extractEXIF(e.target.result, file);
    };

    reader.readAsDataURL(file);
  }

  async function extractEXIF(dataUrl, file) {
    const resultsContainer = document.getElementById('image-exif-results');
    resultsContainer.innerHTML = `<div class="glass-card-static"><p style="text-align:center;color:var(--text-tertiary);">⏳ Mengekstrak metadata EXIF...</p></div>`;

    try {
      // Use server-side EXIF extraction
      const formData = new FormData();
      formData.append('image', file);

      const resp = await fetch('/api/exif-extract', {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();
      lastResults = data;
      renderEXIFResults(data, file);
    } catch (error) {
      // Fallback: client-side basic extraction
      renderBasicResults(file);
    }
  }

  function renderEXIFResults(data, file) {
    const container = document.getElementById('image-exif-results');
    const exif = data.exif || {};

    let html = '';

    // GPS Data
    const hasGPS = exif.latitude && exif.longitude;

    if (hasGPS) {
      html += `
        <div class="glass-card-static mb-lg">
          <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📍 Lokasi GPS</h3>
          <div class="info-grid mb-md">
            ${UI.createInfoItem('Latitude', exif.latitude.toFixed(6), true)}
            ${UI.createInfoItem('Longitude', exif.longitude.toFixed(6), true)}
            ${UI.createInfoItem('Altitude', exif.altitude ? `${exif.altitude}m` : 'N/A')}
          </div>
          <div class="map-container" id="exif-map"></div>
          <div class="reverse-search-links mt-md">
            <a href="https://www.google.com/maps?q=${exif.latitude},${exif.longitude}" target="_blank" class="reverse-search-btn">🗺️ Google Maps</a>
            <a href="https://www.openstreetmap.org/?mlat=${exif.latitude}&mlon=${exif.longitude}#map=16/${exif.latitude}/${exif.longitude}" target="_blank" class="reverse-search-btn">🌍 OpenStreetMap</a>
          </div>
        </div>
      `;
    }

    // Camera Info
    html += `
      <div class="glass-card-static mb-lg">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📷 Informasi Kamera</h3>
        <div class="info-grid">
          ${UI.createInfoItem('Merek Kamera', exif.make || 'Tidak tersedia')}
          ${UI.createInfoItem('Model', exif.model || 'Tidak tersedia')}
          ${UI.createInfoItem('Software', exif.software || 'Tidak tersedia')}
          ${UI.createInfoItem('Tanggal Foto', exif.dateTime || 'Tidak tersedia')}
          ${UI.createInfoItem('Aperture', exif.fNumber ? `f/${exif.fNumber}` : 'N/A')}
          ${UI.createInfoItem('Shutter Speed', exif.exposureTime || 'N/A')}
          ${UI.createInfoItem('ISO', exif.iso || 'N/A')}
          ${UI.createInfoItem('Focal Length', exif.focalLength ? `${exif.focalLength}mm` : 'N/A')}
          ${UI.createInfoItem('Lebar', exif.width ? `${exif.width}px` : 'N/A')}
          ${UI.createInfoItem('Tinggi', exif.height ? `${exif.height}px` : 'N/A')}
          ${UI.createInfoItem('Orientasi', exif.orientation || 'N/A')}
          ${UI.createInfoItem('Flash', exif.flash || 'N/A')}
        </div>
      </div>
    `;

    // Reverse Image Search
    html += `
      <div class="glass-card-static">
        <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔎 Pencarian Gambar Terbalik</h3>
        <p class="text-sm text-muted mb-md">Upload gambar ini ke layanan berikut untuk menemukan sumber asli atau gambar serupa:</p>
        <div class="reverse-search-links">
          <a href="https://images.google.com/" target="_blank" class="reverse-search-btn">🔍 Google Images</a>
          <a href="https://yandex.com/images/" target="_blank" class="reverse-search-btn">🔍 Yandex Images</a>
          <a href="https://tineye.com/" target="_blank" class="reverse-search-btn">👁️ TinEye</a>
          <a href="https://lens.google.com/" target="_blank" class="reverse-search-btn">📸 Google Lens</a>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Initialize map if GPS data exists
    if (hasGPS) {
      setTimeout(() => initMap(exif.latitude, exif.longitude), 100);
    }

    UI.toast('Metadata EXIF berhasil diekstrak', 'success');
  }

  function renderBasicResults(file) {
    const container = document.getElementById('image-exif-results');

    // Create an image to get dimensions
    const img = new Image();
    img.onload = () => {
      container.innerHTML = `
        <div class="glass-card-static mb-lg">
          <h3 style="margin-bottom:var(--space-md);font-size:1rem;">📷 Informasi Dasar</h3>
          <div class="info-grid">
            ${UI.createInfoItem('Nama File', file.name)}
            ${UI.createInfoItem('Ukuran', formatFileSize(file.size))}
            ${UI.createInfoItem('Tipe', file.type)}
            ${UI.createInfoItem('Dimensi', `${img.naturalWidth} × ${img.naturalHeight} px`)}
            ${UI.createInfoItem('Terakhir Diubah', UI.formatDate(file.lastModified))}
          </div>
          <p class="text-sm text-muted mt-md">⚠️ EXIF detail tidak tersedia. Gambar ini mungkin sudah di-strip metadata-nya (umum untuk gambar yang diupload ke social media).</p>
        </div>
        <div class="glass-card-static">
          <h3 style="margin-bottom:var(--space-md);font-size:1rem;">🔎 Pencarian Gambar Terbalik</h3>
          <div class="reverse-search-links">
            <a href="https://images.google.com/" target="_blank" class="reverse-search-btn">🔍 Google Images</a>
            <a href="https://yandex.com/images/" target="_blank" class="reverse-search-btn">🔍 Yandex Images</a>
            <a href="https://tineye.com/" target="_blank" class="reverse-search-btn">👁️ TinEye</a>
            <a href="https://lens.google.com/" target="_blank" class="reverse-search-btn">📸 Google Lens</a>
          </div>
        </div>
      `;
    };
    img.src = URL.createObjectURL(file);
  }

  function initMap(lat, lng) {
    const mapEl = document.getElementById('exif-map');
    if (!mapEl || !window.L) return;

    if (leafletMap) leafletMap.remove();

    leafletMap = L.map('exif-map').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(leafletMap);

    L.marker([lat, lng])
      .addTo(leafletMap)
      .bindPopup(`📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      .openPopup();
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function getHTML() {
    return `
      <div class="module-header">
        <h2>🖼️ Analisis EXIF Gambar</h2>
        <p>Ekstrak metadata tersembunyi dari foto: lokasi GPS, info kamera, waktu pengambilan, dan lainnya.</p>
      </div>
      <div class="drop-zone" id="image-drop-zone">
        <input type="file" id="image-file-input" accept="image/*">
        <div class="drop-zone-icon">🖼️</div>
        <div class="drop-zone-text">Seret & lepas gambar di sini, atau klik untuk memilih file</div>
        <div class="drop-zone-hint">Mendukung JPG, PNG, TIFF, WebP</div>
      </div>
      <div class="image-preview-container" id="image-preview-container">
        <div class="image-preview-wrapper">
          <div class="image-preview">
            <img id="image-preview-img" alt="Preview">
          </div>
          <div class="image-meta-quick" id="image-quick-info"></div>
        </div>
      </div>
      <div id="image-exif-results"></div>
    `;
  }

  return { init, getHTML };
})();
