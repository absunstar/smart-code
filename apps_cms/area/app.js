module.exports = function init(site) {
  const $area = site.connectCollection('area');
  site.areaList = [];
  $area.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.areaList = [...site.areaList, ...docs];
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

    let areaDoc = req.body;
    areaDoc.$req = req;
    areaDoc.$res = res;

    areaDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof areaDoc.active === 'undefined') {
      areaDoc.active = true;
    }

    $area.add(areaDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.areaList.push(doc);
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

    let areaDoc = req.body;

    areaDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    if (!areaDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $area.edit(
      {
        where: {
          id: areaDoc.id,
        },
        set: areaDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.areaList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.areaList[i] = result.doc;
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
    site.areaList.forEach((a) => {
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
          site.areaList.splice(
            site.areaList.findIndex((a) => a.id === req.body.id),
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
      where['name']= site.get_RegExp(where['name'], 'i');
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
