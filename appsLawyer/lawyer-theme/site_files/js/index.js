var app = app || angular.module('myApp', []);
app.controller('lawyerTheme', function ($scope, $http, $timeout) {
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
