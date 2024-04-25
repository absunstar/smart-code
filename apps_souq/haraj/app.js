module.exports = function init(site) {

  site.get({
    name: 'assets',
    path: __dirname + '/site_files/assets/',
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/',
  });

  site.get({
    name: ['/css/haraj.css'],
    parser: 'css',
    public: true,
    compress: !0,
    path: [
      'client-side/layout.css',
      'client-side/checkbox.css',
      'client-side/effect.css',
      'client-side/font-cairo.css',
      __dirname + '/site_files/css/font6.css',
      __dirname + '/site_files/css/style.css',
      __dirname + '/site_files/css/1007.css',
      __dirname + '/site_files/css/1008.css',
      __dirname + '/site_files/css/1921.css',
      __dirname + '/site_files/css/mobile.css',
    ],
  });
};
