app.controller('notific', function ($scope, $http, $timeout) {
  $scope.getNotific = function () {
    $scope.busy = true;
    $scope.notific_list = [];
    $http({
      method: 'POST',
      url: '/api/notific/all',
      data: {
        'user.id': site.toNumber('##user.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.notific_list = response.data.list;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.displayAd = function (id) {
    window.open(`/display_ad?id=${id}`, '_blank');
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: site.toNumber('##user.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.deleteNotific = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/notific/delete_for_user',
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.notific_list = [];
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.updateUser = function (user) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/update',
      data: user,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#notificSettingModal');
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.getUser();
  $scope.getNotific();
});
