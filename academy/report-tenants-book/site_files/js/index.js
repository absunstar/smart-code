app.controller("report_tenants_book", function ($scope, $http) {

  var Search = function () {
    return {
      tenants: {},
      date: new Date()
    }
  };

  $scope.report = {};

  $scope.search = new Search();

  $scope.showSearch = function () {
    site.showModal('#searchModal');
    $scope.report.tenants_list = [];
  };

  $scope.searchAll = function () {

    $scope.tenants = $scope.search.tenants;
    $scope.getTicketList($scope.search.tenants);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.gettenantsList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tenant/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tenantsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTicketList = function (tenants) {

    $scope.report = {
      date: $scope.search.date,
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/book_hall/tenants_report",
      data: {
        where: {
          'tenant.id': tenants.id,
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.bookList = response.data.list;
          $scope.report.tenants_list = $scope.report.tenants_list || [];
          $scope.report.total_rest = 0; 
          $scope.report.total_paid = 0;
          $scope.report.rest = 0;
          $scope.bookList.forEach(b => {
          
            $scope.report.tenants_list.push({
              class_room : b.class_room.name,
              book_date : b.book_date,
              start_date : b.start_date,
              end_date : b.end_date,
              price : b.total_value,
              paid : b.total_rest,
              rest : b.rest
            })

            $scope.report.total_rest +=  site.toNumber(b.total_value) ;
            $scope.report.total_paid +=  site.toNumber(b.total_rest) ;
            $scope.report.rest +=  site.toNumber(b.rest) ;
          });

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.gettenantsList();

});