module.exports = function init(site) {
  const $reportsTypes = site.connectCollection('reportsTypes');
  site.report_type_list = [];
  $reportsTypes.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.report_type_list = [...site.report_type_list, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'reportsTypes',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/reportsTypes/add', (req, res) => {
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

    reports_types_doc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof reports_types_doc.active === 'undefined') {
      reports_types_doc.active = true;
    }

    $reportsTypes.add(reports_types_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.report_type_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/reportsTypes/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let reports_types_doc = req.body;

    reports_types_doc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!reports_types_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    $reportsTypes.edit(
      {
        where: {
          id: reports_types_doc.id,
        },
        set: reports_types_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.report_type_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.report_type_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/reportsTypes/view', (req, res) => {
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

  site.post('/api/reportsTypes/delete', (req, res) => {
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

    $reportsTypes.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.report_type_list.splice(
            site.report_type_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/reportsTypes/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    $reportsTypes.findMany(
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
          if(req.body.post) {

            response.report_ad_list = docs.filter(_d => !_d.report_comments);
            response.report_comment_list = docs.filter(_d => _d.report_comments);
         
          } else {
            response.list = docs;
          }
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
