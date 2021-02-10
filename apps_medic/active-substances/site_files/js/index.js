app.controller("active_substances", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.active_substances = {};

  $scope.displayAddActiveSubstances = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.active_substances = {
      image_url: '/images/active_substances.png',
      active: true
    };
    site.showModal('#reasonsSessionsAddModal');
  };

  $scope.addActiveSubstances = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#reasonsSessionsAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/active_substances/add",
      data: $scope.active_substances
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reasonsSessionsAddModal');
          $scope.getActiveSubstancesList();
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

  $scope.displayUpdateActiveSubstances = function (active_substances) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsActiveSubstances(active_substances);
    $scope.active_substances = {};
    site.showModal('#reasonsSessionsUpdateModal');
  };

  $scope.updateActiveSubstances = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#reasonsSessionsUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/active_substances/update",
      data: $scope.active_substances
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reasonsSessionsUpdateModal');
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

  $scope.displayDetailsActiveSubstances = function (active_substances) {
    $scope.error = '';
    $scope.detailsActiveSubstances(active_substances);
    $scope.active_substances = {};
    site.showModal('#reasonsSessionsDetailsModal');
  };

  $scope.detailsActiveSubstances = function (active_substances) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/active_substances/view",
      data: {
        id: active_substances.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.active_substances = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteActiveSubstances = function (active_substances) {
    $scope.error = '';
    $scope.detailsActiveSubstances(active_substances);
    $scope.active_substances = {};
    site.showModal('#reasonsSessionsDeleteModal');
  };

  $scope.deleteActiveSubstances = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/active_substances/delete",
      data: {
        id: $scope.active_substances.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reasonsSessionsDeleteModal');
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

  $scope.getActiveSubstancesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/active_substances/all",
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
    $scope.getActiveSubstancesList($scope.search);
    site.hideModal('#reasonsSessionsSearchModal');
    $scope.search = {}

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "active_substances"
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

  $scope.getScreenType = function () {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/numbering_transactions_status/get",
      data: {
        screen_name: "active_substances"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data) {
          $scope.disabledCode = response.data.doc == 'auto' ? true : false;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.getScreenType();
  $scope.getActiveSubstancesList();
  $scope.getNumberingAuto();

});