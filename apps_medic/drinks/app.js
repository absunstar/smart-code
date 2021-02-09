module.exports = function init(site) {
  const $drinks = site.connectCollection("drinks")

  site.on('[company][created]', doc => {
    if (site.feature('gym') || site.feature('academy') || site.feature('school') || site.feature('medical'))
      $drinks.add({
        code: "1-Test",
        name_ar: "مشروب إفتراضي",
        name_en: "Default Drink",
        image_url: '/images/drinks.png',
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
    name: "drinks",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/drinks/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let drinks_doc = req.body
    drinks_doc.$req = req
    drinks_doc.$res = res

    drinks_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof drinks_doc.active === 'undefined') {
      drinks_doc.active = true
    }

    drinks_doc.company = site.get_company(req)
    /*     drinks_doc.branch = site.get_branch(req)
     */

    $drinks.find({
      where: {

        'company.id': site.get_company(req).id,
/*         'branch.code': site.get_branch(req).code,
 */        'name_ar,': drinks_doc.name_ar,
        'name_en,': drinks_doc.name_en,
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'drinks',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!drinks_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          drinks_doc.code = cb.code;
        }

        $drinks.add(drinks_doc, (err, doc) => {
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

  site.post("/api/drinks/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let drinks_doc = req.body

    drinks_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (drinks_doc.id) {
      $drinks.edit({
        where: {
          id: drinks_doc.id
        },
        set: drinks_doc,
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

  site.post("/api/drinks/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $drinks.findOne({
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

  site.post("/api/drinks/delete", (req, res) => {
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
      $drinks.delete({
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


  site.post("/api/drinks/all", (req, res) => {
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


    $drinks.findMany({
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