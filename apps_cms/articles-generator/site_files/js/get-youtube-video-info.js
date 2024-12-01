SOCIALBROWSER.onLoad(() => {
  alert('Youtube Info Activated');
  function sendData() {
    let title = document.title;
    SOCIALBROWSER.share({ type: 'generator-youtube-video-info', title: title, url: document.location.href, image: { url: document.querySelector('#avatar img').src } });
    SOCIALBROWSER.currentWindow.close();
  }
  setInterval(() => {
    if (document.querySelector('#avatar img') && document.querySelector('#avatar img').src) {
      sendData();
    }
  }, 500);
});
