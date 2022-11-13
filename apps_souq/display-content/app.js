module.exports = function init(site) {

  // site.get({
  //   name: ['display-content','display-content/:id/:title/:store'],
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: false,
  // });

  site.onGET('display-content/:id/:title/:store', (req, res) => {
    site.content_list.forEach(content => {
      if (content.id == req.params.id) {
        res.render('display-content/index.html', content);
      }
    })

  })

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });


};
