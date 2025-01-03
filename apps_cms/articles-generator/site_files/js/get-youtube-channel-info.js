SOCIALBROWSER.onLoad(() => {
  alert('Youtube Info Activated');
  let channelLogoSelector = 'yt-decorated-avatar-view-model img[src]';

  let timer = null;

  function sendData() {
    clearInterval(timer);
    let channel = {
      url: document.location.href,
      title: document.title,
    };
    channel.image = { url: document.querySelector(channelLogoSelector).src };
    SOCIALBROWSER.share({ type: 'generator-youtube-channel', channel: channel });
    setTimeout(() => {
      SOCIALBROWSER.currentWindow.close();
    }, 1000 * 1);
  }

  timer = setInterval(() => {
    if (document.querySelector(channelLogoSelector)) {
      sendData();
    }
  }, 1000 * 3);
});
