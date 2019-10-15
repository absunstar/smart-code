app.controller("report_student_courses", function ($scope, $http) {

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
    $scope.report.student_list = [];
  };

  $scope.searchAll = function () {

    $scope.student = $scope.search.student;
    $scope.getTicketList($scope.search.student);

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

  $scope.getTicketList = function (student) {

    $scope.report = {
      date: $scope.search.date,
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/book_course/student_report",
      data: {
        where: {
          'student.id': student.id,
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.bookList = response.data.list;
          $scope.report.student_list = $scope.report.student_list || [];
          $scope.report.total_rest = 0;
          $scope.report.total_paid = 0;
          $scope.report.rest = 0;
          $scope.bookList.forEach(b => {
            $scope.report.student_list.push({
              course: b.select_book.course.name,
              book_date: b.book_date,
              start_date: b.select_book.start_date,
              end_date: b.select_book.end_date,
              price: b.select_book.course.price,
              paid: b.total_rest,
              rest: b.rest,

            })

            $scope.report.total_rest += site.toNumber(b.select_book.course.price);
            $scope.report.total_paid += site.toNumber(b.total_rest);
            $scope.report.rest += site.toNumber(b.rest);
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