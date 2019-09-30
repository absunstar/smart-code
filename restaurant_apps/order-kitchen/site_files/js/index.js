app.controller("order_kitchen", function ($scope, $http) {
  $scope._search = {};

  $scope.order_kitchen = {};

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

  $scope.loadKitchens = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.kitchensList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.orderKitchensList = function (kitchen) {
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_invoice/active_all",
      data: {
        where: kitchen
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {          

      /*      response.data.list.forEach(ordersList => {
            ordersList.book_list.forEach(book_list => {              
              if(book_list.kitchen.id == kitchen.id)
              ordersList.book_list.push(book_list)
            });
          }); */

          $scope.ordersList = response.data.list
        }
        $scope.order_kitchen = {};
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadKitchens();
  $scope.orderKitchensList();
});







