app.controller("report_employee_delegate", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_employee_delegate = {};

  $scope.getDelegateList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delegates/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.delegatesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getReportEmployeeDelegateList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_employee_delegate/all",
      data: {
        where: where,
        select : {

        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;          
          $scope.total_value = 0;
          $scope.net_value = 0;
          $scope.total_tax = 0;
          $scope.total_discount = 0;
          $scope.list.forEach(_invoice => {          
            $scope.total_tax += _invoice.total_tax;
            $scope.total_discount += _invoice.total_discount;
            $scope.total_value += _invoice.total_value;
            $scope.net_value += _invoice.net_value;
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
    $scope.delegate = $scope.search.delegate;
    $scope.getReportEmployeeDelegateList($scope.search);
    site.hideModal('#reportEmployeeDelegateSearchModal');
    $scope.search = {}
  };

  $scope.getReportEmployeeDelegateList({date : new Date()});
  $scope.getDelegateList();
});