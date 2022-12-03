module.exports = function init(site) {
  const $area = site.connectCollection('area');
  site.area_list = [];
  $area.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.area_list = [...site.area_list, ...docs];
    }
  });

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

    $area.add(area_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.area_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
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

    $area.edit(
      {
        where: {
          id: area_doc.id,
        },
        set: area_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.area_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.area_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
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

    $area.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.area_list.splice(
            site.area_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
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
      delete where['name'];
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
