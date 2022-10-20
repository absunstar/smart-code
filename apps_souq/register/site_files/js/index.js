app.controller('register_souq', function ($scope, $http, $timeout) {
  $scope.user = { image_url: '/images/user_logo.png' };

  $scope.registerSouq = function () {
    $scope.error = '';
    const v = site.validated('#registersouqModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.user) {
      if ($scope.user.password === $scope.user.re_password) {
        $scope.busy = true;
        $http({
          method: 'POST',
          url: '/api/register',
          data: {
            $encript: '123',
            email: site.to123($scope.user.email),
            password: site.to123($scope.user.password),
            first_name: $scope.user.first_name,
            last_name: $scope.user.last_name,
            image_url: $scope.user.image_url,
          },
        }).then(
          function (response) {
            if (response.data.error) {
              $scope.error = response.data.error;
              $scope.busy = false;
            }
            if (response.data.user) {
              window.location.href = '/';
            }
          },
          function (err) {
            $scope.busy = false;
            $scope.error = err;
          }
        );
      } else {
        $scope.error = '##word.password_err_match##';
      }
    }
  };

    $scope.showPassword = function () {
    $timeout(() => {
      document.querySelectorAll('.pass input').forEach((p) => {
        p.setAttribute('type', $scope.show_password ? 'text' : 'password');
      });
    }, 100);
  };
});
