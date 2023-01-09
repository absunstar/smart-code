module.exports = function init(site) {
  const $articles = site.connectCollection('articles');
  site.articlesList = [];
  $articles.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.articlesList = [...site.articlesList, ...docs];
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
    name: '/api/articleTypes/all',
    path: __dirname + '/site_files/json/articleTypes.json',
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

    let articlesDoc = req.body;
    articlesDoc.$req = req;
    articlesDoc.$res = res;

    articlesDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof articlesDoc.active === 'undefined') {
      articlesDoc.active = true;
    }

    $articles.add(articlesDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.articlesList.push(doc);
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

    let articlesDoc = req.body;

    articlesDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!articlesDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $articles.edit(
      {
        where: {
          id: articlesDoc.id,
        },
        set: articlesDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.articlesList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.articlesList[i] = result.doc;
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
    site.articlesList.forEach((a) => {
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
          site.articlesList.splice(
            site.articlesList.findIndex((a) => a.id === req.body.id),
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

    if (req.body.search) {
      where.$or = [];
      where.$or.push(
        {
          'translatedList.title': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.content': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'keyWordsList': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'tagsList': site.get_RegExp(req.body.search, 'i'),
        }
      );
    }

    // site.articlesList.filter(u => u.name.contains(where['name']))
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
          // docs.forEach(_d => {
          //   _d.translatedList.forEach(_t => {
          //     if(_t.id == site.setting.languages_list.find((_l)=> {return _l.id == _t.id})){
          //       _d.$name = _t.name;
          //     }
          //   });
          // });

          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};
