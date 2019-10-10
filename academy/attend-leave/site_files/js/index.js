app.controller("attend_leave", function ($scope, $http, $timeout) {

  $scope.attend_leave = {};

  $scope.displayAddAttendLeave = function () {
    $scope.error = '';
    $scope.attend_leave = {
      image_url: '/images/attend_leave.png',
      employee_attend_list: [],
      date: new Date(),
      active: true

    };
    site.showModal('#attendLeaveAddModal');

  };

  $scope.addAttendLeave = function () {
    $scope.error = '';
    const v = site.validated('#attendLeaveAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_leave/update",
      data: $scope.attend_leave
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendLeaveAddModal');
          $scope.getAttendLeaveList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAttendLeave = function (attend_leave) {
    $scope.error = '';
    $scope.viewAttendLeave(attend_leave);
    $scope.attend_leave = {};
    site.showModal('#attendLeaveUpdateModal');
  };

  $scope.updateAttendLeave = function () {
    $scope.error = '';
    const v = site.validated('#attendLeaveUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_leave/update",
      data: $scope.attend_leave
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendLeaveUpdateModal');
          $scope.getAttendLeaveList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAttendLeave = function (attend_leave) {
    $scope.error = '';
    $scope.viewAttendLeave(attend_leave);
    $scope.attend_leave = {};
    site.showModal('#attendLeaveViewModal');
  };

  $scope.viewAttendLeave = function (attend_leave) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/attend_leave/view",
      data: {
        id: attend_leave.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attend_leave = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAttendLeave = function (attend_leave) {
    $scope.error = '';
    $scope.viewAttendLeave(attend_leave);
    $scope.attend_leave = {};
    site.showModal('#attendLeaveDeleteModal');
  };

  $scope.deleteAttendLeave = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/attend_leave/delete",
      data: {
        id: $scope.attend_leave.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendLeaveDeleteModal');
          $scope.getAttendLeaveList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAttendLeaveList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/attend_leave/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#attendLeaveSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getTimeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/times_attend_leave/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.timeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAttend = function () {
    $scope.busy = true;
    $scope.attendList = [];
    $http({
      method: "POST",
      url: "/api/attend_leave_employee/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.attendList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_leave/show",
      data: {
        date: $scope.attend_leave.date
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.attend_leave = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getStatusNow = function () {
    $scope.busy = true;
    $scope.statusNowList = [];
    $http({
      method: "POST",
      url: "/api/status_now/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.statusNowList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.attend = function (d) {
    d.attend = $scope.attendList[0];
    d.status_now = $scope.statusNowList[0];
  };


  $scope.absence = function (d) {
    d.attend = $scope.attendList[1];
  };

  $scope.leaved = function (d) {
    d.status_now = $scope.statusNowList[1];

  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#attendLeaveSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getAttendLeaveList($scope.search);
    site.hideModal('#attendLeaveSearchModal');
    $scope.search = {};
  };

  $scope.getAttendLeaveList();
  $scope.getTimeList();
  $scope.getAttend();
  $scope.getStatusNow();
});