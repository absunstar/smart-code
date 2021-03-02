app.controller("courts", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.court = {};

  $scope.displayAddCourt = function () {
    $scope.error = '';
    $scope.court = {
      image_url: '/images/court.png',
      active: true
    };
    site.showModal('#courtAddModal');
  };

  $scope.addCourt = function () {
    $scope.error = '';
    const v = site.validated('#courtAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courts/add",
      data: $scope.court
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#courtAddModal');
          $scope.getCourtList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCourt = function (court) {
    $scope.error = '';
    $scope.viewCourt(court);
    $scope.court = {};
    site.showModal('#courtUpdateModal');
  };

  $scope.updateCourt = function () {
    $scope.error = '';
    const v = site.validated('#courtUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courts/update",
      data: $scope.court
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#courtUpdateModal');
          $scope.getCourtList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCourt = function (court) {
    $scope.error = '';
    $scope.viewCourt(court);
    $scope.court = {};
    site.showModal('#courtViewModal');
  };

  $scope.viewCourt = function (court) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/courts/view",
      data: {
        id: court.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.court = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCourt = function (court) {
    $scope.error = '';
    $scope.viewCourt(court);
    $scope.court = {};
    site.showModal('#courtDeleteModal');
  };

  $scope.deleteCourt = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/courts/delete",
      data: {
        id: $scope.court.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#courtDeleteModal');
          $scope.getCourtList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCourtList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/courts/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#courtSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#courtSearchModal');

  };

  $scope.searchAll = function () {
  
    $scope.getCourtList($scope.search);
    site.hideModal('#courtSearchModal');
    $scope.search = {};
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "courts"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto();
  $scope.getCourtList();

});