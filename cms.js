const site = require('../isite')({
  port: [80, 8080],
  useLocalImages: false,
  lang: 'Ar',
  language: { id: 'Ar', dir: 'rtl', text: 'right' },
  version: Date.now(),
  name: 'cms',
  savingTime: 30,
  responseTimeout: 60,
  log: true,
  www: false,
  session: {
    enabled: !0,
    timeout: 0,
    memoryTimeout: 60,
  },
  require: {
    features: [],
    permissions: [],
  },
  theme: 'theme_paper',
  mongodb: {
    db: 'SMART-CMS',
    limit: 100,
    events: true,
    identity: {
      enabled: !0,
    },
  },
  security: {
    keys: ['e698f2679be5ba5c9c0b0031cb5b057c', '9705a3a85c1b21118532fefcee840f99', '710998fd1b7c0235170265650770a4b1', '820a6b58c2beed9f67932b476c7d8a21'],
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
    // if host not in hostManager
    let setting = site.getSiteSetting(req.host);
    // if (!setting.host) {
    //   res.redirect(site.getMainHost(req.host), 301);
    //   return;
    // }

    if (!setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }
    if (setting.mainCategoryList.length === 1) {
      req.params.id = setting.mainCategoryList[0].id;
      site.callRoute('/category/:id', req, res);
      return;
    }

    if (req.host.like('*torrent*')) {
      req.session.lang = 'En';
      req.session.language = { id: 'En', dir: 'ltr', text: 'left' };
    } else {
      req.session.lang = 'Ar';
      req.session.language = { id: 'Ar', dir: 'rtl', text: 'right' };
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
        domain: 'https://' + req.host,
        url: 'https://' + req.host + req.url,
        guid: '',
        language: language,
        filter: site.getHostFilter(req.host),
        site_logo: language.logo?.url,
        page_image: language.logo?.url,
        site_name: language.siteName,
        page_lang: language.id,
        page_type: 'website',
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
          if (req.session.lang == 'Ar') {
            c.$list.forEach((doc) => {
              doc.$date = doc.$date1;
              doc.$day = doc.$day1;
            });
          } else {
            c.$list.forEach((doc) => {
              doc.$date = doc.$date2;
              doc.$day = doc.$day2;
            });
          }
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
        shared: true,
      });
    } else {
      res.redirect('/404', 404);
    }
  }
);

