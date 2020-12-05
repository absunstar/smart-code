module.exports = function init(site) {
  const $numbering = site.connectCollection('numbering');
  let Numbering = [];
  let moduleListCore = JSON.parse(site.readFileSync(__dirname + '/site_files/json/screens_list.json'));

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
    name: '/api/screens_list/all',
    path: __dirname + '/site_files/json/screens_list.json',
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
        _ml.type_numbering = {
          id: 4,
          en: 'Manual',
          ar: 'يدوي',
        }
      })

      let screens_list = []

      if (site.features.like('*erp*')) {
        screens_list = moduleListCore.filter((i) => i.feature !== 'restaurant' && i.feature !== 'gym' && i.feature !== 'academy' && i.feature !== 'medic');

      } else if (site.features.like('*restaurant*')) {
        screens_list = moduleListCore.filter((i) => i.feature !== 'gym' && i.feature !== 'erp' && i.feature !== 'academy' && i.feature !== 'medic');

      } else if (site.features.like('*pos*')) {
        screens_list = moduleListCore.filter((i) => i.feature !== 'gym' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'academy' && i.feature !== 'medic');

      } else if (site.features.like('*gym*')) {
        screens_list = moduleListCore.filter((i) => i.feature !== 'order' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'academy');

      } else if (site.features.like('*academy*')) {
        screens_list = moduleListCore.filter((i) => i.feature !== 'order' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'gym');

      }

      $numbering.add(
        {
          screens_list: screens_list,
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
    if (Numbering && Numbering.length > 0) {

      Numbering.filter((n) => n.company.id == site.get_company(req).id)[0].screens_list.forEach(_sl => {

        if (_sl.name == req.data.screen) {

          if (_sl.type_numbering.id == 4) {
            response.isAuto = false;
          } else {
            response.isAuto = true;
          }

        }
      });
    } else {
      response.isAuto = false;
    }

    response.done = true;
    res.json(response);
  });

  function addZero(code, number) {
    let c = number - code.toString().length
    for (let i = 0; i < c; i++) {
      code = '0' + code.toString()
    }
    return code
  }

  site.getNumbering = function (obj) {
    let doc = null;

    Numbering.forEach((n, i) => {
      if (n.company.id == obj.company.id) {
        doc = Numbering[i];
      }
    });

    doc.screens_list.forEach(_sl => {


      if (_sl.name == obj.screen) {

        if (_sl.type_numbering.id == 4) {
          obj.auto = false;
          return;
        } else if (_sl.type_numbering.id == 3) {
          obj.auto = true;

          if (!_sl.last_value) {
            _sl.last_value = _sl.first_value
          } else {
            _sl.last_value = _sl.last_value + 1;

          }

          if (_sl.length_level) {
            obj.code = (_sl.separator_symbol || '') + addZero(_sl.last_value, _sl.length_level)

          } else obj.code = (_sl.separator_symbol || '') + _sl.last_value.toString()


        } else if (_sl.type_numbering.id == 1) {

          obj.auto = true;
          if (_sl.years_list && _sl.years_list.length > 0) {

            let found_year = _sl.years_list.some(_yl => _yl.year == new Date(obj.date).getFullYear());

            if (!found_year) {

              _sl.years_list.unshift({
                year: new Date(obj.date).getFullYear(),
                first_value: _sl.years_list[0].first_value,
                last_value: 0,
                length_level: _sl.years_list[0].length_level
              })
            }

          } else {

            _sl.years_list = [{
              year: new Date(obj.date).getFullYear(),
              first_value: _sl.first_value || 1,
              last_value: 0,
              length_level: _sl.length_level || 0
            }]
          }

          _sl.years_list.forEach(_yl => {
            if (_yl.year == new Date(obj.date).getFullYear()) {
              found_year = true
              if (!_yl.last_value) {
                _yl.last_value = _yl.first_value
              } else {
                _yl.last_value = _yl.last_value + 1;

              }

              if (_yl.length_level) {
                obj.code = new Date(obj.date).getFullYear().toString() + (_yl.separator_symbol || '') + addZero(_yl.last_value, _yl.length_level)

              } else {

                obj.code = new Date(obj.date).getFullYear().toString() + (_yl.separator_symbol || '') + _yl.last_value.toString()
              }
            }
          });

        } else if (_sl.type_numbering.id == 2) {

          obj.auto = true;
          if (_sl.months_list && _sl.months_list.length > 0) {

            let found_year = _sl.months_list.some(_yl => _yl.year == new Date(obj.date).getFullYear() && _yl.month == new Date(obj.date).getMonth() + 1);

            if (!found_year) {

              _sl.months_list.unshift({
                year: new Date(obj.date).getFullYear(),
                month: new Date(obj.date).getMonth() + 1,
                first_value: _sl.months_list[0].first_value,
                last_value: 0,
                length_level: _sl.months_list[0].length_level
              })


            }

          } else {

            _sl.months_list = [{
              year: new Date(obj.date).getFullYear(),
              month: new Date(obj.date).getMonth() + 1,
              first_value: _sl.first_value || 1,
              last_value: 0,
              length_level: _sl.length_level || 0
            }]
          }

          _sl.months_list.forEach(_yl => {
            if (_yl.year == new Date(obj.date).getFullYear() && _yl.month == new Date(obj.date).getMonth() + 1) {
              found_year = true
              if (_yl.last_value == 0) {
                _yl.last_value = _yl.first_value
              } else {
                _yl.last_value = _yl.last_value + 1;

              }

              if (_yl.length_level) {
                obj.code = new Date(obj.date).getFullYear().toString() + (new Date(obj.date).getMonth() + 1) + (_yl.separator_symbol || '') + addZero(_yl.last_value, _yl.length_level)

              } else {

                obj.code = new Date(obj.date).getFullYear().toString() + (new Date(obj.date).getMonth() + 1) + (_yl.separator_symbol || '') + _yl.last_value.toString()
              }
            }
          });

        }

      }
    });


    $numbering.update(doc, () => { });
    return obj;
  };
};
