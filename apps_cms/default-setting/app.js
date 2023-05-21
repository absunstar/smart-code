module.exports = function init(site) {
  const $defaultSetting = site.connectCollection('defaultSetting');
  let articleTypes = [
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

  let languages = [
    {
      id: 'ar',
      en: 'Arabic',
      ar: 'عربي',
      active: true,
      direction: 'rtl',
    },
    {
      id: 'en',
      en: 'English',
      ar: 'إنجليزي',
      active: true,
      direction: 'ltr',
    },
    {
      id: 'fr',
      en: 'French',
      ar: 'فرنساوي',
      active: true,
      direction: 'ltr',
    },
    {
      id: 'tr',
      en: 'Turki',
      ar: 'تركي',
      active: true,
      direction: 'rtl',
    },
  ];

  site.defaultSettingDoc = {
    lengthOrder: 0,
    siteTemplate: { id: 1 },
    programming: {},
    languagesList: [],
    article: {
      articleTypes: articleTypes,
    },
    block: {},
    siteColor1: '#272727',
    siteColor2: '#d7373f',
    siteColor3: '#8bc34a',
    siteColor4: '#d9d9d9',
    siteColor5: '#000000',
    siteColor6: '#ffffff',
    siteBackground: '#ffffff',
  };
  site.setting = { ...site.defaultSettingDoc };

  languages.forEach((l) => {
    site.defaultSettingDoc.languagesList.push({ language: l });
  });

  $defaultSetting.findOne({}, (err, doc) => {
    if (!err && doc) {
      site.defaultSettingDoc = doc;
      if (!site.defaultSettingDoc.article.articleTypes) {
        site.defaultSettingDoc.article.articleTypes = articleTypes;
      }
      if (!site.defaultSettingDoc.article.languages) {
        site.defaultSettingDoc.article.languages = languages;
      }
      site.setting = { ...site.defaultSettingDoc };
    } else {
      $defaultSetting.add(site.defaultSettingDoc, (err, doc) => {
        if (!err && doc) {
          site.defaultSettingDoc = doc;
          site.setting = { ...site.defaultSettingDoc };
        }
      });
    }
  });

  site.get({
    name: 'defaultSetting',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });

  site.post({
    name: '/api/publishingSystem/all',
    path: __dirname + '/site_files/json/publishingSystem.json',
  });

  site.post({
    name: '/api/siteTemplate/all',
    path: __dirname + '/site_files/json/siteTemplate.json',
  });

  site.post({
    name: '/api/siteColor/all',
    path: __dirname + '/site_files/json/siteColor.json',
  });

  site.post({
    name: '/api/articleStatus/all',
    path: __dirname + '/site_files/json/articleStatus.json',
  });

  site.post({
    name: '/api/durationExpiry/all',
    path: __dirname + '/site_files/json/durationExpiry.json',
  });

  site.post({
    name: '/api/closing_system/all',
    path: __dirname + '/site_files/json/closingSystem.json',
  });

  site.post({
    name: '/api/location/all',
    path: __dirname + '/site_files/json/location.json',
  });

  site.post('/api/defaultSetting/get', (req, res) => {
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

  site.post('/api/defaultSetting/save', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let data = req.data;

    $defaultSetting.update(data, (err, result) => {
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
