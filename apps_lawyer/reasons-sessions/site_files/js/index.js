app.controller("reasons_sessions", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.reasons_sessions = {};

  $scope.displayAddReasonsSessions = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.reasons_sessions = {
      image_url: '/images/reasons_sessions.png',
      active: true
    };
    site.showModal('#reasonsSessionsAddModal');
  };

  $scope.addReasonsSessions = function () {
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
      url: "/api/reasons_sessions/add",
      data: $scope.reasons_sessions
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#reasonsSessionsAddModal');
          $scope.getReasonsSessionsList();
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

  $scope.displayUpdateReasonsSessions = function (reasons_sessions) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsReasonsSessions(reasons_sessions);
    $scope.reasons_sessions = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#reasonsSessionsUpdateModal');
  };

  $scope.updateReasonsSessions = function () {
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
      url: "/api/reasons_sessions/update",
      data: $scope.reasons_sessions
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

  $scope.displayDetailsReasonsSessions = function (reasons_sessions) {
    $scope.error = '';
    $scope.detailsReasonsSessions(reasons_sessions);
    $scope.reasons_sessions = {};
    site.showModal('#reasonsSessionsDetailsModal');
  };

  $scope.detailsReasonsSessions = function (reasons_sessions) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/reasons_sessions/view",
      data: {
        id: reasons_sessions.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.reasons_sessions = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteReasonsSessions = function (reasons_sessions) {
    $scope.error = '';
    $scope.detailsReasonsSessions(reasons_sessions);
    $scope.reasons_sessions = {};
    site.showModal('#reasonsSessionsDeleteModal');
  };

  $scope.deleteReasonsSessions = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/reasons_sessions/delete",
      data: {
        id: $scope.reasons_sessions.id

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

  $scope.getReasonsSessionsList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/reasons_sessions/all",
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
    $scope.getReasonsSessionsList($scope.search);
    site.hideModal('#reasonsSessionsSearchModal');
    $scope.search = {}

  };

  $scope.getScreenType = function () {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/numbering_transactions_status/get",
      data: {
        screen_name: "reasons_sessions"
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
  $scope.getReasonsSessionsList();

});