site.get(
  {
    name: ['/result', '/results'],
  },
  (req, res) => {
    let setting = site.getSiteSetting(req.host);
    if (!setting.host) {
      res.redirect(site.getMainHost(req.host), 301);
      return;
    }
    if (!setting || !setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }
    if (req.host.like('*torrent*')) {
      req.session.lang = 'En';
      req.session.language = { id: 'En', dir: 'ltr', text: 'left' };
    } else {
      req.session.lang = 'Ar';
      req.session.language = { id: 'Ar', dir: 'rtl', text: 'right' };
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
    let tag = req.query.tag || '';
    if (query && query.length < 3) {
      res.redirect('/');
      return;
    }
    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 50;
    if (limit > 50) {
      limit = 50;
    }

    if (setting.siteTemplate.id == 1) {
      site.articlesList = site.articlesList || [];
      let options = {
        domain: 'https://' + req.host,
        url: 'https://' + req.host + req.url,
        guid: '',
        language: language,
        filter: site.getHostFilter(req.host),
        site_logo: language.logo?.url,
        page_image: language.logo?.url,
        site_name: language.siteName,
        page_lang: language.id,
        page_type: 'website',
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

      site.searchArticles({ search: query, tag: tag, host: options.filter, page: page, limit: limit }, (err, result) => {
        if (!err && result) {
          let list = [...result.list];

          if (req.session.lang == 'Ar') {
            list.forEach((doc) => {
              doc.$date = doc.$date1;
              doc.$day = doc.$day1;
            });
          } else {
            list.forEach((doc) => {
              doc.$date = doc.$date2;
              doc.$day = doc.$day2;
            });
          }

          options.pageCount = Math.floor(result.count / result.limit + 1);
          if (result.count > result.limit) {
            options.pagging = true;
            options.pageList = [];
            if (result.tag) {
              for (let index = 1; index < options.pageCount + 1; index++) {
                options.pageList.push({
                  name: index,
                  url: '/results?tag=' + result.tag + '&page=' + index + '&limit=' + result.limit,
                });
              }
            } else {
              for (let index = 1; index < options.pageCount + 1; index++) {
                options.pageList.push({
                  name: index,
                  url: '/results?search_query=' + result.search + '&page=' + index + '&limit=' + result.limit,
                });
              }
            }
          }

          if (result.tag) {
            options.page_title = `${language.siteName} ${language.titleSeparator} ${req.word('search results for tag ')} "${result.tag}"  ( ${result.count} articles ) [ page ${result.page} of ${
              options.pageCount
            } ]`;
          } else {
            options.page_title = `${language.siteName} ${language.titleSeparator} ${req.word('search results for ')} "${result.search}"  ( ${result.count} articles ) [ page ${result.page} of ${
              options.pageCount
            } ]`;
          }

          options.list = list;
          options.list1 = options.list.splice(0, 10);
          options.list2 = options.list.splice(0, 10);
          options.list3 = options.list.splice(0, 10);
          options.list4 = options.list.splice(0, 10);
          options.list5 = options.list.splice(0, 10);
        }
        res.render('theme1/result.html', options, {
          parser: 'html css js',
          compress: true,
          shared: true,
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
    if (!setting.host) {
      res.redirect(site.getMainHost(req.host), 301);
      return;
    }
    if (!setting || !setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }
    if (req.host.like('*torrent*')) {
      req.session.lang = 'En';
      req.session.language = { id: 'En', dir: 'ltr', text: 'left' };
    } else {
      req.session.lang = 'Ar';
      req.session.language = { id: 'Ar', dir: 'rtl', text: 'right' };
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

    let page = req.query.page ? parseInt(req.query.page) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit) : 50;
    if (limit > 50) {
      limit = 50;
    }

    if (setting.siteTemplate.id == 1) {
      site.articlesList = site.articlesList || [];
      let options = {
        domain: 'https://' + req.host,
        url: 'https://' + req.host + req.url,
        guid: '',
        language: language,
        filter: site.getHostFilter(req.host),
        site_logo: language.logo?.url,
        page_image: language.logo?.url,
        site_name: language.siteName,
        page_lang: language.id,
        page_type: 'website',
        page_title: language.siteName + ' ' + language.titleSeparator + ' ' + language.siteSlogan,
        page_description: language.description.substr(0, 200),
        page_keywords: language.keyWordsList.join(','),
        categories: [],
        page: {},
      };

      let category = site.categoryList.find((c) => c.id == req.params.id && c.host.like(options.filter));

      if (!category) {
        res.redirect('/');
        return;
      }

      options.topNews = site.getTopArticles(options.filter, category);

      options.setting = setting;

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
      options.page_description = options.$categoryLang.description || options.page_description;

      site.searchArticles({ category: category, host: options.filter, page: page, limit: limit }, (err, result) => {
        if (!err && result) {
          let list = [...result.list];

          if (req.session.lang == 'Ar') {
            list.forEach((doc) => {
              doc.$date = doc.$date1;
              doc.$day = doc.$day1;
            });
          } else {
            list.forEach((doc) => {
              doc.$date = doc.$date2;
              doc.$day = doc.$day2;
            });
          }

          options.pageCount = Math.floor(result.count / result.limit + 1);
          if (result.count > result.limit) {
            options.pagging = true;
            options.pageList = [];
            for (let index = 1; index < options.pageCount + 1; index++) {
              options.pageList.push({
                name: index,
                url: '/category/' + category.id + '/' + options.categoryName.replaceAll(' ', '-') + '?page=' + index + '&limit=' + result.limit,
              });
            }
          }

          options.page_title = `${language.siteName} ${language.titleSeparator} ${options.categoryName.replaceAll(' ', '-')} ( ${result.count} articles ) [ page ${result.page} of ${
            options.pageCount
          } ]`;

          options.list = list;
          options.list1 = options.list.splice(0, 10);
          options.list2 = options.list.splice(0, 10);
          options.list3 = options.list.splice(0, 10);
          options.list4 = options.list.splice(0, 10);
          options.list5 = options.list.splice(0, 10);
        }
        res.render('theme1/result.html', options, {
          parser: 'html css js',
          compress: true,
          shared: true,
        });
      });
    } else {
      res.redirect('/404', 404);
    }
  }
);

site.$shortLinkList = site.connectCollection('shortLinkList');
site.shortLinkList = [];
site.$shortLinkList.findMany({}, (err, docs) => {
  if (!err && docs) {
    site.shortLinkList = docs;
  }
});
site.onGET('/s/create', (req, res) => {
  let shortLink = {
    guid: site.md5(new Date().getTime().toString() + Math.random().toString()),
    url: req.query.url || 'https://social-browser.com',
    step: parseInt(req.query.step || 0),
    maxStep: parseInt(req.query.maxstep || 4),
    timeout: parseInt(req.query.timeout || 30),
  };
  site.$shortLinkList.add(shortLink, (err, doc) => {
    if (!err && doc) {
      site.shortLinkList.push(doc);
      res.end('https://' + req.host + '/s/' + doc.guid);
    }
  });
});
site.onGET('/s/:guid', (req, res) => {
  let shortLink = site.shortLinkList.find((s) => s.guid == req.params.guid) || {
    guid: req.params.guid,
    url: req.query.url || 'https://social-browser.com/download/' + site.md5(req.params.guid),
    step: 0,
    maxStep: 4,
    timeout: 30,
  };
  req.session.shortLink = { ...shortLink };
  req.session.shortLink.step = 0;
  req.session.$save();

  req.params.guid = 'random';
  site.callRoute('/article/:guid', req, res);
});

site.get(
  {
    name: ['/article/:guid/:title', '/torrent/:guid/:title', '/article/:guid', '/a/:guid', '/torrent/:guid'],
  },
  (req, res) => {
    let filter = site.getHostFilter(req.host);
    let setting = site.getSiteSetting(req.host);
    if (!setting.host) {
      res.redirect(site.getMainHost(req.host), 301);
      return;
    }
    if (!setting.siteTemplate || !setting.languageList) {
      res.redirect('/404', 404);
      return;
    }

    if (req.host.like('*torrent*')) {
      req.session.lang = 'En';
      req.session.language = { id: 'En', dir: 'ltr', text: 'left' };
    } else {
      req.session.lang = 'Ar';
      req.session.language = { id: 'Ar', dir: 'rtl', text: 'right' };
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
          req.session.lang = 'En';
          req.session.language = { id: 'En', dir: 'ltr', text: 'left' };

          language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];
        }

        if (!Array.isArray(language.keyWordsList)) {
          language.keyWordsList = [];
        }
        language.description = language.description || '';

        let options = {
          domain: 'https://' + req.host,
          url: 'https://' + req.host + req.url,
          filter: filter,
          language: language,
          setting: setting,
          site_name: language.siteName,
          site_logo: language.logo?.url,
          page_image: article.$imageURL || language.logo?.url,
          page_type: 'article',
          page_title: language.siteName + ' ' + language.titleSeparator + ' ' + article.$title,
          page_description: article.$description,
          page_keywords: article.$keyWordsList.join(','),
          page_lang: language.id,
          article: article,
        };

        if (req.headers['user-agent'] && req.headers['user-agent'].like('*facebook*|*Googlebot*|*Storebot-Google*|*AdsBot*|*Mediapartners-Google*|*Google-Safety*|*FeedFetcher*')) {
          options.page_image = '/article-image/' + article.guid;
        }

        options.menuList = site.menuList
          .filter((m) => m.host.like(options.filter))
          .map((c) => ({ id: c.id, name: c.translatedList.find((l) => l.language.id == language.id)?.name || c.translatedList[0].name, url: c.$url }));
        options.menuList1 = options.menuList.slice(0, 8);
        options.menuList2 = options.menuList.slice(8, 20);
        options.menuList3 = options.menuList.slice(20);

        options.relatedArticleList = site.getRelatedArticles(article, options.filter);
        if (req.session.lang == 'Ar') {
          options.relatedArticleList.forEach((doc) => {
            doc.$date = doc.$date1;
            doc.$day = doc.$day1;
          });
        } else {
          options.relatedArticleList.forEach((doc) => {
            doc.$date = doc.$date2;
            doc.$day = doc.$day2;
          });
        }
        options.relatedArticleList1 = options.relatedArticleList.slice(0, 8);
        options.relatedArticleList2 = options.relatedArticleList.slice(8, 16);

        options.latestList = site.getLatestArticles(article, options.filter);
        options.topNews = site.getTopArticles(options.filter, article.category);
        if (req.session.shortLink) {
          req.session.shortLink.step++;

          if (req.session.shortLink.step > req.session.shortLink.maxStep) {
            res.redirect(req.session.shortLink.url);
            req.session.shortLink = null;
            req.session.$save();
            return;
          }
          req.session.$save();
          options.shortLink = req.session.shortLink;
        }

        res.render('theme1/article.html', options, {
          parser: 'html css js',
          shared: true,
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

site.getMainHost = function (host = '') {
  let arr = host.split('.');
  if (arr.length > 1) {
    let com = arr.pop();
    let domain = arr.pop();
    return '//' + domain + '.' + com;
  }
  return host;
};

site.handleNotRoute = function (req, res) {
  let host = req.headers['host'];
  let setting = site.getSiteSetting(host);
  if (!setting.host) {
    res.redirect(site.getMainHost(host), 301);
  } else {
    res.redirect('/');
  }
};

site.run();

if ((anlytic = true)) {
  setInterval(() => {
    console.log('\n--------------------------------\n');

    console.log('databaseList : ' + site.databaseList.length);
    console.log('databaseCollectionList : ' + site.databaseCollectionList.length);

    console.log('collectionList : ' + site.collectionList.length);
    site.collectionList.forEach((c) => {
      console.log(c.name + ' taskList : ' + c.taskList.length + ' / ' + c.taskCount);
    });

    console.log('sessions.list : ' + site.sessions.list.length);
    console.log('site.articlesList : ' + site.articlesList.length);
    console.log('site.searchArticleList : ' + site.searchArticleList.length);

    let million = 1024 * 1024;
    let cpu = process.cpuUsage();
    cpu.user = Math.floor(cpu.user / million) + ' MB';
    cpu.system = Math.floor(cpu.system / million) + ' MB';
    console.log(cpu);

    for (const [key, value] of Object.entries(process.memoryUsage())) {
      console.log(`Memory usage by ${key}, ${Math.floor(value / million)} MB `);
    }

    console.log('\n--------------------------------\n');
  }, 1000 * 60 * 5);
}
