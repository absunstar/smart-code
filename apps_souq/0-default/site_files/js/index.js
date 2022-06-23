app.controller('index_souq', function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.getAdsList = function (ev, where) {
    $scope.busy = true;
    $scope.adsList = [];
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/ads/all',
        data: {
          where: where,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.adsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.displayAd = function (id) {
    window.open(`/display_ad?id=${id}`, '_blank');
  }



});
