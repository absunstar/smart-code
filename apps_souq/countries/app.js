module.exports = function init(site) {
  const $countries = site.connectCollection("countries")

  site.on('[company][created]', doc => {
      $countries.add({
        code: "1-Test",
        name_ar: "دولة إفتراضية",
        name_en: "Default Country",
        image_url: '/images/countries.png',
      
        active: true
      }, (err, doc) => { })
  })


  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "countries",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/countries/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let countries_doc = req.body
    countries_doc.$req = req
    countries_doc.$res = res

    countries_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof countries_doc.active === 'undefined') {
      countries_doc.active = true
    }

  
    $countries.find({
      where: {

        $or: [{
          'name_ar': countries_doc.name_ar
        },{
          'name_en': countries_doc.name_en
        }]
      
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          screen: 'countries',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!countries_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          countries_doc.code = cb.code;
        }

        $countries.add(countries_doc, (err, doc) => {
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

  site.post("/api/countries/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let countries_doc = req.body

    countries_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (countries_doc.id) {
      $countries.edit({
        where: {
          id: countries_doc.id
        },
        set: countries_doc,
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

  site.post("/api/countries/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $countries.findOne({
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

  site.post("/api/countries/delete", (req, res) => {
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
      $countries.delete({
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


  site.post("/api/countries/all", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], "i");
    }

    
    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], "i");
    }



    $countries.findMany({
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