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
};
