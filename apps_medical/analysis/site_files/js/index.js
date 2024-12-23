app.controller("analysis", function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.analysis = {};

  $scope.displayAddAnalysis = function () {
    $scope.error = "";
    $scope.analysis = {
      image_url: "/images/analysis.png",
      active: true,
      male: { from: 0, to: 0 },
      female: { from: 0, to: 0 },
      child: { from: 0, to: 0 },
      price: 0,
      immediate: false,
      made_home_analysis : false,
    };
    site.showModal("#analysisAddModal");
  };

  $scope.addAnalysis = function () {
    $scope.error = "";
    const v = site.validated("#analysisAddModal");
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analysis/add",
      data: $scope.analysis,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#analysisAddModal");
          $scope.getAnalysisList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayUpdateAnalysis = function (analysis) {
    $scope.error = "";
    $scope.viewAnalysis(analysis);
    $scope.analysis = {};
    site.showModal("#analysisUpdateModal");
  };

  $scope.updateAnalysis = function () {
    $scope.error = "";
    const v = site.validated("#analysisUpdateModal");
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/analysis/update",
      data: $scope.analysis,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#analysisUpdateModal");
          $scope.getAnalysisList();
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDeleteAnalysis = function (analysis) {
    $scope.error = "";
    $scope.viewAnalysis(analysis);
    $scope.analysis = {};
    site.showModal("#analysisDeleteModal");
  };

  $scope.deleteAnalysis = function () {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: "/api/analysis/delete",
      data: {
        id: $scope.analysis.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#analysisDeleteModal");
          $scope.getAnalysisList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayDetailsAnalysis = function (analysis) {
    $scope.error = "";
    $scope.viewAnalysis(analysis);
    $scope.analysis = {};
    site.showModal("#analysisViewModal");
  };

  $scope.viewAnalysis = function (analysis) {
    $scope.busy = true;
    $scope.error = "";
    $http({
      method: "POST",
      url: "/api/analysis/view",
      data: {
        id: analysis.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.analysis = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getAnalysisList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/analysis/all",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal("#analysisSearchModal");
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getPeriod = function () {
    $scope.busy = true;
    $scope.periodList = [];
    $http({
      method: "POST",
      url: "/api/period_analysis/all",
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.periodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "analysis",
      },
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
    );
  };

  $scope.displaySearchModal = function () {
    $scope.error = "";
    site.showModal("#analysisSearchModal");
  };

  $scope.searchAll = function () {
    $scope.getanalysisList($scope.search);
    site.hideModal("#analysisSearchModal");
    $scope.search = {};
  };

  $scope.getAnalysisList();
  $scope.getNumberingAuto();
  $scope.getPeriod();
});
