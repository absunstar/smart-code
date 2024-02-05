function facebook_run() {
  SOCIALBROWSER.onLoad(() => {
    alert('Facebook Info Activated');
    let group = {
      url: document.location.href,
    };
    let timer = null;

    function sendData() {
      group.image = { url: document.querySelector('[data-imgperflogname=profileCoverPhoto]').src };
      group.title = document.querySelector('h1 a').innerText;
      clearInterval(timer);
      SOCIALBROWSER.share({ type: 'generator-facebook-group', group: group });
      SOCIALBROWSER.currentWindow.close();
    }

    timer = setInterval(() => {
      if (document.querySelector('[data-imgperflogname=profileCoverPhoto]') && document.querySelector('[data-imgperflogname=profileCoverPhoto]').src && document.querySelector('h1 a') && document.querySelector('h1 a').innerText) {
        sendData();
      }
    }, 500);
  });
}
