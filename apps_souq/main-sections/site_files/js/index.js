app.controller("main_sections", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.main_sections = {};

  $scope.displayAddMainSections = function () {
    $scope.error = '';
    $scope.main_sections = {
      image_url: '/images/main_sections.png',
      active: true/* ,
      immediate : false */
    };
    site.showModal('#mainSectionsAddModal');
    
  };

  $scope.addMainSections = function () {
    $scope.error = '';
    const v = site.validated('#mainSectionsAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/main_sections/add",
      data: $scope.main_sections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainSectionsAddModal');
          $scope.getMainSectionsList();
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

  $scope.displayUpdateMainSections = function (main_sections) {
    $scope.error = '';
    $scope.viewMainSections(main_sections);
    $scope.main_sections = {};
    site.showModal('#mainSectionsUpdateModal');
  };

  $scope.updateMainSections = function () {
    $scope.error = '';
    const v = site.validated('#mainSectionsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/main_sections/update",
      data: $scope.main_sections
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainSectionsUpdateModal');
          $scope.getMainSectionsList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsMainSections = function (main_sections) {
    $scope.error = '';
    $scope.viewMainSections(main_sections);
    $scope.main_sections = {};
    site.showModal('#mainSectionsViewModal');
  };

  $scope.viewMainSections = function (main_sections) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/main_sections/view",
      data: {
        id: main_sections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.main_sections = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteMainSections = function (main_sections) {
    $scope.error = '';
    $scope.viewMainSections(main_sections);
    $scope.main_sections = {};
    site.showModal('#mainSectionsDeleteModal');

  };

  $scope.deleteMainSections = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/main_sections/delete",
      data: {
        id: $scope.main_sections.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#mainSectionsDeleteModal');
          $scope.getMainSectionsList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getMainSectionsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/main_sections/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#mainSectionsSearchModal');
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
        screen: "main_sectionss"
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
    site.showModal('#mainSectionsSearchModal');

  };

  $scope.searchAll = function () { 
    $scope.getMainSectionsList($scope.search);
    site.hideModal('#mainSectionsSearchModal');
    $scope.search = {};

  };

  $scope.getMainSectionsList();
  $scope.getNumberingAuto();
});