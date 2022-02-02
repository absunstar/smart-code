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
        name_ar: "شركة شحن إفتراضية",
        name_en: "Default Shipping company",
        image_url: "/images/shipping_company.png",
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

    let product_group_doc = req.body;
    product_group_doc.$req = req;
    product_group_doc.$res = res;

    product_group_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof product_group_doc.active === "undefined") {
      product_group_doc.active = true;
    }

    product_group_doc.company = site.get_company(req);
    product_group_doc.branch = site.get_branch(req);

    $shipping_company.find(
      {
        where: {
          "company.id": site.get_company(req).id,
          "branch.code": site.get_branch(req).code,
          $or: [
            {
              name_ar: product_group_doc.name_ar,
            },
            {
              name_en: product_group_doc.name_en,
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
            screen: "shipping_companys",
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!product_group_doc.code && !cb.auto) {
            response.error = "Must Enter Code";
            res.json(response);
            return;
          } else if (cb.auto) {
            product_group_doc.code = cb.code;
          }

          $shipping_company.add(product_group_doc, (err, doc) => {
            if (!err) {
              response.done = true;
              response.doc = doc;
              if (product_group_doc.link_item_groups) {
                site.linkItemsGroups({ ...product_group_doc }, (cbId) => {
                  product_group_doc.group_id = cbId;
                  $shipping_company.update(product_group_doc, () => {});
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

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], "i");
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], "i");
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