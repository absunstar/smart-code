app.controller("room", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.room = {};

  $scope.displayAddRoom = function () {
    $scope.error = '';
    $scope.room = {
      image_url: '/images/room.png',
      active: true

    };
    site.showModal('#roomAddModal');

  };

  $scope.addRoom = function () {
    $scope.error = '';
    const v = site.validated('#roomAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/room/add",
      data: $scope.room
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#roomAddModal');
          $scope.getRoomList();
        } else {
          $scope.error = 'Please Login First';
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

  $scope.displayUpdateRoom = function (room) {
    $scope.error = '';
    $scope.viewRoom(room);
    $scope.room = {};
    site.showModal('#roomUpdateModal');
  };

  $scope.updateRoom = function () {
    $scope.error = '';
    const v = site.validated('#roomUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/room/update",
      data: $scope.room
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#roomUpdateModal');
          $scope.getRoomList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsRoom = function (room) {
    $scope.error = '';
    $scope.viewRoom(room);
    $scope.room = {};
    site.showModal('#roomViewModal');
  };

  $scope.viewRoom = function (room) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/room/view",
      data: {
        id: room.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.room = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRoom = function (room) {
    $scope.error = '';
    $scope.viewRoom(room);
    $scope.room = {};
    site.showModal('#roomDeleteModal');
  };

  $scope.deleteRoom = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/room/delete",
      data: {
        id: $scope.room.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#roomDeleteModal');
          $scope.getRoomList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getRoomList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/room/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#roomSearchModal');

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getBuildingsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/buildings/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.buildingsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getFloorsList = function (building) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/floor/all",
      data: {
        where: {
          'building.id': building.id,
          active: true
        },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.floorsList = response.data.list;
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
        screen: "room"
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


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#roomSearchModal');

  };

  $scope.searchAll = function () {

    $scope.error = '';

    $scope.search = $scope.search || {};
    site.hideModal('#roomSearchModal');
    $scope.getRoomList($scope.search);
  };

  $scope.getRoomList();
  $scope.getBuildingsList();
  $scope.getNumberingAuto();
});