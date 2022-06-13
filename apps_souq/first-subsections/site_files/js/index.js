app.controller("first_subsections", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.first_subsections = {};

  $scope.displayAddFirstSubsections = function () {
    $scope.error = '';
    $scope.first_subsections = {
      image_url: '/images/first_subsections.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#firstSubsectionsAddModal');
    
  };

  $scope.addFirstSubsections = function () {
    $scope.error = '';
    const v = site.validated('#firstSubsectionsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/first_subsections/add",
      data: $scope.first_subsections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#firstSubsectionsAddModal');
          $scope.getFirstSubsectionsList();
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

  $scope.displayUpdateFirstSubsections = function (first_subsections) {
    $scope.error = '';
    $scope.viewFirstSubsections(first_subsections);
    $scope.first_subsections = {};
    site.showModal('#firstSubsectionsUpdateModal');
  };

  $scope.updateFirstSubsections = function () {
    $scope.error = '';
    const v = site.validated('#firstSubsectionsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/first_subsections/update",
      data: $scope.first_subsections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#firstSubsectionsUpdateModal');
          $scope.getFirstSubsectionsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsFirstSubsections = function (first_subsections) {
    $scope.error = '';
    $scope.viewFirstSubsections(first_subsections);
    $scope.first_subsections = {};
    site.showModal('#firstSubsectionsViewModal');
  };

  $scope.viewFirstSubsections = function (first_subsections) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/first_subsections/view",
      data: {
        id: first_subsections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.first_subsections = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteFirstSubsections = function (first_subsections) {
    $scope.error = '';
    $scope.viewFirstSubsections(first_subsections);
    $scope.first_subsections = {};
    site.showModal('#firstSubsectionsDeleteModal');

  };

  $scope.deleteFirstSubsections = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/first_subsections/delete",
      data: {
        id: $scope.first_subsections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#firstSubsectionsDeleteModal');
          $scope.getFirstSubsectionsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getFirstSubsectionsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/first_subsections/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#firstSubsectionsSearchModal');
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
        screen: "first_subsectionss"
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
    site.showModal('#firstSubsectionsSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getFirstSubsectionsList($scope.search);
    site.hideModal('#firstSubsectionsSearchModal');
    $scope.search = {};

  };

  $scope.getFirstSubsectionsList();
  $scope.getNumberingAuto();
});