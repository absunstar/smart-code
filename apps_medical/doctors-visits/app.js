module.exports = function init(site) {
  const $doctors_visits = site.connectCollection("doctors_visits");
  const $customer = site.connectCollection("customers");
  const $doctors = site.connectCollection("hr_employee_list")
  const {
    RtcTokenBuilder,
    RtcRole
  } = require('agora-access-token');


  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.post({
    name: "/api/status/all",
    path: __dirname + "/site_files/json/status.json",
  });

  site.post({
    name: "/api/result_visit/all",
    path: __dirname + "/site_files/json/result_visit.json",
  });

  site.post({
    name: "/api/visit_type/all",
    path: __dirname + "/site_files/json/visit_type.json",
  });

  site.post({
    name: "/api/place_examination/all",
    path: __dirname + "/site_files/json/place_examination.json",
  });

  site.get({
    name: "doctors_visits",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false,
  });

  site.post("/api/doctors_visits/add", (req, res) => {
    let response = {
      done: false,
    };
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let doctors_visits_doc = req.body;
    doctors_visits_doc.$req = req;
    doctors_visits_doc.$res = res;

    if (!doctors_visits_doc.selected_time) {
      response.error = "must selected time";
      res.json(response);
      return;
    }

    doctors_visits_doc.company = site.get_company(req);
    doctors_visits_doc.branch = site.get_branch(req);

    doctors_visits_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof doctors_visits_doc.active === "undefined") {
      doctors_visits_doc.active = true;
    }

    if (doctors_visits_doc.company_code) {
      doctors_visits_doc.company_codes = [doctors_visits_doc.company_code];
      delete doctors_visits_doc.company_code;
    }

    let num_obj = {
      company: site.get_company(req),
      screen: "doctors_visits",
      date: doctors_visits_doc.date,
    };

    let cb = site.getNumbering(num_obj);
    if (!doctors_visits_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      doctors_visits_doc.code = cb.code;
    }

    let whereObj = {
      date: new Date(doctors_visits_doc.date),
      "selected_clinic.id": doctors_visits_doc.selected_clinic.id,
      "selected_doctor.id": doctors_visits_doc.selected_doctor.id,
      "selected_time.day.id": doctors_visits_doc.selected_time.day.id,
      "selected_time.from.hour": doctors_visits_doc.selected_time.from.hour,
      "selected_time.to.hour": doctors_visits_doc.selected_time.to.hour,
    };

    if (whereObj.date) {
      let d1 = site.toDate(whereObj.date);
      let d2 = site.toDate(whereObj.date);
      d2.setDate(d2.getDate() + 1);
      whereObj.date = {
        $gte: d1,
        $lt: d2,
      };
    }

    $doctors_visits.findMany(
      {
        where: whereObj,
      },
      (err, docs, count) => {
        if (!err) {
          doctors_visits_doc.visit_number = count + 1;

          site.getPatientTicket(doctors_visits_doc.customer, (callBackGet) => {
            if (!callBackGet) {
              site.addPatientTicket(doctors_visits_doc, (callBackAdd) => {
                doctors_visits_doc.patient_ticket_id = callBackAdd.id;

                $doctors_visits.add(doctors_visits_doc, (err, doc) => {
                  if (!err) {
                    response.done = true;
                    response.doc = doc;
                  } else {
                    response.error = err.message;
                  }
                  res.json(response);
                });
              });
            } else {
              if (callBackGet.status && callBackGet.status.id === 2) {
                response.error = "holding ticket for this patient";
                res.json(response);
                return;
              }

              doctors_visits_doc.patient_ticket_id = callBackGet.id;

              $doctors_visits.add(doctors_visits_doc, (err, doc) => {
                if (!err) {
                  response.done = true;
                  response.doc = doc;
                } else {
                  response.error = err.message;
                }
                res.json(response);
              });
            }
          });
        }
      }
    );
  });

  site.post("/api/doctors_visits/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let doctors_visits_doc = req.body;

    doctors_visits_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (doctors_visits_doc.id) {
      $doctors_visits.edit(
        {
          where: {
            id: doctors_visits_doc.id,
          },
          set: doctors_visits_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
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

  site.post("/api/doctors_visits/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $doctors_visits.findOne(
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

  site.post("/api/doctors_visits/delete", (req, res) => {
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
      $doctors_visits.delete(
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
      response.error = "no id";
      res.json(response);
    }
  });

  site.post(
    "/api/doctors_visits/update_generate_doctors_visits",
    (req, res) => {
      let response = {
        done: false,
      };

      if (!req.session.user) {
        response.error = "Please Login First";
        res.json(response);
        return;
      }

      let doctors_visits_doc = req.body;

      doctors_visits_doc.$req = req;
      doctors_visits_doc.$res = res;

      doctors_visits_doc.add_user_info = site.security.getUserFinger({
        $req: req,
        $res: res,
      });

      if (typeof doctors_visits_doc.active === "undefined") {
        doctors_visits_doc.active = true;
      }

      if (doctors_visits_doc.company_code) {
        doctors_visits_doc.company_codes = [doctors_visits_doc.company_code];
        delete doctors_visits_doc.company_code;
      }

      doctors_visits_doc.selected_doctor = doctors_visits_doc.doctor;
      doctors_visits_doc.selected_clinic = doctors_visits_doc.clinic;
      doctors_visits_doc.selected_specialty =
        doctors_visits_doc.doctor.specialty;
      doctors_visits_doc.selected_hospital = doctors_visits_doc.hospital;
      doctors_visits_doc.selected_shift = doctors_visits_doc.shift;

      let search = {};
      search["selected_hospital.id"] = doctors_visits_doc.hospital.id;
      search["selected_clinic.id"] = doctors_visits_doc.clinic.id;
      search["selected_doctor.id"] = doctors_visits_doc.doctor.id;
      search["status.id"] = 5;

      $doctors_visits.deleteMany(search, (err, result) => {
        if (!err) {
          response.done = true;

          let find_search = {};

          find_search["selected_hospital.id"] = doctors_visits_doc.hospital.id;
          find_search["selected_clinic.id"] = doctors_visits_doc.clinic.id;
          find_search["selected_doctor.id"] = doctors_visits_doc.doctor.id;
          find_search["status.id"] = { $ne: 5 };

          $doctors_visits.findMany(
            {
              where: find_search,
              sort: { date: -1 },
              limit: 1,
            },
            (err, doc_last_doctors_visits) => {
              if (!err) {
                response.done = true;
                response.list = doc_last_doctors_visits;

                if (doc_last_doctors_visits[0]) {
                  let last = new Date(doc_last_doctors_visits[0].date);

                  doctors_visits_doc.date = new Date(
                    last.setDate(last.getDate() + 1)
                  );
                } else {
                  doctors_visits_doc.date = new Date();
                }

                for (
                  let i = 0;
                  i < doctors_visits_doc.period_doctors_visits;
                  i++
                ) {
                  let new_doctors_visits = {
                    date: doctors_visits_doc.date,
                    selected_shift: doctors_visits_doc.selected_shift,
                    selected_doctor: doctors_visits_doc.selected_doctor,
                    active: doctors_visits_doc.active,
                    selected_clinic: doctors_visits_doc.selected_clinic,
                    selected_specialty: doctors_visits_doc.selected_specialty,
                    selected_hospital: doctors_visits_doc.selected_hospital,
                  };

                  new_doctors_visits.date.setDate(
                    new_doctors_visits.date.getDate() + 1
                  );

                  doctors_visits_doc.selected_shift.times_list.forEach(
                    (_shift) => {
                      let start_hour = _shift.from.hour;
                      let start_minute = _shift.from.minute;

                      let end_hour = _shift.to.hour;
                      let end_minute = _shift.to.minute;

                      while (
                        new_doctors_visits.date.getDay() !== _shift.day.code
                      ) {
                        new_doctors_visits.date.setDate(
                          new_doctors_visits.date.getDate() + 1
                        );
                      }

                      let total_hour_minutes = (end_hour - start_hour) * 60;
                      let total_minutes = end_minute - start_minute;

                      total_minutes = total_hour_minutes + total_minutes;
                      let doctors_visits_count =
                        total_minutes /
                        doctors_visits_doc.selected_doctor.detection_Duration;

                      new_doctors_visits.selected_time = {
                        to: _shift.to,
                        from: _shift.from,
                        day: _shift.day,
                      };

                      for (let i = 0; i < doctors_visits_count; i++) {
                        let start_date = new Date(new_doctors_visits.date);
                        start_date.setHours(start_hour);
                        start_date.setMinutes(start_minute);

                        start_date.setMinutes(
                          start_date.getMinutes() +
                          i *
                          doctors_visits_doc.selected_doctor
                            .detection_Duration
                        );

                        let end_date = new Date(start_date);
                        end_date.setMinutes(
                          end_date.getMinutes() +
                          doctors_visits_doc.selected_doctor
                            .detection_Duration
                        );

                        $doctors_visits.add(
                          {
                            date: start_date,
                            code: $doctors_visits.newCode(
                              new_doctors_visits.selected_hospital.id
                            ),
                            selected_time: {
                              day: new_doctors_visits.selected_time.day,
                              from: {
                                date: start_date,
                                hour: start_date.getHours(),
                                minute: start_date.getMinutes(),
                              },
                              to: {
                                date: end_date,
                                hour: end_date.getHours(),
                                minute: end_date.getMinutes(),
                              },
                            },
                            selected_shift: new_doctors_visits.selected_shift,
                            selected_doctor: new_doctors_visits.selected_doctor,
                            selected_clinic: new_doctors_visits.selected_clinic,
                            selected_specialty:
                              new_doctors_visits.selected_specialty,
                            selected_hospital:
                              new_doctors_visits.selected_hospital,
                            active: new_doctors_visits.active,
                            status: {
                              id: 5,
                              name: "dont_book",
                              name_en: "Do Not Booking",
                              ar: "لم يتم الحجز",
                            },
                          },
                          (err, doc) => {
                            if (!err) {
                              response.done = true;
                              response.doc = doc;
                            } else {
                              response.error = err.message;
                            }
                            setTimeout(() => {
                              res.json(response);
                            }, 200);
                          }
                        );
                      }
                    }
                  );
                }
              }
            }
          );
        } else {
          response.error = err.message;
        }
      });
    }
  );

  site.post("/api/doctors_visits/generate_doctors_visits", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let doctors_visits_doc = req.body;

    doctors_visits_doc.$req = req;
    doctors_visits_doc.$res = res;

    doctors_visits_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof doctors_visits_doc.active === "undefined") {
      doctors_visits_doc.active = true;
    }

    if (doctors_visits_doc.company_code) {
      doctors_visits_doc.company_codes = [doctors_visits_doc.company_code];
      delete doctors_visits_doc.company_code;
    }

    doctors_visits_doc.selected_doctor = doctors_visits_doc.doctor;
    doctors_visits_doc.selected_clinic = doctors_visits_doc.clinic;
    doctors_visits_doc.selected_specialty = doctors_visits_doc.doctor.specialty;
    doctors_visits_doc.selected_hospital = doctors_visits_doc.hospital;
    doctors_visits_doc.selected_shift = doctors_visits_doc.shift;

    let search = {};

    search["selected_hospital.id"] = doctors_visits_doc.hospital.id;
    search["selected_clinic.id"] = doctors_visits_doc.clinic.id;
    search["selected_doctor.id"] = doctors_visits_doc.doctor.id;

    $doctors_visits.findMany(
      {
        where: search,
        sort: { date: -1 },
        limit: 1,
      },
      (err, doc_last_doctors_visits) => {
        if (!err) {
          response.done = true;
          response.list = doc_last_doctors_visits;

          if (doc_last_doctors_visits[0]) {
            let last = new Date(doc_last_doctors_visits[0].date);

            doctors_visits_doc.date = new Date(
              last.setDate(last.getDate() + 1)
            );
          } else {
            doctors_visits_doc.date = new Date();
          }

          for (let i = 0; i < doctors_visits_doc.period_doctors_visits; i++) {
            let new_doctors_visits = {
              date: doctors_visits_doc.date,
              selected_shift: doctors_visits_doc.selected_shift,
              selected_doctor: doctors_visits_doc.selected_doctor,
              active: doctors_visits_doc.active,
              selected_clinic: doctors_visits_doc.selected_clinic,
              selected_specialty: doctors_visits_doc.selected_specialty,
              selected_hospital: doctors_visits_doc.selected_hospital,
            };

            new_doctors_visits.date.setDate(
              new_doctors_visits.date.getDate() + 1
            );

            doctors_visits_doc.selected_shift.times_list.forEach((_shift) => {
              let start_hour = _shift.from.hour;
              let start_minute = _shift.from.minute;

              let end_hour = _shift.to.hour;
              let end_minute = _shift.to.minute;

              while (new_doctors_visits.date.getDay() !== _shift.day.code) {
                new_doctors_visits.date.setDate(
                  new_doctors_visits.date.getDate() + 1
                );
              }

              let total_hour_minutes = (end_hour - start_hour) * 60;
              let total_minutes = end_minute - start_minute;

              total_minutes = total_hour_minutes + total_minutes;
              let doctors_visits_count =
                total_minutes /
                doctors_visits_doc.selected_doctor.detection_Duration;

              new_doctors_visits.selected_time = {
                to: _shift.to,
                from: _shift.from,
                day: _shift.day,
              };

              for (let i = 0; i < doctors_visits_count; i++) {
                let start_date = new Date(new_doctors_visits.date);
                start_date.setHours(start_hour);
                start_date.setMinutes(start_minute);

                start_date.setMinutes(
                  start_date.getMinutes() +
                  i * doctors_visits_doc.selected_doctor.detection_Duration
                );

                let end_date = new Date(start_date);
                end_date.setMinutes(
                  end_date.getMinutes() +
                  doctors_visits_doc.selected_doctor.detection_Duration
                );

                $doctors_visits.add(
                  {
                    date: start_date,
                    code: $doctors_visits.newCode(
                      new_doctors_visits.selected_hospital.id
                    ),
                    selected_time: {
                      day: new_doctors_visits.selected_time.day,
                      from: {
                        date: start_date,
                        hour: start_date.getHours(),
                        minute: start_date.getMinutes(),
                      },
                      to: {
                        date: end_date,
                        hour: end_date.getHours(),
                        minute: end_date.getMinutes(),
                      },
                    },
                    selected_shift: new_doctors_visits.selected_shift,
                    selected_doctor: new_doctors_visits.selected_doctor,
                    selected_clinic: new_doctors_visits.selected_clinic,
                    selected_specialty: new_doctors_visits.selected_specialty,
                    selected_hospital: new_doctors_visits.selected_hospital,
                    active: new_doctors_visits.active,
                    status: {
                      id: 5,
                      name: "dont_book",
                      name_en: "Do Not Booking",
                      ar: "لم يتم الحجز",
                    },
                  },
                  (err, doc) => {
                    if (!err) {
                      response.done = true;
                      response.doc = doc;
                    } else {
                      response.error = err.message;
                    }
                    setTimeout(() => {
                      res.json(response);
                    }, 200);
                  }
                );
              }
            });
          }
        }
      }
    );
  });

  site.post("/api/doctors_visits/all", (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (where["specialty"]) {
      where["selected_specialty.id"] = where["specialty"].id;
      delete where["specialty"];
      delete where.active;
    }

    if (where["status.id"]) {
      where["status.id"] = where["status.id"];
    }

    if (where["customer.id"]) {
      where["customer.id"] = parseInt(where["customer.id"]);
    }

    if (where["address"]) {
      where["address"] = new RegExp(where["address"], "i");
    }
    if (where.date) {
      let d1 = site.toDate(where.date);
      let d2 = site.toDate(where.date);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from);
      let d2 = site.toDate(where.date_to);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
      delete where.date_from;
      delete where.date_to;
    }

    if (where["specialty"]) {
      where["selected_specialty.id"] = where["specialty"].id;
      delete where["specialty"];
    }

    if (where["doctor"]) {
      where["selected_doctor.id"] = where["doctor"].id;
      delete where["doctor"];
    }

    if (where["clinic"]) {
      where["selected_clinic.id"] = where["clinic"].id;
      delete where["clinic"];
    }

    if (where["status"]) {
      where["status.id"] = where["status"].id;
      delete where["status"];
    }

    if (where["customer"]) {
      where["customer.id"] = where["customer"].id;
      delete where["customer"];
    }

    where["company.id"] = site.get_company(req).id;
    where["branch.code"] = site.get_branch(req).code;

    $doctors_visits.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          date: -1,
        },
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

  site.getVisitsCount = function (whereObj) {
    let where = whereObj || {};

    if (where.date) {
      let d1 = site.toDate(where.date);
      let d2 = site.toDate(where.date);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
    }

    if (where["selected_clinic"]) {
      where["selected_clinic.id"] = where["selected_clinic"].id;
      delete where["selected_clinic"];
    }

    if (where["selected_doctor"]) {
      where["selected_doctor.id"] = where["selected_doctor"].id;
      delete where["selected_doctor"];
    }

    $doctors_visits.findMany(
      {
        where: where,
        sort: { id: -1 },
      },
      (err, docs, count) => {
        if (!err) {
          whereObj.count = count;
        }
      }
    );

    return whereObj;
  };

  site.getDoctorsVisits = function (where, callback) {
    callback = callback || {};

    if (where.search) {
      where.$or = [];
      where.$or.push(
        {
          "customer.name_ar": site.get_RegExp(where.search, "i"),
        },
        {
          "customer.name_en": site.get_RegExp(where.search, "i"),
        }
      );
      delete where.search;
    }
    
    
    if (where["customer"]) {
      where["customer.id"] = where["customer"].id;
      delete where["customer"];
    }
    if (where["id"]) {
      where["patient_ticket_id"] = where["id"];
      delete where["id"];
    }

    $doctors_visits.findMany(
      {
        where: where,
      },
      (err, docs) => {
        if (!err && docs) callback(docs);
        else callback(false);
      }
    );
  };


  /* ATM APIS */

  site.post("/api/dates/day", (req, res) => {
    let response = {};
    req.headers.language = req.headers.language || "en";
    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    let day = req.body.day || {};

    let nD = new Date();
    if (day.code > nD.getDay()) {
      nD.setTime(nD.getTime() + (day.code - nD.getDay()) * 24 * 60 * 60 * 1000);
    } else if (day.code < nD.getDay()) {
      nD.setTime(nD.getTime() + ((7 - nD.getDay()) + day.code) * 24 * 60 * 60 * 1000);
    }

    let fD = new Date(nD);
    let datesList = [fD];

    for (let i = 0; i < 12; i++) {
      nD.setTime(nD.getTime() + 7 * 24 * 60 * 60 * 1000);
      let d = new Date(nD);
      datesList.push(d);
    }

    response.done = true;
    response.list = datesList;
    res.json(response);
  });


    // RTC Token

    site.post("/api/doctors_visits/rtctoken", (req, res) => {
      let response = {}
      let agora_doc = req.body
  
      const APP_ID = agora_doc.APP_ID;
      const APP_CERTIFICATE = agora_doc.APP_CERTIFICATE;
      
      const channelName = String(new Date().getTime());
      if (!channelName) {
        return res.status(500).json({
          'error': 'channel is required'
        });
      }
      // get uid 
      let uid = req.query.uid;
      if (!uid || uid == '') {
        uid = 0;
      }
      // get role
      let role = RtcRole.SUBSCRIBER;
      if (req.query.role == 'publisher') {
        role = RtcRole.PUBLISHER;
      }
      // get the expire time
      let expireTime = req.query.expireTime;
      if (!expireTime || expireTime == '') {
        expireTime = 3600;
      } else {
        expireTime = parseInt(expireTime, 10);
      }
      // calculate privilege expire time
      const currentTime = Math.floor(Date.now() / 1000);
      const privilegeExpireTime = currentTime + expireTime;
      // build the token
       
      const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
      let obj = {
        done: true,
        
        data: {
          APP_ID :APP_ID,
          APP_CERTIFICATE : APP_CERTIFICATE,
          token: token,
          uid: uid,
          role : role,
          privilegeExpireTime : privilegeExpireTime,
          channel: channelName
        },
      }
      $doctors_visits.edit({
      where: {

        id: req.body.doctors_visits.id
      },
      set: {
        token: obj.data.token,
        channel: obj.data.channel,
        startConsultationTime: new Date()
      },
    })
    res.json(obj)
    
  
    })



  // my profile
  site.post("/api/doctors_visits/myProfile", (req, res) => {
    req.headers.language = req.headers.language || "en";
    let response = {};

    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;

    } else if (!req.session.user.ref_info) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    $doctors_visits.aggregate(
      [
        {
          $match: {
            "customer.id": req.session.user.ref_info.id,
          },
        },
        {
          $project: {
            visit_type: 1.0,
            selected_clinic: 1.0,
            selected_doctor: 1.0,
            date: 1.0,
            id: 1.0,
          },
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.doc = docs[0];

          res.json(response);
        } else {
          response.done = false;

          response.doc = {};
          res.json(response);
        }
      }
    );
  });

  // get visit data
  site.post("/api/doctors_visits/getVisitData", (req, res) => {
    req.headers.language = req.headers.language || "en";
    let response = {};

    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;

    } else if (!req.session.user.ref_info) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    $doctors_visits.aggregate(
      [
        {
          $match: {
            "customer.id": req.session.user.ref_info.id,
            "status.id": 1
          },
        },
        {
          "$project": {
            "selected_doctor.name_ar": 1.0,
            "selected_doctor.name_en": 1.0,
            "selected_doctor.image_url": 1.0,
            "date": 1.0,
            "id": 1.0,
            "selected_time": 1.0,
            id: 1

          },
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.doc = docs[0];

          res.json(response);
        } else {
          response.done = false;

          response.doc = {};
          res.json(response);
        }
      }
    );
  });



// my complete visits
site.post("/api/doctors_visits/getCompletedVisits", (req, res) => {
  req.headers.language = req.headers.language || "en";
  let response = {};
  if (!req.session.user) {
    response.message = site.word("loginFirst")[req.headers.language];
    response.done = false;
    res.json(response);
    return;
  } else if (!req.session.user.ref_info) {
    response.message = site.word("loginFirst")[req.headers.language];
    response.done = false;
    res.json(response);
    return;
  }

  $doctors_visits.aggregate(
    [
      {
        $match: {
          'customer.id': req.session.user.ref_info.id,
        },
      },
      { 
        "$match" : {
            "status.id" : 4.0
        }
    }
    ],
    (err, docs) => {
      if (docs && docs.length > 0) {
        response.done = true;
        response.docs = docs;

        res.json(response);
      } else {
        response.done = false;

        response.docs = [];
        res.json(response);
      }
    }
  );
});



//my not complete visits
site.post("/api/doctors_visits/getNotCompletedVisits", (req, res) => {
  req.headers.language = req.headers.language || "en";
  let response = {};
  if (!req.session.user) {
    response.message = site.word("loginFirst")[req.headers.language];
    response.done = false;
    res.json(response);
    return;
  } else if (!req.session.user.ref_info) {
    response.message = site.word("loginFirst")[req.headers.language];
    response.done = false;
    res.json(response);
    return;
  }

  $doctors_visits.aggregate(
    [
      {
        $match: {
          "customer.id": req.session.user.ref_info.id,
        },
      },
      { 
        "$match" : {
            "status.id" : {
                "$nin" : [
                    4.0
                ]
            }
        }
    }
    ],
    (err, docs) => {
      if (docs && docs.length > 0) {
        response.done = true;
        response.docs = docs;

        res.json(response);
      } else {
        response.done = false;

        response.docs = [];
        res.json(response);
      }
    }
  );
});







  // add doctor visit
  site.post("/api/doctors_visits/getTodayVisitsCount", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    console.log(req.session.user.ref_info.id);

    let start = new Date();
    start.setHours(0, 0, 0, 0);
    let end = new Date();
    end.setHours(23, 59, 59, 999);

    let doctors_visits_doc = req.body;
    
    $doctors_visits.findMany(
      {
        where: {
          "selected_doctor.id": req.session.user.ref_info.id,
          // date: {
          //   $gte: start,
          //   $lt:end
          // }
        }
      },
      (err, docs, count) => {

        if (!err && docs.length>0) {
console.log(docs);
response.done = true
response.docs = docs
response.count = count
        

        
        }
        else { 
          console.log(22222222222222);
          response.done = false
        }
        res.json(response)

      }
    );
  });














  // add doctor visit
  site.post("/api/doctors_visits/addDoctorVisit", (req, res) => {
    let response = {
      done: false,
    };
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let doctors_visits_doc = req.body;
    doctors_visits_doc.$req = req;
    doctors_visits_doc.$res = res;

    if (!doctors_visits_doc.selected_time) {
      response.error = "must selected time";
      res.json(response);
      return;
    }

    doctors_visits_doc.company = site.get_company(req);
    doctors_visits_doc.branch = site.get_branch(req);

    doctors_visits_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof doctors_visits_doc.active === "undefined") {
      doctors_visits_doc.active = true;
    }

    if (doctors_visits_doc.company_code) {
      doctors_visits_doc.company_codes = [doctors_visits_doc.company_code];
      delete doctors_visits_doc.company_code;
    }

    let num_obj = {
      company: site.get_company(req),
      screen: "doctors_visits",
      date: doctors_visits_doc.date,
    };

    let cb = site.getNumbering(num_obj);
    if (!doctors_visits_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      doctors_visits_doc.code = cb.code;
    }
    let whereObj = {
      date: new Date(doctors_visits_doc.date),
      "selected_clinic.id": doctors_visits_doc.selected_clinic.id,
      "selected_doctor.id": doctors_visits_doc.selected_doctor.id,
      "selected_time.day.id": doctors_visits_doc.selected_time.day.id,
      "selected_time.from.hour": doctors_visits_doc.selected_time.from.hour,
      "selected_time.to.hour": doctors_visits_doc.selected_time.to.hour,
    };

    if (whereObj.date) {
      let d1 = site.toDate(whereObj.date);
      let d2 = site.toDate(whereObj.date);
      d2.setDate(d2.getDate() + 1);
      whereObj.date = {
        $gte: d1,
        $lt: d2,
      };
    }

    $doctors_visits.findMany(
      {
        where: whereObj,
      },
      (err, docs, count) => {
        if (!err) {

          doctors_visits_doc.visit_number = count + 1;


          $doctors.findOne(
            {
              where: {
                doctor: true,
                id : doctors_visits_doc.selected_doctor.id
              },
            },
            (err, doctorDoc) => {
              if (!doctorDoc) {
                response.error = 'no doctor found';
                res.json(response);
                return
              } else {
                doctors_visits_doc.selected_doctor = doctorDoc
                $customer.findOne(
                  {
                    where: {
                      id: doctors_visits_doc.customer.id,
                    },
                  },
                  (err, customerDoc) => {
                    if (!customerDoc) {
                      response.error = 'no patient found';
                      res.json(response);
                      return
                    }
                    else{
                      doctors_visits_doc.customer = customerDoc
                      site.getPatientTicket(doctors_visits_doc.customer, (callBackGet) => {
                        if (!callBackGet) {
                          site.addPatientTicket(doctors_visits_doc, (callBackAdd) => {
                            doctors_visits_doc.patient_ticket_id = callBackAdd.id;
            
                            $doctors_visits.add(doctors_visits_doc, (err, doc) => {
                              if (!err) {
                                response.done = true;
                                response.doc = doc;
                              } else {
                                response.error = err.message;
                              }
                              res.json(response);
                            });
                          });
                        } else {
                          if (callBackGet.status && callBackGet.status.id === 2) {
                            response.error = "holding ticket for this patient";
                            res.json(response);
                            return;
                          }
            
                          doctors_visits_doc.patient_ticket_id = callBackGet.id;
            
                          $doctors_visits.add(doctors_visits_doc, (err, doc) => {
                            if (!err) {
                              response.done = true;
                              response.doc = doc;
                            } else {
                              response.error = err.message;
                            }
                            res.json(response);
                          });
                        }
                      });
                    }
                  }
                );
              }
             
            }
          );



         

          
        }
      }
    );
  });
};
