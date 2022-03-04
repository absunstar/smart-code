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
  return angular.element(document.querySelector('[ng-controller="prices_offers"]')).scope();
}

app.controller('prices_offers', function ($scope, $http, $timeout, $interval) {
  $scope._search = {};
  $scope.thermal = {};
  $scope.invList = [];
  $scope.prices_offers = {
    discountes: [],
    taxes: [],
  };
  $scope.search = {};
  $scope.item = {
    sizes: [],
  };

  $scope.addTax = function () {
    $scope.error = '';
    $scope.prices_offers.taxes = $scope.prices_offers.taxes || [];
    $scope.prices_offers.taxes.push({
      name_ar: $scope.tax.name_ar,
      name_en: $scope.tax.name_en,
      value: $scope.tax.value,
    });
    $scope.tax = {};
    $scope.calc($scope.prices_offers);
  };

  $scope.deleteTax = function (_tx) {
    $scope.error = '';
    for (let i = 0; i < $scope.prices_offers.taxes.length; i++) {
      let tx = $scope.prices_offers.taxes[i];
      if (tx.name_ar == _tx.name_ar && tx.value == _tx.value) $scope.prices_offers.taxes.splice(i, 1);
    }
    $scope.calc($scope.prices_offers);
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.prices_offers.discountes = $scope.prices_offers.discountes || [];

      $scope.prices_offers.discountes.push({
        name_ar: $scope.discount.name_ar,
        name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });

      $scope.calc($scope.prices_offers);

      $scope.discount = {
        type: 'number',
      };
    }
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.error = '';
    for (let i = 0; i < $scope.prices_offers.discountes.length; i++) {
      let ds = $scope.prices_offers.discountes[i];
      if (ds.name_ar == _ds.name_ar && ds.value == _ds.value && ds.type == _ds.type) $scope.prices_offers.discountes.splice(i, 1);
    }
    $scope.calc($scope.prices_offers);
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
        calc_size.discount.current = site.toMoney(calc_size.discount.current);

        calc_size.b_price = calc_size.price - calc_size.discount.current;
        calc_size.b_price = site.toMoney(calc_size.b_price);

        calc_size.total_v_a = (calc_size.value_added * (calc_size.b_price * calc_size.count)) / 100;
        calc_size.total_v_a = site.toMoney(calc_size.total_v_a);

        calc_size.total = site.toMoney(calc_size.b_price) * calc_size.count + calc_size.total_v_a;

        calc_size.total = site.toMoney(calc_size.total);
      }
      $scope.calc($scope.prices_offers);
    }, 150);
  };

  $scope.calc = function (obj) {
    $scope.error = '';

    $timeout(() => {
      obj.total_value = 0;
      obj.net_value = obj.net_value || 0;

      if (!obj.invoice_id && obj.items && obj.items.length > 0) {
        obj.total_value_added = 0;
        obj.items.forEach((_itm) => {
          obj.total_value += site.toMoney(_itm.total);

          obj.total_value_added += _itm.total_v_a;
        });
        obj.total_value_added = site.toMoney(obj.total_value_added);
      }

      obj.total_tax = 0;
      obj.total_discount = 0;

      if (obj.taxes) obj.taxes.map((tx) => (obj.total_tax += (obj.total_value * site.toMoney(tx.value)) / 100));

      if (obj.discountes)
        obj.discountes.forEach((ds) => {
          if (ds.type == 'percent') obj.total_discount += (obj.total_value * site.toMoney(ds.value)) / 100;
          else obj.total_discount += site.toMoney(ds.value);
        });

      obj.total_discount = site.toMoney(obj.total_discount);
      obj.total_tax = site.toMoney(obj.total_tax);

      if (!obj.invoice_id) {
        obj.before_value_added = obj.total_value - obj.total_value_added;
        obj.before_value_added = site.toMoney(obj.before_value_added);

        obj.net_value = obj.total_value + obj.total_tax - obj.total_discount;
      }

      obj.total_value = site.toMoney(obj.total_value);
      obj.net_value = site.toMoney(obj.net_value);
      if (obj.invoices_list && obj.invoices_list.length === 1) {
        obj.invoices_list[0].paid_up = obj.net_value;
        obj.paid_up = obj.net_value;
      }

      if (obj.currency) {
        obj.amount_currency = obj.net_value / obj.currency.ex_rate;
        obj.amount_currency = site.toMoney(obj.amount_currency);
        if (obj.Paid_from_customer) {
          if (obj.Paid_from_customer <= obj.amount_currency) {
            obj.paid_up = obj.Paid_from_customer;
            obj.remain_from_customer = 0;
          } else {
            obj.paid_up = obj.amount_currency;
            obj.remain_from_customer = obj.Paid_from_customer - obj.amount_currency;
          }
          obj.remain_from_customer = site.toMoney(obj.remain_from_customer);
        } else {
          obj.paid_up = obj.amount_currency;
        }
      }
    }, 250);
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.prices_offers.items.splice($scope.prices_offers.items.indexOf(itm), 1);
    $scope.calcSize(itm);
  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);
  };

  $scope.newPricesOffers = function () {
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

        $scope.prices_offers = {
          image_url: '/images/prices_offers.png',
          shift: shift,
          items: [],
          invoice: false,
          discountes: [],
          taxes: [],
          date: new Date(),
          supply_date: new Date(),
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.customer) {
            $scope.prices_offers.customer = $scope.customersGetList.find((_customer) => {
              return _customer.id === $scope.defaultSettings.general_Settings.customer.id;
            });
          }
        }

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.prices_offers.store = $scope.storesList.find((_store) => {
              return _store.id === $scope.defaultSettings.inventory.store.id;
            });
        }

        site.showModal('#addPricesOffersModal');
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
          if ($scope.defaultSettings.printer_program.invoice_logo) {
            $scope.invoice_logo = document.location.origin + $scope.defaultSettings.printer_program.invoice_logo;
          }
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

  $scope.testPatches = function (pricesOffers, callback) {
    let obj = {
      patchCount: false,
      patch_list: [],
    };

    pricesOffers.items.forEach((_item) => {
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
    const v = site.validated('#addPricesOffersModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.prices_offers.date) > new Date()) {
      $scope.error = '##word.date_exceed##';
      return;
    }

    $scope.prices_offers.paid_up = undefined;
    $scope.prices_offers.safe = undefined;
    $scope.prices_offers.Paid_from_customer = undefined;
    $scope.prices_offers.payment_method = undefined;
    $scope.prices_offers.currency = undefined;

    let max_discount = false;
    let returned_count = false;
    let notExistCount = false;

    if ($scope.prices_offers.items && $scope.prices_offers.items.length > 0) {
      notExistCount = $scope.prices_offers.items.some((_iz) => _iz.count < 1);

      $scope.prices_offers.items.forEach((_itemSize) => {
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

    if (notExistCount) {
      $scope.error = '##word.err_exist_count##';
      return;
    }

    if ($scope.prices_offers.items.length > 0 && !$scope.busy) {
      $scope.prices_offers.items.forEach((_itemSize) => {
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

      $scope.testPatches($scope.prices_offers, (callback) => {
        if (callback.patchCount) {
          $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
          return;
        }

        $scope.financialYear($scope.prices_offers.date, (is_allowed_date) => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {
            $scope.busy = true;
            $http({
              method: 'POST',
              url: '/api/prices_offers/add',
              data: angular.copy($scope.prices_offers),
            }).then(
              function (response) {
                if (response.data.done) {
                  $scope.busy = false;
                  $scope.prices_offers = {};
                  $scope.loadAll({ date: new Date() });
                  site.hideModal('#addPricesOffersModal');
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
  };

  $scope.remove = function (prices_offers) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(prices_offers);
        $scope.prices_offers = {};
        site.showModal('#deletePricesOffersModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (prices_offers) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/prices_offers/view',
      data: {
        id: prices_offers.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.prices_offers = response.data.doc;

          if ($scope.prices_offers.currency) {
            site.strings['currency'] = {
              ar: ' ' + $scope.prices_offers.currency.name_ar + ' ',
              en: ' ' + $scope.prices_offers.currency.name_en + ' ',
            };
            site.strings['from100'] = {
              ar: ' ' + $scope.prices_offers.currency.minor_currency_ar + ' ',
              en: ' ' + $scope.prices_offers.currency.minor_currency_en + ' ',
            };
          } else if ($scope.currencySetting) {
            site.strings['currency'] = {
              ar: ' ' + $scope.currencySetting.name_ar + ' ',
              en: ' ' + $scope.currencySetting.name_en + ' ',
            };
            site.strings['from100'] = {
              ar: ' ' + $scope.currencySetting.minor_currency_ar + ' ',
              en: ' ' + $scope.currencySetting.minor_currency_en + ' ',
            };
          }
          $scope.prices_offers.net_txt = site.stringfiy($scope.prices_offers.net_value);
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.details = function (prices_offers) {
    $scope.error = '';
    $scope.view(prices_offers);
    $scope.prices_offers = {};
    site.showModal('#viewPricesOffersModal');
  };

  $scope.delete = function (prices_offers) {
    $scope.error = '';

    $scope.financialYear(prices_offers.date, (is_allowed_date) => {
      if (!is_allowed_date) {
        $scope.error = '##word.should_open_period##';
      } else {
        $scope.busy = true;
        $http({
          method: 'POST',
          url: '/api/prices_offers/delete',
          data: prices_offers,
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              site.hideModal('#deletePricesOffersModal');

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
  };

  $scope.detailsCustomer = function (callback) {
    $scope.error = '';
    $scope.busy = true;

    let customer = '';
    if ($scope.account_invoices && $scope.account_invoices.customer) {
      customer = $scope.account_invoices.customer;
    } else if ($scope.prices_offers && $scope.prices_offers.customer) {
      customer = $scope.prices_offers.customer;
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

  $scope.addToItems = function () {
    $scope.error = '';
    let foundSize = false;

    if ($scope.item.sizes && $scope.item.sizes.length > 0)
      $scope.item.sizes.forEach((_size) => {
        foundSize = $scope.prices_offers.items.some((_itemSize) => _itemSize.barcode === _size.barcode && _itemSize.unit.id === _size.unit.id);
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
          $scope.prices_offers.items.push(itmObj);
          $scope.calcSize($scope.prices_offers.items[$scope.prices_offers.items.length - 1]);
        }
      });
    $scope.item.sizes = [];
  };

  $scope.addToSizes = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    $scope.item.sizes.push({
      $new: true,
      customer: $scope.prices_offers.customer,
      store: $scope.prices_offers.store,
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
                      _size.store = $scope.prices_offers.store;
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
                      _size.total = _size.count * _size.price;

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
                                if (_store.store.id == $scope.prices_offers.store.id) {
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
              if (_store.store.id == $scope.prices_offers.store.id) {
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

  $scope.itemsPricesOffers = function () {
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
        _item.store = $scope.prices_offers.store;
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
          _item.total = _item.count * _item.price;
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
                  if (_store.store.id == $scope.prices_offers.store.id) {
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
                          if (_store.store && _store.store.id == $scope.prices_offers.store.id) {
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
                    _size.store = $scope.prices_offers.store;
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

                    foundSize = $scope.prices_offers.items.some((_itemSize) => _itemSize.barcode === _size.barcode && _itemSize.unit.id === _size.unit.id);
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
                    if (!foundSize && !foundHold) $scope.prices_offers.items.unshift(_size);
                    else if (foundSize) {
                      $scope.prices_offers.items.forEach((_item) => {
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

  $scope.edit = function (prices_offers) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(prices_offers);
        $scope.edit_price = false;
        $scope.prices_offers = {};
        site.showModal('#updatePricesOffersModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';

    if (new Date($scope.prices_offers.date) > new Date()) {
      $scope.error = '##word.date_exceed##';
      return;
    }

    let max_discount = false;
    let returned_count = false;
    let patchCount = false;

    if ($scope.prices_offers.items && $scope.prices_offers.items.length > 0) {
      notExistCount = $scope.prices_offers.items.some((_iz) => _iz.count < 1);

      $scope.prices_offers.items.forEach((_itemSize) => {
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

    if (notExistCount) {
      $scope.error = '##word.err_exist_count##';
      return;
    }

    if (patchCount) {
      $scope.error = `##word.err_patch_count##   ( ${patch_list.join('-')} )`;
      return;
    }

    $scope.prices_offers.items.forEach((_itemSize) => {
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

    $scope.testPatches($scope.prices_offers, (callback) => {
      if (callback.patchCount) {
        $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
        return;
      }

      $scope.financialYear($scope.prices_offers.date, (is_allowed_date) => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {
          $scope.busy = true;
          $http({
            method: 'POST',
            url: '/api/prices_offers/update',
            data: $scope.prices_offers,
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                site.hideModal('#updatePricesOffersModal');
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
      $scope.loadSafes(obj.payment_method, obj.currency, obj);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box) obj.safe = $scope.defaultSettings.accounting.safe_box;
      } else {
        if ($scope.defaultSettings.accounting.safe_bank) obj.safe = $scope.defaultSettings.accounting.safe_bank;
      }
    }
  };

  $scope.loadSafes = function (method, currency, obj, callback) {
    callback = callback || function () {};
    $scope.error = '';
    $scope.busy = true;
    if (!obj) {
      obj = {};
    }
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
            obj.$safesList = response.data.list;
          }
          callback($scope.safesList || []);
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
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
    site.hideModal('#PricesOffersSearchModal');
  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = [];

    if (!where || !Object.keys(where).length) {
      where = { limit: 100 };
    }

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/prices_offers/all',
      data: {
        where: where,
      },
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
    );
  };

  $scope.thermalPrint = function (obj) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;
    if ($scope.defaultSettings.printer_program.printer_path) {
      $('#thermalPrint').removeClass('hidden');
      $scope.thermal = { ...obj };

      $scope.localPrint = function () {
        let printerName = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();
        if ($scope.user.printer_path && $scope.user.printer_path.id) {
          printerName = $scope.user.printer_path.ip.name.trim();
        }
        $timeout(() => {
          site.print({
            selector: '#thermalPrint',
            ip: '127.0.0.1',
            port: '60080',
            pageSize: 'Letter',
            printer: printerName,
          });
        }, 500);
      };

      $scope.localPrint();
    } else {
      $scope.error = '##word.thermal_printer_must_select##';
    }
    $scope.busy = false;
    $timeout(() => {
      $('#thermalPrint').addClass('hidden');
    }, 8000);
  };

  $scope.print = function () {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;
    if ($scope.defaultSettings.printer_program.a4_printer) {
      $('#pricesOffersDetails').removeClass('hidden');

      if ($scope.prices_offers.items.length > 7) {
        $scope.invList = [];
        let inv_length = $scope.prices_offers.items.length / 7;
        inv_length = parseInt(inv_length);
        let ramain_items = $scope.prices_offers.items.length - inv_length * 7;

        if (ramain_items) {
          inv_length += 1;
        }

        for (let i_inv = 0; i_inv < inv_length; i_inv++) {
          let s_o = { ...$scope.prices_offers };

          s_o.items = [];
          $scope.prices_offers.items.forEach((itm, i) => {
            itm.$index = i + 1;
            if (i < (i_inv + 1) * 7 && !itm.$done_inv) {
              itm.$done_inv = true;
              s_o.items.push(itm);
            }
          });

          $scope.invList.push(s_o);
        }
      } else {
        $scope.prices_offers.items.forEach((_item, i) => {
          _item.$index = i + 1;
        });
        $scope.invList = [{ ...$scope.prices_offers }];
      }

      let printerName = $scope.defaultSettings.printer_program.a4_printer.ip.name.trim();
      if ($scope.user.a4_printer && $scope.user.a4_printer.id) {
        printerName = $scope.user.a4_printer.ip.name.trim();
      }
      $timeout(() => {
        site.print({
          selector: '#pricesOffersDetails',
          ip: '127.0.0.1',
          port: '60080',
          pageSize: 'A4',
          printer: printerName,
        });
      }, 500);

    } else {
      $scope.error = '##word.a4_printer_must_select##';
    }
    $scope.busy = false;
   /*  $timeout(() => {
      $('#pricesOffersDetails').addClass('hidden');
    }, 8000); */
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

  $scope.getUser = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/view',
      data: {
        id: '##user.id##',
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.user = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {}
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

  $scope.selectItems = function () {
    if (!$scope.prices_offers.store) {
      $scope.error = '##word.err_store_select##';
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
          store_id: $scope.prices_offers.store.id,
          unit_id: itm.unit.id,
          barcode: itm.barcode,
        },
      },
    }).then(function (response) {
      $scope.busy = false;
      if (response.data.done) {
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

  $scope.handePricesOffers = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/prices_offers/handel_prices_offers',
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
        where: { date: new Date($scope.prices_offers.date), barcode: barcode },
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'prices_offers',
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

  $scope.loadStores();
  $scope.loadCategories();
  $scope.getNumberingAuto();
  $scope.getNumberingAutoCustomer();
  $scope.getPaymentMethodList();
  $scope.getDefaultSettings();
  $scope.getGovList();
  $scope.loadTaxTypes();
  $scope.getGender();
  $scope.getUser();
  $scope.getCustomerGroupList();
  $scope.loadDelegates();
  $scope.loadDiscountTypes();
  $scope.loadCurrencies();
  $scope.getCustomersGetList();
  $scope.loadAll({ date: new Date() });
});
