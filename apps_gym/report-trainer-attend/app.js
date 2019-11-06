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


    /*  where['company.id'] = site.get_company(req).id
     where['branch.code'] = site.get_branch(req).code */

    let where = req.body.where || {}
    let search = req.body.search
    if (search) {
      where.$or = []

      where.$or.push({
        'attend_service_list.trainer_attend.id': search.id
      })

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
              if (attend_service.trainer_attend.id == search.id) {                
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
    }
  })

}