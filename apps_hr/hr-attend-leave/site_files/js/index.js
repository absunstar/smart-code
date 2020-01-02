app.controller("attend_leave", function ($scope, $http, $timeout, $interval) {

  $scope.attend_leave = {};
  $scope.auto_load_attendance = true;

  $scope.displayAddAttendLeave = function () {
    $scope.error = '';
    $scope.attend_leave = {
      image_url: '/images/attend_leave.png',
      active: true,
      date: new Date()
    };
    site.showModal('#attendLeaveAddModal');
  };

  $scope.addAttendLeave = function () {
    $scope.error = '';
    const v = site.validated('#attendLeaveAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_leave/add",
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
    let id = $scope.attend_leave ? $scope.attend_leave.id : null;
    if(!id){
      return false;
    }
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

  $scope.list = [];
  $scope.getAttendLeaveList = function (where) {
    $scope.busy = true;
    
    $http({
      method: "POST",
      url: "/api/attend_leave/all",
      data: {
        where: where,
        limit : 10
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          if($scope.list.length == response.data.list.length){
            response.data.list.forEach((d , i) => {
              if(!$scope.list[i].leave_date && d.leave_date){
                $scope.list[i].leave_date = d.leave_date;
                $scope.list[i].leave = d.leave;
              }
              
            });
          }else{
            $scope.list = response.data.list;
            $scope.count = response.data.count;
            site.hideModal('#attendLeaveSearchModal');
            $scope.search = {};
          }
          
        }else{
          $scope.list = [];
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getEmployeeList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/employees/all",
        data: {
          search: $scope.search_employee,
          
          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.employeeList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#attendLeaveSearchModal');

  };

  $scope.attendNow = function () {
    $scope.attend_leave.attend_date = new Date();
    $scope.attend_leave.attend = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
  };

  $scope.leaveNow = function (attend_leave) {
    attend_leave.leave_date = new Date();
    attend_leave.leave = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/attend_leave/update",
      data: attend_leave
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
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

  $scope.searchAll = function () {
    $scope.getAttendLeaveList($scope.search);
    site.hideModal('#attendLeaveSearchModal');
    $scope.search = {};
  };

  $interval(() => {
    if ($scope.auto_load_attendance) {
      $scope.getAttendLeaveList();
    };
  }, 1000 * 3);

});