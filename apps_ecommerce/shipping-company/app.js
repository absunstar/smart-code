module.exports = function init(site) {
  const $shipping_company = site.connectCollection("shipping_company")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "shipping_company",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on("[company][created]", (doc) => {
    $shipping_company.add(
      {
        code: "1-Test",
        name_Ar: "شركة شحن إفتراضية",
        name_En: "Default Shipping company",
        image_url: "/images/shipping_company.png",
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


  site.post("/api/shipping_company/add", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let shipping_company_doc = req.body;
    shipping_company_doc.$req = req;
    shipping_company_doc.$res = res;

    shipping_company_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof shipping_company_doc.active === "undefined") {
      shipping_company_doc.active = true;
    }

    shipping_company_doc.company = site.get_company(req);
    shipping_company_doc.branch = site.get_branch(req);

    $shipping_company.find(
      {
        where: {
          "company.id": site.get_company(req).id,
          "branch.code": site.get_branch(req).code,
          $or: [
            {
              name_Ar: shipping_company_doc.name_Ar,
            },
            {
              name_En: shipping_company_doc.name_En,
            },
          ],
        },
      },
      (err, doc) => {
        if (!err && doc) {
          response.error = "Name Exists";
          res.json(response);
        } else {
          // let d = new Date();
          // d.setFullYear(d.getFullYear() + 1);
          // d.setMonth(1);
          let num_obj = {
            company: site.get_company(req),
            screen: "shipping_company",
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!shipping_company_doc.code && !cb.auto) {
            response.error = "Must Enter Code";
            res.json(response);
            return;
          } else if (cb.auto) {
            shipping_company_doc.code = cb.code;
          }

          $shipping_company.add(shipping_company_doc, (err, doc) => {
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

  site.post("/api/shipping_company/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let shipping_company_doc = req.body

    shipping_company_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (shipping_company_doc.id) {
      $shipping_company.edit({
        where: {
          id: shipping_company_doc.id
        },
        set: shipping_company_doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = 'Code Already Exist'
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/shipping_company/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $shipping_company.findOne({
      where: {
        id: req.body.id
      }
    }, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/shipping_company/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id

    if (id) {
      $shipping_company.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      response.error = 'no id'
      res.json(response)
    }
  })

  site.post("/api/shipping_company/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}

    if (where['name_Ar']) {
      where['name_Ar'] = site.get_RegExp(where['name_Ar'], "i");
    }

    if (where['name_En']) {
      where['name_En'] = site.get_RegExp(where['name_En'], "i");
    }

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], "i");
    }

    if (where.search && where.search.salary) {

      where['salary'] = where.search.salary
    }

    delete where.search

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $shipping_company.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: req.body.limit
    }, (err, docs, count) => {
      if (!err) {
        response.done = true
        response.list = docs
        response.count = count
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

}