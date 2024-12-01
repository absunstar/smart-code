SOCIALBROWSER.onLoad(() => {
  alert('Youtube Info Activated');
  let channel = {
    url: document.location.href,
    title: document.title,
  };
  let timer = null;

  function sendData() {
    clearInterval(timer);
    alert('Youtube Info Done');
    channel.image = { url: document.querySelector('img.yt-core-image[src]').src };
    SOCIALBROWSER.share({ type: 'generator-youtube-channel', channel: channel });
    setTimeout(() => {
       SOCIALBROWSER.currentWindow.close();
    }, 1000 * 1);
  }

  timer = setInterval(() => {
    if (document.querySelector('img.yt-core-image[src]')) {
      sendData();
    }
  }, 1000);
});
