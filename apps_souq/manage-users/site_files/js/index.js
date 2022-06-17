let btn1 = document.querySelector("#manage_users .tab-link");
if (btn1) {
  btn1.click();
}

app.controller("manage_users", function ($scope, $http) {
  $scope._search = {};

  $scope.manage_users = {};
  $scope.viewText = "";

  $scope.loadManageUsers = function () {
    $scope.manage_users_list = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/users/all",
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.manage_users_list = response.data.users;
          $scope.count = response.data.users.length;
           $scope.manage_users.$permissions_info;
          $scope.permissions_list = [];

        } else {
          $scope.manage_users = {};
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
      url: "/api/manage_users/update",
      data: {
        user: $scope.manage_users,
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


  $scope.displayUpdateManageUsers = function (manage_users) {
    $scope.error = '';
    $scope.viewManageUsers(manage_users);
    $scope.manage_users = {};
    site.showModal('#manageUsersUpdateModal');
  };

  $scope.updateManageUsers = function () {
    $scope.error = '';
    const v = site.validated('#manageUsersUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/update",
      data: $scope.manage_users
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#manageUsersUpdateModal');
          $scope.loadManageUsers();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsManageUsers = function (manage_users) {
    $scope.error = '';
    $scope.viewManageUsers(manage_users);
    $scope.manage_users = {};
    site.showModal('#manageUsersViewModal');
  };


  $scope.viewManageUsers = function (manage_users) {
    $scope.manage_users = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manage_user/view",
      data: { id: manage_users.id },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.manage_users = response.data.doc;

          $scope.manage_users.$permissions_info;
          $scope.permissions_list = [];
          $scope.manage_users.$permissions_info.forEach((_p) => {
            $scope.permissions_list.push({
              name: _p.screen_name,
              module_name: _p.module_name,
            });
          });
         /*  if (site.feature("ecommerce")) {
            $scope.getOrderEcoList();
          } */
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
          $scope.manage_users = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };



  $scope.displayDeleteManageUsers = function (manage_users) {
    $scope.error = '';
    $scope.viewManageUsers(manage_users);
    $scope.manage_users = {};
    site.showModal('#manageUsersDeleteModal');
  };

  $scope.deleteManageUsers = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/user/delete",
      data: {
        id: $scope.manage_users.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#manageUsersDeleteModal');
          $scope.loadManageUsers();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  
  $scope.searchAll = function () {

    $scope.loadManageUsers($scope.search);
    site.hideModal('#manageUsersSearchModal');
    $scope.search = {};
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

 /*  $scope.view = function (type) {
    $scope.error = "";
    $scope.viewText = type;
    site.showModal("#viewManageUserModal");
  };

  $scope.viewOrder = function (order) {
    $scope.error = "";
    $scope.order = order;
    site.showModal("#orderModal");
  }; */

  /* $scope.getOrderEcoList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order_eco/all",
      data: {
        where: { "add_user_info.id": $scope.manage_users.id },
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
 */
  $scope.loadManageUsers();
 /*  $scope.getGender() */;
});
