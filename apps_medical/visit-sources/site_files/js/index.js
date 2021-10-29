app.controller("visit_sources", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.visit_sources = {};

  $scope.displayAddVisitSources = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.visit_sources = {
      image_url: '/images/visit_sources.png',
      active: true
    };
    site.showModal('#visitSourcesAddModal');
  };

  $scope.addVisitSources = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#visitSourcesAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/visit_sources/add",
      data: $scope.visit_sources
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#visitSourcesAddModal');
          $scope.getVisitSourcesList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateVisitSources = function (visit_sources) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsVisitSources(visit_sources);
    $scope.visit_sources = {};
    site.showModal('#visitSourcesUpdateModal');
  };

  $scope.updateVisitSources = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#visitSourcesUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/visit_sources/update",
      data: $scope.visit_sources
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#visitSourcesUpdateModal');
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

  $scope.displayDetailsVisitSources = function (visit_sources) {
    $scope.error = '';
    $scope.detailsVisitSources(visit_sources);
    $scope.visit_sources = {};
    site.showModal('#visitSourcesDetailsModal');
  };

  $scope.detailsVisitSources = function (visit_sources) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/visit_sources/view",
      data: {
        id: visit_sources.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.visit_sources = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteVisitSources = function (visit_sources) {
    $scope.error = '';
    $scope.detailsVisitSources(visit_sources);
    $scope.visit_sources = {};
    site.showModal('#visitSourcesDeleteModal');
  };

  $scope.deleteVisitSources = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/visit_sources/delete",
      data: {
        id: $scope.visit_sources.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#visitSourcesDeleteModal');
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

  $scope.getVisitSourcesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/visit_sources/all",
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
    $scope.getVisitSourcesList($scope.search);
    site.hideModal('#visitSourcesSearchModal');
    $scope.search = {}

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "visit_sources"
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
  $scope.getVisitSourcesList();

});