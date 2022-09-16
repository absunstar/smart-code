app.controller('user_messages', function ($scope, $http, $timeout) {
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
          console.log("Ddddddddddddddd");
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
    }

    message.messages_list = message.messages_list || [];
    message.messages_list.push({
      date: new Date(),
      message: $scope.send_message,
      user_id: $scope.manage_user.id,
      user_name: $scope.manage_user.profile.name,
      image_url: $scope.manage_user.image_url,
      show: false,
    });

    $http({
      method: 'POST',
      url: '/api/messages/update',
      data: message,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.send_message = undefined;
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
          'users_list.id': site.toNumber('##user.id##'),
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.messagesList = response.data.list;
          console.log($scope.messagesList);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.geMessagesList();
});
