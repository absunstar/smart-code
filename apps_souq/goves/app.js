module.exports = function init(site) {
  const $goves = site.connectCollection('goves');
  site.gov_list = [];
  $goves.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.gov_list = [...site.gov_list, ...docs];
    }
  });

  setInterval(() => {
    site.gov_list.forEach((a, i) => {
      if (a.$add) {
        $goves.add(a, (err, doc) => {
          if (!err && doc) {
            site.gov_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $goves.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $goves.delete({
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
    name: 'goves',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/goves/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let goves_doc = req.body;
    goves_doc.$req = req;
    goves_doc.$res = res;

    goves_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof goves_doc.active === 'undefined') {
      goves_doc.active = true;
    }

    response.done = true;
    goves_doc.$add = true;
    site.gov_list.push(goves_doc);
    res.json(response);
  });

  site.post('/api/goves/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let goves_doc = req.body;

    goves_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!goves_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    goves_doc.$update = true;
    site.gov_list.forEach((a, i) => {
      if (a.id === goves_doc.id) {
        site.gov_list[i] = goves_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/goves/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.gov_list.forEach((a) => {
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

  site.post('/api/goves/delete', (req, res) => {
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

    site.gov_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/goves/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    if (where['country']) {
      where['country.id'] = where['country'].id;
      delete where['country'];
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

    $goves.findMany(
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
      },
    );
  });
};
