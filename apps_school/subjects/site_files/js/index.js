app.controller("subjects", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.subjects = {};

  $scope.displayAddSubjects = function () {
    $scope.error = '';
    $scope.subjects = {
      image_url: '/images/subjects.png',
      active: true,
      busy: false
    };
    site.showModal('#subjectsAddModal');

  };

  $scope.addSubjects = function () {
    $scope.error = '';
    const v = site.validated('#subjectsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/subjects/add",
      data: $scope.subjects
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subjectsAddModal');
          $scope.getSubjectsList();
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

  $scope.displayUpdateSubjects = function (subjects) {

    $scope.error = '';
    $scope.viewSubjects(subjects);
    $scope.subjects = {};
    site.showModal('#subjectsUpdateModal');
  };

  $scope.updateSubjects = function () {
    $scope.error = '';
    const v = site.validated('#subjectsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/subjects/update",
      data: $scope.subjects
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subjectsUpdateModal');
          $scope.getSubjectsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsSubjects = function (subjects) {
    $scope.error = '';
    $scope.viewSubjects(subjects);
    $scope.subjects = {};
    site.showModal('#subjectsViewModal');
  };

  $scope.viewSubjects = function (subjects) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/subjects/view",
      data: {
        id: subjects.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.subjects = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSubjects = function (subjects) {
    $scope.error = '';
    $scope.viewSubjects(subjects);
    $scope.subjects = {};
    site.showModal('#subjectsDeleteModal');
  };

  $scope.deleteSubjects = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/subjects/delete",
      data: {
        id: $scope.subjects.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#subjectsDeleteModal');
          $scope.getSubjectsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.getSubjectsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/subjects/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#subjectsSearchModal');
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
        screen: "subjects"
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
    site.showModal('#subjectsSearchModal');

  };

  $scope.searchAll = function () {
    $scope.getSubjectsList($scope.search);
    site.hideModal('#subjectsSearchModal');
    $scope.search = {};

  };
  $scope.getSubjectsList();
  $scope.getNumberingAuto();
});