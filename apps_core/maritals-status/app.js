module.exports = function init(site) {
  const $maritals_status = site.connectCollection("maritals_status");

  site.get({
    name: "maritals_status",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.on("[company][created]", (doc) => {
    $maritals_status.add([
      {
        name_ar: "أعزب/عزباء",
        name_en: "Unmarried",
        code: "1-Test",
        image_url: "/images/marital.png",
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
      {
        name_ar: "متزوج/ة",
        name_en: "Married",
        code: "2-Test",
        image_url: "/images/marital.png",
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
      {
        name_ar: "أرمل/ة",
        name_en: "Widower",
        code: "3-Test",
        image_url: "/images/marital.png",
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
      {
        name_ar: "مطلق/ة",
        name_en: "Divorced",
        code: "4-Test",
        image_url: "/images/marital.png",
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
    ]);
  });

  site.post("/api/maritals_status/add", (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      res.json(response);
      return;
    }

    let doc = req.body;
    doc.$req = req;
    doc.$res = res;
    doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    doc.company = site.get_company(req);
    doc.branch = site.get_branch(req);

    let num_obj = {
      company: site.get_company(req),
      screen: "social_status",
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      doc.code = cb.code;
    }

    $maritals_status.add(doc, (err, id) => {
      if (!err) {
        response.done = true;
      }
      res.json(response);
    });
  });

  site.post("/api/maritals_status/update", (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      res.json(response);
      return;
    }

    let doc = req.body;
    doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (doc.id) {
      $maritals_status.edit(
        {
          where: {
            id: doc.id,
          },
          set: doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      res.json(response);
    }
  });

  site.post("/api/maritals_status/delete", (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      res.json(response);
      return;
    }

    let id = req.body.id;
    if (id) {
      $maritals_status.delete(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
          }
          res.json(response);
        }
      );
    } else {
      res.json(response);
    }
  });

  site.post("/api/maritals_status/view", (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $maritals_status.find(
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

  site.post("/api/maritals_status/all", (req, res) => {
    let response = {};
    response.done = false;

    let where = req.body.where || {};
    where["company.id"] = site.get_company(req).id;

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $maritals_status.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          response.done = true;
          response.list = docs;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
