const site = require('../isite')({
  port: [80, 40018],
  lang: 'ar',
  version: Date.now(),
  name: 'cms',
  savingTime: 5,
  log: true,
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'smart_code_cms',
    limit: 100000,
    events: true,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['21232f297a57a5a743894a0e4a801fc3', 'f6fdffe48c908deb0f4c3bd36c032e72'],
  },
});

site.time = new Date().getTime();

site.get({
  name: '/',
  path: site.dir + '/',
  public: true,
});

site.get(
  {
    name: ['/'],
  },
  (req, res) => {
    if (!site.setting.siteTemplate || !site.setting.languagesList) {
      res.redirect('/404');
      return;
    }
    let lang = site.setting.languagesList[0];
    if (!lang) {
      res.redirect('/404');
      return;
    }
    if (!Array.isArray(lang.keyWordsList)) {
      lang.keyWordsList = [];
    }
    if (site.setting.siteTemplate.id == 1) {
      site.setting.mainCategoryList.forEach((c) => {
        c.$list = site.articlesList.filter((a) => a.category && a.category.id == c.id).slice(0, c.limit);
        if (c.template) {
          c.show = true;
          if (c.template.id == 1) {
            c.template1 = true;
          } else if (c.template.id == 2) {
            c.template2 = true;
          } else if (c.template.id == 3) {
            c.template3 = true;
            c.$list0 = [c.$list.shift()];
          }
        } else {
          c, (show = false);
        }
      });

      res.render(
        'theme1/index.html',
        {
          guid: '',
          site_name: lang.siteName,
          site_logo: site.setting.siteLogo?.url,
          page_image: site.setting.siteLogo?.url,
          page_title: lang.siteName + ' ' + lang.titleSeparator + ' ' + lang.siteSlogan,
          page_description: lang.description.substr(0, 200),
          page_keywords: lang.keyWordsList.join(','),
          page_lang: lang.language.id,
          prayerTimingsList: site.setting.prayerTimingsList,
          matchScheduleList: site.setting.matchScheduleList,
          goldPricesList: site.setting.goldPricesList,
          moneyPricesList: site.setting.moneyPricesList,
          menuList1: site.menuList1,
          menuList2: site.menuList2,
          menuList3: site.menuList3,

          MainSliderNews: {
            article: site.MainSliderNews[0],
            list: site.MainSliderNews,
          },

          categories: site.setting.mainCategoryList,
          topNews: site.topNews,
          page: {},
        },
        {
          parser: 'html css js',
          compress: true,
        }
      );
    } else {
      res.redirect('/404');
    }
  }
);

site.get(
  {
    name: ['/category/:id/:title', '/category/:id'],
  },
  (req, res) => {
    if (!site.setting.siteTemplate) {
      res.redirect('/404');
      return;
    }
    let category = site.categoriesList.find((c) => c.id == req.params.id);

    if (!category) {
      res.redirect('/');
      return;
    }

    category.$MainSliderNews = site.articlesList.filter((a) => a.showInMainSlider === true && a.category && a.category.id == category.id).splice(0, 10);

    if (true || site.setting.siteTemplate.id == 1) {
      res.render(
        'theme1/category.html',
        {
          site_name: site.setting.languagesList[0].siteName,
          site_logo: site.setting.siteLogo?.url,
          page_image: category.translatedList[0].image?.url || site.setting.siteLogo?.url,
          page_title: site.setting.languagesList[0].siteName + ' ' + site.setting.languagesList[0].titleSeparator + ' ' + category.translatedList[0].name,
          page_description: category.translatedList[0].description,

          prayerTimingsList: site.setting.prayerTimingsList,
          matchScheduleList: site.setting.matchScheduleList,
          goldPricesList: site.setting.goldPricesList,
          moneyPricesList: site.setting.moneyPricesList,

          category: { name: category.translatedList[0].name },
          list: site.articlesList.filter((a) => a.category && a.category.id == category.id).slice(0, 20),

          menuList1: site.menuList1,
          menuList2: site.menuList2,
          menuList3: site.menuList3,

          MainSliderNews: {
            article: category.$MainSliderNews[0],
            list: category.$MainSliderNews,
          },
          topNews: site.topNews,
          page: {},
        },
        {
          parser: 'html css js',
        }
      );
    }
  }
);

site.get(
  {
    name: ['/article/:id/:title', '/a/:id'],
  },
  (req, res) => {
    let article = site.articlesList.find((a) => a.id == req.params.id);
    if (req.route.name0 == '/a/:id') {
      if (article) {
        res.redirect('/article/' + article.id + '/' + encodeURI(article.$title2));
      } else {
        res.redirect('/');
      }
      return;
    }

    if (!article) {
      res.redirect('/');
      return;
    }
    if (article.is_yts) {
      req.session.lang = 'en';
    }

    res.render(
      'theme1/article.html',
      {
        site_name: site.setting.languagesList[0].siteName,
        site_logo: site.setting.siteLogo?.url,
        page_image: article.imageURL || site.setting.siteLogo?.url,
        page_title: site.setting.languagesList[0].siteName + ' ' + site.setting.languagesList[0].titleSeparator + ' ' + article.$title,
        page_description: article.description,

        prayerTimingsList: site.setting.prayerTimingsList,
        matchScheduleList: site.setting.matchScheduleList,
        goldPricesList: site.setting.goldPricesList,
        moneyPricesList: site.setting.moneyPricesList,

        menuList1: site.menuList1,
        menuList2: site.menuList2,
        menuList3: site.menuList3,

        article: article,
        relatedArticleList: site.getRelatedArticles(article),
        topNews: site.topNews,
        page: {
          article: article,
        },
      },
      {
        parser: 'html css js',
      }
    );
  }
);
site.ready = false;
site.TemplateList = [];
site.loadLocalApp('client-side');
site.loadLocalApp('ui-print');
site.importApps(__dirname + '/apps_cms');
site.importApp(__dirname + '/apps_private/cloud_security', 'security');
site.importApp(__dirname + '/apps_private/ui-help');
site.importApp(__dirname + '/apps_private/notifications');
site.importApp(__dirname + '/apps_private/default_data');
site.importApp(__dirname + '/apps_private/manage-user');

site.importApp(__dirname + '/apps_private/companies');
site.addFeature('cms');

site.ready = true;

site.run();

site.on('ready', () => {
  setTimeout(() => {
    site.handleMenus();
    site.handleCategoryArticles();
  }, 1000 * 3);
});

// add sa sasa keys
site.security.addKey('c12e01f2a13ff5587e1e9e4aedb8242d');
site.security.addKey('f45731e3d39a1b2330bbf93e9b3de59e');
