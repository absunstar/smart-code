
let btn1 = document.querySelector('#manage_user .tab-link');
if (btn1) {
  btn1.click();
}

app.controller("manage_user", function ($scope, $http) {
  $scope._search = {};

  $scope.manage_user = {};
  $scope.viewText = '';


  $scope.loadManageUser = function () {
    $scope.manage_user = {};
    $scope.busy = true;
    let id = site.toNumber('##user.id##');
    $http({
      method: "POST",
      url: "/api/user/view",
      data: { id: id }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.manage_user = response.data.doc

          $scope.manage_user.$permissions_info
          $scope.permissions_list = []
          $scope.manage_user.$permissions_info.forEach(_p => {
            $scope.permissions_list.push({
              name: _p.screen_name,
              module_name: _p.module_name,
            })
          });
          $http({
            method: 'POST',
            url: '/api/get_dir_names',
            data: $scope.permissions_list
          }).then(
            function (response) {
              let data = response.data.doc
              if (data) {
                $scope.permissions_list.forEach(_s => {
                  if (_s.name) {

                    let newname = data.find(el => el.name == _s.name.replace(/-/g, '_'));
                    if (newname) {
                      _s.name_ar = newname.ar;
                      _s.name_en = newname.en;
                    }
                  }

                })
              }

            }, function (err) {


            });

          console.log($scope.manage_user);
        } else {
          $scope.manage_user = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.saveManageUser = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/manage_user/save",
      data: $scope.manage_user
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.view = function (type) {
    $scope.viewText = type;
    site.showModal('#viewManageUserModal');
  };

  $scope.loadManageUser();
  $scope.getGender();
});