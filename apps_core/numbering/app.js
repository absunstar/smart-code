module.exports = function init(site) {
  const $numbering = site.connectCollection('numbering');
  let Numbering = [];
  let moduleListCore = JSON.parse(site.readFileSync(__dirname + '/site_files/json/modules_list.json'));

  $numbering.findAll({}, (err, docs) => {
    if (!err && docs) {
      Numbering = docs;
    }
  });

  site.get({
    name: 'numbering',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: '/api/modules_list/all',
    path: __dirname + '/site_files/json/modules_list.json',
  });

  site.post({
    name: '/api/type_numbering/all',
    path: __dirname + '/site_files/json/type_numbering.json',
  });

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });

  site.post('/api/numbering/get', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    if (Numbering.some((n) => n.company.id == [site.get_company(req).id])) {
      response.done = true;
      response.source = 'memory';
      response.doc = Numbering.filter((n) => n.company.id == site.get_company(req).id)[0];
      res.json(response);
    } else {
      moduleListCore.forEach((_ml) => {
        _ml.screens_list.forEach((_sl) => {
          _sl.type_numbering = {
            id: 4,
            en: 'Manual',
            ar: 'يدوي',
          };
        });
      });

      if (site.features.like('*erp*')) {
        let screens_list0 = moduleListCore[0].screens_list.filter((i) => i.feature !== 'gym');
        moduleListCore[0].screens_list = screens_list0;

        let screens_list4 = moduleListCore[4].screens_list.filter((i) => i.feature !== 'restaurant' || i.feature !== 'gym');
        moduleListCore[4].screens_list = screens_list4;
      } else if (site.features.like('*restaurant*')) {
        let screens_list0 = moduleListCore[0].screens_list.filter((i) => i.feature !== 'gym');
        moduleListCore[0].screens_list = screens_list0;

        let screens_list2 = moduleListCore[2].screens_list.filter((i) => i.feature !== 'erp');
        moduleListCore[2].screens_list = screens_list2;

        let screens_list4 = moduleListCore[4].screens_list.filter((i) => i.feature !== 'gym');
        moduleListCore[4].screens_list = screens_list4;
      } else if (site.features.like('*pos*')) {
        let screens_list0 = moduleListCore[0].screens_list.filter((i) => i.feature !== 'gym');
        moduleListCore[0].screens_list = screens_list0;

        let screens_list2 = moduleListCore[2].screens_list.filter((i) => i.feature !== 'erp');
        moduleListCore[2].screens_list = screens_list2;

        let screens_list4 = moduleListCore[4].screens_list.filter((i) => i.feature !== 'restaurant' || i.feature !== 'gym');
        moduleListCore[4].screens_list = screens_list4;
      } else if (site.features.like('*gym*')) {
        let screens_list0 = moduleListCore[0].screens_list.filter((i) => i.feature !== 'pos');
        moduleListCore[0].screens_list = screens_list0;

        let screens_list2 = moduleListCore[2].screens_list.filter((i) => i.feature !== 'erp');
        moduleListCore[2].screens_list = screens_list2;

        let screens_list4 = moduleListCore[4].screens_list.filter((i) => i.feature !== 'restaurant');
        moduleListCore[4].screens_list = screens_list4;
      }

      $numbering.add(
        {
          modules_list: moduleListCore,
          company: site.get_company(req),
        },
        (err, doc) => {
          if (!err && doc) {
            Numbering.push(doc);
            response.done = true;
            response.source = 'db';
            response.doc = doc;
            res.json(response);
          } else {
            response.error = err.message;
            res.json(response);
          }
        },
      );
    }
  });

  site.post('/api/numbering/save', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let data = req.data;

    $numbering.update(data, (err, result) => {
      if (!err) {
        Numbering.forEach((n, i) => {
          if (n.company.id == result.doc.company.id) {
            Numbering[i] = result.doc;
          }
        });
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/numbering/get_type', (req, res) => {
    let response = {
      done: false,
    };

    if (Numbering.filter((n) => n.company.id == site.get_company(req).id)[0].modules_list[req.data.search.categoryI - 1].screens_list[req.data.search.screenI - 1].type_numbering.id == 4) {
      response.done = true;
      response.doc = false;
    } else {
      response.doc = true;
    }
    res.json(response);
  });

  site.getNumbering = function (obj) {
    let categoryI = obj.categoryI - 1;
    let screenI = obj.screenI - 1;
    let doc= null;

    Numbering.forEach((n, i) => {
      if (n.company.id ==  obj.company.id) {
        doc = Numbering[i];
      }
    });

    if (doc.modules_list[categoryI].screens_list[screenI].last_value === 0) {
      doc.modules_list[categoryI].screens_list[screenI].last_value = doc.modules_list[categoryI].screens_list[screenI].first_value;
    } else {
      doc.modules_list[categoryI].screens_list[screenI].last_value = doc.modules_list[categoryI].screens_list[screenI].last_value + 1;
    }

    if (doc.modules_list[categoryI].screens_list[screenI].type_numbering.id === 1) {
      obj.active = false;
    } else if (doc.modules_list[categoryI].screens_list[screenI].type_numbering.id === 2) {
      // let y = new Date().getFullYear().toString()
      // let m = new Date().getMonth().toString()
      obj.active = false;
    } else if (doc.modules_list[categoryI].screens_list[screenI].type_numbering.id === 3) {
      obj.code = doc.modules_list[categoryI].screens_list[screenI].last_value.toString();

      obj.active = true;
    } else if (doc.modules_list[categoryI].screens_list[screenI].type_numbering.id === 4) {
      obj.active = false;

      
    }

    $numbering.update(doc, () => {});
    return obj;
  };
};
