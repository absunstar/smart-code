var app = app || angular.module('myApp', []);
app.controller('teacherHeader', function ($scope, $http, $timeout) {
  $scope.changeLang = function (language) {
    if (typeof language == 'string') {
      language = { id: language, dir: 'rtl', text: 'right' };
      if (language.id.like('*en*')) {
        language.dir = 'ltr';
        language.text = 'left';
      }
    }
    $http({
      method: 'POST',
      url: '/x-language/change',
      data: language,
    }).then(function (response) {
      if (response.data.done) {
        window.location.reload(!0);
      }
    });
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
