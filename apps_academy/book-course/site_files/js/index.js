app.controller("book_course", function ($scope, $http, $timeout) {

  $scope.book_course = {};

  $scope.displayAddBookCourse = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.book_course = [];
        $scope.courses = false;
        $scope.trainer = false;
        $scope.createCourseList = {};

        $scope.book_course = {
          image_url: '/images/book_course.png',
          active: true,
          paid_list: [],
          shift: shift,
          date: new Date()

        };

        site.showModal('#bookCourseAddModal');
        document.querySelector('#studentsViewModal .tab-link').click();
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addBookCourse = function () {
    $scope.error = '';
    const v = site.validated('#bookCourseAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if (!$scope.book_course.customer) {

      $scope.error = "##word.should_student##";
      return;

    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/book_course/add",
      data: $scope.book_course
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bookCourseAddModal');
          $scope.getBookCourseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateBookCourse = function (book_course) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewBookCourse(book_course);
        $scope.book_course = {};
        site.showModal('#bookCourseUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateBookCourse = function () {
    $scope.error = '';
    const v = site.validated('#bookCourseUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/book_course/update",
      data: $scope.book_course
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bookCourseUpdateModal');
          $scope.getBookCourseList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsBookCourse = function (book_course) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewBookCourse(book_course);
        $scope.book_course = {};
        site.showModal('#bookCourseViewModal');
        document.querySelector('#bookCourseViewModal .tab-link').click();
        document.querySelector('#studentsViewModal .tab-link').click();
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.viewBookCourse = function (book_course) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/book_course/view",
      data: {
        id: book_course.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.book_course = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteBookCourse = function (book_course) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewBookCourse(book_course);
        $scope.book_course = {};
        site.showModal('#bookCourseDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteBookCourse = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/book_course/delete",
      data: {
        id: $scope.book_course.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#bookCourseDeleteModal');
          $scope.getBookCourseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getBookCourseList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/book_course/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#bookCourseSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getStudentsList = function (ev) {
    $scope.busy = true;

    if (ev.which !== 13) {
      return;
    };

    $scope.studentList = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        search: $scope.student_search,
        where:{
          active: true
        }
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

  $scope.getCreateCourseList = function (where) {
    $scope.busy = true;
    $scope.createCourseList = [];
    where = where || {};
    where.active = true;

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
          $scope.createCourseList = response.data.list;
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

  $scope.getCreateCourseLoadList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/create_course/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.courseLoadList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showStudent = function (id) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/students/view",
      data: {
        id: id,
        select: {}
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.students = response.data.doc;
          site.showModal('#studentsViewModal')
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSafesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.booking = function (c) {
    $scope.book_course.select_book = c;
  };

  $scope.paidShow = function () {
    $scope.error = '';

    $scope.book_course.date_paid = new Date();
    $scope.book_course.safe = '';
    site.showModal('#paidModal')

  };



  $scope.paidPaybackShow = function (book_course) {
    $scope.error = '';

    $scope.viewBookCourse(book_course);

    site.showModal('#paidPaybackModal')

  };

  $scope.showAccept = function () {
    $scope.error = '';
    if (!$scope.book_course.safe) {

      $scope.error = "##word.safe_err##";
      return;

    } else {
      site.showModal('#acceptModal')
    }

  };

  $scope.paidUpdate = function () {
    $scope.error = '';
    if ($scope.book_course.safe) {

      if (!$scope.book_course.total_rest) {
        $scope.book_course.total_rest = $scope.book_course.paid;

      } else {
        $scope.book_course.total_rest += $scope.book_course.paid;
      };

      $scope.book_course.rest = ($scope.book_course.select_book.course.price - $scope.book_course.total_rest);
      $scope.book_course.baid_go = $scope.book_course.paid;

      $scope.book_course.paid_list = $scope.book_course.paid_list || [];
      $scope.book_course.paid_list.unshift({

        payment: $scope.book_course.baid_go,
        date_paid: $scope.book_course.date_paid,
        safe: $scope.book_course.safe

      });

      $scope.book_course.paid = 0;
      $scope.error = "";
      $scope.busy = true;

      $http({
        method: "POST",
        url: "/api/book_course/update",
        data: $scope.book_course
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.getBookCourseList();
          };
        },
        function (err) {
          console.log(err);
        }
      )
    };
    site.hideModal('#acceptModal')

  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.shift = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
      }
    )
  };

  $scope.displayDetailsBook = function (book_course) {
    $scope.error = '';
    $scope.viewBookCourse(book_course);
    $scope.book_course = {};
    site.showModal('#bookCourseViewModal');
    document.querySelector('#bookCourseViewModal .tab-link').click();
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#bookCourseSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getBookCourseList($scope.search);
    site.hideModal('#bookCourseSearchModal');
    $scope.search = {};

  };

  $scope.getBookCourseList();
  $scope.getTrainerList();
  $scope.getCreateCourseLoadList();
  $scope.getSafesList();
});