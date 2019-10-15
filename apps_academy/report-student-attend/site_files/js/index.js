app.controller("report_student_attend", function ($scope, $http) {

  var Search = function () {
    return {
      student: {},
      date: new Date()
    }
  };

  $scope.report = {};

  $scope.search = new Search();

  $scope.showSearch = function () {
    site.showModal('#searchModal');
  };

  $scope.searchAll = function () {

    $scope.student = $scope.search.student;
    $scope.getAttendList($scope.search.student);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.getStudentList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/students/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.studentsList = response.data.list;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAttendList = function (student) {

    $scope.report = {
      date: $scope.search.date,
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/create_course/student_attend",
      data: {
        where: {

          'dates_list.student_list.id': student.id,
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.attendList = response.data.list;

          $scope.list1 = [];

          $scope.attendList.forEach(itm1 => {
            let exit = false;

            $scope.list1.forEach(itm2 => {
              if (itm1.course.id == itm2.course.id) {
                itm2.list.push(itm1);
                exit = true;
              }
            });

            if (!exit) {
              $scope.list1.push({
                course: itm1.course,
                list: [itm1]
              });
            }
          });

        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getStudentList();

});