app.controller("exams", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.exams = {};
  $scope.displayAddExams = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.exams = {
          image_url: '/images/exams.png',
          shift: shift,
          active: true,
          busy: false
        };
        if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.school_grade) {

          if ($scope.exams.school_grade && $scope.exams.school_grade.id) {

            $scope.exams.school_grade = $scope.schoolGradesList.find(_schoolGrade => { return _schoolGrade.id === $scope.defaultSettings.general_Settings.school_grade.id });

            $scope.getStudentsYearsList($scope.exams.school_grade);
          }

        }

        site.showModal('#examsAddModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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
            $scope.error = "##word.must_enter_code##";

          } else if (response.data.error.like('*student grade are greater than the final*')) {
            $scope.error = `##word.student_scores_not_equal_final_score##   ( ${response.data.error_list.join('-')} )`;

          } else if (response.data.error.like('*student score is greater than the question*')) {
            $scope.error = `##word.student_scores_not_equal_question_score##   ( ${response.data.error_list.join('-')} )`;

          } else if (response.data.error.like('*passing score is greater than the final*')) {
            $scope.error = '##word.passing_score_greater_final_grade##';

          } else if (response.data.error.like('*sum of the scores does not equal the final*')) {
            $scope.error = '##word.sum_scores_not_equal_final_score##';

          } else if (response.data.error.like('*sum of the scores does not equal the final all*')) {
            $scope.error = `##word.sum_scores_not_equal_final_score##   ( ${response.data.error_list.join('-')} )`;

          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateExams = function (exams) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewExams(exams);
        $scope.exams = {};
        site.showModal('#examsUpdateModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.viewExams(exams);
        $scope.exams = {};
        site.showModal('#examsDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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
          name_ar: 1, name_en: 1,
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

    if ($scope.exams.students_year && $scope.exams.exams_type && $scope.exams.subject) {

      $scope.exams.students_year.subjects_list.forEach(_sg => {
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
          name_ar: 1, name_en: 1,
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
            students_year: $scope.exams.students_year,
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


  $scope.updateExamsStudent = function (exams, type) {

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';

        if (type === 'correct') {

          const v = site.validated('#examDetailesModal');
          if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
          };

        } else if (type === 'update') {

          const v = site.validated('#examsUpdateModal');
          if (!v.ok) {
            $scope.error = v.messages[0].ar;
            return;
          };

        }
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/exams/update",
          data: {
            data: exams,
            type: type,
            stuList: $scope.studentsList

          }
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              if (type === 'finish') {
                site.hideModal('#acceptFinishExamModal');
                site.hideModal('#startExamModal');

                $scope.getExamsList();

              } else if (type === 'correct') {
                site.hideModal('#examDetailesModal');

              } else if (type === 'update') {
                site.hideModal('#examsUpdateModal');
                $scope.getExamsList();

              } else if (type === 'start' || type === 'time') {
                let finish_exam = false;
                $scope.exams = response.data.doc;

                $scope.exams.students_list.forEach(_s => {
                  if (_s.id == '##user.ref_info.id##') {
                    $scope.student_exams = _s;
                    found = true;

                    if (_s.exam.exam_procedure) {
                      finish_exam = true;

                    } else {
                      $scope.timer();

                    }
                  }

                });

                if (finish_exam) {

                  site.hideModal('#startExamModal');
                  $scope.getExamsList();
                  $scope.error = '##word.You_have_already_taken_test##';

                  return;
                }
                /*  $scope.seconds = 0;
                 $scope.timerSecounds(); */
                site.showModal('#startExamModal');

              }

            } else {
              $scope.error = 'Please Login First';
              if (response.data.error.like('*Must Enter Code*')) {
                $scope.error = "##word.must_enter_code##"

              } else if (response.data.error.like('*student grade are greater than the final*')) {
                $scope.error = `##word.student_scores_not_equal_final_score##   ( ${response.data.error_list.join('-')} )`;

              } else if (response.data.error.like('*student score is greater than the question*')) {
                $scope.error = `##word.student_scores_not_equal_question_score##   ( ${response.data.error_list.join('-')} )`;

              } else if (response.data.error.like('*passing score is greater than the final*')) {
                $scope.error = '##word.passing_score_greater_final_grade##';

              } else if (response.data.error.like('*sum of the scores does not equal the final*')) {
                $scope.error = '##word.sum_scores_not_equal_final_score##';

              } else if (response.data.error.like('*sum of the scores does not equal the final all*')) {
                $scope.error = `##word.sum_scores_not_equal_final_score##   ( ${response.data.error_list.join('-')} )`;

              } else if (response.data.error.like('*cannot enter because you are not registered*')) {
                $scope.error = '##word.cant_enter_exam##';

              } else if (response.data.error.like('*test has already been performed*')) {
                $scope.error = '##word.You_have_already_taken_test##';

              } else if (response.data.error.like('*exam time has expired*')) {
                $scope.error = '##word.exam_time_expired##';

              }

            }
          },
          function (err) {
            console.log(err);
          }
        )
      } else $scope.error = '##word.open_shift_not_found##';
    });
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

      if ($scope.student_exams.exam.time_minutes > 1) {
        $scope.updateExamsStudent($scope.exams, 'time');

      } else {
        $scope.updateExamsStudent($scope.exams, 'finish');

      }

    }, 1000 * 60);

  };

  /*  $scope.timerSecounds = function () {
     $timeout(() => {
 
       if ($scope.seconds === 0 && $scope.student_exams.exam.time_minutes > 0) {
         $scope.seconds = 59;
         $scope.timerSecounds();
       } else if ($scope.seconds > 0) {
         $scope.seconds = $scope.seconds - 1;
         $scope.timerSecounds();
       }
 
     }, 1000);
 
   }; */

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

    $scope.get_open_shift((shift) => {
      if (shift) {

        if (student_exams.exam.time_minutes === 0) {
          site.hideModal('#startExamModal');
          return;
        };

        $scope.main_ques_list = [];
        student_exams.exam.main_ques_list.forEach((_main, i) => {
          _main.ques_list.forEach((_ques, _i) => {
            if (_ques.answer_stu && _ques.answer_stu.name) {

            } else {

              let found = $scope.main_ques_list.some(_m => _m.indx === i);

              if (!found) {

                $scope.main_ques_list.push({
                  question: _main.title_question,
                  indx: i,
                  ques_list: [{ question: _ques.question, indx: _i }]
                })

              } else {
                $scope.main_ques_list.forEach(_q => {
                  if (_q.indx === i) {
                    _q.ques_list.push({ question: _ques.question, indx: _i })
                  }
                });
              }
            }
          });

        });

        if ($scope.main_ques_list && $scope.main_ques_list.length > 0) {
          site.showModal('#acceptFinishExamModal');
        } else {

          $scope.updateExamsStudent($scope.exams, 'finish');
        }
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.getSchoolGradesList = function () {
    $http({
      method: "POST",
      url: "/api/school_grades/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
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
          name_ar: 1, name_en: 1,
          types_expenses_list: 1,
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

  $scope.searchAll = function () {
    $scope.getExamsList($scope.search);
    site.hideModal('#examsSearchModal');
    $scope.search = {};

  };



  $scope.getExamsList();
  $scope.getSchoolGradesList();
  $scope.getDefaultSettings();
  $scope.getStudentList();
  $scope.getHalls();
  $scope.getSubjects();
  $scope.getExamsTypes();
  $scope.questionsTypes();
  $scope.availabilityExam();
  $scope.getNumberingAuto();
});