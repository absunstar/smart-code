module.exports = function init(site) {

  const $notifications = site.connectCollection( "notifications")

  site.on('please monitor action', action => {
    site.notifications.add(action.obj, action.result)
  })

  site.notifications = {}
  site.notifications.add = function (obj, result, callback) {
    callback = callback || function (err, id) {

    }
    let user = null
    let link = null
    if (result) {
      user = site.security.getUserFinger(result)
      if (result.doc) {
        link = {
          db: result.db,
          collection: result.collection,
          _id: result.doc._id
        }
      }

    }

    $notifications.add(Object.assign({
      source: {
        name: '',
        Ar: ''
      },
      message: {
        name: '',
        Ar: ''
      },

      value: {
        name: '',
        Ar: ''
      },
      user: user,
      link: link,
      date: new Date()
    }, obj), (err, doc) => {
      callback(err, doc)
    })

  }


  site.get({
    name: '/notifications',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html'
  })

  site.post("/api/notifications/add", (req, res) => {
    let response = {}
    response.done = false

    if (req.session.user === undefined) {
      response.error = 'you are not login'
      res.json(response)
      return
    }

    let obj = req.body

    let user = null
    let link = null

    user = site.security.getUserFinger({
      $req: req,
      $res: res
    })


    $notifications.add(Object.assign({
      source: '',
      source_Ar: '',
      message: '',
      message_Ar: '',
      value: '',
      value_Ar: '',
      user: user,
      date: new Date()
    }, obj), (err, doc) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })


  })

  site.post({
    name: '/api/system/all',
    path: __dirname + '/site_files/json/system.json'
  })

  site.post("/api/notifications/latest", (req, res) => {
    let response = {}
    response.done = false
    $notifications.findMany({
      sort: {
        time: -1
      },
      limit: 20
    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        console.log(err)
        response.error = err.message
      }
      res.json(response)
    })
  })

  site.post("/api/notifications/all", (req, res) => {
    let response = {}
    response.done = false

    let where = req.data.where || {}

    if (where.date) {
      let d1 = site.toDate(where.date)
      let d2 = site.toDate(where.date)
      d2.setDate(d2.getDate() + 1)
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
    } else if (where && where.date_from) {
      let d1 = site.toDate( where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }


    if (where['message.Ar']) {
      where['message.Ar'] = site.get_RegExp(where['message.Ar'], 'i')
    }

    if (where['value.Ar']) {
      where['value.Ar'] = site.get_RegExp(where['value.Ar'], 'i')
    }

    where['company.id'] = site.get_company(req).id;

    if (where['branchAll']) {
      delete where['branchAll'];
    } else {
      where['branch.code'] = site.get_branch(req).code;
    }
    console.log(where);
    $notifications.findMany({
      sort: {
        id: -1
      },
      where: where,
      limit: req.data.limit
    }, (err, docs) => {
      if (!err) {
        console.log(docs);
        response.done = true
        response.list = docs
      } else {
        console.log(err)
        response.error = err.message
      }
      res.json(response)
    })
  })




}