module.exports = function init(site) {
  site.get({
    name: 'user_messages',
    path: __dirname + '/site_files/html/messages.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'favorites',
    path: __dirname + '/site_files/html/favorites.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'follow',
    path: __dirname + '/site_files/html/follow.html',
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
            doc.follow_list.push(req.session.user.id);
          } else {
          let follow_list =  doc.follow_list.filter(x => {
              return x != req.session.user.id;
            })
            doc.follow_list = follow_list
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
