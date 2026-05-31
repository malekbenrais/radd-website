/* =========================================================
   Radd — interactions
   ========================================================= */

// ---- CONFIG: change this to the real business WhatsApp number (international, no +) ----
const WHATSAPP_NUMBER = "971127847488"; // Radd business WhatsApp

/* ---------------- Language (default: Arabic) ---------------- */
const LANG_KEY = "radd_lang";
const htmlEl = document.documentElement;

function applyLang(lang) {
  const isAr = lang === "ar";
  htmlEl.lang = lang;
  htmlEl.dir = isAr ? "rtl" : "ltr";

  document.querySelectorAll("[data-en],[data-ar]").forEach((el) => {
    const val = el.getAttribute(isAr ? "data-ar" : "data-en");
    if (val !== null) el.textContent = val;
  });
  document.querySelectorAll("[data-en-ph],[data-ar-ph]").forEach((el) => {
    const ph = el.getAttribute(isAr ? "data-ar-ph" : "data-en-ph");
    if (ph !== null) el.setAttribute("placeholder", ph);
  });

  // Toggle button shows the OTHER language
  const toggleLabel = document.querySelector("#langToggle span");
  if (toggleLabel) toggleLabel.textContent = isAr ? "EN" : "عربي";

  try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
}

const savedLang = (() => { try { return localStorage.getItem(LANG_KEY); } catch (e) { return null; } })();
applyLang(savedLang || "ar");

document.getElementById("langToggle")?.addEventListener("click", () => {
  applyLang(htmlEl.lang === "ar" ? "en" : "ar");
});

/* ---------------- Mobile menu ---------------- */
const burger = document.getElementById("burger");
const navLinks = document.getElementById("navLinks");
const navScrim = document.getElementById("navScrim");

function setMenu(open) {
  if (!navLinks) return;
  navLinks.classList.toggle("open", open);
  burger?.classList.toggle("open", open);
  navScrim?.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
  burger?.setAttribute("aria-expanded", open ? "true" : "false");
}
function toggleMenu() { setMenu(!navLinks?.classList.contains("open")); }
function closeMenu() { setMenu(false); }

burger?.addEventListener("click", toggleMenu);
navScrim?.addEventListener("click", closeMenu);
navLinks?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
// Close on Escape and when resizing back to desktop
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
window.addEventListener("resize", () => { if (window.innerWidth > 900) closeMenu(); });

/* ---------------- Nav scroll state ---------------- */
const nav = document.getElementById("nav");
const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 12);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

/* ---------------- Scroll reveal (fallback) ----------------
   js/motion-enhance.js normally handles all reveal animations and adds
   <html class="has-motion">. This observer only runs if Motion failed to
   load, so content is never left hidden. */
function initRevealFallback() {
  if (document.documentElement.classList.contains("has-motion")) return;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll("[data-reveal]").forEach((el) => revealObserver.observe(el));
}
window.addEventListener("load", () => setTimeout(initRevealFallback, 400));

