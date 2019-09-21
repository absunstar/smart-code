app.controller("register", function ($scope, $http, $timeout) {

  $scope.register = {};

  $scope.displayAddcompany = function () {
    $scope.error = '';
    $scope.register = [];
    $scope.company = {
      image_url: '/images/company.png',
    };
    site.showModal('#registerAddcompany');

  };

  $scope.addcompany = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#registerAddcompany');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.company.company_password != $scope.company.company_password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    $http({
      method: "POST",
      url: "/api/register/add",
      data: $scope.company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          document.location.href = '/';
          
          site.hideModal('#registerAddcompany');
          $scope.company = [];
          $scope.getregisterList();
        } else {
          $scope.error = 'Please Login First';
        }

      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getregisterList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/register/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#registerearchModal');
        }
      
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getregisterList();
  $scope.displayAddcompany();

});