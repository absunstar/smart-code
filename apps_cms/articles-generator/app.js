module.exports = function init(site) {
  let yts = site.connectApp({ name: 'generator_yts' });
  let generator = site.connectApp({ name: 'generator', title: 'Articles Generator', dir: __dirname, images: true });
  let sites = site.connectApp({ name: 'generatorSites', allowMemory: true });
  let youtubeChannelList = site.connectApp({ name: 'generatorYoutubeChannelList', allowMemory: true });
  let facebookGroupList = site.connectApp({ name: 'generatorFacebookGroupList', allowMemory: true });

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

  site.require(__dirname + '/blogger.js');

  site.onGET('/api/generator/get-bloger-code-url', (req, res) => {
    res.json({
      done: true,
      url: site.bloggerManager.getCodeURL(),
    });
  });
  site.onGET({ name: '/api/generator/set-bloger-code', public: true }, (req, res) => {
    site.bloggerManager.code = req.queryRaw.code;
    res.json({
      done: true,
      code: site.bloggerManager.code,
    });
  });

  site.onGET({ name: '/api/generator/get-bloger-access_token', public: true }, (req, res) => {
    site.bloggerManager.requestAccessToken(() => {
      res.json({
        done: true,
        access_token: site.bloggerManager.access_token,
      });
    });
  });

  site.onGET({ name: '/api/generator/get-bloger-info', public: true }, (req, res) => {
    site.bloggerManager.getBloggerInfo((bloger) => {
      if (site.bloggerManager.blogger) {
        res.json({
          done: true,
          bloger: site.bloggerManager.blogger,
        });
      } else {
        res.json({
          done: false,
        });
      }
    });
  });

  site.onPOST({ name: '/api/generator/bloger-write-posts', public: true }, (req, res) => {
    site.bloggerManager.list = [];
    let callBack = function (data) {
      if (data && data.id) {
        setTimeout(() => {
          site.bloggerManager.sendBloggerPosts(null, callBack);
        }, 1000 * 15);
      }
    };

    site.bloggerManager.sendBloggerPosts(null, callBack);

    res.json({
      done: true,
    });
  });

  site.onPOST({ name: '/api/generator/get-blogger-posts', public: true }, (req, res) => {
    res.json({
      done: true,
      list: site.bloggerManager.list,
    });
  });
};
