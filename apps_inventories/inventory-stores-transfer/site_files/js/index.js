app.controller("stores_transfer", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.stores_transfer = { discountes: [], taxes: [], details: [] };
  $scope.search = {};


  $scope.item = { sizes: []  };

  $scope.addTax = function () {
    $scope.stores_transfer.taxes = $scope.stores_transfer.taxes || [];
    $scope.stores_transfer.taxes.push({
      name: $scope.tax.name,
      value: $scope.tax.value
    });
    $scope.tax = {};
    $scope.calc();
  };

  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.stores_transfer.taxes.length; i++) {
      let tx = $scope.stores_transfer.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.stores_transfer.taxes.splice(i, 1);
      }
    }
    $scope.calc();
  };

  $scope.addDiscount = function () {
    $scope.stores_transfer.discountes = $scope.stores_transfer.discountes || [];
    $scope.discount.type = 'number';

    $scope.stores_transfer.discountes.push({
      name: $scope.discount.name,
      value: $scope.discount.value,
      type: $scope.discount.type
    });
    $scope.discount = {};
    $scope.calc();
  };

  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.stores_transfer.discountes.length; i++) {
      let ds = $scope.stores_transfer.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.stores_transfer.discountes.splice(i, 1);
      }
    }
    $scope.calc();
  };

  $scope.calc = function () {
    $scope.stores_transfer.total_value = 0;
    $scope.stores_transfer.net_value = 0;


    $scope.stores_transfer.items.forEach(itm => {
      $scope.stores_transfer.total_value += parseFloat(itm.total);
    });

    $scope.stores_transfer.total_tax = 0;
    $scope.stores_transfer.taxes.forEach(tx => {
      $scope.stores_transfer.total_tax += $scope.stores_transfer.total_value * parseFloat(tx.value) / 100;
    });

    $scope.stores_transfer.total_discount = 0;
    $scope.stores_transfer.discountes.forEach(ds => {
      if (ds.type == '1') {
        $scope.stores_transfer.total_discount += $scope.stores_transfer.total_value * parseFloat(ds.value) / 100;
      } else {
        $scope.stores_transfer.total_discount += parseFloat(ds.value);
      }
    });

    $scope.stores_transfer.net_value = $scope.stores_transfer.total_value + $scope.stores_transfer.total_tax - $scope.stores_transfer.total_discount;
  };

  $scope.deleteRow = function (itm) {
    if (!$scope.stores_transfer.items) {
      $scope.stores_transfer.items = [];
    }
    for (let i = 0; i < $scope.stores_transfer.items.length; i++) {
      if ($scope.stores_transfer.items[i].code == itm.code && $scope.stores_transfer.items[i].size == itm.size) {
        $scope.stores_transfer.items.splice(i, 1);
      }
    }
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


  $scope.loadStoresOutTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_transfer/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
          $scope.stores_transfer_types = response.data;        
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadTax_Types = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/tax_types/all",
      data: {
        select: {
          id: 1,
          name: 1,
          value: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tax_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.loadDiscount_Types = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
          select: {
            id: 1,
            name: 1,
            value: 1,
            type: 1
          }
        
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadvendors = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          balance: 1
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

  $scope.loadStoresOut = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_transfer/all",
      data: {
        select: {
          id: 1,
          name: 1,
          items: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.stores_transfer = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.loadSafes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
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
          $scope.safes = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.searchAll = function () {
    $scope.error = '';
    let where = {};

    if ($scope.search.number) {
      where['number'] = ($scope.search.number);
    }
    if ($scope.search.date) {
      where['date'] = $scope.search.date;
    }
    if ($scope.search.type) {
     
      where['type.id'] = $scope.search.type.id;
    }

    if ($scope.search.dateFrom) {
      where['date_from'] = $scope.search.dateFrom;
    }

    if ($scope.search.dateTo) {
      where['date_to'] = $scope.search.dateTo;
    }

    if ($scope.search.vendor && $scope.search.vendor.id) {
      where['vendor.id'] = $scope.search.vendor.id;
    }
    


    if ($scope.search.total_valueGt) {
      where['total_value'] = {
        $gte: parseFloat($scope.search.total_valueGt)
      };
    }

    if ($scope.search.total_valueLt) {
      where['total_value'] = {
        $lte: parseFloat($scope.search.total_valueLt)
      };
    }

    if ($scope.search.total_valueGt && $scope.search.total_valueLt) {
      where['total_value'] = {
        $gte: parseFloat($scope.search.total_valueGt),
        $lte: parseFloat($scope.search.total_valueLt)
      };
    }
    if ($scope.search.store) {
      where['store.id'] = $scope.search.store.id;
    }
   
    if ($scope.search.notes) {
      where['notes'] = $scope.search.notes;
    }
    if ($scope.search.store_to) {
      where['store_to'] = $scope.search.store_to;
    }


    $scope.loadAll(where , $scope.search.limit);
    site.hideModal('#StoresOutSearchModal');
    $scope.search = {};
  };

  $scope.loadAll = function (where , limit) {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_transfer/all",
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

  $scope.newstores_transfer = function () {
    $scope.error = '';
    $scope.code = '';
    $scope.stores_transfer = {
      image_url: '/images/stores_transfer.png',
      items: [],
      discountes: [],
      taxes: [],
      details: [],
      date: new Date()
    };
    site.showModal('#addStoreTransferModal');
  };

  $scope.add = function () {
    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if($scope.stores_transfer.items.length <= 0  ){
      
        $scope.error ="##word.stores_quantity##"
        return;
    }
    if($scope.stores_transfer.store == $scope.stores_transfer.store_to){
      $scope.error = '##word.stores_equality##';
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_transfer/add",
      data: $scope.stores_transfer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#addStoreTransferModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
    
  };

  $scope.edit = function (stores_transfer) {
    $scope.error = '';
    $scope.view(stores_transfer);
    $scope.stores_transfer = {};
    site.showModal('#updateStoreTransferModal');
  };

  $scope.update = function () {
    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_transfer/update",
      data: $scope.stores_transfer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateStoreTransferModal');
          $scope.loadAll();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.remove = function (stores_transfer) {
    $scope.error = '';
    $scope.view(stores_transfer);
    $scope.stores_transfer = {};
    site.showModal('#deleteStoreTransferModal');
  };

  $scope.view = function (stores_transfer) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_transfer/view",
      data: {
        _id: stores_transfer._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.stores_transfer = response.data.doc;
         
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (stores_transfer) {
    $scope.error = '';
    $scope.view(stores_transfer);
    $scope.stores_transfer = {};
    site.showModal('#viewStoreTransferModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_transfer/delete",
      data: {
        _id: $scope.stores_transfer._id,
        name: $scope.stores_transfer.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreTransferModal');
          $scope.loadAll();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.addToItems = function () {
    $scope.item.sizes.forEach(s => {
      if (s.count > 0) {
        $scope.stores_transfer.items.push({
         image_url : $scope.item.image_url,
          name: $scope.item.name,
          size: s.size,
          count: s.count,
          cost: s.cost,
          price: s.price,
          total: s.count * s.cost,
          current_count: s.current_count,

        });
      }
    });

    $scope.calc();
    $scope.item = {
      sizes: []
    }
  };

  $scope.addToSizes = function () {
    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.push({
      $new: true,
      size: $scope.size_name,
      count: 0,
      cost: 0,
      price: 0,
      total: 0
    });
    $scope.size_name = '';
  };

  $scope.getItem = function (ev) {
    if (ev.which === 13) {


      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: {
            name: $scope.item.name
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              $('#public_count').focus();
              response.data.list[0].sizes.forEach(itm => {
                itm.count = 0;
              });
              $scope.item = response.data.list[0];
           
            } else {
              $scope.item = {
                sizes: [],
                name: $scope.item.name
              };
              $('#item_name').focus();
            }
          } else {
            $scope.error = response.data.error;
            $scope.item = {
              sizes: []
            };
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.calcSize = function (s){
    setTimeout(() => {
      s.total = site.toNumber(s.cost) * site.toNumber(s.count)
    }, 100);
   
  }
    

  $scope.loadStoresOut();
  $scope.loadStoresOutTypes();
  $scope.loadvendors();
  $scope.loadStores();
  $scope.loadTax_Types();
  $scope.loadDiscount_Types();
  $scope.loadSafes();
  $scope.loadAll();
  
});