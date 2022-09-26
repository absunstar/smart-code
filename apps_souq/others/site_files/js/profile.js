app.controller('profile', function ($scope, $http, $timeout) {
  $scope.getAdsList = function (where) {
    $scope.busy = true;
    $scope.adslist = [];
    $http({
      method: 'POST',
      url: '/api/contents/all',
      data: {
        where: {
          $and: [
            {
              'store.user.id': site.toNumber('##query.id##'),
            },
            {
              'ad_status.id': 1,
            },
          ],
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.adslist = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.showCommunication = function (obj) {
    $scope.main_obj = obj;
    site.showModal('#communicationModal');
  };

  $scope.sendMessage = function () {
    $scope.busy = true;

    if (!$scope.send_message) {
      $scope.error = '##word.must_write_message##';
      return;
    }
    let message_obj = {
      date: new Date(),
      message: $scope.send_message,
      res_user : {
        id: $scope.user.id,
        name: $scope.user.profile.name,
        last_name: $scope.user.profile.last_name,
        email: $scope.user.email,
        image_url: $scope.user.profile.image_url,
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
          site.hideModal('#messageModal');
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

  $scope.displayAd = function (id) {
    window.open(`/display_ad?id=${id}`, '_blank');
  };

  $scope.updateFollow = function (user, follow) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/update_follow',
      data: { id: user.id, follow: follow },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getUser();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: site.toNumber('##query.id##'),
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          if ($scope.user.email == '##user.email##') {
            $scope.user.$same_email = true;
          }
          $scope.user.followers_list.forEach((_f) => {
            if (_f == site.toNumber('##user.id##')) {
              $scope.user.$is_follow = true;
            }
          });
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

  $scope.getAdsList();
  $scope.getUser();
});
