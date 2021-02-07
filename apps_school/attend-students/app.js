module.exports = function init(site) {
  const $attend_students = site.connectCollection('attend_students');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'attend_students',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/attend_students/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let attend_students_doc = req.body;
    attend_students_doc.$req = req;
    attend_students_doc.$res = res;

    attend_students_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof attend_students_doc.active === 'undefined') {
      attend_students_doc.active = true;
    }

    attend_students_doc.company = site.get_company(req);
    attend_students_doc.branch = site.get_branch(req);

    let num_obj = {
      company: site.get_company(req),
      screen: 'attend_students',
      date: new Date(attend_students_doc.date)
    };

    let cb = site.getNumbering(num_obj);
    if (!attend_students_doc.code && !cb.auto) {

      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      attend_students_doc.code = cb.code;
    }

    $attend_students.add(attend_students_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
    //     }
    //   },
    // );
  });

  site.post('/api/attend_students/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let attend_students_doc = req.body;

    attend_students_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (attend_students_doc.id) {
      $attend_students.edit(
        {
          where: {
            id: attend_students_doc.id,
          },
          set: attend_students_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        },
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/attend_students/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $attend_students.findOne(
      {
        where: {
          id: req.body.id,
        },
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );
  });


  site.post('/api/attend_students/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $attend_students.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );



    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/attend_students/get', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    let data = {
      search: req.body.search,
      where: where
    }

    site.getCustomers(data, customersCb => {
      let hallsList = []
      let schoolGradesId = []
      let studentsYearId = []
      customersCb.forEach(_cusCb => {
        if (_cusCb.students_year && _cusCb.school_grade) {

          let foundHall = hallsList.some(_hall => _cusCb.hall.id == _hall.id)
          let foundSchoolGrades = schoolGradesId.some(_schoolG => _cusCb.school_grade.id == _schoolG.id)
          let foundStudentsYear = studentsYearId.some(_studentY => _cusCb.students_year.id == _studentY.id)

          if (!foundHall) {
            hallsList.push(_cusCb.hall.id)
          }
          if (!foundSchoolGrades) {
            schoolGradesId.push(_cusCb.school_grade.id)
          }
          if (!foundStudentsYear) {
            studentsYearId.push(_cusCb.students_year.id)
          }
        }
      });
      whereObj = req.body.whereAttend || {};

      whereObj['hall.id'] = {
        $in: hallsList
      }

      whereObj['school_grade.id'] = {
        $in: schoolGradesId
      }

      whereObj['students_year.id'] = {
        $in: studentsYearId
      }

      if (whereObj.date) {
        let d1 = site.toDate(whereObj.date)
        let d2 = site.toDate(whereObj.date)
        d2.setDate(d2.getDate() + 1)
        whereObj.date = {
          '$gte': d1,
          '$lt': d2
        }
      }

      whereObj['company.id'] = site.get_company(req).id
      whereObj['branch.code'] = site.get_branch(req).code

      $attend_students.findMany(
        { where: whereObj },
        (err, docs) => {

          if (!err) {
            let list = []
            customersCb.forEach(_customersCb => {
              let attendObj = { customer: _customersCb }
              docs = docs || []
              docs.forEach(_docs => {
                _docs.attend_list.forEach(_attList => {
                  if (_attList.customer.id == _customersCb.id) {
                    _attList.customer = _customersCb
                    attendObj = _attList
                  }
                });
              });
              list.push(attendObj)

            });
            response.list = list;
          }
          response.done = true;

          res.json(response);

        }

      )



    })
  });


  site.post('/api/attend_students/transaction', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let obj = req.body.obj || {};
    let customer = where['customer']
    let date1 = where.date


    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where['customer'] && where['customer'].id) {

      where['students_year.id'] = where['customer'].students_year.id;
      where['school_grade.id'] = where['customer'].school_grade.id;

      where['hall.id'] = where['customer'].hall.id;

      delete where['customer']

    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $attend_students.findOne(
      { where: where },
      (err, doc, count) => {
        response.done = true;
        if (!err && doc) {

          let found = false
          doc.attend_list.forEach(_at => {

            if (_at.customer && _at.customer.id == customer.id) {
              _at.status = obj.status
              _at.attend_time = obj.attend_time
              _at.leave_time = obj.leave_time
              found = true
            }
          });

          if (!found) {

            doc.attend_list.unshift(obj)
          }

          $attend_students.update(doc)

        } else {


          let num_obj = {
            company: site.get_company(req),
            screen: 'attend_students',
            date: new Date(date1)
          };

          let cb = site.getNumbering(num_obj);


          $attend_students.add({
            image_url: '/images/attend_students.png',
            date: date1,
            code: cb.code,
            school_grade: customer.school_grade,
            students_year: customer.students_year,
            school_year: obj.school_year,
            hall: customer.hall,
            company: site.get_company(req),
            branch: site.get_branch(req),
            attend_list: [obj]
          })

        }
        res.json(response);
      },
    );
  });





  site.post('/api/attend_students/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $attend_students.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );
  });




};




