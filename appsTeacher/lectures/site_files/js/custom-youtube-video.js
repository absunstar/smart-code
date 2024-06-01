function youtubeRun() {
  SOCIALBROWSER.onLoad(() => {
    /* alert('Youtube Video Run'); */

    let timer = null;

    timer = setInterval(() => {
      if (document.querySelector('[aria-label="Share"]')) {
        document.querySelector('[aria-label="Share"]').style.display = "none";
      }
      if (
        document.querySelector("[role=link]") &&
        document.querySelector('[aria-label="Watch on YouTube"]') &&
        document.querySelector('[aria-label="Watch later"]') &&
        document.querySelector('[aria-label="Share"]') &&
        document.querySelector('[data-sessionlink="feature=player-title"]') &&
        document.querySelector('[aria-label="Photo image of Garri Frischer"]') &&
        document.querySelector('[data-sessionlink="feature=player-button"]') &&
        document.querySelector('[class="ytp-title-expanded-heading"]')
      ) {
        document.querySelector("[role=link]").style.display = "none";
        document.querySelector('[aria-label="Watch on YouTube"]').style.display = "none";
        document.querySelector('[aria-label="Watch later"]').style.display = "none";
        document.querySelector('[aria-label="Share"]').style.display = "none";
        document.querySelector('[data-sessionlink="feature=player-title"]').style.display = "none";
        document.querySelector('[aria-label="Photo image of Garri Frischer"]').style.display = "none";
        document.querySelector('[class="ytp-title-expanded-heading"]').style.display = "none";
        document.querySelector('[data-sessionlink="feature=player-button"]').style.display = "none";
        document.querySelector('[aria-live="polite"]').style.display = "none";
      }
    }, 1000);
  });
}
