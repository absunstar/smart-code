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
          $scope.list.forEach(_invoice => {
            _invoice.net_value = site.toNumber(_invoice.net_value);
            _invoice.total_book_list = site.toNumber(_invoice.total_book_list);
            

            $scope.total_delivery_service_price += _invoice.price_delivery_service;
            $scope.remain_amount += _invoice.remain_amount;
            $scope.net_value += _invoice.net_value;
            $scope.paid_up += _invoice.paid_up;
          });

          $scope.total_delivery_service_price = site.toNumber($scope.total_delivery_service_price);
          $scope.remain_amount = site.toNumber($scope.remain_amount);
          $scope.net_value = site.toNumber($scope.net_value);
          $scope.paid_up = site.toNumber($scope.paid_up);

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
    if ($scope.search)
      $scope.delivery_employee = $scope.search.delivery_employee;

    $scope.getReportEmployeeDeliveryList($scope.search);
    site.hideModal('#reportEmployeeDeliverySearchModal');
    $scope.search = {}
  };

  $scope.getReportEmployeeDeliveryList({ date: new Date() });
  $scope.getDeliveryEmployeesList();
});