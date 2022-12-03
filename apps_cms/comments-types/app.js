module.exports = function init(site) {
  const $comments_types = site.connectCollection('comments_types');
  site.comment_type_list = [];
  $comments_types.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.comment_type_list = [...site.comment_type_list, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'comments_types',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/comments_types/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let comments_types_doc = req.body;
    comments_types_doc.$req = req;
    comments_types_doc.$res = res;

    comments_types_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof comments_types_doc.active === 'undefined') {
      comments_types_doc.active = true;
    }

    $comments_types.add(comments_types_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.comment_type_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/comments_types/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let comments_types_doc = req.body;

    comments_types_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!comments_types_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

        
    $comments_types.edit({
      where: {
        id: comments_types_doc.id
      },
      set: comments_types_doc,
      $req: req,
      $res: res
    }, (err,result) => {
      if (!err && result) {
        response.done = true
        site.comment_type_list.forEach((a, i) => {
          if (a.id === result.doc.id) {
            site.comment_type_list[i] = result.doc;
          }
        });
      } else {
        response.error = 'Code Already Exist'
      }
      res.json(response)
    })

  });

  site.post('/api/comments_types/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.comment_type_list.forEach((a) => {
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

  site.post('/api/comments_types/delete', (req, res) => {
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

    $comments_types.delete({
      id: req.body.id,
      $req: req,
      $res: res
    }, (err, result) => {
      if (!err) {
        response.done = true
        site.comment_type_list.splice(site.comment_type_list.findIndex(a => a.id === req.body.id) , 1)
      } else {
        response.error = err.message
      }
      res.json(response)
    })

  });

  site.post('/api/comments_types/all', (req, res) => {
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

    $comments_types.findMany(
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
