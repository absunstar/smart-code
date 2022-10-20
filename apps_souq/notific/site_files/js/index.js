app.controller('notific', function ($scope, $http, $timeout) {
  $scope.getNotific = function () {
    $scope.busy = true;
    $scope.notific_list = [];
    $http({
      method: 'POST',
      url: '/api/notific/all',
      data: {
        where: {
          'user.id': site.toNumber('##user.id##'),
        },
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

  $scope.displayContent = function (notific) {
    $scope.updateNotific(notific,'display_content');
    
  };

  $scope.displayMessage = function (notific) {
    $scope.updateNotific(notific,'messages');
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

  $scope.updateNotific = function (notific,type) {
    $scope.busy = true;
  
    notific.show = true;
    $http({
      method: 'POST',
      url: '/api/notific/update',
      data: notific
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if(type == 'display_content'){
            window.open(`/${type}?id=${notific.action.id}`, '_blank');
          } else if(type == 'messages'){
            window.open(`/${type}?id=${notific.action.id}`, '_blank');
          }
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
