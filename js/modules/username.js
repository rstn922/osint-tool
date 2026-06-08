// ============================================
// Username Lookup + Google Dorking Module (Bahasa Indonesia)
// ============================================

const UsernameModule = (() => {
  const PLATFORMS = [
    // === SOCIAL MEDIA (20) ===
    { name: 'GitHub', icon: '🐙', url: 'https://github.com/{username}', check: '/api/check?url=https://github.com/{username}' },
    { name: 'Twitter / X', icon: '𝕏', url: 'https://x.com/{username}', check: '/api/check?url=https://x.com/{username}' },
    { name: 'Instagram', icon: '📸', url: 'https://www.instagram.com/{username}/', check: '/api/check?url=https://www.instagram.com/{username}/' },
    { name: 'Reddit', icon: '🤖', url: 'https://www.reddit.com/user/{username}', check: '/api/check?url=https://www.reddit.com/user/{username}' },
    { name: 'TikTok', icon: '🎵', url: 'https://www.tiktok.com/@{username}', check: '/api/check?url=https://www.tiktok.com/@{username}' },
    { name: 'YouTube', icon: '▶️', url: 'https://www.youtube.com/@{username}', check: '/api/check?url=https://www.youtube.com/@{username}' },
    { name: 'Pinterest', icon: '📌', url: 'https://www.pinterest.com/{username}/', check: '/api/check?url=https://www.pinterest.com/{username}/' },
    { name: 'Twitch', icon: '🎮', url: 'https://www.twitch.tv/{username}', check: '/api/check?url=https://www.twitch.tv/{username}' },
    { name: 'LinkedIn', icon: '💼', url: 'https://www.linkedin.com/in/{username}/', check: '/api/check?url=https://www.linkedin.com/in/{username}/' },
    { name: 'Facebook', icon: '👤', url: 'https://www.facebook.com/{username}', check: '/api/check?url=https://www.facebook.com/{username}' },
    { name: 'Telegram', icon: '✈️', url: 'https://t.me/{username}', check: '/api/check?url=https://t.me/{username}' },
    { name: 'Mastodon', icon: '🐘', url: 'https://mastodon.social/@{username}', check: '/api/check?url=https://mastodon.social/@{username}' },
    { name: 'Threads', icon: '🧵', url: 'https://www.threads.net/@{username}', check: '/api/check?url=https://www.threads.net/@{username}' },
    { name: 'Bluesky', icon: '🦋', url: 'https://bsky.app/profile/{username}', check: '/api/check?url=https://bsky.app/profile/{username}' },
    { name: 'Tumblr', icon: '📝', url: 'https://{username}.tumblr.com', check: '/api/check?url=https://{username}.tumblr.com' },
    { name: 'VK', icon: '🔵', url: 'https://vk.com/{username}', check: '/api/check?url=https://vk.com/{username}' },
    { name: 'Snapchat', icon: '👻', url: 'https://www.snapchat.com/add/{username}', check: '/api/check?url=https://www.snapchat.com/add/{username}' },
    { name: 'Discord Bio', icon: '💬', url: 'https://discord.com/users/{username}', check: '/api/check?url=https://discord.com/users/{username}' },
    { name: 'Clubhouse', icon: '🏠', url: 'https://www.clubhouse.com/@{username}', check: '/api/check?url=https://www.clubhouse.com/@{username}' },
    { name: 'Linktree', icon: '🌳', url: 'https://linktr.ee/{username}', check: '/api/check?url=https://linktr.ee/{username}' },

    // === DEVELOPER & TECH (20) ===
    { name: 'GitLab', icon: '🦊', url: 'https://gitlab.com/{username}', check: '/api/check?url=https://gitlab.com/{username}' },
    { name: 'Bitbucket', icon: '🪣', url: 'https://bitbucket.org/{username}/', check: '/api/check?url=https://bitbucket.org/{username}/' },
    { name: 'Dev.to', icon: '👩‍💻', url: 'https://dev.to/{username}', check: '/api/check?url=https://dev.to/{username}' },
    { name: 'Stack Overflow', icon: '📚', url: 'https://stackoverflow.com/users/{username}', check: '/api/check?url=https://stackoverflow.com/users/{username}' },
    { name: 'Hashnode', icon: '📘', url: 'https://hashnode.com/@{username}', check: '/api/check?url=https://hashnode.com/@{username}' },
    { name: 'Docker Hub', icon: '🐳', url: 'https://hub.docker.com/u/{username}', check: '/api/check?url=https://hub.docker.com/u/{username}' },
    { name: 'npm', icon: '📦', url: 'https://www.npmjs.com/~{username}', check: '/api/check?url=https://www.npmjs.com/~{username}' },
    { name: 'PyPI', icon: '🐍', url: 'https://pypi.org/user/{username}/', check: '/api/check?url=https://pypi.org/user/{username}/' },
    { name: 'Replit', icon: '💻', url: 'https://replit.com/@{username}', check: '/api/check?url=https://replit.com/@{username}' },
    { name: 'CodePen', icon: '✏️', url: 'https://codepen.io/{username}', check: '/api/check?url=https://codepen.io/{username}' },
    { name: 'Kaggle', icon: '📊', url: 'https://www.kaggle.com/{username}', check: '/api/check?url=https://www.kaggle.com/{username}' },
    { name: 'HackerRank', icon: '💚', url: 'https://www.hackerrank.com/{username}', check: '/api/check?url=https://www.hackerrank.com/{username}' },
    { name: 'LeetCode', icon: '🟡', url: 'https://leetcode.com/{username}/', check: '/api/check?url=https://leetcode.com/{username}/' },
    { name: 'Codeforces', icon: '🏆', url: 'https://codeforces.com/profile/{username}', check: '/api/check?url=https://codeforces.com/profile/{username}' },
    { name: 'HackerOne', icon: '🛡️', url: 'https://hackerone.com/{username}', check: '/api/check?url=https://hackerone.com/{username}' },
    { name: 'Bugcrowd', icon: '🐛', url: 'https://bugcrowd.com/{username}', check: '/api/check?url=https://bugcrowd.com/{username}' },
    { name: 'Codewars', icon: '⚔️', url: 'https://www.codewars.com/users/{username}', check: '/api/check?url=https://www.codewars.com/users/{username}' },
    { name: 'CoderByte', icon: '🔤', url: 'https://coderbyte.com/profile/{username}', check: '/api/check?url=https://coderbyte.com/profile/{username}' },
    { name: 'Glitch', icon: '🎏', url: 'https://glitch.com/@{username}', check: '/api/check?url=https://glitch.com/@{username}' },
    { name: 'SourceForge', icon: '🔧', url: 'https://sourceforge.net/u/{username}/', check: '/api/check?url=https://sourceforge.net/u/{username}/' },

    // === CREATIVE & DESIGN (15) ===
    { name: 'Dribbble', icon: '🏀', url: 'https://dribbble.com/{username}', check: '/api/check?url=https://dribbble.com/{username}' },
    { name: 'Behance', icon: '🎨', url: 'https://www.behance.net/{username}', check: '/api/check?url=https://www.behance.net/{username}' },
    { name: 'DeviantArt', icon: '🎭', url: 'https://www.deviantart.com/{username}', check: '/api/check?url=https://www.deviantart.com/{username}' },
    { name: 'ArtStation', icon: '🖌️', url: 'https://www.artstation.com/{username}', check: '/api/check?url=https://www.artstation.com/{username}' },
    { name: 'Figma', icon: '🎨', url: 'https://www.figma.com/@{username}', check: '/api/check?url=https://www.figma.com/@{username}' },
    { name: '500px', icon: '📸', url: 'https://500px.com/p/{username}', check: '/api/check?url=https://500px.com/p/{username}' },
    { name: 'Flickr', icon: '📷', url: 'https://www.flickr.com/people/{username}/', check: '/api/check?url=https://www.flickr.com/people/{username}/' },
    { name: 'Unsplash', icon: '🌄', url: 'https://unsplash.com/@{username}', check: '/api/check?url=https://unsplash.com/@{username}' },
    { name: 'Canva', icon: '🖼️', url: 'https://www.canva.com/p/{username}/', check: '/api/check?url=https://www.canva.com/p/{username}/' },
    { name: 'VSCO', icon: '📱', url: 'https://vsco.co/{username}/gallery', check: '/api/check?url=https://vsco.co/{username}/gallery' },
    { name: 'Pixiv', icon: '🎌', url: 'https://www.pixiv.net/users/{username}', check: '/api/check?url=https://www.pixiv.net/users/{username}' },
    { name: 'Wattpad', icon: '📖', url: 'https://www.wattpad.com/user/{username}', check: '/api/check?url=https://www.wattpad.com/user/{username}' },
    { name: 'Archive of Our Own', icon: '📝', url: 'https://archiveofourown.org/users/{username}', check: '/api/check?url=https://archiveofourown.org/users/{username}' },
    { name: 'Issuu', icon: '📰', url: 'https://issuu.com/{username}', check: '/api/check?url=https://issuu.com/{username}' },
    { name: 'Newgrounds', icon: '🎮', url: 'https://{username}.newgrounds.com', check: '/api/check?url=https://{username}.newgrounds.com' },

    // === MUSIC & AUDIO (8) ===
    { name: 'Spotify', icon: '🎧', url: 'https://open.spotify.com/user/{username}', check: '/api/check?url=https://open.spotify.com/user/{username}' },
    { name: 'SoundCloud', icon: '🔊', url: 'https://soundcloud.com/{username}', check: '/api/check?url=https://soundcloud.com/{username}' },
    { name: 'Bandcamp', icon: '🎵', url: 'https://{username}.bandcamp.com', check: '/api/check?url=https://{username}.bandcamp.com' },
    { name: 'Last.fm', icon: '🎶', url: 'https://www.last.fm/user/{username}', check: '/api/check?url=https://www.last.fm/user/{username}' },
    { name: 'Apple Music', icon: '🍎', url: 'https://music.apple.com/profile/{username}', check: '/api/check?url=https://music.apple.com/profile/{username}' },
    { name: 'Mixcloud', icon: '☁️', url: 'https://www.mixcloud.com/{username}/', check: '/api/check?url=https://www.mixcloud.com/{username}/' },
    { name: 'Deezer', icon: '🎵', url: 'https://www.deezer.com/profile/{username}', check: '/api/check?url=https://www.deezer.com/profile/{username}' },
    { name: 'Genius', icon: '🎤', url: 'https://genius.com/artists/{username}', check: '/api/check?url=https://genius.com/artists/{username}' },

    // === VIDEO & STREAMING (6) ===
    { name: 'Vimeo', icon: '🎬', url: 'https://vimeo.com/{username}', check: '/api/check?url=https://vimeo.com/{username}' },
    { name: 'Dailymotion', icon: '📹', url: 'https://www.dailymotion.com/{username}', check: '/api/check?url=https://www.dailymotion.com/{username}' },
    { name: 'Rumble', icon: '📢', url: 'https://rumble.com/user/{username}', check: '/api/check?url=https://rumble.com/user/{username}' },
    { name: 'Kick', icon: '💚', url: 'https://kick.com/{username}', check: '/api/check?url=https://kick.com/{username}' },
    { name: 'Odysee', icon: '🌊', url: 'https://odysee.com/@{username}', check: '/api/check?url=https://odysee.com/@{username}' },
    { name: 'BitChute', icon: '🎥', url: 'https://www.bitchute.com/channel/{username}/', check: '/api/check?url=https://www.bitchute.com/channel/{username}/' },

    // === GAMING (10) ===
    { name: 'Steam', icon: '🕹️', url: 'https://steamcommunity.com/id/{username}', check: '/api/check?url=https://steamcommunity.com/id/{username}' },
    { name: 'Xbox Gamertag', icon: '🟢', url: 'https://www.xbox.com/en-US/play/user/{username}', check: '/api/check?url=https://www.xbox.com/en-US/play/user/{username}' },
    { name: 'PSN Profiles', icon: '🔵', url: 'https://psnprofiles.com/{username}', check: '/api/check?url=https://psnprofiles.com/{username}' },
    { name: 'Roblox', icon: '🧱', url: 'https://www.roblox.com/user.aspx?username={username}', check: '/api/check?url=https://www.roblox.com/user.aspx?username={username}' },
    { name: 'NameMC', icon: '⛏️', url: 'https://namemc.com/profile/{username}', check: '/api/check?url=https://namemc.com/profile/{username}' },
    { name: 'Chess.com', icon: '♟️', url: 'https://www.chess.com/member/{username}', check: '/api/check?url=https://www.chess.com/member/{username}' },
    { name: 'Lichess', icon: '♚', url: 'https://lichess.org/@/{username}', check: '/api/check?url=https://lichess.org/@/{username}' },
    { name: 'OP.GG', icon: '🎯', url: 'https://www.op.gg/summoners/na/{username}', check: '/api/check?url=https://www.op.gg/summoners/na/{username}' },
    { name: 'MyAnimeList', icon: '🎌', url: 'https://myanimelist.net/profile/{username}', check: '/api/check?url=https://myanimelist.net/profile/{username}' },
    { name: 'AniList', icon: '🌸', url: 'https://anilist.co/user/{username}/', check: '/api/check?url=https://anilist.co/user/{username}/' },

    // === BLOGGING & WRITING (8) ===
    { name: 'Medium', icon: '✍️', url: 'https://medium.com/@{username}', check: '/api/check?url=https://medium.com/@{username}' },
    { name: 'Substack', icon: '📰', url: 'https://{username}.substack.com', check: '/api/check?url=https://{username}.substack.com' },
    { name: 'WordPress', icon: '📝', url: 'https://{username}.wordpress.com', check: '/api/check?url=https://{username}.wordpress.com' },
    { name: 'Blogger', icon: '🅱️', url: 'https://{username}.blogspot.com', check: '/api/check?url=https://{username}.blogspot.com' },
    { name: 'HackerNews', icon: '🧡', url: 'https://news.ycombinator.com/user?id={username}', check: '/api/check?url=https://news.ycombinator.com/user?id={username}' },
    { name: 'Quora', icon: '❓', url: 'https://www.quora.com/profile/{username}', check: '/api/check?url=https://www.quora.com/profile/{username}' },
    { name: 'Scribd', icon: '📜', url: 'https://www.scribd.com/{username}', check: '/api/check?url=https://www.scribd.com/{username}' },
    { name: 'SlideShare', icon: '📊', url: 'https://www.slideshare.net/{username}', check: '/api/check?url=https://www.slideshare.net/{username}' },

    // === PROFESSIONAL & FREELANCE (8) ===
    { name: 'Gravatar', icon: '👻', url: 'https://gravatar.com/{username}', check: '/api/check?url=https://gravatar.com/{username}' },
    { name: 'About.me', icon: '👋', url: 'https://about.me/{username}', check: '/api/check?url=https://about.me/{username}' },
    { name: 'Keybase', icon: '🔑', url: 'https://keybase.io/{username}', check: '/api/check?url=https://keybase.io/{username}' },
    { name: 'Fiverr', icon: '💰', url: 'https://www.fiverr.com/{username}', check: '/api/check?url=https://www.fiverr.com/{username}' },
    { name: 'Upwork', icon: '🟢', url: 'https://www.upwork.com/freelancers/~{username}', check: '/api/check?url=https://www.upwork.com/freelancers/~{username}' },
    { name: 'Freelancer', icon: '💼', url: 'https://www.freelancer.com/u/{username}', check: '/api/check?url=https://www.freelancer.com/u/{username}' },
    { name: 'Crunchbase', icon: '📈', url: 'https://www.crunchbase.com/person/{username}', check: '/api/check?url=https://www.crunchbase.com/person/{username}' },
    { name: 'ProductHunt', icon: '🐱', url: 'https://www.producthunt.com/@{username}', check: '/api/check?url=https://www.producthunt.com/@{username}' },

    // === FORUM & COMMUNITY (8) ===
    { name: 'Kaskus', icon: '🇮🇩', url: 'https://www.kaskus.co.id/user/{username}/', check: '/api/check?url=https://www.kaskus.co.id/user/{username}/' },
    { name: 'Disqus', icon: '💬', url: 'https://disqus.com/by/{username}/', check: '/api/check?url=https://disqus.com/by/{username}/' },
    { name: 'Wikipedia (User)', icon: '📖', url: 'https://en.wikipedia.org/wiki/User:{username}', check: '/api/check?url=https://en.wikipedia.org/wiki/User:{username}' },
    { name: 'Fandom', icon: '📕', url: 'https://www.fandom.com/u/{username}', check: '/api/check?url=https://www.fandom.com/u/{username}' },
    { name: 'F3 Community', icon: '🌐', url: 'https://f3.cool/{username}', check: '/api/check?url=https://f3.cool/{username}' },
    { name: 'Gravatar Forum', icon: '💠', url: 'https://en.gravatar.com/{username}', check: '/api/check?url=https://en.gravatar.com/{username}' },
    { name: 'Lemmy', icon: '🐭', url: 'https://lemmy.world/u/{username}', check: '/api/check?url=https://lemmy.world/u/{username}' },
    { name: 'Hive Blog', icon: '🐝', url: 'https://hive.blog/@{username}', check: '/api/check?url=https://hive.blog/@{username}' },

    // === E-COMMERCE & MARKETPLACE (7) ===
    { name: 'Tokopedia', icon: '🟢', url: 'https://www.tokopedia.com/{username}', check: '/api/check?url=https://www.tokopedia.com/{username}' },
    { name: 'Shopee', icon: '🟠', url: 'https://shopee.co.id/{username}', check: '/api/check?url=https://shopee.co.id/{username}' },
    { name: 'Bukalapak', icon: '🔴', url: 'https://www.bukalapak.com/u/{username}', check: '/api/check?url=https://www.bukalapak.com/u/{username}' },
    { name: 'eBay', icon: '🛒', url: 'https://www.ebay.com/usr/{username}', check: '/api/check?url=https://www.ebay.com/usr/{username}' },
    { name: 'Etsy', icon: '🧶', url: 'https://www.etsy.com/shop/{username}', check: '/api/check?url=https://www.etsy.com/shop/{username}' },
    { name: 'Gumroad', icon: '💳', url: 'https://{username}.gumroad.com', check: '/api/check?url=https://{username}.gumroad.com' },
    { name: 'Patreon', icon: '🧡', url: 'https://www.patreon.com/{username}', check: '/api/check?url=https://www.patreon.com/{username}' },

    // === ACADEMIC & RESEARCH (5) ===
    { name: 'ResearchGate', icon: '🔬', url: 'https://www.researchgate.net/profile/{username}', check: '/api/check?url=https://www.researchgate.net/profile/{username}' },
    { name: 'Academia.edu', icon: '🎓', url: 'https://independent.academia.edu/{username}', check: '/api/check?url=https://independent.academia.edu/{username}' },
    { name: 'ORCID', icon: '🆔', url: 'https://orcid.org/{username}', check: '/api/check?url=https://orcid.org/{username}' },
    { name: 'Google Scholar', icon: '📚', url: 'https://scholar.google.com/citations?user={username}', check: '/api/check?url=https://scholar.google.com/citations?user={username}' },
    { name: 'Semantic Scholar', icon: '🧠', url: 'https://www.semanticscholar.org/author/{username}', check: '/api/check?url=https://www.semanticscholar.org/author/{username}' },

    // === CRYPTO & FINANCE (5) ===
    { name: 'Coinbase', icon: '🪙', url: 'https://www.coinbase.com/{username}', check: '/api/check?url=https://www.coinbase.com/{username}' },
    { name: 'OpenSea', icon: '🌊', url: 'https://opensea.io/{username}', check: '/api/check?url=https://opensea.io/{username}' },
    { name: 'Rarible', icon: '🎨', url: 'https://rarible.com/{username}', check: '/api/check?url=https://rarible.com/{username}' },
    { name: 'CoinMarketCap', icon: '📈', url: 'https://coinmarketcap.com/community/profile/{username}/', check: '/api/check?url=https://coinmarketcap.com/community/profile/{username}/' },
    { name: 'TradingView', icon: '📊', url: 'https://www.tradingview.com/u/{username}/', check: '/api/check?url=https://www.tradingview.com/u/{username}/' },

    // === MISC & UTILITY (5) ===
    { name: 'Trello', icon: '📋', url: 'https://trello.com/{username}', check: '/api/check?url=https://trello.com/{username}' },
    { name: 'Notion', icon: '📓', url: 'https://notion.so/{username}', check: '/api/check?url=https://notion.so/{username}' },
    { name: 'Giphy', icon: '🎞️', url: 'https://giphy.com/{username}', check: '/api/check?url=https://giphy.com/{username}' },
    { name: 'Imgur', icon: '🖼️', url: 'https://imgur.com/user/{username}', check: '/api/check?url=https://imgur.com/user/{username}' },
    { name: 'Speedrun.com', icon: '⏱️', url: 'https://www.speedrun.com/user/{username}', check: '/api/check?url=https://www.speedrun.com/user/{username}' },
  ];


  // ============================================
  // GOOGLE DORKING — Comprehensive Dork Patterns
  // ============================================
  const DORK_CATEGORIES = [
    {
      id: 'exact-match',
      name: '🎯 Pencarian Exact Match',
      desc: 'Cari kemunculan tepat dari nama/username di seluruh internet',
      dorks: [
        { label: 'Exact username di semua situs', query: '"{q}"' },
        { label: 'Username di judul halaman', query: 'intitle:"{q}"' },
        { label: 'Username di URL', query: 'inurl:"{q}"' },
        { label: 'Username di body teks', query: 'intext:"{q}"' },
        { label: 'Exact match di anchor links', query: 'inanchor:"{q}"' },
        { label: 'Kombinasi judul + teks', query: 'intitle:"{q}" intext:"{q}"' },
        { label: 'Username + "profile"', query: '"{q}" "profile"' },
        { label: 'Username + "account"', query: '"{q}" "account"' },
        { label: 'Username + "member"', query: '"{q}" "member" OR "user"' },
      ]
    },
    {
      id: 'social-media',
      name: '📱 Media Sosial',
      desc: 'Cari profil di platform social media menggunakan operator site:',
      dorks: [
        { label: 'Facebook', query: 'site:facebook.com "{q}"' },
        { label: 'Instagram', query: 'site:instagram.com "{q}"' },
        { label: 'Twitter / X', query: 'site:twitter.com OR site:x.com "{q}"' },
        { label: 'LinkedIn', query: 'site:linkedin.com/in "{q}"' },
        { label: 'LinkedIn (semua)', query: 'site:linkedin.com "{q}"' },
        { label: 'TikTok', query: 'site:tiktok.com "{q}"' },
        { label: 'YouTube', query: 'site:youtube.com "{q}"' },
        { label: 'Reddit', query: 'site:reddit.com/user "{q}"' },
        { label: 'Reddit (post & komentar)', query: 'site:reddit.com "{q}"' },
        { label: 'Pinterest', query: 'site:pinterest.com "{q}"' },
        { label: 'Tumblr', query: 'site:tumblr.com "{q}"' },
        { label: 'Quora', query: 'site:quora.com "{q}"' },
        { label: 'VK', query: 'site:vk.com "{q}"' },
        { label: 'Medium', query: 'site:medium.com "{q}"' },
        { label: 'Discord (bio.link)', query: 'site:discord.com OR site:discord.gg "{q}"' },
        { label: 'Telegram', query: 'site:t.me "{q}"' },
        { label: 'Snapchat', query: 'site:snapchat.com/add "{q}"' },
        { label: 'Threads', query: 'site:threads.net "{q}"' },
        { label: 'Mastodon', query: 'site:mastodon.social "{q}"' },
        { label: 'Bluesky', query: 'site:bsky.app "{q}"' },
      ]
    },
    {
      id: 'developer',
      name: '💻 Platform Developer',
      desc: 'Cari di platform developer, coding, dan tech',
      dorks: [
        { label: 'GitHub', query: 'site:github.com "{q}"' },
        { label: 'GitHub Gists', query: 'site:gist.github.com "{q}"' },
        { label: 'GitLab', query: 'site:gitlab.com "{q}"' },
        { label: 'Bitbucket', query: 'site:bitbucket.org "{q}"' },
        { label: 'Stack Overflow', query: 'site:stackoverflow.com "{q}"' },
        { label: 'Stack Exchange (semua)', query: 'site:stackexchange.com "{q}"' },
        { label: 'Dev.to', query: 'site:dev.to "{q}"' },
        { label: 'HackerNews', query: 'site:news.ycombinator.com "{q}"' },
        { label: 'npm packages', query: 'site:npmjs.com "{q}"' },
        { label: 'PyPI packages', query: 'site:pypi.org "{q}"' },
        { label: 'Docker Hub', query: 'site:hub.docker.com "{q}"' },
        { label: 'Replit', query: 'site:replit.com "{q}"' },
        { label: 'CodePen', query: 'site:codepen.io "{q}"' },
        { label: 'JSFiddle', query: 'site:jsfiddle.net "{q}"' },
        { label: 'Kaggle', query: 'site:kaggle.com "{q}"' },
        { label: 'HackerRank', query: 'site:hackerrank.com "{q}"' },
        { label: 'LeetCode', query: 'site:leetcode.com "{q}"' },
        { label: 'Codeforces', query: 'site:codeforces.com "{q}"' },
      ]
    },
    {
      id: 'forums-communities',
      name: '💬 Forum & Komunitas',
      desc: 'Cari di forum, komunitas, dan platform diskusi',
      dorks: [
        { label: 'Semua forum (inurl)', query: 'inurl:forum "{q}"' },
        { label: 'Forum (phpBB style)', query: 'inurl:viewprofile "{q}"' },
        { label: 'Forum (vBulletin)', query: 'inurl:member.php "{q}"' },
        { label: 'Forum (XenForo)', query: 'inurl:members "{q}" "member"' },
        { label: 'Forum Indonesia (Kaskus)', query: 'site:kaskus.co.id "{q}"' },
        { label: 'Quora answers', query: 'site:quora.com/profile "{q}"' },
        { label: 'Discord servers', query: '"{q}" site:discord.me OR site:disboard.org' },
        { label: 'Discourse forums', query: 'inurl:"/u/" "{q}" "Discourse"' },
        { label: 'Telegram groups', query: '"{q}" site:t.me "group" OR "channel"' },
        { label: 'Wiki contributions', query: 'site:wikipedia.org "User:{q}"' },
        { label: 'Fandom wiki', query: 'site:fandom.com "User:{q}"' },
      ]
    },
    {
      id: 'professional',
      name: '💼 Profesional & Bisnis',
      desc: 'Cari informasi profesional, perusahaan, dan karir',
      dorks: [
        { label: 'LinkedIn profil', query: 'site:linkedin.com/in/ "{q}"' },
        { label: 'LinkedIn posts', query: 'site:linkedin.com/posts "{q}"' },
        { label: 'LinkedIn company', query: 'site:linkedin.com/company "{q}"' },
        { label: 'Glassdoor', query: 'site:glassdoor.com "{q}"' },
        { label: 'Crunchbase', query: 'site:crunchbase.com "{q}"' },
        { label: 'AngelList', query: 'site:angel.co "{q}"' },
        { label: 'About page', query: 'inurl:about "{q}"' },
        { label: 'Team page', query: 'inurl:team "{q}"' },
        { label: 'Staff directory', query: 'inurl:staff OR inurl:people "{q}"' },
        { label: 'Resume / CV online', query: '"{q}" "resume" OR "curriculum vitae" OR "CV"' },
        { label: 'Speaker / konferensi', query: '"{q}" "speaker" OR "presenter" OR "keynote"' },
        { label: 'Author bio', query: '"{q}" "author" OR "written by" OR "posted by"' },
      ]
    },
    {
      id: 'documents',
      name: '📄 Dokumen & File',
      desc: 'Cari dokumen yang menyebut nama/username',
      dorks: [
        { label: 'File PDF', query: '"{q}" filetype:pdf' },
        { label: 'File Word (DOC)', query: '"{q}" filetype:doc OR filetype:docx' },
        { label: 'File Excel (XLS)', query: '"{q}" filetype:xls OR filetype:xlsx' },
        { label: 'File PowerPoint', query: '"{q}" filetype:ppt OR filetype:pptx' },
        { label: 'File teks (TXT)', query: '"{q}" filetype:txt' },
        { label: 'File CSV', query: '"{q}" filetype:csv' },
        { label: 'File XML', query: '"{q}" filetype:xml' },
        { label: 'File JSON', query: '"{q}" filetype:json' },
        { label: 'File log', query: '"{q}" filetype:log' },
        { label: 'File SQL (database dump)', query: '"{q}" filetype:sql' },
        { label: 'File config (env/ini/conf)', query: '"{q}" filetype:env OR filetype:ini OR filetype:conf' },
        { label: 'Google Docs', query: 'site:docs.google.com "{q}"' },
        { label: 'Google Sheets', query: 'site:docs.google.com/spreadsheets "{q}"' },
        { label: 'Google Slides', query: 'site:docs.google.com/presentation "{q}"' },
        { label: 'Scribd', query: 'site:scribd.com "{q}"' },
        { label: 'SlideShare', query: 'site:slideshare.net "{q}"' },
        { label: 'Academia.edu', query: 'site:academia.edu "{q}"' },
        { label: 'ResearchGate', query: 'site:researchgate.net "{q}"' },
      ]
    },
    {
      id: 'paste-leak',
      name: '🔓 Paste Sites & Data Exposure',
      desc: 'Cari di paste sites dan potensi data yang terekspos',
      dorks: [
        { label: 'Pastebin', query: 'site:pastebin.com "{q}"' },
        { label: 'GitHub Gist', query: 'site:gist.github.com "{q}"' },
        { label: 'Ghostbin', query: 'site:ghostbin.com "{q}"' },
        { label: 'Rentry', query: 'site:rentry.co "{q}"' },
        { label: 'JustPaste.it', query: 'site:justpaste.it "{q}"' },
        { label: 'Doxbin (archive)', query: 'site:archive.org "{q}" "dox" OR "doxx"' },
        { label: 'Exposed credentials', query: '"{q}" "password" OR "passwd" filetype:txt' },
        { label: 'Config files exposure', query: '"{q}" "api_key" OR "apikey" OR "secret"' },
        { label: 'Database dumps', query: '"{q}" "database" filetype:sql OR filetype:csv' },
        { label: 'Trello boards (public)', query: 'site:trello.com "{q}"' },
        { label: 'Notion pages (public)', query: 'site:notion.so "{q}"' },
      ]
    },
    {
      id: 'email-discovery',
      name: '📧 Penemuan Email',
      desc: 'Cari alamat email terkait dengan username/nama',
      dorks: [
        { label: 'Email di teks halaman', query: '"{q}" "@gmail.com" OR "@yahoo.com" OR "@hotmail.com"' },
        { label: 'Email format umum', query: '"{q}" "email" OR "e-mail" OR "contact"' },
        { label: 'Email di file PDF', query: '"{q}" "@" filetype:pdf' },
        { label: 'Email pattern (intext)', query: 'intext:"{q}" intext:"@" intext:".com"' },
        { label: 'Mailto links', query: '"{q}" inurl:mailto' },
        { label: 'Contact page', query: '"{q}" inurl:contact OR inurl:kontak' },
        { label: 'Email di GitHub', query: 'site:github.com "{q}" "@gmail.com" OR "@yahoo.com"' },
        { label: 'Email di LinkedIn', query: 'site:linkedin.com "{q}" "email"' },
        { label: 'Email verifier sites', query: '"{q}" site:hunter.io OR site:emailrep.io' },
      ]
    },
    {
      id: 'images-media',
      name: '🖼️ Gambar & Media',
      desc: 'Cari gambar, foto, dan media terkait',
      dorks: [
        { label: 'Flickr', query: 'site:flickr.com "{q}"' },
        { label: 'Imgur', query: 'site:imgur.com "{q}"' },
        { label: '500px', query: 'site:500px.com "{q}"' },
        { label: 'DeviantArt', query: 'site:deviantart.com "{q}"' },
        { label: 'Unsplash', query: 'site:unsplash.com "{q}"' },
        { label: 'Gravatar', query: 'site:gravatar.com "{q}"' },
        { label: 'Google Photos (public)', query: 'site:photos.google.com "{q}"' },
        { label: 'Vimeo videos', query: 'site:vimeo.com "{q}"' },
        { label: 'Dailymotion', query: 'site:dailymotion.com "{q}"' },
        { label: 'SoundCloud audio', query: 'site:soundcloud.com "{q}"' },
      ]
    },
    {
      id: 'ecommerce-marketplace',
      name: '🛒 E-Commerce & Marketplace',
      desc: 'Cari di platform jual-beli dan marketplace',
      dorks: [
        { label: 'Tokopedia', query: 'site:tokopedia.com "{q}"' },
        { label: 'Shopee', query: 'site:shopee.co.id "{q}"' },
        { label: 'Bukalapak', query: 'site:bukalapak.com "{q}"' },
        { label: 'Lazada', query: 'site:lazada.co.id "{q}"' },
        { label: 'Amazon', query: 'site:amazon.com "{q}"' },
        { label: 'eBay', query: 'site:ebay.com "{q}"' },
        { label: 'Etsy', query: 'site:etsy.com "{q}"' },
        { label: 'Fiverr', query: 'site:fiverr.com "{q}"' },
        { label: 'Upwork', query: 'site:upwork.com "{q}"' },
        { label: 'Freelancer', query: 'site:freelancer.com "{q}"' },
        { label: 'OLX', query: 'site:olx.co.id "{q}"' },
      ]
    },
    {
      id: 'gaming',
      name: '🎮 Gaming & Entertainment',
      desc: 'Cari profil di platform gaming',
      dorks: [
        { label: 'Steam', query: 'site:steamcommunity.com "{q}"' },
        { label: 'Xbox', query: 'site:xbox.com "{q}"' },
        { label: 'PlayStation', query: 'site:psnprofiles.com "{q}"' },
        { label: 'Twitch', query: 'site:twitch.tv "{q}"' },
        { label: 'Epic Games', query: 'site:epicgames.com "{q}"' },
        { label: 'Roblox', query: 'site:roblox.com "{q}"' },
        { label: 'Minecraft', query: 'site:namemc.com "{q}"' },
        { label: 'Chess.com', query: 'site:chess.com "{q}"' },
        { label: 'Riot Games / LoL', query: 'site:op.gg "{q}"' },
        { label: 'MyAnimeList', query: 'site:myanimelist.net "{q}"' },
        { label: 'AniList', query: 'site:anilist.co "{q}"' },
        { label: 'Speedrun.com', query: 'site:speedrun.com "{q}"' },
      ]
    },
    {
      id: 'archive-cache',
      name: '🕰️ Archive & Cache',
      desc: 'Cari versi lama atau cache dari halaman terkait',
      dorks: [
        { label: 'Wayback Machine', query: 'site:web.archive.org "{q}"' },
        { label: 'Google Cache', query: 'cache:"{q}"' },
        { label: 'Archive.org (umum)', query: 'site:archive.org "{q}"' },
        { label: 'Cached pages Google', query: '"{q}" inurl:webcache.googleusercontent.com' },
        { label: 'Archive.today', query: 'site:archive.ph "{q}"' },
        { label: 'CachedView', query: 'site:cachedview.nl "{q}"' },
      ]
    },
    {
      id: 'gov-edu',
      name: '🏛️ Pemerintah & Pendidikan',
      desc: 'Cari di domain pemerintah dan institusi pendidikan',
      dorks: [
        { label: 'Domain .gov', query: 'site:*.gov "{q}"' },
        { label: 'Domain .go.id (Indonesia)', query: 'site:*.go.id "{q}"' },
        { label: 'Domain .edu', query: 'site:*.edu "{q}"' },
        { label: 'Domain .ac.id (Indonesia)', query: 'site:*.ac.id "{q}"' },
        { label: 'Domain .sch.id (Sekolah)', query: 'site:*.sch.id "{q}"' },
        { label: 'Domain .mil', query: 'site:*.mil "{q}"' },
        { label: 'Domain .or.id (Organisasi)', query: 'site:*.or.id "{q}"' },
        { label: 'Domain .org', query: 'site:*.org "{q}"' },
        { label: 'Jurnal ilmiah', query: 'site:scholar.google.com "{q}"' },
      ]
    },
    {
      id: 'advanced-operators',
      name: '⚡ Operator Lanjutan',
      desc: 'Kombinasi operator Google Dorking tingkat lanjut',
      dorks: [
        { label: 'Exclude social media', query: '"{q}" -site:facebook.com -site:twitter.com -site:instagram.com -site:linkedin.com' },
        { label: 'Hanya hasil terbaru', query: '"{q}" after:2024-01-01' },
        { label: 'Hanya hasil tahun ini', query: '"{q}" after:2025-01-01' },
        { label: 'Wildcard search', query: '"* {q} *"' },
        { label: 'OR search variasi', query: '"{q}" OR "@{q}" OR "user/{q}"' },
        { label: 'Exact + related terms', query: '"{q}" AROUND(3) "profile"' },
        { label: 'Related websites', query: 'related:{q}.com' },
        { label: 'Info tentang domain', query: 'info:{q}.com' },
        { label: 'Links ke profil', query: 'link:"{q}"' },
        { label: 'Semua subdomain', query: 'site:*.{q}.com' },
        { label: 'Index of (directory listing)', query: 'intitle:"index of" "{q}"' },
        { label: 'Open directories', query: 'intitle:"index of" intext:"{q}" -inurl:github' },
        { label: 'Admin/login pages', query: 'inurl:admin OR inurl:login "{q}"' },
        { label: 'Sensitive directories', query: 'intitle:"index of" "{q}" "parent directory"' },
      ]
    },
    {
      id: 'phone-address',
      name: '📍 Telepon & Alamat',
      desc: 'Cari informasi kontak yang terpublikasi',
      dorks: [
        { label: 'Nomor telepon', query: '"{q}" "phone" OR "telepon" OR "tel:" OR "hp:"' },
        { label: 'WhatsApp', query: '"{q}" "wa.me" OR "whatsapp"' },
        { label: 'Alamat', query: '"{q}" "alamat" OR "address" OR "located"' },
        { label: 'Kontak page', query: '"{q}" inurl:contact OR inurl:about "phone" OR "email"' },
        { label: 'Yellow pages ID', query: 'site:yellowpages.co.id "{q}"' },
        { label: 'Google Maps review', query: 'site:google.com/maps "{q}"' },
        { label: 'Data pendaftaran', query: '"{q}" "registered" OR "terdaftar" OR "registration"' },
      ]
    },
    {
      id: 'security-recon',
      name: '🛡️ Security Recon',
      desc: 'Rekon teknis dan keamanan (ethical hacking)',
      dorks: [
        { label: 'Shodan', query: 'site:shodan.io "{q}"' },
        { label: 'Censys', query: 'site:censys.io "{q}"' },
        { label: 'VirusTotal', query: 'site:virustotal.com "{q}"' },
        { label: 'SecurityTrails', query: 'site:securitytrails.com "{q}"' },
        { label: 'crt.sh (SSL certs)', query: 'site:crt.sh "{q}"' },
        { label: 'DNS history', query: 'site:dnsdumpster.com "{q}"' },
        { label: 'WHOIS records', query: '"{q}" "whois" OR "registrant" OR "admin contact"' },
        { label: 'Exposed .git', query: 'inurl:".git" "{q}"' },
        { label: 'Exposed .env', query: 'inurl:".env" "{q}" "DB_" OR "API_"' },
        { label: 'Bug bounty reports', query: 'site:hackerone.com OR site:bugcrowd.com "{q}"' },
        { label: 'CVE terkait', query: 'site:cve.mitre.org OR site:nvd.nist.gov "{q}"' },
        { label: 'Exploit-DB', query: 'site:exploit-db.com "{q}"' },
      ]
    },
  ];

  let isScanning = false;
  let results = [];
  let activeDorkCategory = 'exact-match';

  function init() {
    const searchBtn = document.getElementById('username-search-btn');
    const searchInput = document.getElementById('username-input');
    if (searchBtn) searchBtn.addEventListener('click', () => startSearch());
    if (searchInput) searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') startSearch(); });

    // Tab switching
    const tabBtns = document.querySelectorAll('.dork-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchDorkTab(btn.dataset.category));
    });
  }

  // ---- Platform Scan ----

  async function startSearch() {
    const input = document.getElementById('username-input');
    const username = input?.value.trim();

    if (!username) { UI.toast('Masukkan username untuk dicari', 'warning'); return; }
    if (isScanning) { UI.toast('Pencarian sedang berjalan...', 'warning'); return; }

    isScanning = true;
    results = [];

    const resultsContainer = document.getElementById('username-results');
    const statsContainer = document.getElementById('username-stats');
    const dorkSection = document.getElementById('dork-section');
    resultsContainer.innerHTML = '';
    statsContainer.classList.remove('hidden');

    document.getElementById('stat-found').textContent = '0';
    document.getElementById('stat-not-found').textContent = '0';
    document.getElementById('stat-total').textContent = PLATFORMS.length;

    PLATFORMS.forEach((platform, index) => {
      const card = UI.createResultCard({
        platform: platform.name, icon: platform.icon,
        url: platform.url.replace('{username}', username),
        status: 'checking', username, delay: index * 30,
      });
      card.id = `ucard-${index}`;
      resultsContainer.appendChild(card);
    });

    const searchBtn = document.getElementById('username-search-btn');
    searchBtn.disabled = true;
    searchBtn.innerHTML = '⏳ Memindai...';

    let foundCount = 0, notFoundCount = 0;

    for (let i = 0; i < PLATFORMS.length; i++) {
      const platform = PLATFORMS[i];
      const profileUrl = platform.url.replace('{username}', username);
      const checkUrl = platform.check.replace(/{username}/g, username);
      let status = 'not-found';

      try {
        const resp = await fetch(checkUrl);
        const data = await resp.json();
        status = data.exists ? 'found' : 'not-found';
      } catch { status = 'not-found'; }

      if (status === 'found') foundCount++; else notFoundCount++;

      const card = document.getElementById(`ucard-${i}`);
      if (card) {
        const newCard = UI.createResultCard({
          platform: platform.name, icon: platform.icon, url: profileUrl,
          status, username, delay: 0,
        });
        newCard.id = `ucard-${i}`;
        card.replaceWith(newCard);
      }

      document.getElementById('stat-found').textContent = foundCount;
      document.getElementById('stat-not-found').textContent = notFoundCount;
      UI.setProgress('username-progress', i + 1, PLATFORMS.length, `Memeriksa ${platform.name}...`);

      results.push({ platform: platform.name, url: profileUrl, status });
    }

    isScanning = false;
    searchBtn.disabled = false;
    searchBtn.innerHTML = '🔍 Cari';

    // Show Google Dorking section
    if (dorkSection) {
      dorkSection.classList.remove('hidden');
      renderDorkResults(username);
    }

    UI.toast(`Selesai! Ditemukan ${foundCount} profil untuk "${username}"`, foundCount > 0 ? 'success' : 'info');
  }

  // ---- Google Dorking ----

  function renderDorkResults(query) {
    const container = document.getElementById('dork-results');
    if (!container) return;

    const category = DORK_CATEGORIES.find(c => c.id === activeDorkCategory);
    if (!category) return;

    let html = `<p class="text-sm text-muted mb-md">${category.desc}</p>`;
    html += '<div class="dork-grid">';

    category.dorks.forEach((dork, index) => {
      const fullQuery = dork.query.replace(/{q}/g, query);
      const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(fullQuery)}`;

      html += `
        <a href="${googleUrl}" target="_blank" rel="noopener" class="dork-card" style="animation-delay:${index * 40}ms;">
          <div class="dork-card-query">${escapeHtml(fullQuery)}</div>
          <div class="dork-card-label">${dork.label}</div>
          <div class="dork-card-action">Buka di Google →</div>
        </a>
      `;
    });

    html += '</div>';
    container.innerHTML = html;
  }

  function switchDorkTab(categoryId) {
    activeDorkCategory = categoryId;

    // Update tab buttons
    document.querySelectorAll('.dork-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === categoryId);
    });

    // Get current query
    const input = document.getElementById('username-input');
    const query = input?.value.trim();
    if (query) {
      renderDorkResults(query);
    }
  }

  function generateAllDorks() {
    const input = document.getElementById('username-input');
    const query = input?.value.trim();
    if (!query) { UI.toast('Masukkan username terlebih dahulu', 'warning'); return; }

    const allDorks = [];
    DORK_CATEGORIES.forEach(cat => {
      cat.dorks.forEach(dork => {
        allDorks.push({
          category: cat.name,
          label: dork.label,
          query: dork.query.replace(/{q}/g, query),
          googleUrl: `https://www.google.com/search?q=${encodeURIComponent(dork.query.replace(/{q}/g, query))}`,
        });
      });
    });

    UI.exportJSON({
      type: 'google-dorking',
      target: query,
      timestamp: new Date().toISOString(),
      totalDorks: allDorks.length,
      dorks: allDorks,
    }, `google-dorks-${query}.json`);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function exportResults() {
    if (results.length === 0) { UI.toast('Belum ada hasil untuk diekspor', 'warning'); return; }
    UI.exportJSON({ type: 'username-lookup', timestamp: new Date().toISOString(), results }, 'username-lookup.json');
  }

  // ---- Build Dork Tabs HTML ----

  function buildDorkTabsHTML() {
    return DORK_CATEGORIES.map((cat, i) => {
      return `<button class="dork-tab-btn ${i === 0 ? 'active' : ''}" data-category="${cat.id}">${cat.name}</button>`;
    }).join('');
  }

  function getHTML() {
    return `
      <div class="module-header">
        <h2>👤 Pencarian Username & Google Dorking</h2>
        <p>Cari keberadaan username di 30+ platform, lalu gunakan 200+ Google Dorks untuk investigasi mendalam.</p>
      </div>
      <div class="search-container">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input type="text" id="username-input" placeholder="Masukkan nama atau username (contoh: johndoe)" autocomplete="off" spellcheck="false">
          <button class="search-btn" id="username-search-btn">🔍 Cari</button>
        </div>
      </div>
      <div class="progress-container" id="username-progress">
        <div class="progress-info">
          <span class="progress-label">Memindai platform...</span>
          <span class="progress-count">0/${PLATFORMS.length}</span>
        </div>
        <div class="progress-bar"><div class="progress-fill"></div></div>
      </div>
      <div class="stats-row hidden" id="username-stats">
        <div class="stat-card"><div class="stat-value text-green" id="stat-found">0</div><div class="stat-label">Ditemukan</div></div>
        <div class="stat-card"><div class="stat-value text-muted" id="stat-not-found">0</div><div class="stat-label">Tidak Ditemukan</div></div>
        <div class="stat-card"><div class="stat-value text-cyan" id="stat-total">${PLATFORMS.length}</div><div class="stat-label">Total Platform</div></div>
        <div class="stat-card" style="cursor:pointer;" onclick="UsernameModule.exportResults()"><div class="stat-value">📥</div><div class="stat-label">Ekspor JSON</div></div>
      </div>
      <div class="results-grid" id="username-results"></div>

      <!-- ====== GOOGLE DORKING SECTION ====== -->
      <div id="dork-section" class="hidden mt-xl">
        <div class="dork-section-header">
          <div>
            <h3 class="dork-section-title">🔎 Google Dorking — Investigasi Mendalam</h3>
            <p class="text-sm text-muted">Klik query di bawah untuk membuka pencarian Google secara otomatis. Tersedia ${DORK_CATEGORIES.reduce((a, c) => a + c.dorks.length, 0)}+ dork queries.</p>
          </div>
          <button class="search-btn" onclick="UsernameModule.generateAllDorks()" style="white-space:nowrap;">
            📥 Ekspor Semua Dork
          </button>
        </div>

        <div class="dork-tabs-wrapper">
          <div class="dork-tabs">
            ${buildDorkTabsHTML()}
          </div>
        </div>

        <div id="dork-results" class="mt-md"></div>
      </div>
    `;
  }

  return { init, startSearch, exportResults, generateAllDorks, switchDorkTab, getHTML };
})();
