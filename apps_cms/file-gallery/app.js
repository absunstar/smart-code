module.exports = function init(site) {
  const $file_gallery = site.connectCollection('file_gallery');
  site.file_gallery_list = [];
  $file_gallery.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.file_gallery_list = [...site.file_gallery_list, ...docs];
    }
  });

  site.get({
    name: 'file_gallery',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/file_gallery/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let file_gallery_doc = req.body;
    file_gallery_doc.$req = req;
    file_gallery_doc.$res = res;

    file_gallery_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof file_gallery_doc.active === 'undefined') {
      file_gallery_doc.active = true;
    }

    $file_gallery.add(file_gallery_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.file_gallery_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/file_gallery/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let file_gallery_doc = req.body;

    file_gallery_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!file_gallery_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $file_gallery.edit(
      {
        where: {
          id: file_gallery_doc.id,
        },
        set: file_gallery_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.file_gallery_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.file_gallery_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/file_gallery/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.file_gallery_list.forEach((a) => {
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

  site.post('/api/file_gallery/delete', (req, res) => {
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

    $file_gallery.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.file_gallery_list.splice(
            site.file_gallery_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/file_gallery/all', (req, res) => {
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

    $file_gallery.findMany(
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
