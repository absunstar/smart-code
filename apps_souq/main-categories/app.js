module.exports = function init(site) {
  const $main_categories = site.connectCollection("main_categories")
  site.main_category_list = [];
  $main_categories.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.main_category_list = [...site.main_category_list, ...docs];
    }
  });

  setInterval(() => {
    site.main_category_list.forEach((a, i) => {
      if (a.$add) {
        $main_categories.add(a, (err, doc) => {
          if (!err && doc) {
            site.main_category_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $main_categories.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $main_categories.delete({
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
    name: "main_categories",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: true
  })

  site.on('[company][created]', doc => {

    $main_categories.add({
      code: "1-Test",
      name_ar: "قسم رئيسي إفتراضي",
      name_en: "Default main Categories",
      image_url: '/images/main_categories.png',
    
      active: true
    }, (err, doc) => {
      site.call('[register][tables][add]', doc)

    })
  })

  site.post("/api/main_categories/add", (req, res) => {
    let response = {
      done: false
    }
    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let main_categories_doc = req.body
    main_categories_doc.$req = req
    main_categories_doc.$res = res

    main_categories_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (typeof main_categories_doc.active === 'undefined') {
      main_categories_doc.active = true
    }

    let num_obj = {
      screen: 'main_categories',
      date: new Date()
    };

    let cb = site.getNumbering(num_obj);
    if (!main_categories_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;

    } else if (cb.auto) {
      main_categories_doc.code = cb.code;
    }

    response.done = true;
    main_categories_doc.$add = true;
    site.main_category_list.push(main_categories_doc);
    res.json(response);
  })

  site.post("/api/main_categories/update", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let main_categories_doc = req.body

    main_categories_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res
    })

    if (!main_categories_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    main_categories_doc.$update = true;
    site.main_category_list.forEach((a, i) => {
      if (a.id === main_categories_doc.id) {
        site.main_category_list[i] = main_categories_doc;
      }
    });
    res.json(response);
  })

  site.post("/api/main_categories/view", (req, res) => {
    let response = {
      done: false
    }

    if (!req.session.user) {
      response.error = 'Please Login First'
      res.json(response)
      return
    }

    let ad = null;
    site.main_category_list.forEach((a) => {
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

  site.post("/api/main_categories/delete", (req, res) => {
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

    site.main_category_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  })

  site.post("/api/main_categories/all", (req, res) => {
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
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_en: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name']
    }
    if (where['code']) {
      where['code'] = site.get_RegExp(where['code'], "i");
    }

    $main_categories.findMany({
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