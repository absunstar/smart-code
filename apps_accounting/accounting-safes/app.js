module.exports = function init(site) {
  const $safes = site.connectCollection('safes');

  site.on('[currency][safe][add]', (doc) => {
    let doc1 = { ...doc };
    let doc2 = { ...doc };
    $safes.insertMany([
      {
        name_Ar: 'خزينة بنك',
        name_En: 'Bank Safe',
        code: '2-Test',
        balance: 0,
        type: {
          id: 2,
          En: 'Bank',
          Ar: 'بنك',
        },
        image_url: '/images/safe.png',
        currency: {
          id: doc1.id,
          name_Ar: doc1.name_Ar,
          name_En: doc1.name_En,
          ex_rate: doc1.ex_rate,
        },
        company: {
          id: doc1.company.id,
          name_Ar: doc1.company.name_Ar,
          name_En: doc1.company.name_En,
        },
        branch: {
          code: doc1.branch.code,
          name_Ar: doc1.branch.name_Ar,
          name_En: doc1.branch.name_En,
        },
        active: true,
      },
      {
        name_Ar: 'خزينة نقدي',
        name_En: 'Cash Safe',
        code: '1-Test',
        balance: 0,
        type: {
          id: 1,
          En: 'Cash',
          Ar: 'نقدي',
        },
        image_url: '/images/safe.png',
        currency: {
          id: doc2.id,
          name_Ar: doc2.name_Ar,
          name_En: doc2.name_En,
          ex_rate: doc2.ex_rate,
        },
        company: {
          id: doc2.company.id,
          name_Ar: doc2.company.name_Ar,
          name_En: doc2.company.name_En,
        },
        branch: {
          code: doc2.branch.code,
          name_Ar: doc2.branch.name_Ar,
          name_En: doc2.branch.name_En,
        },
        active: true,
      },
    ]);
  });

  site.on('[amounts][safes][+]', (obj, callback, next) => {
    $safes.find(
      {
        id: obj.safe.id,
      },
      (err, doc) => {
        if (!err && doc) {
          doc.pre_balance = doc.balance;
          if (obj.transition_type == 'in') doc.balance = site.toNumber(doc.balance) + site.toNumber(obj.value);
          if (obj.transition_type == 'out') doc.balance = site.toNumber(doc.balance) - site.toNumber(obj.value);
          doc.description = obj.description;
          $safes.update(doc, (err, result) => {
            if (!err) {
              $safes.find(
                {
                  id: result.doc.id,
                },
                (err, doc) => {
                  obj.pre_balance = doc.pre_balance;
                  obj.image_url = doc.image_url;
                  obj.company = doc.company;
                  obj.branch = doc.branch;
                  obj.balance = doc.balance;

                  site.quee('[safes][safes_payments][+]', Object.assign({}, obj));
                }
              );
            }
            next();
          });
        } else {
          next();
        }
      }
    );
  });

  // $safes.deleteDuplicate({
  //   name_Ar: 1, name_En: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $safes.createUnique({
  //     name_Ar: 1, name_En: 1,
  //     'company.id': 1

  //   }, (err, result) => {

  //   })
  // })

  site.on('[shift][safes][change_user]', (obj) => {
    $safes.findMany({ 'company.id': obj.company.id }, (err, docs) => {
      docs.forEach((_doc) => {
        obj.last_safes_list.forEach((_s) => {
          if (_s.id === _doc.id) {

            _doc.employee = _s.receiving_employee

          }
        });

        $safes.update(_doc);
      });
    });
  });

  site.get({
    name: 'safes',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.post({
    name: '/api/safe_type/all',
    path: __dirname + '/site_files/json/safe_type.json',
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post('/api/safes/add', (req, res) => {
    let response = {};
    response.done = false;
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let safes_doc = req.body;
    safes_doc.$req = req;
    safes_doc.$res = res;
    safes_doc.balance = site.toNumber(safes_doc.balance);
    safes_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    safes_doc.company = site.get_company(req);
    safes_doc.branch = site.get_branch(req);

    let num_obj = {
      company: site.get_company(req),
      screen: 'safes',
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!safes_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;
    } else if (cb.auto) {
      safes_doc.code = cb.code;
    }

    $safes.add(safes_doc, (err, doc) => {
      if (!err) {
        let obj = {
          image_url: doc.image_url,
          operation: { Ar: 'خزينة جديدة', En: 'New Safe' },
          pre_balance: 0,
          balance: doc.balance,
          currency: doc.currency,
          company: doc.company,
          branch: doc.branch,
          value: doc.balance,
          safe: {
            name_Ar: doc.name_Ar,
            name_En: doc.name_En,
            id: doc.id,
          },
          date: new Date(),
          transition_type: 'in',
          shift: {
            id: doc.shift.id,
            code: doc.shift.code,
            name_Ar: doc.shift.name_Ar,
            name_En: doc.shift.name_En,
          },
        };
        if (doc.balance) site.quee('[safes][safes_payments][+]', obj);
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/safes/update', (req, res) => {
    let response = {};
    response.done = false;
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let safes_doc = req.body;
    safes_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    safes_doc.employee = site.fromJson(safes_doc.employee);
    if (safes_doc._id) {
      $safes.edit(
        {
          where: {
            _id: safes_doc._id,
          },
          set: safes_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      res.json(response);
    }
  });

  site.post('/api/safes/delete', (req, res) => {
    let response = {};
    response.done = false;
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    let data = { name: 'safe', id: id };
    site.getAccountingDataToDelete(data, (callback) => {
      if (callback == true) {
        response.error = 'Cant Delete Safe Its Exist In Other Transaction';
        res.json(response);
      } else {
        if (id) {
          $safes.delete(
            {
              id: id,
              $req: req,
              $res: res,
            },
            (err, result) => {
              if (!err) {
                response.done = true;

                site.call('delete safe payment', id);
              }
              res.json(response);
            }
          );
        } else {
          res.json(response);
        }
      }
    });
  });

  site.post('/api/safes/view', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $safes.findOne(
      {
        where: {
          _id: site.mongodb.ObjectID(req.body._id),
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

  site.post('/api/safes/reset', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $safes.findMany(
      {
        select: req.body.select || {},
        where: { 'company.id': site.get_company(req).id },
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          docs.forEach((safes_doc) => {
            safes_doc.balance = 0;
            $safes.update(safes_doc);
          });
        }
        response.done = true;
        res.json(response);
      }
    );
  });

  site.post('/api/safes/all', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }
    if (where['description']) {
      where['description'] = site.get_RegExp(where['description'], 'i');
    }

    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = req.body.branchCode ? req.body.branchCode : site.get_branch(req).code;

    $safes.findMany(
      {
        select: req.body.select || {},
        sort: {
          id: -1,
        },
        limit: req.body.limit,
        where: where,
      },
      (err, docs) => {
        if (!err) {
          response.done = true;
          response.list = docs;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.getBranchSafes = function (req, callback) {
    let where = {};

    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;

    $safes.findMany(
      {
        where: where,
      },
      (err, docs) => {
        if (!err && docs) {
          callback(docs);
        }
      }
    );
  };
};
