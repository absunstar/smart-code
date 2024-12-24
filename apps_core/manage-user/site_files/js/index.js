let btn1 = document.querySelector('#manage_user .tab-link');
if (btn1) {
  btn1.click();
}

app.controller('manage_user', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.manage_user = {};
  $scope.viewText = '';

  $scope.loadManageUser = function () {
    $scope.manage_user = {};
    $scope.busy = true;

    let id = site.toNumber('##user.id##');
    $http({
      method: 'POST',
      url: '/api/manage_user/view',
      data: { id: id },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.manage_user = response.data.doc;
          $scope.manage_user.$permissions_info;
          $scope.permissions_list = [];
          $scope.address = {
            main: $scope.manage_user.profile.main_address,
            other_list: $scope.manage_user.profile.other_addresses_list,
          };
          $scope.manage_user.$permissions_info.forEach((_p) => {
            $scope.permissions_list.push({
              name: _p.screen_name,
              module_name: _p.module_name,
            });
          });

          $http({
            method: 'POST',
            url: '/api/get_dir_names',
            data: $scope.permissions_list,
          }).then(
            function (response) {
              let data = response.data.doc;
              if (data) {
                $scope.permissions_list.forEach((_s) => {
                  if (_s.name) {
                    let newname = data.find((el) => el.name == _s.name.replace(/-/g, '_'));
                    if (newname) {
                      _s.name_Ar = newname.Ar;
                      _s.name_En = newname.En;
                    }
                  }
                });
              }
            },
            function (err) {}
          );
        } else {
          $scope.manage_user = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.editPersonalInfoUser = function (type) {
    $scope.busy = true;

    const v = site.validated('#viewManageUserModal');
    if (!v.ok && type == 'password') {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $http({
      method: 'POST',
      url: '/api/manage_user/update_personal_info',
      data: {
        user: $scope.manage_user,
        type: type,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.busy = false;
          site.hideModal('#viewManageUserModal');
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = '##word.err_maximum_adds##';
          } else if (response.data.error.like('*mail must be typed correctly*')) {
            $scope.error = '##word.err_username_contain##';
          } else if (response.data.error.like('*User Is Exist*')) {
            $scope.error = '##word.user_exists##';
          } else if (response.data.error.like('*Password does not match*')) {
            $scope.error = '##word.password_err_match##';
          } else if (response.data.error.like('*Current Password Error*')) {
            $scope.error = '##word.current_password_incorrect##';
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.login = function (u) {
    $scope.error = '';

    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/user/login',
      data: {
        $encript: '123',
        email: site.to123(u.email),
        password: site.to123(u.password),
        company: site.to123({
          id: u.company.id,
          name_Ar: u.company.name_Ar,
          name_En: u.company.name_En,
          item: u.company.item,
          store: u.company.store,
          unit: u.company.unit,
          currency: u.company.currency,
          users_count: u.company.users_count,
          customers_count: u.company.customers_count,
          employees_count: u.company.employees_count,
          host: u.company.host,
          tax_number: u.company.tax_number,
        }),
        branch: site.to123({
          code: u.branch.code,
          name_Ar: u.branch.name_Ar,
          name_En: u.branch.name_En,
        }),
      },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
        if (response.data.done) {
          window.location.reload(true);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: 'POST',
      url: '/api/gender/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.view = function (type) {
    $scope.error = '';
    $scope.viewText = type;
    site.showModal('#viewManageUserModal');
  };

  $scope.viewOrder = function (order) {
    $scope.error = '';
    $scope.order = order;
    site.showModal('#orderModal');
  };


  $scope.addImage = function () {
    $scope.error = '';
    $scope.ad.images_list = $scope.ad.images_list || [];
    $scope.ad.images_list.push({});
  };

  $scope.saveUserChanges = function (user) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/update',
      data: user,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.getDefaultSetting = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.selectAddress = function (address, type, index) {
    $scope.error = '';
    address = address || {};

    if (type == 'main') {
      address.select_new = false;
    } else if (type == 'other') {
      address.select_new = false;
      address.select_main = false;
    } else if (type == 'new') {
      address.select_main = false;
    }

    if (address.other_list && address.other_list.length > 0) {
      address.other_list.forEach((_other, i) => {
        if (type == 'other') {
          if (i != index) {
            _other.$select_address = false;
          }
        } else {
          _other.$select_address = false;
        }
      });
    }
  };

  $scope.loadManageUser();
  $scope.getGender();
  $scope.getDefaultSetting();
});
