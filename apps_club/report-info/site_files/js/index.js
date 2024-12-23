app.controller("report_info", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.getReportServicesList = function (where) {
    $scope.search = {};
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/report_info/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.paid_require = 0;
          $scope.total_discount = 0;
          $scope.total_paid_up = 0;
          $scope.total_remain = 0;
          $scope.list.forEach(request => {
            $scope.paid_require += request.paid_require || 0;
            $scope.total_discount += request.total_discount || 0;
            $scope.total_paid_up += request.total_paid_up || 0;
            $scope.total_remain += request.total_remain || 0;
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
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
          /*  select: {
            id: 1,
            name_Ar: 1,
            name_En: 1,
          } */
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
    };
  };


  $scope.searchAll = function () {
    if ($scope.search) $scope.customer = $scope.search.customer;

    $scope.getReportServicesList($scope.search);


    site.hideModal('#reportInfoSearchModal')

  };



  $scope.getReportServicesList();
});