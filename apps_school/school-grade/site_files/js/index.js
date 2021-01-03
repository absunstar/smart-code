app.controller("school_grade", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.school_grade = {};

  $scope.displayAddSchoolGrade = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.school_grade = {
      image_url: '/images/school_grade.png',
      subjects_list: [{}],
      active: true
    };
    site.showModal('#schoolGradeAddModal');
  };

  $scope.addSchoolGrade = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#schoolGradeAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.school_grade.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/school_grade/add",
      data: $scope.school_grade
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolGradeAddModal');
          $scope.getSchoolGradeList();
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

  $scope.displayUpdateSchoolGrade = function (school_grade) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsSchoolGrade(school_grade);
    $scope.school_grade = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#schoolGradeUpdateModal');
  };

  $scope.updateSchoolGrade = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#schoolGradeUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.school_grade.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/school_grade/update",
      data: $scope.school_grade
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolGradeUpdateModal');
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

  $scope.displayDetailsSchoolGrade = function (school_grade) {
    $scope.error = '';
    $scope.detailsSchoolGrade(school_grade);
    $scope.school_grade = {};
    site.showModal('#schoolGradeDetailsModal');
  };

  $scope.detailsSchoolGrade = function (school_grade) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_grade/view",
      data: {
        id: school_grade.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.school_grade = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSchoolGrade = function (school_grade) {
    $scope.error = '';
    $scope.detailsSchoolGrade(school_grade);
    $scope.school_grade = {};
    site.showModal('#schoolGradeDeleteModal');
  };

  $scope.deleteSchoolGrade = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_grade/delete",
      data: {
        id: $scope.school_grade.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolGradeDeleteModal');
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

  $scope.getSchoolGradeList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/school_grade/all",
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
    $scope.getSchoolGradeList($scope.search);
    site.hideModal('#schoolGradeSearchModal');
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
        screen: "school_grade"
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
  $scope.getSchoolGradeList();

});