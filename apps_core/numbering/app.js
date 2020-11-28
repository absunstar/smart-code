module.exports = function init(site) {
  const $numbering = site.connectCollection("numbering")

  site.get({
    name: "numbering",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.get({
    name: "/api/modules_list/all",
    path: __dirname + "/site_files/json/modules_list.json"
  })

  site.post({
    name: "/api/type_numbering/all",
    path: __dirname + "/site_files/json/type_numbering.json"
  })

  site.get({
    name: "/images",
    path: __dirname + "/site_files/images"
  })

  site.post("/api/numbering/get", (req, res) => {

    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };


    $numbering.get({
      where: {
        'company.id': site.get_company(req).id
      }
    }, (err, doc, count) => {
      if (!err && doc) {
        response.done = true
        response.doc = doc
        res.json(response)
      } else {


        let modules_list = JSON.parse(site.readFileSync(__dirname + '/site_files/json/modules_list.json'))

        modules_list.forEach(_ml => {
          _ml.screens_list.forEach(_sl => {
            _sl.type_numbering = {
              id: 4,
              "en": "Manual",
              "ar": "يدوي"
          }
          });
        });

        if (site.features.like('*erp*')) {

          let screens_list0 = modules_list[0].screens_list.filter(i => i.feature !== 'gym');
          modules_list[0].screens_list = screens_list0
          
          let screens_list4 = modules_list[4].screens_list.filter(i => i.feature !== 'restaurant' || i.feature !== 'gym');
          modules_list[4].screens_list = screens_list4

        } else if (site.features.like('*restaurant*')) {

          let screens_list0 = modules_list[0].screens_list.filter(i => i.feature !== 'gym');
          modules_list[0].screens_list = screens_list0

          let screens_list2 = modules_list[2].screens_list.filter(i => i.feature !== 'erp');
          modules_list[2].screens_list = screens_list2

          let screens_list4 = modules_list[4].screens_list.filter(i => i.feature !== 'gym');
          modules_list[4].screens_list = screens_list4

        } else if (site.features.like('*pos*')) {

          let screens_list0 = modules_list[0].screens_list.filter(i => i.feature !== 'gym');
          modules_list[0].screens_list = screens_list0

          let screens_list2 = modules_list[2].screens_list.filter(i => i.feature !== 'erp');
          modules_list[2].screens_list = screens_list2

          let screens_list4 = modules_list[4].screens_list.filter(i => i.feature !== 'restaurant' || i.feature !== 'gym');
          modules_list[4].screens_list = screens_list4

        } else if (site.features.like('*gym*')) {

          let screens_list0 = modules_list[0].screens_list.filter(i => i.feature !== 'pos');
          modules_list[0].screens_list = screens_list0
     
          let screens_list2 = modules_list[2].screens_list.filter(i => i.feature !== 'erp');
          modules_list[2].screens_list = screens_list2

          let screens_list4 = modules_list[4].screens_list.filter(i => i.feature !== 'restaurant');
          modules_list[4].screens_list = screens_list4



        }

        $numbering.add({
          "modules_list": modules_list,
          "company": site.get_company(req)
        }, (err, doc) => {
          if (!err && doc) {
            response.done = true
            response.doc = doc
            res.json(response)
          } else {
            response.error = err.message
            res.json(response)
          }
        })
      }

    })
  })

  site.post("/api/numbering/save", (req, res) => {
    let response = {
      done: false
    };

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    };

    let data = req.data


    $numbering.update(data, (err, result) => {
      if (!err) {
        response.done = true
      } else {
        response.error = err.message
      }
      res.json(response)
    })
  })
}