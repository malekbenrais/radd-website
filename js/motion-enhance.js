/* =========================================================
   Radd — Motion-powered animations (progressive enhancement)
   Library: Motion (https://motion.dev), loaded from CDN as an ES module.
   Follows ui-ux-pro-max guidance: scroll reveals set initial states,
   stagger ≤100ms (total < 500ms), micro-interactions < 300ms, and
   prefers-reduced-motion is fully respected.
   If this module fails to load, main.js runs an IntersectionObserver
   fallback so content is never left hidden.
   ========================================================= */
import { animate, inView, stagger, scroll } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

const root2 = document.documentElement;
root2.classList.add("has-spring-count"); // tells main.js to skip its basic counter

const root = document.documentElement;
root.classList.add("has-motion"); // tells main.js to skip its fallback reveal

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE = [0.22, 0.61, 0.36, 1];

function showAll() {
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

if (reduce) {
  showAll();
} else {
  /* ---- Hero: staggered entrance on load ---- */
  const heroItems = Array.from(
    document.querySelectorAll(".hero__copy [data-reveal], .hero__phone")
  );
  if (heroItems.length) {
    animate(
      heroItems,
      { opacity: [0, 1], transform: ["translateY(28px)", "translateY(0px)"] },
      { delay: stagger(0.09), duration: 0.7, easing: EASE }
    );
  }

  /* ---- Standalone reveals (not inside a grid) ---- */
  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (el.closest(".hero__copy") || el.classList.contains("hero__phone")) return;
    if (el.closest(".grid")) return; // grid children handled by the stagger block
    if (el.classList.contains("section__head")) return; // its children animate (stagger block below)
    inView(
      el,
      () => {
        animate(
          el,
          { opacity: [0, 1], transform: ["translateY(30px)", "translateY(0px)"] },
          { duration: 0.6, easing: EASE }
        );
      },
      { amount: 0.15 }
    );
  });

  /* ---- Grid children: pop in one after another ---- */
  document.querySelectorAll(".grid").forEach((grid) => {
    // The #solution feature grid is driven by the scroll-pinned reveal below.
    if (grid.closest("#solution")) return;
    const cards = grid.querySelectorAll(".card, .stat, .step, .why, .result");
    if (cards.length < 2) return;
    cards.forEach((c) => (c.style.opacity = "0"));
    inView(
      grid,
      () => {
        animate(
          cards,
          { opacity: [0, 1], transform: ["translateY(26px) scale(0.98)", "translateY(0px) scale(1)"] },
          { delay: stagger(0.07), duration: 0.55, easing: EASE }
        );
      },
      { amount: 0.1 }
    );
  });

  /* ---- Primary buttons: subtle scale feedback (micro-interaction) ---- */
  document.querySelectorAll(".btn--primary, .btn--whatsapp").forEach((b) => {
    b.addEventListener("pointerenter", () => animate(b, { scale: 1.035 }, { duration: 0.18, easing: EASE }));
    b.addEventListener("pointerleave", () => animate(b, { scale: 1 }, { duration: 0.22, easing: EASE }));
    b.addEventListener("pointerdown", () => animate(b, { scale: 0.97 }, { duration: 0.1 }));
    b.addEventListener("pointerup", () => animate(b, { scale: 1.035 }, { duration: 0.12 }));
  });

  /* ---- Hero badges: gentle continuous bob ---- */
  document.querySelectorAll(".hero__badge").forEach((badge, i) => {
    animate(
      badge,
      { transform: ["translateY(0px)", "translateY(-10px)", "translateY(0px)"] },
      { duration: 4 + i, repeat: Infinity, easing: "ease-in-out" }
    );
  });

  /* ---- Section headings: title + subtext rise together ---- */
  document.querySelectorAll(".section__head").forEach((head) => {
    const parts = head.querySelectorAll(".eyebrow, h2, p");
    if (!parts.length) return;
    parts.forEach((p) => (p.style.opacity = "0"));
    inView(
      head,
      () => {
        animate(
          parts,
          { opacity: [0, 1], transform: ["translateY(20px)", "translateY(0px)"] },
          { delay: stagger(0.08), duration: 0.55, easing: EASE }
        );
      },
      { amount: 0.3 }
    );
  });

  /* ---- Featured pricing card: slow breathing glow to draw the eye ---- */
  const featured = document.querySelector(".price--featured");
  if (featured) {
    animate(
      featured,
      { boxShadow: [
        "0 12px 36px rgba(7,20,15,.10)",
        "0 20px 50px rgba(18,165,148,.28)",
        "0 12px 36px rgba(7,20,15,.10)"
      ] },
      { duration: 3.5, repeat: Infinity, easing: "ease-in-out" }
    );
  }
}

/* ---- Scroll progress bar (runs regardless of reduced-motion: it's informational, not decorative) ---- */
const bar = document.getElementById("scrollbar");
if (bar) {
  scroll((progress) => {
    bar.style.transform = `scaleX(${progress})`;
  });
}

