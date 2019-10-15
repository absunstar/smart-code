app.controller("class_rooms", function ($scope, $http, $timeout) {

  $scope.class_rooms = {};

  $scope.displayAddClassRooms = function () {
    $scope.error = '';
    $scope.class_rooms = {
      image_url: '/images/class_rooms.png',
      active: true,
      capaneighborhood : " - طالب",
      immediate : false
    };
    site.showModal('#classRoomsAddModal');
    
  };

  $scope.addClassRooms = function () {
    $scope.error = '';
    const v = site.validated('#classRoomsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/class_rooms/add",
      data: $scope.class_rooms
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classRoomsAddModal');
          $scope.getClassRoomsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateClassRooms = function (class_rooms) {
    $scope.error = '';
    $scope.viewClassRooms(class_rooms);
    $scope.class_rooms = {};
    site.showModal('#classRoomsUpdateModal');
  };

  $scope.updateClassRooms = function () {
    $scope.error = '';
    const v = site.validated('#classRoomsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/class_rooms/update",
      data: $scope.class_rooms
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classRoomsUpdateModal');
          $scope.getClassRoomsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsClassRooms = function (class_rooms) {
    $scope.error = '';
    $scope.viewClassRooms(class_rooms);
    $scope.class_rooms = {};
    site.showModal('#classRoomsViewModal');
  };

  $scope.viewClassRooms = function (class_rooms) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/class_rooms/view",
      data: {
        id: class_rooms.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.class_rooms = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteClassRooms = function (class_rooms) {
    $scope.error = '';
    $scope.viewClassRooms(class_rooms);
    $scope.class_rooms = {};
    site.showModal('#classRoomsDeleteModal');

  };

  $scope.deleteClassRooms = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/class_rooms/delete",
      data: {
        id: $scope.class_rooms.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#classRoomsDeleteModal');
          $scope.getClassRoomsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getClassRoomsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/class_rooms/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#classRoomsSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPeriod = function () {
    $scope.busy = true;
    $scope.periodList = [];
    $http({
      method: "POST",
      url: "/api/period_class/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.periodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#classRoomsSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getClassRoomsList($scope.search);
    site.hideModal('#classRoomsSearchModal');
    $scope.search = {};

  };

  $scope.getClassRoomsList();
  $scope.getPeriod();

});