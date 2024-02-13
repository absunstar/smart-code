function facebookPage_run() {
  SOCIALBROWSER.onLoad(() => {
    alert('Facebook Page Info Activated');
    let page = {
      url: document.location.href,
    };
    let timer = null;

    function sendData() {
      page.cover = { url: document.querySelector('[data-imgperflogname=profileCoverPhoto]').src };
      page.title = document.querySelector('h1').innerText;
      page.image = {url :document.querySelector('[mask="url(#:rq:)"] image').getAttribute('xlink:href')};
      if (page.title && page.image && page.image.url) {
        clearInterval(timer);
        SOCIALBROWSER.share({ type: 'generator-facebook-page', page: page });
        SOCIALBROWSER.currentWindow.close();
      }
    }
    timer = setInterval(() => {
      if (
        document.querySelector('[mask="url(#:rq:)"] image') &&
        document.querySelector('[mask="url(#:rq:)"] image').getAttribute('xlink:href') &&
        document.querySelector('h1') &&
        document.querySelector('h1').innerText
      ) {
        sendData();
      }
    }, 1000);
  });
}
