app.controller("articles", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.article = {};

  $scope.displayAddArticles = function () {
    $scope.error = '';
    $scope.article = {
      image_url: '/images/article.png',
      active: true
    };
    if ($scope.defaultSettings.article) {

      if ($scope.defaultSettings.article.closing_system) {
        if ($scope.defaultSettings.article.closing_system.id == 2) {
          $scope.article.expiry_date = new Date();
          $scope.article.expiry_date.setDate($scope.article.expiry_date.getDate() + 7);
        }
      }
    }
    site.showModal('#articleAddModal');
    document.querySelector("#articleAddModal .tab-link").click();
  };

  $scope.addArticles = function () {
    $scope.error = '';
    const v = site.validated('#articleAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/articles/add",
      data: $scope.article
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#articleAddModal');
          $scope.getArticlesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateArticles = function (article) {
    $scope.error = '';
    $scope.viewArticles(article);
    $scope.article = {};
    site.showModal('#articleUpdateModal');
    document.querySelector("#articleUpdateModal .tab-link").click();
  };

  $scope.updateArticles = function () {
    $scope.error = '';
    const v = site.validated('#articleUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/articles/update",
      data: $scope.article
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#articleUpdateModal');
          $scope.getArticlesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsArticles = function (article) {
    $scope.error = '';
    $scope.viewArticles(article);
    $scope.article = {};
    site.showModal('#articleViewModal');
  };

  $scope.viewArticles = function (article) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/articles/view",
      data: {
        id: article.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.article = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteArticles = function (article) {
    $scope.error = '';

    $scope.viewArticles(article);
    $scope.article = {};
    site.showModal('#articleDeleteModal');
  };

  $scope.deleteArticles = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/articles/delete",
      data: {
        id: $scope.article.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#articleDeleteModal');
          $scope.getArticlesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };



  $scope.getArticlesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/articles/all",
      data: {
        where: where
      }
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
    )
  };

  $scope.getArticleTypesList = function () {
    $scope.error = "";
    $scope.busy = true;
    $scope.articleTypesList = [];
    $http({
      method: "POST",
      url: "/api/article_types/all",
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
    $scope.error = "";
    $scope.busy = true;
    $scope.languagesList = [];
    $http({
      method: "POST",
      url: "/api/languages/all",
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
      method: "POST",
      url: "/api/users/all",
      data: {
        where: where,
        select: { id: 1, profile: 1 }
      }
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
    )
  };

  $scope.loadEditors = function (where) {
    $scope.error = '';
    $scope.busy = true;
    where = where || {};
    where['type.id'] = 2;

    $http({
      method: "POST",
      url: "/api/users/all",
      data: {
        where: where,
        select: { id: 1, profile: 1 }
      }
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
    )
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
    $scope.error = "";
    $scope.article.translation_list = $scope.article.translation_list || [];
    $scope.article.translation_list.push({

    });
  };


  $scope.addMultiParagraph = function (article) {
    $scope.error = "";
    article.multi_paragraph_list = article.multi_paragraph_list || [];
    article.multi_paragraph_list.push({
      show_image : true
    });
  };

  $scope.addMultiImage = function (article) {
    $scope.error = "";
    article.multi_image_list = article.multi_image_list || [];
    article.multi_image_list.push({
      show_image : true
    });
  };

  $scope.createArticle = function (translate) {
    $scope.error = "";
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

  $scope.addKeyDown = function (ev,keyWord) {
    $scope.busy = true;

    if (ev.which !== 13 || !keyWord) {
      return;
    };

    $scope.article.keywords_list = $scope.article.keywords_list || [];
    $scope.article.keywords_list.push(keyWord);
    $scope.article.$keyword = '';
  }

  $scope.editTranslateArticle = function (t, type) {
    $scope.translate = t;
    $scope.translate.$type = type;
    site.showModal('#translateContentModal');
  };

  $scope.searchAll = function () {

    $scope.getArticlesList($scope.search);
    site.hideModal('#articleSearchModal');
    $scope.search = {};
  };

  $scope.getArticlesList();
  $scope.getArticleTypesList();
  $scope.loadClusters();
  $scope.getLanguagesList();
  $scope.loadMainCategories();
  $scope.loadWriters();
  $scope.loadEditors();
  $scope.getDefaultSetting();
});