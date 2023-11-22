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
    keys: ['21232f297a57a5a743894a0e4a801fc3', 'f6fdffe48c908deb0f4c3bd36c032e72', 'e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99'],
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
    let lang = site.setting.languagesList.filter((l) => l.name == req.session.lang)[0];
    if (!lang) {
      lang = site.setting.languagesList[0];
    }

    if (!lang) {
      res.redirect('/404');
      return;
    }

    if (!Array.isArray(lang.keyWordsList)) {
      lang.keyWordsList = [];
    }

    lang.description = lang.description || '';

    if (site.setting.siteTemplate.id == 1) {
      site.articlesList = site.articlesList || [];
      let options = {
        guid: '',
        lang: lang,
        filter: site.getHostFilter(req.host),
        site_logo: lang.logo?.url,
        page_image: lang.logo?.url,
        site_name: lang.siteName,
        page_title: lang.siteName + ' ' + lang.titleSeparator + ' ' + lang.siteSlogan,
        page_description: lang.description.substr(0, 200),
        page_keywords: lang.keyWordsList.join(','),
        page_lang: lang.id,
        categories: [],
        topNews: site.topNews,
        page: {},
      };
      options.topNews = site.getTopArticles(req.host);
      options.setting = site.setting;

      options.MainSliderNews = { list: site.articlesList.filter((a) => a.host.like(options.filter) && a.showInMainSlider === true).splice(0, 10) };
      options.MainSliderNews.article = options.MainSliderNews.list[0];

      options.menuList = site.menuList
        .filter((m) => m.host.like(options.filter))
        .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.name == lang.name)?.name || c.translatedList[0].name, url: c.$url }));
      options.menuList1 = options.menuList.splice(0, 8);
      options.menuList2 = options.menuList.splice(8, 20);
      options.menuList3 = options.menuList.splice(20);

      site.setting.mainCategoryList.forEach((c0) => {
        let category = site.categoriesList.find((c) => c.id == c0.id && c.host.like(options.filter));
        if (category) {
          category.$list = site.articlesList.filter((a) => a.host.like(options.filter) && a.category && a.category.id == category.id).slice(0, c0.limit);
          if (c0.template) {
            if (c0.template.id == 1) {
              category.template1 = true;
            } else if (c0.template.id == 2) {
              category.template2 = true;
            } else if (c0.template.id == 3) {
              category.template3 = true;
              category.$list0 = [category.$list.shift()];
            }
            category.name = c0.name;
            options.categories.push(category);
          }
        }
      });

      res.render('theme1/index.html', options, {
        parser: 'html css js',
        compress: true,
      });
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
    if (!site.setting.siteTemplate || !site.setting.languagesList) {
      res.redirect('/404');
      return;
    }
    let lang = site.setting.languagesList.filter((l) => l.name == req.session.lang)[0];
    if (!lang) {
      lang = site.setting.languagesList[0];
    }

    if (!lang) {
      res.redirect('/404');
      return;
    }

    let options = {
      guid: '',
      filter: site.getHostFilter(req.host),
      site_name: lang.siteName,
      site_logo: lang.logo?.url,
      page_image: lang.logo?.url,
      page_title: lang.siteName + ' ' + lang.titleSeparator + ' ' + lang.siteSlogan,
      page_description: lang.description.substr(0, 200),
      page_keywords: lang.keyWordsList.join(','),
      page_lang: lang.id,
      categories: [],
      page: {},
    };

    let category = site.categoriesList.find((c) => c.id == req.params.id && c.host.like(options.filter));

    if (!category) {
      res.redirect('/');
      return;
    }

    options.setting = site.setting;
    options.topNews = site.getTopArticles(options.filter);

    options.list = site.articlesList.filter((a) => a.host.like(options.filter) && a.category && a.category.id == category.id).splice(0, 20);
    options.MainSliderNews = {
      list: site.articlesList.filter((a) => a.showInMainSlider === true && a.host.like(options.filter) && a.category && a.category.id == category.id).splice(0, 10),
    };
    options.MainSliderNews.article = options.MainSliderNews.list[0];

    options.menuList = site.menuList
      .filter((m) => m.host.like(options.filter))
      .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.name == lang.name)?.name || c.translatedList[0].name, url: c.$url }));
    options.menuList1 = options.menuList.splice(0, 8);
    options.menuList2 = options.menuList.splice(8, 20);
    options.menuList3 = options.menuList.splice(20);

    options.$categoryLang = category.translatedList.find((t) => t.name == req.session.lang) || category.translatedList[0];
    options.categoryName = options.$categoryLang.name;
    options.page_image = options.$categoryLang.image?.url || options.site_logo;
    options.page_title = lang.siteName + ' ' + lang.titleSeparator + ' ' + options.$categoryLang.name;
    options.page_description = options.$categoryLang.description;

    if (site.setting.siteTemplate.id == 1) {
      res.render('theme1/category.html', options, {
        parser: 'html css js',
      });
    } else {
      res.redirect('/404');
      return;
    }
  }
);

site.get(
  {
    name: ['/article/:id/:title', '/a/:id'],
  },
  (req, res) => {
    if (!site.setting.siteTemplate || !site.setting.languagesList) {
      res.redirect('/404');
      return;
    }
    let lang = site.setting.languagesList.filter((l) => l.name == req.session.lang)[0];
    if (!lang) {
      lang = site.setting.languagesList[0];
    }

    if (!lang) {
      res.redirect('/404');
      return;
    }
    if (!Array.isArray(lang.keyWordsList)) {
      lang.keyWordsList = [];
    }
    lang.description = lang.description || '';

    let article = site.articlesList.find((a) => a.id == req.params.id || a.guid == req.params.id);
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

    let options = {
      filter: site.getHostFilter(req.host),
      direction: req.session.lang.like('ar') ? 'rtl' : 'ltr',
      site_name: lang.siteName,
      site_logo: lang.logo?.url,
      page_image: article.imageURL || lang.logo?.url,
      page_title: lang.siteName + ' ' + lang.titleSeparator + ' ' + article.$title,
      page_description: article.description,
      page_keywords: lang.keyWordsList.join(','),
      page_lang: lang.id,
      article: article,
    };

    options.menuList = site.menuList
      .filter((m) => m.host.like(options.filter))
      .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.name == lang.name)?.name || c.translatedList[0].name, url: c.$url }));
    options.menuList1 = options.menuList.splice(0, 8);
    options.menuList2 = options.menuList.splice(8, 20);
    options.menuList3 = options.menuList.splice(20);

    options.relatedArticleList = site.getRelatedArticles(article);
    options.latestList = site.getLatestArticles(article);
    options.setting = site.setting;
    options.topNews = site.getTopArticles(req.host);

    res.render('theme1/article.html', options, {
      parser: 'html css js',
    });
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
