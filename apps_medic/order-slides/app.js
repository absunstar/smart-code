module.exports = function init(site) {

  const $order_slides = site.connectCollection("order_slides")

  site.get({
    name: "order_slides",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })
  site.post("/api/order_slides/add", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'you are not login'
      res.json(response)
      return
    }

    let doc = req.body
    doc.$req = req
    doc.$res = res

    doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    doc.company = site.get_company(req)
    doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'services_slides',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      doc.code = cb.code;
    }


    $order_slides.add(doc, (err, id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/order_slides/update", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'you are not login'
      res.json(response)
      return
    }

    let doc = req.body

    doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })


    if (doc.id) {
      $order_slides.edit({
        where: {
          id: doc.id
        },
        set: doc,
        $req: req,
        $res: res
      }, err => {
        if (!err) {
          response.done = true
        } else {
          response.error = err.message
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/order_slides/delete", (req, res) => {
    let response = {}
    response.done = false

    if (!req.session.user) {
      response.error = 'you are not login'
      res.json(response)
      return
    }

    let id = req.body.id
    if (id) {
      $order_slides.delete({
        id: id,
        $req: req,
        $res: res
      }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/order_slides/view", (req, res) => {
    let response = {}
    response.done = false
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $order_slides.find({
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

  site.post("/api/order_slides/all", (req, res) => {
    let response = {}
    response.done = false
              
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}
    where['company.id'] = site.get_company(req).id

    if (!req.session.user) {
      response.error = 'you are not login'
      res.json(response)
      return
    }

    $order_slides.findMany({
      select: req.body.select || {},
      where:where,
      sort: {
        id: -1
      }

    }, (err, docs) => {
      if (!err) {
        response.done = true
        response.list = docs
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })
}