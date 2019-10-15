module.exports = function init(site) {

  const $notifications = site.connectCollection("notifications")

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
        ar: ''
      },
      message: {
        name: '',
        ar: ''
      },

      value: {
        name: '',
        ar:''
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
      source_ar: '',
      message: '',
      message_ar: '',
      value: '',
      value_ar: '',
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
        console.log(docs)
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


    if (where  && where.date_from) {
      let d1 = site.toDate(where.date_from)
      let d2 = site.toDate(where.date_to)
      d2.setDate(d2.getDate() + 1);
      where.date = {
        '$gte': d1,
        '$lt': d2
      }
      delete where.date_from
      delete where.date_to
    }



    if (where['message.ar']) {
      where['message.ar'] = new RegExp(where['message.ar'], 'i')
    }

    if (where['value.ar']) {
      where['value.ar'] = new RegExp(where['value.ar'], 'i')
    }

    $notifications.findMany({
      sort: {
        id: -1
      },
      where: where,
      limit: req.data.limit
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




}