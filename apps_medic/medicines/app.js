module.exports = function init(site) {
  const $medicine = site.connectCollection("medicine")



  site.on('[company][created]', doc => {
    if (site.feature('club') || site.feature('academy')|| site.feature('school') || site.feature('medical'))
      $medicine.add({
        code: "1-Test",
        name_ar: "دواء إفتراضي",
        name_en: "Default Medicine",
        image_url: '/images/medicine.png',
        company: {
          id: doc.id,
          name_ar: doc.name_ar,
          name_en: doc.name_en
        },
        branch: {
          code: doc.branch_list[0].code,
          name_ar: doc.branch_list[0].name_ar,
          name_en: doc.branch_list[0].name_en
        },
        active: true
      }, (err, doc) => { })
  })


  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "medicine",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/medicine/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let medicine_doc = req.body
    medicine_doc.$req = req
    medicine_doc.$res = res

    medicine_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof medicine_doc.active === 'undefined') {
      medicine_doc.active = true
    }

    medicine_doc.company = site.get_company(req)
    /*     medicine_doc.branch = site.get_branch(req)
     */

    $medicine.find({
      where: {

        'company.id': site.get_company(req).id,
        $or: [{
          'name_ar': medicine_doc.name_ar
        },{
          'name_en': medicine_doc.name_en
        }]
      
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'medicines',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!medicine_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          medicine_doc.code = cb.code;
        }

        $medicine.add(medicine_doc, (err, doc) => {
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

  site.post("/api/medicine/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let medicine_doc = req.body

    medicine_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (medicine_doc.id) {
      $medicine.edit({
        where: {
          id: medicine_doc.id
        },
        set: medicine_doc,
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

  site.post("/api/medicine/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $medicine.findOne({
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

  site.post("/api/medicine/delete", (req, res) => {
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
      $medicine.delete({
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


  site.post("/api/medicine/all", (req, res) => {
    let response = {
      done: false
    }
          
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }


    let where = req.body.where || {}

    if (where['name']) {
      where['name'] = site.get_RegExp(where['name'], "i");
    }

    where['company.id'] = site.get_company(req).id
      

    $medicine.findMany({
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