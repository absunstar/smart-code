module.exports = function init(site) {
  const $order_eco = site.connectCollection("order_eco");

  site.get({
    name: "order_eco",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true,
  });

  site.post({
    name: "/api/order_eco/eco_status/all",
    path: __dirname + "/site_files/json/eco_status.json",
  });

  site.post({
    name: "/api/order_eco/eco_payment/all",
    path: __dirname + "/site_files/json/eco_payment.json",
  });

  site.post({
    name: "/api/order_eco/eco_delivery/all",
    path: __dirname + "/site_files/json/eco_delivery.json",
  });

  site.get({
    name: "images",
    path: __dirname + "/site_files/images/",
  });

  site.post("/api/order_eco/add", (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let order_eco_doc = req.body;
    order_eco_doc.$req = req;
    order_eco_doc.$res = res;
    order_eco_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    order_eco_doc.date = new Date();
    order_eco_doc.status = {
      id: 1,
      name: "new",
      ar: "طلب جديد",
      en: "New Order",
    };
    let num_obj = {
      company: site.get_company(req),
      screen: "order_eco",
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!order_eco_doc.code && !cb.auto) {
      response.error = "Must Enter Code";
      res.json(response);
      return;
    } else if (cb.auto) {
      order_eco_doc.code = cb.code;
    }

    order_eco_doc.company = site.get_company(req);
    order_eco_doc.branch = site.get_branch(req);

    $order_eco.add(order_eco_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/order_eco/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let order_eco_doc = req.body;
    order_eco_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });
    if (order_eco_doc.id) {
      $order_eco.edit(
        {
          where: {
            id: order_eco_doc.id,
          },
          set: order_eco_doc,
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

  site.post("/api/order_eco/view", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    $order_eco.findOne(
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

  site.post("/api/order_eco/delete", (req, res) => {
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
      $order_eco.delete(
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

  site.post("/api/order_eco/all", (req, res) => {
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

    if (where["name_ar"]) {
      where["name_ar"] = site.get_RegExp(where["name_ar"], "i");
    }

    if (where["name_en"]) {
      where["name_en"] = site.get_RegExp(where["name_en"], "i");
    }

    if (where["user_id"]) {
      where["add_user_info.id"] = where["user_id"];
      delete where["user_id"];
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where["company.id"] = site.get_company(req).id;

    $order_eco.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || { id: -1 },
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
