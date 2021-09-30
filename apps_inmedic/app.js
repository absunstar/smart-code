module.exports = function init(site) {
  site.get({
    name: '/css',
    path: __dirname + '/site_files/css',
  });
};
site.get({
  name: "/",
  path: __dirname + "/site_files/html/index.html",
  parser: "html",
  compress: true,
});