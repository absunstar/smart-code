var app = app || angular.module('myApp', []);

app.controller('sitebottom', ($scope, $http) => {
  $scope.register = function () {
    site.showModal('#registerModal');
  };

  $scope.login = function () {
    site.showModal('#loginModal');
  };

  $scope.logout = function () {
    site.showModal('#logOutModal');
  };

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
});
