app.controller("teachersView", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.baseURL = "";
  $scope.getAll = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/manageUsers/all`,
      data: {
        search: $scope.$search,
        where: {
          type: "teacher",
        },
        select: {
          id: 1,
          firstName: 1,
          lastName: 1,
          image: 1,
          title: 1,
          bio: 1,
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
  };

  $scope.selectTeacher = function (id) {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/selectTeacher",
      data: id,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          window.location.href = "/";
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };


  $scope.getAll();
});
