module.exports = function init(site) {
  const $vaccinations_requests = site.connectCollection("vaccinations_requests")
  const $customer = site.connectCollection("customers");
  //  $vaccinations_requests.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $vaccinations_requests.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // }) 

  site.get({
    name: "vaccinations_requests",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })


  site.post("/api/vaccinations_requests/add", (req, res) => {
    let response = {
      done: false
    }
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let vaccinations_requests_doc = req.body
    vaccinations_requests_doc.$req = req
    vaccinations_requests_doc.$res = res


    vaccinations_requests_doc.company = site.get_company(req);
    vaccinations_requests_doc.branch = site.get_branch(req);

    vaccinations_requests_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (vaccinations_requests_doc.at_home) {
      let found = false;
      let foundList = [];
      vaccinations_requests_doc.vaccinations_list.forEach((_a) => {
        if (!_a.made_home_vaccination) {
          found = true;
          if (req.session.lang == "Ar") {
            foundList.push(_a.name_ar);
          } else if (req.session.lang == "En") {
            foundList.push(_a.name_en);
          }
        }
      });

      if (found) {
        if (req.session.lang == "Ar") {
          response.error = `يوجد تطعيمات لا يمكن إجراءها في المنزل ( ${foundList.join(
            "-"
          )} )`;
        } else if (req.session.lang == "En") {
          response.error = `There are Vaccinations that cannot be done at home ( ${foundList.join(
            "-"
          )} )`;
        }
        res.json(response);
        return;
      }
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'vaccinations_requests',
      date: vaccinations_requests_doc.date
    };

    let cb = site.getNumbering(num_obj);
    if (!vaccinations_requests_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      vaccinations_requests_doc.code = cb.code;
    }


    site.getPatientTicket(vaccinations_requests_doc.customer, callBackGet => {

      if (!callBackGet) {

        site.addPatientTicket(vaccinations_requests_doc, callBackAdd => {
          vaccinations_requests_doc.patient_ticket_id = callBackAdd.id

          $vaccinations_requests.add(vaccinations_requests_doc, (err, doc) => {

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

        vaccinations_requests_doc.patient_ticket_id = callBackGet.id

        $vaccinations_requests.add(vaccinations_requests_doc, (err, doc) => {

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

  site.post("/api/vaccinations_requests/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vaccinations_requests_doc = req.body
    vaccinations_requests_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (vaccinations_requests_doc.at_home) {
      let found = false;
      let foundList = [];
      vaccinations_requests_doc.vaccinations_list.forEach((_a) => {
        if (!_a.made_home_vaccination) {
          found = true;
          if (req.session.lang == "Ar") {
            foundList.push(_a.name_ar);
          } else if (req.session.lang == "En") {
            foundList.push(_a.name_en);
          }
        }
      });

      if (found) {
        if (req.session.lang == "Ar") {
          response.error = `يوجد تطعيمات لا يمكن إجراءها في المنزل ( ${foundList.join(
            "-"
          )} )`;
        } else if (req.session.lang == "En") {
          response.error = `There are Vaccinations that cannot be done at home ( ${foundList.join(
            "-"
          )} )`;
        }
        res.json(response);
        return;
      }
    }

    vaccinations_requests_doc.vaccinations_list.forEach(_vaccinations => {
      if (_vaccinations.person_delivery && _vaccinations.person_delivery.name && !_vaccinations.delivery_date)
        _vaccinations.delivery_date = new Date()

    });

    vaccinations_requests_doc.delivery = vaccinations_requests_doc.vaccinations_list.every(_a1 => _a1.person_delivery && _a1.person_delivery.name);
    vaccinations_requests_doc.Putting_results = vaccinations_requests_doc.vaccinations_list.every(_a2 => _a2.notes_after_vaccinations);

    if (vaccinations_requests_doc.id) {
      $vaccinations_requests.edit({
        where: {
          id: vaccinations_requests_doc.id
        },
        set: vaccinations_requests_doc,
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

  site.post("/api/vaccinations_requests/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $vaccinations_requests.findOne({
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

  site.post("/api/vaccinations_requests/delete", (req, res) => {
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
      $vaccinations_requests.delete({
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

  site.post("/api/vaccinations_requests/all", (req, res) => {
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

    if (where['vaccination']) {
      where['vaccinations_list.id'] = where['vaccination'].id;

      delete where['vaccination']
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $vaccinations_requests.findMany({
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
            _d.vaccinations_list = _d.vaccinations_list || []

            _d.vaccinations_list.forEach(_a => {
              _a.date = _d.date
              _a.total_discount = _d.total_discount
              _a.total_value = _d.total_value
              _a.net_value = _d.net_value
              if (where['vaccinations_list.id']) {
                if (_a.id === where['vaccinations_list.id'])
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

  site.getVaccinationsRequests = function (_where, callback) {

    callback = callback || {};
    let where = { ..._where };

    if (where.search) {
      where.$or = [];
      where.$or.push(
        {
          "customer.name_ar": site.get_RegExp(where.search, "i"),
        },
        {
          "customer.name_en": site.get_RegExp(where.search, "i"),
        }
      );
      delete where.search;
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
    }
    if (where['id']) {
      where['patient_ticket_id'] = where['id'];
      delete where['id']
    }

    $vaccinations_requests.findMany({
      where: where,

    }, (err, docs) => {
      if (!err && docs)
        callback(docs)
      else callback(false)

    })
  }

  /* ATM APIS */


  site.post("/api/vaccinations_requests/addVaccinationRequest", (req, res) => {
    let response = {
      done: false
    }
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }
    let vaccinations_requests_doc = req.body
    let whereObj = {
      date: new Date(vaccinations_requests_doc.date),

    };
    if (whereObj.date) {
      let d1 = site.toDate(whereObj.date);
      let d2 = site.toDate(whereObj.date);
      d2.setDate(d2.getDate() + 1);
      whereObj.date = {
        $gte: d1,
        $lt: d2,
      };
    }
    $vaccinations_requests.findMany({ where: whereObj }, (err, docs, count) => {
      if (!err) {
        vaccinations_requests_doc.visit_number = count + 1;
        $customer.findOne({
          where: {
            id: vaccinations_requests_doc.customer.id,
          },
        },
          (err, customerData) => {
            if (!customerData) {
              response.error = 'no patient found';
              res.json(response);
              return
            } else {
              vaccinations_requests_doc.customer = customerData;
              vaccinations_requests_doc.$req = req
              vaccinations_requests_doc.$res = res
              vaccinations_requests_doc.company = site.get_company(req);
              vaccinations_requests_doc.branch = site.get_branch(req);

              vaccinations_requests_doc.add_user_info = site.security.getUserFinger({
                $req: req,
                $res: res
              })


              const randomNumber = (length) => {
                let text = "";
                let possible = "123456789";
                for (let i = 0; i < length; i++) {
                  let sup = Math.floor(Math.random() * possible.length);
                  text += i > 0 && sup == i ? "0" : possible.charAt(sup);
                }
                return (text);
              }


              vaccinations_requests_doc.code = String(randomNumber(4))

              site.getPatientTicket(customerData, callBackGet => {
                if (!callBackGet) {

                  site.addPatientTicket(vaccinations_requests_doc, callBackAdd => {
                    vaccinations_requests_doc.patient_ticket_id = callBackAdd.id

                    $vaccinations_requests.add(vaccinations_requests_doc, (err, doc) => {

                      if (!err) {
                        response.done = true
                        response.doc = doc

                      } else {
                        response.error = "error happened";
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

                  vaccinations_requests_doc.patient_ticket_id = callBackGet.id

                  $vaccinations_requests.add(vaccinations_requests_doc, (err, doc) => {
                    if (!err) {
                      response.done = true
                      response.doc = doc

                    } else {
                      response.error = "error happened";
                    }
                    res.json(response)
                  })
                }

              })

            }
          }
        );
      }
    })








  })


  // my profile
  site.post('/api/vaccinations_requests/myProfile', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }
    else if (!req.session.user.ref_info) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    $vaccinations_requests.aggregate([
      {
        "$match": {
          "customer.id": req.session.user.ref_info.id
        }
      },
      {
        "$project": {
          "date": 1.0,
          visit_day: 1,

          "visit_date": 1,
          "vaccinations_list": 1.0,
          "net_value": 1.0,
          "id": 1.0
        }
      }
    ], (err, docs) => {
      if (docs && docs.length > 0) {
        response.done = true;
        response.list = docs;

        res.json(response)
      } else {
        response.done = false

        response.list = [];
        res.json(response)
      }


    })

  });





  // my current user vaccinition
  site.post('/api/vaccinations_requests/getCurrentVaccination', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }
    else if (!req.session.user.ref_info) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    $vaccinations_requests.aggregate([
      {
        "$match": {
          "customer.id": req.session.user.ref_info.id
        },
        delivery: {
          $nin: [true]
        }
      },
      {
        "$project": {
          "date": 1.0,
          visit_day: 1,

          "visit_date": 1,
          "vaccinations_list": 1.0,
          "net_value": 1.0,
          "id": 1.0
        }
      }
    ], (err, docs) => {
      if (docs && docs.length > 0) {
        response.done = true;
        response.list = docs;

        res.json(response)
      } else {
        response.done = false

        response.list = [];
        res.json(response)
      }


    })

  });


  // my  vaccinition
  site.post('/api/vaccinations_requests/myProfile', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }
    else if (!req.session.user.ref_info) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    $vaccinations_requests.aggregate([
      {
        "$match": {
          "customer.id": req.session.user.ref_info.id
        },

      },
      {
        "$project": {
          "date": 1.0,
          visit_day: 1,

          "visit_date": 1,
          "vaccinations_list": 1.0,
          "net_value": 1.0,
          "id": 1.0
        }
      }
    ], (err, docs) => {
      if (docs && docs.length > 0) {
        response.done = true;
        response.list = docs;

        res.json(response)
      } else {
        response.done = false

        response.list = [];
        res.json(response)
      }


    })

  });


  // my delivered user vaccinition
  site.post('/api/vaccinations_requests/getDeliveredVaccination', (req, res) => {
    req.headers.language = req.headers.language || 'en'
    let response = {}
    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }
    else if (!req.session.user.ref_info) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    $vaccinations_requests.aggregate([
      {
        "$match": {
          "customer.id": req.session.user.ref_info.id
        },
        delivery: true
      },
      {
        "$project": {
          "date": 1.0,
          visit_day: 1,

          "visit_date": 1,
          "vaccinations_list": 1.0,
          "net_value": 1.0,
          "id": 1.0
        }
      }
    ], (err, docs) => {
      if (docs && docs.length > 0) {
        response.done = true;
        response.list = docs;

        res.json(response)
      } else {
        response.done = false

        response.list = [];
        res.json(response)
      }


    })

  });


}