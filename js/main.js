/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'bottega-del-fornaio',    // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Dal cartello rosso a quattro orologi sulla loro porta (foto della scheda Google, 24/9/2026):
       mattino 7:30–14:00, pomeriggio 15:30–21:00. Domenica: non risulta da nessuna fonte → chiusa (da confermare). */
    hours: {
      0: [],
      1: [['07:30', '14:00'], ['15:30', '21:00']],
      2: [['07:30', '14:00'], ['15:30', '21:00']],
      3: [['07:30', '14:00'], ['15:30', '21:00']],
      4: [['07:30', '14:00'], ['15:30', '21:00']],
      5: [['07:30', '14:00'], ['15:30', '21:00']],
      6: [['07:30', '14:00'], ['15:30', '21:00']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "intro.skip": "skip",
      "nav.home": "La Bottega del Fornaio, back to top",
      "nav.apri": "Open the menu",
      "marchio.s": "bakery & corner shop · viale Suzzani, Milan",
      "nav.banco": "On the counter",
      "nav.signore": "The ladies",
      "nav.voci": "Reviews",
      "nav.orari": "Hours",
      "nav.dove": "Where",
      "nav.domande": "Questions",
      "cta.strada": "Get directions",
      "h.kicker": "Bakery & corner shop · viale Suzzani, corner of via Santa Monica · Milan, Niguarda",
      "h.h1": "A bit of everything.",
      "h.sub": "Bread, focaccia, pizza and cakes <em>made by them</em>. And the eggs, the drinks, the beer you are missing in the kitchen at eight in the evening. A bit of everything: that is how the customers describe it, and that is what the shop is.",
      "h.orologio": "Clock showing the time right now",
      "h.adesso": "right now, in the shop",
      "h.cta1": "What is on the counter",
      "h.cta2": "Get directions",
      "h.badge": "4.7 on Google, with 64 reviews · Monday to Saturday, 7.30–14 and 15.30–21",
      "h.alt": "The shop window at night: the orange sign La Bottega del Fornaio lit above the glass shelves with the bread baskets, the bottles and the cakes",
      "h.cap": "The window, on viale Suzzani",
      "b.k": "a bit of everything",
      "b.h": "On the counter, shelf by shelf.",
      "b.p": "Eight shelves, as in the window. The things are the ones customers name in their reviews, and the photos are theirs.",
      "m1.c": "bread",
      "m1.t": "Bread of every kind.",
      "m1.d": "Michette rolls, loaves, round loaves: made by them, in the baskets you can see from the street. It is the first shelf, the one under the sign.",
      "m1.a": "Rolls and loaves in metal baskets, in front of a brick wall",
      "m1.cap": "The bread, in its baskets",
      "m2.c": "focaccia",
      "m2.t": "Plain, or with something on top.",
      "m2.d": "With tomato sauce, with cherry tomatoes, with olives, with onion, with peppers. The list comes from a customer who counted them all.",
      "m2.a": "A piece of onion focaccia on white paper",
      "m2.cap": "The onion focaccia",
      "m3.c": "sticks & grissini",
      "m3.t": "For nibbling.",
      "m3.d": "Bread sticks with onion or with olives. Grissini plain, with sesame, pizzaiola style.",
      "m4.c": "pizza & savoury pies",
      "m4.t": "Pizza, pizzette, savoury pies.",
      "m4.d": "For a quick lunch and for a dinner with no cooking.",
      "m5.c": "cakes & pastries",
      "m5.t": "The cakes, the brioches, the pastries.",
      "m5.d": "The cream and strawberry cake was photographed by two customers, at home. There are brioches, the pastries on the counter and birthday cakes with the dedication written on top. «Wonderful cakes, just like a mum would make», Teresa wrote ten months ago.",
      "m5.a": "A cake with whipped cream piped around the edge and sliced strawberries in the middle, seen from above",
      "m5.cap": "Cream and strawberries",
      "m5.a2": "A spiral brioche and a grissino on the shop paper",
      "m5.cap2": "A brioche and a grissino",
      "m6.c": "saturday",
      "m6.t": "On Saturday, fried panzerotti.",
      "m6.d": "The day the shop fries panzerotti. So say the customers who come on Saturdays; for the rest of the week, ask at the counter.",
      "m7.c": "the corner shop",
      "m7.t": "What is missing in the kitchen.",
      "m7.d": "Eggs, drinks, beer, and the ingredients you realise you do not have once you have already started cooking. It is the part of the shop that reviews call the grocery: on the top shelves, above the bread.",
      "m7.a": "Inside the shop: wooden shelves with bottles on top, the bread, and the glass counter with pastries and orange price tags",
      "m7.cap": "The shelves and the counter",
      "m8.c": "vegan",
      "m8.t": "There is vegan too.",
      "m8.d": "At the counter they tell you what is vegan and what is not, product by product. If what you are looking for is not there, ask: they find out.",
      "s.k": "who is at the counter",
      "s.h": "The ladies.",
      "s.p": "In the reviews they have no name: they are the lady, the ladies, the girls at the counter, the owner. They are the ones who tell you what is vegan and what has just come out of the oven. The word customers write most often, after bread, is kind.",
      "s.c1": "kind",
      "s.c2": "bread",
      "s.c3": "sweets",
      "s.c4": "«everything»",
      "s.c5": "focaccia",
      "s.cap": "How many times they appear in the 34 Google reviews with text, September 2026.",
      "s.alt": "The two shop windows at night, with the light on inside and the awning above",
      "s.fcap": "The shop at night, with the light on",
      "v.k": "Google reviews",
      "v.h": "Five voices, as they were written.",
      "v1.c": "Luca B. · 2 years ago · 5 stars",
      "v2.c": "Teresa M. · 10 months ago · 5 stars",
      "v3.c": "Antonio D. G. · a year ago · 5 stars",
      "v4.c": "Iuliana Z. · 2 years ago · 5 stars",
      "v5.c": "Luca B. · 2 years ago · 5 stars",
      "o.k": "the sign in the window",
      "o.h": "From half past seven to nine in the evening.",
      "o.p": "With a break from two to half past three. These are the hours on the sign on our door, the red one with four clocks: for holidays and August, ask at the counter.",
      "o.cap": "Opening hours",
      "g.lun": "Monday",
      "g.mar": "Tuesday",
      "g.mer": "Wednesday",
      "g.gio": "Thursday",
      "g.ven": "Friday",
      "g.sab": "Saturday",
      "g.dom": "Sunday",
      "g.chiuso": "closed",
      "o.alt": "The red Opening hours sign with four clocks, on the glass door of the shop",
      "o.fcap": "The sign on our door, photographed by a customer",
      "o.cart": "Opening hours: morning from 7.30 to 14.00, afternoon from 15.30 to 21.00; closed on Sunday",
      "o.t1": "Opening hours",
      "o.mattino": "morning",
      "o.pomeriggio": "afternoon",
      "o.dalle": "from",
      "o.alle": "to",
      "o.chiuso": "closed",
      "o.chiusoG": "Sunday",
      "d.k": "where",
      "d.h": "On viale Suzzani, at the corner of via Santa Monica.",
      "d.p": "In Niguarda, between Ca' Granda and Pratocentenaro: two windows on the avenue, with the green awning, just after the corner of via Santa Monica.",
      "d.ind": "Viale Giovanni Suzzani, corner of via Santa Monica",
      "d.strada": "Get directions",
      "d.maps": "The Google listing",
      "d.alt": "The orange sign with La Bottega del Fornaio written in script",
      "d.cap": "The sign, above the window",
      "d.mappa": "Map: La Bottega del Fornaio, viale Giovanni Suzzani, Milan",
      "do.h": "The questions we get asked.",
      "qa.1": "Do you make cakes with a dedication?",
      "ra.1": "Yes: cakes for birthdays and parties, with the words written on top. Come to the counter to arrange it in advance.",
      "qa.2": "Do you have vegan products?",
      "ra.2": "Yes: at the counter they point them out product by product. If you are looking for something that is not there, ask: we find out.",
      "qa.3": "Are you on Too Good To Go?",
      "ra.3": "Yes. At the end of the day, when something is left, we put a Surprise Bag in the app: bread, focaccia and baked goods. Collection is in the shop.",
      "qa.4": "Can I order by phone?",
      "ra.4": "We do not have a public number: to order, come to the counter and we will agree on it.",
      "qa.5": "What are the opening hours?",
      "ra.5": "Monday to Saturday from 7.30 to 14 and from 15.30 to 21. Closed on Sunday. These are the hours on the sign on the door: for holidays and August, ask at the counter.",
      "qa.6": "What is there besides bread?",
      "ra.6": "Focaccia, bread sticks and grissini, pizza and savoury pies, brioches, pastries and cakes. And the corner shop: eggs, drinks, beer and a few ingredients for the kitchen.",
      "piede.s": "bakery & corner shop · viale Giovanni Suzzani, corner of via Santa Monica · 20162 Milan, Niguarda",
      "piede.d": "Monday to Saturday 7.30–14.00 and 15.30–21.00 · closed on Sunday",
      "piede.b": "Demo site by <a href=\"https://bespokestud.io\" target=\"_blank\" rel=\"noopener\">Bespoke Studio</a> · texts from the public Google reviews (September 2026) and from the opening-hours sign in the window; photographs published by customers on the Google listing.",
      "b.banco": "Counter",
      "b.orari": "Hours",
      "b.strada": "Directions",
      "lb.chiudi": "Close",
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  /* ═══ FIRMA · La Bottega del Fornaio — «Un po' di tutto.»: le lancette ═══
     1) il cartello rosso a quattro orologi (#cartelloOrari): le lancette partono da mezzogiorno e girano
        fino all'orario del cartello quando la sezione entra (una volta, sfalsate). Lo stato finale è già
        scritto inline nell'HTML (--ore/--min), quindi senza JS e in reduced-motion il cartello è giusto.
     2) l'orologio vivo dell'apertura (#orologioVivo): l'ora vera di Milano, la lancetta dei secondi scatta.
     3) l'entrata dell'hero: l'insegna scende accesa, poi il resto. */
  var lancetteVive = hasGsap && hasST && !reducedMotion;
  function angoli(hhmm) { var p = hhmm.split(':'); var h = +p[0], m = +p[1]; return { ore: (h % 12) * 30 + m * 0.5, min: m * 6 }; }
  var cartello = document.getElementById('cartelloOrari');
  if (cartello) {
    var oro = Array.prototype.slice.call(cartello.querySelectorAll('.orologio[data-ore]'));
    var finale = function () { oro.forEach(function (o) { var a = angoli(o.getAttribute('data-ore')); o.style.setProperty('--ore', a.ore + 'deg'); o.style.setProperty('--min', a.min + 'deg'); }); cartello.setAttribute('data-stato', 'girate'); };
    finale();   // sempre coerente con data-ore, anche se l'HTML inline fosse diverso
    if (lancetteVive) {
      cartello.setAttribute('data-stato', 'ferme');
      oro.forEach(function (o) { o.style.setProperty('--ore', '0deg'); o.style.setProperty('--min', '0deg'); });
      var girate = false;
      var gira = function () {
        if (girate) return; girate = true;
        var fatte = 0;
        oro.forEach(function (o, i) {
          var a = angoli(o.getAttribute('data-ore')); var st = { o: 0, m: 0 };
          gsap.to(st, { o: a.ore, m: a.min + 360, duration: 1.7, delay: i * 0.28, ease: 'back.out(1.25)',
            onUpdate: function () { o.style.setProperty('--ore', st.o + 'deg'); o.style.setProperty('--min', (st.m % 360) + 'deg'); },
            onComplete: function () { o.style.setProperty('--ore', a.ore + 'deg'); o.style.setProperty('--min', a.min + 'deg'); if (++fatte === oro.length) cartello.setAttribute('data-stato', 'girate'); } });
        });
      };
      ScrollTrigger.create({ trigger: cartello, start: 'top 82%', once: true, onEnter: gira });
      // rete di sicurezza: se il trigger non scatta, le lancette vanno comunque a posto
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es, io) { es.forEach(function (e) { if (e.isIntersecting) { setTimeout(function () { if (!girate) { finale(); } }, 1200); io.disconnect(); } }); }, { threshold: 0.2 }).observe(cartello);
      }
    }
  }

  var vivo = document.getElementById('orologioVivo');
  if (vivo) {
    var oraVivo = document.getElementById('oraVivo');
    var secTot = null, ultimoS = null;
    var adesso = function () {
      try {
        var parti = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(new Date());
        var g = {}; parti.forEach(function (p) { g[p.type] = +p.value; });
        return { h: g.hour % 24, m: g.minute, s: g.second };
      } catch (e) { var d = new Date(); return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() }; }
    };
    var tick = function () {
      var t = adesso();
      if (secTot === null) { secTot = t.s; } else { secTot += ((t.s - ultimoS) + 60) % 60; }
      ultimoS = t.s;
      vivo.style.setProperty('--ore', ((t.h % 12) * 30 + t.m * 0.5 + t.s / 120) + 'deg');
      vivo.style.setProperty('--min', (t.m * 6 + t.s * 0.1) + 'deg');
      if (!reducedMotion) vivo.style.setProperty('--sec', (secTot * 6) + 'deg');
      if (oraVivo) oraVivo.textContent = (t.h < 10 ? '0' : '') + t.h + ':' + (t.m < 10 ? '0' : '') + t.m;
    };
    tick(); setInterval(tick, 1000);
  }

  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion) return;
    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.apertura__insegna', { opacity: 0, y: -22, duration: .7 })
      .from(['.apertura__kicker', '.apertura__h', '.apertura__sub', '.apertura__ora', '.apertura__azioni', '.apertura__badge'], { opacity: 0, y: 18, duration: .6, stagger: .09 }, '-=.3')
      .from('.apertura__foto', { opacity: 0, y: 26, duration: .8 }, '-=.55');
  };

})();
