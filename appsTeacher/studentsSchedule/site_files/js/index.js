app.controller("studentsSchedule", function ($scope, $http, $timeout) {
  $scope.list = [];
  $scope.baseURL = "";
  $scope.appName = "studentsSchedule";
  $scope.modalID = "#studentScheduleManageModal";
  $scope.showAdd = function (_item) {
    $scope.error = "";
    $scope.itemAdd = {};
    site.showModal($scope.modalID);
  };

  $scope.view = function () {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/studentsSchedule/view`,
      data: { studentId: "##query.id##" },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.add = function (_item) {
    $scope.error = "";
    const v = site.validated($scope.modalID);
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    _item.studentId = "##query.id##";
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/add`,
      data: _item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal($scope.modalID);
          $scope.item = response.data.doc;
          $scope.itemAdd = {};
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.updateStatus = function (_item, type) {
    $scope.error = "";

    _item.status = $scope.studentsScheduleTypeList.find((itm) => itm.name == type);
    $scope.busy = true;
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/update`,
      data: $scope.item,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };
  $scope.getWeekDaysList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/weekDays",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.weekDaysList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getStudentsScheduleTypeList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/studentsScheduleTypeList",
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.studentsScheduleTypeList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.view();
  $scope.getWeekDaysList();
  $scope.getStudentsScheduleTypeList();
});