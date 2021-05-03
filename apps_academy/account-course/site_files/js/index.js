app.controller("account_course", function ($scope, $http, $timeout) {

  $scope.account_course = {};

  $scope.displayAddAccountCourse = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_course = {
          image_url: '/images/account_course.png',
          active: true,
          dates_list: [],
          shift: shift,
          immediate: false
        };
        site.showModal('#accountCourseAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAccountCourse = function () {
    $scope.error = '';
    const v = site.validated('#accountCourseAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/account_course/add",
      data: $scope.account_course
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#accountCourseAddModal');
          $scope.getAccountCourseList();
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

  $scope.displayUpdateAccountCourse = function (account_course) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.viewAccountCourse(account_course);
        $scope.account_course = {};
        site.showModal('#accountCourseUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateAccountCourse = function () {
    $scope.error = '';
    const v = site.validated('#accountCourseUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/account_course/update",
      data: $scope.account_course
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#accountCourseUpdateModal');
          $scope.getAccountCourseList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAccountCourse = function (account_course) {
    $scope.error = '';
    $scope.viewAccountCourse(account_course);
    $scope.account_course = {};
    site.showModal('#accountCourseViewModal');
  };

  $scope.viewAccountCourse = function (account_course) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/account_course/view",
      data: {
        id: account_course.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.account_course = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAccountCourse = function (account_course) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.viewAccountCourse(account_course);
        $scope.account_course = {};
        site.showModal('#accountCourseDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteAccountCourse = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/account_course/delete",
      data: {
        id: $scope.account_course.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#accountCourseDeleteModal');
          $scope.getAccountCourseList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAccountCourseList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/account_course/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#accountCourseSearchModal');
          $scope.search = {};
        }
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

  $scope.getAttend = function () {
    $scope.busy = true;
    $scope.attendList = [];
    $http({
      method: "POST",
      url: "/api/attend/all"

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

  $scope.paidShow = function () {
    $scope.error = '';
    $scope.account_course.date_paid = new Date();
    $scope.account_course.safe = '';
    $scope.account_course.trainer_paid = '';
    site.showModal('#paidModal');

  };

  $scope.showAccept = function () {
    $scope.error = '';
    if (!$scope.account_course.safe) {

      $scope.error = "##word.safe_err##";
      return;

    } else if (!$scope.account_course.trainer_paid) {

      $scope.error = "##word.trainer_err##";
      return;

    } else {
      site.showModal('#acceptModal')
    }

  };

  $scope.paidPaybackShow = function (account_course) {
    $scope.error = '';
    $scope.viewAccountCourse(account_course);

    site.showModal('#paidPaybackModal')

  };

  $scope.paidUpdate = function () {
    $scope.error = '';

    if ($scope.account_course.safe) {


      if (!$scope.account_course.total_rest) {
        $scope.account_course.total_rest = $scope.account_course.paid;

      } else {
        $scope.account_course.total_rest += $scope.account_course.paid;
      };



      $scope.account_course.rest = ($scope.account_course.trainer_account - $scope.account_course.total_rest);
      $scope.account_course.baid_go = $scope.account_course.paid;

      $scope.account_course.paid_list = $scope.account_course.paid_list || [];
      $scope.account_course.paid_list.unshift({

        payment: $scope.account_course.baid_go,
        date_paid: $scope.account_course.date_paid,
        trainer_paid: $scope.account_course.trainer_paid,
        safe: $scope.account_course.safe

      });

      $scope.account_course.paid = 0;
      $scope.error = "";
      $scope.busy = true;

      $http({
        method: "POST",
        url: "/api/account_course/update",
        data: $scope.account_course
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.getAccountCourseList();
          };
        },
        function (err) {
          console.log(err);
        }
      )
    };
    site.hideModal('#acceptModal')

  };

  $scope.updateStatus = function () {
    $http({
      method: "POST",
      url: "/api/account_course/update",
      data: $scope.account_course
    })
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "account_course"
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#accountCourseSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getAccountCourseList($scope.search);
    site.hideModal('#accountCourseSearchModal');
    $scope.search = {};

  };

  $scope.getAccountCourseList();
  $scope.getNumberingAuto();
  $scope.getCoursesList();
  $scope.getTrainerList();
  $scope.getSafesList();
  $scope.getAttend();
});