/* ---- Subtle parallax on the hero background glow ---- */
if (!reduce) {
  const heroBg = document.querySelector(".hero__bg");
  const heroSection = document.querySelector(".hero");
  if (heroBg && heroSection) {
    scroll(
      (progress) => { heroBg.style.transform = `translateY(${progress * 70}px)`; },
      { target: heroSection, offset: ["start start", "end start"] }
    );
  }
}

/* =========================================================
   Spring-eased number counters (replaces main.js basic version)
   A critically-damped spring settles the number naturally — no
   linear ramp. Honors prefers-reduced-motion by snapping to final.
   ========================================================= */
function springCount(el) {
  const target = parseFloat(el.getAttribute("data-count"));
  const prefix = el.getAttribute("data-prefix") || "";
  const suffix = el.getAttribute("data-suffix") || "";
  if (isNaN(target)) return;
  if (reduce) { el.textContent = prefix + target + suffix; return; }

  // Simple spring integrator (stiffness/damping) for an organic settle.
  let value = 0, velocity = 0;
  const stiffness = 90, damping = 16, mass = 1;
  let last = null;
  function frame(now) {
    if (last === null) last = now;
    let dt = (now - last) / 1000; last = now;
    if (dt > 0.05) dt = 0.05; // clamp after tab switches
    const force = -stiffness * (value - target);
    const damp = -damping * velocity;
    velocity += (force + damp) / mass * dt;
    value += velocity * dt;
    if (Math.abs(target - value) < 0.5 && Math.abs(velocity) < 0.5) {
      el.textContent = prefix + target + suffix;
      return;
    }
    el.textContent = prefix + Math.round(value) + suffix;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
document.querySelectorAll("[data-count]").forEach((el) => {
  inView(el, () => springCount(el), { amount: 0.6 });
});

/* =========================================================
   Scroll-pinned reveal of the 3 engine features
   As the Solution section scrolls through, each feature card
   rises and brightens in sequence, scrubbed to scroll position.
   ========================================================= */
if (!reduce) {
  const solution = document.querySelector("#solution");
  const featureCards = solution ? Array.from(solution.querySelectorAll(".feature")) : [];
  if (featureCards.length) {
    featureCards.forEach((c) => { c.style.opacity = "0"; c.style.transform = "translateY(40px)"; });
    scroll(
      (progress) => {
        featureCards.forEach((card, i) => {
          // each card occupies a slice of the scroll range
          const slice = 1 / featureCards.length;
          const local = Math.min(Math.max((progress - i * slice * 0.6) / slice, 0), 1);
          card.style.opacity = String(local);
          card.style.transform = `translateY(${40 - local * 40}px)`;
        });
      },
      { target: solution, offset: ["start 0.85", "center 0.55"] }
    );
  }
}

/* =========================================================
   Before / After scroll-scrub: the missed message dissolves,
   the booked-patient conversation slides in to replace it.
   ========================================================= */
if (!reduce) {
  const ba = document.querySelector("#ba");
  const before = ba && ba.querySelector(".ba__phone--before");
  const after = ba && ba.querySelector(".ba__phone--after");
  const arrow = ba && ba.querySelector(".ba__arrow");
  const wordBefore = ba && ba.querySelector(".ba__word--before");
  const wordAfter = ba && ba.querySelector(".ba__word--after");
  if (ba && before && after) {
    // initial state: only the "before" is visible
    after.style.opacity = "0";
    after.style.transform = "translateY(30px) scale(0.96)";
    if (arrow) { arrow.style.opacity = "0"; }
    if (wordAfter) { wordAfter.style.opacity = "0.25"; }
    scroll(
      (p) => {
        // p: 0 -> 1 across the tall pinned section
        // Phase 1 (0-0.5): before fades & desaturates. Phase 2 (0.4-1): after rises in.
        const fade = Math.min(p / 0.5, 1);
        before.style.opacity = String(1 - fade * 0.65);
        before.style.filter = `grayscale(${fade}) blur(${fade * 1.5}px)`;
        before.style.transform = `translateY(${fade * -10}px) scale(${1 - fade * 0.04})`;

        const rise = Math.min(Math.max((p - 0.4) / 0.6, 0), 1);
        after.style.opacity = String(rise);
        after.style.transform = `translateY(${30 - rise * 30}px) scale(${0.96 + rise * 0.04})`;
        if (arrow) arrow.style.opacity = String(Math.min(Math.max((p - 0.3) / 0.3, 0), 1));
        if (wordBefore) wordBefore.style.opacity = String(1 - fade * 0.75);
        if (wordAfter) wordAfter.style.opacity = String(0.25 + rise * 0.75);
      },
      { target: ba, offset: ["start start", "end end"] }
    );
  }
}
