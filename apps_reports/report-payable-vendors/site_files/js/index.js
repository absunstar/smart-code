app.controller("report_payable_vendors", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_payable_vendors = {};

  $scope.getVendorsList = function (ev) {
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/vendors/all",
        data: {
          search: $scope.search_vendor,
          where:{
            active: true
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.vendorsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    }
  };

  $scope.getReportInvoicesvendorsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_payable_vendors/all",
      data: {
        where: where,
        select: {

        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.total_payments_payable = 0;
          $scope.list.forEach(_invoice => {
     
            $scope.total_payments_payable += _invoice.value;

          });
          $scope.total_payments_payable = site.toNumber($scope.total_payments_payable);
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
      $scope.vendor = $scope.search.vendor;

    $scope.getReportInvoicesvendorsList($scope.search);
    site.hideModal('#reportInvoicesVendorsSearchModal');
    $scope.search = {}
  };

  $scope.getReportInvoicesvendorsList({ date: new Date() });
});