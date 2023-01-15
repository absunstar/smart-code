module.exports = function init(site) {
  const $countries = site.connectCollection('countries');
  site.country_list = [];
  $countries.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.country_list = [...site.country_list, ...docs];
    }
  });

  site.on('[country][add]', (obj) => {
    $countries.insertMany(
      [
        {
          name_ar: 'السعودية',
          name_en: 'Saudi',
          image_url: '/images/countries.png',
          code: 'ksa',
          country_code : '966',
          active: true,
        },
        {
          name_ar: 'الأردن',
          name_en: 'Jordan',
          image_url: '/images/countries.png',
          code: 'jor',
          country_code : '962',
          active: true,
        },
        {
          name_ar: 'العراق',
          name_en: 'Iraq',
          image_url: '/images/countries.png',
          code: 'irq',
          country_code : '964',
          active: true,
        },
        {
          name_ar: 'الكويت',
          name_en: 'Kuwait',
          image_url: '/images/countries.png',
          code: 'kwt',
          country_code : '965',
          active: true,
        },
        {
          name_ar: 'البحرين',
          name_en: 'Bahrain',
          image_url: '/images/countries.png',
          code: 'bah',
          country_code : '973',
          active: true,
        },
        {
          name_ar: 'قطر',
          name_en: 'Qatar',
          image_url: '/images/countries.png',
          code: 'qtr',
          country_code : '974',
          active: true,
        },
        {
          name_ar: 'الإمارات',
          name_en: 'UAE',
          image_url: '/images/countries.png',
          code: 'uae',
          country_code : '971',
          active: true,
        },
        {
          name_ar: 'عمان',
          name_en: 'Oman',
          image_url: '/images/countries.png',
          code: 'oman',
          country_code : '968',
          active: true,
        },
       /*  {
          name_ar: 'اليمن',
          name_en: 'Yemen',
          image_url: '/images/countries.png',
          code: 'ymn',
          country_code : '967',
          active: true,
        }, */
      ],
      (err, docs1) => {

        site.call('[goves][add]', docs1);


        site.gov_list.push(
          {
            $add: true,
            name_ar: 'الإحساء و المنطقة الشرقية',
            name_en: 'Ehsaa & Eastern provinc',
            image_url: '/images/gov.png',
            code: 'ep',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'نجران',
            name_en: 'Najran',
            image_url: '/images/gov.png',
            code: 'ng',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'جازان',
            name_en: 'Jazan',
            image_url: '/images/gov.png',
            code: 'jz',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'عسير',
            name_en: 'Aseer',
            image_url: '/images/gov.png',
            code: 'as',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'الباحة',
            name_en: 'Al-Baha',
            image_url: '/images/gov.png',
            code: 'bh',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'مكة المكرمة',
            name_en: 'Makkah',
            image_url: '/images/gov.png',
            code: 'mk',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'المدينة المنورة',
            name_en: 'Al-Medina',
            image_url: '/images/gov.png',
            code: 'md',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'الرياض',
            name_en: 'Riyadh',
            image_url: '/images/gov.png',
            code: 'rd',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'القصيم',
            name_en: 'Qassim',
            image_url: '/images/gov.png',
            code: 'qs',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'حائل',
            name_en: 'Al-Hail',
            image_url: '/images/gov.png',
            code: 'hl',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'الحدود الشمالية',
            name_en: 'Northern borders',
            image_url: '/images/gov.png',
            code: 'nb',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'الجوف',
            name_en: 'Al-Jouf',
            image_url: '/images/gov.png',
            code: 'jf',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          },
          {
            $add: true,
            name_ar: 'تبوك',
            name_en: 'Tabouk',
            image_url: '/images/gov.png',
            code: 'tk',
            active: true,
            country: {
              id: docs1[0].id,
              name_ar: docs1[0].name_ar,
              name_en: docs1[0].name_en,
              code: docs1[0].code,
            },
          }
        );
      }
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

    $countries.add(countries_doc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.country_list.push(doc);
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
    
    $countries.edit(
      {
        where: {
          id: countries_doc.id,
        },
        set: countries_doc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.country_list.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.country_list[i] = result.doc;
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
          site.country_list.splice(
            site.country_list.findIndex((a) => a.id === req.body.id),
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

    // if (!req.session.user) {
    //   response.error = 'Please Login First';
    //   res.json(response);
    //   return;
    // }

    let where = req.body.where || {};

    if (where['name']) {
      where.$or = [];
      where.$or.push({
        name_ar: site.get_RegExp(where['name'], 'i'),
      });
      where.$or.push({
        name_en: site.get_RegExp(where['name'], 'i'),
      });
      delete where['name'];
    }

    $countries.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: 1,
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
