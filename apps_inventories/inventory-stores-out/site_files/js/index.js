window.addEventListener('keydown', (e) => {

  if (e.keyCode == 113 /*f12*/) {
    scope().add()
  }

}, true)

function scope() {
  return angular.element(document.querySelector('[ng-controller="stores_out"]')).scope()
}


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

      $scope.discount = {
        type: 'number'
      };
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

    $timeout(() => {
      obj.total_value = 0;
      obj.net_value = obj.net_value || 0;

      if (obj.items) {

        obj.total_value_added = 0;
        obj.items.forEach(_itm => {
          obj.total_value += site.toNumber(_itm.total);
          _itm.total_v_a = site.toNumber(_itm.value_added) * (_itm.price * _itm.count) / 100;
          _itm.total_v_a = site.toNumber(_itm.total_v_a);

          obj.total_value_added += _itm.total_v_a;
        });
        obj.total_value_added = site.toNumber(obj.total_value_added);
      };


      if (obj.type && obj.type.id !== 6) {
        obj.total_tax = 0;
        obj.total_discount = 0;
      };

      if (obj.taxes)
        obj.taxes.map(tx => obj.total_tax += obj.total_value * site.toNumber(tx.value) / 100);

      if (obj.discountes)
        obj.discountes.forEach(ds => {

          if (ds.type == 'percent')
            obj.total_discount += obj.total_value * site.toNumber(ds.value) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });

      obj.total_discount = site.toNumber(obj.total_discount);
      obj.total_tax = site.toNumber(obj.total_tax);
      obj.total_value = site.toNumber(obj.total_value);

      if (obj.items) {
        obj.net_value = obj.total_value + obj.total_tax - obj.total_discount;
      };

      obj.net_value = site.toNumber(obj.net_value);

      if (obj.currency) {
        $scope.amount_currency = site.toNumber(obj.net_value) / site.toNumber(obj.currency.ex_rate);
        $scope.amount_currency = site.toNumber($scope.amount_currency);
        obj.paid_up = $scope.amount_currency;
      }


    }, 250);
  };

  $scope.calcReturn = function (obj) {
    $timeout(() => {
      obj.net_value = ((obj.total_value || 0) - (obj.total_discount || 0)) + (obj.total_tax || 0);
      obj.net_value = site.toNumber(obj.net_value);
    }, 250);
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_out.items.splice($scope.store_out.items.indexOf(itm), 1);
    $scope.calcSize(itm);
  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);

  };

  $scope.newStoreOut = function () {

    $scope.error = '';
    $scope.discount = {
      name: 'خصم',
      type: 'number'
    };

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.shift = shift;
        $scope.error = '';
        $scope.item = {}
        $scope.edit_price = false;

        $scope.store_out = {
          image_url: '/images/store_out.png',
          shift: shift,
          items: [],
          invoice: false,
          discountes: [],
          taxes: [],
          type: $scope.source_type,
          date: new Date(),
          supply_date: new Date()
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.customer)
            $scope.customersList = [$scope.defaultSettings.general_Settings.customer];
          $scope.store_out.customer = $scope.defaultSettings.general_Settings.customer;
          if (!$scope.defaultSettings.general_Settings.work_posting)
            $scope.store_out.posting = true
        };

        if ($scope.defaultSettings.inventory) {

          if ('##user.type##' == 'delegate') {
            $scope.store_out.store = JSON.parse('##user.store##');
          } else if ($scope.defaultSettings.inventory.store)
            $scope.store_out.store = $scope.defaultSettings.inventory.store;

          if ('##user.type##' == 'delegate') {
            $scope.store_out.delegate = $scope.delegatesList[0];

          } else if ($scope.defaultSettings.inventory.delegate)
            $scope.store_out.delegate = $scope.defaultSettings.inventory.delegate;
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.create_invoice_auto && $scope.store_out.type && $scope.store_out.type.id != 5) {
            $scope.store_out.currency = $scope.currencySetting;
            if ($scope.defaultSettings.accounting.payment_method) {
              $scope.store_out.payment_method = $scope.defaultSettings.accounting.payment_method;
              $scope.loadSafes($scope.store_out.payment_method, $scope.store_out.currency, () => {
                if ($scope.store_out.payment_method.id == 1) {
                  $scope.store_out.safe = $scope.defaultSettings.accounting.safe_box;
                } else {
                  $scope.store_out.safe = $scope.defaultSettings.accounting.safe_bank;
                }
              });
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

  $scope.testPatches = function (storeOut, callback) {

    let obj = {
      patchCount: false,
      patch_list: []
    };

    storeOut.items.forEach(_item => {
      if (_item.size_units_list && _item.size_units_list.length > 0) {

        let count = 0;
        if (_item.patch_list && _item.patch_list.length > 0) {
          _item.patch_list.forEach(_pl => {
            if (typeof _pl.count === 'number') {

              count += _pl.count;

            } else {
              obj.patchCount = true;
              obj.patch_list.push(_item.barcode)
            }
          });
        } else if (_item.work_serial || _item.work_patch) {
          obj.patchCount = true;
          obj.patch_list.push(_item.barcode)
        }
        if (count != _item.count && (_item.work_serial || _item.work_patch)) {
          obj.patchCount = true;
          obj.patch_list.push(_item.barcode)
        }

      }
    });

    obj.patch_list = obj.patch_list.filter(function (item, pos) {
      return obj.patch_list.indexOf(item) === pos;
    });

    callback(obj)
  };


  $scope.add = function () {
    $scope.error = '';
    const v = site.validated('#addStoreOutModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.detailsCustomer((customer) => {

      if (new Date($scope.store_out.date) > new Date()) {
        $scope.error = "##word.date_exceed##";
        return;
      }

      if ($scope.store_out.type && $scope.store_out.type.id != 5 && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
        if (!$scope.store_out.safe) {
          $scope.error = "##word.nosafe_warning##";
          return;
        }
      }

      if ($scope.store_out.paid_up > $scope.amount_currency) {
        $scope.error = "##word.err_net_value##";
        return;
      }

      let max_discount = false;
      let returned_count = false;
      let notExistCount = false;


      if ($scope.store_out.items && $scope.store_out.items.length > 0) {
        notExistCount = $scope.store_out.items.some(_iz => _iz.count < 1);

        $scope.store_out.items.forEach(_itemSize => {

          if (_itemSize.discount.value > _itemSize.discount.max) max_discount = true;
          if (_itemSize.count > _itemSize.r_count) returned_count = true;


        });
      } else {
        $scope.error = "##word.must_enter_quantity##";
        return;
      }

      if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
        if (max_discount) {
          $scope.error = "##word.err_maximum_discount##";
          return;
        }
      }

      if ($scope.store_out.type.id == 6) {
        if (returned_count) {
          $scope.error = "##word.return_item_err##";
          return;
        }
      };

      if (notExistCount) {
        $scope.error = "##word.err_exist_count##";
        return;
      };

      if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto && $scope.store_out.type && $scope.store_out.type.id != 5) {
        if (!$scope.store_out.safe) {
          $scope.error = "##word.nosafe_warning##";
          return;
        }
      }

      if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto && $scope.store_out.type && $scope.store_out.type.id != 5) {
        let totalCustomerBalance = 0;
        if ($scope.store_out.customer && $scope.store_out.payment_method && $scope.store_out.payment_method.id == 5) {
          totalCustomerBalance = customer.balance + (customer.credit_limit || 0);
          let customerPay = $scope.store_out.paid_up * $scope.store_out.currency.ex_rate;

          if (customerPay > totalCustomerBalance) {
            $scope.error = "##word.cannot_exceeded_customer##";
            return;
          }
        }
      }


      if ($scope.store_out.items.length > 0 && !$scope.busy) {

        $scope.store_out.items.forEach(_itemSize => {
          if (_itemSize.work_patch && _itemSize.patch_list && _itemSize.patch_list.length > 0) {
            let c = 0;
            _itemSize.patch_list.map(p => c += p.count);

            let difference = _itemSize.count - c;
            if (_itemSize.count > c) {
              _itemSize.patch_list = _itemSize.patch_list.slice().sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date)).reverse();
              _itemSize.patch_list.forEach(_pl => {
                if (difference > 0 && _pl.count == 0) {

                  if (_pl.current_count < difference || _pl.current_count == difference) {

                    _pl.count = _pl.current_count;
                    difference = difference - _pl.count;


                  } else if (_pl.current_count > difference) {

                    _pl.count = difference;
                    difference = 0;
                  }
                }
              });
            }
          }
        });

        $scope.testPatches($scope.store_out, callback => {



          if (callback.patchCount) {
            $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
            return;
          };

          $scope.financialYear($scope.store_out.date, is_allowed_date => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
            } else {

              $scope.busy = true;
              $http({
                method: "POST",
                url: "/api/stores_out/add",
                data: angular.copy($scope.store_out)
              }).then(
                function (response) {
                  if (response.data.done) {
                    if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto && $scope.store_out.type && $scope.store_out.type.id != 5) {

                      let account_invoices = {
                        image_url: '/images/account_invoices.png',
                        date: response.data.doc.date,
                        invoice_id: response.data.doc.id,
                        customer: response.data.doc.customer,
                        total_value_added: response.data.doc.total_value_added,
                        invoice_type: response.data.doc.type,
                        currency: response.data.doc.currency,
                        shift: response.data.doc.shift,
                        net_value: response.data.doc.net_value,
                        paid_up: response.data.doc.paid_up || 0,
                        payment_method: response.data.doc.payment_method,
                        safe: response.data.doc.safe,
                        invoice_code: response.data.doc.number,
                        total_discount: response.data.doc.total_discount,
                        total_tax: response.data.doc.total_tax,
                        current_book_list: response.data.doc.items,
                        source_type: {
                          id: 2,
                          en: "Sales Store",
                          ar: "إذن صرف / فاتورة مبيعات"
                        },
                        active: true
                      };
                      $scope.addAccountInvoice(account_invoices)
                    }
                    $scope.store_out = {};
                    $scope.loadAll({ date: new Date() });
                    site.hideModal('#addStoreOutModal');
                    $timeout(() => {
                      document.querySelector('#clickNew').click();
                      $scope.busy = false;

                    }, 250);
                  } else {
                    $scope.error = response.data.error;
                    if (response.data.error.like('*OverDraft Not*')) {
                      $scope.error = "##word.overdraft_not_active##"
                    }
                  }

                },
                function (err) {
                  $scope.error = err.message;
                }
              )
            }
          })
        })
      } else {
        $scope.error = "##word.must_enter_quantity##";
        return;
      }
    });

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
          $scope.store_out.items.forEach(_item => {
            if (!_item.total_v_a) {
              _item.total_v_a = site.toNumber(_item.value_added) * (_item.price * _item.count) / 100;
            }
          });
          $scope.store_out.total_value = $scope.store_out.total_value - $scope.store_out.total_value_added;
          if ($scope.currencySetting) {

            site.strings['currency'].ar = ' ' + $scope.currencySetting.name + ' ';
            site.strings['from100'].ar = ' ' + $scope.currencySetting.minor_currency + ' ';
          }
          $scope.store_out.net_value2 = site.stringfiy($scope.store_out.net_value);

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

    if (store_out.return_paid && store_out.net_value != store_out.return_paid.net_value) {
      $scope.error = '##word.err_delete_return##';
      return;
    };

    $scope.getStockItems(store_out.items, callback => {

      if (!callback) {

        $scope.financialYear(store_out.date, is_allowed_date => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {

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
                  $scope.loadAll({ date: new Date() });
                } else {
                  $scope.error = response.data.error;
                  if (response.data.error.like('*OverDraft Not*')) {
                    $scope.error = "##word.overdraft_not_active##"
                  }
                };

              },
              function (err) {
                console.log(err);
              }
            )
          }
        })
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    })
  };

  $scope.detailsCustomer = function (callback) {
    $scope.error = '';
    $scope.busy = true;

    let customer = '';
    if ($scope.account_invoices && $scope.account_invoices.customer) {
      customer = $scope.account_invoices.customer
    } else if ($scope.store_out && $scope.store_out.customer) {
      customer = $scope.store_out.customer
    }

    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: customer.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customer = response.data.doc;
          callback(response.data.doc);
        } else {
          callback(null);
        }
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

      if ($scope.item.sizes && $scope.item.sizes.length > 0)
        $scope.item.sizes.forEach(_size => {
          foundSize = $scope.store_out.items.some(_itemSize => _itemSize.barcode === _size.barcode);
          if (_size.count > 0 && !foundSize) {

            let discount = 0;

            _size.value_added = site.toNumber(_size.value_added);
            _size.total_v_a = site.toNumber(_size.value_added) * (_size.price * _size.count) / 100;
            _size.total_v_a = site.toNumber(_size.total_v_a);
            if (_size.count) {
              if (_size.discount.type == 'number')
                discount = (_size.discount.value || 0) * _size.count;
              else if (_size.discount.type == 'percent')
                discount = (_size.discount.value || 0) * (_size.price * _size.count) / 100;

              _size.total = (site.toNumber(_size.total * _size.count) - discount + _size.total_v_a);
              _size.total = site.toNumber(_size.total);
            }

            $scope.store_out.items.push({
              image_url: $scope.item.image_url,
              name: _size.name,
              size: _size.size,
              value_added: _size.value_added,
              total_v_a: _size.total_v_a,
              item_group: _size.item_group,
              work_patch: _size.work_patch,
              work_serial: _size.work_serial,
              service_item: _size.service_item,
              validit: _size.validit,
              size_en: _size.size_en,
              size_units_list: _size.size_units_list,
              patch_list: _size.patch_list,
              unit: _size.unit,
              store_units_list: _size.store_units_list,
              item_complex: _size.item_complex,
              complex_items: _size.complex_items,
              average_cost: _size.unit.average_cost,
              cost: _size.unit.cost,
              price: _size.unit.price,
              discount: _size.discount,
              barcode: _size.barcode,
              count: _size.count,
              total: _size.total,
              store_count: _size.store_count
            });
          }
        });
      $scope.calc($scope.store_out);
      $scope.item.sizes = [];
    } else $scope.error = "##word.err_transaction_type##";
  };

  $scope.calcSize = function (calc_size) {
    $scope.error = '';
    $timeout(() => {
      let discount = 0;
      calc_size.total_v_a = site.toNumber(calc_size.value_added) * (calc_size.price * calc_size.count) / 100;
      calc_size.total_v_a = site.toNumber(calc_size.total_v_a);

      if (calc_size.count) {
        if (calc_size.discount.type == 'number')
          discount = calc_size.discount.value * calc_size.count;
        else if (calc_size.discount.type == 'percent')
          discount = calc_size.discount.value * (calc_size.price * calc_size.count) / 100;

        if ($scope.store_out.type && $scope.store_out.type.id == 5)
          calc_size.total = site.toNumber(calc_size.average_cost) * site.toNumber(calc_size.count);
        else calc_size.total = ((site.toNumber(calc_size.price) * site.toNumber(calc_size.count)) - discount + calc_size.total_v_a);

        calc_size.total = site.toNumber(calc_size.total);

      }
      $scope.calc($scope.store_out);
    }, 150);
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
            if (response.data.list.length > 0 && $scope.item.search_item_name) {
              let foundSize = false;
              $scope.item.sizes = $scope.item.sizes || [];
              response.data.list.forEach(_item => {

                if (_item.sizes && _item.sizes.length > 0)
                  _item.sizes.forEach(_size => {
                    let foundHold = false;
                    let indxUnit = 0;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach((_unit, i) => {

                        if (_unit.id == _item.main_unit.id)
                          indxUnit = i;
                      });

                    if ((_size.barcode === $scope.item.search_item_name) || (_size.size_units_list[indxUnit].barcode === $scope.item.search_item_name)) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;
                      _size.store = $scope.store_out.store;
                      _size.unit = _size.size_units_list[indxUnit];
                      $scope.getOfferActive(_size.barcode, offer_active => {
                        if (offer_active) {

                          offer_active.size_units_list.forEach(_offerUnit => {
                            if (_offerUnit.id === _size.unit.id) {
                              _size.discount = _offerUnit.discount
                            }
                          });

                        } else _size.discount = _size.size_units_list[indxUnit].discount;
                      });

                      _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                      _size.price = _size.size_units_list[indxUnit].price;
                      _size.cost = _size.size_units_list[indxUnit].cost;
                      _size.count = 1;
                      _size.value_added = _size.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;

                      if ($scope.store_out.type && $scope.store_out.type.id == 5) _size.total = _size.count * _size.average_cost;
                      else _size.total = _size.count * _size.price;

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
                                if (_store.store.id == $scope.store_out.store.id) {
                                  _size.store_units_list = _store.size_units_list;
                                  foundStore = true;
                                  indxStore = i;
                                  if (_store.hold) foundHold = true;
                                }
                              });
                              if (foundStore)
                                _size.store_count = _size.branches_list[indxBranch].stores_list[indxStore].current_count
                            } else _size.store_count = 0;
                          } else _size.store_count = 0;
                        } else _size.store_count = 0;
                      } else _size.store_count = 0;

                      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _size.barcode);

                      if (_size.store_units_list && _size.store_units_list.length > 0) {
                        _size.store_units_list.forEach(_ul => {
                          if (_ul.id == _size.unit.id) {
                            if (_ul.patch_list && _ul.patch_list.length > 0) {

                              _ul.patch_list.forEach(_p => {
                                _p.current_count = _p.count
                                _p.count = 0
                              });
                              _size.patch_list = _ul.patch_list
                            }
                          }
                        });
                      };

                      if (!foundSize && !foundHold) $scope.item.sizes.push(_size);
                    };
                  });
              });

              if (!foundSize) $scope.itemsNameList = response.data.list;
              else if (foundSize) $scope.error = '##word.dublicate_item##';

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
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;

    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0)
      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;
        _item.name = $scope.item.name.name;
        _item.item_group = $scope.item.name.item_group;
        _item.store = $scope.store_out.store;
        _item.count = 1;
        _item.value_added = _item.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;
        let indxUnit = 0;
        if (_item.size_units_list && _item.size_units_list.length > 0) {

          indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.name.main_unit.id);
          _item.unit = _item.size_units_list[indxUnit];
          _item.discount = _item.size_units_list[indxUnit].discount;
          _item.average_cost = _item.size_units_list[indxUnit].average_cost;
          _item.price = _item.size_units_list[indxUnit].price;
          _item.cost = _item.size_units_list[indxUnit].cost;

          if ($scope.store_out.type && $scope.store_out.type.id == 5) _item.total = _item.count * _item.average_cost
          else _item.total = _item.count * _item.price

        }

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
                  if (_store.store.id == $scope.store_out.store.id) {
                    _item.store_units_list = _store.size_units_list;
                    foundStore = true;
                    indxStore = i;
                    if (_store.hold) foundHold = true;
                  }
                });
                if (foundStore)
                  _item.store_count = _item.branches_list[indxBranch].stores_list[indxStore].current_count
              } else _item.store_count = 0;
            } else _item.store_count = 0;
          } else _item.store_count = 0;
        } else _item.store_count = 0;
        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _item.barcode);

        if (_item.store_units_list && _item.store_units_list.length > 0) {
          _item.store_units_list.forEach(_ul => {
            if (_ul.id == _item.unit.id) {
              if (_ul.patch_list && _ul.patch_list.length > 0) {

                _ul.patch_list.forEach(_p => {
                  _p.current_count = _p.count
                  _p.count = 0
                });
                _item.patch_list = _ul.patch_list
              }
            }
          });
        };
        if (!foundSize && !foundHold) $scope.item.sizes.push(_item);
      });
  };

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: { barcode: $scope.search_barcode }
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
                  let indxUnit = 0;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach((_unit, i) => {

                      if (_unit.id == response.data.list[0].main_unit.id)
                        indxUnit = i;
                    });


                  if (_size.branches_list && _size.branches_list.length > 0)
                    _size.branches_list.forEach(_branch => {
                      if (_branch.code == '##session.branch.code##')
                        _branch.stores_list.forEach(_store => {

                          if (_store.store && _store.store.id == $scope.store_out.store.id) {
                            _size.store_count = _store.current_count;
                            _size.store_units_list = _store.size_units_list;
                            if (_store.hold) foundHold = true;
                          }
                        });
                    });

                  if ((_size.barcode === $scope.search_barcode) || _size.size_units_list[indxUnit].barcode === $scope.search_barcode) {
                    _size.name = response.data.list[0].name;
                    _size.item_group = response.data.list[0].item_group;
                    _size.store = $scope.store_out.store;
                    _size.unit = _size.size_units_list[indxUnit];

                    $scope.getOfferActive(_size.barcode, offer_active => {
                      if (offer_active) {

                        offer_active.size_units_list.forEach(_offerUnit => {
                          if (_offerUnit.id === _size.unit.id) {
                            _size.discount = _offerUnit.discount
                          }
                        });

                      } else _size.discount = _size.size_units_list[indxUnit].discount;
                    });

                    _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                    _size.price = _size.size_units_list[indxUnit].price;
                    _size.cost = _size.size_units_list[indxUnit].cost;
                    _size.count = 1;
                    _size.value_added = _size.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;

                    foundSize = $scope.store_out.items.some(_itemSize => _itemSize.barcode === _size.barcode);
                    if (_size.store_units_list && _size.store_units_list.length > 0) {
                      _size.store_units_list.forEach(_ul => {
                        if (_ul.id == _size.unit.id) {
                          if (_ul.patch_list && _ul.patch_list.length > 0) {

                            _ul.patch_list.forEach(_p => {
                              _p.current_count = _p.count
                              _p.count = 0
                            });
                            _size.patch_list = _ul.patch_list
                          }
                        }
                      });
                    };
                    _size.branches_list = [];
                    if (!foundSize && !foundHold) $scope.store_out.items.unshift(_size)
                    else if (foundSize) {
                      $scope.store_out.items.forEach(_item => {
                        if (_item.barcode === _size.barcode) {
                          _item.count = _item.count + 1;
                          $scope.calcSize(_item);

                        }
                      });
                    }
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


    if (new Date($scope.store_out.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    }

    if ($scope.store_out.type && $scope.store_out.type.id != 5 && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
      if (!$scope.store_out.safe) {
        $scope.error = "##word.nosafe_warning##";
        return;
      }
    }

    if ($scope.store_out.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    let max_discount = false;
    let returned_count = false;
    let patchCount = false;

    if ($scope.store_out.items && $scope.store_out.items.length > 0) {

      notExistCount = $scope.store_out.items.some(_iz => _iz.count < 1);

      $scope.store_out.items.forEach(_itemSize => {

        if (_itemSize.discount.value > _itemSize.discount.max) max_discount = true;
        if (_itemSize.count > _itemSize.r_count) returned_count = true;

      });
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }

    if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
      if (max_discount) {
        $scope.error = "##word.err_maximum_discount##";
        return;
      }
    }

    if ($scope.store_out.type.id == 6) {
      if (returned_count) {
        $scope.error = "##word.return_item_err##";
        return;
      }
    };

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    if (patchCount) {
      $scope.error = `##word.err_patch_count##   ( ${patch_list.join('-')} )`;
      return;
    };

    if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto && $scope.store_out.type && $scope.store_out.type.id != 5) {
      if (!$scope.store_out.safe) {
        $scope.error = "##word.nosafe_warning##";
        return;
      }
    }

    $scope.store_out.items.forEach(_itemSize => {
      if (_itemSize.work_patch && _itemSize.patch_list && _itemSize.patch_list.length > 0) {
        let c = 0;
        _itemSize.patch_list.map(p => c += p.count);

        let difference = _itemSize.count - c;
        if (_itemSize.count > c) {
          _itemSize.patch_list = _itemSize.patch_list.slice().sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date)).reverse();
          _itemSize.patch_list.forEach(_pl => {
            if (difference > 0 && _pl.count == 0) {

              if (_pl.current_count < difference || _pl.current_count == difference) {

                _pl.count = _pl.current_count;
                difference = difference - _pl.count;


              } else if (_pl.current_count > difference) {

                _pl.count = difference;
                difference = 0;
              }
            }
          });
        }
      }
    });

    $scope.testPatches($scope.store_out, callback => {

      if (callback.patchCount) {
        $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
        return;
      };

      $scope.financialYear($scope.store_out.date, is_allowed_date => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {

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
              } else {
                $scope.error = '##word.error##';
              }
            },
            function (err) {
              console.log(err);
            }
          )
        }
      })
    })
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores/all",
      data: {
        select: {
          id: 1,
          name: 1,
          type: 1
        }
      }
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
          minor_currency: 1,
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
          $scope.currenciesList.forEach(_c => {
            if ($scope.defaultSettings && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.currency && $scope.defaultSettings.accounting.currency.id == _c.id) {
              $scope.currencySetting = _c
            }
          });
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
    if ($scope.defaultSettings.accounting && obj.payment_method) {
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

  $scope.loadSafes = function (method, currency, callback) {
    callback = callback || function () { };
    $scope.error = '';
    $scope.busy = true;

    let where = {
      'currency.id': currency.id
    };

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
          commission: 1,
          currency: 1,
          type: 1
        },
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.safesList = response.data.list;
        }
        callback($scope.safesList)
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
        $scope.storesOutTypes.forEach(_t => {
          if (_t.id == site.toNumber("##query.type##"))
            $scope.source_type = _t;
        })
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
    $scope.loadAll($scope.search);
    $scope.search = {};
    site.hideModal('#StoresOutSearchModal');
  };


  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = [];

    if (!where || !Object.keys(where).length) {
      where = { limit: 100, type: { id: site.toNumber("##query.type##") } }
    } else {
      where.type = { id: site.toNumber("##query.type##") };
    }

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
          /*$scope.store_out = {};*/
          $scope.account_invoices = {};
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
          invoice_type: store_out.type,
          customer: store_out.customer,
          total_value_added: store_out.total_value_added,
          shift: shift,
          net_value: store_out.net_value,
          paid_up: 0,
          invoice_code: store_out.number,
          total_discount: store_out.total_discount,
          total_tax: store_out.total_tax,
          current_book_list: store_out.items,
          source_type: {
            id: 2,
            en: "Sales Store",
            ar: "المبيعات المخزنية"
          },
          active: true
        };

        if ($scope.defaultSettings.accounting) {
          $scope.account_invoices.currency = $scope.currencySetting;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id == 1)
              $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.account_invoices.currency) {
          $scope.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
          $scope.account_invoices.paid_up = $scope.amount_currency;

        }
        $scope.calc($scope.account_invoices);

        site.showModal('#accountInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAccountInvoice = function (account_invoices) {
    $scope.error = '';
    $scope.busy = true;
    $scope.detailsCustomer((customer) => {

      if (account_invoices.paid_up > 0 && !account_invoices.safe) {
        $scope.error = "##word.should_select_safe##";
        return;

      } else if (account_invoices.paid_up > $scope.amount_currency) {
        $scope.error = "##word.err_net_value##";
        return;
      }

      if (account_invoices.customer && account_invoices.payment_method && account_invoices.payment_method.id == 5) {
        let totalCustomerBalance = 0;
        totalCustomerBalance = customer.balance + (customer.credit_limit || 0);

        let customerPay = account_invoices.paid_up * account_invoices.currency.ex_rate;

        if (customerPay > totalCustomerBalance) {
          $scope.error = "##word.cannot_exceeded_customer##";
          return;
        }
      }

      if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting)
        account_invoices.posting = false;
      else account_invoices.posting = true;

      $http({
        method: "POST",
        url: "/api/account_invoices/add",
        data: account_invoices
      }).then(
        function (response) {
          $scope.busy = false;
          if (response) {
            site.hideModal('#accountInvoiceModal');
            $scope.account_invoices = response.data.doc;
            $scope.printAccountInvoive();
          } else $scope.error = response.data.error;
        },
        function (err) {
          console.log(err);
        }
      )
    })
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

    if ($scope.account_invoices) {

      $scope.account_invoices.total_remain = $scope.account_invoices.net_value - ($scope.account_invoices.paid_up * $scope.account_invoices.currency.ex_rate);

      $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain)
      $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up)
      $scope.account_invoices.total_tax = site.toNumber($scope.account_invoices.total_tax)
      $scope.account_invoices.total_discount = site.toNumber($scope.account_invoices.total_discount)
      $scope.account_invoices.net_value = site.toNumber($scope.account_invoices.net_value)
      $scope.account_invoices.paid_up = site.toNumber($scope.account_invoices.paid_up)
      $scope.account_invoices.payment_paid_up = site.toNumber($scope.account_invoices.payment_paid_up)

      let obj_print = {
        data: []
      };

      if ($scope.defaultSettings.printer_program) {

        if ($scope.defaultSettings.printer_program.printer_path)
          obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.trim();


        if ($scope.defaultSettings.printer_program.invoice_top_title) {
          obj_print.data.push({
            type: 'invoice-top-title',
            name: $scope.defaultSettings.printer_program.invoice_top_title
          });
        } else {
          obj_print.data.push({
            type: 'invoice-top-title',
            name: "Smart Code"
          });
        }

        if ($scope.defaultSettings.printer_program.invoice_logo) {

          obj_print.data.push({
            type: 'invoice-logo',
            url: document.location.origin + $scope.defaultSettings.printer_program.invoice_logo
          });
        } else {
          obj_print.data.push({
            type: 'invoice-logo',
            url: "http://127.0.0.1/images/logo.png"
          });
        }

        if ($scope.defaultSettings.printer_program.invoice_header && $scope.defaultSettings.printer_program.invoice_header.length > 0) {
          $scope.defaultSettings.printer_program.invoice_header.forEach(_ih => {
            obj_print.data.push({
              type: 'header',
              value: _ih.name
            });
          });
        }
      }


      obj_print.data.push({
        type: 'invoice-code',
        name: 'Purchase I',
        value: $scope.account_invoices.code
      }, {
        type: 'invoice-date',
        name: 'Date',
        value: site.toDateXF($scope.account_invoices.date)
      }, {
        type: 'space'
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

      if ($scope.account_invoices.current_book_list && $scope.account_invoices.current_book_list.length > 0) {

        obj_print.data.push({
          type: 'line'
        }, {
          type: 'invoice-item-title',
          count: 'العدد',
          name: 'الاسم',
          price: 'السعر'
        }, {
          type: 'invoice-item-title',
          count: 'Count',
          name: 'Name',
          price: 'Price'
        }, {
          type: 'line2'
        });

        $scope.account_invoices.current_book_list.forEach((_current_book_list, i) => {
          _current_book_list.total = site.toNumber(_current_book_list.total);
          obj_print.data.push({
            type: 'invoice-item',
            count: _current_book_list.count,
            name: _current_book_list.size,
            price: site.addSubZero(_current_book_list.total, 2)
          });
          if (i < $scope.account_invoices.current_book_list.length - 1) {
            obj_print.data.push({
              type: 'line3'
            });
          }

        });
      };


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

      obj_print.data.push({
        type: 'space'
      });
      if ($scope.account_invoices.net_value) {

        obj_print.data.push({
          type: 'invoice-total',
          value: site.addSubZero($scope.account_invoices.net_value, 2),
          name: "Total Value"
        });
      }

      if ($scope.account_invoices.paid_up)
        obj_print.data.push({
          type: 'text2',
          value2: site.addSubZero($scope.account_invoices.paid_up, 2),
          value: "Paid Up"
        });


      obj_print.data.push({
        type: 'space'
      });

      if ($scope.account_invoices.total_remain)
        obj_print.data.push({
          type: 'text2b',
          value2: $scope.account_invoices.total_remain,
          value: "Required to pay"
        });


      if ($scope.account_invoices.currency)
        obj_print.data.push({
          type: 'text2',
          value2: $scope.account_invoices.currency.name,
          value: "Currency"
        });


      if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer && $scope.defaultSettings.printer_program.invoice_footer.length > 0) {
        $scope.defaultSettings.printer_program.invoice_footer.forEach(_if => {
          obj_print.data.push({
            type: 'header',
            value: _if.name
          });
        });

      }

      if ($scope.account_invoices.code) {
        obj_print.data.push({
          type: 'invoice-barcode',
          value: ($scope.account_invoices.code)
        });
      }

      $http({
        method: "POST",
        url: `http://${ip}:${port}/print`,
        data: obj_print
      }).then(response => {
        $scope.busy = false;
      }).catch(err => {
        console.log(err);
      });

    };
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

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.ChangeUnitPatch = function (itm) {
    $scope.error = '';
    itm.price = itm.unit.price;
    itm.average_cost = itm.unit.average_cost;

    $scope.getOfferActive(itm.barcode, offer_active => {
      if (offer_active) {

        offer_active.size_units_list.forEach(_offerUnit => {
          if (_offerUnit.id === itm.unit.id) {
            itm.discount = _offerUnit.discount
          }
        });

      } else itm.discount = itm.unit.discount;
    });


    if (itm.store_units_list && itm.store_units_list.length > 0) {
      itm.store_units_list.forEach(_store_unit => {
        if (_store_unit.id == itm.unit.id) {

          if (_store_unit.patch_list && _store_unit.patch_list.length > 0)
            _store_unit.patch_list.forEach(_p => {
              _p.current_count = _p.count
              _p.count = 0
            });

          itm.patch_list = _store_unit.patch_list
        }
      });
    }

    $scope.calcSize(itm);
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
        select: {
          id: 1,
          name: 1
        }
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
        select: {
          id: 1,
          name: 1
        }
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

    if (!store_out.posting && store_out.return_paid && store_out.net_value != store_out.return_paid.net_value) {
      store_out.posting = true;
      $scope.error = '##word.err_unpost_return##';
      return;
    };

    let notExistCount = store_out.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      if (store_out.posting) store_out.posting = false;
      else store_out.posting = true;

      $scope.error = "##word.err_exist_count##";
      return;
    };


    $scope.getStockItems(store_out.items, callback => {

      $scope.testPatches(store_out, callbackTest => {

        if (callbackTest.patchCount) {
          $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
          if (store_out.posting) store_out.posting = false;
          else store_out.posting = true;

          return;
        };

        if (!callback) {

          $scope.financialYear(store_out.date, is_allowed_date => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
              if (store_out.posting) store_out.posting = false;
              else store_out.posting = true;
            } else {

              $scope.busy = true;
              $http({
                method: "POST",
                url: "/api/stores_out/posting",
                data: store_out
              }).then(
                function (response) {
                  $scope.busy = false;
                  if (response.data.done) {
                  } else {
                    $scope.error = '##word.error##';
                    if (response.data.error.like('*OverDraft Not*')) {
                      $scope.error = "##word.overdraft_not_active##"
                      if (store_out.posting) store_out.posting = false;
                      else store_out.posting = true;
                    }
                  }
                },
                function (err) {
                  console.log(err);
                }
              )
            }
          })
        } else {
          if (store_out.posting)
            store_out.posting = false;
          else store_out.posting = true;
          $scope.error = '##word.err_stock_item##';
        }
      })
    })
  };


  $scope.postingAll = function (store_out_all) {
    $scope.error = '';

    let _store_out_all = store_out_all.reverse();
    let notExist = false;
    let notExistCountList = [];
    _store_out_all.forEach(_stOut => {
      let notExistCount = _stOut.items.some(_iz => _iz.count < 1);
      if (notExistCount) {
        notExist = true;
        notExistCountList.push(_stOut.number)
      }
    });


    if (notExist) {

      $scope.error = `##word.err_exist_count_invoice##   ( ${notExistCountList.join('-')} )`;
      return;

    } else {
      let stopLoop = false;
      for (let i = 0; i < _store_out_all.length; i++) {

        $timeout(() => {

          if (!_store_out_all[i].posting) {

            $scope.getStockItems(_store_out_all[i].items, callback => {

              $scope.testPatches(_store_out_all[i], callbackTest => {

                if (callbackTest.patchCount) {
                  $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
                  _store_out_all[i].posting = false;
                  return;
                };

                if (!callback && !stopLoop) {

                  $scope.financialYear(_store_out_all[i].date, is_allowed_date => {
                    if (!is_allowed_date) {
                      $scope.error = '##word.should_open_period##';
                    } else {

                      _store_out_all[i].posting = true;

                      $http({
                        method: "POST",
                        url: "/api/stores_out/posting",
                        data: _store_out_all[i]
                      }).then(
                        function (response) {
                          if (response.data.done) { } else {
                            $scope.error = '##word.error##';
                            if (response.data.error.like('*OverDraft Not*')) {
                              $scope.error = "##word.overdraft_not_active##"
                              _store_out_all[i].posting = false;
                            }
                          }
                        },
                        function (err) {
                          console.log(err);
                        }
                      )
                    }

                  })
                } else {
                  stopLoop = true;
                }

              })
            })
          };
        }, 1000 * i);

      };
      if (stopLoop) $scope.error = '##word.err_stock_item##';
    }

  };

  $scope.getStockItems = function (items, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_stock/item_stock",
      data: items
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          if (response.data.found) {
            callback(true)
          } else {
            callback(false)
          }
        } else {
          callback(false)
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.selectItems = function () {

    if (!$scope.store_out.store) {
      $scope.error = '##word.err_store_select##';
    } else if (!$scope.store_out.type) {
      $scope.error = '##word.err_transaction_type##';
    } else site.showModal('#selectItemsModal')

  };

  $scope.patchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: {
        where: {
          store_id: $scope.store_out.store.id,
          unit_id: itm.unit.id,
          barcode: itm.barcode
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          if ($scope.store_out.type && $scope.store_out.type.id == 6) {

            site.showModal('#patchesListReturnModal');

          } else {
            if (response.data.patch_list.length > 0 && $scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0) {
              response.data.patch_list.forEach(_resPatch => {

                _resPatch.current_count = _resPatch.count;
                _resPatch.count = 0;
                if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0)
                  $scope.item_patch.patch_list.forEach(_itemPatch => {

                    if (_resPatch.patch == _itemPatch.patch) {
                      _resPatch.count = _itemPatch.count;
                      _resPatch.current_count = _itemPatch.current_count;
                      if (_itemPatch.select) _resPatch.select = _itemPatch.select;
                    }

                  });
              });
              $scope.item_patch.patch_list = response.data.patch_list;
              site.showModal('#patchesListModal');
            }

          }
        }
      })


  };

  $scope.viewPatchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    site.showModal('#patchesListViewModal');

  };


  $scope.selectAll = function (item_patch) {
    item_patch.patch_list.forEach(element => {
      if (item_patch.$select_all) {
        element.select = true
      } else if (!item_patch.$select_all) {
        element.select = false
      }
    });
  };

  $scope.exitPatchReturnModal = function (itm) {
    let bigger = false;
    let count = 0;

    itm.patch_list.forEach(_pl => {
      if (itm.work_serial) {
        if (_pl.select) _pl.count = 1
        else _pl.count = 0
      }
      if (_pl.count > _pl.current_count) bigger = true;
      count += _pl.count;
    });

    if (itm.count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    };

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    };

    site.hideModal('#patchesListReturnModal');
    $scope.error = '';
  };

  $scope.exitPatchModal = function (itm) {
    let bigger = false;
    let count = 0;

    itm.patch_list.forEach(_pl => {
      if (_pl.count > _pl.current_count) bigger = true;
      if (itm.work_serial) {
        if (_pl.select) _pl.count = 1
        else _pl.count = 0
      }
    });


    itm.patch_list.map(p => count += p.count);

    if (itm.count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    };

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    };

    site.hideModal('#patchesListModal');
    $scope.error = '';
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
          $scope.loadAll({ date: new Date() });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showReturnedStoreOut = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_out/all",
        data: {
          search: $scope.storesOutSearch,
          where: {
            'posting': true,
            'return_paid.net_value': { $gt: 0 }
          }
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

    if ($scope.store_out && i.return_paid) {
      $scope.store_out.retured_number = i.number;
      $scope.store_out.delegate = i.delegate || {};
      $scope.store_out.total_discount = i.return_paid.total_discount;
      $scope.store_out.total_value_added = i.return_paid.total_value_added;
      $scope.store_out.total_tax = i.return_paid.total_tax;
      $scope.store_out.total_value = i.return_paid.total_value;
      $scope.store_out.net_value = i.return_paid.net_value;

      $scope.store_out.items = [];

      if (i.return_paid.items && i.return_paid.items.length > 0)
        i.return_paid.items.forEach(_item => {
          _item.r_count = _item.count;
          if (_item.patch_list && _item.patch_list.length > 0) {

            _item.patch_list.forEach(_p => {
              _p.current_count = _p.count;
              _p.count = 0;
            });
          };
          if (_item.count > 0) $scope.store_out.items.push(_item);
        });

      if ($scope.store_out.currency) {
        $scope.amount_currency = site.toNumber($scope.store_out.net_value) / site.toNumber($scope.store_out.currency.ex_rate);
        $scope.amount_currency = site.toNumber($scope.amount_currency);
        $scope.store_out.paid_up = $scope.amount_currency;

      }
      site.hideModal('#returnedViewModal');
    };

  };

  $scope.financialYear = function (date, callback) {

    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/financial_years/is_allowed_date",
      data: {
        date: new Date(date)
      }
    }).then(
      function (response) {
        $scope.busy = false;
        is_allowed_date = response.data.doc;
        callback(is_allowed_date);
      }
    );
  };

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: {
          active: true
        },
        select: {
          id: 1,
          name: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1
        }
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

  $scope.getOfferActive = function (barcode, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_offer/offer_active",
      data: {
        where: { date: new Date($scope.store_out.date), barcode: barcode },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
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
  $scope.getDefaultSettings();
  $scope.getGovList();
  $scope.loadTaxTypes();
  $scope.getGender();
  $scope.getCustomerGroupList();
  $scope.loadDelegates();
  $scope.loadDiscountTypes();
  $scope.loadCurrencies();
  $scope.loadAll({ date: new Date() });

});