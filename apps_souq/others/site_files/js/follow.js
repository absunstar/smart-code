app.controller('follow', function ($scope, $http, $timeout) {


  $scope.updateFollow = function (user,follow) {
    $scope.error = "";

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/update_follow",
      data: {id : user.id , follow : follow},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getUsers();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.getUsers = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where:{'followers_list' : site.toNumber('##user.id##')},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.users_list = response.data.users;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.getUsers();
});
