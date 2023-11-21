app.controller('register_souq', function ($scope, $http, $timeout) {
  $scope.user = { image_url: '/images/user_logo.png' };
  $scope.type = 'mobile';

  $scope.showTab = function (event, selector) {
    document.querySelector('.register-hide').style.display = 'none';

    if (selector == '#register_mobile') {

      $scope.type = 'mobile';
      site.showTabContent(event, selector);
      document.getElementById('register_email').style.display = 'none';
      document.getElementById('register_mobile').style.display = 'block';
      if ('##setting.enable_sending_messages_mobile##' == 'true' || '##setting.enable_sending_messages_mobile_taqnyat##' == 'true') {
        document.getElementById('mobile_mailer').style.display = 'block';
      } else {
        document.getElementById('mobile_data').style.display = 'block';
      }

    } else if (selector == '#register_email') {

      $scope.type = 'email';
      site.showTabContent(event, selector);
      document.getElementById('register_mobile').style.display = 'none';
      document.getElementById('register_email').style.display = 'block';

      if ('##setting.enable_sending_messages_email##' == 'true') {
        document.getElementById('email_mailer').style.display = 'block';
      } else {
        document.getElementById('email_data').style.display = 'block';
      }

    }

  };

  $scope.resendCode = function (source) {
    $scope.error = '';
    $scope.sent_new_code = '';
    let where = { type: $scope.type };
    if ($scope.type == 'mobile') {
      where['mobile'] = source;
    } else if ($scope.type == 'email') {
      where['email'] = source;

    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/mailer/add',
      data: where,
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          if (response.data.error.like('*wait mobile*')) {
            $scope.error = '##word.please_wait_to_send_mobile_code_again##';
            return;
          } else if (response.data.error.like('*wait email*')) {
            $scope.error = '##word.please_wait_to_send_email_code_again##';
            return;
          }
          $scope.busy = false;
        } else if (response.data.done) {
          $scope.mailer = response.data.doc;
          if (response.data.done_send_mobile) {

            $scope.sent_new_code = '##word.the_new_code_has_been_sent_to_your_phone##';
          } else if (response.data.done_send_email) {

            $scope.sent_new_code = '##word.the_new_code_has_been_sent_to_your_email##';
          }

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
    $scope.sent_new_code = '';
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

  $scope.validEmail = function () {
    $scope.error = '';
    $scope.sent_new_code = '';
    const v = site.validated('#email_mailer');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    site.showModal('#dealModal');
  };

  $scope.checkSecretCode = function (secret_code) {
    $scope.error = '';
    $scope.sent_new_code = '';

    if ($scope.type == 'mobile') {
      const v = site.validated('#mobile_confirm');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
    } else if ($scope.type == 'email') {
      const v = site.validated('#email_confirm');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
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
          if ($scope.type == 'mobile') {
            document.getElementById('mobile_confirm').style.display = 'none';
            document.getElementById('mobile_data').style.display = 'block';
          } else if ($scope.type == 'email') {
            document.getElementById('email_confirm').style.display = 'none';
            document.getElementById('email_data').style.display = 'block';
          }
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

  $scope.registerMailer = function (mailer) {
    $scope.error = '';
    $scope.sent_new_code = '';

    if ($scope.type == 'mobile') {
      let v = site.validated('#mobile_mailer');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
      mailer.type = 'mobile';
    } else if ($scope.type == 'email') {
      let v = site.validated('#email_mailer');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
      mailer.type = 'email';
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
            $scope.error = '##word.mobile_number_already_used##';
            site.hideModal('#dealModal');
            return;
          } else if (response.data.error.like('*wait mobile*')) {
            $scope.error = '##word.please_wait_to_send_mobile_code_again##';
            site.hideModal('#dealModal');
            return;
          } else if (response.data.error.like('*Email Exists*')) {
            $scope.error = '##word.email_already_used##';
            site.hideModal('#dealModal');
            return;
          } else if (response.data.error.like('*wait email*')) {
            $scope.error = '##word.please_wait_to_send_email_code_again##';
            site.hideModal('#dealModal');
            return;
          }
        } else if (response.data.done) {
          $scope.mailer = response.data.doc;
          $scope.user.country = $scope.mailer.country;
          $scope.user.mobile = $scope.mailer.mobile;

          if ($scope.type == 'mobile') {
            document.getElementById('mobile_mailer').style.display = 'none';
            document.getElementById('mobile_confirm').style.display = 'block';
          } else if ($scope.type == 'email') {
            document.getElementById('email_mailer').style.display = 'none';
            document.getElementById('email_confirm').style.display = 'block';
          }
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

  $scope.checkRegister = function (user) {
    if ($scope.type == 'mobile') {
      if ($scope.mailer) {
        user.mobile = $scope.mailer.mobile;
      }

      const v = site.validated('#mobile_data');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
    } else if ($scope.type == 'email') {
      if ($scope.mailer) {
        user.email = $scope.mailer.email;
      }

      const v = site.validated('#email_data');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
    }

    let regex = /^\d*(\.\d+)?$/;

    if (user.country.length_mobile && user.mobile.match(regex)) {
      if (user.mobile.toString().length != user.country.length_mobile) {

        $scope.error = '##word.please_enter_valid_mobile_number##';
        return;
      }
    } else {
      $scope.error = '##word.please_enter_valid_mobile_number##';
      return;
    }

    site.showModal('#dealModal');

  };

  $scope.register = function (user) {
    $scope.error = '';
    $scope.sent_new_code = '';
    let obj = {
      $encript: '123',
      email: site.to123(user.email),
      password: site.to123(user.password),
      mobile: user.mobile,
      first_name: user.first_name,
      last_name: user.last_name,
      image_url: user.image_url,
    };

    if ($scope.mailer) {
      obj.mailer_id = $scope.mailer.id;
      obj.country_code = $scope.mailer.country.country_code;
      user.country = $scope.mailer.country;
      obj.length_mobile = user.country.length_mobile;
    } else {
      obj.country_code = user.country.country_code;
      obj.length_mobile = user.country.length_mobile;

    }

    if ($scope.type == 'mobile') {
      const v = site.validated('#mobile_data');
      if (!v.ok) {

        $scope.error = v.messages[0].ar;
        return;
      }
    } else if ($scope.type == 'email') {
      if ($scope.mailer) {
        user.email = $scope.mailer.email;
      }

      const v = site.validated('#email_data');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      }
    }



    if (user) {
      if (user.password === user.re_password) {
        $scope.busy = true;
        $http({
          method: 'POST',
          url: '/api/register',
          data: obj,
        }).then(
          function (response) {
            if (response.data.error) {
              site.hideModal('#dealModal');
              $scope.error = response.data.error;
              if (response.data.error.like('*enter a valid mobile*')) {
                $scope.error = '##word.please_enter_valid_mobile_number##';
              }
              $scope.busy = false;

            } else if (response.data.user) {
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

site.onLoad(() => {
  setTimeout(() => {
    let btn1 = document.querySelector('#register_souq .tab-link');
    if (btn1) {
      btn1.click();
    }
  }, 500);

});
