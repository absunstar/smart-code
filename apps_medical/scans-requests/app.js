module.exports = function init(site) {
  const $scans_requests = site.connectCollection("scans_requests")

  //  $scans_requests.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $scans_requests.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // }) 

  site.get({
    name: "scans_requests",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/scans_requests/add", (req, res) => {
    let response = {
      done: false
    }
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let scans_requests_doc = req.body
    scans_requests_doc.$req = req
    scans_requests_doc.$res = res


    scans_requests_doc.company = site.get_company(req);
    scans_requests_doc.branch = site.get_branch(req);

    scans_requests_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    let num_obj = {
      company: site.get_company(req),
      screen: 'scans_requests',
      date: scans_requests_doc.date
    };

    let cb = site.getNumbering(num_obj);
    if (!scans_requests_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      scans_requests_doc.code = cb.code;
    }


    site.getPatientTicket(scans_requests_doc.customer, callBackGet => {

      if (!callBackGet) {

        site.addPatientTicket(scans_requests_doc, callBackAdd => {
          scans_requests_doc.patient_ticket_id = callBackAdd.id

          $scans_requests.add(scans_requests_doc, (err, doc) => {

            if (!err) {
              response.done = true
              response.doc = doc

            } else {
              response.error = err.message
            }
            res.json(response)
          })

        })



      } else {

        if (callBackGet.status && callBackGet.status.id === 2) {
          response.error = 'holding ticket for this patient';
          res.json(response);
          return;

        }

        scans_requests_doc.patient_ticket_id = callBackGet.id

        $scans_requests.add(scans_requests_doc, (err, doc) => {

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

  site.post("/api/scans_requests/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let scans_requests_doc = req.body
    scans_requests_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    scans_requests_doc.scans_list.forEach(_scans => {
      if (_scans.person_delivery && _scans.person_delivery.name && !_scans.delivery_date)
        _scans.delivery_date = new Date()

    });

    scans_requests_doc.delivery = scans_requests_doc.scans_list.every(_a1 => _a1.person_delivery && _a1.person_delivery.name);
    scans_requests_doc.Putting_results = scans_requests_doc.scans_list.every(_a2 => _a2.notes_after_scans);

    if (scans_requests_doc.id) {
      $scans_requests.edit({
        where: {
          id: scans_requests_doc.id
        },
        set: scans_requests_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/scans_requests/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $scans_requests.findOne({
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

  site.post("/api/scans_requests/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    if (id) {
      $scans_requests.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/scans_requests/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
    }

    if (where['scan']) {
      where['scans_list.id'] = where['scan'].id;

      delete where['scan']
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $scans_requests.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err && docs) {
        response.done = true
        response.list = docs
        response.count = count
        let all_list = []

        if (req.data.report) {

          docs.forEach(_d => {
            _d.scans_list = _d.scans_list || []

            _d.scans_list.forEach(_a => {
              _a.date = _d.date
              _a.total_discount = _d.total_discount
              _a.total_value = _d.total_value
              _a.net_value = _d.net_value
              if (where['scans_list.id']) {
                if (_a.id === where['scans_list.id'])
                  all_list.push(_a)

              } else all_list.push(_a)

            });
          });

          response.all_list = all_list
        }
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.getScansRequests = function (where, callback) {

    callback = callback || {};

    $scans_requests.findMany({
      where: {
        'customer.id': where.customer.id,
        patient_ticket_id: where.id
      },

    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)

    })
  }


}