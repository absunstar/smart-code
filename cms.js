const site = require('../isite')({
  port: [80, 8080],
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
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99'],
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
        language: lang,
        filter: site.getHostFilter(req.host),
        site_logo: lang.logo?.url,
        page_image: lang.logo?.url,
        site_name: lang.siteName,
        page_title: lang.siteName + ' ' + lang.titleSeparator + ' ' + lang.siteSlogan,
        page_description: lang.description.substr(0, 200),
        page_keywords: lang.keyWordsList.join(','),
        categories: [],
        page: {},
      };
      options.topNews = site.getTopArticles(options.filter);
      options.setting = site.setting;

      options.MainSliderNews = { list: site.articlesList.filter((a) => a.host.like(options.filter) && a.showInMainSlider === true).slice(0, 10) };
      options.MainSliderNews.article = options.MainSliderNews.list[0];

      options.menuList = site.menuList
        .filter((m) => m.host.like(options.filter))
        .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == lang.id)?.name || c.translatedList[0].name, url: c.$url }));

      options.menuList1 = options.menuList.slice(0, 8);
      options.menuList2 = options.menuList.slice(8, 20);
      options.menuList3 = options.menuList.slice(20);

      site.setting.mainCategoryList.forEach((c0) => {
        let category = site.categoriesList.find((c) => c.id == c0.id && c.host.like(options.filter));
        if (category) {
          category.$list = site.articlesList.filter((a) => a.host.like(options.filter) && a.category && a.category.id == category.id).slice(0, c0.limit);
          if (c0.template && category.$list.length > 0) {
            if (c0.template.id == 1) {
              category.template1 = true;
            } else if (c0.template.id == 2) {
              category.template2 = true;
            } else if (c0.template.id == 3) {
              category.template3 = true;
              category.$list0 = [category.$list.shift()];
            }
            category.name = category.translatedList.find((t) => t.language.id == req.session.lang)?.name || category.translatedList[0].name;
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
    options.topNews = site.getTopArticles(options.filter , category);

    options.list = site.articlesList.filter((a) => a.host.like(options.filter) && a.category && a.category.id == category.id).slice(0, 20);
    options.MainSliderNews = {
      list: site.articlesList.filter((a) => a.showInMainSlider === true && a.host.like(options.filter) && a.category && a.category.id == category.id).slice(0, 10),
    };
    options.MainSliderNews.article = options.MainSliderNews.list[0];

    options.menuList = site.menuList
      .filter((m) => m.host.like(options.filter))
      .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == lang.id)?.name || c.translatedList[0].name, url: c.$url }));
    options.menuList1 = options.menuList.slice(0, 8);
    options.menuList2 = options.menuList.slice(8, 20);
    options.menuList3 = options.menuList.slice(20);

    options.$categoryLang = category.translatedList.find((l) => l.language.id == lang.id) || category.translatedList[0];
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
    name: ['/article/:guid/:title', '/post/:guid/:title', '/article/:guid', '/a/:guid', '/post/:guid'],
  },
  (req, res) => {
    if (!site.setting.siteTemplate || !site.setting.languagesList) {
      res.redirect('/404');
      return;
    }

    let filter = site.getHostFilter(req.host);
    let article = site.articlesList.find((a) => (a.id == req.params.guid || a.guid == req.params.guid) && a.host.like(filter));

    if (!article) {
      res.redirect('/');
      return;
    }
    if (req.route.name0 == '/a/:guid' || req.route.name0 == '/post/:guid' || req.route.name0 == '/article/:guid') {
      if (article) {
        res.redirect('/article/' + article.guid + '/' + encodeURI(article.$title2));
      } else {
        res.redirect('/');
      }
      return;
    }

    if (article.$yts) {
      req.session.lang = 'en';
    }

    let lang = site.setting.languagesList.find((l) => l.id == req.session.lang) || site.setting.languagesList[0];

    if (!lang) {
      res.redirect('/404');
      return;
    }

    if (!Array.isArray(lang.keyWordsList)) {
      lang.keyWordsList = [];
    }
    lang.description = lang.description || '';

    let options = {
      filter: filter,
      language: lang,
      site_name: lang.siteName,
      site_logo: lang.logo?.url,
      page_image: article.$imageURL || lang.logo?.url,
      page_title: lang.siteName + ' ' + lang.titleSeparator + ' ' + article.$title,
      page_description: article.description,
      page_keywords: lang.keyWordsList.join(','),
      page_lang: lang.id,
      article: article,
    };

    options.menuList = site.menuList
      .filter((m) => m.host.like(options.filter))
      .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == lang.id)?.name || c.translatedList[0].name, url: c.$url }));
    options.menuList1 = options.menuList.slice(0, 8);
    options.menuList2 = options.menuList.slice(8, 20);
    options.menuList3 = options.menuList.slice(20);

    options.relatedArticleList = site.getRelatedArticles(article);
    options.latestList = site.getLatestArticles(article);
    options.setting = site.setting;
    options.topNews = site.getTopArticles(options.filter , article.category);

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

site.onGET('glx_ecfdd4d6a3041a9e7eeea5a9947936bd.txt', (req, res) => {
  res.end('Galaksion check: 86531e4391aecbe5e70d086020f703f2');
});

site.run();
