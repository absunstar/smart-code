app.controller("main_categories", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.main_categories = {};

  $scope.displayAddMainCategories = function () {
    $scope.error = '';
    $scope.main_categories = {
      image_url: '/images/main_categories.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#mainCategoriesAddModal');
    
  };

  $scope.addMainCategories = function () {
    $scope.error = '';
    const v = site.validated('#mainCategoriesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/main_categories/add",
      data: $scope.main_categories
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainCategoriesAddModal');
          $scope.getMainCategoriesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateMainCategories = function (main_categories) {
    $scope.error = '';
    $scope.viewMainCategories(main_categories);
    $scope.main_categories = {};
    site.showModal('#mainCategoriesUpdateModal');
  };

  $scope.updateMainCategories = function () {
    $scope.error = '';
    const v = site.validated('#mainCategoriesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/main_categories/update",
      data: $scope.main_categories
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainCategoriesUpdateModal');
          $scope.getMainCategoriesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsMainCategories = function (main_categories) {
    $scope.error = '';
    $scope.viewMainCategories(main_categories);
    $scope.main_categories = {};
    site.showModal('#mainCategoriesViewModal');
  };

  $scope.viewMainCategories = function (main_categories) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/main_categories/view",
      data: {
        id: main_categories.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.main_categories = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteMainCategories = function (main_categories) {
    $scope.error = '';
    $scope.viewMainCategories(main_categories);
    $scope.main_categories = {};
    site.showModal('#mainCategoriesDeleteModal');

  };

  $scope.deleteMainCategories = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/main_categories/delete",
      data: {
        id: $scope.main_categories.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainCategoriesDeleteModal');
          $scope.getMainCategoriesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getMainCategoriesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/main_categories/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#mainCategoriesSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "main_categories"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

 
  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#mainCategoriesSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getMainCategoriesList($scope.search);
    site.hideModal('#mainCategoriesSearchModal');
    $scope.search = {};

  };

  $scope.getMainCategoriesList();
  $scope.getNumberingAuto();
});