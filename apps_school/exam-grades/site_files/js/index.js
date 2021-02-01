app.controller("exam_grades", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.exam_grades = {};

  $scope.displayAddExamGrades = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.exam_grades = {
      image_url: '/images/exam_grades.png',
      students_list: [],
      active: true
    };
    
    if ($scope.defaultSettings.general_Settings) {
      $scope.exam_grades.school_year = $scope.schoolYearsList.find(_school_year => { return _school_year.id === $scope.defaultSettings.general_Settings.school_year.id });

    }

    site.showModal('#examGradessAddModal');
  };

  $scope.addExamGrades = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#examGradessAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/exam_grades/add",
      data: $scope.exam_grades
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examGradessAddModal');
          $scope.getExamGradesList();
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

  $scope.displayUpdateExamGrades = function (exam_grades) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsExamGrades(exam_grades);
    $scope.exam_grades = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#examGradessUpdateModal');
  };

  $scope.updateExamGrades = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#examGradessUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/exam_grades/update",
      data: $scope.exam_grades
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examGradessUpdateModal');
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

  $scope.displayDetailsExamGrades = function (exam_grades) {
    $scope.error = '';
    $scope.detailsExamGrades(exam_grades);
    $scope.exam_grades = {};
    site.showModal('#examGradessDetailsModal');
  };

  $scope.detailsExamGrades = function (exam_grades) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/exam_grades/view",
      data: {
        id: exam_grades.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.exam_grades = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteExamGrades = function (exam_grades) {
    $scope.error = '';
    $scope.detailsExamGrades(exam_grades);
    $scope.exam_grades = {};
    site.showModal('#examGradessDeleteModal');
  };

  $scope.deleteExamGrades = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/exam_grades/delete",
      data: {
        id: $scope.exam_grades.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examGradessDeleteModal');
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

  $scope.getExamGradesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/exam_grades/all",
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
    $scope.getExamGradesList($scope.search);
    site.hideModal('#examGradessSearchModal');
    $scope.search = {}

  };

  $scope.getSchoolGrade = function () {
    $http({
      method: "POST",
      url: "/api/school_grade/all",
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
        $scope.schoolGradeList = response.data.list;
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

  $scope.getExams = function () {
    $http({
      method: "POST",
      url: "/api/exams/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.examsList = response.data.list;
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

    const v = site.validated('#examGradessAddModal');
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
          school_grade: $scope.exam_grades.school_grade,
          hall: $scope.exam_grades.hall,
          active: true
        }

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.exam_grades.students_list = response.data.list;
          $scope.exam_grades.students_list.forEach(_student => {
            _student.final_grade = $scope.exam_grades.exam.final_grade;
            _student.degree_success = $scope.exam_grades.exam.degree_success;
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


  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "exam_grades"
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
      if (c.student_score > c.final_grade) {
        $scope.error = '##word.err_score_higher##';
        c.student_score = 0;
      }
    }, 250);

  };

  $scope.loadSchoolYears = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_years/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.schoolYearsList = response.data.list;
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

  $scope.getNumberingAuto();
  $scope.getSchoolGrade();
  $scope.loadSchoolYears();
  $scope.getDefaultSettings();
  $scope.getHalls();
  $scope.getExams();
  $scope.getExamGradesList();

});