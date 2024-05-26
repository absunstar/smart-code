app.controller("notificationsView", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.updateStudentNotifications = function (type,id) {
    $scope.error = "";

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manageUsers/updateStudentNotifications",
      data: {
        type : type,
        id : id
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.result
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };
  $scope.getUser = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/user/view`,
      data: {
        id: site.toNumber("##user.id##"),
        type : 'notifications'
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getUser();
  $scope.updateStudentNotifications('showAll');
});
