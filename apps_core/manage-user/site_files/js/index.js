let btn1 = document.querySelector("#manage_user .tab-link");
if (btn1) {
  btn1.click();
}

app.controller("manage_user", function ($scope, $http) {
  $scope._search = {};

  $scope.manage_user = {};
  $scope.viewText = "";

  $scope.loadManageUser = function () {
    $scope.manage_user = {};
    $scope.busy = true;
    let id = site.toNumber("##user.id##");
    $http({
      method: "POST",
      url: "/api/manage_user/view",
      data: { id: id },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.manage_user = response.data.doc;

          $scope.manage_user.$permissions_info;
          $scope.permissions_list = [];
          $scope.manage_user.$permissions_info.forEach((_p) => {
            $scope.permissions_list.push({
              name: _p.screen_name,
              module_name: _p.module_name,
            });
          });
          if (site.feature("eco")) {
            $scope.getOrderEcoList();
          }
          $http({
            method: "POST",
            url: "/api/get_dir_names",
            data: $scope.permissions_list,
          }).then(
            function (response) {
              let data = response.data.doc;
              if (data) {
                $scope.permissions_list.forEach((_s) => {
                  if (_s.name) {
                    let newname = data.find(
                      (el) => el.name == _s.name.replace(/-/g, "_")
                    );
                    if (newname) {
                      _s.name_ar = newname.ar;
                      _s.name_en = newname.en;
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

  $scope.editManageUser = function (type) {
    $scope.busy = true;

    const v = site.validated("#viewManageUserModal");
    if (!v.ok && type == "password") {
      $scope.error = v.messages[0].ar;
      return;
    }

    $http({
      method: "POST",
      url: "/api/manage_user/update",
      data: {
        user: $scope.manage_user,
        type: type,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.busy = false;
          site.hideModal("#viewManageUserModal");

          $scope.login(response.data.doc);
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like("*Must Enter Code*")) {
            $scope.error = "##word.must_enter_code##";
          } else if (
            response.data.error.like("*maximum number of adds exceeded*")
          ) {
            $scope.error = "##word.err_maximum_adds##";
          } else if (
            response.data.error.like("*mail must be typed correctly*")
          ) {
            $scope.error = "##word.err_username_contain##";
          } else if (response.data.error.like("*User Is Exist*")) {
            $scope.error = "##word.user_exists##";
          } else if (response.data.error.like("*Password does not match*")) {
            $scope.error = "##word.password_err_match##";
          } else if (response.data.error.like("*Current Password Error*")) {
            $scope.error = "##word.current_password_incorrect##";
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
    $scope.error = "";

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/user/login",
      data: {
        $encript: "123",
        email: site.to123(u.email),
        password: site.to123(u.password),
        company: site.to123({
          id: u.company.id,
          name_ar: u.company.name_ar,
          name_en: u.company.name_en,
          item: u.company.item,
          store: u.company.store,
          unit: u.company.unit,
          currency: u.company.currency,
          users_count: u.company.users_count,
          customers_count: u.company.customers_count,
          employees_count: u.company.employees_count,
          host: u.company.host,
        }),
        branch: site.to123({
          code: u.branch.code,
          name_ar: u.branch.name_ar,
          name_en: u.branch.name_en,
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
    $scope.error = "";
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all",
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
    $scope.error = "";
    $scope.viewText = type;
    site.showModal("#viewManageUserModal");
  };

  $scope.viewOrder = function (order) {
    $scope.error = "";
    $scope.order = order;
    site.showModal("#orderModal");
  };

  $scope.getOrderEcoList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order_eco/all",
      data: {
        where: { "add_user_info.id": $scope.manage_user.id },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.ordersEcolist = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadManageUser();
  $scope.getGender();
});
