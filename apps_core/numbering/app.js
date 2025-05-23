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
    let company = {}
    if (req.session.user) {
      company = {
        id: site.get_company(req).id,
        name_Ar: site.get_company(req).name_Ar,
        name_En: site.get_company(req).name_En
      }

    } else {
      company = {
        id: req.body.doc.id,
        name_Ar: req.body.doc.name_Ar,
        name_En: req.body.doc.name_En
      }

    }

    if (Numbering.some((n) => n.company.id == [company.id]) && !req.body.reset) {
      response.done = true;
      response.source = 'memory';
      response.doc = Numbering.filter((n) => n.company.id == company.id)[0];
      res.json(response);

    } else {

      $numbering.delete({
        'company.id': company.id
      }, (err, result) => {
        Numbering = [];
        moduleListCore.forEach((_ml) => {
          _ml.type_numbering = {
            id: 3,
            En: 'Connected',
            Ar: 'متصل',
          }

          _ml.first_value = 1
          _ml.last_value = 0
        })

        let screens_list = []

        if (site.features.like('*erp*')) {
          screens_list = moduleListCore.filter((i) => i.feature !== 'restaurant' && i.feature !== 'club' && i.feature !== 'ecommerce' && i.feature !== 'academy' && i.feature !== 'medic' && i.feature !== 'school' && i.feature !== 'medical' && i.feature !== 'lawyer');

        } else if (site.features.like('*restaurant*')) {
          screens_list = moduleListCore.filter((i) => i.feature !== 'club' && i.feature !== 'ecommerce' && i.feature !== 'erp'  && i.feature !== 'academy' && i.feature !== 'medic' && i.feature !== 'school' && i.feature !== 'medical' && i.feature !== 'lawyer');

        } else if (site.features.like('*pos*')) {
          screens_list = moduleListCore.filter((i) => i.feature !== 'club' && i.feature !== 'ecommerce' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'academy' && i.feature !== 'medic' && i.feature !== 'school' && i.feature !== 'medical' && i.feature !== 'lawyer');

        } else if (site.features.like('*ecommerce*')) {
          screens_list = moduleListCore.filter((i) => i.feature !== 'club' && i.feature !== 'pos' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'academy' && i.feature !== 'medic' && i.feature !== 'school' && i.feature !== 'medical' && i.feature !== 'lawyer');


        } else if (site.features.like('*lawyer*')) {
          screens_list = moduleListCore.filter((i) => i.feature !== 'erp' && i.feature !== 'ecommerce' && i.feature !== 'restaurant' && i.feature !== 'club' && i.feature !== 'academy' && i.feature !== 'medic' && i.feature !== 'school' && i.feature !== 'medical');



        } else if (site.features.like('*club*')) {

          moduleListCore.forEach(_mc => {
            if (_mc.name == 'order_slides') {
              _mc.En = 'Sessions Slides'
              _mc.Ar = 'شرائح الجلسات'
            }
          });
          screens_list = moduleListCore.filter((i) => i.feature !== 'order' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'academy' && i.feature !== 'school' && i.feature !== 'medical' && i.feature !== 'lawyer');

          moduleListCore.forEach(_mc => {
            if (_mc.name == 'customers') {
              _mc.En = 'Subscribers'
              _mc.Ar = 'المشتركين'
            } else if (_mc.name == 'customers_groups') {
              _mc.En = 'Subscribers Group'
              _mc.Ar = 'مجموعة المشتركين'
            }
          });






        } else if (site.features.like('*academy*')) {

          moduleListCore.forEach(_mc => {
            if (_mc.name == 'customers') {
              _mc.En = 'Students'
              _mc.Ar = 'الطلاب'
            } else if (_mc.name == 'customers_groups') {
              _mc.En = 'Students Group'
              _mc.Ar = 'مجموعة الطلاب'
            } else if (_mc.name == 'order_slides') {
              _mc.En = 'Sessions Slides'
              _mc.Ar = 'شرائح الجلسات'
            }
          });
          
          screens_list = moduleListCore.filter((i) => i.feature !== 'order' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'club' && i.feature !== 'school' && i.feature !== 'medical' && i.feature !== 'lawyer');






        } else if (site.features.like('*school*')) {
          moduleListCore.forEach(_mc => {
            if (_mc.name == 'customers') {
              _mc.En = 'Students'
              _mc.Ar = 'الطلاب'
            } else if (_mc.name == 'customers_groups') {
              _mc.En = 'Students Group'
              _mc.Ar = 'مجموعة الطلاب'
            } else if (_mc.name == 'trainer') {
              _mc.En = 'Teachers'
              _mc.Ar = 'المدرسين'
            } else if (_mc.name == 'halls') {
              _mc.En = 'classrooms'
              _mc.Ar = 'الفصول الدراسية'
            } else if (_mc.name == 'order_slides') {
              _mc.En = 'Sessions Slides'
              _mc.Ar = 'شرائح الجلسات'
            } else if (_mc.name == 'shifts') {
              _mc.En = 'School Years'
              _mc.Ar = 'الأعوام الدراسية'
            }
          });
          screens_list = moduleListCore.filter((i) => i.feature !== 'order' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'club' && i.feature !== 'academy' && i.feature !== 'medical' && i.feature !== 'lawyer');


          moduleListCore.forEach(_m => {
            if (_m.feature === 'order') {

              if (_m.name === 'vehicles') {
                screens_list.push(_m)

              } else if (_m.name === 'vehicles_types') {
                screens_list.push(_m)

              } else if (_m.name === 'delivery_employees') {
                screens_list.push(_m)
              }

            }
          });


        } else if (site.features.like('*medical*')) {
          moduleListCore.forEach(_mc => {
            if (_mc.name == 'customers') {
              _mc.En = 'patients'
              _mc.Ar = 'المرضى'
            } else if (_mc.name == 'customers_groups') {
              _mc.En = 'patients Group'
              _mc.Ar = 'مجموعة المرضى'
            } else if (_mc.name == 'order_slides') {
              _mc.En = 'Detection Slides'
              _mc.Ar = 'شرائح الكشوفات'
            }
          });

          screens_list = moduleListCore.filter((i) => i.feature !== 'order' && i.feature !== 'erp' && i.feature !== 'restaurant' && i.feature !== 'ecommerce' && i.feature !== 'club' && i.feature !== 'academy' && i.feature !== 'school' && i.feature !== 'lawyer');

          moduleListCore.forEach(_m => {
            if (_m.feature == 'medic' && _m.name != 'hall' && _m.name != 'trainer') {
              screens_list.push(_m)
            }
          });

        } else if (site.features.like('*employee*')) {

          screens_list = moduleListCore.filter((i) => i.feature !== 'order' && i.feature !== 'erp' && i.feature !== 'pos' && i.feature !== 'ecommerce' && i.feature !== 'restaurant' && i.feature !== 'club' && i.feature !== 'academy' && i.feature !== 'school' && i.feature !== 'medic' && i.feature !== 'lawyer' && i.feature !== 'medical');
          moduleListCore.forEach(_mc => {
            if (_mc.name === 'amounts_in') screens_list.push(_mc)
            else if (_mc.name === 'amounts_out') screens_list.push(_mc)
            else if (_mc.name === 'employee_advance') screens_list.push(_mc)
            else if (_mc.name === 'payment_employee_advance') screens_list.push(_mc)
            else if (_mc.name === 'safes') screens_list.push(_mc)
            else if (_mc.name === 'currencies') screens_list.push(_mc)
            else if (_mc.name === 'amounts_in_out_names') screens_list.push(_mc)
            else if (_mc.name === 'taxes_type') screens_list.push(_mc)
            else if (_mc.name === 'discounts') screens_list.push(_mc)
          });

        }

        $numbering.add(
          {
            screens_list: screens_list,
            company: company,
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
      })
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
      if (Numbering.filter((n) => n.company.id == site.get_company(req).id)[0] && Numbering.filter((n) => n.company.id == site.get_company(req).id)[0].screens_list)
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

    if (doc) {

      doc.screens_list = doc.screens_list || []
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
    } else {
      obj.auto = false
    }


    $numbering.update(doc, () => { });
    return obj;
  };
};
