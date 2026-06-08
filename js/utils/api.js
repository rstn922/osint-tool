// ============================================
// OSINT Intelligence Dashboard — API Utilities
// ============================================

const API = (() => {
  const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
  ];

  let currentProxyIndex = 0;

  /**
   * Fetch with timeout and retries
   */
  async function fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  /**
   * Fetch through CORS proxy
   */
  async function fetchWithProxy(url, options = {}) {
    const proxy = CORS_PROXIES[currentProxyIndex];
    const proxyUrl = proxy + encodeURIComponent(url);

    try {
      const response = await fetchWithTimeout(proxyUrl, options, 12000);
      return response;
    } catch (error) {
      // Try next proxy
      currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
      const nextProxy = CORS_PROXIES[currentProxyIndex];
      const nextProxyUrl = nextProxy + encodeURIComponent(url);
      return fetchWithTimeout(nextProxyUrl, options, 12000);
    }
  }

  /**
   * Check if URL exists (returns status)
   */
  async function checkUrl(url) {
    try {
      const response = await fetchWithProxy(url);
      return {
        exists: response.ok,
        status: response.status,
      };
    } catch (error) {
      return {
        exists: false,
        status: 0,
        error: error.message,
      };
    }
  }

  /**
   * Fetch JSON from API
   */
  async function fetchJSON(url, useProxy = false) {
    try {
      const response = useProxy
        ? await fetchWithProxy(url)
        : await fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  /**
   * IP Geolocation lookup
   */
  async function ipLookup(ip = '') {
    const url = ip
      ? `http://ip-api.com/json/${ip}?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,query`
      : `http://ip-api.com/json/?fields=status,message,continent,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,query`;

    return fetchJSON(url);
  }

  /**
   * DNS lookup via public API
   */
  async function dnsLookup(domain, type = 'A') {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`;
    return fetchJSON(url);
  }

  /**
   * Gravatar hash from email
   */
  function gravatarHash(email) {
    return md5(email.trim().toLowerCase());
  }

  /**
   * Simple MD5 implementation for Gravatar
   */
  function md5(string) {
    function rotateLeft(val, shift) {
      return (val << shift) | (val >>> (32 - shift));
    }

    function addUnsigned(x, y) {
      const lsw = (x & 0xFFFF) + (y & 0xFFFF);
      return ((((x >> 16) + (y >> 16) + (lsw >> 16)) << 16) | (lsw & 0xFFFF)) >>> 0;
    }

    function f(x, y, z) { return (x & y) | ((~x) & z); }
    function g(x, y, z) { return (x & z) | (y & (~z)); }
    function h(x, y, z) { return x ^ y ^ z; }
    function ii(x, y, z) { return y ^ (x | (~z)); }

    function transform(func, a, b, c, d, x, s, ac) {
      a = addUnsigned(a, addUnsigned(addUnsigned(func(b, c, d), x), ac));
      return addUnsigned(rotateLeft(a, s), b);
    }

    function convertToWordArray(str) {
      const len = str.length;
      const numWords = (((len + 8) >>> 6) + 1) << 4;
      const words = new Array(numWords).fill(0);
      let pos = 0;
      for (let i = 0; i < len; i++) {
        pos = (i >>> 2);
        words[pos] |= (str.charCodeAt(i) & 0xFF) << ((i % 4) * 8);
      }
      words[len >>> 2] |= 0x80 << ((len % 4) * 8);
      words[numWords - 2] = len * 8;
      return words;
    }

    function wordToHex(value) {
      let hex = '';
      for (let i = 0; i < 4; i++) {
        hex += ((value >> (i * 8)) & 0xFF).toString(16).padStart(2, '0');
      }
      return hex;
    }

    const S = [
      7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
      5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
      4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
      6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
    ];

    const T = [];
    for (let i = 0; i < 64; i++) {
      T[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
    }

    const words = convertToWordArray(string);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;

    for (let k = 0; k < words.length; k += 16) {
      const AA = a, BB = b, CC = c, DD = d;
      const funcs = [f, g, h, ii];
      const indexes = [
        [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
        [1,6,11,0,5,10,15,4,9,14,3,8,13,2,7,12],
        [5,8,11,14,1,4,7,10,13,0,3,6,9,12,15,2],
        [0,7,14,5,12,3,10,1,8,15,6,13,4,11,2,9]
      ];

      for (let round = 0; round < 4; round++) {
        for (let i = 0; i < 16; i++) {
          const idx = round * 16 + i;
          const funcIdx = round;
          const wordIdx = indexes[round][i];
          if (i % 4 === 0) a = transform(funcs[funcIdx], a, b, c, d, words[k + wordIdx], S[idx], T[idx]);
          else if (i % 4 === 1) d = transform(funcs[funcIdx], d, a, b, c, words[k + wordIdx], S[idx], T[idx]);
          else if (i % 4 === 2) c = transform(funcs[funcIdx], c, d, a, b, words[k + wordIdx], S[idx], T[idx]);
          else b = transform(funcs[funcIdx], b, c, d, a, words[k + wordIdx], S[idx], T[idx]);
        }
      }

      a = addUnsigned(a, AA);
      b = addUnsigned(b, BB);
      c = addUnsigned(c, CC);
      d = addUnsigned(d, DD);
    }

    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  }

  /**
   * Rate limiter
   */
  function createRateLimiter(delay = 200) {
    let queue = [];
    let running = false;

    async function processQueue() {
      if (running || queue.length === 0) return;
      running = true;

      while (queue.length > 0) {
        const { fn, resolve, reject } = queue.shift();
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
        if (queue.length > 0) {
          await new Promise(r => setTimeout(r, delay));
        }
      }

      running = false;
    }

    return function enqueue(fn) {
      return new Promise((resolve, reject) => {
        queue.push({ fn, resolve, reject });
        processQueue();
      });
    };
  }

  return {
    fetchWithTimeout,
    fetchWithProxy,
    checkUrl,
    fetchJSON,
    ipLookup,
    dnsLookup,
    gravatarHash,
    md5,
    createRateLimiter,
  };
})();
