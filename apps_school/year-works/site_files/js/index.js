app.controller("year_works", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.year_works = {};

  $scope.displayAddYearWorks = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.year_works = {
      image_url: '/images/year_works.png',
      students_list: [],
      active: true
    };
    if ($scope.defaultSettings.general_Settings) {
      $scope.year_works.school_year = $scope.schoolYearsList.find(_school_year => { return _school_year.id === $scope.defaultSettings.general_Settings.school_year.id });

      $scope.year_works.school_grade = $scope.schoolGradesList.find(_schoolGrade => { return _schoolGrade.id === $scope.defaultSettings.general_Settings.school_grade.id });
      if($scope.year_works.school_grade && $scope.year_works.school_grade.id){

        $scope.getStudentsYearsList($scope.year_works.school_grade);
      }

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
      url: "/api/year_works/add",
      data: $scope.year_works
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

  $scope.displayUpdateYearWorks = function (year_works) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsYearWorks(year_works);
    $scope.year_works = {
      image_url: '/images/vendor_logo.png',

    };
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
      url: "/api/year_works/update",
      data: $scope.year_works
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

  $scope.displayDetailsYearWorks = function (year_works) {
    $scope.error = '';
    $scope.detailsYearWorks(year_works);
    $scope.year_works = {};
    site.showModal('#yearWorksDetailsModal');
  };

  $scope.detailsYearWorks = function (year_works) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/year_works/view",
      data: {
        id: year_works.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.year_works = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteYearWorks = function (year_works) {
    $scope.error = '';
    $scope.detailsYearWorks(year_works);
    $scope.year_works = {};
    site.showModal('#yearWorksDeleteModal');
  };

  $scope.deleteYearWorks = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/year_works/delete",
      data: {
        id: $scope.year_works.id

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
      url: "/api/year_works/all",
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
          school_grade: $scope.year_works.school_grade,
          students_year: $scope.year_works.students_year,
          hall: $scope.year_works.hall,
          active: true
        }

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.year_works.students_list = response.data.list;
          $scope.year_works.students_list.forEach(_student => {
            _student.work_degree_year = $scope.year_works.subject.work_degree_year;
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

  $scope.getSchoolGradesList = function () {
    $http({
      method: "POST",
      url: "/api/school_grades/all",
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
          name: 1,
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


  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "year_works"
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
  $scope.getSchoolGradesList();
  $scope.loadSchoolYears();
  $scope.getDefaultSettings();
  $scope.getHalls();
  $scope.getYearWorksList();

});