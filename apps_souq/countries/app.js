module.exports = function init(site) {
  const $countries = site.connectCollection('countries');
  site.country_list = [];
  $countries.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.country_list = [...site.country_list, ...docs];
    }
  });

  setInterval(() => {
    site.country_list.forEach((a, i) => {
      if (a.$add) {
        $countries.add(a, (err, doc) => {
          if (!err && doc) {
            site.country_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $countries.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $countries.delete({
          id: a.id,
        });
      }
    });
  }, 1000 * 7);
  site.on('[company][created]', (doc) => {
    $countries.add(
      {
        code: '1-Test',
        name_ar: 'دولة إفتراضية',
        name_en: 'Default Country',
        image_url: '/images/countries.png',

        active: true,
      },
      (err, doc) => {}
    );
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'countries',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.post('/api/countries/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let countries_doc = req.body;
    countries_doc.$req = req;
    countries_doc.$res = res;

    countries_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof countries_doc.active === 'undefined') {
      countries_doc.active = true;
    }

    let num_obj = {
      screen: 'countries',
      date: new Date(),
    };

    let cb = site.getNumbering(num_obj);
    if (!countries_doc.code && !cb.auto) {
      response.error = 'Must Enter Code';
      res.json(response);
      return;
    } else if (cb.auto) {
      countries_doc.code = cb.code;
    }

    response.done = true;
    countries_doc.$add = true;
    site.country_list.push(countries_doc);
    res.json(response);
  });

  site.post('/api/countries/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let countries_doc = req.body;

    countries_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!countries_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    countries_doc.$update = true;
    site.country_list.forEach((a, i) => {
      if (a.id === countries_doc.id) {
        site.country_list[i] = countries_doc;
      }
    });
    res.json(response);
  });

  site.post('/api/countries/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.country_list.forEach((a) => {
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

  site.post('/api/countries/delete', (req, res) => {
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

    site.country_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
  });

  site.post('/api/countries/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where['name_ar']) {
      where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');
    }

    if (where['name_en']) {
      where['name_en'] = site.get_RegExp(where['name_en'], 'i');
    }

    $countries.findMany(
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
