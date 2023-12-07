module.exports = function init(site) {
  site.bloggerManager = {
    url: 'https://download-torrents-movie.blogspot.com/',
    key: 'AIzaSyD_BmzCVbI4sqisSoHX6_wHx3pmJhmZQNk',
    client_id: '622443491605-pnin27en8im3ti8hag7ov28drge372up.apps.googleusercontent.com',
    client_secret: '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',
    scope: 'https://www.googleapis.com/auth/blogger',
    redirectURL: 'https://egytag.com/api/generator/set-bloger-code',
    codeURL: '',
    code: '',
    access_token: '',
    token_type: 'Bearer',
    blogger: {},
    list: [],
  };

  site.bloggerManager.getCodeURL = function () {
    site.bloggerManager.codeURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${site.bloggerManager.client_id}&redirect_uri=${site.bloggerManager.redirectURL}&scope=${site.bloggerManager.scope}&response_type=code`;
    return site.bloggerManager.codeURL;
  };

  site.bloggerManager.requestAccessToken = function (callback) {
    site
      .fetch(
        'https://oauth2.googleapis.com/token?grant_type=authorization_code&client_id=' +
          site.bloggerManager.client_id +
          '&client_secret=' +
          site.bloggerManager.client_secret +
          '&code=' +
          site.bloggerManager.code +
          '&redirect_uri=' +
          site.bloggerManager.redirectURL,
        {
          method: 'post',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      )
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          site.bloggerManager.access_token = data.access_token;
        }
        if (data.refresh_token) {
          site.bloggerManager.refresh_token = data.refresh_token;
        }
        if (data.token_type) {
          site.bloggerManager.token_type = data.token_type;
        }
        callback();
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
        callback();
      });
  };

  site.bloggerManager.refreshAccessToken = function (callback) {
    site
      .fetch(
        'https://oauth2.googleapis.com/token' +
          '?grant_type=refresh_token&refresh_token=' +
          site.bloggerManager.access_token +
          '&client_id=' +
          site.bloggerManager.client_id +
          '&client_secret=' +
          site.bloggerManager.client_secret +
          '&code=' +
          site.bloggerManager.code +
          '&redirect_uri=' +
          site.bloggerManager.redirectURL,
        {
          method: 'post',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      )
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          site.bloggerManager.access_token = data.access_token;
        }
        if (data.refresh_token) {
          site.bloggerManager.refresh_token = data.refresh_token;
        }
        if (data.token_type) {
          site.bloggerManager.token_type = data.token_type;
        }
        callback(data);
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
        callback();
      });
  };

  site.bloggerManager.getBloggerInfo = function (callback) {
    site
      .fetch('https://www.googleapis.com/blogger/v3/blogs/byurl?url=' + site.bloggerManager.url + '&key=' + site.bloggerManager.key)
      .then((res) => res.json())
      .then((data) => {
        site.bloggerManager.blogger = data;
        callback(data);
      })
      .catch((err) => {
        console.log(err);
        callback();
      });
  };

  site.bloggerManager.sendBloggerPosts = function (options) {
    site.articlesList
      .filter((a) => a.host.like(site.getHostFilter('torrents')))
      .slice(100, 150)
      .forEach((a, i) => {
        setTimeout(() => {
          let $torrentsURLS = '';
          a.yts.torrents.forEach((t) => {
            $torrentsURLS += `<a class="bold btn btn-primary" target="_blank" href="${t.url}"> Download ${t.quality} ( ${t.size} ) Torrent </a>`;
          });

          let $content = `
          <style>
          html[data-theme=dark]{
            --link-color: #ffffff;
          }
          
          </style>
            <div class="center">
              <img src="${a.$imageURL}">
            </div>

            <div class="row text-center">
              <p class="bold">Movie Rating : <span class="text-success"> ${a.yts.rating} </span></p>
              <p class="bold">Movie Language : <span class="text-success"> ${a.yts.language} </span></p>
              <p class="bold">Movie Type : <span class="text-success"> ${a.yts.type} </span></p>
            </div>

            <div> ${a.$content}</div>

              <div class="d-flex gap-3 justify-content-center">
                <a target="_blank" class="bold  btn btn-warning" href="${a.yts.$imdbURL}"> IMDB </a>
                <a target="_blank" class="bold  btn btn-danger" href="${a.yts.$trailerURL}"> Trailer </a>
                <a target="_blank" class="bold  btn btn-info" href="${a.yts.$subtitleURL}"> Subtitles </a>
              </div>
              <hr>
              <div class="d-flex gap-3 justify-content-center">
              ${$torrentsURLS}
              </div>
              <hr>
              <a rel="dofollow" href="https://torrents.egytag.com${a.$url}"> see ${a.$title} Full Article on torrents.egytag.com </a>
              <hr>
        `;
          site
            .fetch('https://www.googleapis.com/blogger/v3/blogs/' + site.bloggerManager.blogger.id + '/posts/' + '?key=' + site.bloggerManager.key, {
              method: 'post',
              headers: { Authorization: site.bloggerManager.token_type + ' ' + site.bloggerManager.access_token, 'Content-Type': 'application/json', scope: site.bloggerManager.scope },
              body: JSON.stringify({
                kind: 'blogger#post',
                blog: {
                  id: site.bloggerManager.blogger.id,
                },
                title: a.$title,
                content: $content,
                images: [
                  {
                    url: a.$imageURL,
                  },
                ],
                labels: a.$tagsList,
              }),
            })
            .then((res) => res.json())
            .then((data) => {
              site.bloggerManager.list.push(data);
            })
            .catch((err) => {
              console.log(err);
            });
        }, 1000 * 15 * i);
      });
  };
};
