app.controller('articles', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';
  $scope.article = {};

  $scope.displayAddArticles = function () {
    $scope.error = '';
    $scope.mode = 'add';
    $scope.article = {
      type: $scope.articleTypesList[0],
      active: true,
      content_list: [],
    };
    if ($scope.defaultSettings.article) {
      if ($scope.defaultSettings.article.closing_system) {
        if ($scope.defaultSettings.article.closing_system.id == 2) {
          $scope.article.expiry_date = new Date();
          $scope.article.expiry_date.setDate($scope.article.expiry_date.getDate() + 7);
        }
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
    $scope.article.content2 = window.addEditor.getContents();

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
    document.querySelector('#articleManageModal .tab-link').click();
  };

  $scope.updateArticles = function () {
    $scope.error = '';
    const v = site.validated('#articleManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.article.content2 = window.addEditor.getContents();

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
    document.querySelector('#articleManageModal .tab-link').click();
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
          window.addEditor.setContents($scope.article.content2);
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
    document.querySelector('#articleManageModal .tab-link').click();
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

  $scope.getArticleTypesList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.articleTypesList = [];
    $http({
      method: 'POST',
      url: '/api/article_types/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.articleTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getLanguagesList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.languagesList = [];
    $http({
      method: 'POST',
      url: '/api/languages/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.languagesList = response.data;
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

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.category_list = [];
    $scope.top_category_list = [];
    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: {
          status: 'active',
        },
        select: { id: 1, name: 1, parent_list_id: 1, top_parent_id: 1, parent_id: 1, image_url: 1, type: 1 },
        top: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.category_list = response.data.list;
          $scope.top_category_list = response.data.top_list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
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
        select: { id: 1, profile: 1 },
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
          name_ar: 1,
          name_en: 1,
          code: 1,
          country_code: 1,
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
          'country.id': country.id,
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
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
          'gov.id': gov.id,
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1 },
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
          'city.id': city.id,
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1 },
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
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
        $scope.subCategoriesList1.push(_c);
      }
    });
  };

  $scope.loadSubCategory2 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList2 = [];
    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
        $scope.subCategoriesList2.push(_c);
      }
    });
  };

  $scope.loadSubCategory3 = function (c) {
    $scope.error = '';

    $scope.subCategoriesList3 = [];
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
        $scope.subCategoriesList3.push(_c);
      }
    });
  };

  $scope.loadSubCategory4 = function (c) {
    $scope.error = '';
    $scope.subCategoriesList4 = [];
    $scope.category_list.forEach((_c) => {
      if (c && c.id == _c.parent_id) {
        $scope.subCategoriesList4.push(_c);
      }
    });
  };

  $scope.addTranslation = function () {
    $scope.error = '';
    $scope.article.translation_list = $scope.article.translation_list || [];
    $scope.article.translation_list.push({});
  };

  $scope.addMultiParagraph = function (article) {
    $scope.error = '';
    article.multi_paragraph_list = article.multi_paragraph_list || [];
    article.multi_paragraph_list.push({
      show_image: true,
    });
  };

  $scope.addMultiImage = function (article) {
    $scope.error = '';
    article.multi_image_list = article.multi_image_list || [];
    article.multi_image_list.push({
      show_image: true,
    });
  };

  $scope.createArticle = function (translate) {
    $scope.error = '';
    translate.create = true;
    translate.title = $scope.article.title;
    translate.image_url = $scope.article.image_url;
    translate.content = $scope.article.content;
    translate.social_title = $scope.article.social_title;
    translate.social_image = $scope.article.social_image;
    translate.show_social_image = $scope.article.show_social_image;
    translate.social_description = $scope.article.social_description;
    translate.external_title = $scope.article.external_title;
    translate.external_image = $scope.article.external_image;
    translate.show_external_image = $scope.article.show_external_image;
    translate.external_description = $scope.article.external_description;
    translate.multi_paragraph_list = $scope.article.multi_paragraph_list;
    translate.multi_image_list = $scope.article.multi_image_list;
    translate.clusters = $scope.article.clusters;
    translate.writer = $scope.article.writer;
    translate.editor = $scope.article.editor;
    translate.keywords_list = $scope.article.keywords_list;
  };

  $scope.addKeyDown = function (ev, obj) {
    $scope.busy = true;

    if (ev.which !== 13 || !obj.$keyword) {
      return;
    }

    if (!obj.keywords_list.some((k) => k === obj.$keyword)) {
      obj.keywords_list.push(obj.$keyword);
    }

    obj.$keyword = '';
  };

  $scope.editTranslateArticle = function (t, type) {
    $scope.translate = t;
    $scope.translate.$type = type;
    site.showModal('#translateContentModal');
  };

  $scope.calc = function (type, art) {
    $timeout(() => {
      if (type == 'views') {
        art.apparent_views = art.actual_views + art.dummy_views;
      } else if (type == 'likes') {
        art.apparent_likes = art.actual_likes + art.dummy_likes;
      } else if (type == 'comments') {
        art.apparent_comments = art.actual_comments + art.dummy_comments;
      } else if (type == 'posts') {
        art.apparent_posts = art.actual_posts + art.dummy_posts;
      } else if (type == 'ratings') {
        art.apparent_ratings = art.actual_ratings + art.dummy_ratings;
      }
    }, 500);
  };

  $scope.searchAll = function () {
    $scope.getArticlesList($scope.search);
    site.hideModal('#articleSearchModal');
    $scope.search = {};
  };

  $scope.changeLanuage = function (event,lang) {
    let index = $scope.article.content_list.findIndex((_c) => _c.language && _c.language.id == lang.id);
    $scope.article.$show_create = index >= 0 ? false : true;
    if (index >= 0) {
    }
    site.showTabContent(event, '#basic');
   };

  $scope.addLanguage = function (lang) {
    if ($scope.article.content_list.length > 0) {
      $scope.article.content_list.push({ ...$scope.article.content_list[0] });

      if ($scope.article.content_list[0].keywords_list) {
        $scope.article.content_list[$scope.article.content_list.length - 1].keywords_list = [];
        $scope.article.content_list[0].keywords_list.forEach((_k) => {
          $scope.article.content_list[$scope.article.content_list.length - 1].keywords_list.push({ ..._k });
        });
      }

      if ($scope.article.content_list[0].multi_paragraph_list) {
        $scope.article.content_list[$scope.article.content_list.length - 1].multi_paragraph_list = [];
        $scope.article.content_list[0].multi_paragraph_list.forEach((_k) => {
          $scope.article.content_list[$scope.article.content_list.length - 1].multi_paragraph_list.push({ ..._k });
        });
      }

      if ($scope.article.content_list[0].multi_image_list) {
        $scope.article.content_list[$scope.article.content_list.length - 1].multi_image_list = [];
        $scope.article.content_list[0].multi_image_list.forEach((_k) => {
          $scope.article.content_list[$scope.article.content_list.length - 1].multi_image_list.push({ ..._k });
        });
      }

      $scope.article.content_list[$scope.article.content_list.length - 1].language = lang;
    } else {
      let translate = {
        image_url: '/images/article.png',
        language: lang,
        show_image: true,
        show_social_image: true,
        show_external_image: true,
        actual_views: 0,
        dummy_views: 0,
        apparent_views: 0,
        actual_likes: 0,
        dummy_likes: 0,
        apparent_likes: 0,
        actual_comments: 0,
        dummy_comments: 0,
        apparent_comments: 0,
        actual_posts: 0,
        dummy_posts: 0,
        apparent_posts: 0,
        actual_ratings: 0,
        dummy_ratings: 0,
        apparent_ratings: 0,
        keywords_list: [],
      };
      $scope.article.content_list.push(translate);
    }
    $scope.article.$show_create = false;
  };

  $scope.getArticlesList();
  $scope.getArticleTypesList();
  $scope.loadClusters();
  $scope.getLanguagesList();
  $scope.loadMainCategories();
  $scope.loadWriters();
  $scope.loadEditors();
  $scope.getDefaultSetting();
  $scope.getCountriesList();
});
