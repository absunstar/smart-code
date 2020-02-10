app.controller("stores_in", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_in = {
    discountes: [],
    taxes: []
  };
  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.displayAccountInvoice = function (store_in) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: store_in.id,
          vendor: store_in.vendor,
          shift: shift,
          net_value: store_in.net_value,
          paid_up: 0,
          invoice_code: store_in.number,
          total_discount: store_in.total_discount,
          total_tax: store_in.total_tax,
          current_book_list: store_in.items,
          source_type: {
            id: 1,
            en: "Stores In / Purchase Invoice",
            ar: "إذن وارد / فاتورة شراء"
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

  /*  $scope.showCreateInvoice = function (){
     
 
   };
  */

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
        value: 'Purchase Invoice'
      },
      {
        type: 'space'
      },
      {
        type: 'text2',
        value2: site.toDateXF($scope.account_invoices.date),
        value: 'Date'
      });


    if ($scope.account_invoices.vendor)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.vendor.name_ar,
        value: 'Vendor'
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

    if ($scope.account_invoices.total_tax)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_tax,
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

  $scope.addTax = function () {
    $scope.error = '';
    $scope.store_in.taxes = $scope.store_in.taxes || [];
    $scope.store_in.taxes.unshift({
      name: $scope.tax.name,
      value: $scope.tax.value
    });
    $scope.tax = {};
    $scope.calc($scope.store_in);
  };

  $scope.deleteTax = function (_tx) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_in.taxes.length; i++) {
      let tx = $scope.store_in.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value)
        $scope.store_in.taxes.splice(i, 1);
    }
    $scope.calc($scope.store_in);
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.store_in.discountes = $scope.store_in.discountes || [];

      $scope.store_in.discountes.unshift({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
      $scope.calc($scope.store_in);
    };

  };
  $scope.deleteDiscount = function (_ds) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_in.discountes.length; i++) {
      let ds = $scope.store_in.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type)
        $scope.store_in.discountes.splice(i, 1);
    }
    $scope.calc($scope.store_in);
  };

  $scope.calc = function (obj) {
    $scope.error = '';

    obj.total_value = 0;
    obj.net_value = obj.net_value || 0;

    if (obj.items)
      obj.items.map(itm => obj.total_value += site.toNumber(itm.total));

    obj.total_tax = 0;
    if (obj.taxes)
      obj.taxes.map(tx => obj.total_tax += (obj.total_value * site.toNumber(tx.value) / 100));

    obj.total_discount = 0;

    if (obj.discountes)
      obj.discountes.forEach(ds => {
        if (ds.type == 'percent')
          obj.total_discount += (obj.total_value * site.toNumber(ds.value)) / 100;
        else obj.total_discount += site.toNumber(ds.value);
      });

    obj.total_discount = site.toNumber(obj.total_discount);
    obj.total_tax = site.toNumber(obj.total_tax);
    obj.total_value = site.toNumber(obj.total_value);

    if (obj.items) {
      obj.net_value = obj.total_value + obj.total_tax - obj.total_discount;
    }

    $scope.discount = {
      type: 'number'
    };

    if (obj.currency)
      $scope.amount_currency = site.toNumber(obj.net_value) / site.toNumber(obj.currency.ex_rate);
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_in.items.splice($scope.store_in.items.indexOf(itm), 1);
    $scope.calcSize(itm);

  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);
  };
  $scope.newStoreIn = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.edit_price = false;
        $scope.store_in = {
          image_url: '/images/store_in.png',
          shift: $scope.shift,
          items: [],
          invoice: false,
          discountes: [],
          taxes: [],
          date: new Date(),
          supply_date: new Date()
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.vendor)
            $scope.store_in.vendor = $scope.defaultSettings.general_Settings.vendor
          if (!$scope.defaultSettings.general_Settings.work_posting)
            $scope.store_in.posting = true
        }

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_in.store = $scope.defaultSettings.inventory.store
          if ($scope.defaultSettings.inventory.type_in) {
            $scope.store_in.type = $scope.defaultSettings.inventory.type_in

            if ($scope.defaultSettings.accounting) {
              if (($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting.create_invoice_auto) {
                $scope.store_in.currency = $scope.defaultSettings.accounting.currency;
                if ($scope.defaultSettings.accounting.payment_method) {
                  $scope.store_in.payment_method = $scope.defaultSettings.accounting.payment_method;
                  $scope.loadSafes($scope.store_in.payment_method, $scope.store_in.currency);
                  if ($scope.store_in.payment_method.id == 1)
                    $scope.store_in.safe = $scope.defaultSettings.accounting.safe_box;
                  else $scope.store_in.safe = $scope.defaultSettings.accounting.safe_bank;
                }
              }
            }
          }
        }
        site.showModal('#addStoreInModal');
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

    const v = site.validated('#addStoreInModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if ($scope.store_in.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.store_in.type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
      if (!$scope.store_in.safe) {
        $scope.error = "##word.nosafe_warning##";
        return;
      }
    } else {
      if ($scope.store_in.payment_method)
        $scope.store_in.payment_method = null;
      if ($scope.store_in.safe)
        $scope.store_in.safe = null;
      $scope.store_in.paid_up = 0

    }


    let max_discount = false;
    let returned_count = false;


    $scope.store_in.items.forEach(_itemSize => {
      if (_itemSize.discount.value > _itemSize.discount.max)
        max_discount = true;
      if (_itemSize.count > _itemSize.r_count) returned_count = true;
    });

    if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
      if (max_discount) {
        $scope.error = "##word.err_maximum_discount##";
        return;
      }
    };

    if ($scope.store_in.type.id == 4) {
      if (returned_count) {
        $scope.error = "##word.return_item_err##";
        return;
      }
    };

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
            if ($scope.store_in.posting) {
              if (($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {

                let account_invoices = {
                  image_url: '/images/account_invoices.png',
                  date: response.data.doc.date,
                  invoice_id: response.data.doc.id,
                  vendor: response.data.doc.vendor,
                  shift: response.data.doc.shift,
                  net_value: response.data.doc.net_value,
                  currency: response.data.doc.currency,
                  paid_up: response.data.doc.paid_up,
                  payment_method: response.data.doc.payment_method,
                  safe: response.data.doc.safe,
                  invoice_code: response.data.doc.number,
                  total_discount: response.data.doc.total_discount,
                  total_tax: response.data.doc.total_tax,
                  current_book_list: response.data.doc.items,
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

  $scope.remove = function (store_in) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_in);
        $scope.store_in = {};
        site.showModal('#deleteStoreInModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_in) {
    $scope.error = '';
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
        } else $scope.error = response.data.error;
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

  $scope.delete = function (store_in) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/delete",
      data: store_in
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#deleteStoreInModal');
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
    if ($scope.store_in.type) {
      let foundSize = false;
      $scope.item.sizes.forEach(_size => {
        foundSize = $scope.store_in.items.some(_itemSize => _itemSize.barcode == _size.barcode);
        if (_size.count > 0 && !foundSize) {
          let discount = 0;
          if (_size.cost && _size.count) {
            if (_size.discount.type == 'number')
              discount = (_size.discount.value || 0) * _size.count;
            else if (_size.discount.type == 'percent')

              discount = (_size.discount.value || 0) * (_size.cost * _size.count) / 100;
            _size.total = ((site.toNumber(_size.cost) * site.toNumber(_size.count)) - discount);
          }

          $scope.store_in.items.unshift({
            image_url: $scope.item.image_url,
            name: _size.name,
            size: _size.size,
            size_units_list: _size.size_units_list,
            unit: _size.unit,
            cost: _size.unit ? _size.unit.cost : 0,
            price: _size.unit ? _size.unit.price : 0,
            discount: _size.unit ? _size.unit.discount : 0,
            barcode: _size.barcode,
            average_cost: _size.average_cost,
            count: _size.count,
            total: _size.total,
            current_count: _size.current_count,
            ticket_code: _size.ticket_code,
          });
        }
      });

      $scope.calc($scope.store_in);
      $scope.item.sizes = [];
    } else $scope.error = "##word.err_transaction_type##";
  };

  $scope.calcSize = function (size) {
    $scope.error = '';
    setTimeout(() => {
      let discount = 0;
      if (size.cost && size.count) {
        if (size.discount.type == 'number')
          discount = size.discount.value * size.count;
        else if (size.discount.type == 'percent')
          discount = size.discount.value * (size.cost * size.count) / 100;
        size.total = ((site.toNumber(size.cost) * site.toNumber(size.count)) - discount);
      }
      $scope.calc($scope.store_in);
    }, 100);
  };

  $scope.addToSizes = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.unshift({
      $new: true,
      vendor: $scope.store_in.vendor,
      store: $scope.store_in.store,
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
          search: $scope.search_item_name
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

                  if ((_size.barcode == $scope.search_item_name) || foundUnit) {
                    _size.name = _item.name;
                    _size.store = $scope.store_in.store;
                    _size.count = 1;

                    _size.unit = _size.size_units_list[indxUnit];
                    _size.discount = _size.size_units_list[indxUnit].discount;
                    _size.cost = _size.size_units_list[indxUnit].cost
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
                              if (_store.store.id == $scope.store_in.store.id) {
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
                    $scope.calcSize(_size)
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

  $scope.itemsStoresIn = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0)
      $scope.item.name.sizes.forEach(_item => {
        _item.name = $scope.item.name.name
        _item.store = $scope.store_in.store
        _item.count = 1;

        let indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.name.main_unit.id);
        if (_item.size_units_list[indxUnit]) {
          _item.unit = _item.size_units_list[indxUnit];
          _item.discount = _item.size_units_list[indxUnit].discount;
          _item.cost = _item.size_units_list[indxUnit].cost;
        }

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
                  if (_store.store.id == $scope.store_in.store.id) {
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
                  _size.store = $scope.store_in.store;
                  _size.count = 1;
                  _size.unit = _size.size_units_list[indxUnit];
                  _size.discount = _size.size_units_list[indxUnit].discount;
                  _size.cost = _size.size_units_list[indxUnit].cost;
                  _size.total = _size.count * _size.cost;

                  foundSize = $scope.store_in.items.some(_itemSize => _itemSize.barcode == _size.barcode);

                  if (!foundSize)
                    $scope.store_in.items.unshift(_size);
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

  $scope.edit = function (store_in) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_in);
        $scope.store_in = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreInModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    if ($scope.store_in.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
      let max_discount = false;
      $scope.store_in.items.forEach(_itemSize => {
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

  $scope.posting = function (store_in) {
    $scope.error = '';

    if (!store_in.posting) {
      if (store_in.net_value != store_in.return_paid.net_value)
        $scope.error = '##word.err_unpost_return##';
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/posting",
      data: store_in
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (store_in.posting) {
            if (store_in.type.id == 1 && store_in.type.id == 4 && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {

              let account_invoices = {
                image_url: '/images/account_invoices.png',
                date: store_in.date,
                invoice_id: store_in.id,
                vendor: store_in.vendor,
                shift: store_in.shift,
                net_value: store_in.net_value,
                paid_up: store_in.paid_up,
                currency: store_in.currency,
                payment_method: store_in.payment_method,
                safe: store_in.safe,
                invoice_code: store_in.number,
                total_discount: store_in.total_discount,
                total_tax: store_in.total_tax,
                current_book_list: store_in.items,
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

  $scope.loadStoresInTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: '/api/stores_in/types/all',
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesInTypes = response.data;
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

  $scope.loadTax_Types = function () {
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

  $scope.loadDiscount_Types = function () {
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
  $scope.loadVendors = function () {
    $scope.error = '';
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

  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    $scope.search = {};
    site.hideModal('#StoresInSearchModal');
  };

  $scope.showReturnedStoreOut = function (ev) {
    $scope.error = '';
    $scope.list = {};
    if (ev.which === 13) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_in/all",
        data: {
          search: $scope.storesOutSearch,
          where: { 'posting': true, 'type.id': 1 }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.storesOutlist = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    }
  };

  $scope.selectReturnedStoreOut = function (i) {

    if ($scope.store_in && i.return_paid) {

      $scope.store_in.retured_number = i.number;
      $scope.store_in.total_discount = i.return_paid.total_discount;
      $scope.store_in.total_tax = i.return_paid.total_tax;
      $scope.store_in.total_value = i.return_paid.total_value;
      $scope.store_in.net_value = i.return_paid.net_value;

      $scope.store_in.items = [];
      i.return_paid.items.forEach(_item => {
        _item.r_count = _item.count;
        if (_item.count > 0) $scope.store_in.items.push(_item);
      });

      if ($scope.store_in.currency)
        $scope.amount_currency = site.toNumber($scope.store_in.net_value) / site.toNumber($scope.store_in.currency.ex_rate);

      site.hideModal('#returnedViewModal');
    };

  };


  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = {};
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/all",
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

  $scope.getSafeBySetting = function () {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      if (($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting.create_invoice_auto) {
        if ($scope.defaultSettings.accounting.payment_method) {
          $scope.store_in.payment_method = $scope.defaultSettings.accounting.payment_method
          $scope.loadSafes($scope.store_in.payment_method, $scope.store_in.currency)
          if ($scope.store_in.payment_method.id == 1) {
            if ($scope.defaultSettings.accounting.safe_box)
              $scope.store_in.safe = $scope.defaultSettings.accounting.safe_box
          } else {
            if ($scope.defaultSettings.accounting.safe_bank)
              $scope.store_in.safe = $scope.defaultSettings.accounting.safe_bank
          }
        }
      }
    }
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

  $scope.handelStoreIn = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/handel_store_in"
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

  $scope.loadStoresInTypes();
  $scope.loadVendors();
  $scope.loadStores();
  $scope.loadCategories();
  $scope.loadCurrencies();
  $scope.getPaymentMethodList();
  $scope.loadTax_Types();
  $scope.loadDiscount_Types();
  $scope.getDefaultSettings();
  $scope.loadAll({ date: new Date() });
});