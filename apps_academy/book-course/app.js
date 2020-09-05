module.exports = function init(site) {
  const $book_course = site.connectCollection("book_course")

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  $book_course.newCode = function () {

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

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "book_course",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/book_course/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let book_course_doc = req.body
    book_course_doc.$req = req
    book_course_doc.$res = res

    book_course_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof book_course_doc.active === 'undefined') {
      book_course_doc.active = true
    }
    book_course_doc.code = $book_course.newCode()

    book_course_doc.total_rest = 0
    book_course_doc.rest = 0
    book_course_doc.academy = site.get_company(req)
    book_course_doc.branch = site.get_branch(req)

    
    $book_course.add(book_course_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc

      
        site.call('[book_course][create_course][+]', doc)
        
      
       
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/book_course/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let book_course_doc = req.body

    book_course_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (book_course_doc.id) {
      $book_course.edit({
        where: {
          id: book_course_doc.id
        },
        set: book_course_doc,
        $req: req,
        $res: res
      }, (err ,result) => {
        if (!err && result) {
          response.done = true
          response.doc = result.doc

          let paid_value = {
            value : response.doc.baid_go,
            sourceName: response.doc.customer.name,
            academy : response.doc.academy,
            branch : response.doc.branch,
            date: response.doc.date_paid,
            safe : response.doc.safe
          }
          site.call('[book_course][safes][+]', paid_value)

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

  site.post("/api/book_course/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $book_course.findOne({
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

  site.post("/api/book_course/delete", (req, res) => {
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
      $book_course.delete({
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

  site.post("/api/book_course/all", (req, res) => {
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
      where['name'] = new RegExp(where['name'], "i");
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer']
      delete where.active
    }

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $book_course.findMany({
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