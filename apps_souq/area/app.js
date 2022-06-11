module.exports = function init(site) {
  const $area = site.connectCollection("area")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "area",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[register][area][add]', doc => {

    $area.add({
      gov: {
        id: doc.gov.id,
        code: doc.gov.code,
        name_ar: doc.gov.name_ar,
        name_en: doc.gov.name_en
      },
      city: {
        id: doc.id,
        code: doc.code,
        name_ar: doc.name_ar,
        name_en: doc.name_en,
      },
      name_ar: "منطقة إفتراضية",
      name_en: "Default Area",
      code : '1-Test',
      price_delivery_service: 0,
      image_url: '/images/area.png',
      company: {
        id: doc.company.id,
        name_ar: doc.company.name_ar,
        name_en: doc.company.name_en,
      },
      branch: {
        code: doc.branch.code,
        name_ar: doc.branch.name_ar,
        name_en: doc.branch.name_en,
      },
      active: true
    }, (err, doc) => { })
  })




  site.post("/api/area/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let area_doc = req.body
    area_doc.$req = req
    area_doc.$res = res

    area_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof area_doc.active === 'undefined') {
      area_doc.active = true
    }

    area_doc.company = site.get_company(req)
    area_doc.branch = site.get_branch(req)
    let num_obj = {
      company: site.get_company(req),
      screen: 'area',
      date: new Date()
    };
    let cb = site.getNumbering(num_obj);

    if (!area_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      area_doc.code = cb.code;
    }


    $area.add(area_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/area/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let area_doc = req.body

    area_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (area_doc.id) {

      $area.edit({
        where: {
          id: area_doc.id
        },
        set: area_doc,
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

  site.post("/api/area/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $area.findOne({
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

  site.post("/api/area/delete", (req, res) => {
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
      $area.delete({
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


  site.post("/api/area/getAreaByCity/:cityId", (req, res) => {
    let response = {
      done: false
    }
    $area.findMany({
      where: {
        'city._id': String(req.params.cityId),
      },
  
    },
      (err, doc) => {
  
        if (!err && doc.length > 0) {
          response.doc = doc
          response.done = true;
        }
        if (!doc || doc.length == 0) {
            response.done = false;
        }
        res.json(response);
      },
    );
  
  })



  site.post("/api/area/all", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov']
      delete where.active
    }

    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city']
      delete where.active
    }

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }
    if (site.get_company(req) && site.get_company(req).id)
      where['company.id'] = site.get_company(req).id

    $area.findMany({
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


/* ATM APIS */
site.post("/api/area/findAreaByCity", (req, res) => {

  let response = {
    done: false
  }

  let where = req.body.where || {}

  if (where['city']) {
    where['city.id'] = where['city'].id;
    delete where['city']
    delete where.active
  }
  if (where['city'] == "" || where['city'] == undefined) {
    
    delete where['city']
    
  }

 
  $area.findMany({
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