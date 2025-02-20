module.exports = function init(site) {
  const $analysis = site.connectCollection("analysis");

  site.post({
    name: "/api/period_analysis/all",
    path: __dirname + "/site_files/json/period_analysis.json",
  });

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });
 
  site.get({
    name: "analysis",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.on("[company][created]", (doc) => {
    $analysis.add({
        code: "1-Test",
        name_Ar: "تحليل إفتراضي",
        name_En: "Default Analysis",
        price: 1,
        price_at_home: 1,
        immediate: true,
        male: {
          from: 0,
          to: 0
        },
        female: {
          from: 0,
          to: 0
        },
        child: {
          from: 0,
          to: 0
        },
        image_url: "/images/analysis.png",
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

  site.post("/api/analysis/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let analysis_doc = req.body;
    analysis_doc.$req = req;
    analysis_doc.$res = res;

    analysis_doc.company = site.get_company(req);
    analysis_doc.branch = site.get_branch(req);

    analysis_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof analysis_doc.active === "undefined") {
      analysis_doc.active = true;
    }

    $analysis.find({
        where: {
          "company.id": site.get_company(req).id,
          $or: [{
              name_Ar: analysis_doc.name_Ar,
            },
            {
              name_En: analysis_doc.name_En,
            },
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
            screen: "analysis",
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!analysis_doc.code && !cb.auto) {
            response.error = "Must Enter Code";
            res.json(response);
            return;
          } else if (cb.auto) {
            analysis_doc.code = cb.code;
          }

          $analysis.add(analysis_doc, (err, doc) => {
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

  site.post("/api/analysis/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let analysis_doc = req.body;

    analysis_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (analysis_doc.id) {
      $analysis.edit({
          where: {
            id: analysis_doc.id,
          },
          set: analysis_doc,
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

  site.post("/api/analysis/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }
    $analysis.findOne({
      where: {
        id: req.body.id,
      },
    },
    (err, doc) => {
      if (!err) {

          let orderCode =  doc._id.toString().slice(10, 5)
          console.log(orderCode);
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post("/api/analysis/delete", (req, res) => {
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
      $analysis.delete({
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

  site.post("/api/analysis/all", (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    where["company.id"] = site.get_company(req).id;
    // where['branch.code'] = site.get_branch(req).code

    if (where["name_Ar"]) {
      where["name_Ar"] = new RegExp(where["name_Ar"], "i");
    }

    if (where["name_En"]) {
      where["name_En"] = new RegExp(where["name_En"], "i");
    }

    $analysis.findMany({
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


  site.post("/api/analyses/searchAll", (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    if (where["name"] == undefined ||where["name"] == "" ) {
     
      delete where['name']
    }
    where['company.id'] = site.get_company(req).id

    if (where['name']) {
      where.$or = []
      where.$or.push({
        'name_Ar': site.get_RegExp(where['name'], 'i')
      },{
        'name_En': site.get_RegExp(where['name'], 'i')
      }
      )
      delete where['name']
    }
    

    // if (where["name_Ar"]) {
    //   where["name_Ar"] = new RegExp(where["name_Ar"], "i");
    // }

    // if (where["name_Ar"] == undefined ||where["name_Ar"] == ""  ) {
    // delete where["name_Ar"]
    // }

    // if (where["name_En"]) {
    //   where["name_En"] = new RegExp(where["name_En"], "i");
    // }
    // if (where["name_En"] == undefined ||where["name_En"] == ""  ) {
    //   delete where["name_En"]
    //   }
    let limit = 10;
    let skip;

    if (req.body.page || (parseInt(req.body.page) && parseInt(req.body.page) > 1)) {
      skip = (parseInt(req.body.page) - 1) * 10
    }
    $analysis.findMany({
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: limit,
        skip: skip
      },
      (err, docs, count) => {

        if (!err && docs.length > 0) {
          response.done = true;
          response.list = docs;
          response.count = count;
          response.totalPages = Math.ceil(count / 10)
        } else {
          response.done = false;
          response.list = [];
          response.count = 0;
          response.totalPages = Math.ceil(count / 10)
        }
        res.json(response);
      }
    );
  });


  // get analysis price
  site.post("/api/analysis/getAnalysisPrice", (req, res) => {
    req.headers.language = req.headers.language || "En";
    let response = {};
    let where = req.body.where || {};
    let analysis = where["analysis"].id;

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

    $analysis.aggregate(
      [{
          "$match": {
            "id": analysis
          }
        },
        {
          "$addFields": {
            "price_at_analysis_center": "$price"
          }
        },
        {
          "$project": {
            "price_at_analysis_center": 1.0,
            "price_at_home": 1.0
          }
        }
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

};