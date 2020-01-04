app.controller("report_orders", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_orders = {};

 

  $scope.getReportSalesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_orders/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.list.length;
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
    $scope.getReportSalesList($scope.search);
    site.hideModal('#reportSalesSearchModal');
    $scope.search = {}
  };

  $scope.getReportSalesList({date : new Date()});
});