module.exports = function init(site) {
  const $fileGallery = site.connectCollection('fileGallery');
  site.fileGalleryList = [];
  $fileGallery.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.fileGalleryList = [...site.fileGalleryList, ...docs];
    }
  });

  site.get({
    name: 'fileGallery',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/fileGallery/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let fileGalleryDoc = req.body;
    fileGalleryDoc.$req = req;
    fileGalleryDoc.$res = res;

    fileGalleryDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof fileGalleryDoc.active === 'undefined') {
      fileGalleryDoc.active = true;
    }

    $fileGallery.add(fileGalleryDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.fileGalleryList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/fileGallery/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let fileGalleryDoc = req.body;

    fileGalleryDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!fileGalleryDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $fileGallery.edit(
      {
        where: {
          id: fileGalleryDoc.id,
        },
        set: fileGalleryDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.fileGalleryList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.fileGalleryList[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/fileGallery/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.fileGalleryList.forEach((a) => {
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

  site.post('/api/fileGallery/delete', (req, res) => {
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

    $fileGallery.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.fileGalleryList.splice(
            site.fileGalleryList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/fileGallery/all', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let where = req.body.where || {};

    if (where['title']) {
      where['title'] = site.get_RegExp(where['title'], 'i');
    }

    $fileGallery.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: 1,
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
