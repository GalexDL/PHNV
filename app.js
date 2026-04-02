
// ===============================
// Configuration
// ===============================

// DOM selector shortcut
const $ = id => document.getElementById(id);

// Supported languages and games
const LANGS = ['en','ja','fr','de','es','es-la','it','ko','tc','sc'];
const GAMES = ['HM','CHP','LZA','SC','VI','LA','BD','SP','SW','SH','LGP','LGE','GO'];
const GAME_NAMES = { HM: 'Home', CHP: 'Champions' };
const ITEMS_PER_PAGE = 100;
const GAME_IMG_BASE = 'https://news.pokemon-home.com/resources/image/title_';
const TWO_WEEKS = 1209600000; // 14 days in milliseconds

// Internationalization dictionary (I should change it to only change the articles and have langs as thier own seperate ui thing)
const I18N = {
  en: { title:'Pokémon Home News', search:'Search:', searchPlaceholder:'search article title', language:'Language:', tags:'Tags:', all:'All', important:'Important:', from:'From:', to:'To:', clear:'Clear', download:'Download filtered JSON', darkMode:'Dark Mode', lightMode:'Light Mode', games:'Games:', loadMore:'Load More', articles:'Articles', showing:'Showing', newBadge:'NEW', start:'Start:', end:'End:', published:'Published:', tweetAll:'Tweet All' },
  ja: { title:'Pokémon Home', search:'検索:', searchPlaceholder:'記事タイトルを検索', language:'言語:', tags:'タグ:', all:'すべて', important:'重要:', from:'開始:', to:'終了:', clear:'クリア', download:'JSONをダウンロード', darkMode:'ダークモード', lightMode:'ライトモード', games:'ゲーム:', loadMore:'もっと見る', articles:'件の記事', showing:'表示中', newBadge:'NEW', start:'開始:', end:'終了:', published:'公開日:', tweetAll:'すべてツイート' },
  fr: { title:'Pokémon Home', search:'Recherche:', searchPlaceholder:'rechercher un titre', language:'Langue:', tags:'Tags:', all:'Tous', important:'Important:', from:'Du:', to:'Au:', clear:'Effacer', download:'Télécharger JSON filtré', darkMode:'Mode sombre', lightMode:'Mode clair', games:'Jeux:', loadMore:'Charger plus', articles:'Articles', showing:'Affichage', newBadge:'NOUVEAU', start:'Début:', end:'Fin:', published:'Publié:', tweetAll:'Tweeter tout' },
  de: { title:'Pokémon Home', search:'Suche:', searchPlaceholder:'Artikeltitel suchen', language:'Sprache:', tags:'Tags:', all:'Alle', important:'Wichtig:', from:'Von:', to:'Bis:', clear:'Löschen', download:'Gefiltertes JSON herunterladen', darkMode:'Dunkelmodus', lightMode:'Hellmodus', games:'Spiele:', loadMore:'Mehr laden', articles:'Artikel', showing:'Anzeige', newBadge:'NEU', start:'Start:', end:'Ende:', published:'Veröffentlicht:', tweetAll:'Alle twittern' },
  es: { title:'Pokémon Home', search:'Buscar:', searchPlaceholder:'buscar título del artículo', language:'Idioma:', tags:'Etiquetas:', all:'Todos', important:'Importante:', from:'Desde:', to:'Hasta:', clear:'Limpiar', download:'Descargar JSON filtrado', darkMode:'Modo oscuro', lightMode:'Modo claro', games:'Juegos:', loadMore:'Cargar más', articles:'Artículos', showing:'Mostrando', newBadge:'NUEVO', start:'Inicio:', end:'Fin:', published:'Publicado:', tweetAll:'Tuitear todo' },
  it: { title:'Pokémon Home', search:'Cerca:', searchPlaceholder:'cerca titolo articolo', language:'Lingua:', tags:'Tag:', all:'Tutti', important:'Importante:', from:'Da:', to:'A:', clear:'Cancella', download:'Scarica JSON filtrato', darkMode:'Modalità scura', lightMode:'Modalità chiara', games:'Giochi:', loadMore:'Carica altri', articles:'Articoli', showing:'Visualizzazione', newBadge:'NUOVO', start:'Inizio:', end:'Fine:', published:'Pubblicato:', tweetAll:'Twitta tutto' },
  ko: { title:'Pokémon Home', search:'검색:', searchPlaceholder:'기사 제목 검색', language:'언어:', tags:'태그:', all:'전체', important:'중요:', from:'시작:', to:'종료:', clear:'초기화', download:'필터된 JSON 다운로드', darkMode:'다크 모드', lightMode:'라이트 모드', games:'게임:', loadMore:'더 보기', articles:'개 기사', showing:'표시 중', newBadge:'NEW', start:'시작:', end:'종료:', published:'게시일:', tweetAll:'모든 트윗' },
  tc: { title:'Pokémon Home', search:'搜尋:', searchPlaceholder:'搜尋文章標題', language:'語言:', tags:'標籤:', all:'全部', important:'重要:', from:'從:', to:'到:', clear:'清除', download:'下載篩選 JSON', darkMode:'深色模式', lightMode:'淺色模式', games:'遊戲:', loadMore:'載入更多', articles:'篇文章', showing:'顯示', newBadge:'NEW', start:'開始:', end:'結束:', published:'發布:', tweetAll:'全部推文' },
  sc: { title:'Pokémon Home', search:'搜索:', searchPlaceholder:'搜索文章标题', language:'语言:', tags:'标签:', all:'全部', important:'重要:', from:'从:', to:'到:', clear:'清除', download:'下载筛选 JSON', darkMode:'深色模式', lightMode:'浅色模式', games:'游戏:', loadMore:'加载更多', articles:'篇文章', showing:'显示', newBadge:'NEW', start:'开始:', end:'结束:', published:'发布时间:', tweetAll:'全部推文' },
};


