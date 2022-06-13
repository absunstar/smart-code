module.exports = function init(site) {
  const $shops = site.connectCollection('shops');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'shops',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[company][created]', (doc) => {
    let y = new Date().getFullYear().toString();
    $shops.add(
      {
        name_ar: 'إعلان إفتراضي',
        name_en: 'Default Ad',
        image_url: '/images/shops.png',
        code: '1-Test',
        active: true,
      },
      (err, doc) => {}
    );
  });

  site.post('/api/shops/add', (req, res) => {
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

    ads_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof ads_doc.active === 'undefined') {
      ads_doc.active = true;
    }

    $shops.findMany({}, (err, docs, count) => {
      let num_obj = {
        screen: 'shops',
        date: new Date(),
      };

      let cb = site.getNumbering(num_obj);
      if (!ads_doc.code && !cb.auto) {
        response.error = 'Must Enter Code';
        res.json(response);
        return;
      } else if (cb.auto) {
        ads_doc.code = cb.code;
      }

      $shops.add(ads_doc, (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      });
    });
  });

  site.post('/api/shops/update', (req, res) => {
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

    if (ads_doc.id) {
      $shops.edit(
        {
          where: {
            id: ads_doc.id,
          },
          set: ads_doc,
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

  site.post('/api/shops/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $shops.findOne(
      {
        where: {
          id: req.body.id,
        },
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/shops/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    site.getUnitToDelete(id, (callback) => {
      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction';
        res.json(response);
      } else {
        if (id) {
          $shops.delete(
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
      }
    });
  });

  site.post('/api/shops/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    $shops.findMany(
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

  site.getUnits = function (req, callback) {
    callback = callback || {};
    let where = {};
    $shops.findMany(
      {
        where: where,
        sort: { id: -1 },
      },
      (err, docs) => {
        if (!err && docs) callback(docs);
        else callback(false);
      }
    );
  };
};
