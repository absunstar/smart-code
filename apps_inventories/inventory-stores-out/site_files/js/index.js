window.addEventListener(
  'keydown',
  (e) => {
    if (e.keyCode == 113 /*f12*/) {
      scope().add();
    }
  },
  true
);

function scope() {
  return angular.element(document.querySelector('[ng-controller="stores_out"]')).scope();
}

app.controller('stores_out', function ($scope, $http, $timeout, $interval) {
  $scope._search = {};
  $scope.thermal = {};
  $scope.invList = [];
  $scope.store_out = {
    discountes: [],
    taxes: [],
  };
  $scope.search = {};
  $scope.item = {
    sizes: [],
  };

  $scope.addTax = function () {
    $scope.error = '';
    $scope.store_out.taxes = $scope.store_out.taxes || [];
    $scope.store_out.taxes.push({
      name_ar: $scope.tax.name_ar,
      name_en: $scope.tax.name_en,
      value: $scope.tax.value,
    });
    $scope.tax = {};
    $scope.calc($scope.store_out);
  };

  $scope.deleteTax = function (_tx) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_out.taxes.length; i++) {
      let tx = $scope.store_out.taxes[i];
      if (tx.name_ar == _tx.name_ar && tx.value == _tx.value) $scope.store_out.taxes.splice(i, 1);
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
        name_ar: $scope.discount.name_ar,
        name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });

      $scope.calc($scope.store_out);

      $scope.discount = {
        type: 'number',
      };
    }
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_out.discountes.length; i++) {
      let ds = $scope.store_out.discountes[i];
      if (ds.name_ar == _ds.name_ar && ds.value == _ds.value && ds.type == _ds.type) $scope.store_out.discountes.splice(i, 1);
    }
    $scope.calc($scope.store_out);
  };

  $scope.calcSize = function (calc_size) {
    $scope.error = '';
    $timeout(() => {
      if (calc_size.count) {
        if (calc_size.discount.type == 'number') {
          calc_size.discount.current = calc_size.discount.value;
        } else if (calc_size.discount.type == 'percent') {
          calc_size.discount.current = (calc_size.discount.value * calc_size.price) / 100;
        }
        calc_size.discount.current = site.toNumber(calc_size.discount.current);

        calc_size.b_price = calc_size.price - calc_size.discount.current;
        calc_size.b_price = site.toNumber(calc_size.b_price);

        calc_size.total_v_a = (calc_size.value_added * (calc_size.b_price * calc_size.count)) / 100;
        calc_size.total_v_a = site.toNumber(calc_size.total_v_a);

        if ($scope.store_out.type && $scope.store_out.type.id == 5) calc_size.total = site.toNumber(calc_size.average_cost) * site.toNumber(calc_size.count);
        else calc_size.total = site.toNumber(calc_size.b_price) * site.toNumber(calc_size.count) + calc_size.total_v_a;

        calc_size.total = site.toNumber(calc_size.total);
      }
      $scope.calc($scope.store_out);
    }, 150);
  };

  $scope.calc = function (obj) {
    $scope.error = '';

    $timeout(() => {
      obj.total_value = 0;
      obj.net_value = obj.net_value || 0;

      if (!obj.invoice_id) {
        obj.total_value_added = 0;
        obj.items.forEach((_itm) => {
          obj.total_value += site.toNumber(_itm.total);

          obj.total_value_added += _itm.total_v_a;
        });
        obj.total_value_added = site.toNumber(obj.total_value_added);
      }

      if (obj.type && obj.type.id !== 6) {
        obj.total_tax = 0;
        obj.total_discount = 0;
      }

      if (obj.taxes) obj.taxes.map((tx) => (obj.total_tax += (obj.total_value * site.toNumber(tx.value)) / 100));

      if (obj.discountes)
        obj.discountes.forEach((ds) => {
          if (ds.type == 'percent') obj.total_discount += (obj.total_value * site.toNumber(ds.value)) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });

      obj.total_discount = site.toNumber(obj.total_discount);
      obj.total_tax = site.toNumber(obj.total_tax);

      if (!obj.invoice_id) {
        obj.before_value_added = obj.total_value - obj.total_value_added;
        obj.before_value_added = site.toNumber(obj.before_value_added);

        obj.net_value = obj.total_value + obj.total_tax - obj.total_discount;
      }

      obj.total_value = site.toNumber(obj.total_value);
      obj.net_value = site.toNumber(obj.net_value);

      if (obj.currency) {
        obj.amount_currency = obj.net_value / obj.currency.ex_rate;
        obj.amount_currency = site.toNumber(obj.amount_currency);
        if (obj.Paid_from_customer) {
          if (obj.Paid_from_customer <= obj.amount_currency) {
            obj.paid_up = obj.Paid_from_customer;
            obj.remain_from_customer = 0;
          } else {
            obj.paid_up = obj.amount_currency;
            obj.remain_from_customer = obj.Paid_from_customer - obj.amount_currency;
          }
          obj.remain_from_customer = site.toNumber(obj.remain_from_customer);
        } else {
          obj.paid_up = obj.amount_currency;
        }
      }
    }, 250);
  };

  $scope.calcReturn = function (obj) {
    $timeout(() => {
      obj.net_value = (obj.total_value || 0) - (obj.total_discount || 0) + (obj.total_tax || 0);
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
      name_ar: 'خصم',
      name_en: 'Discount',
      type: 'number',
    };

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.shift = shift;
        $scope.error = '';
        $scope.item = {};
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
          supply_date: new Date(),
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.customer) {
            $scope.store_out.customer = $scope.customersGetList.find((_customer) => {
              return _customer.id === $scope.defaultSettings.general_Settings.customer.id;
            });
          }

          if (!$scope.defaultSettings.general_Settings.work_posting) $scope.store_out.posting = true;

          if ($scope.defaultSettings.general_Settings.payment_type && $scope.store_out.type.id != 5) $scope.store_out.payment_type = $scope.defaultSettings.general_Settings.payment_type;
        }

        if ($scope.defaultSettings.inventory) {
          if ('##user.type##' == 'delegate') {
            $scope.store_out.store = JSON.parse('##user.store##');
          } else if ($scope.defaultSettings.inventory.store)
            $scope.store_out.store = $scope.storesList.find((_store) => {
              return _store.id === $scope.defaultSettings.inventory.store.id;
            });

          if ('##user.type##' == 'delegate') {
            $scope.store_out.delegate = $scope.delegatesList[0];
          } else if ($scope.defaultSettings.inventory.delegate)
            $scope.store_out.delegate = $scope.delegatesList.find((_delegate) => {
              return _delegate.id === $scope.defaultSettings.inventory.delegate.id;
            });
        }

        if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
          if ($scope.store_out.type && $scope.store_out.type.id != 5) {
            $scope.store_out.paid_up = 0;
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
      method: 'POST',
      url: '/api/default_setting/get',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          $scope.defaultSettings = response.data.doc;
          $scope.invoice_logo = document.location.origin + $scope.defaultSettings.printer_program.invoice_logo;
          /* $scope.thermal_lang = 'ar';
          $scope.thermal_lang_name = 'name_ar';
          if ($scope.defaultSettings.printer_program.thermal_lang) {
            if ($scope.defaultSettings.printer_program.thermal_lang.id == 2) {
              $scope.thermal_lang = 'en';
              $scope.thermal_lang_name = 'name_en';
            } else if ($scope.defaultSettings.printer_program.thermal_lang.id == 3) {
              $scope.thermal_lang = '##session.lang##';
              if ('##session.lang##' == 'ar') {
                $scope.thermal_lang_name = 'name_ar';
              } else if ('##session.lang##' == 'en') {
                $scope.thermal_lang_name = 'name_en';
              }
            }
          } */
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.testPatches = function (storeOut, callback) {
    let obj = {
      patchCount: false,
      patch_list: [],
    };

    storeOut.items.forEach((_item) => {
      if (_item.size_units_list && _item.size_units_list.length > 0) {
        let count = 0;
        if (_item.patch_list && _item.patch_list.length > 0) {
          _item.patch_list.forEach((_pl) => {
            if (typeof _pl.count === 'number') {
              count += _pl.count;
            } else {
              obj.patchCount = true;
              obj.patch_list.push(_item.barcode);
            }
          });
        } else if (_item.work_serial || _item.work_patch) {
          obj.patchCount = true;
          obj.patch_list.push(_item.barcode);
        }
        if (count != _item.count && (_item.work_serial || _item.work_patch)) {
          obj.patchCount = true;
          obj.patch_list.push(_item.barcode);
        }
      }
    });

    obj.patch_list = obj.patch_list.filter(function (item, pos) {
      return obj.patch_list.indexOf(item) === pos;
    });

    callback(obj);
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
        $scope.error = '##word.date_exceed##';
        return;
      }

      if (!$scope.store_out.payment_type && $scope.store_out.type.id != 5) {
        $scope.error = '##word.must_choose_payment_type##';
        return;
      }

      if ($scope.store_out.payment_type) {
        if ($scope.store_out.type && $scope.store_out.type.id != 5 && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
          if (!$scope.store_out.safe) {
            $scope.error = '##word.nosafe_warning##';
            return;
          }
        }

        if ($scope.store_out.paid_up > $scope.store_out.amount_currency) {
          $scope.error = '##word.err_net_value##';
          return;
        }

        if ($scope.store_out.paid_up < $scope.store_out.amount_currency && $scope.store_out.payment_type.id == 1) {
          $scope.error = '##word.amount_must_paid_full##';
          return;
        }
      } else {
        $scope.store_out.paid_up = undefined;
        $scope.store_out.safe = undefined;
        $scope.store_out.Paid_from_customer = undefined;
        $scope.store_out.payment_method = undefined;
        $scope.store_out.currency = undefined;
      }

      let max_discount = false;
      let returned_count = false;
      let notExistCount = false;

      if ($scope.store_out.items && $scope.store_out.items.length > 0) {
        notExistCount = $scope.store_out.items.some((_iz) => _iz.count < 1);

        $scope.store_out.items.forEach((_itemSize) => {
          if (_itemSize.discount.value > _itemSize.discount.max) max_discount = true;
          if (_itemSize.count > _itemSize.r_count) returned_count = true;
        });
      } else {
        $scope.error = '##word.must_enter_quantity##';
        return;
      }

      if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
        if (max_discount) {
          $scope.error = '##word.err_maximum_discount##';
          return;
        }
      }

      if ($scope.store_out.type.id == 6) {
        if (returned_count) {
          $scope.error = '##word.return_item_err##';
          return;
        }
      }

      if (notExistCount) {
        $scope.error = '##word.err_exist_count##';
        return;
      }

      if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto && $scope.store_out.type && $scope.store_out.type.id != 5) {
        let totalCustomerBalance = 0;
        if ($scope.store_out.customer && $scope.store_out.payment_method && $scope.store_out.payment_method.id == 5) {
          totalCustomerBalance = customer.balance + (customer.credit_limit || 0);
          let customerPay = $scope.store_out.paid_up * $scope.store_out.currency.ex_rate;

          if (customerPay > totalCustomerBalance) {
            $scope.error = '##word.cannot_exceeded_customer##';
            return;
          }
        }
      }

      if ($scope.store_out.items.length > 0 && !$scope.busy) {
        $scope.store_out.items.forEach((_itemSize) => {
          if (_itemSize.work_patch && _itemSize.patch_list && _itemSize.patch_list.length > 0) {
            let c = 0;
            _itemSize.patch_list.map((p) => (c += p.count));

            let difference = _itemSize.count - c;
            if (_itemSize.count > c) {
              _itemSize.patch_list = _itemSize.patch_list
                .slice()
                .sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date))
                .reverse();
              _itemSize.patch_list.forEach((_pl) => {
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

        $scope.testPatches($scope.store_out, (callback) => {
          if (callback.patchCount) {
            $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
            return;
          }

          $scope.financialYear($scope.store_out.date, (is_allowed_date) => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
            } else {
              if ($scope.account_invoices && $scope.account_invoices.payable_list && $scope.account_invoices.payable_list.length > 0) {
                $scope.store_out.payable_list = $scope.account_invoices.payable_list;
              }

              $scope.busy = true;
              $http({
                method: 'POST',
                url: '/api/stores_out/add',
                data: angular.copy($scope.store_out),
              }).then(
                function (response) {
                  if (response.data.done) {
                    $scope.busy = false;
                    if (
                      $scope.defaultSettings.accounting &&
                      $scope.defaultSettings.accounting.create_invoice_auto &&
                      $scope.store_out.type &&
                      $scope.store_out.type.id != 5 &&
                      !$scope.defaultSettings.general_Settings.work_posting
                    ) {
                   /*    if ($scope.defaultSettings.printer_program.auto_thermal_print) {
                        $scope.thermalPrint(response.data.doc);
                      } */

                      let account_invoices = {
                        image_url: '/images/account_invoices.png',
                        date: response.data.doc.date,
                        payable_list: response.data.doc.payable_list,
                        payment_type: response.data.doc.payment_type,
                        invoice_id: response.data.doc.id,
                        customer: response.data.doc.customer,
                        total_value_added: response.data.doc.total_value_added,
                        invoice_type: response.data.doc.type,
                        currency: response.data.doc.currency,
                        shift: response.data.doc.shift,
                        amount_currency: response.data.doc.amount_currency,
                        net_value: response.data.doc.net_value,
                        Paid_from_customer: response.data.doc.Paid_from_customer,
                        remain_from_customer: response.data.doc.remain_from_customer,
                        paid_up: response.data.doc.paid_up || 0,
                        payment_method: response.data.doc.payment_method,
                        safe: response.data.doc.safe,
                        invoice_code: response.data.doc.code,
                        total_discount: response.data.doc.total_discount,
                        total_tax: response.data.doc.total_tax,
                        items: response.data.doc.items,
                        source_type: {
                          id: 2,
                          en: 'Sales Store',
                          ar: 'إذن صرف / فاتورة مبيعات',
                        },
                        active: true,
                      };
                      $scope.addAccountInvoice(account_invoices);
                    }
                    $scope.store_out = {};
                    $scope.loadAll({ date: new Date() });
                    site.hideModal('#addStoreOutModal');
                    $timeout(() => {
                      document.querySelector('#clickNew').click();
                    }, 250);
                  } else {
                    $scope.error = response.data.error;
                    if (response.data.error.like('*OverDraft Not*')) {
                      $scope.busy = false;
                      $scope.error = '##word.overdraft_not_active##';
                    } else if (response.data.error.like('*n`t Found Open Shi*')) {
                      $scope.busy = false;
                      $scope.error = '##word.open_shift_not_found##';
                    } else if (response.data.error.like('*n`t Open Perio*')) {
                      $scope.busy = false;
                      $scope.error = '##word.should_open_period##';
                    } else if (response.data.error.like('*Must Enter Code*')) {
                      $scope.busy = false;
                      $scope.error = '##word.must_enter_code##';
                    }
                  }
                },
                function (err) {
                  $scope.error = err.message;
                }
              );
            }
          });
        });
      } else {
        $scope.error = '##word.must_enter_quantity##';
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
      method: 'POST',
      url: '/api/stores_out/view',
      data: {
        id: store_out.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_out = response.data.doc;

          if ($scope.store_out.currency) {
            site.strings['currency'] = {
              ar: ' ' + $scope.store_out.currency.name_ar + ' ',
              en: ' ' + $scope.store_out.currency.name_en + ' ',
            };
            site.strings['from100'] = {
              ar: ' ' + $scope.store_out.currency.minor_currency_ar + ' ',
              en: ' ' + $scope.store_out.currency.minor_currency_en + ' ',
            };
            $scope.store_out.net_txt = site.stringfiy($scope.store_out.net_value);
          }
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
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
    }

    $scope.getStockItems(store_out.items, store_out.store, (callback) => {
      if (!callback) {
        $scope.financialYear(store_out.date, (is_allowed_date) => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {
            $scope.busy = true;
            $http({
              method: 'POST',
              url: '/api/stores_out/delete',
              data: store_out,
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  site.hideModal('#deleteStoreOutModal');
                  if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.link_warehouse_account_invoices) {
                    $scope.deleteAccountInvoices(store_out);
                  }
                  $scope.loadAll({ date: new Date() });
                } else {
                  $scope.error = response.data.error;
                  if (response.data.error.like('*OverDraft Not*')) {
                    $scope.error = '##word.overdraft_not_active##';
                  } else if (response.data.error.like('*n`t Found Open Shi*')) {
                    $scope.error = '##word.open_shift_not_found##';
                  } else if (response.data.error.like('*n`t Open Perio*')) {
                    $scope.error = '##word.should_open_period##';
                  }
                  if (response.data.error.like('*t`s Have Account Invo*')) {
                    $scope.error = '##word.cant_process_found_invoice##';
                  }
                }
              },
              function (err) {
                console.log(err);
              }
            );
          }
        });
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    });
  };

  $scope.deleteAccountInvoices = function (item) {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/account_invoices/delete',
      data: {
        company: item.company,
        branch: item.branch,
        where: {
          source_type_id: 2,
          invoice_id: item.id,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#accountInvoicesDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count -= 1;
            }
          });
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*n`t Found Open Shi*')) {
            $scope.error = '##word.open_shift_not_found##';
          } else if (response.data.error.like('*n`t Open Perio*')) {
            $scope.error = '##word.should_open_period##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.detailsCustomer = function (callback) {
    $scope.error = '';
    $scope.busy = true;

    let customer = '';
    if ($scope.account_invoices && $scope.account_invoices.customer) {
      customer = $scope.account_invoices.customer;
    } else if ($scope.store_out && $scope.store_out.customer) {
      customer = $scope.store_out.customer;
    }

    $http({
      method: 'POST',
      url: '/api/customers/view',
      data: {
        id: customer.id,
      },
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
    );
  };

  $scope.detailsAccountInvoices = function (storeOut) {
    $scope.busy = true;

    let where = {};
    if (storeOut.type.id == 3) {
      where = { invoice_id: storeOut.id, 'source_type.id': 2 };
    } else if (storeOut.type.id == 4) {
      where = { invoice_id: storeOut.order_id, 'source_type.id': 3 };
    }

    $http({
      method: 'POST',
      url: '/api/account_invoices/view',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.store_out = storeOut;
          $scope.account_invoices = response.data.doc || {};
          $scope.account_invoices.$view = true;

          site.showModal('#accountInvoicesDetailsModal');
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayPaymentInvoices = function (invoices) {
    $scope.error = '';

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.paid_invoice = invoices;
        $scope.payment_date = new Date();
        $scope.paid_invoice.payment_paid_up = 0;
        if ($scope.defaultSettings.accounting) {
          $scope.paid_invoice.currency = $scope.currencySetting;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.paid_invoice.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.paid_invoice.payment_method, $scope.paid_invoice.currency);
            if ($scope.paid_invoice.payment_method.id === 1) $scope.paid_invoice.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.paid_invoice.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.paid_invoice.currency) {
          $scope.paid_invoice.amount_currency = site.toNumber($scope.paid_invoice.remain_amount) / site.toNumber($scope.paid_invoice.currency.ex_rate);
          $scope.paid_invoice.amount_currency = site.toNumber($scope.paid_invoice.amount_currency);
          $scope.paid_invoice.payment_paid_up = $scope.paid_invoice.amount_currency;
        }
        site.showModal('#invoicesPaymentModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.acceptPaymentInvoice = function () {
    $scope.error = '';
    $scope.detailsCustomer((customer) => {
      if (!$scope.paid_invoice.safe) {
        $scope.error = '##word.should_select_safe##';
        return;
      } else if (!$scope.paid_invoice.payment_paid_up) {
        $scope.error = '##word.err_paid_up##';
        return;
      } else if ($scope.paid_invoice.payment_paid_up > $scope.paid_invoice.amount_currency) {
        $scope.error = '##word.err_paid_up_payment##';
        return;
      } else if (
        $scope.paid_invoice.payment_paid_up > $scope.paid_invoice.amount_currency &&
        $scope.paid_invoice.source_type.id != 8 &&
        $scope.paid_invoice.source_type.id != 9 &&
        $scope.paid_invoice.source_type.id != 10 &&
        $scope.paid_invoice.source_type.id != 11
      ) {
        $scope.error = '##word.err_net_value##';
        return;
      }

      if ($scope.paid_invoice.customer && $scope.paid_invoice.payment_method && $scope.paid_invoice.payment_method.id === 10) {
        if (customer) {
          let totalCustomerBalance = 0;
          let customerPay = $scope.paid_invoice.payment_paid_up * $scope.paid_invoice.currency.ex_rate;

          totalCustomerBalance = (customer.balance || 0) + (customer.credit_limit || 0);

          if (customerPay > totalCustomerBalance) {
            $scope.error = '##word.cannot_exceeded_customer##';
            return;
          }
        }
      }

      $scope.paid_invoice.payment_list = $scope.paid_invoice.payment_list || [];
      $scope.paid_invoice.payment_list.unshift({
        paid_up: $scope.paid_invoice.payment_paid_up,
        payment_method: $scope.paid_invoice.payment_method,
        currency: $scope.paid_invoice.currency,
        shift: $scope.shift,
        safe: $scope.paid_invoice.safe,
        date: $scope.payment_date,
      });

      $scope.busy = true;
      $http({
        method: 'POST',
        url: '/api/account_invoices/update_payment',
        data: $scope.paid_invoice,
      }).then(
        function (response) {
          $scope.busy = false;

          if (response.data.done) {
            $scope.detailsAccountInvoices($scope.store_out);
            site.hideModal('#invoicesPaymentModal');
          } else {
            $scope.error = response.data.error;
            if (response.data.error.like('*n`t Found Open Shi*')) {
              $scope.error = '##word.open_shift_not_found##';
            } else if (response.data.error.like('*n`t Open Perio*')) {
              $scope.error = '##word.should_open_period##';
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    });
  };

  $scope.addToItems = function () {
    $scope.error = '';
    if ($scope.store_out.type) {
      let foundSize = false;

      if ($scope.item.sizes && $scope.item.sizes.length > 0)
        $scope.item.sizes.forEach((_size) => {
          foundSize = $scope.store_out.items.some((_itemSize) => _itemSize.barcode === _size.barcode && _itemSize.unit.id === _size.unit.id);
          if (_size.count > 0 && !foundSize) {
            let discount = 0;

            _size.value_added = site.toNumber(_size.value_added);
            _size.total_v_a = (site.toNumber(_size.value_added) * (_size.price * _size.count)) / 100;
            _size.total_v_a = site.toNumber(_size.total_v_a);
            if (_size.count) {
              if (_size.discount.type == 'number') discount = (_size.discount.value || 0) * _size.count;
              else if (_size.discount.type == 'percent') discount = ((_size.discount.value || 0) * (_size.price * _size.count)) / 100;

              _size.total = site.toNumber(_size.total * _size.count) - discount + _size.total_v_a;
              _size.total = site.toNumber(_size.total);
            }
            let itmObj = {
              image_url: $scope.item.image_url,
              name_ar: _size.name_ar,
              name_en: _size.name_en,
              size_ar: _size.size_ar,
              value_added: _size.value_added,
              total_v_a: _size.total_v_a,
              item_group: _size.item_group,
              work_patch: _size.work_patch,
              work_serial: _size.work_serial,
              item_type: _size.item_type,
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
              store_count: _size.store_count,
              add_sizes: _size.add_sizes,
            };
            $scope.store_out.items.push(itmObj);
            $scope.calcSize($scope.store_out.items[$scope.store_out.items.length - 1]);
          }
        });
      $scope.item.sizes = [];
    } else $scope.error = '##word.err_transaction_type##';
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
        method: 'POST',
        url: '/api/stores_items/all',
        data: {
          search: $scope.item.search_item_name,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;
              $scope.item.sizes = $scope.item.sizes || [];
              response.data.list.forEach((_item) => {
                if (_item.sizes && _item.sizes.length > 0)
                  _item.sizes.forEach((_size) => {
                    let foundHold = false;
                    let indxUnit = 0;
                    _size.add_sizes = _item.add_sizes;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach((_unit, i) => {
                        if (_unit.id == _item.main_unit.id) indxUnit = i;
                      });

                    if (_size.barcode === $scope.item.search_item_name || _size.size_units_list[indxUnit].barcode === $scope.item.search_item_name) {
                      _size.name_ar = _item.name_ar;
                      _size.name_en = _item.name_en;
                      _size.item_group = _item.item_group;
                      _size.store = $scope.store_out.store;
                      _size.unit = _size.size_units_list[indxUnit];
                      $scope.getOfferActive(_size.barcode, (offer_active) => {
                        if (offer_active) {
                          offer_active.size_units_list.forEach((_offerUnit) => {
                            if (_offerUnit.id === _size.unit.id) {
                              _size.discount = _offerUnit.discount;
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
                              if (foundStore) _size.store_count = _size.branches_list[indxBranch].stores_list[indxStore].current_count;
                            } else _size.store_count = 0;
                          } else _size.store_count = 0;
                        } else _size.store_count = 0;
                      } else _size.store_count = 0;

                      foundSize = $scope.item.sizes.some((_itemSize) => _itemSize.barcode === _size.barcode);

                      if (_size.store_units_list && _size.store_units_list.length > 0) {
                        _size.store_units_list.forEach((_ul) => {
                          if (_ul.id == _size.unit.id) {
                            if (_ul.patch_list && _ul.patch_list.length > 0) {
                              _ul.patch_list.forEach((_p) => {
                                _p.current_count = _p.count;
                                _p.count = 0;
                              });
                              _size.patch_list = _ul.patch_list;
                            }
                          }
                        });
                      }

                      if (!foundSize && !foundHold) $scope.item.sizes.push(_size);
                    }
                  });
              });

              if (!foundSize) $scope.itemsNameList = response.data.list;
              else if (foundSize) $scope.error = '##word.dublicate_item##';
            }
          } else {
            $scope.error = response.data.error;
            $scope.item = {
              sizes: [],
            };
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  /*  $scope.changeUnitSelect = function (_item) {
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
            if (foundStore) {
              _item.store_count = _item.branches_list[indxBranch].stores_list[indxStore].current_count
            } else _item.store_count = 0;
          } else _item.store_count = 0;
        } else _item.store_count = 0;
      } else _item.store_count = 0;
    } else {
      _item.store_count = 0;
    }
  }; 
 */

  $scope.itemsStoresOut = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.itm && $scope.item.itm.sizes && $scope.item.itm.sizes.length > 0) {
      $scope.item.itm.sizes.forEach((_item) => {
        let foundHold = false;
        _item.add_sizes = $scope.item.itm.add_sizes;
        _item.name_ar = $scope.item.itm.name_ar;
        _item.name_en = $scope.item.itm.name_en;
        _item.item_group = $scope.item.itm.item_group;
        _item.store = $scope.store_out.store;
        _item.count = 1;
        _item.value_added = _item.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;

        let indxUnit = 0;

        if (_item.size_units_list && _item.size_units_list.length > 0) {
          indxUnit = _item.size_units_list.findIndex((_unit) => _unit.id == $scope.item.itm.main_unit.id);
          _item.unit = _item.size_units_list[indxUnit];
          _item.discount = _item.size_units_list[indxUnit].discount;
          _item.average_cost = _item.size_units_list[indxUnit].average_cost;
          _item.price = _item.size_units_list[indxUnit].price;
          _item.cost = _item.size_units_list[indxUnit].cost;

          if ($scope.store_out.type && $scope.store_out.type.id == 5) _item.total = _item.count * _item.average_cost;
          else _item.total = _item.count * _item.price;
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
                if (foundStore) {
                  _item.store_count = _item.branches_list[indxBranch].stores_list[indxStore].current_count;
                } else _item.store_count = 0;
              } else _item.store_count = 0;
            } else _item.store_count = 0;
          } else _item.store_count = 0;
        } else _item.store_count = 0;

        foundSize = $scope.item.sizes.some((_itemSize) => _itemSize.barcode === _item.barcode && _itemSize.unit.id === _item.unit.id);

        if (_item.store_units_list && _item.store_units_list.length > 0) {
          _item.store_units_list.forEach((_ul) => {
            if (_ul.id == _item.unit.id) {
              if (_ul.patch_list && _ul.patch_list.length > 0) {
                _ul.patch_list.forEach((_p) => {
                  _p.current_count = _p.count;
                  _p.count = 0;
                });
                _item.patch_list = _ul.patch_list;
              }
            }
          });
        }

        if (!foundSize && !foundHold) {
          $scope.item.sizes.push(_item);
        }
      });
    }
  };

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/stores_items/all',
        data: {
          where: { barcode: $scope.search_barcode },
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;

              if (response.data.list[0].sizes && response.data.list[0].sizes.length > 0)
                response.data.list[0].sizes.forEach((_size) => {
                  let foundHold = false;
                  let indxUnit = 0;
                  _size.add_sizes = response.data.list[0].add_sizes;

                  if (_size.size_units_list && _size.size_units_list.length > 0) {
                    let foundUnit = false;
                    _size.size_units_list.forEach((_unit, i) => {
                      if ($scope.search_barcode === _unit.barcode) {
                        foundUnit = true;
                        indxUnit = i;
                      } else if (_unit.id === response.data.list[0].main_unit.id && !foundUnit) {
                        indxUnit = i;
                      }
                    });
                  }

                  if (_size.branches_list && _size.branches_list.length > 0)
                    _size.branches_list.forEach((_branch) => {
                      if (_branch.code == '##session.branch.code##')
                        _branch.stores_list.forEach((_store) => {
                          if (_store.store && _store.store.id == $scope.store_out.store.id) {
                            _size.store_count = _store.current_count;
                            _size.store_units_list = _store.size_units_list;
                            if (_store.hold) foundHold = true;
                          }
                        });
                    });

                  if (_size.barcode === $scope.search_barcode || _size.size_units_list[indxUnit].barcode === $scope.search_barcode) {
                    _size.name_ar = response.data.list[0].name_ar;
                    _size.name_en = response.data.list[0].name_en;
                    _size.item_group = response.data.list[0].item_group;
                    _size.store = $scope.store_out.store;
                    _size.unit = _size.size_units_list[indxUnit];

                    $scope.getOfferActive(_size.barcode, (offer_active) => {
                      if (offer_active) {
                        offer_active.size_units_list.forEach((_offerUnit) => {
                          if (_offerUnit.id === _size.unit.id) {
                            _size.discount = _offerUnit.discount;
                          }
                        });
                      } else _size.discount = _size.size_units_list[indxUnit].discount;
                    });

                    _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                    _size.price = _size.size_units_list[indxUnit].price;
                    _size.cost = _size.size_units_list[indxUnit].cost;
                    _size.count = 1;
                    _size.value_added = _size.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;

                    foundSize = $scope.store_out.items.some((_itemSize) => _itemSize.barcode === _size.barcode && _itemSize.unit.id === _size.unit.id);
                    if (_size.store_units_list && _size.store_units_list.length > 0) {
                      _size.store_units_list.forEach((_ul) => {
                        if (_ul.id == _size.unit.id) {
                          if (_ul.patch_list && _ul.patch_list.length > 0) {
                            _ul.patch_list.forEach((_p) => {
                              _p.current_count = _p.count;
                              _p.count = 0;
                            });
                            _size.patch_list = _ul.patch_list;
                          }
                        }
                      });
                    }
                    _size.branches_list = [];
                    if (!foundSize && !foundHold) $scope.store_out.items.unshift(_size);
                    else if (foundSize) {
                      $scope.store_out.items.forEach((_item) => {
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
            }, 200);
          } else {
            $scope.error = response.data.error;
          }
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
      $scope.error = '##word.date_exceed##';
      return;
    }

    if (!$scope.store_out.payment_type && $scope.store_out.type.id != 5) {
      $scope.error = '##word.must_choose_payment_type##';
      return;
    }

    if ($scope.store_out.payment_type) {
      if ($scope.store_out.type && $scope.store_out.type.id != 5 && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
        if (!$scope.store_out.safe) {
          $scope.error = '##word.nosafe_warning##';
          return;
        }
      }

      if ($scope.store_out.paid_up > $scope.store_out.amount_currency) {
        $scope.error = '##word.err_net_value##';
        return;
      }

      if ($scope.store_out.paid_up < $scope.store_out.amount_currency && $scope.store_out.payment_type.id == 1) {
        $scope.error = '##word.amount_must_paid_full##';
        return;
      }
    } else {
      $scope.store_out.paid_up = undefined;
      $scope.store_out.safe = undefined;
      $scope.store_out.Paid_from_customer = undefined;
      $scope.store_out.payment_method = undefined;
      $scope.store_out.currency = undefined;
    }

    let max_discount = false;
    let returned_count = false;
    let patchCount = false;

    if ($scope.store_out.items && $scope.store_out.items.length > 0) {
      notExistCount = $scope.store_out.items.some((_iz) => _iz.count < 1);

      $scope.store_out.items.forEach((_itemSize) => {
        if (_itemSize.discount.value > _itemSize.discount.max) max_discount = true;
        if (_itemSize.count > _itemSize.r_count) returned_count = true;
      });
    } else {
      $scope.error = '##word.must_enter_quantity##';
      return;
    }

    if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
      if (max_discount) {
        $scope.error = '##word.err_maximum_discount##';
        return;
      }
    }

    if ($scope.store_out.type.id == 6) {
      if (returned_count) {
        $scope.error = '##word.return_item_err##';
        return;
      }
    }

    if (notExistCount) {
      $scope.error = '##word.err_exist_count##';
      return;
    }

    if (patchCount) {
      $scope.error = `##word.err_patch_count##   ( ${patch_list.join('-')} )`;
      return;
    }

    $scope.store_out.items.forEach((_itemSize) => {
      if (_itemSize.work_patch && _itemSize.patch_list && _itemSize.patch_list.length > 0) {
        let c = 0;
        _itemSize.patch_list.map((p) => (c += p.count));

        let difference = _itemSize.count - c;
        if (_itemSize.count > c) {
          _itemSize.patch_list = _itemSize.patch_list
            .slice()
            .sort((a, b) => new Date(b.expiry_date) - new Date(a.expiry_date))
            .reverse();
          _itemSize.patch_list.forEach((_pl) => {
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

    $scope.testPatches($scope.store_out, (callback) => {
      if (callback.patchCount) {
        $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
        return;
      }

      $scope.financialYear($scope.store_out.date, (is_allowed_date) => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {
          if ($scope.account_invoices && $scope.account_invoices.payable_list && $scope.account_invoices.payable_list.length > 0) {
            $scope.store_out.payable_list = $scope.account_invoices.payable_list;
          }

          $scope.busy = true;
          $http({
            method: 'POST',
            url: '/api/stores_out/update',
            data: $scope.store_out,
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                site.hideModal('#updateStoreOutModal');
              } else {
                $scope.error = response.data.error;
                if (response.data.error.like('*n`t Found Open Shi*')) {
                  $scope.error = '##word.open_shift_not_found##';
                } else if (response.data.error.like('*n`t Open Perio*')) {
                  $scope.error = '##word.should_open_period##';
                }
              }
            },
            function (err) {
              console.log(err);
            }
          );
        }
      });
    });
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          type: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.storesList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/currency/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          minor_currency_ar: 1,
          minor_currency_en: 1,
          ex_rate: 1,
          code: 1,
        },
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currenciesList = response.data.list;
          $scope.currenciesList.forEach((_c) => {
            if ($scope.defaultSettings && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.currency && $scope.defaultSettings.accounting.currency.id == _c.id) {
              $scope.currencySetting = _c;
            }
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSafeByType = function (obj) {
    $scope.error = '';
    if ($scope.defaultSettings.accounting && obj.payment_method) {
      $scope.loadSafes(obj.payment_method, obj.currency);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box) obj.safe = $scope.defaultSettings.accounting.safe_box;
      } else {
        if ($scope.defaultSettings.accounting.safe_bank) obj.safe = $scope.defaultSettings.accounting.safe_bank;
      }
    }
  };

  $scope.loadSafes = function (method, currency, callback) {
    callback = callback || function () {};
    $scope.error = '';
    $scope.busy = true;
    if (currency) {
      let where = {
        'currency.id': currency.id,
      };

      if (method.id == 1) where['type.id'] = 1;
      else where['type.id'] = 2;

      $http({
        method: 'POST',
        url: '/api/safes/all',
        data: {
          select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
            commission: 1,
            currency: 1,
            type: 1,
            code: 1,
          },
          where: where,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.safesList = response.data.list;
          }
          callback($scope.safesList);
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.loadStoresOutTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_out/types/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesOutTypes = response.data;
        $scope.storesOutType = {
          id: 3,
          en: "Sale Invoice Store",
          ar: "فاتورة مبيعات"
      };
        $scope.storesOutTypes.forEach((_t) => {
          if (_t.id == site.toNumber('##query.type##')) $scope.source_type = _t;
        });
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.categories = [];
    $http({
      method: 'POST',
      url: '/api/items_group/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.categories = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadTaxTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/tax_types/all',
      data: {
        select: {
          code: 1,
          id: 1,
          name_ar: 1,
          name_en: 1,
          value: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.tax_types = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/discount_types/all',
      data: {
        select: {
          code: 1,
          id: 1,
          name_ar: 1,
          name_en: 1,
          value: 1,
          type: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.discount_types = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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
      where = { limit: 100, type: { id: site.toNumber('##query.type##') } };
    } else {
      where.type = { id: site.toNumber('##query.type##') };
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_out/all',
      data: {
        where: where,
      },
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
    );
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
          payment_type: store_out.payment_type,
          customer: store_out.customer,
          total_value_added: store_out.total_value_added,
          shift: shift,
          net_value: store_out.net_value,
          paid_up: 0,
          invoice_code: store_out.code,
          total_discount: store_out.total_discount,
          total_tax: store_out.total_tax,
          items: store_out.items,
          source_type: {
            id: 2,
            en: 'Sales Store',
            ar: 'إذن صرف / فاتورة مبيعات',
          },
          active: true,
        };

        if ($scope.defaultSettings.accounting) {
          $scope.account_invoices.currency = $scope.currencySetting;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id == 1) $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.account_invoices.currency) {
          $scope.account_invoices.amount_currency = $scope.account_invoices.net_value / $scope.account_invoices.currency.ex_rate;
          $scope.account_invoices.amount_currency = site.toNumber($scope.account_invoices.amount_currency);
          $scope.account_invoices.paid_up = $scope.account_invoices.amount_currency;
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
      if (account_invoices.paid_up < account_invoices.amount_currency && account_invoices.payment_type.id == 1) {
        $scope.error = '##word.amount_must_paid_full##';
        return;
      }

      if (account_invoices.paid_up > 0 && !account_invoices.safe) {
        $scope.error = '##word.should_select_safe##';
        return;
      } else if (account_invoices.paid_up > account_invoices.amount_currency) {
        $scope.error = '##word.err_net_value##';
        return;
      }

      if (account_invoices.customer && account_invoices.payment_method && account_invoices.payment_method.id == 5) {
        let totalCustomerBalance = 0;
        totalCustomerBalance = customer.balance + (customer.credit_limit || 0);

        let customerPay = account_invoices.paid_up * account_invoices.currency.ex_rate;

        if (customerPay > totalCustomerBalance) {
          $scope.error = '##word.cannot_exceeded_customer##';
          return;
        }
      }

      if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting) account_invoices.posting = false;
      else account_invoices.posting = true;

      $http({
        method: 'POST',
        url: '/api/account_invoices/add',
        data: account_invoices,
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.account_invoices = {};
            if (account_invoices.source_type.id == 2 && account_invoices.paid_up > 0) {
              account_invoices.ref_invoice_id = response.data.doc.id;
              if (account_invoices.invoice_type.id == 3 || account_invoices.invoice_type.id == 4) {
                if (account_invoices.invoice_type.id == 3) {
                  account_invoices.in_type = {
                    id: 3,
                    en: 'sales invoice',
                    ar: 'فاتورة مبيعات',
                  };
                } else if (account_invoices.invoice_type.id == 4) {
                  account_invoices.in_type = {
                    id: 2,
                    en: 'Orders Screen',
                    ar: 'شاشة الطلبات',
                  };
                }

                account_invoices.source_type = {
                  id: 8,
                  en: 'Amount In',
                  ar: 'سند قبض',
                };
                $scope.addAccountInvoice(account_invoices);
              } else if (account_invoices.invoice_type.id == 6) {
                account_invoices.in_type = {
                  id: 4,
                  en: 'Return purchase invoice',
                  ar: 'مرتجع فاتورة مشتريات',
                };
                account_invoices.source_type = {
                  id: 9,
                  en: 'Amount Out',
                  ar: 'سند صرف',
                };
                $scope.addAccountInvoice(account_invoices);
              }
            }
            site.hideModal('#accountInvoiceModal');
            $scope.loadAll({ date: new Date() });
          } else {
            $scope.error = response.data.error;
            if (response.data.error.like('*Must Enter Code*')) {
              $scope.error = '##word.must_enter_code##';
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    });
  };

  $scope.thermalPrint = function (obj) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    $scope.thermal = { ...obj };
    $('#thermalPrint').removeClass('hidden');
    if ($scope.thermal.currency) {
      site.strings['currency'] = {
        ar: ' ' + $scope.thermal.currency.name_ar + ' ',
        en: ' ' + $scope.thermal.currency.name_en + ' ',
      };
      site.strings['from100'] = {
        ar: ' ' + $scope.thermal.currency.minor_currency_ar + ' ',
        en: ' ' + $scope.thermal.currency.minor_currency_en + ' ',
      };
      $scope.thermal.net_txt = site.stringfiy($scope.thermal.net_value);
    }
    JsBarcode('.barcode', $scope.thermal.code);
    document.querySelector('#qrcode').innerHTML = '';
    let datetime = new Date($scope.thermal.date);
    let formatted_date = datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' + datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds();
    let qrString = `[${'##session.company.name_ar##'}]\nرقم ضريبي : [${$scope.defaultSettings.printer_program.tax_number}]\nرقم الفاتورة :[${
      $scope.thermal.code
    }]\nتاريخ : [${formatted_date}]\nضريبة القيمة المضافة : [${$scope.thermal.total_value_added}]\nالصافي : [${$scope.thermal.net_value}]`;

    if ($scope.defaultSettings.printer_program.place_qr) {
      if ($scope.defaultSettings.printer_program.place_qr.id == 1) {
        site.qrcode({ selector: '#qrcode', text: document.location.protocol + '//' + document.location.hostname + `/qr_storeout?id=${$scope.thermal.id}` });
      } else if ($scope.defaultSettings.printer_program.place_qr.id == 2) {
        site.qrcode({ selector: '#qrcode', text: qrString });
      }
    }

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path && $scope.defaultSettings.printer_program.printer_path.ip) {
      site.printAsImage({
        selector: '#thermalPrint',
        ip: '127.0.0.1',
        port: '60080',
        printer: $scope.defaultSettings.printer_program.printer_path.ip.name.trim(),
      });
    } else {
      $scope.error = '##word.thermal_printer_must_select##';
    }

    $scope.busy = false;
    $timeout(() => {
      $('#thermalPrint').addClass('hidden');
    }, 5000);
  };
  $scope.print = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;
    if ($scope.defaultSettings.printer_program.a4_printer) {
      $('#storeOutDetails').removeClass('hidden');

      let datetime = new Date($scope.store_out.date);
      let formatted_date = datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' + datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds();
      let qrString = `[${'##session.company.name_ar##'}]\nرقم ضريبي : [${$scope.defaultSettings.printer_program.tax_number}]\nرقم الفاتورة :[${
        $scope.store_out.code
      }]\nتاريخ : [${formatted_date}]\nضريبة القيمة المضافة : [${$scope.store_out.total_value_added}]\nالصافي : [${$scope.store_out.net_value}]`;

      if ($scope.store_out.items.length > 7) {
        $scope.invList = [];
        let inv_length = $scope.store_out.items.length / 7;
        inv_length = parseInt(inv_length);
        let ramain_items = $scope.store_out.items.length - inv_length * 7;

        if (ramain_items) {
          inv_length += 1;
        }

        for (let i_inv = 0; i_inv < inv_length; i_inv++) {
          let s_o = { ...$scope.store_out };

          s_o.items = [];
          $scope.store_out.items.forEach((itm, i) => {
            itm.$index = i + 1;
            if (i < (i_inv + 1) * 7 && !itm.$done_inv) {
              itm.$done_inv = true;
              s_o.items.push(itm);
            }
          });

          $scope.invList.push(s_o);
        }
      } else {
        $scope.store_out.items.forEach((_item, i) => {
          _item.$index = i + 1;
        });
        $scope.invList = [{ ...$scope.store_out }];
      }

      $scope.localPrint = function () {
        if (document.querySelectorAll('.qrcode').length !== $scope.invList.length) {
          $timeout(() => {
            $scope.localPrint();
          }, 300);
          return;
        }

          if ($scope.defaultSettings.printer_program.place_qr) {
            if ($scope.defaultSettings.printer_program.place_qr.id == 1) {
              site.qrcode({ selector: document.querySelectorAll('.qrcode:last-child')[$scope.invList.length - 1], text: document.location.protocol + '//' + document.location.hostname + `/qr_storeout?id=${$scope.store_out.id}` });
            } else if ($scope.defaultSettings.printer_program.place_qr.id == 2) {
              site.qrcode({ selector: document.querySelectorAll('.qrcode:last-child')[$scope.invList.length - 1], text: qrString });
            }
          }

        $timeout(() => {
          site.print({
            selector: '#storeOutDetails',
            ip: '127.0.0.1',
            port: '60080',
            printer: $scope.defaultSettings.printer_program.a4_printer.ip.name.trim(),
          });
        }, 500);
      };

      $scope.localPrint();
    } else {
      $scope.error = '##word.a4_printer_must_select##';
    }
    $scope.busy = false;
        $timeout(() => {
      $('#storeOutDetails').addClass('hidden');
    }, 8000);
  };


  $scope.getCustomerGroupList = function () {
    $http({
      method: 'POST',
      url: '/api/customers_group/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.customerGroupList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getGender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: 'POST',
      url: '/api/gender/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.ChangeUnitPatch = function (itm) {
    $scope.error = '';
    itm.price = itm.unit.price;
    itm.average_cost = itm.unit.average_cost;

    $scope.getOfferActive(itm.barcode, (offer_active) => {
      if (offer_active) {
        offer_active.size_units_list.forEach((_offerUnit) => {
          if (_offerUnit.id === itm.unit.id) {
            itm.discount = _offerUnit.discount;
          }
        });
      } else itm.discount = itm.unit.discount;
    });

    if (itm.store_units_list && itm.store_units_list.length > 0) {
      itm.store_units_list.forEach((_store_unit) => {
        if (_store_unit.id == itm.unit.id) {
          if (_store_unit.patch_list && _store_unit.patch_list.length > 0)
            _store_unit.patch_list.forEach((_p) => {
              _p.current_count = _p.count;
              _p.count = 0;
            });

          itm.patch_list = _store_unit.patch_list;
        }
      });
    }

    $scope.calcSize(itm);
  };

  $scope.getCustomersGetList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/customers/all',
      data: {
        where: {
          active: true,
        },
        /*  select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
        } */
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.customersGetList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.addCustomerFiles = function () {
    $scope.error = '';
    $scope.customer.files_list = $scope.customer.files_list || [];
    $scope.customer.files_list.push({
      file_date: new Date(),
      file_upload_date: new Date(),
      upload_by: '##user.name##',
    });
  };

  $scope.displayAddCustomer = function () {
    $scope.error = '';
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
      address_list: [{}],
      balance_creditor: 0,
      balance_debtor: 0,
      branch_list: [
        {
          charge: [{}],
        },
      ],
      currency_list: [],
      opening_balance: [{ initial_balance: 0 }],
      bank_list: [{}],
      dealing_company: [{}],
    };

    if (site.feature('medical')) {
      $scope.customer.image_url = '/images/patients.png';
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    } else if (site.feature('school') || site.feature('academy')) {
      $scope.customer.image_url = '/images/student.png';
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];
    }
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
      method: 'POST',
      url: '/api/customers/add',
      data: $scope.customer,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerAddModal');
        } else {
          $scope.error = 'Please Login First';
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = '##word.err_maximum_adds##';
          } else if (response.data.error.like('*ername must be typed correctly*')) {
            $scope.error = '##word.err_username_contain##';
          } else if (response.data.error.like('*User Is Exist*')) {
            $scope.error = '##word.user_exists##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/customers/all',
        data: {
          search: $scope.search_customer,
          where: {
            active: true,
          },
          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
        },
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
      );
    }
  };

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/goves/all',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
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
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/city/all',
      data: {
        where: {
          'gov.id': gov.id,
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
        },
      },
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
    );
  };
  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/area/all',
      data: {
        where: {
          'city.id': city.id,
          active: true,
        },
      },
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
    );
  };

  $scope.loadDelegates = function () {
    $scope.busy = true;
    $scope.delegatesList = [];
    $http({
      method: 'POST',
      url: '/api/delegates/all',
      data: {
        where: {
          active: true,
        },
      },
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
    );
  };

  $scope.getPaymentMethodList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.paymentMethodList = [];
    $http({
      method: 'POST',
      url: '/api/payment_method/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.paymentMethodList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.posting = function (store_out) {
    $scope.error = '';

    if (site.toNumber('##query.type##') == 4 && store_out.posting) {
      store_out.posting = false;
      $scope.error = '##word.from_order_management_screen##';
      return;
    }

    if (!store_out.posting && store_out.return_paid && store_out.net_value != store_out.return_paid.net_value) {
      store_out.posting = true;
      $scope.error = '##word.err_unpost_return##';
      return;
    }

    let notExistCount = store_out.items.some((_iz) => _iz.count < 1);

    if (notExistCount) {
      if (store_out.posting) store_out.posting = false;
      else store_out.posting = true;

      $scope.error = '##word.err_exist_count##';
      return;
    }

    $scope.getStockItems(store_out.items, store_out.store, (callback) => {
      $scope.testPatches(store_out, (callbackTest) => {
        if (callbackTest.patchCount) {
          $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
          if (store_out.posting) store_out.posting = false;
          else store_out.posting = true;

          return;
        }

        if (!callback) {
          $scope.financialYear(store_out.date, (is_allowed_date) => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
              if (store_out.posting) store_out.posting = false;
              else store_out.posting = true;
            } else {
              $scope.busy = true;
              $http({
                method: 'POST',
                url: '/api/stores_out/posting',
                data: store_out,
              }).then(
                function (response) {
                  $scope.busy = false;
                  if (response.data.done) {
                    if (!store_out.posting && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.link_warehouse_account_invoices) {
                      $scope.deleteAccountInvoices(store_out);
                    } else if (
                      store_out.posting &&
                      store_out.type &&
                      !store_out.invoice &&
                      store_out.type.id != 5 &&
                      $scope.defaultSettings.accounting &&
                      $scope.defaultSettings.accounting.link_warehouse_account_invoices
                    ) {
                      let account_invoices = {
                        image_url: '/images/account_invoices.png',
                        date: response.data.doc.date,
                        invoice_id: response.data.doc.id,
                        payment_type: response.data.doc.payment_type,
                        payable_list: response.data.doc.payable_list,
                        customer: response.data.doc.customer,
                        total_value_added: response.data.doc.total_value_added,
                        invoice_type: response.data.doc.type,
                        currency: response.data.doc.currency,
                        shift: response.data.doc.shift,
                        net_value: response.data.doc.net_value,
                        Paid_from_customer: response.data.doc.Paid_from_customer,
                        paid_up: response.data.doc.paid_up || 0,
                        payment_method: response.data.doc.payment_method,
                        safe: response.data.doc.safe,
                        invoice_code: response.data.doc.code,
                        total_discount: response.data.doc.total_discount,
                        total_tax: response.data.doc.total_tax,
                        items: response.data.doc.items,
                        source_type: {
                          id: 2,
                          en: 'Sales Store',
                          ar: 'إذن صرف / فاتورة مبيعات',
                        },
                        active: true,
                      };
                      $scope.addAccountInvoice(account_invoices);
                    }
                  } else {
                    $scope.error = '##word.error##';
                    if (response.data.error.like('*OverDraft Not*')) {
                      $scope.error = '##word.overdraft_not_active##';
                    } else if (response.data.error.like('*n`t Found Open Shi*')) {
                      $scope.error = '##word.open_shift_not_found##';
                    } else if (response.data.error.like('*n`t Open Perio*')) {
                      $scope.error = '##word.should_open_period##';
                    }
                    if (response.data.error.like('*t`s Have Account Invo*')) {
                      $scope.error = '##word.cant_process_found_invoice##';
                    }
                    if (store_out.posting) store_out.posting = false;
                    else store_out.posting = true;
                  }
                },
                function (err) {
                  console.log(err);
                }
              );
            }
          });
        } else {
          if (store_out.posting) store_out.posting = false;
          else store_out.posting = true;
          $scope.error = '##word.err_stock_item##';
        }
      });
    });
  };

  $scope.postingAll = function (store_out_all) {
    $scope.error = '';

    let _store_out_all = store_out_all.reverse();
    let notExist = false;
    let notExistCountList = [];
    _store_out_all.forEach((_stOut) => {
      let notExistCount = _stOut.items.some((_iz) => _iz.count < 1);
      if (notExistCount) {
        notExist = true;
        notExistCountList.push(_stOut.code);
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
            $scope.getStockItems(_store_out_all[i].items, _store_out_all[i].store, (callback) => {
              $scope.testPatches(_store_out_all[i], (callbackTest) => {
                if (callbackTest.patchCount) {
                  $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
                  _store_out_all[i].posting = false;
                  return;
                }

                if (!callback && !stopLoop) {
                  $scope.financialYear(_store_out_all[i].date, (is_allowed_date) => {
                    if (!is_allowed_date) {
                      $scope.error = '##word.should_open_period##';
                    } else {
                      _store_out_all[i].posting = true;

                      $http({
                        method: 'POST',
                        url: '/api/stores_out/posting',
                        data: _store_out_all[i],
                      }).then(
                        function (response) {
                          if (response.data.done) {
                            if (
                              _store_out_all[i].posting &&
                              !_store_out_all[i].invoice &&
                              _store_out_all[i].type &&
                              _store_out_all[i].type.id != 5 &&
                              $scope.defaultSettings.accounting &&
                              $scope.defaultSettings.accounting.link_warehouse_account_invoices
                            ) {
                              let account_invoices = {
                                image_url: '/images/account_invoices.png',
                                date: response.data.doc.date,
                                invoice_id: response.data.doc.id,
                                payable_list: response.data.doc.payable_list,
                                payment_type: response.data.doc.payment_type,
                                customer: response.data.doc.customer,
                                total_value_added: response.data.doc.total_value_added,
                                invoice_type: response.data.doc.type,
                                currency: response.data.doc.currency,
                                shift: response.data.doc.shift,
                                net_value: response.data.doc.net_value,
                                Paid_from_customer: response.data.doc.Paid_from_customer,
                                paid_up: response.data.doc.paid_up || 0,
                                payment_method: response.data.doc.payment_method,
                                safe: response.data.doc.safe,
                                invoice_code: response.data.doc.code,
                                total_discount: response.data.doc.total_discount,
                                total_tax: response.data.doc.total_tax,
                                items: response.data.doc.items,
                                source_type: {
                                  id: 2,
                                  en: 'Sales Store',
                                  ar: 'إذن صرف / فاتورة مبيعات',
                                },
                                active: true,
                              };
                              $scope.addAccountInvoice(account_invoices);
                            }
                          } else {
                            $scope.error = '##word.error##';
                            if (response.data.error.like('*OverDraft Not*')) {
                              $scope.error = '##word.overdraft_not_active##';
                            } else if (response.data.error.like('*n`t Found Open Shi*')) {
                              $scope.error = '##word.open_shift_not_found##';
                            } else if (response.data.error.like('*n`t Open Perio*')) {
                              $scope.error = '##word.should_open_period##';
                            }
                            _store_out_all[i].posting = false;
                          }
                        },
                        function (err) {
                          console.log(err);
                        }
                      );
                    }
                  });
                } else {
                  stopLoop = true;
                }
              });
            });
          }
        }, 1000 * i);
      }
      if (stopLoop) $scope.error = '##word.err_stock_item##';
    }
  };

  $scope.getStockItems = function (items, store, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_stock/item_stock',
      data: { items: items, store: store },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.found) {
            callback(true);
          } else {
            callback(false);
          }
        } else {
          callback(false);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.selectItems = function () {
    if (!$scope.store_out.store) {
      $scope.error = '##word.err_store_select##';
    } else if (!$scope.store_out.type) {
      $scope.error = '##word.err_transaction_type##';
    } else site.showModal('#selectItemsModal');
  };

  $scope.patchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    $http({
      method: 'POST',
      url: '/api/stores_items/all',
      data: {
        where: {
          store_id: $scope.store_out.store.id,
          unit_id: itm.unit.id,
          barcode: itm.barcode,
        },
      },
    }).then(function (response) {
      $scope.busy = false;
      if (response.data.done) {
        if ($scope.store_out.type && $scope.store_out.type.id == 6) {
          site.showModal('#patchesListReturnModal');
        } else {
          if (response.data.patch_list.length > 0 && $scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0) {
            response.data.patch_list.forEach((_resPatch) => {
              _resPatch.current_count = _resPatch.count;
              _resPatch.count = 0;
              if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length > 0)
                $scope.item_patch.patch_list.forEach((_itemPatch) => {
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
    });
  };

  $scope.viewPatchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    site.showModal('#patchesListViewModal');
  };

  $scope.selectAll = function (item_patch) {
    item_patch.patch_list.forEach((element) => {
      if (item_patch.$select_all) {
        element.select = true;
      } else if (!item_patch.$select_all) {
        element.select = false;
      }
    });
  };

  $scope.exitPatchReturnModal = function (itm) {
    let bigger = false;
    let count = 0;

    itm.patch_list.forEach((_pl) => {
      if (itm.work_serial) {
        if (_pl.select) _pl.count = 1;
        else _pl.count = 0;
      }
      if (_pl.count > _pl.current_count) bigger = true;
      count += _pl.count;
    });

    if (itm.count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    }

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    }

    site.hideModal('#patchesListReturnModal');
    $scope.error = '';
  };

  $scope.exitPatchModal = function (itm) {
    let bigger = false;
    let count = 0;

    itm.patch_list.forEach((_pl) => {
      if (_pl.count > _pl.current_count) bigger = true;
      if (itm.work_serial) {
        if (_pl.select) _pl.count = 1;
        else _pl.count = 0;
      }
    });

    itm.patch_list.map((p) => (count += p.count));

    if (itm.count != count) {
      $scope.error = '##word.err_patch_count##';
      return;
    }

    if (bigger) {
      $scope.error = '##word.err_patch_current_count##';
      return;
    }

    site.hideModal('#patchesListModal');
    $scope.error = '';
  };

  $scope.handeStoreOut = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_out/handel_store_out',
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
    );
  };

  $scope.showReturnedStoreOut = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $scope.busy = true;
      $http({
        method: 'POST',
        url: '/api/stores_out/all',
        data: {
          search: $scope.storesOutSearch,
          where: {
            posting: true,
            'return_paid.net_value': { $gt: 0 },
          },
        },
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
      );
    }
  };

  $scope.selectReturnedStoreOut = function (i) {
    if ($scope.store_out && i.return_paid) {
      $scope.store_out.retured_number = i.code;
      $scope.store_out.delegate = i.delegate || {};
      $scope.store_out.total_discount = i.return_paid.total_discount;
      $scope.store_out.total_value_added = i.return_paid.total_value_added;
      $scope.store_out.total_tax = i.return_paid.total_tax;
      $scope.store_out.total_value = i.return_paid.total_value;
      $scope.store_out.net_value = i.return_paid.net_value;

      $scope.store_out.items = [];

      if (i.return_paid.items && i.return_paid.items.length > 0) {
        i.return_paid.items.forEach((_item) => {
          _item.r_count = _item.count;
          if (_item.patch_list && _item.patch_list.length > 0) {
            _item.patch_list.forEach((_p) => {
              _p.current_count = _p.count;
              _p.count = 0;
            });
          }
          if (_item.count > 0) {
            $scope.store_out.items.push(_item);
            $scope.calcSize(_item);
          }
        });
      }

      /*   if ($scope.store_out.currency) {
          $scope.amount_currency = site.toNumber($scope.store_out.net_value) / site.toNumber($scope.store_out.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
          $scope.store_out.paid_up = $scope.amount_currency;
  
        } */
      site.hideModal('#returnedViewModal');
    }
  };

  $scope.financialYear = function (date, callback) {
    if (site.feature('erp')) {
      $scope.busy = true;
      $scope.error = '';
      $http({
        method: 'POST',
        url: '/api/financial_years/is_allowed_date',
        data: {
          date: new Date(date),
        },
      }).then(function (response) {
        $scope.busy = false;
        is_allowed_date = response.data.doc;
        callback(is_allowed_date);
      });
    } else callback(true);
  };

  $scope.loadPaymentTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/payment_type/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.paymentTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shifts/get_open_shift',
      data: {
        where: {
          active: true,
        },
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
          from_date: 1,
          from_time: 1,
          to_date: 1,
          to_time: 1,
        },
      },
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
    );
  };

  $scope.getOfferActive = function (barcode, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_offer/offer_active',
      data: {
        where: { date: new Date($scope.store_out.date), barcode: barcode },
      },
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
    );
  };

  $scope.paymentsPayable = function (type) {
    $scope.error = '';
    $scope.account_invoices = $scope.account_invoices || {};
    $scope.account_invoices.payable_list = $scope.account_invoices.payable_list || [{}];
    if (type === 'view') {
      site.showModal('#addPaymentsModal');
    }
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;

    let screen = '';
    if (site.toNumber('##query.type##')) {
      if (site.toNumber('##query.type##') == 3) screen = 'sales_invoices_store';
      else if (site.toNumber('##query.type##') == 5) screen = 'damage_store';
      else if (site.toNumber('##query.type##') == 6) screen = 'return_sales_store';

      $http({
        method: 'POST',
        url: '/api/numbering/get_automatic',
        data: {
          screen: screen,
        },
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.disabledCode = response.data.isAuto;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.getNumberingAutoInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'sales_invoices',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCodeInvoice = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAutoCustomer = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'customers',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCodeCustomer = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadStoresOutTypes();
  $scope.loadStores();
  $scope.loadPaymentTypes();
  $scope.loadCategories();
  $scope.getNumberingAuto();
  $scope.getNumberingAutoInvoice();
  $scope.getNumberingAutoCustomer();
  $scope.getPaymentMethodList();
  $scope.getDefaultSettings();
  $scope.getGovList();
  $scope.loadTaxTypes();
  $scope.getGender();
  $scope.getCustomerGroupList();
  $scope.loadDelegates();
  $scope.loadDiscountTypes();
  $scope.loadCurrencies();
  $scope.getCustomersGetList();
  $scope.loadAll({ date: new Date() });
});
