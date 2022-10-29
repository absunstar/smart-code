module.exports = function init(site) {
  const $login = site.connectCollection('login');

  site.get({
    name: 'assets',
    path: __dirname + '/site_files/assets/',
  });

  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/',
  });

  site.get({
    name: ['/css/haraj.css'],
    parser: 'css2',
    public: true,
    compress: !0,
    path: [__dirname + '/site_files/css/font6.css', __dirname + '/site_files/css/style.css', __dirname + '/site_files/css/addon.css', 'client-side/layout.css', 'client-side/effect.css', 'client-side/font-cairo.css'],
  });
};
