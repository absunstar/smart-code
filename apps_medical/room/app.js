module.exports = function init(site) {
  const $room = site.connectCollection("room")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "room",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[register][room][add]', doc => {

    $room.add({
      building: {
        id: doc.building.id,
        code: doc.building.code,
        name_ar: doc.building.name_ar,
        name_en: doc.building.name_en
      },
      floor: {
        id: doc.id,
        code: doc.code,
        name_ar: doc.name_ar,
        name_en: doc.name_en,
      },
      name_ar: "غرفة إفتراضية",
      name_en: "Default Room",
      code : '1-Test',
      image_url: '/images/room.png',
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




  site.post("/api/room/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let room_doc = req.body
    room_doc.$req = req
    room_doc.$res = res

    room_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof room_doc.active === 'undefined') {
      room_doc.active = true
    }

    room_doc.company = site.get_company(req)
    room_doc.branch = site.get_branch(req)
    let num_obj = {
      company: site.get_company(req),
      screen: 'room',
      date: new Date()
    };
    let cb = site.getNumbering(num_obj);

    if (!room_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      room_doc.code = cb.code;
    }


    $room.add(room_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/room/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let room_doc = req.body

    room_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (room_doc.id) {

      $room.edit({
        where: {
          id: room_doc.id
        },
        set: room_doc,
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

  site.post("/api/room/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $room.findOne({
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

  site.post("/api/room/delete", (req, res) => {
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
      $room.delete({
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

  site.post("/api/room/all", (req, res) => {

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

    $room.findMany({
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
site.post("/api/room/findAreaByCity", (req, res) => {

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

 
  $room.findMany({
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