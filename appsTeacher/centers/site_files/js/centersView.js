app.controller("centersView", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.baseURL = "";

  $scope.getAll = function (ev) {
    $scope.busy = true;
    $scope.error = "";
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: `${$scope.baseURL}/api/centers/all`,
        data: {
          select: {
            id: 1,
            name: 1,
            image: 1,
            daysList: 1,
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
              $scope.list.forEach(_item => {
                _item.locationSrc =`https://maps.google.com/maps?q=${_item.latitude},${_item.longitude}&hl=es;z=14&output=embed`;
            
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
    }
  };

  $scope.getAll({ which: 13 });
});
