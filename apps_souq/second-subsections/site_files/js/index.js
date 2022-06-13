app.controller("second_subsections", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.second_subsections = {};

  $scope.displayAddSecondSubsections = function () {
    $scope.error = '';
    $scope.second_subsections = {
      image_url: '/images/second_subsections.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#secondSubsectionsAddModal');
    
  };

  $scope.addSecondSubsections = function () {
    $scope.error = '';
    const v = site.validated('#secondSubsectionsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/second_subsections/add",
      data: $scope.second_subsections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#secondSubsectionsAddModal');
          $scope.getSecondSubsectionsList();
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

  $scope.displayUpdateSecondSubsections = function (second_subsections) {
    $scope.error = '';
    $scope.viewSecondSubsections(second_subsections);
    $scope.second_subsections = {};
    site.showModal('#secondSubsectionsUpdateModal');
  };

  $scope.updateSecondSubsections = function () {
    $scope.error = '';
    const v = site.validated('#secondSubsectionsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/second_subsections/update",
      data: $scope.second_subsections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#secondSubsectionsUpdateModal');
          $scope.getSecondSubsectionsList();
        } else {
          $scope.error = 'Please Login Second';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsSecondSubsections = function (second_subsections) {
    $scope.error = '';
    $scope.viewSecondSubsections(second_subsections);
    $scope.second_subsections = {};
    site.showModal('#secondSubsectionsViewModal');
  };

  $scope.viewSecondSubsections = function (second_subsections) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/second_subsections/view",
      data: {
        id: second_subsections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.second_subsections = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSecondSubsections = function (second_subsections) {
    $scope.error = '';
    $scope.viewSecondSubsections(second_subsections);
    $scope.second_subsections = {};
    site.showModal('#secondSubsectionsDeleteModal');

  };

  $scope.deleteSecondSubsections = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/second_subsections/delete",
      data: {
        id: $scope.second_subsections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#secondSubsectionsDeleteModal');
          $scope.getSecondSubsectionsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getSecondSubsectionsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/second_subsections/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#secondSubsectionsSearchModal');
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
        screen: "second_subsectionss"
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
    site.showModal('#secondSubsectionsSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getSecondSubsectionsList($scope.search);
    site.hideModal('#secondSubsectionsSearchModal');
    $scope.search = {};

  };

  $scope.getSecondSubsectionsList();
  $scope.getNumberingAuto();
});