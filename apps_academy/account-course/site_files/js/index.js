app.controller("account_course", function ($scope, $http, $timeout) {

  $scope.account_course = {};

  $scope.displayAddAccountCourse = function () {
    $scope.error = '';
    $scope.account_course = {
      image_url: '/images/account_course.png',
      active: true,
      dates_list: [],
      shift: shift,
      immediate: false
    };
    site.showModal('#accountCourseAddModal');

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
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAccountCourse = function (account_course) {
    $scope.error = '';
    $scope.viewAccountCourse(account_course);
    $scope.account_course = {};
    site.showModal('#accountCourseUpdateModal');
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
    $scope.viewAccountCourse(account_course);
    $scope.account_course = {};
    site.showModal('#accountCourseDeleteModal');

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
  $scope.getCoursesList();
  $scope.getTrainerList();
  $scope.getSafesList();
  $scope.getAttend();
});