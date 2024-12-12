module.exports = function init(site) {
  const $tags = site.connectCollection('tags');
  site.tagList = [];
  $tags.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.tagList = [...site.tagList, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'tags',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/tags/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let tag_doc = req.body;
    tag_doc.$req = req;
    tag_doc.$res = res;

    tag_doc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof tag_doc.active === 'undefined') {
      tag_doc.active = true;
    }

    $tags.add(tag_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.tagList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/tags/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let tag_doc = req.body;

    tag_doc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!tag_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    
    $tags.edit(
      {
        where: {
          id: tag_doc.id,
        },
        set: tag_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.tagList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.tagList[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/tags/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.tagList.forEach((a) => {
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

  site.post('/api/tags/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    if (!req.body.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $tags.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.tagList.splice(
            site.tagList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  });

  site.post('/api/tags/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let select = req.body.select || { id: 1, name: 1 };

    response.list = [];
    site.tagList.forEach((doc) => {
      if ((langDoc = doc.translatedList.find((t) => t.language.id == req.session.lang|| 'Ar'))) {
        let obj = {
          ...doc,
          ...langDoc,
        };

        for (const p in obj) {
          if (!Object.hasOwnProperty.call(select, p)) {
            delete obj[p];
          }
        }
        if (!where.active || doc.active) {
          response.list.push(obj);
        }
      }
    });

    response.done = true;
    res.json(response);
  });

};
