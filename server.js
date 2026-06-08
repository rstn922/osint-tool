// ============================================
// OSINT Intelligence Dashboard — Express Server
// ============================================

const express = require('express');
const path = require('path');
const dns = require('dns').promises;
const https = require('https');
const http = require('http');
const { URL } = require('url');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// File upload for EXIF
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// ---- Helper Functions ----

/**
 * Make HTTP(S) request and return status
 */
function checkUrlStatus(targetUrl, timeout = 8000) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(targetUrl, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      }, (res) => {
        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Check if redirect leads to a "not found" type page
          const location = res.headers.location;
          if (location.includes('/login') || location.includes('/signup') || location.includes('404') || location.includes('/sorry')) {
            resolve({ exists: false, status: res.statusCode });
          } else {
            resolve({ exists: true, status: res.statusCode });
          }
        } else {
          resolve({ exists: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
        }
        res.resume(); // consume response
      });

      req.on('error', () => resolve({ exists: false, status: 0 }));
      req.on('timeout', () => { req.destroy(); resolve({ exists: false, status: 0 }); });
    } catch {
      resolve({ exists: false, status: 0 });
    }
  });
}

/**
 * Fetch URL content as text
 */
function fetchUrl(targetUrl, timeout = 10000) {
  return new Promise((resolve, reject) => {
    try {
      const parsed = new URL(targetUrl);
      const client = parsed.protocol === 'https:' ? https : http;

      const req = client.get(targetUrl, {
        timeout,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/html, */*',
        },
      }, (res) => {
        // Follow redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchUrl(res.headers.location, timeout).then(resolve).catch(reject);
          return;
        }

        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    } catch (e) { reject(e); }
  });
}

// ---- API Routes ----

/**
 * Check if a URL exists (username lookup)
 */
app.get('/api/check', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.json({ exists: false, error: 'No URL' });

  const result = await checkUrlStatus(url);
  res.json(result);
});

/**
 * Email lookup
 */
app.post('/api/email-lookup', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const [localPart, domain] = email.split('@');

  // Email format validation
  const validFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // MX record lookup
  let mxRecords = [];
  let hasMx = false;
  try {
    const mx = await dns.resolveMx(domain);
    mxRecords = mx.sort((a, b) => a.priority - b.priority).map(r => `${r.exchange} (priority: ${r.priority})`);
    hasMx = mxRecords.length > 0;
  } catch { }

  // Check disposable email domains
  const disposableDomains = [
    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
    'yopmail.com', 'trashmail.com', 'temp-mail.org', 'fakeinbox.com',
    'sharklasers.com', 'guerrillamailblock.com', '10minutemail.com',
    'getnada.com', 'dispostable.com', 'maildrop.cc', 'mailnesia.com',
  ];
  const isDisposable = disposableDomains.includes(domain.toLowerCase());

  // Provider detection
  const providers = {
    'gmail.com': 'Google Gmail',
    'googlemail.com': 'Google Gmail',
    'yahoo.com': 'Yahoo Mail',
    'outlook.com': 'Microsoft Outlook',
    'hotmail.com': 'Microsoft Hotmail',
    'live.com': 'Microsoft Live',
    'icloud.com': 'Apple iCloud',
    'me.com': 'Apple',
    'protonmail.com': 'ProtonMail',
    'proton.me': 'ProtonMail',
    'aol.com': 'AOL Mail',
    'zoho.com': 'Zoho Mail',
    'mail.com': 'Mail.com',
    'yandex.com': 'Yandex Mail',
    'tutanota.com': 'Tutanota',
  };

  const provider = providers[domain.toLowerCase()] || null;

  // Type detection
  let type = 'Personal';
  if (provider) type = 'Free Email Provider';
  else if (isDisposable) type = 'Disposable/Temporary';
  else type = 'Custom Domain (Bisnis/Organisasi)';

  res.json({
    email,
    validFormat,
    hasMx,
    mxRecords,
    isDisposable,
    provider,
    type,
    domain,
    possibleName: null,
  });
});

/**
 * Domain lookup
 */
app.post('/api/domain-lookup', async (req, res) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ error: 'Domain required' });

  const result = {
    domain,
    ip: null,
    reachable: false,
    dns: { A: [], AAAA: [], MX: [], NS: [], TXT: [] },
    headers: null,
  };

  // DNS lookups
  try { result.dns.A = await dns.resolve4(domain); result.ip = result.dns.A[0]; } catch { }
  try { result.dns.AAAA = await dns.resolve6(domain); } catch { }
  try {
    const mx = await dns.resolveMx(domain);
    result.dns.MX = mx.sort((a, b) => a.priority - b.priority).map(r => `${r.exchange} (priority: ${r.priority})`);
  } catch { }
  try { result.dns.NS = await dns.resolveNs(domain); } catch { }
  try {
    const txt = await dns.resolveTxt(domain);
    result.dns.TXT = txt.map(r => r.join(''));
  } catch { }

  // HTTP headers
  try {
    const resp = await fetchUrl(`https://${domain}`, 8000);
    result.reachable = resp.status >= 200 && resp.status < 400;
    result.headers = resp.headers;
  } catch {
    try {
      const resp = await fetchUrl(`http://${domain}`, 8000);
      result.reachable = resp.status >= 200 && resp.status < 400;
      result.headers = resp.headers;
    } catch { }
  }

  res.json(result);
});

/**
 * EXIF extraction from uploaded image
 */
app.post('/api/exif-extract', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const buffer = req.file.buffer;
  const exif = {};

  try {
    // Parse EXIF from JPEG
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      const parsed = parseExifFromJpeg(buffer);
      Object.assign(exif, parsed);
    }
  } catch (e) {
    // Silently fail EXIF parsing
  }

  // Basic image info
  exif.fileName = req.file.originalname;
  exif.fileSize = req.file.size;
  exif.mimeType = req.file.mimetype;

  res.json({ exif });
});

