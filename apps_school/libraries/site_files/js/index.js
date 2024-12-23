app.controller("libraries", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.libraries = {};

  $scope.displayAddLibraries = function () {
    $scope.error = '';
    $scope.libraries = {
      image_url: '/images/libraries.png',
      active: true,
      links_list : [{}],
      files_list : [{}],
      images_list : [{}],
      busy: false
    };
    site.showModal('#librariesAddModal');
    document.querySelector('#librariesAddModal .tab-link').click();

  };

  $scope.addLibraries = function () {
    $scope.error = '';
    const v = site.validated('#librariesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/libraries/add",
      data: $scope.libraries
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#librariesAddModal');
          $scope.getLibrariesList();
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

  $scope.displayUpdateLibraries = function (libraries) {

    $scope.error = '';
    $scope.viewLibraries(libraries);
    $scope.libraries = {};
    site.showModal('#librariesUpdateModal');
    document.querySelector('#librariesUpdateModal .tab-link').click();
  };

  $scope.updateLibraries = function () {
    $scope.error = '';
    const v = site.validated('#librariesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/libraries/update",
      data: $scope.libraries
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#librariesUpdateModal');
          $scope.getLibrariesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsLibraries = function (libraries) {
    $scope.error = '';
    $scope.viewLibraries(libraries);
    $scope.libraries = {};
    site.showModal('#librariesViewModal');
  };

  $scope.viewLibraries = function (libraries) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/libraries/view",
      data: {
        id: libraries.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.libraries = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteLibraries = function (libraries) {
    $scope.error = '';
    $scope.viewLibraries(libraries);
    $scope.libraries = {};
    site.showModal('#librariesDeleteModal');
  };

  $scope.deleteLibraries = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/libraries/delete",
      data: {
        id: $scope.libraries.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#librariesDeleteModal');
          $scope.getLibrariesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getLibrariesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/libraries/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#librariesSearchModal');
          $scope.search = {};
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
        screen: "libraries"
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

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#librariesSearchModal');

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

  $scope.searchAll = function () {
    $scope.getLibrariesList($scope.search);
    site.hideModal('#librariesSearchModal');
    $scope.search = {};

  };


  $scope.getLibrariesList();
  $scope.getSchoolGradesList();
  $scope.getNumberingAuto();
});