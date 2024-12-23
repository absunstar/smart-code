app.controller("subscriptionView", function ($scope, $http, $timeout) {
  $scope.item = {};
  $scope.baseURL = "";
  $scope.purchase = {};
  $scope.view = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/subscriptions/view`,
      data: {
        _id:"##query.id##",
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
          $scope.getPurchaseTypeTeacher($scope.item.teacherId);
          if($scope.item.$buy){

            $scope.alert = "##word.Purchased##";
          }

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

  $scope.buySubscription = function () {
    $scope.errorCode = "";
    const v = site.validated("#codeModal");
    if (!v.ok) {
      $scope.errorCode = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/subscriptions/buyCode`,
      data: {
        purchase: $scope.purchase,
        subscriptionId: $scope.item.id,
        subscriptionPrice: $scope.item.price,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#codeModal");
          site.resetValidated("#codeModal");
          if($scope.purchase.purchaseType && $scope.purchase.purchaseType.name != 'code') {
            $scope.alert = "##word.Please wait until your payment details are reviewed and your purchase is confirmed##";
          }
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
  $scope.getPurchaseTypeTeacher = function (teacherId) {
    $scope.busy = true;
    $scope.error = "";
    $scope.purchaseTypeList = [];
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/manageUsers/purchaseTypeTeacher`,
      data: teacherId,
    }).then(
      function (response) {
        $scope.busy = false;        
        if (response.data.done) {
          $scope.purchaseTypeList = response.data.list;
          $scope.purchase.purchaseType = $scope.purchaseTypeList.find((p) => p.default);
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.view();
});
