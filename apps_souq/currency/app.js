module.exports = function init(site) {
  const $currency = site.connectCollection('currency');

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'currency',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.on('[company][created]', (doc) => {
    $currency.insertMany(
      [
        {
          name_ar: 'يوان صيني',
          name_en: 'CNY',
          minor_currency_ar: 'جياو',
          minor_currency_en: 'Jiao',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '11-Def',
       
          active: true,
        },
        {
          name_ar: 'جنيه إسترليني',
          name_en: 'GBP',
          minor_currency_ar: 'بني',
          minor_currency_en: 'Penny',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '10-Def',
         
          active: true,
        },
        {
          name_ar: 'يورو',
          name_en: 'EUR',
          minor_currency_ar: 'سنت',
          minor_currency_en: 'Cent',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '9-Def',
        
          active: true,
        },
        {
          name_ar: 'دولار أمريكي',
          name_en: 'USD',
          minor_currency_ar: 'سنت',
          minor_currency_en: 'Cent',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '8-Def',
        
          active: true,
        },
        {
          name_ar: 'دينار بحريني',
          name_en: 'BHD',
          minor_currency_ar: 'فلس',
          minor_currency_en: 'Fils',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '7-Def',
         
          active: true,
        },
        {
          name_ar: 'ريال عماني',
          name_en: 'OMR',
          minor_currency_ar: 'بيسة',
          minor_currency_en: 'Baisa',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '6-Def',
         
          active: true,
        },
        {
          name_ar: 'درهم إماراتي',
          name_en: 'AED',
          minor_currency_ar: 'فلس',
          minor_currency_en: 'Fils',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '5-Def',
        
          active: true,
        },
        {
          name_ar: 'دينار كويتي',
          name_en: 'KWD',
          minor_currency_ar: 'فلس',
          minor_currency_en: 'Fils',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '4-Def',
       
          active: true,
        },
        {
          name_ar: 'ريال قطري',
          name_en: 'QAR',
          minor_currency_ar: 'درهم',
          minor_currency_en: 'Dirham',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '3-Def',
        
          active: true,
        },
        {
          name_ar: 'جنيه مصري',
          name_en: 'EGP',
          minor_currency_ar: 'قرش',
          minor_currency_en: 'piaster',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '2-Def',
         
          active: true,
        },
        {
          name_ar: 'ريال سعودي',
          name_en: 'SR',
          minor_currency_ar: 'هللة',
          minor_currency_en: 'Halala',
          image_url: '/images/currency.png',
          ex_rate: 0,
          code: '1-Def',
        
          active: true,
        },
      ],
      (err, docs1) => {
        if (site.hasFeature('protouch')) {
          site.call('[currency][safe][add]', docs1[10]);
        } else {
          site.call('[currency][safe][add]', docs1[9]);
        }
      }
    );

    // $currency.insertMany(
    //   {
    //     name_ar: 'ريال سعودي',
    //     name_en: 'SR',
    //     minor_currency_ar: 'هللة',
    //     minor_currency_en: 'Halala',
    //     image_url: '/images/currency.png',
    //     ex_rate: 1,
    //     code: '1-Test',
    //     company: {
    //       id: doc.id,
    //       name_ar: doc.name_ar,
    //       name_en: doc.name_en,
    //     },
    //     branch: {
    //       code: doc.branch_list[0].code,
    //       name_ar: doc.branch_list[0].name_ar,
    //       name_en: doc.branch_list[0].name_en,
    //     },
    //     active: true,
    //   },
    //   (err, doc1) => {
    //     site.call('[currency][safe][add]', doc1);
    //   }
    // );
  });

  site.post('/api/currency/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let currency_doc = req.body;
    currency_doc.$req = req;
    currency_doc.$res = res;

    currency_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof currency_doc.active === 'undefined') {
      currency_doc.active = true;
    }

 
    $currency.findMany(
      {
   
      },
      (err, docs, count) => {
     
          let num_obj = {
            screen: 'currencies',
            date: new Date(),
          };

          let cb = site.getNumbering(num_obj);
          if (!currency_doc.code && !cb.auto) {
            response.error = 'Must Enter Code';
            res.json(response);
            return;
          } else if (cb.auto) {
            currency_doc.code = cb.code;
          }

          $currency.add(currency_doc, (err, doc) => {
            if (!err) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        
      }
    );
  });

  site.post('/api/currency/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let currency_doc = req.body;

    currency_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (currency_doc.id) {
      $currency.edit(
        {
          where: {
            id: currency_doc.id,
          },
          set: currency_doc,
          $req: req,
          $res: res,
        },
        (err) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/currency/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $currency.findOne(
      {
        where: {
          id: req.body.id,
        },
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/currency/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;
    let data = { name: 'currency', id: id };

    site.getAccountingDataToDelete(data, (callback) => {
      if (callback == true) {
        response.error = 'Cant Delete Currency Its Exist In Other Transaction';
        res.json(response);
      } else {
        if (id) {
          $currency.delete(
            {
              id: id,
              $req: req,
              $res: res,
            },
            (err, result) => {
              if (!err) {
                response.done = true;
              } else {
                response.error = err.message;
              }
              res.json(response);
            }
          );
        } else {
          response.error = 'no id';
          res.json(response);
        }
      }
    });
  });

  site.post('/api/currency/all', (req, res) => {
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
      where['name'] = site.get_RegExp(where['name'], 'i');
    }

    $currency.findMany(
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
