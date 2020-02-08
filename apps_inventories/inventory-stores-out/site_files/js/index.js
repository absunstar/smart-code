app.controller("stores_out", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_out = {
    discountes: [],
    taxes: []
  };
  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.addTax = function () {
    $scope.error = '';
    $scope.store_out.taxes = $scope.store_out.taxes || [];
    $scope.store_out.taxes.push({
      name: $scope.tax.name,
      value: $scope.tax.value
    });
    $scope.tax = {};
    $scope.calc($scope.store_out);
  };

  $scope.deleteTax = function (_tx) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_out.taxes.length; i++) {
      let tx = $scope.store_out.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value)
        $scope.store_out.taxes.splice(i, 1);
    }
    $scope.calc($scope.store_out);
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.store_out.discountes = $scope.store_out.discountes || [];

      $scope.store_out.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
      $scope.calc($scope.store_out);
    };

  };

  $scope.deleteDiscount = function (_ds) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_out.discountes.length; i++) {
      let ds = $scope.store_out.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type)
        $scope.store_out.discountes.splice(i, 1);
    }
    $scope.calc($scope.store_out);
  };

  $scope.calc = function (obj) {
    $scope.error = '';
    obj.total_value = 0;
    obj.net_value = obj.net_value || 0;

    if (obj.items)
      obj.items.map(itm => obj.total_value += site.toNumber(itm.total));

    obj.total_tax = 0;

    if (obj.taxes)
      obj.taxes.map(tx => obj.total_tax += obj.total_value * site.toNumber(tx.value) / 100);

    obj.total_discount = 0;
    if (obj.discountes && obj.discountes.length > 0)
      obj.discountes.forEach(ds => {

        if (ds.type == 'percent')
          obj.total_discount += obj.total_value * site.toNumber(ds.value) / 100;
        else obj.total_discount += site.toNumber(ds.value);
      });

    if (obj.total_value > 0)
      obj.net_value = obj.total_value + obj.total_tax - obj.total_discount;

    if (obj.currency)
      $scope.amount_currency = site.toNumber(obj.net_value) / site.toNumber(obj.currency.ex_rate);

    $scope.discount = {
      type: 'number'
    };


  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_out.items.splice($scope.store_out.items.indexOf(itm), 1);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };
  $scope.newStoreOut = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.edit_price = false;
        $scope.store_out = {
          image_url: '/images/store_out.png',
          shift: $scope.shift,
          items: [],
          invoice: false,
          discountes: [],
          taxes: [],
          date: new Date(),
          supply_date: new Date()
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.customer)
            $scope.store_out.customer = $scope.defaultSettings.general_Settings.customer;
          if (!$scope.defaultSettings.general_Settings.work_posting)
            $scope.store_out.posting = true
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_out.store = $scope.defaultSettings.inventory.store;
          if ($scope.defaultSettings.inventory.type_out)
            $scope.store_out.type = $scope.defaultSettings.inventory.type_out;
          if ($scope.defaultSettings.inventory.delegate)
            $scope.store_out.delegate = $scope.defaultSettings.inventory.delegate;
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.create_invoice_auto) {
            $scope.store_out.currency = $scope.defaultSettings.accounting.currency;
            if ($scope.defaultSettings.accounting.payment_method) {
              $scope.store_out.payment_method = $scope.defaultSettings.accounting.payment_method;
              $scope.loadSafes($scope.store_out.payment_method, $scope.store_out.currency);
              if ($scope.store_out.payment_method.id == 1)
                $scope.store_out.safe = $scope.defaultSettings.accounting.safe_box;
              else $scope.store_out.safe = $scope.defaultSettings.accounting.safe_bank;
            }
          }
        }

        site.showModal('#addStoreOutModal');
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
    const v = site.validated('#addStoreOutModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.store_out.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
      let max_discount = false;

      $scope.store_out.items.forEach(_itemSize => {
        if (_itemSize.discount.value > _itemSize.discount.max)
          max_discount = true;
      });


      if (max_discount) {
        $scope.error = "##word.err_maximum_discount##";
        return;
      }
    }

    if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
      if (!$scope.store_out.safe) {
        $scope.error = "##word.nosafe_warning##";
        return;
      }
    } else {
      if ($scope.store_out.payment_method)
        $scope.store_out.payment_method = null;
      if ($scope.store_out.safe)
        $scope.store_out.safe = null;
      $scope.store_out.paid_up = 0

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
            if ($scope.store_out.posting) {
              if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {

                let account_invoices = {
                  image_url: '/images/account_invoices.png',
                  date: response.data.doc.date,
                  invoice_id: response.data.doc.id,
                  customer: response.data.doc.customer,
                  currency: response.data.doc.currency,
                  shift: response.data.doc.shift,
                  net_value: response.data.doc.net_value,
                  paid_up: response.data.doc.paid_up,
                  payment_method: response.data.doc.payment_method,
                  safe: response.data.doc.safe,
                  invoice_code: response.data.doc.number,
                  total_discount: response.data.doc.total_discount,
                  total_tax: response.data.doc.total_tax,
                  current_book_list: response.data.doc.items,
                  source_type: {
                    id: 2,
                    en: "Stores Out / Sales Invoice",
                    ar: "إذن صرف / فاتورة مبيعات"
                  },
                  active: true
                };
                $scope.addAccountInvoice(account_invoices)
              }
            }

            site.hideModal('#addStoreOutModal');
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

  $scope.remove = function (store_out) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_out);
        $scope.store_out = {};
        site.showModal('#deleteStoreOutModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_out) {
    $scope.error = '';
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
        } else $scope.error = response.data.error;
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

  $scope.delete = function (store_out) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/delete",
      data: store_out
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreOutModal');
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
    if ($scope.store_out.type) {
      let foundSize = false;
      $scope.item.sizes.forEach(_size => {
        foundSize = $scope.store_out.items.some(_itemSize => _itemSize.barcode == _size.barcode);
        if (_size.count > 0 && !foundSize) {
          $scope.store_out.items.push({
            image_url: $scope.item.image_url,
            name: _size.name,
            size: _size.size,
            size_units_list: _size.size_units_list,
            unit: _size.unit,
            cost: _size.unit.cost,
            price: _size.unit.price,
            discount: _size.unit.discount,
            barcode: _size.barcode,
            average_cost: _size.average_cost,
            count: _size.count,
            cost: _size.cost,
            discount: _size.discount,
            price: _size.price,
            total: _size.total,
            current_count: _size.current_count,
            ticket_code: _size.ticket_code,
          });
        }
      });
      $scope.calc($scope.store_out);
      $scope.item.sizes = [];
    } else $scope.error = "##word.err_transaction_type##";
  };

  $scope.calcSize = function (size) {
    $scope.error = '';
    setTimeout(() => {
      let discount = 0;
      if (size.price && size.count) {
        if (size.discount.type == 'number')
          discount = size.discount.value * size.count;
        else if (size.discount.type == 'percent')
          discount = size.discount.value * (size.price * size.count) / 100;

        size.total = ((site.toNumber(size.price) * site.toNumber(size.count)) - discount);
      }
      $scope.calc($scope.store_out);
    }, 100);
  };

  $scope.addToSizes = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.push({
      $new: true,
      customer: $scope.store_out.customer,
      store: $scope.store_out.store,
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
                    _size.store = $scope.store_out.store
                    _size.unit = _size.size_units_list[indxUnit];
                    _size.discount = _size.size_units_list[indxUnit].discount;
                    _size.price = _size.size_units_list[indxUnit].price
                    _size.count = 1
                    _size.total = _size.count * _size.price
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
                              if (_store.store.id == $scope.store_out.store.id) {
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

  $scope.itemsStoresOut = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    $scope.item.name.sizes.forEach(_item => {
      _item.name = $scope.item.name.name
      _item.store = $scope.store_out.store
      _item.count = 1

      let indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.name.main_unit.id);
      if (_item.size_units_list[indxUnit]) {
        _item.unit = _item.size_units_list[indxUnit];
        _item.discount = _item.size_units_list[indxUnit].discount;
        _item.price = _item.size_units_list[indxUnit].price;
        _item.total = _item.count * _item.price;
      }

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
                if (_store.store.id == $scope.store_out.store.id) {
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
                  _size.store = $scope.store_out.store;
                  _size.unit = _size.size_units_list[indxUnit];
                  _size.discount = _size.size_units_list[indxUnit].discount;
                  _size.price = _size.size_units_list[indxUnit].price;
                  _size.count = 1;
                  foundSize = $scope.store_out.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize)
                    $scope.store_out.items.unshift(_size);
                }
                $scope.calcSize(_size);
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

  $scope.edit = function (store_out) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_out);
        $scope.edit_price = false;
        $scope.store_out = {};
        site.showModal('#updateStoreOutModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    if ($scope.store_out.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }


    if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
      let max_discount = false;
      $scope.store_out.items.forEach(_itemSize => {
        if (_itemSize.discount.value > _itemSize.discount.max)
          max_discount = true;
      });

      if (max_discount) {
        $scope.error = "##word.err_maximum_discount##";
        return;
      }
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

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name: 1,
          ex_rate: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currenciesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(obj.payment_method, obj.currency);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box)
          obj.safe = $scope.defaultSettings.accounting.safe_box
      } else {
        if ($scope.defaultSettings.accounting.safe_bank)
          obj.safe = $scope.defaultSettings.accounting.safe_bank
      }
    }
  };

  $scope.loadSafes = function (method, currency) {
    $scope.error = '';
    $scope.busy = true;

    let where = { 'currency.id': currency.id };

    if (method.id == 1)
      where['type.id'] = 1;
    else where['type.id'] = 2;

    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1,
          currency: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.safesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.loadStoresOutTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_out/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesOutTypes = response.data;
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

  $scope.loadTaxTypes = function () {
    $scope.error = '';
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
        if (response.data.done) $scope.tax_types = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = '';
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
        if (response.data.done) $scope.discount_types = response.data.list;
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
        $gte: site.toNumber($scope.search.total_valueGt)
      };
    }

    if ($scope.search.total_valueLt) {
      where['total_value'] = {
        $lte: site.toNumber($scope.search.total_valueLt)
      };
    }

    if ($scope.search.total_valueGt && $scope.search.total_valueLt) {
      where['total_value'] = {
        $gte: site.toNumber($scope.search.total_valueGt),
        $lte: site.toNumber($scope.search.total_valueLt)
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
      url: "/api/stores_out/all",
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

  $scope.displayAccountInvoice = function (store_out) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: store_out.id,
          customer: store_out.customer,
          shift: shift,
          net_value: store_out.net_value,
          paid_up: 0,
          invoice_code: store_out.number,
          total_discount: store_out.total_discount,
          total_tax: store_out.total_tax,
          current_book_list: store_out.items,
          source_type: {
            id: 2,
            en: "Stores Out / Sales Invoice",
            ar: "إذن صرف / فاتورة بيع"
          },
          active: true
        };

        if ($scope.defaultSettings.accounting) {
          $scope.account_invoices.currency = $scope.defaultSettings.accounting.currency;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id == 1)
              $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.account_invoices.currency)
          $scope.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
        $scope.calc($scope.account_invoices);

        site.showModal('#accountInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAccountInvoice = function (account_invoices) {
    $scope.error = '';
    $scope.busy = true;

    if (account_invoices.paid_up > 0 && !account_invoices.safe) {
      $scope.error = "##word.should_select_safe##";
      return;

    } else if (account_invoices.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting)
      account_invoices.posting = false;
    else account_invoices.posting = true;

    if (account_invoices.paid_up <= 0) account_invoices.safe = null;
    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response) {
          site.hideModal('#accountInvoiceModal');
          $scope.printAccountInvoive();
          $scope.loadAll();
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.printAccountInvoive = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    };

    if ($scope.account_invoices)
      $scope.account_invoices.total_remain = $scope.account_invoices.net_value - ($scope.account_invoices.paid_up * $scope.account_invoices.currency.ex_rate);

    let obj_print = { data: [] };

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path)
      obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.trim();

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_header)
      obj_print.data.push({
        type: 'header',
        value: $scope.defaultSettings.printer_program.invoice_header
      });


    obj_print.data.push(
      {
        type: 'title',
        value: 'Sales Invoice'
      },
      {
        type: 'space'
      },
      {
        type: 'text2',
        value2: site.toDateXF($scope.account_invoices.date),
        value: 'Date'
      });

    if ($scope.account_invoices.customer)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.customer.name_ar,
        value: 'Cutomer'
      });

    obj_print.data.push({
      type: 'line'
    });

    if ($scope.account_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_discount,
        value: 'Total Discount'
      });

    if ($scope.account_invoices.total_Tax)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_Tax,
        value: 'Total Tax'
      });

    obj_print.data.push({ type: 'space' });

    if ($scope.account_invoices.net_value)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.net_value,
          value: "Total Value"
        });

    if ($scope.account_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.paid_up,
          value: "Paid Up"
        });

    if ($scope.account_invoices.currency)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.currency,
          value: "Currency"
        });

    obj_print.data.push({ type: 'space' });

    if ($scope.account_invoices.total_remain)
      obj_print.data.push({
        type: 'text2b',
        value2: $scope.account_invoices.total_remain,
        value: "Required to pay"
      });

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer)
      obj_print.data.push({
        type: 'footer',
        value: $scope.defaultSettings.printer_program.invoice_footer
      });

    $http({
      method: "POST",
      url: `http://${ip}:${port}/print`,
      data: obj_print
    }).then(
      function (response) {
        if (response)
          $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: {
          id: 1,
          name: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.customerGroupList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getIndentfy = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.indentfyList = [];
    $http({
      method: "POST",
      url: "/api/indentfy_employee/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.indentfyList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.displayAddCustomer = function () {
    $scope.error = '';
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
    };
    site.showModal('#customerAddModal');
    document.querySelector('#customerAddModal .tab-link').click();
  };

  $scope.addCustomer = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    const v = site.validated('#customerAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerAddModal');
          $scope.count = $scope.list.length;
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer
          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.customersList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'city.id': city.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDelegates = function () {
    $scope.busy = true;
    $scope.delegatesList = [];
    $http({
      method: "POST",
      url: "/api/delegates/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.delegatesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPaymentMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.paymentMethodList = [];
    $http({
      method: "POST",
      url: "/api/payment_method/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.paymentMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.posting = function (store_out) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/posting",
      data: store_out
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (store_out.posting) {
            if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {

              let account_invoices = {
                image_url: '/images/account_invoices.png',
                date: store_out.date,
                invoice_id: store_out.id,
                vendor: store_out.vendor,
                shift: store_out.shift,
                net_value: store_out.net_value,
                currency: store_out.currency,
                paid_up: store_out.paid_up,
                payment_method: store_out.payment_method,
                safe: store_out.safe,
                invoice_code: store_out.number,
                total_discount: store_out.total_discount,
                total_tax: store_out.total_tax,
                current_book_list: store_out.items,
                source_type: {
                  id: 1,
                  en: "Stores In / Purchase Invoice",
                  ar: "إذن وارد / فاتورة شراء"
                },
                active: true
              };

              $scope.addAccountInvoice(account_invoices)
            }
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

  $scope.handeStoreOut = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/handel_store_out"
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

  $scope.loadStoresOutTypes();
  $scope.loadStores();
  $scope.loadCategories();
  $scope.getPaymentMethodList();
  $scope.getGovList();
  $scope.loadTaxTypes();
  $scope.getIndentfy();
  $scope.getCustomerGroupList();
  $scope.loadDelegates();
  $scope.getDefaultSettings();
  $scope.loadCurrencies();
  $scope.loadDiscountTypes();
  $scope.loadAll({ date: new Date() });

});