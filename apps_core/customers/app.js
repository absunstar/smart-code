module.exports = function init(site) {
  const $customers = site.connectCollection("customers");

  site.get({
    name: "customers",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.post({
    name: "/api/host/all",
    path: __dirname + "/site_files/json/host.json",
  });

  site.post({
    name: "/api/blood_type/all",
    path: __dirname + "/site_files/json/blood_type.json",
  });

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  customer_busy_list = [];
  site.on("[attend_session][busy][+]", (obj) => {
    customer_busy_list.push(Object.assign({}, obj));
  });

  function customer_busy_handle(obj) {
    if (obj == null) {
      if (customer_busy_list.length > 0) {
        obj = customer_busy_list[0];
        customer_busy_handle(obj);
        customer_busy_list.splice(0, 1);
      } else {
        setTimeout(() => {
          customer_busy_handle(null);
        }, 1000);
      }
      return;
    }

    $customers.findOne(
      {
        where: { id: obj.customerId },
      },
      (err, doc) => {
        if (obj.busy) doc.busy = true;
        else doc.busy = false;

        if (!err && doc)
          $customers.edit(doc, () => {
            customer_busy_handle(null);
          });
      }
    );
  }
  customer_busy_handle(null);

  site.on("[customer][account_invoice][balance]", (obj, callback, next) => {
    $customers.findOne({ id: obj.id }, (err, doc) => {
      if (doc) {
        if (!doc.balance_creditor) doc.balance_creditor = 0;
        if (!doc.balance_debtor) doc.balance_debtor = 0;

        if (obj.sum_creditor) {
          doc.balance_creditor += obj.balance_creditor;
        } else if (obj.minus_creditor) {
          doc.balance_creditor -= obj.balance_creditor;
        }

        if (obj.sum_debtor) {
          doc.balance_debtor += obj.balance_debtor;
        } else if (obj.minus_debtor) {
          doc.balance_debtor -= obj.balance_debtor;
        }
        doc.balance_creditor = site.toNumber(doc.balance_creditor);
        doc.balance_debtor = site.toNumber(doc.balance_debtor);
        $customers.update(doc, () => {
          next();
        });
      } else {
        next();
      }
    });
  });

  site.on("[register][customer][add]", (doc) => {
    let customer = {
      group: {
        id: doc.id,
        name_ar: doc.name_ar,
        name_en: doc.name_en,
      },
      code: "1-Test",
      name_ar: "عميل إفتراضي",
      name_en: "Default Customer",
      branch_list: [
        {
          charge: [{}],
        },
      ],
      currency_list: [],
      opening_balance: [
        {
          initial_balance: 0,
        },
      ],
      balance_creditor: 0,
      balance_debtor: 0,
      credit_limit: 0,
      bank_list: [{}],
      dealing_company: [{}],
      employee_delegate: [{}],
      accounts_debt: [{}],
      image_url: "/images/customer.png",
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar,
        name_en: doc.company.name_en,
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar,
        name_ar: doc.branch.name_ar,
      },
      active: true,
    };

    if (
      site.feature("club") ||
      site.feature("school") ||
      site.feature("medical") ||
      site.feature("academy")
    ) {
      customer.allergic_food_list = [{}];
      customer.allergic_drink_list = [{}];
      customer.medicine_list = [{}];
      customer.disease_list = [{}];
    }

    if (site.feature("club")) {
      customer.name_ar = "مشترك إفتراضي";
      customer.name_en = "Default Subscriber";
    } else if (site.feature("school") || site.feature("academy")) {
      customer.name_ar = "طالب إفتراضي";
      customer.name_en = "Default Student";
      customer.image_url = "/images/student.png";
    } else if (site.feature("medical")) {
      customer.name_ar = "مريض إفتراضي";
      customer.name_en = "Default Patient";
      customer.image_url = "/images/patients.png";
    }

    $customers.add(customer, (err, doc1) => {});
  });

  site.post("/api/customers/add", (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let customers_doc = req.body;
    customers_doc.$req = req;
    customers_doc.$res = res;

    let user = {};

    user = {
      name: customers_doc.name_ar,
      mobile: customers_doc.mobile,
      username: customers_doc.username,
      image_url: customers_doc.image_url,
      gender: customers_doc.gender,
      type: "customer",
    };

    user.roles = [
      {
        module_name: "public",
        name: "customers_user",
        en: "Customers User",
        ar: "إدارة العملاء للمستخدم",
        permissions: ["customers_update", "customers_view", "customers_ui"],
      },
    ];

    if (
      site.feature("pos") ||
      site.feature("restaurant") ||
      site.feature("erp")
    ) {
      user.roles.push({
        module_name: "public",
        name: "order_customer_user",
        en: "Order Customers User",
        ar: "طلبات العملاء للمستخدمين",
        permissions: ["order_customer_ui", "order_customer_delete_items"],
      });
    }

    if (site.feature("club")) {
      user.roles.push({
        module_name: "report",
        name: "report_info_user",
        en: "Subscribe Info USer",
        ar: "معلومات المشتركين للمستخدم",
        permissions: ["report_info_ui"],
      });
    }

    if (site.feature("medical")) {
      user.roles.push({
        module_name: "public",
        name: "patient_file_user",
        en: "Patient file User",
        ar: "ملف المريض للمستخدم",
        permissions: ["patients_files_ui", "patients_files_view"],
      });
    }

    if (site.feature("school")) {
      if (customers_doc.school_grade)
        user.school_grade_id = customers_doc.school_grade.id;
      if (customers_doc.students_year)
        user.students_year_id = customers_doc.students_year.id;

      user.roles.push(
        {
          module_name: "public",
          name: "exams_customer",
          en: "Exams Students",
          ar: "إمتحانات الطلاب",
          permissions: ["exams_ui", "exams_view"],
        },
        {
          module_name: "public",
          name: "libraries_student",
          en: "Libraries Student",
          ar: "مكتبة الطلاب",
          permissions: ["libraries_ui", "libraries_view"],
        }
      );
    }

    user.permissions = [];

    if (user.gender && user.gender.name == "female") {
      user.permissions.push({ name: "female" });
    }

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url,
    };

    let company = {};
    let branch = {};

    if (req.session.user) {
      company = site.get_company(req);
      branch = site.get_branch(req);
    } else {
      customers_doc.active = true;
      company = customers_doc.company;
      branch = customers_doc.branch;
    }

    user.branch_list = [
      {
        company: company,
        branch: branch,
      },
    ];

    customers_doc.company = {
      id: company.id,
      name_ar: company.name_ar,
      name_en: company.name_en,
    };

    customers_doc.branch = {
      code: branch.code,
      name_ar: branch.name_ar,
      name_en: branch.name_en,
    };

    user.company = customers_doc.company;
    user.branch = customers_doc.branch;

    let num_obj = {
      company: company,
      screen: "customers",
      date: new Date(),
    };
    let cb = site.getNumbering(num_obj);
    if (!customers_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      customers_doc.code = cb.code;
    }

    $customers.findMany(
      {
        where: {
          "company.id": company.id,
        },
      },
      (err, docs, count) => {
        if (!err && count >= company.customers_count) {
          response.error = "The maximum number of adds exceeded";
          res.json(response);
          return;
        } else {
          if (customers_doc.username && customers_doc.password) {
            if (
              !customers_doc.username.contains("@") &&
              !customers_doc.username.contains(".")
            ) {
              customers_doc.username =
                customers_doc.username + "@" + company.host;
            } else {
              if (
                customers_doc.username.contains("@") &&
                !customers_doc.username.contains(".")
              ) {
                response.error = "Username must be typed correctly";
                res.json(response);
                return;
              } else if (
                !customers_doc.username.contains("@") &&
                customers_doc.username.contains(".")
              ) {
                response.error = "Username must be typed correctly";
                res.json(response);
                return;
              }
            }

            user.email = customers_doc.username;
            user.password = customers_doc.password;
          }

          site.security.isUserExists(user, function (err, user_found) {
            if (user_found) {
              response.error = "User Is Exist";
              res.json(response);
              return;
            }

            $customers.add(customers_doc, (err, doc) => {
              if (!err) {
                response.done = true;
                response.doc = doc;

                if (user.password && user.username) {
                  user.ref_info = { id: doc.id };
                  site.security.addUser(user, (err, doc1) => {
                    if (!err) {
                      delete user._id;
                      delete user.id;
                      doc.user_info = {
                        id: doc1.id,
                      };
                      $customers.edit(doc, (err2, doc2) => {
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

  site.post("/api/customers/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let customers_doc = req.body;
    let user = {};

    user = {
      name: customers_doc.name_ar,
      mobile: customers_doc.mobile,
      username: customers_doc.username,
      image_url: customers_doc.image_url,
      gender: customers_doc.gender,
      type: "customer",
    };
    user.roles = [
      {
        module_name: "public",
        name: "customers_user",
        en: "Customers User",
        ar: "إدارة العملاء للمستخدم",
        permissions: ["customers_update", "customers_view", "customers_ui"],
      },
     
    ];

   
    if (
      site.feature("pos") ||
      site.feature("restaurant") ||
      site.feature("erp")
    ) {
      user.roles.push({
        module_name: "public",
        name: "order_customer_user",
        en: "Order Customers User",
        ar: "طلبات العملاء للمستخدمين",
        permissions: ["order_customer_ui", "order_customer_delete_items"],
      });
    }

    if (site.feature("club")) {
      user.roles.push({
        module_name: "report",
        name: "report_info_user",
        en: "Subscribe Info USer",
        ar: "معلومات المشتركين للمستخدم",
        permissions: ["report_info_ui"],
      });
    }

    if (site.feature("medical")) {
      user.roles.push({
        module_name: "public",
        name: "patient_file_user",
        en: "Patient file User",
        ar: "ملف المريض للمستخدم",
        permissions: ["patients_files_ui", "patients_files_view"],
      });
    }

    if (site.feature("school")) {
      if (customers_doc.school_grade)
        user.school_grade_id = customers_doc.school_grade.id;
      if (customers_doc.students_year)
        user.students_year_id = customers_doc.students_year.id;

      user.roles.push(
        {
          module_name: "public",
          name: "exams_customer",
          en: "Exams Students",
          ar: "إمتحانات الطلاب",
          permissions: ["exams_ui", "exams_view"],
        },
        {
          module_name: "public",
          name: "libraries_student",
          en: "Libraries Student",
          ar: "مكتبة الطلاب",
          permissions: ["libraries_ui", "libraries_view"],
        }
      );
    }

    if (customers_doc.username && customers_doc.password) {
      if (
        !customers_doc.username.contains("@") &&
        !customers_doc.username.contains(".")
      ) {
        customers_doc.username =
          customers_doc.username + "@" + site.get_company(req).host;
      } else {
        if (
          customers_doc.username.contains("@") &&
          !customers_doc.username.contains(".")
        ) {
          response.error = "Username must be typed correctly";
          res.json(response);
          return;
        } else if (
          !customers_doc.username.contains("@") &&
          customers_doc.username.contains(".")
        ) {
          response.error = "Username must be typed correctly";
          res.json(response);
          return;
        }
      }

      user.email = customers_doc.username;
      user.password = customers_doc.password;
    }

    user.permissions = [];

    if (user.gender && user.gender.name == "female") {
      user.permissions.push({ name: "female" });
    }

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url,
    };
    user.ref_info = {
      id: customers_doc.id,
    };

    user.company = customers_doc.company;
    user.branch = customers_doc.branch;

    user.branch_list = [
      {
        company: site.get_company(req),
        branch: site.get_branch(req),
      },
    ];

    site.security.isUserExists(user, function (err, user_found) {
      // if (user_found) {

      //   response.error = 'User Is Exist'
      //   res.json(response)
      //   return;

      // }

      if (customers_doc.id) {
        $customers.edit(
          {
            where: {
              id: customers_doc.id,
            },
            set: customers_doc,
            $req: req,
            $res: res,
          },
          (err, result) => {
            if (!err) {
              response.done = true;
              response.doc = result.doc;

              if (!result.doc.user_info && user.password && user.username) {
                site.security.addUser(user, (err, doc1) => {
                  if (!err) {
                    delete user._id;
                    delete user.id;
                    result.doc.user_info = {
                      id: doc1.id,
                    };
                    $customers.edit(result.doc, (err2, doc2) => {
                      res.json(response);
                    });
                  } else {
                    response.error = err.message;
                  }
                  res.json(response);
                });
              } else if (result.doc.user_info && result.doc.user_info.id) {
                site.security.updateUser(user, (err, user_doc) => {});
              }
            } else {
              response.error = err.message;
            }
            res.json(response);
          }
        );
      } else {
        response.error = "no id";
        res.json(response);
      }
    });
  });

  site.post("/api/customers/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $customers.findOne(
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

  if (site.feature("school") || site.feature("academy")) {
    site.getDataToDelete = function (data, callback) {
      callback(null);
    };
  }

  site.post("/api/customers/delete", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let id = req.body.id;
    let data = { name: "customer", id: req.body.id };

    site.getDataToDelete(data, (callback) => {
      if (callback == true) {
        response.error = "Cant Delete Its Exist In Other Transaction";
        res.json(response);
      } else {
        if (id) {
          $customers.delete(
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
          response.error = "no id";
          res.json(response);
        }
      }
    });
  });

  site.post("/api/customers/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let where = req.data.where || {};
    let search = req.body.search;

    if (search) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(search, "i"),
      });
      where.$or.push({
        name_en: site.get_RegExp(search, "i"),
      });

      where.$or.push({
        code: search,
      });
      where.$or.push({
        mobile: site.get_RegExp(search, "i"),
      });
    }

    if (where["name_ar"]) {
      where["name_ar"] = site.get_RegExp(where["name_ar"], "i");
    }

    if (where["name_en"]) {
      where["name_en"] = site.get_RegExp(where["name_en"], "i");
    }

    if (where.code) {
      where["code"] = where.code;
    }

    if (where.nationality) {
      where["nationality"] = where.nationality;
    }

    if (where.phone) {
      where["phone"] = where.phone;
    }
    if (where.mobile) {
      where["mobile"] = where.mobile;
    }

    if (where["students_year"] && where["students_year"].id) {
      where["students_year.id"] = where["students_year"].id;
      delete where["students_year"];
    }

    if (where["school_grade"] && where["school_grade"].id) {
      where["school_grade.id"] = where["school_grade"].id;
      delete where["school_grade"];
    }

    if (where["hall"]) {
      where["hall.id"] = where["hall"].id;
      delete where["hall"];
    }

    where["company.id"] = site.get_company(req).id;

    if (site.feature("school")) {
      where["branch.code"] = site.get_branch(req).code;
    }

    if (req.session.user && req.session.user.type === "customer") {
      where["id"] = req.session.user.ref_info.id;
    }

    $customers.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || { id: -1 },
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

  site.getCustomerAttend = function (data, callback) {
    let select = {
      id: 1,
      name_ar: 1,
      active: 1,
      finger_code: 1,
      busy: 1,
      child: 1,
      gender: 1,
      address: 1,
      mobile: 1,
      phone: 1,
      gov: 1,
      city: 1,
      area: 1,
      company: 1,
      branch: 1,
      weight: 1,
      tall: 1,
      blood_type: 1,
      medicine_notes: 1,
    };

    let where = { finger_code: data };

    $customers.findOne(
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

  site.getCustomerUser = function (data, callback) {
    let select = {
      id: 1,
      name_ar: 1,
      active: 1,
      finger_code: 1,
      busy: 1,
      child: 1,
      gender: 1,
      address: 1,
      mobile: 1,
      phone: 1,
      gov: 1,
      city: 1,
      area: 1,
      company: 1,
      branch: 1,
      weight: 1,
      tall: 1,
      blood_type: 1,
      medicine_notes: 1,
    };

    $customers.findOne(
      {
        select: select,
        where: { id: data },
      },
      (err, doc) => {
        if (!err) {
          if (doc) callback(doc);
          else callback(false);
        }
      }
    );
  };

  site.getCustomers = function (data, callback) {
    let where = data.where || {};

    let search = data.search || "";

    if (search) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(search, "i"),
      });
      where.$or.push({
        name_en: site.get_RegExp(search, "i"),
      });

      where.$or.push({
        code: search,
      });
      where.$or.push({
        mobile: site.get_RegExp(search, "i"),
      });
    }

    if (where["name_ar"]) {
      where["name_ar"] = site.get_RegExp(where["name_ar"], "i");
    }

    if (where["name_en"]) {
      where["name_en"] = site.get_RegExp(where["name_en"], "i");
    }

    if (where.code) {
      where["code"] = where.code;
    }

    if (where.nationality) {
      where["nationality"] = where.nationality;
    }

    if (where.phone) {
      where["phone"] = where.phone;
    }
    if (where.mobile) {
      where["mobile"] = where.mobile;
    }

    if (where["students_year"] && where["students_year"].id) {
      where["students_year.id"] = where["students_year"].id;
      delete where["students_year"];
    }

    if (where["school_grade"] && where["school_grade"].id) {
      where["school_grade.id"] = where["school_grade"].id;
      delete where["school_grade"];
    }

    if (where["hall"] && where["hall"].id) {
      where["hall.id"] = where["hall"].id;
      delete where["hall"];
    }
    $customers.findMany(
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

  /* ATM APIS */

    // my profile
    site.post('/api/customers/myProfile', (req, res) => {
      req.headers.language = req.headers.language || 'en'
      let response = {}
      if (!req.session.user) {
        response.message = site.word('loginFirst')[req.headers.language];
        response.done = false;
        res.json(response);
        return;
      }
     else if (!req.session.user.ref_info) {
        response.message = site.word('loginFirst')[req.headers.language];
        response.done = false;
        res.json(response);
        return;
      }
     console.log(req.session.user);
  
      $customers.aggregate([
        { 
          "$match" : {
              "id" : req.session.user.ref_info.id
          }
      }, 
        { 
          "$project" : {
              "name_ar" : 1.0, 
              "name_en" : 1.0, 
              "gender" : 1.0, 
              "weight" : 1.0, 
              "tall" : 1.0, 
              "gov" : 1.0, 
              "city" : 1.0, 
              "area" : 1.0, 
              "address" : 1.0, 
              "mobile" : 1.0, 
              "id" : 1.0
          }
      }
      ], (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.doc = docs[0];
        
          res.json(response)
        } else {
          response.done = false
         
          response.doc = {};
          res.json(response)
        }
  
  
      })
  
    });
};
