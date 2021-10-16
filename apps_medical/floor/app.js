module.exports = function init(site) {
  const $floor = site.connectCollection("floor")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "floor",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[register][floor][add]', doc => {

    $floor.add({
      gov: {
        id: doc.id,
        code: doc.code,
        name_ar: doc.name_ar,
        name_en: doc.name_en
      },
      name_ar: "طابق إفتراضي",
      name_en: "Default Floor",
      code : '1-Test',
      image_url: '/images/floor.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar,
        name_en: doc.company.name_en
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar,
        name_en: doc.branch.name_en
      },
      active: true
    }, (err, doc1) => {
      site.call('[register][room][add]', doc1)

    })
  })



  site.post("/api/floor/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let floor_doc = req.body
    floor_doc.$req = req
    floor_doc.$res = res

    floor_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof floor_doc.active === 'undefined') {
      floor_doc.active = true
    }

    floor_doc.company = site.get_company(req)
    floor_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'floor',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!floor_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      floor_doc.code = cb.code;
    }

    $floor.add(floor_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/floor/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let floor_doc = req.body

    floor_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (floor_doc.id) {

      $floor.edit({
        where: {
          id: floor_doc.id
        },
        set: floor_doc,
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

  site.post("/api/floor/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $floor.findOne({
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

  site.post("/api/floor/delete", (req, res) => {
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
      $floor.delete({
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

  site.post("/api/floor/all", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov']
      delete where.active
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    if (site.get_company(req) && site.get_company(req).id)
      where['company.id'] = site.get_company(req).id


    $floor.findMany({
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

/* ATM APIS */

site.post("/api/floor/findFloorByGov", (req, res) => {

  let response = {
    done: false
  }

  let where = req.body.where || {}

  if (where['gov'] == "" || where['gov'] == undefined) {
   
    delete where['gov']
    delete where.active
  }

  if (where['gov']) {
    where['gov.id'] = where['gov'].id;
    delete where['gov']
    delete where.active
  }

 
  $floor.findMany({
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