module.exports = function init(site) {
  const $exams = site.connectCollection("exams")
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "exams",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post({
    name: "/api/exams_types/all",
    path: __dirname + "/site_files/json/exams_types.json"
  })
  site.post({
    name: "/api/availability_exam/all",
    path: __dirname + "/site_files/json/availability_exam.json"
  })
  site.post({
    name: "/api/questions_types/all",
    path: __dirname + "/site_files/json/questions_types.json"
  })


  site.post("/api/exams/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let exams_doc = req.body
    exams_doc.$req = req
    exams_doc.$res = res

    exams_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof exams_doc.active === 'undefined') {
      exams_doc.active = true
    }

    exams_doc.company = site.get_company(req)
    exams_doc.branch = site.get_branch(req)

    $exams.find({

      where: {

        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'name': exams_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'exams',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!exams_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          exams_doc.code = cb.code;
        }

        $exams.add(exams_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/exams/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let exams_doc = req.body.data

    exams_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (req.body.start) {
      exams_doc.students_list.forEach(_stu => {
        if (req.session.user.ref_info && _stu.id === req.session.user.ref_info.id){
          _stu.exam_procedure = true

          if (!_stu.exam.finish_date) {
            _stu.exam.finish_date = new Date();
            _stu.exam.finish_date.setMinutes(_stu.exam.finish_date.getMinutes() + exams_doc.exam_time);
      
          }

          if (_stu.exam.time && _stu.exam.finish_date) {
            _stu.exam.finish_date = new Date(_stu.exam.finish_date);
            let minutes = _stu.exam.finish_date.getMinutes() - new Date().getMinutes();
            _stu.exam.time = {
              minutes: minutes,
              seconds: 0
            };
          } else {
            _stu.exam.time = { minutes: exams_doc.exam_time, seconds: 0 };
          }
        }
      });
    }


    if (exams_doc.id) {
      $exams.edit({
        where: {
          id: exams_doc.id
        },
        set: exams_doc,
        $req: req,
        $res: res
      }, (err, obj) => {
        if (!err) {
          response.done = true
          response.doc = obj.doc
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

  site.post("/api/exams/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $exams.findOne({
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

  site.post("/api/exams/delete", (req, res) => {
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
      $exams.delete({
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


  site.post("/api/exams/all", (req, res) => {
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
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    if (req.session.user.type == 'trainer') {
      where['add_user_info.id'] = req.session.user.id;

    } else if (req.session.user.type == 'customer' && req.session.user.school_grade) {
      where['school_grade.id'] = req.session.user.school_grade.id;
    }


    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $exams.findMany({
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