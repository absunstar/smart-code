SOCIALBROWSER.onLoad(() => {
  alert('Youtube Info Activated');
  let channel = {
    url: document.location.href,
    title: document.title,
  };
  let timer = null;

  function sendData() {
    channel.image = { url: document.querySelector('#avatar img').src };
    clearInterval(timer);
    SOCIALBROWSER.share({ type: 'generator-youtube-channel', channel: channel });
    SOCIALBROWSER.currentWindow.close();
  }

  timer = setInterval(() => {
    if (document.querySelector('#avatar img') && document.querySelector('#avatar img').src) {
      sendData();
    }
  }, 500);
});
