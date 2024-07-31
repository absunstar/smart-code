app.controller("packageView", function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.baseURL = "";
  $scope.view = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/packages/view`,
      data: {
        _id:"##query.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.showEnterCode = function () {
    $scope.code = "";
    if (site.toNumber("##user.id##") < 1) {
      window.location.href = "/login";
    } else {
      site.showModal("#codeModal");
    }
  };

  $scope.buyPackage = function () {
    $scope.errorCode = "";
    const v = site.validated("#codeModal");
    if (!v.ok) {
      $scope.errorCode = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/packages/buyCode`,
      data: {
        code: $scope.code,
        packageId: $scope.item.id,
        packagePrice: $scope.item.price,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#codeModal");
          site.resetValidated("#codeModal");
          $scope.code = "";
          $scope.view();
        } else {
          $scope.errorCode = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.view();
});
