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
      doc.writer.imageURL = doc.writer.image?.url || doc.writer.profile.image_url;
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
      cat.$list = [];
      cat.homePageLimit = cat.homePageLimit || 10;

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
          cat.$list = site.articlesList.filter((a) => a.category.id == cat.id).slice(0, cat.homePageLimit);

          if (cat.showInHomePage && cat.$list.length > 0) {
            let _cat = {
              name: cat.translatedList[0].name,
              list: cat.$list,
            };
            if (cat.homePageIndex == 1) {
              _cat.template1 = true;
            } else if (cat.homePageIndex == 2) {
              _cat.template2 = true;
            } else if (cat.homePageIndex == 3) {
              _cat.template3 = true;
              _cat.list0 = [_cat.list.shift()];
            }
            site.$$categories.push(_cat);
          }
        }
      });
    });
  };

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get({
    name: 'articles',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compres: true,
  });

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
          'translatedList.title': site.get_RegExp(req.body.search, 'i'),
        },
        {
          'translatedList.content': site.get_RegExp(req.body.search, 'i'),
        },
        {
          keyWordsList: site.get_RegExp(req.body.search, 'i'),
        },
        {
          tagsList: site.get_RegExp(req.body.search, 'i'),
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
};
