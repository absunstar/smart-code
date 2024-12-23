module.exports = function init(site) {
  const $items_group = site.connectCollection("items_group");

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.get({
    name: "items_group",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.on("[company][created]", (doc) => {
    $items_group.add(
      {
        code: "1-Test",
        name_Ar: "مجموعة أصناف إفتراضية",
        name_En: "Default Items Group",
        image_url: "/images/items_group.png",
        color: "#000000",
        is_pos: true,
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
      (err, doc) => {}
    );
  });

  site.post("/api/items_group/add", (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let items_group_doc = req.body;
    items_group_doc.$req = req;
    items_group_doc.$res = res;

    items_group_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof items_group_doc.active === "undefined") {
      items_group_doc.active = true;
    }

    items_group_doc.company = site.get_company(req);
    items_group_doc.branch = site.get_branch(req);

    $items_group.find(
      {
        where: {
          "company.id": site.get_company(req).id,
          $or: [
            {
              name_Ar: items_group_doc.name_Ar,
            },
            {
              name_En: items_group_doc.name_En,
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
            screen: "items_groups",
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!items_group_doc.code && !cb.auto) {
            response.error = "Must Enter Code";
            res.json(response);
            return;
          } else if (cb.auto) {
            items_group_doc.code = cb.code;
          }

          $items_group.add(items_group_doc, (err, doc) => {
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

  site.post("/api/items_group/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let items_group_doc = req.body;

    items_group_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (items_group_doc.id) {
      $items_group.edit(
        {
          where: {
            id: items_group_doc.id,
          },
          set: items_group_doc,
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

  site.post("/api/items_group/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $items_group.findOne(
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

  site.post("/api/items_group/delete", (req, res) => {
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
      $items_group.delete(
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

  site.post("/api/items_group/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where["name"]) {
      where["name"] = site.get_RegExp(where["name"], "i");
    }

    where["company.id"] = site.get_company(req).id;

    $items_group.findMany(
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

  site.post('/api/items_group/general_company', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let company = site.get_company(req);
    let branch = site.get_branch(req);

    $items_group.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          response.done = true;

          docs.forEach((_docs) => {
            _docs.company = company
            _docs.branch = branch
            $items_group.update(_docs);
          });
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });


  site.linkItemsGroups = function (group, callback) {
    callback = callback || {};

    let num_obj = {
      company: group.company,
      screen: "items_groups",
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);

    $items_group.add(
      {
        code: cb.code,
        name_Ar: group.name_Ar,
        name_En: group.name_En,
        image_url: group.image_url,
        color: "#000000",
        group_id: group.id,
        company: group.company,
        branch: group.branch,
        active: true,
      },
      (err, doc) => {
        if (!err && doc) callback(doc.id);
        else callback(false);
      }
    );
  };
};
