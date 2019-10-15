app.controller("stores_in", function ($scope, $http, $timeout) {

  $scope.store_in = {
    discountes: [],
    taxes: [],
    details: []
  };
  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.addTax = function () {
    $scope.store_in.taxes = $scope.store_in.taxes || [];
    $scope.store_in.taxes.push({
      name: $scope.tax.name,
      value: $scope.tax.value
    });
    $scope.tax = {};
    $scope.calc();
  };
  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.store_in.taxes.length; i++) {
      let tx = $scope.store_in.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.store_in.taxes.splice(i, 1);
      }
    }
    $scope.calc();
  };
  $scope.addDiscount = function () {
    $scope.store_in.discountes = $scope.store_in.discountes || [];
    $scope.store_in.discountes.push({
      name: $scope.discount.name,
      value: $scope.discount.value,
      type: $scope.discount.type
    });
    $scope.discount = {};
    $scope.calc();
  };
  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.store_in.discountes.length; i++) {
      let ds = $scope.store_in.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.store_in.discountes.splice(i, 1);
      }
    }

    $scope.calc();
  };

  $scope.calc = function () {
    $scope.store_in.total_value = 0;
    $scope.store_in.net_value = 0;


    $scope.store_in.items.forEach(itm => {
      $scope.store_in.total_value += parseFloat(itm.total);
    });

    $scope.store_in.total_tax = 0;
    $scope.store_in.taxes.forEach(tx => {
      $scope.store_in.total_tax += $scope.store_in.total_value * parseFloat(tx.value) / 100;
    });

    $scope.store_in.total_discount = 0;
    $scope.store_in.discountes.forEach(ds => {
      if (ds.type == '%') {
        $scope.store_in.total_discount += $scope.store_in.total_value * parseFloat(ds.value) / 100;
      } else {
        $scope.store_in.total_discount += parseFloat(ds.value);
      }
    });

    $scope.store_in.net_value = $scope.store_in.total_value + $scope.store_in.total_tax - $scope.store_in.total_discount;
  };

  $scope.deleteRow = function (itm) {
    if (!$scope.store_in.items) {
      $scope.store_in.items = [];
    }
    for (let i = 0; i < $scope.store_in.items.length; i++) {
      if ($scope.store_in.items[i].code == itm.code && $scope.store_in.items[i].size == itm.size) {
        $scope.store_in.items.splice(i, 1);
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

  $scope.loadStoresInTypes = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_in/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
          $scope.stores_in_types = response.data;        
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
          name: 1,
          number: 1
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

  $scope.loadCategories = function () {
    $scope.busy = true;
    $scope.categories = [];
    $http({
      method: "POST",
      url: "/api/categories/all",
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
          $scope.categories = response.data.list;
        }
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
        select: {}
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
  $scope.loadVendors = function () {
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
          $scope.vendorsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.loadStores_In = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/all",
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
          $scope.stores_in = response.data.list;
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
      where['number'] = $scope.search.number;
    }
    if ($scope.search.category && $scope.search.category.id) {
      where['category.id'] = $scope.search.category.id;
    }
    if ($scope.search.type) {
      where['type.id'] = $scope.search.type.id;
    }
    if ($scope.search.supply_number) {
      where['supply_number'] = $scope.search.supply_number;
    }
   
    if ($scope.search.ticket_code) {
      where['items.ticket_code'] = $scope.search.ticket_code;
    }

    if ($scope.search.date) {
      where['date'] = $scope.search.date;
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

    if ($scope.search.store && $scope.search.store.id) {
      where['store.id'] = $scope.search.store.id;
    }
    if ($scope.search.safe && $scope.search.safe.id) {
      where['safe.id'] = $scope.search.safe.id;
    }
    if ($scope.search.notes) {

      where['notes'] = $scope.search.notes;
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


    $scope.loadAll(where , $scope.search.limit);
    site.hideModal('#StoresInSearchModal');
    $scope.search = {};
  };
  $scope.loadAll = function (where , limit) {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/all",
      data: {
        where: where,
        limit : limit || 1000000
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
  $scope.newStore_In = function () {
    $scope.error = '';
    $scope.code = '';
    $scope.store_in = {
      image_url: '/images/store_in.png',
      items: [],
      discountes: [],
      taxes: [],
      details: [],
      date: new Date(),
      supply_date: new Date()
    };
    site.showModal('#addStoreInModal');
  };
  $scope.add = function () {
    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.store_in.type &&  $scope.store_in.type.id == 1) {
      if(!$scope.store_in.safe){
        $scope.error ="##word.nosafe_warning##";
        return;
      }

    }
    if ($scope.store_in.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_in/add",
        data: $scope.store_in
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addStoreInModal');
            $scope.loadAll();

          } else {
            $scope.error = '##word.error##';
          }
        },
        function (err) {
          console.log(err);
        }
      )
    } else {
      $scope.error = "يجب ادخال الكمية";
      return;
    }
  };
  $scope.remove = function (store_in) {
    $scope.error = '';
    $scope.view(store_in);
    $scope.store_in = {};
    site.showModal('#deleteStoreInModal');
  };
  $scope.view = function (store_in) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/view",
      data: {
        _id: store_in._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_in = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_in) {
    $scope.error = '';
    $scope.view(store_in);
    $scope.store_in = {};
    site.showModal('#viewStoreInModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/delete",
      data: {
        _id: $scope.store_in._id,
        name: $scope.store_in.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreInModal');
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
        $scope.store_in.items.push({
          image_url: $scope.item.image_url,
          name: $scope.item.name,
          size: s.size,
          count: s.count,
          cost: s.cost,
          price: s.price,
          total: s.count * s.cost,
          current_count: s.current_count,
          ticket_code:s.ticket_code

        });
      }

    });

    $scope.calc();
    $scope.item = {
      sizes: []
    }
  };

  $scope.calcSize = function (s) {
    setTimeout(() => {
      s.total = site.toNumber(s.cost) * site.toNumber(s.count)
    }, 100);

  }

  $scope.addToSizes = function () {

    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.push({
      $new: true,
      vendor: $scope.store_in.vendor,
      store: $scope.store_in.store,
      count: 0,
      cost: 0,
      price: 0,
      size: '',
      current_count: 0,
      total: 0,
    });


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

              console.log($scope.item)
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

  $scope.edit = function (store_in) {
    $scope.error = '';
    $scope.view(store_in);
    $scope.store_in = {};
    site.showModal('#updateStoreInModal');
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
      url: "/api/stores_in/update",
      data: $scope.store_in
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateStoreInModal');
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

  $scope.loadStores_In();
  $scope.loadStoresInTypes();
  $scope.loadVendors();
  $scope.loadStores();
  $scope.loadCategories();
  $scope.loadTax_Types();
  $scope.loadDiscount_Types();
  $scope.loadAll();
  $scope.loadSafes();
});