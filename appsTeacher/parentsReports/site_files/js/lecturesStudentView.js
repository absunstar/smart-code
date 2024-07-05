app.controller("lecturesStudentView", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.baseURL = "";
  $scope.getAll = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/parentsReports/lecturesStudent`,
      data: {studentId : '##query.id##'},
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

  $scope.getAll();
});
