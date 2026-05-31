/* =========================================================
   Radd — Motion-powered animations (progressive enhancement)
   Library: Motion (https://motion.dev), loaded from CDN as an ES module.
   Follows ui-ux-pro-max guidance: scroll reveals set initial states,
   stagger ≤100ms (total < 500ms), micro-interactions < 300ms, and
   prefers-reduced-motion is fully respected.
   If this module fails to load, main.js runs an IntersectionObserver
   fallback so content is never left hidden.
   ========================================================= */
import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11/+esm";

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
}
