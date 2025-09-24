module.exports = function init(site) {

  const $employees_insurances = site.connectCollection("hr_employees_insurances")
  
  site.get({
    name: "employees_insurances",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })


  site.post("/api/employees_insurances/add", (req, res) => {
    let response = {}
    response.done = false
      
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employees_insurances_doc = req.body
    employees_insurances_doc.$req = req
    employees_insurances_doc.$res = res
    employees_insurances_doc.add_user_info = site.security.getUserFinger({$req : req , $res : res})

    employees_insurances_doc.company = site.get_company(req)
    employees_insurances_doc.branch = site.get_branch(req)

    let num_obj = {
      company: site.get_company(req),
      screen: 'employees_insurance',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!employees_insurances_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      employees_insurances_doc.code = cb.code;
    }


    $employees_insurances.add(employees_insurances_doc, (err, _id) => {
      if (!err) {
        response.done = true
      }
      res.json(response)
    })
  })

  site.post("/api/employees_insurances/update", (req, res) => {
    let response = {}
    response.done = false
       
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let employees_insurances_doc = req.body
    employees_insurances_doc.edit_user_info = site.security.getUserFinger({$req : req , $res : res})

    if (employees_insurances_doc._id) {
      $employees_insurances.edit({
        where: {
          _id: employees_insurances_doc._id
        },
        set: employees_insurances_doc,
        $req: req,
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

  site.post("/api/employees_insurances/delete", (req, res) => {
    let response = {}
    response.done = false
       
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let _id = req.body._id


    if (_id) {
      $employees_insurances.delete({ _id: $employees_insurances.ObjectId(_id), $req: req, $res: res }, (err, result) => {
        if (!err) {
          response.done = true
        }
        res.json(response)
      })
    } else {
      res.json(response)
    }
  })

  site.post("/api/employees_insurances/view", (req, res) => {
    let response = {}
    response.done = false
           
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $employees_insurances.findOne({
      where: {
        _id: site.mongodb.ObjectID(req.body._id)
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

  site.post("/api/employees_insurances/all", (req, res) => {

    let response = {}
    response.done = false
           
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let where = req.body.where || {}

   
 
    if(where['description']) {
      where['description'] = site.get_RegExp(where['description'] , 'i')
    }
    
    
    where['company.id'] = site.get_company(req).id

    $employees_insurances.findMany({
      select: req.body.select || {},
      where: where,
      limit: req.body.limit,

      sort : {id : -1}
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