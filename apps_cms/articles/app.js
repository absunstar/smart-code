module.exports = function init(site) {
  site.$articles = site.connectCollection('articles');
  site.$articlesSearch = site.connectCollection('articlesSearch');

  site.$articles.aggregate(
    [
      {
        $group: {
          _id: {
            guid: '$guid',
          },
          dups: {
            $push: '$_id',
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $match: {
          count: {
            $gt: 1,
          },
        },
      },
    ],
    function (err, docs) {
      if (!err && docs) {
        let arr = [];
        docs.forEach((doc) => {
          doc.dups.shift();
          doc.dups.forEach((dup) => {
            arr.push(dup);
          });
        });
        site.$articles.deleteAll(
          {
            _id: {
              $in: arr,
            },
          },
          (err, result) => {
            site.$articles.createUnique({
              guid: 1,
            });
          }
        );
      }
      return;
    }
  );

  site.articlesList = [];

  site.searchArticleList = [];
  site.addToSearchArticleList = function (s) {
    site.searchArticleList.push({ ...s, date: new Date() });
    /* Save in Database */
  };

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
  site.escapeRegx = function (s) {
    if (!s) {
      return '';
    }
    if (typeof s !== 'string') {
      s = s.toString();
    }
    return s.replace(/[\/\\^$*+?.()\[\]{}]/g, '\\$&');
  };
  site.escapeHtml = function (unsafe) {
    try {
      if (!unsafe) {
        return '';
      }
      return unsafe.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    } catch (error) {
      return unsafe;
    }
  };
  site.removeHtml = function (unsafe) {
    try {
      if (!unsafe) {
        return '';
      }
      return unsafe
        .replace(/<[^>]+>/g, '')
        .replace('(', '')
        .replace(')', '')
        .replace('-', ' ')
        .replace('+', ' ')
        .replace('  ', ' ')
        .replace(/&nbsp;|&laquo;|&raquo|&quot;|&rlm;|&llm;|&lrm;|&rrm;/g, '')
        .trim();
    } catch (error) {
      return unsafe;
    }
  };
  site.filterLetters = function (str, lettersToRemove = ['  ', '|', '/', '\\', ':', '*', '?', '=', '.', '^', '$', '"', "'", '؟']) {
    if (!str) {
      return '';
    }
    str = str.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');

    lettersToRemove.forEach(function (letter) {
      str = str.replaceAll(letter, '');
    });
    return str.trim();
  };
  site.getArticle = function (guid, callBack) {
    callBack = callBack || function () {};
    let article = site.articlesList.find((a) => a.id == guid || a.guid == guid);
    if (article) {
      callBack(null, article);
    } else {
      site.$articles.find({ guid: guid }, (err, doc) => {
        if (!err && doc) {
          doc = site.handleArticle(doc);
          site.articlesList.push(doc);
        }
        callBack(err, doc);
      });
    }
  };

  site.handleArticle = function (doc, options = {}) {
    let lang = doc.translatedList[0];
    doc.$title = site.removeHtml(lang.title);
    doc.$titleArray = doc.$title.split(' ');
    doc.$alt = doc.$title.split(' ')[0] + ' ' + doc.$title.split(' ')[1] + ' ' + doc.$title.split(' ')[2];
    doc.$imageURL = lang.image?.url || '/theme1/images/news.jpg';
    doc.$coverURL = lang.cover?.url || doc.$imageURL;
    doc.host = doc.host || options.host || '';
    if (doc.type.id == 7 && doc.yts) {
      doc.$yts = true;
      doc.$title += ' ( ' + doc.yts.year + ' ) ';
      doc.$title2 = doc.$title.replaceAll(' ', '+');
      doc.yts.$trailerURL = 'https://www.youtube.com/results?search_query=' + doc.$title + ' Trailer';
      doc.yts.$imdbURL = 'https://www.imdb.com/title/' + doc.yts.imdb_code;
      doc.yts.$subtitleURL = 'https://subscene.com/subtitles/searchbytitle?query=' + doc.$title;
      doc.$backgroundURL = doc.$coverURL;
    } else if (doc.type.id == 8) {
      doc.is_youtube = true;
      doc.$title2 = doc.$title.replaceAll(' ', '+');
      doc.$embdedURL = 'https://www.youtube.com/embed/' + doc.youtube.url.split('=')[1].split('&')[0];
    } else {
      doc.$title2 = doc.$title.split(' ').join('-');
    }
    doc.$url = '/article/' + doc.guid + '/' + doc.$title2;

    if (doc.type.id === 2) {
      doc.$content = lang.htmlContent || '';
    } else {
      doc.$content = lang.textContent || lang.htmlContent || '';
    }

    doc.$description = site.escapeHtml(doc.$content).substring(0, 140);
    lang.keyWordsList = lang.keyWordsList || [];
    doc.$keyWordsList = [];
    lang.keyWordsList.forEach((k, i) => {
      k = site.filterLetters(k);
      if (!k || k.length < 4) {
        return;
      }

      if (doc.$keyWordsList.findIndex((kk) => kk.contains(k)) == -1) {
        if (doc.type.id == 7) {
          doc.$keyWordsList.push(k + ' Movie');
        } else {
          doc.$keyWordsList.push(k);
        }
      }
    });

    doc.$tagsList = [];
    lang.tagsList = lang.tagsList || [doc.$title];

    lang.tagsList.forEach((k, i) => {
      k = site.filterLetters(k);
      if (!k || k.length < 4) {
        return;
      }
      doc.$tagsList.push(k);
    });

    doc.publishDate = doc.publishDate || new Date();
    doc.$date = doc.publishDate.getDate() + ' ' + (site.monthes[doc.publishDate.getMonth()]?.nameAr || 'شهر غير معروف') + ' ' + doc.publishDate.getFullYear();
    doc.$day = site.days[doc.publishDate.getDay()]?.nameAr || 'يوم غير معروف';
    doc.$hasAudio = false;
    doc.$hasVideo = false;
    doc.$hasImageGallary = false;
    doc.$hasMenu = false;
    doc.$menuClass = 'none';

    doc.$audioClass = 'none';
    doc.$videoClass = 'none';
    doc.$imageGallaryClass = 'none';
    if (lang.hasAudio) {
      doc.$hasAudio = true;
      doc.$audio = lang.audio;
      doc.$audioClass = '';
    }

    if (lang.hasVideo) {
      doc.$hasVideo = true;
      doc.$video = lang.video;
      doc.$videoClass = '';
    }
    doc.$readingTimeClass = 'none';
    doc.$hasReadingTime = false;
    if (lang.hasReadingTime) {
      doc.$hasReadingTime = true;
      doc.$readingTime = lang.readingTime;
      doc.$readingTimeClass = '';
    }

    doc.$miniTitleClass = 'none';
    doc.$hasMiniTitle = false;
    if (lang.hasMiniTitle) {
      doc.$miniTitle = lang.miniTitle;
      doc.$hasMiniTitle = true;
      doc.$miniTitleClass = '';
    }

    if (doc.writer) {
      doc.$hasWriter = true;
      doc.writer.$name = doc.writer.profile.name + ' ' + doc.writer.profile.lastName;
      doc.writer.$title = doc.writer.profile.title;
      doc.writer.$imageURL = doc.writer.image?.url || doc.writer.profile.imageURL;
    }
    if (doc.type.id == 7 && !doc.$hasMiniTitle) {
      doc.$miniTitle = doc.yts.type;
      doc.$hasMiniTitle = true;
      doc.$miniTitleClass = '';
    } else if (doc.type.id == 8 && !doc.$hasMiniTitle) {
      doc.$miniTitle = 'Youtube';
      doc.$hasMiniTitle = true;
      doc.$miniTitleClass = '';
    }
    return doc;
  };
  site.handleSearchArticle = function (doc, options = {}) {
    let lang = doc.translatedList[0];
    doc.$title = site.removeHtml(lang.title);
    doc.$imageURL = lang.image?.url || '/theme1/images/news.jpg';
    doc.host = doc.host || options.host || '';
    if (doc.type.id == 7 && doc.yts) {
      doc.$yts = true;
      doc.$title += ' ( ' + doc.yts.year + ' ) ';
      doc.$title2 = doc.$title.replaceAll(' ', '+');
    } else if (doc.type.id == 8) {
      doc.is_youtube = true;
    } else {
      doc.$title2 = doc.$title.split(' ').join('-');
    }
    doc.$url = '/article/' + doc.guid + '/' + doc.$title2;

    doc.publishDate = doc.publishDate || new Date();
    doc.$date = doc.publishDate.getDate() + ' ' + (site.monthes[doc.publishDate.getMonth()]?.nameAr || 'شهر غير معروف') + ' ' + doc.publishDate.getFullYear();
    doc.$day = site.days[doc.publishDate.getDay()]?.nameAr || 'يوم غير معروف';

    doc.$hasAudio = false;
    doc.$hasVideo = false;
    doc.$hasImageGallary = false;
    doc.$hasMenu = false;
    doc.$menuClass = 'none';

    doc.$audioClass = 'none';
    doc.$videoClass = 'none';
    doc.$imageGallaryClass = 'none';
    if (lang.hasAudio) {
      doc.$hasAudio = true;
      doc.$audio = lang.audio;
      doc.$audioClass = '';
    }

    if (lang.hasVideo) {
      doc.$hasVideo = true;
      doc.$video = lang.video;
      doc.$videoClass = '';
    }
    doc.$readingTimeClass = 'none';
    doc.$hasReadingTime = false;
    if (lang.hasReadingTime) {
      doc.$hasReadingTime = true;
      doc.$readingTime = lang.readingTime;
      doc.$readingTimeClass = '';
    }

    doc.$miniTitleClass = 'none';
    doc.$hasMiniTitle = false;
    if (lang.hasMiniTitle) {
      doc.$miniTitle = lang.miniTitle;
      doc.$hasMiniTitle = true;
      doc.$miniTitleClass = '';
    }

    if (doc.type.id == 7 && !doc.$hasMiniTitle) {
      doc.$miniTitle = doc.yts.type;
      doc.$hasMiniTitle = true;
      doc.$miniTitleClass = '';
    } else if (doc.type.id == 8 && !doc.$hasMiniTitle) {
      doc.$miniTitle = 'Youtube';
      doc.$hasMiniTitle = true;
      doc.$miniTitleClass = '';
    }
    delete doc.translatedList;
    delete doc.yts;
    delete doc.publishDate;
    delete doc._id;
    delete doc.type;

    return doc;
  };
  site.searchArticles = function (options, callBack) {
    callBack = callBack || function () {};
    options = options || {};
    options.search = options.search || '';
    options.host = options.host || '';
    options.page = options.page || 1;
    options.limit = options.limit || 50;
    options.skip = options.limit * (options.page - 1);
    options.exp = '';
    options.search = site
      .filterLetters(options.search)
      .split(' ')
      .forEach((w, i) => {
        if (w.length > 2) {
          options.exp += w + '|';
        }
      });
    options.expString = options.exp.replace(/.$/, '');
    options.exp = new RegExp(options.expString, 'i');

    if (options.host.indexOf('*') !== -1) {
      options.host = options.host.split('*');
      options.host.forEach((n, i) => {
        options.host[i] = site.escapeRegx(n);
      });
      options.host = options.host.join('.*');
    } else {
      options.host = site.escapeRegx(options.host);
    }
    options.host = '^' + options.host + '$';

    let list = [];
    if ((s = site.searchArticleList.find((sa) => sa.id == options.expString))) {
      callBack(null, [...s.list]);
    } else {
      site.$articles.findAll(
        {
          select: { guid: 1, type: 1, publishDate: 1, yts: 1, translatedList: 1 },
          where: {
            host: new RegExp(options.host, 'gium'),
            $or: [{ 'translatedList.title': options.exp }, { 'translatedList.textContent': options.exp }, { 'translatedList.tagsList': options.exp }, { 'yts.type': options.exp }],
          },
          limit: options.limit,
          skip: options.skip,
        },
        (err, docs) => {
          if (!err && docs) {
            docs.forEach((doc) => {
              list.push(site.handleSearchArticle(doc));
            });

            site.addToSearchArticleList({
              id: options.expString,
              list: [...list],
            });

            callBack(null, list);
          } else {
            callBack(err);
          }
        }
      );
    }
  };
  site.prepareArticles = function () {
    site.$articles.findMany({ sort: { id: -1 }, limit: 1000 }, (err, docs) => {
      if (!err && docs) {
        docs.forEach((doc) => {
          if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
            site.articlesList.push(site.handleArticle({ ...doc }));
          }
        });
        site.prepareUrgentArticles();
        site.prepareSliderArticles();
      }
    });
  };

  site.prepareUrgentArticles = function () {
    site.$articles.findMany({ where: { showOnTop: true }, sort: { id: -1 }, limit: 500 }, (err, docs) => {
      if (!err && docs) {
        docs.forEach((doc) => {
          if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
            site.articlesList.push(site.handleArticle({ ...doc }));
          }
        });
        site.articlesList.sort((a, b) => {
          return b.id - a.id;
        });
      }
    });
  };
  site.prepareSliderArticles = function () {
    site.$articles.findMany({ where: { showInMainSlider: true }, sort: { id: -1 }, limit: 50 }, (err, docs) => {
      if (!err && docs) {
        docs.forEach((doc) => {
          if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
            site.articlesList.push(site.handleArticle({ ...doc }));
          }
        });
        site.articlesList.sort((a, b) => {
          return b.id - a.id;
        });
      }
    });
  };
  site.getRelatedArticles = function (a) {
    let $relatedArticleList = site.articlesList.filter((b) => b.$tagsList.includes(a.$tagsList[0]) && b.id !== a.id).slice(0, 12);
    if ($relatedArticleList.length < 12) {
      $relatedArticleList = [
        ...$relatedArticleList,
        ...site.articlesList.filter((b) => b.category && a.category && b.category.id === a.category.id && b.id !== a.id).slice(0, 12 - $relatedArticleList.length),
      ];
    }
    return $relatedArticleList;
  };

  site.getLatestArticles = function (a) {
    return site.articlesList.filter((b) => b.id !== a.id && b.category && a.category && b.category.id == a.category.id).slice(0, 12);
  };
  site.getTopArticles = function (filter = '_', category) {
    return site.articlesList
      .filter((a) => (!category || !a.category || a.category.id == category.id) && a.showOnTop === true && a.host.like(filter))
      .splice(0, 12)
      .reverse();
  };

  site.prepareArticles();

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.get(
    {
      name: 'articles',
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host);
      let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

      res.render(
        'articles/index.html',
        {
          setting: setting,
          language: language,
          appName: req.word('Articles'),
        },
        { parser: 'html' }
      );
    }
  );

  site.post(
    {
      name: '/api/articleTypes/all',
    },
    (req, res) => {
      res.json(site.articleTypes);
    }
  );

  site.post(
    {
      name: '/api/languages/all',
    },
    (req, res) => {
      res.json(supportedLanguageList);
    }
  );

  site.onGET('/article-image/:guid', (req, res) => {
    res.redirect(site.articlesList.find((a) => a.guid == req.params.guid)?.$imageURL || '/images/no.png');
  });

  site.post({ name: '/api/articles/add', require: { Permissions: ['login'] } }, (req, res) => {
    let response = {
      done: false,
    };

    let setting = site.getSiteSetting(req.host);

    if (!setting) {
      response.error = 'No Setting ';
      res.json(response);
      return;
    }
    let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];
    if (!language) {
      response.error = 'No Language';
      res.json(response);
      return;
    }
    let articlesDoc = req.body;
    if (articlesDoc.is_yts) {
      articlesDoc = {
        type: site.articleTypes.find((t) => t.id === 7),
        category: articlesDoc.category,
        yts: articlesDoc,
        translatedList: [{ language: language }],
        host: articlesDoc.host || 'yts',
      };

      articlesDoc.guid = site.md5(articlesDoc.yts.title_long || articlesDoc.yts.title);
      if (!articlesDoc.yts.description_full || !articlesDoc.yts.rating) {
        response.error = 'No Description or Rating';
        res.json(response);
        return;
      }
      articlesDoc.showInMainSlider = true;
      articlesDoc.showOnTop = true;

      articlesDoc.translatedList[0].title = articlesDoc.yts.title;
      articlesDoc.translatedList[0].image = { url: articlesDoc.yts.medium_cover_image };
      articlesDoc.translatedList[0].cover = { url: articlesDoc.yts.large_cover_image };
      articlesDoc.translatedList[0].textContent = articlesDoc.yts.description_full;

      if (Array.isArray(articlesDoc.yts.genres)) {
        articlesDoc.yts.type = articlesDoc.yts.genres.join(' ');
        articlesDoc.translatedList[0].tagsList = [...articlesDoc.yts.genres];
        articlesDoc.translatedList[0].keyWordsList = [...site.removeHtml(articlesDoc.yts.title).split(' '), ...articlesDoc.yts.genres];
      }

      if (articlesDoc.yts.date_uploaded) {
        articlesDoc.publishDate = new Date(articlesDoc.yts.date_uploaded);
      }
    } else if (articlesDoc.is_youtube) {
      articlesDoc = {
        type: site.articleTypes.find((t) => t.id === 8),
        youtube: articlesDoc,
        translatedList: [{ language: language }],
        host: 'youtube',
      };
      if (articlesDoc.youtube.channel) {
        if (articlesDoc.youtube.channel.category) {
          articlesDoc.category = articlesDoc.youtube.channel.category;
        }
        if (articlesDoc.youtube.channel.host) {
          articlesDoc.host = articlesDoc.youtube.channel.host;
        }
      }

      articlesDoc.showInMainSlider = true;
      articlesDoc.showOnTop = true;

      articlesDoc.translatedList[0].tagsList = [...site.removeHtml(articlesDoc.youtube.channel.title).split(' '), 'Video', 'Watch'];
      articlesDoc.translatedList[0].keyWordsList = [...site.removeHtml(articlesDoc.youtube.title).split(' '), ...site.removeHtml(articlesDoc.youtube.channel.title).split(' ')];

      articlesDoc.translatedList[0].title = articlesDoc.youtube.title;
      articlesDoc.translatedList[0].image = { url: articlesDoc.youtube.image?.url };
      articlesDoc.translatedList[0].textContent = articlesDoc.youtube.description;
      if (articlesDoc.youtube.date_uploaded) {
        articlesDoc.publishDate = new Date(articlesDoc.youtube.date);
      } else {
        articlesDoc.publishDate = new Date();
      }

      articlesDoc.guid = site.md5('Youtube - ' + articlesDoc.translatedList[0].title);
    }

    articlesDoc.addUserInfo = req.getUserFinger();

    if (typeof articlesDoc.active === 'undefined') {
      articlesDoc.active = true;
    }

    articlesDoc.guid = articlesDoc.guid || site.md5(articlesDoc.translatedList[0].title);
    articlesDoc.host = articlesDoc.host || req.host;

    site.$articles.add(articlesDoc, (err, doc) => {
      if (!err && doc) {
        response.done = true;
        response.doc = doc;
        site.articlesList.unshift(site.handleArticle({ ...doc }));
      } else {
        response.error = err?.message;
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

    site.$articles.edit(
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
      site.$articles.find({ id: req.data.id }, (err, doc) => {
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

    site.$articles.delete(
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

    if (where['type']) {
      where['type.id'] = where['type'].id;
      delete where['type'];
    }
    if (where['writer']) {
      where['writer.id'] = where['writer'].id;
      delete where['writer'];
    }
    if (where['editor']) {
      where['editor.id'] = where['editor'].id;
      delete where['editor'];
    }
    if (where['category']) {
      where['category.id'] = where['category'].id;
      delete where['category'];
    }
    if (where['subCategory1']) {
      where['subCategory1.id'] = where['subCategory1'].id;
      delete where['subCategory1'];
    }
    if (where['subCategory2']) {
      where['subCategory2.id'] = where['subCategory2'].id;
      delete where['subCategory2'];
    }
    if (where['subCategory3']) {
      where['subCategory3.id'] = where['subCategory3'].id;
      delete where['subCategory3'];
    }
    if (where['subCategory4']) {
      where['subCategory4.id'] = where['subCategory4'].id;
      delete where['subCategory4'];
    }
    if (where['cluster']) {
      where['clusters.id'] = where['cluster'].id;
      delete where['cluster'];
    }
    if (where['country']) {
      where['country.id'] = where['country'].id;
      delete where['country'];
    }
    if (where['gov']) {
      where['gov.id'] = where['gov'].id;
      delete where['gov'];
    }
    if (where['city']) {
      where['city.id'] = where['city'].id;
      delete where['city'];
    }
    if (where['area']) {
      where['area.id'] = where['area'].id;
      delete where['area'];
    }
    if (where['hasReadingTime']) {
      where['translatedList.hasReadingTime'] = true;
      delete where['hasReadingTime'];
    }
    if (where['hasAudio']) {
      where['translatedList.hasAudio'] = true;
      delete where['hasAudio'];
    }
    if (where['hasVideo']) {
      where['translatedList.hasVideo'] = true;
      delete where['hasVideo'];
    }
    if (where['tag']) {
      where['translatedList.tagsList'] = site.get_RegExp(where['tag'], 'i');
      delete where['tag'];
    }
    if (where['keyword']) {
      where['translatedList.keyWordsList'] = site.get_RegExp(where['keyword'], 'i');
      delete where['keyword'];
    }
    site.get_RegExp(req.body.search, 'i');
    // site.articlesList.filter(u => u.name.contains(where['name']))
    site.$articles.findMany(
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

          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.onPOST('/api/article/handle-images', (req, res) => {
    let response = {
      done: false,
    };
    site.$articles.findMany(
      {
        select: { id: 1, translatedList: 1 },
        sort: req.body.sort || {
          id: -1,
        },
        limit: 10000,
      },
      (err, docs, count) => {
        if (!err && docs) {
          response.done = true;
          response.list = docs;
          docs.forEach((doc) => {
            doc.translatedList.forEach((_t) => {
              if (_t.image && _t.image.url && !_t.image.url.like('*.webp')) {
                let arr = _t.image.url.split('/');
                let imageName = arr.pop();
                let imageName2 = imageName.replace(site.path.extname(imageName), '.webp');
                let folderName = arr.pop();
                let folder = new Date().getFullYear() + '_' + new Date().getMonth() + '_' + new Date().getDate();
                let path = site.options.upload_dir + '/' + folderName + '/images/' + imageName;
                let path2 = site.options.upload_dir + '/' + folder + '/images/' + imageName2;
                site.createDir(site.options.upload_dir + '/' + folder, () => {
                  site.createDir(site.options.upload_dir + '/' + folder + '/images', () => {
                    site.webp.cwebp(path, path2, '-q 80').then((output) => {
                      console.log(output);
                      _t.image.path = path2;
                      _t.image.url = '/x-api/image/' + folder + '/' + imageName2;
                      site.$articles.update(doc);
                    });
                  });
                });
              }
            });
          });

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
    let setting = site.getSiteSetting(req.host);

    let lang = setting.languageList[0];
    let domain = 'https://' + req.host;
    if (req.params.id == 'random') {
      list = site.articlesList.filter((p) => p.$imageURL && p.active);
      list = [list[site.random(0, list.length - 1)]];
    } else if (req.params.id) {
      list = [site.articlesList.find((p) => p.id == req.params.id)];
    } else {
      list = site.articlesList.filter((p) => p.$imageURL).slice(0, limit);
    }

    let urls = '';
    list.forEach((doc, i) => {
      doc.full_url = domain + '/article/' + doc.guid;
      doc.$date2 = new Date(doc.publishDate).toISOString();
      urls += `
        <item>
          <guid>${doc.guid}</guid>
          <title>${doc.$title}</title>
          <link>${doc.full_url}</link>
          <image>${domain}/article-image/${doc.guid}</image>
          <description>${doc.$description}</description>
          <pubDate>${doc.$date2}</pubDate>
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
  site.onGET({ name: ['/feed'], public: true }, (req, res) => {
    let limit = req.query.limit || 10;
    let list = [];
    let text = '';
    let filter = site.getHostFilter(req.host);
    let setting = site.getSiteSetting(req.host);

    let lang = setting.languageList[0];
    let domain = 'https://' + req.host;
    if (req.params.guid == 'random') {
      list = site.articlesList.filter((a) => a.active && a.host.like(filter));
      list = [list[site.random(0, list.length - 1)]];
    } else if (req.params.guid) {
      list = [site.articlesList.find((p) => p.guid == req.params.guid)];
    } else {
      list = site.articlesList.filter((a) => a.active && a.host.like(filter)).slice(0, limit);
    }

    let urls = '';
    list.forEach((doc, i) => {
      $url = domain + '/article/' + doc.guid;
      $date = new Date(doc.publishDate).toUTCString();
      urls += `
        <item>
          <guid isPermaLink="false">${doc.guid}</guid>
          <title>${doc.$title}</title>
          <link>${$url}</link>
          <description>${doc.$description}</description>
          <content:encoded>
            <![CDATA[
              <img src="${domain}/article-image/${doc.guid}" />
              <p> ${doc.$description} </p>
            ]]>
          </content:encoded> 
          <pubDate>${$date}</pubDate>
        </item>
        `;
    });
    let xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0" 
    xmlns:atom="http://www.w3.org/2005/Atom" 
    xmlns:content="http://purl.org/rss/1.0/modules/content/">
      <channel>
            <title> ${lang.siteName} ${text} Global RSS</title>
            <link>${domain}</link>
            <atom:link href="${domain}/feed" rel="self" type="application/rss+xml" />
            <description>${lang.siteName} Articles Rss Feeds</description>
            ${urls}
        </channel>
     </rss>`;
    res.set('Content-Type', 'application/xml');
    res.end(xml);
  });
  site.onGET({ name: ['/sitemap.xml'], public: true }, (req, res) => {
    let domain = 'https://' + req.host;
    let filter = site.getHostFilter(req.host);

    let urls = '';
    site.articlesList
      .filter((a) => a.host.like(filter))
      .slice(0, 1000)
      .forEach((article, i) => {
        let $url = domain + '/article/' + article.guid;
        let $date = new Date(article.publishDate).toISOString();
        urls += `
              <url>
                  <loc>${$url}</loc>
                  <lastmod>${$date}</lastmod>
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
