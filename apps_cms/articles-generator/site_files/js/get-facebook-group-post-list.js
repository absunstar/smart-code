function facebookGroup_run() {
  SOCIALBROWSER.onLoad(() => {

    alert("Collect Group Post List");

    if (SOCIALBROWSER.facebookGroupItem123) {
      SOCIALBROWSER.facebookGroup = JSON.parse(
        SOCIALBROWSER.from123(SOCIALBROWSER.facebookGroupItem123)
      );
    } else {
      SOCIALBROWSER.facebookGroup = { title: "" };
    }
    let list = [];
    let scroll_number = 500;


    function collectPosts() {
      let artic = document.querySelectorAll("[role=feed]")[0];

      artic.childNodes.forEach((art) => {
        let description = art.querySelector("[data-ad-comet-preview=message]");
        if (description) {
          let seeMore = description.querySelector("[role=button]");
          if (seeMore) {
            seeMore.click();
          }
        }
      });
      setTimeout(() => {
        let articles = document.querySelectorAll("[role=feed]")[0];
        articles.childNodes.forEach((article) => {
          let obj = {};
          let username = article.querySelector("h3");
          let userImage = article.querySelector("image");
          let userLink = article.querySelector("h3 a");
          let url = article.querySelector("span span span span a");
          let image = article.querySelector("a [referrerpolicy=origin-when-cross-origin]");
          let title = article.querySelector("[data-ad-comet-preview=message]");
          let reacts = article.querySelector("[role=button] span");

          if (username) {
            obj.username = username.innerText;
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
            obj.title = title.innerText || "";
          } else {
            obj.title = "";
          }
          if (reacts) {
            obj.reacts = reacts.innerText || "0";
          }
          if (
            obj.image &&
            obj.title &&
            obj.url &&
            !list.find((l) => l.url == url.href)
          ) {
            list.push(obj);

            SOCIALBROWSER.share({
              type: "generator-facebook-group-post",
              url: obj.url,
              image: obj.image,
              title: obj.title,
              group: SOCIALBROWSER.facebookGroup,
            });
          }
        });

        window.scrollTo(0, scroll_number);
        scroll_number += 1000;
      }, 1000);
    }

    setInterval(() => {
      collectPosts();
    }, 2000);
  });
}










