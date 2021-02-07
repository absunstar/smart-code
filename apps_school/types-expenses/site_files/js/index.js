app.controller("types_expenses", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.types_expenses = {};

  $scope.displayAddYearWorks = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.types_expenses = {
      image_url: '/images/types_expenses.png',
      students_list: [],
      active: true
    };
    if ($scope.defaultSettings.general_Settings) {

    }
    site.showModal('#yearWorksAddModal');
  };

  $scope.addYearWorks = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#yearWorksAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/types_expenses/add",
      data: $scope.types_expenses
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#yearWorksAddModal');
          $scope.getYearWorksList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateYearWorks = function (types_expenses) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsYearWorks(types_expenses);
    $scope.types_expenses = {};
    site.showModal('#yearWorksUpdateModal');
  };

  $scope.updateYearWorks = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#yearWorksUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/types_expenses/update",
      data: $scope.types_expenses
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#yearWorksUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsYearWorks = function (types_expenses) {
    $scope.error = '';
    $scope.detailsYearWorks(types_expenses);
    $scope.types_expenses = {};
    site.showModal('#yearWorksDetailsModal');
  };

  $scope.detailsYearWorks = function (types_expenses) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/types_expenses/view",
      data: {
        id: types_expenses.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.types_expenses = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteYearWorks = function (types_expenses) {
    $scope.error = '';
    $scope.detailsYearWorks(types_expenses);
    $scope.types_expenses = {};
    site.showModal('#yearWorksDeleteModal');
  };

  $scope.deleteYearWorks = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/types_expenses/delete",
      data: {
        id: $scope.types_expenses.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#yearWorksDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getYearWorksList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/types_expenses/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getYearWorksList($scope.search);
    site.hideModal('#yearWorksSearchModal');
    $scope.search = {}

  };

  $scope.getStudentsYears = function () {
    $http({
      method: "POST",
      url: "/api/students_years/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1,
          subjects_list: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.studentsYearsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getHalls = function () {
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.hallsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.searchStudents = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#yearWorksAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where: {
          students_years: $scope.types_expenses.students_years,
          hall: $scope.types_expenses.hall,
          active: true
        }

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.types_expenses.students_list = response.data.list;
          $scope.types_expenses.students_list.forEach(_student => {
            _student.work_degree_year = $scope.types_expenses.subject.work_degree_year;
            _student.student_score = 0;
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.getDefaultSettings = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;

        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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
        screen: "types_expenses"
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


  $scope.calc = function (c) {
    $timeout(() => {

      $scope.error = '';
      if (c.student_score > c.work_degree_year) {
        $scope.error = '##word.err_score_higher##';
        c.student_score = 0;
      }
    }, 250);

  };


  $scope.getNumberingAuto();
  $scope.getStudentsYears();
  $scope.getDefaultSettings();
  $scope.getHalls();
  $scope.getYearWorksList();

});