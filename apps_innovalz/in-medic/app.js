module.exports = function init(site) {
  site.get({
    name: '/',
    path: __dirname + '/site_files',
  });

  site.get({
    name: '/',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });
};
