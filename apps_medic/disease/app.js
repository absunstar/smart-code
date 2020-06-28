module.exports = function init(site) {
  const $disease = site.connectCollection("disease")


  site.on('[company][created]', doc => {
    if (site.feature('gym') || site.feature('academy'))
      $disease.add({
        code: "1",
        name: "مرض إفتراضي",
        image_url: '/images/disease.png',
        company: {
          id: doc.id,
          name_ar: doc.name_ar
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar
        },
        active: true
      }, (err, doc) => { })
  })



  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "disease",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/disease/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let disease_doc = req.body
    disease_doc.$req = req
    disease_doc.$res = res

    disease_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof disease_doc.active === 'undefined') {
      disease_doc.active = true
    }

    disease_doc.company = site.get_company(req)
    /*     disease_doc.branch = site.get_branch(req)
     */
    $disease.find({
      'company.id': site.get_company(req).id,
/*       'branch.code': site.get_branch(req).code,
 */      where: {
        'name': disease_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {

        response.error = 'Name Exists'
        res.json(response)
      } else {
        $disease.add(disease_doc, (err, doc) => {
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

  site.post("/api/disease/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let disease_doc = req.body

    disease_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (disease_doc.id) {
      $disease.edit({
        where: {
          id: disease_doc.id
        },
        set: disease_doc,
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

  site.post("/api/disease/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $disease.findOne({
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

  site.post("/api/disease/delete", (req, res) => {
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
      $disease.delete({
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


  site.post("/api/disease/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = new RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
   
    $disease.findMany({
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