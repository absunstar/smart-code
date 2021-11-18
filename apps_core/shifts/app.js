module.exports = function init(site) {
  const $shifts = site.connectCollection('shifts');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'shifts',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[company][created]', (doc) => {
    let name_ar = 'شيفت إفتراضي';
    let name_en = 'Default Shift';
    let image = '/images/shift.png';

    if (site.feature('school')) {
      name_ar = 'عام دراسي إفتراضي';
      name_en = 'Default Dchool Year';
      image = '/images/school_years.png';
    }

    $shifts.add(
      {
        name_ar: name_ar,
        name_en: name_en,
        image_url: image,
        code: '1-Test',
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
          name_en: doc.name_en,
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
          name_en: doc.branch_list[0].name_en,
        },
        from_date: new Date(),
        from_time: {
          hour: new Date().getHours(),
          minute: new Date().getMinutes(),
        },
        open_close_list: [
          {
            active: true,
            user: { name: doc.name_ar },
            date: new Date(),
          },
        ],
        active: true,
      },
      (err, doc) => {}
    );
  });

  site.post('/api/shifts/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let shifts_doc = req.body;
    shifts_doc.$req = req;
    shifts_doc.$res = res;
    let num_obj = {
      company: site.get_company(req),
      screen: 'shifts',
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!shifts_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;
    } else if (cb.auto) {
      shifts_doc.code = cb.code;
    }

    shifts_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof shifts_doc.active === 'undefined') {
      shifts_doc.active = true;
    }

    shifts_doc.company = site.get_company(req);
    shifts_doc.branch = site.get_branch(req);
    site.getBranchSafes(req, (safesCB) => {
    shifts_doc.open_close_list = [
      {
        active: true,
        user: site.security.getUserFinger({
          $req: req,
          $res: res,
        }),
        date: new Date(),
        safes: safesCB,
      },
    ];

    $shifts.find(
      {
        where: {
          'company.id': site.get_company(req).id,
          'branch.code': site.get_branch(req).code,
          code: shifts_doc.code,
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = 'Code Exists';
          res.json(response);
        } else {
          $shifts.add(shifts_doc, (err, doc) => {
            if (!err) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      }
    );
  });
});

  site.post('/api/shifts/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let shifts_doc = req.body;

    shifts_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    shifts_doc.to_date = new Date();
    shifts_doc.to_time = {
      hour: new Date(shifts_doc.to_date).getHours(),
      minute: new Date(shifts_doc.to_date).getMinutes(),
    };
    shifts_doc.open_close_list = shifts_doc.open_close_list || [];
    site.getBranchSafes(req, (safesCB) => {
      let obj = {
        active: shifts_doc.active ? true : false,
        user: site.security.getUserFinger({
          $req: req,
          $res: res,
        }),
        date: new Date(),
        safes: safesCB,
      };

      shifts_doc.open_close_list.push(obj);

      if (shifts_doc.id) {
        $shifts.edit(
          {
            where: {
              id: shifts_doc.id,
            },
            set: shifts_doc,
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
  });

  site.post('/api/shifts/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $shifts.findOne(
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

  site.post('/api/shifts/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $shifts.delete(
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
  });

  site.post('/api/shifts/open_shift', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    where['to_date'] = null || undefined;
    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;

    $shifts.findOne(
      {
        select: req.body.select || {},
        where: where,
      },
      (err, docs) => {
        if (!err && docs) response.list = docs;
        else response.done = true;

        res.json(response);
      }
    );
  });

  site.post('/api/shifts/is_shift_open', (req, res) => {
    let response = {
      is_open: true,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = {};

    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;
    where['active'] = true;

    $shifts.findMany(
      {
        select: req.body.select || {},
        where: where,
      },
      (err, docs) => {
        if (!err && docs && docs.length == 0) {
          response.is_open = false;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/shifts/get_open_shift', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = {};

    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;
    where['active'] = true;

    $shifts.findOne(
      {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1,
        },
        where: where,
      },
      (err, doc) => {
        if (!err && doc) {
          response.done = true;
          let obj = {
            id: doc.id,
            name_ar: doc.name_ar,
            name_en: doc.name_en,
            code: doc.code,
            from_date: doc.from_date,
            from_time: doc.from_time,
            to_date: doc.to_date,
            to_time: doc.to_time,
          };
          response.doc = obj;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/shifts/all', (req, res) => {
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
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i');
    }

    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;

    $shifts.findMany(
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

  site.getOpenShift = function (whereObj, callback) {
    callback = callback || {};

    whereObj['company.id'] = whereObj.companyId;
    whereObj['branch.code'] = whereObj.branchCode;
    whereObj['active'] = true;
    delete whereObj.companyId;
    delete whereObj.branchCode;
    $shifts.findOne(
      {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1,
        },
        where: whereObj,
      },
      (err, doc) => {
        if (!err && doc) {
          let obj = {
            id: doc.id,
            name_ar: doc.name_ar,
            name_en: doc.name_en,
            code: doc.code,
            from_date: doc.from_date,
            from_time: doc.from_time,
            to_date: doc.to_date,
            to_time: doc.to_time,
          };
          callback(obj);
        } else callback(false);
      }
    );
  };
};
