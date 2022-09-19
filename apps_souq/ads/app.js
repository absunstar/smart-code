module.exports = function init(site) {
  const $ads = site.connectCollection('ads');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'contents',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });


  site.ad_list = [];
  $ads.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.ad_list = [...site.ad_list, ...docs];
    }
  });

  setInterval(() => {
    site.ad_list.forEach((a, i) => {
      if (a.$add) {
        $ads.add(a, (err, doc) => {
          if (!err && doc) {
            site.ad_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $ads.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $ads.delete({
          id: a.id,
        });
      }
    });
  }, 1000 * 7);

  site.post('/api/contents/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ads_doc = req.body;
    ads_doc.$req = req;
    ads_doc.$res = res;

    if (site.defaultSettingDoc.stores_settings.activate_stores) {
      if (!ads_doc.store || (ads_doc.store && !ads_doc.store.id)) {
        response.error = 'Store must specified';
        res.json(response);
        return;
      }
    } else {
      let store = site.store_list.find((_store) => {
        return _store.user.id === req.session.user.id;
      });

      ads_doc.store = { id: store.id, name: store.name, user: store.user, address: store.address };
    }

    foundUserFeedback = ads_doc.feedback_list.every((_f) => _f.user && _f.user.id);
    if (!foundUserFeedback) {
      response.error = 'User must be specified in feedbacks';
      res.json(response);
      return;
    }

    ads_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    response.done = true;
    ads_doc.$add = true;
    site.ad_list.push(ads_doc);
    res.json(response);
  });

  site.post('/api/contents/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ads_doc = req.body;
    if (!ads_doc.store || !ads_doc.store.id) {
      response.error = 'Store must specified';
      res.json(response);
      return;
    }

    foundUserFeedback = ads_doc.feedback_list.every((_f) => _f.user && _f.user.id);
    if (!foundUserFeedback) {
      response.error = 'User must be specified in feedbacks';
      res.json(response);
      return;
    }

    ads_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    if (!ads_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    ads_doc.$update = true;
    site.ad_list.forEach((a, i) => {
      if (a.id === ads_doc.id) {
        site.ad_list[i] = ads_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/contents/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    site.ad_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });


  site.post('/api/contents/update_feedback', (req, res) => {
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
    let user_ad = req.body;
    let ad = site.ad_list.find((_ad) => {
      return _ad.id === user_ad.id;
    });
    if (!ad) {
      response.error = 'no id';
      res.json(response);
      return;
    }
    // ad.feedback_list
    ad.feedback_list = ad.feedback_list || [];
     if (user_ad.feedback.type == 'favorite') {
      if (user_ad.feedback.favorite === true) {
        ad.number_favorites = ad.number_favorites + 1;
        req.session.user.feedback_list.push({ type: { id: 2 }, ad: { id: user_ad.id } });
        site.security.updateUser(req.session.user, (err, user_doc) => {});
        ad.feedback_list.push({
          user: user,
          type: { id: 2, en: 'Favorite', ar: 'تفضيل' },
          date: new Date(),
        });
      } else {
        ad.number_favorites = ad.number_favorites - 1;
        req.session.user.feedback_list.splice(
          req.session.user.feedback_list.findIndex((c) => c.type && c.ad && c.type.id == 2 && c.ad.id == ad.id),

          1
        );
        site.security.updateUser(req.session.user, (err, user_doc) => {});
        ad.feedback_list.splice(
          ad.feedback_list.findIndex((c) => c.type.id == 2 && c.user.id == req.session.user.id),
          1
        );
      }
      req.session.user.feedback_list.forEach(_fl => {
        if(_fl.ad && _fl.ad.id && _fl.type && _fl.type.id == 2) {
          
        }
      });

    } else if (user_ad.feedback.type == 'report') {
      ad.number_reports = ad.number_reports + 1;
      ad.feedback_list.push({
        user: user,
        type: { id: 3, en: 'Report', ar: 'إبلاغ' },
        report_type: user_ad.feedback.report_type,
        comment_report: user_ad.feedback.comment_report,
        date: new Date(),
      });
    } else if (user_ad.feedback.type == 'comment') {
      ad.number_comments = ad.number_comments + 1;
      let comment = {
        user: user,
        type: { id: 4, en: 'Comment', ar: 'تعليق' },
        comment_type: user_ad.feedback.comment_type,
        comment: user_ad.feedback.comment,
        date: new Date(),
      }
      ad.feedback_list.push(comment);

      site.call('[notific][comments_my_ads]', 
      {
        user_ad : ad.store.user,
        user_comment : req.session.user,
        ad : {
          id : ad.id,
          name : ad.name,
        }
      });
     
    }

    ad.$update = true;
    site.ad_list.forEach((a, i) => {
      if (a.id === ad.id) {
        site.ad_list[i] = ad;
      }
    });

    response.done = true;
    response.error = 'no id';
    res.json(response);
  });

  site.post({name : '/api/contents/view',public : true}, (req, res) => {
    let response = {
      done: false,
    };

    let ad = null;
    site.ad_list.forEach((a) => {
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

  site.post( {name : '/api/contents/all',public : true}, (req, res) => {
    let response = {
      done: false,
    };
    let where = req.body.where || {};
    let skip = 0;
    let start = (req.data.page_number || 0) * (req.data.limit || 0);
    let end = start + (req.data.limit || 100);
    delete where['search_ads'];

    if (where['country']) {
      where['address.country.id'] = where['country'].id;
      delete where['country'];
    }
    if (where['gov']) {
      where['address.gov.id'] = where['gov'].id;
      delete where['gov'];
    }
    if (where['city']) {
      where['address.city.id'] = where['city'].id;
      delete where['city'];
    }
    if (where['area']) {
      where['address.area.id'] = where['area'].id;
      delete where['area'];
    }
    if (where['store']) {
      where['store.id'] = where['store'].id;
      delete where['store'];
    }
    if (where['user']) {
      where['store.user.id'] = where['user'].id;
      delete where['user'];
    }

    if (where['category_id']) {
      where.$or = [{ 'main_category.top_parent_id': where['category_id'] }, { 'main_category.parent_list_id': where['category_id'] }, { 'main_category.id': where['category_id'] }];
      delete where['category_id'];
    }

    if (where['main_category'] && where['main_category'].id) {
      where['main_category.id'] = where['main_category'].id;
      delete where['main_category'];
    }

    $ads.findMany(
      {
        sort: req.body.sort || {
          id: -1,
        },
        select: req.body.select || {},
        limit: req.data.limit || 20,
        where: where,
        skip: skip,
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
    // }
  });

  site.getAd = function (id, callback) {
    callback = callback || {};
    let where = {};
    $ads.findOne(
      {
        where: { id: id },
        sort: { id: -1 },
      },
      (err, doc) => {
        if (!err && doc) callback(doc);
        else callback(false);
      }
    );
  };
};
