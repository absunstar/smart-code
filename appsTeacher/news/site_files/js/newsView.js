app.controller("newsView", function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.baseURL = "";
  $scope.purchase = {};
  $scope.view = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/news/view`,
      data: {
        _id:"##query.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          document.getElementById('description').innerHTML = $scope.item.description;
          
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.view();
});
