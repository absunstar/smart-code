module.exports = function init(site) {
  const $default_setting = site.connectCollection('default_setting');

  site.get({
    name: 'default_setting',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });

  site.post({
    name: '/api/place_program/all',
    path: __dirname + '/site_files/json/place_program.json',
  });

  site.post({
    name: '/api/place_qr/all',
    path: __dirname + '/site_files/json/place_qr.json',
  });

  site.post({
    name: '/api/country_qr/all',
    path: __dirname + '/site_files/json/country_qr.json',
  });

  site.post({
    name: '/api/thermal_lang/all',
    path: __dirname + '/site_files/json/thermal_lang.json',
  });

  // site.post({
  //   name: "/api/discount_method/all",
  //   path: __dirname + "/site_files/json/discount_method.json"
  // })

  site.post('/api/default_setting/get', (req, res) => {
    let response = {
      done: false,
    };

    // if (!req.session.user) {
    //   response.error = 'Please Login First'
    //   res.json(response)
    //   return
    // };

    let where = req.data.where || {};

    if (req.data.company) {
      where['company.id'] = req.data.company.id;
      where['branch.code'] = req.data.branch.code;
    } else {
      where['company.id'] = site.get_company(req).id;
      where['branch.code'] = site.get_branch(req).code;
    }

    $default_setting.find(
      {
        where: where,
      },
      (err, doc) => {
        if (!err && doc) {
          response.done = true;
          response.doc = doc;
          res.json(response);
        } else {
          let obj = {
            company: {
              id: site.get_company(req).id,
            },
            branch: {
              code: site.get_branch(req).code,
            },
            printer_program: {
              items_count_a4 : 7,
              invoice_header: [{ name: '' }],
              invoice_header2: [{ name: '' }],
              invoice_footer: [{ name: '' }],
              thermal_header: [{ name: '' }],
              thermal_footer: [{ name: '' }],
              price_offer_ar: 'نتمنى أن يحوز عرضنا قبول سيادتكم  , و نرحب بأي إستفسارات من سيادتكم و تفضلوا بقبول فائق الإحترام.',
              price_offer_en: 'We hope that our offer will be accepted by you, we welcome any inquiries from you and kindly accept with the utmost respect.',
            },
            accounting: {},
            inventory: {
              value_added: 0,
              number_best_selling: 0,
              overdraft: true,
            },
            general_Settings: {},
          };

          if (site.feature('school')) {
            obj.printer_program = {
              exam_header: [{ name: '' }],
              exam_header2: [{ name: '' }],
              exam_footer: [{ name: '' }],
            };
          }

          $default_setting.add(obj, (err, doc) => {
            if (!err && doc) {
              response.done = true;
              response.doc = doc;
              res.json(response);
            } else {
              response.error = err.message;
              res.json(response);
            }
          });
        }
      }
    );
  });

  site.getDefaultSetting = function (req, callback) {
    callback = callback || {};

    let where = {};
    where['company.id'] = site.get_company(req).id;
    where['branch.code'] = site.get_branch(req).code;
    $default_setting.findOne(
      {
        where: where,
      },
      (err, doc) => {
        if (!err && doc) callback(doc);
        else callback(false);
      }
    );
  };

  //   site.getDefaultSetting = function (callback) {
  //    $default_setting.get({
  //    }, (err, doc) => {
  //      if (!err && doc) {
  //        return callback(err, doc)
  //      }
  //    })
  //  }

  site.post('/api/default_setting/save', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let data = req.data;

    if (data.printer_program) {

      if (!data.printer_program.invoice_header) data.printer_program.invoice_header = [{ name: '' }];

      if (!data.printer_program.invoice_header2) data.printer_program.invoice_header2 = [{ name: '' }];

      if (!data.printer_program.invoice_footer) data.printer_program.invoice_footer = [{ name: '' }];

      if (!data.printer_program.thermal_header) data.printer_program.thermal_header = [{ name: '' }];

      if (!data.printer_program.thermal_footer) data.printer_program.thermal_footer = [{ name: '' }];

      if (!data.printer_program.price_offer_ar) {
        data.printer_program.price_offer_ar = 'نتمنى أن يحوز عرضنا قبول سيادتكم  , و نرحب بأي إستفسارات من سيادتكم و تفضلوا بقبول فائق الإحترام.';
      }

      if (!data.printer_program.price_offer_en) {
        data.printer_program.price_offer_en = 'We hope that our offer will be accepted by you, we welcome any inquiries from you and kindly accept with the utmost respect.';
      }
    } else {
      data.printer_program = {
        invoice_header: [{ name: '' }],
        invoice_header2: [{ name: '' }],
        invoice_footer: [{ name: '' }],
        thermal_header: [{ name: '' }],
        thermal_footer: [{ name: '' }],
      };
    }

    if (data.exams_setting) {
      if (!data.exams_setting.exam_header) data.exams_setting.exam_header = [{ name: '' }];

      if (!data.exams_setting.exam_header2) data.exams_setting.exam_header2 = [{ name: '' }];

      if (!data.exams_setting.exam_footer) data.exams_setting.exam_footer = [{ name: '' }];
    } else {
      data.exams_setting = {
        exam_header: [{ name: '' }],
        exam_header2: [{ name: '' }],
        exam_footer: [{ name: '' }],
      };
    }

    $default_setting.update(data, (err, result) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });
};