// ===============================
// Variables
// ===============================

let data = [];
let filteredData = [];
let currentPage = 0;
let devMode = false;
let langDataCache = {};

// ===============================
// Language Translation Functions
// ===============================

// This function looks up a translation for a given key, using the language the user has selected.
function t(key) {
  const lang = $('lang')?.value || 'en';
  return I18N[lang]?.[key] || I18N.en[key] || key;
}

// This function updates all text on the page to the selected language, using special data attributes.
function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(node => {
    const key = node.dataset.i18n;
    if (node.id === 'darkmode-toggle') {
      const isDark = document.body.classList.contains('dark');
      node.textContent = isDark ? t('lightMode') : t('darkMode');
    } else {
      node.textContent = t(key);
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  document.title = t('title');
}

// ===============================
// Functions for Creating HTML Elements
// ===============================

// This function makes it easier to create HTML elements in JavaScript, set their properties, and add child elements.
function el(tag, props, children) {
  const e = document.createElement(tag);
  if (props) Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(e.dataset, v);
    else e[k] = v;
  });
  if (children) children.forEach(c => c && e.appendChild(c));
  return e;
}

// ===============================
// Formatting and Utility Functions
// ===============================

// This function takes a timestamp (number of seconds) and turns it into a readable date and time string.
const formatTs = v => {
  if (v == null || v === '') return '';
  const n = Number(v);
  return isFinite(n) ? new Date(n * 1000).toLocaleString() : String(v);
};

// This function checks if a date is less than two weeks old from today.
const isNew = date => date && (Date.now() - new Date(date).getTime()) < TWO_WEEKS;

// This function returns a small image (icon) for a game, given its code.
const gameImg = code =>
  `<img src="${GAME_IMG_BASE}${code}.png" alt="${code}" style="height:20px;margin-right:6px;vertical-align:middle" loading="lazy" decoding="async"/>`;

// This function takes a list of game codes and returns their images as HTML.
const formatGames = g =>
  !g ? '' : Array.isArray(g) ? g.map(gameImg).join('') : gameImg(String(g));

// ===============================
// Tweeting Functions
// ===============================

// This function helps you quickly open tweet windows for all languages for a specific news article.
function tweetAllLangs(article) {
  const matches = article.url?.match(/\/page\/(\d+)\.html/);
  const articleId = matches ? matches[1] : null;
  if (!articleId) return alert('Could not extract article ID');
  
  async function genTweets() {
    for (let idx = 0; idx < LANGS.length; idx++) {
      const lang = LANGS[idx];
      try {
        let langData = langDataCache[lang];
        if (!langData) {
          const res = await fetch(`./Data/News/news_${lang}.json`);
          if (!res.ok) continue;
          const json = await res.json();
          const raw = Array.isArray(json) ? json : json.data || [];
          const base = `https://news.pokemon-home.com/${lang}/`;
          langData = raw.map(item => ({
            ...item,
            url: item.url || (item.link ? base + item.link : ''),
            banner: item.banner ? (item.banner.startsWith('http') ? item.banner : base + item.banner) : '',
            date: item.date || (item.stAt ? new Date(Number(item.stAt) * 1000).toISOString().slice(0, 10) : ''),
          }));
          langDataCache[lang] = langData;
        }
        
        const found = langData.find(a => a.id === articleId);
        if (!found) continue;
        
        let tweetText = (found.title || '');
        if (found.stAt) tweetText += '\n\nPost Date: ' + formatTs(found.stAt);
        if (found.endAt) tweetText += '\nPost Expires: ' + formatTs(found.endAt);
        if (found.linkRom) {
          const codes = Array.isArray(found.linkRom) ? found.linkRom : [found.linkRom];
          const gameNames = codes.map(c => GAME_NAMES[c] || c).join(', ');
          tweetText += '\nGame: ' + gameNames;
        }
        tweetText += '\n\n' + (found.url || '');
        const params = new URLSearchParams({ text: tweetText });
        const url = 'https://twitter.com/intent/tweet?' + params.toString();
        
        setTimeout(() => window.open(url, '_blank'), idx * 300);
      } catch (e) {
        console.error(`Failed to load ${lang}:`, e);
      }
    }
  }
  genTweets();
}

