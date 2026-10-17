// Рассвет: статус «открыто», мобильное меню, вкладки меню, видео.
(() => {
  "use strict";

  // Не даём встроить сайт в чужую страницу
  if (window.top !== window.self) {
    let foreign = true;
    try { foreign = window.top.location.origin !== window.location.origin; } catch (e) { foreign = true; }
    if (foreign) document.documentElement.hidden = true;
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Языки: русский основной, узбекский и английский. Переводы в i18n.js, ключ — русский текст
  const I18N = window.RASSVET_I18N;
  const LANGS = ["ru", "uz", "en"];
  let lang = "ru";
  const ui = (key) => (I18N ? I18N.ui[lang][key] : I18N_RU[key]);
  const I18N_RU = { open: "Открыто до {c}", closed: "Откроемся в {o}", nowOpen: "Сейчас открыто, до закрытия {t}",
    nowClosed: "Сейчас закрыто, откроемся в {o}", openShort: "До {c}", closedShort: "С {o}", h: "{n} ч", m: "{n} мин", menuOpen: "Открыть меню разделов", menuClose: "Закрыть меню разделов" };

  // Часы работы по ташкентскому времени (UTC+5): пн-чт 08:00-21:00, пт-вс 08:30-22:00
  const status = document.getElementById("status");
  const hoursOf = (day) => (day === 5 || day === 6 || day === 0 ? [8 * 60 + 30, 22 * 60] : [8 * 60, 21 * 60]);
  const fmt = (m) => String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
  function today() {
    const d = new Date(Date.now() + 5 * 3600 * 1000);
    const mins = d.getUTCHours() * 60 + d.getUTCMinutes();
    const [OPEN, CLOSE] = hoursOf(d.getUTCDay());
    const open = mins >= OPEN && mins < CLOSE;
    // после закрытия откроемся уже завтра, по завтрашним часам
    const next = mins < OPEN ? OPEN : hoursOf((d.getUTCDay() + 1) % 7)[0];
    return { mins, OPEN, CLOSE, open, next };
  }
  const fill = (s, h) => s.replace("{o}", fmt(h.next)).replace("{c}", fmt(h.CLOSE));
  function updateStatus() {
    const h = today(), open = h.open;
    // на узком телефоне коротко, чтобы шапка поместилась
    const short = window.matchMedia("(max-width: 430px)").matches;
    status.textContent = fill(ui((open ? "open" : "closed") + (short ? "Short" : "")), h);
    status.classList.toggle("is-open", open);
  }
  if (status) { updateStatus(); setInterval(updateStatus, 60000); window.addEventListener("resize", updateStatus); }

  // Мобильное меню
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", ui(open ? "menuClose" : "menuOpen"));
    nav.classList.toggle("is-open", open);
  }
  if (burger && nav) {
    burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  }

  // 12:00 на телефоне: остальные фото коллажа открываются по стрелке
  const more = document.getElementById("more");
  if (more) more.addEventListener("click", () => {
    document.getElementById("collage").classList.add("is-open");
    more.setAttribute("aria-expanded", "true");
  });

  // Вкладки меню (с клавиатуры: стрелки, Home, End)
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  function select(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
    // осенние листья, корица и тыква видны только на вкладке «Осеннее меню»
    const menuBox = document.getElementById("menu");
    if (menuBox) menuBox.classList.toggle("is-autumn", tab.id === "t-au");
    if (focus) tab.focus();
    tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === "Home") next = tabs[0];
      if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });
  document.querySelectorAll('[role="tabpanel"]').forEach((p) => { p.tabIndex = 0; });

  // Рассвет. С самого начала стоит готовый логотип: солнце, «РАС / СВЕТ», птица.
  // Прокрутка от 0 до 1: солнце уходит вверх, птица улетает влево,
  // «РАССВЕТ» собирается в строку и садится в шапку на место слова «Рассвет».
  // Начальный кадр задаёт CSS, здесь только смещения от него.
  const dawn = document.getElementById("dawn");
  if (dawn && !reduceMotion) {
    const root = document.documentElement;
    root.classList.add("dawn-on", "is-day");   // до удара птицы сайт светлый
    const stage = dawn.querySelector(".dawn__stage");
    const mark = dawn.querySelector(".mark");
    const title = dawn.querySelector(".mark__title");
    const lines = Array.from(title.querySelectorAll("span[aria-hidden]"));
    const bird = dawn.querySelector(".mark__bird");
    const sun = dawn.querySelector(".sun");
    const brandWord = document.querySelector(".brand span");
    const brand = document.querySelector(".brand");
    const brandLogo = document.querySelector(".brand img");
    const header = document.getElementById("top");
    const morning = document.getElementById("morning");
    const mVideos = morning ? Array.from(morning.querySelectorAll(".morning__videos video")) : [];
    const mText = morning ? morning.querySelector(".morning__text") : null;
    const clamp = (v) => Math.min(1, Math.max(0, v));
    const range = (p, a, b) => clamp((p - a) / (b - a));
    const lerp = (a, b, t) => a + (b - a) * t;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easeIn = (t) => t * t * t;
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let geo = null, ticking = false, hit = false, first = true;

    // Заливка: от логотипа в шапке по экрану расходится круг краски нового цвета,
    // под ним меняется цвет сайта, потом круг растворяется. Страница под кругом
    // прокручивается как обычно, поэтому ничего не прыгает.
    const flood = (() => {
      const layer = document.createElement("div");
      layer.className = "flood";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
      let anims = [];
      return (night) => {
        anims.forEach((a) => a.cancel()); anims = [];
        const apply = () => root.classList.toggle("is-day", !night);
        if (!layer.animate) { apply(); return; }
        const r = brandLogo.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const end = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
        layer.style.background = night ? "#1c2617" : "#f7f5e8";
        layer.style.display = "block";
        const grow = layer.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`], opacity: [1, 1] },
          { duration: night ? 620 : 480, easing: "cubic-bezier(.55,0,.35,1)", fill: "forwards" }
        );
        anims.push(grow);
        grow.onfinish = () => {
          apply();
          const fade = layer.animate({ opacity: [1, 0] }, { duration: 420, easing: "ease-out", fill: "forwards" });
          anims.push(fade);
          fade.onfinish = () => { layer.style.display = "none"; anims.forEach((a) => a.cancel()); anims = []; };
        };
      };
    })();

    function measure() {
      bird.style.transform = "none";
      lines.forEach((l) => { l.style.transform = "none"; });
      const s = stage.getBoundingClientRect();
      const m = mark.getBoundingClientRect();
      const b = bird.getBoundingClientRect();
      const w = brandWord.getBoundingClientRect();
      const lg = brandLogo.getBoundingClientRect();
      const r = lines.map((l) => l.getBoundingClientRect());
      const markCy = m.top + m.height / 2;
      const k = parseFloat(getComputedStyle(brandWord).fontSize) / parseFloat(getComputedStyle(title).fontSize);
      const lineW = r[0].width + r[1].width;
      const cx = s.left + s.width / 2;
      const rowTop = markCy - r[0].height / 2;
      // шапка закреплена, сцена прилипает к top: 0; считаем в кадре «сцена прилипла»
      const headTop = w.top + s.top + w.height / 2 - (r[0].height * k) / 2;
      geo = {
        sunUp: markCy - s.top + sun.offsetHeight * 0.75,       // солнце уходит за верхний край
        // птица летит в круглый логотип в шапке: точка поворота птицы (40% / 60%) садится в центр круга
        birdOut: {
          x: lg.left + lg.width / 2 - (b.left + b.width * 0.4),
          y: lg.top + lg.height / 2 - (b.top - s.top + b.height * 0.6),
          sc: (lg.height * 0.9) / b.height,
        },
        k,
        row: [
          { x: cx - lineW / 2 - r[0].left, y: rowTop - r[0].top },
          { x: cx - lineW / 2 + r[0].width - r[1].left, y: rowTop - r[1].top },
        ],
        head: [
          { x: w.left - r[0].left, y: headTop - r[0].top },
          { x: w.left + r[0].width * k - r[1].left, y: headTop - r[1].top },
        ],
      };
    }

    function render() {
      ticking = false;
      if (!geo) measure();
      const rect = dawn.getBoundingClientRect();
      const travel = dawn.offsetHeight - stage.offsetHeight;
      const p = clamp(-rect.top / (travel || 1));

      // Солнце поднимается и уходит вверх
      const away = easeIn(range(p, 0, 0.55));
      stage.style.setProperty("--sun-dy", (-geo.sunUp * away).toFixed(1) + "px");
      stage.style.setProperty("--warm", (0.5 * (1 - away)).toFixed(3));

      // Слово: в одну строку, потом в шапку
      const join = easeInOut(range(p, 0.06, 0.3));
      const fly = easeInOut(range(p, 0.32, 0.8));
      const fade = range(p, 0.78, 0.86);
      title.style.opacity = (1 - fade).toFixed(3);
      brandWord.style.opacity = fade.toFixed(3);
      header.classList.toggle("is-clear", p < 0.86);
      // вне солнца слово и птица берут цвет темы (в тёмной теме светлые)
      stage.classList.toggle("is-bird-out", p > 0.1);
      stage.classList.toggle("is-out", p > 0.36);
      lines.forEach((l, i) => {
        const x = lerp(geo.row[i].x * join, geo.head[i].x, fly);
        const y = lerp(geo.row[i].y * join, geo.head[i].y, fly);
        const sc = lerp(1, geo.k, fly);
        l.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(4)})`;
      });

      // Птица: взлетает над словом, машет крыльями и влетает в круглый логотип в шапке
      const t = range(p, 0.02, 0.42);
      const x = geo.birdOut.x * easeIn(t);
      // на телефоне птица не взмывает сразу к верхнему краю: летит ниже и поднимается к логотипу плавно
      const narrow = window.innerWidth <= 820;
      const up = narrow ? t * t * (3 - 2 * t) : easeOut(t);
      const y = geo.birdOut.y * up + Math.sin(t * Math.PI * 3) * (narrow ? 24 : 40) * t * (1 - t);
      const rot = -14 * Math.sin(Math.PI * t);
      const sc = lerp(1, geo.birdOut.sc, easeIn(t));
      bird.style.opacity = t >= 1 ? "0" : "1";
      // удар о логотип: круг трясётся, по шапке расходится кольцо света
      // и от логотипа весь сайт заливается тёмно-зелёным; если листать назад, снова светлеет
      if (t >= 1 && !hit) {
        hit = true;
        if (first) root.classList.remove("is-day");
        else { brand.classList.remove("is-hit"); void brand.offsetWidth; brand.classList.add("is-hit"); flood(true); }
      } else if (t < 0.97 && hit) {
        hit = false; brand.classList.remove("is-hit");
        flood(false);
      }
      first = false;
      bird.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
      bird.classList.toggle("is-flying", t > 0 && t < 1);

      // Блок 08:00 поднимается, когда слово собралось в строку:
      // текст выходит слева, видео по очереди выезжают справа
      if (morning) {
        const vh = window.innerHeight;
        const mt = morning.getBoundingClientRect().top;
        const raw = clamp((vh - mt) / (vh * 0.85));
        const vw = window.innerWidth;
        mVideos.forEach((v, i) => {
          const e = easeOut(clamp(raw * 1.3 - i * 0.15));
          v.style.transform = e < 1 ? `translateX(${((1 - e) * vw * 0.75).toFixed(1)}px)` : "none";
        });
        if (mText) {
          const te = easeOut(clamp(raw * 1.25 - 0.1));
          mText.style.transform = te < 1 ? `translateX(${(-(1 - te) * 80).toFixed(1)}px)` : "none";
          mText.style.opacity = te.toFixed(3);
        }
      }
    }
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(render); } };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", () => { geo = null; request(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { geo = null; request(); });
    render();
  }

  // Дуга дня в «Как добраться»: солнце стоит там, где сейчас время в Ташкенте
  const arcSun = document.getElementById("arc-sun");
  const arcNow = document.getElementById("arc-now");
  function updateArc() {
    const hrs = today(), { mins, OPEN, CLOSE, open } = hrs;
    const from = document.getElementById("arc-from"), to = document.getElementById("arc-to");
    if (from && to) { from.textContent = fmt(OPEN); to.textContent = fmt(CLOSE); }
    // днём солнце идёт по дуге слева направо, ночью луна стоит в конце дуги, у закрытия
    const t = open ? (mins - OPEN) / (CLOSE - OPEN) : 1;
    const a = Math.PI * (1 - t);
    arcSun.setAttribute("transform", `translate(${(200 + 180 * Math.cos(a)).toFixed(1)} ${(200 - 180 * Math.sin(a)).toFixed(1)})`);
    const phase = !open ? "is-moon" : mins < OPEN + 60 ? "is-rise" : mins < 18 * 60 ? "is-day" : "is-set";
    ["is-moon", "is-rise", "is-day", "is-set"].forEach((c) => arcSun.classList.toggle(c, c === phase));
    if (open) {
      const left = CLOSE - mins, h = Math.floor(left / 60), m = left % 60;
      arcNow.textContent = ui("nowOpen").replace("{t}", (h ? ui("h").replace("{n}", h) + " " : "") + ui("m").replace("{n}", m));
    } else {
      arcNow.textContent = fill(ui("nowClosed"), hrs);
    }
  }
  if (arcSun && arcNow) { updateArc(); setInterval(updateArc, 60000); }

  // Перевод страницы: запоминаем русские тексты и подменяем их по словарю
  const langBtn = document.getElementById("lang-btn");
  const langList = document.getElementById("lang-list");
  if (I18N && langBtn && langList) {
    const norm = (s) => s.replace(/\s+/g, " ").trim();
    const skip = (el) => el.closest("script, style, svg, #status, #arc-now, .lang");
    const texts = [], attrs = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const key = norm(n.nodeValue);
      if (key && I18N.en[key] && !skip(n.parentElement)) texts.push({ n, orig: n.nodeValue, key });
    }
    document.querySelectorAll("[alt], [aria-label], [title]").forEach((el) => {
      if (skip(el) && !el.closest(".lang")) return;
      ["alt", "aria-label", "title"].forEach((name) => {
        const v = el.getAttribute(name);
        if (v && I18N.en[norm(v)]) attrs.push({ el, name, orig: v, key: norm(v) });
      });
    });
    const meta = document.querySelector('meta[name="description"]');
    const head = { title: document.title, desc: meta ? meta.content : "" };
    function setLang(l, save) {
      lang = LANGS.includes(l) ? l : "ru";
      const d = lang === "ru" ? null : I18N[lang];
      texts.forEach(({ n, orig, key }) => {
        if (!d) { n.nodeValue = orig; return; }
        const lead = orig.match(/^\s*/)[0], tail = orig.match(/\s*$/)[0];
        n.nodeValue = lead + d[key] + tail;
      });
      attrs.forEach(({ el, name, orig, key }) => el.setAttribute(name, d ? d[key] : orig));
      document.title = d && d[head.title] ? d[head.title] : head.title;
      if (meta) meta.content = d && d[head.desc] ? d[head.desc] : head.desc;
      document.documentElement.lang = lang;
      document.getElementById("lang-cur").textContent = lang.toUpperCase();
      langList.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
      if (status) updateStatus();
      if (arcSun && arcNow) updateArc();
      if (burger) burger.setAttribute("aria-label", ui(burger.getAttribute("aria-expanded") === "true" ? "menuClose" : "menuOpen"));
      if (save) { try { localStorage.setItem("lang", lang); } catch (e) { /* без хранилища язык просто не запомнится */ } }
      window.dispatchEvent(new Event("resize"));   // слово «РАССВЕТ» и раскладка пересчитываются
    }
    const openList = (open) => { langBtn.setAttribute("aria-expanded", String(open)); langList.hidden = !open; };
    langBtn.addEventListener("click", () => openList(langList.hidden));
    langList.addEventListener("click", (e) => {
      const b = e.target.closest("[data-lang]");
      if (b) { setLang(b.dataset.lang, true); openList(false); langBtn.focus(); }
    });
    document.addEventListener("click", (e) => { if (!e.target.closest(".lang")) openList(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !langList.hidden) { openList(false); langBtn.focus(); } });
    let saved = null;
    try { saved = localStorage.getItem("lang"); } catch (e) { saved = null; }
    if (saved && saved !== "ru") setLang(saved, false);
  }

  // Чашки сверху чуть поворачиваются при прокрутке, как блюдце в руках
  if (!reduceMotion) {
    const cups = Array.from(document.querySelectorAll(".cup"));
    let busy = false;
    function scene() {
      busy = false;
      const vh = window.innerHeight;
      cups.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        if (r.top < vh && r.bottom > 0) c.style.setProperty("--turn", (((r.top + r.height / 2) - vh / 2) * (i % 2 ? -0.06 : 0.06)).toFixed(1) + "deg");
      });
    }
    const ask = () => { if (!busy) { busy = true; requestAnimationFrame(scene); } };
    window.addEventListener("scroll", ask, { passive: true });
    window.addEventListener("resize", ask);
    scene();
  }

  // Видео: играют только на экране и только если человек не просил убрать движение
  if (reduceMotion || !("IntersectionObserver" in window)) return;
  const videos = Array.from(document.querySelectorAll("#heroVideo, .lazy-video"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (v.dataset.src && !v.src) { v.src = v.dataset.src; }
        const p = v.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        v.pause();
      }
    });
  }, { rootMargin: "120px 0px", threshold: 0.15 });
  videos.forEach((v) => io.observe(v));
})();
