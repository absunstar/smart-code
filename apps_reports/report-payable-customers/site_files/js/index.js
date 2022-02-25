app.controller("report_payable_customers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_payable_customers = {};

  $scope.getCustomersList = function (ev) {
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer,
          where:{
            active: true
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.customersList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    }
  };

  $scope.getReportInvoicescustomersList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_payable_customers/all",
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
     
            $scope.total_payments_payable += _invoice.remain;

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
      $scope.customer = $scope.search.customer;

    $scope.getReportInvoicescustomersList($scope.search);
    site.hideModal('#reportInvoicesCustomersSearchModal');
    $scope.search = {}
  };

  $scope.getReportInvoicescustomersList({ date: new Date() });
});