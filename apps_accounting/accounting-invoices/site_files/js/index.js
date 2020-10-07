app.controller("account_invoices", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.account_invoices = {};

  $scope.displayaddAccountInvoice = function () {
    $scope.get_open_shift((shift) => {
      if (shift) {

        $scope._search = {};
        $scope.search_order = '';
        $scope.error = '';
        $scope.orderInvoicesTypeList = [];

        $scope.account_invoices = {
          image_url: '/images/account_invoices.png',
          date: new Date(),
          shift: shift,
          active: true,
          source_type: $scope.source_type
        };

        if ($scope.defaultSettings.accounting) {
          if ($scope.account_invoices.source_type && $scope.account_invoices.source_type.id == 3)
            $scope.getTransactionTypeList();
          $scope.account_invoices.currency = $scope.currencySetting;

          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id == 1)
              $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        };

        if ($scope.defaultSettings.general_Settings) {
          if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting)
            $scope.account_invoices.posting = true;
          if ($scope.defaultSettings.general_Settings.order_type && $scope.account_invoices.source_type && $scope.account_invoices.source_type.id == 3)
            $scope.account_invoices.order_invoices_type = $scope.defaultSettings.general_Settings.order_type;
        }

        site.showModal('#accountInvoicesAddModal');

      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.addAccountInvoice = function () {
    $scope.error = '';

    if ($scope.busy) {
      return;
    }
    $scope.detailsCustomer((customer) => {

      const v = site.validated('#accountInvoicesAddModal');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      } else if ($scope.account_invoices.paid_up > 0 && !$scope.account_invoices.safe) {
        $scope.error = "##word.should_select_safe##";
        return;
      } else if ($scope.account_invoices.total_tax > $scope.total_tax) {
        $scope.error = "##word.err_total_tax##";
        return;
      } else if ($scope.account_invoices.total_discount > $scope.total_discount) {
        $scope.error = "##word.err_total_discount##";
        return;
      } else if ($scope.account_invoices.price_delivery_service > $scope.price_delivery_service) {
        $scope.error = "##word.err_price_delivery_service##";
        return;
      } else if ($scope.account_invoices.service > $scope.service) {
        $scope.error = "##word.err_service##";
        return;
      } else if ($scope.account_invoices.paid_up > $scope.amount_currency) {
        $scope.error = "##word.err_net_value##";
        return;
      } else if (new Date($scope.account_invoices.date) > new Date()) {
        $scope.error = "##word.date_exceed##";
        return;

      } else if ($scope.account_invoices.customer && $scope.account_invoices.payment_method && $scope.account_invoices.payment_method.id == 10) {
        if (customer) {
          let totalCustomerBalance = 0;
          let customerPay = $scope.account_invoices.paid_up * $scope.account_invoices.currency.ex_rate;

          totalCustomerBalance = ($scope.customer.balance || 0) + ($scope.customer.credit_limit || 0);

          if (customerPay > totalCustomerBalance) {
            $scope.error = "##word.cannot_exceeded_customer##";
            return;
          }
        }
      }

      if ($scope.account_invoices.source_type) {
        if ($scope.account_invoices.source_type.id == 8 || $scope.account_invoices.source_type.id == 9 || $scope.account_invoices.source_type.id == 10 || $scope.account_invoices.source_type.id == 11) {
          $scope.account_invoices.net_value = $scope.account_invoices.paid_up;
        }
      }

      $http({
        method: "POST",
        url: "/api/account_invoices/add",
        data: $scope.account_invoices
      }).then(
        function (response) {
          if (response.data.done) {
            site.hideModal('#accountInvoicesAddModal');
            $scope.getAccountInvoicesList();
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
    })
  };

  $scope.posting = function (account_invoices) {
    $scope.error = '';

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/account_invoices/posting",
      data: account_invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getAccountInvoicesList();
        } else {
          $scope.error = '##word.error##';
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };


  $scope.postingAll = function (account_invoices_all) {
    $scope.error = '';

    let _account_invoices_all = account_invoices_all.reverse();

    for (let i = 0; i < _account_invoices_all.length; i++) {
      setTimeout(() => {
        let _account_invoices = _account_invoices_all[i];

        if (!_account_invoices.posting) {

          _account_invoices.posting = true;

          $http({
            method: "POST",
            url: "/api/account_invoices/posting",
            data: _account_invoices
          }).then(
            function (response) {
              if (response.data.done) {

              } else {
                $scope.error = '##word.error##';
              }
            },
            function (err) {
              console.log(err);
            }
          )

        };
      }, 100 * 1 * i);

    };

  };


  $scope.displayUpdateAccountInvoices = function (account_invoices) {
    $scope.error = '';
    $scope._search = {};

    $scope.detailsAccountInvoices(account_invoices);
    $scope.account_invoices = {
      image_url: '/images/vendor_logo.png',

    };
    site.showModal('#accountInvoicesUpdateModal');
  };

  $scope.updateAccountInvoices = function () {
    $scope.error = '';

    if ($scope.busy) {
      return;
    }

    $scope.detailsCustomer((customer) => {

      const v = site.validated('#accountInvoicesAddModal');
      if (!v.ok) {
        $scope.error = v.messages[0].ar;
        return;
      } else if ($scope.account_invoices.paid_up > 0 && !$scope.account_invoices.safe) {
        $scope.error = "##word.should_select_safe##";
        return;
      } else if ($scope.account_invoices.total_tax > $scope.total_tax) {
        $scope.error = "##word.err_total_tax##";
        return;
      } else if ($scope.account_invoices.total_discount > $scope.total_discount) {
        $scope.error = "##word.err_total_discount##";
        return;
      } else if ($scope.account_invoices.price_delivery_service > $scope.price_delivery_service) {
        $scope.error = "##word.err_price_delivery_service##";
        return;
      } else if ($scope.account_invoices.service > $scope.service) {
        $scope.error = "##word.err_service##";
        return;
      } else if ($scope.account_invoices.paid_up > $scope.amount_currency) {
        $scope.error = "##word.err_net_value##";
        return;
      } else if (new Date($scope.account_invoices.date) > new Date()) {
        $scope.error = "##word.date_exceed##";
        return;

      } else if ($scope.account_invoices.customer && $scope.account_invoices.payment_method && $scope.account_invoices.payment_method.id == 10) {
        if (customer) {
          let totalCustomerBalance = 0;
          let customerPay = $scope.account_invoices.paid_up * $scope.account_invoices.currency.ex_rate;

          totalCustomerBalance = ($scope.customer.balance || 0) + ($scope.customer.credit_limit || 0);

          if (customerPay > totalCustomerBalance) {
            $scope.error = "##word.cannot_exceeded_customer##";
            return;
          }
        }
      }

      if ($scope.account_invoices.source_type) {
        if ($scope.account_invoices.source_type.id == 8 || $scope.account_invoices.source_type.id == 9 || $scope.account_invoices.source_type.id == 10 || $scope.account_invoices.source_type.id == 11) {
          $scope.account_invoices.net_value = $scope.account_invoices.paid_up;
        }
      }


      $http({
        method: "POST",
        url: "/api/account_invoices/update",
        data: $scope.account_invoices
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            site.hideModal('#accountInvoicesUpdateModal');
            $scope.list.forEach((b, i) => {
              if (b.id == response.data.doc.id) {
                $scope.list[i] = response.data.doc;
              }
            });
          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          console.log(err);
        }
      )
    })
  };

  $scope.displayDetailsAccountInvoices = function (account_invoices) {
    $scope.error = '';
    $scope.detailsAccountInvoices(account_invoices);
    $scope.account_invoices = {};
    site.showModal('#accountInvoicesDetailsModal');
  };

  $scope.detailsAccountInvoices = function (account_invoices) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/account_invoices/view",
      data: {
        id: account_invoices.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.account_invoices = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteAccountInvoices = function (account_invoices) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.detailsAccountInvoices(account_invoices);
        $scope.account_invoices = {};
        site.showModal('#accountInvoicesDeleteModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };
  $scope.getTransactionType = function (source_type) {
    if (source_type.id == 3)
      $scope.getTransactionTypeList();
  };

  $scope.deleteAccountInvoices = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/account_invoices/delete",
      data: {
        id: $scope.account_invoices.id
      }
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
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getAccountInvoicesList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;

    if (where) {
      where.source_type = { id: site.toNumber("##query.type##") };

    } else {
      where = {
        source_type: { id: site.toNumber("##query.type##") }
      }
    }


    $http({
      method: "POST",
      url: "/api/account_invoices/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          $scope.paid_invoice = {};
          $scope.account_invoices = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  /*  $scope.paymentInvoice = function () {
     $scope.error = '';
     if (!$scope.paid_invoice.safe) {
       $scope.error = "##word.should_select_safe##";
       return;
     };
     if (!$scope.paid_invoice.payment_paid_up) {
       $scope.error = "##word.err_paid_up##";
       return;
     };
     if ($scope.paid_invoice.payment_paid_up > $scope.amount_currency) {
       $scope.error = "##word.err_paid_up_payment##";
       return;
     };
     $scope.paid_invoice.payment_list = $scope.paid_invoice.payment_list || [];
     $scope.paid_invoice.remain_amount = $scope.paid_invoice.remain_amount - $scope.paid_invoice.payment_paid_up;
     $scope.paid_invoice.payment_list.push({
       paid_up: $scope.paid_invoice.payment_paid_up,
       payment_method: $scope.paid_invoice.payment_method,
       currency: $scope.paid_invoice.currency,
       safe: $scope.paid_invoice.safe,
       date: $scope.paid_invoice.payment_date,
     });
   }; */


  $scope.acceptPaymentInvoice = function () {
    $scope.error = '';
    $scope.detailsCustomer((customer) => {

      if (!$scope.paid_invoice.safe) {
        $scope.error = "##word.should_select_safe##";
        return;
      } else if (!$scope.paid_invoice.payment_paid_up) {
        $scope.error = "##word.err_paid_up##";
        return;
      }
      else if ($scope.paid_invoice.payment_paid_up > $scope.amount_currency) {
        $scope.error = "##word.err_paid_up_payment##";
        return;
      } else if ($scope.paid_invoice.payment_paid_up > $scope.amount_currency) {
        $scope.error = "##word.err_net_value##";
        return;
      }

      if ($scope.paid_invoice.customer && $scope.paid_invoice.payment_method && $scope.paid_invoice.payment_method.id == 10) {
        if (customer) {

          let totalCustomerBalance = 0;
          let customerPay = $scope.paid_invoice.payment_paid_up * $scope.paid_invoice.currency.ex_rate;

          totalCustomerBalance = (customer.balance || 0) + (customer.credit_limit || 0);

          if (customerPay > totalCustomerBalance) {
            $scope.error = "##word.cannot_exceeded_customer##";
            return;
          }
        }
      }

      $scope.paid_invoice.payment_list = $scope.paid_invoice.payment_list || [];
      $scope.paid_invoice.payment_list.push({
        paid_up: $scope.paid_invoice.payment_paid_up,
        payment_method: $scope.paid_invoice.payment_method,
        currency: $scope.paid_invoice.currency,
        shift: $scope.shift,
        safe: $scope.paid_invoice.safe,
        date: $scope.payment_date,
      });

      $scope.busy = true;
      $http({
        method: "POST",
        url: "/api/account_invoices/update_payment",
        data: $scope.paid_invoice
      }).then(
        function (response) {
          $scope.busy = false;

          if (response.data.done) {
            $scope.getAccountInvoicesList();

            site.hideModal('#invoicesPaymentModal');
          } else {
            $scope.error = 'Please Login First';
          }
        },
        function (err) {
          console.log(err);
        }
      )
    })

  };


  $scope.detailsCustomer = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    let customer = '';
    if ($scope.paid_invoice && $scope.paid_invoice.customer) {
      customer = $scope.paid_invoice.customer
    } else if ($scope.account_invoices && $scope.account_invoices.customer) {
      customer = $scope.account_invoices.customer
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


  $scope.loadOrderInvoicesType = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    $scope.orderInvoicesTypeList = [];
    if ($scope.account_invoices.source_type.id == 3 && !$scope.account_invoices.order_invoices_type) {
      $scope.error = "##word.err_order_type##";
      return;
    } else if (ev.which === 13) {

      let where = {};
      let url = "/api/stores_in/all";

      if ($scope.account_invoices.source_type) {

        if ($scope.account_invoices.source_type.id == 1) {
          url = "/api/stores_in/all";
          where = { 'type.id': 1 };
        }

        else if ($scope.account_invoices.source_type.id == 2) {
          url = "/api/stores_out/all";
          where = { 'type.id': { $ne: 4 } };
        }

        else if ($scope.account_invoices.source_type.id == 3)
          url = "/api/order_invoice/invoices";

        else if ($scope.account_invoices.source_type.id == 4)
          url = "/api/request_service/all";

        else if ($scope.account_invoices.source_type.id == 5)
          url = "/api/book_hall/all";

        else if ($scope.account_invoices.source_type.id == 12) {
          url = "/api/account_invoices/all";


          if ($scope.account_invoices.employee && $scope.account_invoices.employee.id) {
            where.source_type = { id: 11 };
            where.employee = $scope.account_invoices.employee;
          } else {
            return;
          }
        }
      }

      where.invoice = { $ne: true };

      $http({
        method: "POST",
        url: url,
        data: {
          search: $scope.search_order,
          order_invoices_type: $scope.account_invoices.order_invoices_type,
          where: where
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.orderInvoicesTypeList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
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

  $scope.selectOrderInvoices = function (item) {
    $scope.error = '';
    $scope.account_invoices.current_book_list = [];
    $scope.account_invoices.customer = item.customer;
    $scope.account_invoices.tenant = item.tenant;
    $scope.account_invoices.invoice_type = item.type;
    $scope.account_invoices.vendor = item.vendor;
    $scope.account_invoices.total_value_added = item.total_value_added;
    $scope.account_invoices.delivery_employee = item.delivery_employee;
    $scope.account_invoices.table = item.table;
    $scope.account_invoices.services_price = item.services_price;
    $scope.account_invoices.service_name = item.service_name;
    $scope.account_invoices.date_from = item.date_from;
    $scope.account_invoices.date_to = item.date_to;
    $scope.account_invoices.service = item.service;
    $scope.account_invoices.total_period = item.total_period;
    $scope.account_invoices.period = item.period;
    $scope.account_invoices.price_hour = item.price_hour;
    $scope.account_invoices.price_day = item.price_day;

    if (item.under_paid) {
      $scope.account_invoices.total_tax = item.under_paid.total_tax;
      $scope.account_invoices.total_discount = item.under_paid.total_discount;
      $scope.account_invoices.price_delivery_service = item.under_paid.price_delivery_service;
      $scope.account_invoices.service = item.under_paid.service;
      $scope.account_invoices.net_value = item.under_paid.net_value;
    } else {
      $scope.account_invoices.total_tax = item.total_tax;
      $scope.account_invoices.total_discount = item.total_discount;
      $scope.account_invoices.net_value = item.net_value || item.paid_require;
    }

    $scope.account_invoices.invoice_id = item.id;
    $scope.account_invoices.invoice_code = item.code || item.number;
    $scope.account_invoices.paid_up = 0;
    $scope.total_tax = $scope.account_invoices.total_tax;
    $scope.total_discount = $scope.account_invoices.total_discount;
    $scope.price_delivery_service = $scope.account_invoices.price_delivery_service;
    $scope.service = $scope.account_invoices.service;

    if ($scope.account_invoices.source_type && $scope.account_invoices.source_type.id == 3) {

      item.under_paid.book_list.forEach(_item => {
        if (_item.count > 0) {
          $scope.account_invoices.current_book_list.push(_item);
        }
      });

    } else $scope.account_invoices.current_book_list = item.items;
    $scope.calc($scope.account_invoices);
    $scope.orderInvoicesTypeList = [];
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
            if ($scope.paid_invoice.payment_method.id == 1)
              $scope.paid_invoice.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.paid_invoice.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }
        if ($scope.paid_invoice.currency) {
          $scope.amount_currency = site.toNumber($scope.paid_invoice.remain_amount) / site.toNumber($scope.paid_invoice.currency.ex_rate);
          $scope.amount_currency = site.toNumber($scope.amount_currency);
          $scope.paid_invoice.payment_paid_up = $scope.amount_currency;
        }
        site.showModal('#invoicesPaymentModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.calc = function (account_invoices) {
    $scope.error = '';
    $timeout(() => {
      let total_price_item = 0;
      if (account_invoices.current_book_list) {
        account_invoices.current_book_list.map(item => total_price_item += item.total);

        account_invoices.net_value = site.toNumber(total_price_item) + (account_invoices.service || 0) + (account_invoices.price_delivery_service || 0) + (account_invoices.total_tax || 0) - (account_invoices.total_discount || 0);
      }

      if (account_invoices.currency) {
        $scope.amount_currency = (account_invoices.remain_amount || account_invoices.net_value) / account_invoices.currency.ex_rate;
        $scope.amount_currency = site.toNumber($scope.amount_currency);
        account_invoices.paid_up = $scope.amount_currency;

      }
    }, 250);

  };
  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count == 1) {
      $scope.account_invoices.current_book_list.splice($scope.account_invoices.current_book_list.indexOf(item), 1)

    } else if (item.count > 1) {
      item.count -= 1;
      item.total -= item.price;
      return item
    }
    item.total = item.count * item.price;
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
        if (site.feature('pos')) $scope.transactionTypeList = response.data.filter(i => i.id != 1);
        else $scope.transactionTypeList = response.data;
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

  $scope.getSourceType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sourceTypeList = [];
    $http({
      method: "POST",
      url: "/api/source_type/all"
    }).then(
      function (response) {
        $scope.busy = false;

        if (site.feature('gym')) $scope.sourceTypeList = response.data.filter(i => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant') || site.feature('pos')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('academy')) $scope.sourceTypeList = response.data.filter(i => i.id != 4 && i.id != 3);
        else $scope.sourceTypeList = response.data;

        $scope.sourceTypeList.forEach(_t => {
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

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getAccountInvoicesList($scope.search);
    site.hideModal('#accountInvoicesSearchModal');
    $scope.search = {}
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

    $scope.account_invoices.total_remain = $scope.account_invoices.net_value - $scope.account_invoices.paid_up;

    $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
    $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up);
    $scope.account_invoices.total_tax = site.toNumber($scope.account_invoices.total_tax);
    $scope.account_invoices.total_discount = site.toNumber($scope.account_invoices.total_discount);
    $scope.account_invoices.net_value = site.toNumber($scope.account_invoices.net_value);
    $scope.account_invoices.paid_up = site.toNumber($scope.account_invoices.paid_up);
    $scope.account_invoices.payment_paid_up = site.toNumber($scope.account_invoices.payment_paid_up);



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
        value: $scope.account_invoices.payment_paid_up ? ' Bill payment ' : 'Bill ' + ($scope.account_invoices.code || '')
      },
      {
        type: 'space'
      }
    );

    if ($scope.account_invoices.date)
      obj_print.data.push({
        type: 'text2',
        value2: site.toDateXF($scope.account_invoices.date),
        value: 'Date'
      });

    if ($scope.account_invoices.customer)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.customer.name_ar,
        value: 'Cutomer'
      });

    if ($scope.account_invoices.vendor)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.vendor.name_ar,
        value: 'Vendor'
      });


    if ($scope.account_invoices.service_name)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.service_name,
        value: 'Service'
      });

    if ($scope.account_invoices.table)
      obj_print.data.push({
        type: 'text2',
        value: $scope.account_invoices.table.name,
        value2: $scope.account_invoices.table.tables_group.name
      });

    if ($scope.account_invoices.current_book_list && $scope.account_invoices.current_book_list.length > 0) {

      obj_print.data.push(
        {
          type: 'space'
        },
        {
          type: 'line'
        },
        {
          type: 'text3b',
          value: 'Item',
          value2: 'Count',
          value3: 'Price'
        },
        {
          type: 'text3b',
          value: 'الصنف',
          value2: 'العدد',
          value3: 'السعر'
        }, {
        type: 'space'
      }
      );

      $scope.account_invoices.current_book_list.forEach(_current_book_list => {
        obj_print.data.push({
          type: 'text3',
          value: _current_book_list.size,
          value2: _current_book_list.count,
          value3: _current_book_list.total
        },
          {
            type: 'line'
          })
      });
    };

    obj_print.data.push({
      type: 'line'
    });

    if ($scope.account_invoices.total_tax)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_tax,
        value: 'Total Taxes'
      });

    if ($scope.account_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.total_discount,
        value: 'Total Discount'
      });

    if ($scope.account_invoices.price_delivery_service)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.price_delivery_service,
        value: 'Service Delivery'
      });

    if ($scope.account_invoices.service)
      obj_print.data.push({
        type: 'text2',
        value2: $scope.account_invoices.service,
        value: 'Service'
      });

    obj_print.data.push({ type: 'space' });

    if ($scope.account_invoices.payment_paid_up) {
      $scope.account_invoices.total_remain = $scope.account_invoices.total_remain - $scope.account_invoices.payment_paid_up;
      $scope.account_invoices.total_paid_up = $scope.account_invoices.total_paid_up + $scope.account_invoices.payment_paid_up;

      $scope.account_invoices.total_remain = site.toNumber($scope.account_invoices.total_remain);
      $scope.account_invoices.total_paid_up = site.toNumber($scope.account_invoices.total_paid_up);

    }

    if ($scope.account_invoices.net_value)
      obj_print.data.push(
        {
          type: 'text2',
          value2: $scope.account_invoices.net_value,
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

  $scope.getOrderTypeSetting = function () {
    $scope.error = '';
    $scope.account_invoices.order_invoices_type = {};
    if ($scope.account_invoices.source_type && $scope.account_invoices.source_type.id == 3 && $scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.order_type) {
      $scope.getTransactionTypeList();
      $scope.account_invoices.order_invoices_type = $scope.defaultSettings.general_Settings.order_type;
    }
  };

  $scope.getDefaultSetting = function () {
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

  $scope.handelInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/account_invoices/handel_invoice"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.getAccountInvoicesList();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadEmployees = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          trainer: { $ne: true },
          delivery: { $ne: true },
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.employeesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadInNames = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/all",
      data: {
        where: { in: true },
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.namesInList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  $scope.loadOutNames = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/in_out_names/all",
      data: {
        where: { out: true },
        select: { id: 1, name: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.namesOutList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadVendors = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/vendors/all",
        data: {

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
    }
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

  $scope.get_open_shift = function (callback) {
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

  $scope.getDefaultSetting();
  $scope.getAccountInvoicesList({ date: new Date() });
  $scope.getSourceType();
  $scope.loadCurrencies();
  $scope.loadInNames();
  $scope.loadOutNames();
  $scope.loadEmployees();
  $scope.loadDelegates();
  $scope.getPaymentMethodList();
});