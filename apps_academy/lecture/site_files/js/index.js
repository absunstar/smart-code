app.controller("lecture", function ($scope, $http, $timeout) {

  $scope.lecture = {};

  $scope.displayAddLecture = function () {
    $scope.error = '';
    $scope.lecture = {
      image_url: '/images/lecture.png',
      student_list: [{}],
      active: true
    };
    site.showModal('#lectureAddModal');
  };

  $scope.addLecture = function () {
    $scope.error = '';
    const v = site.validated('#lectureAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lecture/add",
      data: $scope.lecture
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lectureAddModal');
          $scope.getLectureList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateLecture = function (lecture) {
    $scope.error = '';
    $scope.viewLecture(lecture);
    $scope.lecture = {};
    site.showModal('#lectureUpdateModal');
  };

  $scope.updateLecture = function () {
    $scope.error = '';
    const v = site.validated('#lectureUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/lecture/update",
      data: $scope.lecture
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lectureUpdateModal');
          $scope.getLectureList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsLecture = function (lecture) {
    $scope.error = '';
    $scope.viewLecture(lecture);
    $scope.lecture = {};
    site.showModal('#lectureViewModal');
  };

  $scope.viewLecture = function (lecture) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/lecture/view",
      data: {
        id: lecture.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.lecture = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
  $scope.displayDeleteLecture = function (lecture) {
    $scope.error = '';
    $scope.viewLecture(lecture);
    $scope.lecture = {};
    site.showModal('#lectureDeleteModal');
  };

  $scope.deleteLecture = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/lecture/delete",
      data: {
        id: $scope.lecture.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#lectureDeleteModal');
          $scope.getLectureList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getLectureList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/lecture/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#lectureSearchModal');
          $scope.search = {};

        }
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
      url: "/api/trainer/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainerList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getStudentList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/students/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.studentList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  
  $scope.getClassRooms = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/class_rooms/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.classRoomsList = response.data.list;
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
      url: "/api/times_lecture/all",
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


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#lectureSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getLectureList($scope.search);
    site.hideModal('#lectureSearchModal');
    $scope.search = {};
  };

  $scope.getLectureList();
  $scope.getTrainerList();
  $scope.getStudentList();
  $scope.getClassRooms();
  $scope.getTimeList();
});