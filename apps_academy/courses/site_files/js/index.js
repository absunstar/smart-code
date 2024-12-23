app.controller("courses", function ($scope, $http, $timeout) {

  $scope.courses = {};

  $scope.displayAddCourses = function () {
    $scope.error = '';
    $scope.courses = {
      image_url: '/images/courses.png',
      active: true
    };
    site.showModal('#coursesAddModal');

  };

  $scope.addCourses = function () {
    $scope.error = '';
    const v = site.validated('#coursesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courses/add",
      data: $scope.courses
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#coursesAddModal');
          $scope.getCoursesList();
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

  $scope.displayUpdateCourses = function (courses) {
    $scope.error = '';
    $scope.viewCourses(courses);
    $scope.courses = {};
    site.showModal('#coursesUpdateModal');
  };

  $scope.updateCourses = function () {
    $scope.error = '';
    const v = site.validated('#coursesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/courses/update",
      data: $scope.courses
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#coursesUpdateModal');
          $scope.getCoursesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCourses = function (courses) {
    $scope.error = '';
    $scope.viewCourses(courses);
    $scope.courses = {};
    site.showModal('#coursesViewModal');
  };

  $scope.viewCourses = function (courses) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/courses/view",
      data: {
        id: courses.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.courses = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCourses = function (courses) {
    $scope.error = '';
    $scope.viewCourses(courses);
    $scope.courses = {};
    site.showModal('#coursesDeleteModal');

  };

  $scope.deleteCourses = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/courses/delete",
      data: {
        id: $scope.courses.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#coursesDeleteModal');
          $scope.getCoursesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCoursesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/courses/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#coursesSearchModal');
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
      url: "/api/period/all"

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
    site.showModal('#coursesSearchModal');

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "courses"
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

  $scope.searchAll = function () {
    $scope.getCoursesList($scope.search);
    site.hideModal('#coursesSearchModal');
    $scope.search = {};
  };

  $scope.getNumberingAuto();
  $scope.getCoursesList();
  $scope.getPeriod();

});