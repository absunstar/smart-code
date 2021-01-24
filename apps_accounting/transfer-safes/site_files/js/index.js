app.controller("school_years", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.school_years = {};

  $scope.displayAddSchoolYears = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.school_years = {
      image_url: '/images/school_years.png',
      subjects_list: [{}],
      active: true
    };
    site.showModal('#schoolYearsAddModal');
  };

  $scope.addSchoolYears = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#schoolYearsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.school_years.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/school_years/add",
      data: $scope.school_years
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolYearsAddModal');
          $scope.getSchoolYearsList();
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

  $scope.displayUpdateSchoolYears = function (school_years) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsSchoolYears(school_years);
    $scope.school_years = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#schoolYearsUpdateModal');
  };

  $scope.updateSchoolYears = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#schoolYearsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.school_years.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/school_years/update",
      data: $scope.school_years
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolYearsUpdateModal');
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

  $scope.displayDetailsSchoolYears = function (school_years) {
    $scope.error = '';
    $scope.detailsSchoolYears(school_years);
    $scope.school_years = {};
    site.showModal('#schoolYearsDetailsModal');
  };

  $scope.detailsSchoolYears = function (school_years) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_years/view",
      data: {
        id: school_years.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.school_years = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSchoolYears = function (school_years) {
    $scope.error = '';
    $scope.detailsSchoolYears(school_years);
    $scope.school_years = {};
    site.showModal('#schoolYearsDeleteModal');
  };

  $scope.deleteSchoolYears = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/school_years/delete",
      data: {
        id: $scope.school_years.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#schoolYearsDeleteModal');
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

  $scope.getSchoolYearsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/school_years/all",
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
    $scope.getSchoolYearsList($scope.search);
    site.hideModal('#schoolYearsSearchModal');
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
        screen: "school_years"
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
  $scope.getSchoolYearsList();

});