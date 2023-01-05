module.exports = function init(site) {
  const $articles = site.connectCollection('articles');
  site.articles_list = [];
  $articles.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.articles_list = [...site.articles_list, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'articles',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compres: true,
  });

  site.post({
    name: '/api/article_types/all',
    path: __dirname + '/site_files/json/article_types.json',
  });

  site.post({
    name: '/api/languages/all',
    path: __dirname + '/site_files/json/languages.json',
  });

  site.post('/api/articles/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let articles_doc = req.body;
    articles_doc.$req = req;
    articles_doc.$res = res;

    articles_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof articles_doc.active === 'undefined') {
      articles_doc.active = true;
    }

    $articles.add(articles_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.articles_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/articles/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let articles_doc = req.body;

    articles_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!articles_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $articles.edit(
      {
        where: {
          id: articles_doc.id,
        },
        set: articles_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.articles_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.articles_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/articles/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.articles_list.forEach((a) => {
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
  });

  site.post('/api/articles/delete', (req, res) => {
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

    $articles.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.articles_list.splice(
            site.articles_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  
  });

  site.post('/api/articles/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

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

    // site.articles_list.filter(u => u.name.contains(where['name']))

    $articles.findMany(
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
