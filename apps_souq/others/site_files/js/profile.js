app.controller('profile', function ($scope, $http, $timeout) {

  $scope.getAdsList = function (where) {
    $scope.busy = true;
    $scope.adslist = [];
    $http({
      method: 'POST',
      url: '/api/ads/all',
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
    let data = { user: $scope.user, message: $scope.message };

    $http({
      method: 'POST',
      url: '/api/messages/update',
      data: data,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.message = '';
          site.hideModal('#messageModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  
  $scope.displayAd = function (id) {
    window.open(`/display_ad?id=${id}`, '_blank');
  };

  $scope.updateFollow = function (user,follow) {
    $scope.error = "";

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/update_follow",
      data: {id : user.id , follow : follow},
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
          $scope.user.follow_list.forEach(_f => {
            if(_f ==  site.toNumber('##user.id##')){
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
