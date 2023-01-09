module.exports = function init(site) {
  const $menus = site.connectCollection('menus');
  site.menu_list = [];
  $menus.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.menu_list = [...site.menu_list, ...docs];
    }
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'menus',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post({
    name: '/api/linkage_type/all',
    path: __dirname + '/site_files/json/linkage_type.json',
  });


  site.post('/api/menus/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let menus_doc = req.body;
    menus_doc.$req = req;
    menus_doc.$res = res;

    menus_doc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof menus_doc.active === 'undefined') {
      menus_doc.active = true;
    }

    if (menus_doc.linkage_type.id == 1) {
      if (!menus_doc.mainCategory || !menus_doc.mainCategory.id) {
        response.error = 'must select category';
        res.json(response);
        return;
      }
    } else if (menus_doc.linkage_type.id == 2) {
      if (!menus_doc.page || !menus_doc.page.id) {
        response.error = 'must select Page';
        res.json(response);
        return;
      }
    } else if (menus_doc.linkage_type.id == 3) {
      if (!menus_doc.external_link) {
        response.error = 'must select external link';
        res.json(response);
        return;
      }
    } else if (menus_doc.linkage_type.id == 4) {
      if (!menus_doc.internal_link) {
        response.error = 'must select internal link';
        res.json(response);
        return;
      }
    }

    $menus.add(menus_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.menu_list.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/menus/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let menus_doc = req.body;

    menus_doc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!menus_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    if (menus_doc.linkage_type.id == 1) {
      if (!menus_doc.mainCategory || !menus_doc.mainCategory.id) {
        response.error = 'must select category';
        res.json(response);
        return;
      }
    } else if (menus_doc.linkage_type.id == 2) {
      if (!menus_doc.page || !menus_doc.page.id) {
        response.error = 'must select Page';
        res.json(response);
        return;
      }
    } else if (menus_doc.linkage_type.id == 3) {
      if (!menus_doc.external_link) {
        response.error = 'must select external link';
        res.json(response);
        return;
      }
    } else if (menus_doc.linkage_type.id == 4) {
      if (!menus_doc.internal_link) {
        response.error = 'must select internal link';
        res.json(response);
        return;
      }
    }


    $menus.edit(
      {
        where: {
          id: menus_doc.id,
        },
        set: menus_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.menu_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.menu_list[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );

  });

  site.post('/api/menus/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.menu_list.forEach((a) => {
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

  site.post('/api/menus/delete', (req, res) => {
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

    $menus.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.menu_list.splice(
            site.menu_list.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );


  });

  site.post('/api/menus/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    // site.menu_list.filter(u => u.name.contains(where['name']))

    $menus.findMany(
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
