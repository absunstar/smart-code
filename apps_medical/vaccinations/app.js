module.exports = function init(site) {
  const $vaccinations = site.connectCollection("vaccinations")

  site.post({
    name: "/api/period_vaccination/all",
    path: __dirname + "/site_files/json/period_vaccination.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "vaccinations",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', (doc) => {
    $vaccinations.add(
      {
        code: "1-Test",
        name_Ar: 'تطعيم إفتراضي',
        name_En: "Default Scan",
        price: 1,
        price_at_home: 1,
        immediate: true,
        image_url: '/images/vaccinations.png',
        company: {
          id: doc.id,
          name_Ar: doc.name_Ar,
          name_En: doc.name_En
        },
        branch: {
          code: doc.branch_list[0].code,
          name_Ar: doc.branch_list[0].name_Ar,
          name_En: doc.branch_list[0].name_En
        },
        active: true,
      },
      (err, doc1) => {

      },
    );
  });

  site.post("/api/vaccinations/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vaccinations_doc = req.body
    vaccinations_doc.$req = req
    vaccinations_doc.$res = res

    vaccinations_doc.company = site.get_company(req);
    vaccinations_doc.branch = site.get_branch(req);

    vaccinations_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof vaccinations_doc.active === 'undefined') {
      vaccinations_doc.active = true
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'vaccinations',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!vaccinations_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      vaccinations_doc.code = cb.code;
    }


    $vaccinations.find({
      where: {
     
        $or: [{
          'name_Ar': vaccinations_doc.name_Ar
        },{
          'name_En': vaccinations_doc.name_En
        }],
        'company.id': site.get_company(req).id,
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {
        $vaccinations.add(vaccinations_doc, (err, doc) => {
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

  site.post("/api/vaccinations/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let vaccinations_doc = req.body

    vaccinations_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (vaccinations_doc.id) {
      $vaccinations.edit({
        where: {
          id: vaccinations_doc.id
        },
        set: vaccinations_doc,
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

  site.post("/api/vaccinations/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $vaccinations.findOne({
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

  site.post("/api/vaccinations/delete", (req, res) => {
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
      $vaccinations.delete({
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

  site.post("/api/vaccinations/all", (req, res) => {
    let response = {
      done: false
    }

    let where = req.body.where || {}


    where['company.id'] = site.get_company(req).id
    // where['branch.code'] = site.get_branch(req).code

    if (where['name_Ar']) {
      where['name_Ar'] = new RegExp(where['name_Ar'], "i");
    }

    if (where['name_En']) {
      where['name_En'] = new RegExp(where['name_En'], "i");
    }


    $vaccinations.findMany({
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


  site.post("/api/vaccinations/searchAll", (req, res) => {
    let response = {
      done: false
    }

   

    let where = req.body.where || {}

    if (where["name"] == undefined ||where["name"] == "" ) {
     
      delete where['name']
    }
    where['company.id'] = site.get_company(req).id

    if (where['name']) {
      where.$or = []
      where.$or.push({
        'name_Ar': site.get_RegExp(where['name'], 'i')
      },{
        'name_En': site.get_RegExp(where['name'], 'i')
      }
      )
      delete where['name']
    }
      let limit = 10;
      let skip;
  
      if (req.body.page || (parseInt(req.body.page) && parseInt(req.body.page) > 1)) {
        skip = (parseInt(req.body.page) - 1) * 10
      }

    $vaccinations.findMany({
      select: req.body.select || {},
      where: where,
      sort: req.body.sort || {
        id: -1
      },
      limit: limit,
      skip: skip
    }, (err, docs, count) => {
      if (!err && docs.length>0) {
        response.done = true;
        response.list = docs;
        response.count = count;
        response.totalPages = Math.ceil(count / 10)
      } else {
        response.done = false;
        response.list = [];
        response.count = 0;
        response.totalPages = Math.ceil(count / 10)
      }
      res.json(response)
    })
  })


  // get vaccinations price
  site.post("/api/vaccinations/getvaccinationsPrice", (req, res) => {
    req.headers.language = req.headers.language || "En";
    let response = {};
    let where = req.body.where || {};
    let vaccinations = where["vaccinations"].id;

    if (!req.session.user) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;

    } else if (!req.session.user.ref_info) {
      response.message = site.word('loginFirst')[req.headers.language];
      response.done = false;
      res.json(response);
      return;
    }

    $vaccinations.aggregate(
      [
        { 
          "$match" : {
              "id" : vaccinations
          }
      }, 
      { 
          "$addFields" : {
              "price_at_vaccination_center" : "$price"
          }
      }, 
      { 
          "$project" : {
              "price_at_vaccination_center" : 1.0, 
              "price_at_home" : 1.0
          }
      }
      ],
      (err, docs) => {
        if (docs && docs.length > 0) {
          response.done = true;
          response.doc = docs[0];

          res.json(response);
        } else {
          response.done = false;

          response.doc = {};
          res.json(response);
        }
      }
    );
  });


}