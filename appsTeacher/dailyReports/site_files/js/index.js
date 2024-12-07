app.controller("dailyReports", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.search = {dateFrom : site.getDate()};
  
  $scope.baseURL = "";
  $scope.getAll = function (search) {
    const v = site.validated("#dailyReportsSearch");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/dailyReports/getAmounts`,
      data: search,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  

  $scope.displayDetails = function (item) {
    $scope.detail = item;
    site.showModal("#detailsModal");

  };

});
