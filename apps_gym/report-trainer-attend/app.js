module.exports = function init(site) {
  const $request_service = site.connectCollection("request_service")

  site.get({
    name: "report_trainer_attend",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })

  site.post("/api/report_trainer_attend/trainer_attend", (req, res) => {
    let response = { done: false }

    let where = req.body.where || {}

    let trainer = where.trainer

    if (where['trainer']) {
      where['attend_service_list.trainer_attend.id'] = where['trainer'].id;
      delete where['trainer']
    }    

    $request_service.findMany({
      select: { attend_service_list: 1, code: 1, id: 1 },
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = []
        docs.forEach(doc => {
          doc.attend_service_list.forEach(attend_service => {
            if (attend_service.trainer_attend.id == trainer.id) {
              attend_service.code = doc.code
              response.list.push(attend_service);
            }
          });
        });

        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}