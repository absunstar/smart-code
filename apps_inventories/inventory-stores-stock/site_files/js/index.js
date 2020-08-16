app.controller("stores_stock", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_stock = {};
  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_stock.items.splice($scope.store_stock.items.indexOf(itm), 1);
  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newStoreStock = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.store_stock = {
          image_url: '/images/store_stock.png',
          shift: $scope.shift,
          items: [],
          date: new Date(),
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_stock.store = $scope.defaultSettings.inventory.store
        }
        site.showModal('#addStoreStockModal');
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

    const v = site.validated('#addStoreStockModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.store_stock.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    }

    $scope.store_stock.status = 1;

    if ($scope.store_stock.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_stock/add",
        data: $scope.store_stock
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#addStoreStockModal');

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

  $scope.remove = function (store_stock) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_stock);
        $scope.store_stock = {};
        site.showModal('#deleteStoreStockModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_stock) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/view",
      data: {
        _id: store_stock._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_stock = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_stock) {
    $scope.error = '';
    $scope.view(store_stock);
    $scope.store_stock = {};
    site.showModal('#viewStoreStockModal');
  };

  $scope.delete = function (store_stock) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/delete",
      data: store_stock
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreStockModal');
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

    if ($scope.item.sizes && $scope.item.sizes.length > 0)
      $scope.item.sizes.forEach(_size => {
        foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode == _size.barcode);
        if (!foundSize) {
          $scope.store_stock.items.unshift({
            image_url: $scope.item.image_url,
            name: _size.name,
            size: _size.size,
            item_group: _size.item_group,
            size_en: _size.size_en,
            size_units_list: _size.size_units_list,
            barcode: _size.barcode,
            complex_items: _size.complex_items,
            ticket_code: _size.ticket_code,
          });
        }
      });

    $scope.item.sizes = [];
  };

  $scope.getItemsName = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
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

                if (_item.sizes && _item.sizes.length > 0)
                  _item.sizes.forEach(_size => {
                    let foundHold = false;
                    let foundUnit = false;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach(_unit => {
                        if ((_unit.barcode == $scope.item.search_item_name) && typeof _unit.barcode == 'string') {
                          foundUnit = true;
                        }

                        if (_size.branches_list && _size.branches_list.length > 0) {
                          let foundBranch = false;
                          let indxBranch = 0;
                          _size.branches_list.map((_branch, i) => {
                            if (_branch.code == '##session.branch.code##') {
                              foundBranch = true;
                              indxBranch = i;
                            }
                          });

                          if (foundBranch) {
                            if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                              if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {
                                let foundStore = false;
                                let indxStore = 0;
                                _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                  if (_store.store.id == $scope.store_stock.store.id) {
                                    foundStore = true;
                                    indxStore = i;
                                    if (_store.hold) foundHold = true;
                                  }
                                });
                                _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                  if (foundStore && _unitStore.id == _unit.id)
                                    _unit.store_count = _unitStore.current_count || 0;
                                });
                              }
                            }
                          }
                        }
                      });
                    if ((_size.barcode == $scope.item.search_item_name) || (_size.size_en && _size.size_en.contains($scope.item.search_item_name)) || (_size.size && _size.size.contains($scope.item.search_item_name)) || foundUnit) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;
                      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _size.barcode);
                      if (!foundSize && !foundHold) $scope.item.sizes.unshift(_size);
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

  $scope.itemsStoresStock = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0)
      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;
        _item.name = $scope.item.name.name
        _item.item_group = $scope.item.name.item_group;

        if (_item.size_units_list && _item.size_units_list.length > 0)
          _item.size_units_list.forEach(_unit => {

            if (_item.branches_list && _item.branches_list.length > 0) {
              let foundBranch = false;
              let indxBranch = 0;
              _item.branches_list.map((_branch, i) => {
                if (_branch.code == '##session.branch.code##') {
                  foundBranch = true;
                  indxBranch = i;
                }
              });
              if (foundBranch) {

                if (_item.branches_list[indxBranch].code == '##session.branch.code##') {
                  if (_item.branches_list[indxBranch].stores_list && _item.branches_list[indxBranch].stores_list.length > 0) {

                    let foundStore = false;
                    let indxStore = 0;
                    _item.branches_list[indxBranch].stores_list.map((_store, i) => {
                      if (_store.store.id == $scope.store_stock.store.id) {
                        foundStore = true;
                        indxStore = i;
                        if (_store.hold) foundHold = true;
                      }
                    });
                    _item.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                      if (foundStore && _unitStore.id == _unit.id)
                        _unit.store_count = _unitStore.current_count || 0;
                    });
                  }
                }
              }
            }
          });

        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _item.barcode);
        if (!foundSize && !foundHold) $scope.item.sizes.unshift(_item);
      });
  };


  $scope.stockItemsGroup = function (item_group) {
    $scope.error = '';
    $scope.store_stock.items = [];
    where = { item_group: item_group }
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: { where: where }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.list.length > 0) {
            let foundSize = false;
            response.data.list.forEach(_list => {

              if (_list.sizes && _list.sizes.length > 0)
                _list.sizes.forEach(_size => {
                  let foundHold = false;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {

                      if (_size.branches_list && _size.branches_list.length > 0) {
                        let foundBranch = false;
                        let indxBranch = 0;
                        _size.branches_list.map((_branch, i) => {
                          if (_branch.code == '##session.branch.code##') {
                            foundBranch = true;
                            indxBranch = i;
                          }
                        });
                        if (foundBranch) {

                          if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                            if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {

                              let foundStore = false;
                              let indxStore = 0;
                              _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                if (_store.store.id == $scope.store_stock.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id)
                                  _unit.store_count = _unitStore.current_count || 0
                              });
                            }
                          }
                        }
                      }
                    });

                  _size.name = _list.name;
                  _size.item_group = _list.item_group;
                  foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize && !foundHold) $scope.store_stock.items.unshift(_size);

                });
            });

            if (foundSize) $scope.error = '##word.dublicate_item##';
          }

        } else {
          $scope.error = response.data.error;
        };
      },
      function (err) {
        console.log(err);
      }
    );
  }


  $scope.stockGeneral = function () {
    $scope.error = '';
    $scope.store_stock.items = [];
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.list.length > 0) {
            let foundSize = false;
            response.data.list.forEach(_list => {

              if (_list.sizes && _list.sizes.length > 0)
                _list.sizes.forEach(_size => {
                  let foundHold = false;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {

                      if (_size.branches_list && _size.branches_list.length > 0) {
                        let foundBranch = false;
                        let indxBranch = 0;
                        _size.branches_list.map((_branch, i) => {
                          if (_branch.code == '##session.branch.code##') {
                            foundBranch = true;
                            indxBranch = i;
                          }
                        });
                        if (foundBranch) {

                          if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                            if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {

                              let foundStore = false;
                              let indxStore = 0;
                              _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                if (_store.store.id == $scope.store_stock.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id)
                                  _unit.store_count = _unitStore.current_count || 0
                              });
                            }
                          }
                        }
                      }
                    });

                  _size.name = _list.name;
                  _size.item_group = _list.item_group;
                  foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize && !foundHold) $scope.store_stock.items.unshift(_size);

                });
            });

            if (foundSize) $scope.error = '##word.dublicate_item##';
          }

        } else {
          $scope.error = response.data.error;
        };
      },
      function (err) {
        console.log(err);
      }
    );
  }

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          search: $scope.search_barcode
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;

              if (response.data.list[0].sizes && response.data.list[0].sizes.length > 0)
                response.data.list[0].sizes.forEach(_size => {
                  let foundHold = false;
                  let foundUnit = false;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {
                      if ((_unit.barcode == $scope.search_barcode) && typeof _unit.barcode == 'string') {
                        foundUnit = true;
                      }

                      if (_size.branches_list && _size.branches_list.length > 0) {
                        let foundBranch = false;
                        let indxBranch = 0;
                        _size.branches_list.map((_branch, i) => {
                          if (_branch.code == '##session.branch.code##') {
                            foundBranch = true;
                            indxBranch = i;
                          }
                        });
                        if (foundBranch) {

                          if (_size.branches_list[indxBranch].code == '##session.branch.code##') {
                            if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {

                              let foundStore = false;
                              let indxStore = 0;
                              _size.branches_list[indxBranch].stores_list.map((_store, i) => {
                                if (_store.store.id == $scope.store_stock.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id)
                                  _unit.store_count = _unitStore.current_count || 0
                              });
                            }
                          }
                        }
                      }
                    });

                  if ((_size.barcode == $scope.search_barcode) || foundUnit) {

                    _size.name = response.data.list[0].name;
                    _size.item_group = response.data.list[0].item_group;

                    foundSize = $scope.store_stock.items.some(_itemSize => _itemSize.barcode == _size.barcode);

                    if (!foundSize && !foundHold) $scope.store_stock.items.unshift(_size);
                  }

                });
              if (foundSize) $scope.error = '##word.dublicate_item##';

              $scope.search_barcode = '';
            }
            $timeout(() => {
              document.querySelector('#search_barcode input').focus();
            }, 200);

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

  $scope.settlement = function (store_stock) {
    $scope.store_stock = store_stock;
    site.showModal('#settlementItemsModal');
  };

  $scope.edit = function (store_stock) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_stock);
        $scope.store_stock = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreStockModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function (store_stock) {
    $scope.error = '';
    $scope.busy = true;

    if (new Date(store_stock.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };


    $http({
      method: "POST",
      url: "/api/stores_stock/update",
      data: store_stock
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          if (store_stock.status == 1) site.hideModal('#updateStoreStockModal');
          else site.hideModal('#settlementItemsModal');

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

  $scope.approve = function (store_stock) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/approve",
      data: store_stock
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.loadAll();
        else $scope.error = '##word.error##';
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


  $scope.calcAverage = function (stock) {
    setTimeout(() => {

      stock.total_difference_cost = 0;
      stock.items.forEach(_itm => {
        _itm.size_units_list.forEach(_itmUnit => {
          if(_itmUnit.stock_count){
            let remain = (_itmUnit.stock_count) - _itmUnit.store_count;
            _itmUnit.difference_cost = remain * _itmUnit.average_cost;
            stock.total_difference_cost += _itmUnit.difference_cost
          }

        });
      });


    }, 150);
  };


  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    $scope.search = {};

    site.hideModal('#StoresStockSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/all",
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