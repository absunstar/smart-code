module.exports = function init(site) {
  const $patients_tickets = site.connectCollection("patients_tickets")


  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.get({
    name: "patients_tickets",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.post("/api/patients_tickets/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let patients_tickets_doc = req.body
    patients_tickets_doc.$req = req
    patients_tickets_doc.$res = res

    patients_tickets_doc.company = site.get_company(req);
    patients_tickets_doc.branch = site.get_branch(req);

    patients_tickets_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    patients_tickets_doc.status = {
      id: 1,
      ar: 'مفتوحة',
      en: 'Opening',
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'patients_tickets',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!patients_tickets_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      patients_tickets_doc.code = cb.code;
    }

    $patients_tickets.findOne({
      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'customer.id': patients_tickets_doc.customer.id,
        $or: [{
          'status.id': 1
        }, {
          'status.id': 2
        }]
      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'There is an unclosed ticket for the same patient'
        res.json(response)

      } else {

        $patients_tickets.add(patients_tickets_doc, (err, doc) => {
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

  site.post("/api/patients_tickets/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let patients_tickets_doc = req.body


    patients_tickets_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (patients_tickets_doc.status && patients_tickets_doc.status.id === 3) {
      patients_tickets_doc.closing_date = new Date()
    }

    if (patients_tickets_doc.id) {
      $patients_tickets.edit({
        where: {
          id: patients_tickets_doc.id
        },
        set: patients_tickets_doc,
        $req: req,
        $res: res
      }, (err, doc) => {
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

  site.post("/api/patients_tickets/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $patients_tickets.findOne({
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

  site.post("/api/patients_tickets/delete", (req, res) => {
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
      $patients_tickets.delete({
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
  })

  site.post("/api/patients_tickets/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city']
    }


    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    if (req.session.user && req.session.user.type === 'patients_tickets') {
      where['id'] = req.session.user.ref_info.id;
    }

    $patients_tickets.findMany({
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

  site.getPatientTicket = function (customer, callback) {

    callback = callback || {};

    $patients_tickets.findOne({
      where: {
        'customer.id': customer.id,
        $or: [{
          'status.id': 1
        }, {
          'status.id': 2
        }]
      },
      sort: { id: -1 }

    }, (err, doc) => {
      if (!err && doc)
        callback(doc)
      else callback(false)

    })
  }

  site.addPatientTicket = function (doctors_visits, callback) {

    callback = callback || {};

    let num_obj = {
      company: doctors_visits.company,
      screen: 'patients_tickets',
      date: new Date()
    };

    let cbCode = site.getNumbering(num_obj);


    $patients_tickets.add({
      image_url: '/images/patients_tickets.png',
      customer: doctors_visits.customer,
      company: doctors_visits.company,
      branch: doctors_visits.branch,
      code: cbCode.code,
      status: {
        id: 1,
        ar: 'مفتوحة',
        en: 'Opening',
      },
      opening_date: new Date(),
      add_user_info: doctors_visits.add_user_info,

    }, (err, doc) => {
      if (!err && doc)
        callback(doc)
      else callback(false)

    })
  }
}