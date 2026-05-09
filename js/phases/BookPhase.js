import { PHOTOS } from "../content.js";

export function BookPhase({ stateManager }) {
  let subState      = "closed"; // 'closed' | 'open'
  let currentSpread = 0;
  let isAnimating   = false;
  const timers      = [];
  const totalSpreads = Math.ceil(PHOTOS.length / 2);

  const schedule = (fn, ms) => {
    const id = setTimeout(fn, ms);
    timers.push(id);
  };

  return {
    mount(root) {
      const section = document.createElement("section");
      section.className = "tp-wrap";

      section.innerHTML = `
        <div class="tp-book tp-book--enter" data-tp-book>
          <div class="book-scene">
            <div class="book-left-panel" data-book-left>
              <div class="book-left-page" data-book-left-page>
                <img class="book-photo-left" data-book-photo-left src="" alt="" />
                <div class="book-page-footer">
                  <span class="book-page-num" data-book-num-left></span>
                </div>
              </div>
            </div>
            <div class="book-spine" aria-hidden="true"></div>
            <div class="book-right-panel">
              <div class="book-cover" data-book-cover>
                <span class="book-cover-deco" aria-hidden="true">&#10084;</span>
                <p class="book-cover-title">Recuerdos</p>
                <p class="book-cover-hint">Toca aqu\u00ED</p>
                <span class="book-cover-chevron" aria-hidden="true"></span>
              </div>
              <div class="book-page-right" data-book-page>
                <img class="book-photo" data-book-photo src="" alt="" />
                <div class="book-page-footer">
                  <span class="book-page-num" data-book-num></span>
                  <span class="book-page-hint" data-book-hint></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const coverEl     = section.querySelector("[data-book-cover]");
      const leftEl      = section.querySelector("[data-book-left]");
      const leftPageEl  = section.querySelector("[data-book-left-page]");
      const pageEl      = section.querySelector("[data-book-page]");
      const photoLeftEl = section.querySelector("[data-book-photo-left]");
      const photoEl     = section.querySelector("[data-book-photo]");
      const numLeftEl   = section.querySelector("[data-book-num-left]");
      const numEl       = section.querySelector("[data-book-num]");
      const hintEl      = section.querySelector("[data-book-hint]");

      // — Open book —
      const handleOpenBook = () => {
        if (subState !== "closed" || isAnimating) return;
        isAnimating = true;
        coverEl.classList.add("book-cover--open");
        schedule(() => {
          currentSpread = 0;
          setSpread(photoLeftEl, photoEl, numLeftEl, numEl, hintEl, currentSpread, totalSpreads);
          leftEl.classList.add("book-left-panel--visible");
          pageEl.classList.add("book-page-right--visible");
          subState    = "open";
          isAnimating = false;
        }, 500);
      };

      // — Flip spread —
      const handleFlipPage = () => {
        if (subState !== "open" || isAnimating) return;
        isAnimating = true;
        leftPageEl.classList.add("book-left-page--flip-out");
        pageEl.classList.add("book-page-right--flip-out");

        schedule(() => {
          const next = currentSpread + 1;

          if (next >= totalSpreads) {
            // Last spread: close book → advance phase
            leftEl.classList.remove("book-left-panel--visible");
            leftPageEl.classList.remove("book-left-page--flip-out");
            pageEl.classList.remove("book-page-right--visible", "book-page-right--flip-out");
            coverEl.classList.remove("book-cover--open");
            schedule(() => stateManager.next(), 700);
          } else {
            currentSpread = next;
            leftPageEl.classList.remove("book-left-page--flip-out");
            pageEl.classList.remove("book-page-right--flip-out");
            void pageEl.offsetWidth; // force reflow
            setSpread(photoLeftEl, photoEl, numLeftEl, numEl, hintEl, currentSpread, totalSpreads);
            leftPageEl.classList.add("book-left-page--flip-in");
            pageEl.classList.add("book-page-right--flip-in");
            schedule(() => {
              leftPageEl.classList.remove("book-left-page--flip-in");
              pageEl.classList.remove("book-page-right--flip-in");
              isAnimating = false;
            }, 460);
          }
        }, 440);
      };

      coverEl.addEventListener("click", handleOpenBook);
      pageEl.addEventListener("click", handleFlipPage);

      root.appendChild(section);

      return () => {
        timers.forEach(clearTimeout);
        coverEl.removeEventListener("click", handleOpenBook);
        pageEl.removeEventListener("click", handleFlipPage);
      };
    },
  };
}

function setSpread(photoLeftEl, photoRightEl, numLeftEl, numRightEl, hintEl, spreadIndex, totalSpreads) {
  const leftIdx  = spreadIndex * 2;
  const rightIdx = leftIdx + 1;
  const total    = PHOTOS.length;

  photoLeftEl.src = PHOTOS[leftIdx] ?? "";
  photoLeftEl.alt = `Foto ${leftIdx + 1}`;
  numLeftEl.textContent = `${leftIdx + 1} / ${total}`;

  if (rightIdx < total) {
    photoRightEl.src = PHOTOS[rightIdx];
    photoRightEl.alt = `Foto ${rightIdx + 1}`;
    numRightEl.textContent = `${rightIdx + 1} / ${total}`;
  } else {
    photoRightEl.src = "";
    photoRightEl.alt = "";
    numRightEl.textContent = "";
  }

  hintEl.textContent =
    spreadIndex < totalSpreads - 1 ? "Toca para ver la siguiente" : "Toca para continuar";
}
