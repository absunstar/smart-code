app.controller('centersView', function ($scope, $http, $timeout, $sce) {
  $scope.list = [];
  $scope.baseURL = '';

  $scope.getAll = function () {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: `${$scope.baseURL}/api/centers/all`,
      data: {
        view: true,
        select: {
          id: 1,
          host: 1,
          name: 1,
          image: 1,
          daysList: 1,
          mobile: 1,
          educationalLevel: 1,
          schoolYear: 1,
          country: 1,
          gov: 1,
          city: 1,
          area: 1,
          address: 1,
          latitude: 1,
          longitude: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
          setTimeout(() => {
            $scope.list.forEach((_item) => {
              _item.locationSrc = $sce.trustAsResourceUrl(`https://maps.google.com/maps?q=${_item.latitude},${_item.longitude}&hl=es;z=14&output=embed`);

              $scope.$applyAsync();
            });
          }, 1000);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getAll();
});
