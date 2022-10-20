module.exports = function init(site) {
  const $content = site.connectCollection('content');

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

  site.content_list = [];
  $content.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.content_list = [...site.content_list, ...docs];
    }
  });

  setInterval(() => {
    site.content_list.forEach((a, i) => {
      if (a.$add) {
        let user = a.$user;
        $content.add(a, (err, doc) => {
          if (!err && doc) {
            site.content_list[i] = doc;
            if (doc.ad_status.id == 1) {
              site.call('[notific][ads_members_follow]', {
                user: { id: user.id, email: user.email, profile: user.profile, followers_list: user.followers_list },
                action: {
                  id: doc.id,
                  name: doc.name,
                },
              });
            }
          }
        });
      } else if (a.$update) {
        let user = a.$user;
        $content.edit(
          {
            where: {
              id: a.id,
            },
            set: a,
          },
          (err, result) => {
            if (result.old_doc && result.old_doc.ad_status.id != result.doc.ad_status.id && result.doc.ad_status.id == 1) {
              site.call('[notific][ads_members_follow]', {
                user: { id: user.id, email: user.email, profile: user.profile, followers_list: user.followers_list },
                action: {
                  id: result.doc.id,
                  name: result.doc.name,
                },
              });
            }
          }
        );
      } else if (a.$delete) {
        $content.delete({
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
    let date = new Date();
    if (new Date(ads_doc.date) < date.setHours(0, 0, 0, 0)) {
      response.error = "Today's date is greater than the date of publication";
      res.json(response);
      return;
    }

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

    site.security.getUser(
      {
        id: ads_doc.store.user.id,
      },
      (err, user_doc) => {
        if (!err && user_doc) {
          ads_doc.$user = user_doc;
          if(!ads_doc.quantity_list || ads_doc.quantity_list.length < 1) {
            ads_doc.quantity_list = [{
              price : 0,
              discount : 0,
              discount_type : 'number',
              net_value : 0,
              available_quantity : 0,
              maximum_order : 0,
              minimum_order : 0,
            }]
          }
          site.content_list.push(ads_doc);

          res.json(response);
        }
      }
    );

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

    site.security.getUser(
      {
        id: ads_doc.store.user.id,
      },
      (err, user_doc) => {
        if (!err && user_doc) {
          ads_doc.$user = user_doc;
          site.content_list.forEach((a, i) => {
            if (a.id === ads_doc.id) {
              site.content_list[i] = ads_doc;
            }
          });
          res.json(response);
        }
      }
    );
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

    site.content_list.forEach((a) => {
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
    let ad = site.content_list.find((_ad) => {
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
      } else if (user_ad.feedback.favorite === false) {
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
      req.session.user.feedback_list.forEach((_fl) => {
        if (_fl.ad && _fl.ad.id && _fl.type && _fl.type.id == 2) {
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
      };

      ad.feedback_list.push(comment);
      site.call('[notific][replies_ads_followed]', {
        user: ad.store.user,
        user_action: req.session.user,
        action: {
          id: ad.id,
          name: ad.name,
        },
      });
      site.call('[notific][comments_my_ads]', {
        user: ad.store.user,
        user_action: req.session.user,
        action: {
          id: ad.id,
          name: ad.name,
        },
      });
    }

    ad.$update = true;
    site.content_list.forEach((a, i) => {
      if (a.id === ad.id) {
        site.content_list[i] = ad;
      }
    });

    response.done = true;
    response.error = 'no id';
    res.json(response);
  });

  site.post({ name: '/api/contents/view', public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let ad = null;
    site.content_list.forEach((a) => {
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

  site.post({ name: '/api/contents/all', public: true }, (req, res) => {
    let response = {
      done: false,
    };
    let where = req.body.where || {};
    let sort = {id: -1};
    let skip = 0;
    let start = (req.data.page_number || 0) * (req.data.limit || 0);
    let end = start + (req.data.limit || 100);
    delete where['search_ads'];

    if (where['country']) {
      where['address.country.id'] = where['country'].id;
      delete where['country'];
    }

    let d1 = site.toDate(new Date());
    let d2 = site.toDate(new Date());
    d2.setDate(d2.getDate() + 1);
    where.date = {
      $lte: d2,
    };

    where.expiry_date = {
      $gte: d1,
    };

    if (where['new']) {
      sort['date'] = -1;
    }
    where['quantity_list.net_value'] = {$gte: where['price_from'],$lte: where['price_to']};

    if (where['price'] == 'lowest') {
      sort['quantity_list.price'] = -1;
      delete where['price']
    } else if (where['price'] == 'highest') {
      sort['quantity_list.price'] = 1;
      delete where['price']
    }

    
    if (where['with_photos']) {
      where['images_list'] = { $exists: true };
    }

    if (where['text_search']) {
      where.$or = where.$or || [];
      where.$or.push({
        name: site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'main_category.name_ar': site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'main_category.name_en': site.get_RegExp(where['text_search'], 'i'),
      });
    }

    if (where['country_code']) {
      where['address.country.code'] = where['country_code'];
      delete where['country_code'];
    }

    if (where['gov_code']) {
      where['address.gov.code'] = where['gov_code'];
      delete where['gov_code'];
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
      where.$or = where.$or || [];
      where.$or.push({ 'main_category.top_parent_id': where['category_id'] });
      where.$or.push({ 'main_category.parent_list_id': where['category_id'] });
      where.$or.push({ 'main_category.id': where['category_id'] });
      delete where['category_id'];
    }

    if (where['main_category'] && where['main_category'].id) {
      where['main_category.id'] = where['main_category'].id;
      delete where['main_category'];
    }

    if (where['near']) {
      where.$or = where.$or || [];

      if (req.session.user) {
        if (req.session.user.profile.main_address) {
          if (req.session.user.profile.main_address.country && req.session.user.profile.main_address.country.id) {
            where.$or.push({ 'address.country.id': req.session.user.profile.main_address.country.id });
          }
          if (req.session.user.profile.main_address.gov && req.session.user.profile.main_address.gov.id) {
            where.$or.push({ 'address.gov.id': req.session.user.profile.main_address.gov.id });
          }
        }
      }
    }

    delete where['near'];
    delete where['new'];
    delete where['text_search'];
    delete where['with_photos'];
    delete where['price_from']
    delete where['price_to']
    $content.findMany(
      {
        sort: sort || {
          id: -1,
        },
        select: req.body.select || {},
        limit: req.data.limit || 100,
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
    $content.findOne(
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
