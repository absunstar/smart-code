module.exports = function init(site) {
  const $hall = site.connectCollection("hall")

  site.on('[company][created]', doc => {

    if (site.feature('gym') || site.feature('academy') || site.feature('school')) {
      let name = ''

      if (site.feature('school')) {
        name = "فصل دراسي إفتراضي"
      } else if (site.feature('gym') || site.feature('academy')) {
        name = "قاعة إفتراضية"
      }


      $hall.add({
        code: "1-Test",
        name: name,
        capaneighborhood: 1,
        image_url: '/images/hall.png',
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
    }
  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "hall",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/hall/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let hall_doc = req.body
    hall_doc.$req = req
    hall_doc.$res = res

    hall_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof hall_doc.active === 'undefined') {
      hall_doc.active = true
    }

    hall_doc.company = site.get_company(req)
    hall_doc.branch = site.get_branch(req)



    $hall.find({
      where: {

        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        'name': hall_doc.name
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'halls',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!hall_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          hall_doc.code = cb.code;
        }

        $hall.add(hall_doc, (err, doc) => {
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

  site.post("/api/hall/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let hall_doc = req.body

    hall_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (hall_doc.id) {
      $hall.edit({
        where: {
          id: hall_doc.id
        },
        set: hall_doc,
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

  site.post("/api/hall/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $hall.findOne({
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

  site.post("/api/hall/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let data = { name: 'hall', id: req.body.id };

    site.getDataToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {
        if (id) {
          $hall.delete({
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
      }
    })
  })

  site.post("/api/hall/all", (req, res) => {

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
    if (where.search && where.search.capaneighborhood) {

      where['capaneighborhood'] = where.search.capaneighborhood
    }

    if (where.search && where.search.current) {

      where['current'] = where.search.current
    }
    delete where.search

    where['company.id'] = site.get_company(req).id

    $hall.findMany({
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