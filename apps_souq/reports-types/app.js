module.exports = function init(site) {
  const $reports_types = site.connectCollection('reports_types');
  site.report_type_list = [];
  $reports_types.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.report_type_list = [...site.report_type_list, ...docs];
    }
  });

  setInterval(() => {
    site.report_type_list.forEach((a, i) => {
      if (a.$add) {
        $reports_types.add(a, (err, doc) => {
          if (!err && doc) {
            site.report_type_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $reports_types.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $reports_types.delete({
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
    name: 'reports_types',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/reports_types/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let reports_types_doc = req.body;
    reports_types_doc.$req = req;
    reports_types_doc.$res = res;

    reports_types_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof reports_types_doc.active === 'undefined') {
      reports_types_doc.active = true;
    }


    response.done = true;
    reports_types_doc.$add = true;
    site.report_type_list.push(reports_types_doc);
    res.json(response);
  });

  site.post('/api/reports_types/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let reports_types_doc = req.body;

    reports_types_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!reports_types_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    reports_types_doc.$update = true;
    site.report_type_list.forEach((a, i) => {
      if (a.id === reports_types_doc.id) {
        site.report_type_list[i] = reports_types_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/reports_types/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.report_type_list.forEach((a) => {
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

  site.post('/api/reports_types/delete', (req, res) => {
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

    site.report_type_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/reports_types/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

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

    $reports_types.findMany(
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
