app.controller("report_invoices_customers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_invoices_customers = {};

  $scope.getCustomersList = function (ev) {
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer
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
      url: "/api/report_invoices_customers/all",
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
          $scope.remain_amount = 0;
          $scope.total_paid_up = 0;
          $scope.net_value = 0;
          $scope.total_tax = 0;
          $scope.total_discount = 0;
          $scope.list.forEach(_invoice => {
            _invoice.net_value = site.toNumber(_invoice.net_value);
            _invoice.remain_amount = site.toNumber(_invoice.remain_amount);
            $scope.total_tax += _invoice.total_tax;
            $scope.total_discount += _invoice.total_discount;
            $scope.remain_amount += _invoice.remain_amount;
            $scope.total_paid_up += _invoice.total_paid_up;
            $scope.net_value += _invoice.net_value;


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
      $scope.customer = $scope.search.customer;

    $scope.getReportInvoicescustomersList($scope.search);
    site.hideModal('#reportInvoicesCustomersSearchModal');
    $scope.search = {}
  };

  $scope.getReportInvoicescustomersList({ date: new Date() });
});