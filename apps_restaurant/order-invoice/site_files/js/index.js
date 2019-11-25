app.controller("order_invoice", function ($scope, $http, $timeout) {

  $scope._search = {};
  $scope.discount = { type: 'number' };
  $scope.tax = {};
  $scope.kitchensList = [];

  $scope.displayAddOrderInvoice = function () {
    $scope.error = '';
    $scope.order_invoice = {
      image_url: '/images/order_invoice.png',
      active: true
    };
    site.showModal('#OrderInvoiceAddModal');
  };

  $scope.newOrderInvoice = function () {
    $scope.error = "";
    $scope.order_invoice = {
      transaction_type: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.order_type : null,
      delivery_employee: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.order_type && $scope.defaultSettings.general_Settings.order_type.id == 2 ? $scope.defaultSettings.general_Settings.delivery_employee : {} : null,
      customer: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer : null,
      gov: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.gov : null,
      city: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.city : null,
      area: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.area : null,
      price_delivery_service: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.area ? $scope.defaultSettings.general_Settings.customer.area.price_delivery_service : 0 : null,
      address: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.address : null,
      customer_phone: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.phone : null,
      customer_mobile: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.mobile : null,
      service: $scope.defaultSettings.general_Settings ? $scope.defaultSettings.general_Settings.order_type && $scope.defaultSettings.general_Settings.order_type.id == 1 ? $scope.defaultSettings.general_Settings.service : 0 : null,
      book_list: [],
      discountes: [],
      taxes: [],
      date: new Date(),
      details: [],
      status: {
        id: 1, en: "Opened", ar: "مفتوحة"
      }
    };
  };

  $scope.addOrderInvoice = function () {
    $scope.error = '';
    const v = site.validated('#OrderInvoiceAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };
    if (!$scope.order_invoice.transaction_type) {
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
    else url = '/api/order_invoice/add';

    $scope.busy = true;
    $http({
      method: "POST",
      url: url,
      data: $scope.order_invoice
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.sendToKitchens(Object.assign({}, response.data.doc));
          if ($scope.order_invoice.status && $scope.order_invoice.status.id == 2) {
            $scope.newOrderInvoice();
          } else {
            $scope.order_invoice = response.data.doc;
          }


        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
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
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/order_invoice/delete",
      data: order
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#OrderInvoiceDeleteModal');
          $scope.getOrderInvoiceList();
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

  $scope.getSafesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safesList = response.data.list;
        }
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

  $scope.getCustomerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {}
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
        select: { id: 1, name: 1, code: 1 }
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
        select: { id: 1, name: 1, code: 1, busy: 1, tables_group: 1, image_url: 1 },
        where: {
          /*'tables_group.id': tables_group.id,*/
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
    $scope.getOrderInvoicesActiveList(() => {

      $scope.invoicesTablelist = [];
      $scope.invoicesActivelist.forEach(t => {
        if (t.transaction_type && t.transaction_type.id == 1 && t.id != $scope.order_invoice.id) {
          $scope.invoicesTablelist.push(t);
        };
      });

      if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
        $scope.error = "##word.err_waiting_list_empty##";
        return;
      };

      site.showModal('#mergeTablesModal');
    });
  };

  $scope.viewInvoicesActiveList = function () {
    $scope.getOrderInvoicesActiveList(() => {
      if ($scope.invoicesActivelist && $scope.invoicesActivelist.length < 1) {
        $scope.error = "##word.err_waiting_list_empty##";
        return;
      };
      site.showModal('#orderInvoicesActiveAddModal');
    });
  };

  $scope.mergeTables = function (order) {
    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    let exist = false;

    order.book_list.forEach(item => {
      $scope.order_invoice.book_list.forEach(el => {

        if (item.size == el.size) {
          exist = true;

          el.count = el.count + item.count;

          el.total_price += el.price;
        };
      });
      if (!exist) {
        $scope.order_invoice.book_list.push(item);
      };
    });
    $scope.calc();
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
        $scope.transactionTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.closeOrder = function () {

    if ($scope.order_invoice.book_list && $scope.order_invoice.book_list.length > 0) {

      if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.discount_method && $scope.defaultSettings.general_Settings.discount_method.id == 1) {
        $scope.order_invoice.reset_items = true
      } else {
        $scope.order_invoice.reset_items = false;
        $scope.order_invoice.post = false;
      }

      $scope.order_invoice.status = { id: 2, en: "Closed Of Orders Screen", ar: "مغلق من شاشة الأوردرات" };

      $scope.order_invoice.under_paid = {
        order_invoice_id: $scope.order_invoice.id ? $scope.order_invoice.id : null,
        book_list: $scope.order_invoice.book_list,
        total_tax: $scope.order_invoice.total_tax,
        total_discount: $scope.order_invoice.total_discount,
        price_delivery_service: $scope.order_invoice.price_delivery_service,
        service: $scope.order_invoice.service,
        net_value: $scope.order_invoice.net_value,
      };
      $scope.order_invoice.under_paid.items_price = 0;
      $scope.order_invoice.book_list.forEach(book_list => {
        $scope.order_invoice.under_paid.items_price += book_list.total_price;
      });

      $scope.addOrderInvoice();
    } else $scope.error = '##word.err_book_list##';

  };

  $scope.loadItems = function (group) {
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
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.showItemsIn = function (i) {
    $scope.current_items = i;
    if ($scope.current_items.sizes) $scope.current_items.sizes.forEach(size => {
      size.item_id = $scope.current_items.id;
      size.name = $scope.current_items.name;

    });
  };

  $scope.deliveryServiceHide = function () {
    site.hideModal('#deliveryServiceModal');
  };

  $scope.bookList = function (item) {

    $scope.error = '';
    $scope.order_invoice.book_list = $scope.order_invoice.book_list || [];
    let exist = false;

    $scope.order_invoice.book_list.forEach(el => {
      if (item.size == el.size && !el.printed) {
        exist = true;
        el.total_price += item.price;
        el.count += 1;
      };
    });

    if (!exist) {
      $scope.order_invoice.book_list.push({
        item_id: item.item_id,
        kitchen: item.kitchen,
        name: item.name,
        store: item.store,
        barcode: item.barcode,
        size: item.size,
        total_price: item.price,
        vendor: item.vendor,
        store: item.store,
        price: item.price,
        count: 1
      });
    };
    $scope.calc();
  };

  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count == 1) {
      $scope.order_invoice.book_list.splice($scope.order_invoice.book_list.indexOf(item), 1)

    } else if (item.count > 1) {
      item.count -= 1;
      item.total_price -= item.price;
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

  $scope.calc = function () {

    $timeout(() => {
      $scope.order_invoice.total_value = 0;
      $scope.order_invoice.net_value = 0;
      $scope.order_invoice.total_tax = 0;
      $scope.order_invoice.total_discount = 0;

      if ($scope.order_invoice.book_list && $scope.order_invoice.book_list.length > 0) {
        $scope.order_invoice.book_list.forEach(itm => {
          itm.total_price = itm.price * itm.count;
          $scope.order_invoice.total_value += parseFloat(itm.total_price);
        });
      };
      if ($scope.order_invoice.taxes && $scope.order_invoice.taxes.length > 0) {
        $scope.order_invoice.taxes.forEach(tx => {
          $scope.order_invoice.total_tax += $scope.order_invoice.total_value * parseFloat(tx.value) / 100;
        });
      };

      if ($scope.order_invoice.discountes && $scope.order_invoice.discountes.length > 0) {
        $scope.order_invoice.discountes.forEach(ds => {

          if (ds.type === "percent")
            $scope.order_invoice.total_discount += $scope.order_invoice.total_value * parseFloat(ds.value) / 100;
          else
            $scope.order_invoice.total_discount += parseFloat(ds.value);
        });
      };

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 2) {
        $scope.order_invoice.service = 0;
        $scope.order_invoice.price_delivery_service = $scope.order_invoice.price_delivery_service || 0;
      };

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 1) {
        $scope.order_invoice.service = $scope.order_invoice.service || 0;
        $scope.order_invoice.price_delivery_service = 0;
      };

      if ($scope.order_invoice.transaction_type && $scope.order_invoice.transaction_type.id == 3) {
        $scope.order_invoice.service = 0;
        $scope.order_invoice.price_delivery_service = 0;
      };
      $scope.order_invoice.net_value = ($scope.order_invoice.total_value + ($scope.order_invoice.service || 0) + ($scope.order_invoice.total_tax || 0) + ($scope.order_invoice.price_delivery_service || 0)) - ($scope.order_invoice.total_discount || 0);
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
    $scope.order_invoice.transaction_type.id == 2 ? $scope.order_invoice.price_delivery_service = customer.area.price_delivery_service : 0;
  };

  $scope.showTable = function () {
    $scope.error = '';
    $scope.getTablesList(() => {
      $scope.getTablesGroupList();
      site.showModal('#showTablesModal');
    });
  };

  $scope.selectTable = function (t, g) {
    if (t.busy) {
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
    $scope.order_invoice.table = t;
    $scope.order_invoice.table.busy = true;
    $http({
      method: "POST",
      url: "/api/tables/update",
      data: $scope.order_invoice.table
    });
    $scope.order_invoice.table_group = g;
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

  $scope.getOrderInvoiceList();
  $scope.loadItemsGroups();
  $scope.loadDiscountTypes();
  $scope.getTransactionTypeList();
  $scope.loadTaxTypes();
  $scope.getSafesList();
  $scope.getCustomerList();
  $scope.getDeliveryEmployeesList();
  $scope.getGovList();
  $scope.getTablesList();
  $scope.getPrintersPath();
  $scope.getDefaultSettingsList();
  $scope.loadKitchenList();
});
