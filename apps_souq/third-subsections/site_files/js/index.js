app.controller("third_subsections", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.third_subsections = {};

  $scope.displayAddThirdSubsections = function () {
    $scope.error = '';
    $scope.third_subsections = {
      image_url: '/images/third_subsections.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#thirdSubsectionsAddModal');
    
  };

  $scope.addThirdSubsections = function () {
    $scope.error = '';
    const v = site.validated('#thirdSubsectionsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/third_subsections/add",
      data: $scope.third_subsections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#thirdSubsectionsAddModal');
          $scope.getThirdSubsectionsList();
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

  $scope.displayUpdateThirdSubsections = function (third_subsections) {
    $scope.error = '';
    $scope.viewThirdSubsections(third_subsections);
    $scope.third_subsections = {};
    site.showModal('#thirdSubsectionsUpdateModal');
  };

  $scope.updateThirdSubsections = function () {
    $scope.error = '';
    const v = site.validated('#thirdSubsectionsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/third_subsections/update",
      data: $scope.third_subsections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#thirdSubsectionsUpdateModal');
          $scope.getThirdSubsectionsList();
        } else {
          $scope.error = 'Please Login Third';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsThirdSubsections = function (third_subsections) {
    $scope.error = '';
    $scope.viewThirdSubsections(third_subsections);
    $scope.third_subsections = {};
    site.showModal('#thirdSubsectionsViewModal');
  };

  $scope.viewThirdSubsections = function (third_subsections) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/third_subsections/view",
      data: {
        id: third_subsections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.third_subsections = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteThirdSubsections = function (third_subsections) {
    $scope.error = '';
    $scope.viewThirdSubsections(third_subsections);
    $scope.third_subsections = {};
    site.showModal('#thirdSubsectionsDeleteModal');

  };

  $scope.deleteThirdSubsections = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/third_subsections/delete",
      data: {
        id: $scope.third_subsections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#thirdSubsectionsDeleteModal');
          $scope.getThirdSubsectionsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getThirdSubsectionsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/third_subsections/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#thirdSubsectionsSearchModal');
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
        screen: "third_subsectionss"
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
    site.showModal('#thirdSubsectionsSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getThirdSubsectionsList($scope.search);
    site.hideModal('#thirdSubsectionsSearchModal');
    $scope.search = {};

  };

  $scope.getThirdSubsectionsList();
  $scope.getNumberingAuto();
});