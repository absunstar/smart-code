module.exports = function init(site) {
  const $employee_list = site.connectCollection('hr_employee_list');

  site.on('[company][created]', (doc) => {
    $employee_list.add(
      {
        name_ar: 'موظف إفتراضي',
        name_en: 'Default Employee',
        image_url: '/images/employee_list.png',
        code: '1-Test',
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
          name_en: doc.name_en,
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
          name_en: doc.branch_list[0].name_en,
        },
        active: true,
      },
      (err, doc1) => {}
    );
  });

  site.post({
    name: '/api/gender/all',
    path: __dirname + '/site_files/json/gender.json',
  });

  site.post({
    name: '/api/accounting_system/all',
    path: __dirname + '/site_files/json/accounting_system.json',
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'employees',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/employees/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    req.session.user.mobile = ';;;';

    let employee_doc = req.body;
    employee_doc.$req = req;
    employee_doc.$res = res;

    employee_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof employee_doc.active === 'undefined') {
      employee_doc.active = true;
    }

    employee_doc.company = site.get_company(req);
    employee_doc.branch = site.get_branch(req);

    
    let user = {
      type: "employee",
    };

    user.roles = [
      {
        module_name: 'public',
        name: 'employee_admin',
        en: 'Employee Admin',
        ar: 'إدارة الموظفين',
        permissions: ['employee_manage'],
      },
    ];

    user.permissions = [];

    user.profile = {
      name_ar: employee_doc.name_ar,
      name_en: employee_doc.name_en,
      mobile: employee_doc.mobile,
      image_url: employee_doc.image_url,
      gender: employee_doc.gender,
    };
    if (user.profile.gender && user.profile.gender.name == "female") {
      user.permissions.push({
        name: "female",
      });
    }

    let company = {};
    let branch = {};
    company = site.get_company(req);
    if (req.session.user) {
      branch = site.get_branch(req);
    } else {
      employee_doc.active = true;
      company = employee_doc.company;
      branch = employee_doc.branch;
    }

    user.branch_list = [
      {
        company: company,
        branch: branch,
      },
    ];

    employee_doc.company = {
      id: company.id,
      name_ar: company.name_ar,
      name_en: company.name_en,
    };

    employee_doc.branch = {
      code: branch.code,
      name_ar: branch.name_ar,
      name_en: branch.name_en,
    };

    user.company = employee_doc.company;
    user.branch = employee_doc.branch;

    let num_obj = {
      company: company,
      screen: "employees",
      date: new Date(),
    };
    let cb = site.getNumbering(num_obj);
    if (!employee_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      employee_doc.code = cb.code;
    }

    $employee_list.findMany(
      {
        where: {
          'company.id': site.get_company(req).id,
        },
      },
      (err, docs, count) => {
        if (!err && count >= site.get_company(req).employees_count) {
          response.error = 'The maximum number of adds exceeded';
          res.json(response);
        }   else {
          if (employee_doc.username && employee_doc.password) {
            if (
              !employee_doc.username.contains("@") &&
              !employee_doc.username.contains(".")
            ) {
              employee_doc.username =
                employee_doc.username + "@" + company.host;
            } else {
              if (
                employee_doc.username.contains("@") &&
                !employee_doc.username.contains(".")
              ) {
                response.error = "Username must be typed correctly";
                res.json(response);
                return;
              } else if (
                !employee_doc.username.contains("@") &&
                employee_doc.username.contains(".")
              ) {
                response.error = "Username must be typed correctly";
                res.json(response);
                return;
              }
            }

            user.email = employee_doc.username;
            user.password = employee_doc.password;
          }

          site.security.isUserExists(user, function (err, user_found) {
            if (user_found) {
              response.error = "User Is Exist";
              res.json(response);
              return;
            }

            $employee_list.add(employee_doc, (err, doc) => {
              if (!err) {
                response.done = true;
                response.doc = doc;

                if (user.password && user.email) {
                  user.ref_info = {
                    id: doc.id,
                  };
                  site.security.addUser(user, (err, doc1) => {
                    if (!err) {
                      delete user._id;
                      delete user.id;
                      doc.user_info = {
                        id: doc1.id,
                      };
                      $employee_list.edit(doc, (err2, doc2) => {
                        // if (!req.session.user) {
                        //   site.security.login({
                        //     email: doc1.email,
                        //     password: doc1.password,
                        //     $req: req,
                        //     $res: res
                        //   },
                        //     function (err, user_login) {
                        //       if (!err) {
                        //         response.user = user_login
                        //         response.done = true
                        //       } else {
                        //         console.log(err)
                        //         response.error = err.message
                        //       }
                        //       res.json(response)
                        //     }
                        //   )
                        // }
                      });
                    } else {
                      response.error = err.message;
                    }
                  });
                }
              } else {
                response.error = err.message;
              }
              res.json(response);
            });
          });
        }
      }
    );
  });

  site.post('/api/employees/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let employee_doc = req.body;
  
    let user = {
      type: "employee",
    };

    user.roles = [
      {
        module_name: 'public',
        name: 'employee_admin',
        en: 'Employee Admin',
        ar: 'إدارة الموظفين',
        permissions: ['employee_manage'],
      },
    ];


    if (employee_doc.username && employee_doc.password) {
      if (
        !employee_doc.username.contains("@") &&
        !employee_doc.username.contains(".")
      ) {
        employee_doc.username =
          employee_doc.username + "@" + site.get_company(req).host;
      } else {
        if (
          employee_doc.username.contains("@") &&
          !employee_doc.username.contains(".")
        ) {
          response.error = "Username must be typed correctly";
          res.json(response);
          return;
        } else if (
          !employee_doc.username.contains("@") &&
          employee_doc.username.contains(".")
        ) {
          response.error = "Username must be typed correctly";
          res.json(response);
          return;
        }
      }

      user.email = employee_doc.username;
      user.password = employee_doc.password;
    }

    user.permissions = [];
    user.profile = {
      name_ar: employee_doc.name_ar,
      name_en: employee_doc.name_ar,
      mobile: employee_doc.mobile,
      image_url: employee_doc.image_url,
      gender: employee_doc.gender,
    };

    if (user.profile.gender && user.profile.gender.name == "female") {
      user.permissions.push({
        name: "female",
      });
    }

    user.ref_info = {
      id: employee_doc.id,
    };

    user.company = employee_doc.company;
    user.branch = employee_doc.branch;

    user.branch_list = [
      {
        company: site.get_company(req),
        branch: site.get_branch(req),
      },
    ];


    if (employee_doc.id) {
      site.security.isUserExists(user, function (err, user_found) {
        // if (user_found) {
  
        //   response.error = 'User Is Exist'
        //   res.json(response)
        //   return;
  
        // }
  
        if (customers_doc.id) {
          $employee_list.edit(
            {
              where: {
                id: customers_doc.id,
              },
              set: customers_doc,
              $req: req,
              $res: res,
            },
            (err, result) => {
              if (!err && result.doc) {
                response.done = true;
                response.doc = result.doc;
  
                if (!result.doc.user_info && user.password && user.email) {
                  site.security.addUser(user, (err, doc1) => {
                    if (!err) {
                      delete user._id;
                      delete user.id;
                      result.doc.user_info = {
                        id: doc1.id,
                      };
                      $employee_list.edit(result.doc, (err2, doc2) => {
                        res.json(response);
                      });
                    } else {
                      response.error = err.message;
                    }
                    res.json(response);
                  });
                } else if (result.doc.user_info && result.doc.user_info.id) {
                  site.security.updateUser(user, (err, user_doc) => { });
                }
              } else {
                response.error = "customer id is error";
              }
              res.json(response);
            }
          );
        } else {
          response.error = "no id";
          res.json(response);
        }
      });
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/employees/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $employee_list.findOne(
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
      }
    );
  });

  site.post('/api/employees/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;
    let data = { name: 'trainer', id: req.body.id };

    site.getDataToDelete(data, (callback) => {
      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction';
        res.json(response);
      } else {
        if (id) {
          $employee_list.delete(
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
      }
    });
  });

  site.post('/api/employees/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    let search = req.body.search;

    if (search) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        name_en: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        mobile: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        phone: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        national_id: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        email: site.get_RegExp(search, 'i'),
      });
    }

    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov'];
      delete where.active;
    }

    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city'];
      delete where.active;
    }
    if (where['area']) {
      where['area.id'] = where['area'].id;
      delete where['area'];
      delete where.active;
    }

    if (where['job']) {
      where['job.id'] = where['job'].id;
      delete where['job'];
      delete where.active;
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i');
    }
    if (where['address']) {
      where['address'] = site.get_RegExp(where['address'], 'i');
    }
    if (where['national_id']) {
      where['national_id'] = site.get_RegExp(where['national_id'], 'i');
    }
    if (where['phone']) {
      where['phone'] = site.get_RegExp(where['phone'], 'i');
    }
    if (where['mobile']) {
      where['mobile'] = site.get_RegExp(where['mobile'], 'i');
    }

    if (where['email']) {
      where['email'] = site.get_RegExp(where['email'], 'i');
    }

    if (where['whatsapp']) {
      where['whatsapp'] = site.get_RegExp(where['whatsapp'], 'i');
    }
    if (where['facebook']) {
      where['facebook'] = site.get_RegExp(where['facebook'], 'i');
    }
    if (where['twitter']) {
      where['twitter'] = site.get_RegExp(where['twitter'], 'i');
    }

    if (req.session.user.roles[0].name === 'employee_admin') {
      where['id'] = req.session.user.employee_id;
    }

    where['company.id'] = site.get_company(req).id;
    // where['trainer'] = { $ne: true }
    // where['delivery'] = { $ne: true }
    where['branch.code'] = site.get_branch(req).code;

    $employee_list.findMany(
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
      }
    );
  });

  site.getEmployees = function (data, callback) {
    let where = data.where || {};

    let search = data.search || '';

    if (search) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        name_en: site.get_RegExp(search, 'i'),
      });

      where.$or.push({
        code: search,
      });
      where.$or.push({
        mobile: site.get_RegExp(search, 'i'),
      });
    }

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i');
    }

    if (where.code) {
      where['code'] = where.code;
    }

    if (where.nationality) {
      where['nationality'] = where.nationality;
    }

    if (where.phone) {
      where['phone'] = where.phone;
    }
    if (where.mobile) {
      where['mobile'] = where.mobile;
    }

    $employee_list.findMany(
      {
        where: where,
      },
      (err, docs) => {
        if (!err) {
          if (docs) callback(docs);
          else callback(false);
        }
      }
    );
  };

  site.getEmployeeAttend = function (data, callback) {
    let select = {
      id: 1,
      name_ar: 1,
      name_en: 1,
      active: 1,
      finger_code: 1,
      gender: 1,
      company: 1,
      branch: 1,
    };

    let where = { finger_code: data };

    $employee_list.findOne(
      {
        select: select,
        where: where,
      },
      (err, doc) => {
        if (!err) {
          if (doc) callback(doc);
          else callback(false);
        }
      }
    );
  };
};
