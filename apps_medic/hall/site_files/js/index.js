app.controller("hall", function ($scope, $http, $timeout) {

  $scope.hall = {};

  $scope.displayAddHall = function () {
    $scope.error = '';
    $scope.hall = {
      image_url: '/images/hall.png',
      active: true,
    };
    site.showModal('#hallAddModal');

  };

  $scope.addHall = function () {
    $scope.error = '';
    const v = site.validated('#hallAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/add",
      data: $scope.hall
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#hallAddModal');
          $scope.getHallList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateHall = function (hall) {
    $scope.error = '';
    $scope.viewHall(hall);
    $scope.hall = {};
    site.showModal('#hallUpdateModal');
  };

  $scope.updateHall = function () {
    $scope.error = '';
    const v = site.validated('#hallUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/update",
      data: $scope.hall
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#hallUpdateModal');
          $scope.getHallList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsHall = function (hall) {
    $scope.error = '';
    $scope.viewHall(hall);
    $scope.hall = {};
    site.showModal('#hallViewModal');
  };

  $scope.viewHall = function (hall) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/hall/view",
      data: {
        id: hall.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.hall = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteHall = function (hall) {
    $scope.error = '';
    $scope.viewHall(hall);
    $scope.hall = {};
    site.showModal('#hallDeleteModal');

  };

  $scope.deleteHall = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/hall/delete",
      data: {
        id: $scope.hall.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#hallDeleteModal');
          $scope.getHallList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getHallList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#hallSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "halls"
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

  $scope.loadCustomers = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where: {
          hall: $scope.hall,
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customersList = response.data.list;
          site.showModal('#StudentsListModal');
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
    site.showModal('#hallSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getHallList($scope.search);
    site.hideModal('#hallSearchModal');
    $scope.search = {};

  };

  $scope.getHallList();
  $scope.getNumberingAuto();
});