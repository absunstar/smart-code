var app = app || angular.module('myApp', []);
app.controller('lawyerTheme', function ($scope, $http, $timeout) {
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

  $scope.loadLawyers = function (where) {
    $scope.error = '';
    $scope.busy = true;
    where = where || {};
    where['type'] = 'lawyer';
    $http({
      method: 'POST',
      url: '/api/users/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.lawyersList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.loadLawyers();
});
