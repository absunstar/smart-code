app.controller('pay', function ($scope, $http, $timeout) {
  $scope.pay = {};

  $scope.updatePay = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/pay/update',
      data: $scope.pay,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#payUpdateModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.updateApproval = function (rating, type) {
    $scope.error = '';
    $scope.rating = rating;
    if (type == true) {
      $scope.rating.approval = true;
    } else if (type == false) {
      $scope.rating.approval = false;
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/pay/update',
      data: $scope.rating,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.showModal("#alert");
          $timeout(() => {
            site.hideModal("#alert");

          }, 1200);
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsPay = function (pay) {
    $scope.error = '';
    $scope.viewPay(pay);
    $scope.pay = {};
    site.showModal('#payViewModal');
  };

  $scope.viewPay = function (pay) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/pay/view',
      data: {
        id: pay.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.pay = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeletePay = function (pay) {
    $scope.error = '';
    $scope.viewPay(pay);
    $scope.pay = {};
    site.showModal('#payDeleteModal');
  };

  $scope.deletePay = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/pay/delete',
      data: {
        id: $scope.pay.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#payDeleteModal');
          $scope.getPayList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getPayList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/pay/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#paySearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#paySearchModal');
  };

  $scope.searchAll = function () {
    $scope.getPayList($scope.search);
    site.hideModal('#paySearchModal');
    $scope.search = {};
  };

  $scope.getPayList();
});
