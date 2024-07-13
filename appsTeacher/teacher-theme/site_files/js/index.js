var app = app || angular.module('myApp', []);
app.controller('teacherTheme', function ($scope, $http, $timeout) {
  $scope.changeLang = function(lang){
    $http({
        method: 'POST',
        url: '/x-language/change',
        data:{ name : lang}
    }).then(function (response) {
        if (response.data.done) {
          window.location.reload(true);
        }
    });
  };
  $scope.selectTeacher = function (id) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/selectTeacher',
      data: id,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          window.location.href = '/';
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.exitTeacher = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/exitTeacher',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          window.location.href = '/';
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.logout = function () {
    $scope.error = '';
    $scope.busy = true;
    $http.post('/api/user/logout').then(
      function (response) {
        if (response.data.done) {
          window.location.href = '/';
        } else {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
      },
      function (error) {
        $scope.busy = false;
        $scope.error = error;
      }
    );
  };
});
