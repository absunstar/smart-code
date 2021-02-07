module.exports = function init(site) {
  const $rogatory_types = site.connectCollection("rogatory_types")

  //  $rogatory_types.deleteDuplicate({
  //   code: 1,
  //   'company.id': 1
  // }, (err, result) => {
  //   $rogatory_types.createUnique({
  //     code: 1,
  //     'company.id': 1
  //   }, (err, result) => { })
  // }) 

  site.get({
    name: "rogatory_types",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.on('[company][created]', doc => {

    $rogatory_types.add({
      name: "نوع توكيل إفتراضي",
      code: "1-Test",
      image_url: '/images/rogatory_types.png',
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
    }, (err, doc) => {})
  })



  site.post("/api/rogatory_types/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response)
      return
    }

    let rogatory_types_doc = req.body
    rogatory_types_doc.$req = req
    rogatory_types_doc.$res = res
    rogatory_types_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    rogatory_types_doc.company = site.get_company(req)
    rogatory_types_doc.branch = site.get_branch(req)

    $rogatory_types.add(rogatory_types_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/rogatory_types/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let rogatory_types_doc = req.body
    rogatory_types_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (rogatory_types_doc.id) {
      $rogatory_types.edit({
        where: {
          id: rogatory_types_doc.id
        },
        set: rogatory_types_doc,
        $req: req,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/rogatory_types/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $rogatory_types.findOne({
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

  site.post("/api/rogatory_types/delete", (req, res) => {
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
      $rogatory_types.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
          response.doc = result.doc
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

  site.post("/api/rogatory_types/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.data.where || {}

    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], 'i')
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], 'i')
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id
    where['branch.code'] = site.get_branch(req).code

    $rogatory_types.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || { id: -1 },
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