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
        $or: [{
          'name_Ar': exams_doc.name_Ar
        },{
          'name_En': exams_doc.name_En
        }]
   
      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Name Exists'
        res.json(response)
      } else {

        if (exams_doc.degree_success >= exams_doc.final_grade) {
          response.error = "passing score is greater than the final";
          res.json(response)
          return;

        }

        let degree_m = 0;
        let alot = false;
        let notEqualList = [];

        exams_doc.main_ques_list = exams_doc.main_ques_list || [];
        exams_doc.main_ques_list.forEach(_m_q => {
          degree_m += _m_q.degree;
          let degree_q = 0;
          _m_q.ques_list = _m_q.ques_list || [];

          _m_q.ques_list.forEach(_q_c => {
            degree_q += _q_c.degree;
          });

          if (_m_q.degree !== degree_q) {
            notEqualList.push(_m_q.title_question);
            alot = true;
          }

        });


        if (degree_m !== exams_doc.final_grade && exams_doc.create_questions) {
          response.error = "##word.sum_scores_not_equal_final_score##";
          res.json(response)
          return;

        } else if (alot && exams_doc.create_questions) {

          response.error = `##word.sum_scores_not_equal_final_score##   ( ${notEqualList.join('-')} )`;
          res.json(response)
          return;
        }

        exams_doc.students_list = exams_doc.students_list || [];
        if (exams_doc.availability_exam.id == 2) {
          exams_doc.students_list.forEach(_sL => {
            _sL.exam = Object.assign({}, exams_doc);
            _sL.exam.exam_procedure = false;
            _sL.exam.students_list = [];
          });
        }



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




    if (req.body.type === 'finish') {
      exams_doc.students_list.forEach(_stu => {
        if (req.session.user.ref_info && _stu.id === req.session.user.ref_info.id) {
          _stu.exam.exam_procedure = true
          _stu.exam.time_minutes = 0
          // _stu.exam.start_date = new Date(_stu.exam.start_date)
          // _stu.exam.finish_date = new Date(_stu.exam.finish_date)
          // let date = new Date()

          // date.setMinutes(date.getMinutes() + 2);

          // if ((_stu.exam.finish_date < date) || _stu.exam.finish_date.getMinutes() < date.getMinutes()) {
          //   response.error = 'exam time has expired';
          //   res.json(response)
          //   return;
          // }
        }
      });




    } else if (req.body.type === 'time') {

      exams_doc.students_list.forEach(_stu => {
        if (req.session.user.ref_info && _stu.id === req.session.user.ref_info.id) {
          _stu.exam.time_minutes = _stu.exam.time_minutes - 1

          _stu.exam.start_date = new Date(_stu.exam.start_date)
          _stu.exam.finish_date = new Date(_stu.exam.finish_date)

          if ((_stu.exam.finish_date < new Date()) || _stu.exam.finish_date.getMinutes() < new Date().getMinutes()) {
            _stu.exam.exam_procedure = true
            _stu.exam.time_minutes = 0

          }
        }



      });



    } else if (req.body.type === 'correct') {
      let alot_main = false;
      let alot_ques = false;
      let alot_mai_list = [];
      let alot_ques_list = [];
      exams_doc.students_list.forEach(_stu => {
        if (req.session.user.ref_info && _stu.id === req.session.user.ref_info.id) {
          _stu.exam.main_ques_list.forEach(_m_q => {
            if (_m_q.student_degree > _m_q.degree) {
              alot_main = true;
              alot_mai_list.push(_m_q.title_question);

            }

            _m_q.ques_list.forEach(_q_c => {
              if (_q_c.student_degree > _q_c.degree) {
                alot_ques = true;
                alot_ques_list.push(_m_q.title_question);

              }
            });

          });
        }
      });

      if (alot_main && exams_doc.create_questions) {
        response.error_list = alot_mai_list.join('-')
        response.error = 'student grade are greater than the final';
        res.json(response)
        return;
      } else if (alot_ques && exams_doc.create_questions) {
        response.error_list = alot_ques_list.join('-')

        response.error = 'student score is greater than the question';
        res.json(response)
        return;
      }











    } else if (req.body.type === 'update') {
      if (exams_doc.degree_success >= exams_doc.final_grade) {
        response.error = 'passing score is greater than the final';
        res.json(response)
        return;

      }

      let degree_m = 0;
      let alot = false;
      let notEqualList = [];

      exams_doc.main_ques_list = exams_doc.main_ques_list || [];
      exams_doc.main_ques_list.forEach(_m_q => {
        degree_m += _m_q.degree;
        let degree_q = 0;
        _m_q.ques_list = _m_q.ques_list || [];

        _m_q.ques_list.forEach(_q_c => {
          degree_q += _q_c.degree;
        });

        if (_m_q.degree !== degree_q) {
          notEqualList.push(_m_q.title_question);
          alot = true;
        }

      });

      if (degree_m !== exams_doc.final_grade && exams_doc.create_questions) {
        response.error = 'sum of the scores does not equal the final';
        res.json(response)
        return;

      } else if (alot && exams_doc.create_questions) {
        response.error_list = notEqualList
        response.error = 'sum of the scores does not equal the final all';
        res.json(response)
        return;
      }
      exams_doc.students_list = exams_doc.students_list || [];

      if (exams_doc.availability_exam.id == 2) {
        exams_doc.students_list.forEach(_sL => {
          _sL.exam = Object.assign({}, exams_doc);
          _sL.exam.exam_procedure = false;
          _sL.exam.students_list = [];
        });
      } else if (exams_doc.availability_exam.id == 1) {
        exams_doc.students_list = []
      }












    } else if (req.body.type === 'start' && req.body.stuList && req.body.stuList.length > 0) {
      exams_doc.students_list = exams_doc.students_list || [];


      if (exams_doc.availability_exam.id === 1 && req.session.user.ref_info) {
        let student = req.body.stuList.find(_stu => { return _stu.id === req.session.user.ref_info.id });
        let found_student = exams_doc.students_list.some(_student => req.session.user.ref_info.id === _student.id);

        if (!found_student) {
          student.exam = Object.assign({}, exams_doc);
          student.exam.exam_procedure = false;
          student.exam.students_list = [];
          exams_doc.students_list.push(student);
        }

      }

      let found = false;
      let finish_exam = false;
      let student_exams = {};

      exams_doc.students_list.forEach(_s => {

        if (req.session.user.ref_info && _s.id === req.session.user.ref_info.id) {
          found = true;
          if (_s.exam.finish_date === undefined) {
            _s.exam.start_date = new Date();
            _s.exam.finish_date = new Date();
            _s.exam.finish_date.setMinutes(_s.exam.finish_date.getMinutes() + exams_doc.exam_time);

            _s.exam.finish_date = new Date(_s.exam.finish_date)
            let minutes = _s.exam.finish_date.getMinutes() - new Date().getMinutes();
            _s.exam.time_minutes = minutes
          }

          _s.exam.start_date = new Date(_s.exam.start_date)
          _s.exam.finish_date = new Date(_s.exam.finish_date)

          if ((_s.exam.finish_date < new Date()) || _s.exam.finish_date.getMinutes() < new Date().getMinutes()) {

            _s.exam.exam_procedure = true
            _s.exam.time_minutes = 0

          }

        /*  else if (_s.exam.time_minutes && _s.exam.finish_date) {
           
            let minutes = _s.exam.finish_date.getMinutes() - _s.exam.start_date.getMinutes();
            _s.exam.time_minutes = minutes

          } */ else if (_s.exam.time_minutes < 1) {
            _s.exam.exam_procedure = true
            _s.exam.time_minutes = 0

          } else if (_s.exam.time_minutes === undefined) {
            _s.exam.time_minutes = exams_doc.exam_time;

          }

          if (_s.exam.exam_procedure) finish_exam = true;

          student_exams = Object.assign({}, _s);

        }

      });


      if (!found) {
        response.error = 'cannot enter because you are not registered';
        res.json(response)
        return;
      };

      if (student_exams.exam.time_minutes < 1 || student_exams.exam.exam_procedure) {

        response.error = 'test has already been performed';

      };

      if ((student_exams.exam.finish_date > new Date()) || student_exams.exam.start_date.getMinutes() > new Date().getMinutes()) {

        response.error = 'exam time has expired';
      }

      // if (student_exams.exam.time && student_exams.exam.time.minutes < 1) {
      //   response.error = 'exam time has expired';
      //   res.json(response)
      //   return;
      // }

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

    if (where['name_Ar']) {
      where['name_Ar'] = site.get_RegExp(where['name_Ar'], "i");
    }

    if (where['name_En']) {
      where['name_En'] = site.get_RegExp(where['name_En'], "i");
    }

    if (req.session.user.type == 'trainer') {
      where['add_user_info.id'] = req.session.user.id;

    } else if (req.session.user.type == 'customer') {
      where['students_year.id'] = req.session.user.students_year_id;
    }

    if (where['shift']) {
      where['shift.id'] = where['shift'].id;
      delete where['shift']
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