module.exports = function init(site) {
  const $exams = site.connectCollection("exams")

  site.get({
    name: "report_exams",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post("/api/report_exams/all", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let where = req.data.where || {};
    let customer = where.customer || {};
    let exam = where.exam || {};

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    };

    if (where['customer']) {
      where['students_list.id'] = where['customer'].id;
      delete where['customer']

    }

    if (where['students_years']) {
      where['students_years.id'] = where['students_years'].id;
      delete where['students_years']

    }

    if (where['exams_type']) {
      where['exams_type.id'] = where['exams_type'].id;
      delete where['exams_type']

    }

    if (where['exam']) {
      where['id'] = where['exam'].id;
      delete where['exam']

    }

    if (where['hall']) {
      where['hall.id'] = where['hall'].id;
      delete where['hall']

    }

    // where['$or'] = [{ 'source_type.id': 2 }, { 'source_type.id': 3 }, { 'source_type.id': 4 }, { 'source_type.id': 7 }]

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code
    $exams.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err && docs) {

        let list = []

        docs.forEach(_docs => {
          _docs.list = [];
          _docs.students_list.forEach(_stu => {
            let obj = {
              image_url: _stu.exam.image_url,
              name_Ar: _stu.name_Ar,
              name_En: _stu.name_En,
              name: _docs.name,
              exams_type: _docs.exams_type,
              code: _stu.code,
              final_grade: _docs.final_grade,
              degree_success: _docs.degree_success,
              total_scores: _stu.total_scores,
              additional_degrees: _stu.additional_degrees,
              student_degree: _stu.student_degree,
              exam_procedure: _stu.exam_procedure
            };

            if ((customer && customer.id && _stu.id === customer.id) || (exam && exam.id && !customer.id)) {

              list.push(obj)

            } else {

              _docs.list.push(obj)

            }
          });
        });
        response.done = true
        if ((customer && customer.id) || (exam && exam.id && !customer.id)) {
          response.list = list
        } else {

          response.list = docs

        }
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}
