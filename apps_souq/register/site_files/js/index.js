let btn1 = document.querySelector('.tab-link');
if (btn1) {
  btn1.click();
}

app.controller('register_souq', function ($scope, $http, $timeout) {
  $scope.user = { image_url: '/images/user_logo.png' };
  document.getElementById('mobile_mailer').style.display = 'block';
  document.getElementById('mobile_confirm').style.display = 'none';
  document.getElementById('mobile_data').style.display = 'none';

  $scope.resendCode = function (mailer_id, type) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/mailer/resend',
      data: { id: mailer_id, type: type },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          $scope.busy = false;
        } else if (response.data.done) {
          $scope.mailer = response.data.doc;

          $scope.busy = false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.validMobile = function (obj) {
    $scope.error = '';
    const v = site.validated('#mobile_mailer');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/register/validate_mobile',
      data: obj,
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          if (response.data.error.like('*enter a valid mobile*')) {
            $scope.error = '##word.please_enter_valid_mobile_number##';
          }
          $scope.busy = false;
        } else if (response.data.done) {
          site.showModal('#dealModal');

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
    const v = site.validated('#mobile_confirm');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/mailer/check_code',
      data: { id: $scope.mailer.id, code: secret_code },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          document.getElementById('mobile_confirm').style.display = 'none';
          document.getElementById('mobile_data').style.display = 'block';
          $scope.mailer = response.data.doc;
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

  $scope.showDeal = function (params) {
    site.showModal('#dealModal');
  };

  $scope.registerMailer = function (mailer, type) {
    $scope.error = '';
    if (type == 'mobile') {
      let v = site.validated('#mobile_mailer');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
      mailer.type = 'mobile';
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/mailer/add',
      data: mailer,
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          if (response.data.error.like('*Mobile Exists*')) {
            $scope.error = '##word.mobile_number_already_exists##';
            return;
          }
        } else if (response.data.done) {
          $scope.mailer = response.data.doc;
          document.getElementById('mobile_mailer').style.display = 'none';
          document.getElementById('mobile_confirm').style.display = 'block';
          site.hideModal('#dealModal');
        }
        $scope.busy = false;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.registerByMobile = function (user, type) {
    $scope.error = '';
    const v = site.validated('#mobile_data');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (user) {
      if (user.password === user.re_password) {
        user.mobile = $scope.mailer.mobile;
        $scope.busy = true;
        $http({
          method: 'POST',
          url: '/api/register',
          data: {
            $encript: '123',
            email: site.to123(user.email),
            password: site.to123(user.password),
            mobile: user.mobile,
            first_name: user.first_name,
            last_name: user.last_name,
            image_url: user.image_url,
            mailer_id: $scope.mailer.id,
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

  $scope.getCountriesList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/countries/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
          image_url: 1,
          country_code: 1,
          length_mobile: 1
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.countriesList = response.data.list;
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
  $scope.getCountriesList();
});
