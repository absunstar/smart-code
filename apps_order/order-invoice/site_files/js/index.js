app.controller("order_invoice", function ($scope, $http, $timeout) {

  $scope._search = {};
  $scope.discount = {
    type: 'number'
  };
  $scope.tax = {};
  $scope.kitchensList = [];

  $scope.displayAddOrderInvoice = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.order_invoice = {
          shift: shift,
          image_url: '/images/order_invoice.png',
          active: true
        };
        site.showModal('#OrderInvoiceAddModal');
      }
    })
  };

  $scope.cancelOrderInvoice = function () {

    $scope.busy = true;

    if ($scope.order_invoice && $scope.order_invoice.status && $scope.order_invoice.status.id == 1) {

      if ($scope.order_invoice.table) {
        $scope.order_invoice.table.busy = false;
        $http({
          method: "POST",
          url: "/api/tables/update",
          data: $scope.order_invoice.table
        }).then(
          function (response) {
            if (response.data.done) {
              $scope.busy = false;
            } else $scope.error = response.data.error;
          }
        )
      }

      $scope.deleteOrderInvoice($scope.order_invoice);
      $scope.newOrderInvoice();

    }

  };

  $scope.bookingTable = function (tableId) {

    $scope.order_invoice.transaction_type = {
      id: 1,
      ar: 'طاولات',
      en: 'Tables'
    };

    $http({
      method: "POST",
      url: "/api/tables/view",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1,
          active: 1,
          busy: 1,
          tables_group: 1,
          image_url: 1
        },

        where: {
          active: true
        },
        id: tableId
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.order_invoice.table = response.data.doc;

          if ($scope.order_invoice.table.tables_group) {

            $http({
              method: "POST",
              url: "/api/tables_group/view",
              data: {
                select: {
                  id: 1,
                  name: 1,
                  code: 1,
                  active: 1,
                  tables_group: 1,
                  image_url: 1
                },

                where: {
                  active: true
                },
                id: $scope.order_invoice.table.tables_group.id
              }
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {

                  $scope.order_invoice.table_group = response.data.doc;
                  if ($scope.order_invoice.table)
                    $scope.order_invoice.table.busy = true;

                  $http({
                    method: "POST",
                    url: "/api/tables/update",
                    data: $scope.order_invoice.table
                  });
                }
              },
              function (err) {
                $scope.busy = false;
                $scope.error = err;
              }
            )
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.newOrderInvoice = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope.order_invoice = {
          shift: shift,
          book_list: [],
          discountes: [],
          taxes: [],
          date: new Date(),
          details: [],
          status: {
            id: 1,
            en: "Opened",
            ar: "مفتوحة"
          }
        };

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.order_invoice.store = $scope.defaultSettings.inventory.store;
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.order_type) {
            $scope.order_invoice.transaction_type = $scope.defaultSettings.general_Settings.order_type;

            if ($scope.defaultSettings.general_Settings.order_type.id == 2)
              $scope.order_invoice.delivery_employee = $scope.defaultSettings.general_Settings.delivery_employee;

            if ($scope.defaultSettings.general_Settings.order_type.id == 1) {
              if ($scope.defaultSettings.general_Settings.service)
                $scope.order_invoice.service = $scope.defaultSettings.general_Settings.service;
            }
          }

          if ($scope.defaultSettings.general_Settings.customer && $scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 2) {
            $scope.order_invoice.customer = $scope.defaultSettings.general_Settings.customer;
            if ($scope.defaultSettings.general_Settings.customer.gov)
              $scope.order_invoice.gov = $scope.defaultSettings.general_Settings.customer.gov;

            if ($scope.defaultSettings.general_Settings.customer.city)
              $scope.order_invoice.city = $scope.defaultSettings.general_Settings.customer.city;

            if ($scope.defaultSettings.general_Settings.customer.area) {
              $scope.order_invoice.area = $scope.defaultSettings.general_Settings.customer.area;

              if ($scope.defaultSettings.general_Settings.customer.area.price_delivery_service)
                $scope.order_invoice.price_delivery_service = $scope.defaultSettings.general_Settings.customer.area.price_delivery_service;
            };

            if ($scope.defaultSettings.general_Settings.customer.address)
              $scope.order_invoice.address = $scope.defaultSettings.general_Settings.customer.address;

            if ($scope.defaultSettings.general_Settings.customer.phone)
              $scope.order_invoice.customer_phone = $scope.defaultSettings.general_Settings.customer.phone;

            if ($scope.defaultSettings.general_Settings.customer.mobile)
              $scope.order_invoice.customer_mobile = $scope.defaultSettings.general_Settings.customer.mobile;
          }
        }

      } else {
        $scope.error = '##word.open_shift_not_found##'
      };
    });

  };


  $scope.addOrderInvoice = function () {
    $scope.error = '';
    if ($scope.order_invoice.shift) {

      const v = site.validated('#OrderInvoiceAddModal');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      };
      if (!$scope.order_invoice.transaction_type || ($scope.order_invoice.transaction_type && !$scope.order_invoice.transaction_type.id)) {
        $scope.error = "##word.err_transaction_type##";
        return;
      };
      if (!$scope.order_invoice.customer && $scope.order_invoice.transaction_type == 2) {
        $scope.error = "##word.err_customer##";
        return;
      };
      if (!$scope.order_invoice.table && $scope.order_invoice.transaction_type == 1) {
        $scope.error = "##word.err_table##";
        return;
      };

      if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
        let max_discount = false;

        $scope.order_invoice.book_list.forEach(_itemSize => {
          if (_itemSize.discount.value > _itemSize.discount.max)
            max_discount = true;
        });

        if (max_discount) {
          $scope.error = "##word.err_maximum_discount##";
          return;
        }
      }

      if (new Date($scope.order_invoice.date) > new Date()) {

        $scope.error = "##word.date_exceed##";
        return;
  
      };

      if ($scope.order_invoice.transaction_type.id != 2 && $scope.order_invoice.delivery_employee)
        $scope.order_invoice.delivery_employee = {};

      if ($scope.order_invoice.transaction_type.id != 1 && $scope.order_invoice.table)
        $scope.order_invoice.table = {};

      if ($scope.order_invoice.transaction_type.id != 1 && $scope.order_invoice.service)
        $scope.order_invoice.service = 0;

      if ($scope.order_invoice.transaction_type.id != 2 && $scope.order_invoice.price_delivery_service)
        $scope.order_invoice.price_delivery_service = 0;

      let url = '/api/order_invoice/update';
      if ($scope.order_invoice.id) url = '/api/order_invoice/update';
      else {
        url = '/api/order_invoice/add';

        if (site.feature('restaurant') && '##user.type##' == 'table') {
          $scope.bookingTable('##user.ref_info.id##');
        }
      }

      $timeout(() => {
        $scope.busy = true;
        $http({
          method: "POST",
          url: url,
          data: $scope.order_invoice
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              if (site.feature('restaurant'))
                $scope.sendToKitchens(Object.assign({}, response.data.doc));


              $scope.order_invoice = response.data.doc;

              if ($scope.order_invoice.status.id == 2 && $scope.order_invoice.posting) {

                let store_out = {
                  image_url: '/images/store_out.png',
                  supply_date: new Date(),
                  date: $scope.order_invoice.date,
                  order_id: $scope.order_invoice.id,
                  customer: $scope.order_invoice.customer,
                  shift: $scope.order_invoice.shift,
                  net_value: $scope.order_invoice.net_value,
                  paid_up: $scope.order_invoice.net_value,
                  payment_method: $scope.order_invoice.payment_method,
                  store: $scope.order_invoice.store,
                  order_code: $scope.order_invoice.code,
                  items: $scope.order_invoice.book_list,
                  total_discount: $scope.order_invoice.total_discount,
                  total_tax: $scope.order_invoice.total_tax,
                  total_value: $scope.order_invoice.total_value,
                  net_value: $scope.order_invoice.net_value,
                  type: {
                    id: 4,
                    en: "Orders Screen",
                    ar: "شاشة الطلبات"
                  },
                  active: true
                };

                if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting)
                  store_out.posting = true;

                $scope.addStoresOut(store_out)
              }

            } else {
              $scope.error = response.data.error;
            }
          },
          function (err) {
            console.log(err);
          }
        )
      }, 500);
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.addStoresOut = function (store_out) {

    if (store_out.items && store_out.items.length > 0) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_out/add",
        data: store_out
      }).then(
        function (response) {
          if (response.data.done) {
            $scope.busy = false;
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

  $scope.sendToKitchens = function (_order_invoice) {
    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    }

    $scope.kitchensList.forEach(_kitchen => {
      _kitchen.data = [];
      if (!_kitchen.printer_path) {
        _kitchen.printer = null;
        return;
      }

      _kitchen.printer = _kitchen.printer_path.ip;
      _kitchen.has_items = false;

      if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_header) {
        _kitchen.data.push({
          type: 'header',
          value: $scope.defaultSettings.printer_program.invoice_header
        })
      }

      _kitchen.data.push({
        type: 'text2',
        value2: site.toDateXF(_order_invoice.date),
        value: 'Date'
      });

      _kitchen.data.push({
        type: 'text2b',
        value2: _kitchen.name,
        value: 'Kitchen'
      });


      _kitchen.data.push({
        type: 'space'
      });

      _kitchen.data.push({
        type: 'text2',
        value: 'Invoice Code',
        value2: _order_invoice.code
      });

      if (_order_invoice.customer)
        _kitchen.data.push({
          type: 'text2',
          value2: _order_invoice.customer.name_ar,
          value: 'Customer'
        });

      if (_order_invoice.table)
        _kitchen.data.push({
          type: 'text2',
          value2: _order_invoice.table.name,
          value: _order_invoice.table.tables_group.name
        });

      _kitchen.data.push({
        type: 'line'
      });

      _kitchen.data.push({
        type: 'text3b',
        value: 'Item',
        value2: 'Count',
        value3: "Notes"
      });

      _kitchen.data.push({
        type: 'text3b',
        value: 'الصنف',
        value2: 'العدد',
        value3: "ملاحظات"
      });
      _kitchen.data.push({
        type: 'space'
      });


      _order_invoice.book_list.forEach(item_book => {
        if (!item_book.kitchen || item_book.printed) return;
        if (item_book.kitchen.id == _kitchen.id) {
          item_book.printed = true;
          _kitchen.has_items = true;
          _kitchen.data.push({
            type: 'text3',
            value: item_book.size,
            value2: item_book.count,
            value3: item_book.notes || ' ... '
          });
        }

      });

      _kitchen.data.push({
        type: 'line'
      });

      if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.invoice_footer) {
        _kitchen.data.push({
          type: 'footer',
          value: $scope.defaultSettings.printer_program.invoice_footer
        })
      }

      if (_kitchen.has_items) {
        $http({
          method: "POST",
          url: `http://${ip}:${port}/print`,
          data: _kitchen
        }).then(
          function (err) {
            console.log(err);
          }
        )
      }

    });

    $scope.updateOrderInvoice(_order_invoice);

  };

  $scope.addAccountInvoice = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;



    if ($scope.account_invoices.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }



    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting)
      $scope.account_invoices.posting = false;
    else $scope.account_invoices.posting = true;

    $scope.order_invoice.invoice = true;

    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: $scope.account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.account_invoices = response.data.doc;
          site.hideModal('#accountInvoiceModal');
          $scope.printAccountInvoive($scope.account_invoices);
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*duplicate key error*')) {
            $scope.error = "##word.code_exisit##"
          } else if (response.data.error.like('*Please write code*')) {
            $scope.error = "##word.enter_code_inventory##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.printAccountInvoive = function (x) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    let obj = x;

    obj.transaction_type = $scope.order_invoice.transaction_type;

    if ($scope.account_invoices && $scope.account_invoices.invoice_id) {
      obj.book_list = $scope.account_invoices.current_book_list;
      obj.total_remain = $scope.account_invoices.net_value - $scope.account_invoices.paid_up;

      obj.total_remain = site.toNumber($scope.account_invoices.total_remain);
      obj.price_delivery_service = $scope.order_invoice.price_delivery_service;
      obj.service = $scope.order_invoice.service;
      obj.table = $scope.order_invoice.table;

    } else {

      obj.code = $scope.order_invoice.code

    }


    let ip = '127.0.0.1';
    let port = '11111';
    if ($scope.defaultSettings.printer_program) {
      ip = $scope.defaultSettings.printer_program.ip || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.port || '11111';
    };





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
      name: obj.payment_paid_up ? ' Bill payment ' : 'Bill ',
      value: (obj.code)
    }, {
      type: 'invoice-date',
      name: 'Date',
      value: site.toDateXF(obj.date)
    }, {
      type: 'space'
    }, {
      type: 'text2',
      value2: obj.transaction_type.en,
      value: 'Type'
    });


    if (obj.customer)
      obj_print.data.push({
        type: 'text2',
        value2: obj.customer.name_ar,
        value: 'Cutomer'
      });

    if (obj.table)
      obj_print.data.push({
        type: 'invoice-table',
        name: obj.table.tables_group.name,
        value: obj.table.name
      });

    if (obj.book_list && obj.book_list.length > 0) {

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

      obj.book_list.forEach((_current_book_list, i) => {
        _current_book_list.total = site.toNumber(_current_book_list.total);
        obj_print.data.push({
          type: 'invoice-item',
          count: _current_book_list.count,
          name: _current_book_list.size,
          price: site.addSubZero(_current_book_list.total, 2)
        });
        if (i < obj.book_list.length - 1) {
          obj_print.data.push({
            type: 'line3'
          });
        }

      });
    };

    obj_print.data.push({
      type: 'line'
    });

    if (obj.total_tax)
      obj_print.data.push({
        type: 'text2',
        value2: obj.total_tax,
        value: 'Total Taxes'
      });

    if (obj.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: obj.total_discount,
        value: 'Total Discount'
      });

    if (obj.price_delivery_service)
      obj_print.data.push({
        type: 'text2',
        value2: obj.price_delivery_service,
        value: 'Service Delivery'
      });

    if (obj.service)
      obj_print.data.push({
        type: 'text2',
        value2: obj.service,
        value: 'Service'
      });

    obj_print.data.push({
      type: 'space'
    });


    if (obj.net_value) {

      obj_print.data.push({
        type: 'invoice-total',
        value: site.addSubZero(obj.net_value, 2),
        name: "Total Value"
      });
    }


    if (obj.paid_up)
      obj_print.data.push({
        type: 'text2',
        value2: site.addSubZero(obj.paid_up, 2),
        value: "Paid Up"
      });


    obj_print.data.push({
      type: 'space'
    });

    if (obj.total_remain)
      obj_print.data.push({
        type: 'total',
        value2: site.addSubZero(obj.total_remain, 2),
        value: "Required to pay"
      });


    if (obj.currency)
      obj_print.data.push(
        {
          type: 'text2',
          value2: obj.currency.name,
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


    obj_print.data.push({
      type: 'invoice-barcode',
      value: (obj.code)
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

  $scope.displayUpdateOrderInvoice = function (order_invoice) {
    $scope.error = '';
    $scope.viewOrderInvoice(order_invoice);
    $scope.order_invoice = {};
    site.showModal('#OrderInvoiceUpdateModal');
  };

  $scope.updateOrderInvoice = function (_order_invoice) {
    $scope.error = '';
    const v = site.validated('#OrderInvoiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_invoice/update",
      data: _order_invoice || $scope.order_invoice
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
    )
  };

  $scope.displayAccountInvoice = function (order_invoice) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: order_invoice.id,
          customer: order_invoice.customer,
          shift: shift,
          order_invoices_type: order_invoice.transaction_type,
          net_value: order_invoice.net_value,
          paid_up: 0,
          invoice_code: order_invoice.code,
          total_discount: order_invoice.total_discount,
          total_tax: order_invoice.total_tax,
          current_book_list: order_invoice.under_paid.book_list,
          source_type: {
            id: 3,
            en: "Orders Screen",
            ar: "شاشة الطلبات"
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
        if ($scope.account_invoices.currency) {
          $scope.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
          $scope.account_invoices.paid_up = $scope.amount_currency;
        };
        $scope.calc($scope.account_invoices);

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
      method: "POST",
      url: "/api/order_invoice/view",
      data: {
        id: order_invoice.id
      }
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
    )
  };

  $scope.deleteOrderInvoice = function (order) {
    $scope.error = '';
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/order_invoice/delete",
      data: order
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.viewInvoicesActiveList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getOrderInvoiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#OrderInvoiceSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDefaultSettingsList = function () {
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
          $scope.newOrderInvoice();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadItemsGroups = function () {
    $scope.busy = true;
    $scope.itemsGroupList = [];

    $http({
      method: "POST",
      url: "/api/items_group/all",
      data: {
        select: {
          id: 1,
          name: 1,
          image_url: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemsGroupList = response.data.list;

        }
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
        if (response.data.done) $scope.safesList = response.data.list;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getPrintersPath = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/printers_path/all",
      data: {
        select: {
          id: 1,
          name: 1,
          type: 1,
          ip: 1,
        }
      }
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
    )
  };

  $scope.loadKitchenList = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/kitchen/all",
      data: {
        select: {
          id: 1,
          name: 1,
          printer_path: 1
        }
      }
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
    )
  };

  $scope.loadTaxTypes = function () {
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
        if (response.data.done) {
          $scope.tax_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDiscountTypes = function () {
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
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
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
      allergic_food_list: [{}],
      allergic_drink_list: [{}],
      medicine_list: [{}],
      disease_list: [{}],
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

  $scope.get_open_shift = function (callback) {
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

  $scope.getDeliveryEmployeesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/delivery_employees/all",
      data: {}
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
    )
  };

  $scope.getTablesGroupList = function () {
    $scope.busy = true;
    $scope.tablesGroupList = [];
    $http({
      method: "POST",
      url: "/api/tables_group/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          response.data.list.forEach(tablesGroup => {
            tablesGroup.tables_list = [];
            $scope.tablesList.forEach(tables => {
              if (tablesGroup.id === tables.tables_group.id)
                tablesGroup.tables_list.push(tables)
            });
          });
          $scope.tablesGroupList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTablesList = function (callback) {
    callback = callback || function () { };

    $scope.busy = true;
    $scope.tablesList = [];
    $http({
      method: "POST",
      url: "/api/tables/all",
      data: {
        select: {
          id: 1,
          name: 1,
          code: 1,
          active: 1,
          busy: 1,
          tables_group: 1,
          image_url: 1
        },

        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0)
          $scope.tablesList = response.data.list;
        callback();
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getOrderInvoicesActiveList = function (callback) {
    callback = callback || function () { };
    $scope.busy = true;
    $scope.invoicesActivelist = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/active_all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0)
          $scope.invoicesActivelist = response.data.list;
        callback()
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.viewInvoicesTablesList = function () {
    if (!$scope.openShift) {
      $scope.getOrderInvoicesActiveList(() => {
        $scope.invoicesTablelist = [];
        $scope.invoicesActivelist.forEach(_invoiceActive => {
          if (_invoiceActive.transaction_type && _invoiceActive.transaction_type.id == 1 && _invoiceActive.id != $scope.order_invoice.id) {
            $scope.invoicesTablelist.push(_invoiceActive);
          };
        });

        if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
          $scope.error = "##word.err_waiting_list_empty##";
          return;
        };
        site.showModal('#mergeTablesModal');
      });
    } else $scope.error = '##word.open_shift_not_found##';
  };


  $scope.viewInvoicesActiveList = function () {
    if (!$scope.openShift) {
      $scope.getOrderInvoicesActiveList(() => {
        if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
          $scope.error = "##word.err_waiting_list_empty##";
          return;
        };
        site.showModal('#orderInvoicesActiveAddModal');
      });
    } else $scope.error = '##word.open_shift_not_found##';
  };


  $scope.mergeTables = function (order) {
    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    let exist = false;

    order.book_list.forEach(item => {
      $scope.order_invoice.book_list.forEach(el => {

        if (item.size == el.size && item.barcode == el.barcode) {
          exist = true;

          el.count = el.count + item.count;

          el.total += el.price;
        };
      });
      if (!exist) {
        $scope.order_invoice.book_list.push(item);
      };
    });
    $scope.calc($scope.order_invoice);
    $scope.deleteOrderInvoice(order);
    site.hideModal("#mergeTablesModal");
  };

  $scope.returnWaitingOrder = function (item) {
    $scope.order_invoice = item;
    site.hideModal("#orderInvoicesActiveAddModal")
  };

  $scope.getTransactionTypeList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.transactionTypeList = [];
    $http({
      method: "POST",
      url: "/api/order_invoice/transaction_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        if (site.feature('pos')) $scope.transactionTypeList = response.data.filter(i => i.id == 2 || i.id == 3);
        else $scope.transactionTypeList = response.data;

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.closeOrder = function () {

    $scope.getStockItems($scope.order_invoice.book_list, callback => {

      if (!callback) {

        $scope.order_invoice.shift = $scope.order_invoice.shift || $scope.shift;
        if (!$scope.order_invoice || !$scope.order_invoice.shift) {
          return;
        }

        if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.discount_method && $scope.defaultSettings.general_Settings.discount_method.id == 1)
          $scope.order_invoice.posting = true;

        $scope.order_invoice.status = {
          id: 2,
          en: "Closed Of Orders Screen",
          ar: "مغلق من شاشة الأوردرات"
        };

        $scope.order_invoice.under_paid = {
          book_list: $scope.order_invoice.book_list,
          total_tax: $scope.order_invoice.total_tax,
          total_discount: $scope.order_invoice.total_discount,
          price_delivery_service: $scope.order_invoice.price_delivery_service,
          service: $scope.order_invoice.service,
          net_value: $scope.order_invoice.net_value,
        };


        $scope.addOrderInvoice();
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    })
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


  $scope.loadItems = function (group) {
    if (!$scope.openShift) {

      $scope.busy = true;
      $scope.itemsList = [];
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: {
            "item_group.id": group.id,
            "is_pos": true
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.itemsList = response.data.list;
            $scope.current_items = [];
            site.showModal('#itemsListModal');
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    } else $scope.error = '##word.open_shift_not_found##';
  };

  $scope.showItemsIn = function (i) {
    $scope.current_items = i;
    if ($scope.current_items.sizes) {

      $scope.current_items.sizes.forEach(_size => {
        _size.main_unit = $scope.current_items.main_unit;
        _size.item_group = $scope.current_items.item_group;
        _size.size_units_list.forEach(_unit => {
          if (_unit.id === _size.main_unit.id) {
            _size.price = _unit.price
          }
        });
        _size.item_id = $scope.current_items.id;
        _size.name = $scope.current_items.name;
      });
    }
    site.showModal('#sizesModal');
  };

  $scope.deliveryServiceHide = function () {
    site.hideModal('#deliveryServiceModal');
  };

  $scope.bookList = function (item) {

    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    let exist = false;
    let foundHold = false;
    let kitchenBranch = {};
    if (item.branches_list && item.branches_list.length > 0) {

      item.branches_list.forEach(_branch => {
        if (_branch.code == '##session.branch.code##') {
          kitchenBranch = _branch.kitchen;
          _branch.stores_list.forEach(_store => {
            if (_store.store && _store.store.id == $scope.order_invoice.store.id) {
              if (_store.hold) foundHold = true;
            }
          });
        }
      });
    }

    $scope.order_invoice.book_list.forEach(el => {
      if (item.size == el.size && item.barcode == el.barcode && !el.printed) {
        exist = true;
        el.total += (item.price - item.discount.value);
        el.count += 1;
      };
    });

    if (!exist) {

      let indxUnit = item.size_units_list.findIndex(_unit => _unit.id == item.main_unit.id);

      item.unit = item.size_units_list[indxUnit];
      item.discount = item.size_units_list[indxUnit].discount;
      item.price = item.size_units_list[indxUnit].price;
      if (!foundHold) {

        $scope.order_invoice.book_list.push({
          item_id: item.item_id,
          kitchen: kitchenBranch,
          name: item.name,
          store: item.store,
          barcode: item.barcode,
          size: item.size,
          size_en: item.size_en,
          item_group: item.item_group,
          unit: item.unit,
          total: (item.price - item.discount.value),
          vendor: item.vendor,
          store: item.store,
          price: item.price,
          discount: item.discount,
          count: 1
        });
      }
    };
    $scope.calc($scope.order_invoice);
  };

  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count == 1) {
      $scope.order_invoice.book_list.splice($scope.order_invoice.book_list.indexOf(item), 1)

    } else if (item.count > 1) {
      item.count -= 1;
      item.total -= item.price;
      return item
    };
  };

  $scope.addTax = function () {
    if (!$scope.tax.value) {
      $scope.error = '##word.error_tax##';
      return;
    } else {
      $scope.order_invoice.taxes = $scope.order_invoice.taxes || [];
      if ($scope.tax.value) {
        $scope.order_invoice.taxes.push({
          name: $scope.tax.name,
          value: $scope.tax.value
        });
      };
      $scope.tax = {};
    };
  };

  $scope.deleteTax = function (_tx) {
    for (let i = 0; i < $scope.order_invoice.taxes.length; i++) {
      let tx = $scope.order_invoice.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value) {
        $scope.order_invoice.taxes.splice(i, 1);
      };
    };
  };

  $scope.addDiscount = function () {
    $scope.error = '';

    if (!$scope.discount.value) {

      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.order_invoice.discountes = $scope.order_invoice.discountes || [];
      $scope.order_invoice.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });
    };
  };

  $scope.deleteDiscount = function (_ds) {
    for (let i = 0; i < $scope.order_invoice.discountes.length; i++) {
      let ds = $scope.order_invoice.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type) {
        $scope.order_invoice.discountes.splice(i, 1);
      };
    };
  };

  $scope.calcSize = function (size) {
    $scope.error = '';
    $timeout(() => {
      let discount = 0;
      if (size.price && size.count) {
        if (size.discount.type == 'number')
          discount = size.discount.value * size.count;
        else if (size.discount.type == 'percent')
          discount = size.discount.value * (size.price * size.count) / 100;

        size.total = (site.toNumber(size.price) * site.toNumber(size.count)) - discount;
      }
      $scope.calc($scope.order_invoice);
    }, 100);
  };


  $scope.calc = function (obj) {

    $timeout(() => {
      obj.total_value = 0;
      obj.total_tax = 0;
      obj.total_discount = 0;


      if (obj.book_list && obj.book_list.length > 0) {
        obj.book_list.forEach(itm => {
          obj.total_value += site.toNumber(itm.total);
        });
      };

      if (obj.taxes && obj.taxes.length > 0) {
        obj.taxes.forEach(tx => {
          obj.total_tax += obj.total_value * site.toNumber(tx.value) / 100;
        });
      };

      if (obj.discountes && obj.discountes.length > 0) {
        obj.discountes.forEach(ds => {

          if (ds.type === "percent")
            obj.total_discount += site.toNumber(obj.total_value) * site.toNumber(ds.value) / 100;
          else
            obj.total_discount += site.toNumber(ds.value);
        });
      };

      if (obj.transaction_type && obj.transaction_type.id == 2) {
        obj.service = 0;
        obj.price_delivery_service = site.toNumber(obj.price_delivery_service) || 0;
      };

      if (obj.transaction_type && obj.transaction_type.id == 1) {
        obj.service = obj.service || 0;
        obj.price_delivery_service = 0;
      };

      if (obj.transaction_type && obj.transaction_type.id == 3) {
        obj.service = 0;
        obj.price_delivery_service = 0;
      };

      if (obj.book_list && obj.book_list.length > 0) {

        obj.net_value = (site.toNumber(obj.total_value) + (obj.service || 0) + (obj.total_tax || 0) + (obj.price_delivery_service || 0)) - (obj.total_discount || 0);
        obj.net_value = site.toNumber(obj.net_value)
      }
      if (obj.currency) {
        $scope.amount_currency = obj.net_value / obj.currency.ex_rate;
        $scope.amount_currency = site.toNumber($scope.amount_currency);
      }

      $scope.discount = {
        type: 'number'
      };
    }, 250);

  };

  $scope.changeCustomerAddresses = function (customer) {

    $scope.order_invoice.gov = customer.gov;
    $scope.order_invoice.city = customer.city;
    $scope.order_invoice.area = customer.area;
    $scope.order_invoice.address = customer.address;
    $scope.order_invoice.customer_phone = customer.phone;
    $scope.order_invoice.customer_mobile = customer.mobile;
    $scope.order_invoice.customer_mobile = customer.mobile;
    if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 2)
      $scope.order_invoice.price_delivery_service = customer.area.price_delivery_service;
    else $scope.order_invoice.price_delivery_service = 0;

  };

  $scope.showTable = function () {
    $scope.error = '';
    if (!$scope.openShift) {
      $scope.getTablesList(() => {
        $scope.getTablesGroupList();
        site.showModal('#showTablesModal');
      });
    } else $scope.error = '##word.open_shift_not_found##';
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
        method: "POST",
        url: "/api/tables/update",
        data: $scope.order_invoice.table
      });
    }
    $scope.order_invoice.table = table;
    $scope.order_invoice.table.busy = true;
    $http({
      method: "POST",
      url: "/api/tables/update",
      data: $scope.order_invoice.table
    });
    $scope.order_invoice.table_group = group;
    site.hideModal('#showTablesModal');
    $scope.addOrderInvoice();
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#OrderInvoiceSearchModal');

  };

  $scope.searchAll = function () {

    $scope.getOrderInvoiceList($scope.search);
    site.hideModal('#OrderInvoiceSearchModal');
    $scope.search = {};
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

  $scope.getOpenShiftList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/open_shift",
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
        if (response.data.done)
          $scope.openShift = true;
        else $scope.openShift = false;
      },

      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getOrderInvoiceList();
  $scope.loadItemsGroups();
  $scope.loadDiscountTypes();
  $scope.getTransactionTypeList();
  $scope.loadCurrencies();
  $scope.loadTaxTypes();
  $scope.getDeliveryEmployeesList();
  $scope.getOpenShiftList();
  $scope.getGovList();
  $scope.getPrintersPath();
  $scope.getPaymentMethodList();
  $scope.getDefaultSettingsList();
  $scope.getCustomerGroupList();

  if (site.feature('restaurant')) {
    $scope.loadKitchenList();
    $scope.getTablesList();
  }
});