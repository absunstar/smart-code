module.exports = function init(site) {
  const $notific = site.connectCollection('notific');
  site.notific_list = [];
  $notific.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.notific_list = [...site.notific_list, ...docs];
    }
  });

  setInterval(() => {
    site.notific_list.forEach((a, i) => {
      if (a.$add) {
        $notific.add(a, (err, doc) => {
          if (!err && doc) {
            site.notific_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $notific.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $notific.delete({
          id: a.id,
        });
      }
    });
  }, 1000 * 7);
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'notific',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[notific][comments_my_ads]', (obj) => {
    site.security.getUser(
      {
        id: obj.user_ad.id,
      },
      (err, doc) => {
        if (!err) {
          if (doc.notific_setting && doc.notific_setting.comments_my_ads && obj.user_ad.id != obj.user_comment.id) {
            site.notific_list.push({
              $add: true,
              ad: obj.ad,
              show: false,
              user_action: {
                id: obj.user_comment.id,
                email: obj.user_comment.email,
                profile: obj.user_comment.profile,
              },
              user: {
                id: obj.user_ad.id,
                email: obj.user_ad.email,
                profile: obj.user_ad.profile,
              },
              type: 'comments_my_ads',
              date: new Date(),
            });
          }
        } else {
          response.error = err.message;
        }
      }
    );
  });

  site.post('/api/notific/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let currency_doc = req.body;
    currency_doc.$req = req;
    currency_doc.$res = res;

    currency_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof currency_doc.active === 'undefined') {
      currency_doc.active = true;
    }

    response.done = true;
    currency_doc.$add = true;
    site.notific_list.push(currency_doc);
    res.json(response);
  });

  site.post('/api/notific/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let currency_doc = req.body;

    currency_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!currency_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    currency_doc.$update = true;
    site.notific_list.forEach((a, i) => {
      if (a.id === currency_doc.id) {
        site.notific_list[i] = currency_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/notific/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.notific_list.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/notific/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    if (!req.body.id) {
      response.error = 'no id';
      res.json(response);
      return;
    }

    site.notific_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/notific/delete_for_user', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }



    site.notific_list.forEach((a) => {
      if (a.user.id === req.session.user.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/notific/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where['name']) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_en: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        minor_currency_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        minor_currency_en: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name'];
    }

    $notific.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
