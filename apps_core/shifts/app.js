module.exports = function init(site) {
  const $shifts = site.connectCollection("shifts")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "shifts",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $shifts.newCode = function () {

    let y = new Date().getFullYear().toString().substr(2, 2)
    let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
    let d = new Date().getDate()
    let lastCode = site.storage('shift_code') || 0
    let lastMonth = site.storage('shift_month') || m
    if (lastMonth != m) {
      lastMonth = m
      lastCode = 0
    }
    lastCode++
    site.storage('shift_code', lastCode)
    site.storage('shift_month', lastMonth)
    return y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  }



  site.on('[company][created]', doc => {
    $shifts.add({
      name: "شيفت إفتراضي",
      image_url: '/images/shift.png',
      code : $shifts.newCode(),
      company: {
        id: doc.id,
        name_ar: doc.name_ar
      },
      branch: {
        code: doc.branch_list[0].code,
        name_ar: doc.branch_list[0].name_ar
      },
      from_date: new Date(),
      from_time: {
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
      },
      active: true
    }, (err, doc) => { })
  })


  site.post("/api/shifts/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let shifts_doc = req.body
    shifts_doc.$req = req
    shifts_doc.$res = res
    shifts_doc.code = $shifts.newCode();
    shifts_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof shifts_doc.active === 'undefined') {
      shifts_doc.active = true
    }

    shifts_doc.company = site.get_company(req)
    shifts_doc.branch = site.get_branch(req)

    $shifts.find({

      where: {
        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'code': shifts_doc.code
      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Code Exists'
        res.json(response)
      } else {
        $shifts.add(shifts_doc, (err, doc) => {
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

  site.post("/api/shifts/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let shifts_doc = req.body

    shifts_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (shifts_doc.id) {
      $shifts.edit({
        where: {
          id: shifts_doc.id
        },
        set: shifts_doc,
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

  site.post("/api/shifts/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $shifts.findOne({
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

  site.post("/api/shifts/delete", (req, res) => {
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
      $shifts.delete({
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

  site.post("/api/shifts/open_shift", (req, res) => {
    let response = { done: false }

    let where = req.body.where || {}

    where['to_date'] = null || undefined
    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $shifts.findOne({
      select: req.body.select || {},
      where: where,
    }, (err, docs) => {
      if (!err && docs) response.list = docs
      else response.done = true

      res.json(response)
    })
  })

  site.post("/api/shifts/is_shift_open", (req, res) => {
    let response = { is_open: true }

    let where = {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['active'] = true

    $shifts.findMany({
      select: req.body.select || {},
      where: where,
    }, (err, docs) => {
      if (!err && docs && docs.length == 0) {
        response.is_open = false
      }
      res.json(response)
    })
  })

  site.post("/api/shifts/get_open_shift", (req, res) => {
    let response = { done: false }

    let where = {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    where['active'] = true

    $shifts.findOne({
      select: req.body.select || {},
      where: where,
    }, (err, doc) => {
      if (!err && doc) {
        response.done = true
        response.doc = doc
      }
      res.json(response)
    })
  })



  site.post("/api/shifts/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    if (where['code']) {
      where['code'] = new RegExp(where['code'], "i");
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $shifts.findMany({
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


}