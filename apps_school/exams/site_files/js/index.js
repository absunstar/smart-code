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


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#examsSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getExamsList($scope.search);
    site.hideModal('#examsSearchModal');
    $scope.search = {};

  };

  $scope.getExamsList();
  $scope.getSchoolGrade();
  $scope.getSubjects();
  $scope.getExamsTypes();
  $scope.getNumberingAuto();
});