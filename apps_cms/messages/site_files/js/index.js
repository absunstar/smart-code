app.controller('messages', function ($scope, $http, $timeout) {
  $scope.userId = site.toNumber('##user.id##');

  $scope.showMessage = function (m, e) {
    $scope.messagesList.forEach(_m => {
      _m.$isSelected = false;
    });
    m.$isSelected = true;

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
    if (!$scope.sendMessage) {
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
      message: $scope.sendMessage,
      receiver: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        image: user.image,
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
          $scope.sendMessage = undefined;
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
          if ('##query.id##' != 'undefined') {
            $scope.messagesList.forEach(_m => {
              if (_m.id == site.toNumber('##query.id##')) {
                $scope.showMessage(_m);

              }
            });
          } else {
            $scope.showMessage($scope.messagesList[0]);
          }
        }
        $scope.messagesList = $scope.messagesList  || [];

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
