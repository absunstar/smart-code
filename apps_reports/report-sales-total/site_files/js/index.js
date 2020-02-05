app.controller("report_sales_total", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_sales_total = {};

  $scope.getReportSalesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_sales_total/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.count = response.data.doc.length;
          $scope.list = response.data.doc;
          $scope.average_cost = 0;
          $scope.count = 0;
          $scope.total = 0;
          $scope.list.forEach(_list => {
            _list.average_cost = (site.toNumber(_list.average_cost) || 0) / site.toNumber(_list.count);
            _list.average_cost = site.toNumber(_list.average_cost);
            $scope.average_cost += site.toNumber(_list.average_cost);
            $scope.count += _list.count;
            $scope.total += _list.total;
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
    $scope.getReportSalesList($scope.search);
    site.hideModal('#reportSalesSearchModal');
    $scope.search = {}
  };

  $scope.getReportSalesList();
});