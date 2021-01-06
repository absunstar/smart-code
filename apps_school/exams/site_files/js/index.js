app.controller("exams", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.exams = {};

  $scope.displayAddExams = function () {
    $scope.error = '';
    $scope.exams = {
      image_url: '/images/exams.png',
      active: true,
      busy: false
    };
    if ($scope.defaultSettings.general_Settings) {
      $scope.exams.school_year = $scope.defaultSettings.general_Settings.school_year
    }

    site.showModal('#examsAddModal');

  };

  $scope.addExams = function () {
    $scope.error = '';
    const v = site.validated('#examsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/exams/add",
      data: $scope.exams
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examsAddModal');
          $scope.getExamsList();
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

  $scope.displayUpdateExams = function (exams) {

    $scope.error = '';
    $scope.viewExams(exams);
    $scope.exams = {};
    site.showModal('#examsUpdateModal');
  };

  $scope.updateExams = function () {
    $scope.error = '';
    const v = site.validated('#examsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/exams/update",
      data: $scope.exams
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examsUpdateModal');
          $scope.getExamsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsExams = function (exams) {
    $scope.error = '';
    $scope.viewExams(exams);
    $scope.exams = {};
    site.showModal('#examsViewModal');
  };

  $scope.viewExams = function (exams) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/exams/view",
      data: {
        id: exams.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.exams = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteExams = function (exams) {
    $scope.error = '';
    $scope.viewExams(exams);
    $scope.exams = {};
    site.showModal('#examsDeleteModal');
  };

  $scope.deleteExams = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/exams/delete",
      data: {
        id: $scope.exams.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#examsDeleteModal');
          $scope.getExamsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getExamsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/exams/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#examsSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSubjects = function () {
    $http({
      method: "POST",
      url: "/api/subjects/all",
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
        $scope.subjectsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "exams"
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

  $scope.getExamsTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.examsTypesList = [];
    $http({
      method: "POST",
      url: "/api/exams_types/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.examsTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.questionsTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.questionsTypesList = [];
    $http({
      method: "POST",
      url: "/api/questions_types/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.questionsTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDegrees = function () {
    $scope.error = '';

    if ($scope.exams.school_grade && $scope.exams.exams_type && $scope.exams.subject) {

      $scope.exams.school_grade.subjects_list.forEach(_sg => {
        if (_sg.subject && _sg.subject.id == $scope.exams.subject.id) {
          if ($scope.exams.exams_type) {

            if ($scope.exams.exams_type.id == 1) {
              $scope.exams.final_grade = _sg.exam_score_month
            } else if ($scope.exams.exams_type.id == 2) {
              $scope.exams.final_grade = _sg.exam_score_midterm

            } else if ($scope.exams.exams_type.id == 3) {
              $scope.exams.final_grade = _sg.exam_score_mid_year

            } else if ($scope.exams.exams_type.id == 4) {
              $scope.exams.final_grade = _sg.exam_score_end_year

            }
          }
        }
      });

      $scope.exams.degree_success = $scope.exams.final_grade / 2;
    }

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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#examsSearchModal');

  };

  $scope.createQuestions = function (option) {
    if ($scope.exams.create_questions && option == 'creat')
      $scope.exams.main_ques_list = $scope.exams.main_ques_list || [{ ques_list: [{}] }];

    if ($scope.exams.create_questions && option == 'add')
      $scope.exams.main_ques_list.push({ ques_list: [{}] });
  };


  $scope.changeMainQuestion = function (c) {
    if (c.question_types.name == 'c_c_a')
      c.ques_list.forEach(_q => {
        _q.choices_list = [{}]
      });

  };

  $scope.markTrueFalse = function (obj, boolean) {

    if (boolean) {
      obj.answer = 'true'
    } else {
      obj.answer = 'false'

    }

  };

  $scope.addQuestion = function (m) {

    if (m.question_types.name == 'c_c_a') {
      m.ques_list.push({ choices_list: [{}] })

    }

  };


  $scope.selectChoice = function (q, i) {
    /*     let foundTrue = q.some(_q => _q.choice.select === true);
     */
    q.choices_list.forEach((_q, _i) => {
      if (_i !== i && _q.choice) {
        _q.choice.select = false
      } else {
        q.answer = _q.choice.name
      }
    });



  };


  $scope.searchAll = function () {
    $scope.getExamsList($scope.search);
    site.hideModal('#examsSearchModal');
    $scope.search = {};

  };

  $scope.getExamsList();
  $scope.getSchoolGrade();
  $scope.loadSchoolYears();
  $scope.getDefaultSettings();
  $scope.getSubjects();
  $scope.getExamsTypes();
  $scope.questionsTypes();
  $scope.getNumberingAuto();
});