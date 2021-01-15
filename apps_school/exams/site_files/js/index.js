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

    if ($scope.exams.degree_success >= $scope.exams.final_grade) {
      $scope.error = "##word.passing_score_greater_final_grade##";
      return;

    }

    let degree_m = 0;
    let alot = false;
    let notEqualList = [];

    $scope.exams.main_ques_list = $scope.exams.main_ques_list || [];
    $scope.exams.main_ques_list.forEach(_m_q => {
      degree_m += _m_q.degree;
      let degree_q = 0;
      _m_q.ques_list = _m_q.ques_list || [];

      _m_q.ques_list.forEach(_q_c => {
        degree_q += _q_c.degree;
      });

      if (_m_q.degree !== degree_q) {
        notEqualList.push(_m_q.title_question);
        alot = true;
      }

    });


    if (degree_m !== $scope.exams.final_grade && $scope.exams.create_questions) {
      $scope.error = "##word.sum_scores_not_equal_final_score##";
      return;

    } else if (alot && $scope.exams.create_questions) {

      $scope.error = `##word.sum_scores_not_equal_final_score##   ( ${notEqualList.join('-')} )`;
      return;
    }

    $scope.exams.students_list = $scope.exams.students_list || [];
    if ($scope.exams.availability_exam.id == 2) {
      $scope.exams.students_list.forEach(_sL => {
        _sL.exam = Object.assign({}, $scope.exams);
        _sL.exam_procedure = false;
        _sL.exam.students_list = [];
      });
    }

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

  $scope.updateExams = function (exams) {
    $scope.error = '';
    const v = site.validated('#examsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if (exams.degree_success >= exams.final_grade) {
      $scope.error = "##word.passing_score_greater_final_grade##";
      return;

    }

    let degree_m = 0;
    let alot = false;
    let notEqualList = [];

    exams.main_ques_list = exams.main_ques_list || [];
    exams.main_ques_list.forEach(_m_q => {
      degree_m += _m_q.degree;
      let degree_q = 0;
      _m_q.ques_list = _m_q.ques_list || [];

      _m_q.ques_list.forEach(_q_c => {
        degree_q += _q_c.degree;
      });

      if (_m_q.degree !== degree_q) {
        notEqualList.push(_m_q.title_question);
        alot = true;
      }

    });

    if (degree_m !== exams.final_grade && exams.create_questions) {
      $scope.error = "##word.sum_scores_not_equal_final_score##";
      return;

    } else if (alot && exams.create_questions) {

      $scope.error = `##word.sum_scores_not_equal_final_score##   ( ${notEqualList.join('-')} )`;
      return;
    }
    exams.students_list = exams.students_list || [];

    if (exams.availability_exam.id == 2) {
      exams.students_list.forEach(_sL => {
        _sL.exam = Object.assign({}, exams);
        _sL.exam_procedure = false;
        _sL.exam.students_list = [];
      });
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/exams/update",
      data: exams
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
    $scope.viewExams(exams, 'view');
    $scope.exams = {};
    site.showModal('#examsViewModal');
  };

  $scope.viewExams = function (exams, view) {
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
          if (view == 'view') $scope.exams.$view = true;
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

  $scope.availabilityExam = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.availabilityExamList = [];
    $http({
      method: "POST",
      url: "/api/availability_exam/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.availabilityExamList = response.data;
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

  $scope.createQuestions = function (option, i) {
    if ($scope.exams.create_questions && option == 'creat')
      $scope.exams.main_ques_list = [{ ques_list: [{}] }];

    else if ($scope.exams.create_questions && option == 'add') {
      let _i = i + 1;

      $scope.exams.main_ques_list.splice(_i, 0, { ques_list: [{}] });

    }

    else $scope.exams.main_ques_list = [];

  };


  $scope.changeMainQuestion = function (c) {
    if (c.question_types.name == 'c_c_a')
      c.ques_list.forEach(_q => {
        _q.choices_list = [{}]
      });

  };

  $scope.markTrueFalse = function (obj, boolean, option) {
    obj.answer = obj.answer || {};

    if (option == 'add') {

      if (boolean) {
        obj.answer.boolean = 'true';
        obj.answer.name = '##session.lang##' == 'ar' ? 'صح' : 'True';

      } else {
        obj.answer.boolean = 'false';
        obj.answer.name = '##session.lang##' == 'ar' ? 'خطأ' : 'False';
      }

    } else if (option == 'answer') {

      obj.answer_stu = obj.answer_stu || {};

      if (boolean) {
        obj.answer_stu.boolean = 'true';
        obj.answer_stu.name = '##session.lang##' == 'ar' ? 'صح' : 'True';
      } else {
        obj.answer_stu.boolean = 'false';
        obj.answer_stu.name = '##session.lang##' == 'ar' ? 'خطأ' : 'False';
      }

    }

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

  $scope.getStudentList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.studentsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchStudents = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev === 'searchAll' || ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer,
          where: {
            school_grade: $scope.exams.school_grade,
            hall: $scope.exams.hall,
            active: true
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {

            if (ev === 'searchAll') {
              $scope.exams.students_list = response.data.list;
            } else if (ev.which === 13) {
              $scope.customersList = response.data.list;
            }

          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.selectStudent = function (c) {
    let found = false;
    if ($scope.exams.students_list && $scope.exams.students_list.length > 0) {
      found = $scope.exams.students_list.some(_al => c.id == _al.id);
    } else {
      $scope.exams.students_list = []
    }

    if (!found)
      $scope.exams.students_list.push(c);

    $scope.search_customer = '';
    $scope.customer = {};
  };

  $scope.addQuestion = function (m, i) {
    let _i = i + 1;
    if (m.question_types.name == 'c_c_a') {
      m.ques_list.splice(_i, 0, { choices_list: [{}] });
    } else if (m.question_types.name == 'm_t_f' || m.question_types.name == 'a_f_q') {
      m.ques_list.splice(_i, 0, {});

    }
  };


  $scope.selectChoice = function (q, i, option) {
    q.answer = q.answer || {};
    q.answer_stu = q.answer_stu || {};

    if (option == 'add') {

      q.choices_list.forEach((_q, _i) => {

        if (_i !== i) {
          _q.boolean = false;
        } else {
          q.answer.name = _q.name;
          q.answer.indx = i;
        }
      });

    } else if (option == 'answer') {

      q.choices_list.forEach((_q, _i) => {
        _q.answer_stu = _q.answer_stu || {};
        if (_i !== i) {
          _q.answer_stu.boolean = false

        } else {
          q.answer_stu.name = _q.name;
          q.answer_stu.indx = i;

        }

      });
    }

  };

  $scope.examStarted = function (c) {
    $scope.error = '';
    $scope.exams = c;
    $scope.exams.students_list = $scope.exams.students_list || [];
    /*   let found_student = false;
        $scope.exams.students_list.forEach(_student => {
          if ('##user.ref_info.id##' == _student.id && '##user.type##' == 'customer') {
            found_student = true;
          }
        }); */



    if ($scope.exams.availability_exam.id == 1) {
      let student = $scope.studentsList.find(_stu => { return _stu.id == '##user.ref_info.id##' });

      let found_student = $scope.exams.students_list.some(_student => '##user.ref_info.id##' == _student.id);

      if (!found_student) $scope.exams.students_list.push(student);

    } else if ($scope.exams.availability_exam.id == 2) {

    }

    let found = false;
    let finish_exam = false;
    $scope.exams.students_list.forEach(_s => {
      if (_s.id == '##user.ref_info.id##') {
        $scope.student_exams = _s;
        found = true;
        if (_s.exam_procedure) finish_exam = true;
      }

    });

    if (!found) {
      $scope.error = '##word.cant_enter_exam##';
      return;
    };

    if (finish_exam) {
      $scope.error = '##word.You_have_already_taken_test##';
      return;
    };

    $scope.exams.time = {
      minutes: $scope.exams.exam_time,
      seconds: 0
    };


    $scope.timer();
    site.showModal('#startExamModal');
  };



  $scope.updateExamsStudent = function (exams, type) {
    $scope.error = '';

    if (type == 'time' || type == 'start') {

      exams.students_list.forEach(_stu => {
        if (_stu.id == '##user.ref_info.id##')
          _stu.exam_procedure = true
      });
    }

    if (type === 'correct') {

      const v = site.validated('#examDetailesModal');

      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      };


      let alot_main = false;
      let alot_ques = false;
      let alot_mai_list = [];
      let alot_ques_list = [];
      exams.exam.main_ques_list.forEach(_m_q => {
        if (_m_q.student_degree > _m_q.degree) {
          alot_main = true;
          alot_mai_list.push(_m_q.title_question);

        }


        _m_q.ques_list.forEach(_q_c => {
          if (_q_c.student_degree > _q_c.degree) {
            alot_ques = true;
            alot_ques_list.push(_m_q.title_question);

          }
        });

      });

      if (alot_main && $scope.exams.create_questions) {

        $scope.error = `##word.student_scores_not_equal_final_score##   ( ${alot_mai_list.join('-')} )`;
        return;
      } else if (alot_ques && $scope.exams.create_questions) {

        $scope.error = `##word.student_scores_not_equal_question_score##   ( ${alot_ques_list.join('-')} )`;
        return;
      }
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
          if (type === 'start')
            site.hideModal('#startExamModal');

          else if (type === 'correct')
            site.hideModal('#examDetailesModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.calc = function (obj) {
    $scope.error = '';
    $timeout(() => {
      obj.total_scores = 0;
      obj.exam.main_ques_list.forEach(_main => {
        _main.student_degree = 0;
        _main.ques_list.forEach(_ques => {
          obj.total_scores += (_ques.student_degree || 0);
          _main.student_degree += (_ques.student_degree || 0);

        });
      });
      obj.student_degree = (obj.total_scores || 0) + (obj.additional_degrees || 0);
    }, 200);
  };



  $scope.timer = function () {
    $timeout(() => {

      if ($scope.exams.time.seconds == 0 && $scope.exams.time.minutes > 0) {
        $scope.exams.time.minutes--;
        $scope.exams.time.seconds = 59;
        $scope.timer();
      } else if ($scope.exams.time.seconds > 0) {
        $scope.exams.time.seconds--;
        $scope.timer();
      } else {
        $scope.updateExamsStudent($scope.exams, 'time');

      }
    }, 1000);
    $scope.exams.real_time = ($scope.exams.time.minutes + ':' + $scope.exams.time.seconds);

  };

  $scope.examDetails = function (student_exams, type) {

    $scope.student_exams = student_exams;
    if (type == 'correct') {
      $scope.student_exams.$correct = true;
    } else if (type == 'view') {
      $scope.student_exams.$correct = false;
    }
    site.showModal('#examDetailesModal');

  };



  $scope.acceptFinishExam = function (student_exams) {

    $scope.main_ques_list = [];
    student_exams.exam.main_ques_list.forEach((_main, i) => {
      _main.ques_list.forEach((_ques,_i) => {
        if (_ques.answer_stu && _ques.answer_stu.name) {

        } else {

          let found = $scope.main_ques_list.some(_m => _m.indx === i);

          if (!found) {

            $scope.main_ques_list.push({
              question: _main.title_question,
              indx: i,
              ques_list: [{question: _ques.question, indx : _i}]
            })

          } else {
            $scope.main_ques_list.forEach(_q => {
                if(_q.indx === i){
                  _q.ques_list.push({question: _ques.question, indx : _i})
                }
            });
          }
        }
      });

    });

    if($scope.main_ques_list && $scope.main_ques_list.length > 0){ 
      site.showModal('#acceptFinishExamModal');
    } else {
      $scope.updateExamsStudent($scope.exams,'start');
    }

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
  $scope.getStudentList();
  $scope.getHalls();
  $scope.getSubjects();
  $scope.getExamsTypes();
  $scope.questionsTypes();
  $scope.availabilityExam();
  $scope.getNumberingAuto();
});