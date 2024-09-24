app.controller("profileView", function ($scope, $http, $timeout) {
  $scope.displayUser = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/user/view",
      data: {
        _id: "##query.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.teacher = response.data.doc;
          document.getElementById("bio").innerHTML = "##data.teacher.bio##";
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.centersView = function () {
    $scope.error = "";
    if ("##user.id##" > 0) {
      window.location.href = "/centersView";
    } else {
      window.location.href = "/login";
    }
  };
  $scope.displayUser();
});
