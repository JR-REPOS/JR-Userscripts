// ==UserScript==
// @name         Pornhub v18.3.1
// @namespace    http://tampermonkey.net/
// @version      18.3.1
// @description  Uniform 2-column 80%-width 16:9 thumbnail grid on ALL pages (the proven homepage layout). Watch pages: player enlarged to 80vw and kept visible, ads/sidebar removed. Overrides the site's hardcoded width="320" height="180" attributes on thumbnail/preview imgs (sets them to 530x298 16:9) and applies the proven working card structure GLOBALLY — including forcing .wrap/.phimage to width:100% so thumbnails never collapse to the site's ~240px default.
// @match        *://*.pornhub.com/*
// @match        *://*.pornhub.org/*
// @match        *://*.rt.pornhub.com/*
// @run-at       document-idle
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  // Diagnostic marker so we can confirm which version is live.
  window.__PH_LAYOUT_VER__ = 18.3;

  const isVideoPage = () => /view_video\.php/.test(location.href);

  GM_addStyle(`
    /* Fill page / remove width caps (incl. the playlist's smaller-width cap) */
    #container, #main-container, .ph-content-wrapper, .wrapper, .container,
    .mainContent, #content, .sectionWrapper, .recommendations, .gridWrapper,
    .videosListingWrapper, .nf-videos, .frontListingWrapper, .front-index-page,
    #under-player-playlists, .hd-videos, .hd-videos_wrap, .hd-smallerWidth {
      max-width: 100% !important; width: 100% !important;
      margin-left: auto !important; margin-right: auto !important;
    }

    /* ===== UNIFORM 2-COL GRID (same as the homepage) on EVERY page =====
       Viewport-relative width (min(80vw,1080px)) so the grid ALWAYS has a
       definite width and can never collapse to 0 inside flex/column wrappers.
       On a typical desktop this resolves to ~1080px -> ~530px per thumbnail,
       matching the homepage layout the user approved. */
    .ph-grid-2col {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0,1fr)) !important;
      gap: 44px 20px !important;
      width: min(80vw, 1080px) !important; max-width: 100% !important;
      margin-left: auto !important; margin-right: auto !important;
      box-sizing: border-box !important; align-items: start !important; float: none !important;
      align-self: stretch !important; justify-self: center !important;
    }
    .ph-grid-2col > .ph-card-2col, .ph-grid-2col > li.ph-card-2col {
      width: 100% !important; max-width: 100% !important; float: none !important; margin: 0 !important; padding: 0 !important;
      height: auto !important; min-height: 0 !important;
    }
    .ph-grid-2col .alpha, .ph-grid-2col .omega { float:none !important; clear:none !important; margin:0 !important; }
    .ph-grid-2col > *:not(.ph-card-2col) { display: none !important; }

    /* ===== GLOBAL THUMBNAIL STRUCTURE (applied EVERYWHERE, not just inside the grid) =====
       The proven "working card" the user confirmed:
         <li .ph-card-2col> > .wrap.flexibleHeight > .phimage > .videoPreviewBg(a)
           > img(.js-videoThumb, 530x298) + video(.videoPreviewEl hover preview)
       Force every listing's thumbnails to this same 16:9, object-fit:cover layout
       regardless of which container holds them (e.g. the Related tab, playlists,
       category pages, homepage) so they all match the homepage exactly.

       IMPORTANT: the site's own CSS caps .wrap (and its .phimage child) to a fixed
       ~240px width. We must force width:100% on the ENTIRE chain (.wrap, .phimage,
       the anchor, the img) or the thumbnail collapses to that small width. */
    .wrap, .wrap.flexibleHeight { width: 100% !important; max-width: 100% !important; height: auto !important; }
    .phimage, .videoPreviewBg, a.latestThumb, a.linkVideoThumb, .linkVideoThumb {
      width: 100% !important; max-width: 100% !important;
      aspect-ratio: 16 / 9 !important; height: auto !important;
      overflow: hidden !important; position: relative !important; display: block !important;
    }
    /* The thumbnail <img> AND the hover-preview <video> both fill the 16:9 box. */
    img.js-videoThumb, img.js-videoPreview, img.thumb, img.latestThumb, img.js-thumb,
    .linkVideoThumb img, a.latestThumb img,
    .videoPreviewEl {
      width: 100% !important; height: 100% !important; max-width: 100% !important;
      object-fit: cover !important; display: block !important;
    }

    /* Hide ads / footer / pornstars / languages / SEO / sidebar beside player.
       NOTE: do NOT hide .mgp / .mgp_container / #mgp — those classes belong to the
       actual video PLAYER engine, hiding them makes the video disappear. */
    .recommendedPornstars, .recommendedCategories,
    [class*="recommendedPornstar"], [class*="recommendedCategor"],
    .ad-container, .adsbytrafficjunky, .removeAdLink, [id*="ad-"],
    [class*="ad-bottom"], .bottomAd, .footerAd, .wideAd, div[data-ad],
    [class*="ad-"], [class*="promo"], [class*="sponsor"], [class*="tj_"],
    .pornhubXPayment__bottomSection, .bottomText, .seo-text, .footer-seo,
    .footer, #footer, .footerContent, .footerContentWrapper, footer,
    .pornInLangWrapper, .languages, .videosInLang, [class*="pornInLang"], [class*="videosInLang"],
    .rightCol
    { display: none !important; }

    /* Keep the player engine visible no matter what the site does.
       Target the known player wrappers; never hide .mgp (the player itself). */
    .playerFlvContainer, #player, .playerWrap, #playerContainer,
    [id^="playerDiv"] {
      display: block !important; visibility: visible !important;
    }

    /* Scroll-to-top */
    #ph-scroll-top-btn {
      position: fixed; bottom: 24px; left: 24px; z-index: 999999;
      width: 46px; height: 46px; background: #1c1c1c; color: #fff;
      border: 1px solid #555; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; opacity: 0; visibility: hidden; transition: all .2s ease;
      font-size: 18px; box-shadow: 0 4px 14px rgba(0,0,0,.45);
    }
    #ph-scroll-top-btn.visible { opacity: 1; visibility: visible; }
    #ph-scroll-top-btn:hover { background:#ff9000; color:#000; border-color:#ff9000; transform:scale(1.07); }
  `);

  function isLikelyVideoCard(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.matches('.pcVideoListItem, .videoblock, .ph-video-block, .full-width')) return true;
    if (el.matches('li')) return !!el.querySelector('.ph-thumbnail, .js-videoThumb, .videoPreviewBg, .linkVideoThumb, .latestThumb');
    return false;
  }
  function getCardNodes() {
    const direct = [...document.querySelectorAll('.pcVideoListItem, .videoblock, .ph-video-block, .full-width')];
    const liCards = [...document.querySelectorAll('li')].filter(isLikelyVideoCard);
    return [...new Set([...direct, ...liCards])];
  }
  function discoverGridContainers(cards) {
    const grids = new Map();
    cards.forEach(c => { if (c.parentElement) { const g = c.parentElement; grids.set(g, g.querySelectorAll(':scope > .pcVideoListItem, :scope > .videoblock, :scope > .ph-video-block, :scope > .full-width, :scope > li').length); } });
    return [...grids.entries()].filter(([, n]) => n >= 4).map(([g]) => g);
  }
  function fillWidth(el) {
    let p = el, i = 0;
    while (p && p !== document.body && i < 8) {
      p.style.setProperty('max-width', 'none', 'important');
      p.style.setProperty('width', '100%', 'important');
      p.style.setProperty('padding-left', '0', 'important');
      p.style.setProperty('padding-right', '0', 'important');
      p = p.parentElement; i++;
    }
  }

  /* Force every thumbnail / preview <img> to the known-good 16:9 size.
     The site hardcodes width="320" height="180" on these; overriding the
     attributes (plus inline 100% as backup) makes previews render full-size
     even when our parent-scoped CSS isn't in effect. */
  function fixThumbSizes() {
    const imgs = document.querySelectorAll(
      'img.js-videoThumb, img.js-videoPreview, img.thumb, img.latestThumb, ' +
      'img.js-thumb, .linkVideoThumb img, a.latestThumb img'
    );
    imgs.forEach(img => {
      img.setAttribute('width', '530');
      img.setAttribute('height', '298.13');
      img.style.setProperty('width', '100%', 'important');
      img.style.setProperty('height', '100%', 'important');
      img.style.setProperty('object-fit', 'cover', 'important');
      img.style.setProperty('display', 'block', 'important');
    });
    return imgs.length;
  }

  function applyGridToContainer(g) {
    if (!g) return;
    g.classList.remove('col-4', 'col-3-sm', 'col-2-sm', 'col-3', 'col-2', 'full-row-thumbs', 'display-grid', 'hd-smallerWidth');
    g.classList.add('ph-grid-2col');
    g.querySelectorAll(':scope > *').forEach(li => {
      if (!isLikelyVideoCard(li)) return;
      li.classList.add('ph-card-2col');
      li.style.setProperty('width', '100%', 'important');
      li.style.setProperty('max-width', '100%', 'important');
      li.style.setProperty('float', 'none', 'important');
      li.style.setProperty('margin', '0', 'important');
      li.style.setProperty('height', 'auto', 'important');
      li.style.setProperty('min-height', '0', 'important');
    });
    fillWidth(g);
    /* Set grid props AFTER fillWidth so they win over its width:100%.
       UNIFORM on every page: 2 columns, viewport-relative 80% width (this is
       the proven homepage layout where thumbnails + hover previews work). */
    g.style.setProperty('display', 'grid', 'important');
    g.style.setProperty('grid-template-columns', 'repeat(2, minmax(0,1fr))', 'important');
    g.style.setProperty('gap', '44px 20px', 'important');
    g.style.setProperty('width', 'min(80vw, 1080px)', 'important');
    g.style.setProperty('max-width', '100%', 'important');
    g.style.setProperty('margin-left', 'auto', 'important');
    g.style.setProperty('margin-right', 'auto', 'important');
    g.style.setProperty('box-sizing', 'border-box', 'important');
    g.style.setProperty('align-self', 'stretch', 'important');
  }
  function applyListing() {
    const cards = getCardNodes();
    const containers = new Set(discoverGridContainers(cards));
    /* Belt-and-suspenders: explicitly target the known listing containers so a
       zero/late-discovery (e.g. a hidden tab panel) never leaves one unstyled. */
    ['#relatedVideosListing', '#recommendedVideosListing', '#videoPlayList',
     'ul.videos.ph-grid-2col', '.frontListingWrapper ul.videos', '.videosListingWrapper ul.videos'
    ].forEach(sel => document.querySelectorAll(sel).forEach(g => containers.add(g)));
    containers.forEach(applyGridToContainer);
    fixThumbSizes();
  }

  function centerPlayer() {
    ['#main-container.vpContainer', '#vpContentContainer', '#hd-leftColVideoPage'].forEach(sel => {
      const e = document.querySelector(sel); if (!e) return;
      e.style.setProperty('display', 'flex', 'important');
      e.style.setProperty('flex-direction', 'column', 'important');
      e.style.setProperty('align-items', 'center', 'important');
      e.style.setProperty('float', 'none', 'important');
      e.style.setProperty('width', '100%', 'important');
      e.style.setProperty('max-width', 'none', 'important');
      e.style.setProperty('margin', '0 auto', 'important');
    });
    /* Enlarge the player to 80% of the device (viewport) width AND keep it visible.
       Target EVERY .videoWrapModelInfo variant (.original AND .wide) — the site
       caps these via max-width, so force width:80vw and max-width:none. */
    document.querySelectorAll('.videoWrapModelInfo, .videoWrapModelInfo.original, .videoWrapModelInfo.wide').forEach(e => {
      e.style.setProperty('display', 'block', 'important');
      e.style.setProperty('width', '80vw', 'important');
      e.style.setProperty('max-width', 'none', 'important');
      e.style.setProperty('margin', '0 auto', 'important');
    });
    document.querySelectorAll('.video-wrapper.modelInfo').forEach(e => {
      e.style.setProperty('width', '100%', 'important');
      e.style.setProperty('max-width', '100%', 'important');
      e.style.setProperty('margin', '0 auto', 'important');
    });
    const player = document.querySelector('#player.original.mainPlayerDiv') || document.querySelector('#player') || document.querySelector('.playerFlvContainer');
    if (player) {
      /* The player itself is the mgp engine — never hide it. Just size it. */
      player.style.setProperty('display', 'block', 'important');
      player.style.setProperty('visibility', 'visible', 'important');
      player.style.setProperty('width', '100%', 'important');
      player.style.setProperty('max-width', '100%', 'important');
      player.style.setProperty('margin', '0 auto', 'important');
    }
    /* Ensure the mgp-powered player container is visible (it carries .mgp_* classes) */
    document.querySelectorAll('.playerFlvContainer, .playerWrap, #playerContainer, [id^="playerDiv"]').forEach(p => {
      p.style.setProperty('display', 'block', 'important');
      p.style.setProperty('visibility', 'visible', 'important');
    });
    /* Remove the sidebar/ad column beside the player */
    const rc = document.querySelector('.rightCol');
    if (rc) rc.style.setProperty('display', 'none', 'important');
    /* Remove the playlist section's smaller-width cap so it matches the grid */
    const pl = document.querySelector('#under-player-playlists');
    if (pl) { pl.style.setProperty('max-width', 'none', 'important'); pl.style.setProperty('width', '100%', 'important'); }
  }

  const topBtn = document.createElement('button');
  topBtn.id = 'ph-scroll-top-btn'; topBtn.innerHTML = '▲'; topBtn.title = 'Back to top';
  document.body.appendChild(topBtn);
  window.addEventListener('scroll', () => topBtn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  function init() { if (isVideoPage()) centerPlayer(); applyListing(); }
  init();

  let obs = null, t = null;
  function schedule() {
    if (t) clearTimeout(t);
    t = setTimeout(() => {
      if (obs) obs.disconnect();
      if (isVideoPage()) centerPlayer();
      applyListing();
      if (obs) obs.observe(document.body, { childList: true, subtree: true });
    }, 400);
  }
  obs = new MutationObserver(schedule);
  obs.observe(document.body, { childList: true, subtree: true });

  let n = 0;
  const iv = setInterval(() => { if (isVideoPage()) centerPlayer(); applyListing(); if (++n >= 8) clearInterval(iv); }, 800);
  const _push = history.pushState;
  history.pushState = function () { _push.apply(this, arguments); setTimeout(() => { if (isVideoPage()) centerPlayer(); applyListing(); }, 400); };
  window.addEventListener('popstate', () => setTimeout(() => { if (isVideoPage()) centerPlayer(); applyListing(); }, 400));
})();
