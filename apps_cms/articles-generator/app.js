module.exports = function init(site) {
  let yts = site.connectApp({ name: 'generator_yts' });
  let generator = site.connectApp({ name: 'generator', title: 'Articles Generator', dir: __dirname, images: true });
  let sites = site.connectApp({ name: 'generatorSites', allowMemory: true });
  let youtubeChannelList = site.connectApp({ name: 'generatorYoutubeChannelList', allowMemory: true });

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
