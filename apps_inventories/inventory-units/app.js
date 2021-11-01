module.exports = function init(site) {
  const $units = site.connectCollection("units")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "units",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[company][created]', doc => {
    let y = new Date().getFullYear().toString()
    $units.add({
      name_ar: "وحدة إفتراضية",
      name_en : "Default Unit",
      image_url: '/images/unit.png',
      code: "1-Test",
      company: {
        id: doc.id,
        name_ar: doc.name_ar,
        name_en: doc.name_en
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar,
        name_en: doc.branch_list[0].name_en
      },
      active: true
    }, (err, doc) => { })
  })


  site.post("/api/units/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let units_doc = req.body
    units_doc.$req = req
    units_doc.$res = res

    units_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof units_doc.active === 'undefined') {
      units_doc.active = true
    }

    units_doc.company = site.get_company(req)
    units_doc.branch = site.get_branch(req)

    $units.findMany({
      where: {
        'company.id': site.get_company(req).id,
      }
    }, (err, docs, count) => {
      if (!err && count >= site.get_company(req).unit) {

        response.error = 'The maximum number of adds exceeded'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'units',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!units_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          units_doc.code = cb.code;
        }


        $units.add(units_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc

          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/units/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let units_doc = req.body

    units_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (units_doc.id) {
      $units.edit({
        where: {
          id: units_doc.id
        },
        set: units_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/units/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $units.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/units/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    site.getUnitToDelete(id, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $units.delete({
            id: id,
            $req: req,
            $res: res
          }, (err, result) => {
            if (!err) {
              response.done = true
            } else {
              response.error = err.message
            }
            res.json(response)
          })
        } else {
          response.error = 'no id'
          res.json(response)
        }
      }
    })
  })



  site.post("/api/units/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id

    $units.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })


  site.post('/api/units/handel_company', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let company = site.get_company(req);
    let branch = site.get_branch(req);

    $units.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          response.done = true;

          docs.forEach((_docs) => {
            _docs.company = company
            _docs.branch = branch
            $units.update(_docs);
          });
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.getUnits = function (req, callback) {
    callback = callback || {};
    let where = {};
    where['company.id'] = site.get_company(req).id
    $units.findMany(
      {
        where: where,
        sort: { id: -1 },
      },
      (err, docs) => {
        if (!err && docs) callback(docs);
        else callback(false);
      }
    );
  };

}