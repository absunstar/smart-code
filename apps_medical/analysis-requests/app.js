module.exports = function init(site) {
  const $analysis_requests = site.connectCollection("analysis_requests")

  //  $analysis_requests.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $analysis_requests.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // }) 

  site.get({
    name: "analysis_requests",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/analysis_requests/add", (req, res) => {
    let response = {
      done: false
    }
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let analysis_requests_doc = req.body
    analysis_requests_doc.$req = req
    analysis_requests_doc.$res = res


    analysis_requests_doc.company = site.get_company(req);
    analysis_requests_doc.branch = site.get_branch(req);

    analysis_requests_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    let num_obj = {
      company: site.get_company(req),
      screen: 'analysis_requests',
      date: analysis_requests_doc.date
    };

    let cb = site.getNumbering(num_obj);
    if (!analysis_requests_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      analysis_requests_doc.code = cb.code;
    }


    site.getPatientTicket(analysis_requests_doc.customer, callBackGet => {

      if (!callBackGet) {

        site.addPatientTicket(analysis_requests_doc, callBackAdd => {
          analysis_requests_doc.patient_ticket_id = callBackAdd.id

          $analysis_requests.add(analysis_requests_doc, (err, doc) => {

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

        analysis_requests_doc.patient_ticket_id = callBackGet.id

        $analysis_requests.add(analysis_requests_doc, (err, doc) => {

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

  site.post("/api/analysis_requests/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let analysis_requests_doc = req.body
    analysis_requests_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    analysis_requests_doc.analysis_list.forEach(_analysis => {
      if (_analysis.person_delivery && _analysis.person_delivery.name && !_analysis.delivery_date)
        _analysis.delivery_date = new Date()

    });

    analysis_requests_doc.delivery = analysis_requests_doc.analysis_list.every(_a1 => _a1.person_delivery && _a1.person_delivery.name);
    analysis_requests_doc.Putting_results = analysis_requests_doc.analysis_list.every(_a2 => _a2.result);

    if (analysis_requests_doc.id) {
      $analysis_requests.edit({
        where: {
          id: analysis_requests_doc.id
        },
        set: analysis_requests_doc,
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

  site.post("/api/analysis_requests/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $analysis_requests.findOne({
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

  site.post("/api/analysis_requests/delete", (req, res) => {
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
      $analysis_requests.delete({
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

  site.post("/api/analysis_requests/all", (req, res) => {
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

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $analysis_requests.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
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

  site.getAnalysisRequests = function (where, callback) {

    callback = callback || {};

    $analysis_requests.findMany({
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