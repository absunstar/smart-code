module.exports = function init(site) {

  site.get({
    name: 'theme1/images',
    path: __dirname + '/site_files/images/',
  });
  site.get({
    name: 'theme1/css',
    path: __dirname + '/site_files/css/',
  });
  site.get({
    name: 'theme1/js',
    path: __dirname + '/site_files/js/',
  });
  site.get({
    name: 'theme1/webfonts',
    path: __dirname + '/site_files/webfonts/',
  });
  site.get({
    name: ['/css/theme1.css'],
    parser: 'css',
    public: true,
    compress: !0,
    path: [
      __dirname + '/site_files/css/bootstrap.min.css',
      __dirname + '/site_files/css/all.min.css',
      __dirname + '/site_files/css/theme.css',
      __dirname + '/site_files/css/style.css',
      __dirname + '/site_files/css/md.css',
      __dirname + '/site_files/css/sm.css',
      __dirname + '/site_files/css/goldPrice.css',
      __dirname + '/site_files/css/convertCurrancy.css',
      __dirname + '/site_files/css/footballMatches.css',
      __dirname + '/site_files/css/header.css',
      __dirname + '/site_files/css/footer.css',
      __dirname + '/site_files/css/colorstheme.css',
      __dirname + '/site_files/css/articlePage.css',
      __dirname + '/site_files/css/video.css',
      __dirname + '/site_files/css/audio.css',
      'client-side/effect.css',
      'client-side/font-droid.css',
    ],
  });
  site.get({
    name: ['/css/article.css'],
    parser: 'css',
    public: true,
    compress: !0,
    path: [
      __dirname + '/site_files/css/bootstrap.min.css',
      __dirname + '/site_files/css/all.min.css',
      __dirname + '/site_files/css/style.css',
      __dirname + '/site_files/css/goldPrice.css',
      __dirname + '/site_files/css/convertCurrancy.css',
      __dirname + '/site_files/css/footballMatches.css',
      __dirname + '/site_files/css/header.css',
      __dirname + '/site_files/css/footer.css',
      __dirname + '/site_files/css/colorstheme.css',
      __dirname + '/site_files/css/articlePage.css',
      'client-side/effect.css',
      'client-side/font-droid.css',
    ],
  });


  site.get({
    name: ['/js/theme1.js'],
    parser: 'js',
    public: true,
    compress: !0,
    path: [
      __dirname + '/site_files/js/bootstrap.bundle.min.js',
      __dirname + '/site_files/js/all.min.js',
      __dirname + '/site_files/js/script.js',
      __dirname + '/site_files/js/mainSlider.js',
      __dirname + '/site_files/js/article-page.js',
    ],
  });

};
