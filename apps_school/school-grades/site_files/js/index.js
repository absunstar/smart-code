app.controller("school_grades", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.school_grades = {};

  $scope.displayAddSchoolGrades = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.school_grades = {
      image_url: '/images/school_grades.png',
      subjects_list: [{}],
      active: true
    };
    site.showModal('#schoolGradesAddModal');
  };

  $scope.addSchoolGrades = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#schoolGradesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.school_grades.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/school_grades/add",
      data: $scope.school_grades
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolGradesAddModal');
          $scope.getSchoolGradesList();
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

  $scope.displayUpdateSchoolGrades = function (school_grades) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsSchoolGrades(school_grades);
    $scope.school_grades = {};
    site.showModal('#schoolGradesUpdateModal');
  };

  $scope.updateSchoolGrades = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#schoolGradesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.school_grades.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/school_grades/update",
      data: $scope.school_grades
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolGradesUpdateModal');
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

  $scope.displayDetailsSchoolGrades = function (school_grades) {
    $scope.error = '';
    $scope.detailsSchoolGrades(school_grades);
    $scope.school_grades = {};
    site.showModal('#schoolGradesDetailsModal');
  };

  $scope.detailsSchoolGrades = function (school_grades) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_grades/view",
      data: {
        id: school_grades.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.school_grades = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSchoolGrades = function (school_grades) {
    $scope.error = '';
    $scope.detailsSchoolGrades(school_grades);
    $scope.school_grades = {};
    site.showModal('#schoolGradesDeleteModal');
  };

  $scope.deleteSchoolGrades = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_grades/delete",
      data: {
        id: $scope.school_grades.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolGradesDeleteModal');
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

  $scope.getSchoolGradesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/school_grades/all",
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
    $scope.getSchoolGradesList($scope.search);
    site.hideModal('#schoolGradesSearchModal');
    $scope.search = {}

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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "school_grades"
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
  $scope.getSubjects();
  $scope.getSchoolGradesList();

});