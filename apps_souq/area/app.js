module.exports = function init(site) {
  const $area = site.connectCollection('area');
  site.area_list = [];
  $area.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.area_list = [...site.area_list, ...docs];
    }
  });

  setInterval(() => {
    site.area_list.forEach((a, i) => {
      if (a.$add) {
        $area.add(a, (err, doc) => {
          if (!err && doc) {
            site.area_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $area.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $area.delete({
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
    name: 'area',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[register][area][add]', (doc) => {
    $area.add(
      {
        gov: {
          id: doc.gov.id,
          code: doc.gov.code,
          name_ar: doc.gov.name_ar,
          name_en: doc.gov.name_en,
        },
        city: {
          id: doc.id,
          code: doc.code,
          name_ar: doc.name_ar,
          name_en: doc.name_en,
        },
        name_ar: 'منطقة إفتراضية',
        name_en: 'Default Area',
        code: '1-Test',
        price_delivery_service: 0,
        image_url: '/images/area.png',

        active: true,
      },
      (err, doc) => {}
    );
  });

  site.post('/api/area/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let area_doc = req.body;
    area_doc.$req = req;
    area_doc.$res = res;

    area_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof area_doc.active === 'undefined') {
      area_doc.active = true;
    }

    let num_obj = {
      screen: 'area',
      date: new Date(),
    };
    let cb = site.getNumbering(num_obj);

    if (!area_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;
    } else if (cb.auto) {
      area_doc.code = cb.code;
    }

    response.done = true;
    area_doc.$add = true;
    site.area_list.push(area_doc);
    res.json(response);
  });

  site.post('/api/area/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let area_doc = req.body;

    area_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    if (!area_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    area_doc.$update = true;
    site.area_list.forEach((a, i) => {
      if (a.id === area_doc.id) {
        site.area_list[i] = area_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/area/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.area_list.forEach((a) => {
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

  site.post('/api/area/delete', (req, res) => {
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

    site.area_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/area/getAreaByCity/:cityId', (req, res) => {
    let response = {
      done: false,
    };
    $area.findMany(
      {
        where: {
          'city._id': String(req.params.cityId),
        },
      },
      (err, doc) => {
        if (!err && doc.length > 0) {
          response.doc = doc;
          response.done = true;
        }
        if (!doc || doc.length == 0) {
          response.done = false;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/area/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['country']) {
      where['country.id'] = where['country'].id;
      delete where['country'];
      delete where.active;
    }

    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov'];
      delete where.active;
    }

    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city'];
      delete where.active;
    }

    if (where['name']) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_en: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name']
    }

    $area.findMany(
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

  /* ATM APIS */
  site.post('/api/area/findAreaByCity', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city'];
      delete where.active;
    }
    if (where['city'] == '' || where['city'] == undefined) {
      delete where['city'];
    }

    $area.findMany(
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
