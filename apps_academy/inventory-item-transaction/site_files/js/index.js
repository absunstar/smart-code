app.controller("item_transaction", function ($scope, $http, $timeout) {

  $scope.search = {};
  $scope.transaction_types=[
  {name:"##word.item_transaction_type_in##" , id:1, type:'in'},
  {name:"##word.item_transaction_type_out##" , id:2 , type:'out'},
  ]
  $scope.transaction_status=[
    {name:"##word.item_transaction_current_status_1##" , value:"debt" },
    {name:"##word.item_transaction_current_status_2##" , value:"replaced" },
    {name:"##word.item_transaction_current_status_3##" , value:"damaged"},
    {name:"##word.item_transaction_current_status_4##" , value:"sold"},
    {name:"##word.item_transaction_current_status_5##" , value:"transferred"},
    {name:"##word.item_transaction_current_status_6##" , value:"storein"}


    ]

  $scope.loadvendors = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
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
          $scope.vendors = response.data.list;
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
          $scope.stores = response.data.list;
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
          'job.trainer': { $ne: true }
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
          console.log($scope.Engs);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
        
      }
    )
  };
  

  $scope.searchAll = function () {
    let where = {};
    if ($scope.search.current_status) {
      where['current_status'] = $scope.search.current_status.value;
    }
    if ($scope.search.ticket_code) {
      where['ticket_code'] = $scope.search.ticket_code;
    }
    if ($scope.search.number) {
      where['number'] = $scope.search.number;
    }
    if ($scope.search.store) {
      where['store.id'] = $scope.search.store.id;
    }
    if ($scope.search.eng) {
      where['eng.id'] = $scope.search.eng.id;
    }

    if ($scope.search.name) {
      where['name'] = $scope.search.name;
    }


    if ($scope.search.size) {
      where['size'] = $scope.search.size;
    }

    if ($scope.search.cost) {
      where['cost'] = parseFloat($scope.search.cost);
    }


    if ($scope.search.count) {
      where['count'] = parseFloat($scope.search.count);
    }

    if ($scope.search.price) {
      where['price'] = parseFloat($scope.search.price);
    }

    if ($scope.search.transaction_type) {
      where['transaction_type'] = $scope.search.transaction_type.type;
      console.log($scope.search.transaction_type.type);
    }

    if ($scope.search.vendor) {
      where['vendor.id'] = $scope.search.vendor.id;
    }

    if ($scope.search.current_count) {
      where['current_count'] = parseFloat($scope.search.current_count);
    }

    if ($scope.search.current_countGt) {
      where['current_count'] = {
        $gte: parseFloat($scope.search.current_countGt)
      };
    }


    if ($scope.search.current_countLt) {
      where['current_count'] = {
        $lte: parseFloat($scope.search.current_countLt)
      };
    }

    if ($scope.search.date) {
      where['date'] = $scope.search.date;
    }

    if ($scope.search.current_countGt && $scope.search.current_countLt) {
      where['current_count'] = {
        $gte: parseFloat($scope.search.current_countGt),
        $lte: parseFloat($scope.search.current_countLt)
      };
    }

    if ($scope.search.dateFrom) {
      where['date_from'] = $scope.search.dateFrom;
    }

    if ($scope.search.dateTo) {
      where['date_to'] = $scope.search.dateTo;
    }

    $scope.loadAll(where , $scope.search.limit);
    site.hideModal('#itemTransactionSearchModal');
    $scope.search = {};
  };

  $scope.loadAll = function (where , limit) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/item_transaction/all",
      data: {
        where: where,
        limit : limit || 100000
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



  $scope.loadvendors();
  $scope.loadStores();
  $scope.loadEng();
  $scope.loadAll();

});