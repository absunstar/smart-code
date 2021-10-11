  $(function () {
      $('[data-toggle="tooltip"]').tooltip()
  })

  var app = angular.module('html', []);
  app.controller('body', function ($scope, $http) {
        
                    $scope.isLoged = !1;
                    $scope.error = '';


                    $scope.register = function () {
                        $('#registerBtn').button('loading')
                        var email = $scope.register_userEmail
                        var password = $scope.register_userPassword
        
                        $http({
                            method: 'POST',
                            url: '/@security/api/user/register',
                            transformRequest: function (obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: {
                                email: email,
                                password: password
                            },
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function (response) {
                            $('#registerBtn').button('reset')
                            if (response.data.error) {
                                $scope.error = response.data.error;
                            }
                            if (response.data.user) {
                                $scope.user = response.data.user
                                $scope.isLoged = !0
                                $('#registerModal').modal('hide')
                                window.location.href = '/@admin'
                            }
                        });
                    }

                    $scope.login = function () {
                        $('#loginBtn').button('loading')
                        var email = $scope.userEmail
                        var password = $scope.userPassword
        
                        $http({
                            method: 'POST',
                            url: '/@security/api/user/login',
                            transformRequest: function (obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: {
                                email: email,
                                password: password
                            },
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function (response) {
                            $('#loginBtn').button('reset')
                            if (response.data.error) {
                                $scope.error = response.data.error;
                            }
                            if (response.data.user) {
                                $scope.user = response.data.user
                                $scope.isLoged = !0
                                $('#loginModal').modal('hide')
                                window.location.href = '/@admin'
                            }
                        });
                    }
        
                    $scope.logout = function () {
        
                        $http({
                            method: 'POST',
                            url: '/@security/api/user/logout',
                            transformRequest: function (obj) {
                                var str = [];
                                for (var p in obj)
                                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                                return str.join("&");
                            },
                            data: {},
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).then(function (response) {
        
                            if (response.data.done) {
                                window.location.href = '/@admin'
                            }
                        });
                    }
                
      $scope.hideALL = function () {
          $scope.sessionsDisplay = !1;
          $scope.routesDisplay = !1;
          $scope.filesDisplay = !1;
          $scope.varsDisplay = !1;
          $scope.installingDisplay = !1;
      }

      $scope.showInstalling = function () {
          $scope.hideALL();
          $scope.installingDisplay = !0;
      }

      $scope.showSessions = function () {
          $scope.hideALL();
          $http.get('/@admin/api/sessions').then(function (response) {
              $scope.sessionsDisplay = !0;
              $scope.sessions = response.data;
          })
      }

      $scope.showRoutes = function () {
          $scope.hideALL();
          $http.get('/@admin/api/routes').then(function (response) {
              $scope.routesDisplay = !0;
              $scope.routes = response.data;
          })
      }

      $scope.showFiles = function () {
          $scope.hideALL();
          $http.get('/@admin/api/files').then(function (response) {
              $scope.filesDisplay = !0;
              $scope.files = response.data;
          })
      }

      $scope.showVars = function () {
          $scope.hideALL();
          $http.get('/@admin/api/vars').then(function (response) {
              $scope.varsDisplay = !0;
              $scope.vars = response.data;
          })
      }

  });