// ===============================
// Data Loading Functions
// ===============================

// This function loads the news data for the language the user selected. It fetches the news from a file, processes it, and updates the page.
async function load() {
  try {
    const lang = $('lang')?.value || 'en';
    const res = await fetch(`./Data/News/news_${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const raw = Array.isArray(json) ? json : json.data || [];
    const base = `https://news.pokemon-home.com/${lang}/`;
    data = raw.map(item => ({
      ...item,
      url: item.url || (item.link ? base + item.link : ''),
      banner: item.banner ? (item.banner.startsWith('http') ? item.banner : base + item.banner) : '',
      date: item.date || (item.stAt ? new Date(Number(item.stAt) * 1000).toISOString().slice(0, 10) : ''),
    }));
    clearControls();
    populateLangs();
    populateKinds();
    applyI18n();
    applyFilters();
  } catch (e) {
    $('results').innerHTML = `<p style="color:red">Failed to load: ${e}</p>`;
  }
}

// This function resets the kind and games filter dropdowns to their default state.
function clearControls() {
  $('kind').innerHTML = '<option value="" data-i18n="all">All</option>';
  $('games').innerHTML = '';
}

// This function checks the URL for the language and dev mode settings.
// For example, if the URL ends with #en-dev, it sets the language to English and turns on dev mode. refresh is required if on the current lang.
function getLangFromHash() {
  const raw = location.hash.replace('#', '').toLowerCase();
  const hasDevSuffix = raw.endsWith('-dev');
  devMode = hasDevSuffix;

  // Keep hyphenated locale codes intact (e.g. es-la) and only strip a trailing -dev.
  const langCandidate = hasDevSuffix ? raw.slice(0, -4) : raw;
  return LANGS.includes(langCandidate) ? langCandidate : 'en';
}

// This function fills in the language dropdown menu and updates the page when the user changes the language.
function populateLangs() {
  const sel = $('lang');
  if (sel.options.length > 0) return;
  LANGS.forEach(l => sel.appendChild(el('option', { value: l, text: l })));
  sel.value = getLangFromHash();
  sel.addEventListener('change', () => {
    location.hash = devMode ? sel.value + '-dev' : sel.value;
    load();
  });
  window.addEventListener('hashchange', () => {
    const lang = getLangFromHash();
    if (sel.value !== lang) {
      sel.value = lang;
      load();
    }
  });
}

// This function fills in the kind and games filter options based on the loaded news data.
function populateKinds() {
  const sel = $('kind');
  new Set(data.map(i => i.kindTxt).filter(Boolean))
    .forEach(k => sel.appendChild(el('option', { value: k, text: k })));

  const gamesDiv = $('games');
  GAMES.forEach(r => {
    const img = el('img', { src: `${GAME_IMG_BASE}${r}.png`, alt: r });
    img.style.height = '28px';
    img.onerror = function() { this.style.display = 'none'; if (!btn.textContent) btn.textContent = r; };
    const btn = el('button', {
      class: 'game-btn', type: 'button', title: r,
      dataset: { value: r },
      onclick: () => { btn.classList.toggle('active'); applyFilters(); }
    }, [img]);
    gamesDiv.appendChild(btn);
  });
}

// ===============================
// Filtering Functions
// ===============================

// This function checks all the filters (like keywords, kind, games, important, date range)
// and updates the list of news articles shown to the user
function applyFilters() {
  const kw = $('keyword').value.trim().toLowerCase();
  const kind = $('kind').value;
  const activeGames = Array.from(document.querySelectorAll('.game-btn.active'), b => b.dataset.value);
  const imp = $('important').checked;
  const since = $('since').value || null;
  const until = $('until').value || null;

  filteredData = data.filter(item => {
    if (kw && !(item.title?.toLowerCase().includes(kw))) return false;
    if (kind && item.kindTxt !== kind) return false;
    if (activeGames.length) {
      const lr = item.linkRom;
      if (!lr) return false;
      if (Array.isArray(lr)) { if (!activeGames.every(x => lr.includes(x))) return false; }
      else if (activeGames.length !== 1 || lr !== activeGames[0]) return false;
    }
    if (imp && !item.isImportant) return false;
    if (since && item.date && item.date < since) return false;
    if (until && item.date && item.date > until) return false;
    return true;
  });
  currentPage = 0;
  renderList();
}

// ===============================
// Rendering Functions
// ===============================

/**
 * Render the filtered news list to the DOM.
 */
function renderList() {
  const start = currentPage * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const total = filteredData.length;
  $('count').textContent = `${total} ${t('articles')} (${t('showing')} ${Math.min(start + 1, total)}-${Math.min(end, total)})`;

  const ul = $('list');
  if (currentPage === 0) ul.innerHTML = '';
  $('load-more').style.display = end < total ? 'block' : 'none';

  for (const it of filteredData.slice(start, end)) {
    const li = el('li', { class: 'item' });

    if (isNew(it.date)) {
      li.classList.add('new-article');
      li.appendChild(el('span', { class: 'new-badge', text: t('newBadge') }));
    }

    if (it.banner) {
      li.appendChild(el('img', { class: 'banner', src: it.banner, loading: 'lazy', decoding: 'async' }));
    }

    li.appendChild(el('h3', null, [el('a', { href: it.url, target: '_blank', text: it.title || '(no title)' })]));

    let meta = it.date || '';
    if (it.kindTxt) meta += ' · ' + it.kindTxt;
    if (it.isImportant) meta += ' · ' + t('important').replace(':', '');
    li.appendChild(el('div', { class: 'meta', text: meta }));

    const pubAt = formatTs(it.pubAt);
    if (pubAt) li.appendChild(el('div', { class: 'meta', text: t('published') + ' ' + pubAt }));

    const stAt = formatTs(it.stAt);
    if (stAt) li.appendChild(el('div', { class: 'meta', text: t('start') + ' ' + stAt }));

    const endAt = formatTs(it.endAt);
    if (endAt) li.appendChild(el('div', { class: 'meta', text: t('end') + ' ' + endAt }));

    const games = formatGames(it.linkRom);
    if (games) {
      const gd = el('div', { class: 'meta games-list' });
      gd.innerHTML = t('games') + ' ' + games;
      li.appendChild(gd);
    }

    if (devMode) {
      let tweetText = (it.title || '');
      if (it.stAt) tweetText += '\n\nPost Date: ' + formatTs(it.stAt);
      if (it.endAt) tweetText += '\nExpiration: ' + formatTs(it.endAt);
      if (it.linkRom) {
        const codes = Array.isArray(it.linkRom) ? it.linkRom : [it.linkRom];
        const gameNames = codes.map(c => GAME_NAMES[c] || c).join(', ');
        tweetText += '\nGame: ' + gameNames;
      }
      tweetText += '\n\n' + (it.url || '');
      const params = new URLSearchParams({ text: tweetText });
      //Tweet Single
      const tweetLink = el('a', {
        href: 'https://twitter.com/intent/tweet?' + params.toString(),
        target: '_blank',
        class: 'tweet-btn',
        text: '𝕏 Tweet'
      });
      li.appendChild(tweetLink);
      //Tweet all
      const tweetAllBtn = el('button', {
        class: 'tweet-btn',
        text: t('tweetAll'),
        onClick: () => tweetAllLangs(it)
      });
      li.appendChild(tweetAllBtn);
    }

    ul.appendChild(li);
  }
}

// ===============================
// Download Function
// ===============================

/**
 * Download the filtered news as a JSON file. Leaving this here if i come back to this in the future, to have custom news posts for the latest articles.
 */
function downloadFiltered() {
  const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: 'filtered-news.json' });
  a.click();
  URL.revokeObjectURL(url);
}

// ===============================
// Dark Mode Setup
// ===============================

/**
 * Dark mode toggle
 */
function setupDarkMode() {
  const btn = $('darkmode-toggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('darkmode');
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.body.classList.add('dark');
    btn.setAttribute('aria-pressed', 'true');
    btn.textContent = t('lightMode');
  }
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    btn.setAttribute('aria-pressed', String(isDark));
    btn.textContent = isDark ? t('lightMode') : t('darkMode');
    localStorage.setItem('darkmode', isDark ? 'dark' : 'light');
  });
}

// ===============================
// Initialization
// ===============================

/**
 * Initialize the app on DOMContentLoaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  setupDarkMode();
  ['keyword','kind','important','since','until'].forEach(id => $(id).addEventListener('input', applyFilters));
  $('clear').addEventListener('click', () => {
    $('keyword').value = '';
    $('kind').value = '';
    $('important').checked = false;
    $('since').value = '';
    $('until').value = '';
    document.querySelectorAll('.game-btn.active').forEach(b => b.classList.remove('active'));
    applyFilters();
  });
  $('download').addEventListener('click', downloadFiltered);
  $('load-more').addEventListener('click', () => { currentPage++; renderList(); });
  populateLangs();
  load();
});
