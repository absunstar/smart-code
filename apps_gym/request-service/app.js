module.exports = function init(site) {
  const $request_service = site.connectCollection("request_service")


  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $request_service.newCode = function () {

    let y = new Date().getFullYear().toString().substr(2, 2)
    let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
    let d = new Date().getDate()
    let lastCode = site.storage('ticket_last_code') || 0
    let lastMonth = site.storage('ticket_last_month') || m
    if (lastMonth != m) {
      lastMonth = m
      lastCode = 0
    }
    lastCode++
    site.storage('ticket_last_code', lastCode)
    site.storage('ticket_last_month', lastMonth)
    return y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  }

  site.on('[attend_session][attend_request][+]', obj => {
    $request_service.findOne({
      where: { id: obj.service.id }
    }, (err, doc) => {

      if (doc.selectedServicesList && doc.selectedServicesList.length > 0) {
        doc.selectedServicesList.forEach(attend_service => {
          if(attend_service.id == obj.service.service_id){            
            attend_service.current_attendance = attend_service.current_attendance + 1;
            attend_service.remain = attend_service.remain - 1;
          }
        });
      } else {
        doc.current_attendance = doc.current_attendance + 1;
        doc.remain = doc.remain - 1;
      }

      doc.attend_service_list.unshift({
        name: obj.service.name,
        trainer_attend: obj.trainer,
        attend_date: obj.attend_date,
        attend_time: obj.attend_time,
        leave_date: obj.leave_date,
        leave_time: obj.leave_time,
      })

      if (!err && doc) $request_service.edit(doc)
    })
  })

  site.on('[create_invoices][request_service][+]', function (obj) {
    $request_service.findOne({ id: obj }, (err, doc) => {
      doc.invoice = true
      $request_service.update(doc);
    });
  });

  site.on('[register][request_service][add]', doc => {

    $request_service.add({
      code: "1",
      name: "طلب خدمة إفتراضية",
      image_url: '/images/request_service.png',

      code: $request_service.newCode(),
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      active: true
    }, (err, doc) => { })
  })

  site.post({
    name: "/api/period_class/all",
    path: __dirname + "/site_files/json/period_class.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "request_service",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/request_service/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let request_service_doc = req.body
    request_service_doc.$req = req
    request_service_doc.$res = res

    request_service_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof request_service_doc.active === 'undefined') {
      request_service_doc.active = true
    }
    request_service_doc.code = $request_service.newCode()
    request_service_doc.company = site.get_company(req)
    request_service_doc.branch = site.get_branch(req)

/*     if (request_service_doc.discountes && request_service_doc.discountes.length > 0) {
      request_service_doc.total_discount = 0
      request_service_doc.discountes.map(discountes => request_service_doc.total_discount += discountes.value)
    } */

    request_service_doc.attend_service_list = []
    if (request_service_doc.selectedServicesList && request_service_doc.selectedServicesList.length > 0) {
      request_service_doc.selectedServicesList.forEach(attend_service => {
        attend_service.total_real_attend_count = attend_service.total_attend_count * request_service_doc.service_count;
        attend_service.current_attendance = request_service_doc.attend_service_list.length || 0;
        attend_service.remain = attend_service.total_real_attend_count - attend_service.current_attendance || 0;
      });
    } else {
      request_service_doc.total_real_attend_count = request_service_doc.attend_count * request_service_doc.service_count;
      request_service_doc.current_attendance = request_service_doc.attend_service_list.length || 0;
      request_service_doc.remain = request_service_doc.total_real_attend_count - request_service_doc.current_attendance || 0;
    }

    $request_service.add(request_service_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/request_service/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let request_service_doc = req.body

    request_service_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
/* 
    if (request_service_doc.discountes && request_service_doc.discountes.length > 0) {
      request_service_doc.total_discount = 0
      request_service_doc.discountes.map(discountes => request_service_doc.total_discount += discountes.value)
    } */

    if (request_service_doc.selectedServicesList && request_service_doc.selectedServicesList.length > 0) {
      request_service_doc.selectedServicesList.forEach(attend_service => {
        attend_service.total_real_attend_count = attend_service.total_attend_count * request_service_doc.service_count;
        attend_service.current_attendance = request_service_doc.attend_service_list.length || 0;
        attend_service.remain = attend_service.total_real_attend_count - attend_service.current_attendance || 0;
      });
    } else {
      request_service_doc.total_real_attend_count = request_service_doc.attend_count * request_service_doc.service_count;
      request_service_doc.current_attendance = request_service_doc.attend_service_list.length || 0;
      request_service_doc.remain = request_service_doc.total_real_attend_count - request_service_doc.current_attendance || 0;
    }

    if (request_service_doc.id) {
      $request_service.edit({
        where: {
          id: request_service_doc.id
        },
        set: request_service_doc,
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

  site.post("/api/request_service/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $request_service.findOne({
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

  site.post("/api/request_service/delete", (req, res) => {
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
      $request_service.delete({
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

  site.post("/api/request_service/all", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []
      where.$or.push({
        'service.name': new RegExp(search, "i")
      })
      where.$or.push({
        'customer.name_ar': new RegExp(search, "i")
      })
      where.$or.push({
        'trainer.name': new RegExp(search, "i")
      })
      where.$or.push({
        'hall.name': new RegExp(search, "i")
      })
    }

    if (where.date_from_to && where.date_from_from) {
      let d1 = site.toDate(where.date_from_from)
      let d2 = site.toDate(where.date_from_to)
      d2.setDate(d2.getDate() + 1);
      where.date_from = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from_from
      delete where.date_from_to
    }

    if (where.date_to_to && where.date_to_from) {
      let d1 = site.toDate(where.date_to_from)
      let d2 = site.toDate(where.date_to_to)
      d2.setDate(d2.getDate() + 1);
      where.date_to = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_to_from
      delete where.date_to_to
    }

    if (where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_from)
      d2.setDate(d2.getDate() + 1)
      where.date_from = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where.date_to) {
      let d1 = site.toDate(where.date_to)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1)
      where.date_to = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where['hall']) {
      where['hall.id'] = where['hall'].id;
      delete where['hall']
    }

    if (where['service_name']) where['service_name'] = new RegExp(where['service_name'], 'i')

    if (where['customer']) where['customer.name_ar'] = new RegExp(where['customer'], 'i')

    if (where['trainer']) where['trainer.name'] = new RegExp(where['trainer'], 'i')

    if (where['code']) where['code'] = new RegExp(where['code'], "i");

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $request_service.findMany({
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

  site.post("/api/request_service/all_session", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}
    let search = req.body.search

    if (search) {
      where.$or = []

      where.$or.push({
        'customer.id': search.id
      })

      where['company.id'] = site.get_company(req).id
      where['branch.code'] = site.get_branch(req).code

      $request_service.findMany({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1
        },
        limit: req.body.limit
      }, (err, docs, count) => {
        if (!err) {
          let services_list = []
          docs.forEach(request_service => {
            if (request_service.selectedServicesList && request_service.selectedServicesList.length > 0) {
              request_service.selectedServicesList.forEach(selectedServices => {

                services_list.push({
                  id: request_service.id,
                  name: selectedServices.name,
                  general_service: request_service.service_name,
                  service_id: selectedServices.id
                })
              });
            } else {
              services_list.push({
                id: request_service.id,
                name: request_service.service_name,
                service_id: request_service.service_id
              })
            }

          });

          response.done = true
          response.list = services
          response.count = count
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    }
  })

  site.getDataToDelete = function (data, callback) {
    let where = {}

    if (data.name == 'hall') where['hall.id'] = data.id
    else if (data.name == 'customer') where['customer.id'] = data.id
    else if (data.name == 'trainer') where['trainer.id'] = data.id
    else if (data.name == 'service') where['service_id'] = data.id

    $request_service.findOne({
      where: where,
    }, (err, docs, count) => {
      if (!err) {
        if (docs) callback(true)
        else callback(false)
      }
    })
  }

}