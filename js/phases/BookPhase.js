import { PHOTOS } from "../content.js";

export function BookPhase({ stateManager }) {
  let subState    = "closed"; // 'closed' | 'open'
  let currentPage = 0;
  let isAnimating = false;
  const timers    = [];

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
            <div class="book-spine" aria-hidden="true"></div>
            <div class="book-cover" data-book-cover>
              <span class="book-cover-deco" aria-hidden="true">&#10084;</span>
              <p class="book-cover-title">Recuerdos</p>
              <p class="book-cover-hint">Toca aqu\u00ED</p>
              <span class="book-cover-chevron" aria-hidden="true"></span>
            </div>
            <div class="book-page" data-book-page>
              <img class="book-photo" data-book-photo src="" alt="" />
              <div class="book-page-footer">
                <span class="book-page-num" data-book-num>1 / ${PHOTOS.length}</span>
                <span class="book-page-hint" data-book-hint>Toca para ver la siguiente</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const coverEl  = section.querySelector("[data-book-cover]");
      const pageEl   = section.querySelector("[data-book-page]");
      const photoEl  = section.querySelector("[data-book-photo]");
      const numEl    = section.querySelector("[data-book-num]");
      const hintEl   = section.querySelector("[data-book-hint]");

      // — Open book —
      const handleOpenBook = () => {
        if (subState !== "closed" || isAnimating) return;
        isAnimating = true;
        coverEl.classList.add("book-cover--open");
        schedule(() => {
          currentPage = 0;
          setPage(photoEl, numEl, hintEl, currentPage);
          pageEl.classList.add("book-page--visible");
          subState    = "open";
          isAnimating = false;
        }, 500);
      };

      // — Flip page —
      const handleFlipPage = () => {
        if (subState !== "open" || isAnimating) return;
        isAnimating = true;
        pageEl.classList.add("book-page--flip-out");

        schedule(() => {
          const next = currentPage + 1;

          if (next >= PHOTOS.length) {
            // Last page: close book → advance phase
            pageEl.classList.remove("book-page--visible", "book-page--flip-out");
            coverEl.classList.remove("book-cover--open");
            schedule(() => stateManager.next(), 700);
          } else {
            currentPage = next;
            pageEl.classList.remove("book-page--flip-out");
            void pageEl.offsetWidth; // force reflow
            setPage(photoEl, numEl, hintEl, currentPage);
            pageEl.classList.add("book-page--flip-in");
            schedule(() => {
              pageEl.classList.remove("book-page--flip-in");
              isAnimating = false;
            }, 340);
          }
        }, 330);
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

function setPage(photoEl, numEl, hintEl, index) {
  photoEl.src = PHOTOS[index];
  photoEl.alt = `Foto ${index + 1}`;
  numEl.textContent  = `${index + 1} / ${PHOTOS.length}`;
  hintEl.textContent =
    index < PHOTOS.length - 1 ? "Toca para ver la siguiente" : "Toca para continuar";
}
