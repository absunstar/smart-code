function facebookPage_run() {
  SOCIALBROWSER.onLoad(() => {
    alert("Collect Page Post List");

    if (SOCIALBROWSER.facebookPageItem123) {
      SOCIALBROWSER.facebookPage = JSON.parse(
        SOCIALBROWSER.from123(SOCIALBROWSER.facebookPageItem123)
      );
    } else {
      SOCIALBROWSER.facebookPage = { title: "" };
    }
    let list = [];
    let scroll_number = 500;

    function collectPosts() {
      let artic = document.querySelectorAll("[role=article]");

      artic.forEach((art) => {
        let description = art.querySelector("[data-ad-comet-preview=message]");
        if (description) {
          let seeMore = description.querySelector("[role=button]");
          if (seeMore) {
            seeMore.click();
          }
        }
      });
      setTimeout(() => {
        let articles = document.querySelectorAll("[role=article]");
        articles.forEach((article) => {
          let obj = {};
          let url = article.querySelector("span span span span a");
          let image = article.querySelector(
            "a [referrerpolicy=origin-when-cross-origin]"
          );
          let title = article.querySelector("[data-ad-comet-preview=message]");

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
          if (
            obj.image &&
            obj.title &&
            obj.url &&
            !list.find((l) => l.url == url.href)
          ) {
            list.push(obj);

            SOCIALBROWSER.share({
              type: "generator-facebook-page-post",
              url: obj.url,
              image: obj.image,
              title: obj.title,
              page: SOCIALBROWSER.facebookPage,
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
