app.controller("report_full_employees", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_full_employees = {};

  $scope.getFullOrderEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'trainer': { $ne: true },
          'delivery': { $ne: true }
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.employeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getOrderStatusList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.orderStatusList = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/order_status/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.orderStatusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTransactionTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.transactionTypeList = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/transaction_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.transactionTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getReportFullOrdersEmployeesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_full_employees/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.net_value = 0;
          $scope.total_tax = 0;
          $scope.total_discount = 0;
          $scope.list.forEach(invoice => {
            $scope.net_value += invoice.net_value;
            $scope.remain_amount += invoice.remain_amount;
            $scope.total_tax += invoice.total_tax;
            $scope.total_discount += invoice.total_discount;
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
    $scope.getReportFullOrdersEmployeesList($scope.search);
    site.hideModal('#reportEmployeeDeliverySearchModal');
    $scope.search = {}
  };

  $scope.getFullOrderEmployeesList();
  $scope.getOrderStatusList();
  $scope.getTransactionTypeList();
});