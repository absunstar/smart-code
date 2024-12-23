app.controller('login_souq', function ($scope, $http, $timeout) {
  $scope.user = {};
  
  $scope.loginKeyDown = function (ev) {
    if (ev.which !== 13) {
      return;
    } else {
      $scope.login();
    }
  };

  $scope.login = function () {
    $scope.error = '';
    const v = site.validated('#loginSouqModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
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
        mobile_login : true,
      },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = "##word.email_or_pass_error##";
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
  $scope.showPassword = function () {
    $timeout(() => {
      document.querySelectorAll('.pass input').forEach((p) => {
        p.setAttribute('type', $scope.show_password ? 'text' : 'password');
      });
    }, 100);
  };
});
