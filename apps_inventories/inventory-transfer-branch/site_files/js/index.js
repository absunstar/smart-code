app.controller("transfer_branch", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.transfer_branch = {
    discountes: [],
    taxes: [],
    details: []
  };
  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.addTax = function () {
    $scope.error = '';
    $scope.transfer_branch.taxes = $scope.transfer_branch.taxes || [];
    $scope.transfer_branch.taxes.push({
      name: $scope.tax.name,
      value: $scope.tax.value
    });
    $scope.tax = {};
    $scope.calc();
  };

  $scope.deleteTax = function (_tx) {
    $scope.error = '';
    for (let i = 0; i < $scope.transfer_branch.taxes.length; i++) {
      let tx = $scope.transfer_branch.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value)
        $scope.transfer_branch.taxes.splice(i, 1);
    }
    $scope.calc();
  };


  $scope.addDiscount = function () {

    $scope.error = '';

    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.transfer_branch.discountes = $scope.transfer_branch.discountes || [];

      $scope.transfer_branch.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
      $scope.calc();
    };

  };
  $scope.deleteDiscount = function (_ds) {
    $scope.error = '';
    for (let i = 0; i < $scope.transfer_branch.discountes.length; i++) {
      let ds = $scope.transfer_branch.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type)
        $scope.transfer_branch.discountes.splice(i, 1);
    }
    $scope.calc();
  };

  $scope.calc = function () {
    $scope.error = '';
    $scope.transfer_branch.total_value = 0;
    $scope.transfer_branch.net_value = 0;

    $scope.transfer_branch.items.forEach(itm => {
      $scope.transfer_branch.total_value += parseFloat(itm.total);
    });

    $scope.transfer_branch.total_tax = 0;
    $scope.transfer_branch.taxes.forEach(tx => {
      $scope.transfer_branch.total_tax += $scope.transfer_branch.total_value * parseFloat(tx.value) / 100;
    });

    $scope.transfer_branch.total_discount = 0;
    if ($scope.transfer_branch.discountes && $scope.transfer_branch.discountes.length > 0)
      $scope.transfer_branch.discountes.forEach(ds => {

        if (ds.type == 'percent')
          $scope.transfer_branch.total_discount += $scope.transfer_branch.total_value * parseFloat(ds.value) / 100;
        else $scope.transfer_branch.total_discount += parseFloat(ds.value);
      });

    $scope.transfer_branch.net_value = $scope.transfer_branch.total_value + $scope.transfer_branch.total_tax - $scope.transfer_branch.total_discount;
    $scope.discount = {
      type: 'number'
    };
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.transfer_branch.items.splice($scope.transfer_branch.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };
  $scope.newTransferBranch = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.getDefaultSettings();
        site.showModal('#addTransferBranchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.getDefaultSettings = function () {
    $scope.error = '';
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
          $scope.transfer_branch = {
            image_url: '/images/transfer_branch.png',
            shift: $scope.shift,
            items: [],
            discountes: [],
            taxes: [],
            details: [],
            date: new Date(),
            supply_date: new Date(),
            branch_from: $scope.branchCode
          };

          if ($scope.defaultSettings.inventory) {
            if ($scope.defaultSettings.inventory.store)
              $scope.transfer_branch.store_from = $scope.defaultSettings.inventory.store
          }
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

  
    if ($scope.transfer_branch.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/transfer_branch/add",
        data: $scope.transfer_branch
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addTransferBranchModal');
            $scope.loadAll();

          } else $scope.error = response.data.error;

        },
        function (err) {
          $scope.error = err.message;
        }
      )
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };

  $scope.remove = function (transfer_branch) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(transfer_branch);
        $scope.transfer_branch = {};
        site.showModal('#deleteTransferBranchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (transfer_branch) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/view",
      data: {
        _id: transfer_branch._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.transfer_branch = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (transfer_branch) {
    $scope.error = '';
    $scope.view(transfer_branch);
    $scope.transfer_branch = {};
    site.showModal('#viewTransferBranchModal');
  };

  $scope.delete = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/delete",
      data: {
        _id: $scope.transfer_branch._id,
        name: $scope.transfer_branch.name
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteTransferBranchModal');
          $scope.loadAll();
        } else $scope.error = response.data.error;

      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.addToItems = function () {
    $scope.error = '';
    let foundSize = false;
    $scope.item.sizes.forEach(_size => {
      foundSize = $scope.transfer_branch.items.some(_itemSize => _itemSize.barcode == _size.barcode);
      if (_size.count > 0 && !foundSize) {
        $scope.transfer_branch.items.push({
          image_url: $scope.item.image_url,
          name: _size.item_name,
          size: _size.size,
          barcode: _size.barcode,
          average_cost: _size.average_cost,
          count: _size.count,
          cost: _size.cost,
          price: _size.price,
          total: _size.total,
          current_count: _size.current_count,
          ticket_code: _size.ticket_code,
        });
      }
    });
    $scope.calc();
    $scope.item.sizes = [];
  };

  $scope.calcSize = function (size) {
    $scope.error = '';
    setTimeout(() => {
      if (size.cost && size.count) {
        size.total = (site.toNumber(size.cost) * site.toNumber(size.count));
      }
      $scope.calc();
    }, 100);
  };

  $scope.addToSizes = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.push({
      $new: true,
      customer: $scope.transfer_branch.customer,
      store_from: $scope.transfer_branch.store_from,
      count: 1,
      cost: 0,
      price: 0,
      size: '',
      current_count: 0,
      total: 0,
    });
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
              let foundSize = false;
              $scope.item.sizes = $scope.item.sizes || [];
              response.data.list.forEach(_item => {
                _item.sizes.forEach(_size => {
                  if (_size.barcode == $scope.item.search_item_name) {
                    _size.item_name = _item.name
                    _size.store_from = $scope.transfer_branch.store_from
                    _size.count = 1
                    _size.total = _size.count * _size.cost
                    if (_size.stores_list && _size.stores_list.length > 0) {
                      _size.stores_list.forEach(_store => {
                        if (_store.store_from.id == $scope.transfer_branch.store_from.id)
                          _size.store_count = _store.current_count
                        else _size.store_count = 0
                      });
                    } else _size.store_count = 0;

                    foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _size.barcode);

                    if (!foundSize) $scope.item.sizes.push(_size);
                  };
                });
              });

              if (!foundSize)
                $scope.itemsNameList = response.data.list;
              else if (foundSize) $scope.error = '##word.dublicate_item##';

            };
          } else {
            $scope.error = response.data.error;
            $scope.item = { sizes: [] };
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
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    $scope.item.item_name.sizes.forEach(_item => {
      _item.item_name = $scope.item.item_name.name
      _item.store_from = $scope.transfer_branch.store_from
      _item.count = 1;
      _item.total = _item.count * _item.cost
      if (_item.stores_list && _item.stores_list.length > 0) {
        _item.stores_list.forEach(_store => {
          if (_store.store.id == $scope.transfer_branch.store_from.id) {
            _item.store_count = _store.current_count
          } else _item.store_count = 0
        });

      } else _item.store_count = 0
      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _item.barcode);
      if (!foundSize)
        $scope.item.sizes.push(_item);
    });
  };

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/name_all",
        data: {
          search: $scope.search_barcode
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;
              response.data.list[0].sizes.forEach(_size => {
                if (_size.barcode == $scope.search_barcode) {
                  _size.name = response.data.list[0].name;
                  _size.store_from = $scope.transfer_branch.store_from;
                  _size.count = 1;
                  _size.total = _size.count * _size.cost;
                  foundSize = $scope.transfer_branch.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize)
                    $scope.transfer_branch.items.unshift(_size);
                }
              });
              if (foundSize) $scope.error = '##word.dublicate_item##';

              $scope.calc();
              $scope.search_barcode = "";
            }
            $timeout(() => {
              document.querySelector('#search_barcode input').focus();
            }, 100);

          } else {
            $scope.error = response.data.error;
          };
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  /*  $scope.getItem = function () {
     if ($scope.item.item_name) {
       console.log("Aaaaaaaaaaaaaaaaaaaaaaaaaaa");
       
       $http({
         method: "POST",
         url: "/api/stores_items/all",
         data: {
           where: {
             name: $scope.item.item_name.name
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
                 name: $scope.item.item_name.name
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
   }; */

  $scope.edit = function (transfer_branch) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(transfer_branch);
        $scope.transfer_branch = {};
        site.showModal('#updateTransferBranchModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
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
      url: "/api/transfer_branch/update",
      data: $scope.transfer_branch
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateTransferBranchModal');
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

  $scope.loadBranches = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/branches/all"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.branchesList = response.data.list;
          $scope.branchCode = response.data.branch;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoresFrom = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesFromList = response.data.list;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadStoresTo = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.storesToList = response.data.list;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.categories = [];
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
        if (response.data.done) $scope.categories = response.data.list;

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
    if ($scope.search.shift_code) {
      where['shift.code'] = $scope.search.shift_code;
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

    if ($scope.search.store_from && $scope.search.store_from.id) {
      where['store_from.id'] = $scope.search.store_from.id;
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


    $scope.loadAll(where);
    site.hideModal('#StoresOutSearchModal');
    $scope.search = {};
  };
  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/all",
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

  /*   $scope.loadStores_Out();
   */

  $scope.getSafeBySetting = function () {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      if ($scope.defaultSettings.accounting.safe) {
        $scope.transfer_branch.safe = $scope.defaultSettings.accounting.safe
      }
    }
  };

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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

  $scope.loadCategories();
  $scope.loadBranches();
  $scope.loadStoresFrom();
  $scope.loadStoresTo();
  $scope.loadAll({ date: new Date() });
});