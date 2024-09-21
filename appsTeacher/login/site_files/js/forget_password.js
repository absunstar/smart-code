let btn1 = document.querySelector('.tab-link');
if (btn1) {
  btn1.click();
}

app.controller('forget_password', function ($scope, $http, $timeout) {
  $scope.user = { };
  document.getElementById('enter_mobile_or_email').style.display = 'block';
  document.getElementById('code_confirm').style.display = 'none';
  document.getElementById('newPassword').style.display = 'none';
  /*  
    document.getElementById('mobile_data').style.display = 'none'; */

  $scope.sendCode = function (mobile_or_email) {
    $scope.error = '';
    const v = site.validated('#enter_mobile_or_email');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/forget_password/send_code',
      data: { mobile_or_email: mobile_or_email },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          if (response.data.error.like('*Wrong mail*')) {
            $scope.error = '##word.wrong_mail_or_phone##';
          } else if (response.data.error.like('*wait mobile*')) {
            $scope.error = '##word.please_wait_to_send_mobile_code_again##';
            return;
          }
          $scope.busy = false;
        } else if (response.data.done) {
          $scope.type = response.data.type;
          $scope.mobile_or_email = response.data.mobile_or_email;
          document.getElementById('enter_mobile_or_email').style.display = 'none';
          document.getElementById('code_confirm').style.display = 'block';
          $scope.busy = false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.resendCode = function () {
    $scope.error = '';
    $scope.sent_new_code = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/forget_password/send_code',
      data: { mobile_or_email: $scope.mobile_or_email },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          if (response.data.error.like('*wait mobile*')) {
            $scope.error = '##word.please_wait_to_send_mobile_code_again##';
            return;
          }
          $scope.busy = false;
        } else if (response.data.done) {
          if (response.data.doneSendMobile) {

            $scope.sent_new_code = '##word.the_new_code_has_been_sent_to_your_phone##';
          }

          $scope.type = response.data.type;
          $scope.mobile_or_email = response.data.mobile_or_email;
          $scope.busy = false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.checkSecretCode = function (secret_code) {
    $scope.error = '';
    $scope.sent_new_code = '';
    const v = site.validated('#code_confirm');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/forget_password/check_code',
      data: { mobile_or_email: $scope.mobile_or_email, code: secret_code },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          document.getElementById('code_confirm').style.display = 'none';
          document.getElementById('newPassword').style.display = 'block';
          $scope.type = response.data.type;
          $scope.mobile_or_email = response.data.mobile_or_email;
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Incorrect code*')) {
            $scope.error = '##word.incorrect_password_entered##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.setNewPassword = function (newPassword) {
    $scope.error = '';
    $scope.sent_new_code = '';
    const v = site.validated('#newPassword');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/forget_password/newPassword',
      data: {
        $encript: '123',
        mobile_or_email: site.to123($scope.mobile_or_email),
        newPassword: site.to123(newPassword),
        code: site.to123($scope.secret_code),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          window.location.href = "/login";

        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Incorrect code*')) {
            $scope.error = '##word.incorrect_password_entered##';
          }
        }
      },
      function (err) {
        console.log(err);
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
