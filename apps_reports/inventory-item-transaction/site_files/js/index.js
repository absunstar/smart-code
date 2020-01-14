app.controller("item_transaction", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.search = {};
  $scope.transaction_types = [
    { name: "##word.item_transaction_type_in##", id: 1, type: 'in' },
    { name: "##word.item_transaction_type_out##", id: 2, type: 'out' },
  ]
  $scope.transaction_status = [
    { name: "##word.item_transaction_current_status_1##", value: "debt" },
    { name: "##word.item_transaction_current_status_2##", value: "replaced" },
    { name: "##word.item_transaction_current_status_3##", value: "damaged" },
    { name: "##word.item_transaction_current_status_4##", value: "sold" },
    { name: "##word.item_transaction_current_status_5##", value: "transferred" },
    { name: "##word.item_transaction_current_status_6##", value: "storein" }
  ]

  $scope.loadvendors = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {
        select: {
          id: 1,
          name_ar: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vendorsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStores = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadEng = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'trainer': { $ne: true },
          'delivery': { $ne: true }
        },
        select: {
          name: 1,
          id: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.Engs = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;

      }
    )
  };


  $scope.searchAll = function () {

    $scope.loadAll($scope.search);
    site.hideModal('#itemTransactionSearchModal');
    $scope.search = {};
  };

  $scope.loadAll = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/item_transaction/all",
      data: {
        where: where,
        limit: 100
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

  $scope.details = function (item_transaction) {
    $scope.error = '';
    $scope.view(item_transaction);
    $scope.item_transaction = {};
    site.showModal('#viewItemTranactionModal');
  };

  $scope.view = function (item_transaction) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/item_transaction/view",
      data: {
        _id: item_transaction._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.item_transaction = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.loadStoresOutTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_out/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesOutTypes = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoresInTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_in/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesInTypes = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadvendors();
  $scope.loadStores();
  $scope.loadStoresInTypes();
  $scope.loadStoresOutTypes();
  $scope.loadEng();
  $scope.loadAll({ date: new Date() });

});