module.exports = function init(site) {
  const $lecture = site.connectCollection("lecture")

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/'
  })

  site.post({
    name: "/api/times_lecture/all",
    path: __dirname + "/site_files/json/times_lecture.json"

  })

  site.get({
    name: "lecture",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.post("/api/lecture/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let lecture_doc = req.body
    lecture_doc.$req = req
    lecture_doc.$res = res

    lecture_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof lecture_doc.active === 'undefined') {
      lecture_doc.active = true
    }

    let num_obj = {
      company: site.get_company(req),
      screen: 'lectures',
      date: new Date(lecture_doc.date)
    };

    let cb = site.getNumbering(num_obj);
    if (!lecture_doc.code && !cb.auto) {

      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      lecture_doc.code = cb.code;
    }

    lecture_doc.company = site.get_company(req)
    lecture_doc.branch = site.get_branch(req)

    $lecture.add(lecture_doc, (err, doc) => {
      if (!err) {
        response.done = true
        response.doc = doc
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  })

  site.post("/api/lecture/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let lecture_doc = req.body

    lecture_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (lecture_doc.id) {
      $lecture.edit({
        where: {
          id: lecture_doc.id
        },
        set: lecture_doc,
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

  site.post("/api/lecture/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    $lecture.findOne({
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

  site.post("/api/lecture/delete", (req, res) => {
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
      $lecture.delete({
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

  site.post("/api/lecture/all", (req, res) => {
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
    where['branch.code'] = site.get_branch(req).code


    $lecture.findMany({
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