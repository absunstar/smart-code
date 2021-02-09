app.controller("analyses", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.analyses = {};

  $scope.displayAddAnalyses = function () {
    $scope.error = '';
    $scope.analyses = {
      image_url: '/images/analyses.png',
      active: true,
      immediate : false

    };
    site.showModal('#analysesAddModal');

  };

  $scope.addAnalyses = function () {
    $scope.error = '';
    const v = site.validated('#analysesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analyses/add",
      data: $scope.analyses
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#analysesAddModal');
          $scope.getAnalysisList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateAnalyses = function (analyses) {
    $scope.error = '';
    $scope.viewAnalyses(analyses);
    $scope.analyses = {};
    site.showModal('#analysesUpdateModal');
  };

  $scope.updateAnalyses = function () {
    $scope.error = '';
    const v = site.validated('#analysesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analyses/update",
      data: $scope.analyses
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#analysesUpdateModal');
          $scope.getAnalysisList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAnalyses = function (analyses) {
    $scope.error = '';
    $scope.viewAnalyses(analyses);
    $scope.analyses = {};
    site.showModal('#analysesDeleteModal');
  };

  $scope.deleteAnalyses = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/analyses/delete",
      data: {
        id: $scope.analyses.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#analysesDeleteModal');
          $scope.getAnalysisList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsAnalyses = function (analyses) {
    $scope.error = '';
    $scope.viewAnalyses(analyses);
    $scope.analyses = {};
    site.showModal('#analysesViewModal');
  };

  $scope.viewAnalyses = function (analyses) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/analyses/view",
      data: {
        id: analyses.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.analyses = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAnalysisList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/analyses/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#analysesSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getPeriod = function () {
    $scope.busy = true;
    $scope.periodList = [];
    $http({
      method: "POST",
      url: "/api/period_analyses/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.periodList = response.data;
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
        screen: "analyses"
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
    site.showModal('#analysesSearchModal');

  };
  
  $scope.searchAll = function () {
  
    $scope.getanalysisList($scope.search);
    site.hideModal('#analysesSearchModal');
    $scope.search = {};
  };

  $scope.getAnalysisList();
  $scope.getNumberingAuto();
  $scope.getPeriod();
});