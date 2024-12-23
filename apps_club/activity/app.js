module.exports = function init(site) {
  const $activity = site.connectCollection("activity")

  site.on('[company][created]', doc => {

    $activity.add({
      code: "1-Test",
      name_Ar: "خدمة/نشاط إفتراضي",
      name_En : "Default Service/Activity",
      image_url: '/images/activity.png',
      activities_price: 1,
      attend_count : 1,
      available_period : 1,
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
      active: true
    }, (err, doc) => { })
  })

  /*  site.post({
     name: "/api/period_class/all",
     path: __dirname + "/site_files/json/period_class.json"
 
   }) */

  site.post({
    name: "/api/subscriptions_system/all",
    path: __dirname + "/site_files/json/subscriptions_system.json"

  })

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.get({
    name: "activity",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/activity/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let activity_doc = req.body
    activity_doc.$req = req
    activity_doc.$res = res

    activity_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof activity_doc.active === 'undefined') {
      activity_doc.active = true
    }

    activity_doc.company = site.get_company(req)
    activity_doc.branch = site.get_branch(req)



    $activity.find({
      where: {

        'company.id': site.get_company(req).id,
        'branch.code': site.get_branch(req).code,
        $or: [{
          'name_Ar': activity_doc.name_Ar
        },{
          'name_En': activity_doc.name_En
        }]
      
      }
    }, (err, doc) => {
      if (!err && doc) {
        response.error = 'Name Exists'
        res.json(response)
      } else {

        let num_obj = {
          company: site.get_company(req),
          screen: 'activities',
          date: new Date()
        };

        let cb = site.getNumbering(num_obj);
        if (!activity_doc.code && !cb.auto) {
          response.error = 'Must Enter Code';
          res.json(response);
          return;

        } else if (cb.auto) {
          activity_doc.code = cb.code;
        }
        
        $activity.add(activity_doc, (err, doc) => {
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

  site.post("/api/activity/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let activity_doc = req.body

    activity_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (activity_doc.id) {
      $activity.edit({
        where: {
          id: activity_doc.id
        },
        set: activity_doc,
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

  site.post("/api/activity/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $activity.findOne({
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

  site.post("/api/activity/delete", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let id = req.body.id
    let data = { name: 'activity', id: req.body.id };

    site.getDataToDelete(data, callback => {

      if (callback == true) {
        response.error = 'Cant Delete Its Exist In Other Transaction'
        res.json(response)

      } else {

        if (id) {
          $activity.delete({
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
      }
    })
  })

  site.post("/api/activity/all", (req, res) => {

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
      where.$or.push({
        'name_Ar': site.get_RegExp(search, "i")
      },{
        'name_En': site.get_RegExp(search, "i")
      })
    }

    if (where.search && where.search.activities_price) {

      where['activities_price'] = where.search.activities_price
    }

    if (where.search && where.search.current) {

      where['current'] = where.search.current
    }

    delete where.search

    where['company.id'] = site.get_company(req).id

    $activity.findMany({
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