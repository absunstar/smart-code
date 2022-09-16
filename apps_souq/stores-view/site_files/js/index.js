app.controller('stores_view', function ($scope, $http, $timeout) {
  $scope.getStoresList = function (ev, where) {
    $scope.busy = true;
    $scope.storesList = [];
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/stores/all',
        data: {
          where: where,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.storesList = response.data.list;
            $scope.storesList.forEach((store) => {
              store.favorite = $scope.user.feedback_list.some((_f) => _f.type && _f.store && _f.type.id == 2 && _f.store.id == store.id);
            });
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.displayStore = function (id) {
    window.open(`/display_store?id=${id}`, '_blank');
  };

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: '##user.id##',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;

          if (!$scope.user.cart) {
            $scope.user.cart = {
              total: 0,
              fee_upon_receipt: 0,
              normal_delivery_fee: 0,
              fast_delivery_fee: 0,
              items: [],
            };
          }
          $scope.getStoresList({ which: 13 });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
    );
  };

  $scope.updateFeedback = function (store, type) {
    let data = { id: store.id, feedback: { favorite: store.favorite, type: type } };

    $http({
      method: 'POST',
      url: '/api/stores/update_feedback',
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
