/* FIST — публичная витрина. Единственный сетевой запрос — отправка «Окна идей» на свой же адрес (/api/idea).
   С закрытым кабинетом и агентами сайт не связан. © 2026 Олег / GONKA LAB. */
(function () {
  "use strict";
  const C = window.FIST_CONTENT;
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = Object.fromEntries(C.team.map(m => [m.id, m]));
  const pic = (id, cls = "") => `<img class="ph ${cls}" src="assets/img/team-${id}.webp" width="320" height="320" alt="" loading="lazy" decoding="async">`;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- меню
  const burger = $("#burger"), menu = $("#menu");
  burger.addEventListener("click", () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
  menu.addEventListener("click", e => { if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); } });

  // ---------- старт: подписи пятёрки под иллюстрацией
  $("#heroCrew").innerHTML = C.team.map(m => `<a class="crew c-${m.id}" href="#team" data-person="${m.id}"><b>${esc(m.name)}</b><small>${esc(m.short)}</small></a>`).join("");

  // ---------- демонстрация «мысль → продукт»
  let demo = C.demos[0], step = 0, typer = null;
  $("#demoPick").innerHTML = C.demos.map((d, i) => `<button class="chip" type="button" role="tab" aria-selected="${i === 0}" data-demo="${d.id}">${esc(d.label)}</button>`).join("");
  function renderDemo() {
    clearInterval(typer);
    $$(".demo-flow li").forEach(li => { const n = +li.dataset.st; li.className = n < step ? "done" : n === step ? "cur" : ""; });
    const st = $("#demoStage");
    if (step === 0) {
      st.innerHTML = `<div class="raw"><span id="rawText" class="typing"></span></div>`;
      const el = $("#rawText");
      if (reduce) { el.textContent = demo.raw; el.classList.remove("typing"); }
      else { let i = 0; typer = setInterval(() => { el.textContent = demo.raw.slice(0, ++i); if (i >= demo.raw.length) { clearInterval(typer); el.classList.remove("typing"); } }, 28); }
    } else if (step === 1) {
      st.innerHTML = `<p class="understood"><small>FIST понял так</small>${esc(demo.understood)}</p>
        <div class="cols3">
          <div class="col k-ok"><h4>✓ Известно</h4><ul>${demo.known.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
          <div class="col k-warn"><h4>? Догадка — проверим</h4><ul>${demo.guess.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
          <div class="col k-ask"><h4>→ Спросим у вас</h4><ul>${demo.ask.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>
        </div>`;
    } else if (step === 2) {
      st.innerHTML = `<div class="work">${demo.steps.map(([id, t]) => `<div class="wk c-${id}">${pic(id, "av")}<div><b>${esc(byId[id].name)}</b><p>${esc(t)}</p></div></div>`).join("")}</div>`;
    } else {
      st.innerHTML = `<div class="result-box"><div class="flag" aria-hidden="true">🏁</div><h3>${esc(demo.result)}</h3>
        <p>Дальше решает человек: утвердить, вернуть на доработку или изменить цель.</p>
        <a class="btn primary" href="#ideas">Рассказать свою идею</a></div>`;
    }
    $("#demoBack").disabled = step === 0;
    $("#demoNext").textContent = step === 3 ? "Ещё раз ↺" : "Дальше →";
  }
  $("#demoPick").addEventListener("click", e => {
    const b = e.target.closest("[data-demo]"); if (!b) return;
    demo = C.demos.find(d => d.id === b.dataset.demo); step = 0;
    $$("#demoPick .chip").forEach(c => c.setAttribute("aria-selected", c === b));
    renderDemo();
  });
  $("#demoNext").addEventListener("click", () => { step = step === 3 ? 0 : step + 1; renderDemo(); });
  $("#demoBack").addEventListener("click", () => { if (step > 0) { step--; renderDemo(); } });

  // ---------- пятёрка
  $("#team5").innerHTML = C.team.map((m, i) => `<button class="tm c-${m.id}" type="button" role="tab" aria-selected="${i === 0}" data-id="${m.id}">
    ${pic(m.id)}<span class="tm-t"><span class="fg">${esc(m.finger)}</span><b>${esc(m.name)}</b><small>${esc(m.short)}</small></span></button>`).join("");
  function showPerson(id) {
    const m = byId[id];
    $$(".tm").forEach(b => b.setAttribute("aria-selected", b.dataset.id === id));
    const p = $("#person");
    p.className = "person c-" + id;
    p.innerHTML = `<div class="pv">${pic(id)}</div><div>
      <p class="eyebrow">${esc(m.finger)}</p><h3>${esc(m.name)}</h3><p class="role">${esc(m.role)}</p>
      <p class="character">${esc(m.character)}</p>
      <div class="p-grid">
        <div class="p-cell"><h4>Что делает</h4><p>${esc(m.job)}</p></div>
        <div class="p-cell"><h4>Пример настоящей работы</h4><p>${esc(m.example)}</p></div>
      </div></div>`;
  }
  $("#team5").addEventListener("click", e => { const b = e.target.closest(".tm"); if (b) showPerson(b.dataset.id); });
  document.addEventListener("click", e => { const a = e.target.closest("[data-person]"); if (a) showPerson(a.dataset.person); });
  showPerson("alfred");

  // ---------- кулак
  $("#fistBtn").addEventListener("click", e => {
    const on = $("#fistSvg").classList.toggle("closed");
    e.currentTarget.textContent = on ? "Разжать" : "Сжать кулак";
    e.currentTarget.setAttribute("aria-pressed", on);
  });

  // ---------- анатомия
  const who = w => byId[w] || (w === "boss" ? { name: "Человек", color: "#f2b06b" } : w === "fist" ? { name: "Вся пятёрка", color: "#e8913f" } : { name: "Финиш", color: "#f4ede4" });
  $("#track").innerHTML = C.anatomy.map((s, i) => {
    const w = who(s.who);
    const inner = byId[s.who] ? pic(s.who) : s.who === "finish" ? "" : `<i>${s.who === "boss" ? "👤" : "✋"}</i>`;
    return `<button class="stop c-${s.who}" type="button" role="tab" data-i="${i}" aria-selected="${i === 0}">
      ${s.who === "finish" ? '<span class="chequer" aria-hidden="true"></span>' : `<span class="dot" aria-hidden="true">${inner}</span>`}
      <span class="n">${i + 1}</span><span class="t">${esc(s.t)}</span></button>`;
  }).join("");
  function showPit(i) {
    const s = C.anatomy[i], w = who(s.who);
    $$(".stop").forEach(b => b.setAttribute("aria-selected", +b.dataset.i === i));
    $("#track").style.setProperty("--p", (i / (C.anatomy.length - 1) * 92) + "%");
    const pit = $("#pit"); pit.className = "pit c-" + s.who;
    pit.innerHTML = `<div class="who">${i + 1} · ${esc(w.name)}</div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>`;
  }
  $("#track").addEventListener("click", e => { const b = e.target.closest(".stop"); if (b) showPit(+b.dataset.i); });
  $("#track").addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const cur = $$(".stop").findIndex(b => b.getAttribute("aria-selected") === "true");
    const nx = Math.max(0, Math.min(C.anatomy.length - 1, cur + (e.key === "ArrowRight" ? 1 : -1)));
    showPit(nx); $$(".stop")[nx].focus();
  });
  showPit(0);
  $("#loops").innerHTML = C.loops.map(([t, d]) => `<div class="loop"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join("");

  // ---------- результаты
  const ST = { done: "реализовано", tested: "протестировано", dev: "разрабатывается", plan: "запланировано" };
  const shown = new Set(Object.keys(ST));
  $("#stFilter").innerHTML = Object.entries(ST).map(([k, v]) => `<button class="st st-${k}" type="button" data-st="${k}" aria-pressed="true">${v}</button>`).join("");
  function renderResults() {
    const list = C.achievements.filter(a => shown.has(a.status));
    $("#resultsList").innerHTML = list.length ? list.map(a => `<article class="res"><div class="top"><span class="id">${esc(a.id)}</span><span class="st st-${a.status}">${ST[a.status]}</span></div>
      <h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></article>`).join("") : `<p class="muted">Выберите хотя бы одно состояние.</p>`;
  }
  $("#stFilter").addEventListener("click", e => {
    const b = e.target.closest("[data-st]"); if (!b) return;
    shown.has(b.dataset.st) ? shown.delete(b.dataset.st) : shown.add(b.dataset.st);
    b.setAttribute("aria-pressed", shown.has(b.dataset.st)); renderResults();
  });
  renderResults();

  // ---------- Окно идей
  const form = $("#ideaForm"), idea = $("#idea"), contact = $("#contact"), consent = $("#consent"), tg = $("#telegram"),
        send = $("#ideaSend"), status = $("#formStatus"), started = Date.now();
  if (form) {
    const EMAIL = /^[A-Za-z0-9._%+\-]{1,64}@[A-Za-z0-9.\-]{1,190}\.[A-Za-z]{2,24}$/;
    const TG = /^(?:@|https?:\/\/t\.me\/|t\.me\/)?[A-Za-z][A-Za-z0-9_]{4,31}$/;
    const SENS = [/\bsk-[A-Za-z0-9_\-]{16,}/, /\bAIza[0-9A-Za-z_\-]{30,}/, /\bgh[pousr]_[A-Za-z0-9]{30,}/, /\b\d{8,10}:[A-Za-z0-9_\-]{30,}/,
                  /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /\b(парол[ьяи]|password|passwd|pwd)\s*[:=]\s*\S{4,}/i, /(?<!\d)(?:\d[ \-]?){15,18}\d(?!\d)/];
    const errEl = { idea: $("#ideaErr"), contact: $("#contactErr"), telegram: $("#telegramErr"), consent: $("#consentErr") };
    const fieldEl = { idea, contact, telegram: tg, consent };
    function setErr(field, msg) {
      Object.entries(errEl).forEach(([k, el]) => { const on = k === field && msg; el.textContent = on ? msg : ""; fieldEl[k].toggleAttribute("aria-invalid", !!on); });
    }
    function check() {
      const t = idea.value.trim(), c = contact.value.trim();
      if (t.length < 15) return ["idea", "Расскажите чуть подробнее — хотя бы пару предложений."];
      if (SENS.some(r => r.test(t))) return ["idea", "Похоже, в тексте есть пароль, ключ или номер карты. Удалите их — такие данные присылать не нужно."];
      if (!EMAIL.test(c)) return ["contact", "Укажите email для ответа, например name@mail.ru."];
      const g = tg.value.trim();
      if (g && !TG.test(g)) return ["telegram", "Telegram — в виде @username. Поле можно оставить пустым."];
      if (!consent.checked) return ["consent", "Отметьте согласие — без него мы не сможем ответить."];
      return null;
    }
    idea.addEventListener("input", () => { $("#ideaCount").textContent = `${idea.value.length} / 4000`; });
    const show = (kind, html) => { status.className = "form-status " + kind; status.innerHTML = html; };
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const bad = check();
      if (bad) { setErr(...bad); fieldEl[bad[0]].focus(); return; }
      setErr(null);
      if (location.protocol === "file:") {
        show("err", "<b>Отправка недоступна в этой копии.</b> Страница открыта как файл, без приёмника заявок. Заявка <b>не</b> отправлена.");
        return;
      }
      send.disabled = true; send.textContent = "Отправляем…"; show("", "");
      try {
        const r = await fetch("/api/idea", {
          method: "POST", headers: { "Content-Type": "application/json" }, credentials: "omit", cache: "no-store",
          body: JSON.stringify({ idea: idea.value, contact: contact.value, telegram: tg.value, consent: consent.checked, website: $("#website").value, started })
        });
        let js = {}; try { js = await r.json(); } catch (_) { /* пустой ответ */ }
        if (r.ok && js.ok && js.id) {
          form.reset(); $("#ideaCount").textContent = "0 / 4000";
          show("ok", `<b>Спасибо! Мы получили вашу идею.</b> Номер обращения: <code>${esc(js.id)}</code>. Мы изучим её и свяжемся с вами. Первый предварительный разбор бесплатный и ни к чему вас не обязывает.`);
        } else if (js.field && errEl[js.field]) {
          setErr(js.field, js.error); fieldEl[js.field].focus();
        } else {
          show("err", `<b>Не отправлено.</b> ${esc(js.error || "Сервис приёма идей сейчас недоступен.")} Текст остался в форме — попробуйте позже.`);
        }
      } catch (_) {
        show("err", "<b>Не отправлено:</b> нет связи с сервисом. Текст остался в форме — попробуйте ещё раз позже.");
      } finally {
        send.disabled = false; send.textContent = "Отправить идею";
      }
    });
  }

  // ---------- Копирование email
  const copyBtn = $("#copyMailBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText("textsmen@yandex.ru");
        const orig = copyBtn.textContent;
        copyBtn.textContent = "✓ Скопировано";
        copyBtn.classList.add("copied");
        setTimeout(() => { copyBtn.textContent = orig; copyBtn.classList.remove("copied"); }, 2500);
      } catch (_) {
        prompt("Скопируйте адрес:", "textsmen@yandex.ru");
      }
    });
  }

  // ---------- появление при прокрутке и активный пункт меню
  if ("IntersectionObserver" in window && !reduce) {
    $$(".sec-h, .demo, .person, .track, .results, .guard-grid, .fist-grid, .ideas-grid").forEach(el => el.classList.add("reveal"));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });
    $$(".reveal").forEach(el => io.observe(el));
    const links = $$("nav#menu a");
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(s => so.observe(s));
  }
  renderDemo();
})();
