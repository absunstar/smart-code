module.exports = function init(site) {
  const $account_invoices = site.connectCollection('account_invoices');

  site.on('[account_invoice][in_out_type]', (obj, callback, next) => {
    $account_invoices.findOne({ id: obj.invoice_id }, (err, doc) => {
      if (doc) {
        doc.total_paid_up = doc.total_paid_up + obj.paid_up * obj.currency.ex_rate;
        doc.remain_amount = doc.remain_amount - obj.paid_up * obj.currency.ex_rate;

        for (let i = 0; i < obj.payable_list.length; i++) {
          let p = obj.payable_list[i];
          p.select = false;
        }

        doc.payable_list = obj.payable_list;

        doc.payment_list.push({
          date: obj.date,
          posting: obj.posting ? true : false,
          safe: obj.safe,
          shift: obj.shift,
          payment_method: obj.payment_method,
          currency: obj.currency,
          paid_up: obj.paid_up,
        });

        $account_invoices.update(doc, () => {
          next();
        });
      } else {
        next();
      }
    });
  });

  site.on('[stores_items][item_name][change]', (objectInvoice) => {
    let barcode = objectInvoice.sizes_list.map((_obj) => _obj.barcode);

    $account_invoices.findMany({ 'company.id': objectInvoice.company.id, 'items.barcode': barcode }, (err, doc) => {
      if (doc) {
        doc.forEach((_doc) => {
          if (_doc.items) {
            _doc.items.forEach((_items) => {
              objectInvoice.sizes_list.forEach((_size) => {
                if (_items.barcode === _size.barcode) {
                  _items.size_ar = _size.size_ar;
                  _items.size_en = _size.size_en;
                  _items.name_ar = _size.name_ar;
                  _items.name_en = _size.name_en;
                }
              });
            });
          }
          $account_invoices.update(_doc);
        });
      }
    });
  });

  site.get({
    name: 'account_invoices',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post({
    name: '/api/source_type/all',
    path: __dirname + '/site_files/json/source_type.json',
  });

  site.post({
    name: '/api/payment_type/all',
    path: __dirname + '/site_files/json/payment_type.json',
  });

  site.post({
    name: '/api/target_account/all',
    path: __dirname + '/site_files/json/target_account.json',
  });

  site.post({
    name: '/api/payment_method/all',
    path: __dirname + '/site_files/json/payment_method.json',
  });

  site.post({
    name: '/api/in_type/all',
    path: __dirname + '/site_files/json/in_type.json',
  });

  site.post({
    name: '/api/out_type/all',
    path: __dirname + '/site_files/json/out_type.json',
  });

  site.post('/api/account_invoices/add', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let account_invoices_doc = req.body;
    // account_invoices_doc.$req = req;
    // account_invoices_doc.$res = res;
    account_invoices_doc.company = site.get_company(req);
    account_invoices_doc.branch = site.get_branch(req);

    if (account_invoices_doc.id) {
      delete account_invoices_doc.id;
      delete account_invoices_doc._id;
    }

    account_invoices_doc.add_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    // if (account_invoices_doc.source_type.id === 14) {
    //   if (!account_invoices_doc.payment_method_to || !account_invoices_doc.safe_to) {
    //     response.error = 'sure to specify the data of the transferee';
    //     res.json(response)
    //     return;
    //   }
    // }

    if (account_invoices_doc.payable_list && account_invoices_doc.payable_list.length > 0) {
      let foundPayError = false;
      for (let i = 0; i < account_invoices_doc.payable_list.length; i++) {
        let p = account_invoices_doc.payable_list[i];

        if (p.select) {
          p.paid_up = p.paid_up += account_invoices_doc.paid_up;
          p.remain = p.remain - account_invoices_doc.paid_up;
          if (p.paid_up > p.value) {
            foundPayError = true;
          }
        }
      }

      if (foundPayError) {
        response.error = 'It is not possible to pay more than the amount due';
        res.json(response);
        return;
      }
    }

    if (account_invoices_doc.paid_up === 0) account_invoices_doc.posting = true;

    if (account_invoices_doc.items && account_invoices_doc.items.length > 0) {
      account_invoices_doc.total_items_discount = 0;
      account_invoices_doc.items.forEach((_c_b_list) => {
        if (account_invoices_doc.source_type.id == 1) {
          if (_c_b_list.discount.type == 'number') account_invoices_doc.total_items_discount += (_c_b_list.discount.value || 0) * _c_b_list.count;
          else if (_c_b_list.discount.type == 'percent') account_invoices_doc.total_items_discount += ((_c_b_list.discount.value || 0) * (_c_b_list.cost * _c_b_list.count)) / 100;
        } else if (account_invoices_doc.source_type.id == 2 && account_invoices_doc.source_type.id == 3) {
          if (_c_b_list.discount.type == 'number') account_invoices_doc.total_items_discount += (_c_b_list.discount.value || 0) * _c_b_list.count;
          else if (_c_b_list.discount.type == 'percent') account_invoices_doc.total_items_discount += ((_c_b_list.discount.value || 0) * (_c_b_list.price * _c_b_list.count)) / 100;
        }
      });
      account_invoices_doc.total_items_discount = site.toNumber(account_invoices_doc.total_items_discount);
    }
    
    if(account_invoices_doc.invoices_list && account_invoices_doc.invoices_list.length > 0){
      account_invoices_doc.payment_list = [];

      for (let i = 0; i < account_invoices_doc.invoices_list.length; i++) {
        let i_l = account_invoices_doc.invoices_list[i];
        account_invoices_doc.payment_list.push({
          date: account_invoices_doc.date,
          posting: account_invoices_doc.posting ? true : false,
          safe: i_l.safe,
          shift: account_invoices_doc.shift,
          payment_method: i_l.payment_method,
          currency: i_l.currency,
          paid_up: i_l.paid_up,
        })
      }
      

    } else if (account_invoices_doc.paid_up && account_invoices_doc.safe) {
      account_invoices_doc.payment_list = [
        {
          date: account_invoices_doc.date,
          posting: account_invoices_doc.posting ? true : false,
          safe: account_invoices_doc.safe,
          shift: account_invoices_doc.shift,
          payment_method: account_invoices_doc.payment_method,
          currency: account_invoices_doc.currency,
          paid_up: account_invoices_doc.paid_up,
        },
      ];
    }

    account_invoices_doc.total_paid_up = 0;
    account_invoices_doc.remain_amount = 0;

    if (account_invoices_doc.paid_up) {
      account_invoices_doc.total_paid_up = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
      account_invoices_doc.total_paid_up = site.toNumber(account_invoices_doc.total_paid_up);
      if (account_invoices_doc.currency) account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - account_invoices_doc.total_paid_up;
    } else account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value);
    account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.remain_amount);

    if (
      account_invoices_doc.source_type.id == 8 ||
      account_invoices_doc.source_type.id == 9 ||
      account_invoices_doc.source_type.id == 10 ||
      account_invoices_doc.source_type.id == 11 ||
      account_invoices_doc.source_type.id == 14
    ) {
      account_invoices_doc.remain_amount = 0;
      account_invoices_doc.net_value = account_invoices_doc.paid_up;
    }

    site.getOpenShift({ companyId: account_invoices_doc.company.id, branchCode: account_invoices_doc.branch.code }, (shiftCb) => {
      if (shiftCb) {
        site.isAllowedDate(req, (allowDate) => {
          if (!allowDate) {
            response.error = 'Don`t Open Period';
            res.json(response);
          } else {
            let num_obj = {
              company: site.get_company(req),
              date: new Date(account_invoices_doc.date),
            };

            if (account_invoices_doc.source_type.id == 1) num_obj.screen = 'purchases_invoices';
            else if (account_invoices_doc.source_type.id == 2) num_obj.screen = 'sales_invoices';
            else if (account_invoices_doc.source_type.id == 3) num_obj.screen = 'o_screen_invoices';
            else if (account_invoices_doc.source_type.id == 4) num_obj.screen = 'request_activity_invoice';
            else if (account_invoices_doc.source_type.id == 5) num_obj.screen = 'booking_hall';
            else if (account_invoices_doc.source_type.id == 6) num_obj.screen = 'trainer_account';
            else if (account_invoices_doc.source_type.id == 7) num_obj.screen = 'course_booking';
            else if (account_invoices_doc.source_type.id == 8) num_obj.screen = 'amounts_in';
            else if (account_invoices_doc.source_type.id == 9) num_obj.screen = 'amounts_out';
            else if (account_invoices_doc.source_type.id == 10) num_obj.screen = 'recharge_customer_balance';
            else if (account_invoices_doc.source_type.id == 11) num_obj.screen = 'employee_advance';
            else if (account_invoices_doc.source_type.id == 12) num_obj.screen = 'payment_employee_advance';
            else if (account_invoices_doc.source_type.id == 13) num_obj.screen = 'school_fees';
            else if (account_invoices_doc.source_type.id == 14) num_obj.screen = 'transfer_safes_balances';
            else if (account_invoices_doc.source_type.id == 15) num_obj.screen = 'patient_ticket';
            else if (account_invoices_doc.source_type.id == 16) num_obj.screen = 'opening_balance';

            let cb = site.getNumbering(num_obj);
            if (!account_invoices_doc.code && !cb.auto) {
              response.error = 'Must Enter Code';
              res.json(response);
              return;
            } else if (cb.auto) {
              account_invoices_doc.code = cb.code;
            }
            if (account_invoices_doc.currency && !account_invoices_doc.payment_type) {
              let amount_currency = site.toNumber(account_invoices_doc.net_value) / site.toNumber(account_invoices_doc.currency.ex_rate);

              if (account_invoices_doc.paid_up < amount_currency) {
                account_invoices_doc.payment_type = {
                  id: 2,
                  en: 'Futures',
                  ar: 'آجل',
                };
              } else {
                account_invoices_doc.payment_type = {
                  id: 1,
                  en: 'Cash',
                  ar: 'كاش',
                };
              }
            }

            $account_invoices.add(account_invoices_doc, (err, doc) => {
              if (!err) {
                response.done = true;
                response.doc = doc;

                if (doc.source_type.id == 1) site.quee('[store_in][account_invoice][invoice]', doc.invoice_id, 'add');
                else if (doc.source_type.id == 2) site.quee('[store_out][account_invoice][invoice]', doc.invoice_id, 'add');
                else if (doc.source_type.id == 3) site.quee('[store_out_order][account_invoice][invoice]', doc.invoice_id, 'add');

                if (doc.posting) {
                  let paid_value = {
                    value: doc.paid_up,
                    company: doc.company,
                    branch: doc.branch,
                    date: doc.date,
                    code: doc.code,
                    image_url: doc.image_url,
                    payment_method: doc.payment_method,
                    currency: doc.currency,
                    safe: doc.safe,
                    shift: {
                      id: doc.shift.id,
                      code: doc.shift.code,
                      name_ar: doc.shift.name_ar,
                      name_en: doc.shift.name_en,
                    },
                  };

                  if (doc.source_type.id == 1) {
                    if (doc.invoice_type && doc.invoice_type.id == 4) {
                      if (doc.vendor && doc.vendor.id) {
                        let vendorObj = {
                          id: doc.vendor.id,
                          balance_debtor: doc.net_value,
                          sum_debtor: true,
                        };

                        site.quee('[vendor][account_invoice][balance]', vendorObj);
                      }
                    } else {
                      if (doc.vendor && doc.vendor.id) {
                        let vendorObj = {
                          id: doc.vendor.id,
                          balance_creditor: doc.net_value,
                          sum_creditor: true,
                        };

                        site.quee('[vendor][account_invoice][balance]', vendorObj);
                      }
                    }
                  } else if (doc.source_type.id == 2) {
                    if (doc.invoice_type && doc.invoice_type.id == 6) {
                      if (doc.customer && doc.customer.id) {
                        let customerObj = {
                          id: doc.customer.id,
                          balance_creditor: doc.net_value,
                          sum_creditor: true,
                        };

                        site.quee('[customer][account_invoice][balance]', customerObj);
                      }
                    } else {
                      if (doc.customer && doc.customer.id) {
                        let customerObj = {
                          id: doc.customer.id,
                          balance_debtor: doc.net_value,
                          sum_debtor: true,
                        };
                        site.quee('[customer][account_invoice][balance]', customerObj);
                      }
                    }
                  } else if (doc.source_type.id == 3) {
                    let under_paid = {
                      items: doc.items,
                      net_value: doc.net_value,
                      total_tax: doc.total_tax,
                      total_discount: doc.total_discount,
                      remain_amount: doc.remain_amount,
                      price_delivery_service: doc.price_delivery_service,
                      service: doc.service,
                      invoice_id: doc.invoice_id,
                    };
                    site.call('[account_invoices][order_invoice][+]', { ...under_paid });

                    if (doc.customer && doc.customer.id) {
                      let customerObj = {
                        id: doc.customer.id,
                        balance_debtor: doc.net_value,
                        sum_debtor: true,
                      };
                      site.quee('[customer][account_invoice][balance]', customerObj);
                    }
                  } else if (doc.source_type.id == 4) {
                    paid_value.operation = { ar: 'فاتورة طلب نشاط', en: 'Request Service Invoice', name: 'request_service' };
                    paid_value.transition_type = 'in';

                    if (doc.customer && doc.customer.id) {
                      let customerObj = { id: doc.customer.id };
                      let foundPayCustomer = false;

                      if (doc.payment_type && doc.payment_type.id === 2) {
                        customerObj.balance_debtor = doc.remain_amount;
                        customerObj.sum_debtor = true;
                        foundPayCustomer = true;
                      }

                      if (doc.payment_method && doc.payment_method.id == 5) {
                        customerObj.balance_creditor = doc.paid_up * doc.currency.ex_rate;
                        customerObj.minus_creditor = true;
                        foundPayCustomer = true;
                      }

                      if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                    }

                    site.call('[account_invoices][request_activity][+]', doc.invoice_id);
                  } else if (doc.source_type.id == 5) {
                    paid_value.operation = { ar: 'فاتورة حجز قاعة', en: 'Book Hall Invoice', name: 'book_hall' };
                    paid_value.transition_type = 'in';
                    site.call('[account_invoices][book_hall][+]', doc.invoice_id);
                  } else if (doc.source_type.id == 8) {
                    paid_value.operation = { ar: 'سند قبض', en: 'Amount In', name: 'amount_in' };
                    paid_value.transition_type = 'in';
                    paid_value.operation_type = doc.in_type;

                    if (doc.in_type) {
                      if (doc.in_type.id == 5 && doc.customer && doc.customer.id) {
                        let customerObj = {
                          id: doc.customer.id,
                          balance_creditor: doc.paid_up * doc.currency.ex_rate,
                          sum_creditor: true,
                        };

                        site.quee('[customer][account_invoice][balance]', customerObj);
                      } else if ((doc.in_type.id == 2 || doc.in_type.id == 3) && doc.customer && doc.customer.id) {
                        if (doc.payment_type) {
                          let customerObj1 = {
                            id: doc.customer.id,
                            balance_debtor: doc.paid_up * doc.currency.ex_rate,
                            minus_debtor: true,
                          };

                          site.quee('[customer][account_invoice][balance]', customerObj1);
                        }

                        if (doc.payment_method && doc.payment_method.id == 5) {
                          let customerObj2 = {
                            id: doc.customer.id,
                            balance_creditor: doc.paid_up * doc.currency.ex_rate,
                            minus_creditor: true,
                          };

                          site.quee('[customer][account_invoice][balance]', customerObj2);
                        }
                      } else if (doc.in_type.id == 4) {
                        if (doc.vendor && doc.vendor.id) {
                          let vendorObj = {
                            id: doc.vendor.id,
                            balance_debtor: doc.paid_up * doc.currency.ex_rate,
                            minus_debtor: true,
                          };

                          site.quee('[vendor][account_invoice][balance]', vendorObj);
                        }
                      }
                      site.quee('[account_invoice][in_out_type]', doc);
                    }
                  } else if (doc.source_type.id == 9) {
                    paid_value.operation = { ar: 'سند صرف', en: 'Amount Out', name: 'amount_out' };
                    paid_value.transition_type = 'out';

                    if (doc.out_type) {
                      if (doc.out_type.id == 4 && doc.vendor && doc.vendor.id) {
                        let vendorObj = { id: doc.vendor.id };

                        vendorObj.balance_creditor = doc.paid_up * doc.currency.ex_rate;
                        vendorObj.sum_creditor = true;

                        site.quee('[vendor][account_invoice][balance]', vendorObj);
                      } else if (doc.out_type.id == 2) {
                        if (doc.vendor && doc.vendor.id) {
                          let vendorObj = {
                            id: doc.vendor.id,
                            balance_creditor: doc.paid_up * doc.currency.ex_rate,
                            minus_creditor: true,
                          };

                          site.quee('[vendor][account_invoice][balance]', vendorObj);
                        }
                      } else if (doc.out_type.id == 3) {
                        if (doc.customer && doc.customer.id) {
                          let customerObj = {
                            id: doc.customer.id,
                            balance_creditor: doc.paid_up * doc.currency.ex_rate,
                            minus_creditor: true,
                          };

                          site.quee('[customer][account_invoice][balance]', customerObj);
                        }
                      }
                      site.quee('[account_invoice][in_out_type]', doc);
                    }
                  } else if (doc.source_type.id == 10) {
                    paid_value.operation = { ar: 'دفعة عميل مقدمة', en: 'Customer Advance Payment', name: 'customer_advance' };
                    paid_value.transition_type = 'in';
                    if (doc.customer && doc.customer.id) {
                      let customerBalance = {
                        id: doc.customer.id,
                        balance_creditor: doc.paid_up * doc.currency.ex_rate,
                        sum_creditor: true,
                      };
                      site.quee('[customer][account_invoice][balance]', customerBalance);
                    }
                  } else if (doc.source_type.id == 11) {
                    paid_value.operation = { ar: 'سلفة موظف', en: 'Employee Advance', name: 'employee_advance' };
                    paid_value.transition_type = 'out';
                  } else if (doc.source_type.id == 12) {
                    paid_value.operation = { ar: 'تسديد سلفة موظف', en: 'Payment Employee Advance', name: 'pay_employee_advance' };
                    paid_value.transition_type = 'in';
                    site.accountInvoiceAccept(doc.invoice_id);
                  } else if (doc.source_type.id == 13) {
                    paid_value.operation = { ar: 'مصروفات دراسية', en: 'School Fees', name: 'school_fees' };
                    paid_value.transition_type = 'in';

                    if (doc.customer && doc.customer.id) {
                      let customerObj = { id: doc.customer.id };
                      let foundPayCustomer = false;

                      if (doc.payment_type && doc.payment_type.id === 2) {
                        customerObj.balance_debtor = doc.remain_amount;
                        customerObj.sum_debtor = true;
                        foundPayCustomer = true;
                      }

                      if (doc.payment_method && doc.payment_method.id == 5) {
                        customerObj.balance_creditor = doc.paid_up * doc.currency.ex_rate;
                        customerObj.minus_creditor = true;
                        foundPayCustomer = true;
                      }

                      if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                    }
                  }

                  if (doc.employee && doc.employee.id) {
                    paid_value.source_name_ar = doc.employee.name_ar;
                    paid_value.source_name_en = doc.employee.name_en;
                  }

                  if (doc.delegate && doc.delegate.id) {
                    paid_value.source_name_ar = doc.delegate.name_ar;
                    paid_value.source_name_en = doc.delegate.name_en;
                  }

                  if (doc.source_type.id === 14) {
                    paid_value.operation = { en: 'Transfer of safes balances', ar: 'تحويل أرصدة الخزن', name: 'transfer_safes' };
                    if (doc.type == 'from') {
                      paid_value.transition_type = 'out';
                    } else if (doc.type == 'to') {
                      paid_value.transition_type = 'in';
                    }
                  } else if (doc.source_type.id == 15) {
                    paid_value.operation = { ar: 'تذكرة مريض', en: 'Patient Ticket', name: 'patient_ticket' };
                    paid_value.transition_type = 'in';

                    if (doc.customer && doc.customer.id) {
                      let customerObj = { id: doc.customer.id };
                      let foundPayCustomer = false;

                      if (doc.payment_type && doc.payment_type.id === 2) {
                        customerObj.balance_debtor = doc.remain_amount;
                        customerObj.sum_debtor = true;
                        foundPayCustomer = true;
                      }

                      if (doc.payment_method && doc.payment_method.id == 5) {
                        customerObj.balance_creditor = doc.paid_up * doc.currency.ex_rate;
                        customerObj.minus_creditor = true;
                        foundPayCustomer = true;
                      }

                      if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                    }
                  } else if (doc.source_type.id == 16) {
                    if (doc.target_account.id === 1) {
                      let customerObj = { id: doc.customer.id };

                      if (doc.op_balance_type === 'creditor') {
                        customerObj.balance_creditor = doc.paid_up * doc.currency.ex_rate;
                        customerObj.sum_creditor = true;
                      } else if (doc.op_balance_type === 'debtor') {
                        customerObj.balance_debtor = doc.paid_up * doc.currency.ex_rate;
                        customerObj.sum_debtor = true;
                      }

                      site.quee('[customer][account_invoice][balance]', customerObj);
                    } else if (doc.target_account.id === 2) {
                      let vendorObj = { id: doc.vendor.id };

                      if (doc.op_balance_type === 'creditor') {
                        vendorObj.balance_creditor = doc.paid_up * doc.currency.ex_rate;
                        vendorObj.sum_creditor = true;
                      } else if (doc.op_balance_type === 'debtor') {
                        vendorObj.balance_debtor = doc.paid_up * doc.currency.ex_rate;
                        vendorObj.sum_debtor = true;
                      }

                      site.quee('[vendor][account_invoice][balance]', vendorObj);
                    }
                    doc.net_value = doc.paid_up * doc.currency.ex_rate;
                  }

                  if (doc.safe && doc.source_type.id != 16 && doc.source_type.id != 1 && doc.source_type.id != 2 && doc.source_type.id != 3) {
                    site.quee('[amounts][safes][+]', { ...paid_value });
                  }
                }
              } else {
                response.error = err.message;
              }
              res.json(response);
            });
          }
        });
      } else {
        response.error = 'Don`t Found Open Shift';
        res.json(response);
      }
    });
  });

  site.post('/api/account_invoices/update_payment', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let account_invoices_doc = req.body;
    account_invoices_doc.edit_user_info = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    account_invoices_doc.total_paid_up = 0;
    site.getOpenShift({ companyId: account_invoices_doc.company.id, branchCode: account_invoices_doc.branch.code }, (shiftCb) => {
      if (shiftCb) {
        site.isAllowedDate(req, (allowDate) => {
          if (!allowDate) {
            response.error = 'Don`t Open Period';
            res.json(response);
          } else {
            account_invoices_doc.payment_list.forEach((_payment_list) => {
              if (_payment_list.currency) account_invoices_doc.total_paid_up += _payment_list.paid_up * _payment_list.currency.ex_rate;

              if (!_payment_list.posting) {
                _payment_list.posting = true;

                let paid_value = {
                  value: _payment_list.paid_up,
                  company: account_invoices_doc.company,
                  branch: account_invoices_doc.branch,
                  code: account_invoices_doc.code,
                  date: _payment_list.date,
                  image_url: account_invoices_doc.image_url,
                  safe: _payment_list.safe,
                  payment_method: _payment_list.payment_method,
                  currency: _payment_list.currency,
                  shift: {
                    id: account_invoices_doc.shift.id,
                    code: account_invoices_doc.shift.code,
                    name_ar: account_invoices_doc.shift.name_ar,
                    name_en: account_invoices_doc.shift.name_en,
                  },
                };

                if (account_invoices_doc.source_type.id == 1) {
                  if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 4) {
                    paid_value.operation = { ar: 'دفعة مرتجع فاتورة مشتريات', en: 'Pay Return Purchase Invoice' };
                    paid_value.value = -Math.abs(paid_value.value);

                    if (account_invoices_doc.vendor && account_invoices_doc.vendor.id && account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                      let vendorObj = { id: account_invoices_doc.vendor.id };

                      vendorObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      vendorObj.minus_debtor = true;

                      site.quee('[vendor][account_invoice][balance]', vendorObj);
                    }
                  } else {
                    paid_value.operation = { ar: 'دفعة فاتورة مشتريات', en: 'Pay Purchase Invoice' };

                    if (account_invoices_doc.vendor && account_invoices_doc.vendor.id && account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                      let vendorObj = { id: account_invoices_doc.vendor.id };

                      vendorObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      vendorObj.minus_creditor = true;

                      site.quee('[vendor][account_invoice][balance]', vendorObj);
                    }
                  }

                  paid_value.transition_type = 'out';
                } else if (account_invoices_doc.source_type.id == 2) {
                  if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 6) {
                    paid_value.operation = { ar: 'دفعة مرتجع فاتورة مبيعات', en: 'Pay Return Sales Invoice' };
                    paid_value.value = -Math.abs(paid_value.value);

                    if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                      let customerObj = { id: account_invoices_doc.customer.id };
                      let foundPayCustomer = false;

                      if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                        customerObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                        customerObj.minus_creditor = true;
                        foundPayCustomer = true;
                      }

                      if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                        customerObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                        customerObj.minus_debtor = true;
                        foundPayCustomer = true;
                      }

                      if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                    }
                  } else {
                    paid_value.operation = { ar: 'دفعة فاتورة مبيعات', en: 'Pay Sales Invoice' };

                    if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                      let customerObj = { id: account_invoices_doc.customer.id };
                      let foundPayCustomer = false;

                      if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                        customerObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                        customerObj.minus_debtor = true;
                        foundPayCustomer = true;
                      }

                      if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                        customerObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                        customerObj.minus_creditor = true;
                        foundPayCustomer = true;
                      }

                      if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                    }
                  }

                  paid_value.transition_type = 'in';
                } else if (account_invoices_doc.source_type.id == 3) {
                  paid_value.operation = { ar: ' دفعة فاتورة شاشة الطلبات', en: 'Pay Orders Return Screen Invoice' };
                  paid_value.transition_type = 'in';

                  if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                    let customerObj = { id: account_invoices_doc.customer.id };
                    let foundPayCustomer = false;

                    if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                      customerObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_debtor = true;
                      foundPayCustomer = true;
                    }

                    if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                      customerObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_creditor = true;
                      foundPayCustomer = true;
                    }

                    if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                  }
                } else if (account_invoices_doc.source_type.id == 4) {
                  paid_value.operation = { ar: 'دفعة فاتورة طلب نشاط', en: 'Pay Request Service' };
                  paid_value.transition_type = 'in';

                  if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                    let customerObj = { id: account_invoices_doc.customer.id };
                    let foundPayCustomer = false;

                    if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                      customerObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_debtor = true;
                      foundPayCustomer = true;
                    }

                    if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                      customerObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_creditor = true;
                      foundPayCustomer = true;
                    }

                    if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                  }
                } else if (account_invoices_doc.source_type.id == 5) {
                  paid_value.operation = { ar: 'دفعة فاتورة حجز قاعة', en: 'Pay Book Hall' };
                  paid_value.transition_type = 'in';
                } else if (account_invoices_doc.source_type.id == 8) {
                  paid_value.operation = { ar: 'دفعة سند قبض', en: 'Pay Amount In' };
                  paid_value.transition_type = 'in';

                  // if (account_invoices_doc.customer && account_invoices_doc.customer.id) {

                  //   let customerObj = { id: account_invoices_doc.customer.id };
                  //   let foundPayCustomer = false;

                  //   if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                  //     customerObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate
                  //     customerObj.minus_debtor = true
                  //     foundPayCustomer = true

                  //   }

                  //   if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                  //     customerObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate
                  //     customerObj.minus_creditor = true
                  //     foundPayCustomer = true

                  //   }

                  //   if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj)
                  // }
                } else if (account_invoices_doc.source_type.id == 9) {
                  paid_value.operation = { ar: 'دفعة سند صرف', en: 'Pay Amount Out' };
                  paid_value.transition_type = 'out';
                } else if (account_invoices_doc.source_type.id == 13) {
                  paid_value.operation = { ar: 'دفعة مصروفات دراسية', en: 'Pay School Fees' };
                  paid_value.transition_type = 'in';

                  if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                    let customerObj = { id: account_invoices_doc.customer.id };
                    let foundPayCustomer = false;

                    if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                      customerObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_debtor = true;
                      foundPayCustomer = true;
                    }

                    if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                      customerObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_creditor = true;
                      foundPayCustomer = true;
                    }

                    if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                  }
                } else if (account_invoices_doc.source_type.id == 15) {
                  paid_value.operation = { ar: 'دفعة تذكرة مريض', en: 'Pay Patient Ticket' };
                  paid_value.transition_type = 'in';

                  if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                    let customerObj = { id: account_invoices_doc.customer.id };
                    let foundPayCustomer = false;

                    if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                      customerObj.balance_debtor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_debtor = true;
                      foundPayCustomer = true;
                    }

                    if (_payment_list.payment_method && _payment_list.payment_method.id == 5) {
                      customerObj.balance_creditor = _payment_list.paid_up * _payment_list.currency.ex_rate;
                      customerObj.minus_creditor = true;
                      foundPayCustomer = true;
                    }

                    if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                  }
                }

                if (account_invoices_doc.employee && account_invoices_doc.employee.id) {
                  paid_value.source_name_ar = account_invoices_doc.employee.name_ar;
                  paid_value.source_name_en = account_invoices_doc.employee.name_en;
                }

                if (account_invoices_doc.delegate && account_invoices_doc.delegate.id) {
                  paid_value.source_name_ar = account_invoices_doc.delegate.name_ar;
                  paid_value.source_name_en = account_invoices_doc.delegate.name_en;
                }

                if (account_invoices_doc.source_type.id != 16) {
                  site.quee('[amounts][safes][+]', { ...paid_value });
                }
              }
            });
            account_invoices_doc.total_paid_up = site.toNumber(account_invoices_doc.total_paid_up);

            account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - site.toNumber(account_invoices_doc.total_paid_up);
            account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.remain_amount);
            if (account_invoices_doc.source_type.id == 10) account_invoices_doc.remain_amount = 0;

            if (account_invoices_doc.id) {
              $account_invoices.edit(
                {
                  where: {
                    id: account_invoices_doc.id,
                  },
                  set: account_invoices_doc,
                  $req: req,
                  $req: req,
                  $res: res,
                },
                (err, result) => {
                  if (!err) {
                    response.done = true;
                    response.doc = result.doc;
                    if (response.doc.remain_amount <= 0 && response.doc.source_type.id == 3) {
                      site.quee('[account_invoices][order_invoice][paid]', response.doc.invoice_id);
                    }
                  } else {
                    response.error = err.message;
                  }
                  res.json(response);
                }
              );
            } else {
              response.error = 'no id';
              res.json(response);
            }
          }
        });
      } else {
        response.error = 'Don`t Found Open Shift';
        res.json(response);
      }
    });
  });

  site.post('/api/account_invoices/posting', (req, res) => {
    let response = {};
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    response.done = false;

    let account_invoices_doc = req.body;

    site.getOpenShift({ companyId: account_invoices_doc.company.id, branchCode: account_invoices_doc.branch.code }, (shiftCb) => {
      if (shiftCb) {
        site.isAllowedDate(req, (allowDate) => {
          if (!allowDate) {
            response.error = 'Don`t Open Period';
            res.json(response);
          } else {
            account_invoices_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res });
            account_invoices_doc.total_paid_up = 0;

            if (account_invoices_doc.payment_list && account_invoices_doc.payment_list.length == 1) {
              account_invoices_doc.payment_list = [
                {
                  date: account_invoices_doc.date,
                  posting: account_invoices_doc.posting ? true : false,
                  safe: account_invoices_doc.safe,
                  shift: account_invoices_doc.shift,
                  payment_method: account_invoices_doc.payment_method,
                  currency: account_invoices_doc.currency,
                  paid_up: account_invoices_doc.paid_up,
                },
              ];
            }

            let totalPaidUp = 0;

            if (account_invoices_doc.payment_list && account_invoices_doc.payment_list.length > 0)
              account_invoices_doc.payment_list.forEach((_payment_list) => {
                totalPaidUp += _payment_list.paid_up * _payment_list.currency.ex_rate;

                if (_payment_list.currency) account_invoices_doc.total_paid_up += _payment_list.paid_up * _payment_list.currency.ex_rate;

                let obj = {
                  value: _payment_list.paid_up,
                  safe: _payment_list.safe,
                  date: _payment_list.date,
                  company: account_invoices_doc.company,
                  branch: account_invoices_doc.branch,
                  code: account_invoices_doc.code,
                  description: account_invoices_doc.description,
                  payment_method: _payment_list.payment_method,
                  currency: _payment_list.currency,
                  shift: {
                    id: account_invoices_doc.shift.id,
                    code: account_invoices_doc.shift.code,
                    name_ar: account_invoices_doc.shift.name_ar,
                    name_en: account_invoices_doc.shift.name_en,
                  },
                };

                if (account_invoices_doc.posting) {
                  _payment_list.posting = true;

                  if (account_invoices_doc.source_type.id == 1) {
                    if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 4) {
                      obj.operation = { ar: 'مرتجع فاتورة مشتريات', en: 'Return Purchase Invoice' };
                      obj.value = -Math.abs(obj.value);
                    } else {
                      obj.operation = { ar: 'فاتورة مشتريات', en: 'Purchase Invoice' };
                    }

                    obj.transition_type = 'out';
                  } else if (account_invoices_doc.source_type.id == 2) {
                    if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 6) {
                      obj.value = -Math.abs(obj.value);
                      obj.operation = { ar: 'مرتجع فاتورة مبيعات', en: 'Return Sales Invoice' };
                    } else {
                      obj.operation = { ar: 'فاتورة مبيعات', en: 'Sales Invoice' };
                    }

                    obj.transition_type = 'in';
                  } else if (account_invoices_doc.source_type.id == 3) {
                    obj.operation = { ar: 'فاتورة شاشة الطلبات', en: 'Orders Screen Invoice' };
                    obj.transition_type = 'in';
                  } else if (account_invoices_doc.source_type.id == 4) {
                    obj.operation = { ar: 'فاتورة طلب نشاط', en: 'Request Service Invoice' };
                    obj.transition_type = 'in';
                  } else if (account_invoices_doc.source_type.id == 5) {
                    obj.operation = { ar: 'فاتورة حجز قاعة', en: 'Book Hall Invoice' };
                    obj.transition_type = 'in';
                    site.call('[account_invoices][book_hall][+]', account_invoices_doc.invoice_id);
                  } else if (account_invoices_doc.source_type.id == 8) {
                    obj.operation = { ar: 'سند قبض', en: 'Amount In' };
                    obj.transition_type = 'in';
                  } else if (account_invoices_doc.source_type.id == 9) {
                    obj.operation = { ar: 'سند صرف', en: 'Amount Out' };
                    obj.transition_type = 'out';
                  } else if (account_invoices_doc.source_type.id == 10 && account_invoices_doc.customer) {
                    obj.operation = { ar: 'دفعة عميل مقدمة', en: 'Customer Advance Payment' };
                    obj.transition_type = 'in';
                    let customerBalance = {
                      id: account_invoices_doc.customer.id,
                      balance_creditor: _payment_list.paid_up * _payment_list.currency.ex_rate,
                      sum_creditor: true,
                    };
                    site.quee('[customer][account_invoice][balance]', customerBalance);
                  } else if (account_invoices_doc.source_type.id == 11) {
                    obj.operation = { ar: 'سلفة موظف', en: 'Employee Advance' };
                    obj.transition_type = 'out';
                  } else if (account_invoices_doc.source_type.id == 12) {
                    obj.operation = { ar: 'تسديد سلفة موظف', en: 'Payment Employee Advance' };
                    obj.transition_type = 'in';
                    site.accountInvoiceAccept(account_invoices_doc.invoice_id);
                  } else if (account_invoices_doc.source_type.id == 13) {
                    obj.operation = { ar: 'مصروفات دراسية', en: 'School Fees' };
                    obj.transition_type = 'in';
                  } else if (account_invoices_doc.source_type.id == 15) {
                    obj.operation = { ar: 'تذكرة مريض', en: 'Patient Ticket' };
                    obj.transition_type = 'in';
                  }
                } else {
                  _payment_list.posting = false;

                  if (account_invoices_doc.source_type.id == 1) {
                    if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 4) {
                      obj.operation = { ar: 'فك ترحيل مرتجع فاتورة مشتريات', en: 'Un Post Return Purchase Invoice' };
                    } else {
                      obj.value = -Math.abs(obj.value);
                      obj.operation = { ar: 'فك ترحيل فاتورة مشتريات', en: 'Un Post Purchase Invoice' };
                    }

                    obj.transition_type = 'out';
                  } else if (account_invoices_doc.source_type.id == 2) {
                    if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 6) {
                      obj.operation = { ar: 'فك ترحيل مرتجع فاتورة مبيعات', en: 'Un Post Return Sales Invoice' };
                    } else {
                      obj.value = -Math.abs(obj.value);
                      obj.operation = { ar: 'فك ترحيل فاتورة مبيعات', en: 'Un Post Sales Invoice' };
                    }

                    obj.transition_type = 'in';
                  } else if (account_invoices_doc.source_type.id == 3) {
                    obj.transition_type = 'in';
                    obj.value = -Math.abs(obj.value);
                    obj.operation = { ar: 'فك ترحيل فاتورة شاشة الطلبات', en: 'Un Post Orders Screen Invoice' };
                  } else if (account_invoices_doc.source_type.id == 4) {
                    obj.transition_type = 'in';
                    obj.value = -Math.abs(obj.value);
                    obj.operation = { ar: 'فك ترحيل فاتورة طلب نشاط', en: 'Un Post Request Service Invoice' };
                  } else if (account_invoices_doc.source_type.id == 5) {
                    obj.operation = { ar: 'فك ترحيل فاتورة حجز قاعة', en: 'Un Post Book Hall Invoice' };
                    obj.transition_type = 'in';
                    obj.value = -Math.abs(obj.value);
                  } else if (account_invoices_doc.source_type.id == 8) {
                    obj.operation = { ar: 'فك ترحيل سند قبض', en: 'Un Post Amount In' };
                    obj.transition_type = 'in';
                    obj.value = -Math.abs(obj.value);
                  } else if (account_invoices_doc.source_type.id == 9) {
                    obj.operation = { ar: 'فك ترحيل سند صرف', en: 'Un Post Amount Out' };
                    obj.transition_type = 'out';
                    obj.value = -Math.abs(obj.value);
                  } else if (account_invoices_doc.source_type.id == 10 && account_invoices_doc.customer) {
                    obj.operation = { ar: 'فك ترحيل دفعة عميل مقدمة', en: 'Un Post Customer Advance Payment' };
                    obj.transition_type = 'in';
                    obj.value = -Math.abs(obj.value);
                    let customerBalance = {
                      id: account_invoices_doc.customer.id,
                      balance_creditor: _payment_list.paid_up * _payment_list.currency.ex_rate,
                      minus_creditor: true,
                    };

                    site.quee('[customer][account_invoice][balance]', customerBalance);
                  } else if (account_invoices_doc.source_type.id == 11) {
                    obj.operation = { ar: 'فك ترحيل سلفة موظف', en: 'Un Post Employee Advance' };
                    obj.transition_type = 'in';
                  } else if (account_invoices_doc.source_type.id == 12) {
                    obj.operation = { ar: 'فك ترحيل تسديد سلفة موظف', en: 'Un Post Payment Employee Advance' };
                    obj.transition_type = 'out';
                  } else if (account_invoices_doc.source_type.id == 13) {
                    obj.operation = { ar: 'فك ترحيل مصروفات دراسية', en: 'Un Post School Fees' };
                    obj.transition_type = 'out';
                  } else if (account_invoices_doc.source_type.id == 15) {
                    obj.operation = { ar: 'فك ترحيل تذكرة مريض', en: 'Un Post Patient Ticket' };
                    obj.transition_type = 'out';
                  }
                }

                if (account_invoices_doc.employee && account_invoices_doc.employee.id) {
                  obj.source_name_ar = account_invoices_doc.employee.name_ar;
                  obj.source_name_en = account_invoices_doc.employee.name_en;
                }

                if (account_invoices_doc.delegate && account_invoices_doc.delegate.id) {
                  obj.source_name_ar = account_invoices_doc.delegate.name_ar;
                  obj.source_name_en = account_invoices_doc.delegate.name_en;
                }

                if (account_invoices_doc.source_type.id === 14) {
                  let paid_to = Object.assign({}, obj);
                  if (account_invoices_doc.posting) {
                    obj.transition_type = 'out';
                    obj.operation = { en: 'Transfer of safes balances', ar: 'تحويل أرصدة الخزن' };
                  } else {
                    obj.transition_type = 'in';
                    obj.operation = { en: 'Un Post Transfer of safes balances', ar: 'فك ترحيل تحويل أرصدة الخزن' };
                  }

                  paid_to.payment_method = account_invoices_doc.payment_method_to;
                  paid_to.safe = account_invoices_doc.safe_to;

                  if (account_invoices_doc.posting) {
                    paid_to.transition_type = 'in';
                  } else {
                    paid_to.transition_type = 'out';
                  }

                  site.quee('[amounts][safes][+]', Object.assign({}, paid_to));
                } else if (account_invoices_doc.safe && account_invoices_doc.source_type.id != 16) {
                  site.quee('[amounts][safes][+]', { ...obj });
                }
              });

            account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.net_value) - site.toNumber(account_invoices_doc.total_paid_up);
            account_invoices_doc.remain_amount = site.toNumber(account_invoices_doc.remain_amount);
            if (account_invoices_doc.source_type.id == 10) account_invoices_doc.remain_amount = 0;

            if (account_invoices_doc.source_type.id == 1 && account_invoices_doc.vendor && account_invoices_doc.vendor.id) {
              if (account_invoices_doc.invoice_type && account_invoices_doc.invoice_type.id == 4) {
                if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                  let vendorObj = { id: account_invoices_doc.vendor.id };

                  vendorObj.balance_debtor = account_invoices_doc.remain_amount;
                  if (account_invoices_doc.posting) {
                    vendorObj.sum_debtor = true;
                  } else {
                    vendorObj.minus_debtor = true;
                  }

                  site.quee('[vendor][account_invoice][balance]', vendorObj);
                }
              } else {
                if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                  let vendorObj = { id: account_invoices_doc.vendor.id };

                  vendorObj.balance_creditor = account_invoices_doc.remain_amount;
                  if (account_invoices_doc.posting) {
                    vendorObj.sum_creditor = true;
                  } else {
                    vendorObj.minus_creditor = true;
                  }

                  site.quee('[vendor][account_invoice][balance]', vendorObj);
                }
              }
            } else if (
              (account_invoices_doc.source_type.id === 2 && account_invoices_doc.invoice_type.id != 6) ||
              account_invoices_doc.source_type.id === 3 ||
              account_invoices_doc.source_type.id === 4 ||
              (account_invoices_doc.source_type.id === 8 && account_invoices_doc.in_type && account_invoices_doc.in_type.id == 5) ||
              account_invoices_doc.source_type.id === 13 ||
              account_invoices_doc.source_type.id === 15
            ) {
              if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                  let customerObj = { id: account_invoices_doc.customer.id };
                  customerObj.balance_debtor = account_invoices_doc.remain_amount;
                  if (account_invoices_doc.posting) customerObj.sum_debtor = true;
                  else customerObj.minus_debtor = true;
                  site.quee('[customer][account_invoice][balance]', customerObj);
                }

                if (account_invoices_doc.payment_method && account_invoices_doc.payment_method.id == 5) {
                  let customerObj = { id: account_invoices_doc.customer.id };
                  customerObj.balance_creditor = totalPaidUp;
                  if (account_invoices_doc.posting) customerObj.minus_creditor = true;
                  else customerObj.sum_creditor = true;
                  site.quee('[customer][account_invoice][balance]', customerObj);
                }
              }
            } else if (account_invoices_doc.source_type.id === 2 && account_invoices_doc.invoice_type.id === 6) {
              if (account_invoices_doc.customer && account_invoices_doc.customer.id) {
                let customerObj = { id: account_invoices_doc.customer.id };
                let foundPayCustomer = false;

                if (account_invoices_doc.payment_type && account_invoices_doc.payment_type.id === 2) {
                  customerObj.balance_creditor = account_invoices_doc.remain_amount;
                  if (account_invoices_doc.posting) customerObj.sum_creditor = true;
                  else customerObj.minus_creditor = true;
                  foundPayCustomer = true;
                }

                if (account_invoices_doc.payment_method && account_invoices_doc.payment_method.id == 5) {
                  customerObj.balance_debtor = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
                  if (account_invoices_doc.posting) customerObj.minus_debtor = true;
                  else customerObj.sum_debtor = true;
                  foundPayCustomer = true;
                }

                if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
              }
            } else if (account_invoices_doc.source_type.id == 16) {
              if (account_invoices_doc.target_account.id === 1) {
                let customerObj = { id: account_invoices_doc.customer.id };

                if (account_invoices_doc.op_balance_type === 'creditor') {
                  customerObj.balance_creditor = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
                  if (account_invoices_doc.posting) customerObj.sum_creditor = true;
                  else customerObj.minus_creditor = true;
                } else if (account_invoices_doc.op_balance_type === 'debtor') {
                  customerObj.balance_debtor = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
                  if (account_invoices_doc.posting) customerObj.sum_debtor = true;
                  else customerObj.minus_debtor = true;
                }

                site.quee('[customer][account_invoice][balance]', customerObj);
              } else if (account_invoices_doc.target_account.id === 2) {
                let vendorObj = { id: account_invoices_doc.vendor.id };

                if (account_invoices_doc.op_balance_type === 'creditor') {
                  vendorObj.balance_creditor = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
                  if (account_invoices_doc.posting) vendorObj.sum_creditor = true;
                  else vendorObj.minus_creditor = true;
                } else if (account_invoices_doc.op_balance_type === 'debtor') {
                  vendorObj.balance_debtor = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
                  if (account_invoices_doc.posting) vendorObj.sum_debtor = true;
                  else vendorObj.minus_debtor = true;
                }

                site.quee('[vendor][account_invoice][balance]', vendorObj);
              }

              account_invoices_doc.net_value = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
            } else if (account_invoices_doc.source_type.id === 9) {
              if (account_invoices_doc.out_type && account_invoices_doc.out_type.id == 4 && account_invoices_doc.vendor && account_invoices_doc.vendor.id) {
                let vendorObj = { id: account_invoices_doc.vendor.id };

                vendorObj.balance_creditor = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
                if (account_invoices_doc.posting) vendorObj.sum_creditor = true;
                else vendorObj.minus_creditor = true;

                site.quee('[vendor][account_invoice][balance]', vendorObj);
              }
            } else if (account_invoices_doc.source_type.id === 8) {
              if (account_invoices_doc.customer && account_invoices_doc.customer.id && account_invoices_doc.in_type && account_invoices_doc.in_type.id == 5) {
                let customerObj = { id: account_invoices_doc.customer.id };

                customerObj.balance_creditor = account_invoices_doc.paid_up * account_invoices_doc.currency.ex_rate;
                if (account_invoices_doc.posting) customerObj.sum_creditor = true;
                else customerObj.minus_creditor = true;

                site.quee('[customer][account_invoice][balance]', customerObj);
              }
            }
            if (account_invoices_doc.source_type.id == 3) {
              let under_paid = {
                items: account_invoices_doc.items,
                net_value: account_invoices_doc.net_value,
                total_tax: account_invoices_doc.total_tax,
                total_discount: account_invoices_doc.total_discount,
                price_delivery_service: account_invoices_doc.price_delivery_service,
                service: account_invoices_doc.service,
                remain_amount: account_invoices_doc.remain_amount,
                invoice_id: account_invoices_doc.invoice_id,
              };

              if (!account_invoices_doc.posting) under_paid.return = true;

              site.call('[account_invoices][order_invoice][+]', { ...under_paid });
            }
            account_invoices_doc.total_paid_up = site.toNumber(account_invoices_doc.total_paid_up);

            if (account_invoices_doc._id) {
              $account_invoices.edit(
                {
                  where: {
                    _id: account_invoices_doc._id,
                  },
                  set: account_invoices_doc,
                  $req: req,
                  $res: res,
                },
                (err, result) => {
                  if (!err) {
                    response.done = true;
                    response.doc = result.doc;
                  } else {
                    response.error = err.message;
                  }
                  res.json(response);
                }
              );
            } else {
              res.json(response);
            }
          }
        });
      } else {
        response.error = 'Don`t Found Open Shift';
        res.json(response);
      }
    });
  });

  site.post('/api/account_invoices/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let account_invoices_doc = req.body;
    let where = req.body.where || {};

    if (where['source_type_id']) {
      where['source_type.id'] = where['source_type_id'];
      delete where['source_type_id'];
    }

    if (where['invoice_id']) {
      where['invoice_id'] = where['invoice_id'];
    } else {
      where['id'] = account_invoices_doc.id;
    }
    site.getOpenShift({ companyId: account_invoices_doc.company.id, branchCode: account_invoices_doc.branch.code }, (shiftCb) => {
      if (shiftCb) {
        site.isAllowedDate(req, (allowDate) => {
          if (!allowDate) {
            response.error = 'Don`t Open Period';
            res.json(response);
          } else {
            $account_invoices.deleteOne(
              {
                where: where,
                $req: req,
                $res: res,
              },
              (err, result) => {
                if (!err) {
                  response.done = true;
                  response.doc = result.doc;
                  if (response.doc.source_type.id == 1) site.quee('[store_in][account_invoice][invoice]', response.doc.invoice_id, 'delete');
                  else if (response.doc.source_type.id == 2) site.quee('[store_out][account_invoice][invoice]', response.doc.invoice_id, 'delete');

                  if (result.doc.posting) {
                    let totalPaidUp = 0;
                    result.doc.total_paid_up = 0;
                    if (result.doc.payment_list && result.doc.payment_list.length > 0)
                      result.doc.payment_list.forEach((_payment_list) => {
                        totalPaidUp += _payment_list.paid_up * _payment_list.currency.ex_rate;

                        if (_payment_list.currency) result.doc.total_paid_up += _payment_list.paid_up * _payment_list.currency.ex_rate;

                        let obj = {
                          value: _payment_list.paid_up,
                          safe: _payment_list.safe,
                          date: _payment_list.date,
                          company: result.doc.company,
                          branch: result.doc.branch,
                          code: result.doc.code,
                          description: result.doc.description,
                          payment_method: _payment_list.payment_method,
                          currency: _payment_list.currency,
                          shift: {
                            id: result.doc.shift.id,
                            code: result.doc.shift.code,
                            name_ar: result.doc.shift.name_ar,
                            name_en: result.doc.shift.name_en,
                          },
                        };
                        if (result.doc.source_type.id == 1) {
                          if (result.doc.invoice_type && result.doc.invoice_type.id == 4) {
                            obj.operation = { ar: 'حذف مرتجع فاتورة مشتريات', en: 'Delete Return Purchase Invoice' };
                          } else {
                            obj.value = -Math.abs(obj.value);
                            obj.operation = { ar: 'حذف فاتورة مشتريات', en: 'Delete Purchase Invoice' };
                          }

                          obj.transition_type = 'out';
                        } else if (result.doc.source_type.id == 2) {
                          if (result.doc.invoice_type && result.doc.invoice_type.id == 6) {
                            obj.operation = { ar: 'حذف مرتجع فاتورة مبيعات', en: 'Delete Return Sales Invoice' };
                          } else {
                            obj.operation = { ar: 'حذف فاتورة مبيعات', en: 'Delete Sales Invoice' };
                            obj.value = -Math.abs(obj.value);
                          }

                          obj.transition_type = 'in';
                        } else if (result.doc.source_type.id == 3) {
                          obj.transition_type = 'in';
                          obj.value = -Math.abs(obj.value);
                          obj.operation = { ar: 'حذف فاتورة شاشة الطلبات', en: 'Delete Orders Screen Invoice' };
                        } else if (result.doc.source_type.id == 4) {
                          obj.transition_type = 'in';
                          obj.value = -Math.abs(obj.value);
                          obj.operation = { ar: 'حذف فاتورة طلب نشاط', en: 'Delete Request Service Invoice' };
                        } else if (response.doc.source_type.id == 5) {
                          obj.operation = { ar: 'حذف فاتورة حجز قاعة', en: 'Delete Book Hall Invoice' };
                          obj.transition_type = 'in';
                          obj.value = -Math.abs(obj.value);
                        } else if (response.doc.source_type.id == 8) {
                          obj.operation = { ar: 'حذف سند قبض', en: 'Delete Amount In' };
                          obj.transition_type = 'in';
                          obj.value = -Math.abs(obj.value);
                        } else if (response.doc.source_type.id == 9) {
                          obj.operation = { ar: 'حذف سند صرف', en: 'Delete Amount Out' };
                          obj.transition_type = 'out';
                          obj.value = -Math.abs(obj.value);
                        } else if (response.doc.source_type.id == 10 && response.doc.customer) {
                          obj.operation = { ar: 'حذف دفعة عميل مقدمة', en: 'Delete Customer Advance Payment' };
                          obj.transition_type = 'in';
                          obj.value = -Math.abs(obj.value);
                          let customerBalance = {
                            id: response.doc.customer.id,
                            balance_creditor: _payment_list.paid_up * _payment_list.currency.ex_rate,
                            minus_creditor: true,
                          };
                          site.quee('[customer][account_invoice][balance]', customerBalance);
                        } else if (response.doc.source_type.id == 11) {
                          obj.operation = { ar: 'حذف سلفة موظف', en: 'Delete Employee Advance' };
                          obj.transition_type = 'in';
                        } else if (response.doc.source_type.id == 12) {
                          obj.operation = { ar: 'حذف تسديد سلفة موظف', en: 'Delete Payment Employee Advance' };
                          obj.transition_type = 'out';
                        } else if (response.doc.source_type.id == 13) {
                          obj.operation = { ar: 'حذف مصروفات دراسية', en: 'Delete School Fees' };
                          obj.transition_type = 'out';
                        } else if (response.doc.source_type.id == 15) {
                          obj.operation = { ar: 'حذف تذكرة مريض', en: 'Delete Patient Ticket' };
                          obj.transition_type = 'out';
                          site.call('delete Patient Ticket', response.doc.invoice_id);
                        }

                        if (response.doc.employee && response.doc.employee.id) {
                          obj.source_name_ar = response.doc.employee.name_ar;
                          obj.source_name_en = response.doc.employee.name_en;
                        }
                        if (response.doc.delegate && response.doc.delegate.id) {
                          obj.source_name_ar = response.doc.delegate.name_ar;
                          obj.source_name_en = response.doc.delegate.name_en;
                        }

                        if (result.doc.source_type.id === 14) {
                          obj.operation = { en: 'Delete Transfer of safes balances', ar: 'حذف تحويل أرصدة الخزن' };

                          if (result.doc.type == 'from') {
                            obj.transition_type = 'in';
                          } else if (result.doc.type == 'to') {
                            obj.transition_type = 'out';
                          }
                        }

                        if (obj.safe && result.doc.source_type.id != 16) {
                          site.quee('[amounts][safes][+]', { ...obj });
                        }
                      });

                    if (result.doc.source_type.id == 1 && result.doc.vendor && result.doc.vendor.id) {
                      if (result.doc.invoice_type && result.doc.invoice_type.id == 4) {
                        if (result.doc.payment_type && result.doc.payment_type.id === 2) {
                          let vendorObj = { id: result.doc.vendor.id };

                          vendorObj.balance_debtor = result.doc.remain_amount;
                          vendorObj.sum_debtor = true;

                          site.quee('[vendor][account_invoice][balance]', vendorObj);
                        }
                      } else {
                        if (result.doc.payment_type && result.doc.payment_type.id === 2) {
                          let vendorObj = { id: result.doc.vendor.id };

                          vendorObj.balance_creditor = result.doc.remain_amount;
                          vendorObj.sum_creditor = true;

                          site.quee('[vendor][account_invoice][balance]', vendorObj);
                        }
                      }
                    } else if (
                      (result.doc.source_type.id === 2 && result.doc.invoice_type.id != 6) ||
                      result.doc.source_type.id === 3 ||
                      result.doc.source_type.id === 4 ||
                      (result.doc.source_type.id === 8 && result.doc.in_type && result.doc.in_type.id == 5) ||
                      result.doc.source_type.id === 13 ||
                      result.doc.source_type.id === 15
                    ) {
                      if (result.doc.customer) {
                        let customerObj = { id: result.doc.customer.id };
                        let foundPayCustomer = false;

                        if (result.doc.payment_type && result.doc.payment_type.id === 2) {
                          customerObj.balance_debtor = result.doc.remain_amount;
                          customerObj.minus_debtor = true;
                          foundPayCustomer = true;
                        }

                        if (result.doc.payment_method && result.doc.payment_method.id == 5) {
                          customerObj.balance_creditor = totalPaidUp;
                          customerObj.sum_creditor = true;
                          foundPayCustomer = true;
                        }

                        if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                      }
                    } else if (result.doc.source_type.id === 2 && result.doc.invoice_type.id === 6) {
                      if (result.doc.customer) {
                        let customerObj = { id: result.doc.customer.id };
                        let foundPayCustomer = false;

                        if (result.doc.payment_type && result.doc.payment_type.id === 2) {
                          customerObj.balance_creditor = result.doc.remain_amount;
                          customerObj.minus_creditor = true;
                          foundPayCustomer = true;
                        }

                        if (result.doc.payment_method && result.doc.payment_method.id == 5) {
                          customerObj.balance_debtor = result.doc.paid_up * result.doc.currency.ex_rate;
                          customerObj.sum_debtor = true;
                          foundPayCustomer = true;
                        }

                        if (foundPayCustomer) site.quee('[customer][account_invoice][balance]', customerObj);
                      }
                    } else if (result.doc.source_type.id == 16) {
                      if (result.doc.target_account.id === 1) {
                        let customerObj = { id: result.doc.customer.id };

                        if (result.doc.op_balance_type === 'creditor') {
                          customerObj.balance_creditor = result.doc.paid_up * result.doc.currency.ex_rate;
                          customerObj.minus_creditor = true;
                        } else if (result.doc.op_balance_type === 'debtor') {
                          customerObj.balance_debtor = result.doc.paid_up * result.doc.currency.ex_rate;
                          customerObj.minus_debtor = true;
                        }

                        site.quee('[customer][account_invoice][balance]', customerObj);
                      } else if (result.doc.target_account.id === 2) {
                        let vendorObj = { id: result.doc.vendor.id };

                        if (result.doc.op_balance_type === 'creditor') {
                          vendorObj.balance_creditor = result.doc.paid_up * result.doc.currency.ex_rate;
                          vendorObj.minus_creditor = true;
                        } else if (result.doc.op_balance_type === 'debtor') {
                          vendorObj.balance_debtor = result.doc.paid_up * result.doc.currency.ex_rate;
                          vendorObj.minus_debtor = true;
                        }

                        site.quee('[vendor][account_invoice][balance]', vendorObj);
                      }
                    } else if (result.doc.source_type.id === 9) {
                      if (result.doc.out_type && result.doc.out_type.id == 4 && result.doc.vendor && result.doc.vendor.id) {
                        let vendorObj = { id: result.doc.vendor.id };

                        vendorObj.balance_creditor = result.doc.paid_up * result.doc.currency.ex_rate;
                        vendorObj.minus_creditor = true;

                        site.quee('[vendor][account_invoice][balance]', vendorObj);
                      }
                    } else if (result.doc.source_type.id === 8 && result.doc.in_type && result.doc.in_type.id == 5) {
                      if (result.doc.customer && result.doc.customer.id) {
                        let customerObj = { id: result.doc.customer.id };

                        customerObj.balance_creditor = result.doc.paid_up * result.doc.currency.ex_rate;
                        customerObj.minus_creditor = true;

                        site.quee('[customer][account_invoice][balance]', customerObj);
                      }
                    }

                    result.doc.remain_amount = site.toNumber(result.doc.net_value) - site.toNumber(result.doc.total_paid_up);
                    result.doc.remain_amount = site.toNumber(result.doc.remain_amount);

                    if (result.doc.source_type.id == 3) {
                      let under_paid = {
                        items: result.doc.items,
                        net_value: result.doc.net_value,
                        total_tax: result.doc.total_tax,
                        total_discount: result.doc.total_discount,
                        price_delivery_service: result.doc.price_delivery_service,
                        service: result.doc.service,
                        remain_amount: result.doc.remain_amount,
                        return: true,
                        invoice_id: result.doc.invoice_id,
                      };

                      site.call('[account_invoices][order_invoice][+]', { ...under_paid });
                    }
                  }
                } else {
                  response.error = err.message;
                }
                res.json(response);
              }
            );
          }
        });
      } else {
        response.error = 'Don`t Found Open Shift';
        res.json(response);
      }
    });
  });

  site.post('/api/account_invoices/update', (req, res) => {
    let response = {};
    response.done = false;
    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let account_invoices_doc = req.body;

    if (account_invoices_doc.source_type.id === 14) {
      if (!account_invoices_doc.payment_method_to || !account_invoices_doc.safe_to) {
        response.error = 'sure to specify the data of the transferee';
        res.json(response);
        return;
      }
    }

    if (account_invoices_doc.paid_up && account_invoices_doc.safe && account_invoices_doc.payment_list && account_invoices_doc.payment_list.length == 1) {
      account_invoices_doc.payment_list = [
        {
          date: account_invoices_doc.date,
          posting: false,
          safe: account_invoices_doc.safe,
          shift: account_invoices_doc.shift,
          payment_method: account_invoices_doc.payment_method,
          currency: account_invoices_doc.currency,
          paid_up: account_invoices_doc.paid_up,
        },
      ];

      account_invoices_doc.total_paid_up = 0;

      if (account_invoices_doc.paid_up) {
        account_invoices_doc.total_paid_up = site.toNumber(account_invoices_doc.paid_up);
      }
    }

    if (
      account_invoices_doc.source_type.id == 8 ||
      account_invoices_doc.source_type.id == 9 ||
      account_invoices_doc.source_type.id == 10 ||
      account_invoices_doc.source_type.id == 11 ||
      account_invoices_doc.source_type.id == 14
    ) {
      account_invoices_doc.remain_amount = 0;
      account_invoices_doc.net_value = account_invoices_doc.paid_up;
    }
    account_invoices_doc.edit_user_info = site.security.getUserFinger({ $req: req, $res: res });
    site.getOpenShift({ companyId: req.body.company.id, branchCode: req.body.branch.code }, (shiftCb) => {
      if (shiftCb) {
        site.isAllowedDate(req, (allowDate) => {
          if (!allowDate) {
            response.error = 'Don`t Open Period';
            res.json(response);
          } else {
            if (account_invoices_doc._id) {
              $account_invoices.edit(
                {
                  where: {
                    _id: account_invoices_doc._id,
                  },
                  set: account_invoices_doc,
                  $req: req,
                  $res: res,
                },
                (err) => {
                  if (!err) {
                    response.done = true;
                  } else {
                    response.error = err.message;
                  }
                  res.json(response);
                }
              );
            } else {
              res.json(response);
            }
          }
        });
      } else {
        response.error = 'Don`t Found Open Shift';
        res.json(response);
      }
    });
  });

  site.post('/api/account_invoices/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }
    let where = req.data.where || {};

    if (req.body && req.body.id) {
      where['id'] = req.body.id;
    }

    $account_invoices.findOne(
      {
        where: where,
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          response.doc = doc;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/account_invoices/handel_invoice', (req, res) => {
    let response = {
      done: false,
    };
    let where = req.body.where || {};

    where['company.id'] = site.get_company(req).id;

    $account_invoices.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          response.done = true;
          site.getDefaultSetting(req, (callback) => {
            let currency = {};
            if (callback.accounting && callback.accounting.currency) currency = callback.accounting.currency;

            if (currency.id)
              docs.forEach((_doc) => {
                if (_doc.payment_list && _doc.payment_list.length > 0) {
                  _doc.payment_list.forEach((_payment) => {
                    _payment.currency = currency;
                    _payment.payment_method = _doc.payment_method;
                    if (_doc.posting) _payment.posting = true;
                    else _payment.posting = false;
                  });
                } else {
                  if (_doc.paid_up > 0)
                    _doc.payment_list = [
                      {
                        date: _doc.date,
                        currency: currency,
                        safe: _doc.safe,
                        paid_up: _doc.paid_up,
                        payment_method: _doc.payment_method,
                        posting: _doc.posting ? true : false,
                      },
                    ];
                }
                if (!_doc.total_paid_up) {
                  _doc.net_value = site.toNumber(_doc.net_value);

                  _doc.remain_amount = _doc.net_value;
                  _doc.payment_list = [];
                }

                $account_invoices.update(_doc);
              });
          });
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/account_invoices/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let where = req.data.where || {};
    let limit = where.limit || undefined;

    if (where['code']) where['code'] = site.get_RegExp(where['code'], 'i');

    if (where['shift_code']) {
      where['shift.code'] = site.get_RegExp(where['shift_code'], 'i');
      delete where['shift_code'];
    }

    if (where['name_ar']) where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');

    if (where['name_en']) where['name_en'] = site.get_RegExp(where['name_en'], 'i');

    if (where['source_type']) {
      where['source_type.id'] = where['source_type'].id;
      delete where['source_type'];
    }

    if (where['payment_method']) {
      where['payment_method.id'] = where['payment_method'].id;
      delete where['payment_method'];
    }
    if (where['source_code']) {
      where['invoice_code'] = where['invoice_code'];
      delete where['source_code'];
    }

    if (where['target_account']) {
      where['target_account.id'] = where['target_account'].id;
      delete where['target_account'];
    }

    if (where['school_year']) {
      where['school_year.id'] = where['school_year'].id;
      delete where['school_year'];
    }

    if (where['students_year']) {
      where['students_year.id'] = where['students_year'].id;
      delete where['students_year'];
    }

    if (where['types_expenses']) {
      where['types_expenses.id'] = where['types_expenses'].id;
      delete where['types_expenses'];
    }

    if (where['post']) {
      where['posting'] = true;
      delete where['post'];
    }
    if (where['un_post']) {
      where['$or'] = [{ posting: false }, { posting: undefined }];
      delete where['un_post'];
    }

    if (where['payment_made']) {
      where['remain_amount'] = 0;
      delete where['payment_made'];
    }

    if (where['under_payment']) {
      where['remain_amount'] = { $gt: 0 };
      delete where['under_payment'];
    }

    if (where['safe']) {
      where['safe.id'] = where['safe'].id;
      delete where['safe'];
    }

    if (where['customer']) {
      where['customer.id'] = where['customer'].id;
      delete where['customer'];
    }

    if (where['vendor']) {
      where['vendor.id'] = where['vendor'].id;
      delete where['vendor'];
    }

    if (where['employee']) {
      where['employee.id'] = where['employee'].id;
      delete where['employee'];
    }

    if (where.date) {
      let d1 = site.toDate(where.date);
      let d2 = site.toDate(where.date);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
    } else if (where && where.date_from) {
      let d1 = site.toDate(where.date_from);
      let d2 = site.toDate(where.date_to);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };

      delete where.date_from;
      delete where.date_to;
    }

    if (where && where['limit']) {
      delete where['limit'];
    }

    // if (where['active'] !== 'all') {
    //   where['active'] = true
    // } else {
    //   delete where['active']
    // }

    where['company.id'] = site.get_company(req).id;

    if (where['branchAll']) {
      delete where['branchAll'];
    } else {
      where['branch.code'] = site.get_branch(req).code;
    }

    $account_invoices.findMany(
      {
        select: req.body.select || {},
        where: where,
        sort: req.body.sort || { id: -1 },
        limit: limit,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;
          response.list = docs;
          response.count = count;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/account_invoices/un_post', (req, res) => {
    let response = {};
    response.done = false;

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    $account_invoices.findMany(
      {
        select: req.body.select || {},
        where: { 'company.id': site.get_company(req).id },
        sort: req.body.sort || {
          id: -1,
        },
      },
      (err, docs) => {
        if (!err) {
          docs.forEach((account_invoices_doc) => {
            account_invoices_doc.posting = false;
            $account_invoices.update(account_invoices_doc);
          });
        }
        response.done = true;
        res.json(response);
      }
    );
  });

  site.getAccountInvoiceShift = function (shiftId, callback) {
    $account_invoices.findMany(
      {
        where: { 'shift.id': shiftId },
        select: { id: 1, net_value: 1, total_tax: 1, total_discount: 1, payment_list: 1, source_type: 1, invoice_type: 1 },
      },
      (err, docs) => {
        if (!err && docs) {
          let obj = {
            arr: [
              { id: 1, value: 0 },
              { id: 2, value: 0 },
              { id: 3, value: 0 },
              { id: 4, value: 0 },
            ],
            net_value: 0,
            total_discount: 0,
            total_tax: 0,
          };

          docs.forEach((_doc) => {
            _doc.payment_list.forEach((_payment) => {
              if (_payment.payment_method.id == 1) {
                obj.arr[0].value += _doc.paid_up;
              } else if (_payment.payment_method.id == 2) {
                obj.arr[1].value += _doc.paid_up;
              } else if (_payment.payment_method.id == 3) {
                obj.arr[2].value += _doc.paid_up;
              } else if (_payment.payment_method.id == 4) {
                obj.arr[3].value += _doc.paid_up;
              }
            });

            obj.net_value += _doc.net_value;
            obj.total_discount += _doc.total_discount;
            obj.total_tax += _doc.total_tax;
          });

          callback(obj);
        } else callback(null);
      }
    );
  };

  site.accountInvoiceAccept = function (invoiceId) {
    $account_invoices.findOne(
      {
        where: { id: invoiceId },
      },
      (err, doc) => {
        if (!err && doc) {
          doc.invoice = true;
          $account_invoices.update(doc);
        }
      }
    );
  };
};
