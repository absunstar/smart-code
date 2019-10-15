module.exports = function init(site) {
  const $account_course = site.connectCollection("account_course")

  site.get({
    name: "report_trainer_courses",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/account_course/trainer_report", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $account_course.findMany({
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