module.exports = function init(site) {
  const $units = site.connectCollection('units');
  site.unit_list = [];
  $units.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.unit_list = [...site.unit_list, ...docs];
    }
  });

  setInterval(() => {
    site.unit_list.forEach((a, i) => {
      if (a.$add) {
        $units.add(a, (err, doc) => {
          if (!err && doc) {
            site.unit_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $units.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $units.delete({
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
    name: 'units',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });


  site.post('/api/units/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let units_doc = req.body;
    units_doc.$req = req;
    units_doc.$res = res;

    units_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof units_doc.active === 'undefined') {
      units_doc.active = true;
    }
    response.done = true;
    units_doc.$add = true;
    site.unit_list.push(units_doc);
    res.json(response);
  });

  site.post('/api/units/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let units_doc = req.body;

    units_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!units_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    units_doc.$update = true;
    site.unit_list.forEach((a, i) => {
      if (a.id === units_doc.id) {
        site.unit_list[i] = units_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/units/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.unit_list.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id'
      res.json(response);
    }
  });

  site.post('/api/units/delete', (req, res) => {
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

    site.unit_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/units/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

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

    $units.findMany(
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
