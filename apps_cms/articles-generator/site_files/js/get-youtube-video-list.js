function xxx_run() {
  SOCIALBROWSER.onLoad(() => {
    alert('Collect Channel Video List');
    if (SOCIALBROWSER.youtubeItem123) {
      SOCIALBROWSER.youtubeChannel = JSON.parse(SOCIALBROWSER.from123(SOCIALBROWSER.youtubeItem123));
      delete window.youtubeItem123;
    } else {
      SOCIALBROWSER.youtubeChannel = { title: 'xxxxxxxxxxxxx' };
    }
    let list = [];
    let scroll_number = 500;
    function collectVideos() {
      document.querySelectorAll('ytd-rich-item-renderer').forEach((div) => {
        let a = div.querySelector('#video-title-link');

        if (a && !list.find((l) => l.url == a.href)) {
          let url = a.href;
          let title = a.innerText;
          let image = {};
          let img = div.querySelector('img');
          if (img && img.getAttribute('src')) {
            image.url = img.getAttribute('src');
          } else {
            return;
          }

          list.push({
            url: url,
          });
          SOCIALBROWSER.share({ type: 'generator-youtube-video', url: url, image: image, title: title, channel: SOCIALBROWSER.youtubeChannel });
        }
      });
      window.scrollTo(0, scroll_number);
      scroll_number += 500;
    }

    function sendData() {
      let title = document.title;
      SOCIALBROWSER.share({ type: 'youtubeChnnelVideo', title: title, url: document.location.href, image: { url: document.querySelector('#avatar img').src } });
      SOCIALBROWSER.currentWindow.close();
    }

    setInterval(() => {
      collectVideos();
    }, 1000);
  });
}