/**
 * Simple EXIF parser for JPEG files
 */
function parseExifFromJpeg(buffer) {
  const result = {};

  // Find EXIF marker (APP1 = 0xFFE1)
  let offset = 2; // Skip SOI
  while (offset < buffer.length - 1) {
    if (buffer[offset] !== 0xFF) break;
    const marker = buffer[offset + 1];

    if (marker === 0xE1) { // APP1 (EXIF)
      const length = buffer.readUInt16BE(offset + 2);
      const exifData = buffer.slice(offset + 4, offset + 2 + length);

      // Check for "Exif\0\0"
      if (exifData.toString('ascii', 0, 4) === 'Exif') {
        parseExifData(exifData.slice(6), result);
      }
      break;
    }

    // Skip to next marker
    if (marker === 0xD8 || marker === 0xD9) {
      offset += 2;
    } else {
      const segLength = buffer.readUInt16BE(offset + 2);
      offset += 2 + segLength;
    }
  }

  return result;
}

function parseExifData(data, result) {
  // Determine byte order
  const isLittleEndian = data.toString('ascii', 0, 2) === 'II';

  function readUint16(buf, pos) {
    return isLittleEndian ? buf.readUInt16LE(pos) : buf.readUInt16BE(pos);
  }

  function readUint32(buf, pos) {
    return isLittleEndian ? buf.readUInt32LE(pos) : buf.readUInt32BE(pos);
  }

  function readString(buf, pos, len) {
    let str = '';
    for (let i = 0; i < len; i++) {
      const c = buf[pos + i];
      if (c === 0) break;
      str += String.fromCharCode(c);
    }
    return str.trim();
  }

  function readRational(buf, pos) {
    const num = readUint32(buf, pos);
    const den = readUint32(buf, pos + 4);
    return den ? num / den : 0;
  }

  // EXIF tag definitions
  const TAGS = {
    0x010F: 'make',
    0x0110: 'model',
    0x0112: 'orientation',
    0x011A: 'xResolution',
    0x011B: 'yResolution',
    0x0131: 'software',
    0x0132: 'dateTime',
    0x8769: 'exifIFDPointer',
    0x8825: 'gpsIFDPointer',
    0x9003: 'dateTimeOriginal',
    0x920A: 'focalLength',
    0x829A: 'exposureTime',
    0x829D: 'fNumber',
    0x8827: 'iso',
    0xA002: 'width',
    0xA003: 'height',
    0x9209: 'flash',
  };

  const GPS_TAGS = {
    0x0001: 'latRef',
    0x0002: 'lat',
    0x0003: 'lonRef',
    0x0004: 'lon',
    0x0005: 'altRef',
    0x0006: 'alt',
  };

  try {
    // Read IFD0
    const ifd0Offset = readUint32(data, 4);
    const entries = readUint16(data, ifd0Offset);

    let exifIFDPointer = null;
    let gpsIFDPointer = null;

    for (let i = 0; i < entries; i++) {
      const entryOffset = ifd0Offset + 2 + (i * 12);
      const tag = readUint16(data, entryOffset);
      const type = readUint16(data, entryOffset + 2);
      const count = readUint32(data, entryOffset + 4);
      const valueOffset = entryOffset + 8;

      const tagName = TAGS[tag];
      if (!tagName) continue;

      if (tagName === 'exifIFDPointer') {
        exifIFDPointer = readUint32(data, valueOffset);
      } else if (tagName === 'gpsIFDPointer') {
        gpsIFDPointer = readUint32(data, valueOffset);
      } else if (type === 2) { // ASCII
        const strOffset = count > 4 ? readUint32(data, valueOffset) : valueOffset;
        result[tagName] = readString(data, strOffset, count);
      } else if (type === 3) { // SHORT
        result[tagName] = readUint16(data, valueOffset);
      } else if (type === 4) { // LONG
        result[tagName] = readUint32(data, valueOffset);
      } else if (type === 5) { // RATIONAL
        const ratOffset = readUint32(data, valueOffset);
        result[tagName] = readRational(data, ratOffset);
      }
    }

    // Parse EXIF IFD
    if (exifIFDPointer) {
      const exifEntries = readUint16(data, exifIFDPointer);
      for (let i = 0; i < exifEntries; i++) {
        const entryOffset = exifIFDPointer + 2 + (i * 12);
        const tag = readUint16(data, entryOffset);
        const type = readUint16(data, entryOffset + 2);
        const count = readUint32(data, entryOffset + 4);
        const valueOffset = entryOffset + 8;

        const tagName = TAGS[tag];
        if (!tagName) continue;

        if (type === 2) {
          const strOffset = count > 4 ? readUint32(data, valueOffset) : valueOffset;
          result[tagName] = readString(data, strOffset, count);
        } else if (type === 3) {
          result[tagName] = readUint16(data, valueOffset);
        } else if (type === 4) {
          result[tagName] = readUint32(data, valueOffset);
        } else if (type === 5) {
          const ratOffset = readUint32(data, valueOffset);
          result[tagName] = readRational(data, ratOffset);
        }
      }
    }

    // Parse GPS IFD
    if (gpsIFDPointer) {
      const gpsData = {};
      const gpsEntries = readUint16(data, gpsIFDPointer);

      for (let i = 0; i < gpsEntries; i++) {
        const entryOffset = gpsIFDPointer + 2 + (i * 12);
        const tag = readUint16(data, entryOffset);
        const type = readUint16(data, entryOffset + 2);
        const count = readUint32(data, entryOffset + 4);
        const valueOffset = entryOffset + 8;

        const tagName = GPS_TAGS[tag];
        if (!tagName) continue;

        if (type === 2) { // ASCII (lat/lon ref)
          gpsData[tagName] = String.fromCharCode(data[valueOffset]);
        } else if (type === 5 && count === 3) { // RATIONAL x3 (degrees, minutes, seconds)
          const ratOffset = readUint32(data, valueOffset);
          const deg = readRational(data, ratOffset);
          const min = readRational(data, ratOffset + 8);
          const sec = readRational(data, ratOffset + 16);
          gpsData[tagName] = deg + min / 60 + sec / 3600;
        } else if (type === 5 && count === 1) {
          const ratOffset = readUint32(data, valueOffset);
          gpsData[tagName] = readRational(data, ratOffset);
        }
      }

      // Convert to decimal coordinates
      if (gpsData.lat && gpsData.latRef) {
        result.latitude = gpsData.latRef === 'S' ? -gpsData.lat : gpsData.lat;
      }
      if (gpsData.lon && gpsData.lonRef) {
        result.longitude = gpsData.lonRef === 'W' ? -gpsData.lon : gpsData.lon;
      }
      if (gpsData.alt !== undefined) {
        result.altitude = gpsData.altRef === 1 ? -gpsData.alt : gpsData.alt;
      }
    }

    // Flash interpretation
    if (result.flash !== undefined) {
      const flashFired = result.flash & 0x01;
      result.flash = flashFired ? 'Fired' : 'Not fired';
    }

    // Exposure time formatting
    if (result.exposureTime && typeof result.exposureTime === 'number') {
      if (result.exposureTime < 1) {
        result.exposureTime = `1/${Math.round(1 / result.exposureTime)}s`;
      } else {
        result.exposureTime = `${result.exposureTime}s`;
      }
    }

  } catch (e) {
    // Parsing error — return partial results
  }
}

