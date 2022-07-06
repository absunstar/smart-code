app.controller("report_items_account", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.report_items_account = {};

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

  $scope.getReportItemsAccountList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_items_account/all",
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
          $scope.total_price_supplied = response.data.total_price_supplied;
          $scope.total_price_sold = response.data.total_price_sold;
        
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

    $scope.getReportItemsAccountList($scope.search);
    site.hideModal('#reportItemsAccountSearchModal');
    $scope.search = {}
  };

});