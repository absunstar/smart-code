app.controller('mainCategories', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';

  $scope.mainCategories = {};

  $scope.displayAddMainCategories = function (parentMainCategory) {
    $scope._search = {};

    $scope.error = '';
    $scope.mode = 'add';

    if (parentMainCategory && parentMainCategory.type == 'detailed') {
      return;
    }

    $scope.mainCategories = {
      type: 'detailed',
      active: true,
      showHome: true,
      translatedList: [],
    };

    if (parentMainCategory) {
      $scope.mainCategories.parentId = parentMainCategory.id;
      $scope.mainCategories.topParentId = parentMainCategory.topParentId || parentMainCategory.id;
    }

    if ($scope.mainCategories.topParentId) {
      $scope.mainCategories = {
        type: 'detailed',
        active: true,
        showHome: true,
        status: parentMainCategory.status,
        imageUrl: parentMainCategory.imageUrl,
      };

      $scope.mainCategories.parentId = parentMainCategory.id;
      $scope.mainCategories.topParentId = parentMainCategory.topParentId || parentMainCategory.id;
    }

    $scope.mainCategories.translatedList = [];
    $scope.defaultSettings.languagesList.forEach((l) => {
      if (l.language.active == true) {
        $scope.mainCategories.translatedList.push({
          language: {
            id: l.language.id,
            en: l.language.en,
            ar: l.language.ar,
            direction: l.language.direction,
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

    site.showModal('#mainCategoriesManageModal');
  };

  $scope.addMainCategories = function () {
    $scope.error = '';
    if ($scope.busyAdd) {
      return;
    }

    const v = site.validated('#mainCategoriesManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busyAdd = true;
    $http({
      method: 'POST',
      url: '/api/mainCategories/add',
      data: $scope.mainCategories,
    }).then(
      function (response) {
        $scope.busyAdd = false;
        if (response.data.done) {
          $scope.mainCategories = {
            type: 'detailed',
            status: 'active',
            imageUrl: '/images/mainCategories.jpg',
          };

          site.hideModal('#mainCategoriesManageModal');

          $scope.list.push(response.data.doc);
          $scope.getMainCategoriesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateMainCategories = function (mainCategories) {
    $scope._search = {};
    $scope.mode = 'edit';

    $scope.error = '';
    $scope.viewMainCategories(mainCategories, 'update');
    $scope.mainCategories = {};

    site.showModal('#mainCategoriesManageModal');
  };

  $scope.updateMainCategories = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#mainCategoriesManageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      alert('validated error');
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/mainCategories/update',
      data: $scope.mainCategories,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainCategoriesManageModal');

          $scope.getMainCategoriesList();
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

  $scope.displayViewMainCategories = function (mainCategories) {
    $scope.error = '';
    $scope.mode = 'view';
    $scope.viewMainCategories(mainCategories);
    $scope.mainCategories = {};
    site.showModal('#mainCategoriesManageModal');
  };

  $scope.viewMainCategories = function (mainCategories, type) {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/mainCategories/view',
      data: {
        id: mainCategories.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (type == 'update') {
            $scope.mainCategories = response.data.doc;
          } else {
            $scope.mainCategories = response.data.doc;
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

  $scope.displayDeleteMainCategories = function (mainCategories) {
    $scope.error = '';
    $scope.mode = 'delete';
    $scope.viewMainCategories(mainCategories);
    $scope.mainCategories = {};
    site.showModal('#mainCategoriesManageModal');
  };

  $scope.deleteMainCategories = function (mainCategory) {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/mainCategories/delete',
      data: {
        id: mainCategory.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainCategoriesManageModal');

          $scope.getMainCategoriesList();
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

  $scope.getMainCategoriesList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];

    $http({
      method: 'POST',
      url: '/api/mainCategories/all',
      data: {
        where: where,
        lang: true,
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
    $scope.getMainCategoriesList(where);
    site.hideModal('#mainCategoriesSearchModal');
    $scope.search = {};
  };

  $scope.getMainCategoriesList();
  $scope.getDefaultSetting();
});
