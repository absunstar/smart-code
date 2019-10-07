app.controller("order_distributor", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.order_distributor = {};

  $scope.doneDelivery = function (order) {
    order.status_delivery = {
      id: 2,
      en: "Done Delivery",
      ar: "تم التوصيل"
    };
    $scope.updateTables(order);
  };

  $scope.updateTables = function (order) {
    $scope.error = '';
    const v = site.validated('#tablesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_distributor/update",
      data: order
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getOrderDistributor();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getDeliveryEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.deliveryEmployeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getOrderDistributor = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order_distributor/all",
      data: {
        where: where
      }
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
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getOrderDistributor($scope.search);
    site.hideModal('#orderDistributorSearchModal');
    $scope.search = {}
  };

  $scope.getOrderDistributor();
  $scope.getDeliveryEmployeesList();
});