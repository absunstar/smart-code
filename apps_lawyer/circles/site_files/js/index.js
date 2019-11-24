app.controller("circles", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.circle = {};

  $scope.displayAddCircle = function () {
    $scope.error = '';
    $scope.circle = {
      image_url: '/images/circle.png',
      active: true
    };
    site.showModal('#circleAddModal');
  };

  $scope.addCircle = function () {
    $scope.error = '';
    const v = site.validated('#circleAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/circles/add",
      data: $scope.circle
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#circleAddModal');
          $scope.getCircleList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCircle = function (circle) {
    $scope.error = '';
    $scope.viewCircle(circle);
    $scope.circle = {};
    site.showModal('#circleUpdateModal');
  };

  $scope.updateCircle = function () {
    $scope.error = '';
    const v = site.validated('#circleUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/circles/update",
      data: $scope.circle
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#circleUpdateModal');
          $scope.getCircleList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCircle = function (circle) {
    $scope.error = '';
    $scope.viewCircle(circle);
    $scope.circle = {};
    site.showModal('#circleViewModal');
  };

  $scope.viewCircle = function (circle) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/circles/view",
      data: {
        id: circle.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.circle = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCircle = function (circle) {
    $scope.error = '';
    $scope.viewCircle(circle);
    $scope.circle = {};
    site.showModal('#circleDeleteModal');
  };

  $scope.deleteCircle = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/circles/delete",
      data: {
        id: $scope.circle.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#circleDeleteModal');
          $scope.getCircleList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCircleList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/circles/all",
      data: {
        where: where,
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#circleSearchModal');
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
    site.showModal('#circleSearchModal');

  };

  $scope.searchAll = function () {
  
    $scope.getCircleList($scope.search);
    site.hideModal('#circleSearchModal');
    $scope.search = {};
  };

  $scope.getCircleList();

});