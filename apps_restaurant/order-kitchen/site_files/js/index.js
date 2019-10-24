app.controller("order_kitchen", function ($scope, $http, $interval) {
  $scope._search = {};


  $scope.showSearch = function () {
    site.showModal('#searchModal');
  };

  $scope.searchAll = function () {

    $scope.getMenuList($scope.search);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.doneDelivery = function (i) {

    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_kitchen/update",
      data: i
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.loadKitchens = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        select: {
          id: 1,
          name: 1,
          printer_path:1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.kitchensList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDefaultSettings = function () {

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          $scope.error = '';
          $scope.order_kitchen = {};
          $scope.order_kitchen.kitchen = $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.kitchen : null
          if ($scope.order_kitchen.kitchen && $scope.order_kitchen.kitchen.id) {
            $scope.orderKitchensList();
          }
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.orderKitchensList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_kitchen/active_all",
      data: {
        where: $scope.order_kitchen
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done){
          $scope.count = response.data.count;
          $scope.book_list_report = response.data.list
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadKitchens();
  $scope.getDefaultSettings();

  $interval(() => {
    $scope.orderKitchensList();
  }, 1000 * 5);
});







