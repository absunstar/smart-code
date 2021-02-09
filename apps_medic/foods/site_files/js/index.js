app.controller("foods", function ($scope, $http, $timeout) {

  $scope.foods = {};

  $scope.displayAddFoods = function () {
    $scope.error = '';
    $scope.foods = {
      image_url: '/images/foods.png',
      active: true

    };

    site.showModal('#foodsAddModal');

  };

  $scope.addFoods = function () {
    $scope.error = '';
    const v = site.validated('#foodsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/foods/add",
      data: $scope.foods
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#foodsAddModal');
          $scope.getFoodsList();
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

  $scope.displayUpdateFoods = function (foods) {
    $scope.error = '';
    $scope.viewFoods(foods);
    $scope.foods = {};
    site.showModal('#foodsUpdateModal');
  };

  $scope.updateFoods = function () {
    $scope.error = '';
    const v = site.validated('#foodsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/foods/update",
      data: $scope.foods
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#foodsUpdateModal');
          $scope.getFoodsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsFoods = function (foods) {
    $scope.error = '';
    $scope.viewFoods(foods);
    $scope.foods = {};
    site.showModal('#foodsViewModal');
  };

  $scope.viewFoods = function (foods) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/foods/view",
      data: {
        id: foods.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.foods = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteFoods = function (foods) {
    $scope.error = '';
    $scope.viewFoods(foods);
    $scope.foods = {};
    site.showModal('#foodsDeleteModal');
  };

  $scope.deleteFoods = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/foods/delete",
      data: {
        id: $scope.foods.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#foodsDeleteModal');
          $scope.getFoodsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getFoodsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/foods/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#foodsSearchModal');
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
        screen: "foods"
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
    site.showModal('#foodsSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getFoodsList($scope.search);
    site.hideModal('#foodsSearchModal');
    $scope.search = {};
  };

  $scope.getFoodsList();
  $scope.getNumberingAuto();
});