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
  },
  (req, res) => {
    res.render(
      'notific/index.html',
      { title: site.setting.title, image_url: site.setting.logo, description: site.setting.description },
      {
        parser: 'html css js',
        compress: true,
      }
    );
  });

  site.on('[notific][ads_members_follow]', (obj) => {
    site.security.getUsers(
      {
        where: {
          id: { $in: obj.user.followers_list },
        },
      },
      (err, docs) => {
        if (!err) {
          docs.forEach((_doc) => {
            if (_doc.notific_setting && _doc.notific_setting.ads_members_follow) {
              site.notific_list.push({
                $add: true,
                action: obj.action,
                show: false,
                store_name: obj.store_name,
                user_action: {
                  id: obj.user.id,
                  email: obj.user.email,
                  name: obj.user.profile.name,
                  last_name: obj.user.profile.last_name,
                  image_url: obj.user.profile.image_url,
                },
                user: {
                  id: _doc.id,
                  email: _doc.email,
                  name: _doc.profile.name,
                  last_name: _doc.profile.last_name,
                  image_url: _doc.profile.image_url,
                },
                type: 'ads_members_follow',
                date: new Date(),
              });
              _doc.notific_count = _doc.notific_count || 0;
              _doc.notific_count += 1;
              site.security.updateUser(_doc);
            }
          });
        }
      }
    );
  });

  site.on('[notific][replies_ads_followed]', (obj) => {

    let follow_list = [];
    obj.follow_list = obj.follow_list || [];
    for (let i = 0; i < obj.follow_list.length; i++) {
      follow_list.push(obj.follow_list[i].user.id)
    }
    site.security.getUsers(
      {
        where: {
          id: { $in: follow_list },
        },
      },
      (err, docs) => {
        if (!err) {
          docs.forEach((_doc) => {
            if (_doc.notific_setting && _doc.notific_setting.replies_ads_followed && _doc.id != obj.user_action.id) {
              site.notific_list.push({
                $add: true,
                action: obj.action,
                show: false,
                store_name: obj.store_name,
                user_action: {
                  id: obj.user.id,
                  email: obj.user.email,
                  name: obj.user.profile.name,
                  last_name: obj.user.profile.last_name,
                  image_url: obj.user.profile.image_url,
                },
                user: {
                  id: _doc.id,
                  email: _doc.email,
                  name: _doc.profile.name,
                  last_name: _doc.profile.last_name,
                  image_url: _doc.profile.image_url,
                },
                type: 'replies_ads_followed',
                date: new Date(),
              });
              _doc.notific_count = _doc.notific_count || 0;
              _doc.notific_count += 1;
              site.security.updateUser(_doc);
            }
          });
        }
      }
    );
  });

  site.on('[notific][comments_my_ads]', (obj) => {
    site.security.getUser(
      {
        id: obj.user.id,
      },
      (err, doc) => {
        if (!err) {
          if (doc.notific_setting && doc.notific_setting.comments_my_ads && doc.id != obj.user_action.id) {
            site.notific_list.push({
              $add: true,
              action: obj.action,
              store_name: obj.store_name,
              show: false,
              user_action: {
                id: obj.user_action.id,
                email: obj.user_action.email,
                name: obj.user_action.profile.name,
                last_name: obj.user_action.profile.last_name,
                image_url: obj.user_action.profile.image_url,
              },
              user: {
                id: doc.id,
                email: doc.email,
                name: doc.profile.name,
                last_name: doc.profile.last_name,
                image_url: doc.profile.image_url,
              },
              type: 'comments_my_ads',
              date: new Date(),
            });
            doc.notific_count = doc.notific_count || 0;
            doc.notific_count += 1;
            site.security.updateUser(doc);
          }
        }
      }
    );
  });

  site.on('[notific][private_messages]', (obj) => {
    site.security.getUser(
      {
        id: obj.user.id,
      },
      (err, doc) => {

        if (!err && doc) {
          if (doc.notific_setting && doc.notific_setting.private_messages && doc.id == obj.user.id) {
            site.notific_list.push({
              $add: true,
              action: obj.action,
              show: false,
              user_action: obj.user_action,
              user: obj.user,
              type: 'private_messages',
              date: new Date(),
            });
            doc.notific_count = doc.notific_count || 0;
            doc.notific_count += 1;
            site.security.updateUser(doc);
          }
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

    let notific_doc = req.body;
    notific_doc.$req = req;
    notific_doc.$res = res;

    notific_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof notific_doc.active === 'undefined') {
      notific_doc.active = true;
    }

    response.done = true;
    notific_doc.$add = true;
    site.notific_list.push(notific_doc);
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

    let notific_doc = req.body;

    notific_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!notific_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    notific_doc.$update = true;
    site.notific_list.forEach((a, i) => {
      if (a.id === notific_doc.id) {
        site.notific_list[i] = notific_doc;
      }
    });
    res.json(response);
  });


  site.post('/api/notific/show', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let notific_doc = req.body;

    notific_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!notific_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    if (!notific_doc.show) {
      site.notific_list.forEach((a, i) => {
        if (a.id === notific_doc.id) {
          notific_doc.$update = true;
          notific_doc.show = true;
          site.notific_list[i] = notific_doc;
          req.session.user.notific_count -= 1;
          site.security.updateUser(req.session.user)
        }
      });
    }
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

    req.session.user.notific_count = 0;
    site.security.updateUser(req.session.user)
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
        name_Ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_En: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        minor_currency_Ar: site.get_RegExp(where['name'], 'i'),
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
          if (docs) {
            docs.forEach(_d => {
              _d.$time = site.xtime(_d.date, req.session.lang|| 'Ar');
            });
          }
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
