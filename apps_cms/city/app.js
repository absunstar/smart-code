module.exports = function init(site) {
  const $city = site.connectCollection("city")
  site.cityList = [];
  $city.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.cityList = [...site.cityList, ...docs];
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

    let cityDoc = req.body
    cityDoc.$req = req
    cityDoc.$res = res

    cityDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof cityDoc.active === 'undefined') {
      cityDoc.active = true
    }

    $city.add(cityDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.cityList.push(doc);
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

    let cityDoc = req.body

    cityDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res
    })
    if (!cityDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $city.edit(
      {
        where: {
          id: cityDoc.id,
        },
        set: cityDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.cityList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.cityList[i] = result.doc;
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
    site.cityList.forEach((a) => {
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
          site.cityList.splice(
            site.cityList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  })

  site.post('/api/city/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let select = req.body.select || { id: 1, name: 1 };

    response.list = [];
    site.cityList
      .filter((g) => !where['gov'] || g.gov.id == where['gov'].id)
      .forEach((doc) => {
        if ((langDoc = doc.translatedList.find((t) => t.language.id == req.session.lang))) {
          let obj = {
            ...doc,
            ...langDoc,
          };

          for (const p in obj) {
            if (!Object.hasOwnProperty.call(select, p)) {
              delete obj[p];
            }
          }

          if (!where.active || doc.active) {
            response.list.push(obj);
          }
        }
      });

    response.done = true;
    res.json(response);
  });


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