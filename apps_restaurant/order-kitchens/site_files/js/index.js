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

    $scope.get_open_shift((shift) => {
      if (shift) {
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
              $scope.items_report.splice($scope.items_report.indexOf(i), 1)
              $scope.items_report = $scope.items_report
            } else {
              $scope.error = response.data.error;
            }
          },
          function (err) {
            console.log(err);
          }
        )
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };


  $scope.loadKitchens = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.kitchensList = [];
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          printer_path: 1,
          code : 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.kitchensList = response.data.list;
          $scope.getDefaultSettings(response.data.list);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDefaultSettings = function (kitchensList) {

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
          if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.kitchen){
            $scope.order_kitchen.kitchen = kitchensList.find(_kitchen => { return _kitchen.id === $scope.defaultSettings.general_Settings.kitchen.id });
          }

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
    $scope.error = '';
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
        if (response.data.done) {
          $scope.count = response.data.count;
          $scope.items_report = response.data.list

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showExtrasItems = function (size) {
    $scope.error = '';
    $scope.size = size;
    site.showModal('#extrasModal');

  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.shift = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
      }
    )
  };

  $scope.loadKitchens();

  $interval(() => {
    $scope.orderKitchensList();
  }, 1000 * 20);

});







