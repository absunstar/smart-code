module.exports = function init(site) {
  const $foods = site.connectCollection("foods")

  site.on('[company][created]', doc => {
    if (site.feature('club') || site.feature('academy') || site.feature('school') || site.feature('medical'))
      $foods.add({
        code: "1-Test",
        name_ar: "طعام إفتراضي",
        name_en: "Default Food",
        image_url: '/images/foods.png',
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
    name: "foods",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/foods/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let foods_doc = req.body
    foods_doc.$req = req
    foods_doc.$res = res

    foods_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof foods_doc.active === 'undefined') {
      foods_doc.active = true
    }

    foods_doc.company = site.get_company(req)
    /*     foods_doc.branch = site.get_branch(req)
     */

    $foods.find({
      where: {

        'company.id': site.get_company(req).id,
        /*         'branch.code': site.get_branch(req).code,
         */
        $or: [{
          'name_ar': foods_doc.name_ar
        },{
          'name_en': foods_doc.name_en
        }]
   
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'foods',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!foods_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          foods_doc.code = cb.code;
        }

        $foods.add(foods_doc, (err, doc) => {
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

  site.post("/api/foods/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let foods_doc = req.body

    foods_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (foods_doc.id) {
      $foods.edit({
        where: {
          id: foods_doc.id
        },
        set: foods_doc,
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

  site.post("/api/foods/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $foods.findOne({
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

  site.post("/api/foods/delete", (req, res) => {
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
      $foods.delete({
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


  site.post("/api/foods/all", (req, res) => {
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


    $foods.findMany({
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