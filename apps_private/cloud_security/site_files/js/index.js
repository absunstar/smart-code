app.controller("security", function ($scope, $http, $interval) {

  $scope.gotoUsers = function () {
    window.location.href = '/security/users';
  }

  $scope.gotoRoles = function () {
    window.location.href = '/security/roles';
  }

  $scope.trans = [];


  $scope.loadAll = function () {

    $http({
      method: "POST",
      url: "/api/users/all",
      data: {}
    }).then(
      function (response) {
        if (response.data.done) {
          $scope.list = response.data.users;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.loadRoles = function () {
    $http({
      method: "POST",
      url: "/api/security/roles",
      data: {}
    }).then(
      function (response) {
        if (response.data.done) {
          $scope.roles = response.data.roles;

          $scope.accounting_roles = $scope.roles.filter(s => s.module_name == 'accounting');
          $scope.hr_roles = $scope.roles.filter(s => s.module_name == 'hr');
          $scope.inventory_roles = $scope.roles.filter(s => s.module_name == 'inventory');
          $scope.custom_roles = $scope.roles.filter(s => s.module_name == 'custom');
          $scope.public_roles = $scope.roles.filter(s => s.module_name == 'public');
          $scope.report_roles = $scope.roles.filter(s => s.module_name == 'report');

        }
      },
      function (err) {
        $scope.error = err;
      })
  };

  $scope.loadPermissions = function () {
    $http({
      method: "POST",
      url: "/api/security/permissions",
      data: {}
    }).then(
      function (response) {
        $scope.screens = [];
        if (response.data.done) {
          response.data.permissions.forEach(p => {

            let exist = false;

            $scope.screens.forEach(s => {
              if (s.name == p.screen_name) {
                exist = true
                s.permissions.push(p)
              }
            });

            if (!exist && p.screen_name) {
              $scope.screens.push({
                name: p.screen_name,
                module_name: p.module_name,
                permissions: [p]
              })
            }
          });



          $http({
            method: 'POST',
            url: '/api/get_dir_names',
            data: $scope.screens
          }).then(
            function (response) {
              let data = response.data.doc
              if (data) {
                $scope.trans = data;
                $scope.screens.forEach(s => {
                  let newname = data.find(el => el.name == s.name.replace(/-/g, '_'));
                  if (newname) {
                    s.name_ar = newname.ar;
                    s.name_en = newname.en;
                  }

                })
              }

            }, function (err) {


            });

          $scope.hr_screens = $scope.screens.filter(s => s.module_name == 'hr');
          $scope.accounting_screens = $scope.screens.filter(s => s.module_name == 'accounting');
          $scope.inventory_screens = $scope.screens.filter(s => s.module_name == 'inventory');
          $scope.public_screens = $scope.screens.filter(s => s.module_name == 'public');
          $scope.report_screens = $scope.screens.filter(s => s.module_name == 'report');

          $scope.permissions = response.data.permissions;

        }
      },
      function (err) {
        $scope.error = err;
      })
  };


  $scope.get_trans = function (name) {
    let new_name = $scope.trans.find(el => el.name == name.replace(/-/g, '_'));
    if (new_name) {
      return new_name
    }
    return 0;
  };








  $scope.user = { profile: { image_url: '/images/user.png', files: [] }, permissions: [], roles: [] };

  $scope.addPermission = function () {

    if ($scope.permission == '') {
      return;
    }
    for (let i = 0; i < $scope.user.permissions.length; i++) {
      let p = $scope.user.permissions[i];
      if (p === $scope.permission) {
        $scope.permission = '';
        return;
      }
    }
    $scope.user.permissions.push($scope.permission);
    $scope.permission = '';
  };

  $scope.checkAll = function (name) {
    $scope[name].forEach(r => {
      r.$selected = $scope['$' + name];
      if (r.$selected) {
        let exists = false;
        $scope.user.roles.forEach(r2 => {
          if (r.name == r2.name) {
            exists = true
            r2.$selected = true;
          }
        });
        if (!exists) {
          $scope.user.roles.push(r);
        }
      } else if (!r.$selected) {
        let exists = false;
        $scope.user.roles.forEach((r2, i) => {
          if (r.name == r2.name) {
            r2.$selected = false;
            $scope.user.roles.splice(i, 1);
          }
        });

      }
    });
  };

  $scope.addRole = function () {

    if ($scope.role === undefined) {
      return;
    }
    let role = site.fromJson($scope.role);

    for (let i = 0; i < $scope.user.roles.length; i++) {
      let r = $scope.user.roles[i];
      if (r.name === role.name) {
        $scope.role = {};
        return;
      }
    }
    $scope.user.roles.push({
      name: role.name,
      en: role.en,
      ar: role.ar
    });
    $scope.role = {};
  };

  $scope.deletePermission = function (permission) {
    for (let i = 0; i < $scope.user.permissions.length; i++) {
      let p = $scope.user.permissions[i];
      if (p === permission) {
        $scope.user.permissions.splice(i, 1)
      }
    }
  };

  $scope.deleteRole = function (role) {
    for (let i = 0; i < $scope.user.roles.length; i++) {
      let r = $scope.user.roles[i];
      if (r.name === role.name) {
        $scope.user.roles.splice(i, 1)
      }
    }
  };

  $scope.newuser = function () {
    $scope.permissionEditor = false;
    $scope.imageEditor = false;
    $scope.fileEditor = false;
    $scope.user = { profile: { image_url: '/images/user.png', files: [] }, branch_list: [{}], permissions: [], roles: [] };
    site.showModal('#addUserModal');
    document.querySelector('#addUserModal .tab-link').click();
  };

  $scope.add = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/add",
      data: $scope.user
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addUserModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {

      }
    )
  };

  $scope.edit = function (user) {
    $scope.view(user);
    $scope.user = { profile: { image_url: '/images/user.png', files: [] }, permissions: [], roles: [] };
    site.showModal('#updateUserModal');
    document.querySelector('#updateUserModal .tab-link').click();
  };

  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/update",
      data: $scope.user
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateUserModal');
          site.hideModal('#viewUserModal')
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {

      }
    )
  };

  $scope.remove = function (user) {
    $scope.view(user);
    $scope.user = { profile: { image_url: '/images/user.png', files: [] }, permissions: [], newpermissions: [], roles: [] };
    site.showModal('#deleteUserModal');
    document.querySelector('#deleteUserModal .tab-link').click();
  };

  $scope.view = function (user) {
    $scope.busy = true;
    $scope.userPermission = [];
    $scope.onepermission = [];
    $http({
      method: "POST",
      url: "/api/user/view",
      data: { id: user.id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          $scope.user.branch_list = $scope.user.branch_list || [];

          $scope.user.permissions.forEach(x => {
            if ($scope.onepermission.hasOwnProperty(x.screen_name)) {
              $scope.onepermission[x.screen_name].push(x);

            } else {
              let element = [];
              element.push(x);
              $scope.userPermission.push(x.screen_name);
              $scope.onepermission[x.screen_name] = element;
            }
          });

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {

      }
    )
  };

  $scope.details = function (user) {
    $scope.view(user);
    $scope.user = { profile: { image_url: '/images/user.png', files: [] }, permissions: [], roles: [] };
    site.showModal('#viewUserModal');

  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/delete",
      data: { id: $scope.user.id, name: $scope.user.name }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteUserModal');
          site.hideModal('#viewUserModal')
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {

      }
    )
  };


  $scope.getCompanyList = function () {

    $scope.company_list = [];

    $http({
      method: "POST",
      url: "/api/companies/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.company_list = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name_ar: 1, name_en: 1, type: 1, code: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.getCompanyList();
  $scope.loadStores();
  $scope.loadAll();
  $scope.loadRoles();
  $scope.loadPermissions();
});

