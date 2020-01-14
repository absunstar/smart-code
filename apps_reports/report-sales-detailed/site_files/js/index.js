app.controller("report_sales_detailed", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_sales_detailed = {};

  $scope.getReportSalesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_sales_detailed/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.count = response.data.doc.length;
          $scope.list = response.data.doc;
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