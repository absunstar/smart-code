app.controller("report_invoices_vendors", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_invoices_vendors = {};

  $scope.getvendorsList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {}
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
  };

  $scope.getReportInvoicesvendorsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_invoices_vendors/all",
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
          /* $scope.net_total_return = 0; */
          $scope.total_value = 0;
          $scope.net_value = 0;
          $scope.total_tax = 0;
          $scope.total_discount = 0;
          $scope.list.forEach(_invoice => {
            $scope.total_tax += _invoice.total_tax;
            $scope.total_discount += _invoice.total_discount;
            $scope.total_value += _invoice.total_value;
            $scope.net_value += _invoice.net_value;

           /*  if (_invoice.type.id == 6)
              $scope.net_total_return += _invoice.net_value;
 */
          });
          $scope.total_value = site.toNumber($scope.total_value);
          $scope.net_value = site.toNumber($scope.net_value);
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
  $scope.getvendorsList();
});