app.controller("stores_out", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_out = {
    discountes: [],
    taxes: [],
    details: []
  };

  $scope.search = {};

  $scope.item = {
    sizes: []
  };


  $scope.getItemsName = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/name_all",
        data: {
          search: $scope.item.search_item_name
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let exist = false;
              response.data.list.forEach(item => {
                item.sizes.forEach(size => {
                  if (size.barcode == $scope.item.search_item_name) {
                    size.item_name = item.name
                    size.count = 1
                    size.total = size.count * size.cost
                    $scope.item.sizes.push(size);
                    exist = false;
                  };
                });
              });
              if (!exist) $scope.itemsNameList = response.data.list;
            };
          } else {
            $scope.error = response.data.error;
            $scope.item = {
              sizes: []
            };
          };
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };


  $scope.itemsStoresOut = function () {
    $scope.error = '';
    if ($scope.item.sizes && $scope.item.sizes.length > 0) {
      $scope.item.item_name.sizes.forEach(item => {
        if ($scope.item.item_name) {
          item.item_name = $scope.item.item_name.name
          item.count = 1;
          item.total = item.count * item.cost
          $scope.item.sizes.push(item);
        }
      });
    } else {
      $scope.item.sizes = [];
      $scope.item.item_name.sizes.forEach(item => {
        item.item_name = $scope.item.item_name.name
        item.count = 1;
        item.total = item.count * item.cost
        $scope.item.sizes.push(item);
      });
    };
  }

  $scope.deleteitem = function (itm) {
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.addTax = function () {
    $scope.store_out.taxes = $scope.store_out.taxes || [];
    if ($scope.tax.value && $scope.store_out.taxes) {

      $scope.store_out.taxes.push({
        name: $scope.tax.name,
        value: $scope.tax.value
      });
    };
    $scope.tax = {};
    $scope.calc();
  };

  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.store_out.taxes.length; i++) {
      let tx = $scope.store_out.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.store_out.taxes.splice(i, 1);
      }
    }
    $scope.calc();
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {
      $scope.error = '##word.stores_out_error_discount##';
      return;
    } else {
      $scope.store_out.discountes = $scope.store_out.discountes || [];
      $scope.store_out.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
      $scope.discount = {};
      $scope.calc();
    };
  };

  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.store_out.discountes.length; i++) {
      let ds = $scope.store_out.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.store_out.discountes.splice(i, 1);
      }
    }
    $scope.calc();
  };

  $scope.calc = function () {
    $scope.store_out.total_value = 0;
    $scope.store_out.net_value = 0;


    $scope.store_out.items.forEach(itm => {
      $scope.store_out.total_value += parseFloat(itm.total);
    });

    $scope.store_out.total_tax = 0;
    $scope.store_out.taxes.forEach(tx => {
      $scope.store_out.total_tax += $scope.store_out.total_value * parseFloat(tx.value) / 100;
    });

    $scope.store_out.total_discount = 0;
    $scope.store_out.discountes.forEach(ds => {
      if (ds.type == '1') {
        $scope.store_out.total_discount += $scope.store_out.total_value * parseFloat(ds.value) / 100;
      } else {
        $scope.store_out.total_discount += parseFloat(ds.value);
      }
    });

    $scope.store_out.net_value = $scope.store_out.total_value + $scope.store_out.total_tax - $scope.store_out.total_discount;
  };

  $scope.deleteRow = function (itm) {
    if (!$scope.store_out.items) {
      $scope.store_out.items = [];
    }
    for (let i = 0; i < $scope.store_out.items.length; i++) {
      if ($scope.store_out.items[i].code == itm.code && $scope.store_out.items[i].size == itm.size) {
        $scope.store_out.items.splice(i, 1);
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
      url: '/api/stores_out/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.stores_out_types = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadTaxTypes = function () {
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


  $scope.loadDiscountTypes = function () {
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

  $scope.loadStoresOut = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/all",
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
          $scope.stores_out = response.data.list;
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

    if ($scope.search.safe) {
      where['safe.id'] = $scope.search.safe.id;
    }

    if ($scope.search.notes) {
      where['notes'] = $scope.search.notes;
    }

    $scope.loadAll(where, $scope.search.limit);
    site.hideModal('#StoresOutSearchModal');
    $scope.search = {};
  };

  $scope.loadAll = function (where, limit) {
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/all",
      data: {
        where: where,
        limit: limit || 1000000
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
  $scope.newStore_Out = function () {

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
          $scope.item = {}
          $scope.store_out = {
            image_url: '/images/store_out.png',
            vendor: $scope.defaultSettings.general_Settings.vendor,
            store: $scope.defaultSettings.inventory.store,
            safe: $scope.defaultSettings.accounting.safe,
            items: [],
            discountes: [],
            taxes: [],
            details: [],
            date: new Date(),
            supply_date: new Date()
          };
          site.showModal('#addStoreOutModal');
        };
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };


  $scope.add = function () {
    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.store_out.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_out/add",
        data: $scope.store_out
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addStoreOutModal');
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
      $scope.error = "يجب ادخال الكمية ";
      return;
    }
  };

  $scope.edit = function (store_out) {
    $scope.error = '';
    $scope.view(store_out);
    $scope.store_out = {};
    site.showModal('#updateStoreOutModal');
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
      url: "/api/stores_out/update",
      data: $scope.store_out
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateStoreOutModal');
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

  $scope.remove = function (store_out) {
    $scope.error = '';
    $scope.view(store_out);
    $scope.store_out = {};
    site.showModal('#deleteStoreOutModal');
  };

  $scope.view = function (store_out) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/view",
      data: {
        _id: store_out._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_out = response.data.doc;

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_out) {
    $scope.error = '';
    $scope.view(store_out);
    $scope.store_out = {};
    site.showModal('#viewStoreOutModal');
  };

  $scope.delete = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/delete",
      data: {
        _id: $scope.store_out._id,
        name: $scope.store_out.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreOutModal');
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
    $scope.error = "";

    $scope.item.sizes.forEach(s => {
      if (s.count == 0) {
        $scope.error = "##word.stores_out_error_item##";
        return;
      } else {

        if (s.count > 0) {
          $scope.store_out.items.push({
            image_url: $scope.item.image_url,
            name: s.item_name,
            size: s.size,
            barcode: s.barcode,
            count: s.count,
            cost: s.cost,
            price: s.price,
            total: s.total,
            current_count: s.current_count,

          });
        }
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
    $scope.error = "";
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

  $scope.calcSize = function (s) {
    setTimeout(() => {
      s.total = site.toNumber(s.price) * site.toNumber(s.count)
    }, 100);
  };

  $scope.loadStoresOut();
  $scope.loadStoresOutTypes();
  $scope.loadVendors();
  $scope.loadStores();
  $scope.loadTaxTypes();
  $scope.loadDiscountTypes();
  $scope.loadSafes();
  $scope.loadAll();

});