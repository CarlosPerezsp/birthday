import { BDAY_PARAGRAPHS } from "../content.js";

const PARA_START_MS   = 400;
const PARA_DELAY_MS   = 900;
const PARA_ANIM_MS    = 700;
const ARROW_REVEAL_MS =
  PARA_START_MS + (BDAY_PARAGRAPHS.length - 1) * PARA_DELAY_MS + PARA_ANIM_MS + 400;

export function TextPhase({ stateManager }) {
  let timer = null;

  return {
    mount(root) {
      const section = document.createElement("section");
      section.className = "tp-wrap";

      const paras = BDAY_PARAGRAPHS
        .map((t, i) => `<p class="tp-para" style="--i:${i}">${t}</p>`)
        .join("\n        ");

      section.innerHTML = `
        <div class="tp-reading">
          <div class="tp-text-card">
            ${paras}
          </div>
          <button class="bday-arrow" type="button" data-next aria-label="Continuar">
            <span class="bday-arrow-icon" aria-hidden="true"></span>
          </button>
        </div>
      `;

      const nextBtn = section.querySelector("[data-next]");
      const handleNext = () => stateManager.next();
      nextBtn.addEventListener("click", handleNext);

      timer = setTimeout(() => {
        nextBtn.classList.add("bday-arrow--visible");
      }, ARROW_REVEAL_MS);

      root.appendChild(section);

      return () => {
        clearTimeout(timer);
        nextBtn.removeEventListener("click", handleNext);
      };
    },
  };
}
