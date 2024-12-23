module.exports = function init(site) {
  const $medical_insurance_companies = site.connectCollection(
    "medical_insurance_companies"
  );

  site.on("[register][insurance_company][add]", (doc, callback) => {
    doc.active = true;

    $medical_insurance_companies.add(doc, (err, doc) => {
      callback(err, doc);
    });
  });

  site.on("[company][created]", (doc) => {
    $medical_insurance_companies.add(
      {
        code: "1-Test",
        name_Ar: "شركة تأمين إفتراضية",
        name_En: "Default Insurance Company",
        image_url: "/images/medical_insurance_companies.png",
        insurance_slides_list: [{}],
        black_analyse_list: [{}],
        black_scan_list: [{}],
        black_medicine_list: [{}],
        black_operation_list: [{}],
        approve_analyse_list: [{}],
        approve_scan_list: [{}],
        approve_medicine_list: [{}],
        approve_operation_list: [{}],
        company: {
          id: doc.id,
          name_Ar: doc.name_Ar,
          name_En: doc.name_En,
        },
        branch: {
          code: doc.branch_list[0].code,
          name_Ar: doc.branch_list[0].name_Ar,
          name_En: doc.branch_list[0].name_En,
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
    name: "medical_insurance_companies",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.post("/api/medical_insurance_companies/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let medical_insurance_companies_doc = req.body;
    medical_insurance_companies_doc.$req = req;
    medical_insurance_companies_doc.$res = res;

    medical_insurance_companies_doc.company = site.get_company(req);
    medical_insurance_companies_doc.branch = site.get_branch(req);

    medical_insurance_companies_doc.add_user_info = site.security.getUserFinger(
      {
        $req: req,
        $res: res,
      }
    );

    if (typeof medical_insurance_companies_doc.active === "undefined") {
      medical_insurance_companies_doc.active = true;
    }

    let num_obj = {
      company: site.get_company(req),
      screen: "medical_insurance_companies",
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!medical_insurance_companies_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      medical_insurance_companies_doc.code = cb.code;
    }

    $medical_insurance_companies.find(
      {
        where: {
          "company.id": site.get_company(req).id,
          "branch.code": site.get_branch(req).code,
          $or: [
            {
              name_Ar: medical_insurance_companies_doc.name_Ar,
            },
            {
              name_En: medical_insurance_companies_doc.name_En,
            },
            {
              phone: medical_insurance_companies_doc.phone,
            },
            {
              mobile: medical_insurance_companies_doc.mobile,
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = "Name , Phone Or mobile Exists";
          res.json(response);
        } else {
          let user = {
            name: medical_insurance_companies_doc.name,
            mobile: medical_insurance_companies_doc.mobile,
            username: medical_insurance_companies_doc.username,
            email: medical_insurance_companies_doc.username,
            password: medical_insurance_companies_doc.password,
            image_url: medical_insurance_companies_doc.image_url,
            type: "insurance_company",
          };

          user.roles = [
            {
              name: "insurance_companies_admin",
            },
          ];

          user.profile = {
            name: user.name,
            mobile: user.mobile,
            image_url: user.image_url,
          };

          $medical_insurance_companies.add(
            medical_insurance_companies_doc,
            (err, doc) => {
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
                      $medical_insurance_companies.edit(doc, (err1, doc1) => {
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
            }
          );
        }
      }
    );
  });

  site.post("/api/medical_insurance_companies/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let medical_insurance_companies_doc = req.body;

   let user = {
      name: medical_insurance_companies_doc.name,
      mobile: medical_insurance_companies_doc.mobile,
      username: medical_insurance_companies_doc.username,
      email: medical_insurance_companies_doc.username,
      password: medical_insurance_companies_doc.password,
      image_url: medical_insurance_companies_doc.image_url,
      type: "insurance_company",
    };

    user.roles = [
      {
        name: "insurance_companies_admin",
      },
    ];

    user.profile = {
      name: user.name,
      mobile: user.mobile,
      image_url: user.image_url,
    };

    user.ref_info = {
      id: medical_insurance_companies_doc.id,
    };

    medical_insurance_companies_doc.edit_user_info =
      site.security.getUserFinger({
        $req: req,
        $res: res,
      });

    if (medical_insurance_companies_doc.id) {
      $medical_insurance_companies.edit(
        {
          where: {
            id: medical_insurance_companies_doc.id,
          },
          set: medical_insurance_companies_doc,
          $req: req,
          $res: res,
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
                  $medical_insurance_companies.edit(doc.doc, (err2, doc2) => {
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
        }
      );
    } else {
      response.error = "no id";
      res.json(response);
    }
  });

  site.post("/api/medical_insurance_companies/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $medical_insurance_companies.findOne(
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

  site.post("/api/medical_insurance_companies/delete", (req, res) => {
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
      $medical_insurance_companies.delete(
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

  site.post("/api/medical_insurance_companies/all", (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

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

    if (where["code"]) {
      where["code"] = new RegExp(where["code"], "i");
    }
    if (where["name_Ar"]) {
      where["name_Ar"] = new RegExp(where["name_Ar"], "i");
    }
    if (where["name_En"]) {
      where["name_En"] = new RegExp(where["name_En"], "i");
    }
    if (where["address"]) {
      where["address"] = new RegExp(where["address"], "i");
    }
    if (where["hotline"]) {
      where["hotline"] = new RegExp(where["hotline"], "i");
    }
    if (where["phone"]) {
      where["phone"] = new RegExp(where["phone"], "i");
    }
    if (where["mobile"]) {
      where["mobile"] = new RegExp(where["mobile"], "i");
    }
    if (where["fax"]) {
      where["fax"] = new RegExp(where["fax"], "i");
    }
    if (where["facebook"]) {
      where["facebook"] = new RegExp(where["facebook"], "i");
    }
    if (where["twitter"]) {
      where["twitter"] = new RegExp(where["twitter"], "i");
    }
    if (where["email"]) {
      where["email"] = new RegExp(where["email"], "i");
    }
    if (where["website"]) {
      where["website"] = new RegExp(where["website"], "i");
    }
    if (req.session.user && req.session.user.type === "insurance_company") {
      where["id"] = req.session.user.ref_info.id;
    }

    where["company.id"] = site.get_company(req).id;
    where["branch.code"] = site.get_branch(req).code;

    $medical_insurance_companies.findMany(
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
};
