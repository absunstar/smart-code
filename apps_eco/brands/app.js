module.exports = function init(site) {
  const $brands = site.connectCollection("brands")

  site.on('[company][created]', doc => {
      $brands.add({
        code: "1-Test",
        name_ar: "علامة تجارية إفتراضية",
        name_en: "Default Brand",
        image_url: '/images/brands.png',
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
          name_en: doc.name_en
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
          name_en: doc.branch_list[0].name_en
        },
        active: true
      }, (err, doc) => { })
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "brands",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/brands/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let brands_doc = req.body
    brands_doc.$req = req
    brands_doc.$res = res

    brands_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof brands_doc.active === 'undefined') {
      brands_doc.active = true
    }

    brands_doc.company = site.get_company(req)
    /*     brands_doc.branch = site.get_branch(req)
     */

    $brands.find({
      where: {

        'company.id': site.get_company(req).id,
        /*         'branch.code': site.get_branch(req).code,
         */
        $or: [{
          'name_ar': brands_doc.name_ar
        },{
          'name_en': brands_doc.name_en
        }]
   
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'brands',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!brands_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          brands_doc.code = cb.code;
        }

        $brands.add(brands_doc, (err, doc) => {
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

  site.post("/api/brands/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let brands_doc = req.body

    brands_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (brands_doc.id) {
      $brands.edit({
        where: {
          id: brands_doc.id
        },
        set: brands_doc,
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

  site.post("/api/brands/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $brands.findOne({
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

  site.post("/api/brands/delete", (req, res) => {
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
      $brands.delete({
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


  site.post("/api/brands/all", (req, res) => {
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


    $brands.findMany({
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