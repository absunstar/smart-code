app.controller("session_add", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.session_add = {};

  $scope.displayAddSessionAdd = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.session_add = {
      image_url: '/images/session_add.png',
      active: true,
      date: new Date()
    };
    site.showModal('#sessionAddAddModal');
  };

  $scope.addSessionAdd = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#sessionAddAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.session_add.judgment_status = $scope.sessionJudgmentList[0];

    $http({
      method: "POST",
      url: "/api/session_add/add",
      data: $scope.session_add
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#sessionAddAddModal');
          $scope.getSessionAddList();
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

  $scope.displayUpdateSessionAdd = function (session_add) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsSessionAdd(session_add);
    $scope.session_add = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#sessionAddUpdateModal');
  };

  $scope.updateSessionAdd = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';
    $scope.busy = true;

    const v = site.validated('#sessionAddUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $http({
      method: "POST",
      url: "/api/session_add/update",
      data: $scope.session_add
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#sessionAddUpdateModal');
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

  $scope.displayDetailsSessionAdd = function (session_add) {
    $scope.error = '';
    $scope.detailsSessionAdd(session_add);
    $scope.session_add = {};
    site.showModal('#sessionAddDetailsModal');
  };

  $scope.detailsSessionAdd = function (session_add) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/session_add/view",
      data: {
        id: session_add.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.session_add = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteSessionAdd = function (session_add) {
    $scope.error = '';
    $scope.detailsSessionAdd(session_add);
    $scope.session_add = {};
    site.showModal('#sessionAddDeleteModal');
  };

  $scope.deleteSessionAdd = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/session_add/delete",
      data: {
        id: $scope.session_add.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#sessionAddDeleteModal');
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

  $scope.getSessionAddList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/session_add/all",
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
    $scope.getSessionAddList($scope.search);
    site.hideModal('#sessionAddSearchModal');
    $scope.search = {}

  };

  $scope.getLawsuitsList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/lawsuit_add/all",
        data: {
          search: $scope.search_lawsuit,
          where: {},
          select: { id: 1, number: 1, year: 1, code: 1 }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.lawsuitsList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.loaReasonSessionList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/reasons_sessions/all",
      data: {
        select: { id: 1, name: 1, description: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.reasonSessionList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSessionJudgmentList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sessionJudgmentList = [];
    $http({
      method: "POST",
      url: "/api/session_judgment/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.sessionJudgmentList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.changeStatusudgment = function (session_add) {
    $scope.change_judgment = {};
    $scope.session_add = session_add;
    $scope.change_judgment.lawsuit = session_add.lawsuit;
    $scope.change_judgment.judgment_status = session_add.judgment_status;
    site.showModal('#statusJudgmentModal');
  };

  $scope.acceptChangeStatusudgment = function (change_judgment) {
    $scope.session_add.judgment_status = change_judgment.judgment_status;

    $http({
      method: "POST",
      url: "/api/session_add/update",
      data: $scope.session_add
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (change_judgment.judgment_status.id == 2 || change_judgment.judgment_status.id == 3) {

            $scope.change_judgment.judgment_status = $scope.sessionJudgmentList[0];
            $scope.change_judgment.active = true;
            $scope.change_judgment.image_url = '/images/session_add.png';

            $http({
              method: "POST",
              url: "/api/session_add/add",
              data: $scope.change_judgment
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                } else {
                  $scope.error = response.data.error;
                }
              },
              function (err) {
                console.log(err);
              }
            )
          }
          $scope.getSessionAddList();
          site.hideModal('#statusJudgmentModal');
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.getSessionAddList();
  $scope.getSessionJudgmentList();
  $scope.loaReasonSessionList();
});