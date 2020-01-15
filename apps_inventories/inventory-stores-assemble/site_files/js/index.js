app.controller("stores_assemble", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_assemble = {
    discountes: [],
    taxes: []
  };
  $scope.search = {};
  $scope.item = {
    sizes: []
  };




  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_assemble.items.splice($scope.store_assemble.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newStoreAssemble = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.store_assemble = {
          image_url: '/images/store_assemble.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_assemble.store = $scope.defaultSettings.inventory.store
        }
        site.showModal('#addStoreAssembleModal');
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

    const v = site.validated('#addStoreAssembleModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.store_assemble.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_assemble/add",
        data: $scope.store_assemble
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addStoreAssembleModal');

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

  $scope.remove = function (store_assemble) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_assemble);
        $scope.store_assemble = {};
        site.showModal('#deleteStoreAssembleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_assemble) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_assemble/view",
      data: {
        _id: store_assemble._id
      }
    }).then(
      function (response) {
        شيي
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_assemble = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_assemble) {
    $scope.error = '';
    $scope.view(store_assemble);
    $scope.store_assemble = {};
    site.showModal('#viewStoreAssembleModal');
  };

  $scope.delete = function (store_assemble) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_assemble/delete",
      data: store_assemble
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreAssembleModal');
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
      foundSize = $scope.store_assemble.items.some(_itemSize => _itemSize.barcode == _size.barcode);
      if (_size.count > 0 && !foundSize) {
        $scope.store_assemble.items.unshift({
          image_url: $scope.item.image_url,
          name: _size.name,
          size: _size.size,
          barcode: _size.barcode,
          complex_items: _size.complex_items,
          average_cost: _size.average_cost,
          count: _size.count,
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
      vendor: $scope.store_assemble.vendor,
      store: $scope.store_assemble.store,
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
                    _size.name = _item.name
                    _size.store = $scope.store_assemble.store
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
                              if (_store.store.id == $scope.store_assemble.store.id) {
                                foundStore = true
                                indxStore = i
                              }
                            });
                            if (foundStore)
                              _size.store_count = _size.branches_list[indxBranch].stores_list[indxStore].current_count
                          } else _size.store_count = 0

                        } else _size.store_count = 0
                      } else _size.store_count = 0

                    } else _size.store_count = 0

                    foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _size.barcode);

                    if (!foundSize) $scope.item.sizes.unshift(_size);
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

  $scope.itemsStoresAssemble = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    $scope.item.name.sizes.forEach(_item => {
      _item.name = $scope.item.name.name
      _item.store = $scope.store_assemble.store
      _item.count = 1;
      _item.total = _item.count * _item.cost
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
                if (_store.store.id == $scope.store_assemble.store.id) {
                  foundStore = true
                  indxStore = i
                }
              });
              if (foundStore)
                _item.store_count = _item.branches_list[indxBranch].stores_list[indxStore].current_count
            } else _item.store_count = 0

          } else _item.store_count = 0
        } else _item.store_count = 0

      } else _item.store_count = 0
      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _item.barcode);
      if (!foundSize)
        $scope.item.sizes.unshift(_item);
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
                  _size.store = $scope.store_assemble.store;
                  _size.count = 1;
                  _size.discount = _size.discount;
                  _size.total = _size.count * _size.cost;
                  foundSize = $scope.store_assemble.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize)
                    $scope.store_assemble.items.unshift(_size);
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

  $scope.edit = function (store_assemble) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_assemble);
        $scope.store_assemble = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreAssembleModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_assemble/update",
      data: $scope.store_assemble
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#updateStoreAssembleModal');
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

  $scope.posting = function (store_assemble) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_assemble/posting",
      data: store_assemble
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (store_assemble.posting) {


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

    site.hideModal('#StoresAssembleSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_assemble/all",
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


  $scope.loadItemSize = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.itemSizeList = [];
    $http({
      method: "POST",
      url: "/api/stores_items/sizes_all",
      data: {
        select: { discount: 1, barcode: 1, size: 1, id: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemSizeList = response.data.list;
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
  $scope.loadItemSize();
  $scope.getDefaultSettings();
  $scope.loadAll({ date: new Date() });
});