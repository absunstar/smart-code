app.controller('categories', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.mode = 'add';

  $scope.category = {};
  $scope.siteSetting = site.showObject('##data.#setting##');

  $scope.displayAddCategories = function () {
    $scope._search = {};

    $scope.error = '';
    $scope.mode = 'add';

    $scope.category = {
      active: true,
      translatedList: [],
    };

    $scope.siteSetting.languageList.forEach((l) => {
      if (l.active == true) {
        $scope.category.translatedList.push({
          language: {
            active: true,
            id: l.id,
            name: l.name,
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
    console.log($scope.category);
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
      data: $scope.category,
    }).then(
      function (response) {
        $scope.busyAdd = false;
        if (response.data.done) {
          $scope.category = {
            status: 'active',
            image: '/images/categories.jpg',
          };

          site.hideModal('#categoriesManageModal');

          $scope.list.push(response.data.doc);
          $scope.getcategoryList();
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
    $scope.category = {};

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
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/categories/update',
      data: $scope.category,
    }).then(
      function (response) {
        $scope.busy = false;
        console.log(response.data);
        if (response.data.done) {
          site.hideModal('#categoriesManageModal');

          $scope.getcategoryList();
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
    $scope.category = {};
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
          $scope.category = response.data.doc;
          $scope.siteSetting.languageList.forEach((l) => {
            let index = $scope.category.translatedList.find((t) => t.language.id == l.id);
            if (index == -1) {
              $scope.category.translatedList.push({
                language: {
                  id: l.id,
                  name: l.name,
                  active: l.active,
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
            } else {
              $scope.category.translatedList[index].language = { ...l };
            }
          });
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
    $scope.category = {};
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

          $scope.getcategoryList();
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

  $scope.getcategoryList = function (where) {
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
    $scope.error = '';
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
    $scope.getcategoryList(where);
    site.hideModal('#categoriesSearchModal');
    $scope.search = {};
  };

  $scope.getcategoryList();
});
