module.exports = function init(site) {
  const $articles = site.connectCollection('articles');
  site.articlesList = [];
  site.days = [{ nameAr: 'الاحد' }, { nameAr: 'الاثنين' }, { nameAr: 'الثلاثاء' }, { nameAr: 'الاربعاء' }, { nameAr: 'الخميس' }, { nameAr: 'الجمعة' }, { nameAr: 'السبت' }];
  site.monthes = [
    { nameAr: 'يناير' },
    { nameAr: 'فبراير' },
    { nameAr: 'مارس' },
    { nameAr: 'ابريل' },
    { nameAr: 'مايو' },
    { nameAr: 'يونيو' },
    { nameAr: 'يوليو' },
    { nameAr: 'أغسطس' },
    { nameAr: 'سبتمر' },
    { nameAr: 'أكتوبر' },
    { nameAr: 'نوقمير' },
    { nameAr: 'ديسمبر' },
  ];
  site.escapeHtml = function (unsafe) {
    if (!unsafe) {
      return '';
    }
    return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  };

  site.handleArticle = function (doc) {
    doc.title = site.escapeHtml(doc.translatedList[0].title);
    doc.title2 = doc.title.split(' ').join('-');
    doc.imageURL = doc.translatedList[0].image?.url || '/theme1/images/news.jpg';
    if (doc.type.id === 2) {
      doc.content = doc.translatedList[0].htmlContent;
    } else {
      doc.content = doc.translatedList[0].textContent || doc.translatedList[0].htmlContent;
    }
    doc.description = site.escapeHtml(doc.content);
    doc.publishDate = doc.publishDate || new Date();
    doc.date = doc.publishDate.getDate() + ' ' + (site.monthes[doc.publishDate.getMonth()]?.nameAr || 'شهر غير معروف') + ' ' + doc.publishDate.getFullYear();
    doc.day = site.days[doc.publishDate.getDay()]?.nameAr || 'يوم غير معروف';
    doc.hasAudio = false;
    doc.hasVideo = false;
    doc.hasImageGallary = false;
    doc.hasMenu = false;
    doc.menuClass = 'none';

    doc.audioClass = 'none';
    doc.videoClass = 'none';
    doc.imageGallaryClass = 'none';
    if (doc.translatedList[0].hasAudio) {
      doc.hasAudio = true;
      doc.audio = doc.translatedList[0].audio;
      doc.audioClass = '';
    }

    if (doc.translatedList[0].hasVideo) {
      doc.hasVideo = true;
      doc.video = doc.translatedList[0].video;
      doc.videoClass = '';
    }
    doc.readingTimeClass = 'none';
    doc.hasReadingTime = false;
    if (doc.translatedList[0].hasReadingTime) {
      doc.hasReadingTime = true;
      doc.readingTime = doc.translatedList[0].readingTime;
      doc.readingTimeClass = '';
    }

    if (doc.writer) {
      doc.hasWriter = true;
      doc.writer.name = doc.writer.profile.name + ' ' + doc.writer.profile.lastName;
      doc.writer.title = doc.writer.profile.title;
      doc.writer.imageURL = doc.writer.image?.url || doc.writer.profile.imageURL;
    }
    return doc;
  };

  function prepareArticles() {
    $articles.findMany({ sort: { id: -1 }, limit: 1000 }, (err, docs) => {
      if (!err && docs) {
        docs.forEach((doc) => {
          if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
            site.articlesList.push(site.handleArticle({ ...doc }));
          }
        });
      }
      prepareUrgentArticles();
      prepareSliderArticles();
    });
  }

  function prepareUrgentArticles() {
    $articles.findMany({ where: { appearInUrgent: true }, sort: { id: -1 }, limit: 1000 }, (err, docs) => {
      if (!err && docs) {
        docs.forEach((doc) => {
          if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
            site.articlesList.push(site.handleArticle({ ...doc }));
          }
        });
      }
      site.articlesList.sort((a, b) => {
        return b.id - a.id;
      });
      site.topNews = site.articlesList
        .filter((a) => a.appearInUrgent === true)
        .map((a) => ({ id: a.id, title: a.title, title2: a.title2 }))
        .splice(0, 10)
        .reverse();
    });
  }
  function prepareSliderArticles() {
    $articles.findMany({ where: { showInMainSlider: true }, sort: { id: -1 }, limit: 50 }, (err, docs) => {
      if (!err && docs) {
        docs.forEach((doc) => {
          if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
            site.articlesList.push(site.handleArticle({ ...doc }));
          }
        });
      }
      site.articlesList.sort((a, b) => {
        return b.id - a.id;
      });
      site.MainSliderNews = site.articlesList.filter((a) => a.showInMainSlider === true).splice(0, 10);
    });
  }

  prepareArticles();

  site.handleCategoryArticles = function () {
    site.$$categories = [];

    site.menuList1 = site.categoriesList.map((c) => ({ id: c.id, name: c.translatedList[0].name })).splice(0, 8);
    site.menuList2 = site.categoriesList.map((c) => ({ id: c.id, name: c.translatedList[0].name })).splice(8, 20);
    site.menuList3 = site.categoriesList.map((c) => ({ id: c.id, name: c.translatedList[0].name })).splice(20);

    site.categoriesList.forEach((cat) => {
      $articles.findMany({ where: { 'category.id': cat.id }, sort: { id: -1 }, limit: 50 }, (err, docs) => {
        if (!err && docs) {
          docs.forEach((doc) => {
            if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
              site.articlesList.push(site.handleArticle({ ...doc }));
            }
          });

          site.articlesList.sort((a, b) => {
            return b.id - a.id;
          });

          if (site.setting.mainCategoryList && (_cat = site.setting.mainCategoryList.find((c) => c.id == cat.id))) {
            _cat = {
              ..._cat,
              index: site.setting.mainCategoryList.findIndex((c) => c.id == cat.id),
              id: cat.id,
              show: cat.showInHomePage,
              name: cat.translatedList[0].name,
              limit: cat.homePageLimit || 10,
              list: cat.$list,
            };
            _cat.list = site.articlesList.filter((a) => a.category.id == _cat.id).slice(0, _cat.limit);

            if (_cat.list.length > 0 && _cat.template) {
              if (_cat.template.id == 1) {
                _cat.template1 = true;
              } else if (_cat.template.id == 2) {
                _cat.template2 = true;
              } else if (_cat.template.id == 3) {
                _cat.template3 = true;
                _cat.list0 = [_cat.list.shift()];
              }
              site.$$categories.push(_cat);
            }
            site.$$categories.sort((a, b) => {
              return a.index - b.index;
            });
          }
        }
      });
    });
  };

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  // site.get({
  //   name: 'articles',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compres: true,
  // });
  site.get(
    {
      name: 'articles',
    },
    (req, res) => {
      res.render('articles' + '/index.html', { title: 'articles', appName: '##word.Articles##', setting: site.setting }, { parser: 'html', compres: true });
    }
  );

  site.post({
    name: '/api/articleTypes/all',
    path: __dirname + '/site_files/json/articleTypes.json',
  });

  site.post({
    name: '/api/languages/all',
    path: __dirname + '/site_files/json/languages.json',
  });

  site.post('/api/articles/add', (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let articlesDoc = req.body;
    articlesDoc.$req = req;
    articlesDoc.$res = res;

    articlesDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (typeof articlesDoc.active === 'undefined') {
      articlesDoc.active = true;
    }

    $articles.add(articlesDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.articlesList.unshift(doc);
        site.handleCategoryArticles();
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/articles/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let articlesDoc = req.body;

    articlesDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    if (!articlesDoc.id) {
      response.error = 'No id';
      res.json(response);
      return;
    }

    $articles.edit(
      {
        where: {
          id: articlesDoc.id,
        },
        set: articlesDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          let index = site.articlesList.findIndex((a) => a.id === result.doc.id);
          if (index > -1) {
            site.articlesList[index] = site.handleArticle({ ...result.doc });
          }
          site.handleCategoryArticles();
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/articles/view', (req, res) => {
    let response = {
      done: false,
    };

    let index = site.articlesList.findIndex((a) => a.id === req.data.id);
    if (index > -1) {
      response.done = true;
      response.doc = site.articlesList[index];
      res.json(response);
    } else {
      $articles.find({ id: req.data.id }, (err, doc) => {
        if (!err && doc) {
          response.done = true;
          response.doc = doc;
          res.json(response);
        } else {
          response.error = err?.message || 'Error Not Exists';
          res.json(response);
        }
      });
    }
  });

  site.post('/api/articles/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $articles.delete(
      {
        id: req.body.id,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err) {
          response.done = true;
          let index = site.articlesList.findIndex((a) => a.id === req.data.id);
          if (index > -1) {
            response.done = true;
            site.articlesList.splice(index);
          }
          site.handleCategoryArticles();
        } else {
          response.error = err?.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/articles/all', (req, res) => {
    let response = {
      done: false,
    };

    let where = req.body.where || {};

    if (req.body.search) {
      where.$or = [];
      where.$or.push(
        {
          'type.ar': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'type.en': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'clusters.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'category.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'subCategory1.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'subCategory2.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'subCategory3.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'subCategory4.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'writer.profile.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'writer.profile.lastName': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'editor.profile.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'editor.profile.lastName': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'country.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'gov.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'city.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'area.name': site.get_RegExp(req.body.search, 'i'),
        },
        {
          longitudes: site.get_RegExp(req.body.search, 'i'),
        },
        {
          latitudes: site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.title': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.textContent': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.htmlContent': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.multiParagraphList.contentText': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.multiParagraphList.content': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.multiImageList.title': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.title': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.socialTitle': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.socialDescription': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.externalTitle': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.externalDescription': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.content': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.keyWordsList': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.tagsList': site.get_RegExp(req.body.search, 'i'),
        }
      );
    }

    // site.articlesList.filter(u => u.name.contains(where['name']))
    $articles.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
        limit: req.body.limit || 100,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          // docs.forEach(_d => {
          //   _d.translatedList.forEach(_t => {
          //     if(_t.id == site.setting.languages_list.find((_l)=> {return _l.id == _t.id})){
          //       _d.$name = _t.name;
          //     }
          //   });
          // });

          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.onGET({ name: ['/rss', '/rss/articles', '/rss/articles/:id'], public: true }, (req, res) => {
    let limit = req.query.limit || 10;
    let list = [];
    let text = '';
    let lang = site.setting.languagesList[0];
    let domain = 'https://' + req.host;

    if (req.params.id == 'random') {
      list = site.articlesList.filter((p) => p.imageURL && p.active);
      list = [list[site.random(0, list.length - 1)]];
    } else if (req.params.id) {
      list = [site.articlesList.find((p) => p.id == req.params.id)];
    } else {
      list = site.articlesList.filter((p) => p.imageURL).slice(0, limit);
    }

    let urls = '';
    list.forEach((doc, i) => {
      doc.full_url = domain + '/a/' + doc.id;
      doc.date = doc.date || new date().toISOString();
      urls += `
        <item>
          <guid>${doc.id}</guid>
          <title>${doc.title}</title>
          <link>${doc.full_url}</link>
          <image>${domain}${doc.imageURL}</image>
          <description>${doc.description}</description>
          <pubDate>${doc.date}</pubDate>
        </item>
        `;
    });
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
            <title> ${lang.siteName} ${text} Global RSS</title>
            <link>${domain}</link>
            <description>${lang.siteName} Articles Rss Feeds</description>
            ${urls}
        </channel>
     </rss>`;
    res.set('Content-Type', 'application/xml');
    res.end(xml);
  });
  site.onGET({ name: ['/sitemap.xml'], public: true }, (req, res) => {
    let domain = 'https://' + req.host;

    let urls = '';
    site.articlesList.slice(0, 1000).forEach((article, i) => {
      article.post_url = domain + '/a/' + article.id;
      article.date = article.date || new Date().toISOString();
      urls += `
              <url>
                  <loc>${article.post_url}</loc>
                  <lastmod>${article.date}</lastmod>
                  <changefreq>monthly</changefreq>
                  <priority>.8</priority>
              </url>
              `;
    });
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
                      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                      <url>
                      <loc>${domain}</loc>
                      <lastmod>${new Date().toISOString()}</lastmod>
                      <changefreq>always</changefreq>
                      <priority>1</priority>
                  </url>
                         ${urls}
                      </urlset> 
                      `;
    res.set('Content-Type', 'application/xml');
    res.end(xml);
  });
};
