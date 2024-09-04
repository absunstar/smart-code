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
  function addZero(code, number) {
    let c = number - code.toString().length;
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString();
    }
    return code;
  }

  $content.newCode = function (user_id) {
    user_id = user_id || 'x';
    let y = new Date().getFullYear().toString().substr(2, 2);
    let m = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'][new Date().getMonth()].toString();
    let d = new Date().getDate();
    let lastCode = site.storage('content_last_code_' + user_id) || 0;
    let lastMonth = site.storage('content_last_month_' + user_id) || m;
    if (lastMonth != m) {
      lastMonth = m;
      lastCode = 0;
    }
    lastCode++;
    site.storage('content_last_code_' + user_id, lastCode);
    site.storage('content_last_month_' + user_id, lastMonth);
    return user_id + y + lastMonth + addZero(d, 2) + addZero(lastCode, 4);
  };

  setInterval(() => {
    site.content_list.forEach((a, i) => {
      if (a.$add) {
        let user = a.$user;
        a.code = $content.newCode(user.id);

        $content.add(a, (err, doc) => {
          if (!err && doc) {
            site.content_list[i] = doc;
            if (doc.ad_status.id == 1) {
              site.call('[notific][ads_members_follow]', {
                user: { id: user.id, email: user.email, profile: user.profile, followers_list: user.followers_list },
                store_name: doc.store.name,
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
            if (result && result.old_doc && result.old_doc.ad_status && result.old_doc.ad_status.id != result.doc.ad_status.id && result.doc.ad_status.id == 1) {
              site.call('[notific][ads_members_follow]', {
                user: { id: user.id, email: user.email, profile: user.profile, followers_list: user.followers_list },
                store_name: result.doc.store.name,
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
      if (store) {
        ads_doc.store = { id: store.id, name: store.name, user: store.user, address: store.address };
      }
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
          if (!ads_doc.quantity_list || ads_doc.quantity_list.length < 1) {
            ads_doc.quantity_list = [
              {
                price: 0,
                discount: 0,
                discount_type: 'number',
                net_value: 0,
                available_quantity: 0,
                maximum_order: 0,
                minimum_order: 0,
              },
            ];
          }

          if (ads_doc.videos_list && ads_doc.videos_list.length > 0) {
            let stringHtt = 'https://';
            ads_doc.videos_list.forEach((_v) => {
              if (_v.link && !_v.link.like('*https://*')) {
                _v.link = stringHtt.concat(_v.link);
              }
            });
          }

          if (site.setting.content.closing_system && site.setting.content.closing_system.id == 1) {
            ads_doc.expiry_date = new Date(ads_doc.date);
            if (site.setting.content.duration_type) {
              if (site.setting.content.duration_type.id == 1) {
                ads_doc.expiry_date.setTime(ads_doc.expiry_date.getTime() + site.setting.content.duration * 60 * 60 * 1000);
              } else if (site.setting.content.duration_type.id == 2) {
                ads_doc.expiry_date.setDate(ads_doc.expiry_date.getDate() + site.setting.content.duration);
              } else if (site.setting.content.duration_type.id == 3) {
                ads_doc.expiry_date.setMonth(ads_doc.expiry_date.getMonth() + site.setting.content.duration);
              }
            }
          }
          ads_doc.feedback_list = ads_doc.feedback_list || [];
          site.content_list.push(ads_doc);
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

    if (ads_doc.videos_list && ads_doc.videos_list.length > 0) {
      let stringHtt = 'https://';
      ads_doc.videos_list.forEach((_v) => {
        if (!_v.link.like('*https://*')) {
          _v.link = stringHtt.concat(_v.link);
        }
      });
    }
    site.security.getUser(
      {
        id: ads_doc.store.user.id,
      },
      (err, user_doc) => {
        if (!err && user_doc) {
          ads_doc.$user = user_doc;
          site.content_list.forEach((a, i) => {
            if (a.id === ads_doc.id) {
              if (site.content_list[i].ad_status.id != 1 && ads_doc.ad_status.id == 1) {
                if (site.setting.content.closing_system && site.setting.content.closing_system.id == 1) {
                  ads_doc.expiry_date = new Date(ads_doc.date);
                  if (site.setting.content.duration_type) {
                    if (site.setting.content.duration_type.id == 1) {
                      ads_doc.expiry_date.setTime(ads_doc.expiry_date.getTime() + site.setting.content.duration * 60 * 60 * 1000);
                    } else if (site.setting.content.duration_type.id == 2) {
                      ads_doc.expiry_date.setDate(ads_doc.expiry_date.getDate() + site.setting.content.duration);
                    } else if (site.setting.content.duration_type.id == 3) {
                      ads_doc.expiry_date.setMonth(ads_doc.expiry_date.getMonth() + site.setting.content.duration);
                    }
                  }
                }
              }

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

  site.post('/api/contents/deleteByUser', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    site.content_list.forEach((a) => {
      if (req.body.id && a.store && a.store.user.id === req.body.id) {
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
      name: req.session.user.profile.name,
      last_name: req.session.user.profile.last_name,
      image_url: req.session.user.profile.image_url,
    };

    let ad = site.content_list.find((_ad) => {
      return _ad.id === req.body.id;
    });

    if (!ad) {
      response.error = 'no id';
      res.json(response);
      return;
    }
    ad.follow_list = ad.follow_list || [];

    ad.feedback_list = ad.feedback_list || [];
    if (req.body.feedback.type == 'favorite') {
      if (req.body.feedback.favorite === true) {
        ad.number_favorites = ad.number_favorites + 1;
        req.session.user.feedback_list.push({ type: { id: 2 }, ad: { id: req.body.id } });
        site.security.updateUser(req.session.user);
        ad.favorite_list = ad.favorite_list || [];
        ad.favorite_list.push({
          user: user,
          date: new Date(),
        });
      } else if (req.body.feedback.favorite === false) {
        ad.number_favorites = ad.number_favorites - 1;
        req.session.user.feedback_list.splice(
          req.session.user.feedback_list.findIndex((c) => c.type && c.ad && c.type.id == 2 && c.ad.id == ad.id),
          1
        );
        site.security.updateUser(req.session.user);
        ad.favorite_list.splice(
          ad.favorite_list.findIndex((c) => c.user.id == req.session.user.id),
          1
        );
      }
    } else if (req.body.feedback.type == 'follow') {
      if (req.body.feedback.follow === true) {
        ad.follow_list = ad.follow_list || [];
        ad.follow_list.push({
          user: user,
          date: new Date(),
        });
      } else if (req.body.feedback.follow === false) {
        ad.follow_list.splice(
          ad.follow_list.findIndex((c) => c.user.id == req.session.user.id),
          1
        );
      }
    } else if (req.body.feedback.type == 'report') {
      ad.number_reports = ad.number_reports + 1;
      ad.report_list = ad.report_list || [];
      ad.report_list.push({
        user: user,
        report_type: req.body.feedback.report_type,
        comment_report: req.body.feedback.comment_report,
        date: new Date(),
      });
    } else if (req.body.feedback.type == 'report_comment') {
      ad.comment_list.forEach((_c, i) => {
        if (req.body.feedback.comment_code == _c.code) {
          _c.report_list = _c.report_list || [];
          _c.report_list.push({
            user: user,
            report_type: req.body.feedback.report_type,
            comment_report: req.body.feedback.comment_report,
            date: new Date(),
          });
        }
      });
    } else if (req.body.feedback.type == 'report_reply') {
      ad.comment_list.forEach((_c, i) => {
        _c.reply_list = _c.reply_list || [];
        _c.reply_list.forEach((_r) => {
          _r.report_list = _r.report_list || [];
          if (req.body.feedback.comment_code == _r.code) {
            _r.report_list.push({
              user: user,
              report_type: req.body.feedback.report_type,
              comment_report: req.body.feedback.comment_report,
              date: new Date(),
            });
          }
        });
      });
    } else if (req.body.feedback.type == 'comment') {
      ad.number_comments = ad.number_comments + 1;
      ad.comment_list = ad.comment_list || [];
      let comment = {
        user: user,
        comment_type: req.body.feedback.comment_type,
        comment: req.body.feedback.comment,
        date: new Date(),
        code: ad.number_comments + Math.floor(Math.random() * 1000),
      };
      ad.comment_list.push(comment);

      site.call('[notific][replies_ads_followed]', {
        user: ad.store.user,
        store_name: ad.store.name,
        user_action: req.session.user,
        action: {
          id: ad.id,
          name: ad.name,
        },
        follow_list: ad.follow_list,
      });
      site.call('[notific][comments_my_ads]', {
        user: ad.store.user,
        store_name: ad.store.name,
        user_action: req.session.user,
        action: {
          id: ad.id,
          name: ad.name,
        },
      });
    } else if (req.body.feedback.type == 'reply_comment') {
      ad.number_comments = ad.number_comments + 1;
      let comment = {
        user: user,
        comment_type: req.body.feedback.comment_type,
        comment: req.body.feedback.$comment,
        date: new Date(),
      };
      ad.comment_list = ad.comment_list || [];
      ad.comment_list.forEach((_c, i) => {
        if (req.body.feedback.comment_code == _c.code) {
          _c.reply_list = _c.reply_list || [];
          comment.code = i + 1 + Math.floor(Math.random() * 1000);
          _c.reply_list.push(comment);
        }
      });
      site.call('[notific][replies_ads_followed]', {
        user: ad.store.user,
        store_name: ad.store.name,
        user_action: req.session.user,
        action: {
          id: ad.id,
          name: ad.name,
        },
        follow_list: ad.follow_list,
      });
      site.call('[notific][comments_my_ads]', {
        user: ad.store.user,
        store_name: ad.store.name,
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

    response.doc = ad;
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
        if (req.body.display) {
          a.$update = true;
          a.number_views += 1;
          a.$time = site.xtime(a.date, req.session.lang|| 'ar');
          if (a.videos_list && a.videos_list.length > 0) {
            a.videos_list.forEach((v) => {
              v.$link = v.link;
              if (v.link && v.link.contains('watch')) {
                v.$link = 'https://www.youtube.com/embed/' + v.link.split('=')[1];
              }
            });
          }

          a.favorite_list = a.favorite_list || [];
          a.follow_list = a.follow_list || [];
          if (req.session.user) {
            a.$favorite = a.favorite_list.some((_f) => {
              return _f.user.id === req.session.user.id;
            });
          }
          if (req.session.user) {
            a.$follow = a.follow_list.some((_f) => {
              return _f.user.id === req.session.user.id;
            });
          }
          a.comment_list = a.comment_list || [];
          a.comment_list.forEach((_c) => {
            _c.$time = site.xtime(_c.date, req.session.lang|| 'ar');
            if (_c.reply_list && _c.reply_list.length > 0) {
              _c.reply_list.forEach((_r) => {
                _r.$time = site.xtime(_r.date, req.session.lang|| 'ar');
              });
            }
          });
        }
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

  site.post({ name: '/api/contents/all', public: true }, (req, res) => {
    let response = {
      done: false,
    };
    let where = req.body.where || {};

    let page_limit = req.data.page_limit || 20;
    let page_number = req.data.page_number || 0;
    let skip = page_number * page_limit;

    if (where['country']) {
      where['address.country.id'] = where['country'].id;
      delete where['country'];
    }

    let d1 = site.toDate(new Date());
    let d2 = site.toDate(new Date());
    d2.setDate(d2.getDate() + 1);

    if (req.body.post) {
      where.date = {
        $lte: d2,
      };

      where.expiry_date = {
        $gte: d1,
      };

      where['quantity_list.net_value'] = { $gte: where['price_from'] || 0, $lte: where['price_to'] || 100000000 };

      req.body.select = {
        id: 1,
        date: 1,
        number_views: 1,
        image_url: 1,
        mobile: 1,
        name: 1,
        store: 1,
        quantity_list: 1,
        address: 1,
        favorite_list: 1,
        set_price: 1,
      };
    }

    if (where['price'] == 'lowest') {
      req.body.sort = req.body.sort || {};
      req.body.sort['quantity_list.price'] = -1;
      delete where['price'];
    } else if (where['price'] == 'highest') {
      req.body.sort = req.body.sort || {};

      req.body.sort['quantity_list.price'] = 1;
      delete where['price'];
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
        description: site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'main_category.name_ar': site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'main_category.name_en': site.get_RegExp(where['text_search'], 'i'),
      });

      where.$or.push({
        'address.detailed_address': site.get_RegExp(where['text_search'], 'i'),
      });

      where.$or.push({
        'address.country.name_ar': site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'address.country.name_en': site.get_RegExp(where['text_search'], 'i'),
      });

      where.$or.push({
        'address.gov.name_ar': site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'address.gov.name_en': site.get_RegExp(where['text_search'], 'i'),
      });

      where.$or.push({
        'address.city.name_ar': site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'address.city.name_en': site.get_RegExp(where['text_search'], 'i'),
      });

      where.$or.push({
        'address.area.name_ar': site.get_RegExp(where['text_search'], 'i'),
      });
      where.$or.push({
        'address.area.name_en': site.get_RegExp(where['text_search'], 'i'),
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

    if (where['new']) {
      req.body.sort = req.body.sort || {};
      req.body.sort['date'] = -1;
    }

    delete where['near'];
    delete where['new'];
    delete where['text_search'];
    delete where['with_photos'];
    delete where['price_from'];
    delete where['price_to'];
    delete where['search_ads'];
    
    $content.findMany(
      {
        sort: req.body.sort || {
          id: -1,
        },
        select: req.body.select || {},
        where: where,
        skip: skip,
        limit: page_limit,
      },
      (err, docs, count) => {
        if (!err && docs) {
          if (req.body.post) {
            let lang = 'name_ar';
            if (req.session.lang == 'en') {
              lang = 'name_en';
            }
            docs.forEach((_a) => {
              if (_a.address) {
                _a.address.text = '';
                if (_a.address.country && _a.address.country.id) {
                  _a.address.text = _a.address.country[lang];
                }
                if (_a.address.gov && _a.address.gov.id) {
                  _a.address.text = _a.address.text + ' ' + _a.address.gov[lang];
                }
                if (_a.address.city && _a.address.city.id) {
                  _a.address.text = _a.address.text + ' ' + _a.address.city[lang];
                }
                if (_a.address.area && _a.address.area.id) {
                  _a.address.text = _a.address.text + ' ' + _a.address.area[lang];
                }
              }

              if (req.session.user) {
                _a.favorite_list = _a.favorite_list || [];
                _a.$favorite = _a.favorite_list.some((_f) => {
                  return _f.user.id === req.session.user.id;
                });
                if (req.session.user.cart && req.session.user.cart.items) {
                  _a.$card = req.session.user.cart.items.some((_c) => {
                    return _c.id === req.session.user.id;
                  });
                }
              }
              _a.$time = site.xtime(_a.date, req.session.lang || 'ar');
            });
          }
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

  site.xtime = function (_time, lang) {
    let since_few = ' Since few ';
    let before = ' Ago ';
    let second = ' Second ';
    let minute = ' Minute ';
    let hour = ' Hour ';
    let day = ' Day ';
    let month = ' Month ';
    let year = ' Year ';

    if (lang == 'ar') {
      since_few = ' منذ قليل ';
      before = ' منذ ';
      second = ' ثانية ';
      minute = ' دقيقة ';
      hour = ' ساعة ';
      day = ' يوم ';
      month = ' شهر ';
      year = ' سنة ';
    }

    if (typeof _time == 'undefined' || !_time) {
      return since_few;
    }
    _time = new Date().getTime() - new Date(_time).getTime();

    let _type = null;

    let _time_2 = null;
    let _type_2 = null;

    let times = [1, 1000, 60, 60, 24, 30, 12];
    let times_type = ['x', second, minute, hour, day, month, year];

    let offset = new Date().getTimezoneOffset();
    if (false && offset < 0) {
      let diff = Math.abs(offset) * 60 * 1000;
      _time = _time + diff;
    }

    if (_time <= 10000) {
      return since_few;
    }

    for (let i = 0; i < times.length; i++) {
      if (_time < times[i]) {
        break;
      } else {
        _type = times_type[i];
        if (i > 0) {
          _time_2 = _time % times[i];
          _type_2 = times_type[i - 1];
        }
        _time = _time / times[i];
      }
    }

    _time = Math.floor(_time);
    _time_2 = Math.floor(_time_2);

    if (_time_2 == 0 || _type_2 == null || _type_2 == 'x') {
      return [before, _time, _type].join(' ');
    } else {
      return [before, _time, _type, _time_2, _type_2].join(' ');
    }
  };

  site.deleteMyAds = function (id) {
    site.content_list.forEach((a) => {
      if ( a.store && a.store.user.id === id) {
        a.$delete = true;
      }
    });
  };

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
