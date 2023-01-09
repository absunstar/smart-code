module.exports = function init(site) {
  const $photoGallery = site.connectCollection('photoGallery');
  site.photoGalleryList = [];
  $photoGallery.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.photoGalleryList = [...site.photoGalleryList, ...docs];
    }
  });

  site.get({
    name: 'photoGallery',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/photoGallery/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let photoGalleryDoc = req.body;
    photoGalleryDoc.$req = req;
    photoGalleryDoc.$res = res;

    photoGalleryDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof photoGalleryDoc.active === 'undefined') {
      photoGalleryDoc.active = true;
    }

    $photoGallery.add(photoGalleryDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.photoGalleryList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/photoGallery/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let photoGalleryDoc = req.body;

    photoGalleryDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!photoGalleryDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    
    $photoGallery.edit(
      {
        where: {
          id: photoGalleryDoc.id,
        },
        set: photoGalleryDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.photoGalleryList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.photoGalleryList[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/photoGallery/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.photoGalleryList.forEach((a) => {
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

  site.post('/api/photoGallery/delete', (req, res) => {
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

    $photoGallery.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.photoGalleryList.splice(
            site.photoGalleryList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  });

  site.post('/api/photoGallery/all', (req, res) => {
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

    $photoGallery.findMany(
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
