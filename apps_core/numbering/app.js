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



  site.post('/api/numbering/get_automatic', (req, res) => {
    let response = {
      done: false,
    };

    Numbering.filter((n) => n.company.id == site.get_company(req).id)[0].modules_list.forEach(_ml => {

      if (_ml.id == req.data.search.categoryId) {
        _ml.screens_list.forEach(_sl => {
          if (_sl.id == req.data.search.screenId) {

            if (_sl.type_numbering.id == 4) {
              response.isAuto = false;
            } else {
              response.isAuto = true;
            }

          }
        });
      }

    });

    response.done = true;
    res.json(response);
  });



  site.getNumbering = function (obj) {
    let doc = null;

    function addZero(code, number) {
      let c = number - code.toString().length
      for (let i = 0; i < c; i++) {
        code = '0' + code.toString()
      }
      return code
    }


    Numbering.forEach((n, i) => {
      if (n.company.id == obj.company.id) {
        doc = Numbering[i];
      }
    });

    doc.modules_list.forEach(_ml => {
      if (_ml.id == obj.categoryId) {
        _ml.screens_list.forEach(_sl => {

          if (_sl.id == obj.screenId) {

            if (_sl.type_numbering.id == 4) {
              obj.active = false;

            } else if (_sl.type_numbering.id == 3) {
              obj.active = true;

              if (_sl.last_value == 0) {
                _sl.last_value = _sl.first_value
              } else {
                _sl.last_value = _sl.last_value + 1;

              }

              if (_sl.length_level) {
                obj.code = addZero(_sl.last_value, _sl.length_level)

              } else obj.code = _sl.last_value.toString()


            } else if (_sl.type_numbering.id == 1) {

              let y = new Date().getFullYear().toString();
              obj.active = true;

              if (_sl.years_list && _sl.years_list.length > 0) {

                let found_year = _sl.years_list.some(_yl => _yl.year == new Date(obj.date).getFullYear().toString());

                if (!found_year) {

                  let lastYIndex = _sl.years_list.length - 1
                  _sl.years_list.push({
                    year: new Date(obj.date).getFullYear().toString(),
                    first_value: _sl.years_list[lastYIndex].first_value,
                    last_value: 0,
                    length_level: _sl.years_list[lastYIndex].length_level
                  })
                }

              } else {

                _sl.years_list = [{
                  year: new Date(obj.date).getFullYear().toString(),
                  first_value: _sl.first_value || _ml.first_value || 1,
                  last_value: 0,
                  length_level: _sl.length_level || _ml.length_level || 0
                }]
              }

              _sl.years_list.map(_yl => {
                if (_yl.year == new Date(obj.date).getFullYear().toString()) {
                  found_year = true
                  if (_yl.last_value == 0) {
                    _yl.last_value = _yl.first_value
                  } else {
                    _yl.last_value = _yl.last_value + 1;

                  }

                  if (_yl.length_level) {
                    obj.code = new Date(obj.date).getFullYear().toString() + '-' + addZero(_yl.last_value, _yl.length_level)

                  } else {

                    obj.code = new Date(obj.date).getFullYear().toString() + '-' + _yl.last_value.toString()
                  }
                }
              });

            }



          }

        });
      }
    });


    $numbering.update(doc, () => { });
    return obj;
  };
};
