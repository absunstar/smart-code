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

  let y = new Date().getFullYear().toString()
  let m = new Date().getMonth().toString()
  let d = new Date().getDate().toString()


  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  $scope.displayAccountInvoice = function (store_in) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: store_in.id,
          vendor: store_in.vendor,
          total_value_added: store_in.total_value_added,
          invoice_type: store_in.type,
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

    $http({
      method: "POST",
      url: "/api/account_invoices/add",
      data: account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response) {
          $scope.account_invoices = response.data.doc;
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


      if ($scope.account_invoices.vendor)
        obj_print.data.push({
          type: 'text2',
          value2: $scope.account_invoices.vendor.name_ar,
          value: 'Vendor'
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

      if ($scope.account_invoices.total_remain) {
        obj_print.data.push({
          type: 'text2b',
          value2: site.addSubZero($scope.account_invoices.total_remain, 2),
          value: "Required to pay"
        });
      }

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
    $timeout(() => {
      obj.total_value = 0;
      obj.net_value = obj.net_value || 0;

      if (obj.items) {

        obj.total_value_added = 0;
        obj.items.forEach(_itm => {
          obj.total_value += site.toNumber(_itm.total);
          _itm.total_v_a = site.toNumber(_itm.value_added) * (_itm.cost * _itm.count) / 100;
          _itm.total_v_a = site.toNumber(_itm.total_v_a);
          obj.total_value_added += _itm.total_v_a;

        });
        obj.total_value_added = site.toNumber(obj.total_value_added);
      };

      if (obj.type && obj.type.id !== 4) {
        obj.total_tax = 0;
        obj.total_discount = 0;
      };

      if (obj.taxes)
        obj.taxes.map(tx => obj.total_tax += (obj.total_value * site.toNumber(tx.value) / 100));


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
      };

      obj.net_value = site.toNumber(obj.net_value);

      if (obj.currency) {
        $scope.amount_currency = obj.net_value / site.toNumber(obj.currency.ex_rate);
        $scope.amount_currency = site.toNumber($scope.amount_currency);
        obj.paid_up = $scope.amount_currency;
      }

      $scope.discount = {
        type: 'number'
      };

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
    $scope.store_in.items.splice($scope.store_in.items.indexOf(itm), 1);
    $scope.calcSize(itm);

  };

  $scope.selectItems = function () {

    if (!$scope.store_in.store) {
      $scope.error = '##word.err_store_select##';
    } else if (!$scope.store_in.type) {
      $scope.error = '##word.err_transaction_type##';
    } else site.showModal('#selectItemsModal')

  };


  $scope.exitPatchReturnModal = function (itm) {
    let bigger = false;
    let count = 0;

    itm.patch_list.forEach(_pl => {
      if (_pl.count > _pl.current_count) bigger = true;
    });


    itm.patch_list.map(p => count += p.count)
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


  $scope.patchesList = function (itm) {
    $scope.error = '';

    $scope.item_patch = itm;

    if ($scope.store_in.type && $scope.store_in.type.id == 4) {



      site.showModal('#patchesListReturnModal');

    } else {


      if (!$scope.item_patch.patch_list) {

        $scope.item_patch.patch_list = [{
          patch: y + m + d + '001' + itm.validit,
          production_date: new Date(),
          expiry_date: new Date(addDays(new Date(), itm.validit)),
          count: itm.count,
          validit: itm.validit

        }];

      } else if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length == 1) {
        $scope.item_patch.patch_list[0].count = itm.count
      }

      site.showModal('#patchesListModal');

    }
  };

  $scope.viewPatchesList = function (itm) {
    $scope.error = '';
    $scope.item_patch = itm;

    site.showModal('#patchesListViewModal');

  };

  $scope.addNewPAtch = function (itm) {
    itm.patch_list.unshift({
      patch: y + m + d + '00' + (itm.patch_list.length + 1) + itm.validit.toString(),
      production_date: new Date(),
      expiry_date: new Date(addDays(new Date(), itm.validit)),
      validit: itm.validit,
      count: 0
    })
  };

  $scope.changeDate = function (i) {
    i.expiry_date = new Date(addDays(i.production_date, i.validit))
  };

  $scope.exitPatchModal = function (itm) {
    let count = 0;

    itm.patch_list.map(p => count += p.count)

    if (itm.count == count) {
      site.hideModal('#patchesListModal');
      $scope.error = '';

    } else $scope.error = '##word.err_patch_count##';

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
                $scope.store_in.currency = $scope.currencySetting;
                if ($scope.defaultSettings.accounting.payment_method) {
                  $scope.store_in.payment_method = $scope.defaultSettings.accounting.payment_method;
                  $scope.loadSafes($scope.store_in.payment_method, $scope.store_in.currency);
                  if ($scope.store_in.payment_method && $scope.store_in.payment_method.id == 1)
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

    if (new Date($scope.store_in.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };

    if ($scope.store_in.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    if ($scope.store_in.type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
      if (!$scope.store_in.safe) {
        $scope.error = "##word.nosafe_warning##";
        return;
      }
    }

    let max_discount = false;
    let returned_count = false;
    let patchCount = false;
    let notExistCount = false;
    let patch_list = [];

    if ($scope.store_in.items && $scope.store_in.items.length > 0) {

      notExistCount = $scope.store_in.items.some(_iz => _iz.count < 1);

      $scope.store_in.items.forEach(_itemSize => {
        if (_itemSize.discount.value > _itemSize.discount.max)
          max_discount = true;
        if (_itemSize.count > _itemSize.r_count) returned_count = true;


        if (_itemSize.work_patch) {

          if (_itemSize.patch_list && _itemSize.patch_list.length > 0) {

            let c = 0;
            _itemSize.patch_list.map(p => c += p.count)

            if (_itemSize.count != c) {
              patchCount = true;
              patch_list.push(_itemSize.barcode)
            }

          } else {
            _itemSize.patch_list = [{
              patch: y + m + d + '001' + _itemSize.validit,
              production_date: new Date(),
              expiry_date: new Date(addDays(new Date(), _itemSize.validit)),
              count: _itemSize.count,
              validit: _itemSize.validit
            }];
          }
        }


      });
    }

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

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    if (patchCount) {
      $scope.error = `##word.err_patch_count##   ( ${patch_list.join('-')} )`;
      return;
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
            if (($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {

              let account_invoices = {
                image_url: '/images/account_invoices.png',
                date: response.data.doc.date,
                invoice_id: response.data.doc.id,
                invoice_type: response.data.doc.type,
                vendor: response.data.doc.vendor,
                total_value_added: response.data.doc.total_value_added,
                shift: response.data.doc.shift,
                net_value: response.data.doc.net_value,
                currency: response.data.doc.currency,
                paid_up: response.data.doc.paid_up || 0,
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

            $scope.loadAll();
            $scope.newStoreIn();

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
          $scope.store_in.items.forEach(_item => {
            if (!_item.total_v_a) {

              _item.total_v_a = site.toNumber(_item.value_added) * (_item.price * _item.count) / 100;
            }
          });

          $scope.store_in.total_value = $scope.store_in.total_value - $scope.store_in.total_value_added;
          if ($scope.currencySetting) {

            site.strings['currency'].ar = ' ' + $scope.currencySetting.name + ' ';
            site.strings['from100'].ar = ' ' + $scope.currencySetting.minor_currency + ' ';
          }
          $scope.store_in.net_value2 = site.stringfiy($scope.store_in.net_value);
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

  $scope.addToItems = function () {
    $scope.error = '';
    if ($scope.store_in.type) {
      let foundSize = false;

      if ($scope.item.sizes && $scope.item.sizes.length > 0)
        $scope.item.sizes.forEach(_size => {
          foundSize = $scope.store_in.items.some(_itemSize => _itemSize.barcode === _size.barcode);
          if (_size.count > 0 && !foundSize) {

            let discount = 0;
            _size.value_added = site.toNumber(_size.value_added);
            _size.total_v_a = _size.value_added * (_size.cost * _size.count) / 100;
            _size.total_v_a = site.toNumber(_size.total_v_a);

            if (_size.count) {
              if (_size.discount.type == 'number')
                discount = (_size.discount.value || 0) * _size.count;
              else if (_size.discount.type == 'percent')
                discount = (_size.discount.value || 0) * (_size.cost * _size.count) / 100;

              _size.total = (site.toNumber(_size.total * _size.count) - discount + _size.total_v_a);
              _size.total = site.toNumber(_size.total);

            }
            $scope.store_in.items.push({
              image_url: $scope.item.image_url,
              name: _size.name,
              size: _size.size,
              value_added: _size.value_added,
              total_v_a: _size.total_v_a,
              item_group: _size.item_group,
              size_en: _size.size_en,
              work_patch: _size.work_patch,
              validit: _size.validit,
              size_units_list: _size.size_units_list,
              unit: _size.unit,
              cost: _size.unit.cost,
              price: _size.unit.price,
              average_cost: _size.unit.average_cost,
              item_complex: _size.item_complex,
              discount: _size.unit.discount,
              barcode: _size.barcode,
              count: _size.count,
              discount: _size.discount,
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

  $scope.calcSize = function (calc_size) {
    $scope.error = '';

    setTimeout(() => {
      let discount = 0;
      calc_size.value_added = site.toNumber(calc_size.value_added);
      calc_size.total_v_a = calc_size.value_added * (calc_size.cost * calc_size.count) / 100;
      calc_size.total_v_a = site.toNumber(calc_size.total_v_a);

      if (calc_size.count) {
        if (calc_size.discount.type == 'number')
          discount = calc_size.discount.value * calc_size.count;
        else if (calc_size.discount.type == 'percent')
          discount = calc_size.discount.value * (calc_size.cost * calc_size.count) / 100;
        calc_size.total = ((site.toNumber(calc_size.cost) * site.toNumber(calc_size.count)) - discount + calc_size.total_v_a);

        calc_size.total = site.toNumber(calc_size.total);
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

                if (_item.sizes && _item.sizes.length > 0)
                  _item.sizes.forEach(_size => {
                    let foundHold = false;
                    let foundUnit = false;
                    let indxUnit = 0;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach((_unit, i) => {
                        if ((_unit.barcode === $scope.item.search_item_name) && typeof _unit.barcode == 'string') {
                          foundUnit = true;
                        }
                        if (_unit.id == _item.main_unit.id)
                          indxUnit = i;
                      });

                    if ((_size.barcode === $scope.item.search_item_name) || (_size.size_en && _size.size_en.contains($scope.item.search_item_name)) || (_size.size && _size.size.contains($scope.item.search_item_name)) || foundUnit) {
                      _size.name = _item.name;
                      _size.item_group = _item.item_group;
                      _size.store = $scope.store_in.store;
                      _size.count = 1;
                      _size.value_added = _size.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;
                      _size.unit = _size.size_units_list[indxUnit];
                      _size.discount = _size.size_units_list[indxUnit].discount;
                      _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                      _size.cost = _size.size_units_list[indxUnit].cost;
                      _size.price = _size.size_units_list[indxUnit].price;
                      _size.total = _size.count * _size.cost;

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
                                if ($scope.store_in.store && _store.store.id == $scope.store_in.store.id) {
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

                      if (!foundSize && !foundHold) $scope.item.sizes.unshift(_size);
                    };
                  });
              });

              if (!foundSize)
                $scope.itemsNameList = response.data.list;
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

  $scope.itemsStoresIn = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.name && $scope.item.name.sizes && $scope.item.name.sizes.length > 0)
      $scope.item.name.sizes.forEach(_item => {
        let foundHold = false;
        _item.name = $scope.item.name.name;
        _item.item_group = $scope.item.name.item_group;
        _item.store = $scope.store_in.store;
        _item.count = 1;
        _item.value_added = _item.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added;

        let indxUnit = 0;
        if (_item.size_units_list && _item.size_units_list.length > 0) {
          indxUnit = _item.size_units_list.findIndex(_unit => _unit.id == $scope.item.name.main_unit.id);

          _item.unit = _item.size_units_list[indxUnit];
          _item.discount = _item.size_units_list[indxUnit].discount;
          _item.average_cost = _item.size_units_list[indxUnit].average_cost;
          _item.cost = _item.size_units_list[indxUnit].cost;
          _item.price = _item.size_units_list[indxUnit].price;
        }

        _item.total = _item.count * _item.cost;

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
                  if ($scope.store_in.store && _store.store.id == $scope.store_in.store.id) {
                    foundStore = true;
                    indxStore = i;
                    if (_store.hold) foundHold = true;
                  }
                });
                if (foundStore)
                  _item.store_count = _item.branches_list[indxBranch].stores_list[indxStore].current_count;
              } else _item.store_count = 0;
            } else _item.store_count = 0;
          } else _item.store_count = 0;
        } else _item.store_count = 0;
        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _item.barcode);
        if (!foundSize && !foundHold)
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

              if (response.data.list[0].sizes && response.data.list[0].sizes.length > 0)
                response.data.list[0].sizes.forEach(_size => {
                  let foundHold = false;
                  let foundUnit = false;
                  let indxUnit = 0;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach((_unit, i) => {
                      if ((_unit.barcode === $scope.search_barcode) && typeof _unit.barcode == 'string') {
                        foundUnit = true;
                      }

                      if (_unit.id == response.data.list[0].main_unit.id)
                        indxUnit = i;
                    });

                  if (_size.branches_list && _size.branches_list.length > 0)
                    _size.branches_list.forEach(_branch => {
                      if (_branch.code == '##session.branch.code##')
                        _branch.stores_list.forEach(_store => {
                          if ($scope.store_in.store && _store.store && _store.store.id == $scope.store_in.store.id) {
                            if (_store.hold) foundHold = true;
                          }
                        });
                    });

                  if ((_size.barcode === $scope.search_barcode) || foundUnit) {

                    _size.name = response.data.list[0].name;
                    _size.item_group = response.data.list[0].item_group;
                    _size.store = $scope.store_in.store;
                    _size.count = 1;
                    _size.value_added = _size.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;
                    _size.unit = _size.size_units_list[indxUnit];
                    _size.discount = _size.size_units_list[indxUnit].discount;
                    _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                    _size.cost = _size.size_units_list[indxUnit].cost;
                    _size.price = _size.size_units_list[indxUnit].price;
                    _size.total = _size.count * _size.cost;

                    foundSize = $scope.store_in.items.some(_itemSize => _itemSize.barcode === _size.barcode);

                    if (!foundSize && !foundHold)
                      $scope.store_in.items.unshift(_size);
                    else if (foundSize) {
                      $scope.store_in.items.forEach(_item => {
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

    if (new Date($scope.store_in.date) > new Date()) {

      $scope.error = "##word.date_exceed##";
      return;

    };


    if ($scope.store_in.type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
      if (!$scope.store_in.safe) {
        $scope.error = "##word.nosafe_warning##";
        return;
      }
    }

    if ($scope.store_in.paid_up > $scope.amount_currency) {
      $scope.error = "##word.err_net_value##";
      return;
    }

    let max_discount = false;
    let returned_count = false;
    let patchCount = false;
    let notExistCount = false;
    let patch_list = [];

    if ($scope.store_in.items && $scope.store_in.items.length > 0) {

      notExistCount = $scope.store_in.items.some(_iz => _iz.count < 1);

      $scope.store_in.items.forEach(_itemSize => {
        if (_itemSize.discount.value > _itemSize.discount.max)
          max_discount = true;
        if (_itemSize.count > _itemSize.r_count) returned_count = true;


        if (_itemSize.work_patch) {

          if (_itemSize.patch_list && _itemSize.patch_list.length > 0) {

            let c = 0;
            _itemSize.patch_list.map(p => c += p.count)

            if (_itemSize.count != c) {
              patchCount = true;
              patch_list.push(_itemSize.barcode)
            }

          } else {
            _itemSize.patch_list = [{
              patch: y + m + d + '001' + _itemSize.validit,
              production_date: new Date(),
              expiry_date: new Date(addDays(new Date(), _itemSize.validit)),
              count: _itemSize.count,
              validit: _itemSize.validit
            }];
          }
        }

      });
    }

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

    if (notExistCount) {
      $scope.error = "##word.err_exist_count##";
      return;
    };

    if (patchCount) {
      $scope.error = `##word.err_patch_count##   ( ${patch_list.join('-')} )`;
      return;
    };


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

  $scope.delete = function (store_in) {
    $scope.error = '';

    if (store_in.return_paid && store_in.net_value != store_in.return_paid.net_value) {
      $scope.error = '##word.err_delete_return##';
      return;
    };
    $scope.getStockItems(store_in.items, callback => {

      if (!callback || !store_in.posting) {

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
      } else {
        $scope.error = '##word.err_stock_item##';
      }
    })
  };


  $scope.posting = function (store_in) {
    $scope.error = '';

    if (!store_in.posting && store_in.return_paid && store_in.net_value != store_in.return_paid.net_value) {
      store_in.posting = true;
      $scope.error = '##word.err_unpost_return##';

      return;
    };

    let notExistCount = store_in.items.some(_iz => _iz.count < 1);

    if (notExistCount) {
      if (store_in.posting) store_in.posting = false;
      else store_in.posting = true;

      $scope.error = "##word.err_exist_count##";
      return;
    };

    $scope.getStockItems(store_in.items, callback => {

      if (!callback) {

        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/stores_in/posting",
          data: store_in
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              $scope.loadAll();
            } else {
              $scope.error = '##word.error##';
              if (response.data.error.like('*OverDraft Not*')) {
                $scope.error = "##word.overdraft_not_active##"
                store_in.posting = !store_in.posting;
              }
            }
          },
          function (err) {
            console.log(err);
          }
        )
      } else {
        store_in.posting = !store_in.posting;
        $scope.error = '##word.err_stock_item##';
      }
    })
  };


  $scope.postingAll = function (store_in_all) {
    $scope.error = '';

    let _store_in_all = store_in_all.reverse();

    let notExist = false;
    let notExistCountList = [];
    _store_in_all.forEach(_stIn => {
      let notExistCount = _stIn.items.some(_iz => _iz.count < 1);
      if (notExistCount) {
        notExist = true;
        notExistCountList.push(_stIn.number)
      }
    });


    if (notExist) {

      $scope.error = `##word.err_exist_count_invoice##   ( ${notExistCountList.join('-')} )`;
      return;
    } else {


      for (let i = 0; i < _store_in_all.length; i++) {
        setTimeout(() => {
          if (!_store_in_all[i].posting) {


            $scope.getStockItems(_store_in_all[i].items, callback => {

              if (!callback) {

                _store_in_all[i].posting = true;

                $http({
                  method: "POST",
                  url: "/api/stores_in/posting",
                  data: _store_in_all[i]
                }).then(
                  function (response) {
                    if (response.data.done) {

                    } else {
                      $scope.error = '##word.error##';
                      if (response.data.error.like('*OverDraft Not*')) {
                        $scope.error = "##word.overdraft_not_active##"
                        _store_in_all[i].posting = false;
                      }
                    }
                  },
                  function (err) {
                    console.log(err);
                  }
                )
              } else {
                $scope.error = '##word.err_stock_item##';
              }

            });

          };
        }, 1000 * i);

      }
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

  $scope.loadSafes = function (method, currency) {
    $scope.error = '';
    $scope.busy = true;

    if (currency && currency.id && method && method.id) {

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
    }
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
          name_en: 1,
          balance: 1,
          tax_identification_number: 1
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

  $scope.showReturnedStoreIn = function (ev) {
    $scope.error = '';
    $scope.list = {};
    if (ev.which === 13) {
      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/stores_in/all",
        data: {
          search: $scope.storesInSearch,
          where: {
            'posting': true,
            'return_paid.net_value': { $gt: 0 }
          }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.storesInlist = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    }
  };


  $scope.selectReturnedStoreIn = function (i) {

    if ($scope.store_in && i.return_paid) {

      $scope.store_in.retured_number = i.number;
      $scope.store_in.total_discount = i.return_paid.total_discount;
      $scope.store_in.total_value_added = i.return_paid.total_value_added;
      $scope.store_in.total_tax = i.return_paid.total_tax;
      $scope.store_in.total_value = i.return_paid.total_value;
      $scope.store_in.net_value = i.return_paid.net_value;

      $scope.store_in.items = [];
      if (i.return_paid.items && i.return_paid.items.length > 0)
        i.return_paid.items.forEach(_item => {
          _item.r_count = _item.count;

          if (_item.patch_list && _item.patch_list.length > 0) {

            _item.patch_list.forEach(_p => {
              _p.current_count = _p.count;
              _p.count = 0;
            });
          };

          if (_item.count > 0) $scope.store_in.items.push(_item);
        });

      if ($scope.store_in.currency) {
        $scope.amount_currency = site.toNumber($scope.store_in.net_value) / site.toNumber($scope.store_in.currency.ex_rate);
        $scope.amount_currency = site.toNumber($scope.amount_currency);
        $scope.store_in.paid_up = $scope.amount_currency;
      }
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
      if ($scope.store_in.type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting.create_invoice_auto) {
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

  $scope.loadStoresInTypes();
  $scope.loadVendors();
  $scope.loadStores();
  $scope.loadCategories();
  $scope.getPaymentMethodList();
  $scope.loadTax_Types();
  $scope.loadDiscount_Types();
  $scope.getDefaultSettings();
  $scope.loadCurrencies();
  $scope.loadAll({
    date: new Date()
  });
});