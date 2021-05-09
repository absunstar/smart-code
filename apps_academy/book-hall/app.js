module.exports = function init(site) {
  const $book_hall = site.connectCollection("book_hall")


  site.on('[account_invoices][book_hall][+]', function (obj) {
    $book_hall.findOne({ id: obj }, (err, doc) => {
      doc.invoice = true
      $book_hall.update(doc);
    });
  });

  site.post({
    name: "/api/attend_book_hall/all",
    path: __dirname + "/site_files/json/attend_book_hall.json"

  })

  site.post({
    name: "/api/period_book/all",
    path: __dirname + "/site_files/json/period_book.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "book_hall",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post({
    name: "/api/times_book/all",
    path: __dirname + "/site_files/json/times_book.json"

  })



  // function addZero(code, number) {
  //   let c = number - code.toString().length
  //   for (let i = 0; i < c; i++) {
  //     code = '0' + code.toString()
  //   }
  //   return code
  // }

  // $book_hall.newCode = function () {

  //   let y = new Date().getFullYear().toString().substr(2, 2)
  //   let m = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'][new Date().getMonth()].toString()
  //   let d = new Date().getDate()
  //   let lastCode = site.storage('ticket_last_code') || 0
  //   let lastMonth = site.storage('ticket_last_month') || m
  //   if (lastMonth != m) {
  //     lastMonth = m
  //     lastCode = 0
  //   }
  //   lastCode++
  //   site.storage('ticket_last_code', lastCode)
  //   site.storage('ticket_last_month', lastMonth)
  //   return 'B-H' + y + lastMonth + addZero(d, 2) + addZero(lastCode, 4)
  // }

  site.post("/api/book_hall/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let book_hall_doc = req.body
    book_hall_doc.$req = req
    book_hall_doc.$res = res

    let num_obj = {
      company: site.get_company(req),
      screen: 'booking_halls',
      date: new Date(book_hall_doc.date)
    };

    let cb = site.getNumbering(num_obj);
    if (!book_hall_doc.code && !cb.auto) {

      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      book_hall_doc.code = cb.code;
    }

    book_hall_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof book_hall_doc.active === 'undefined') {
      book_hall_doc.active = true
    }

    book_hall_doc.company = site.get_company(req)
    book_hall_doc.branch = site.get_branch(req)

    $book_hall.add(book_hall_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc

      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/book_hall/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let book_hall_doc = req.body

    book_hall_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (book_hall_doc.id) {
      $book_hall.edit({
        where: {
          id: book_hall_doc.id
        },
        set: book_hall_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result) {
          response.done = true
          response.doc = result.doc


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


  site.post("/api/book_hall/update_paid", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let book_hall_doc = req.body

    book_hall_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (book_hall_doc.id) {
      $book_hall.edit({
        where: {
          id: book_hall_doc.id
        },
        set: book_hall_doc,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err && result) {
          response.done = true
          response.doc = result.doc

          let paid_value = {
            value: response.doc.baid_go,
            source_name_ar: response.doc.tenant.name_ar,
            source_name_en: response.doc.tenant.name_en,
            company: response.doc.company,
            branch: response.doc.branch,
            date: response.doc.date_paid,
            shift: {
              id: result.doc.shift.id,
              code: result.doc.shift.code,
              name_ar: result.doc.shift.name_ar, name_en: result.doc.shift.name_en
            },
            transition_type: 'in',
            operation: {ar: 'دفعة حجز قاعة', en: 'Pay Booking Hall'},
            safe: response.doc.safe
          }
          site.quee('[amounts][safes][+]', paid_value)

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

  site.post("/api/book_hall/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $book_hall.findOne({
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

  site.post("/api/book_hall/delete", (req, res) => {
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
      $book_hall.delete({
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

  site.post("/api/book_hall/all", (req, res) => {
    let response = {
      done: false
    }
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    if (where['tenant']) {
      where['tenant.id'] = where['tenant'].id;
      delete where['tenant']
      delete where.active
    }
    if (where['hall']) {
      where['hall.id'] = where['hall'].id;
      delete where['hall']
      delete where.active
    }

    if (where.search && where.search.total_period) {

      where['total_period'] = where.search.total_period
    }

    if (where.search && where.search.number_lecture) {

      where['number_lecture'] = where.search.number_lecture
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $book_hall.findMany({
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