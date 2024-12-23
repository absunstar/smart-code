app.controller("order_distributor", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.order_distributor = {};

  $scope.doneDelivery = function (order) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        order.status_delivery = {
          id: 2,
          En: "Done Delivery",
          Ar: "تم التوصيل"
        };
        $scope.updateTables(order);
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateTables = function (order) {
    $scope.error = '';
    const v = site.validated('#tablesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
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
          $scope.total_net_value = 0;
          $scope.total_delivery_service_price = 0;
          response.data.list.forEach(orderList => {
            $scope.total_net_value += orderList.net_value;
            $scope.total_delivery_service_price += orderList.price_delivery_service;

          });
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

  $scope.showDetailes = function (order) {
    $scope.order_distributor = order;
    site.showModal('#orderDistributorDetailsModal');

  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getOrderDistributor($scope.search);
    site.hideModal('#orderDistributorSearchModal');
    $scope.search = {}
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

  $scope.getOrderDistributor({ date: new Date() });
  $scope.getDeliveryEmployeesList();
});