/* ---------------- Animated counters ---------------- */
function animateCount(el) {
  const target = parseFloat(el.getAttribute("data-count"));
  const prefix = el.getAttribute("data-prefix") || "";
  const suffix = el.getAttribute("data-suffix") || "";
  const dur = 1400;
  const start = performance.now();
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------------- Hero WhatsApp chat animation ---------------- */
const waBody = document.getElementById("waBody");
const chatScript = {
  ar: [
    { side: "in", text: "السلام عليكم، كم سعر البوتوكس؟ 💉", t: "9:14 م" },
    { side: "out", text: "وعليكم السلام 🌿 أهلاً فيك! البوتوكس يبدأ من ٨٠٠ درهم. تحب أحجز لك موعد؟", t: "9:14 م" },
    { side: "in", text: "إي، بكرة بعد العصر يناسبني", t: "9:15 م" },
    { side: "out", text: "تمام ✅ حجزت لك بكرة الساعة ٥:٣٠ م. بنذكّرك قبل الموعد 🔔", t: "9:15 م" },
  ],
  en: [
    { side: "in", text: "Hi, how much is Botox? 💉", t: "9:14 PM" },
    { side: "out", text: "Hi there 🌿 Welcome! Botox starts at AED 800. Want me to book you in?", t: "9:14 PM" },
    { side: "in", text: "Yes, tomorrow afternoon works", t: "9:15 PM" },
    { side: "out", text: "Done ✅ Booked tomorrow at 5:30 PM. We'll remind you before 🔔", t: "9:15 PM" },
  ],
};

function renderChat() {
  if (!waBody) return;
  const lang = htmlEl.lang === "en" ? "en" : "ar";
  const msgs = chatScript[lang];
  waBody.innerHTML = "";
  let delay = 300;
  msgs.forEach((m, i) => {
    // typing indicator before each outbound reply
    if (m.side === "out") {
      const typing = document.createElement("div");
      typing.className = "bubble bubble--typing";
      typing.innerHTML = "<i></i><i></i><i></i>";
      typing.style.animationDelay = delay + "ms";
      setTimeout(() => waBody.appendChild(typing), delay);
      delay += 700;
      setTimeout(() => typing.remove(), delay);
    }
    const b = document.createElement("div");
    b.className = "bubble bubble--" + m.side;
    b.innerHTML = m.text + "<small>" + m.t + "</small>";
    b.style.animationDelay = "0ms";
    const showAt = delay;
    setTimeout(() => waBody.appendChild(b), showAt);
    delay += 650;
  });
}

// Start chat when hero is visible; re-render on language change
let chatStarted = false;
const heroPhone = document.querySelector(".hero__phone");
if (heroPhone) {
  const heroObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !chatStarted) { chatStarted = true; renderChat(); }
    });
  }, { threshold: 0.3 });
  heroObs.observe(heroPhone);
}
document.getElementById("langToggle")?.addEventListener("click", () => {
  if (chatStarted) renderChat();
});

/* ---------------- WhatsApp links ---------------- */
function waLink(text) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
const waGreeting = {
  ar: "مرحباً، عندي عيادة وأبغى أعرف أكثر عن خدمة رِدّ 👋",
  en: "Hi, I run a clinic and I'd like to know more about Radd 👋",
};
function refreshWaLinks() {
  const lang = htmlEl.lang === "en" ? "en" : "ar";
  const link = waLink(waGreeting[lang]);
  document.getElementById("waBtn")?.setAttribute("href", link);
  document.getElementById("fabWa")?.setAttribute("href", link);
}
refreshWaLinks();
document.getElementById("langToggle")?.addEventListener("click", refreshWaLinks);

/* ---------------- Lead form (emails submissions via FormSubmit) ---------------- */
// Submissions are emailed here. NOTE: the very first submission triggers a
// one-time "Confirm your email" message from FormSubmit — click it once to activate.
const LEAD_EMAIL = "abdelmalek.benrais03@gmail.com";

const form = document.getElementById("leadForm");
const submitBtn = document.getElementById("formSubmit");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const required = ["name", "clinic", "phone"];
  let ok = true;
  required.forEach((id) => {
    const el = document.getElementById(id);
    if (!el.value.trim()) { el.classList.add("invalid"); ok = false; }
    else el.classList.remove("invalid");
  });
  if (!ok) return;

  const isAr = htmlEl.lang !== "en";
  const data = {
    name: form.name.value.trim(),
    clinic: form.clinic.value.trim(),
    phone: form.phone.value.trim(),
    city: form.city.value.trim() || "-",
    message: form.message.value.trim() || "-",
    _subject: "🚀 New Radd lead — " + form.clinic.value.trim(),
    _template: "table",
  };

  // Loading state
  const original = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = isAr ? "جاري الإرسال…" : "Sending…";

  try {
    const res = await fetch("https://formsubmit.co/ajax/" + LEAD_EMAIL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("bad status");
    // Success
    const success = document.getElementById("formSuccess");
    if (success) success.hidden = false;
    form.querySelectorAll("input,textarea").forEach((el) => (el.disabled = true));
    submitBtn.textContent = isAr ? "✓ تم الإرسال" : "✓ Sent";
  } catch (err) {
    console.error("[Radd] form error", err);
    submitBtn.disabled = false;
    submitBtn.textContent = original;
    alert(isAr
      ? "صار خطأ بسيط بالإرسال. جرّب مرة ثانية أو تواصل معنا على الواتساب."
      : "Something went wrong sending the form. Please try again or reach us on WhatsApp.");
  }
});

