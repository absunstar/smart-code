app.controller('main', function ($scope, $http, $timeout) {

    $scope.user = {};
    $scope.customer ={};
    $scope.tryLogin = function (ev) {
      if (ev.which == 13) {
        $scope.login();
      }
    };

    $scope.login = function (b) {
      $scope.error = '';

      $scope.busy = true;

      $http({
        method: 'POST',
        url: '/api/user/login',
        data: {
          $encript: '123',
          email: site.to123($scope.user.email),
          password: site.to123($scope.user.password),
        },
      }).then(
        function (response) {
          if (response.data.error) {
            $scope.error = response.data.error;
            $scope.busy = false;
          };
          if (response.data.done) {
            window.location.href = '/';
          };
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        },
      );
    };

    $scope.register = function () {
        $scope.error = "";

        const v = site.validated("body");
        if (!v.ok) {
          $scope.error = v.messages[0].ar;
          return;
        };

        console.log($scope.customer);
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/customers/signUp",
          data: $scope.customer,
        }).then(
          function (response) {

            if (response.data) {

              console.log(response.data);
              $scope.error = response.data.message;
              $scope.busy = false;
            }
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


   
  });