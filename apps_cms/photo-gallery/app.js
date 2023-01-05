module.exports = function init(site) {
  const $photo_gallery = site.connectCollection('photo_gallery');
  site.photo_gallery_list = [];
  $photo_gallery.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.photo_gallery_list = [...site.photo_gallery_list, ...docs];
    }
  });

  site.get({
    name: 'photo_gallery',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/photo_gallery/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let photo_gallery_doc = req.body;
    photo_gallery_doc.$req = req;
    photo_gallery_doc.$res = res;

    photo_gallery_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof photo_gallery_doc.active === 'undefined') {
      photo_gallery_doc.active = true;
    }

    $photo_gallery.add(photo_gallery_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.photo_gallery_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/photo_gallery/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let photo_gallery_doc = req.body;

    photo_gallery_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!photo_gallery_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    
    $photo_gallery.edit(
      {
        where: {
          id: photo_gallery_doc.id,
        },
        set: photo_gallery_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.photo_gallery_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.photo_gallery_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/photo_gallery/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.photo_gallery_list.forEach((a) => {
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

  site.post('/api/photo_gallery/delete', (req, res) => {
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

    $photo_gallery.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.photo_gallery_list.splice(
            site.photo_gallery_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  });

  site.post('/api/photo_gallery/all', (req, res) => {
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

    $photo_gallery.findMany(
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
