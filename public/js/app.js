/**
 * FreeEPG — Frontend Application Controller
 * Replicating https://www.free-epg.de/ UI & Interactive Workflows
 */

(function () {
  'use strict';

  // --- STATE ---
  const state = {
    currentView: 'overview',
    currentCountry: 'US',
    currentCategory: 'all',
    currentChannel: null,
    currentLang: 'en',
    hls: null,
    epgTimer: null,
  };

  // --- DOM CACHE ---
  const video = document.getElementById('video-element');
  const videoOverlay = document.getElementById('video-overlay');
  const videoStatusText = document.getElementById('video-status-text');
  const ctrlCcBtn = document.getElementById('ctrl-cc-btn');

  // Player Elements
  const currentChName = document.getElementById('current-ch-name');
  const currentChQuality = document.getElementById('current-ch-quality');
  const currentChCountry = document.getElementById('current-ch-country');
  const playerCountrySelect = document.getElementById('player-country-select');
  const playerChannelSearch = document.getElementById('player-channel-search');
  const playerChannelsList = document.getElementById('player-channels-list');
  const btnReloadStream = document.getElementById('btn-reload-stream');
  const btnCopyStreamUrl = document.getElementById('btn-copy-stream-url');

  // EPG Elements
  const epgProgrammeTitle = document.getElementById('epg-programme-title');
  const epgProgrammeTime = document.getElementById('epg-programme-time');
  const epgProgrammeDesc = document.getElementById('epg-programme-desc');
  const epgProgressBar = document.getElementById('epg-progress-bar');
  const epgUpcomingList = document.getElementById('epg-upcoming-list');
  const epgSourceTag = document.getElementById('epg-source-tag');

  // Modals & Toast
  const toast = document.getElementById('toast');
  const countryModal = document.getElementById('country-details-modal');
  const modalCountryFlag = document.getElementById('modal-country-flag');
  const modalCountryTitle = document.getElementById('modal-country-title');
  const btnModalWatchCountry = document.getElementById('btn-modal-watch-country');
  const btnCloseCountryModal = document.getElementById('btn-close-country-modal');


  // Search inputs
  const countriesSearchInput = document.getElementById('countries-search-input');
  const channelsDirSearch = document.getElementById('channels-dir-search');

  // --- INITIALIZATION ---

    // Helper for i18n lookup
  function t(key, fallback) {
    if (window.LiveTV_i18n && typeof window.LiveTV_i18n.t === 'function') {
      const val = window.LiveTV_i18n.t(key, state.currentLang);
      if (val && val !== key) return val;
    }
    return fallback || key;
  }

  // Helper to get route language prefix (e.g. '/bn' or '' for 'en')
  function getLangPrefix() {
    return state.currentLang && state.currentLang !== 'en' ? `/${state.currentLang}` : '';
  }

  // Set active language and translate DOM
  function setLanguage(langCode, updateUrl = true) {
    if (!window.LiveTV_i18n || !window.LiveTV_i18n.translations) return;
    const t = window.LiveTV_i18n.translations[langCode] || window.LiveTV_i18n.translations['en'];
    state.currentLang = langCode;

    // Update document lang & direction (RTL for Arabic)
    document.documentElement.lang = langCode;
    document.documentElement.dir = t.dir || 'ltr';

    // Update header label
    const langTextEl = document.getElementById('current-lang-text');
    if (langTextEl) langTextEl.textContent = t.lang_name;

    // Highlight active option in dropdown
    document.querySelectorAll('.lang-option-btn').forEach(btn => {
      if (btn.dataset.lang === langCode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Translate all [data-i18n]
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      const translated = window.LiveTV_i18n.t(key, langCode);
      if (translated && translated !== key) {
        el.textContent = translated;
      }
    });

    // Translate all [data-i18n-placeholder]
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      const translated = window.LiveTV_i18n.t(key, langCode);
      if (translated && translated !== key) {
        el.placeholder = translated;
      }
    });

    // Translate all [data-i18n-title]
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.dataset.i18nTitle;
      const translated = window.LiveTV_i18n.t(key, langCode);
      if (translated && translated !== key) {
        el.title = translated;
      }
    });

    // Persist user selection
    try {
      localStorage.setItem('livetv_lang', langCode);
    } catch (_) {}

    // Update URL route if requested (e.g., /bn/player?...)
    if (updateUrl) {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const supportedLangs = ['en', 'bn', 'es', 'de', 'fr', 'hi', 'ar'];
      let viewPart = '';
      if (pathParts.length > 0 && supportedLangs.includes(pathParts[0].toLowerCase())) {
        viewPart = pathParts.slice(1).join('/');
      } else {
        viewPart = pathParts.join('/');
      }

      const prefix = langCode !== 'en' ? `/${langCode}` : '';
      let newPath = viewPart ? `${prefix}/${viewPart}` : (prefix || '/');
      const search = window.location.search || '';
      const fullNewUrl = newPath + search;
      if (window.location.pathname + window.location.search !== fullNewUrl) {
        window.history.pushState({ view: state.currentView, lang: langCode }, '', fullNewUrl);
      }
    }
  }

  // Setup Language Dropdown interactions
  function setupLanguageSelector() {
    const langDropdownWrapper = document.getElementById('lang-dropdown-wrapper');
    const langBtn = document.getElementById('lang-btn');
    if (langBtn && langDropdownWrapper) {
      langBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = langDropdownWrapper.classList.toggle('open');
        langBtn.setAttribute('aria-expanded', String(isOpen));
      });

      // Close when clicking outside
      document.addEventListener('click', (e) => {
        if (!langDropdownWrapper.contains(e.target)) {
          langDropdownWrapper.classList.remove('open');
          langBtn.setAttribute('aria-expanded', 'false');
        }
      });

      // Language option clicks
      document.querySelectorAll('.lang-option-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const lang = btn.dataset.lang;
          if (lang) {
            setLanguage(lang, true);
            langDropdownWrapper.classList.remove('open');
            langBtn.setAttribute('aria-expanded', 'false');
          }
        });
      });
    }
  }

  // Setup Theme Toggle (Light / Dark mode)
  function setupThemeToggle() {
    const themeBtn = document.getElementById('btn-theme-toggle');
    if (!themeBtn) return;

    function getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('livetv_theme', theme);
      } catch (e) {}
      const isDark = theme === 'dark';
      themeBtn.setAttribute('title', isDark ? 'Switch to Light mode' : 'Switch to Dark mode');
      themeBtn.setAttribute('aria-label', isDark ? 'Switch to Light mode' : 'Switch to Dark mode');
    }

    // Initialize button state
    applyTheme(getCurrentTheme());

    themeBtn.addEventListener('click', () => {
      const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
    });
  }

  function init() {
    setupLanguageSelector();
    setupThemeToggle();
    setupNavigation();
    setupModals();
    setupSearchFilters();
    setupPlayerControls();

    // Detect language from URL route prefix or localStorage or body attribute
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const supportedLangs = ['en', 'bn', 'es', 'de', 'fr', 'hi', 'ar'];
    let initialLang = 'en';
    if (pathParts.length > 0 && supportedLangs.includes(pathParts[0].toLowerCase())) {
      initialLang = pathParts[0].toLowerCase();
    } else {
      const savedLang = localStorage.getItem('livetv_lang');
      if (savedLang && supportedLangs.includes(savedLang)) {
        initialLang = savedLang;
      } else {
        initialLang = document.body.dataset.currentLang || 'en';
      }
    }
    setLanguage(initialLang, false);

    // Check URL parameters for player (e.g., /player?country=DE&cat=News)
    const urlParams = new URLSearchParams(window.location.search);
    const paramCountry = urlParams.get('country');
    const paramCat = urlParams.get('cat');

    if (paramCountry && playerCountrySelect) {
      playerCountrySelect.value = paramCountry.toUpperCase();
      state.currentCountry = paramCountry.toUpperCase();
      const flagImg = document.getElementById('player-country-flag-img');
      if (flagImg) {
        flagImg.src = `https://flagcdn.com/w40/${state.currentCountry.toLowerCase()}.png`;
      }
    } else if (playerCountrySelect) {
      state.currentCountry = playerCountrySelect.value;
    }

    if (paramCat) {
      state.currentCategory = paramCat;
      const targetBtn = document.querySelector(`.cat-tag-btn[data-category="${paramCat}"]`);
      if (targetBtn) {
        document.querySelectorAll('.cat-tag-btn').forEach(b => b.classList.remove('active'));
        targetBtn.classList.add('active');
        const categoriesActiveBadge = document.getElementById('categories-active-badge');
        if (categoriesActiveBadge) {
          categoriesActiveBadge.textContent = targetBtn.textContent.trim();
          const catI18n = targetBtn.getAttribute('data-i18n');
          if (catI18n) categoriesActiveBadge.setAttribute('data-i18n', catI18n);
        }
      }
    }

    // Restore search query from URL
    const paramQ = urlParams.get('q');
    const paramCh = urlParams.get('ch');
    if (paramQ && playerChannelSearch) {
      playerChannelSearch.value = paramQ;
      const playerSearchClear = document.getElementById('player-search-clear');
      if (playerSearchClear) playerSearchClear.style.display = 'flex';
    }

    // Store ch param to restore after channels load
    state._pendingChannelId = paramCh || null;

    // Check initial view from URL pathname (accounting for /:lang prefix)
    let path = 'overview';
    if (pathParts.length > 0 && supportedLangs.includes(pathParts[0].toLowerCase())) {
      path = pathParts[1] || 'overview';
    } else if (pathParts.length > 0) {
      path = pathParts[0] || 'overview';
    }

    const validViews = ['overview', 'countries', 'player', 'channels'];
    if (paramCountry) {
      switchView('player', false);
    } else if (validViews.includes(path)) {
      switchView(path, false);
    } else {
      const bodyInitial = document.body.dataset.initialView || 'overview';
      switchView(bodyInitial, false);
    }

    // If deep-linking to a specific channel, load channels and restore it
    if (paramCountry && state._pendingChannelId) {
      const pendingId = state._pendingChannelId;
      state._pendingChannelId = null;
      loadPlayerChannels(
        paramCountry.toUpperCase(),
        paramCat || 'all',
        false,
        () => {
          const chItem = playerChannelsList
            ? playerChannelsList.querySelector(`.channel-item[data-id="${pendingId}"]`)
            : null;
          if (chItem) {
            selectChannelFromElement(chItem, true);
          }
        }
      );
    } else if (paramCountry) {
      loadPlayerChannels(paramCountry.toUpperCase(), paramCat || 'all', false);
    } else {
      // Initialize first channel in player if present
      const firstItem = playerChannelsList ? playerChannelsList.querySelector('.channel-item') : null;
      if (firstItem) {
        selectChannelFromElement(firstItem, false);
      }
    }
  }

  // --- NAVIGATION CONTROLLER ---
  function setupNavigation() {
    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const targetView = el.dataset.nav;
        if (targetView) {
          switchView(targetView, true);
        }
      });
    });

    window.addEventListener('popstate', (e) => {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const supportedLangs = ['en', 'bn', 'es', 'de', 'fr', 'hi', 'ar'];
      let lang = 'en';
      let view = 'overview';
      if (pathParts.length > 0 && supportedLangs.includes(pathParts[0].toLowerCase())) {
        lang = pathParts[0].toLowerCase();
        view = pathParts[1] || 'overview';
      } else if (pathParts.length > 0) {
        view = pathParts[0] || 'overview';
      }
      if (lang !== state.currentLang) {
        setLanguage(lang, false);
      }
      switchView(view, false);
    });
  }

  function switchView(viewName, pushState = true) {
    // Pause video when leaving the TV Player view
    if (viewName !== 'player' && video && !video.paused) {
      if (typeof video.pause === "function") if (video && typeof video.pause === "function") video.pause();
    }
    state.currentView = viewName;

    // Toggle panes
    document.querySelectorAll('.view-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    const activePane = document.getElementById(`view-${viewName}`);
    if (activePane) {
      activePane.classList.add('active');
    }

    // Toggle nav active classes
    document.querySelectorAll('.main-nav .nav-link').forEach(link => {
      if (link.dataset.nav === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update browser URL (preserving /:lang prefix)
    if (pushState) {
      const prefix = getLangPrefix();
      let newPath = viewName === 'overview' ? (prefix || '/') : `${prefix}/${viewName}`;
      if (viewName === 'player' && state.currentCountry) {
        const _params = new URLSearchParams();
        _params.set('country', state.currentCountry);
        if (state.currentCategory && state.currentCategory !== 'all') _params.set('cat', state.currentCategory);
        if (state.currentChannel) _params.set('ch', state.currentChannel.id);
        const _q = playerChannelSearch ? playerChannelSearch.value.trim() : '';
        if (_q) _params.set('q', _q);
        newPath += '?' + _params.toString();
      }
      if (window.location.pathname + window.location.search !== newPath) {
        window.history.pushState({ view: viewName, lang: state.currentLang }, '', newPath);
      }
    }

    // Dynamic document title for client-side navigation
    if (viewName === 'overview') {
      document.title = 'LiveTV — Worldwide Live TV Streams & EPG Guide';
    } else if (viewName === 'countries') {
      document.title = 'Explore 200+ Countries Live TV Catalog — LiveTV';
    } else if (viewName === 'channels') {
      document.title = 'Channels Directory — 18,400+ Live Television Feeds | LiveTV';
    } else if (viewName === 'player') {
      document.title = state.currentChannel
        ? `${state.currentChannel.name} — LiveTV Player`
        : 'Live TV Player — Watch Live TV Online | LiveTV';
    }

    // If switched to TV player and no channel selected yet, populate metadata without auto-playing
    if (viewName === 'player' && !state.currentChannel) {
      const firstItem = playerChannelsList ? playerChannelsList.querySelector('.channel-item') : null;
      if (firstItem) {
        selectChannelFromElement(firstItem, false);
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- HLS VIDEO PLAYER CONTROLLER ---
  function playStream(url) {
    if (!video || !url) return;

    showVideoOverlay(true, 'Connecting to stream...', true);

    if (state.hls) {
      state.hls.destroy();
      state.hls = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      // Reset CC button state on stream load
      if (ctrlCcBtn) {
        ctrlCcBtn.style.display = 'none';
        ctrlCcBtn.classList.remove('active');
      }

      // Check for subtitles in HLS stream
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, (_event, data) => {
        if (ctrlCcBtn) {
          if (data.subtitleTracks && data.subtitleTracks.length > 0) {
            ctrlCcBtn.style.display = 'inline-flex';
          } else {
            ctrlCcBtn.style.display = 'none';
          }
        }
      });

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        showVideoOverlay(false);
        video.play().catch(err => {
          console.warn('[Player] Autoplay prevented:', err);
          showVideoOverlay(true, 'Click video to play', false);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              showVideoOverlay(true, 'Network stall, recovering...', true);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              showVideoOverlay(true, 'Stream error, recovering...', true);
              hls.recoverMediaError();
              break;
            default:
              showVideoOverlay(true, 'Stream currently offline', false);
              hls.destroy();
              break;
          }
        }
      });

      state.hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari iOS/macOS support
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        showVideoOverlay(false);
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        showVideoOverlay(true, 'Stream unavailable', false);
      });
    } else {
      showVideoOverlay(true, 'HLS playback not supported in this browser', false);
    }
  }

  function showVideoOverlay(show, message, showSpinner = false) {
    if (!videoOverlay) return;
    if (show) {
      videoOverlay.classList.remove('hidden');
      const spinner = videoOverlay.querySelector('.spinner');
      if (spinner) {
        spinner.style.display = showSpinner ? 'block' : 'none';
      }
      if (videoStatusText && message) {
        videoStatusText.textContent = message;
      }
    } else {
      videoOverlay.classList.add('hidden');
    }
  }


  // Helper to escape HTML characters
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Update browser URL query parameter for Player
  function updatePlayerUrl(countryCode, category, channelId, searchQuery) {
    if (state.currentView !== 'player') return;
    const params = new URLSearchParams();
    if (countryCode) params.set('country', countryCode);
    if (category && category !== 'all' && category !== 'All') params.set('cat', category);
    if (channelId) params.set('ch', channelId);
    if (searchQuery && searchQuery.trim()) params.set('q', searchQuery.trim());
    const prefix = getLangPrefix();
    const newUrl = (prefix || '') + '/player' + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({ country: countryCode, cat: category, ch: channelId, lang: state.currentLang }, '', newUrl);
  }

  // Sync full player state (country + category + playing channel + search) to URL
  function syncPlayerUrl() {
    const chId = state.currentChannel ? state.currentChannel.id : null;
    const q = (playerChannelSearch && playerChannelSearch.value) ? String(playerChannelSearch.value).trim() : '';
    updatePlayerUrl(state.currentCountry, state.currentCategory, chId, q);
  }

  // Update Flag image and country text on player interface
  function updatePlayerCountryUI(countryCode) {
    if (!countryCode) return;
    if (playerCountrySelect && playerCountrySelect.value !== countryCode) {
      playerCountrySelect.value = countryCode;
    }
    const option = playerCountrySelect ? playerCountrySelect.querySelector(`option[value="${countryCode}"]`) : null;
    const flagCode = option?.dataset.flagCode || (countryCode.toUpperCase() === 'UK' ? 'gb' : countryCode.toLowerCase());
    const flagImg = document.getElementById('player-country-flag-img');
    const flagFallback = document.getElementById('player-country-flag-fallback');
    if (flagImg) {
      flagImg.src = `https://flagcdn.com/w40/${flagCode}.png`;
      flagImg.style.display = 'block';
      if (flagFallback) flagFallback.style.display = 'none';
    }
    if (currentChCountry) {
      const countryName = option ? (option.dataset.name || option.textContent.split('(')[0].trim()) : countryCode;
      currentChCountry.innerHTML = `
        <img src="https://flagcdn.com/w40/${flagCode}.png" alt="" class="now-country-flag" style="width:16px; height:12px; vertical-align:middle; margin-right:4px; border-radius:1px; object-fit:cover;">
        <span>${escapeHtml(countryName)}</span>
      `;
    }
  }

  function selectChannelFromElement(element, autoPlay = false) {
    if (!element) return;

    // Highlight item
    if (playerChannelsList) {
      playerChannelsList.querySelectorAll('.channel-item').forEach(el => el.classList.remove('active'));
    }
    element.classList.add('active');

    const channelData = {
      id: element.dataset.id,
      name: element.dataset.name,
      url: element.dataset.url,
      logo: element.dataset.logo,
      quality: element.dataset.quality || 'HD',
      country: element.dataset.country || '',
      category: element.dataset.category || 'General',
    };

    state.currentChannel = channelData;
    if (state.currentView === 'player' && channelData.name) {
      document.title = `${channelData.name} — LiveTV Player`;
    }

    // Sync URL to reflect the now-selected channel
    try { syncPlayerUrl(); } catch (e) { console.warn('[syncPlayerUrl] error:', e); }

    // Update Header Bar
    if (currentChName) currentChName.textContent = channelData.name;
    if (currentChQuality) currentChQuality.textContent = channelData.quality;

    if (autoPlay && channelData.url) {
      playStream(channelData.url);
    } else if (!autoPlay) {
      if (state.hls) {
        state.hls.destroy();
        state.hls = null;
      }
      if (video) {
        if (typeof video.pause === 'function') video.pause();
        if (typeof video.removeAttribute === 'function') video.removeAttribute('src');
        if (typeof video.load === 'function') video.load();
      }
      showVideoOverlay(true, `Click to play ${channelData.name}`, false);
    }

    // Fetch EPG Schedule safely
    try {
      fetchEpgForChannel(channelData.id);
    } catch (epgErr) {
      console.warn('[selectChannelFromElement] EPG fetch error:', epgErr);
    }
  }

  // --- EPG DATA FETCHER ---
  function fetchEpgForChannel(channelId) {
    if (!channelId) return;

    if (epgProgrammeTitle) epgProgrammeTitle.textContent = 'Loading live schedule...';
    if (epgProgrammeTime) epgProgrammeTime.textContent = '--:-- - --:--';
    if (epgProgrammeDesc) epgProgrammeDesc.textContent = 'Connecting to EPG database...';
    if (epgProgressBar) epgProgressBar.style.width = '0%';

    fetch(`/api/epg/${encodeURIComponent(channelId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.hasEpg && data.nowPlaying) {
          const np = data.nowPlaying;
          if (epgProgrammeTitle) epgProgrammeTitle.textContent = np.title || 'Live Transmission';
          if (epgProgrammeTime) epgProgrammeTime.textContent = `${np.startTimeStr || ''} - ${np.stopTimeStr || ''}`;
          if (epgProgrammeDesc) epgProgrammeDesc.textContent = np.desc || 'No broadcast synopsis available.';
          if (epgProgressBar) epgProgressBar.style.width = `${Math.min(100, Math.max(0, np.progress || 0))}%`;
          // epg source tag removed from UI

          // Upcoming programs list
          if (epgUpcomingList) {
            epgUpcomingList.innerHTML = '';
            if (data.upcoming && data.upcoming.length > 0) {
              data.upcoming.forEach(item => {
                const row = document.createElement('div');
                row.className = 'upcoming-item';
                row.innerHTML = `
                  <span class="upcoming-time">${item.startTimeStr}</span>
                  <span class="upcoming-title">${item.title}</span>
                `;
                epgUpcomingList.appendChild(row);
              });
            } else {
              epgUpcomingList.innerHTML = '<div style="font-size:0.8125rem; color:var(--muted-foreground);">No further upcoming schedule listed.</div>';
            }
          }
        } else {
          // No EPG fallback
          if (epgProgrammeTitle) epgProgrammeTitle.textContent = state.currentChannel ? state.currentChannel.name : 'Live Stream';
          if (epgProgrammeTime) epgProgrammeTime.textContent = '24/7 Continuous Broadcast';
          if (epgProgrammeDesc) epgProgrammeDesc.textContent = 'Electronic Program Guide is not available for this channel ID.';
          if (epgProgressBar) epgProgressBar.style.width = '100%';
          if (epgUpcomingList) {
            epgUpcomingList.innerHTML = '<div style="font-size:0.8125rem; color:var(--muted-foreground);">Schedule not supplied by regional EPG provider.</div>';
          }
        }
      })
      .catch(() => {
        if (epgProgrammeTitle) epgProgrammeTitle.textContent = 'Live Broadcast';
        if (epgProgrammeTime) epgProgrammeTime.textContent = 'Continuous Broadcast';
        if (epgProgrammeDesc) epgProgrammeDesc.textContent = 'Schedule temporarily unavailable.';
      });
  }

  // --- PLAYER CONTROLS & SIDEBAR ---
  function setupPlayerControls() {
    const videoWrapper = document.getElementById('video-player-wrapper');
    const ctrlMuteBtn = document.getElementById('ctrl-mute-btn');
    const iconVolumeHigh = document.getElementById('icon-volume-high');
    const iconVolumeMuted = document.getElementById('icon-volume-muted');
    const ctrlVolumeSlider = document.getElementById('ctrl-volume-slider');
    const volumeTrackFill = document.getElementById('volume-track-fill');
    const ctrlFullscreenBtn = document.getElementById('ctrl-fullscreen-btn');

    // Mute & Volume Handling (Dual Track: High-contrast bright fill on left, low-opacity dim on right)
    function updateVolumeUI() {
      if (!video) return;
      const isMuted = video.muted || video.volume === 0;
      if (iconVolumeHigh) iconVolumeHigh.style.display = isMuted ? 'none' : 'inline-block';
      if (iconVolumeMuted) iconVolumeMuted.style.display = isMuted ? 'inline-block' : 'none';
      const currentVal = isMuted ? 0 : video.volume;
      const pct = Math.round(currentVal * 100);
      if (ctrlVolumeSlider) {
        ctrlVolumeSlider.value = currentVal;
      }
      if (volumeTrackFill) {
        volumeTrackFill.style.width = pct + '%';
      }
    }

    if (ctrlMuteBtn) {
      ctrlMuteBtn.addEventListener('click', () => {
        if (!video) return;
        video.muted = !video.muted;
        if (!video.muted && video.volume === 0) {
          video.volume = 0.5;
        }
        updateVolumeUI();
      });
    }

    if (ctrlVolumeSlider) {
      ctrlVolumeSlider.addEventListener('input', (e) => {
        if (!video) return;
        const val = parseFloat(e.target.value);
        video.volume = val;
        video.muted = val === 0;
        const pct = Math.round(val * 100);
        if (volumeTrackFill) {
          volumeTrackFill.style.width = pct + '%';
        }
        updateVolumeUI();
      });
      // Initial volume fill
      const initialVal = typeof video.volume === 'number' ? video.volume : 1;
      if (volumeTrackFill) {
        volumeTrackFill.style.width = Math.round(initialVal * 100) + '%';
      }
    }

    // CC / Subtitles Toggle
    let ccActive = false;
    if (ctrlCcBtn) {
      ctrlCcBtn.addEventListener('click', () => {
        ccActive = !ccActive;
        ctrlCcBtn.classList.toggle('active', ccActive);
        if (state.hls) {
          state.hls.subtitleTrack = ccActive ? 0 : -1;
        } else if (video && video.textTracks && video.textTracks.length > 0) {
          for (let i = 0; i < video.textTracks.length; i++) {
            video.textTracks[i].mode = ccActive ? 'showing' : 'hidden';
          }
        }
        showToast(ccActive ? 'Subtitles enabled' : 'Subtitles disabled');
      });
    }

    // Fullscreen Toggle
    if (ctrlFullscreenBtn && videoWrapper) {
      ctrlFullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          videoWrapper.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // Autohide Controls on inactivity
    let controlsTimeout = null;
    if (videoWrapper) {
      const activateControls = () => {
        videoWrapper.classList.add('controls-active');
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
          videoWrapper.classList.remove('controls-active');
        }, 3200);
      };
      videoWrapper.addEventListener('mousemove', activateControls);
      videoWrapper.addEventListener('touchstart', activateControls, { passive: true });
      videoWrapper.addEventListener('mouseleave', () => {
        clearTimeout(controlsTimeout);
        videoWrapper.classList.remove('controls-active');
      });
    }

    // Keyboard Shortcuts: 'm' for Mute, 'f' for Fullscreen
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      if (state.currentView !== 'player') return;

      if (e.key === 'm' || e.key === 'M') {
        if (ctrlMuteBtn) ctrlMuteBtn.click();
      } else if (e.key === 'f' || e.key === 'F') {
        if (ctrlFullscreenBtn) ctrlFullscreenBtn.click();
      }
    });

    if (btnReloadStream) {
      btnReloadStream.addEventListener('click', () => {
        if (state.currentChannel && state.currentChannel.url) {
          playStream(state.currentChannel.url);
          showToast('Stream reloaded');
        }
      });
    }

    // Update browser URL query parameter for Player
    function updatePlayerUrl(countryCode, category, channelId, searchQuery) {
      if (state.currentView !== 'player') return;
      const params = new URLSearchParams();
      if (countryCode) params.set('country', countryCode);
      if (category && category !== 'all' && category !== 'All') params.set('cat', category);
      if (channelId) params.set('ch', channelId);
      if (searchQuery) params.set('q', searchQuery);
      const prefix = getLangPrefix();
      const newUrl = (prefix ? `${prefix}/player` : '/player') + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({ country: countryCode, cat: category, ch: channelId, q: searchQuery }, '', newUrl);
    }

    // Update Flag image and country text on player interface
    function updatePlayerCountryUI(countryCode) {
      if (!countryCode) return;
      const option = playerCountrySelect ? playerCountrySelect.querySelector(`option[value="${countryCode}"]`) : null;
      const flagCode = option?.dataset.flagCode || (countryCode.toUpperCase() === 'UK' ? 'gb' : countryCode.toLowerCase());
      const flagImg = document.getElementById('player-country-flag-img');
      const flagFallback = document.getElementById('player-country-flag-fallback');
      if (flagImg) {
        flagImg.src = `https://flagcdn.com/w40/${flagCode}.png`;
        flagImg.style.display = 'block';
        if (flagFallback) flagFallback.style.display = 'none';
      }
      if (currentChCountry) {
        const countryName = option ? (option.dataset.name || option.textContent.split('(')[0].trim()) : countryCode;
        currentChCountry.innerHTML = `
          <img src="https://flagcdn.com/w40/${flagCode}.png" alt="" class="now-country-flag" style="width:16px; height:12px; vertical-align:middle; margin-right:4px; border-radius:1px; object-fit:cover;">
          <span>${countryName}</span>
        `;
      }
    }

    // Country select change in TV Player
    if (playerCountrySelect) {
      playerCountrySelect.addEventListener('change', (e) => {
        const countryCode = e.target.value;
        state.currentCountry = countryCode;
        state.currentCategory = 'all';

        // Reset category UI chips to 'all'
        document.querySelectorAll('.cat-tag-btn').forEach(b => {
          if (b.dataset.category === 'all') {
            b.classList.add('active');
          } else {
            b.classList.remove('active');
          }
        });

        // Reset channel search input
        if (playerChannelSearch) playerChannelSearch.value = '';
        const playerSearchClear = document.getElementById('player-search-clear');
        if (playerSearchClear) playerSearchClear.style.display = 'none';
        const categoriesActiveBadge = document.getElementById('categories-active-badge');
        if (categoriesActiveBadge) {
          categoriesActiveBadge.textContent = t('cat_all', 'All');
          categoriesActiveBadge.setAttribute('data-i18n', 'cat_all');
        }

        updatePlayerCountryUI(countryCode);
        updatePlayerUrl(countryCode, 'all', null, '');

        // Load new country channels without automatically playing — shows "Click to play"
        loadPlayerChannels(countryCode, 'all', false);
      });
    }

    // Category tags in TV Player (Structured in-place grid, no horizontal scroll)
    const categoriesActiveBadge = document.getElementById('categories-active-badge');
    document.querySelectorAll('.cat-tag-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentCategory = btn.dataset.category || 'all';
        if (categoriesActiveBadge) {
          categoriesActiveBadge.textContent = btn.textContent.trim();
          const catI18n = btn.getAttribute('data-i18n');
          if (catI18n) categoriesActiveBadge.setAttribute('data-i18n', catI18n);
          else categoriesActiveBadge.removeAttribute('data-i18n');
        }
        const countryCode = playerCountrySelect ? playerCountrySelect.value : 'US';
        if (playerChannelSearch) playerChannelSearch.value = '';
        const _clearBtn = document.getElementById('player-search-clear');
        if (_clearBtn) _clearBtn.style.display = 'none';
        updatePlayerUrl(countryCode, state.currentCategory, null, '');
        loadPlayerChannels(countryCode, state.currentCategory, false);
      });
    });

    // Delegated click listener for all channel items in player channels list
    if (playerChannelsList) {
      playerChannelsList.addEventListener('click', (e) => {
        const item = e.target.closest('.channel-item');
        if (item) {
          selectChannelFromElement(item, true); // CLICK EXPLICITLY RUNS CHANNEL
        }
      });
    }

    // Video overlay click to start playback
    if (videoOverlay) {
      videoOverlay.addEventListener('click', () => {
        if (state.currentChannel && state.currentChannel.url) {
          playStream(state.currentChannel.url);
        }
      });
    }

    // Player Channel Search (Instant multi-attribute filter + empty state + worldwide search)
    if (playerChannelSearch) {
      const handlePlayerSearch = () => {
        const q = playerChannelSearch.value.toLowerCase().trim();
        const items = playerChannelsList ? playerChannelsList.querySelectorAll('.channel-item') : [];
        let visibleCount = 0;

        const playerSearchClear = document.getElementById('player-search-clear');
        if (playerSearchClear) playerSearchClear.style.display = q ? 'flex' : 'none';

        // Remove any previous empty-state message
        const existingEmpty = document.getElementById('player-search-empty-state');
        if (existingEmpty) existingEmpty.remove();

        if (!q) {
          // Empty query: restore all channels
          items.forEach(item => {
            item.style.display = 'flex';
          });
          return;
        }

        items.forEach(item => {
          const name = (item.dataset.name || '').toLowerCase();
          const cat = (item.dataset.category || '').toLowerCase();
          const qual = (item.dataset.quality || '').toLowerCase();
          const country = (item.dataset.country || '').toLowerCase();

          if (name.includes(q) || cat.includes(q) || qual.includes(q) || country.includes(q)) {
            item.style.display = 'flex';
            visibleCount++;
          } else {
            item.style.display = 'none';
          }
        });

        // If local search returns zero results, offer worldwide search button
        if (visibleCount === 0 && playerChannelsList) {
          const emptyBox = document.createElement('div');
          emptyBox.id = 'player-search-empty-state';
          emptyBox.style.padding = '1.25rem 1rem';
          emptyBox.style.textAlign = 'center';
          emptyBox.style.fontSize = '0.8125rem';
          emptyBox.style.color = 'var(--muted-foreground)';

          const currentCountryName = playerCountrySelect?.selectedOptions[0]?.textContent?.split('(')[0]?.trim() || 'this region';
          emptyBox.innerHTML = `
            <div style="margin-bottom:0.75rem;">No local channels found for &ldquo;${escapeHtml(q)}&rdquo; in ${escapeHtml(currentCountryName)}.</div>
            <button type="button" id="btn-search-worldwide-fallback" style="padding:0.4rem 0.85rem; font-size:0.75rem; border-radius:4px; background:var(--primary); color:var(--primary-foreground); border:none; cursor:pointer; font-weight:500;">
              Search worldwide for &ldquo;${escapeHtml(q)}&rdquo; &rarr;
            </button>
          `;

          playerChannelsList.appendChild(emptyBox);

          const btnWorldwideFallback = emptyBox.querySelector('#btn-search-worldwide-fallback');
          if (btnWorldwideFallback) {
            btnWorldwideFallback.addEventListener('click', () => {
              searchWorldwide(q);
            });
          }
        }
      };

      playerChannelSearch.addEventListener('input', () => {
        syncPlayerUrl();
        handlePlayerSearch();
      });

      const playerSearchClear = document.getElementById('player-search-clear');
      if (playerSearchClear) {
        playerSearchClear.addEventListener('click', () => {
          playerChannelSearch.value = '';
          handlePlayerSearch();
          playerChannelSearch.focus();
        });
      }

      // Key navigation in search: Enter plays first result, Escape clears
      playerChannelSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const firstVisible = playerChannelsList ? playerChannelsList.querySelector('.channel-item:not([style*="display: none"])') : null;
          if (firstVisible) {
            selectChannelFromElement(firstVisible, true);
          } else {
            const btnWorldwide = document.getElementById('btn-search-worldwide-fallback');
            if (btnWorldwide) btnWorldwide.click();
          }
        } else if (e.key === 'Escape') {
          playerChannelSearch.value = '';
          handlePlayerSearch();
          playerChannelSearch.blur();
        }
      });
    }

    // Global copy button in Playlists view
    const btnCopyGlobalM3u = document.getElementById('btn-copy-global-m3u');
    if (btnCopyGlobalM3u) {
      btnCopyGlobalM3u.addEventListener('click', () => {
        const fullUrl = `${window.location.origin}/api/playlist/all.m3u`;
        navigator.clipboard.writeText(fullUrl).then(() => {
          showToast(t('toast_copied', 'Worldwide M3U URL copied to clipboard'));
        });
      });
    }

    // Play channel from directory view
    document.addEventListener('click', (e) => {
      const playDirBtn = e.target.closest('.btn-play-channel-dir');
      if (playDirBtn) {
        const url = playDirBtn.dataset.url;
        const name = playDirBtn.dataset.name;
        const id = playDirBtn.dataset.id;
        const country = playDirBtn.dataset.country;

        switchView('player', true);
        if (playerCountrySelect && country) {
          playerCountrySelect.value = country;
          state.currentCountry = country;
          state.currentCategory = 'all';
          updatePlayerCountryUI(country);
          loadPlayerChannels(country, 'all', false, () => {
            const chItem = playerChannelsList ? playerChannelsList.querySelector(`.channel-item[data-id="${id}"]`) : null;
            if (chItem) {
              selectChannelFromElement(chItem, true);
            } else {
              playStream(url);
            }
          });
        } else {
          playStream(url);
        }
      }

      // Copy channel stream in directory
      const copyDirBtn = e.target.closest('.btn-copy-channel-stream');
      if (copyDirBtn) {
        const url = copyDirBtn.dataset.url;
        navigator.clipboard.writeText(url).then(() => {
          showToast(t('toast_copied', 'Stream URL copied to clipboard'));
        });
      }

      // Copy country M3U in Playlists catalog
      const copyM3uBtn = e.target.closest('.btn-copy-m3u-url');
      if (copyM3uBtn) {
        const code = copyM3uBtn.dataset.code;
        const fullUrl = `${window.location.origin}/api/playlist/${code}.m3u`;
        navigator.clipboard.writeText(fullUrl).then(() => {
          showToast(t('toast_copied', `${code.toUpperCase()} M3U URL copied to clipboard`));
        });
      }

      // Quick play country from card
      const quickPlayCountryBtn = e.target.closest('.btn-quick-play-country');
      if (quickPlayCountryBtn) {
        const code = quickPlayCountryBtn.dataset.country;
        switchView('player', true);
        if (playerCountrySelect) {
          playerCountrySelect.value = code;
          state.currentCountry = code;
          state.currentCategory = 'all';
          updatePlayerCountryUI(code);
          loadPlayerChannels(code, 'all', false); // user clicks to play
        }
      }
    });
  }

  function loadPlayerChannels(countryCode, category, autoPlayFirst, callback) {
    if (!playerChannelsList) return;

    if (typeof autoPlayFirst === 'function') {
      callback = autoPlayFirst;
      autoPlayFirst = false;
    }
    if (typeof category === 'function') {
      callback = category;
      category = 'all';
      autoPlayFirst = false;
    }

    const safeCategory = category || 'all';
    const shouldAutoPlay = autoPlayFirst === true;

    playerChannelsList.innerHTML = `<div style="padding:1rem; font-size:0.8125rem; color:var(--muted-foreground);">${t('player_status_connecting', 'Loading channels...')}</div>`;

    const safeCountry = (countryCode || state.currentCountry || 'US').trim().toUpperCase();
    let url = `/api/channels?country=${encodeURIComponent(safeCountry)}&limit=500`;
    if (safeCategory && safeCategory !== 'all' && safeCategory !== 'All') {
      url += `&category=${encodeURIComponent(safeCategory)}`;
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
      })
      .then(data => {
        playerChannelsList.innerHTML = '';
        if (data && data.channels && data.channels.length > 0) {
          data.channels.forEach((ch, idx) => {
            const item = document.createElement('div');
            item.className = `channel-item ${idx === 0 ? 'active' : ''}`;
            item.dataset.id = ch.id || '';
            item.dataset.url = ch.streamUrl || ch.url || '';
            item.dataset.name = ch.name || 'Channel';
            item.dataset.logo = ch.logoUrl || ch.logo || '';
            item.dataset.quality = ch.resolution || ch.quality || 'HD';
            item.dataset.country = ch.country || safeCountry;
            item.dataset.category = ch.category || (ch.categories && ch.categories[0]) || 'General';

            const name = ch.name || 'Channel';
            const initials = name.substring(0, 2).toUpperCase();
            const logo = ch.logoUrl || ch.logo;
            const logoHtml = logo
              ? `<img src="${logo}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none;">${initials}</span>`
              : `<span>${initials}</span>`;

            item.innerHTML = `
              <div class="ch-logo-mini">${logoHtml}</div>
              <div class="ch-meta-mini">
                <div class="ch-title-mini">${name}</div>
                <div class="ch-sub-mini">${item.dataset.quality} &middot; ${item.dataset.category}</div>
              </div>
            `;

            playerChannelsList.appendChild(item);
          });

          if (callback) {
            try {
              callback();
            } catch (cbErr) {
              console.error('[loadPlayerChannels] Callback error:', cbErr);
            }
          } else {
            const first = playerChannelsList.querySelector('.channel-item');
            if (first) {
              selectChannelFromElement(first, shouldAutoPlay);
            }
          }
        } else {
          playerChannelsList.innerHTML = `<div style="padding:1rem; font-size:0.8125rem; color:var(--muted-foreground);">${t('player_no_channels', 'No channels available for this region.')}</div>`;
          if (currentChName) currentChName.textContent = t('player_no_results', 'No channels found');
          showVideoOverlay(true, t('player_no_channels', 'No channels available for this selection'), false);
        }
      })
      .catch((err) => {
        console.error('[loadPlayerChannels] Failed to load channels:', err);
        playerChannelsList.innerHTML = `<div style="padding:1rem; font-size:0.8125rem; color:var(--error);">${t('player_no_channels', 'Failed to load channels.')}</div>`;
      });
  }


  // Search worldwide channels when local query has no matches
  function searchWorldwide(query) {
    if (!playerChannelsList) return;
    const q = query.trim();
    if (!q) return;

    playerChannelsList.innerHTML = '<div style="padding:1.5rem 1rem; text-align:center; font-size:0.8125rem; color:var(--muted-foreground);">Searching worldwide catalog...</div>';

    fetch(`/api/channels?search=${encodeURIComponent(q)}&limit=100`)
      .then(res => {
        if (!res.ok) throw new Error('Search request failed');
        return res.json();
      })
      .then(data => {
        playerChannelsList.innerHTML = '';
        if (data && data.channels && data.channels.length > 0) {
          const header = document.createElement('div');
          header.style.cssText = 'padding:0.6rem 0.85rem; font-size:0.6875rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--muted-foreground); display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border);';
          header.innerHTML = `
            <span>Worldwide Results (${data.channels.length})</span>
            <button type="button" id="btn-back-to-country" style="background:transparent; border:none; color:var(--primary); cursor:pointer; font-size:0.6875rem; font-weight:600;">&larr; Back to ${escapeHtml(state.currentCountry || 'Region')}</button>
          `;
          playerChannelsList.appendChild(header);

          header.querySelector('#btn-back-to-country')?.addEventListener('click', () => {
            if (playerChannelSearch) playerChannelSearch.value = '';
            loadPlayerChannels(state.currentCountry, state.currentCategory || 'all');
          });

          data.channels.forEach((ch, idx) => {
            const item = document.createElement('div');
            item.className = `channel-item ${idx === 0 ? 'active' : ''}`;
            item.dataset.id = ch.id || '';
            item.dataset.url = ch.streamUrl || ch.url || '';
            item.dataset.name = ch.name || 'Channel';
            item.dataset.logo = ch.logoUrl || ch.logo || '';
            item.dataset.quality = ch.resolution || ch.quality || 'HD';
            item.dataset.country = ch.country || '';
            item.dataset.category = ch.category || (ch.categories && ch.categories[0]) || 'General';

            const name = ch.name || 'Channel';
            const initials = name.substring(0, 2).toUpperCase();
            const logo = ch.logoUrl || ch.logo;
            const logoHtml = logo
              ? `<img src="${logo}" alt="" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span style="display:none;">${initials}</span>`
              : `<span>${initials}</span>`;

            item.innerHTML = `
              <div class="ch-logo-mini">${logoHtml}</div>
              <div class="ch-meta-mini">
                <div class="ch-title-mini">${escapeHtml(name)}</div>
                <div class="ch-sub-mini">${escapeHtml(ch.country || '')} &middot; ${item.dataset.quality} &middot; ${item.dataset.category}</div>
              </div>
            `;
            playerChannelsList.appendChild(item);
          });

          const first = playerChannelsList.querySelector('.channel-item');
          if (first) {
            selectChannelFromElement(first, false); // show overlay; user clicks to play
          }
        } else {
          playerChannelsList.innerHTML = `
            <div style="padding:1.5rem 1rem; text-align:center; font-size:0.8125rem; color:var(--muted-foreground);">
              <div>No worldwide channels found for &ldquo;${escapeHtml(q)}&rdquo;</div>
              <button type="button" id="btn-back-to-country-empty" style="margin-top:0.75rem; padding:0.4rem 0.85rem; font-size:0.75rem; border-radius:4px; background:var(--secondary); color:var(--foreground); border:1px solid var(--border); cursor:pointer;">
                &larr; Back to ${escapeHtml(state.currentCountry || 'Region')}
              </button>
            </div>
          `;
          document.getElementById('btn-back-to-country-empty')?.addEventListener('click', () => {
            if (playerChannelSearch) playerChannelSearch.value = '';
            loadPlayerChannels(state.currentCountry, state.currentCategory || 'all');
          });
        }
      })
      .catch(err => {
        console.error('[searchWorldwide] Error:', err);
        playerChannelsList.innerHTML = '<div style="padding:1rem; font-size:0.8125rem; color:var(--error);">Search request failed.</div>';
      });
  }

  // --- MODALS & DETAILS ---
  function setupModals() {
    // Country Details
    document.addEventListener('click', (e) => {
      const detailsBtn = e.target.closest('.btn-view-details');
      if (detailsBtn) {
        const code = detailsBtn.dataset.code;
        const name = detailsBtn.dataset.name;
        const flag = detailsBtn.dataset.flag;

        const flagCode = code.toUpperCase() === 'UK' ? 'gb' : code.toLowerCase();
        const flagImg = document.getElementById('modal-country-flag-img');
        if (flagImg) {
          flagImg.src = `https://flagcdn.com/w80/${flagCode}.png`;
          flagImg.style.display = 'block';
        }
        if (modalCountryFlag) {
          modalCountryFlag.textContent = flag || code;
          modalCountryFlag.style.display = 'none';
        }
        if (modalCountryTitle) modalCountryTitle.textContent = `${name} (${code})`;

        const count = detailsBtn.dataset.count;
        const modalCountEl = document.getElementById('modal-country-channel-count');
        if (modalCountEl) {
          modalCountEl.textContent = `${parseInt(count || '0', 10).toLocaleString()} ${t('modal_channels_suffix', 'live channels available to stream.')}`;
        }

        if (btnModalWatchCountry) {
          btnModalWatchCountry.onclick = () => {
            closeAllModals();
            switchView('player', true);
            if (playerCountrySelect) {
              playerCountrySelect.value = code;
              state.currentCountry = code;
              state.currentCategory = 'all';
              updatePlayerCountryUI(code);
              loadPlayerChannels(code, 'all', false); // user clicks to play
            }
          };
        }

        if (countryModal) countryModal.classList.add('active');
      }
    });

    if (btnCloseCountryModal && countryModal) {
      btnCloseCountryModal.addEventListener('click', () => {
        countryModal.classList.remove('active');
      });
    }

    // Generic copy buttons in modals
    document.querySelectorAll('.btn-copy-field').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
            showToast(t('toast_copied', 'URL copied to clipboard'));
          });
        }
      });
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
      if (countryModal && e.target === countryModal) countryModal.classList.remove('active');
      
    });

    // Close on ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });
  }

  function closeAllModals() {
    if (countryModal) countryModal.classList.remove('active');
    
  }

  // --- SEARCH & FILTER CONTROLLERS ---
  function setupSearchFilters() {
    // Filter Countries Grid in "All Countries" View
    if (countriesSearchInput) {
      countriesSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.country-grid-item');
        cards.forEach(card => {
          const name = card.dataset.name || '';
          const code = (card.dataset.code || '').toLowerCase();
          if (name.includes(query) || code.includes(query)) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    }

    // Filter Channels in Directory View
    if (channelsDirSearch) {
      const chDirCountrySelect = document.getElementById('channels-dir-country');
      const chDirCategorySelect = document.getElementById('channels-dir-category');
      const chDirCountEl = document.getElementById('ch-dir-count');
      const chDirEmptyEl = document.getElementById('channels-dir-empty');
      const resetChFiltersBtn = document.getElementById('btn-reset-ch-filters');

      function applyChannelDirFilters() {
        const query = channelsDirSearch.value.toLowerCase().trim();
        const country = chDirCountrySelect ? chDirCountrySelect.value.toLowerCase() : '';
        const category = chDirCategorySelect ? chDirCategorySelect.value.toLowerCase() : '';
        const cards = document.querySelectorAll('#channels-directory-grid .channel-dir-card');
        let visible = 0;
        cards.forEach(card => {
          const name = (card.dataset.name || '').toLowerCase();
          const cardCategory = (card.dataset.category || '').toLowerCase();
          const cardCountry = (card.dataset.country || '').toLowerCase();
          const matchesQuery = !query || name.includes(query) || cardCategory.includes(query);
          const matchesCountry = !country || cardCountry === country;
          const matchesCategory = !category || cardCategory.includes(category);
          const show = matchesQuery && matchesCountry && matchesCategory;
          card.style.display = show ? '' : 'none';
          if (show) visible++;
        });
        if (chDirCountEl) {
          chDirCountEl.textContent = visible + ' channel' + (visible !== 1 ? 's' : '');
        }
        if (chDirEmptyEl) {
          chDirEmptyEl.style.display = visible === 0 ? 'flex' : 'none';
        }
      }

      channelsDirSearch.addEventListener('input', applyChannelDirFilters);
      if (chDirCountrySelect) chDirCountrySelect.addEventListener('change', applyChannelDirFilters);
      if (chDirCategorySelect) chDirCategorySelect.addEventListener('change', applyChannelDirFilters);

      if (resetChFiltersBtn) {
        resetChFiltersBtn.addEventListener('click', () => {
          channelsDirSearch.value = '';
          if (chDirCountrySelect) chDirCountrySelect.value = '';
          if (chDirCategorySelect) chDirCategorySelect.value = '';
          applyChannelDirFilters();
          channelsDirSearch.focus();
        });
      }
    }
  }

  // --- TOAST HELPER ---
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // Boot on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
