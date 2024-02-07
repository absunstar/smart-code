function facebook_run() {
  SOCIALBROWSER.onLoad(() => {

    alert('Collect Group Post List');

    if (SOCIALBROWSER.facebookItem123) {
      SOCIALBROWSER.facebookGroup = JSON.parse(SOCIALBROWSER.from123(SOCIALBROWSER.facebookItem123));
    } else {
      SOCIALBROWSER.facebookGroup = { title: '' };
    }

    let list = [];
    let scroll_number = 500;

    function collectPosts() {
      
      let articles = document.querySelectorAll('[role=feed]')[0];
      articles.childNodes.forEach((article) => {

        let obj = {};

        let userName = article.querySelector('h3');
        let userImage = article.querySelector('image');
        let userLink = article.querySelector('h3 a');
        let url = article.querySelector('span a');
        let image = article.querySelector('a img');
        let title = article.querySelector('[data-ad-comet-preview=message]');
        let reacts = article.querySelector('[role=button] span');

        if (userName) {
          obj.userName = userName.innerText;
        } else {
          return;
        }
        if (userLink) {
          obj.userLink = userLink.href;
        }
        if (userImage && userImage.href) {
          obj.userImage = { url: userImage.href.baseVal };
        }
        if (url) {
          obj.url = url.href;
        }
        if (image) {
          obj.image = { url: image.src };
        }
        if (title) {
          obj.title = title.innerText || '';
        } else {
          obj.title = '';
        }
        if (reacts) {
          obj.reacts = reacts.innerText || '0';
        }
        if (obj.image && obj.title && url && !list.find((l) => l.url == url.href)) {
          list.push(obj);

          SOCIALBROWSER.share({
            type: 'generator-facebook-post',
            url: obj.url,
            image: obj.image,
            title: obj.title,
            group: SOCIALBROWSER.facebookGroup,
          });
        }
      });

      window.scrollTo(0, scroll_number);
      scroll_number += 500;
    }

    setInterval(() => {
      collectPosts();
    }, 1000);
  });
}
