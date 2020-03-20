app.controller("notifications", function ($scope, $http, $interval) {

  $scope.loadLatest = function () {

    $http({
      method: "POST",
      url: "/api/notifications/latest",
      transformRequest: function (obj) {
        var str = [];
        for (var p in obj) str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: {},
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).then(
      function (response) {
        if (response.data.done) {
          $scope.latestList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.loadLatest();

  $interval($scope.loadLatest, 5000)

});