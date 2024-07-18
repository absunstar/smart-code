function youtubeRun() {
  setInterval(() => {
    window.oncontextmenu = function () {
      if ((div = document.querySelector(".ytp-popup.ytp-contextmenu"))) {
        div.remove();
      }
      return false;
    };
    if ((div = document.querySelector('title'))) {
      div.innerText = '';
    }
    if ((div = document.querySelector('[aria-label="Watch on YouTube"]'))) {
      div.remove();
    }

    if ((div = document.querySelector(".ytp-pause-overlay"))) {
      div.remove();
    }

    if ((div = document.querySelector('[aria-label="Share"]'))) {
      div.style.display = "none";
    }
    if ((div = document.querySelector("[role=link]"))) {
      div.style.display = "none";
    }

    if ((div = document.querySelector('[aria-label="Watch later"]'))) {
      div.style.display = "none";
    }
    if ((div = document.querySelector('[data-sessionlink="feature=player-title"]'))) {
      div.style.display = "none";
    }
    if ((div = document.querySelector('[aria-label="Photo image of Garri Frischer"]'))) {
      div.style.display = "none";
    }
    if ((div = document.querySelector(".ytp-title-expanded-heading"))) {
      div.style.display = "none";
    }
    if ((div = document.querySelector('[data-sessionlink="feature=player-button"]'))) {
      div.style.display = "none";
    }
    if ((div = document.querySelector('[aria-live="polite"]'))) {
      div.style.display = "none";
    }
    if ((div = document.querySelector(".ytp-chrome-top.ytp-show-cards-title"))) {
      div.remove();
    }
    if ((div = document.querySelector('[aria-label="Watch on YouTube"]'))) {
      div.remove();
    }
    if ((div = document.querySelector('[aria-label="Channel watermark"]'))) {
      div.remove();
    }
    if ((div = document.querySelector(".ytp-pause-overlay"))) {
      div.remove();
    }
  }, 200);
}
