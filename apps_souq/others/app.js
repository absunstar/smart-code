module.exports = function init(site) {


  site.get({
    name: 'favorites',
   
  },
  (req, res) => {
    res.render(
      'others/favorites.html',
      { title: site.setting.title, image_url: site.setting.logo, description: site.setting.description },
      {
        parser: 'html css js',
        compress: true,
      }
    );
  });

  site.get({
    name: 'follow',
 
  },
  (req, res) => {
    res.render(
      'others/follow.html',
      { title: site.setting.title, image_url: site.setting.logo, description: site.setting.description },
      {
        parser: 'html css js',
        compress: true,
      }
    );
  });

  site.get({
    name: 'more_categories',
  
  },
  (req, res) => {
    res.render(
      'others/more_categories.html',
      { title: site.setting.title, image_url: site.setting.logo, description: site.setting.description },
      {
        parser: 'html css js',
        compress: true,
      }
    );
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post('/api/user/update_follow', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'You Are Not Login';
      res.json(response);
      return;
    }

    site.security.getUser(
      {
        id: req.body.id,
      },
      (err, doc) => {
        if (!err && doc) {
          if (req.body.follow) {
            doc.followers_list.push(req.session.user.id);
          } else {
          let followers_list =  doc.followers_list.filter(x => {
              return x != req.session.user.id;
            })
            doc.followers_list = followers_list
          }
          site.security.updateUser(doc, (err) => {
            if (!err) {
              response.done = true;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        } else {
          response.error = err.message;
          res.json(response);
        }
      }
    );
  });
};
