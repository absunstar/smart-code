module.exports = function init(site) {
  const $products = site.connectCollection("products")

  site.on("[products_group][product][add]", (doc) => {
    $product.add(
      {
        product_group: {
          id: doc.id,
          code: doc.code,
          name_Ar: doc.name_Ar,
          name_En: doc.name_En,
        },
        name_Ar: "منتج إفتراضي",
        name_En: "Default Product",
        code: "1-Test",
        price: 1,
        image_url: "/images/product.png",
        company: {
          id: doc.company.id,
          name_Ar: doc.company.name_Ar,
          name_En: doc.company.name_En,
        },
        branch: {
          code: doc.branch.code,
          name_Ar: doc.branch.name_Ar,
          name_En: doc.branch.name_En,
        },
        active: true,
      },
      (err, doc1) => {}
    );
  });


  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "products",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/products/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let products_doc = req.body
    products_doc.$req = req
    products_doc.$res = res

    products_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof products_doc.active === 'undefined') {
      products_doc.active = true
    }

    products_doc.company = site.get_company(req)
    /*     products_doc.branch = site.get_branch(req)
     */

    $products.find({
      where: {

        'company.id': site.get_company(req).id,
        /*         'branch.code': site.get_branch(req).code,
         */
        $or: [{
          'name_Ar': products_doc.name_Ar
        },{
          'name_En': products_doc.name_En
        }]
   
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'products',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!products_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          products_doc.code = cb.code;
        }

        $products.add(products_doc, (err, doc) => {
          if (!err) {
            response.done = true
            response.doc = doc
          } else {
            response.error = err.message
          }
          res.json(response)
        })
      }
    })
  })

  site.post("/api/products/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let products_doc = req.body

    products_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (products_doc.id) {
      $products.edit({
        where: {
          id: products_doc.id
        },
        set: products_doc,
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

  site.post("/api/products/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $products.findOne({
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

  site.post("/api/products/delete", (req, res) => {
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
      $products.delete({
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


  site.post("/api/products/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id


    $products.findMany({
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