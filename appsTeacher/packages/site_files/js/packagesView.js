app.controller("packagesView", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.baseURL = "";
  $scope.getAll = function (ev) {
    $scope.busy = true;
    $scope.error = "";
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/packages/all`,
        data: {
        type: 'toStudent',
          search: $scope.$search,
          select: {
            id: 1,
            name: 1,
            image: 1,
            price: 1,
            date: 1,
            code: 1,
            description: 1,
            totalLecturesPrice: 1,
          },
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
