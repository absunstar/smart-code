module.exports = function init(site) {
  const $ads = site.connectCollection('ads');
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
  }, 1000 * 30);

  site.post('/api/ads/add', (req, res) => {
    let response = {
      done: true,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ads_doc = req.body;
    ads_doc.$req = req;
    ads_doc.$res = res;

    ads_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    ads_doc.$add = true;
    site.ad_list.push(ads_doc);
    res.json(response);
  });

  site.post('/api/ads/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ads_doc = req.body;

    ads_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    response.done = true;
    ads_doc.$update = true;
    site.ad_list.forEach((a, i) => {
      if (a.id === ads_doc.id) {
        site.ad_list[i] = ads_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/ads/delete', (req, res) => {
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

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'ads',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[company][created]', (doc) => {
    let y = new Date().getFullYear().toString();
    $ads.add(
      {
        name_ar: 'إعلان إفتراضي',
        name_en: 'Default Ad',
        image_url: '/images/ads.png',
        code: '1-Test',
        active: true,
      },
      (err, doc) => {}
    );
  });

  site.post('/api/ads/update_comment', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let user = {
      id : req.session.user.id,
      email : req.session.user.email,
      profile : req.session.user.profile,
    }
    let ads_doc = req.body;
    let ad = site.ad_list.find((_ad) => {
      return _ad.id === ads_doc.id;
    });
    ad.comments_activities = ad.comments_activities || [];
    // let index = 0;
    // ad.comments_activities.forEach((_c, i) => {
    //   if (req.session.user.id === _c.user.id) {
    //     if (ads_doc.type == 'like') {
    //       if (_c.comment_activity && _c.comment_activity.id == 1) {
    //         index = i;
    //       }
    //     } else if (ads_doc.type == 'favorite') {
    //       if (_c.comment_activity && _c.comment_activity.id == 2) {
    //         index = i;
    //       }
    //     }
    //   }
    // });
    if (ads_doc.type == 'like') {
      if (ads_doc.obj.like) {
        ad.comments_activities.push({
          user: user,
          comment_activity: { id: 1, en: 'Like', ar: 'إعجاب' },
          date: new Date(),
        });
      } else {
        ad.comments_activities.splice(ad.comments_activities.findIndex(c =>  c.comment_activity.id == 1) , 1)
      }
    } else if (ads_doc.type == 'favorite') {
      if (ads_doc.obj.favorite) {
        ad.comments_activities.push({
          user: user,
          comment_activity: { id: 2, en: 'Favorite', ar: 'مفضل' },
          date: new Date(),
        });
      } else {
        ad.comments_activities.splice(ad.comments_activities.findIndex(c =>  c.comment_activity.id == 2) , 1)
      }
    } else if (ads_doc.type == 'report') {
      ad.comments_activities.push({
        user: user,
        comment_activity: { id: 3, en: 'Report', ar: 'إبلاغ' },
        report_type: ads_doc.obj.report_type,
        comment_report: ads_doc.obj.comment_report,
        date: new Date(),
      });
    } else if (ads_doc.type == 'comment') {
      ad.comments_activities.push({
        user: user,
        comment_activity: { id: 4, en: 'Comment', ar: 'تعليق' },
        comment_type: ads_doc.obj.comment_type,
        comment: ads_doc.obj.comment,
        date: new Date(),
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

  site.post('/api/ads/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let ad = null;
    site.ad_list.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      res.json(response);
    }
  });

  site.post('/api/ads/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }
    let skip = 0;
    let start = (req.data.page_number || 0) * (req.data.limit || 0);
    let end = start + (req.data.limit || 100);

    if (true) {
      response.done = true;
      response.list = site.ad_list.filter((i) => !i.$delete).slice(start, end);
      response.count = response.list.length;
      res.json(response);
    } else {
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
    }
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
