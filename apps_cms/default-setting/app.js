module.exports = function init(site) {
  const $default_setting = site.connectCollection('default_setting');
  let article_types = [
    {
      id: 1,
      en: 'Simble',
      ar: 'بسيط',
      active: true,
    },
    {
      id: 2,
      en: 'advanced',
      ar: 'متطور',
      active: true,
    },
    {
      id: 3,
      en: 'Multi-Paragraph',
      ar: 'متعدد الفقرات',
      active: true,
    },
    {
      id: 4,
      en: 'Multi-Paragraph advanced',
      ar: 'متعدد الفقرات متطور',
      active: true,
    },
    {
      id: 5,
      en: 'Multi-Image',
      ar: 'متعدد الصور',
      active: true,
    },
    {
      id: 6,
      en: 'google-news',
      ar: 'أخبار جوجل',
      active: true,
    },
    {
      id: 7,
      en: 'yts-movie',
      ar: 'yts-movie',
      active: true,
    },
  ];
  site.defaultSettingDoc = {
    length_order: 0,
    site_template: { id: 5 },
    article: {
      article_types: article_types,
    },
    programming : {},
  };
  site.setting = { ...site.defaultSettingDoc };

  $default_setting.findOne({}, (err, doc) => {
    if (!err && doc) {
      site.defaultSettingDoc = doc;
      if(!site.defaultSettingDoc.article.article_types){
        site.defaultSettingDoc.article.article_types = article_types;
      }
      site.setting = { ...site.defaultSettingDoc };
    } else {
      $default_setting.add(site.defaultSettingDoc, (err, doc) => {
        if (!err && doc) {
          site.defaultSettingDoc = doc;
          site.setting = { ...site.defaultSettingDoc };
        }
      });
    }
  });

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
    name: '/api/publishing_system/all',
    path: __dirname + '/site_files/json/publishing_system.json',
  });

  site.post({
    name: '/api/site_template/all',
    path: __dirname + '/site_files/json/site_template.json',
  });

  site.post({
    name: '/api/site_color/all',
    path: __dirname + '/site_files/json/site_color.json',
  });

  site.post({
    name: '/api/article_status/all',
    path: __dirname + '/site_files/json/article_status.json',
  });

  site.post({
    name: '/api/duration_expiry/all',
    path: __dirname + '/site_files/json/duration_expiry.json',
  });

  site.post({
    name: '/api/closing_system/all',
    path: __dirname + '/site_files/json/closing_system.json',
  });

  site.post({
    name: '/api/location/all',
    path: __dirname + '/site_files/json/location.json',
  });

  site.post('/api/default_setting/get', (req, res) => {
    let response = {
      doc: site.setting,
      done: true,
    };
    res.json(response);
  });

  site.getDefaultSetting = function (callback) {
    callback = callback || function () {};
    callback(site.setting);
    return site.setting;
  };

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

    $default_setting.update(data, (err, result) => {
      if (!err) {
        response.done = true;
        site.defaultSettingDoc = data;
        site.setting = { ...site.defaultSettingDoc };
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });
};
