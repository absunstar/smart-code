let btn1 = document.querySelector(".tab-link");
if (btn1) {
  btn1.click();
}

app.controller('profile', function ($scope, $http, $timeout) {
  $scope.userId = site.toNumber('##user.id##');
  
  $scope.addRating = function (rating) {
    $scope.error = '';
    const v = site.validated('#ratingModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    rating.receiver = {
      id: $scope.user.id,
      email: $scope.user.email,
    };
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/ratings/add',
      data: rating,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.rating = {};
          site.hideModal('#ratingModal');
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*complete the rating correctly*')) {
            $scope.error = "##word.please_complete_rating_correctly##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };


  $scope.getAdsList = function (where) {
    $scope.busy = true;
    $scope.contentList = [];
    $http({
      method: 'POST',
      url: '/api/contents/all',
      data: {
        where: {
          $and: [
            {
              'store.user.id': site.toNumber('##params.id##'),
            },
            {
              'adStatus.id': 1,
            },
          ],
        },
        post: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.contentList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getRatingList = function () {
    $scope.busy = true;
    $scope.ratingList = [];
    $http({
      method: 'POST',
      url: '/api/ratings/all',
      data: {
        where: {
          'receiver.id': site.toNumber('##params.id##'),
          approval: true,
        },
        display: true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.ratingList = response.data.list;
          $scope.positive = response.data.positive;
          $scope.rate = $scope.positive / $scope.ratingList.length * 100;
          $scope.negative = response.data.negative;
          $scope.exist_user = response.data.exist_user;
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

  $scope.returnAds = function () {
    site.showModal('#ratings');
  };

  $scope.sendMessage = function () {
    $scope.busy = true;
    const v = site.validated('#messageModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    if (!$scope.sendMessage) {
      $scope.error = '##word.must_write_message##';
      return;
    }
    let message_obj = {
      date: new Date(),
      message: $scope.sendMessage,
      receiver: {
        id: $scope.user.id,
        name: $scope.user.profile.name,
        lastName: $scope.user.profile.lastName,
        email: $scope.user.email,
        image: $scope.user.profile.image,
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

  $scope.displayContent = function (id) {
    window.open(`/display-content?id=${id}`, '_blank');
  };

  $scope.displayManagePersonalAccount = function () {
    window.open(`/manage_user`, '_blank');
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
        id: site.toNumber('##params.id##'),
        profile : true,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
          if ($scope.user.id == site.toNumber('##user.id##')) {
            $scope.user.$same_email = true;
          }
          $scope.user.$is_follow = response.data.follow;
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

  $scope.getRatingList();
  $scope.getAdsList();
  $scope.getUser();
});
