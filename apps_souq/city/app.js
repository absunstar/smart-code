module.exports = function init(site) {
  const $city = site.connectCollection("city")
  site.city_list = [];
  $city.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.city_list = [...site.city_list, ...docs];
    }
  });

  setInterval(() => {
    site.city_list.forEach((a, i) => {
      if (a.$add) {
        $city.add(a, (err, doc) => {
          if (!err && doc) {
            site.city_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $city.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $city.delete({
          id: a.id,
        });
      }
    });
  }, 1000 * 7);
  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "city",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.on('[register][city][add]', doc => {

    $city.add({
      gov: {
        id: doc.id,
        code: doc.code,
        name_ar: doc.name_ar,
        name_en: doc.name_en
      },
      name_ar: "مدينة إفتراضية",
      name_en: "Default City",
      code : '1-Test',
      image_url: '/images/city.png',
     
      active: true
    }, (err, doc1) => {
      site.call('[register][area][add]', doc1)

    })
  })



  site.post("/api/city/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let city_doc = req.body
    city_doc.$req = req
    city_doc.$res = res

    city_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof city_doc.active === 'undefined') {
      city_doc.active = true
    }

  

    let num_obj = {
      screen: 'city',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!city_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      city_doc.code = cb.code;
    }

    response.done = true;
    city_doc.$add = true;
    site.city_list.push(city_doc);
    res.json(response);

  })

  site.post("/api/city/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let city_doc = req.body

    city_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (!city_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    city_doc.$update = true;
    site.city_list.forEach((a, i) => {
      if (a.id === city_doc.id) {
        site.city_list[i] = city_doc;
      }
    });
    res.json(response);
  })

  site.post("/api/city/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
    let ad = null;
    site.city_list.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id'
      res.json(response);
    }
  })

  site.post("/api/city/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }
 
    if (!req.body.id) {
      response.error = 'no id';
      res.json(response);
      return;
    }

    site.city_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  })

  site.post("/api/city/all", (req, res) => {

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

  

    $city.findMany({
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

site.post("/api/city/getCityByGov/:govId", (req, res) => {
  let response = {
    done: false
  }
  $city.findMany({
    where: {
      'gov._id': String(req.params.govId),
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

site.post("/api/city/findCityByGov", (req, res) => {

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

 
  $city.findMany({
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