module.exports = function init(site) {
  const $register = site.connectCollection('register');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'register',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'css',
    path: __dirname + '/site_files/css/'
  })


  site.post('/api/register', (req, res) => {
    let response = {};

    if (req.body.$encript) {
      if (req.body.$encript === '64') {
        req.body.email = site.fromBase64(req.body.email);
        req.body.password = site.fromBase64(req.body.password);
      } else if (req.body.$encript === '123') {
        req.body.email = site.from123(req.body.email);
        req.body.password = site.from123(req.body.password);
      }
    }

    let user = {
      email: req.body.email,
      password: req.body.password,
      feedback_list: [],
      other_addresses_list: [],
      ip: req.ip,
      permissions: ['user'],
      active: true,
      profile: {
        files: [],
        name: req.body.first_name,
        last_name: req.body.last_name,
        image_url: req.body.image_url,
      },
      $req: req,
      $res: res,
    };

    if (site.defaultSettingDoc && site.defaultSettingDoc.stores_settings && site.defaultSettingDoc.stores_settings.maximum_stores) {
      user.maximum_stores = site.defaultSettingDoc.stores_settings.maximum_stores;
    } else {
      user.maximum_stores = 10;
    }

    site.security.register(user, function (err, doc) {
      if (!err) {
        response.user = doc;
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });
};
