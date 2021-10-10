module.exports = function init(site) {
  const $analysis_requests = site.connectCollection("analysis_requests");
  const $customer = site.connectCollection("customers");

  //  $analysis_requests.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $analysis_requests.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // })

  site.get({
    name: "analysis_requests",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.post("/api/analysis_requests/add", (req, res) => {
    let response = {
      done: false,
    };
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let analysis_requests_doc = req.body;

    analysis_requests_doc.$req = req;
    analysis_requests_doc.$res = res;

    analysis_requests_doc.company = site.get_company(req);
    analysis_requests_doc.branch = site.get_branch(req);

    analysis_requests_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    if (analysis_requests_doc.at_home) {
      let found = false;
      let foundList = [];
      analysis_requests_doc.analysis_list.forEach((_a) => {
        if (!_a.made_home_analysis) {
          found = true;
          if (req.session.lang == "ar") {
            foundList.push(_a.name_ar);
          } else if (req.session.lang == "en") {
            foundList.push(_a.name_en);
          }
        }
      });

      if (found) {
        if (req.session.lang == "ar") {
          response.error = `يوجد تحاليل لا يمكن إجراءها في المنزل ( ${foundList.join(
            "-"
          )} )`;
        } else if (req.session.lang == "en") {
          response.error = `There are analysis that cannot be done at home ( ${foundList.join(
            "-"
          )} )`;
        }
        res.json(response);
        return;
      }
    }

    let num_obj = {
      company: site.get_company(req),
      screen: "analysis_requests",
      date: analysis_requests_doc.date,
    };

    let cb = site.getNumbering(num_obj);
    if (!analysis_requests_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      analysis_requests_doc.code = cb.code;
    }

    site.getPatientTicket(analysis_requests_doc.customer, (callBackGet) => {
      if (!callBackGet) {
        site.addPatientTicket(analysis_requests_doc, (callBackAdd) => {
          analysis_requests_doc.patient_ticket_id = callBackAdd.id;

          $analysis_requests.add(analysis_requests_doc, (err, doc) => {
            if (!err) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
            return;
          });
        });
      } else {
        if (callBackGet.status && callBackGet.status.id === 2) {
          response.error = "holding ticket for this patient";
          res.json(response);
          return;
        }

        analysis_requests_doc.patient_ticket_id = callBackGet.id;

        $analysis_requests.add(analysis_requests_doc, (err, doc) => {
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
  });

  site.post("/api/analysis_requests/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let analysis_requests_doc = req.body;
    analysis_requests_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (analysis_requests_doc.at_home) {
      let found = false;
      let foundList = [];
      analysis_requests_doc.analysis_list.forEach((_a) => {
        if (!_a.made_home_analysis) {
          found = true;
          if (req.session.lang == "ar") {
            foundList.push(_a.name_ar);
          } else if (req.session.lang == "en") {
            foundList.push(_a.name_en);
          }
        }
      });

      if (found) {
        if (req.session.lang == "ar") {
          response.error = `يوجد تحاليل لا يمكن إجراءها في المنزل ( ${foundList.join(
            "-"
          )} )`;
        } else if (req.session.lang == "en") {
          response.error = `There are analysis that cannot be done at home ( ${foundList.join(
            "-"
          )} )`;
        }
        res.json(response);
        return;
      }
    }

    analysis_requests_doc.analysis_list.forEach((_analysis) => {
      if (
        _analysis.person_delivery &&
        _analysis.person_delivery.name &&
        !_analysis.delivery_date
      )
        _analysis.delivery_date = new Date();
    });

    analysis_requests_doc.delivery = analysis_requests_doc.analysis_list.every(
      (_a1) => _a1.person_delivery && _a1.person_delivery.name
    );
    analysis_requests_doc.Putting_results =
      analysis_requests_doc.analysis_list.every((_a2) => _a2.result);

    if (analysis_requests_doc.id) {
      $analysis_requests.edit(
        {
          where: {
            id: analysis_requests_doc.id,
          },
          set: analysis_requests_doc,
          $req: req,
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
  });

  site.post("/api/analysis_requests/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $analysis_requests.findOne(
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

  site.post("/api/analysis_requests/delete", (req, res) => {
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
      $analysis_requests.delete(
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
  });

  site.post("/api/analysis_requests/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }
    let where = req.data.where || {};

    if (where["code"]) {
      where["code"] = site.get_RegExp(where["code"], "i");
    }

    if (where["name"]) {
      where["name"] = site.get_RegExp(where["name"], "i");
    }

    if (where["customer"]) {
      where["customer.id"] = where["customer"].id;
      delete where["customer"];
    }

    if (where["analysis"]) {
      where["analysis_list.id"] = where["analysis"].id;

      delete where["analysis"];
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where["company.id"] = site.get_company(req).id;
    where["branch.code"] = site.get_branch(req).code;

    $analysis_requests.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err && docs) {
          response.done = true;
          response.list = docs;
          let all_list = [];

          if (req.data.report) {
            docs.forEach((_d) => {
              _d.analysis_list = _d.analysis_list || [];
              _d.analysis_list.forEach((_a) => {
                _a.date = _d.date;
                _a.total_discount = _d.total_discount;
                _a.total_value = _d.total_value;
                _a.net_value = _d.net_value;
                if (where["analysis_list.id"]) {
                  if (_a.id === where["analysis_list.id"]) all_list.push(_a);
                } else all_list.push(_a);
              });
            });

            response.all_list = all_list;
          }

          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.getAnalysisRequests = function (_where, callback) {
    callback = callback || {};
    let where = {
      ..._where,
    };
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

    $analysis_requests.findMany(
      {
        where: where,
      },
      (err, docs) => {
        if (!err && docs) {
          callback(docs);
        } else {
          callback(false);
        }
      }
    );
  };

  /* ATM APIS */

  site.post("/api/analysis_requests/addAnalysisRequest", (req, res) => {
    let response = {
      done: false,
    };
    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // }

    let analysis_requests_doc = req.body;
    console.log(analysis_requests_doc);
    if (analysis_requests_doc.customer)
      $customer.findOne(
        {
          where: {
            id: analysis_requests_doc.customer.id,
          },
        },
        (err, customerData) => {
          if (!err) {
            if (!customerData) {
              response.error = "no patient found";
              return;
            } else {
              analysis_requests_doc.customer = customerData;
              analysis_requests_doc.$req = req;
              analysis_requests_doc.$res = res;

              analysis_requests_doc.add_user_info = site.security.getUserFinger(
                {
                  $req: req,
                  $res: res,
                }
              );

              const randomNumber = (length) => {
                let text = "";
                let possible = "123456789";
                for (let i = 0; i < length; i++) {
                  let sup = Math.floor(Math.random() * possible.length);
                  text += i > 0 && sup == i ? "0" : possible.charAt(sup);
                }
                return text;
              };
              analysis_requests_doc.company = site.get_company(req);
              analysis_requests_doc.branch = site.get_branch(req);

              analysis_requests_doc.code = String(randomNumber(4));
              site.getPatientTicket(customerData, (callBackGet) => {
                if (!callBackGet) {
                  site.addPatientTicket(
                    analysis_requests_doc,
                    (callBackAdd) => {
                      analysis_requests_doc.patient_ticket_id = callBackAdd.id;

                      $analysis_requests.add(
                        analysis_requests_doc,
                        (err, doc) => {
                          if (!err) {
                            response.done = true;
                            response.doc = doc;
                          } else {
                            response.error = "error happened";
                          }
                          res.json(response);
                        }
                      );
                    }
                  );
                } else {
                  if (callBackGet.status && callBackGet.status.id === 2) {
                    response.error = "holding ticket for this patient";
                    res.json(response);
                    return;
                  }

                  analysis_requests_doc.patient_ticket_id = callBackGet.id;

                  $analysis_requests.add(analysis_requests_doc, (err, doc) => {
                    if (!err) {
                      response.done = true;
                      response.doc = doc;
                    } else {
                      response.error = "error happened";
                    }
                    res.json(response);
                  });
                }
              });
            }
          }
        }
      );
  });

  // my profile
  site.post("/api/analysis_requests/myProfile", (req, res) => {
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
    console.log(req.session.user);

    $analysis_requests.aggregate(
      [
        {
          $match: {
            "customer.id": req.session.user.ref_info.id,
          },
        },
        {
          $project: {
            date: 1.0,

            visit_day: 1,

            visit_date: 1,
            analysis_list: 1.0,
            net_value: 1.0,
            id: 1.0,
          },
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.list = docs;

          res.json(response);
        } else {
          response.done = false;

          response.list = [];
          res.json(response);
        }
      }
    );
  });

       // my Completed Analysis
   site.post("/api/analysis_requests/myCompletedAnalysis", (req, res) => {
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

    $analysis_requests.aggregate(
      [
        {
          $match: {
            "customer.id": req.session.user.ref_info.id,
            delivery : true
          },
        },
        {
          $project: {
            date: 1.0,
            visit_day: 1,
            visit_date: 1,
            analysis_list: 1.0,
            net_value: 1.0,
            id: 1.0,
          },
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.list = docs;
          response.count = docs.length;

          res.json(response);
        } else {
          response.done = false;

          response.list = [];
          response.count = 0;
          res.json(response);
        }
      }
    );
  });

   // my current Analysis
   site.post("/api/analysis_requests/myNotCompletedAnalysis", (req, res) => {
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
    console.log(req.session.user);

    $analysis_requests.aggregate(
      [
        {
          $match: {
            "customer.id": req.session.user.ref_info.id,
            delivery : {
              $ne:true
            }
          },
        },
        {
          $project: {
            date: 1.0,

            visit_day: 1,

            visit_date: 1,
            analysis_list: 1.0,
            net_value: 1.0,
            id: 1.0,
          },
        },
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.list = docs;
          response.count = docs.length;
          res.json(response);
        } else {
          response.done = false;
          response.list = [];
          response.count = 0;
          res.json(response);
        }
      }
    );
  });
};
