app.controller('ratings', function ($scope, $http, $timeout) {
  $scope.ratings = {};

  $scope.updateRatings = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/ratings/update',
      data: $scope.ratings,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ratingsUpdateModal');
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
      url: '/api/ratings/update',
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

  $scope.displayDetailsRatings = function (ratings) {
    $scope.error = '';
    $scope.viewRatings(ratings);
    $scope.ratings = {};
    site.showModal('#ratingsViewModal');
  };

  $scope.viewRatings = function (ratings) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/ratings/view',
      data: {
        id: ratings.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.ratings = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.displayDeleteRatings = function (ratings) {
    $scope.error = '';
    $scope.viewRatings(ratings);
    $scope.ratings = {};
    site.showModal('#ratingsDeleteModal');
  };

  $scope.deleteRatings = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: 'POST',
      url: '/api/ratings/delete',
      data: {
        id: $scope.ratings.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#ratingsDeleteModal');
          $scope.getRatingsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getRatingsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/ratings/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#ratingsSearchModal');
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
    site.showModal('#ratingsSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getRatingsList($scope.search);
    site.hideModal('#ratingsSearchModal');
    $scope.search = {};
  };

  $scope.getRatingsList();
});
