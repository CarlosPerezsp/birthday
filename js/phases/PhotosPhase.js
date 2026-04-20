import { HEART_PHOTOS } from "../content.js";

const SPOTLIGHT_IN_MS   = 350;   // matches CSS transition on .hp-spotlight
const SPOTLIGHT_HOLD_MS = 1000;  // how long the photo stays large
const FLY_MS            = 650;   // matches thumb-fly-in animation duration
const BETWEEN_MS        = 180;   // pause after fly before next photo starts

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

      // Spotlight — big centered photo
      const spotlight = document.createElement("div");
      spotlight.className = "hp-spotlight";
      const spotImg = document.createElement("img");
      spotImg.className = "hp-spotlight-img";
      spotImg.alt = "";
      spotlight.appendChild(spotImg);

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

        const img = document.createElement("img");
        img.src = src;
        img.alt = `Foto ${i + 1}`;
        img.className = "hp-thumb-img";

        wrap.appendChild(img);
        grid.appendChild(wrap);
        return wrap;
      });

      section.appendChild(spotlight);
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
              schedule(() => el.classList.add("hp-thumb--glow"), j * 80);
            });
          }, 500);
          return;
        }

        // 1. Show photo large in spotlight
        spotImg.src = HEART_PHOTOS[index];
        spotlight.classList.add("hp-spotlight--visible");

        // 2. After fade-in + hold → fade out spotlight & fly thumb to position
        schedule(() => {
          spotlight.classList.remove("hp-spotlight--visible");

          const thumb = thumbEls[index];
          const rect  = thumb.getBoundingClientRect();
          // Calculate offset from thumb center to screen center
          const dx = window.innerWidth  / 2 - (rect.left + rect.width  / 2);
          const dy = window.innerHeight / 2 - (rect.top  + rect.height / 2);

          thumb.style.setProperty("--dx", `${dx}px`);
          thumb.style.setProperty("--dy", `${dy}px`);
          thumb.classList.add("hp-thumb--placed");

          // 3. Move to next photo after fly completes
          schedule(() => runPhoto(index + 1), FLY_MS + BETWEEN_MS);
        }, SPOTLIGHT_IN_MS + SPOTLIGHT_HOLD_MS);
      };

      // Brief entrance delay before first photo
      schedule(() => runPhoto(0), 700);

      return () => timers.forEach(clearTimeout);
    },
  };
}

