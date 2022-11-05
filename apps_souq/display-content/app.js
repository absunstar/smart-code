module.exports = function init(site) {

  site.get({
    name: ['display_content','display_content/:id/:title'],
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });


};
