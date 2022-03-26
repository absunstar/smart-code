app.controller('account_invoices', function ($scope, $http, $timeout) {
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
          source_type: $scope.source_type,
        };

        if (site.toNumber('##query.type##') === 16) {
          $scope.account_invoices.op_ba_value = 0;
          $scope.account_invoices.op_balance_type = 'creditor';
        }

        if ($scope.defaultSettings.accounting) {
          if ($scope.account_invoices.source_type && $scope.account_invoices.source_type.id === 3) $scope.getTransactionTypeList();
          $scope.account_invoices.currency = $scope.currencySetting;

          if ($scope.defaultSettings.accounting.payment_method) {
            $scope.account_invoices.payment_method = $scope.defaultSettings.accounting.payment_method;
            $scope.loadSafes($scope.account_invoices.payment_method, $scope.account_invoices.currency);
            if ($scope.account_invoices.payment_method.id === 1) $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_box;
            else $scope.account_invoices.safe = $scope.defaultSettings.accounting.safe_bank;
          }
        }

        if ($scope.defaultSettings.general_Settings) {
          if (
            $scope.defaultSettings.general_Settings.payment_type &&
            site.toNumber('##query.type##') != 8 &&
            site.toNumber('##query.type##') != 9 &&
            site.toNumber('##query.type##') != 10 &&
            site.toNumber('##query.type##') != 11 &&
            site.toNumber('##query.type##') != 14
          )
            $scope.account_invoices.payment_type = $scope.defaultSettings.general_Settings.payment_type;

          if ($scope.defaultSettings.general_Settings && !$scope.defaultSettings.general_Settings.work_posting) $scope.account_invoices.posting = true;
          if ($scope.defaultSettings.general_Settings.order_type && $scope.account_invoices.source_type && $scope.account_invoices.source_type.id === 3)
            $scope.account_invoices.order_invoices_type = $scope.defaultSettings.general_Settings.order_type;

          if (
            site.toNumber('##query.type##') == 13 ||
            (site.toNumber('##query.type##') == 10 && $scope.defaultSettings.general_Settings.customer && $scope.defaultSettings.general_Settings.customer.id)
          ) {
            $scope.account_invoices.customer = $scope.customersGetList.find((_customer) => {
              return _customer.id === $scope.defaultSettings.general_Settings.customer.id;
            });
          }

          if (site.toNumber('##query.type##') == 13) {
            if ($scope.defaultSettings.general_Settings.school_grade) {
              $scope.account_invoices.school_grade = $scope.schoolGradesList.find((_schoolGrade) => {
                return _schoolGrade.id === $scope.defaultSettings.general_Settings.school_grade.id;
              });
              if ($scope.account_invoices.school_grade && $scope.account_invoices.school_grade.id) {
                $scope.getStudentsYearsList($scope.account_invoices.school_grade);
              }
            }
          }
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
      } else if (site.toNumber('##query.type##') === 16) {
        if (!$scope.account_invoices.target_account || ($scope.account_invoices.target_account && !$scope.account_invoices.target_account.id)) {
          $scope.error = '##word.target_account_must_selected##';
          return;
        } else if ($scope.account_invoices.target_account && $scope.account_invoices.target_account.id === 1 && !$scope.account_invoices.customer) {
          $scope.error = '##word.target_customer_account_must_selected##';
          return;
        } else if ($scope.account_invoices.target_account && $scope.account_invoices.target_account.id === 2 && !$scope.account_invoices.vendor) {
          $scope.error = '##word.target_vendor_account_must_selected##';
          return;
        }
      } else if ($scope.account_invoices.paid_up > 0 && !$scope.account_invoices.safe) {
        $scope.error = '##word.should_select_safe##';
        return;
      } else if ($scope.account_invoices.total_tax > $scope.total_tax) {
        $scope.error = '##word.err_total_tax##';
        return;
      } else if ($scope.account_invoices.total_discount > $scope.total_discount) {
        $scope.error = '##word.err_total_discount##';
        return;
      } else if ($scope.account_invoices.price_delivery_service > $scope.price_delivery_service) {
        $scope.error = '##word.err_price_delivery_service##';
        return;
      } else if ($scope.account_invoices.service > $scope.service) {
        $scope.error = '##word.err_service##';
        return;
      } else if (
        $scope.account_invoices.paid_up > $scope.amount_currency &&
        $scope.account_invoices.source_type &&
        $scope.account_invoices.source_type.id != 8 &&
        $scope.account_invoices.source_type.id != 9 &&
        $scope.account_invoices.source_type.id != 10 &&
        $scope.account_invoices.source_type.id != 11
      ) {
        $scope.error = '##word.err_net_value##';
        return;
      } else if (new Date($scope.account_invoices.date) > new Date()) {
        $scope.error = '##word.date_exceed##';
        return;
      } else if ($scope.account_invoices.customer && $scope.account_invoices.payment_method && $scope.account_invoices.payment_method.id === 10) {
        if (customer && $scope.account_invoices.currency) {
          let totalCustomerBalance = 0;
          let customerPay = $scope.account_invoices.paid_up * $scope.account_invoices.currency.ex_rate;

          totalCustomerBalance = ($scope.customer.balance || 0) + ($scope.customer.credit_limit || 0);

          if (customerPay > totalCustomerBalance) {
            $scope.error = '##word.cannot_exceeded_customer##';
            return;
          }
        }
      }

      if ($scope.account_invoices.source_type) {
        if (
          (!$scope.account_invoices.out_type && !$scope.account_invoices.in_type) &&
          ($scope.account_invoices.source_type.id === 8 ||
            $scope.account_invoices.source_type.id === 9 ||
            $scope.account_invoices.source_type.id === 10 ||
            $scope.account_invoices.source_type.id === 11)
        ) {
          $scope.account_invoices.net_value = $scope.account_invoices.paid_up;
        }
      }

      if (site.toNumber('##query.type##') === 13) {
        if (!$scope.account_invoices.types_expenses) {
          $scope.error = '##word.must_choose_type_tuition_fees##';
          return;
        }

        if (!$scope.account_invoices.school_grade) {
          $scope.error = '##word.must_choose##' + '##word.school_grade##';
          return;
        }

        if (!$scope.account_invoices.students_year) {
          $scope.error = '##word.must_choose##' + '##word.students_year##';
          return;
        }
      }

      if ($scope.account_invoices.paid_up < $scope.amount_currency && $scope.account_invoices.payment_type && $scope.account_invoices.payment_type.id == 1) {
        $scope.error = '##word.amount_must_paid_full##';
        return;
      }

      $scope.financialYear($scope.account_invoices.date, (is_allowed_date) => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {
          $http({
            method: 'POST',
            url: '/api/account_invoices/add',
            data: $scope.account_invoices,
          }).then(
            function (response) {
              if (response.data.done) {
                site.hideModal('#accountInvoicesAddModal');
                /*  $scope.printAccountInvoive($scope.account_invoices); */
                $scope.getAccountInvoicesList({ date: new Date() });
              } else {
                $scope.error = response.data.error;
                if (response.data.error.like('*duplicate key error*')) {
                  $scope.error = '##word.code_exisit##';
                } else if (response.data.error.like('*Please write code*')) {
                  $scope.error = '##word.enter_code_inventory##';
                } else if (response.data.error.like('*n`t Found Open Shi*')) {
                  $scope.error = '##word.open_shift_not_found##';
                } else if (response.data.error.like('*n`t Open Perio*')) {
                  $scope.error = '##word.should_open_period##';
                } else if (response.data.error.like('*Must Enter Code*')) {
                  $scope.error = '##word.must_enter_code##';
                } else if (response.data.error.like('*sure to specify the data of the transferee*')) {
                  $scope.error = '##word.sure_specify_data_transferee##';
                } else if (response.data.error.like('*pay more than the amount due*')) {
                  $scope.error = '##word.not_possible_pay_more_than_amount_due##';
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

  $scope.posting = function (account_invoices) {
    $scope.error = '';

    $scope.financialYear(account_invoices.date, (is_allowed_date) => {
      if (!is_allowed_date) {
        $scope.error = '##word.should_open_period##';
        if (account_invoices.posting) account_invoices.posting = false;
        else account_invoices.posting = true;
      } else {
        $scope.busy = true;

        $http({
          method: 'POST',
          url: '/api/account_invoices/posting',
          data: account_invoices,
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
            } else {
              $scope.error = response.data.error;
              if (response.data.error.like('*n`t Found Open Shi*')) {
                $scope.error = '##word.open_shift_not_found##';
              } else if (response.data.error.like('*n`t Open Perio*')) {
                $scope.error = '##word.should_open_period##';
              }
              if (account_invoices.posting) account_invoices.posting = false;
              else account_invoices.posting = true;
            }
          },
          function (err) {
            console.log(err);
          }
        );
      }
    });
  };

  $scope.postingAll = function (account_invoices_all) {
    $scope.error = '';

    let _account_invoices_all = account_invoices_all.reverse();

    for (let i = 0; i < _account_invoices_all.length; i++) {
      setTimeout(() => {
        let _account_invoices = _account_invoices_all[i];

        if (!_account_invoices.posting) {
          $scope.financialYear(_account_invoices.date, (is_allowed_date) => {
            if (!is_allowed_date) {
              $scope.error = '##word.should_open_period##';
            } else {
              _account_invoices.posting = true;

              $http({
                method: 'POST',
                url: '/api/account_invoices/posting',
                data: _account_invoices,
              }).then(
                function (response) {
                  if (response.data.done) {
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
        }
      }, 100 * 1 * i);
    }
  };

  $scope.displayUpdateAccountInvoices = function (account_invoices) {
    $scope.error = '';
    $scope._search = {};

    $scope.detailsAccountInvoices(account_invoices);
    $scope.account_invoices = {};
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
      } else if (site.toNumber('##query.type##') === 16) {
        if (!$scope.account_invoices.target_account || ($scope.account_invoices.target_account && !$scope.account_invoices.target_account.id)) {
          $scope.error = '##word.target_account_must_selected##';
          return;
        } else if ($scope.account_invoices.target_account && $scope.account_invoices.target_account.id === 1 && !$scope.account_invoices.customer) {
          $scope.error = '##word.target_customer_account_must_selected##';
          return;
        } else if ($scope.account_invoices.target_account && $scope.account_invoices.target_account.id === 2 && !$scope.account_invoices.vendor) {
          $scope.error = '##word.target_vendor_account_must_selected##';
          return;
        }
      } else if ($scope.account_invoices.paid_up > 0 && !$scope.account_invoices.safe) {
        $scope.error = '##word.should_select_safe##';
        return;
      } else if ($scope.account_invoices.total_tax > $scope.total_tax) {
        $scope.error = '##word.err_total_tax##';
        return;
      } else if ($scope.account_invoices.total_discount > $scope.total_discount) {
        $scope.error = '##word.err_total_discount##';
        return;
      } else if ($scope.account_invoices.price_delivery_service > $scope.price_delivery_service) {
        $scope.error = '##word.err_price_delivery_service##';
        return;
      } else if ($scope.account_invoices.service > $scope.service) {
        $scope.error = '##word.err_service##';
        return;
      } else if (
        $scope.account_invoices.paid_up > $scope.amount_currency &&
        $scope.account_invoices.source_type &&
        $scope.account_invoices.source_type.id != 8 &&
        $scope.account_invoices.source_type.id != 9 &&
        $scope.account_invoices.source_type.id != 10 &&
        $scope.account_invoices.source_type.id != 11
      ) {
        $scope.error = '##word.err_net_value##';
        return;
      } else if (new Date($scope.account_invoices.date) > new Date()) {
        $scope.error = '##word.date_exceed##';
        return;
      } else if ($scope.account_invoices.customer && $scope.account_invoices.payment_method && $scope.account_invoices.payment_method.id === 10) {
        if (customer && $scope.account_invoices.currency) {
          let totalCustomerBalance = 0;
          let customerPay = $scope.account_invoices.paid_up * $scope.account_invoices.currency.ex_rate;

          totalCustomerBalance = ($scope.customer.balance || 0) + ($scope.customer.credit_limit || 0);

          if (customerPay > totalCustomerBalance) {
            $scope.error = '##word.cannot_exceeded_customer##';
            return;
          }
        }
      }

      if ($scope.account_invoices.source_type) {
        if (
          $scope.account_invoices.source_type.id === 8 ||
          $scope.account_invoices.source_type.id === 9 ||
          $scope.account_invoices.source_type.id === 10 ||
          $scope.account_invoices.source_type.id === 11
        ) {
          $scope.account_invoices.net_value = $scope.account_invoices.paid_up;
        }
      }

      $scope.financialYear($scope.account_invoices.date, (is_allowed_date) => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {
          $http({
            method: 'POST',
            url: '/api/account_invoices/update',
            data: $scope.account_invoices,
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                site.hideModal('#accountInvoicesUpdateModal');
                $scope.getAccountInvoicesList({ date: new Date() });
              } else {
                $scope.error = response.data.error;
                if (response.data.error.like('*n`t Found Open Shi*')) {
                  $scope.error = '##word.open_shift_not_found##';
                } else if (response.data.error.like('*n`t Open Perio*')) {
                  $scope.error = '##word.should_open_period##';
                } else if (response.data.error.like('*sure to specify the data of the transferee*')) {
                  $scope.error = '##word.sure_specify_data_transferee##';
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

  $scope.displayDetailsAccountInvoices = function (account_invoices) {
    $scope.error = '';
    $scope.detailsAccountInvoices(account_invoices);
    $scope.account_invoices = {};
    site.showModal('#accountInvoicesDetailsModal');
  };

  $scope.detailsAccountInvoices = function (account_invoices) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/account_invoices/view',
      data: {
        id: account_invoices.id,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.doc) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.account_invoices = response.data.doc;
          if ($scope.account_invoices.currency) {
            site.strings['currency'] = {
              ar: ' ' + $scope.account_invoices.currency.name_ar + ' ',
              en: ' ' + $scope.account_invoices.currency.name_en + ' ',
            };
            site.strings['from100'] = {
              ar: ' ' + $scope.account_invoices.currency.minor_currency_ar + ' ',
              en: ' ' + $scope.account_invoices.currency.minor_currency_en + ' ',
            };

            $scope.account_invoices.net_txt = site.stringfiy($scope.account_invoices.net_value,'##session.lang##');
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
    if (source_type.id === 3) $scope.getTransactionTypeList();
  };

  $scope.deleteAccountInvoices = function () {
    $scope.error = '';
    $scope.busy = true;

    $scope.financialYear($scope.account_invoices.date, (is_allowed_date) => {
      if (!is_allowed_date) {
        $scope.error = '##word.should_open_period##';
      } else {
        $http({
          method: 'POST',
          url: '/api/account_invoices/delete',
          data: $scope.account_invoices,
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
      }
    });
  };

  $scope.getAccountInvoicesList = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;

    if (!where || !Object.keys(where).length) {
      where = { limit: 100, source_type: { id: site.toNumber('##query.type##') } };
    } else {
      where.source_type = { id: site.toNumber('##query.type##') };
    }

    $http({
      method: 'POST',
      url: '/api/account_invoices/all',
      data: {
        where: where,
      },
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
    );
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
        $scope.error = '##word.should_select_safe##';
        return;
      } else if (!$scope.paid_invoice.payment_paid_up) {
        $scope.error = '##word.err_paid_up##';
        return;
      } else if ($scope.paid_invoice.payment_paid_up > $scope.amount_currency) {
        $scope.error = '##word.err_paid_up_payment##';
        return;
      } else if (
        $scope.paid_invoice.payment_paid_up > $scope.amount_currency &&
        $scope.paid_invoice.source_type &&
        $scope.paid_invoice.source_type.id != 8 &&
        $scope.paid_invoice.source_type.id != 9 &&
        $scope.paid_invoice.source_type.id != 10 &&
        $scope.paid_invoice.source_type.id != 11
      ) {
        $scope.error = '##word.err_net_value##';
        return;
      }

      if ($scope.paid_invoice.customer && $scope.paid_invoice.payment_method && $scope.paid_invoice.payment_method.id === 10) {
        if (customer && $scope.paid_invoice.currency) {
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
            $scope.getAccountInvoicesList({ date: new Date() });

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

  $scope.detailsCustomer = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    let customer = {};

    if ($scope.paid_invoice && $scope.paid_invoice.customer) {
      customer = $scope.paid_invoice.customer;
    } else if ($scope.account_invoices && $scope.account_invoices.customer) {
      customer = $scope.account_invoices.customer;
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
          callback({});
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.loadOrderInvoicesType = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    $scope.orderInvoicesTypeList = [];
    if ($scope.account_invoices.source_type.id === 3 && !$scope.account_invoices.order_invoices_type) {
      $scope.error = '##word.err_order_type##';
      return;
    } else if (ev.which === 13) {
      let where = {};
      let url = '/api/stores_in/all';

      if ($scope.account_invoices.source_type && !$scope.account_invoices.in_type && !$scope.account_invoices.out_type) {
        if ($scope.account_invoices.source_type.id === 1) {
          url = '/api/stores_in/all';
          where = { 'type.id': 1 };
        } else if ($scope.account_invoices.source_type.id === 2) {
          url = '/api/stores_out/all';
          where = { 'type.id': { $ne: 4 } };
        } else if ($scope.account_invoices.source_type.id === 3) url = '/api/order_invoice/invoices';
        else if ($scope.account_invoices.source_type.id === 4) url = '/api/request_activity/all';
        else if ($scope.account_invoices.source_type.id === 5) url = '/api/book_hall/all';
        else if ($scope.account_invoices.source_type.id === 12) {
          url = '/api/account_invoices/all';

          if ($scope.account_invoices.employee && $scope.account_invoices.employee.id) {
            where.source_type = { id: 11 };
            where.employee = $scope.account_invoices.employee;
          } else {
            return;
          }
        }
      } else if ($scope.account_invoices.in_type) {
        url = '/api/account_invoices/all';
        where['remain_amount'] = { $ne: 0 };

        if ($scope.account_invoices.in_type.id === 2) {
          where['invoice_type.id'] = 4;
          where['source_type.id'] = 3;
        } else if ($scope.account_invoices.in_type.id === 3) {
          where['invoice_type.id'] = 3;
          where['source_type.id'] = 2;
        }
      } else if ($scope.account_invoices.out_type) {
        url = '/api/account_invoices/all';
        where['remain_amount'] = { $ne: 0 };

        if ($scope.account_invoices.out_type.id === 2) {
          where['invoice_type.id'] = 1;
          where['source_type.id'] = 1;
        } else if ($scope.account_invoices.out_type.id === 3) {
          where['invoice_type.id'] = 3;
          where['source_type.id'] = 2;
        } else if ($scope.account_invoices.out_type.id === 4) {
          where['invoice_type.id'] = 4;
          where['source_type.id'] = 1;
        }
      }

      where.invoice = { $ne: true };
      where.posting = true;

      $http({
        method: 'POST',
        url: url,
        data: {
          search: $scope.search_order,
          order_invoices_type: $scope.account_invoices.order_invoices_type,
          where: where,
        },
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
      );
    }
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
            if ($scope.defaultSettings && $scope.defaultSettings.accounting && $scope.defaultSettings.accounting.currency && $scope.defaultSettings.accounting.currency.id === _c.id) {
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
      if (obj.payment_method.id === 1) {
        if ($scope.defaultSettings.accounting.safe_box) obj.safe = $scope.defaultSettings.accounting.safe_box;
      } else {
        if ($scope.defaultSettings.accounting.safe_bank) obj.safe = $scope.defaultSettings.accounting.safe_bank;
      }

      if (site.toNumber('##query.type##') === 14) {
        $scope.loadSafes($scope.account_invoices.payment_method_to, $scope.account_invoices.currency, 'to');
      }
    }
  };

  $scope.loadSafes = function (method, currency, type) {
    $scope.error = '';
    $scope.busy = true;

    if (currency && currency.id && method && method.id) {
      let where = { 'currency.id': currency.id };

      if (method.id === 1) where['type.id'] = 1;
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
            if (type === 'to') {
              $scope.safesListTo = response.data.list;
            } else {
              $scope.safesList = response.data.list;
            }
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.getSafes = function () {
    $scope.error = '';
    $scope.busy = true;

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
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) $scope.getSafesList = response.data.list;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.selectOrderInvoices = function (item) {
    $scope.error = '';
    $scope.account_invoices.items = [];
    $scope.account_invoices.payable_list = item.payable_list;
    $scope.account_invoices.customer = item.customer;
    $scope.account_invoices.tenant = item.tenant;
    $scope.account_invoices.invoice_type = item.type;
    $scope.account_invoices.vendor = item.vendor;
    $scope.account_invoices.total_value = item.total_value;
    $scope.account_invoices.total_value_added = item.total_value_added;
    $scope.account_invoices.delivery_employee = item.delivery_employee;
    $scope.account_invoices.table = item.table;
    $scope.account_invoices.services_price = item.services_price;
    $scope.account_invoices.activity_name_ar = item.activity_name_ar;
    $scope.account_invoices.activity_name_en = item.activity_name_en;
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
    $scope.account_invoices.remain_source = item.remain_amount;
    $scope.account_invoices.invoice_code = item.code;
    $scope.account_invoices.paid_up = 0;
    $scope.total_tax = $scope.account_invoices.total_tax;
    $scope.total_discount = $scope.account_invoices.total_discount;
    $scope.price_delivery_service = $scope.account_invoices.price_delivery_service;
    $scope.service = $scope.account_invoices.service;

    if ($scope.account_invoices.source_type && $scope.account_invoices.source_type.id === 3) {
      item.under_paid.items.forEach((_item) => {
        if (_item.count > 0) {
          $scope.account_invoices.items.push(_item);
        }
      });
    } else $scope.account_invoices.items = item.items;
    $scope.calc($scope.account_invoices, 'pay');
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
            if ($scope.paid_invoice.payment_method.id === 1) $scope.paid_invoice.safe = $scope.defaultSettings.accounting.safe_box;
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

  $scope.calc = function (account_invoices, type) {
    $scope.error = '';
    $timeout(() => {
      let total_price_item = 0;
      if (account_invoices.items) {
        account_invoices.items.map((item) => (total_price_item += item.total));

        account_invoices.net_value =
          site.toNumber(total_price_item) +
          (account_invoices.service || 0) +
          (account_invoices.price_delivery_service || 0) +
          (account_invoices.total_tax || 0) -
          (account_invoices.total_discount || 0);
      }

      /*    if(account_invoices.remain_source){
        account_invoices.net_value = account_invoices.remain_source;
      } */

      if (account_invoices.currency) {
        if (type === 'pay') {
          $scope.amount_currency = (account_invoices.remain_amount || account_invoices.remain_source) / account_invoices.currency.ex_rate;
        } else {
          $scope.amount_currency = account_invoices.net_value / account_invoices.currency.ex_rate;
        }

        $scope.amount_currency = site.toNumber($scope.amount_currency);
        if (account_invoices.Paid_from_customer <= $scope.amount_currency) {
          account_invoices.paid_up = account_invoices.Paid_from_customer;
        } else if (account_invoices.Paid_from_customer > $scope.amount_currency) {
          account_invoices.paid_up = $scope.amount_currency;
        }
      }
    }, 250);
  };
  $scope.deleteItemsList = function (item) {
    $scope.error = '';

    if (item.count === 1) {
      $scope.account_invoices.items.splice($scope.account_invoices.items.indexOf(item), 1);
    } else if (item.count > 1) {
      item.count -= 1;
      item.total -= item.price;
      return item;
    }
    item.total = item.count * item.price;
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
        if (site.feature('pos') || site.feature('erp') || site.feature('ecommerce')) $scope.transactionTypeList = response.data.filter((i) => i.id != 1);
        else $scope.transactionTypeList = response.data;
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
        if (
          site.toNumber('##query.type##') === 1 ||
          site.toNumber('##query.type##') === 5 ||
          site.toNumber('##query.type##') === 6 ||
          site.toNumber('##query.type##') === 9 ||
          site.toNumber('##query.type##') === 11 ||
          site.toNumber('##query.type##') === 12 ||
          site.toNumber('##query.type##') === 14
        ) {
          $scope.paymentMethodList = response.data.filter((i) => i.id != 5);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getTargetAccountList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.targetAccountList = [];
    $http({
      method: 'POST',
      url: '/api/target_account/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.targetAccountList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getInTypesList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.inTypesList = [];
    $http({
      method: 'POST',
      url: '/api/in_type/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.inTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getOutTypesList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.outTypesList = [];
    $http({
      method: 'POST',
      url: '/api/out_type/all',
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.outTypesList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getSourceType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.sourceTypeList = [];
    $http({
      method: 'POST',
      url: '/api/source_type/all',
    }).then(
      function (response) {
        $scope.busy = false;

        if (site.feature('club')) $scope.sourceTypeList = response.data.filter((i) => i.id != 3 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('restaurant') || site.feature('pos') || site.feature('erp') || site.feature('ecommerce'))
          $scope.sourceTypeList = response.data.filter((i) => i.id != 4 && i.id != 5 && i.id != 6 && i.id != 7);
        else if (site.feature('academy')) $scope.sourceTypeList = response.data.filter((i) => i.id != 4 && i.id != 3);
        else $scope.sourceTypeList = response.data;

        $scope.sourceTypeList.forEach((_t) => {
          if (_t.id == site.toNumber('##query.type##')) $scope.source_type = _t;
        });
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.searchAll = function () {
    $scope._search = {};
    $scope.getAccountInvoicesList($scope.search);
    site.hideModal('#accountInvoicesSearchModal');
    $scope.search = {};
  };

  /*   $scope.printAccountInvoive = function (account_invoices) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;

    let name_lang = 'name_ar';
    if ('##session.lang##' === 'en') name_lang = 'name_en';

    let ip = '127.0.0.1';
    let port = '60080';

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.printer_path) {
      ip = $scope.defaultSettings.printer_program.printer_path.ip_device || '127.0.0.1';
      port = $scope.defaultSettings.printer_program.printer_path.Port_device || '60080';
    }

    if (account_invoices.currency) account_invoices.total_remain = account_invoices.net_value - account_invoices.paid_up * account_invoices.currency.ex_rate;

    account_invoices.total_remain = site.toNumber(account_invoices.total_remain);
    account_invoices.total_paid_up = site.toNumber(account_invoices.total_paid_up);
    account_invoices.total_tax = site.toNumber(account_invoices.total_tax);
    account_invoices.total_discount = site.toNumber(account_invoices.total_discount);
    account_invoices.net_value = site.toNumber(account_invoices.net_value);
    account_invoices.paid_up = site.toNumber(account_invoices.paid_up);
    account_invoices.payment_paid_up = site.toNumber(account_invoices.payment_paid_up);

    let obj_print = {
      data: [],
    };

    if ($scope.defaultSettings.printer_program) {
      if ($scope.defaultSettings.printer_program.printer_path) obj_print.printer = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();

      if ($scope.defaultSettings.printer_program.invoice_top_title) {
        obj_print.data.push({
          type: 'invoice-top-title',
          name: $scope.defaultSettings.printer_program.invoice_top_title,
        });
      } else {
        obj_print.data.push({
          type: 'invoice-top-title',
          name: 'Smart Code',
        });
      }

      if ($scope.defaultSettings.printer_program.invoice_logo) {
        obj_print.data.push({
          type: 'invoice-logo',
          url: document.location.origin + $scope.defaultSettings.printer_program.invoice_logo,
        });
      } else {
        obj_print.data.push({
          type: 'invoice-logo',
          url: 'http://127.0.0.1/images/logo.png',
        });
      }

      if ($scope.defaultSettings.printer_program.thermal_header && $scope.defaultSettings.printer_program.thermal_header.length > 0) {
        $scope.defaultSettings.printer_program.thermal_header.forEach((_ih) => {
          obj_print.data.push({
            type: 'header',
            value: _ih.name,
          });
        });
      }
    }

    obj_print.data.push(
      {
        type: 'title',
        value: account_invoices.payment_paid_up ? ' Bill payment ' : 'Bill ' + (account_invoices.code || ''),
      },
      {
        type: 'space',
      }
    );

    if (account_invoices.date)
      obj_print.data.push({
        type: 'invoice-date',
        name: '##word.date##',
        value: site.toDateXF(account_invoices.date),
      });

    if (account_invoices.order_invoices_type)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.order_invoices_type['##session.lang##'],
        value: '##word.order_type##',
      });

    if (account_invoices.customer)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.customer[name_lang],
        value: '##word.customer##',
      });

    if (account_invoices.vendor)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.vendor[name_lang],
        value: 'Vendor',
      });

    if (account_invoices.activity_name_ar)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.activity_name_ar,
        value: 'Service',
      });

    if (account_invoices.table)
      obj_print.data.push({
        type: 'text2',
        value: account_invoices.table[name_lang],
        value2: account_invoices.table.tables_group[name_lang],
      });

    if (account_invoices.items && account_invoices.items.length > 0) {
      let size_lang = 'size_ar';
      if ('##session.lang##' === 'en') size_lang = 'size_en';

      obj_print.data.push(
        {
          type: 'line',
        },
        {
          type: 'invoice-item-title',
          count: '##word.count##',
          name: '##word.name##',
          price: '##word.price##',
        },
        {
          type: 'line2',
        }
      );

      account_invoices.items.forEach((_items, i) => {
        _items.total = site.toNumber(_items.total);
        obj_print.data.push({
          type: 'invoice-item',
          count: _items.count,
          name: _items[size_lang],
          price: site.addSubZero(_items.total, 2),
        });
      });
    }

    obj_print.data.push({
      type: 'line',
    });

    if (account_invoices.currency)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.currency[name_lang],
        value: '##word.currency##',
      });

    obj_print.data.push({
      type: 'invoice-total',
      value: site.addSubZero(account_invoices.total_value - (account_invoices.total_value_added || 0), 2),
      name: '##word.total_before_taxes_discounts##',
    });

    if (account_invoices.total_value_added) {
      obj_print.data.push({
        type: 'text2',
        value2: `${site.addSubZero(account_invoices.total_value_added, 2)}  (${$scope.defaultSettings.inventory.value_added || 0}%)`,
        value: '##word.total_value_added##',
      });
    }

    if (account_invoices.total_tax)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.total_tax,
        value: '##word.total_tax##',
      });

    if (account_invoices.total_discount)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.total_discount,
        value: '##word.total_discount##',
      });

    if (account_invoices.price_delivery_service)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.price_delivery_service,
        value: '##word.delivery_service##',
      });

    if (account_invoices.service)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.service,
        value: '##word.service##',
      });

    obj_print.data.push({ type: 'space' });

    if (account_invoices.payment_paid_up) {
      account_invoices.total_remain = account_invoices.total_remain - account_invoices.payment_paid_up;
      account_invoices.total_paid_up = account_invoices.total_paid_up + account_invoices.payment_paid_up;

      account_invoices.total_remain = site.toNumber(account_invoices.total_remain);
      account_invoices.total_paid_up = site.toNumber(account_invoices.total_paid_up);
    }

    if (account_invoices.net_value) {
      obj_print.data.push(
        {
          type: 'invoice-total',
          value: site.addSubZero(account_invoices.net_value, 2),
          name: '##word.total_value##',
        },
        {
          type: 'invoice-total',
          value: site.stringfiy(account_invoices.net_value) + ($scope.defaultSettings.accounting.end_num_to_str || ''),
        },
        {
          type: 'line',
        }
      );
    }

    if (account_invoices.payment_paid_up || account_invoices.paid_up)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.payment_paid_up || account_invoices.paid_up,
        value: '##word.paid_up##',
      });

    if (account_invoices.payment_paid_up || account_invoices.paid_up)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.total_paid_up || account_invoices.paid_up,
        value: '##word.total_payments##',
      });

    obj_print.data.push({ type: 'space' });

    if (account_invoices.total_remain)
      obj_print.data.push({
        type: 'text2',
        value2: account_invoices.total_remain,
        value: '##word.remain##',
      });

    if (account_invoices.Paid_from_customer) {
      account_invoices.remain_to_customer = 0;

      account_invoices.remain_to_customer = account_invoices.Paid_from_customer - account_invoices.paid_up;

      obj_print.data.push(
        {
          type: 'text2',
          value2: site.addSubZero(account_invoices.Paid_from_customer, 2),
          value: '##word.Paid_from_customer##',
        },
        {
          type: 'text2',
          value2: site.addSubZero(account_invoices.remain_to_customer, 2),
          value: '##word.remain_to_customer##',
        }
      );
    }

    obj_print.data.push(
      {
        type: 'line',
      },
      {
        type: 'invoice-barcode',
        value: obj.code || 'test',
      },
      {
        type: 'invoice-total',
        value: $scope.defaultSettings.printer_program.tax_number,
        name: '##word.tax_number##',
      },
      {
        type: 'line',
      }
    );

    if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.thermal_footer && $scope.defaultSettings.printer_program.thermal_footer.length > 0) {
      $scope.defaultSettings.printer_program.thermal_footer.forEach((_if) => {
        obj_print.data.push({
          type: 'header',
          value: _if.name,
        });
      });
    }

    $http({
      method: 'POST',
      url: `http://${ip}:${port}/print`,
      data: obj_print,
    }).then(
      function (response) {
        if (response.data.done) $scope.busy = false;
      },
      function (err) {
        console.log(err);
      }
    );
  }; */

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
    /*JsBarcode('.barcode', $scope.thermal.code);*/
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
      /*site.print({
                selector: '#thermalPrint',
                ip: '127.0.0.1',
                port: '60080',
                pageSize: "Letter",
                printer: $scope.defaultSettings.printer_program.printer_path.ip.name.trim(),
            });*/

      let printerName = $scope.defaultSettings.printer_program.printer_path.ip.name.trim();
      if ($scope.user.printer_path && $scope.user.printer_path.id) {
        printerName = $scope.user.printer_path.ip.name.trim();
      }

      site.printAsImage(
        {
          selector: '#thermalPrint',
          ip: '127.0.0.1',
          port: '60080',
          pageSize: 'Letter',
          printer: printerName,
        },
        () => {
          $timeout(() => {
            $('#thermalPrint').addClass('hidden');
          }, 2000);
        }
      );
    } else {
      $scope.error = '##word.thermal_printer_must_select##';
    }

    $scope.busy = false;
  };

  $scope.print = function (type) {
    $scope.error = '';
    if ($scope.busy) return;
    $scope.busy = true;
      $('#accountInvoiceDetails').removeClass('hidden');

      if ($scope.account_invoices.currency) {
        site.strings['currency'] = {
          ar: ' ' + $scope.account_invoices.currency.name_ar + ' ',
          en: ' ' + $scope.account_invoices.currency.name_en + ' ',
        };
        site.strings['from100'] = {
          ar: ' ' + $scope.account_invoices.currency.minor_currency_ar + ' ',
          en: ' ' + $scope.account_invoices.currency.minor_currency_en + ' ',
        };
        $scope.account_invoices.net_txt = site.stringfiy($scope.account_invoices.total_paid_up);
      }
      let printerName = '';
      if (type == 'a4') {
        if($scope.defaultSettings.printer_program.a4_printer){

          printerName = $scope.defaultSettings.printer_program.a4_printer.ip.name.trim();
        } else {
        $scope.error = '##word.a4_printer_must_select##';
        return;
      }
      if ($scope.user.a4_printer && $scope.user.a4_printer.id) {
        printerName = $scope.user.a4_printer.ip.name.trim();
      }
    } else if(type === 'pdf'){
        if($scope.defaultSettings.printer_program.pdf_printer){

          printerName = $scope.defaultSettings.printer_program.pdf_printer.ip.name.trim();
        } else {
        $scope.error = '##word.pdf_printer_must_select##';
        return;
      }
    }
     
      $timeout(() => {
        site.print({
          selector: '#accountInvoiceDetails',
          ip: '127.0.0.1',
          port: '60080',
          pageSize: 'A4',
          printer: printerName,
        });
      }, 500);
  
    $scope.busy = false;
    $timeout(() => {
      $('#accountInvoiceDetails').addClass('hidden');
    }, 8000);
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

  $scope.getCustomersList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      let where = { active: true };

      if ($scope.account_invoices.school_grade) where.school_grade = $scope.account_invoices.school_grade;

      if ($scope.account_invoices.students_year) where.students_year = $scope.account_invoices.students_year;

      $http({
        method: 'POST',
        url: '/api/customers/all',
        data: {
          search: $scope.search_customer,
          where: where,
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

  $scope.getOrderTypeSetting = function () {
    $scope.error = '';
    $scope.account_invoices.order_invoices_type = {};
    if ($scope.account_invoices.source_type && $scope.account_invoices.source_type.id === 3 && $scope.defaultSettings.general_Settings && $scope.defaultSettings.general_Settings.order_type) {
      $scope.getTransactionTypeList();
      $scope.account_invoices.order_invoices_type = $scope.defaultSettings.general_Settings.order_type;
    }
  };

  $scope.paymentsPayable = function (account_invoices, type) {
    $scope.error = '';
    account_invoices = account_invoices || {};
    account_invoices.payable_list = account_invoices.payable_list || [{}];
    if (type === 'view') {
      site.showModal('#addPaymentsModal');
    }
  };

  $scope.selectPaymentsPayable = function () {
    $scope.error = '';
    site.showModal('#selectPaymentsModal');
  };

  $scope.changeSelectPayableList = function (payableList, _i) {
    $scope.error = '';
    for (let i = 0; i < payableList.length; i++) {
      let p = payableList[i];
      if (i !== _i) {
        p.select = false;
      }
    }
  };

  $scope.getDefaultSettings = function () {
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
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.handelInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/account_invoices/handel_invoice',
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

  $scope.loadEmployees = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/employees/all',
      data: {
        where: {
          trainer: { $ne: true },
          delivery: { $ne: true },
          delegate: { $ne: true },
          active: true,
        },
      },
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
    );
  };

  $scope.loadInNames = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/in_out_names/all',
      data: {
        where: { in: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
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
    );
  };
  $scope.loadOutNames = function () {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/in_out_names/all',
      data: {
        where: { out: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
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
    );
  };

  $scope.loadVendors = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: 'POST',
        url: '/api/vendors/all',
        data: {},
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

  $scope.getSchoolGradesList = function () {
    $http({
      method: 'POST',
      url: '/api/school_grades/all',
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
        $scope.schoolGradesList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getStudentsYearsList = function (school_grade) {
    $http({
      method: 'POST',
      url: '/api/students_years/all',
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          types_expenses_list: 1,
          code: 1,
        },
        where: {
          active: true,
          'school_grade.id': school_grade.id,
        },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.studentsYearsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;

    let screen = '';
    if (site.toNumber('##query.type##')) {
      if (site.toNumber('##query.type##') === 1) screen = 'purchases_invoices';
      else if (site.toNumber('##query.type##') === 2) screen = 'sales_invoices';
      else if (site.toNumber('##query.type##') === 3) screen = 'o_screen_invoices';
      else if (site.toNumber('##query.type##') === 4) screen = 'request_activity_invoice';
      else if (site.toNumber('##query.type##') === 5) screen = 'booking_hall';
      else if (site.toNumber('##query.type##') === 6) screen = 'trainer_account';
      else if (site.toNumber('##query.type##') === 7) screen = 'course_booking';
      else if (site.toNumber('##query.type##') === 8) screen = 'amounts_in';
      else if (site.toNumber('##query.type##') === 9) screen = 'amounts_out';
      else if (site.toNumber('##query.type##') === 10) screen = 'recharge_customer_balance';
      else if (site.toNumber('##query.type##') === 11) screen = 'employee_advance';
      else if (site.toNumber('##query.type##') === 12) screen = 'payment_employee_advance';
      else if (site.toNumber('##query.type##') === 13) screen = 'school_fees';
      else if (site.toNumber('##query.type##') === 14) screen = 'transfer_safes_balances';
      else if (site.toNumber('##query.type##') === 15) screen = 'patient_ticket';
      else if (site.toNumber('##query.type##') === 16) screen = 'opening_balance';

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
            $scope.disabledCodeInvoice = response.data.isAuto;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      );
    }
  };

  $scope.changeTypesExpenses = function (types_expenses) {
    $scope.error = '';
    $scope.account_invoices.net_value = types_expenses.value;
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

  $scope.get_open_shift = function (callback) {
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/shifts/get_open_shift',
      data: {
        where: { active: true },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 },
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

  $scope.getDefaultSettings();
  $scope.getAccountInvoicesList({ date: new Date() });
  $scope.getSourceType();
  $scope.loadCurrencies();
  $scope.loadEmployees();
  $scope.loadDelegates();
  $scope.getUser();
  $scope.loadPaymentTypes();
  $scope.getSafes();
  if (site.feature('school')) {
    $scope.getSchoolGradesList();
  }
  if (site.toNumber('##query.type##') === 8) {
    $scope.getInTypesList();
    $scope.loadInNames();
  }
  if (site.toNumber('##query.type##') === 9) {
    $scope.getOutTypesList();
    $scope.loadOutNames();
  }
  if (site.toNumber('##query.type##') == 13 || site.toNumber('##query.type##') == 8 || site.toNumber('##query.type##') == 10) {
    $scope.getCustomersGetList();
  }
  $scope.getTargetAccountList();
  $scope.getPaymentMethodList();
  $scope.getNumberingAuto();
});
