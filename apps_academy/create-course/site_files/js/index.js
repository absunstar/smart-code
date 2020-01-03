app.controller("create_course", function ($scope, $http, $timeout) {

  $scope.create_course = {};

  $scope.displayAddCreateCourse = function () {
    $scope.error = '';
    $scope.create_course = {
      image_url: '/images/create_course.png',
      active: true,
      dates_list: []
    };
    site.showModal('#createCourseAddModal');

  };

  $scope.addCreateCourse = function () {
    $scope.error = '';
    const v = site.validated('#createCourseAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if($scope.create_course.dates_list.length < 1){
      $scope.error ="##word.error_dates##";
      return;
    };
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_course/add",
      data: $scope.create_course
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#createCourseAddModal');
          $scope.getCreateCourseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCreateCourse = function (create_course) {
    $scope.error = '';
    $scope.viewCreateCourse(create_course);
    $scope.create_course = {};
    site.showModal('#createCourseUpdateModal');
  };

  $scope.updateCreateCourse = function () {
    $scope.error = '';
    const v = site.validated('#createCourseUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_course/update",
      data: $scope.create_course
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#createCourseUpdateModal');
          $scope.getCreateCourseList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCreateCourse = function (create_course) {
    $scope.error = '';
    $scope.viewCreateCourse(create_course);
    $scope.create_course = {};
    site.showModal('#createCourseViewModal');
  };

  $scope.viewCreateCourse = function (create_course) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/create_course/view",
      data: {
        id: create_course.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.create_course = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCreateCourse = function (create_course) {
    $scope.error = '';
    $scope.viewCreateCourse(create_course);
    $scope.create_course = {};
    site.showModal('#createCourseDeleteModal');

  };

  $scope.deleteCreateCourse = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/create_course/delete",
      data: {
        id: $scope.create_course.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#createCourseDeleteModal');
          $scope.getCreateCourseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCreateCourseList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/create_course/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#createCourseSearchModal');
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
      url: "/api/period_create/all"

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

  $scope.getCoursesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courses/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.coursesList = response.data.list;
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
      url: "/api/hall/all",
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

  $scope.getClassRoomsDate = function () {
    $scope.busy = true;
    $scope.currencyNameToList = [];

    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.classRoomsDateList = response.data.list;
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
      url: "/api/times_create/all",
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
      url: "/api/attend_create/all"

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
      url: "/api/trainer/all",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1,
          name: 1
        }
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

  $scope.createDates = function () {

    $scope.create_course.dates_list = [];

    for (let i = 0; i < $scope.create_course.course.number_lecture; i++) {
      $scope.create_course.dates_list.push({
        hall: $scope.create_course.hall,
        number_lecture: $scope.create_course.course.number_lecture_hours || 0
      });
    }
  };

  $scope.addTrainer = function () {
    $scope.create_course.dates_list.forEach(t => {
      t.trainer = $scope.create_course.trainer;
    });
  };

  $scope.showTrainer = function (create_course) {
    $scope.error = '';
    $scope.viewCreateCourse(create_course);
    site.showModal('#addTrainer');
  };

  $scope.showAttend = function (attend) {
    $scope.error = '';
    $scope.current_attend = attend;

    site.showModal('#showAttendModal');
  }; 

  $scope.attendTrainer = function (current_attend) {

    current_attend.attend = $scope.attendList[0];
  };

  $scope.absenceTrainer = function (current_attend) {

    current_attend.attend = $scope.attendList[1];
  };

  $scope.attend = function (customer) {
    customer.attend = $scope.attendList[0];
  };

  $scope.absence = function (customer) {
    customer.attend = $scope.attendList[1];
  };


  $scope.safeAttend = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_course/edit_trainer",
      data: $scope.create_course
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#showAttendModal');
          site.hideModal('#addTrainer');

        }
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#createCourseSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getCreateCourseList($scope.search);
    site.hideModal('#createCourseSearchModal');
    $scope.search = {};
  };

  $scope.getCreateCourseList();
  $scope.getPeriod();
  $scope.getCoursesList();
  $scope.getTimeList();
  $scope.getClassRooms();
  $scope.getTrainerList();
  $scope.getAttend();
  $scope.getClassRoomsDate();
});