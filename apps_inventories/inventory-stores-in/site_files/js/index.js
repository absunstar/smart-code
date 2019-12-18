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

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.payment_method)
            $scope.account_invoices.payment_method = $scope.defaultSettings.general_Settings.payment_method;
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.defaultSettings.accounting.safe)
            $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe;
        };
        site.showModal('#createInvoiceModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAccountInvoice = function (account_invoices) {
    $scope.error = '';
    $scope.busy = true;

    if (account_invoices.paid_up > 0 && !account_invoices.safe) {
      $scope.error = "##word.should_select_safe##";
      return;
    } else if (account_invoices.paid_up > account_invoices.paid_require) {
      $scope.error = "##word.err_paid_require##";
      return;
    }

    if (account_invoices.paid_up <= 0) account_invoices.safe = null;
    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response) {
          site.hideModal('#createInvoiceModal');
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

    $scope.account_invoices.total_remain = $scope.account_invoices.paid_require - $scope.account_invoices.paid_up;

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
        value: $scope.account_invoices.payment_paid_up ? 'Payment Purchase Invoice' + $scope.account_invoices.code : 'Purchase Invoice'
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

    if ($scope.account_invoices.payment_paid_up) {
      $scope.account_invoices.total_remain = $scope.account_invoices.total_remain - $scope.account_invoices.payment_paid_up;
      $scope.account_invoices.total_paid_up = $scope.account_invoices.total_paid_up + $scope.account_invoices.payment_paid_up;
    }

    if ($scope.account_invoices.paid_require)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.paid_require,
          value: "Total Value"
        });

    if ($scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up,
          value: "Paid Up"
        });

    if ($scope.account_invoices.payment_paid_up || $scope.account_invoices.paid_up)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.total_paid_up || $scope.account_invoices.paid_up,
          value: "Total Payments"
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
    $scope.calc();
  };

  $scope.deleteTax = function (_tx) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_in.taxes.length; i++) {
      let tx = $scope.store_in.taxes[i];
      if (tx.name == _tx.name && tx.value == _tx.value)
        $scope.store_in.taxes.splice(i, 1);
    }
    $scope.calc();
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
      $scope.calc();
    };

  };
  $scope.deleteDiscount = function (_ds) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_in.discountes.length; i++) {
      let ds = $scope.store_in.discountes[i];
      if (ds.name == _ds.name && ds.value == _ds.value && ds.type == _ds.type)
        $scope.store_in.discountes.splice(i, 1);
    }
    $scope.calc();
  };

  $scope.calc = function () {
    $scope.error = '';
    $scope.store_in.total_value = 0;
    $scope.store_in.net_value = 0;

    $scope.store_in.items.forEach(itm => {
      $scope.store_in.total_value += parseFloat(itm.total);
    });

    $scope.store_in.total_tax = 0;
    $scope.store_in.taxes.forEach(tx => {
      $scope.store_in.total_tax += $scope.store_in.total_value * parseFloat(tx.value) / 100;
    });

    $scope.store_in.total_discount = 0;
    if ($scope.store_in.discountes && $scope.store_in.discountes.length > 0)
      $scope.store_in.discountes.forEach(ds => {

        if (ds.type == 'percent')
          $scope.store_in.total_discount += $scope.store_in.total_value * parseFloat(ds.value) / 100;
        else $scope.store_in.total_discount += parseFloat(ds.value);
      });

    $scope.store_in.net_value = $scope.store_in.total_value + $scope.store_in.total_tax - $scope.store_in.total_discount;
    $scope.discount = {
      type: 'number'
    };
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_in.items.splice($scope.store_in.items.indexOf(itm), 1);

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
          if ($scope.defaultSettings.general_Settings.payment_method && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto)
            $scope.store_in.payment_method = $scope.defaultSettings.general_Settings.payment_method;
        }
        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_in.store = $scope.defaultSettings.inventory.store
          if ($scope.defaultSettings.inventory.type_in) {
            $scope.store_in.type = $scope.defaultSettings.inventory.type_in

            if ($scope.defaultSettings.inventory.type_in.id == 1) {
              if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.safe && $scope.defaultSettings.accounting.create_invoice_auto)
                $scope.store_in.safe = $scope.defaultSettings.accounting.safe
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
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    if ($scope.store_in.type && $scope.store_in.type.id == 1 && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
      if (!$scope.store_in.safe) {
        $scope.error = "##word.nosafe_warning##";
        return;
      }

    } else $scope.store_in.safe = null;

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
            if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
              let store_in_doc = response.data.doc
              $scope.account_invoices = {
                image_url: '/images/account_invoices.png',
                date: store_in_doc.date,
                invoice_id: store_in_doc.id,
                vendor: store_in_doc.vendor,
                shift: store_in_doc.shift,
                net_value: store_in_doc.net_value,
                paid_up: store_in_doc.net_value,
                payment_method: store_in_doc.payment_method,
                safe: store_in_doc.safe,
                invoice_code: store_in_doc.number,
                total_discount: store_in_doc.total_discount,
                total_tax: store_in_doc.total_tax,
                current_book_list: store_in_doc.items,
                source_type: {
                  id: 1,
                  en: "Stores In / Purchase Invoice",
                  ar: "إذن وارد / فاتورة شراء"
                },
                active: true
              };
              $scope.addAccountInvoice($scope.account_invoices)
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

  $scope.delete = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/delete",
      data: {
        _id: $scope.store_in._id,
        name: $scope.store_in.name
      }
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
          $scope.store_in.items.unshift({
            image_url: $scope.item.image_url,
            name: _size.item_name,
            size: _size.size,
            barcode: _size.barcode,
            average_cost: _size.average_cost,
            count: _size.count,
            cost: _size.cost,
            price: _size.price,
            discount: _size.discount,
            total: _size.total,
            current_count: _size.current_count,
            ticket_code: _size.ticket_code,
          });
        }
      });

      $scope.calc();
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
        size.total = (site.toNumber(size.cost) * site.toNumber(size.count)) - discount;
      }
      $scope.calc();
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
        url: "/api/stores_items/name_all",
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
                    _size.item_name = _item.name
                    _size.store = $scope.store_in.store
                    _size.count = 1
                    _size.total = _size.count * _size.cost
                    if (_size.branches_list && _size.branches_list.length > 0) {

                      _size.branches_list.forEach(_branch => {          
                        if (_branch.code == '##session.branch.code##') {
                          if (_branch.stores_list && _branch.stores_list.length > 0) {
                            
                            _branch.stores_list.forEach(_store => {
                              if (_store.store && _store.store.id == $scope.store_in.store.id){                  
                                _size.store_count = _store.current_count
                              }
                            })
                          } else _size.store_count = 0
                        } else _size.store_count = 0
                      });
                    } else _size.store_count = 0

                    foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode == _size.barcode);

                    if (!foundSize) $scope.item.sizes.unshift(_size);
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

    $scope.item.item_name.sizes.forEach(_item => {
      _item.item_name = $scope.item.item_name.name
      _item.store = $scope.store_in.store
      _item.count = 1;
      _item.total = _item.count * _item.cost
      if (_item.branches_list && _item.branches_list.length > 0) {

        _item.branches_list.forEach(_branch => {          
          if (_branch.code == '##session.branch.code##') {
            if (_branch.stores_list && _branch.stores_list.length > 0) {
              
              _branch.stores_list.forEach(_store => {
                if (_store.store && _store.store.id == $scope.store_in.store.id){                  
                  _item.store_count = _store.current_count
                }
              })
            } else _item.store_count = 0
          } else _item.store_count = 0
        });
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
        url: "/api/stores_items/name_all",
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
                  _size.store = $scope.store_in.store;
                  _size.count = 1;
                  _size.discount = _size.discount;
                  _size.total = _size.count * _size.cost;
                  foundSize = $scope.store_in.items.some(_itemSize => _itemSize.barcode == _size.barcode);
                  if (!foundSize)
                    $scope.store_in.items.unshift(_size);
                }
              });
              if (foundSize) $scope.error = '##word.dublicate_item##';

              $scope.calc();
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

  /*  $scope.getItem = function () {
     if ($scope.item.item_name) {
       console.log("Aaaaaaaaaaaaaaaaaaaaaaaaaaa");
       
       $http({
         method: "POST",
         url: "/api/stores_items/all",
         data: {
           where: {
             name: $scope.item.item_name.name
           }
         }
       }).then(
         function (response) {
           $scope.busy = false;
           if (response.data.done) {
             if (response.data.list.length > 0) {
               $('#public_count').focus();
               response.data.list[0].sizes.forEach(itm => {
                 itm.count = 0;
               });
               $scope.item = response.data.list[0];
             } else {
               $scope.item = {
                 sizes: [],
                 name: $scope.item.item_name.name
               };
               $('#item_name').focus();
             }
           } else {
             $scope.error = response.data.error;
             $scope.item = {
               sizes: []
             };
           }
         },
         function (err) {
           console.log(err);
         }
       );
   
     }
   }; */

  $scope.edit = function (store_in) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_in);
        $scope.store_in = {};
        site.showModal('#updateStoreInModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function () {
    $scope.error = '';
    const v = site.validated();
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
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
  $scope.loadSafes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {
        select: {
          id: 1,
          name: 1,
          number: 1
        }
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
  /*  $scope.loadStores_In = function () {
     $scope.error = '';
     $scope.busy = true;
     $http({
       method: "POST",
       url: "/api/stores_in/all",
       data: {
         select: {
           id: 1,
           name: 1,
           items: 1
         }
       }
     }).then(
       function (response) {
         $scope.busy = false;
         if (response.data.done) {
           $scope.stores_in = response.data.list;
         }
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
     )
   }; */

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

    if ($scope.search.vendor && $scope.search.vendor.id) {
      where['vendor.id'] = $scope.search.vendor.id;
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
        $gte: parseFloat($scope.search.total_valueGt)
      };
    }

    if ($scope.search.total_valueLt) {
      where['total_value'] = {
        $lte: parseFloat($scope.search.total_valueLt)
      };
    }

    if ($scope.search.total_valueGt && $scope.search.total_valueLt) {
      where['total_value'] = {
        $gte: parseFloat($scope.search.total_valueGt),
        $lte: parseFloat($scope.search.total_valueLt)
      };
    }


    $scope.loadAll(where);
    site.hideModal('#StoresInSearchModal');
    $scope.search = {};
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

  /*   $scope.loadStores_In();
   */

  $scope.getSafeBySetting = function () {
    $scope.error = '';
    if ($scope.store_in.type.id == 1) {
      if ($scope.defaultSettings.accounting) {
        if ($scope.defaultSettings.accounting.safe) {
          $scope.store_in.safe = $scope.defaultSettings.accounting.safe
        }
      }
    }
  };

  $scope.loadItemSize = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.itemSizeList = [];
    $http({
      method: "POST",
      url: "/api/stores_items/sizes_all",
      data: {
        select: { discount: 1, barcode: 1, size: 1, id: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itemSizeList = response.data.list;
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
  $scope.getPaymentMethodList();
  $scope.loadTax_Types();
  $scope.loadItemSize();
  $scope.loadDiscount_Types();
  $scope.getDefaultSettings();
  $scope.loadAll({ date: new Date() });
  $scope.loadSafes();
});