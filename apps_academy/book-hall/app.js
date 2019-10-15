module.exports = function init(site) {
  const $book_hall = site.connectCollection("book_hall")

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

    book_hall_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof book_hall_doc.active === 'undefined') {
      book_hall_doc.active = true
    }

    book_hall_doc.academy = site.get_company(req)
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
            value : response.doc.baid_go,
            sourceName: response.doc.tenant.name,
            academy : response.doc.academy,
            branch : response.doc.branch,
            date: response.doc.date_paid,
            safe : response.doc.safe
          }
          site.call('[book_hall][safes][+]', paid_value)

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

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    if (where['tenant']) {
      where['tenant.id'] = where['tenant'].id;
      delete where['tenant']
      delete where.active
    }
    if (where['class_room']) {
      where['class_room.id'] = where['class_room'].id;
      delete where['class_room']
      delete where.active
    }

    if (where.search && where.search.total_period) {
    
      where['total_period'] = where.search.total_period
    }
    
    if (where.search && where.search.number_lecture) {
    
      where['number_lecture'] = where.search.number_lecture
    }

    delete where.search

    where['academy.id'] = site.get_company(req).id
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