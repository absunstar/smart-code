app.controller('security', function ($scope, $http, $interval) {
  $scope.gotoUsers = function () {
    window.location.href = '/security/users';
  };

  $scope.gotoRoles = function () {
    window.location.href = '/security/roles';
  };

  $scope.trans = [];

  $scope.loadAll = function () {
    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {},
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
    );
  };

  $scope.loadRoles = function () {
    $http({
      method: 'POST',
      url: '/api/security/roles',
      data: {},
    }).then(
      function (response) {
        if (response.data.done) {
          $scope.roles = response.data.roles;
          $scope.accountingRoles = $scope.roles.filter((s) => s.moduleName == 'accounting');
          $scope.hrRoles = $scope.roles.filter((s) => s.moduleName == 'hr');
          $scope.inventoryRoles = $scope.roles.filter((s) => s.moduleName == 'inventory');
          $scope.customRoles = $scope.roles.filter((s) => s.moduleName == 'custom');
          $scope.publicRoles = $scope.roles.filter((s) => s.moduleName == 'public');
          $scope.hmisRoles = $scope.roles.filter((s) => s.moduleName == 'hmis');
          $scope.reportRoles = $scope.roles.filter((s) => s.moduleName == 'report');
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.loadPermissions = function () {
    $http({
      method: 'POST',
      url: '/api/security/permissions',
      data: {},
    }).then(
      function (response) {
        $scope.screens = [];
        if (response.data.done) {
          response.data.permissions.forEach((p) => {
            let exist = false;

            $scope.screens.forEach((s) => {
              if (s.name == p.screenName) {
                exist = true;
                s.permissions.push(p);
              }
            });

            if (!exist && p.screenName) {
              $scope.screens.push({
                name: p.screenName,
                moduleName: p.moduleName,
                permissions: [p],
              });
            }
          });

          $http({
            method: 'POST',
            url: '/api/get_dir_names',
            data: $scope.screens,
          }).then(
            function (response) {
              let data = response.data.doc;
              if (data) {
                $scope.trans = data;
                $scope.screens.forEach((s) => {
                  let newname = data.find((el) => el.name == s.name.replace(/-/g, '_'));
                  if (newname) {
                    s.nameAr = newname.Ar;
                    s.nameEn = newname.En;
                  }
                });
              }
            },
            function (err) {}
          );

          $scope.hrScreens = $scope.screens.filter((s) => s.moduleName == 'hr');
          $scope.accountingScreens = $scope.screens.filter((s) => s.moduleName == 'accounting');
          $scope.inventoryScreens = $scope.screens.filter((s) => s.moduleName == 'inventory');
          $scope.publicScreens = $scope.screens.filter((s) => s.moduleName == 'public');
          $scope.hmisScreens = $scope.screens.filter((s) => s.moduleName == 'hmis');
          $scope.reportScreens = $scope.screens.filter((s) => s.moduleName == 'report');
          $scope.permissions = response.data.permissions;
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getTrans = function (name) {
    let newName = $scope.trans.find((el) => el.name == name.replace(/-/g, '_'));
    if (newName) {
      return newName;
    }
    return 0;
  };


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
    $scope[name].forEach((r) => {
      r.$selected = $scope['$' + name];
      if (r.$selected) {
        let exists = false;
        $scope.user.roles.forEach((r2) => {
          if (r.name == r2.name) {
            exists = true;
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
      En: role.En,
      Ar: role.Ar,
    });
    $scope.role = {};
  };

  $scope.deletePermission = function (permission) {
    for (let i = 0; i < $scope.user.permissions.length; i++) {
      let p = $scope.user.permissions[i];
      if (p === permission) {
        $scope.user.permissions.splice(i, 1);
      }
    }
  };

  $scope.deleteRole = function (role) {
    for (let i = 0; i < $scope.user.roles.length; i++) {
      let r = $scope.user.roles[i];
      if (r.name === role.name) {
        $scope.user.roles.splice(i, 1);
      }
    }
  };

  $scope.newuser = function () {
    $scope.permissionEditor = false;
    $scope.imageEditor = false;
    $scope.fileEditor = false;
    $scope.mode = 'add';
    $scope.user = { image: { url: '/images/user.png' }, active: true, files: [], branchList: [{}], permissions: [], roles: [] };
    site.showModal('#addUserModal');
    document.querySelector('#addUserModal .tab-link').click();
  };

  $scope.add = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/add',
      data: $scope.user,
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
      function (err) {}
    );
  };

  $scope.edit = function (user) {
    $scope.view(user);
    $scope.mode = 'edit';
    $scope.user = { image: { url: '/images/user.png' }, files: [], permissions: [], roles: [] };
    site.showModal('#addUserModal');
    document.querySelector('#addUserModal .tab-link').click();
    /*     document.querySelector('#updateUserModal .tab-link').click();
     */
  };

  $scope.update = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/update',
      data: $scope.user,
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
      function (err) {}
    );
  };

  $scope.remove = function (user) {
    $scope.view(user);
    $scope.mode = 'delete';
    $scope.user = { image: { url: '/images/user.png' }, files: [], permissions: [], newpermissions: [], roles: [] };
    site.showModal('#addUserModal');
    document.querySelector('#addUserModal .tab-link').click();
  };

  $scope.view = function (user) {
    $scope.busy = true;
    $scope.userPermission = [];
    $scope.onepermission = [];
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: { id: user.id },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          $scope.user.branchList = $scope.user.branchList || [];

          $scope.user.permissions.forEach((x) => {
            if ($scope.onepermission.hasOwnProperty(x.screenName)) {
              $scope.onepermission[x.screenName].push(x);
            } else {
              let element = [];
              element.push(x);
              $scope.userPermission.push(x.screenName);
              $scope.onepermission[x.screenName] = element;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.details = function (user) {
    $scope.view(user);
    $scope.user = { image: { url: '/images/user.png' }, files: [], permissions: [], roles: [] };
    site.showModal('#viewUserModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/delete',
      data: { id: $scope.user.id, name: $scope.user.name },
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
      function (err) {}
    );
  };

  $scope.getCompanyList = function () {
    $scope.companyList = [];

    $http({
      method: 'POST',
      url: '/api/companies/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.companyList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getUsersTypesList = function () {
    $scope.usersTypesList = [];

    $http({
      method: 'POST',
      url: '/api/usersTypesList',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.usersTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getEmployeesJobsTypesList = function () {
    $scope.employeesJobsTypesList = [];

    $http({
      method: 'POST',
      url: '/api/employeesJobsTypesList',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.employeesJobsTypesList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: { select: { id: 1, nameAr: 1, nameEn: 1, type: 1, code: 1 } },
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
    );
  };

  $scope.loadSafes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/safes/all',
      data: { select: { id: 1, nameAr: 1, nameEn: 1,type:1} },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.safesCashList = response.data.list.filter((s) => s.type.id == 1);
          $scope.safesBankList = response.data.list.filter((s) => s.type.id == 2);

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPrintersPath = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/printersPaths/all',
      data: {
        where: { active: true },
        select: {
          id: 1,
          nameAr: 1,
          nameEn: 1,
          type: 1,
          ipDevice: 1,
          PortDevice: 1,
          ip: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.printersPathsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function (type) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/getAutomatic',
      data: {
        screen: type.name,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        } else {
          $scope.disabledCode = false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.changeUserType = function (type) {
    $scope.getNumberingAuto(type);
    if(type.id == 6) {
      $scope.getCustomersGroups();
    } else if(type.id == 7) {
      $scope.getVendorsGroups();
    }
  };

  $scope.getVendorsGroups = function () {
    $scope.busy = true;
    $scope.vendorsGroupsList = [];
    $http({
      method: 'POST',
      url: '/api/vendorsGroups/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          code: 1,
          nameEn: 1,
          nameAr: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.vendorsGroupsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCustomersGroups = function () {
    $scope.busy = true;
    $scope.customersGroupsList = [];
    $http({
        method: 'POST',
        url: '/api/customersGroups/all',
        data: {
            where: {
                active: true,
            },
            select: {
                id: 1,
                code: 1,
                nameEn: 1,
                nameAr: 1,
            },
        },
    }).then(
        function (response) {
            $scope.busy = false;
            if (response.data.done && response.data.list.length > 0) {
                $scope.customersGroupsList = response.data.list;
            }
        },
        function (err) {
            $scope.busy = false;
            $scope.error = err;
        }
    );
};

  $scope.getCompanyList();
  $scope.loadStores();
  $scope.loadSafes();
  $scope.getPrintersPath();
  $scope.loadAll();
  $scope.loadRoles();
  $scope.loadPermissions();
  $scope.getUsersTypesList();
  $scope.getEmployeesJobsTypesList();

});
