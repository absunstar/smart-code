module.exports = function init(site) {
  const $stores = site.connectCollection('stores');
  site.store_list = [];
  $stores.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.store_list = [...site.store_list, ...docs];
    }
  });

  setInterval(() => {
    site.store_list.forEach((a, i) => {
      if (a.$add) {
        $stores.add(a, (err, doc) => {
          if (!err && doc) {
            site.store_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $stores.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $stores.delete({
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
    name: 'stores',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/stores/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let store_doc = req.body;
    store_doc.$req = req;
    store_doc.$res = res;

    store_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof store_doc.active === 'undefined') {
      store_doc.active = true;
    }

    if (!store_doc.user || !store_doc.user.id) {
      response.error = 'User must specified';
      res.json(response);
      return;
    }
    foundUserFeedback = store_doc.feedback_list.every((_f) => _f.user && _f.user.id);
    if (!foundUserFeedback) {
      response.error = 'User must be specified in feedbacks';
      res.json(response);
      return;
    }

    let result = site.store_list.filter((store) => store.user.id == store_doc.user.id);
    if (result.length >= req.session.user.maximum_stores) {
      response.error = 'maximum stores to user';
      res.json(response);
      return;
    }
    response.done = true;
    store_doc.$add = true;
    site.store_list.push(store_doc);
    res.json(response);
  });

  site.post('/api/stores/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let store_doc = req.body;

    store_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!store_doc.user || !store_doc.user.id) {
      response.error = 'User must specified';
      res.json(response);
      return;
    }
    foundUserFeedback = store_doc.feedback_list.every((_f) => _f.user && _f.user.id);
    if (!foundUserFeedback) {
      response.error = 'User must be specified in feedbacks';
      res.json(response);
      return;
    }

    if (!store_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    store_doc.$update = true;
    site.store_list.forEach((a, i) => {
      if (a.id === store_doc.id) {
        site.store_list[i] = store_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/stores/update_feedback', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let user = {
      id: req.session.user.id,
      email: req.session.user.email,
      profile: req.session.user.profile,
    };
    let user_store = req.body;
    let store = site.store_list.find((_store) => {
      return _store.id === user_store.id;
    });
    if (!store) {
      response.error = 'no id';
      res.json(response);
      return;
    }
    // store.feedback_list
    store.feedback_list = store.feedback_list || [];
   if (user_store.feedback.type == 'favorite') {
      if (user_store.feedback.favorite === true) {
        store.number_favorites = store.number_favorites + 1;
        req.session.user.feedback_list.push({ type: { id: 2 }, store: { id: user_store.id } });
        site.security.updateUser(req.session.user, (err, user_doc) => {});
        store.feedback_list.push({
          user: user,
          type: { id: 2, en: 'Favorite', ar: 'تفضيل' },
          date: new Date(),
        });
      } else {
        store.number_favorites = store.number_favorites - 1;
        req.session.user.feedback_list.splice(
          req.session.user.feedback_list.findIndex((c) => c.type && c.store && c.type.id == 2 && c.store.id == store.id),
          1
        );
        site.security.updateUser(req.session.user, (err, user_doc) => {});
        store.feedback_list.splice(
          store.feedback_list.findIndex((c) => c.type.id == 2 && c.user.id == req.session.user.id),
          1
        );
      }
    } else if (user_store.feedback.type == 'report') {
      store.number_reports = store.number_reports + 1;
      store.feedback_list.push({
        user: user,
        type: { id: 3, en: 'Report', ar: 'إبلاغ' },
        report_type: user_store.feedback.report_type,
        comment_report: user_store.feedback.comment_report,
        date: new Date(),
      });
    } else if (user_store.feedback.type == 'comment') {
      store.number_comments = store.number_comments + 1;
      store.feedback_list.push({
        user: user,
        type: { id: 4, en: 'Comment', ar: 'تعليق' },
        comment_type: user_store.feedback.comment_type,
        comment: user_store.feedback.comment,
        date: new Date(),
      });
    }

    store.$update = true;
    site.content_list.forEach((a, i) => {
      if (a.id === store.id) {
        site.content_list[i] = store;
      }
    });

    response.done = true;
    response.error = 'no id';
    res.json(response);
  });

  site.post('/api/stores/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.store_list.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
        if (req.body.display) {
          a.$update = true;
          a.number_views += 1;
        }
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

  site.post('/api/stores/delete', (req, res) => {
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

    site.store_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/stores/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');
    }
    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i');
    }
    if (where['search']) {
      where.$or = [];

      where.$or.push({
        name_ar: site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        name_en: site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'user.profile.name': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'user.profile.last_name': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'user.email': site.get_RegExp(where['search'], 'i'),
      });

      delete where['search'];
    }

    $stores.findMany(
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
