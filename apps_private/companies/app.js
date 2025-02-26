module.exports = function init(site) {
  const $companies = site.connectCollection('companies');

  site.default_company = {
    name_Ar: 'الشركة الرئيسية',
    name_En: 'Main Company',
    host: 'company.com',
    username: 'admin@company.com',
    password: 'admin',
    image_url: '/imags/company.png',
    active: true,
    branch_list: [
      {
        code: 1,
        name_Ar: 'الفرع الرئيسى',
        name_En: 'Main Branch',
        charge: [{}],
      },
    ],
  };

  // site.onGET('/api/languages/ar-sa', (req, res) => {
  //   site.words.addList(site.dir + '/site_files/json/words-sa.json', true);

  //   res.json({
  //     done: true,
  //   });
  // });

  $companies.findOne({}, (err, doc) => {
    if (!err && doc) {
      site.default_company = doc;
    } else {
      $companies.add(site.default_company, (err, doc) => {
        if (!err && doc) {
          site.default_company = doc;
          site.call('[company][created]', doc);

          site.call('please add user', {
            is_company: true,
            company_id: doc.id,
            email: doc.username,
            password: doc.password,
            roles: [
              {
                name: 'companies_admin',
              },
            ],
            branch_list: [
              {
                company: doc,
                branch: doc.branch_list[0],
              },
            ],
            profile: {
              name_Ar: doc.name_Ar,
              name_En: doc.name_En,
              image_url: doc.image_url,
            },
          });
        }
      });
    }
  });

  // site.on('[register][company][add]', doc => {

  //   $companies.add({
  //     name_Ar: doc.name,
  //     branch_list: [{
  //       code: 1,
  //       name_Ar: "فرع" + " " + doc.name
  //     }],
  //     active: true,
  //     username: doc.username,
  //     password: doc.password,
  //     image_url: doc.image_url
  //   }, (err, doc) => {
  //     if (!err && doc) {
  //       site.call('[company][created]', doc)

  //       site.call('please add user', {
  //         is_company: true,
  //         email: doc.username,
  //         password: doc.password,
  //         roles: [{
  //           name: "companies_admin"
  //         }],
  //         branch_list: [{
  //           company: doc,
  //           branch: doc.branch_list[0]
  //         }],
  //         company_id: doc.id,
  //         profile: {
  //           name: doc.name_Ar,
  //           image_url: doc.image_url
  //         }
  //       })
  //     }
  //   })
  // })

  site.get_company = function (req) {
    let company = req.session.company;
    return company || site.default_company;
  };

  site.get_branch = function (req) {
    let branch = req.session.branch;
    return branch || site.default_company.branch_list[0];
  };

  site.post({
    name: '/api/posting/all',
    path: __dirname + '/site_files/json/posting.json',
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
    public: true,
  });

  site.get({
    name: 'companies',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.validateEmail = function (email) {
    let re = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    return re.test(email);
  };

  site.validatePassword = function (password) {
    let re = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/);
    return re.test(password);
  };

  site.post('/api/companies/add', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response)
    //   return
    // }

    let companies_doc = req.body;
    companies_doc.$req = req;
    companies_doc.$res = res;

    companies_doc.company = site.get_company(req);
    companies_doc.branch = site.get_branch(req);

    if (!companies_doc.code) companies_doc.code = companies_doc.name_En + '-' + '1';

    if (companies_doc.branch_list.length > companies_doc.branch_count) {
      response.error = 'You have exceeded the maximum number of Branches';
      res.json(response);
      return;
    } else {
      if (site.feature('erp')) companies_doc.feature = 'erp';
      else if (site.feature('pos')) companies_doc.feature = 'pos';
      else if (site.feature('ecommerce')) companies_doc.feature = 'ecommerce';
      else if (site.feature('restaurant')) companies_doc.feature = 'restaurant';
      else if (site.feature('school')) companies_doc.feature = 'school';
      else if (site.feature('club')) companies_doc.feature = 'club';
      else if (site.feature('academy')) companies_doc.feature = 'academy';
      else if (site.feature('lawyer')) companies_doc.feature = 'lawyer';
      else if (site.feature('employee')) companies_doc.feature = 'employee';
      else if (site.feature('medical')) companies_doc.feature = 'medical';

      let user_exist = {
        email: undefined,
        password: undefined,
      };

      if (companies_doc.username && companies_doc.password) {
        // if(!site.validatePassword(companies_doc.password)) {
        //   response.error = 'Must be not less than 8 characters or numbers and must contain at least one character capital, one number and one special character'
        //   res.json(response)
        //   return;
        // }

        if (companies_doc.username.includes('@') && !companies_doc.username.includes('.')) {
          response.error = 'Username must be typed correctly';
          res.json(response);
          return;
        } else if (!companies_doc.username.includes('@') && companies_doc.username.includes('.')) {
          response.error = 'Username must be typed correctly';
          res.json(response);
          return;
        }

        if (!companies_doc.host.includes('.')) {
          response.error = 'Host must be typed correctly';
          res.json(response);
          return;
        }

        let exist_domain = companies_doc.username.includes('@');
        if (!exist_domain) {
          companies_doc.username = companies_doc.username + '@' + companies_doc.host;
        }

        if (!site.validateEmail(companies_doc.username)) {
          response.error = 'Username must be typed correctly';
          res.json(response);
          return;
        }

        if (companies_doc.username) {
          user_exist = {
            email: companies_doc.username,
            password: companies_doc.password,
          };
        }
      }

      site.security.isUserExists(user_exist, function (err, user_found) {
        if (user_found) {
          response.error = 'User Is Exist';
          res.json(response);
          return;
        }

        $companies.findMany(
          {
            where: {
              feature: companies_doc.feature,

              $or: [{ name_Ar: companies_doc.name_Ar }, { name_En: companies_doc.name_En }, { host: companies_doc.host }, { username: companies_doc.username }],
            },
          },
          (err, docs) => {
            if (!err && docs && docs.length > 0) {
              let exist_name_Ar = false;
              let exist_name_En= false;
              let exist_host = false;
              let exist_username = false;
              docs.forEach((_docs) => {
                if (_docs.name_Ar == companies_doc.name_Ar) exist_name_Ar = true;
                else if (_docs.name_En == companies_doc.name_En) exist_name_En= true;
                else if (_docs.host == companies_doc.host) exist_host = true;
                else if (_docs.username == companies_doc.username) exist_username = true;
              });

              if (exist_name_Ar) {
                response.error = 'Arabic Name Is Exists';
                res.json(response);
                return;
              } else if (exist_name_en) {
                response.error = 'English Name Is Exists';
                res.json(response);
                return;
              } else if (exist_host) {
                response.error = 'Host Name Is Exists';
                res.json(response);
                return;
              } else if (exist_username) {
                response.error = 'User Name Is Exists';
                res.json(response);
                return;
              }
            } else {
              $companies.add(companies_doc, (err, doc) => {
                if (!err) {
                  response.done = true;
                  response.doc = doc;
                  let user = {
                    is_company: true,
                    company_id: doc.id,
                    email: doc.username,
                    password: doc.password,
                    ref_info: { id: companies_doc.id },
                    roles: [
                      {
                        name: 'companies_admin',
                      },
                    ],
                    branch_list: [
                      {
                        company: doc,
                        branch: doc.branch_list[0],
                      },
                    ],
                    profile: {
                      name_Ar: doc.name_Ar,
                      name_En: doc.name_En,
                      mobile: doc.mobile,
                      image_url: companies_doc.image_url,
                    },
                  };
                  site.security.isUserExists(user, function (err, user_found) {
                    if (user_found) {
                      response.error = 'User Is Exist';
                      res.json(response);
                      return;
                    }

                    site.security.addUser(user, (err, userDoc) => {
                      if (!err) {
                        delete user._id;
                        delete user.id;
                        doc.user_info = {
                          id: userDoc.id,
                        };
                        $companies.update(doc);
                        site.call('[company][created]', doc);
                      }
                      res.json(response);
                    });
                  });

                  // site.call(
                  //   '[user][add]',
                  //   {
                  //     is_company: true,
                  //     company_id: doc.id,
                  //     email: doc.username,
                  //     password: doc.password,
                  //     roles: [
                  //       {
                  //         name: 'companies_admin',
                  //       },
                  //     ],
                  //     branch_list: [
                  //       {
                  //         company: doc,
                  //         branch: doc.branch_list[0],
                  //       },
                  //     ],
                  //     profile: {
                  //       name_Ar: doc.name_Ar,
                  //       name_En: doc.name_En,
                  //       mobile: doc.mobile,
                  //       image_url: companies_doc.image_url,
                  //     },
                  //   },
                  //   (err, user_doc) => {
                  //     if (!err && user_doc) {
                  //       doc.user_info = { id: user_doc.id };
                  //       $companies.update(doc);
                  //       site.call('[company][created]', doc);
                  //     }
                  //   }
                  // );
                } else {
                  response.error = err.message;
                  res.json(response);
                }
              });
            }
          }
        );
      });
    }
  });

  site.post('/api/companies/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let companies_doc = req.body;

    if (companies_doc.id) {
      if (companies_doc.branch_list.length > companies_doc.branch_count) {
        response.error = 'You have exceeded the maximum number of Branches';
        res.json(response);
      } else {
        let user_exist = {
          email: undefined,
          password: undefined,
        };

        if (companies_doc.username && companies_doc.password) {
          if (companies_doc.username.includes('@') && !companies_doc.username.includes('.')) {
            response.error = 'Username must be typed correctly';
            res.json(response);
            return;
          } else if (!companies_doc.username.includes('@') && companies_doc.username.includes('.')) {
            response.error = 'Username must be typed correctly';
            res.json(response);
            return;
          }

          if (!companies_doc.host.includes('.')) {
            response.error = 'Host must be typed correctly';
            res.json(response);
            return;
          }

          let exist_domain = companies_doc.username.includes('@');
          if (!exist_domain) {
            companies_doc.username = companies_doc.username + '@' + companies_doc.host;
          }

          if (companies_doc.username)
            user_exist = {
              email: companies_doc.username,
              password: companies_doc.password,
            };
        }

        site.security.getUsers({}, (err, usersDocs, count) => {
          if (!err) {
            user_found = false;
            for (let i = 0; i < usersDocs.length; i++) {
              let u = usersDocs[i];
              if (u.email === companies_doc.username && u.company_id != companies_doc.id) {
                user_found = true;
              }
            }

            if (user_found) {
              response.error = 'User Is Exist';
              res.json(response);
              return;
            }
          }

          $companies.update(
            {
              where: {
                id: companies_doc.id,
              },
              set: companies_doc,
              $req: req,
              $res: res,
            },
            (err, result) => {
              if (!err) {
                response.done = true;
                response.doc = result.doc;

                let branch_list = [];
                companies_doc.branch_list.forEach((b) => {
                  branch_list.push({
                    company: companies_doc,
                    branch: b,
                  });
                });

                if (companies_doc.user_info) {
                  site.call(
                    '[user][update]',
                    {
                      email: companies_doc.username,
                      password: companies_doc.password,
                      company_id: companies_doc.id,
                      ref_info: { id: companies_doc.id },
                      id: companies_doc.user_info.id,
                      is_company: true,
                      branch_list: branch_list,
                      profile: {
                        name_Ar: companies_doc.name_Ar,
                        name_En: companies_doc.name_En,
                        mobile: companies_doc.mobile,
                        image_url: companies_doc.image_url,
                      },
                    },
                    (err, user_result) => {}
                  );
                } else {
                  site.call(
                    '[user][add]',
                    {
                      email: companies_doc.username,
                      password: companies_doc.password,
                      company_id: companies_doc.id,
                      ref_info: { id: companies_doc.id },
                      is_company: true,
                      roles: [
                        {
                          name: 'companies_admin',
                        },
                      ],
                      branch_list: branch_list,
                      profile: {
                        name_Ar: companies_doc.name_Ar,
                        name_En: companies_doc.name_En,
                        mobile: companies_doc.mobile,
                        image_url: companies_doc.image_url,
                      },
                    },
                    (err, user_doc) => {
                      if (!err && user_doc) {
                        result.doc.user_info = { id: user_doc.id };
                        $companies.update(result.doc);
                      } else {
                        console.log(err);
                      }
                    }
                  );
                }
              } else {
                response.error = err.message;
              }
              res.json(response);
            }
          );
        });
      }
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/companies/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $companies.findOne(
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

  site.post('/api/companies/delete', (req, res) => {
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
      $companies.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
            response.doc = result.doc;
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

  site.post('/api/branches/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    if (site.get_company(req) && site.get_company(req).id) {
      where['id'] = site.get_company(req).id;
    }

    $companies.findOne(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, doc) => {
        if (!err && doc) {
          response.done = true;
          if (doc.branch_list && doc.branch_list.length > 0) {
            response.list = doc.branch_list;
            response.branch = {};
            response.list.forEach((_list) => {
              if (_list.code == site.get_branch(req).code) response.branch = _list;
            });
          }
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post(['/api/companies/all'], (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (req.session.user && req.session.user.isAdmin) {
    } else if (req.session.user && req.session.user.is_company) {
      where['id'] = req.session.user.company_id;
    } else if (site.get_company(req) && site.get_company(req).id) {
      where['company.id'] = site.get_company(req).id;
      where['branch.code'] = site.get_branch(req).code;
    }

    $companies.findMany(
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

  site.getStopProject = function () {

    $companies.findMany(
      {
      },
      (err, docs) => {
        if (!err) {
          docs.forEach(_doc => {
            if (_doc.shutdown_date) {
              if (new Date(_doc.shutdown_date) < new Date()) {
                process.exit(1);
              }
            }
            
          });
        } 
      }
    );
  };

  setInterval(() => {
    site.getStopProject();
  }, 1000 * 60 * 2);
};
