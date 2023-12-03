const site = require('../isite')({
  port: [80, 8080],
  lang: 'AR',
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
    db: 'SMART-CMS',
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
    let setting = site.getSiteSetting(req.host);

    if (!setting || !setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }
    if (req.host.like('*torrent*')) {
      req.session.lang = 'EN';
    } else {
      req.session.lang = 'AR';
    }
    let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

    if (!language) {
      res.redirect('/404', 404);
      return;
    }

    if (!Array.isArray(language.keyWordsList)) {
      language.keyWordsList = [];
    }

    language.description = language.description || '';

    if (setting.siteTemplate.id == 1) {
      site.articlesList = site.articlesList || [];
      let options = {
        guid: '',
        language: language,
        filter: site.getHostFilter(req.host),
        site_logo: language.logo?.url,
        page_image: language.logo?.url,
        site_name: language.siteName,
        page_lang: language.id,
        page_title: language.siteName + ' ' + language.titleSeparator + ' ' + language.siteSlogan,
        page_description: language.description.substr(0, 200),
        page_keywords: language.keyWordsList.join(','),
        categories: [],
        page: {},
      };
      options.topNews = site.getTopArticles(options.filter);
      options.setting = setting;

      options.MainSliderNews = { list: site.articlesList.filter((a) => a.host.like(options.filter) && a.showInMainSlider === true).slice(0, 10) };
      options.MainSliderNews.article = options.MainSliderNews.list[0];

      options.menuList = site.menuList
        .filter((m) => m.host.like(options.filter))
        .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == language.id)?.name || c.translatedList[0].name, url: c.$url }));

      options.menuList1 = options.menuList.slice(0, 8);
      options.menuList2 = options.menuList.slice(8, 20);
      options.menuList3 = options.menuList.slice(20);

      options.setting.mainCategoryList.forEach((c0) => {
        if ((category = site.categoryList.find((c) => c.id == c0.id && c.host.like(options.filter)))) {
          let c = {};
          c.$list = site.articlesList.filter((a) => a.host.like(options.filter) && a.category && a.category.id == category.id).slice(0, c0.limit);
          if (c0.template && c.$list.length > 0) {
            if (c0.template.id == 1) {
              c.template1 = true;
            } else if (c0.template.id == 2) {
              c.template2 = true;
            } else if (c0.template.id == 3) {
              c.template3 = true;
              c.$list0 = [c.$list.shift()];
            }
            let catLang = category.translatedList.find((t) => t.language.id == req.session.lang) || category.translatedList[0];
            c.name = catLang.name;
            c.url = '/category/' + category.id + '/' + c.name.replaceAll(' ', '+');
            options.categories.push(c);
          }
        }
      });

      res.render('theme1/index.html', options, {
        parser: 'html css js',
        compress: true,
      });
    } else {
      res.redirect('/404', 404);
    }
  }
);

site.get(
  {
    name: ['/result'],
  },
  (req, res) => {
    let setting = site.getSiteSetting(req.host);

    if (!setting || !setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }
    if (req.host.like('*torrent*')) {
      req.session.lang = 'EN';
    } else {
      req.session.lang = 'AR';
    }
    let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

    if (!language) {
      res.redirect('/404', 404);
      return;
    }

    if (!Array.isArray(language.keyWordsList)) {
      language.keyWordsList = [];
    }

    language.description = language.description || '';
    let query = req.query.search_query || '';

    if (setting.siteTemplate.id == 1) {
      site.articlesList = site.articlesList || [];
      let options = {
        guid: '',
        language: language,
        filter: site.getHostFilter(req.host),
        site_logo: language.logo?.url,
        page_image: language.logo?.url,
        site_name: language.siteName,
        page_lang: language.id,
        page_title: language.siteName + ' ' + language.titleSeparator + ' ' + req.word('Search Result') + ' ' + language.titleSeparator + ' ' + query,
        page_description: language.description.substr(0, 200),
        page_keywords: language.keyWordsList.join(','),
        categories: [],
        page: {},
      };

      options.topNews = site.getTopArticles(options.filter);
      options.setting = setting;

      options.menuList = site.menuList
        .filter((m) => m.host.like(options.filter))
        .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == language.id)?.name || c.translatedList[0].name, url: c.$url }));

      options.menuList1 = options.menuList.slice(0, 8);
      options.menuList2 = options.menuList.slice(8, 20);
      options.menuList3 = options.menuList.slice(20);

      site.searchArticles({ search: query, host: options.filter }, (err, docs) => {
        if (!err && docs) {
          options.list = docs;
          options.list1 = options.list.splice(0, 10);
          options.list2 = options.list.splice(0, 10);
          options.list3 = options.list.splice(0, 10);
          options.list4 = options.list.splice(0, 10);
          options.list5 = options.list.splice(0, 10);
        }
        res.render('theme1/result.html', options, {
          parser: 'html css js',
          compress: true,
        });
      });
    } else {
      res.redirect('/404', 404);
    }
  }
);

