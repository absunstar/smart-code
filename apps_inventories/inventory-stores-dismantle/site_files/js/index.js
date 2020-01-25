app.controller("stores_dismantle", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_dismantle = {
    discountes: [],
    taxes: []
  };
  $scope.search = {};
  $scope.item = {
    sizes: []
  };




  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_dismantle.items.splice($scope.store_dismantle.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newStoreDismantle = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.store_dismantle = {
          image_url: '/images/store_dismantle.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_dismantle.store = $scope.defaultSettings.inventory.store
        }
        site.showModal('#addStoreDismantleModal');
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

    const v = site.validated('#addStoreDismantleModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.store_dismantle.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_dismantle/add",
        data: $scope.store_dismantle
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addStoreDismantleModal');

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

  $scope.remove = function (store_dismantle) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_dismantle);
        $scope.store_dismantle = {};
        site.showModal('#deleteStoreDismantleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_dismantle) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_dismantle/view",
      data: {
        _id: store_dismantle._id
      }
    }).then(
      function (response) {
        شيي
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_dismantle = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_dismantle) {
    $scope.error = '';
    $scope.view(store_dismantle);
    $scope.store_dismantle = {};
    site.showModal('#viewStoreDismantleModal');
  };

  $scope.delete = function (store_dismantle) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_dismantle/delete",
      data: store_dismantle
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreDismantleModal');
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
      foundSize = $scope.store_dismantle.items.some(_itemSize => _itemSize.barcode == _size.barcode);
      if (_size.count > 0 && !foundSize) {
        $scope.store_dismantle.items.unshift({
          image_url: $scope.item.image_url,
          name: _size.name,
          size: _size.size,
          barcode: _size.barcode,
          size_units_list: _size.size_units_list,
          unit: _size.unit,
          complex_items: _size.complex_items,
          average_cost: _size.average_cost,
          count: _size.count,
          store_count: _size.store_count,
          cost: _size.cost,
          price: _size.price,
          current_count: _size.current_count,
          ticket_code: _size.ticket_code,
        });
      }
    });

    $scope.item.sizes = [];
  };


  $scope.addToSizes = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.unshift({
      $new: true,
      vendor: $scope.store_dismantle.vendor,
      store: $scope.store_dismantle.store,
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
        url: "/api/stores_items/all",
        data: {
          search: $scope.item.search_item_name,
          where: { 'sizes.item_complex': true }
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
                  let foundUnit = false;
                  let indxUnit = 0;
                  _size.size_units_list.forEach((_unit, i) => {
                    if ((_unit.barcode == $scope.search_item_name) && typeof _unit.barcode == 'string') {
                      foundUnit = true;
                    }
                    if (_unit.id == _item.main_unit.id)
                      indxUnit = i;
                  });
                  if ((_size.barcode == $scope.item.search_item_name) || foundUnit) {
                    _size.name = _item.name
                    _size.store = $scope.store_dismantle.store
                    _size.unit = _size.size_units_list[indxUnit];
                    _size.count = 1
                    _size.total = _size.count * _size.cost
                    if (_size.branches_list && _size.branches_list.length > 0) {
                      let foundBranch = false
                      let indxBranch = 0
                      _size.branches_list.map((_branch, i) => {
                        if (_branch.code == '##session.branch.code##') {
                          foundBranch = true
                          indxBranch = i
                        }
                      });

                      if (foundBranch) {
                        if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                          if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {
                            let foundStore = false
                            let indxStore = 0
                            _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                              if (_store.store.id == $scope.store_dismantle.store.id) {
                                foundStore = true
                                indxStore = i
                              }
                            });
                            if (foundStore)
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                                if (_unit.id == _item.main_unit.id)
                                  _size.store_count = _unit.current_count
                              });
                          } else _size.store_count = 0

                        } else _size.store_count = 0
                      } else _size.store_count = 0

                    } else _size.store_count = 0

                    foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _size.barcode);

                    if (!foundSize && _size.item_complex) $scope.item.sizes.unshift(_size);
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

  $scope.itemsStoresDismantle = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    $scope.item.name.sizes.forEach(_item => {
      _item.name = $scope.item.name.name
      _item.store = $scope.store_dismantle.store
      let indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.name.main_unit.id);
      _item.unit = _item.size_units_list[indxUnit];
      _item.count = 1;

      if (_item.branches_list && _item.branches_list.length > 0) {
        let foundBranch = false
        let indxBranch = 0
        _item.branches_list.map((_branch, i) => {
          if (_branch.code == '##session.branch.code##') {
            foundBranch = true
            indxBranch = i
          }
        });
        if (foundBranch) {

          if (_item.branches_list[indxBranch].code == '##session.branch.code##') {
            if (_item.branches_list[indxBranch].stores_list && _item.branches_list[indxBranch].stores_list.length > 0) {

              let foundStore = false
              let indxStore = 0
              _item.branches_list[indxBranch].stores_list.map((_store, i) => {
                if (_store.store.id == $scope.store_dismantle.store.id) {
                  foundStore = true
                  indxStore = i
                }
              });
              if (foundStore)
                _item.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                  if (_unit.id == $scope.item.name.main_unit.id)
                    _item.store_count = _unit.current_count
                });
            } else _item.store_count = 0

          } else _item.store_count = 0
        } else _item.store_count = 0

      } else _item.store_count = 0
      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _item.barcode);
      if (!foundSize && _item.item_complex)
        $scope.item.sizes.unshift(_item);
    });
  };

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          search: $scope.search_barcode,
          where: { 'sizes.item_complex': true }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;
              response.data.list[0].sizes.forEach(_size => {

                let foundUnit = false;
                let indxUnit = 0;
                _size.size_units_list.forEach((_unit, i) => {
                  if ((_unit.barcode == $scope.search_barcode) && typeof _unit.barcode == 'string') {
                    foundUnit = true;
                  }
                  if (_unit.id == response.data.list[0].main_unit.id)
                    indxUnit = i;


                });
                if ((_size.barcode == $scope.search_barcode) || foundUnit) {
                  _size.name = response.data.list[0].name;
                  _size.store = $scope.store_dismantle.store;
                  _size.unit = _size.size_units_list[indxUnit];
                  _size.count = 1;
                  _size.discount = _size.discount;
                  _size.total = _size.count * _size.cost;
                  if (_size.branches_list && _size.branches_list.length > 0) {
                    let foundBranch = false
                    let indxBranch = 0
                    _size.branches_list.map((_branch, i) => {
                      if (_branch.code == '##session.branch.code##') {
                        foundBranch = true
                        indxBranch = i
                      }
                    });
                    if (foundBranch) {
                      if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                        if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {
                          let foundStore = false
                          let indxStore = 0
                          _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                            if (_store.store.id == $scope.store_dismantle.store.id) {
                              foundStore = true
                              indxStore = i
                            }
                          });
                          if (foundStore)
                            _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unit => {
                              if (_unit.id == response.data.list[0].main_unit.id)
                                _size.store_count = _unit.current_count
                            });
                        } else _size.store_count = 0

                      } else _size.store_count = 0
                    } else _size.store_count = 0

                  } else _size.store_count = 0
                  foundSize = $scope.store_dismantle.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize && _size.item_complex)
                    $scope.store_dismantle.items.unshift(_size);
                }
              });
              if (foundSize) $scope.error = '##word.dublicate_item##';

              $scope.search_barcode = '';
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

  $scope.edit = function (store_dismantle) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_dismantle);
        $scope.store_dismantle = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreDismantleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_dismantle/update",
      data: $scope.store_dismantle
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateStoreDismantleModal');
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

  $scope.posting = function (store_dismantle) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_dismantle/posting",
      data: store_dismantle
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (store_dismantle.posting) {


          }
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

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: { select: { id: 1, name: 1, type: 1 } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.storesList = response.data.list;

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
    $scope.loadAll($scope.search);
    $scope.search = {};

    site.hideModal('#StoresDismantleSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_dismantle/all",
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

  $scope.loadStores();
  $scope.loadCategories();
  $scope.getDefaultSettings();
  $scope.loadAll({ date: new Date() });
});