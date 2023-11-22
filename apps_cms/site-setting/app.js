module.exports = function init(site) {
  const $siteSetting = site.connectCollection('defaultSetting');
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
      direction: 'rtl',
    },
    {
      id: 'en',
      en: 'English',
      ar: 'إنجليزي',
      direction: 'ltr',
    },
    {
      id: 'fr',
      en: 'French',
      ar: 'فرنساوي',
      direction: 'ltr',
    },
    {
      id: 'tr',
      en: 'Turki',
      ar: 'تركي',
      direction: 'rtl',
    },
  ];

  site.setting = {
    lengthOrder: 0,
    siteTemplate: { id: 1 },
    mainCategoryList: [],
    programming: {},
    languagesList: [],
    hostList: [
      { domain: '*youtube*', filter: '*youtube*|*video*|*watch*' },
      { domain: '*yts*', filter: '*yts*' },
    ],
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

  site.getHostFilter = function (domain = '') {
    let h = site.setting.hostList.find((h) => domain.like(h.domain));
    if (h) {
      return h.filter;
    } else {
      return '_';
    }
  };

  languages.forEach((l) => {
    site.setting.languagesList.push({ ...l });
  });

  $siteSetting.findOne({}, (err, doc) => {
    if (!err && doc) {
      if (!doc.article.articleTypes) {
        doc.article.articleTypes = articleTypes;
      }
      if (!doc.article.languages) {
        doc.article.languages = [...languages];
      }
      if (!doc.languagesList) {
        doc.languagesList = [...languages];
      } else {
        doc.languagesList.forEach((lang, i) => {
          if (lang.language) {
            doc.languagesList[i] = { ...doc.languagesList[i], ...languages.find((l) => l.id == lang.language.id) };
            delete doc.languagesList[i].language;
          }
          doc.languagesList[i] = { ...doc.languagesList[i], ...languages[i] };
        });
      }
      site.setting = { ...site.setting, ...doc };
    } else {
      $siteSetting.add(site.setting, (err, doc) => {
        if (!err && doc) {
          site.setting = { ...site.setting, ...doc };
        }
      });
    }
  });

  site.get(
    {
      name: 'site-setting',
    },
    (req, res) => {
      res.render('site-setting/index.html');
    },
    {
      setting: site.setting,
    },
    { parser: 'html' }
  );

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });

  site.post({
    name: '/api/publishingSystem/all',
    path: __dirname + '/site_files/json/publishingSystem.json',
  });

  site.post(
    {
      name: '/api/get-site-templates',
    },
    (req, res) => {
      res.json(site.TemplateList);
    }
  );

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
    name: '/api/closingSystem/all',
    path: __dirname + '/site_files/json/closingSystem.json',
  });

  site.post({
    name: '/api/location/all',
    path: __dirname + '/site_files/json/location.json',
  });

  site.post('/api/get-site-setting', (req, res) => {
    let response = {
      doc: site.setting,
      done: true,
    };
    res.json(response);
  });

  site.getsiteSetting = function (callback) {
    callback = callback || function () {};
    callback(site.setting);
    return site.setting;
  };

  site.post('/api/set-site-setting', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let data = req.data;

    $siteSetting.update(data, (err, result) => {
      if (!err) {
        response.done = true;
        site.setting = { ...site.setting, ...data };
        site.handleCategoryArticles();
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });
};
