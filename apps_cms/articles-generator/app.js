module.exports = function init(site) {
  let yts = site.connectApp({ name: 'generator_yts' });
  let generator = site.connectApp({ name: 'generator', title: 'Articles Generator', dir: __dirname, images: true });
  let sites = site.connectApp({ name: 'generatorSites', allowMemory: true });
  let youtubeChannelList = site.connectApp({ name: 'generatorYoutubeChannelList', allowMemory: true });
  let blogerKey = 'AIzaSyD_BmzCVbI4sqisSoHX6_wHx3pmJhmZQNk';
  let blogerURL = 'https://download-torrents-movie.blogspot.com/';
  let client_id = '622443491605-pnin27en8im3ti8hag7ov28drge372up.apps.googleusercontent.com';
  let client_secret = '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';
  let googleScope = 'https://www.googleapis.com/auth/blogger';
  let authorization = site.toBase64(client_id + ':' + client_secret);
  let redirect_uri = '';
  let googleCode = '';
  let access_token = '';
  let refresh_token = '';
  let token_type = 'Bearer';
  let bloger = {};

  site.onGET('/api/generator/get-bloger-code-url', (req, res) => {
    redirect_uri = 'http://' + req.host + '/api/generator/set-bloger-code';
    let googleURL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=${googleScope}&response_type=code`;
    res.json({
      done: true,
      url: googleURL,
    });
  });
  site.onGET({ name: '/api/generator/set-bloger-code', public: true }, (req, res) => {
    googleCode = req.queryRaw.code;
    redirect_uri = 'http://' + req.host + '/api/generator/set-bloger-code';
    res.json({
      done: true,
      code: googleCode,
    });
  });
  site.onGET({ name: '/api/generator/get-bloger-code', public: true }, (req, res) => {
    res.json({
      done: true,
      code: googleCode,
    });
  });
  site.onGET({ name: '/api/generator/get-bloger-access_token', public: true }, (req, res) => {
    getAccessToken(() => {
      res.json({
        done: true,
        access_token: access_token,
      });
    });
  });
  function getAccessToken(callback) {
    site
      .fetch(
        'https://oauth2.googleapis.com/token' + '?grant_type=authorization_code&client_id=' + client_id + '&client_secret=' + client_secret + '&code=' + googleCode + '&redirect_uri=' + redirect_uri,
        {
          method: 'post',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }
      )
      .then((res) => res.json())
      .then((data) => {
        if (data.access_token) {
          access_token = data.access_token;
        }
        if (data.refresh_token) {
          refresh_token = data.refresh_token;
        }
        if (data.token_type) {
          token_type = data.token_type;
        }
        callback();
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
        callback();
      });
  }
  site.onPOST({ name: '/api/generator/set-bloger-access_token', public: true }, (req, res) => {
    access_token = req.data.access_token;

    res.json({
      done: true,
      access_token: access_token,
    });
  });
  site.onGET({ name: '/api/generator/get-bloger-info', public: true }, (req, res) => {
    getBlogerInfo((bloger) => {
      if (bloger) {
        res.json({
          done: true,
          bloger: bloger,
        });
      } else {
        res.json({
          done: false,
        });
      }
    });
  });

  function getBlogerInfo(callback) {
    site
      .fetch('https://www.googleapis.com/blogger/v3/blogs/byurl?url=' + blogerURL + '&key=' + blogerKey)
      .then((res) => res.json())
      .then((data) => {
        bloger = data;
        callback(bloger);
      })
      .catch((err) => {
        console.log(err);
        callback();
      });
  }
  site.onPOST({ name: '/api/generator/bloger-write-posts', public: true }, (req, res) => {
    writeBlogerPost(bloger);
    res.json({
      done: true,
    });
  });

  function writeBlogerPost(bloger) {
    site.articlesList
      .filter((a) => a.host.like(site.getHostFilter('torrents')))
      .forEach((a, i) => {
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
          .fetch('https://www.googleapis.com/blogger/v3/blogs/' + bloger.id + '/posts/' + '?key=' + blogerKey, {
            method: 'post',
            headers: { Authorization: token_type + ' ' + access_token, 'Content-Type': 'application/json', scope: 'https://www.googleapis.com/auth/blogger' },
            body: JSON.stringify({
              kind: 'blogger#post',
              blog: {
                id: bloger.id,
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
            console.log(data);
          })
          .catch((err) => {
            console.log(err);
          });
      });
  }

  site.onGET(
    {
      name: 'generator',
      overwrite: true,
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host);
      let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];
      res.render(
        'articles-generator/index.html',
        {
          setting: setting,
          language: language,
          categoryList: site.getCategoryLookup(req),
        },
        { parser: 'html' }
      );
    }
  );
};
