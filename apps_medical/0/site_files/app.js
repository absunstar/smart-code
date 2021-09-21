module.exports = function init(site) {
  site.get({
    name: '/css',
    path: __dirname + '/site_files/css',
  });
};