/* ---------------- Interactive demo ---------------- */
const demoBody = document.getElementById("demoBody");
const demoChips = document.getElementById("demoChips");

const demoQA = {
  ar: [
    { q: "كم سعر البوتوكس؟", a: "أهلين فيك 🌿 البوتوكس عندنا يبدأ من ٨٠٠ درهم حسب المنطقة. تحب أحجزلك استشارة مجانية؟" },
    { q: "تفتحون يوم الجمعة؟", a: "إي نعم ✅ نفتح الجمعة من ٢ الظهر لين ١٠ مساءً. أي وقت يناسبك؟" },
    { q: "وين موقعكم؟", a: "موقعنا في دبي - شارع الشيخ زايد، برج المركز، الطابق ٣. أرسللك الموقع على الخريطة 📍؟" },
    { q: "أبغى أحجز موعد ليزر", a: "بكل سرور 💖 عندنا متاح بكرة ٤:٣٠ أو بعد بكرة ١١ الصبح. أي وحدة أحجزلك؟" },
  ],
  en: [
    { q: "How much is Botox?", a: "Hi there 🌿 Our Botox starts at AED 800 depending on the area. Would you like me to book a free consultation?" },
    { q: "Are you open on Friday?", a: "Yes ✅ We're open Friday from 2pm to 10pm. What time works for you?" },
    { q: "Where are you located?", a: "We're in Dubai — Sheikh Zayed Road, Center Tower, 3rd floor. Want me to send the map pin 📍?" },
    { q: "I'd like to book laser", a: "With pleasure 💖 I have tomorrow 4:30pm or the day after at 11am. Which one shall I book?" },
  ],
};

function pushBubble(side, text, withTyping, done) {
  if (side === "out" && withTyping) {
    const typing = document.createElement("div");
    typing.className = "bubble bubble--typing";
    typing.innerHTML = "<i></i><i></i><i></i>";
    demoBody.appendChild(typing);
    demoBody.scrollTop = demoBody.scrollHeight;
    setTimeout(() => {
      typing.remove();
      const b = document.createElement("div");
      b.className = "bubble bubble--out";
      b.textContent = text;
      demoBody.appendChild(b);
      demoBody.scrollTop = demoBody.scrollHeight;
      if (done) done();
    }, 850);
  } else {
    const b = document.createElement("div");
    b.className = "bubble bubble--" + side;
    b.textContent = text;
    demoBody.appendChild(b);
    demoBody.scrollTop = demoBody.scrollHeight;
    if (done) done();
  }
}

function buildDemoChips() {
  if (!demoChips) return;
  const lang = htmlEl.lang === "en" ? "en" : "ar";
  demoChips.innerHTML = "";
  demoQA[lang].forEach((item, i) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = item.q;
    chip.addEventListener("click", () => {
      chip.disabled = true;
      pushBubble("in", item.q, false, () => {
        setTimeout(() => pushBubble("out", item.a, true), 350);
      });
    });
    demoChips.appendChild(chip);
  });
}

function resetDemo() {
  if (!demoBody) return;
  const lang = htmlEl.lang === "en" ? "en" : "ar";
  demoBody.innerHTML = "";
  pushBubble("out", lang === "ar"
    ? "هلا والله 👋 أنا رِدّ، مساعد العيادة. اسألني أي شي تحت 👇"
    : "Hello 👋 I'm Radd, the clinic's assistant. Tap any question below 👇", false);
  buildDemoChips();
}

if (demoBody) {
  let demoStarted = false;
  const demoObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting && !demoStarted) { demoStarted = true; resetDemo(); }
    });
  }, { threshold: 0.3 });
  demoObs.observe(demoBody);
  document.getElementById("langToggle")?.addEventListener("click", () => {
    if (demoStarted) resetDemo();
  });
}
