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
    const v = site.validated('#addTransferBranchModal');
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
          name: _size.name,
          size: _size.size,
          units_list: _size.units_list,
          unit: _size.unit,
          barcode: _size.barcode,
          average_cost: _size.average_cost,
          count: _size.count,
          cost: _size.cost,
          price: _size.price,
          store_count: _size.store_count,
          total: _size.total,
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
                _item.sizes.forEach(_size => {
                  if (_size.barcode == $scope.item.search_item_name) {
                    _size.name = _item.name
                    _size.store_from = $scope.transfer_branch.store_from
                    _size.units_list = _item.units_list;
                    _size.unit = _item.units_list[0];
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
                              if (_store.store.id == $scope.transfer_branch.store_from.id) {
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

  $scope.itemsTransferBranch = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    $scope.item.name.sizes.forEach(_item => {
      _item.name = $scope.item.name.name
      _item.store_from = $scope.transfer_branch.store_from
      _item.count = 1;
      _item.total = _item.count * _item.cost

      _item.units_list = $scope.item.name.units_list
      _item.unit = $scope.item.name.units_list[0];

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
                if (_store.store.id == $scope.transfer_branch.store_from.id) {
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
        $scope.item.sizes.push(_item);
    });
  };

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
              response.data.list[0].sizes.forEach(_size => {
                if (_size.barcode == $scope.search_barcode) {
                  _size.name = response.data.list[0].name;
                  _size.store_from = $scope.transfer_branch.store_from;
                  _size.units_list = response.data.list[0].units_list;
                  _size.unit = response.data.list[0].units_list[0];
                  _size.count = 1;
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
                            if (_store.store.id == $scope.transfer_branch.store_from.id) {
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
                  foundSize = $scope.transfer_branch.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize)
                    $scope.transfer_branch.items.unshift(_size);
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
    const v = site.validated('#updateTransferBranchModal');
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

  $scope.confirmTransfer = function (transfer_branch) {
    $scope.error = '';

    transfer_branch.transfer = true;
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/confirm",
      data: transfer_branch
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
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

  $scope.loadStoresTo = function (branchTo) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: {
        select: { id: 1, name: 1, type: 1 },
        branchTo: branchTo
      }

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
    $scope.loadAll($scope.search);
    site.hideModal('#transferSearchModal');
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

  $scope.handelTransfer = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/transfer_branch/handel_transfer_branch"
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

  $scope.loadCategories();
  $scope.loadBranches();
  $scope.loadStoresFrom();
  $scope.loadAll({ date: new Date() });
});