module.exports = function init(site) {
  const $create_course = site.connectCollection("create_course")

  site.get({
    name: "report_student_attend",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false
  })



  site.post("/api/create_course/student_attend", (req, res) => {
    let response = {
      done: false
    }
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $create_course.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true


        response.list = [];

        docs.forEach(b => {
          b.dates_list.forEach(da => {
            da.student_list.forEach(st => {
              if (st.id == where['dates_list.student_list.id']) {
                if (st.attend) {
                  response.list.push({
                    course: b.course,
                    date_course: da.date_count,
                    attend: st.attend,
                    attend_hour: st.attend_hour,
                    out_hour: st.out_hour,
                    notes_attend: st.notes_attend,

                  });
                }
              }
            });

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