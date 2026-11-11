/**
 * LiveTV - Internationalization (i18n) Engine
 * Supported languages: en (English), bn (বাংলা), es (Español), de (Deutsch), fr (Français), hi (हिन्दी), ar (العربية)
 */
(function (root) {
  'use strict';

  var translations = {
    en: {
      lang_name: 'English',
      lang_code: 'EN',
      lang_flag: '🇬🇧',
      dir: 'ltr',

      // Banner
      banner_text: 'LiveTV — Worldwide Live TV Streaming Platform',

      // Navigation
      nav_overview: 'Overview',
      nav_countries: 'Countries',
      nav_player: 'TV Player',
      nav_channels: 'Channels',
      nav_quick_player: 'Launch TV Player',

      // Hero
      hero_kicker: 'Global Live TV Streaming',
      hero_title: 'Watch Live TV From Across The Globe',
      hero_subhead: 'Stream over 20,500+ live television channels directly in your browser across 250 countries and territories. Filter by genre, search instantly, and watch live broadcasts with high-performance HLS streaming.',
      btn_launch_player: 'Launch TV Player',
      btn_explore_countries: 'Explore Countries',

      // Stats
      stat_live_channels: 'Live Channels',
      stat_countries_covered: 'Countries Covered',
      stat_tv_genres: 'TV Genres',

      // Overview
      overview_browse_title: 'Browse by Country',
      overview_browse_desc: 'Pick a country and jump directly into its live TV channels inside the TV Player.',
      btn_show_all_countries: 'Show all countries →',
      channels_available: 'channels available',
      btn_watch_live_tv: 'Watch Live TV',
      btn_details: 'Details',
      callout_text: 'Over 20,500+ live channels across 250 countries and territories — all free, all streaming directly in your browser. No app, no subscription, no downloads required.',
      btn_start_watching: 'Start Watching Now →',

      // Countries
      countries_title: 'All countries',
      countries_subhead: 'regions — click any country to stream its live channels.',
      countries_search_placeholder: 'Search countries by name or ISO code (e.g., Germany, US, Brazil)...',

      // TV Player
      player_country_label: 'Country Region',
      player_categories_label: 'Categories',
      player_search_placeholder: 'Search channels by name, category, quality...',
      player_now_playing_heading: 'Now Playing · Live Broadcast Schedule',
      player_status_connecting: 'Connecting to live feed...',
      player_no_channels: 'No channels available for this region.',
      player_no_results: 'No channels found matching your search.',
      player_no_schedule: 'No broadcast schedule available for this channel.',
      player_next_up: 'Next Up',
      player_btn_back_country: 'Back to {country}',
      player_btn_search_worldwide: 'Search all countries for "{query}"',
      badge_live: 'LIVE',

      // Channels Directory
      channels_title: 'Channels directory',
      channels_subhead: 'Explore live channels filtered by country and genre.',
      channels_search_placeholder: 'Search channels by name, network, or callsign...',
      btn_play_in_tv: 'Play in TV',

      // Modals
      modal_details_title: 'Country Details',
      modal_channels_suffix: 'live channels available to stream.',
      modal_btn_watch: 'Watch Live TV →',
      toast_copied: 'Copied to clipboard',

      // Footer
      footer_desc: 'Free, open-source live TV streaming platform covering 20,550+ channels across 250 countries and territories.',
      footer_col_resources: 'Resources',
      footer_col_project: 'Project',
      footer_api_stats: 'API Stats',
      footer_live_stats: 'Live Stats',
      footer_copyright: 'Worldwide Live TV Streaming Platform',

      // Categories
      cat_all: 'All',
      cat_news: 'News',
      cat_sports: 'Sports',
      cat_entertainment: 'Entertainment',
      cat_movies: 'Movies',
      cat_kids: 'Kids',
      cat_music: 'Music',
      cat_documentary: 'Documentary',
      cat_general: 'General',
      cat_comedy: 'Comedy',
      cat_education: 'Education',
      cat_lifestyle: 'Lifestyle',
      cat_religious: 'Religious',
      cat_science: 'Science',
      cat_series: 'Series'
    },

    bn: {
      lang_name: 'বাংলা',
      lang_code: 'BN',
      lang_flag: '🇧🇩',
      dir: 'ltr',

      // Banner
      banner_text: 'LiveTV — বিশ্বব্যাপী সরাসরি লাইভ টিভি স্ট্রিমিং প্ল্যাটফর্ম',

      // Navigation
      nav_overview: 'ওভারভিউ',
      nav_countries: 'দেশসমূহ',
      nav_player: 'টিভি প্লেয়ার',
      nav_channels: 'চ্যানেলসমূহ',
      nav_quick_player: 'টিভি প্লেয়ার চালু করুন',

      // Hero
      hero_kicker: 'গ্লোবাল লাইভ টিভি স্ট্রিমিং',
      hero_title: 'সারা বিশ্বের লাইভ টিভি উপভোগ করুন',
      hero_subhead: 'আপনার ব্রাউজারেই সরাসরি ২৫০টি দেশ ও অঞ্চলের ২০,৫০০+ লাইভ টেলিভিশন চ্যানেল দেখুন। বিভাগ অনুসারে খুঁজুন এবং উচ্চগতির লাইভ স্ট্রিমিং সহ সরাসরি সম্প্রচার উপভোগ করুন।',
      btn_launch_player: 'টিভি প্লেয়ার চালু করুন',
      btn_explore_countries: 'দেশসমূহ দেখুন',

      // Stats
      stat_live_channels: 'লাইভ চ্যানেল',
      stat_countries_covered: 'অন্তর্ভুক্ত দেশ',
      stat_tv_genres: 'টিভি বিভাগ',

      // Overview
      overview_browse_title: 'দেশ অনুসারে দেখুন',
      overview_browse_desc: 'একটি দেশ নির্বাচন করুন এবং সরাসরি টিভি প্লেয়ারে তার লাইভ চ্যানেলগুলো উপভোগ করুন।',
      btn_show_all_countries: 'সকল দেশ দেখুন →',
      channels_available: 'টি চ্যানেল উপলব্ধ',
      btn_watch_live_tv: 'লাইভ টিভি দেখুন',
      btn_details: 'বিবরণ',
      callout_text: '২৫০টি দেশ ও অঞ্চলের ২০,৫০০+ লাইভ চ্যানেল — সম্পূর্ণ বিনামূল্যে, সরাসরি ব্রাউজারে। কোনো অ্যাপ বা সাবস্ক্রিপশন প্রয়োজন নেই।',
      btn_start_watching: 'এখনই দেখা শুরু করুন →',

      // Countries
      countries_title: 'সকল দেশ',
      countries_subhead: 'অঞ্চল — যেকোনো দেশে ক্লিক করে তার লাইভ চ্যানেলগুলো দেখুন।',
      countries_search_placeholder: 'নাম বা কোড দিয়ে দেশ খুঁজুন (যেমন: Bangladesh, US, Germany)...',

      // TV Player
      player_country_label: 'দেশ / অঞ্চল',
      player_categories_label: 'ক্যাটাগরি',
      player_search_placeholder: 'চ্যানেলের নাম, ক্যাটাগরি, কোয়ালিটি খুঁজুন...',
      player_now_playing_heading: 'এখন সম্প্রচারিত হচ্ছে · সরাসরি সম্প্রচার সময়সূচী',
      player_status_connecting: 'লাইভ সংযোগ স্থাপন করা হচ্ছে...',
      player_no_channels: 'এই অঞ্চলের জন্য কোনো চ্যানেল পাওয়া যায়নি।',
      player_no_results: 'আপনার অনুসন্ধানের সাথে মিল রেখে কোনো চ্যানেল পাওয়া যায়নি।',
      player_no_schedule: 'এই চ্যানেলের জন্য কোনো সময়সূচী উপলব্ধ নেই।',
      player_next_up: 'পরবর্তী অনুষ্ঠান',
      player_btn_back_country: '{country}-এ ফিরে যান',
      player_btn_search_worldwide: 'সকল দেশে খুঁজুন: "{query}"',
      badge_live: 'লাইভ',

      // Channels Directory
      channels_title: 'চ্যানেল ডিরেক্টরি',
      channels_subhead: 'দেশ এবং ধরন অনুযায়ী ফিল্টার করে লাইভ চ্যানেল খুঁজুন।',
      channels_search_placeholder: 'নাম বা কলসাইন দিয়ে চ্যানেল খুঁজুন...',
      btn_play_in_tv: 'প্লেয়ারে দেখুন',

      // Modals
      modal_details_title: 'দেশের বিবরণ',
      modal_channels_suffix: 'টি লাইভ চ্যানেল স্ট্রিমিংয়ের জন্য উপলব্ধ।',
      modal_btn_watch: 'লাইভ টিভি দেখুন →',
      toast_copied: 'ক্লিপবোর্ডে কপি করা হয়েছে',

      // Footer
      footer_desc: '২৫০টি দেশ ও অঞ্চলের ২০,৫৫০+ চ্যানেলের জন্য বিনামূল্যে উন্মুক্ত লাইভ টিভি স্ট্রিমিং প্ল্যাটফর্ম।',
      footer_col_resources: 'রিসোর্স',
      footer_col_project: 'প্রকল্প',
      footer_api_stats: 'এপিআই পরিসংখ্যান',
      footer_live_stats: 'লাইভ তথ্য',
      footer_copyright: 'বিশ্বব্যাপী সরাসরি লাইভ টিভি স্ট্রিমিং প্ল্যাটফর্ম',

      // Categories
      cat_all: 'সকল',
      cat_news: 'সংবাদ',
      cat_sports: 'খেলাধুলা',
      cat_entertainment: 'বিনোদন',
      cat_movies: 'চলচ্চিত্র',
      cat_kids: 'শিশু-কিশোর',
      cat_music: 'সঙ্গীত',
      cat_documentary: 'ডকুমেন্টারি',
      cat_general: 'সাধারণ',
      cat_comedy: 'কমেডি',
      cat_education: 'শিক্ষা',
      cat_lifestyle: 'লাইফস্টাইল',
      cat_religious: 'ধর্মীয়',
      cat_science: 'বিজ্ঞান',
      cat_series: 'সিরিজ'
    },

    es: {
      lang_name: 'Español',
      lang_code: 'ES',
      lang_flag: '🇪🇸',
      dir: 'ltr',

      banner_text: 'LiveTV — Plataforma global de transmisión de TV en vivo',
      nav_overview: 'Inicio',
      nav_countries: 'Países',
      nav_player: 'Reproductor TV',
      nav_channels: 'Canales',
      nav_quick_player: 'Abrir Reproductor',

      hero_kicker: 'Transmisión Global de TV en Vivo',
      hero_title: 'Vea Televisión en Vivo de Todo el Mundo',
      hero_subhead: 'Más de 20,500 canales de televisión en vivo directamente en su navegador en 250 países y territorios. Filtre por género y disfrute de transmisión HLS de alto rendimiento.',
      btn_launch_player: 'Abrir Reproductor',
      btn_explore_countries: 'Explorar Países',

      stat_live_channels: 'Canales en Vivo',
      stat_countries_covered: 'Países Cubiertos',
      stat_tv_genres: 'Géneros de TV',

      overview_browse_title: 'Explorar por País',
      overview_browse_desc: 'Elija un país y comience a ver sus canales de televisión en vivo al instante.',
      btn_show_all_countries: 'Ver todos los países →',
      channels_available: 'canales disponibles',
      btn_watch_live_tv: 'Ver TV en Vivo',
      btn_details: 'Detalles',
      callout_text: 'Más de 20,500 canales en 250 países y territorios — gratis, directo en su navegador. Sin descargas ni registros.',
      btn_start_watching: 'Comenzar a Ver →',

      countries_title: 'Todos los Países',
      countries_subhead: 'regiones — haga clic en cualquier país para ver sus canales.',
      countries_search_placeholder: 'Buscar países por nombre o código ISO...',

      player_country_label: 'País / Región',
      player_categories_label: 'Categorías',
      player_search_placeholder: 'Buscar canales por nombre, género o calidad...',
      player_now_playing_heading: 'Transmitiendo Ahora · Horario en Vivo',
      player_status_connecting: 'Conectando con la transmisión...',
      player_no_channels: 'No hay canales disponibles para esta región.',
      player_no_results: 'No se encontraron canales para su búsqueda.',
      player_no_schedule: 'Sin programación disponible para este canal.',
      player_next_up: 'A continuación',
      player_btn_back_country: 'Volver a {country}',
      player_btn_search_worldwide: 'Buscar en todos los países: "{query}"',
      badge_live: 'EN VIVO',

      channels_title: 'Directorio de Canales',
      channels_subhead: 'Explore canales en vivo filtrados por país y género.',
      channels_search_placeholder: 'Buscar canales por nombre o red...',
      btn_play_in_tv: 'Ver en TV',

      modal_details_title: 'Detalles del País',
      modal_channels_suffix: 'canales en vivo listos para transmitir.',
      modal_btn_watch: 'Ver TV en Vivo →',
      toast_copied: 'Copiado al portapapeles',

      footer_desc: 'Plataforma abierta y gratuita de streaming de televisión con más de 20,550 canales en 250 países y territorios.',
      footer_col_resources: 'Recursos',
      footer_col_project: 'Proyecto',
      footer_api_stats: 'Estadísticas API',
      footer_live_stats: 'Estado en Vivo',
      footer_copyright: 'Plataforma Global de Transmisión de TV en Vivo',

      cat_all: 'Todos',
      cat_news: 'Noticias',
      cat_sports: 'Deportes',
      cat_entertainment: 'Entretenimiento',
      cat_movies: 'Películas',
      cat_kids: 'Infantil',
      cat_music: 'Música',
      cat_documentary: 'Documentales',
      cat_general: 'General',
      cat_comedy: 'Comedia',
      cat_education: 'Educación',
      cat_lifestyle: 'Estilo de vida',
      cat_religious: 'Religión',
      cat_science: 'Ciencia',
      cat_series: 'Series'
    },

    de: {
      lang_name: 'Deutsch',
      lang_code: 'DE',
      lang_flag: '🇩🇪',
      dir: 'ltr',

      banner_text: 'LiveTV — Weltweite Live-TV-Streaming-Plattform',
      nav_overview: 'Übersicht',
      nav_countries: 'Länder',
      nav_player: 'TV-Player',
      nav_channels: 'Kanäle',
      nav_quick_player: 'TV-Player starten',

      hero_kicker: 'Globales Live-TV-Streaming',
      hero_title: 'Live-TV aus aller Welt ansehen',
      hero_subhead: 'Über 20.500 Live-Fernsehsender direkt im Browser aus 250 Ländern und Territorien streamen. Nach Genre filtern, sofort suchen und mit hochleistungsfähigem HLS-Streaming ansehen.',
      btn_launch_player: 'TV-Player starten',
      btn_explore_countries: 'Länder erkunden',

      stat_live_channels: 'Live-Sender',
      stat_countries_covered: 'Länder abgedeckt',
      stat_tv_genres: 'TV-Genres',

      overview_browse_title: 'Nach Ländern durchsuchen',
      overview_browse_desc: 'Wählen Sie ein Land und starten Sie die Live-TV-Sender direkt im TV-Player.',
      btn_show_all_countries: 'Alle Länder anzeigen →',
      channels_available: 'Sender verfügbar',
      btn_watch_live_tv: 'Live-TV ansehen',
      btn_details: 'Details',
      callout_text: 'Über 20.500 Live-Sender aus 250 Ländern und Territorien — kostenlos direkt im Browser. Keine App, kein Abonnement erforderlich.',
      btn_start_watching: 'Jetzt ansehen →',

      countries_title: 'Alle Länder',
      countries_subhead: 'Regionen — Klicken Sie auf ein Land, um die Live-Sender zu starten.',
      countries_search_placeholder: 'Länder nach Namen oder ISO-Code suchen...',

      player_country_label: 'Landesregion',
      player_categories_label: 'Kategorien',
      player_search_placeholder: 'Sender nach Name, Kategorie oder Qualität suchen...',
      player_now_playing_heading: 'Jetzt läuft · Live-Sendeprogramm',
      player_status_connecting: 'Verbindung zum Live-Stream wird hergestellt...',
      player_no_channels: 'Keine Sender für diese Region verfügbar.',
      player_no_results: 'Keine Sender passend zu Ihrer Suche gefunden.',
      player_no_schedule: 'Keine Programmdaten für diesen Sender verfügbar.',
      player_next_up: 'Als Nächstes',
      player_btn_back_country: 'Zurück zu {country}',
      player_btn_search_worldwide: 'Weltweit nach "{query}" suchen',
      badge_live: 'LIVE',

      channels_title: 'Senderverzeichnis',
      channels_subhead: 'Live-Sender gefiltert nach Land und Genre erkunden.',
      channels_search_placeholder: 'Sender nach Namen oder Netzwerk suchen...',
      btn_play_in_tv: 'Im TV abspielen',

      modal_details_title: 'Länderdetails',
      modal_channels_suffix: 'Live-Sender zum Streamen bereit.',
      modal_btn_watch: 'Live-TV ansehen →',
      toast_copied: 'In die Zwischenablage kopiert',

      footer_desc: 'Kostenlose Open-Source-Plattform für Live-TV-Streaming mit über 20.550 Sendern in 250 Ländern und Territorien.',
      footer_col_resources: 'Ressourcen',
      footer_col_project: 'Projekt',
      footer_api_stats: 'API-Statistiken',
      footer_live_stats: 'Live-Status',
      footer_copyright: 'Weltweite Live-TV-Streaming-Plattform',

      cat_all: 'Alle',
      cat_news: 'Nachrichten',
      cat_sports: 'Sport',
      cat_entertainment: 'Unterhaltung',
      cat_movies: 'Filme',
      cat_kids: 'Kinder',
      cat_music: 'Musik',
      cat_documentary: 'Dokumentation',
      cat_general: 'Allgemein',
      cat_comedy: 'Komödie',
      cat_education: 'Bildung',
      cat_lifestyle: 'Lifestyle',
      cat_religious: 'Religion',
      cat_science: 'Wissenschaft',
      cat_series: 'Serien'
    },

    fr: {
      lang_name: 'Français',
      lang_code: 'FR',
      lang_flag: '🇫🇷',
      dir: 'ltr',

      banner_text: 'LiveTV — Plateforme mondiale de diffusion TV en direct',
      nav_overview: 'Aperçu',
      nav_countries: 'Pays',
      nav_player: 'Lecteur TV',
      nav_channels: 'Chaînes',
      nav_quick_player: 'Lancer le Lecteur',

      hero_kicker: 'Streaming TV en Direct Mondial',
      hero_title: 'Regardez la Télévision en Direct du Monde Entier',
      hero_subhead: 'Diffusez plus de 20 500 chaînes de télévision en direct directement dans votre navigateur dans 250 pays et territoires. Filtrez par genre et profitez du streaming HLS haute performance.',
      btn_launch_player: 'Lancer le Lecteur',
      btn_explore_countries: 'Explorer les Pays',

      stat_live_channels: 'Chaînes en Direct',
      stat_countries_covered: 'Pays Couverts',
      stat_tv_genres: 'Genres TV',

      overview_browse_title: 'Parcourir par Pays',
      overview_browse_desc: 'Choisissez un pays et accédez directement à ses chaînes dans le lecteur TV.',
      btn_show_all_countries: 'Afficher tous les pays →',
      channels_available: 'chaînes disponibles',
      btn_watch_live_tv: 'Regarder en Direct',
      btn_details: 'Détails',
      callout_text: 'Plus de 20 500 chaînes dans 250 pays et territoires — gratuit, directement dans votre navigateur. Sans application ni abonnement.',
      btn_start_watching: 'Commencer à Regarder →',

      countries_title: 'Tous les Pays',
      countries_subhead: 'régions — cliquez sur un pays pour diffuser ses chaînes en direct.',
      countries_search_placeholder: 'Rechercher des pays par nom ou code ISO...',

      player_country_label: 'Région / Pays',
      player_categories_label: 'Catégories',
      player_search_placeholder: 'Rechercher des chaînes par nom, genre, qualité...',
      player_now_playing_heading: 'En cours · Programme de diffusion en direct',
      player_status_connecting: 'Connexion au flux en direct...',
      player_no_channels: 'Aucune chaîne disponible pour cette région.',
      player_no_results: 'Aucune chaîne ne correspond à votre recherche.',
      player_no_schedule: 'Aucune grille horaire disponible pour cette chaîne.',
      player_next_up: 'À suivre',
      player_btn_back_country: 'Retour à {country}',
      player_btn_search_worldwide: 'Rechercher dans le monde entier: "{query}"',
      badge_live: 'EN DIRECT',

      channels_title: 'Répertoire des Chaînes',
      channels_subhead: 'Explorez les chaînes en direct par pays et par genre.',
      channels_search_placeholder: 'Rechercher par nom de chaîne ou réseau...',
      btn_play_in_tv: 'Lire dans le Lecteur',

      modal_details_title: 'Détails du Pays',
      modal_channels_suffix: 'chaînes en direct prêtes à diffuser.',
      modal_btn_watch: 'Regarder en Direct →',
      toast_copied: 'Copié dans le presse-papier',

      footer_desc: 'Plateforme open-source gratuite de streaming TV couvrant plus de 20 550 chaînes dans 250 pays et territoires.',
      footer_col_resources: 'Ressources',
      footer_col_project: 'Projet',
      footer_api_stats: 'Statistiques API',
      footer_live_stats: 'État en Direct',
      footer_copyright: 'Plateforme Mondiale de Diffusion TV en Direct',

      cat_all: 'Tous',
      cat_news: 'Actualités',
      cat_sports: 'Sports',
      cat_entertainment: 'Divertissement',
      cat_movies: 'Films',
      cat_kids: 'Enfants',
      cat_music: 'Musique',
      cat_documentary: 'Documentaires',
      cat_general: 'Général',
      cat_comedy: 'Comédie',
      cat_education: 'Éducation',
      cat_lifestyle: 'Style de vie',
      cat_religious: 'Religion',
      cat_science: 'Science',
      cat_series: 'Séries'
    },

    hi: {
      lang_name: 'हिन्दी',
      lang_code: 'HI',
      lang_flag: '🇮🇳',
      dir: 'ltr',

      banner_text: 'LiveTV — दुनिया भर में लाइव टीवी स्ट्रीमिंग प्लेटफॉर्म',
      nav_overview: 'होम',
      nav_countries: 'देश',
      nav_player: 'टीवी प्लेयर',
      nav_channels: 'चैनल्स',
      nav_quick_player: 'टीवी प्लेयर शुरू करें',

      hero_kicker: 'वैश्विक लाइव टीवी स्ट्रीमिंग',
      hero_title: 'दुनिया भर से लाइव टीवी देखें',
      hero_subhead: '250 देशों और क्षेत्रों से 20,500 से अधिक लाइव टेलीविजन चैनल सीधे अपने ब्राउज़र में देखें। शैली के अनुसार खोजें और उच्च-प्रदर्शन वाले HLS स्ट्रीमिंग का आनंद लें।',
      btn_launch_player: 'टीवी प्लेयर शुरू करें',
      btn_explore_countries: 'देश देखें',

      stat_live_channels: 'लाइव चैनल',
      stat_countries_covered: 'शामिल देश',
      stat_tv_genres: 'टीवी श्रेणियां',

      overview_browse_title: 'देश अनुसार देखें',
      overview_browse_desc: 'एक देश चुनें और टीवी प्लेयर में सीधे उसके लाइव चैनलों का आनंद लें।',
      btn_show_all_countries: 'सभी देश देखें →',
      channels_available: 'चैनल उपलब्ध',
      btn_watch_live_tv: 'लाइव टीवी देखें',
      btn_details: 'विवरण',
      callout_text: '250 देशों और क्षेत्रों के 20,500+ लाइव चैनल — बिल्कुल मुफ़्त, सीधे ब्राउज़र में। किसी ऐप या सब्सक्रिप्शन की आवश्यकता नहीं।',
      btn_start_watching: 'अभी देखना शुरू करें →',

      countries_title: 'सभी देश',
      countries_subhead: 'क्षेत्र — लाइव चैनल देखने के लिए किसी भी देश पर क्लिक करें।',
      countries_search_placeholder: 'नाम या कोड से देश खोजें...',

      player_country_label: 'देश / क्षेत्र',
      player_categories_label: 'श्रेणियां',
      player_search_placeholder: 'चैनल का नाम, श्रेणी या गुणवत्ता खोजें...',
      player_now_playing_heading: 'अभी चल रहा है · सीधा प्रसारण समय-सारिणी',
      player_status_connecting: 'लाइव फीड से जुड़ रहे हैं...',
      player_no_channels: 'इस क्षेत्र के लिए कोई चैनल उपलब्ध नहीं है।',
      player_no_results: 'आपकी खोज से मेल खाता कोई चैनल नहीं मिला।',
      player_no_schedule: 'इस चैनल के लिए कोई समय सारिणी उपलब्ध नहीं है।',
      player_next_up: 'आगे आने वाला',
      player_btn_back_country: '{country} पर वापस जाएं',
      player_btn_search_worldwide: 'सभी देशों में खोजें: "{query}"',
      badge_live: 'लाइव',

      channels_title: 'चैनल निर्देशिका',
      channels_subhead: 'देश और श्रेणी के अनुसार लाइव चैनल खोजें।',
      channels_search_placeholder: 'नाम से चैनल खोजें...',
      btn_play_in_tv: 'प्लेयर में चलाएं',

      modal_details_title: 'देश का विवरण',
      modal_channels_suffix: 'लाइव चैनल देखने के लिए उपलब्ध हैं।',
      modal_btn_watch: 'लाइव टीवी देखें →',
      toast_copied: 'क्लिपबोर्ड पर कॉपी किया गया',

      footer_desc: '250 देशों और क्षेत्रों के 20,550+ चैनलों के लिए मुफ़्त ओपन-सोर्स लाइव टीवी स्ट्रीमिंग प्लेटफॉर्म।',
      footer_col_resources: 'संसाधन',
      footer_col_project: 'प्रोजेक्ट',
      footer_api_stats: 'एपीआई आंकड़े',
      footer_live_stats: 'लाइव स्थिति',
      footer_copyright: 'विश्वव्यापी लाइव टीवी स्ट्रीमिंग प्लेटफॉर्म',

      cat_all: 'सभी',
      cat_news: 'समाचार',
      cat_sports: 'खेल',
      cat_entertainment: 'मनोरंजन',
      cat_movies: 'फ़िल्में',
      cat_kids: 'बच्चे',
      cat_music: 'संगीत',
      cat_documentary: 'वृत्तचित्र',
      cat_general: 'सामान्य',
      cat_comedy: 'कॉमेडी',
      cat_education: 'शिक्षा',
      cat_lifestyle: 'लाइफस्टाइल',
      cat_religious: 'धार्मिक',
      cat_science: 'विज्ञान',
      cat_series: 'सीरीज'
    },

    ar: {
      lang_name: 'العربية',
      lang_code: 'AR',
      lang_flag: '🇸🇦',
      dir: 'rtl',

      banner_text: 'LiveTV — منصة عالمية للبث التلفزيوني المباشر',
      nav_overview: 'الرئيسية',
      nav_countries: 'الدول',
      nav_player: 'مشغل التلفزيون',
      nav_channels: 'القنوات',
      nav_quick_player: 'تشغيل المشغل',

      hero_kicker: 'بث تلفزيوني مباشر عالمي',
      hero_title: 'شاهد البث التلفزيوني المباشر من جميع أنحاء العالم',
      hero_subhead: 'شاهد أكثر من 20,500 قناة تلفزيونية مباشرة في متصفحك عبر 250 دولة وإقليم. تصفح حسب الفئة وشاهد مع بث HLS عالي الأداء.',
      btn_launch_player: 'تشغيل مشغل التلفزيون',
      btn_explore_countries: 'استكشف الدول',

      stat_live_channels: 'قناة مباشرة',
      stat_countries_covered: 'دولة مدعومة',
      stat_tv_genres: 'تصنيفات التلفزيون',

      overview_browse_title: 'تصفح حسب الدولة',
      overview_browse_desc: 'اختر دولة وانتقل مباشرة إلى قنواتها المباشرة داخل مشغل التلفزيون.',
      btn_show_all_countries: 'عرض جميع الدول ←',
      channels_available: 'قناة متوفرة',
      btn_watch_live_tv: 'شاهد البث المباشر',
      btn_details: 'التفاصيل',
      callout_text: 'أكثر من 20,500 قناة عبر 250 دولة وإقليم — مجانًا بالكامل ومباشرة في المتصفح دون الحاجة لتطبيق أو اشتراك.',
      btn_start_watching: 'ابدأ المشاهدة الآن ←',

      countries_title: 'جميع الدول',
      countries_subhead: 'منطقة — انقر فوق أي دولة لتشغيل قنواتها المباشرة.',
      countries_search_placeholder: 'ابحث عن الدول بالاسم أو الرمز...',

      player_country_label: 'الدولة / المنطقة',
      player_categories_label: 'التصنيفات',
      player_search_placeholder: 'ابحث عن القنوات بالاسم أو الفئة أو الجودة...',
      player_now_playing_heading: 'يُعرض الآن · جدول البث المباشر',
      player_status_connecting: 'جارٍ الاتصال بالبث المباشر...',
      player_no_channels: 'لا توجد قنوات متاحة لهذه المنطقة.',
      player_no_results: 'لم يتم العثور على قنوات تطابق بحثك.',
      player_no_schedule: 'لا يوجد جدول بث متاح لهذه القناة.',
      player_next_up: 'التالي',
      player_btn_back_country: 'العودة إلى {country}',
      player_btn_search_worldwide: 'البحث في جميع الدول عن: "{query}"',
      badge_live: 'مباشر',

      channels_title: 'دليل القنوات',
      channels_subhead: 'استكشف القنوات المباشرة حسب الدولة والتصنيف.',
      channels_search_placeholder: 'ابحث عن القنوات بالاسم أو الشبكة...',
      btn_play_in_tv: 'تشغيل في التلفزيون',

      modal_details_title: 'تفاصيل الدولة',
      modal_channels_suffix: 'قناة مباشرة جاهزة للمشاهدة.',
      modal_btn_watch: 'مشاهدة البث المباشر ←',
      toast_copied: 'تم النسخ إلى الحافظة',

      footer_desc: 'منصة مجانية ومفتوحة المصدر لمشاهدة البث التلفزيوني المباشر تغطي أكثر من 20,550 قناة في 250 دولة وإقليم.',
      footer_col_resources: 'المصادر',
      footer_col_project: 'المشروع',
      footer_api_stats: 'إحصائيات API',
      footer_live_stats: 'الحالة المباشرة',
      footer_copyright: 'منصة عالمية للبث التلفزيوني المباشر',

      cat_all: 'الكل',
      cat_news: 'أخبار',
      cat_sports: 'رياضة',
      cat_entertainment: 'ترفيه',
      cat_movies: 'أفلام',
      cat_kids: 'أطفال',
      cat_music: 'موسيقى',
      cat_documentary: 'وثائقي',
      cat_general: 'عام',
      cat_comedy: 'كوميديا',
      cat_education: 'تعليم',
      cat_lifestyle: 'نمط حياة',
      cat_religious: 'ديني',
      cat_science: 'علوم',
      cat_series: 'مسلسلات'
    }
  };

  // Supported languages list
  var supportedLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' }
  ];

  var defaultLang = 'en';

  function getTranslation(key, lang, fallback) {
    var l = lang || defaultLang;
    if (translations[l] && translations[l][key] !== undefined) {
      return translations[l][key];
    }
    if (translations[defaultLang] && translations[defaultLang][key] !== undefined) {
      return translations[defaultLang][key];
    }
    return fallback !== undefined ? fallback : key;
  }

  // Export to global scope
  root.LiveTV_i18n = {
    translations: translations,
    supportedLanguages: supportedLanguages,
    defaultLang: defaultLang,
    t: getTranslation
  };

})(typeof window !== 'undefined' ? window : global);

