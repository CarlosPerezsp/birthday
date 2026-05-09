import { HEART_PHOTOS } from "../content.js";
import { randomFloat } from "../utils/random.js";

const SWEEP_MS   = 320;   // matches thumb-sweep-in animation duration
const BETWEEN_MS = 45;    // pause between consecutive sweeps

/**
 * Returns N evenly-spaced positions on the parametric heart curve,
 * normalized to percentage coordinates for the grid container.
 *
 *   x(t) = 16·sin(t)³
 *   y(t) = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t)
 */
function buildHeartPositions(n) {
  const raw = [];
  for (let i = 0; i < n; i++) {
    const t = (2 * Math.PI * i) / n;
    const s = Math.sin(t);
    raw.push({
      x: 16 * s * s * s,
      y: 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t),
    });
  }

  const xs   = raw.map((p) => p.x);
  const ys   = raw.map((p) => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const PAD  = 6; // percent padding from each edge

  return raw.map(({ x, y }) => ({
    left: PAD + ((x - minX) / (maxX - minX)) * (100 - 2 * PAD),
    top:  PAD + ((maxY - y) / (maxY - minY)) * (100 - 2 * PAD), // flip y axis
  }));
}

export function PhotosPhase() {
  const positions = buildHeartPositions(HEART_PHOTOS.length);
  const timers    = [];
  const schedule  = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); };

  return {
    mount(root) {
      const section = document.createElement("section");
      section.className = "hp-stage";

      // Heart grid
      const grid = document.createElement("div");
      grid.className = "hp-heart-grid";

      // Build one thumbnail per photo (all invisible initially)
      const thumbEls = HEART_PHOTOS.map((src, i) => {
        const wrap = document.createElement("div");
        wrap.className = "hp-thumb";
        wrap.style.left = `${positions[i].left}%`;
        wrap.style.top  = `${positions[i].top}%`;
        wrap.style.setProperty("--j", String(i));
        // Alternating sweep direction + random slight rotation
        const rot = randomFloat(-7, 7).toFixed(1);
        wrap.style.setProperty("--sweep-rot", `${rot}deg`);
        wrap.style.setProperty(
          "--sweep-from",
          i % 2 === 0
            ? "inset(0 100% 0 0% round 8px)"
            : "inset(0 0% 0 100% round 8px)"
        );

        const img = document.createElement("img");
        img.src = src;
        img.alt = `Foto ${i + 1}`;
        img.className = "hp-thumb-img";

        wrap.appendChild(img);
        grid.appendChild(wrap);
        return wrap;
      });

      section.appendChild(grid);
      root.appendChild(section);

      // ── Sequence runner ──────────────────────────────────────────────────
      const runPhoto = (index) => {
        if (index >= HEART_PHOTOS.length) {
          // All placed — settle, then pulse the complete heart
          schedule(() => {
            thumbEls.forEach((el, j) => {
              el.classList.remove("hp-thumb--placed");
              el.style.opacity   = "1";
              el.style.transform = "translate(-50%, -50%) scale(1)";
              schedule(() => el.classList.add("hp-thumb--glow"), j * 60);
            });

            // After all glows settle → rain + reload button
            const glowEndMs = (thumbEls.length - 1) * 60 + 900;
            schedule(() => {
              const rain = document.createElement("div");
              rain.className = "hp-rain";
              const symbols = ["♥", "♥", "★", "✦", "♥"];
              for (let i = 0; i < 28; i++) {
                const p = document.createElement("span");
                p.className = "hp-rain-particle";
                p.textContent = symbols[i % symbols.length];
                p.style.setProperty("--x",     `${randomFloat(0, 100).toFixed(1)}%`);
                p.style.setProperty("--delay", `${randomFloat(0, 2.5).toFixed(2)}s`);
                p.style.setProperty("--dur",   `${randomFloat(1.8, 3.2).toFixed(2)}s`);
                p.style.setProperty("--sz",    `${randomFloat(10, 22).toFixed(0)}px`);
                p.style.setProperty("--drift", `${randomFloat(-30, 30).toFixed(0)}px`);
                p.style.setProperty("--spin",  `${randomFloat(120, 400).toFixed(0)}deg`);
                const cols = ["#ff9aaa", "#e8192c", "#ffccd4", "#ff5577"];
                p.style.setProperty("--col", cols[i % cols.length]);
                rain.appendChild(p);
              }
              section.appendChild(rain);

              const btn = document.createElement("button");
              btn.className = "hp-reload";
              btn.setAttribute("aria-label", "Volver a ver");
              btn.innerHTML = "&#x21BA;";
              btn.addEventListener("click", () => location.reload());
              section.appendChild(btn);
              schedule(() => btn.classList.add("hp-reload--visible"), 200);
            }, glowEndMs);
          }, 300);
          return;
        }

        thumbEls[index].classList.add("hp-thumb--placed");
        schedule(() => runPhoto(index + 1), SWEEP_MS + BETWEEN_MS);
      };

      // Brief entrance delay before first photo
      schedule(() => runPhoto(0), 400);

      return () => timers.forEach(clearTimeout);
    },
  };
}

