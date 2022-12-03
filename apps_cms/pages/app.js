module.exports = function init(site) {
  const $pages = site.connectCollection('pages');
  site.page_list = [];
  $pages.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.page_list = [...site.page_list, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'pages',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.onGET('/page/:url', (req, res) => {
    let exists = false
    site.page_list.forEach(page => {
      if (page.url == req.params.url) {
        exists = true
        res.render('pages/page.html', page);
      }
    })
    if(!exists){
      res.render('pages/page.html', {});
    }
  })

  site.post('/api/pages/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let page_implement_doc = req.body;
    page_implement_doc.$req = req;
    page_implement_doc.$res = res;

    page_implement_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    $pages.add(page_implement_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.page_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/pages/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let page_implement_doc = req.body;

    page_implement_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!page_implement_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }


    $pages.edit({
      where: {
        id: page_implement_doc.id
      },
      set: page_implement_doc,
      $req: req,
      $res: res
    }, (err, result) => {
      if (!err && result) {
        response.done = true
        site.page_list.forEach((a, i) => {
          if (a.id === result.doc.id) {
            site.page_list[i] = result.doc;
          }
        });
      } else {
        response.error = 'Code Already Exist'
      }
      res.json(response)
    })

  });

  site.post('/api/pages/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.page_list.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/pages/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    if (!req.body.id) {
      response.error = 'no id';
      res.json(response);
      return;
    }

    $pages.delete({
      id: req.body.id,
      $req: req,
      $res: res
    }, (err, result) => {
      if (!err) {
        response.done = true
        site.page_list.splice(site.page_list.findIndex(a => a.id === req.body.id), 1)
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  });

  site.post('/api/pages/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    if (where['name']) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_en: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name'];
    }

    $pages.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
