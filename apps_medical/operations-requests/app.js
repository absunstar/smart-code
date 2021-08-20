module.exports = function init(site) {
  const $operations_requests = site.connectCollection("operations_requests")

  //  $operations_requests.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $operations_requests.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // }) 

  site.get({
    name: "operations_requests",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/operations_requests/add", (req, res) => {
    let response = {
      done: false
    }
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let operations_requests_doc = req.body
    operations_requests_doc.$req = req
    operations_requests_doc.$res = res


    operations_requests_doc.company = site.get_company(req);
    operations_requests_doc.branch = site.get_branch(req);

    operations_requests_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    let num_obj = {
      company: site.get_company(req),
      screen: 'operations_requests',
      date: operations_requests_doc.date
    };

    let cb = site.getNumbering(num_obj);
    if (!operations_requests_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      operations_requests_doc.code = cb.code;
    }


    site.getPatientTicket(operations_requests_doc.customer, callBackGet => {

      if (!callBackGet) {

        site.addPatientTicket(operations_requests_doc, callBackAdd => {
          operations_requests_doc.patient_ticket_id = callBackAdd.id

          $operations_requests.add(operations_requests_doc, (err, doc) => {

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

        operations_requests_doc.patient_ticket_id = callBackGet.id

        $operations_requests.add(operations_requests_doc, (err, doc) => {

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

  site.post("/api/operations_requests/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let operations_requests_doc = req.body
    operations_requests_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    operations_requests_doc.operations_list.forEach(_operations => {
      if (_operations.person_delivery && _operations.person_delivery.name && !_operations.delivery_date)
        _operations.delivery_date = new Date()

    });

    operations_requests_doc.delivery = operations_requests_doc.operations_list.every(_a1 => _a1.person_delivery && _a1.person_delivery.name);
    operations_requests_doc.Putting_results = operations_requests_doc.operations_list.every(_a2 => _a2.result);

    if (operations_requests_doc.id) {
      $operations_requests.edit({
        where: {
          id: operations_requests_doc.id
        },
        set: operations_requests_doc,
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

  site.post("/api/operations_requests/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $operations_requests.findOne({
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

  site.post("/api/operations_requests/delete", (req, res) => {
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
      $operations_requests.delete({
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

  site.post("/api/operations_requests/all", (req, res) => {
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

    $operations_requests.findMany({
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


  site.getOperationsRequests = function (where, callback) {

    callback = callback || {};
    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
    }
    if (where['id']) {
      where['patient_ticket_id'] = where['id'];
      delete where['id']
    }
    $operations_requests.findMany({
      where: where,

    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)

    })
  }

}