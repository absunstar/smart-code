app.controller("profileView", function ($scope, $http, $timeout) {
  $scope.displayUser = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/user/view",
      data: {
        id: site.toNumber("##params.id##"),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          document.getElementById("bio").innerHTML = '##data.bio##';
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayUser();
});
