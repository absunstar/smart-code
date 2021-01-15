module.exports = function init(site) {
  const $attend_employees = site.connectCollection('attend_employees');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'attend_employees',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/attend_employees/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let attend_employees_doc = req.body;
    attend_employees_doc.$req = req;
    attend_employees_doc.$res = res;

    attend_employees_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof attend_employees_doc.active === 'undefined') {
      attend_employees_doc.active = true;
    }

    attend_employees_doc.company = site.get_company(req);
    attend_employees_doc.branch = site.get_branch(req);

    let num_obj = {
      company: site.get_company(req),
      screen: 'attend_employees',
      date: new Date(attend_employees_doc.date)
    };

    let cb = site.getNumbering(num_obj);
    if (!attend_employees_doc.code && !cb.auto) {

      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      attend_employees_doc.code = cb.code;
    }

    $attend_employees.add(attend_employees_doc, (err, doc) => {
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

  site.post('/api/attend_employees/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let attend_employees_doc = req.body;

    attend_employees_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (attend_employees_doc.id) {
      $attend_employees.edit(
        {
          where: {
            id: attend_employees_doc.id,
          },
          set: attend_employees_doc,
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

  site.post('/api/attend_employees/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $attend_employees.findOne(
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


  site.post('/api/attend_employees/delete', (req, res) => {
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
      $attend_employees.delete(
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

  site.post('/api/attend_employees/get', (req, res) => {
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

    site.getEmployees(data, employeesCb => {
      // let hallsList = []
      // let schoolGrades = []
      // employeesCb.forEach(_empCb => {
      //   let foundHall = hallsList.some(_hall => _empCb.hall.id == _hall.id)
      //   let foundSchoolGrades = schoolGrades.some(_schoolG => _empCb.school_grade.id == _schoolG.id)
      //   if (!foundHall) {
      //     hallsList.push(_empCb.hall.id)
      //   }
      //   if (!foundSchoolGrades) {
      //     schoolGrades.push(_empCb.school_grade.id)
      //   }
      // });
      // whereObj = req.body.whereAttend || {};

      // whereObj['hall.id'] = {
      //   $in: hallsList
      // }

      // whereObj['school_grade.id'] = {
      //   $in: schoolGrades
      // }

      whereObj = req.body.whereAttend || {};
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

      $attend_employees.findMany(
        { where: whereObj },
        (err, docs) => {

          if (!err) {
            let list = []
            employeesCb.forEach(_employeesCb => {
              let attendObj = { employee: _employeesCb }
              docs = docs || []
              docs.forEach(_docs => {
                _docs.attend_list.forEach(_attList => {
                  if (_attList.employee.id == _employeesCb.id) {
                    _attList.employee = _employeesCb
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


  site.post('/api/attend_employees/transaction', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let obj = req.body.obj || {};
    let employee = where['employee']
    let date1 = where.date
    delete where['employee']
    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $attend_employees.findOne(
      { where: where },
      (err, doc, count) => {
        response.done = true;

        if (!err && doc) {
          let found = false
          doc.attend_list.forEach(_at => {

            if (_at.employee && _at.employee.id == employee.id) {
              _at.status = obj.status
              _at.attend_time = obj.attend_time
              _at.leave_time = obj.leave_time
              found = true
            }
          });

          if (!found) {

            doc.attend_list.unshift(obj)
          }

          $attend_employees.update(doc)

        } else {


          let num_obj = {
            company: site.get_company(req),
            screen: 'attend_employees',
            date: new Date(date1)
          };

          let cb = site.getNumbering(num_obj);


          $attend_employees.add({
            image_url: '/images/attend_employees.png',
            date: date1,
            code: cb.code,
            company: site.get_company(req),
            branch: site.get_branch(req),
            attend_list: [obj]
          })

        }
        res.json(response);
      },
    );
  });





  site.post('/api/attend_employees/all', (req, res) => {
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

    $attend_employees.findMany(
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




