app.controller('stores_in', function ($scope, $http, $timeout) {
  $scope._search = {};
  $scope.thermal = {};
  $scope.invList = [];
  $scope.store_in = {
    discountes: [],
    taxes: [],
  };
  $scope.search = {};
  $scope.item = {
    sizes: [],
  };
  let y = new Date().getFullYear().toString();
  let m = new Date().getMonth().toString();
  let d = new Date().getDate().toString();

  $scope.addDays = function (date, days) {
    let result = new Date(date);
    result.setTime(result.getTime() + days * 24 * 60 * 60 * 1000);
    return result;
  };

  $scope.displayAccountInvoice = function (store_in) {
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          invoice_id: store_in.id,
          vendor: store_in.vendor,
          payment_type: store_in.payment_type,
          total_value_added: store_in.total_value_added,
          invoice_type: store_in.type,
          shift: shift,
          net_value: store_in.net_value,
          paid_up: 0,
          invoice_code: store_in.code,
          total_discount: store_in.total_discount,
          total_tax: store_in.total_tax,
          items: store_in.items,
          source_type: {
            id: 1,
            en: 'Purchases Store',
            ar: 'المشتريات المخزنية',
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
          $scope.account_invoices.amount_currency = site.toNumber($scope.account_invoices.net_value) / site.toNumber($scope.account_invoices.currency.ex_rate);
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

    if (account_invoices.paid_up < account_invoices.amount_currency && account_invoices.payment_type.id == 1) {
      $scope.busy = false;
      $scope.error = '##word.amount_must_paid_full##';
      return;
    }

    if (account_invoices.paid_up > 0 && !account_invoices.safe) {
      $scope.busy = false;
      $scope.error = '##word.should_select_safe##';
      return;
    } else if (account_invoices.paid_up > account_invoices.amount_currency) {
      $scope.busy = false;
      $scope.error = '##word.err_net_value##';
      return;
    }

    if ($scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.work_posting && !$scope.defaultSettings.accounting.link_warehouse_account_invoices)
      account_invoices.posting = false;
    else account_invoices.posting = true;

    $http({
      method: 'POST',
      url: '/api/account_invoices/add',
      data: account_invoices,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (account_invoices.source_type.id == 1 && account_invoices.paid_up > 0) {
            account_invoices.ref_invoice_id = response.data.doc.id;
            if (account_invoices.invoice_type.id == 1) {
              account_invoices.out_type = {
                id: 2,
                en: 'purchase invoice',
                ar: 'فاتورة مشتريات',
              };
              account_invoices.source_type = {
                id: 9,
                en: 'Amount Out',
                ar: 'سند صرف',
              };

              $scope.addAccountInvoice(account_invoices);
            } else if (account_invoices.invoice_type.id == 4) {
              account_invoices.out_type = {
                id: 3,
                en: 'Return sales invoice',
                ar: 'مرتجع فاتورة مبيعات',
              };
              account_invoices.source_type = {
                id: 8,
                en: 'Amount In',
                ar: 'سند قبض',
              };
              $scope.addAccountInvoice(account_invoices);
            }
          }
          site.hideModal('#accountInvoiceModal');

          $scope.account_invoices = {};

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
  };
  /*  $scope.thermalPrint = function (obj) {
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
      let printerName = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();
      if ($scope.user.printer_path && $scope.user.printer_path.id) {
        printerName = $scope.user.printer_path.ip.name.trim();
      }

      $timeout(() => {
        site.printAsImage(
          {
            selector: '#thermalPrint',
            ip: '127.0.0.1',
            port: '60080',
            printer: printerName,
          },
          () => {
            $timeout(() => {
              $('#thermalPrint').addClass('hidden');
            }, 2000);
          }
        );
      }, 1000 * 3);
    } else {
      $scope.error = '##word.thermal_printer_must_select##';
    }

    $scope.busy = false;
  }; */

  $scope.print = function (type) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;
    $('#storeInDetails').removeClass('hidden');

    if ($scope.store_in.items.length > 7) {
      $scope.invList = [];
      let inv_length = $scope.store_in.items.length / 7;
      inv_length = parseInt(inv_length);
      let ramain_items = $scope.store_in.items.length - inv_length * 7;

      if (ramain_items) {
        inv_length += 1;
      }

      for (let i_inv = 0; i_inv < inv_length; i_inv++) {
        let s_o = { ...$scope.store_in };

        s_o.items = [];
        $scope.store_in.items.forEach((itm, i) => {
          itm.$index = i + 1;
          if (i < (i_inv + 1) * 7 && !itm.$done_inv) {
            itm.$done_inv = true;
            s_o.items.push(itm);
          }
        });

        $scope.invList.push(s_o);
      }
    } else {
      $scope.store_in.items.forEach((_item, i) => {
        _item.$index = i + 1;
      });
      $scope.invList = [{ ...$scope.store_in }];
    }

    $scope.localPrint = function () {
      if (document.querySelectorAll('.qrcode-a4').length !== $scope.invList.length) {
        $timeout(() => {
          $scope.localPrint();
        }, 300);
        return;
      }

      if ($scope.defaultSettings.printer_program.place_qr) {
        if ($scope.defaultSettings.printer_program.place_qr.id == 1) {
          site.qrcode({
            width: 140,
            height: 140,
            selector: document.querySelectorAll('.qrcode-a4')[$scope.invList.length - 1],
            text: document.location.protocol + '//' + document.location.hostname + `/qr_storein?id=${$scope.store_in.id}`,
          });
        } else if ($scope.defaultSettings.printer_program.place_qr.id == 2) {
          if ($scope.defaultSettings.printer_program.country_qr && $scope.defaultSettings.printer_program.country_qr.id == 2) {
            let qrString = {
              vat_number: '##session.company.tax_number##',
              time: new Date($scope.store_in.date).toISOString(),
              total: $scope.store_in.net_value,
              vat_total: $scope.store_in.total_value_added,
            };
            if ($scope.defaultSettings.printer_program.thermal_lang.id == 1 || ($scope.defaultSettings.printer_program.thermal_lang.id == 3 && '##session.lang##' == 'ar')) {
              qrString.name = '##session.company.name_ar##';
            } else if ($scope.defaultSettings.printer_program.thermal_lang.id == 2 || ($scope.defaultSettings.printer_program.thermal_lang.id == 3 && '##session.lang##' == 'en')) {
              qrString.name = '##session.company.name_en##';
            }
            qrString.name = '##session.company.name_en##';
            site.zakat2(
              {
                name: qrString.name,
                vat_number: qrString.vat_number,
                time: qrString.time,
                total: qrString.total.toString(),
                vat_total: qrString.vat_total.toString(),
              },
              (data) => {
                site.qrcode({ width: 140, height: 140, selector: document.querySelectorAll('.qrcode-a4')[$scope.invList.length - 1], text: data.value });
              }
            );
          } else {
            let datetime = new Date($scope.store_in.date);
            let formatted_date =
              datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' + datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds();
            let qrString = `[${'##session.company.name_ar##'}]\nرقم ضريبي : [${$scope.defaultSettings.printer_program.tax_number}]\nرقم الفاتورة :[${
              $scope.store_in.code
            }]\nتاريخ : [${formatted_date}]\nضريبة القيمة المضافة : [${$scope.store_in.total_value_added}]\nالصافي : [${$scope.store_in.net_value}]`;

            site.qrcode({ width: 140, height: 140, selector: document.querySelectorAll('.qrcode-a4')[$scope.invList.length - 1], text: qrString });
          }
        }
      }
      let printerName = '';
      if (type == 'a4') {
        if ($scope.defaultSettings.printer_program.a4_printer) {
          printerName = $scope.defaultSettings.printer_program.a4_printer.ip.name.trim();
        } else {
          $scope.error = '##word.a4_printer_must_select##';
          return;
        }
        if ($scope.user.a4_printer && $scope.user.a4_printer.id) {
          printerName = $scope.user.a4_printer.ip.name.trim();
        }
      } else if (type === 'pdf') {
        if ($scope.defaultSettings.printer_program.pdf_printer) {
          printerName = $scope.defaultSettings.printer_program.pdf_printer.ip.name.trim();
        } else {
          $scope.error = '##word.pdf_printer_must_select##';
          return;
        }
      }

      $timeout(() => {
        site.print({
          selector: '#storeInDetails',
          ip: '127.0.0.1',
          port: '60080',
          pageSize: 'A4',
          printer: printerName,
        });
      }, 500);
    };

    $scope.localPrint();

    $scope.busy = false;
    $timeout(() => {
      $('#storeInDetails').addClass('hidden');
    }, 8000);
  };

  $scope.thermalPrint = function (obj) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;
    if ($scope.defaultSettings.printer_program.printer_path) {
      $('#thermalPrint').removeClass('hidden');
      $scope.thermal = { ...obj };

      $scope.localPrint = function () {
        if ($scope.defaultSettings.printer_program.place_qr) {
          if ($scope.defaultSettings.printer_program.place_qr.id == 1) {
            site.qrcode({
              width: 140,
              height: 140,
              selector: document.querySelector('.qrcode'),
              text: document.location.protocol + '//' + document.location.hostname + `/qr_storeout?id=${$scope.thermal.id}`,
            });
          } else if ($scope.defaultSettings.printer_program.place_qr.id == 2) {
            if ($scope.defaultSettings.printer_program.country_qr && $scope.defaultSettings.printer_program.country_qr.id == 2) {
              let qrString = {
                vat_number: '##session.company.tax_number##',
                time: new Date($scope.thermal.date).toISOString(),
                total: $scope.thermal.net_value,
                vat_total: $scope.thermal.total_value_added,
              };
              if ($scope.defaultSettings.printer_program.thermal_lang.id == 1 || ($scope.defaultSettings.printer_program.thermal_lang.id == 3 && '##session.lang##' == 'ar')) {
                qrString.name = '##session.company.name_ar##';
              } else if ($scope.defaultSettings.printer_program.thermal_lang.id == 2 || ($scope.defaultSettings.printer_program.thermal_lang.id == 3 && '##session.lang##' == 'en')) {
                qrString.name = '##session.company.name_en##';
              }
              qrString.name = '##session.company.name_en##';
              site.zakat2(
                {
                  name: qrString.name,
                  vat_number: qrString.vat_number,
                  time: qrString.time,
                  total: qrString.total.toString(),
                  vat_total: qrString.vat_total.toString(),
                },
                (data) => {
                  site.qrcode({ width: 140, height: 140, selector: document.querySelector('.qrcode'), text: data.value });
                }
              );
            } else {
              let datetime = new Date($scope.thermal.date);
              let formatted_date =
                datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' + datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds();
              let qrString = `[${'##session.company.name_ar##'}]\nرقم ضريبي : [${$scope.defaultSettings.printer_program.tax_number}]\nرقم الفاتورة :[${
                $scope.thermal.code
              }]\nتاريخ : [${formatted_date}]\nضريبة القيمة المضافة : [${$scope.thermal.total_value_added}]\nالصافي : [${$scope.thermal.net_value}]`;
              site.qrcode({ width: 140, height: 140, selector: document.querySelector('.qrcode'), text: qrString });
            }
          }
        }
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

  $scope.addTax = function () {
    $scope.error = '';
    $scope.store_in.taxes = $scope.store_in.taxes || [];
    $scope.store_in.taxes.unshift({
      name_ar: $scope.tax.name_ar,
      name_en: $scope.tax.name_en,
      value: $scope.tax.value,
    });
    $scope.tax = {};
    $scope.calc($scope.store_in);
  };

  $scope.deleteTax = function (_tx) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_in.taxes.length; i++) {
      let tx = $scope.store_in.taxes[i];
      if (tx.name_ar == _tx.name_ar && tx.value == _tx.value) $scope.store_in.taxes.splice(i, 1);
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
        name_ar: $scope.discount.name_ar,
        name_en: $scope.discount.name_en,
        value: $scope.discount.value,
        type: $scope.discount.type,
      });
      $scope.calc($scope.store_in);
    }
  };

  $scope.deleteDiscount = function (_ds) {
    $scope.error = '';
    for (let i = 0; i < $scope.store_in.discountes.length; i++) {
      let ds = $scope.store_in.discountes[i];
      if (ds.name_ar == _ds.name_ar && ds.value == _ds.value && ds.type == _ds.type) $scope.store_in.discountes.splice(i, 1);
    }
    $scope.calc($scope.store_in);
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
    } else site.showModal('#selectItemsModal');
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

  $scope.patchesList = function (itm) {
    $scope.error = '';

    $scope.item_patch = itm;

    if ($scope.store_in.type && $scope.store_in.type.id == 4) {
      site.showModal('#patchesListReturnModal');
    } else {
      let mini_code = $scope.item_patch.barcode.slice(-3);
      let r_code = Math.floor(Math.random() * 1000 + 1);
      if (!$scope.item_patch.patch_list) {
        if ($scope.item_patch.work_serial) {
          $scope.item_patch.patch_list = [];
          for (let i = 0; i < $scope.item_patch.count; i++) {
            let r_code2 = Math.floor(Math.random() * 1000 + 1);

            $scope.item_patch.patch_list.push({
              patch: mini_code + r_code2 + ($scope.item_patch.patch_list.length + i),
              count: 1,
            });
          }
        } else {
          $scope.item_patch.patch_list = [
            {
              patch: mini_code + r_code + (itm.validit || '00') + 1,
              production_date: new Date(),
              expiry_date: new Date($scope.addDays(new Date(), itm.validit || 0)),
              count: itm.count,
              validit: itm.validit || 0,
            },
          ];
        }
      } else if ($scope.item_patch.patch_list && $scope.item_patch.patch_list.length == 1 && $scope.item_patch.work_patch) {
        $scope.item_patch.patch_list[0].count = itm.count;
      } else {
        if ($scope.item_patch.work_serial) {
          let count = $scope.item_patch.count - $scope.item_patch.patch_list.length;
          let r_code2 = Math.floor(Math.random() * 1000 + 1);
          for (let i = 0; i < count; i++) {
            $scope.item_patch.patch_list.unshift({
              patch: mini_code + r_code2 + i,
              count: 1,
            });
          }
        }
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
    let mini_code = itm.barcode.slice(-3);
    let r_code = Math.floor(Math.random() * 1000 + 1);

    itm.patch_list.unshift({
      patch: mini_code + r_code + (itm.patch_list.length + 1) + (itm.validit || '00'),
      production_date: new Date(),
      expiry_date: new Date($scope.addDays(new Date(), itm.validit || 0)),
      validit: itm.validit || 0,
      count: itm.work_serial ? 1 : 0,
    });
  };

  $scope.changeDate = function (i, str) {
    $timeout(() => {
      $scope.error = '';

      if (str == 'exp') {
        let diffTime = Math.abs(new Date(i.expiry_date) - new Date(i.production_date));
        i.validit = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else if (str == 'pro') {
        i.expiry_date = new Date($scope.addDays(i.production_date, i.validit || 0));
      }
    }, 250);
  };

  $scope.exitPatchModal = function (itm) {
    $scope.error = '';

    let count = 0;
    let errDate = false;
    let err_find_serial = false;

    itm.patch_list.forEach((_p) => {
      count += _p.count;

      if (new Date(_p.expiry_date) < new Date(_p.production_date)) {
        errDate = true;
      }
      if (!_p.patch) err_find_serial = true;
    });

    if (err_find_serial) {
      $scope.error = '##word.err_find_serial##';
    } else if (errDate) {
      $scope.error = '##word.err_patch_date##';
    } else if (itm.count === count) {
      site.hideModal('#patchesListModal');
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
        $scope.item = {};
        $scope.edit_price = false;
        $scope.store_in = {
          image_url: '/images/store_in.png',
          shift: shift,
          items: [],
          invoice: false,
          type: $scope.source_type,
          discountes: [],
          taxes: [],
          date: new Date(),
          supply_date: new Date(),
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings.vendor) $scope.store_in.vendor = $scope.defaultSettings.general_Settings.vendor;
          if (!$scope.defaultSettings.general_Settings.work_posting) $scope.store_in.posting = true;
        }

        if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_in.store = $scope.storesList.find((_store) => {
              return _store.id === $scope.defaultSettings.inventory.store.id;
            });

          if ($scope.defaultSettings.general_Settings.payment_type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4))
            $scope.store_in.payment_type = $scope.defaultSettings.general_Settings.payment_type;

          if ($scope.defaultSettings.accounting) {
            if (($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting.create_invoice_auto) {
              $scope.store_in.currency = $scope.currencySetting;
              if ($scope.defaultSettings.accounting.payment_method) {
                $scope.store_in.payment_method = $scope.defaultSettings.accounting.payment_method;
                $scope.loadSafes($scope.store_in.payment_method, $scope.store_in.currency);
                if ($scope.store_in.payment_method && $scope.store_in.payment_method.id == 1) $scope.store_in.safe = $scope.defaultSettings.accounting.safe_box;
                else $scope.store_in.safe = $scope.defaultSettings.accounting.safe_bank;
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
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.testPatches = function (storeIn, callback) {
    $scope.getSerialList(storeIn.items, (serial_list) => {
      let obj = {
        patchCount: false,
        errDate: false,
        exist_serial: false,
        not_patch: false,
        patch_list: [],
      };

      storeIn.items.forEach((_item) => {
        if (_item.size_units_list && _item.size_units_list.length > 0) {
          let count = 0;
          if (_item.patch_list && _item.patch_list.length > 0) {
            _item.patch_list.forEach((_pl) => {
              if (typeof _pl.count === 'number') {
                if (new Date(_pl.expiry_date) < new Date(_pl.production_date)) {
                  obj.errDate = true;
                }
                count += _pl.count;
              } else {
                obj.patchCount = true;
                obj.patch_list.push(_item.barcode);
              }

              if (serial_list && serial_list.length > 0) {
                serial_list.forEach((_s) => {
                  if (_s === _pl.patch && _item.work_serial) {
                    obj.exist_serial = true;
                    obj.patch_list.push(_pl.patch);
                  }
                });
              }
              if (!_pl.patch) {
                obj.not_patch = true;
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
    });
  };

  $scope.add = function () {
    $scope.error = '';

    const v = site.validated('#addStoreInModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.store_in.date) > new Date()) {
      $scope.error = '##word.date_exceed##';
      return;
    }

    if (!$scope.store_in.payment_type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4)) {
      $scope.error = '##word.must_choose_payment_type##';
      return;
    }

    if ($scope.store_in.payment_type) {
      if ($scope.store_in.paid_up > $scope.store_in.amount_currency) {
        $scope.error = '##word.err_net_value##';
        return;
      }

      if ($scope.store_in.type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
        if (!$scope.store_in.safe) {
          $scope.error = '##word.nosafe_warning##';
          return;
        }
      }

      if ($scope.store_in.paid_up < $scope.store_in.amount_currency && $scope.store_in.payment_type.id == 1) {
        $scope.error = '##word.amount_must_paid_full##';
        return;
      }
    } else {
      $scope.store_in.paid_up = undefined;
      $scope.store_in.safe = undefined;
      $scope.store_in.payment_method = undefined;
      $scope.store_in.currency = undefined;
    }

    let max_discount = false;
    let returned_count = false;
    let notExistCount = false;

    if ($scope.store_in.items && $scope.store_in.items.length > 0) {
      notExistCount = $scope.store_in.items.some((_iz) => _iz.count < 1);

      $scope.store_in.items.forEach((_itemSize) => {
        if (_itemSize.discount.value > _itemSize.discount.max) max_discount = true;
        if (_itemSize.count > _itemSize.r_count) returned_count = true;
      });

      if ($scope.defaultSettings.inventory && $scope.defaultSettings.inventory.dont_max_discount_items) {
        if (max_discount) {
          $scope.error = '##word.err_maximum_discount##';
          return;
        }
      }

      if ($scope.store_in.type.id == 4) {
        if (returned_count) {
          $scope.error = '##word.return_item_err##';
          return;
        }
      }

      if (notExistCount) {
        $scope.error = '##word.err_exist_count##';
        return;
      }

      $scope.testPatches($scope.store_in, (callback) => {
        if (callback.patchCount) {
          $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
          return;
        }

        if (callback.not_patch) {
          $scope.error = `##word.err_find_serial##   ( ${callback.patch_list.join('-')} )`;
          return;
        }

        if (callback.exist_serial && $scope.store_in.type.id !== 4) {
          $scope.error = `##word.serial_pre_existing##   ( ${callback.patch_list.join('-')} )`;
          return;
        }

        if (callback.errDate) {
          $scope.error = '##word.err_patch_date##';
          return;
        }

        $scope.financialYear($scope.store_in.date, (is_allowed_date) => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {
            if ($scope.account_invoices && $scope.account_invoices.payable_list && $scope.account_invoices.payable_list.length > 0) {
              for (let i = 0; i < $scope.account_invoices.payable_list.length; i++) {
                let p = $scope.account_invoices.payable_list[i];
                p.done = false;
                p.paid_up = 0;
                p.remain = p.value;
              }

              $scope.store_in.payable_list = $scope.account_invoices.payable_list;
            }

            $scope.busy = true;
            $http({
              method: 'POST',
              url: '/api/stores_in/add',
              data: $scope.store_in,
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  if (
                    ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) &&
                    $scope.defaultSettings.accounting &&
                    $scope.defaultSettings.accounting.create_invoice_auto &&
                    !$scope.defaultSettings.general_Settings.work_posting
                  ) {
                    /*   if (
                      $scope.defaultSettings.printer_program.auto_thermal_print
                    ) {
                      $scope.thermalPrint(response.data.doc);
                    } */

                    let account_invoices = {
                      image_url: '/images/account_invoices.png',
                      date: response.data.doc.date,
                      payable_list: response.data.doc.payable_list,
                      payment_type: response.data.doc.payment_type,
                      invoice_id: response.data.doc.id,
                      invoice_type: response.data.doc.type,
                      vendor: response.data.doc.vendor,
                      total_value_added: response.data.doc.total_value_added,
                      shift: response.data.doc.shift,
                      net_value: response.data.doc.net_value,
                      amount_currency: response.data.doc.amount_currency,
                      currency: response.data.doc.currency,
                      paid_up: response.data.doc.paid_up || 0,
                      payment_method: response.data.doc.payment_method,
                      safe: response.data.doc.safe,
                      invoice_code: response.data.doc.code,
                      total_discount: response.data.doc.total_discount,
                      total_tax: response.data.doc.total_tax,
                      items: response.data.doc.items,
                      source_type: {
                        id: 1,
                        en: 'Purchases Store',
                        ar: 'المشتريات المخزنية',
                      },
                      active: true,
                    };

                    $scope.addAccountInvoice(account_invoices);
                  }
                  $scope.loadAll({ date: new Date() });
                  $scope.newStoreIn();
                } else {
                  $scope.error = response.data.error;
                  if (response.data.error.like('*OverDraft Not*')) {
                    $scope.error = '##word.overdraft_not_active##';
                  } else if (response.data.error.like('*n`t Found Open Shi*')) {
                    $scope.error = '##word.open_shift_not_found##';
                  } else if (response.data.error.like('*n`t Open Perio*')) {
                    $scope.error = '##word.should_open_period##';
                  } else if (response.data.error.like('*Must Enter Code*')) {
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
      method: 'POST',
      url: '/api/stores_in/view',
      data: {
        _id: store_in._id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.store_in = response.data.doc;
          if ($scope.store_in.currency) {
            site.strings['currency'] = {
              ar: ' ' + $scope.store_in.currency.name_ar + ' ',
              en: ' ' + $scope.store_in.currency.name_en + ' ',
            };
            site.strings['from100'] = {
              ar: ' ' + $scope.store_in.currency.minor_currency_ar + ' ',
              en: ' ' + $scope.store_in.currency.minor_currency_en + ' ',
            };
            $scope.store_in.net_txt = site.stringfiy($scope.store_in.net_value);
          }
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    );
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
        $scope.item.sizes.forEach((_size) => {
          foundSize = $scope.store_in.items.some((_itemSize) => _itemSize.barcode === _size.barcode && _itemSize.unit.id === _size.unit.id);
          if (_size.count > 0 && !foundSize) {
            let discount = 0;
            _size.value_added = site.toNumber(_size.value_added);
            _size.total_v_a = (_size.value_added * (_size.cost * _size.count)) / 100;
            _size.total_v_a = site.toNumber(_size.total_v_a);

            if (_size.count) {
              if (_size.discount.type == 'number') discount = (_size.discount.value || 0) * _size.count;
              else if (_size.discount.type == 'percent') discount = ((_size.discount.value || 0) * (_size.cost * _size.count)) / 100;

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
              size_en: _size.size_en,
              work_patch: _size.work_patch,
              work_serial: _size.work_serial,
              validit: _size.validit || 0,
              size_units_list: _size.size_units_list,
              unit: _size.unit,
              cost: _size.unit.cost,
              price: _size.unit.price,
              average_cost: _size.unit.average_cost,
              item_complex: _size.item_complex,
              complex_items: _size.complex_items,
              barcode: _size.barcode,
              count: _size.count,
              discount: _size.discount,
              total: _size.total,
              current_count: _size.current_count,
              ticket_code: _size.ticket_code,
              add_sizes: _size.add_sizes,
            };
            $scope.store_in.items.push(itmObj);
            $scope.calcSize($scope.store_in.items[$scope.store_in.items.length - 1]);
          }
        });
      $scope.calc($scope.store_in);
      $scope.item.sizes = [];
      site.hideModal('#selectItemsModal');
    } else $scope.error = '##word.err_transaction_type##';
  };

  $scope.calcSize = function (calc_size) {
    $scope.error = '';

    $timeout(() => {
      if (calc_size.count) {
        if (calc_size.discount.type == 'number') {
          calc_size.discount.current = calc_size.discount.value;
        } else if (calc_size.discount.type == 'percent') {
          calc_size.discount.current = (calc_size.discount.value * calc_size.cost) / 100;
        }

        calc_size.discount.current = site.toNumber(calc_size.discount.current);
        calc_size.b_cost = calc_size.cost - calc_size.discount.current;

        calc_size.b_cost = site.toNumber(calc_size.b_cost);
        calc_size.value_added = site.toNumber(calc_size.value_added);
        calc_size.total_v_a = (calc_size.value_added * (calc_size.b_cost * calc_size.count)) / 100;
        calc_size.total_v_a = site.toNumber(calc_size.total_v_a);
        calc_size.total = calc_size.b_cost * calc_size.count + calc_size.total_v_a;

        calc_size.total = site.toNumber(calc_size.total);
      }
      $scope.calc($scope.store_in);
    }, 100);
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

      if (obj.type && obj.type.id !== 4) {
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
      obj.total_value = site.toNumber(obj.total_value);

      if (!obj.invoice_id) {
        obj.before_value_added = obj.total_value - obj.total_value_added;
        obj.net_value = obj.total_value + obj.total_tax - obj.total_discount;
        obj.before_value_added = site.toNumber(obj.before_value_added);
      }
      obj.total_value = site.toNumber(obj.total_value);
      obj.net_value = site.toNumber(obj.net_value);

      if (obj.currency) {
        obj.amount_currency = obj.net_value / site.toNumber(obj.currency.ex_rate);
        obj.amount_currency = site.toNumber(obj.amount_currency);
        obj.paid_up = obj.amount_currency;
      }

      $scope.discount = {
        type: 'number',
      };
    }, 250);
  };

  $scope.calcReturn = function (obj) {
    $timeout(() => {
      obj.net_value = (obj.total_value || 0) - (obj.total_discount || 0) + (obj.total_tax || 0);
      obj.net_value = site.toNumber(obj.net_value);
    }, 250);
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
        method: 'POST',
        url: '/api/stores_items/all',
        data: {
          where: {},
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
                              if (foundStore) _size.store_count = _size.branches_list[indxBranch].stores_list[indxStore].current_count;
                            } else _size.store_count = 0;
                          } else _size.store_count = 0;
                        } else _size.store_count = 0;
                      } else _size.store_count = 0;

                      foundSize = $scope.item.sizes.some((_itemSize) => _itemSize.barcode === _size.barcode);

                      if (!foundSize && !foundHold) $scope.item.sizes.unshift(_size);
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

  $scope.itemsStoresIn = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.itm && $scope.item.itm.sizes && $scope.item.itm.sizes.length > 0)
      $scope.item.itm.sizes.forEach((_item) => {
        let foundHold = false;
        _item.add_sizes = $scope.item.itm.add_sizes;
        _item.name_ar = $scope.item.itm.name_ar;
        _item.name_en = $scope.item.itm.name_en;
        _item.item_group = $scope.item.itm.item_group;
        _item.store = $scope.store_in.store;
        _item.count = 1;
        _item.value_added = _item.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added;

        let indxUnit = 0;
        if (_item.size_units_list && _item.size_units_list.length > 0) {
          indxUnit = _item.size_units_list.findIndex((_unit) => _unit.id == $scope.item.itm.main_unit.id);

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
                if (foundStore) _item.store_count = _item.branches_list[indxBranch].stores_list[indxStore].current_count;
              } else _item.store_count = 0;
            } else _item.store_count = 0;
          } else _item.store_count = 0;
        } else _item.store_count = 0;
        foundSize = $scope.item.sizes.some((_itemSize) => _itemSize.barcode === _item.barcode);
        if (!foundSize && !foundHold) $scope.item.sizes.unshift(_item);
      });
  };

  $scope.itemsGeneral = function () {
    $scope.error = '';
    $http({
      method: 'POST',
      url: '/api/stores_items/all',
      data: {
        where: {},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.list.length > 0) {
            response.data.list.forEach((_l) => {
              if (_l.sizes && _l.sizes.length > 0)
                _l.sizes.forEach((_size) => {
                  let foundHold = false;
                  let indxUnit = 0;
                  _size.add_sizes = _l.add_sizes;
                  if (_size.size_units_list && _size.size_units_list.length > 0) {
                    let foundUnit = false;
                    _size.size_units_list.forEach((_unit, i) => {
                      if ($scope.search_barcode === _unit.barcode) {
                        foundUnit = true;
                        indxUnit = i;
                      } else if (_unit.id === _l.main_unit.id && !foundUnit) {
                        indxUnit = i;
                      }
                    });
                  }
                  if (_size.branches_list && _size.branches_list.length > 0)
                    _size.branches_list.forEach((_branch) => {
                      if (_branch.code == '##session.branch.code##')
                        _branch.stores_list.forEach((_store) => {
                          if ($scope.store_in.store && _store.store && _store.store.id == $scope.store_in.store.id) {
                            if (_store.hold) foundHold = true;
                          }
                        });
                    });

                  _size.name_ar = _l.name_ar;
                  _size.name_en = _l.name_en;
                  _size.item_group = _l.item_group;
                  _size.store = $scope.store_in.store;
                  _size.count = 1;
                  _size.value_added = _size.not_value_added ? 0 : $scope.defaultSettings.inventory.value_added || 0;
                  _size.unit = _size.size_units_list[indxUnit];
                  _size.discount = _size.size_units_list[indxUnit].discount;
                  _size.average_cost = _size.size_units_list[indxUnit].average_cost;
                  _size.cost = _size.size_units_list[indxUnit].cost;
                  _size.price = _size.size_units_list[indxUnit].price;
                  _size.total = _size.count * _size.cost;

                  if (!foundHold) $scope.store_in.items.unshift(_size);

                  $scope.calcSize(_size);
                });

            });
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
                          if ($scope.store_in.store && _store.store && _store.store.id == $scope.store_in.store.id) {
                            if (_store.hold) foundHold = true;
                          }
                        });
                    });

                  if (_size.barcode === $scope.search_barcode || _size.size_units_list[indxUnit].barcode === $scope.search_barcode) {
                    _size.name_ar = response.data.list[0].name_ar;
                    _size.name_en = response.data.list[0].name_en;
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

                    foundSize = $scope.store_in.items.some((_itemSize) => _itemSize.barcode === _size.barcode && _itemSize.unit.id === _size.unit.id);

                    if (!foundSize && !foundHold) $scope.store_in.items.unshift(_size);
                    else if (foundSize) {
                      $scope.store_in.items.forEach((_item) => {
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
      $scope.error = '##word.date_exceed##';
      return;
    }

    if (!$scope.store_in.payment_type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4)) {
      $scope.error = '##word.must_choose_payment_type##';
      return;
    }

    if ($scope.store_in.payment_type) {
      if ($scope.store_in.paid_up > $scope.store_in.amount_currency) {
        $scope.error = '##word.err_net_value##';
        return;
      }

      if ($scope.store_in.type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.create_invoice_auto) {
        if (!$scope.store_in.safe) {
          $scope.error = '##word.nosafe_warning##';
          return;
        }
      }

      if ($scope.store_in.paid_up < $scope.store_in.amount_currency && $scope.store_in.payment_type.id == 1) {
        $scope.error = '##word.amount_must_paid_full##';
        return;
      }
    } else {
      $scope.store_in.paid_up = undefined;
      $scope.store_in.safe = undefined;
      $scope.store_in.payment_method = undefined;
      $scope.store_in.currency = undefined;
    }

    let max_discount = false;
    let returned_count = false;
    let notExistCount = false;

    if ($scope.store_in.items && $scope.store_in.items.length > 0) {
      notExistCount = $scope.store_in.items.some((_iz) => _iz.count < 1);

      $scope.store_in.items.forEach((_itemSize) => {
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

    if ($scope.store_in.type.id == 4) {
      if (returned_count) {
        $scope.error = '##word.return_item_err##';
        return;
      }
    }

    if (notExistCount) {
      $scope.error = '##word.err_exist_count##';
      return;
    }

    $scope.testPatches($scope.store_in, (callback) => {
      if (callback.patchCount) {
        $scope.error = `##word.err_patch_count##   ( ${callback.patch_list.join('-')} )`;
        return;
      }

      if (callback.not_patch) {
        $scope.error = `##word.err_find_serial##   ( ${callback.patch_list.join('-')} )`;
        return;
      }

      if (callback.exist_serial && $scope.store_in.type.id !== 4) {
        $scope.error = `##word.serial_pre_existing##   ( ${callback.patch_list.join('-')} )`;
        return;
      }

      if (callback.errDate) {
        $scope.error = '##word.err_patch_date##';
        return;
      }

      $scope.financialYear($scope.store_in.date, (is_allowed_date) => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {
          if ($scope.account_invoices && $scope.account_invoices.payable_list && $scope.account_invoices.payable_list.length > 0) {
            for (let i = 0; i < $scope.account_invoices.payable_list.length; i++) {
              let p = $scope.account_invoices.payable_list[i];
              p.done = false;
              p.paid_up = 0;
              p.remain = p.value;
            }

            $scope.store_in.payable_list = $scope.account_invoices.payable_list;
          }

          $scope.busy = true;
          $http({
            method: 'POST',
            url: '/api/stores_in/update',
            data: $scope.store_in,
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                site.hideModal('#updateStoreInModal');
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

  $scope.delete = function (store_in) {
    $scope.error = '';

    if (store_in.return_paid && store_in.net_value != store_in.return_paid.net_value) {
      $scope.error = '##word.err_delete_return##';
      return;
    }
    $scope.getStockItems(store_in.items, store_in.store, (callback) => {
      if (!callback) {
        $scope.financialYear(store_in.date, (is_allowed_date) => {
          if (!is_allowed_date) {
            $scope.error = '##word.should_open_period##';
          } else {
            $scope.busy = true;
            $http({
              method: 'POST',
              url: '/api/stores_in/delete',
              data: store_in,
            }).then(
              function (response) {
                $scope.busy = false;
                if (response.data.done) {
                  site.hideModal('#deleteStoreInModal');
                  if ($scope.defaultSettings.accounting && $scope.defaultSettings.accounting.link_warehouse_account_invoices) {
                    $scope.deleteAccountInvoices(store_in);
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
                  } else if (response.data.error.like('*t`s Have Account Invo*')) {
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
          source_type_id: 1,
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

  $scope.posting = function (store_in) {
    $scope.error = '';

    if (!store_in.posting && store_in.return_paid && store_in.net_value != store_in.return_paid.net_value) {
      store_in.posting = true;
      $scope.error = '##word.err_unpost_return##';

      return;
    }

    let notExistCount = store_in.items.some((_iz) => _iz.count < 1);

    if (notExistCount) {
      if (store_in.posting) store_in.posting = false;
      else store_in.posting = true;
      $scope.error = '##word.err_exist_count##';
      return;
    }

    $scope.getStockItems(store_in.items, store_in.store, (callback) => {
      $scope.testPatches(store_in, (testCallback) => {
        if (testCallback.patchCount) {
          $scope.error = `##word.err_patch_count##   ( ${testCallback.patch_list.join('-')} )`;
          store_in.posting = false;
          return;
        }

        if (callback.not_patch) {
          $scope.error = `##word.err_find_serial##   ( ${callback.patch_list.join('-')} )`;
          store_in.posting = false;
          return;
        }

        if (store_in.posting && testCallback.exist_serial && store_in.type.id !== 4) {
          $scope.error = `##word.serial_pre_existing##   ( ${testCallback.patch_list.join('-')} )`;
          store_in.posting = true;
          return;
        }

        if (testCallback.errDate) {
          $scope.error = '##word.err_patch_date##';
          store_in.posting = false;
          return;
        }

        if (!callback) {
          $scope.financialYear(store_in.date, (is_allowed_date) => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';

              if (store_in.posting) store_in.posting = false;
              else store_in.posting = true;
            } else {
              $scope.busy = true;
              $http({
                method: 'POST',
                url: '/api/stores_in/posting',
                data: store_in,
              }).then(
                function (response) {
                  $scope.busy = false;
                  if (response.data.done) {
                    if (!store_in.posting && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.link_warehouse_account_invoices) {
                      $scope.deleteAccountInvoices(store_in);
                    } else if (
                      (store_in.type.id === 1 || store_in.type.id === 4) &&
                      store_in.posting &&
                      $scope.defaultSettings.accounting &&
                      $scope.defaultSettings.accounting.link_warehouse_account_invoices
                    ) {
                      let account_invoices = {
                        image_url: '/images/account_invoices.png',
                        date: response.data.doc.date,
                        payable_list: response.data.doc.payable_list,
                        payment_type: response.data.doc.payment_type,
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
                        invoice_code: response.data.doc.code,
                        total_discount: response.data.doc.total_discount,
                        total_tax: response.data.doc.total_tax,
                        items: response.data.doc.items,
                        source_type: {
                          id: 1,
                          en: 'Purchases Store',
                          ar: 'المشتريات المخزنية',
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
                    } else if (response.data.error.like('*t`s Have Account Invo*')) {
                      $scope.error = '##word.cant_process_found_invoice##';
                    }

                    if (store_in.posting) store_in.posting = false;
                    else store_in.posting = true;
                  }
                },
                function (err) {
                  console.log(err);
                }
              );
            }
          });
        } else {
          store_in.posting = false;
          $scope.error = '##word.err_stock_item##';
        }
      });
    });
  };

  $scope.postingAll = function (store_in_all) {
    $scope.error = '';

    let _store_in_all = store_in_all.reverse();

    let notExist = false;
    let notExistCountList = [];
    _store_in_all.forEach((_stIn) => {
      let notExistCount = _stIn.items.some((_iz) => _iz.count < 1);
      if (notExistCount) {
        notExist = true;
        notExistCountList.push(_stIn.code);
      }
    });

    if (notExist) {
      $scope.error = `##word.err_exist_count_invoice##   ( ${notExistCountList.join('-')} )`;
      return;
    } else {
      for (let i = 0; i < _store_in_all.length; i++) {
        $timeout(() => {
          if (!_store_in_all[i].posting) {
            $scope.getStockItems(_store_in_all[i].items, _store_in_all[i].store, (callback) => {
              $scope.testPatches(_store_in_all[i], (testCallback) => {
                if (testCallback.patchCount) {
                  $scope.error = `##word.err_patch_count##   ( ${testCallback.patch_list.join('-')} )`;
                  _store_in_all[i].posting = false;
                } else if (testCallback.exist_serial && _store_in_all[i].type.id != 4) {
                  $scope.error = `##word.serial_pre_existing##   ( ${testCallback.patch_list.join('-')} )`;
                  _store_in_all[i].posting = false;
                } else if (testCallback.errDate) {
                  $scope.error = '##word.err_patch_date##';
                  _store_in_all[i].posting = false;
                } else if (!callback) {
                  $scope.financialYear(_store_in_all[i].date, (is_allowed_date) => {
                    if (!is_allowed_date) {
                      $scope.error = '##word.should_open_period##';
                    } else {
                      _store_in_all[i].posting = true;

                      $http({
                        method: 'POST',
                        url: '/api/stores_in/posting',
                        data: _store_in_all[i],
                      }).then(
                        function (response) {
                          if (response.data.done) {
                            if (
                              (_store_in_all[i].type.id === 1 || _store_in_all[i].type.id === 4) &&
                              _store_in_all[i].posting &&
                              $scope.defaultSettings.accounting &&
                              $scope.defaultSettings.accounting.link_warehouse_account_invoices
                            ) {
                              let account_invoices = {
                                image_url: '/images/account_invoices.png',
                                date: response.data.doc.date,
                                payable_list: response.data.doc.payable_list,
                                payment_type: response.data.doc.payment_type,
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
                                invoice_code: response.data.doc.code,
                                total_discount: response.data.doc.total_discount,
                                total_tax: response.data.doc.total_tax,
                                items: response.data.doc.items,
                                source_type: {
                                  id: 1,
                                  en: 'Purchases Store',
                                  ar: 'المشتريات المخزنية',
                                },
                                active: true,
                              };

                              $scope.addAccountInvoice(account_invoices);
                            }
                          } else {
                            $scope.error = response.data.error;
                            if (response.data.error.like('*OverDraft Not*')) {
                              $scope.error = '##word.overdraft_not_active##';
                            } else if (response.data.error.like('*n`t Found Open Shi*')) {
                              $scope.error = '##word.open_shift_not_found##';
                            } else if (response.data.error.like('*n`t Open Perio*')) {
                              $scope.error = '##word.should_open_period##';
                            }
                            _store_in_all[i].posting = false;
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
                  _store_in_all[i].posting = false;
                }
              });
            });
          }
        }, 1000 * i);
      }
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

  $scope.loadStoresInTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_in/types/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.storesInTypes = response.data;
        $scope.storesInTypes.forEach((_t) => {
          if (_t.id == site.toNumber('##query.type##')) $scope.source_type = _t;
        });
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
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

  $scope.loadTax_Types = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/tax_types/all',
      data: {
        select: {
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
        if (response.data.done) $scope.tax_types = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
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

  $scope.loadDiscount_Types = function () {
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

  $scope.loadVendors = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/vendors/all',
        data: {
          search: $scope.search_vendor,
        },
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
      );
    }
  };

  /*  $scope.showFormNum = function (obj,elementNum) {
     let elementString = 
     $scope.formNum = elementNum;
 
     site.showModal('#viewFormNumModal');
 
 
   };
 
 
 
   $scope.editFormNum = function (type) {
 
     console.log($scope.formNum,"SDfdfdsfsdf");
     if (type === '1') {
 
       $scope.formNum = $scope.formNum + '1';
       $scope.formNum = site.toNumber($scope.formNum);
     }
     console.log($scope.formNum);
   };
  */

  $scope.searchAll = function () {
    $scope.error = '';
    $scope.loadAll($scope.search);
    $scope.search = {};
    site.hideModal('#StoresInSearchModal');
  };

  $scope.showReturnedStoreIn = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $scope.busy = true;
      $http({
        method: 'POST',
        url: '/api/stores_in/all',
        data: {
          search: $scope.storesInSearch,
          where: {
            posting: true,
            'return_paid.net_value': { $gt: 0 },
          },
        },
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
      );
    }
  };

  $scope.selectReturnedStoreIn = function (i) {
    if ($scope.store_in && i.return_paid) {
      $scope.store_in.retured_number = i.code;
      $scope.store_in.retured_id = i.id;
      $scope.store_in.total_discount = i.return_paid.total_discount;
      $scope.store_in.total_value_added = i.return_paid.total_value_added;
      $scope.store_in.total_tax = i.return_paid.total_tax;
      $scope.store_in.total_value = i.return_paid.total_value;
      $scope.store_in.net_value = i.return_paid.net_value;

      $scope.store_in.items = [];
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
            $scope.store_in.items.push(_item);
            $scope.calcSize(_item);
          }
        });
      }

      /*   if ($scope.store_in.currency) {
          $scope.amount_currency = site.toNumber($scope.store_in.net_value) / site.toNumber($scope.store_in.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
          $scope.store_in.paid_up = $scope.amount_currency;
        } */
      site.hideModal('#returnedViewModal');
    }
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
      url: '/api/stores_in/all',
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

  $scope.getSafeBySetting = function () {
    $scope.error = '';
    if ($scope.defaultSettings.accounting) {
      if ($scope.store_in.type && ($scope.store_in.type.id == 1 || $scope.store_in.type.id == 4) && $scope.defaultSettings.accounting.create_invoice_auto) {
        if ($scope.defaultSettings.accounting.payment_method) {
          $scope.store_in.payment_method = $scope.defaultSettings.accounting.payment_method;
          $scope.loadSafes($scope.store_in.payment_method, $scope.store_in.currency);
          if ($scope.store_in.payment_method.id == 1) {
            if ($scope.defaultSettings.accounting.safe_box) $scope.store_in.safe = $scope.defaultSettings.accounting.safe_box;
          } else {
            if ($scope.defaultSettings.accounting.safe_bank) $scope.store_in.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
      }
    }
  };

  $scope.detailsAccountInvoices = function (storeIn) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/account_invoices/view',
      data: {
        where: {
          invoice_id: storeIn.id,
          'source_type.id': 1,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.store_in = storeIn;
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
          $scope.detailsAccountInvoices($scope.store_in);
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
        $scope.paymentMethodList = response.data.filter((i) => i.id != 5);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.handelStoreIn = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_in/handel_store_in',
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

  $scope.getSerialList = function (items, callback) {
    $scope.error = '';
    $scope.busy = true;
    let barcodes = [];
    if (items && items.length > 0) barcodes = items.map((_item) => _item.barcode);

    let where = { serial: true, barcodes: barcodes };

    $http({
      method: 'POST',
      url: '/api/stores_items/barcode_unit',
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.serial_list) {
          $scope.serial_list = response.data.serial_list;
          callback(response.data.serial_list);
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;

    let screen = '';
    if (site.toNumber('##query.type##')) {
      if (site.toNumber('##query.type##') == 1) screen = 'purchases_invoices_store';
      else if (site.toNumber('##query.type##') == 2) screen = 'depts_store';
      else if (site.toNumber('##query.type##') == 3) screen = 'opening_balances_Store';
      else if (site.toNumber('##query.type##') == 4) screen = 'return_purchases_store';

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

  $scope.paymentsPayable = function (type) {
    $scope.error = '';
    $scope.account_invoices = $scope.account_invoices || {};
    $scope.account_invoices.payable_list = $scope.account_invoices.payable_list || [{}];
    if (type === 'view') {
      site.showModal('#addPaymentsModal');
    }
  };

  $scope.getNumberingAutoInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/numbering/get_automatic',
      data: {
        screen: 'purchases_invoices',
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

  $scope.loadStoresInTypes();
  $scope.loadStores();
  $scope.loadPaymentTypes();
  $scope.loadCategories();
  $scope.getNumberingAuto();
  $scope.getNumberingAutoInvoice();
  $scope.getPaymentMethodList();
  $scope.getUser();
  $scope.loadTax_Types();
  $scope.loadDiscount_Types();
  $scope.getDefaultSettings();
  $scope.loadCurrencies();
  $scope.loadAll({
    date: new Date(),
  });
});
