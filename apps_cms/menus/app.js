module.exports = function init(site) {
  const $menus = site.connectCollection('menus');
  site.menuList = [];
  $menus.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.menuList = [...site.menuList, ...docs];
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
    name: '/api/linkageType/all',
    path: __dirname + '/site_files/json/linkageType.json',
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

    let menusDoc = req.body;
    menusDoc.$req = req;
    menusDoc.$res = res;

    menusDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof menusDoc.active === 'undefined') {
      menusDoc.active = true;
    }

    if (menusDoc.linkageType.id == 1) {
      if (!menusDoc.category || !menusDoc.category.id) {
        response.error = 'must select category';
        res.json(response);
        return;
      }
    } else if (menusDoc.linkageType.id == 2) {
      if (!menusDoc.page || !menusDoc.page.id) {
        response.error = 'must select Page';
        res.json(response);
        return;
      }
    } else if (menusDoc.linkageType.id == 3) {
      if (!menusDoc.externalLink) {
        response.error = 'must select external link';
        res.json(response);
        return;
      }
    } else if (menusDoc.linkageType.id == 4) {
      if (!menusDoc.internalLink) {
        response.error = 'must select internal link';
        res.json(response);
        return;
      }
    }

    $menus.add(menusDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.menuList.push(doc);
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

    let menusDoc = req.body;

    menusDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!menusDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    if (menusDoc.linkageType.id == 1) {
      if (!menusDoc.mainCategory || !menusDoc.mainCategory.id) {
        response.error = 'must select category';
        res.json(response);
        return;
      }
    } else if (menusDoc.linkageType.id == 2) {
      if (!menusDoc.page || !menusDoc.page.id) {
        response.error = 'must select Page';
        res.json(response);
        return;
      }
    } else if (menusDoc.linkageType.id == 3) {
      if (!menusDoc.externalLink) {
        response.error = 'must select external link';
        res.json(response);
        return;
      }
    } else if (menusDoc.linkageType.id == 4) {
      if (!menusDoc.internalLink) {
        response.error = 'must select internal link';
        res.json(response);
        return;
      }
    }

    $menus.edit(
      {
        where: {
          id: menusDoc.id,
        },
        set: menusDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.menuList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.menuList[i] = result.doc;
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
    site.menuList.forEach((a) => {
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
          site.menuList.splice(
            site.menuList.findIndex((a) => a.id === req.body.id),
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

    if (req.data.lang) {
      response.list = [];
      site.menuList.forEach((doc) => {
        if ((doc2 = doc.translatedList.find((t) => t.language.id == req.session.lang)) && doc.active) {
          response.list.push({
            id: doc.id,
            name: doc2.name,
            linkageType : doc.linkageType,
            active : doc.active,
          });
        }
      });

      response.done = true;
      res.json(response);
    } else {
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
    }
  });
};