site.get(
  {
    name: ['/category/:id/:title', '/category/:id'],
  },
  (req, res) => {
    let setting = site.getSiteSetting(req.host);

    if (!setting || !setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }
    if (req.host.like('*torrent*')) {
      req.session.lang = 'EN';
    } else {
      req.session.lang = 'AR';
    }
    let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

    if (!language) {
      res.redirect('/404', 404);
      return;
    }

    let options = {
      guid: '',
      filter: site.getHostFilter(req.host),
      language: language,
      setting: setting,
      site_name: language.siteName,
      site_logo: language.logo?.url,
      page_image: language.logo?.url,
      page_title: language.siteName + ' ' + language.titleSeparator + ' ' + language.siteSlogan,
      page_description: language.description.substr(0, 200),
      page_keywords: language.keyWordsList.join(','),
      page_lang: language.id,
      categories: [],
      page: {},
    };

    let category = site.categoryList.find((c) => c.id == req.params.id && c.host.like(options.filter));

    if (!category) {
      res.redirect('/');
      return;
    }

    options.topNews = site.getTopArticles(options.filter, category);

    options.list = site.articlesList.filter((a) => a.host.like(options.filter) && a.category && a.category.id == category.id).slice(0, 50);
    options.list1 = options.list.splice(0, 10);
    options.list2 = options.list.splice(0, 10);
    options.list3 = options.list.splice(0, 10);
    options.list4 = options.list.splice(0, 10);
    options.list5 = options.list.splice(0, 10);

    options.MainSliderNews = {
      list: site.articlesList.filter((a) => a.showInMainSlider === true && a.host.like(options.filter) && a.category && a.category.id == category.id).slice(0, 10),
    };
    options.MainSliderNews.article = options.MainSliderNews.list[0];

    options.menuList = site.menuList
      .filter((m) => m.host.like(options.filter))
      .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == language.id)?.name || c.translatedList[0].name, url: c.$url }));
    options.menuList1 = options.menuList.slice(0, 8);
    options.menuList2 = options.menuList.slice(8, 20);
    options.menuList3 = options.menuList.slice(20);

    options.$categoryLang = category.translatedList.find((l) => l.language.id == language.id) || category.translatedList[0];
    options.categoryName = options.$categoryLang.name;
    options.page_image = options.$categoryLang.image?.url || options.site_logo;
    options.page_title = language.siteName + ' ' + language.titleSeparator + ' ' + options.$categoryLang.name;
    options.page_description = options.$categoryLang.description;

    if (setting.siteTemplate.id == 1) {
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
    name: ['/article/:guid/:title', '/post/:guid/:title', '/torrent/:guid/:title', '/article/:guid', '/a/:guid', '/post/:guid', '/torrent/:guid'],
  },
  (req, res) => {
    let filter = site.getHostFilter(req.host);
    let setting = site.getSiteSetting(req.host);

    if (!setting || !setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }

    let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];
    if (!language) {
      res.redirect('/404', 404);
      return;
    }

    if (req.params.guid == 'random') {
      let articles = site.articlesList.filter((a) => a.host.like(filter));
      let article = articles[Math.floor(Math.random() * articles.length)];
      if (article) {
        res.redirect('/article/' + article.guid + '/' + encodeURI(article.$title2));
      } else {
        res.redirect('/');
      }

      return;
    }

    site.getArticle(req.params.guid, (err, article) => {
      if (!err && article && article.host.like(filter)) {
        if (article.$yts) {
          req.session.lang = 'EN';
          language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];
        }

        if (!Array.isArray(language.keyWordsList)) {
          language.keyWordsList = [];
        }
        language.description = language.description || '';

        let options = {
          filter: filter,
          language: language,
          setting: setting,
          site_name: language.siteName,
          site_logo: language.logo?.url,
          page_image: article.$imageURL || language.logo?.url,
          page_title: language.siteName + ' ' + language.titleSeparator + ' ' + article.$title,
          page_description: article.description,
          page_keywords: language.keyWordsList.join(','),
          page_lang: language.id,
          article: article,
        };

        options.menuList = site.menuList
          .filter((m) => m.host.like(options.filter))
          .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == language.id)?.name || c.translatedList[0].name, url: c.$url }));
        options.menuList1 = options.menuList.slice(0, 8);
        options.menuList2 = options.menuList.slice(8, 20);
        options.menuList3 = options.menuList.slice(20);

        options.relatedArticleList = site.getRelatedArticles(article);
        options.latestList = site.getLatestArticles(article);
        options.topNews = site.getTopArticles(options.filter, article.category);

        res.render('theme1/article.html', options, {
          parser: 'html css js',
        });
      } else {
        res.redirect('/');
      }
    });
  }
);

site.get('ads.txt', (req, res) => {
  let setting = site.getSiteSetting(req.host);
  if (setting && setting.adsTxt) {
    res.end(setting.adsTxt);
  } else {
    res.txt('0/ads.txt');
  }
});
site.get('robots.txt', (req, res) => {
  let setting = site.getSiteSetting(req.host);
  if (setting && setting.adsTxt) {
    res.end(setting.robotsTxt);
  } else {
    res.txt('0/robots.txt');
  }
});
site.ready = false;
site.templateList = [];

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
