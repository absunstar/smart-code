app.controller("exams_results", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.exams_results = {};

  $scope.displayAddExamsResults = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope._search = {};
        $scope.error = '';
        $scope.exams_results = {
          image_url: '/images/exams_results.png',
          students_list: [],
          shift: shift,
          date: new Date(),
          active: true
        };
        if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.school_grade) {

          $scope.exams_results.school_grade = $scope.schoolGradesList.find(_schoolGrade => { return _schoolGrade.id === $scope.defaultSettings.general_Settings.school_grade.id });
          if ($scope.exams_results.school_grade && $scope.exams_results.school_grade.id) {

            $scope.getStudentsYearsList($scope.exams_results.school_grade);
          }

        }
        site.showModal('#examsResultsAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addExamsResults = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#examsResultsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/exams_results/add",
      data: $scope.exams_results
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examsResultsAddModal');
          $scope.getExamsResultsList();
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

  $scope.displayUpdateExamsResults = function (exams_results) {

    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope._search = {};
        $scope.error = '';
        $scope.detailsExamsResults(exams_results);
        $scope.exams_results = {};
        site.showModal('#examsResultsUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.updateExamsResults = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#examsResultsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/exams_results/update",
      data: $scope.exams_results
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examsResultsUpdateModal');
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

  $scope.displayDetailsExamsResults = function (exams_results) {

    $scope.error = '';
    $scope.detailsExamsResults(exams_results);
    $scope.exams_results = {};
    site.showModal('#examsResultsDetailsModal');
  };

  $scope.detailsExamsResults = function (exams_results) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/exams_results/view",
      data: {
        id: exams_results.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.exams_results = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteExamsResults = function (exams_results) {
    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope.error = '';
        $scope.detailsExamsResults(exams_results);
        $scope.exams_results = {};
        site.showModal('#examsResultsDeleteModal');

      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.deleteExamsResults = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/exams_results/delete",
      data: {
        id: $scope.exams_results.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examsResultsDeleteModal');
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

  $scope.getExamsResultsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/exams_results/all",
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
    $scope.getExamsResultsList($scope.search);
    site.hideModal('#examsResultsSearchModal');
    $scope.search = {}

  };

  $scope.getHalls = function () {
    $http({
      method: "POST",
      url: "/api/hall/all",
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

    const v = site.validated('#examsResultsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where: {
          school_grade: $scope.exams_results.school_grade,
          students_year: $scope.exams_results.students_year,
          hall: $scope.exams_results.hall,
          active: true
        }

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.exams_results.students_list = response.data.list;
          $scope.exams_results.students_list.forEach(_student => {
            $scope.exams_results.students_year.subjects_list.forEach(_s => {
              _student.subjects_list = _student.subjects_list || [];
              if (_s.subject) _s.subject.student_score = 0;
              _student.subjects_list.push(Object.assign({}, _s.subject));
            });
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

  $scope.getSchoolGradesList = function () {
    $http({
      method: "POST",
      url: "/api/school_grades/all",
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
        $scope.schoolGradesList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getStudentsYearsList = function (school_grade) {
    $http({
      method: "POST",
      url: "/api/students_years/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          subjects_list: 1,
          code: 1
        },
        where: {
          active: true,
          'school_grade.id': school_grade.id
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

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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
        screen: "exams_results"
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
        c.student_score = 0;
        $scope.error = '##word.err_score_higher##';
      }
    }, 250);

  };


  $scope.getNumberingAuto();
  $scope.getSchoolGradesList();
  $scope.getDefaultSettings();
  $scope.getHalls();
  $scope.getExamsResultsList();

});