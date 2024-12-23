app.controller("students_years", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.students_years = {};

  $scope.displayAddStudentsYears = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.students_years = {
      image_url: '/images/students_years.png',
      subjects_list: [{}],
      active: true
    };
    $scope.students_years.types_expenses_list = [];
    $scope.typesExpensesList.forEach(_t => {
      _t.value = 0;
      $scope.students_years.types_expenses_list.push(_t)
    });

    site.showModal('#studentsYearsAddModal');
  };

  $scope.addStudentsYears = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#studentsYearsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    if ($scope.students_years.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/students_years/add",
      data: $scope.students_years
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#studentsYearsAddModal');
          $scope.getStudentsYearsList();
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

  $scope.displayUpdateStudentsYears = function (students_years) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsStudentsYears(students_years);
    $scope.students_years = {};
    site.showModal('#studentsYearsUpdateModal');
  };

  $scope.updateStudentsYears = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#studentsYearsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    if ($scope.students_years.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/students_years/update",
      data: $scope.students_years
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#studentsYearsUpdateModal');
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

  $scope.displayDetailsStudentsYears = function (students_years) {
    $scope.error = '';
    $scope.detailsStudentsYears(students_years);
    $scope.students_years = {};
    site.showModal('#studentsYearsDetailsModal');
  };

  $scope.detailsStudentsYears = function (students_years) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/students_years/view",
      data: {
        id: students_years.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.students_years = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteStudentsYears = function (students_years) {
    $scope.error = '';
    $scope.detailsStudentsYears(students_years);
    $scope.students_years = {};
    site.showModal('#studentsYearsDeleteModal');
  };

  $scope.deleteStudentsYears = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/students_years/delete",
      data: {
        id: $scope.students_years.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#studentsYearsDeleteModal');
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

  $scope.getStudentsYearsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/students_years/all",
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
    $scope.getStudentsYearsList($scope.search);
    site.hideModal('#studentsYearsSearchModal');
    $scope.search = {}

  };

  $scope.addTypesExpensesList = function (types_expenses) {
    types_expenses.value = 0;
    $scope.students_years.types_expenses_list = $scope.students_years.types_expenses_list || [];

  let found =  $scope.students_years.types_expenses_list.some(t => t.id === types_expenses.id);
    if(!found) $scope.students_years.types_expenses_list.unshift(types_expenses);
  };

  $scope.getSubjects = function () {
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.subjectsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.loadTypesExpenses = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/types_expenses/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.typesExpensesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSchoolGrades = function () {
    $http({
      method: "POST",
      url: "/api/school_grades/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1,
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.schoolGradesList = response.data.list;
      },
      function (err) {
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
        screen: "students_years"
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

  $scope.getNumberingAuto();
  $scope.loadTypesExpenses();
  $scope.getSubjects();
  $scope.getSchoolGrades();
  $scope.getStudentsYearsList();

});