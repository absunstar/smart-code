app.controller("security", function ($scope, $http, $interval) {

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
        if(response.data.done){
          $scope.roles = response.data.roles;
        }
      },
      function (err) {
        $scope.error = err;
      })
  };

  $scope.user = { profile: { image_url: '/images/user.png', files: [] }, permissions: [], roles: [] };

  $scope.uploadImage = function (files) {
    var fd = new FormData();
    fd.append("fileToUpload", files[0]);
    $http.post('/api/user/upload/image', fd, {
      withCredentials: !0,
      headers: {
        'Content-Type': undefined
      },
      uploadEventHandlers: {
        progress: function (e) {
          $scope.uploadStatus = "Uploading : " + Math.round((e.loaded * 100 / e.total)) + " %";
          if (e.loaded == e.total) {
            $scope.uploadStatus = "100%";
          }
        }
      },
      transformRequest: angular.identity
    }).then(function (res) {
      if (res.data && res.data.done) {
        $scope.uploadStatus = "File Uploaded";
        $scope.user.profile.image_url = res.data.image_url;
      }
    }, function (error) {
      $scope.uploadStatus = error;
    });
  };

  $scope.uploadFile = function (files) {
    var fd = new FormData();
    fd.append("fileToUpload", files[0]);
    $http.post('/api/user/upload/file', fd, {
      withCredentials: !0,
      headers: {
        'Content-Type': undefined
      },
      uploadEventHandlers: {
        progress: function (e) {
          $scope.fileStatus = "Uploading : " + Math.round((e.loaded * 100 / e.total)) + " %";
          if (e.loaded == e.total) {
            $scope.fileStatus = "100%";
          }
        }
      },
      transformRequest: angular.identity
    }).then(function (res) {
      if (res.data && res.data.done) {
        $scope.fileStatus = "File Uploaded";
        $scope.user.profile.files.push({
          url: res.data.file_url,
          name: $scope.fileName || res.data.file_name
        });
        $scope.fileName = '';
      }
    }, function (error) {
      $scope.fileStatus = error;
    });
  };

  $scope.deleteFile = function (file) {
    for (let i = 0; i < $scope.user.profile.files.length; i++) {
      let f = $scope.user.profile.files[i];
      if (f.url === file.url) {
        $scope.user.profile.files.splice(i, 1);
        return;
      }
    }
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
      name : role.name,
      en : role.en,
      ar : role.ar
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
    $scope.permissionEditor = !1;
    $scope.imageEditor = !1;
    $scope.fileEditor = !1;
    $scope.user = { profile: { image_url: '/images/user.png', files: [] }, permissions: [], roles: [] };
    site.showModal('#addUserModal');
  };
  $scope.add = function () {
    $scope.busy = !0;
    $http({
      method: "POST",
      url: "/api/user/add",
      data: $scope.user
    }).then(
      function (response) {
        $scope.busy = !1;
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
  };
  $scope.update = function () {
    $scope.busy = !0;
    $http({
      method: "POST",
      url: "/api/user/update",
      data: $scope.user
    }).then(
      function (response) {
        $scope.busy = !1;
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
    $scope.user = { profile: { image_url: '/images/user.png', files: [] }, permissions: [], roles: [] };
    site.showModal('#deleteUserModal');
  };

  $scope.view = function (user) {
    $scope.busy = !0;
    $http({
      method: "POST",
      url: "/api/user/view",
      data: { id: user.id }
    }).then(
      function (response) {
        $scope.busy = !1;
        if (response.data.done) {
          $scope.user = response.data.doc;
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
    $scope.busy = !0;
    $http({
      method: "POST",
      url: "/api/user/delete",
      data: { id: $scope.user.id, name: $scope.user.name }
    }).then(
      function (response) {
        $scope.busy = !1;
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
  $scope.loadAll();
  $scope.loadRoles();
});
