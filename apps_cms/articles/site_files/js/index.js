app.controller('articles', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.article = {};
  $scope.defaultSettings = site.showObject(`##data.#setting##`);
  if ($scope.defaultSettings && $scope.defaultSettings.id) {
    $scope.articleTypesList = $scope.defaultSettings.article.articleTypes.filter((t) => t.active == true);
    $scope.languagesList = [];
    $scope.defaultSettings.languagesList.forEach((l) => {
      if (l.language.active == true) {
        $scope.languagesList.push({
          id: l.language.id,
          en: l.language.en,
          ar: l.language.ar,
        });
      }
    });
  }
  $scope.displayAddArticles = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.article = {
      type: $scope.articleTypesList[0],
      active: true,
      translatedList: [],
    };
    if ($scope.defaultSettings.article) {
      if ($scope.defaultSettings.article.closingSystem) {
        if ($scope.defaultSettings.article.closingSystem.id == 2) {
          $scope.article.expiryDate = new Date();
          $scope.article.expiryDate.setDate($scope.article.expiryDate.getDate() + 7);
        }
      }

      if ($scope.defaultSettings.article.language) {
        $scope.article.$language = $scope.defaultSettings.article.language;
        $scope.addLanguage($scope.article.$language);
      }

      if ($scope.defaultSettings.article.writer && $scope.defaultSettings.article.writer.id) {
        $scope.article.writer = $scope.writersList.find((_r, i) => {
          return _r.id === $scope.defaultSettings.article.writer.id;
        });
      }

      if ($scope.defaultSettings.article.editor && $scope.defaultSettings.article.editor.id) {
        $scope.article.editor = $scope.editorsList.find((_e, i) => {
          return _e.id === $scope.defaultSettings.article.editor.id;
        });
      }

      if ($scope.defaultSettings.article.category && $scope.defaultSettings.article.category.id) {
        $scope.article.category = $scope.topCategoryList.find((_c, i) => {
          return _c.id === $scope.defaultSettings.article.category.id;
        });
        $scope.loadSubCategory1($scope.article.category);
      }
    }
    site.showModal('#articleManageModal');
  };

  $scope.addArticles = function () {
    $scope.error = '';
    const v = site.validated('#articleManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if (window.addEditor) {
      $scope.article.content2 = window.addEditor.getContents();
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/articles/add',
      data: $scope.article,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#articleManageModal');
          site.resetValidated('#articleManageModal');
          $scope.getArticlesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateArticles = function (article) {
    $scope.error = '';
    $scope.mode = 'edit';
    $scope.viewArticles(article);
    $scope.article = {};
    site.showModal('#articleManageModal');
  };

  $scope.updateArticles = function () {
    $scope.error = '';
    const v = site.validated('#articleManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if (window.addEditor) {
      $scope.article.content2 = window.addEditor.getContents();
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/articles/update',
      data: $scope.article,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#articleManageModal');
          site.resetValidated('#articleManageModal');
          $scope.getArticlesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsArticles = function (article) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.article = {};
    $scope.viewArticles(article);

    site.showModal('#articleManageModal');
  };

  $scope.viewArticles = function (article) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/articles/view',
      data: {
        id: article.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.article = response.data.doc;
          if (window.addEditor) {
            window.addEditor.setContents($scope.article.Htmlcontent);
          }

          $scope.article.$language = $scope.article.translatedList[0].language;
          $timeout(() => {
            $scope.changeLanuage($scope.article.$language);
          }, 200);

          console.log($scope.article);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteArticles = function (article) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.article = {};
    $scope.viewArticles(article);
    site.showModal('#articleManageModal');
  };

  $scope.deleteArticles = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/articles/delete',
      data: {
        id: $scope.article.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#articleManageModal');
          $scope.getArticlesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getArticlesRelatedList = function (ev, where) {
    $scope.busy = true;
    $scope.list = [];
    if (ev.which !== 13 || where == undefined) {
      return;
    }

    $http({
      method: 'POST',
      url: '/api/articles/all',
      data: {
        search: where,
        limit: 50,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.relatedTopicslist = response.data.list;
          $scope.relatedSearch = undefined;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getArticlesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/articles/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#articleSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#articleSearchModal');
  };

  $scope.loadClusters = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.clusterList = [];
    $http({
      method: 'POST',
      url: '/api/clusters/all',
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.clusterList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.categoryList = [];
    $scope.topCategoryList = [];
    $http({
      method: 'POST',
      url: '/api/categories/all',
      data: {
        where: {
          active: true,
        },
        select: { id: 1, translatedList: 1, parentListId: 1, topParentId: 1, parentId: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.categoryList = response.data.list;
          $scope.topCategoryList = response.data.topList;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadWriters = function (where) {
    $scope.error = '';
    $scope.busy = true;
    where = where || {};
    where['type.id'] = 1;

    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where: where,
        select: { id: 1, profile: 1, image: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.writersList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCountriesList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/countries/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
          countryCode: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGovesList = function (country) {
    $scope.busy = true;
    $scope.govesList = [];
    $scope.cityList = [];
    $scope.areaList = [];
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          country: country,
          active: true,
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $scope.cityList = [];
    $scope.areaList = [];
    $http({
      method: 'POST',
      url: '/api/city/all',
      data: {
        where: {
          gov: gov,
          active: true,
        },
        select: { id: 1, name: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $scope.areaList = [];
    $http({
      method: 'POST',
      url: '/api/area/all',
      data: {
        where: {
          city: city,
          active: true,
        },
        select: { id: 1, name: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadEditors = function (where) {
    $scope.error = '';
    $scope.busy = true;
    where = where || {};
    where['type.id'] = 2;

    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where: where,
        select: { id: 1, profile: 1 },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.editorsList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadSubCategory1 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList1 = [];
    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList1.push(_c);
      }
    });
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList2.push(_c);
      }
    });
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList3.push(_c);
      }
    });
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    $scope.subCategoriesList4 = [];
    $scope.categoryList.forEach((_c) => {
      if (c && c.id == _c.parentId) {
        $scope.subCategoriesList4.push(_c);
      }
    });
  };

  $scope.addTranslation = function () {
    $scope.error = '';
    $scope.article.translationList = $scope.article.translationList || [];
    $scope.article.translationList.push({});
  };

  $scope.addMultiParagraph = function (article) {
    $scope.error = '';
    article.multiParagraphList = article.multiParagraphList || [];
    article.multiParagraphList.push({
      showImage: true,
    });
  };

  $scope.addMultiImage = function (article) {
    $scope.error = '';
    article.multiImageList = article.multiImageList || [];
    article.multiImageList.push({
      showImage: true,
    });
  };

  $scope.addKeyWords = function (ev, obj) {
    $scope.error = '';

    if (ev.which !== 13 || !obj.$keyword) {
      return;
    }

    if (!obj.keyWordsList.some((k) => k === obj.$keyword)) {
      obj.keyWordsList.push(obj.$keyword);
    }

    obj.$keyword = '';
  };

  $scope.addTags = function (ev, obj) {
    $scope.busy = true;

    if (ev.which !== 13 || !obj.$tag) {
      return;
    }

    if (!obj.tagsList.some((k) => k === obj.$tag)) {
      obj.tagsList.push(obj.$tag);
    }

    obj.$tag = '';
  };

  $scope.editTranslateArticle = function (t, type) {
    $scope.translate = t;
    $scope.translate.$type = type;
    site.showModal('#translateContentModal');
  };

  $scope.calc = function (type, art) {
    $timeout(() => {
      if (type == 'views') {
        art.apparentViews = art.actualViews + art.dummyViews;
      } else if (type == 'likes') {
        art.apparentLikes = art.actualLikes + art.dummyLikes;
      } else if (type == 'comments') {
        art.apparentComments = art.actualComments + art.dummyComments;
      } else if (type == 'posts') {
        art.apparentPosts = art.actualPosts + art.dummyPosts;
      } else if (type == 'ratings') {
        art.apparentRatings = art.actualRatings + art.dummyRatings;
      }
    }, 500);
  };

  $scope.searchAll = function () {
    $scope.getArticlesList($scope.search);
    site.hideModal('#articleSearchModal');
    $scope.search = {};
  };

  $scope.changeLanuage = function (lang) {
    let index = $scope.article.translatedList.findIndex((_c) => _c.language && _c.language.id == lang.id);
    $scope.article.$showCreate = index >= 0 ? false : true;
    site.showTabContent('#basic');
  };

  $scope.addLanguage = function (lang) {
    if ($scope.article.translatedList.length > 0) {
      $scope.article.translatedList.push({ ...$scope.article.translatedList[0] });

      if ($scope.article.translatedList[0].keyWordsList) {
        $scope.article.translatedList[$scope.article.translatedList.length - 1].keyWordsList = [];

        $scope.article.translatedList[0].keyWordsList.forEach((_k) => {
          if ($scope.article.$autoTranslate) {
            SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: _k, to: lang.id }, (info) => {
              $scope.article.translatedList[$scope.article.translatedList.length - 1].keyWordsList.push(info.translatedText);
              $scope.$applyAsync();
            });
          } else {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].keyWordsList.push({ ..._k });
          }
        });

        if ($scope.article.$autoTranslate) {
        } else {
          $scope.article.translatedList[0].keyWordsList.forEach((_k) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].keyWordsList.push({ ..._k });
          });
        }
      }

      if ($scope.article.translatedList[0].tagsList) {
        $scope.article.translatedList[$scope.article.translatedList.length - 1].tagsList = [];

        $scope.article.translatedList[0].tagsList.forEach((_k) => {
          if ($scope.article.$autoTranslate) {
            SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: _k, to: lang.id }, (info) => {
              $scope.article.translatedList[$scope.article.translatedList.length - 1].tagsList.push(info.translatedText);
              $scope.$applyAsync();
            });
          } else {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].tagsList.push({ ..._k });
          }
        });

        if ($scope.article.$autoTranslate) {
        } else {
          $scope.article.translatedList[0].tagsList.forEach((_k) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].tagsList.push({ ..._k });
          });
        }
      }

      if ($scope.article.translatedList[0].multiParagraphList) {
        $scope.article.translatedList[$scope.article.translatedList.length - 1].multiParagraphList = [];
        $scope.article.translatedList[0].multiParagraphList.forEach((_k) => {
          $scope.article.translatedList[$scope.article.translatedList.length - 1].multiParagraphList.push({ ..._k });
        });
      }

      if ($scope.article.translatedList[0].multiImageList) {
        $scope.article.translatedList[$scope.article.translatedList.length - 1].multiImageList = [];
        $scope.article.translatedList[0].multiImageList.forEach((_k) => {
          $scope.article.translatedList[$scope.article.translatedList.length - 1].multiImageList.push({ ..._k });
        });
      }

      if ($scope.article.translatedList[0].metaTags) {
        $scope.article.translatedList[$scope.article.translatedList.length - 1].metaTags = [];
        $scope.article.translatedList[0].metaTags.forEach((_k) => {
          $scope.article.translatedList[$scope.article.translatedList.length - 1].metaTags.push({ ..._k });
        });
      }

      if ($scope.article.translatedList[0].styles) {
        $scope.article.translatedList[$scope.article.translatedList.length - 1].styles = [];
        $scope.article.translatedList[0].styles.forEach((_k) => {
          $scope.article.translatedList[$scope.article.translatedList.length - 1].styles.push({ ..._k });
        });
      }

      if ($scope.article.translatedList[0].scripts) {
        $scope.article.translatedList[$scope.article.translatedList.length - 1].scripts = [];
        $scope.article.translatedList[0].scripts.forEach((_k) => {
          $scope.article.translatedList[$scope.article.translatedList.length - 1].scripts.push({ ..._k });
        });
      }
      if ($scope.article.$autoTranslate) {
        if ($scope.article.translatedList[$scope.article.translatedList.length - 1].title) {
          SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: $scope.article.translatedList[0].title, to: lang.id }, (info) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].title = info.translatedText;
            $scope.$applyAsync();
          });
        }

        if ($scope.article.translatedList[$scope.article.translatedList.length - 1].content) {
          SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: $scope.article.translatedList[0].content, to: lang.id }, (info) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].content = info.translatedText;
            $scope.$applyAsync();
          });
        } else if ($scope.article.translatedList[$scope.article.translatedList.length - 1].contentText) {
          SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: $scope.article.translatedList[0].contentText, to: lang.id }, (info) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].contentText = info.translatedText;
            $scope.$applyAsync();
          });
        }

        if ($scope.article.translatedList[0].socialTitle) {
          SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: $scope.article.translatedList[0].socialTitle, to: lang.id }, (info) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].socialTitle = info.translatedText;
            $scope.$applyAsync();
          });
        }

        if ($scope.article.translatedList[0].socialDescription) {
          SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: $scope.article.translatedList[0].socialDescription, to: lang.id }, (info) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].socialDescription = info.translatedText;
            $scope.$applyAsync();
          });
        }

        if ($scope.article.translatedList[0].externalTitle) {
          SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: $scope.article.translatedList[0].externalTitle, to: lang.id }, (info) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].externalTitle = info.translatedText;
            $scope.$applyAsync();
          });
        }

        if ($scope.article.translatedList[0].externalDescription) {
          SOCIALBROWSER.translate({ from: $scope.article.translatedList[0].language.id, text: $scope.article.translatedList[0].externalDescription, to: lang.id }, (info) => {
            $scope.article.translatedList[$scope.article.translatedList.length - 1].externalDescription = info.translatedText;
            $scope.$applyAsync();
          });
        }
      }

      $scope.article.translatedList[$scope.article.translatedList.length - 1].language = lang;
    } else {
      let translate = {
        image: '/images/article.png',
        language: lang,
        showImage: true,
        showSocialImage: true,
        showExternalImage: true,
        actualViews: 0,
        dummyViews: 0,
        apparentViews: 0,
        actualLikes: 0,
        dummyLikes: 0,
        apparentLikes: 0,
        actualComments: 0,
        dummyComments: 0,
        apparentComments: 0,
        actualPosts: 0,
        dummyPosts: 0,
        apparentPosts: 0,
        actualRatings: 0,
        dummyRatings: 0,
        apparentRatings: 0,
        numberWords: 0,
        numberLetters: 0,
        keyWordsList: [],
        tagsList: [],
      };
      $scope.article.translatedList.push(translate);
    }
    $scope.article.$showCreate = false;
    $scope.article.$autoTranslate = false;
  };

  $scope.addMetaTags = function (programming) {
    $scope.error = '';
    programming.metaTags = programming.metaTags || [];
    programming.metaTags.push({ active: true });
  };

  $scope.addStyles = function (programming) {
    $scope.error = '';
    programming.styles = programming.styles || [];
    programming.styles.push({ active: true });
  };

  $scope.addScripts = function (programming) {
    $scope.error = '';
    programming.scripts = programming.scripts || [];
    programming.scripts.push({ active: true });
  };

  $scope.showRelatedTopics = function () {
    $scope.error = '';
    $scope.relatedTopicslist = [];
    site.showModal('#relatedTopics');
  };

  $scope.addRelatedArticle = function (relatedArticle) {
    $scope.error = '';
    $scope.article.relatedArticle = $scope.article.relatedArticle || [];
    let foundRelatedArticle = $scope.article.relatedArticle.some((_r) => _r.id === relatedArticle.id);

    $scope.article.relatedArticle.push({ active: true });
  };

  $scope.calcCount = function (art) {
    $timeout(() => {
      $scope.error = '';
      let titleletters = 0;
      let contentletters = 0;
      let titleWords = 0;
      let contentWords = 0;
      art.numberLetters = 0;
      art.numberWords = 0;
      if ($scope.article.type) {
        if ($scope.article.type.id == 1) {
          if (art.title) {
            titleletters = art.title.length;
            titleWords = art.title.trim().split(/\s+/).length;
          }
          if (art.content) {
            contentletters = art.content.length;
            contentWords = art.content.trim().split(/\s+/).length;
          } else if (art.contentText) {
            contentletters = art.contentText.length;
            contentWords = art.contentText.trim().split(/\s+/).length;
          }
          art.numberLetters = titleletters + contentletters;
          art.numberWords = titleWords + contentWords;
        }
      }
    }, 500);
  };

  $scope.getArticlesList();
  $scope.loadClusters();
  $scope.loadCategories();
  $scope.loadWriters();
  $scope.loadEditors();
  $scope.getCountriesList();
});
