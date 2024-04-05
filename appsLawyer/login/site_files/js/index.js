app.controller('login', function ($scope, $http, $timeout) {
  $scope.user = {};
  $scope.login = function () {
    $scope.error = '';
    const v = site.validated('#loginSouqModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
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
          $scope.error = '##word.Email Or Pass Error##';
          $scope.busy = false;
        }
        if (response.data.done) {
          window.location.href = '/';
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.showPassword = function () {
    $timeout(() => {
      document.querySelectorAll('.pass input').forEach((p) => {
        p.setAttribute('type', $scope.show_password ? 'text' : 'password');
      });
    }, 100);
  };
});
