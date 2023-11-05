module.exports = function init(site) {
  const $review = site.connectCollection('review');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get(
    {
      name: ['profile', 'profile/:id/:name/:last_name'],
    },
    (req, res) => {
      site.security.getUser({ id: req.params.id }, (err, doc) => {
        if (!err && doc) {
          if (doc.profile) {
            if (doc.followers_list && doc.followers_list.length > 0 && req.session.user) {
              doc.followers_list.forEach((_f) => {
                if (_f == req.session.user.id) {
                  doc.$is_follow = true;
                }
              });
            }
            doc.$created_date = site.xtime(doc.created_date, req.session.lang || 'ar');
            let date = new Date(doc.visit_date);
            date.setMinutes(date.getMinutes() + 1);
            if (new Date() < date) {
              doc.$isOnline = true;
            } else {
              doc.$isOnline = false;
              doc.$last_seen = site.xtime(doc.visit_date, req.session.lang || 'ar');
            }
          }
          doc.title = site.setting.title + ' | ' + doc.profile.name;
          doc.image_url = doc.profile.image_url;
          doc.description = doc.profile.about_meabout_me;
          res.render('profile/index.html', doc, {
            parser: 'html css js',
            compress: true,
          });
        }
      });
    }
  );

  site.post('/api/review/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let review = req.body;
    review.$req = req;
    review.$res = res;

    review.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof review.active === 'undefined') {
      review.active = true;
    }

    review.company = site.get_company(req);
    review.branch = site.get_branch(req);

    $review.add(review, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/review/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let review = req.body;

    review.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (review.id) {
      $review.edit(
        {
          where: {
            id: review.id,
          },
          set: review,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/review/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $review.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/review/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    if (site.get_company(req) && site.get_company(req).id) where['company.id'] = site.get_company(req).id;

    $review.findMany(
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
