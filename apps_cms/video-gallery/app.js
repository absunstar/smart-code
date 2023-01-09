module.exports = function init(site) {
  const $videoGallery = site.connectCollection('videoGallery');
  site.videoGalleryList = [];
  $videoGallery.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.videoGalleryList = [...site.videoGalleryList, ...docs];
    }
  });

  site.get({
    name: 'videoGallery',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/videoGallery/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let videoGalleryDoc = req.body;
    videoGalleryDoc.$req = req;
    videoGalleryDoc.$res = res;

    videoGalleryDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof videoGalleryDoc.active === 'undefined') {
      videoGalleryDoc.active = true;
    }

    $videoGallery.add(videoGalleryDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.videoGalleryList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/videoGallery/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let videoGalleryDoc = req.body;

    videoGalleryDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!videoGalleryDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    
    $videoGallery.edit(
      {
        where: {
          id: videoGalleryDoc.id,
        },
        set: videoGalleryDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.videoGalleryList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.videoGalleryList[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/videoGallery/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.videoGalleryList.forEach((a) => {
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

  site.post('/api/videoGallery/delete', (req, res) => {
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

    $videoGallery.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.videoGalleryList.splice(
            site.videoGalleryList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  });

  site.post('/api/videoGallery/all', (req, res) => {
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

    $videoGallery.findMany(
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
