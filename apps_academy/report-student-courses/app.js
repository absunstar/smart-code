module.exports = function init(site) {
  const $book_course = site.connectCollection("book_course")

  site.get({
    name: "report_student_courses",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/book_course/student_report", (req, res) => {
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

    where['company.id'] = site.get_company(req).id
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