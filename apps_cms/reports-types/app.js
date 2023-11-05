module.exports = function init(site) {
  const $reportsTypes = site.connectCollection('reportsTypes');
  site.reportTypeList = [];
  $reportsTypes.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.reportTypeList = [...site.reportTypeList, ...docs];
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

    let reportsTypesDoc = req.body;
    reportsTypesDoc.$req = req;
    reportsTypesDoc.$res = res;

    reportsTypesDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof reportsTypesDoc.active === 'undefined') {
      reportsTypesDoc.active = true;
    }

    $reportsTypes.add(reportsTypesDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.reportTypeList.push(doc);
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

    let reportsTypesDoc = req.body;

    reportsTypesDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!reportsTypesDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    $reportsTypes.edit(
      {
        where: {
          id: reportsTypesDoc.id,
        },
        set: reportsTypesDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.reportTypeList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.reportTypeList[i] = result.doc;
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
    site.reportTypeList.forEach((a) => {
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
          site.reportTypeList.splice(
            site.reportTypeList.findIndex((a) => a.id === req.body.id),
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

    let where = req.body.where || {};
    let select = req.body.select || { id: 1, name: 1 };

    response.list = [];
    site.clusterList.forEach((doc) => {
      if ((langDoc = doc.translatedList.find((t) => t.language.id == req.session.lang || 'ar'))) {
        let obj = {
          ...doc,
          ...langDoc,
        };

        for (const p in obj) {
          if (!Object.hasOwnProperty.call(select, p)) {
            delete obj[p];
          }
        }

        if (!where.active || doc.active) {
          if (req.body.post) {
            if (doc.report_comments) {
              response.report_comment_list.push(obj);
            } else {
              response.reportAdList.push(obj);
            }
          } else {
            response.list.push(obj);
          }
        }
      }
    });

    response.done = true;
    res.json(response);
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
          if (req.body.post) {
            response.reportAdList = docs.filter((_d) => !_d.report_comments);
            response.report_comment_list = docs.filter((_d) => _d.report_comments);
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
