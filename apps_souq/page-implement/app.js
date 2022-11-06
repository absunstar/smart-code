module.exports = function init(site) {
  const $page_implement = site.connectCollection('page_implement');
  site.page_implement_list = [];
  $page_implement.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.page_implement_list = [...site.page_implement_list, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'page_implement',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.onGET('/pages/:url', (req, res) => {
    site.page_implement_list.forEach(page => {
      if (page.url == req.params.url) {
        res.render('page-implement/page.html', page);
      }
    })

  })

  site.post('/api/page_implement/add', (req, res) => {
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

    $page_implement.add(page_implement_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.page_implement_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/page_implement/update', (req, res) => {
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


    $page_implement.edit({
      where: {
        id: page_implement_doc.id
      },
      set: page_implement_doc,
      $req: req,
      $res: res
    }, (err, result) => {
      if (!err && result) {
        response.done = true
        site.page_implement_list.forEach((a, i) => {
          if (a.id === result.doc.id) {
            site.page_implement_list[i] = result.doc;
          }
        });
      } else {
        response.error = 'Code Already Exist'
      }
      res.json(response)
    })

  });

  site.post('/api/page_implement/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.page_implement_list.forEach((a) => {
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

  site.post('/api/page_implement/delete', (req, res) => {
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

    $page_implement.delete({
      id: req.body.id,
      $req: req,
      $res: res
    }, (err, result) => {
      if (!err) {
        response.done = true
        site.page_implement_list.splice(site.page_implement_list.findIndex(a => a.id === req.body.id), 1)
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  });

  site.post('/api/page_implement/all', (req, res) => {
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

    $page_implement.findMany(
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
