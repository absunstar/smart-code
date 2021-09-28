module.exports = function init(site) {
  const $clinics = site.connectCollection("clinics");
  const $doctors = site.connectCollection("hr_employee_list")

  site.on("[hospital][clinic][add]", function (obj) {
    doctor = obj;
    $clinics.findOne({
        "hospital.user_info.id": obj.add_user_info.id,
      },
      (err, doc) => {
        doc.doctor_list.push({
          doctor
        });
        if (!err && doc) {
          $clinics.update(doc);
        }
      }
    );
  });

  site.on("[hospital][clinic][update]", function (obj) {
    $clinics.findOne({
        "hospital.user_info.id": obj.add_user_info.id,
        "specialty.id": obj.specialty.id,
      },
      (err, doc) => {
        doc.doctor_list.forEach((d) => {
          if (d.doctor && d.doctor.id == obj.id) {
            d.doctor = obj;
            if (!err && doc) {
              $clinics.update(doc);
            }
          }
        });
      }
    );
  });

  site.on("[register][clinic][add]", (doc, callback) => {
    (doc.active = true),
    (doc.shift_list = [{
      times_list: [{}],
    }, ]),
    (doc.doctor_list = [{}]),
    (doc.nurse_list = [{}]);
    $clinics.add(doc, (err, doc) => {
      callback(err, doc);
    });
  });

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "clinics",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.post({
    name: "/api/days/all",
    path: __dirname + "/site_files/json/days.json",
  });

  site.post("/api/clinics/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let clinics_doc = req.body;
    clinics_doc.$req = req;
    clinics_doc.$res = res;
    clinics_doc.company = site.get_company(req);
    clinics_doc.branch = site.get_branch(req);

    clinics_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof clinics_doc.active === "undefined") {
      clinics_doc.active = true;
    }
    $clinics.find({
        where: {
          "company.id": site.get_company(req).id,
          "branch.code": site.get_branch(req).code,
          $or: [{
              name_ar: clinics_doc.name_ar,
            },
            {
              name_en: clinics_doc.name_en,
            }
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = "Name Exists";
          res.json(response);
        } else {
          let num_obj = {
            company: site.get_company(req),
            screen: "clinics",
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!clinics_doc.code && !cb.auto) {
            response.error = "Must Enter Code";
            res.json(response);
            return;
          } else if (cb.auto) {
            clinics_doc.code = cb.code;
          }

          let user = {
            name_ar: clinics_doc.name_ar,
            name_en: clinics_doc.name_en,
            mobile: clinics_doc.mobile,
            username: clinics_doc.username,
            email: clinics_doc.username,
            password: clinics_doc.password,
            image_url: clinics_doc.image_url,
            type: "clinic",
          };

          user.roles = [{
            name: "clinics_admin",
          }, ];

          user.profile = {
            name_ar: user.name_ar,
            name_en: user.name_en,
            mobile: user.mobile,
            image_url: user.image_url,
          };

          $clinics.add(clinics_doc, (err, doc) => {
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
                    $clinics.edit(doc, (err1, doc1) => {
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
        }
      }
    );
  });

  site.post("/api/clinics/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let clinics_doc = req.body;
    user = {
      name_ar: clinics_doc.name_ar,
      name_en: clinics_doc.name_en,
      mobile: clinics_doc.mobile,
      username: clinics_doc.username,
      email: clinics_doc.username,
      password: clinics_doc.password,
      image_url: clinics_doc.image_url,
      type: "clinic",
    };

    user.roles = [{
      name: "clinics_admin",
    }, ];

    user.profile = {
      name_ar: user.name_ar,
      name_en: user.name_en,
      mobile: user.mobile,
      image_url: user.image_url,
    };
    user.ref_info = {
      id: clinics_doc.id,
    };
    clinics_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (clinics_doc.id) {
      $clinics.edit({
          where: {
            id: clinics_doc.id,
          },
          set: clinics_doc,
         
        },
        (err, doc) => {
          if (!err) {
            response.done = true;
            if (user.password && user.email) {
              site.security.addUser(user, (err, doc1) => {
                if (!err) {
                  delete user._id;
                  delete user.id;
                  doc.doc.user_info = {
                    id: doc1.id,
                  };
                  $clinics.edit(doc.doc, (err2, doc2) => {
                    res.json(response);
                  });
                } else {
                  response.error = err.message;
                }
                res.json(response);
              });
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

  site.post("/api/clinics/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $clinics.findOne({
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

  site.post("/api/clinics/delete", (req, res) => {
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
      $clinics.delete({
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

  site.post("/api/clinics/all", (req, res) => {
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
        name_ar: new RegExp(search, "i"),
      });

      where.$or.push({
        name_en: new RegExp(search, "i"),
      });
    }

    if (where["specialty"] && where["specialty"].id) {
      where["specialty.id"] = where["specialty"].id;
      delete where["specialty"];
      delete where.active;
    } else {
      delete where["specialty"];
    }

    if (where["doctor"] && where["doctor"].id) {
      where["doctor_list.doctor.id"] = where["doctor"].id;
      delete where["doctor"];
      delete where.active;
    } else {
      delete where["doctor_list"];
      delete where["doctor"];
    }

    if (where["clinic"] && where["clinic"].id) {
      where["id"] = where["clinic"].id;
      delete where["clinic"];
      delete where.active;
    } else {
      delete where["id"];
      delete where["clinic"];
    }

    if (where["hospital.address"]) {
      where["hospital.address"] = new RegExp(where["hospital.address"], "i");
    }

    if (where["name"]) {
      where["name"] = new RegExp(where["name"], "i");
    } else {
      delete where["name"];
    }

    if (where["specialty.id"] === 0) {
      delete where["specialty.id"];
    }

    where["company.id"] = site.get_company(req).id;
    where["branch.code"] = site.get_branch(req).code;

    if (req.session.user && req.session.user.type === "clinic") {
      where["id"] = req.session.user.ref_info.id;
    }

    $clinics.findMany({
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

  site.post("/api/clinics/doctors", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where["hospital"]) {
      where["hospital.id"] = where["hospital"].id;
      delete where["hospital"];
    }

    if (where["specialty"]) {
      where["specialty.id"] = where["specialty"].id;
      delete where["specialty"];
      delete where.active;
    }

    if (where["hospital.address"]) {
      where["hospital.address"] = new RegExp(where["hospital.address"], "i");
    }

    if (where["name"]) {
      where["name"] = new RegExp(where["name"], "i");
    } else {
      delete where["name"];
    }

    if (req.session.user && req.session.user.type === "clinic") {
      where["id"] = req.session.user.ref_info.id;
    }

    $clinics.findOne({
        select: "doctor_list",
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

  site.post("/api/clinics/getDoctorsList", (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.error = site.word('loginFirst')[req.headers.language];
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    if (where["company"]) {
      where["company.id"] = where["company"].id;
      delete where["company"];
    };

    if (where["specialty"]) {
      where["specialty.id"] = where["specialty"].id;
      delete where["specialty"];
      delete where.active;
    }
    if (where["clinic"]) {
      where["clinic.id"] = where["clinic"].id;
      delete where["clinic"];
      delete where.active;
    }
    let company = where["company.id"];
    let specialty = where["specialty.id"];
    let clinic = where["clinic.id"];

    $clinics.aggregate(
      [{
          "$match": {
            "company.id": company,
            "specialty.id": specialty,
            id: clinic
          }
        },
        {
          "$project": {
            "doctor_list": 1.0
          }
        }
      ],
      (err, docs) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = docs.length;
        } else {
          response.error = err.message;
        }
        res.json(response);
      },
    );

  });


  site.post("/api/clinics/getDoctorAppointment", (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'
    if (!req.session.user) {
      response.error = site.word('loginFirst')[req.headers.language];
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    let doctor = where["doctor"].id;



    if (doctor != undefined) {
      $clinics.aggregate(
        [{
            "$match": {
              "doctor_list.doctor.id": doctor
            }
          },
          {
            "$project": {
              name_ar: 1.0,
              name_en: 1.0,
              'doctor.name_ar': 1,
              'doctor.name_en': 1,
              'doctor.image_url': 1,

              "doctor_list": 1.0
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
            "$addFields": {
              "appointmentsList": "$doctor_list.shift.times_list"
            }
          },
          {
            "$project": {
              name_ar: 1.0,
              name_en: 1.0,
              'doctor.name_ar': 1,
              'doctor.name_en': 1,
              'doctor.image_url': 1,
              "appointmentsList": 1.0
            }
          }
        ],
        (err, docs) => {
          if (!err && docs) {
            response.done = true;
            response.list = docs;
            response.count = docs.length;
          } else {
            response.error = err.message;
          }
          res.json(response);
        },
      );
    } else {
      response.error = "no doctor found";
      res.json(response);
      return
    }


  });



  site.post("/api/clinics/getDoctorClinicPrices", (req, res) => {
    let response = {
      done: false,
    };
    req.headers.language = req.headers.language || 'en'

    if (!req.session.user) {
      response.error = site.word('loginFirst')[req.headers.language];
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    let doctor = where["doctor"].id;



    if (doctor != undefined) {
      $clinics.aggregate(
        [{
            "$match": {
              "doctor_list.doctor.id": doctor
            }
          },
          {
            "$project": {
              name_ar: 1.0,
              name_en: 1.0,
              
              "doctor_list": 1.0
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
            "$project": {
              name_ar: 1.0,
              name_en: 1.0,
              'doctor_list.doctor': 1,
              "doctor_list.detection_price": 1.0
            }
          }
        ],
        (err, docs) => {
          if (!err && docs) {
            response.done = true;
            docs.forEach(_doc => {

              if (_doc.doctor_list.detection_price) {
                _doc.doctor_list.online_price = {}
                _doc.doctor_list.at_home_price = {}
                _doc.doctor_list.urgent_visit_price = {}
                
                _doc.doctor_list.at_clinic_price = {
                  detection: _doc.doctor_list.detection_price.detection,
                  re_detection: _doc.doctor_list.detection_price.re_detection,
                  consultation: _doc.doctor_list.detection_price.consultation,
                  session: _doc.doctor_list.detection_price.session,
                }

                if (_doc.doctor_list.detection_price.online) {
                  if (_doc.doctor_list.detection_price.detection) {

                    if (_doc.doctor_list.detection_price.online.type == "percent")
                      _doc.doctor_list.online_price.detection =
                      ((_doc.doctor_list.detection_price.detection * site.toNumber(_doc.doctor_list.detection_price.online.price)) /
                        100) + _doc.doctor_list.detection_price.detection;
                    else _doc.doctor_list.online_price.detection = _doc.doctor_list.detection_price.detection + site.toNumber(_doc.doctor_list.detection_price.online.price);
                  }
                  if (_doc.doctor_list.detection_price.re_detection) {

                    if (_doc.doctor_list.detection_price.online.type == "percent")
                      _doc.doctor_list.online_price.re_detection =
                      ((_doc.doctor_list.detection_price.re_detection * site.toNumber(_doc.doctor_list.detection_price.online.price)) /
                        100) + _doc.doctor_list.detection_price.re_detection;
                    else _doc.doctor_list.online_price.re_detection = _doc.doctor_list.detection_price.re_detection + site.toNumber(_doc.doctor_list.detection_price.online.price);
                  }
                  if (_doc.doctor_list.detection_price.consultation) {

                    if (_doc.doctor_list.detection_price.online.type == "percent")
                      _doc.doctor_list.online_price.consultation =
                      ((_doc.doctor_list.detection_price.consultation * site.toNumber(_doc.doctor_list.detection_price.online.price)) /
                        100) + _doc.doctor_list.detection_price.consultation;
                    else _doc.doctor_list.online_price.consultation = _doc.doctor_list.detection_price.consultation + site.toNumber(_doc.doctor_list.detection_price.online.price);
                  }
                  if (_doc.doctor_list.detection_price.session) {

                    if (_doc.doctor_list.detection_price.online.type == "percent")
                      _doc.doctor_list.online_price.session =
                      ((_doc.doctor_list.detection_price.session * site.toNumber(_doc.doctor_list.detection_price.online.price)) /
                        100) + _doc.doctor_list.detection_price.session;
                    else _doc.doctor_list.online_price.session = _doc.doctor_list.detection_price.session + site.toNumber(_doc.doctor_list.detection_price.online.price);
                  }
                }

                if (_doc.doctor_list.detection_price.at_home) {
                  if (_doc.doctor_list.detection_price.detection) {

                    if (_doc.doctor_list.detection_price.at_home.type == "percent")
                      _doc.doctor_list.at_home_price.detection =
                      ((_doc.doctor_list.detection_price.detection * site.toNumber(_doc.doctor_list.detection_price.at_home.price)) /
                        100) + _doc.doctor_list.detection_price.detection;
                    else _doc.doctor_list.at_home_price.detection = _doc.doctor_list.detection_price.detection + site.toNumber(_doc.doctor_list.detection_price.at_home.price);
                  }
                  if (_doc.doctor_list.detection_price.re_detection) {

                    if (_doc.doctor_list.detection_price.at_home.type == "percent")
                      _doc.doctor_list.at_home_price.re_detection =
                      ((_doc.doctor_list.detection_price.re_detection * site.toNumber(_doc.doctor_list.detection_price.at_home.price)) /
                        100) + _doc.doctor_list.detection_price.re_detection;
                    else _doc.doctor_list.at_home_price.re_detection = _doc.doctor_list.detection_price.re_detection + site.toNumber(_doc.doctor_list.detection_price.at_home.price);
                  }
                  if (_doc.doctor_list.detection_price.consultation) {

                    if (_doc.doctor_list.detection_price.at_home.type == "percent")
                      _doc.doctor_list.at_home_price.consultation =
                      ((_doc.doctor_list.detection_price.consultation * site.toNumber(_doc.doctor_list.detection_price.at_home.price)) /
                        100) + _doc.doctor_list.detection_price.consultation;
                    else _doc.doctor_list.at_home_price.consultation = _doc.doctor_list.detection_price.consultation + site.toNumber(_doc.doctor_list.detection_price.at_home.price);
                  }
                  if (_doc.doctor_list.detection_price.session) {

                    if (_doc.doctor_list.detection_price.at_home.type == "percent")
                      _doc.doctor_list.at_home_price.session =
                      ((_doc.doctor_list.detection_price.session * site.toNumber(_doc.doctor_list.detection_price.at_home.price)) /
                        100) + _doc.doctor_list.detection_price.session;
                    else _doc.doctor_list.at_home_price.session = _doc.doctor_list.detection_price.session + site.toNumber(_doc.doctor_list.detection_price.at_home.price);
                  }
                }


                if (_doc.doctor_list.detection_price.urgent_visit) {
                  if (_doc.doctor_list.detection_price.detection) {

                    if (_doc.doctor_list.detection_price.urgent_visit.type == "percent")
                      _doc.doctor_list.urgent_visit_price.detection =
                      ((_doc.doctor_list.detection_price.detection * site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price)) /
                        100) + _doc.doctor_list.detection_price.detection;
                    else _doc.doctor_list.urgent_visit_price.detection = _doc.doctor_list.detection_price.detection + site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price);
                  }
                  if (_doc.doctor_list.detection_price.re_detection) {

                    if (_doc.doctor_list.detection_price.urgent_visit.type == "percent")
                      _doc.doctor_list.urgent_visit_price.re_detection =
                      ((_doc.doctor_list.detection_price.re_detection * site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price)) /
                        100) + _doc.doctor_list.detection_price.re_detection;
                    else _doc.doctor_list.urgent_visit_price.re_detection = _doc.doctor_list.detection_price.re_detection + site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price);
                  }
                  if (_doc.doctor_list.detection_price.consultation) {

                    if (_doc.doctor_list.detection_price.urgent_visit.type == "percent")
                      _doc.doctor_list.urgent_visit_price.consultation =
                      ((_doc.doctor_list.detection_price.consultation * site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price)) /
                        100) + _doc.doctor_list.detection_price.consultation;
                    else _doc.doctor_list.urgent_visit_price.consultation = _doc.doctor_list.detection_price.consultation + site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price);
                  }
                  if (_doc.doctor_list.detection_price.session) {

                    if (_doc.doctor_list.detection_price.urgent_visit.type == "percent")
                      _doc.doctor_list.urgent_visit_price.session =
                      ((_doc.doctor_list.detection_price.session * site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price)) /
                        100) + _doc.doctor_list.detection_price.session;
                    else _doc.doctor_list.urgent_visit_price.session = _doc.doctor_list.detection_price.session + site.toNumber(_doc.doctor_list.detection_price.urgent_visit.price);
                  }
                }

              
              }
            });


            response.list = docs;
            response.count = docs.length;



            $doctors.findOne(
              {
                where: {
                  id: doctor,
                },
              },
              (err, doc) => {
                if (doc) {
                 doc.priceList = docs || []
                 
                  $doctors.update(doc, (err, result) => {
                   
                  });
                }
              },
            );






          } else {
            response.error = err.message;
          }
          res.json(response);
        },
      );
    } else {
      response.error = "no doctor found";
      res.json(response);
      return
    }


  });




  site.post("/api/clinics/shifts/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    // where['id'] = req.data['clinic.id']
    $clinics.findOne({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, doc, count) => {
        if (!err) {
          response.done = true;
          let shift = {};
          doc.shift_list.forEach((info) => {
            if (info.id == req.body["shiftId"]) {
              shift = info;
            }
          });

          response.shift = shift;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};