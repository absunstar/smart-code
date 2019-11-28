app.controller("report_employee_delivery", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_employee_delivery = {};

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

  $scope.getReportEmployeeDeliveryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_employee_delivery/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.total_delivery_service_price = 0;
          $scope.net_value = 0;
          $scope.paid_up = 0;
          $scope.list.forEach(invoice => {
            $scope.total_delivery_service_price += invoice.price_delivery_service;
            $scope.remain_amount += invoice.remain_amount;
            $scope.net_value += invoice.net_value;
            $scope.paid_up += invoice.paid_up;
          });
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
    $scope.getReportEmployeeDeliveryList($scope.search);
    site.hideModal('#reportEmployeeDeliverySearchModal');
    $scope.search = {}
  };

  $scope.getReportEmployeeDeliveryList({date : new Date()});
  $scope.getDeliveryEmployeesList();
});