/**
 * Social media scraping
 */
app.post('/api/social-scrape', async (req, res) => {
  const { platform, query } = req.body;
  if (!platform || !query) return res.status(400).json({ error: 'Platform and query required' });

  try {
    if (platform === 'github') {
      // Fetch GitHub profile + repos + events
      const [profileResp, reposResp, eventsResp] = await Promise.allSettled([
        fetchUrl(`https://api.github.com/users/${encodeURIComponent(query)}`),
        fetchUrl(`https://api.github.com/users/${encodeURIComponent(query)}/repos?sort=updated&per_page=10`),
        fetchUrl(`https://api.github.com/users/${encodeURIComponent(query)}/events/public?per_page=15`),
      ]);

      const profile = profileResp.status === 'fulfilled' ? JSON.parse(profileResp.value.data) : {};
      const repos = reposResp.status === 'fulfilled' ? JSON.parse(reposResp.value.data) : [];
      const events = eventsResp.status === 'fulfilled' ? JSON.parse(eventsResp.value.data) : [];

      if (profile.message === 'Not Found') {
        return res.json({ error: `User "${query}" tidak ditemukan di GitHub` });
      }

      res.json({ profile, repos: Array.isArray(repos) ? repos : [], events: Array.isArray(events) ? events : [] });

    } else if (platform === 'reddit') {
      const resp = await fetchUrl(`https://www.reddit.com/user/${encodeURIComponent(query)}/about.json`);
      const data = JSON.parse(resp.data);

      if (data.error) {
        return res.json({ error: `User "${query}" tidak ditemukan di Reddit` });
      }

      res.json({ profile: data.data || {} });

    } else if (platform === 'instagram') {
      // Instagram: scrape public profile page for metadata
      try {
        const resp = await fetchUrl(`https://www.instagram.com/${encodeURIComponent(query)}/`, 10000);
        if (resp.status === 404) {
          return res.json({ error: `User "${query}" tidak ditemukan di Instagram` });
        }

        const html = resp.data;
        const profile = { username: query };

        // Extract from meta tags and JSON in HTML
        const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/) ||
                        html.match(/<meta\s+content="([^"]*)"\s+property="og:title"/);
        if (ogTitle) profile.fullName = ogTitle[1].split('(')[0].trim().replace(/\s*\(@.*\)/, '');

        const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/) ||
                       html.match(/<meta\s+content="([^"]*)"\s+property="og:description"/);
        if (ogDesc) {
          const desc = ogDesc[1];
          profile.description = desc;
          // Try to parse follower counts from description
          const followersMatch = desc.match(/([\d,.]+[KMkm]?)\s*Followers/i);
          const followingMatch = desc.match(/([\d,.]+[KMkm]?)\s*Following/i);
          const postsMatch = desc.match(/([\d,.]+[KMkm]?)\s*Posts/i);
          if (followersMatch) profile.followers = followersMatch[1];
          if (followingMatch) profile.following = followingMatch[1];
          if (postsMatch) profile.posts = postsMatch[1];
          // Get bio from after the dash
          const bioParts = desc.split(' - ');
          if (bioParts.length > 1) profile.bio = bioParts.slice(1).join(' - ').replace(/"/g, '');
        }

        const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/) ||
                        html.match(/<meta\s+content="([^"]*)"\s+property="og:image"/);
        if (ogImage) profile.profilePicture = ogImage[1];

        // Check if account is verified
        profile.verified = html.includes('"is_verified":true');
        // Check if private
        profile.isPrivate = html.includes('"is_private":true');

        profile.profileUrl = `https://www.instagram.com/${query}/`;

        res.json({ profile });
      } catch (err) {
        res.json({ error: `Gagal mengambil data Instagram: ${err.message}. Pastikan username benar dan profil bersifat publik.` });
      }

    } else if (platform === 'tiktok') {
      // TikTok: scrape public profile page for metadata
      try {
        const resp = await fetchUrl(`https://www.tiktok.com/@${encodeURIComponent(query)}`, 10000);
        if (resp.status === 404) {
          return res.json({ error: `User "${query}" tidak ditemukan di TikTok` });
        }

        const html = resp.data;
        const profile = { username: query };

        // Extract from meta tags
        const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/) ||
                        html.match(/<meta\s+content="([^"]*)"\s+property="og:title"/);
        if (ogTitle) profile.fullName = ogTitle[1].replace(/\s*\(@.*\)/, '').replace(' on TikTok', '').replace(/ \| TikTok/, '').trim();

        const ogDesc = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/) ||
                       html.match(/<meta\s+content="([^"]*)"\s+property="og:description"/) ||
                       html.match(/<meta\s+name="description"\s+content="([^"]*)"/) ||
                       html.match(/<meta\s+content="([^"]*)"\s+name="description"/);
        if (ogDesc) {
          const desc = ogDesc[1];
          profile.description = desc;
          // Try to parse stats
          const followersMatch = desc.match(/([\d,.]+[KMBkmb]?)\s*Followers/i);
          const likesMatch = desc.match(/([\d,.]+[KMBkmb]?)\s*Likes/i);
          const followingMatch = desc.match(/([\d,.]+[KMBkmb]?)\s*Following/i);
          if (followersMatch) profile.followers = followersMatch[1];
          if (likesMatch) profile.likes = likesMatch[1];
          if (followingMatch) profile.following = followingMatch[1];
          // Get bio
          const bioParts = desc.split('. ');
          if (bioParts.length > 1) profile.bio = bioParts.slice(1).join('. ').replace(/"/g, '');
        }

        const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/) ||
                        html.match(/<meta\s+content="([^"]*)"\s+property="og:image"/);
        if (ogImage) profile.profilePicture = ogImage[1];

        // Try to extract from __UNIVERSAL_DATA_FOR_REHYDRATION__
        const jsonMatch = html.match(/<script\s+id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
        if (jsonMatch) {
          try {
            const jsonData = JSON.parse(jsonMatch[1]);
            const userDetail = jsonData?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']?.userInfo;
            if (userDetail) {
              const user = userDetail.user || {};
              const stats = userDetail.stats || {};
              profile.fullName = user.nickname || profile.fullName;
              profile.bio = user.signature || profile.bio;
              profile.profilePicture = user.avatarLarger || user.avatarMedium || profile.profilePicture;
              profile.verified = user.verified || false;
              profile.isPrivate = user.privateAccount || false;
              profile.region = user.region || null;
              if (stats.followerCount != null) profile.followers = stats.followerCount.toLocaleString();
              if (stats.followingCount != null) profile.following = stats.followingCount.toLocaleString();
              if (stats.heartCount != null) profile.likes = stats.heartCount.toLocaleString();
              if (stats.videoCount != null) profile.videos = stats.videoCount.toLocaleString();
              if (stats.diggCount != null) profile.diggCount = stats.diggCount.toLocaleString();
            }
          } catch { /* JSON parse failed, use meta tag data */ }
        }

        profile.profileUrl = `https://www.tiktok.com/@${query}`;

        res.json({ profile });
      } catch (err) {
        res.json({ error: `Gagal mengambil data TikTok: ${err.message}. Pastikan username benar.` });
      }

    } else {
      res.json({ error: `Platform "${platform}" belum didukung` });
    }
  } catch (error) {
    res.json({ error: `Gagal mengambil data: ${error.message}` });
  }
});

// ---- Fallback to index.html ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ---- Start Server ----
app.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════╗`);
  console.log(`  ║   🔍 OSINT Intelligence Dashboard        ║`);
  console.log(`  ║   Server berjalan di port ${PORT}            ║`);
  console.log(`  ║   http://localhost:${PORT}                   ║`);
  console.log(`  ╚══════════════════════════════════════════╝\n`);
});
