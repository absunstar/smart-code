module.exports = function init(site) {
  const $city = site.connectCollection("city")
  site.city_list = [];
  $city.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.city_list = [...site.city_list, ...docs];
    }
  });

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

  // site.get({
  //   name: 'css',
  //   path: __dirname + '/site_files/css/',
  //   });

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

    $city.add(city_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.city_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

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

    $city.edit(
      {
        where: {
          id: city_doc.id,
        },
        set: city_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.city_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.city_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

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

    $city.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.city_list.splice(
            site.city_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  })

  site.post("/api/city/all", (req, res) => {

    let response = {
      done: false
    }

    let where = req.body.where || {}

    if (where['country']) {
      where['country.id'] = where['country'].id;
      delete where['country'];
      delete where.active;
    }

    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov']
      delete where.active
    }

    if (where['name']) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_en: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name']
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