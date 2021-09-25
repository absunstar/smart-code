app.controller("order_eco", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.order_eco = {};

  $scope.displayAddOrderEco = function () {
    $scope._search = {};
    $scope.error = '';
    $scope.order_eco = {
      image_url: '/images/order_eco.png',
      subjects_list: [{}],
      active: true
    };
    site.showModal('#orderEcoAddModal');
  };

  $scope.addOrderEco = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#orderEcoAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    if ($scope.order_eco.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_eco/add",
      data: $scope.order_eco
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#orderEcoAddModal');
          $scope.getOrderEcoList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateOrderEco = function (order_eco) {
    $scope._search = {};

    $scope.error = '';
    $scope.detailsOrderEco(order_eco);
    $scope.order_eco = {};
    site.showModal('#orderEcoUpdateModal');
  };

  $scope.updateOrderEco = function () {
    if ($scope.busy) {
      return;
    }
    $scope.error = '';

    const v = site.validated('#orderEcoUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.order_eco.subjects_list.length < 1) {
      $scope.error = '##word.err_subject_list##';
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_eco/update",
      data: $scope.order_eco
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#orderEcoUpdateModal');
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

  $scope.displayDetailsOrderEco = function (order_eco) {
    $scope.error = '';
    $scope.detailsOrderEco(order_eco);
    $scope.order_eco = {};
    site.showModal('#orderEcoDetailsModal');
  };

  $scope.detailsOrderEco = function (order_eco) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/view",
      data: {
        id: order_eco.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.order_eco = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteOrderEco = function (order_eco) {
    $scope.error = '';
    $scope.detailsOrderEco(order_eco);
    $scope.order_eco = {};
    site.showModal('#orderEcoDeleteModal');
  };

  $scope.deleteOrderEco = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_eco/delete",
      data: {
        id: $scope.order_eco.id

      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#orderEcoDeleteModal');
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

  $scope.getOrderEcoList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;
    $http({
      method: "POST",
      url: "/api/order_eco/all",
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
    $scope.getOrderEcoList($scope.search);
    site.hideModal('#orderEcoSearchModal');
    $scope.search = {}

  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "order_eco"
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
  $scope.getOrderEcoList();

});