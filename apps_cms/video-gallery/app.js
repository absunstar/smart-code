module.exports = function init(site) {
  const $video_gallery = site.connectCollection('video_gallery');
  site.video_gallery_list = [];
  $video_gallery.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.video_gallery_list = [...site.video_gallery_list, ...docs];
    }
  });

  site.get({
    name: 'video_gallery',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/video_gallery/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let video_gallery_doc = req.body;
    video_gallery_doc.$req = req;
    video_gallery_doc.$res = res;

    video_gallery_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof video_gallery_doc.active === 'undefined') {
      video_gallery_doc.active = true;
    }

    $video_gallery.add(video_gallery_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.video_gallery_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/video_gallery/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let video_gallery_doc = req.body;

    video_gallery_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!video_gallery_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    
    $video_gallery.edit(
      {
        where: {
          id: video_gallery_doc.id,
        },
        set: video_gallery_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.video_gallery_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.video_gallery_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/video_gallery/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.video_gallery_list.forEach((a) => {
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

  site.post('/api/video_gallery/delete', (req, res) => {
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

    $video_gallery.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.video_gallery_list.splice(
            site.video_gallery_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );

  });

  site.post('/api/video_gallery/all', (req, res) => {
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

    $video_gallery.findMany(
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
