module.exports = function init(site) {
  const $patients_tickets = site.connectCollection("patients_tickets");

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "patients_tickets",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.on("delete Patient Ticket", (invoiceId) => {
    $patients_tickets.findOne({ id: invoiceId }, (err, doc) => {
      if (doc) {
        doc.closing_date = "";
        doc.status = {
          id: 1,
          ar: "مفتوحة",
          en: "Opening",
        };
        $patients_tickets.update(doc);
      }
    });
  });

  site.post("/api/patients_tickets/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let patients_tickets_doc = req.body;
    patients_tickets_doc.$req = req;
    patients_tickets_doc.$res = res;

    patients_tickets_doc.company = site.get_company(req);
    patients_tickets_doc.branch = site.get_branch(req);

    patients_tickets_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    patients_tickets_doc.status = {
      id: 1,
      ar: "مفتوحة",
      en: "Opening",
    };

    let num_obj = {
      company: site.get_company(req),
      screen: "patients_tickets",
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!patients_tickets_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      patients_tickets_doc.code = cb.code;
    }

    $patients_tickets.findOne(
      {
        where: {
          "company.id": site.get_company(req).id,
          "branch.code": site.get_branch(req).code,
          "customer.id": patients_tickets_doc.customer.id,
          $or: [
            {
              "status.id": 1,
            },
            {
              "status.id": 2,
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = "There is an unclosed ticket for the same patient";
          res.json(response);
        } else {
          $patients_tickets.add(patients_tickets_doc, (err, doc) => {
            if (!err) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      }
    );
  });

  site.post("/api/patients_tickets/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let patients_tickets_doc = req.body;

    patients_tickets_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (patients_tickets_doc.status && patients_tickets_doc.status.id === 3) {
      patients_tickets_doc.closing_date = new Date();
    }

    if (patients_tickets_doc.id) {
      $patients_tickets.edit(
        {
          where: {
            id: patients_tickets_doc.id,
          },
          set: patients_tickets_doc,
          $req: req,
          $res: res,
        },
        (err, doc) => {
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

  site.post("/api/patients_tickets/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $patients_tickets.findOne(
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

  site.post("/api/patients_tickets/delete", (req, res) => {
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
      $patients_tickets.delete(
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

  site.post("/api/patients_tickets/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where["city"]) {
      where["city.id"] = where["city"].id;
      delete where["city"];
    }

    where["company.id"] = site.get_company(req).id;
    where["branch.code"] = site.get_branch(req).code;

    if (req.session.user && req.session.user.type === "patients_tickets") {
      where["id"] = req.session.user.ref_info.id;
    }

    $patients_tickets.findMany(
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

  site.post("/api/patients_tickets/display_data", (req, res) => {
    let response = {};
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    response.cb = {
      customer: {},
      analysis_requests: {
        list: [],
        total_value: 0,
        total_discount: 0,
        net_value: 0,
        paid: 0,
        remain: 0,
      },
      vaccinations_requests: {
        list: [],
        total_value: 0,
        total_discount: 0,
        net_value: 0,
        paid: 0,
        remain: 0,
      },
      scans_requests: {
        list: [],
        total_value: 0,
        total_discount: 0,
        net_value: 0,
        paid: 0,
        remain: 0,
      },
      operations_requests: {
        list: [],
        total_value: 0,
        total_discount: 0,
        net_value: 0,
        paid: 0,
        remain: 0,
      },
      doctors_visits: {
        list: [],
        total_value: 0,
        total_discount: 0,
        net_value: 0,
        paid: 0,
        remain: 0,
        urgent_visit: 0,
      },
      total_value: 0,
      total_discount: 0,
      net_value: 0,
      paid: 0,
      remain: 0,
    };
    site.getCustomer(req.body.where, (cbCustomer) => {
      site.getVaccinationsRequests(req.body.where, (cbVaccinationsRequests) => {
        site.getOperationsRequests(req.body.where, (cbOperationsRequests) => {
          site.getAnalysisRequests(req.body.where, (cbAnalysisRequests) => {
            site.getScansRequests(req.body.where, (cbScansRequests) => {
              site.getDoctorsVisits(req.body.where, (cbDoctorsVisits) => {
                response.cb.customer = { ...cbCustomer };

                if (
                  cbVaccinationsRequests &&
                  cbVaccinationsRequests.length > 0
                ) {
                  cbVaccinationsRequests.forEach((_vaccinationR) => {
                    _vaccinationR.vaccination_list =
                      _vaccinationR.vaccination_list || [];

                    response.cb.vaccinations_requests.total_value +=
                      _vaccinationR.total_value || 0;
                    response.cb.vaccinations_requests.total_discount +=
                      _vaccinationR.total_discount || 0;
                    response.cb.vaccinations_requests.net_value +=
                      _vaccinationR.net_value || 0;
                    response.cb.vaccinations_requests.paid +=
                      _vaccinationR.paid || 0;
                    response.cb.vaccinations_requests.remain +=
                      _vaccinationR.remain || 0;

                    _vaccinationR.vaccination_list.forEach((_va) => {
                      if (_vaccinationR.at_home) _va.at_home = true;
                      _va.date = _vaccinationR.date;
                      response.cb.vaccinations_requests.list.push(_va);
                    });
                  });
                }

                if (cbAnalysisRequests && cbAnalysisRequests.length > 0) {
                  cbAnalysisRequests.forEach((_analysisR) => {
                    _analysisR.analysis_list = _analysisR.analysis_list || [];

                    response.cb.analysis_requests.total_value +=
                      _analysisR.total_value || 0;
                    response.cb.analysis_requests.total_discount +=
                      _analysisR.total_discount || 0;
                    response.cb.analysis_requests.net_value +=
                      _analysisR.net_value || 0;
                    response.cb.analysis_requests.paid += _analysisR.paid || 0;
                    response.cb.analysis_requests.remain +=
                      _analysisR.remain || 0;

                    _analysisR.analysis_list.forEach((_an) => {
                      if (_analysisR.at_home) _an.at_home = true;
                      _an.date = _analysisR.date;
                      response.cb.analysis_requests.list.push(_an);
                    });
                  });
                }

                if (cbOperationsRequests && cbOperationsRequests.length > 0) {
                  cbOperationsRequests.forEach((_operationsR) => {
                    _operationsR.operations_list =
                      _operationsR.operations_list || [];

                    response.cb.operations_requests.total_value +=
                      _operationsR.total_value || 0;
                    response.cb.operations_requests.total_discount +=
                      _operationsR.total_discount || 0;
                    response.cb.operations_requests.net_value +=
                      _operationsR.net_value || 0;
                    response.cb.operations_requests.paid +=
                      _operationsR.paid || 0;
                    response.cb.operations_requests.remain +=
                      _operationsR.remain || 0;

                    _operationsR.operations_list.forEach((_op) => {
                      if (_operationsR.at_home) _op.at_home = true;
                      response.cb.operations_requests.list.push(_op);
                    });
                  });
                }

                if (cbScansRequests && cbScansRequests.length > 0) {
                  cbScansRequests.forEach((_scansR) => {
                    _scansR.scans_list = _scansR.scans_list || [];

                    response.cb.scans_requests.total_value +=
                      _scansR.total_value || 0;
                    response.cb.scans_requests.total_discount +=
                      _scansR.total_discount || 0;
                    response.cb.scans_requests.net_value +=
                      _scansR.net_value || 0;
                    response.cb.scans_requests.paid += _scansR.paid || 0;
                    response.cb.scans_requests.remain += _scansR.remain || 0;

                    _scansR.scans_list.forEach((_sc) => {
                      if (_scansR.at_home) _sc.at_home = true;
                      _sc.date = _scansR.date;
                      response.cb.scans_requests.list.push(_sc);
                    });
                  });
                }

                if (cbDoctorsVisits && cbDoctorsVisits.length > 0) {
                  cbDoctorsVisits.forEach((_doctorsVisits) => {
                    response.cb.doctors_visits.total_value +=
                      _doctorsVisits.doctor_visit_price || 0;
                    response.cb.doctors_visits.total_discount +=
                      _doctorsVisits.total_discount || 0;
                    response.cb.doctors_visits.net_value +=
                      _doctorsVisits.net_value || 0;
                    response.cb.doctors_visits.paid += _doctorsVisits.paid || 0;
                    response.cb.doctors_visits.remain +=
                      _doctorsVisits.remain || 0;
                    if (_doctorsVisits.urgent_visit)
                      response.cb.doctors_visits.urgent_visit +=
                        _doctorsVisits.urgent_visit.value || 0;
                    response.cb.doctors_visits.list.push(_doctorsVisits);
                  });
                }
                if (!req.body.type) {
                  response.cb.total_value =
                    response.cb.analysis_requests.total_value +
                    response.cb.scans_requests.total_value +
                    response.cb.vaccinations_requests.total_value +
                    response.cb.operations_requests.total_value +
                    response.cb.doctors_visits.total_value;
                  response.cb.total_discount =
                    response.cb.analysis_requests.total_discount +
                    response.cb.scans_requests.total_discount +
                    response.cb.vaccinations_requests.total_discount +
                    response.cb.operations_requests.total_discount +
                    response.cb.doctors_visits.total_discount;
                  response.cb.net_value =
                    response.cb.analysis_requests.net_value +
                    response.cb.scans_requests.net_value +
                    response.cb.vaccinations_requests.net_value +
                    response.cb.operations_requests.net_value +
                    response.cb.doctors_visits.net_value;
                  response.cb.paid =
                    response.cb.analysis_requests.paid +
                    response.cb.scans_requests.paid +
                    response.cb.vaccinations_requests.paid +
                    response.cb.operations_requests.paid +
                    response.cb.doctors_visits.paid;
                  response.cb.remain = response.cb.net_value - response.cb.paid;
                }

                response.cb.analysis_requests.list.reverse();
                response.cb.scans_requests.list.reverse();
                response.cb.vaccinations_requests.list.reverse();
                response.cb.operations_requests.list.reverse();
                response.cb.doctors_visits.list.reverse();
                if (req.body.type == "patient_file") {
                  response.cb = {
                    analysis_requests: response.cb.analysis_requests.list,
                    scans_requests: response.cb.scans_requests.list,
                    vaccinations_requests:
                      response.cb.vaccinations_requests.list,
                    operations_requests: response.cb.operations_requests.list,
                    doctors_visits: response.cb.doctors_visits.list,
                    customer: response.cb.customer,
                  };
                }
                res.json(response);
              });
            });
          });
        });
      });
    });
  });

  site.getPatientTicket = function (customer, callback) {
    callback = callback || {};

    $patients_tickets.findOne(
      {
        where: {
          "customer.id": customer.id,
          $or: [
            {
              "status.id": 1,
            },
            {
              "status.id": 2,
            },
          ],
        },
        sort: { id: -1 },
      },
      (err, doc) => {
        if (!err && doc) callback(doc);
        else callback(false);
      }
    );
  };

  site.getDataToDelete = function (data, callback) {
    let where = {};

    if (data.name == "customer") where["customer.id"] = data.id;

    $patients_tickets.findOne(
      {
        where: where,
      },
      (err, docs, count) => {
        if (!err) {
          if (docs) callback(true);
          else callback(false);
        }
      }
    );
  };

  site.addPatientTicket = function (doctors_visits, callback) {
    callback = callback || {};

    let num_obj = {
      company: doctors_visits.company,
      screen: "patients_tickets",
      date: new Date(),
    };

    let cbCode = site.getNumbering(num_obj);

    $patients_tickets.add(
      {
        image_url: "/images/patients_tickets.png",
        customer: doctors_visits.customer,
        company: doctors_visits.company,
        branch: doctors_visits.branch,
        code: cbCode.code,
        status: {
          id: 1,
          ar: "مفتوحة",
          en: "Opening",
        },
        opening_date: new Date(),
        add_user_info: doctors_visits.add_user_info,
      },
      (err, doc) => {
        if (!err && doc) callback(doc);
        else callback(false);
      }
    );
  };
};
