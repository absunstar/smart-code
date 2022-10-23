app.controller('messages', function ($scope, $http, $timeout) {
  $scope.userId = site.toNumber('##user.id##');
  $scope.showMessage = function (m) {
    $http({
      method: 'POST',
      url: '/api/messages/show',
      data: m,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.message = response.data.doc;
          m.$new = false;
          $scope.busy = false;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.sendMessage = function (message) {
    $scope.busy = true;
    if (!$scope.send_message) {
      $scope.error = '##word.must_write_message##';
      return;
    };

    let user = {};
    $scope.message.users_list.forEach((_u) => {
      if (_u.email != '##user.email##') {
        user = _u;
      }
    });

    let message_obj = {
      date: new Date(),
      message: $scope.send_message,
      receiver: {
        id: user.id,
        name: user.name,
        last_name: user.last_name,
        email: user.email,
        image_url: user.image_url,
      },
      show: false,
    };

    $http({
      method: 'POST',
      url: '/api/messages/update',
      data: message_obj,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.send_message = undefined;
          $scope.message = response.data.doc;
          $scope.busy = false;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.geMessagesList = function (where) {
    $scope.busy = true;
    $scope.messagesList = [];
    $http({
      method: 'POST',
      url: '/api/messages/all',
      data: {
        where: {
          'users_list.id': $scope.userId,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.messagesList = response.data.list;
          if('##query.id##' != 'undefined'){
            $scope.messagesList.forEach(_m => {
              if(_m.id == site.toNumber('##query.id##')) {
                $scope.showMessage(_m);

              }
            });
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.changeMessageUserData = function () {
    $scope.busy = true;
    $scope.messagesList = [];
    $http({
      method: 'POST',
      url: '/api/messages/user_data',
      data: {
        id: $scope.userId
      }
    }).then(
      function (response) {
        $scope.busy = false;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.geMessagesList();
  $scope.changeMessageUserData();
});
