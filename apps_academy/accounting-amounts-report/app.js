module.exports = function init(site) {
  const $amounts_in = site.connectCollection("amounts_in")

  const $amounts_out = site.connectCollection("amounts_out")


  site.get({
    name: "amounts_report",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/amounts_in/amounts_report", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $amounts_in.findMany({
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

  site.post("/api/amounts_out/amounts_report", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    where['academy.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $amounts_out.findMany({
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