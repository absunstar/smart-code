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

  $scope.loadvendors = function (ev) {
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/vendors/all",
        data: {
          search: $scope.search_vendor
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
    }
  };

  $scope.loadStores = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1, code: 1 } }
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
          trainer: { $ne: true },
          delivery: { $ne: true },
          delegate: { $ne: true },
          active: true
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

  $scope.loadTransactionTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/item_transaction/transaction_type/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.transactionTypes = response.data;
        console.log($scope.transactionTypes);

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


  $scope.loadStoresStatusTypes = function () {
    $scope.error = '';

    let url = '/api/stores_in/types/all';

    if ($scope.search.t_type) {
      if ($scope.search.t_type.id == 1) url = '/api/stores_in/types/all';
      else if ($scope.search.t_type.id == 2) url = '/api/stores_out/types/all';

    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: url,
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.transactionStatus = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];
    $http({
      method: "POST",
      url: "/api/items_group/all",
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
          $scope.itemsGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.handeItemTransactions = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/item_transaction/handel_item_transaction"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.loadAll();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStores();
  $scope.loadItemsGroups();
  $scope.loadTransactionTypes();
  $scope.loadEng();
  $scope.loadAll({ date: new Date() });

});