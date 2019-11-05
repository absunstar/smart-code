module.exports = function init(site) {
  const $request_service = site.connectCollection("request_service")

  site.get({
    name: "report_trainer_attend",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })



  site.post("/api/request_service/trainer_attend", (req, res) => {
    let response = { done: false }

    var where = req.body.where || {}

    where['academy.id'] = site.get_company(req).id
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
        response.list = []
        docs.forEach(doc => {
          doc.dates_list.forEach(d => {
            if (d.trainer.id == where['dates_list.trainer.id']) {
              if (d.attend) {
                response.list.push({
                  course: doc.course,
                  date_course: d.date_count,
                  attend: d.attend,
                  attend_hour: d.attend_hour,
                  out_hour: d.out_hour,
                  notes_attend: d.notes_attend,
                });
              }
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