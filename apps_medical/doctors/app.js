module.exports = function init(site) {
  const $doctors = site.connectCollection("hr_employee_list");
  const $clinics = site.connectCollection("clinics");

  site.on("[register][doctor][add]", (doc) => {
    $doctors.add({
        code: "1-Test",
        name_ar: "طبيب إفتراضي",
        name_en: "Default Doctor",
        image_url: "/images/doctors.png",
        specialty: {
          id: doc.id,
          code: doc.code,
          name_ar: doc.name_ar,
          name_en: doc.name_en,
        },
        doctor: true,
        company: {
          id: doc.company.id,
          name_ar: doc.company.name_ar,
          name_en: doc.company.name_en,
        },
        branch: {
          code: doc.branch.code,
          name_ar: doc.branch.name_ar,
          name_en: doc.branch.name_en,
        },
        active: true,
      },
      (err, doc1) => {}
    );
  });

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "doctors",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.post({
    name: "/api/degree/all",
    path: __dirname + "/site_files/json/degree.json",
  });

  site.post("/api/doctors/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let doctor_doc = req.body;
    doctor_doc.$req = req;
    doctor_doc.$res = res;

    doctor_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof doctor_doc.active === "undefined") {
      doctor_doc.active = true;
    }
    doctor_doc.doctor = true;

    doctor_doc.company = site.get_company(req);
    doctor_doc.branch = site.get_branch(req);

    $doctors.find({
        where: {
          "company.id": site.get_company(req).id,
          "branch.code": site.get_branch(req).code,

          $or: [{
              name_ar: doctor_doc.name_ar,
            },
            {
              name_en: doctor_doc.name_en,
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = "Name , Phone Or mobile Exists";
          res.json(response);
        } else {
          let num_obj = {
            company: site.get_company(req),
            screen: "doctors",
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!doctor_doc.code && !cb.auto) {
            response.error = "Must Enter Code";
            res.json(response);
            return;
          } else if (cb.auto) {
            doctor_doc.code = cb.code;
          }

          let user = {};

          user = {
            type: "doctor",
          };

          user.roles = [{
            module_name: "public",
            name: "doctor_admin",
            en: "Employee Admin",
            ar: "إدارة الموظفين",
            permissions: ["doctor_manage"],
          }, ];

          user.profile = {
            name_ar: user.name_ar,
            name_en: user.name_en,
            mobile: user.mobile,
            gender: doctor_doc.gender,
            image_url: user.image_url,
          };

          let company = {};
          let branch = {};

          if (req.session.user) {
            company = site.get_company(req);
            branch = site.get_branch(req);
          } else {
            doctor_doc.active = true;
            company = doctor_doc.company;
            branch = doctor_doc.branch;
          }

          user.branch_list = [{
            company: company,
            branch: branch,
          }, ];

      
          user.company = doctor_doc.company;
          user.branch = doctor_doc.branch;

          if (doctor_doc.username && doctor_doc.password) {
            if (
              !doctor_doc.username.contains("@") &&
              !doctor_doc.username.contains(".")
            ) {
              doctor_doc.username =
                doctor_doc.username + "@" + company.host;
            } else {
              if (
                doctor_doc.username.contains("@") &&
                !doctor_doc.username.contains(".")
              ) {
                response.error = "Username must be typed correctly";
                res.json(response);
                return;
              } else if (
                !doctor_doc.username.contains("@") &&
                doctor_doc.username.contains(".")
              ) {
                response.error = "Username must be typed correctly";
                res.json(response);
                return;
              }
            }

            user.email = doctor_doc.username;
            user.password = doctor_doc.password;
          }

          site.security.isUserExists(user, function (err, user_found) {
            if (user_found) {
              response.error = "User Is Exist";
              res.json(response);
              return;
            }

            $doctors.add(doctor_doc, (err, doc) => {
              if (!err) {
                response.done = true;
                response.doc = doc;
                user.ref_info = {
                  id: doc.id,
                };
      
                if (user.password && user.email) {
                  site.security.addUser(user, (err, doc1) => {
                    if (!err) {
                      delete user._id;
                      delete user.id;
                      doc.user_info = {
                        id: doc1.id,
                      };
                      $doctors.edit(doc, (err2, doc2) => {
                        res.json(response);
                      });
                    } else {
                      response.error = err.message;
                    }
                    res.json(response);
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

  site.post("/api/doctors/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let doctor_doc = req.body;
    let user = {};

    user = {
      name_ar: doctor_doc.name_ar,
      name_en: doctor_doc.name_en,
      mobile: doctor_doc.mobile,
      username: doctor_doc.username,
      email: doctor_doc.username,
      password: doctor_doc.password,
      image_url: doctor_doc.image_url,
      gender: doctor_doc.gender,
      type: "doctor",
    };

    user.roles = [{
      module_name: "public",
      name: "doctor_admin",
      en: "Employee Admin",
      ar: "إدارة الموظفين",
      permissions: ["doctor_manage"],
    }, ];

    user.profile = {
      name_ar: user.name_ar,
      name_en: user.name_en,
      mobile: user.mobile,
      image_url: user.image_url,
    };

    user.ref_info = {
      id: doctor_doc.id,
    };

    user.company = doctor_doc.company;
    user.branch = doctor_doc.branch;

    doctor_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (doctor_doc.id) {
      $doctors.edit({
          where: {
            id: doctor_doc.id,
          },
          set: doctor_doc,
          $req: req,
          $res: res,
        },
        (err, doctor_doc) => {
          if (!err) {
            response.done = true;
            user.doctor_id = doctor_doc.doc.id;

            if (!doctor_doc.doc.user_info && user.password && user.email) {
              site.security.addUser(user, (err, doc1) => {
                if (!err) {
                  delete user._id;
                  delete user.id;
                  doctor_doc.doc.user_info = {
                    id: doc1.id,
                  };
                  $doctors.edit(doctor_doc.doc, (err2, doc2) => {
                    res.json(response);
                  });
                } else {
                  response.error = err.message;
                }
                res.json(response);
              });
            } else if (
              doctor_doc.doc.user_info &&
              doctor_doc.doc.user_info.id
            ) {
              user.id = doctor_doc.doc.user_info.id;
              site.security.updateUser(user, (err, user_doc) => {});
            }
          } else {
            response.error = "Code Already Exist";
          }
          res.json(response);
        }
      );
    } else {
      response.error = "no id";
      res.json(response);
    }
  });

  site.post("/api/doctors/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $doctors.findOne({
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

  site.post("/api/doctors/delete", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $doctors.delete({
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
      response.error = "no id";
      res.json(response);
    }
  });

  site.post("/api/doctors/handel", (req, res) => {
    let response = {
      done: false,
    };

    $doctors.findMany({
        where: {
          "job.doctors": true,
        },
      },
      (err, docs) => {
        response.done = true;

        docs.forEach((_doc) => {
          _doc.doctor = true;
          $doctors.edit(_doc);
        });

        res.json(response);
      }
    );
  });

  site.post("/api/doctors/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let where = req.body.where || {};
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
        mobile: site.get_RegExp(search, "i"),
      });

      where.$or.push({
        phone: site.get_RegExp(search, "i"),
      });

      where.$or.push({
        national_id: site.get_RegExp(search, "i"),
      });

      where.$or.push({
        email: site.get_RegExp(search, "i"),
      });
    }

    if (where["gov"]) {
      where["gov.id"] = where["gov"].id;
      delete where["gov"];
      delete where.active;
    }

    if (where["city"]) {
      where["city.id"] = where["city"].id;
      delete where["city"];
      delete where.active;
    }
    if (where["area"]) {
      where["area.id"] = where["area"].id;
      delete where["area"];
      delete where.active;
    }

    if (where["specialty"]) {
      where["specialty.id"] = where["specialty"].id;
      delete where["specialty"];
      delete where.active;
    }

    if (where["name_ar"]) {
      where["name_ar"] = site.get_RegExp(where["name_ar"], "i");
    }

    if (where["name_en"]) {
      where["name_en"] = site.get_RegExp(where["name_en"], "i");
    }

    if (where["address"]) {
      where["address"] = site.get_RegExp(where["address"], "i");
    }
    if (where["national_id"]) {
      where["national_id"] = site.get_RegExp(where["national_id"], "i");
    }
    if (where["phone"]) {
      where["phone"] = site.get_RegExp(where["phone"], "i");
    }

    if (where["mobile"]) {
      where["mobile"] = site.get_RegExp(where["mobile"], "i");
    }

    if (where["email"]) {
      where["email"] = site.get_RegExp(where["email"], "i");
    }

    if (where["whatsapp"]) {
      where["whatsapp"] = site.get_RegExp(where["whatsapp"], "i");
    }
    if (where["twitter"]) {
      where["twitter"] = site.get_RegExp(where["twitter"], "i");
    }
    if (where["facebook"]) {
      where["facebook"] = site.get_RegExp(where["facebook"], "i");
    }

    if (where["notes"]) {
      where["notes"] = site.get_RegExp(where["notes"], "i");
    }

    //  if (req.session.user.roles[0].name === 'doctors') {
    //   where['id'] = req.session.user.doctor_id;
    // }

    where["doctor"] = true;
    where["company.id"] = site.get_company(req).id;
    where["branch.code"] = site.get_branch(req).code;

    $doctors.findMany({
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

  /* ATM APIS */

  //   site.post("/api/doctors/searchAll", (req, res) => {
  //     let response = {
  //       done: false
  //     }
  //     let where = req.body.where || {}
  //     let limit = 10
  //     let skip = 0
  //     if (req.body.page || (parseInt(req.body.page) && parseInt(req.body.page) > 1)) {
  //       skip = (parseInt(req.body.page) - 1) * 10
  //     }
  //     let name_ar
  //     let name_en

  //     if (where['name_ar'] != "" ) {

  //        name_ar =  where['name_ar']
  //     }
  //     if (where['name_ar'] == "" ) {

  //       name_ar =  ""
  //    }
  //     if (where['name_ar'] == undefined) {

  //       name_ar = ""
  //    }

  // // let name_en = req.body.where.name_en || ""
  //     if (!req.session.user) {
  //       response.error = 'Please Login First'
  //       res.json(response)
  //       return
  //     }
  //     $clinics.aggregate(
  //       [
  //         {
  //           "$project": {
  //             "doctor_list": 1.0
  //           }
  //         },
  //         {
  //           "$unwind": {
  //             "path": "$doctor_list",
  //             "includeArrayIndex": "arrayIndex",
  //             "preserveNullAndEmptyArrays": false
  //           }
  //         },
  //         {
  //           "$addFields": {
  //             "doctor": "$doctor_list.doctor",
  //             "shift": "$doctor_list.shift",
  //             "detection_price": "$doctor_list.detection_price"
  //           }
  //         },
  //         {
  //           "$project": {
  //             "doctor_list": 0.0,
  //             "arrayIndex": 0.0
  //           }
  //         },
  //         {
  //           "$match": {
  //             "doctor.name_ar":{$regex: name_ar ,$options:"i"}

  //           }
  //         },
  //         {
  //           $skip: skip
  //         },
  //         {
  //           $limit: limit
  //         }
  //       ],
  //       (err, docs) => {
  //         if (docs && docs.length > 0) {
  //           response.done = true;

  //           if (docs.length > 0) {

  //             docs.forEach(_doc => {

  //               if (_doc.detection_price) {
  //                 _doc.online_price = {}
  //                 _doc.at_home_price = {}
  //                 _doc.at_clinic_price = {
  //                   detection: _doc.detection_price.detection,
  //                   re_detection: _doc.detection_price.re_detection,
  //                   consultation: _doc.detection_price.consultation,
  //                   session: _doc.detection_price.session,
  //                 }

  //                 if (_doc.detection_price.online) {
  //                   if (_doc.detection_price.detection) {

  //                     if (_doc.detection_price.online.type == "percent")
  //                       _doc.online_price.detection =
  //                         ((_doc.detection_price.detection * site.toNumber(_doc.detection_price.online.price)) /
  //                           100) + _doc.detection_price.detection;
  //                     else _doc.online_price.detection = _doc.detection_price.detection + site.toNumber(_doc.detection_price.online.price);
  //                   }
  //                   if (_doc.detection_price.re_detection) {

  //                     if (_doc.detection_price.online.type == "percent")
  //                       _doc.online_price.re_detection =
  //                         ((_doc.detection_price.re_detection * site.toNumber(_doc.detection_price.online.price)) /
  //                           100) + _doc.detection_price.re_detection;
  //                     else _doc.online_price.re_detection = _doc.detection_price.re_detection + site.toNumber(_doc.detection_price.online.price);
  //                   }
  //                   if (_doc.detection_price.consultation) {

  //                     if (_doc.detection_price.online.type == "percent")
  //                       _doc.online_price.consultation =
  //                         ((_doc.detection_price.consultation * site.toNumber(_doc.detection_price.online.price)) /
  //                           100) + _doc.detection_price.consultation;
  //                     else _doc.online_price.consultation = _doc.detection_price.consultation + site.toNumber(_doc.detection_price.online.price);
  //                   }
  //                   if (_doc.detection_price.session) {

  //                     if (_doc.detection_price.online.type == "percent")
  //                       _doc.online_price.session =
  //                         ((_doc.detection_price.session * site.toNumber(_doc.detection_price.online.price)) /
  //                           100) + _doc.detection_price.session;
  //                     else _doc.online_price.session = _doc.detection_price.session + site.toNumber(_doc.detection_price.online.price);
  //                   }
  //                 }

  //                 if (_doc.detection_price.at_home) {
  //                   if (_doc.detection_price.detection) {

  //                     if (_doc.detection_price.at_home.type == "percent")
  //                       _doc.at_home_price.detection =
  //                         ((_doc.detection_price.detection * site.toNumber(_doc.detection_price.at_home.price)) /
  //                           100) + _doc.detection_price.detection;
  //                     else _doc.at_home_price.detection = _doc.detection_price.detection + site.toNumber(_doc.detection_price.at_home.price);
  //                   }
  //                   if (_doc.detection_price.re_detection) {

  //                     if (_doc.detection_price.at_home.type == "percent")
  //                       _doc.at_home_price.re_detection =
  //                         ((_doc.detection_price.re_detection * site.toNumber(_doc.detection_price.at_home.price)) /
  //                           100) + _doc.detection_price.re_detection;
  //                     else _doc.at_home_price.re_detection = _doc.detection_price.re_detection + site.toNumber(_doc.detection_price.at_home.price);
  //                   }
  //                   if (_doc.detection_price.consultation) {

  //                     if (_doc.detection_price.at_home.type == "percent")
  //                       _doc.at_home_price.consultation =
  //                         ((_doc.detection_price.consultation * site.toNumber(_doc.detection_price.at_home.price)) /
  //                           100) + _doc.detection_price.consultation;
  //                     else _doc.at_home_price.consultation = _doc.detection_price.consultation + site.toNumber(_doc.detection_price.at_home.price);
  //                   }
  //                   if (_doc.detection_price.session) {

  //                     if (_doc.detection_price.at_home.type == "percent")
  //                       _doc.at_home_price.session =
  //                         ((_doc.detection_price.session * site.toNumber(_doc.detection_price.at_home.price)) /
  //                           100) + _doc.detection_price.session;
  //                     else _doc.at_home_price.session = _doc.detection_price.session + site.toNumber(_doc.detection_price.at_home.price);
  //                   }
  //                 }
  //                 let prices = {
  //                   at_clinic_price: _doc.at_clinic_price,
  //                   at_home_price: _doc.at_home_price,
  //                   online_price: _doc.online_price,

  //                 }
  //               }

  //             });

  //             response.list = docs;
  //             response.count = docs.length;
  //             response.totalPages = Math.ceil(docs.length / 10);
  //             res.json(response);

  //           }

  //         } else {
  //           response.done = false;

  //           response.list = docs;
  //           response.count = 0;
  //           response.totalPages = 0;
  //           res.json(response);
  //         }
  //       }
  //     );

  //   })

  site.post("/api/doctors/searchAll", (req, res) => {
    let response = {
      done: false,
    };
    let where = req.body.where || {};
    let limit = 10;
    let skip = 0;
    if (
      req.body.page ||
      (parseInt(req.body.page) && parseInt(req.body.page) > 1)
    ) {
      skip = (parseInt(req.body.page) - 1) * 10;
    }






    $clinics.aggregate(
      [{
          "$project": {
            "doctor_list": 1.0,
            "id": 1.0
          }
        },
        {
          "$unwind": {
            "path": "$doctor_list",
            "includeArrayIndex": "arrayIndex",
            "preserveNullAndEmptyArrays": false
          }
        },
        {
          "$group": {
            "_id": "$doctor_list.doctor.id",
            "shifts": {
              "$push": {
                "shift": "$doctor_list.shift",
                "clinicId": "$id",
                "detection_price": "$doctor_list.detection_price"
              }
            },
            "doctor": {
              "$first": "$doctor_list.doctor"
            },
            "detection_price": {
              "$first": "$doctor_list.detection_price"
            }
          }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        }
      ],
      (err, docs) => {
        let count = docs.length
        if (docs && docs.length > 0) {
          



          docs.forEach(_doc => {

            if (_doc.detection_price) {
              _doc.online_price = {}
              _doc.at_home_price = {}
              _doc.urgent_visit_price = {}
              
              _doc.at_clinic_price = {
                detection: _doc.detection_price.detection,
                re_detection: _doc.detection_price.re_detection,
                consultation: _doc.detection_price.consultation,
                session: _doc.detection_price.session,
              }

              if (_doc.detection_price.online) {
                if (_doc.detection_price.detection) {

                  if (_doc.detection_price.online.type == "percent")
                    _doc.online_price.detection =
                    ((_doc.detection_price.detection * site.toNumber(_doc.detection_price.online.price)) /
                      100) + _doc.detection_price.detection;
                  else _doc.online_price.detection = _doc.detection_price.detection + site.toNumber(_doc.detection_price.online.price);
                }
                if (_doc.detection_price.re_detection) {

                  if (_doc.detection_price.online.type == "percent")
                    _doc.online_price.re_detection =
                    ((_doc.detection_price.re_detection * site.toNumber(_doc.detection_price.online.price)) /
                      100) + _doc.detection_price.re_detection;
                  else _doc.online_price.re_detection = _doc.detection_price.re_detection + site.toNumber(_doc.detection_price.online.price);
                }
                if (_doc.detection_price.consultation) {

                  if (_doc.detection_price.online.type == "percent")
                    _doc.online_price.consultation =
                    ((_doc.detection_price.consultation * site.toNumber(_doc.detection_price.online.price)) /
                      100) + _doc.detection_price.consultation;
                  else _doc.online_price.consultation = _doc.detection_price.consultation + site.toNumber(_doc.detection_price.online.price);
                }
                if (_doc.detection_price.session) {

                  if (_doc.detection_price.online.type == "percent")
                    _doc.online_price.session =
                    ((_doc.detection_price.session * site.toNumber(_doc.detection_price.online.price)) /
                      100) + _doc.detection_price.session;
                  else _doc.online_price.session = _doc.detection_price.session + site.toNumber(_doc.detection_price.online.price);
                }
              }

              if (_doc.detection_price.at_home) {
                if (_doc.detection_price.detection) {

                  if (_doc.detection_price.at_home.type == "percent")
                    _doc.at_home_price.detection =
                    ((_doc.detection_price.detection * site.toNumber(_doc.detection_price.at_home.price)) /
                      100) + _doc.detection_price.detection;
                  else _doc.at_home_price.detection = _doc.detection_price.detection + site.toNumber(_doc.detection_price.at_home.price);
                }
                if (_doc.detection_price.re_detection) {

                  if (_doc.detection_price.at_home.type == "percent")
                    _doc.at_home_price.re_detection =
                    ((_doc.detection_price.re_detection * site.toNumber(_doc.detection_price.at_home.price)) /
                      100) + _doc.detection_price.re_detection;
                  else _doc.at_home_price.re_detection = _doc.detection_price.re_detection + site.toNumber(_doc.detection_price.at_home.price);
                }
                if (_doc.detection_price.consultation) {

                  if (_doc.detection_price.at_home.type == "percent")
                    _doc.at_home_price.consultation =
                    ((_doc.detection_price.consultation * site.toNumber(_doc.detection_price.at_home.price)) /
                      100) + _doc.detection_price.consultation;
                  else _doc.at_home_price.consultation = _doc.detection_price.consultation + site.toNumber(_doc.detection_price.at_home.price);
                }
                if (_doc.detection_price.session) {

                  if (_doc.detection_price.at_home.type == "percent")
                    _doc.at_home_price.session =
                    ((_doc.detection_price.session * site.toNumber(_doc.detection_price.at_home.price)) /
                      100) + _doc.detection_price.session;
                  else _doc.at_home_price.session = _doc.detection_price.session + site.toNumber(_doc.detection_price.at_home.price);
                }
              }


              if (_doc.detection_price.urgent_visit) {
                if (_doc.detection_price.detection) {

                  if (_doc.detection_price.urgent_visit.type == "percent")
                    _doc.urgent_visit_price.detection =
                    ((_doc.detection_price.detection * site.toNumber(_doc.detection_price.urgent_visit.price)) /
                      100) + _doc.detection_price.detection;
                  else _doc.urgent_visit_price.detection = _doc.detection_price.detection + site.toNumber(_doc.detection_price.urgent_visit.price);
                }
                if (_doc.detection_price.re_detection) {

                  if (_doc.detection_price.urgent_visit.type == "percent")
                    _doc.urgent_visit_price.re_detection =
                    ((_doc.detection_price.re_detection * site.toNumber(_doc.detection_price.urgent_visit.price)) /
                      100) + _doc.detection_price.re_detection;
                  else _doc.urgent_visit_price.re_detection = _doc.detection_price.re_detection + site.toNumber(_doc.detection_price.urgent_visit.price);
                }
                if (_doc.detection_price.consultation) {

                  if (_doc.detection_price.urgent_visit.type == "percent")
                    _doc.urgent_visit_price.consultation =
                    ((_doc.detection_price.consultation * site.toNumber(_doc.detection_price.urgent_visit.price)) /
                      100) + _doc.detection_price.consultation;
                  else _doc.urgent_visit_price.consultation = _doc.detection_price.consultation + site.toNumber(_doc.detection_price.urgent_visit.price);
                }
                if (_doc.detection_price.session) {

                  if (_doc.detection_price.urgent_visit.type == "percent")
                    _doc.urgent_visit_price.session =
                    ((_doc.detection_price.session * site.toNumber(_doc.detection_price.urgent_visit.price)) /
                      100) + _doc.detection_price.session;
                  else _doc.urgent_visit_price.session = _doc.detection_price.session + site.toNumber(_doc.detection_price.urgent_visit.price);
                }
              }

            
            }
          });




          response.done = true;
          response.list = docs;
          response.count = docs.length;
          response.totalPages = Math.ceil(docs.length / 10);;
          res.json(response);
        } else {
          response.done = false;
          response.list = [];
          response.count = 0;
          response.totalPages = Math.ceil(count / 10);;
          res.json(response);
        }
      }
    );




































    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }


    // $clinics.findMany(
    //   {
    //     sort: req.body.sort || {
    //       id: -1,
    //     },
    //     limit: limit,
    //     skip: skip,
    //   },
    //   (err, docs, count) => {
    //     if (!err && docs.length > 0) {
    //       for (const iterator of docs) {
    //         for (const iterator2 of iterator.doctor_list) {
    //           if (iterator2.detection_price) {
    //             iterator2.online_price = {};
    //             iterator2.at_home_price = {};
    //             iterator2.urgent_visit_price = {};
    //             iterator2.at_clinic_price = {
    //               detection: iterator2.detection_price.detection,
    //               re_detection: iterator2.detection_price.re_detection,
    //               consultation: iterator2.detection_price.consultation,
    //               session: iterator2.detection_price.session,
    //             };

    //             if (iterator2.detection_price.online) {
    //               if (iterator2.detection_price.detection) {
    //                 if (iterator2.detection_price.online.type == "percent")
    //                   iterator2.online_price.detection =
    //                     (iterator2.detection_price.detection *
    //                       site.toNumber(
    //                         iterator2.detection_price.online.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.detection;
    //                 else
    //                   iterator2.online_price.detection =
    //                     iterator2.detection_price.detection +
    //                     site.toNumber(iterator2.detection_price.online.price);
    //               }
    //               if (iterator2.detection_price.re_detection) {
    //                 if (iterator2.detection_price.online.type == "percent")
    //                   iterator2.online_price.re_detection =
    //                     (iterator2.detection_price.re_detection *
    //                       site.toNumber(
    //                         iterator2.detection_price.online.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.re_detection;
    //                 else
    //                   iterator2.online_price.re_detection =
    //                     iterator2.detection_price.re_detection +
    //                     site.toNumber(iterator2.detection_price.online.price);
    //               }
    //               if (iterator2.detection_price.consultation) {
    //                 if (iterator2.detection_price.online.type == "percent")
    //                   iterator2.online_price.consultation =
    //                     (iterator2.detection_price.consultation *
    //                       site.toNumber(
    //                         iterator2.detection_price.online.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.consultation;
    //                 else
    //                   iterator2.online_price.consultation =
    //                     iterator2.detection_price.consultation +
    //                     site.toNumber(iterator2.detection_price.online.price);
    //               }
    //               if (iterator2.detection_price.session) {
    //                 if (iterator2.detection_price.online.type == "percent")
    //                   iterator2.online_price.session =
    //                     (iterator2.detection_price.session *
    //                       site.toNumber(
    //                         iterator2.detection_price.online.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.session;
    //                 else
    //                   iterator2.online_price.session =
    //                     iterator2.detection_price.session +
    //                     site.toNumber(iterator2.detection_price.online.price);
    //               }
    //             }

    //             if (iterator2.detection_price.at_home) {
    //               if (iterator2.detection_price.detection) {
    //                 if (iterator2.detection_price.at_home.type == "percent")
    //                   iterator2.at_home_price.detection =
    //                     (iterator2.detection_price.detection *
    //                       site.toNumber(
    //                         iterator2.detection_price.at_home.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.detection;
    //                 else
    //                   iterator2.at_home_price.detection =
    //                     iterator2.detection_price.detection +
    //                     site.toNumber(iterator2.detection_price.at_home.price);
    //               }
    //               if (iterator2.detection_price.re_detection) {
    //                 if (iterator2.detection_price.at_home.type == "percent")
    //                   iterator2.at_home_price.re_detection =
    //                     (iterator2.detection_price.re_detection *
    //                       site.toNumber(
    //                         iterator2.detection_price.at_home.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.re_detection;
    //                 else
    //                   iterator2.at_home_price.re_detection =
    //                     iterator2.detection_price.re_detection +
    //                     site.toNumber(iterator2.detection_price.at_home.price);
    //               }
    //               if (iterator2.detection_price.consultation) {
    //                 if (iterator2.detection_price.at_home.type == "percent")
    //                   iterator2.at_home_price.consultation =
    //                     (iterator2.detection_price.consultation *
    //                       site.toNumber(
    //                         iterator2.detection_price.at_home.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.consultation;
    //                 else
    //                   iterator2.at_home_price.consultation =
    //                     iterator2.detection_price.consultation +
    //                     site.toNumber(iterator2.detection_price.at_home.price);
    //               }
    //               if (iterator2.detection_price.session) {
    //                 if (iterator2.detection_price.at_home.type == "percent")
    //                   iterator2.at_home_price.session =
    //                     (iterator2.detection_price.session *
    //                       site.toNumber(
    //                         iterator2.detection_price.at_home.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.session;
    //                 else
    //                   iterator2.at_home_price.session =
    //                     iterator2.detection_price.session +
    //                     site.toNumber(iterator2.detection_price.at_home.price);
    //               }
    //             }

    //             if (iterator2.detection_price.urgent_visit) {
    //               if (iterator2.detection_price.detection) {
    //                 if (
    //                   iterator2.detection_price.urgent_visit.type == "percent"
    //                 )
    //                   iterator2.urgent_visit_price.detection =
    //                     (iterator2.detection_price.detection *
    //                       site.toNumber(
    //                         iterator2.detection_price.urgent_visit.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.detection;
    //                 else
    //                   iterator2.urgent_visit_price.detection =
    //                     iterator2.detection_price.detection +
    //                     site.toNumber(
    //                       iterator2.detection_price.urgent_visit.price
    //                     );
    //               }
    //               if (iterator2.detection_price.re_detection) {
    //                 if (
    //                   iterator2.detection_price.urgent_visit.type == "percent"
    //                 )
    //                   iterator2.urgent_visit_price.re_detection =
    //                     (iterator2.detection_price.re_detection *
    //                       site.toNumber(
    //                         iterator2.detection_price.urgent_visit.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.re_detection;
    //                 else
    //                   iterator2.urgent_visit_price.re_detection =
    //                     iterator2.detection_price.re_detection +
    //                     site.toNumber(
    //                       iterator2.detection_price.urgent_visit.price
    //                     );
    //               }
    //               if (iterator2.detection_price.consultation) {
    //                 if (
    //                   iterator2.detection_price.urgent_visit.type == "percent"
    //                 )
    //                   iterator2.urgent_visit_price.consultation =
    //                     (iterator2.detection_price.consultation *
    //                       site.toNumber(
    //                         iterator2.detection_price.urgent_visit.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.consultation;
    //                 else
    //                   iterator2.urgent_visit_price.consultation =
    //                     iterator2.detection_price.consultation +
    //                     site.toNumber(
    //                       iterator2.detection_price.urgent_visit.price
    //                     );
    //               }
    //               if (iterator2.detection_price.session) {
    //                 if (
    //                   iterator2.detection_price.urgent_visit.type == "percent"
    //                 )
    //                   iterator2.urgent_visit_price.session =
    //                     (iterator2.detection_price.session *
    //                       site.toNumber(
    //                         iterator2.detection_price.urgent_visit.price
    //                       )) /
    //                       100 +
    //                     iterator2.detection_price.session;
    //                 else
    //                   iterator2.urgent_visit_price.session =
    //                     iterator2.detection_price.session +
    //                     site.toNumber(
    //                       iterator2.detection_price.urgent_visit.price
    //                     );
    //               }
    //             }

    //             let prices = {
    //               at_clinic_price: iterator2.at_clinic_price,
    //               at_home_price: iterator2.at_home_price,
    //               online_price: iterator2.online_price,
    //               urgent_visit_price: iterator2.urgent_visit_price,
    //             };
    //           }
    //           if (iterator2.doctor && !iterator2.doctor.clinicId) {
    //             iterator2.doctor.clinicId = iterator.id;
    //           }
    //           xx.push(iterator2);
    //         }
    //       }
    //       if (xx) {
    //         const uniqueObjects = [
    //           ...new Set(xx.map((obj) => (obj.doctor ? obj.doctor.id : null))),
    //         ].map((doct) => {
    //           return xx.find((obj) =>
    //             obj.doctor ? obj.doctor.id : null === doct
    //           );
    //         });
    //         let duplicateObjects = xx.filter(
    //           (val) => !uniqueObjects.includes(val)
    //         );
    //         for (const iterator of uniqueObjects) {
    //           iterator.doctor.shiftList = new Array({
    //             shift: iterator.shift,
    //             clinicId: iterator.doctor ? iterator.doctor.clinicId : null,
    //           });

    //           arrrr.push(iterator);
    //           if (duplicateObjects.length > 0) {
    //             for (const iterator1 of duplicateObjects) {
    //               if (
    //                 iterator.doctor &&
    //                 iterator.doctor.id == iterator1.doctor &&
    //                 iterator1.doctor.id
    //               ) {
    //                 iterator.doctor.shiftList.push({
    //                   shift: iterator1.shift,
    //                   clinicId: iterator1.doctor
    //                     ? iterator1.doctor.clinicId
    //                     : null,
    //                 });
    //               }
    //             }
    //           }
    //         }
    //       }
    //       response.done = true;
    //       (response.list = xx),
    //         (response.count = count),
    //         (response.totalPages = Math.ceil(count / 10)),
    //         res.json(response);
    //     } else {
    //       response.done = false;
    //       (response.list = []),
    //         (response.count = count),
    //         (response.totalPages = Math.ceil(count / 10)),
    //         res.json(response);
    //     }
    //     // res.json(response)
    //   }
    // );
  });
};