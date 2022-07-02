module.exports = function init(site) {
  const $currency = site.connectCollection('currency');
  site.currency_list = [];
  $currency.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.currency_list = [...site.currency_list, ...docs];
    }
  });

  setInterval(() => {
    site.currency_list.forEach((a, i) => {
      if (a.$add) {
        $currency.add(a, (err, doc) => {
          if (!err && doc) {
            site.currency_list[i] = doc;
          }
        });
      } else if (a.$update) {
        $currency.edit({
          where: {
            id: a.id,
          },
          set: a,
        });
      } else if (a.$delete) {
        $currency.delete({
          id: a.id,
        });
      }
    });
  }, 1000 * 7);
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

 
    response.done = true;
    currency_doc.$add = true;
    site.currency_list.push(currency_doc);
    res.json(response);
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

    if (!currency_doc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }
    response.done = true;
    currency_doc.$update = true;
    site.currency_list.forEach((a, i) => {
      if (a.id === currency_doc.id) {
        site.currency_list[i] = currency_doc;
      }
    });
    res.json(response);
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

    let ad = null;
    site.currency_list.forEach((a) => {
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

  site.post('/api/currency/delete', (req, res) => {
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

    site.currency_list.forEach((a) => {
      if (req.body.id && a.id === req.body.id) {
        a.$delete = true;
      }
    });
    response.done = true;
    res.json(response);
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
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_en: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        minor_currency_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        minor_currency_en: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name']
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
