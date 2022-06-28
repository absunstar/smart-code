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

    site.security.register(
      {
        email: req.body.email,
        password: req.body.password,
        feedback_list: [],
        other_addresses_list : [],
        ip: req.ip,
        permissions: ['user'],
        active: true,
        profile: {
          files: [],
          name: req.body.first_name,
          last_name: req.body.last_name,
        },
        $req: req,
        $res: res,
      },
      function (err, doc) {
        if (!err) {
          response.user = doc;
          response.done = true;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
