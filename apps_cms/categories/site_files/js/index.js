app.controller('categories', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';

  $scope.categories = {};

  $scope.displayAddCategories = function (parentCategory) {
    $scope._search = {};

    $scope.error = '';
    $scope.mode = 'add';

    if (parentCategory && parentCategory.type == 'detailed') {
      return;
    }

    $scope.categories = {
      type: 'detailed',
      active: true,
      showHome: true,
      translatedList: [],
    };

    if (parentCategory) {
      $scope.categories.parentId = parentCategory.id;
      $scope.categories.topParentId = parentCategory.topParentId || parentCategory.id;
    }

    if ($scope.categories.topParentId) {
      $scope.categories = {
        type: 'detailed',
        active: true,
        showHome: true,
        status: parentCategory.status,
        image: parentCategory.image,
      };

      $scope.categories.parentId = parentCategory.id;
      $scope.categories.topParentId = parentCategory.topParentId || parentCategory.id;
    }

    $scope.categories.translatedList = [];
    $scope.defaultSettings.languagesList.forEach((l) => {
      if (l.language.active == true) {
        $scope.categories.translatedList.push({
          language: {
            id: l.language.id,
            en: l.language.en,
            ar: l.language.ar,
          },
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
          showSocialmage: true,
          socialMediaActivation: true,
          keyWordsList: [],
        });
      }
    });

    site.showModal('#categoriesManageModal');
  };

  $scope.addCategories = function () {
    $scope.error = '';
    if ($scope.busyAdd) {
      return;
    }

    const v = site.validated('#categoriesManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busyAdd = true;
    $http({
      method: 'POST',
      url: '/api/categories/add',
      data: $scope.categories,
    }).then(
      function (response) {
        $scope.busyAdd = false;
        if (response.data.done) {
          $scope.categories = {
            type: 'detailed',
            status: 'active',
            image: '/images/categories.jpg',
          };

          site.hideModal('#categoriesManageModal');

          $scope.list.push(response.data.doc);
          $scope.getCategoriesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateCategories = function (categories) {
    $scope._search = {};
    $scope.mode = 'edit';

    $scope.error = '';
    $scope.viewCategories(categories, 'update');
    $scope.categories = {};

    site.showModal('#categoriesManageModal');
  };

  $scope.updateCategories = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#categoriesManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      alert('validated error');
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/categories/update',
      data: $scope.categories,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#categoriesManageModal');

          $scope.getCategoriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Detailed Err*')) {
            $scope.error = '##word.detailed_err##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayViewCategories = function (categories) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewCategories(categories);
    $scope.categories = {};
    site.showModal('#categoriesManageModal');
  };

  $scope.viewCategories = function (categories, type) {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/categories/view',
      data: {
        id: categories.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (type == 'update') {
            $scope.categories = response.data.doc;
          } else {
            $scope.categories = response.data.doc;
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteCategories = function (categories) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewCategories(categories);
    $scope.categories = {};
    site.showModal('#categoriesManageModal');
  };

  $scope.deleteCategories = function (category) {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/categories/delete',
      data: {
        id: category.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#categoriesManageModal');

          $scope.getCategoriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Delete Acc Err*')) {
            $scope.error = '##word.cant_delete##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getCategoriesList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];

    $http({
      method: 'POST',
      url: '/api/categories/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
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
      url: '/api/defaultSetting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          $scope.articleTypesList = $scope.defaultSettings.article.articleTypes.filter((t) => t.active == true);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.calc = function (type, lang) {
    $timeout(() => {
      if (type == 'views') {
        lang.apparentViews = lang.actualViews + lang.dummyViews;
      } else if (type == 'likes') {
        lang.apparentLikes = lang.actualLikes + lang.dummyLikes;
      } else if (type == 'comments') {
        lang.apparentComments = lang.actualComments + lang.dummyComments;
      } else if (type == 'posts') {
        lang.apparentPosts = lang.actualPosts + lang.dummyPosts;
      } else if (type == 'ratings') {
        lang.apparentRatings = lang.actualRatings + lang.dummyRatings;
      }
    }, 500);
  };

  $scope.addKeyWords = function (ev, obj) {
    $scope.busy = true;

    if (ev.which !== 13 || !obj.$keyword) {
      return;
    }

    if (!obj.keyWordsList.some((k) => k === obj.$keyword)) {
      obj.keyWordsList.push(obj.$keyword);
    }

    obj.$keyword = '';
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getCategoriesList(where);
    site.hideModal('#categoriesSearchModal');
    $scope.search = {};
  };

  $scope.getCategoriesList();
  $scope.getDefaultSetting();
});
