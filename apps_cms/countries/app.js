module.exports = function init(site) {
  const $countries = site.connectCollection('countries');
  site.countryList = [];
  $countries.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.countryList = [...site.countryList, ...docs];
    }
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

    let countriesDoc = req.body;
    countriesDoc.$req = req;
    countriesDoc.$res = res;

    countriesDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof countriesDoc.active === 'undefined') {
      countriesDoc.active = true;
    }

    $countries.add(countriesDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.countryList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
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

    let countriesDoc = req.body;

    countriesDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!countriesDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $countries.edit(
      {
        where: {
          id: countriesDoc.id,
        },
        set: countriesDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.countryList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.countryList[i] = result.doc;
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
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
    site.countryList.forEach((a) => {
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

    $countries.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          site.countryList.splice(
            site.countryList.findIndex((a) => a.id === req.body.id),
            1
          );
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/countries/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};
    let select = req.body.select || { id: 1, name: 1 };

    response.list = [];
    site.countryList.forEach((doc) => {
      if (doc && doc.translatedList) {
        if ((langDoc = doc.translatedList.find((t) => t.language.id == req.session.lang))) {
          let obj = {
            ...doc,
            ...langDoc,
          };

          for (const p in obj) {
            if (!Object.hasOwnProperty.call(select, p)) {
              delete obj[p];
            }
          }
          if (!where.active || doc.active) {
            response.list.push(obj);
          }
        }
      }
    });

    response.done = true;
    res.json(response);
  });
};
