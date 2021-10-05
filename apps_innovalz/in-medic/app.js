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
  site.get({
    name: 'booking',
    path: __dirname + '/site_files/html/book.html',
    parser: 'html',
    compress: true,
  });
  site.get({
    name: 'profile',
    path: __dirname + '/site_files/html/profile.html',
    parser: 'html',
    compress: true,
  });
  site.get({
    name: 'scan',
    path: __dirname + '/site_files/html/scan.html',
    parser: 'html',
    compress: true,
  });
  site.get({
    name: 'analysis',
    path: __dirname + '/site_files/html/analysis.html',
    parser: 'html',
    compress: true,
  });
  site.get({
    name: 'authentication',
    path: __dirname + '/site_files/html/creditional.html',
    parser: 'html',
    compress: true,
  });
  
};