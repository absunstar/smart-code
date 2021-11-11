app.controller('order_invoice', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.thermal = {};
  $scope.discount = { type: 'number' };
  $scope.tax = {};
  $scope.kitchensList = [];
  $scope.cancelOrderInvoice = function (order_invoice) {
    $scope.error = '';

    $scope.busy = true;

    if (order_invoice && order_invoice.status && order_invoice.status.id == 1) {
      if (order_invoice.table) {
        order_invoice.table.busy = false;
        $http({
          method: 'POST',
          url: '/api/tables/update',
          data: order_invoice.table,
        }).then(function (response) {
          if (response.data.done) {
            $scope.busy = false;
          } else $scope.error = response.data.error;
        });
      }

      $scope.deleteOrderInvoice(order_invoice);
      $scope.newOrderInvoice();
    }
  };

  $scope.bookingTable = function (tableId) {
    $scope.order_invoice.transaction_type = {
      id: 1,
      ar: 'طاولات',
      en: 'Tables',
    };

    $http({
      method: 'POST',
      url: '/api/tables/view',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
          active: 1,
          busy: 1,
          tables_group: 1,
          minimum: 1,
          maxmum: 1,
          image_url: 1,
        },

        where: {
          active: true,
        },
        id: tableId,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_invoice.table = response.data.doc;

          if ($scope.order_invoice.table.tables_group) {
            $http({
              method: 'POST',
              url: '/api/tables_group/view',
              data: {
                select: {
                  id: 1,
                  name_ar: 1,
                  name_en: 1,
                  code: 1,
                  active: 1,
                  busy: 1,
                  tables_group: 1,
                  minimum: 1,
                  maxmum: 1,
                  image_url: 1,
                },

                where: {
                  active: true,
                },
                id: $scope.order_invoice.table.tables_group.id,
              },
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  $scope.order_invoice.table_group = response.data.doc;
                  if ($scope.order_invoice.table) $scope.order_invoice.table.busy = true;

                  $http({
                    method: 'POST',
                    url: '/api/tables/update',
                    data: $scope.order_invoice.table,
                  });
                }
              },
              function (err) {
                $scope.busy = false;
                $scope.error = err;
              }
            );
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadStores = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.storesList = [];
    $http({
      method: 'POST',
      url: '/api/stores/all',
      data: { select: { id: 1, name_ar: 1, name_en: 1, type: 1, code: 1 } },
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

  $scope.newOrderInvoice = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.order_invoice = {
          shift: shift,
          items: [],
          discountes: [],
          taxes: [],
          date: new Date(),
          details: [],
          status: {
            id: 1,
            en: 'Opened',
            ar: 'مفتوحة',
          },
          total_discount: 0,
          total_tax: 0,
          total_value: 0,
          net_value: 0,
          total_value_added: 0,
          before_value_added: 0,
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store) {
            $scope.order_invoice.store = $scope.defaultSettings.inventory.store;
            /*  $scope.order_invoice.store = $scope.storesList.find((_store) => {
              return _store.id === $scope.defaultSettings.inventory.store.id;
            }); */
          }
        }
        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.order_type) {
            $scope.order_invoice.transaction_type = $scope.defaultSettings.general_Settings.order_type;

            if ($scope.defaultSettings.general_Settings.order_type.id == 2) {
              if ($scope.defaultSettings.general_Settings.delivery_employee) {
                $scope.order_invoice.delivery_employee = $scope.deliveryEmployeesList.find((_deliveryEmployees) => {
                  return _deliveryEmployees.id === $scope.defaultSettings.general_Settings.delivery_employee.id;
                });
              }
            } else if ($scope.defaultSettings.general_Settings.order_type.id == 1) {
              if ($scope.defaultSettings.general_Settings.service) {
                $scope.order_invoice.service = $scope.defaultSettings.general_Settings.service;
              }
            }
          }

          if ($scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.id) {
            $scope.getCustomersGet($scope.defaultSettings.general_Settings.customer);
            if ($scope.defaultSettings.general_Settings.customer.gov)
              $scope.order_invoice.gov = $scope.govList.find((_gov) => {
                return _gov.id === $scope.defaultSettings.general_Settings.customer.gov.id;
              });

            if ($scope.defaultSettings.general_Settings.customer.city) $scope.getCityList($scope.defaultSettings.general_Settings.customer.gov);

            if ($scope.defaultSettings.general_Settings.customer.area) {
              $scope.getAreaList($scope.defaultSettings.general_Settings.customer.city);
            }

            if ($scope.defaultSettings.general_Settings.customer.address) $scope.order_invoice.address = $scope.defaultSettings.general_Settings.customer.address;

            if ($scope.defaultSettings.general_Settings.customer.phone) $scope.order_invoice.customer_phone = $scope.defaultSettings.general_Settings.customer.phone;

            if ($scope.defaultSettings.general_Settings.customer.mobile) $scope.order_invoice.customer_mobile = $scope.defaultSettings.general_Settings.customer.mobile;
          }
        }
        document.querySelector('#searchBarcode input').focus();
      } else {
        $scope.error = '##word.open_shift_not_found##';
      }
    });
  };

  $scope.addOrderInvoice = function (type) {
    $scope.error = '';
    if ($scope.order_invoice.shift) {
      if (($scope.order_invoice.items && $scope.order_invoice.items.length > 0) || type === 'table') {
        const v = site.validated('#OrderInvoiceAddModal');
        if (!v.ok) {
          $scope.error = v.messages[0].ar;
          $scope.order_invoice.posting = false;

          $scope.order_invoice.status = {
            id: 1,
            en: 'Opened',
            ar: 'مفتوحة',
          };
          return;
        }
        if (!$scope.order_invoice.transaction_type || ($scope.order_invoice.transaction_type && !$scope.order_invoice.transaction_type.id)) {
          $scope.error = '##word.err_transaction_type##';
          $scope.order_invoice.posting = false;

          $scope.order_invoice.status = {
            id: 1,
            en: 'Opened',
            ar: 'مفتوحة',
          };
          return;
        }
        if (!$scope.order_invoice.customer && $scope.order_invoice.transaction_type == 2) {
          $scope.error = '##word.err_customer##';
          $scope.order_invoice.posting = false;

          $scope.order_invoice.status = {
            id: 1,
            en: 'Opened',
            ar: 'مفتوحة',
          };
          return;
        }
        if (!$scope.order_invoice.table && $scope.order_invoice.transaction_type == 1) {
          $scope.error = '##word.err_table##';
          $scope.order_invoice.posting = false;

          $scope.order_invoice.status = {
            id: 1,
            en: 'Opened',
            ar: 'مفتوحة',
          };
          return;
        }

        if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
          let max_discount = false;

          $scope.order_invoice.items.forEach((_itemSize) => {
            if (_itemSize.discount.value > _itemSize.discount.max) max_discount = true;
          });

          if (max_discount) {
            $scope.error = '##word.err_maximum_discount##';
            $scope.order_invoice.posting = false;

            $scope.order_invoice.status = {
              id: 1,
              en: 'Opened',
              ar: 'مفتوحة',
            };
            return;
          }
        }

        if (new Date($scope.order_invoice.date) > new Date()) {
          $scope.error = '##word.date_exceed##';
          $scope.order_invoice.posting = false;

          $scope.order_invoice.status = {
            id: 1,
            en: 'Opened',
            ar: 'مفتوحة',
          };
          return;
        }

        if ($scope.order_invoice.status.id == 2 && $scope.order_invoice.paid_up > $scope.order_invoice.amount_currency) {
          $scope.error = '##word.err_net_value##';
          return;
        }

        if ($scope.order_invoice.transaction_type.id != 2 && $scope.order_invoice.delivery_employee) $scope.order_invoice.delivery_employee = {};

        if ($scope.order_invoice.transaction_type.id != 1 && $scope.order_invoice.table) $scope.order_invoice.table = {};

        if ($scope.order_invoice.transaction_type.id != 1 && $scope.order_invoice.service) $scope.order_invoice.service = 0;

        if ($scope.order_invoice.transaction_type.id != 2 && $scope.order_invoice.price_delivery_service) $scope.order_invoice.price_delivery_service = 0;

        let url = '/api/order_invoice/update';
        if ($scope.order_invoice.id) url = '/api/order_invoice/update';
        else {
          url = '/api/order_invoice/add';

          if (site.feature('restaurant') && '##user.type##' == 'table') {
            $scope.bookingTable('##user.ref_info.id##');
          }
        }

        if (type === 'hold') {
          $scope.order_invoice.hold = true;
        } else {
          $scope.order_invoice.hold = false;
        }

        $timeout(() => {
          $scope.busy = true;
          $http({
            method: 'POST',
            url: url,
            data: $scope.order_invoice,
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                if (site.feature('restaurant')) {
                  $scope.kitchenPrint({ ...response.data.doc });
                  $scope.order_invoice.$show_table = true;
                }

                $scope.order_invoice = response.data.doc;

                if ($scope.order_invoice.status.id == 2) {
                  let store_out = {
                    image_url: '/images/store_out.png',
                    supply_date: new Date(),
                    date: $scope.order_invoice.date,
                    posting: $scope.order_invoice.posting,
                    order_id: $scope.order_invoice.id,
                    customer: $scope.order_invoice.customer,
                    shift: $scope.order_invoice.shift,
                    store: $scope.order_invoice.store,
                    order_code: $scope.order_invoice.code,
                    items: $scope.order_invoice.items,
                    currency: $scope.order_invoice.currency,
                    safe: $scope.order_invoice.safe,
                    paid_up: $scope.order_invoice.paid_up,
                    Paid_from_customer: $scope.order_invoice.Paid_from_customer,
                    remain_from_customer: $scope.order_invoice.remain_from_customer,
                    payment_method: $scope.order_invoice.payment_method,
                    before_value_added: $scope.order_invoice.before_value_added,
                    total_value_added: $scope.order_invoice.total_value_added,
                    total_discount: $scope.order_invoice.total_discount,
                    total_tax: $scope.order_invoice.total_tax,
                    total_value: $scope.order_invoice.total_value,
                    net_value: $scope.order_invoice.net_value,
                    type: {
                      id: 4,
                      en: 'Orders Screen',
                      ar: 'شاشة الطلبات',
                    },
                    active: true,
                  };

                  $scope.addStoresOut(store_out);
                }
              } else {
                $scope.error = response.data.error;
                if (response.data.error.like('*Must Enter Code*')) {
                  $scope.error = '##word.must_enter_code##';
                  $scope.order_invoice.posting = false;

                  $scope.order_invoice.status = {
                    id: 1,
                    en: 'Opened',
                    ar: 'مفتوحة',
                  };
                }
              }

              $scope.order_invoice = response.data.doc;
              if (type === 'table') {
                $scope.order_invoice.$show_table = true;
              }
              if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto && $scope.order_invoice.status.id == 2 && !$scope.order_invoice.invoice) {
                let account_invoices = {
                  image_url: '/images/account_invoices.png',
                  date: $scope.order_invoice.date,
                  invoice_id: $scope.order_invoice.id,
                  customer: $scope.order_invoice.customer,
                  shift: $scope.order_invoice.shift,
                  order_invoices_type: $scope.order_invoice.transaction_type,
                  total_value: $scope.order_invoice.total_value,
                  net_value: $scope.order_invoice.net_value,
                  total_value_added: $scope.order_invoice.total_value_added,
                  before_value_added: $scope.order_invoice.before_value_added,
                  currency: $scope.order_invoice.currency,
                  safe: $scope.order_invoice.safe,
                  paid_up: $scope.order_invoice.paid_up,
                  Paid_from_customer: $scope.order_invoice.Paid_from_customer,
                  payment_method: $scope.order_invoice.payment_method,
                  invoice_code: $scope.order_invoice.code,
                  total_discount: $scope.order_invoice.total_discount,
                  total_tax: $scope.order_invoice.total_tax,
                  items: $scope.order_invoice.under_paid.items,
                  source_type: {
                    id: 3,
                    en: 'Orders Screen',
                    ar: 'شاشة الطلبات',
                  },
                  invoice_type: {
                    id: 4,
                    en: 'Orders Screen Store',
                    ar: 'شاشة الطلبات',
                  },
                  active: true,
                };
                $scope.addAccountInvoice(account_invoices);
                site.hideModal('#accountInvoiceModal');
              }
              $scope.newOrderInvoice();
              document.querySelector('#searchBarcode input').focus();
            },
            function (err) {
              console.log(err);
            }
          );
        }, 500);
      } else $scope.error = '##word.err_items##';
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.addStoresOut = function (store_out) {
    if (store_out.items && store_out.items.length > 0) {
      $scope.busy = true;
      $http({
        method: 'POST',
        url: '/api/stores_out/add',
        data: store_out,
      }).then(
        function (response) {
          if (response.data.done) {
            $scope.busy = false;
            $scope.thermalPrint(response.data.doc);
          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          $scope.error = err.message;
        }
      );
    } else {
      $scope.error = '##word.must_enter_quantity##';
      return;
    }
  };

  $scope.addAccountInvoice = function (account_invoices) {
    $scope.error = '';
/*     if ($scope.busy) {
      return;
    }
    $scope.busy = true; */
    
    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting) account_invoices.posting = false;
    else account_invoices.posting = true;
    
    account_invoices.invoice = true;

    $http({
      method: 'POST',
      url: '/api/account_invoices/add',
      data: account_invoices,
    }).then(
      function (response) {
        /* $scope.busy = false; */
        if (response.data.done) {
          let acc_invo = response.data.doc;
          if (account_invoices.source_type.id == 3 && account_invoices.paid_up > 0) {

            acc_invo.in_type = {
              id: 2,
              en: 'Orders Screen',
              ar: 'شاشة الطلبات',
            };
            acc_invo.source_type = {
              id: 8,
              en: 'Amount In',
              ar: 'سند قبض',
            };
            acc_invo.ref_invoice_id = response.data.doc.id;
            $scope.addAccountInvoice(acc_invo);
          }
        } else {
          $scope.error = response.data.error;
          /* if (response.data.error.like("*duplicate key error*")) {
            $scope.error = "##word.code_exisit##";
          } else */
          if (response.data.error.like('*Please write code*')) {
            $scope.error = '##word.enter_code_inventory##';
          } else if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = '##word.must_enter_code##';
          }
        }
      },
      function (err) {
        console.log(err);
      }
    );
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
                          if ($scope.order_invoice.store && _store.store && _store.store.id == $scope.order_invoice.store.id) {
                            if (_store.hold) foundHold = true;
                          }
                        });
                    });

                  if (_size.barcode === $scope.search_barcode || _size.size_units_list[indxUnit].barcode === $scope.search_barcode) {
                    _size.name_ar = response.data.list[0].name_ar;
                    _size.name_en = response.data.list[0].name_en;
                    _size.item_group = response.data.list[0].item_group;
                    _size.store = $scope.order_invoice.store;
                    _size.count = 1;
                    _size.value_added = _size.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;
                    _size.unit = _size.size_units_list[indxUnit];
                    _size.discount = _size.size_units_list[indxUnit].discount;
                    _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                    _size.cost = _size.size_units_list[indxUnit].cost;
                    _size.price = _size.size_units_list[indxUnit].price;
                    _size.total = _size.count * _size.cost;

                    if (!foundHold) $scope.order_invoice.items.unshift(_size);
                  }
                  $scope.calcSize(_size);
                });
              if (foundSize) $scope.error = '##word.dublicate_item##';

              $scope.search_barcode = '';
            }
            document.querySelector('#searchBarcode input').focus();
            /*    $timeout(() => {
              document.querySelector("#search_barcode input").focus();
              console.log("aaaaaaaaaaaaaaaa");
            }, 200); */
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

  $scope.displayUpdateOrderInvoice = function (order_invoice) {
    $scope.error = '';
    $scope.viewOrderInvoice(order_invoice);
    $scope.order_invoice = {};
    site.showModal('#OrderInvoiceUpdateModal');
  };

  $scope.updateOrderInvoice = function (order_invoice, type) {
    $scope.error = '';
    const v = site.validated('#OrderInvoiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if (type == 'unhold') {
      order_invoice.hold = false;
    }
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/order_invoice/update',
      data: order_invoice || $scope.order_invoice,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.doc.status.id == 1) {
            $scope.order_invoice = response.data.doc;
          }
        } else {
          $scope.error = response.data.errro;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.displayAccountInvoice = function (order_invoice) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        if ($scope.defaultSettings.accounting) {
          $scope.order_invoice.currency = $scope.currencySetting;
          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.order_invoice.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.order_invoice.payment_method, $scope.order_invoice.currency);
            if ($scope.order_invoice.payment_method.id == 1) $scope.order_invoice.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.order_invoice.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }

        if ($scope.order_invoice.currency) {
          $scope.order_invoice.amount_currency = $scope.order_invoice.net_value / $scope.order_invoice.currency.ex_rate;
          $scope.order_invoice.amount_currency = site.toNumber($scope.order_invoice.amount_currency);
          $scope.order_invoice.paid_up = $scope.order_invoice.Paid_from_customer = $scope.order_invoice.amount_currency;
        }
        $scope.calc($scope.order_invoice);

        site.showModal('#accountInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.displayDetailsOrderInvoice = function (order_invoice) {
    $scope.error = '';
    $scope.viewOrderInvoice(order_invoice);
    $scope.order_invoice = {};
    site.showModal('#OrderInvoiceViewModal');
  };

  $scope.viewOrderInvoice = function (order_invoice) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/order_invoice/view',
      data: {
        id: order_invoice.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.order_invoice = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.deleteOrderInvoice = function (order) {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: 'POST',
      url: '/api/order_invoice/delete',
      data: order,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getOrderInvoiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: 'POST',
      url: '/api/order_invoice/all',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#OrderInvoiceSearchModal');
          $scope.search = {};
          document.querySelector('#searchBarcode input').focus();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDefaultSettingsList = function () {
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
          $scope.newOrderInvoice();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadItemsGroups = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.itemsGroupList = [];

    $http({
      method: 'POST',
      url: '/api/items_group/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          image_url: 1,
          color: 1,
          code: 1,
        },
        where: {
          is_pos: true,
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsGroupList = response.data.list;
          $scope.itemsGroupList.unshift({
            id: 0,
            name_ar: 'الأكثر مبيعا',
            name_en: 'Best seller',
            color: '#F0F8FF',
            type: 'all',
          });
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadXtrasItems = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.extrasItemsList = [];

    $http({
      method: 'POST',
      url: '/api/extras_items/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          price: 1,
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
          $scope.extrasItemsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadCurrencies = function () {
    $scope.error = '';
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
    if ($scope.defaultSettings.accounting) {
      $scope.loadSafes(obj.payment_method, obj.currency);
      if (obj.payment_method.id == 1) {
        if ($scope.defaultSettings.accounting.safe_box) obj.safe = $scope.defaultSettings.accounting.safe_box;
      } else {
        if ($scope.defaultSettings.accounting.safe_bank) obj.safe = $scope.defaultSettings.accounting.safe_bank;
      }
    }
  };

  $scope.loadSafes = function (method, currency) {
    $scope.error = '';
    $scope.busy = true;

    if (currency && currency.id && method && method.id) {
      let where = { 'currency.id': currency.id };

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
          if (response.data.done) $scope.safesList = response.data.list;
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.getPrintersPath = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/printers_path/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          type: 1,
          ip_device: 1,
          Port_device: 1,
          ip: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.printersPathList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.loadKitchenList = function () {
    $scope.error = '';
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/kitchen/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          printer_path: 1,
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.kitchensList = response.data.list;
        }
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
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.tax_types = response.data.list;
        }
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
          code: 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.displayAddCustomer = function () {
    $scope.error = '';
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
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
          $scope.count = $scope.list.length;
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

  $scope.getCustomersGet = function (customer) {
    $scope.error = '';
    $scope.busy = true;
    $scope.customerGet = {};
    $http({
      method: 'POST',
      url: '/api/customers/view',
      data: { id: customer.id },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customerGet = response.data.doc;
          $scope.order_invoice.customer = response.data.doc;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getCustomerGroupList = function () {
    $scope.error = '';
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

  $scope.get_open_shift = function (callback) {
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
        $scope.cityList = response.data.list;
        if (response.data.done && response.data.list.length > 0 && $scope.order_invoice.customer && $scope.order_invoice.customer.city) {
          $scope.order_invoice.city = $scope.cityList.find((_city) => {
            return _city.id === $scope.order_invoice.customer.city.id;
          });
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
          if ($scope.defaultSettings.general_Settings.customer) {
            $scope.order_invoice.area = $scope.areaList.find((_area) => {
              return _area.id === $scope.defaultSettings.general_Settings.customer.area.id;
            });

            if ($scope.order_invoice.area.price_delivery_service) {
              $scope.order_invoice.price_delivery_service = $scope.order_invoice.area.price_delivery_service || 0;
            }
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAreaListToDelivery = function () {
    $scope.busy = true;
    $scope.areaListDelivery = [];
    $http({
      method: 'POST',
      url: '/api/area/all',
      data: {
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaListDelivery = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getDeliveryEmployeesList = function () {
    $scope.error = '';
    $scope.deliveryEmployeesList = [];
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/delivery_employees/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.deliveryEmployeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getTablesGroupList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.tablesGroupList = [];
    $http({
      method: 'POST',
      url: '/api/tables_group/all',
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
        if (response.data.done && response.data.list.length > 0) {
          response.data.list.forEach((tablesGroup) => {
            tablesGroup.tables_list = [];
            $scope.tablesList.forEach((tables) => {
              if (tablesGroup.id === tables.tables_group.id) tablesGroup.tables_list.unshift(tables);
            });
          });
          $scope.tablesGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getTablesList = function (callback) {
    callback = callback || function () {};

    $scope.busy = true;
    $scope.tablesList = [];
    $http({
      method: 'POST',
      url: '/api/tables/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1,
          active: 1,
          busy: 1,
          tables_group: 1,
          minimum: 1,
          maxmum: 1,
          image_url: 1,
        },
        where: {
          active: true,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) $scope.tablesList = response.data.list;
        callback();
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getOrderInvoicesActiveList = function (callback) {
    callback = callback || function () {};
    $scope.busy = true;
    $scope.invoicesActivelist = [];
    $http({
      method: 'POST',
      url: '/api/order_invoice/active_all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) $scope.invoicesActivelist = response.data.list;
        callback();
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.viewInvoicesTablesList = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.getOrderInvoicesActiveList(() => {
          $scope.invoicesTablelist = [];
          $scope.invoicesActivelist.forEach((_invoiceActive) => {
            if (_invoiceActive.transaction_type && _invoiceActive.transaction_type.id == 1 && _invoiceActive.id != $scope.order_invoice.id) {
              $scope.invoicesTablelist.unshift(_invoiceActive);
            }
          });

          if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
            $scope.error = '##word.err_waiting_list_empty##';
            return;
          }
          site.showModal('#mergeTablesModal');
        });
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.viewInvoicesActiveList = function () {
    $scope.error = '';

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.getOrderInvoicesActiveList(() => {
          if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
            $scope.error = '##word.err_waiting_list_empty##';
            return;
          }
          site.showModal('#orderInvoicesActiveAddModal');
        });
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.mergeTables = function (order) {
    $scope.error = '';
    $scope.order_invoice.items = $scope.order_invoice.items || [];
    let exist = false;

    order.items.forEach((item) => {
      $scope.order_invoice.items.forEach((el) => {
        if (item.size_ar == el.size_ar && item.barcode == el.barcode) {
          exist = true;

          el.count = el.count + item.count;

          el.total += el.price;
        }
      });
      if (!exist) {
        $scope.order_invoice.items.unshift(item);
      }
    });
    $scope.calc($scope.order_invoice);
    $scope.deleteOrderInvoice(order);
    site.hideModal('#mergeTablesModal');
  };

  $scope.returnWaitingOrder = function (item) {
    $scope.order_invoice = item;
    site.hideModal('#orderInvoicesActiveAddModal');
  };

  $scope.getTransactionTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.transactionTypeList = [];
    $http({
      method: 'POST',
      url: '/api/order_invoice/transaction_type/all',
    }).then(
      function (response) {
        $scope.busy = false;
        if (site.feature('pos') || site.feature('eco') || site.feature('erp')) $scope.transactionTypeList = response.data.filter((i) => i.id == 2 || i.id == 3);
        else $scope.transactionTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.closeOrder = function () {
    $scope.error = '';

    $scope.getStockItems($scope.order_invoice.items, $scope.order_invoice.store, (callback) => {
      if (!callback) {
        $scope.order_invoice.shift = $scope.order_invoice.shift || $scope.shift;
        if (!$scope.order_invoice || !$scope.order_invoice.shift) {
          return;
        }

        if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting) $scope.order_invoice.posting = true;

        $scope.order_invoice.status = {
          id: 2,
          en: 'Closed Of Orders Screen',
          ar: 'مغلق من شاشة الأوردرات',
        };

        $scope.order_invoice.under_paid = {
          items: $scope.order_invoice.items,
          total_tax: $scope.order_invoice.total_tax,
          total_discount: $scope.order_invoice.total_discount,
          price_delivery_service: $scope.order_invoice.price_delivery_service,
          service: $scope.order_invoice.service,
          net_value: $scope.order_invoice.net_value,
        };
        $scope.displayAccountInvoice();
        /* $scope.addOrderInvoice($scope.order_invoice, 'add'); */
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    });
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

  $scope.loadItems = function (group, e) {
    $scope.error = '';
    document.querySelectorAll('a').forEach((a) => {
      a.classList.remove('item-click');
    });

    e.target.parentNode.classList.add('item-click');

    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.busy = true;
        $scope.itemsList = [];
        $http({
          method: 'POST',
          url: '/api/stores_items/all',
          data: {
            where: {
              /*               "item_group.id": group.id,
               */ is_pos: true,
            },
            group: group,
          },
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              $scope.itemsList = response.data.list;
              /*    $scope.itemsList.forEach(element => {
   
                   console.log(element.add_sizes);
                 });
                 $scope.items = []; */
            }
          },
          function (err) {
            $scope.busy = false;
            $scope.error = err;
          }
        );
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.showItemsIn = function (i) {
    $scope.items = i;
    if ($scope.items.sizes && $scope.items.sizes.length > 0) {
      $scope.items.sizes.forEach((_size) => {
        _size.main_unit = $scope.items.main_unit;
        _size.item_group = $scope.items.item_group;
        _size.size_units_list.forEach((_unit) => {
          if (_unit.id === _size.main_unit.id) {
            _size.price = _unit.price;
          }
        });
        _size.item_id = $scope.items.id;
        _size.name_ar = $scope.items.name_ar;
        _size.name_en = $scope.items.name_en;
        _size.add_sizes = $scope.items.add_sizes;
      });
    }
    if ($scope.items.sizes.length === 1) {
      $scope.bookList($scope.items.sizes[0]);
    } else {
      site.showModal('#sizesModal');
    }
  };

  $scope.bookList = function (item) {
    $scope.error = '';
    $scope.order_invoice.items = $scope.order_invoice.items || [];
    let exist = false;
    let foundHold = false;
    let kitchenBranch = {};
    if (item.branches_list && item.branches_list.length > 0) {
      item.branches_list.forEach((_branch) => {
        if (_branch.code == '##session.branch.code##') {
          if (_branch.kitchen && _branch.kitchen.id) {
            kitchenBranch = $scope.kitchensList.find((_kitchen) => {
              return _kitchen.id === _branch.kitchen.id;
            });
          } else {
            if ($scope.defaultSettings.general_Settings.kitchen)
              kitchenBranch = $scope.kitchensList.find((_kitchen) => {
                return _kitchen.id === $scope.defaultSettings.general_Settings.kitchen.id;
              });
          }
          _branch.stores_list = _branch.stores_list || [];
          _branch.stores_list.forEach((_store) => {
            if (_store.store && $scope.order_invoice.store && _store.store.id == $scope.order_invoice.store.id) {
              item.store_count = _store.current_count;
              item.store_units_list = _store.size_units_list;
              if (_store.hold) foundHold = true;
            }
          });
        }
      });
    } else {
      if ($scope.defaultSettings.general_Settings.kitchen)
        kitchenBranch = $scope.kitchensList.find((_kitchen) => {
          return _kitchen.id === $scope.defaultSettings.general_Settings.kitchen.id;
        });
    }

    if (site.feature('pos') || site.feature('eco') || site.feature('erp')) {
      $scope.order_invoice.items.forEach((el) => {
        if (item.size == el.size && item.barcode == el.barcode && !el.printed) {
          exist = true;
          el.count += 1;
          $scope.calcSize(el);
        }
      });
    }

    let indxUnit = item.size_units_list.findIndex((_unit) => _unit.id == item.main_unit.id);
    item.value_added = item.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;

    if (!exist && !foundHold) {
      let obj = {
        item_id: item.item_id,
        kitchen: kitchenBranch,
        name_ar: item.name_ar,
        name_en: item.name_en,
        store: item.store,
        value_added: item.value_added,
        barcode: item.barcode,
        size_ar: item.size_ar,
        size_en: item.size_en,
        item_group: item.item_group,
        add_sizes: item.add_sizes,
        size_units_list: item.size_units_list,
        unit: item.size_units_list[indxUnit],
        total: item.size_units_list[indxUnit].price - item.discount.value,
        vendor: item.vendor,
        price: item.size_units_list[indxUnit].price,
        discount: item.size_units_list[indxUnit].discount,
        extras_price: 0,
        count: 1,
      };
      $scope.order_invoice.items.unshift(obj);
      $scope.calcSize($scope.order_invoice.items[0]);
    }
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

  $scope.getOfferActive = function (barcode, callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_offer/offer_active',
      data: {
        where: { date: new Date($scope.order_invoice.date), barcode: barcode },
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

  $scope.showEditItem = function (item) {
    $scope.error = '';
    $scope.size_edit = item;
    site.showModal('#editItemModal');
  };

  $scope.addExtrasItems = function (item) {
    $scope.error = '';
    if ($scope.extras_items && $scope.extras_items.id) {
      item.extras_item = item.extras_item || [];

      item.extras_item.unshift($scope.extras_items);
      $scope.extras_items = {};
      $scope.calcSize(item);
    }
  };

  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    $scope.order_invoice.items.splice($scope.order_invoice.items.indexOf(item), 1);
    /*   if (item.count == 1) {
  
      } else if (item.count > 1) {
        item.count -= 1;
        item.total -= item.price;
        return item
      }; */

    $scope.calc($scope.order_invoice);
  };

  $scope.addTax = function () {
    $scope.error = '';
    if (!$scope.tax.value) {
      $scope.error = '##word.error_tax##';
      return;
    } else {
      $scope.order_invoice.taxes = $scope.order_invoice.taxes || [];
      if ($scope.tax.value) {
        $scope.order_invoice.taxes.unshift({
          name_ar: $scope.tax.name_ar,
          name_en: $scope.tax.name_en,
          value: $scope.tax.value,
        });
      }
      $scope.tax = {};
    }
  };

  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.order_invoice.taxes.length; i++) {
      let tx = $scope.order_invoice.taxes[i];
      if (tx.value == _tx.value) {
        $scope.order_invoice.taxes.splice(i, 1);
      }
    }
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {
      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.order_invoice.discountes = $scope.order_invoice.discountes || [];
      $scope.order_invoice.discountes.unshift({
        name_ar: $scope.discount.name_ar,
        name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });
    }
  };

  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.order_invoice.discountes.length; i++) {
      let ds = $scope.order_invoice.discountes[i];
      if (ds.value == _ds.value && ds.type == _ds.type) {
        $scope.order_invoice.discountes.splice(i, 1);
      }
    }
  };

  $scope.calcSize = function (_size) {
    $scope.error = '';
    $timeout(() => {
      if (!_size.count) _size.count = 0;
      if (!_size.price) _size.price = 0;

      if (_size.discount.type == 'number') {
        _size.discount.current = _size.discount.value;
      } else if (_size.discount.type == 'percent') {
        _size.discount.current = (_size.discount.value * _size.price) / 100;
      }

      _size.discount.current = site.toNumber(_size.discount.current);

      _size.b_price = _size.price - _size.discount.current;
      _size.b_price = site.toNumber(_size.b_price);
      _size.extras_price = 0;
      if (_size.extras_item && _size.extras_item.length > 0) {
        _size.extras_item.forEach((_exItm) => {
          _size.extras_price += _exItm.price;
        });
      }

      _size.total_v_a = (_size.value_added * (_size.b_price * _size.count)) / 100;
      _size.total_v_a = site.toNumber(_size.total_v_a);

      _size.total = _size.b_price * _size.count + _size.extras_price * _size.count + _size.total_v_a;

      _size.total = site.toNumber(_size.total);

      $scope.calc($scope.order_invoice);
    }, 150);
  };

  $scope.calc = function (obj) {
    $timeout(() => {
      obj.total_value = 0;
      obj.total_tax = 0;
      obj.total_discount = 0;
      obj.total_value_added = 0;

      if (obj.items && obj.items.length > 0) {
        obj.items.forEach((_itm) => {
          obj.total_value += site.toNumber(_itm.total);

          obj.total_value_added += _itm.total_v_a;
        });
      }
      obj.total_value_added = site.toNumber(obj.total_value_added);

      obj.before_value_added = obj.total_value - obj.total_value_added;
      obj.before_value_added = site.toNumber(obj.before_value_added);

      if (obj.taxes && obj.taxes.length > 0) {
        obj.taxes.forEach((tx) => {
          obj.total_tax += (obj.total_value * site.toNumber(tx.value)) / 100;
        });
      }

      if (obj.discountes && obj.discountes.length > 0) {
        obj.discountes.forEach((ds) => {
          if (ds.type === 'percent') obj.total_discount += (site.toNumber(obj.total_value) * site.toNumber(ds.value)) / 100;
          else obj.total_discount += site.toNumber(ds.value);
        });
      }

      if (obj.transaction_type && obj.transaction_type.id == 2) {
        obj.service = 0;
        obj.price_delivery_service = site.toNumber(obj.price_delivery_service) || 0;
      }

      if (obj.transaction_type && obj.transaction_type.id == 1) {
        obj.service = obj.service || 0;
        obj.price_delivery_service = 0;
      }

      if (obj.transaction_type && obj.transaction_type.id == 3) {
        obj.service = 0;
        obj.price_delivery_service = 0;
      }

      obj.net_value = site.toNumber(obj.total_value) + (obj.total_tax || 0) + (obj.price_delivery_service || 0) - (obj.total_discount || 0);
      let service = ((obj.service || 0) * site.toNumber(obj.net_value)) / 100;
      obj.net_value = obj.net_value + service;

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

      $scope.discount = {
        type: 'number',
      };
    }, 250);
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

  $scope.kitchenPrint = function (obj) {
    $scope.error = '';

    let name_lang = 'name_ar';
    if ('##session.lang##' === 'en') name_lang = 'name_en';

    $('#kitchenPrint').removeClass('hidden');

    $scope.kitchensList.forEach((_kitchen, i) => {
      $timeout(() => {
        $scope.kitchen_print = {
          date: obj.date,
          code: obj.code,
          kitchen: _kitchen,
          items: [],
        };
        _kitchen.has_items = false;
        $scope.kitchen_print.printer = $scope.printersPathList.find((_printer) => {
          return _printer.id === _kitchen.printer_path.id;
        });

        if (obj.items && obj.items.length > 0) {
          obj.items.forEach((item_book) => {
            if (item_book.kitchen && !item_book.printed) {
              if (item_book.kitchen.id == _kitchen.id) {
                let extras = '';
                if (item_book.extras_item && item_book.extras_item.length > 0) {
                  item_book.extras_item.forEach((_extra) => {
                    extras = extras + ' - ' + _extra[name_lang];
                  });
                }

                item_book.printed = true;
                _kitchen.has_items = true;
                $scope.kitchen_print.items.unshift({ ...item_book, extras });
              }
            }
          });
        }
        if (_kitchen.has_items) {
          site.printAsImage({
            selector: '#kitchenPrint',
            ip: '127.0.0.1',
            port: '60080',
            printer: $scope.kitchen_print.printer.ip.name.trim(),
          });
          if (i + 1 == $scope.kitchensList.length) {
            $scope.updateOrderInvoice(obj);
          }
        }
      }, 5000);
    });
  };

  $scope.paymentsPayable = function (type) {
    $scope.error = '';
    $scope.account_invoices = $scope.account_invoices || {};
    $scope.account_invoices.payable_list = $scope.account_invoices.payable_list || [{}];
    if (type === 'view') {
      site.showModal('#addPaymentsModal');
    }
  };

  $scope.changeCustomerAddresses = function (customer) {
    if ($scope.order_invoice.transaction_type.id == 2) {
      if (customer.gov) {
        $scope.order_invoice.gov = $scope.govList.find((_gov) => {
          return _gov.id === customer.gov.id;
        });
      }

      $scope.order_invoice.city = customer.city;
      $scope.order_invoice.address = customer.address;
      $scope.order_invoice.customer_phone = customer.phone;
      $scope.order_invoice.customer_mobile = customer.mobile;

      if (customer.area && customer.area.id) {
        let area = $scope.areaListDelivery.find((_area) => {
          return _area.id === customer.area.id;
        });
        $scope.order_invoice.area = area;

        $scope.order_invoice.price_delivery_service = area.price_delivery_service;
      } else $scope.order_invoice.price_delivery_service = 0;
    }
  };

  $scope.showTables = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.getTablesList(() => {
          $scope.getTablesGroupList();
          site.showModal('#showTablesModal');
        });
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.selectTable = function (table, group) {
    if (table.busy) {
      $scope.error = '##word.table_busy##';
      return;
    }
    $scope.error = '';
    if ($scope.order_invoice.table && $scope.order_invoice.table.id) {
      $scope.order_invoice.table.busy = false;
      $http({
        method: 'POST',
        url: '/api/tables/update',
        data: $scope.order_invoice.table,
      }).then(
        function (response) {
          $scope.order_invoice.table = { ...table };
          $scope.order_invoice.table.busy = true;
          $scope.order_invoice.$show_table = true;
          $http({
            method: 'POST',
            url: '/api/tables/update',
            data: $scope.order_invoice.table,
          }).then(
            function (response) {
              $scope.order_invoice.count_person = $scope.order_invoice.count_person || 1;
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          );
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    } else {
      $scope.order_invoice.table = { ...table };
      $scope.order_invoice.table.busy = true;
      $scope.order_invoice.$show_table = true;
      $http({
        method: 'POST',
        url: '/api/tables/update',
        data: $scope.order_invoice.table,
      }).then(
        function (response) {
          $scope.order_invoice.count_person = $scope.order_invoice.count_person || 1;
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
    $scope.order_invoice.table_group = group;
    site.hideModal('#showTablesModal');

    /*  $scope.addOrderInvoice($scope.order_invoice, 'table');  */
  };

  $scope.changeTransactionType = function (order) {
    $scope.error = '';

    if (order.transaction_type) {
      if (order.transaction_type.id === 1) {
        if ($scope.defaultSettings.general_Settings.service) {
          order.service = $scope.defaultSettings.general_Settings.service;
        } else {
          order.service = 0;
        }
        order.price_delivery_service = 0;
      } else if (order.transaction_type.id === 2) {
        order.service = 0;

        if ($scope.defaultSettings.general_Settings.delivery_employee) {
          order.delivery_employee = $scope.deliveryEmployeesList.find((_deliveryEmployees) => {
            return _deliveryEmployees.id === $scope.defaultSettings.general_Settings.delivery_employee.id;
          });
        }
        if (order.customer) {
          $scope.changeCustomerAddresses(order.customer);
        }
      } else {
        order.price_delivery_service = 0;
        order.service = 0;
      }
      order.count_person = 0;
    }
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#OrderInvoiceSearchModal');
  };

  $scope.searchAll = function () {
    $scope.error = '';

    $scope.getOrderInvoiceList($scope.search);
    site.hideModal('#OrderInvoiceSearchModal');
    $scope.search = {};
  };

  /*  $scope.selectCustomer = function (customer) {
     $scope.error = '';
 
     if ($scope.order_invoice.status.id == 2) {
       if (customer.area && customer.area.id) {
         let area = $scope.areaListDelivery.find(_area => { return _area.id === customer.area.id });
         $scope.order_invoice.price_delivery_service = area.price_delivery_service;
       }
 
 
     }
 
   };
  */

  $scope.showOrderDetails = function (obj, type) {
    $scope.error = '';
    if (type === 'customer') {
      obj.$show_customer = true;
      obj.$show_delivery = false;
      obj.$show_table = false;
      obj.$show_discountes = false;
      obj.$show_taxes = false;
    } else if (type === 'table') {
      obj.$show_discountes = false;
      obj.$show_delivery = false;
      obj.$show_taxes = false;
      obj.$show_table = true;
      obj.$show_customer = false;
    } else if (type === 'discountes') {
      obj.$show_discountes = true;
      obj.$show_delivery = false;
      obj.$show_taxes = false;
      obj.$show_table = false;
      obj.$show_customer = false;
    } else if (type === 'taxes') {
      obj.$show_taxes = true;
      obj.$show_delivery = false;
      obj.$show_discountes = false;
      obj.$show_table = false;
      obj.$show_customer = false;
    } else if (type === 'delivery') {
      obj.$show_delivery = true;
      obj.$show_taxes = false;
      obj.$show_discountes = false;
      obj.$show_table = false;
      obj.$show_customer = false;
    }

    site.showModal('#orderDetailsModal');
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'o_screen_store',
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

  $scope.getNumberingAutoInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'o_screen_invoices',
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

  $scope.getOrderInvoiceList();
  $scope.loadItemsGroups();
  $scope.loadXtrasItems();
  $scope.loadDiscountTypes();
  $scope.getTransactionTypeList();
  $scope.loadTaxTypes();
  $scope.getDeliveryEmployeesList();
  $scope.getGovList();
  $scope.getDefaultSettingsList();
  $scope.getPrintersPath();
  $scope.getPaymentMethodList();
  $scope.getCustomerGroupList();
  $scope.loadCurrencies();
  $scope.getNumberingAuto();
  $scope.getAreaListToDelivery();
  $scope.loadStores();
  $scope.getNumberingAutoInvoice();
  $scope.getNumberingAutoCustomer();
  if (site.feature('restaurant')) {
    $scope.loadKitchenList();
    $scope.getTablesList();
  }
});
