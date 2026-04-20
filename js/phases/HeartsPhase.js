import { randomFloat, randomInt } from "../utils/random.js";

// "Feliz Cumpleaños Angy" = 21 chars × 85 ms + 0.5 s delay ≈ 2.3 s fully visible
const CHAR_DELAY_MS     = 85;
const CHAR_START_MS     = 500;
const BTN_REVEAL_DELAY_MS = CHAR_START_MS + 21 * CHAR_DELAY_MS + 600; // ~2900 ms

export function HeartsPhase({ stateManager }) {
  let timerBtn = null;

  const handleContinue = () => {
    stateManager.next();
  };

  return {
    mount(root) {
      const section = document.createElement("section");
      section.className = "hearts-phase";
      section.innerHTML = `
        <div class="hearts-cascade" aria-hidden="true"></div>
        <div class="hearts-content">
          <h1 class="bday-text" aria-label="Feliz Cumplea\u00F1os Angy"></h1>
          <button class="bday-arrow" type="button" data-next aria-label="Continuar">
            <span class="bday-arrow-icon"></span>
          </button>
        </div>
      `;

      const cascade    = section.querySelector(".hearts-cascade");
      const titleEl    = section.querySelector(".bday-text");
      const nextButton = section.querySelector("[data-next]");

      createCascadeHearts(35).forEach((h) => cascade.appendChild(h));
      buildTitle(titleEl, "Feliz Cumplea\u00F1os Angy <3");

      nextButton.addEventListener("click", handleContinue);

      timerBtn = setTimeout(() => {
        nextButton.classList.add("bday-arrow--visible");
      }, BTN_REVEAL_DELAY_MS);

      root.appendChild(section);

      return () => {
        clearTimeout(timerBtn);
        nextButton.removeEventListener("click", handleContinue);
      };
    },
  };
}

function buildTitle(el, text) {
  [...text].forEach((char, i) => {
    const span = document.createElement("span");
    span.className = "bday-char";
    span.style.setProperty("--i", i);
    span.textContent = char === " " ? "\u00A0" : char;
    el.appendChild(span);
  });
}

function createCascadeHearts(count) {
  const nodes = [];

  for (let i = 0; i < count; i++) {
    const heart = document.createElement("div");
    heart.className = "cascade-heart";

    const size     = randomInt(10, 26);
    const left     = randomFloat(0, 100);
    const duration = randomFloat(3, 9);
    const delay    = randomFloat(-10, 1);

    heart.style.left = `${left}%`;
    heart.style.setProperty("--sz", `${size}px`);
    heart.style.animationDuration = `${duration}s`;
    heart.style.animationDelay    = `${delay}s`;

    nodes.push(heart);
  }

  return nodes;
}
