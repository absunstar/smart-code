module.exports = function init(site) {
  const $brand = site.connectCollection("brand")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "brand",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on("[company][created]", (doc) => {
    $brand.add(
      {
        code: "1-Test",
        name_ar: "علامة تجارية إفتراضية",
        name_en: "Default Brand",
        image_url: "/images/brand.png",
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


  site.post("/api/brand/add", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    let brand_doc = req.body;
    brand_doc.$req = req;
    brand_doc.$res = res;

    brand_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof brand_doc.active === "undefined") {
      brand_doc.active = true;
    }

    brand_doc.company = site.get_company(req);
    brand_doc.branch = site.get_branch(req);

    $brand.find(
      {
        where: {
          "company.id": site.get_company(req).id,
          "branch.code": site.get_branch(req).code,
          $or: [
            {
              name_ar: brand_doc.name_ar,
            },
            {
              name_en: brand_doc.name_en,
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
            screen: "brand",
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!brand_doc.code && !cb.auto) {
            response.error = "Must Enter Code";
            res.json(response);
            return;
          } else if (cb.auto) {
            brand_doc.code = cb.code;
          }

          $brand.add(brand_doc, (err, doc) => {
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

  site.post("/api/brand/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let brand_doc = req.body

    brand_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (brand_doc.id) {
      $brand.edit({
        where: {
          id: brand_doc.id
        },
        set: brand_doc,
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

  site.post("/api/brand/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $brand.findOne({
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

  site.post("/api/brand/delete", (req, res) => {
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
      $brand.delete({
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

  site.post("/api/brand/all", (req, res) => {
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

    $brand.findMany({
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