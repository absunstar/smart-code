app.controller("order_delivery", function ($scope, $http, $interval) {
  $scope._search = {};


  $scope.showSearch = function () {
    site.showModal('#searchModal');
  };

  $scope.searchAll = function () {

    $scope.getMenuList($scope.search);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  /*   $scope.doneDelivery = function (i) {
  
      $scope.get_open_shift((shift) => {
        if (shift) {
          $scope.error = '';
          $scope.busy = true;
          $http({
            method: "POST",
            url: "/api/order_delivery/update",
            data: i
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {   
                $scope.book_list_report.splice($scope.book_list_report.indexOf(i), 1)
                $scope.book_list_report = $scope.book_list_report
              } else {
                $scope.error = response.data.error;
              }
            },
            function (err) {
              console.log(err);
            }
          )
        } else $scope.error = '##word.open_shift_not_found##';
      });
    };
   */

  $scope.getDefaultSettings = function (deliverysList) {

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/default_setting/get",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          $scope.error = '';
          $scope.order_delivery = {};
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.orderDeliveryList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_delivery/active_all",
      data: {
        where: $scope.order_delivery
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.count = response.data.count;
          $scope.prepared = response.data.prepared
          $scope.under_preparing = response.data.under_preparing

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showItemsDelivered = function (order, type) {
    $scope.error = '';
    if (type === 'under_preparing') {
      order.$status_prepar = true
    }
    $scope.order = order;
    site.showModal('#itemsDeliveredModal');

  };

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.shift = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        callback(null);
      }
    )
  };



  $interval(() => {
    $scope.orderDeliveryList();
  }, 1000 * 20);

});







