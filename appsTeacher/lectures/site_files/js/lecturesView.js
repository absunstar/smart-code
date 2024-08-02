app.controller("lecturesView", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.baseURL = "";

  $scope.getAll = function (ev) {
    $scope.busy = true;
    $scope.error = "";
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/lectures/allToStudent`,
        data: {
          type: "toStudent",
          search: $scope.$search,
          
        },
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
    }
  };

  $scope.getAll({ which: 13 });
});
