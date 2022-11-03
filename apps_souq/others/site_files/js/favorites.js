app.controller('favorites', function ($scope, $http, $timeout) {

  $scope.getFavoriteAdsList = function (where) {
    $scope.busy = true;
    $scope.favoriteAdslist = [];
    $http({
      method: 'POST',
      url: '/api/contents/all',
      data: {
        where: {
          $and: [
            {
              'feedback_list.user.id': site.toNumber('##user.id##'),
            },
            {
              'feedback_list.type.id': 2,
            },
            {
              'ad_status.id': 1,
            },
          ],
        },
        post : true
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.favoriteAdslist = response.data.list;
        /*   $scope.favoriteAdslist.forEach((ad) => {
            ad.favorite = $scope.user.feedback_list.some((_f) => _f.type && _f.ad && _f.type.id == 2 && _f.ad.id == ad.id);
          }); */
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displayContent = function (id) {
    window.open(`/display_content?id=${id}`, '_blank');
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
          $scope.getFavoriteAdsList();
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

  $scope.updateFeedback = function (ad, type,status) {
    if(type == 'favorite') {
      ad.$favorite = status;
    }
    let data = { id: ad.id, feedback: { favorite: ad.$favorite, type: type } };

    $http({
      method: 'POST',
      url: '/api/contents/update_feedback',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getUser();
});
