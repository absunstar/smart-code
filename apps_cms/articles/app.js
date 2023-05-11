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

  site.handleArticle = function (doc) {
    doc.title = doc.translatedList[0].title;
    doc.imageURL = doc.translatedList[0].image?.url || '/theme1/images/news.jpg';
    doc.content = doc.translatedList[0].textContent || doc.translatedList[0].htmlContent;
    doc.publishDate = doc.publishDate || new Date();
    doc.date = doc.publishDate.getDate() + ' ' + (site.monthes[doc.publishDate.getMonth()]?.nameAr || 'شهر غير معروف') + ' ' + doc.publishDate.getFullYear();
    doc.day = site.days[doc.publishDate.getDay()]?.nameAr || 'يوم غير معروف';
    doc.hasVideo = true;
    doc.hasImageGallary = true;
    doc.hasAudio = true;
    return doc;
  };
  $articles.findMany({ sort: { id: -1 }, limit: 1000 }, (err, docs) => {
    if (!err && docs) {
      docs.forEach((doc) => {
        site.articlesList.push(site.handleArticle({ ...doc }));
      });
    }
  });

  site.handleCategoryArticles = function () {
    site.categoriesList.forEach((cat) => {
      cat.$list = [];
      $articles.findMany({ where: { 'category.id': cat.id }, sort: { id: -1 }, limit: cat.homeLimit || 6 }, (err, docs) => {
        if (!err && docs) {
          docs.forEach((doc) => {
            doc.publishDate = doc.publishDate || new Date();
            doc.date = doc.publishDate.getDate() + ' ' + (site.monthes[doc.publishDate.getMonth()]?.nameAr || 'شهر غير معروف') + ' ' + doc.publishDate.getFullYear();
            doc.day = site.days[doc.publishDate.getDay()]?.nameAr || 'يوم غير معروف';
            cat.$list.push({ ...doc });
          });
        }
      });
    });
    setTimeout(() => {
      site.categoriesDisplayList1 = site.categoriesList
        .filter((c) => c.homePageIndex === 1 && c.$list.length > 0 && c.showInHomePage === true)
        .map((c) => ({
          id: c.id,
          name: c.translatedList[0].name,
          list: c.$list.map((a) => ({ id: a.id, day: a.day, date: a.date, title: a.translatedList[0].title, imageURL: a.translatedList[0].image?.url || '/theme1/images/news.jpg' })),
        }));

      site.categoriesDisplayList2 = site.categoriesList
        .filter((c) => c.homePageIndex === 2 && c.$list.length > 0 && c.showInHomePage === true)
        .map((c) => ({
          id: c.id,
          name: c.translatedList[0].name,
          list: c.$list.map((a) => ({ id: a.id, day: a.day, date: a.date, title: a.translatedList[0].title, imageURL: a.translatedList[0].image?.url || '/theme1/images/news.jpg' })),
        }));

      site.categoriesDisplayList3 = site.categoriesList
        .filter((c) => c.homePageIndex === 3 && c.$list.length > 0 && c.showInHomePage === true)
        .map((c) => ({
          id: c.id,
          name: c.translatedList[0].name,
          list: c.$list.map((a) => ({ id: a.id, day: a.day, date: a.date, title: a.translatedList[0].title, imageURL: a.translatedList[0].image?.url || '/theme1/images/news.jpg' })),
        }));
      site.categoriesDisplayList3.forEach((c) => {
        c.article = c.list.shift();
      });

      site.categoriesList1 = site.categoriesList.map((c) => ({ id: c.id, name: c.translatedList[0].name })).splice(0, 7);
      site.categoriesList2 = site.categoriesList.map((c) => ({ id: c.id, name: c.translatedList[0].name })).splice(7, 14);
      site.categoriesList3 = site.categoriesList.map((c) => ({ id: c.id, name: c.translatedList[0].name })).splice(14);
      site.topNews = site.articlesList
        .filter((a) => a.appearInUrgent === true)
        .map((c) => ({ id: c.id, title: c.translatedList[0].title }))
        .splice(0, 10)
        .reverse();

      site.MainSliderNews = site.articlesList
        .filter((a) => a.showInMainSlider === true)
        .map((c) => ({ id: c.id, day: c.day, date: c.date, title: c.translatedList[0].title, imageURL: c.translatedList[0].image?.url || '/theme1/images/news.jpg' }))
        .splice(0, 5);
    }, 1000 * 5);
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
        limit: req.body.limit,
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
