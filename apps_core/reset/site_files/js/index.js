app.controller("reset", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.reset = {};

  $scope.resetItems = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_items/reset_items"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.resetSafesPayment = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes_payments/drop"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.resetOrdersScreen = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/order_invoice/drop"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.handelStoreInInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_in/handel_invoices"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.handelStoreOutInvoice = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_out/handel_invoices"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.resetItemTransaction = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/item_transaction/drop"
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.safesReset = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/safes/reset"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.unPostStoreIn = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_in/un_post"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostStoreOut = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_out/un_post"
    }).then(
      function (response) {
        if (response.data.done) { }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };
  /* 
    $scope.postStoreOut = function () {
      $scope.error = '';
      $http({
        method: "POST",
        url: "/api/stores_out/post_all"
      }).then(
        function (response) {
          if (response.data.done) { }
        },
        function (err) {
          $scope.error = err;
        }
      )
    };
  
    $scope.postStoreIn = function () {
      $scope.error = '';
      $http({
        method: "POST",
        url: "/api/stores_in/post_all"
      }).then(
        function (response) {
          if (response.data.done) { }
        },
        function (err) {
          $scope.error = err;
        }
      )
    }; 
  
     $scope.postStoreTransfer = function () {
      $scope.error = '';
      $http({
        method: "POST",
        url: "/api/transfer_branch/confirm_all"
      }).then(
        function (response) {
          if (response.data.done) { }
        },
        function (err) {
          $scope.error = err;
        }
      )
    }; */

  $scope.unPostAssemble = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_assemble/un_post"
    }).then(
      function (response) {
        if (response.data.done) { }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostStoreTransfer = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/transfer_branch/un_confirm"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostStoreStock = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_stock/un_confirm"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.unPostAccInvoice = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/account_invoices/un_post"
    }).then(
      function (response) {
        if (response.data.done) {
        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.confirmTransferBranchAll = function () {
    $scope.error = '';
    let where = { branchAll: true };

    $http({
      method: "POST",
      url: "/api/transfer_branch/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {

          let _transfer_branch_all = response.data.list.reverse();
          let stopLoop = false;

          for (let i = 0; i < _transfer_branch_all.length; i++) {
            setTimeout(() => {

              if (!_transfer_branch_all[i].transfer) {

                $scope.testTransferBranchPatches(_transfer_branch_all[i], callbackTest => {

                  if (callbackTest.patchCount) {
                    $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
                    return;
                  };
                  if (!stopLoop) {

                    $scope.financialYear(_transfer_branch_all[i].date, is_allowed_date => {
                      if (!is_allowed_date) {
                        $scope.error = '##word.should_open_period##';
                      } else {

                        _transfer_branch_all[i].transfer = true;

                        $http({
                          method: "POST",
                          url: "/api/transfer_branch/confirm",
                          data: _transfer_branch_all[i]
                        }).then(
                          function (response) {
                            if (response.data.done) {

                            } else {
                              $scope.error = '##word.error##';
                              if (response.data.error.like('*OverDraft Not*')) {
                                $scope.error = "##word.overdraft_not_active##"
                              } else if (response.data.error.like('*n`t Found Open Shi*')) {
                                $scope.error = "##word.open_shift_not_found##"
                              } else if (response.data.error.like('*n`t Open Perio*')) {
                                $scope.error = "##word.should_open_period##"
                              }
                              _transfer_branch_all[i].transfer = false;
                            }
                          },
                          function (err) {
                            console.log(err);
                          }
                        )
                      }
                    })
                  } else {
                    stopLoop = true;
                  }

                })
              };

              let iPlas = i + 1;
              $scope.length_posting = _transfer_branch_all.length + ' ' + '<------>' + ' ' + iPlas;

              if ((i + 1) == _transfer_branch_all.length) $scope.done_posting = 'تم إعتماد التحويلات المخزنية';

            }, 1000 * i);

          }

          if (stopLoop) $scope.error = '##word.err_stock_item##';

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.postingStoreOutAll = function () {
    $scope.error = '';
    let where = { branchAll: true };

    $http({
      method: "POST",
      url: "/api/stores_out/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done && response.data.list.length > 0) {
          let _store_out_all = response.data.list.reverse();
          let notExist = false;
          let notExistCountList = [];
          _store_out_all.forEach(_stOut => {
            let notExistCount = _stOut.items.some(_iz => _iz.count < 1);
            if (notExistCount) {
              notExist = true;
              notExistCountList.push(_stOut.number);
            }
          });

          if (notExist) {

            $scope.error = `##word.err_exist_count_invoice##   ( ${notExistCountList.join('-')} )`;
            return;

          } else {
            let stopLoop = false;
            for (let i = 0; i < _store_out_all.length; i++) {

              $timeout(() => {

                if (!_store_out_all[i].posting) {


                  $scope.testStoreOutPatches(_store_out_all[i], callbackTest => {

                    if (callbackTest.patchCount) {
                      $scope.error = `##word.err_patch_count##   ( ${callbackTest.patch_list.join('-')} )`;
                      _store_out_all[i].posting = false;
                      return;
                    };

                    if (!stopLoop) {

                      $scope.financialYear(_store_out_all[i].date, is_allowed_date => {
                        if (!is_allowed_date) {
                          $scope.error = '##word.should_open_period##';
                        } else {

                          _store_out_all[i].posting = true;

                          $http({
                            method: "POST",
                            url: "/api/stores_out/posting",
                            data: _store_out_all[i]
                          }).then(
                            function (response) {
                              if (response.data.done) { } else {
                                $scope.error = '##word.error##';
                                if (response.data.error.like('*OverDraft Not*')) {
                                  $scope.error = "##word.overdraft_not_active##"
                                } else if (response.data.error.like('*n`t Found Open Shi*')) {
                                  $scope.error = "##word.open_shift_not_found##"
                                } else if (response.data.error.like('*n`t Open Perio*')) {
                                  $scope.error = "##word.should_open_period##"
                                }
                                _store_out_all[i].posting = false;
                              }
                            },
                            function (err) {
                              console.log(err);
                            }
                          )
                        }

                      })
                    } else {
                      stopLoop = true;
                    }

                  })
                };

                let iPlas = i + 1;
                $scope.length_posting = _store_out_all.length + ' ' + '<------>' + ' ' + iPlas;

                if ((i + 1) == _store_out_all.length) $scope.done_posting = 'تم ترحيل فواتير المبيعات';

              }, 1000 * i);

            };
            if (stopLoop) $scope.error = '##word.err_stock_item##';
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.postingStoreInAll = function () {
    $scope.error = '';
    let where = { branchAll: true };

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
          let _store_in_all = response.data.list.reverse();
          let notExist = false;
          let notExistCountList = [];
          _store_in_all.forEach(_stIn => {
            let notExistCount = _stIn.items.some(_iz => _iz.count < 1);
            if (notExistCount) {
              notExist = true;
              notExistCountList.push(_stIn.number);
            }
          });


          if (notExist) {

            $scope.error = `##word.err_exist_count_invoice##   ( ${notExistCountList.join('-')} )`;
            return;
          } else {


            for (let i = 0; i < _store_in_all.length; i++) {
              setTimeout(() => {
                if (!_store_in_all[i].posting) {

                  $scope.testStoreInPatches(_store_in_all[i], testCallback => {

                    if (testCallback.patchCount) {
                      $scope.error = `##word.err_patch_count##   ( ${testCallback.patch_list.join('-')} )`;
                      _store_in_all[i].posting = false;
                    } else if (testCallback.exist_serial && _store_in_all[i].type.id !== 4) {
                      $scope.error = `##word.serial_pre_existing##   ( ${testCallback.patch_list.join('-')} )`;
                      _store_in_all[i].posting = false;
                    } else if (testCallback.errDate) {
                      $scope.error = '##word.err_patch_date##';
                      _store_in_all[i].posting = false;
                    } else {

                      $scope.financialYear(_store_in_all[i].date, is_allowed_date => {
                        if (!is_allowed_date) {
                          $scope.error = '##word.should_open_period##';
                        } else {

                          _store_in_all[i].posting = true;

                          $http({
                            method: "POST",
                            url: "/api/stores_in/posting",
                            data: _store_in_all[i]
                          }).then(
                            function (response) {
                              if (response.data.done) {

                              } else {
                                $scope.error = response.data.error;
                                if (response.data.error.like('*OverDraft Not*')) {
                                  $scope.error = "##word.overdraft_not_active##"
                                } else if (response.data.error.like('*n`t Found Open Shi*')) {
                                  $scope.error = "##word.open_shift_not_found##"
                                } else if (response.data.error.like('*n`t Open Perio*')) {
                                  $scope.error = "##word.should_open_period##"
                                }
                                _store_in_all[i].posting = false;

                              }
                            },
                            function (err) {
                              console.log(err);
                            }
                          )
                        }
                      });
                    }

                  });

                };

                let iPlas = i + 1;
                $scope.length_posting = _store_in_all.length + ' ' + '<------>' + ' ' + iPlas;
                if ((i + 1) == _store_in_all.length) $scope.done_posting = 'تم ترحيل فواتير المشتريات';


              }, 1000 * i);

            }
          }
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.postingAccountingAll = function () {
    $scope.error = '';
    let where = { branchAll: true };

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

          let _account_invoices_all = response.data.list.reverse();

          for (let i = 0; i < _account_invoices_all.length; i++) {
            setTimeout(() => {
              let _account_invoices = _account_invoices_all[i];

              if (!_account_invoices.posting) {
                $scope.financialYear(_account_invoices.date, is_allowed_date => {
                  if (!is_allowed_date) {
                    $scope.error = '##word.should_open_period##';

                  } else {

                    _account_invoices.posting = true;

                    $http({
                      method: "POST",
                      url: "/api/account_invoices/posting",
                      data: _account_invoices
                    }).then(
                      function (response) {
                        if (response.data.done) {

                        } else {
                          $scope.error = response.data.error;
                          if (response.data.error.like('*n`t Found Open Shi*')) {
                            $scope.error = "##word.open_shift_not_found##"
                          } else if (response.data.error.like('*n`t Open Perio*')) {
                            $scope.error = "##word.should_open_period##"
                          }
                        }
                      },
                      function (err) {
                        console.log(err);
                      }
                    )

                  }
                })
              };

              let iPlas = i + 1;
              $scope.length_posting = _account_invoices_all.length + ' ' + '<------>' + ' ' + iPlas;
              if ((i + 1) == _account_invoices_all.length) $scope.done_posting = 'تم ترحيل فواتير الحسابات';
            }, 100 * 1 * i);

          };
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.testTransferBranchPatches = function (transferBranch, callback) {
    let obj = {
      patchCount: false,
      patch_list: []
    };
    transferBranch.items.forEach(_item => {
      if (_item.size_units_list && _item.size_units_list.length > 0) {
        let count = 0;
        if (_item.patch_list && _item.patch_list.length > 0) {
          _item.patch_list.forEach(_pl => {
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

  $scope.testStoreOutPatches = function (storeOut, callback) {
    let obj = {
      patchCount: false,
      patch_list: []
    };
    storeOut.items.forEach(_item => {
      if (_item.size_units_list && _item.size_units_list.length > 0) {
        let count = 0;
        if (_item.patch_list && _item.patch_list.length > 0) {
          _item.patch_list.forEach(_pl => {
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
    callback(obj)
  };


  $scope.testStoreInPatches = function (storeIn, callback) {
    $scope.getSerialList(storeIn.items, serial_list => {
      let obj = {
        patchCount: false,
        errDate: false,
        exist_serial: false,
        not_patch: false,
        patch_list: []
      };

      storeIn.items.forEach(_item => {
        if (_item.size_units_list && _item.size_units_list.length > 0) {

          let count = 0;
          if (_item.patch_list && _item.patch_list.length > 0) {
            _item.patch_list.forEach(_pl => {
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

                serial_list.forEach(_s => {
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

  $scope.getSerialList = function (items, callback) {
    $scope.error = '';
    $scope.busy = true;
    let barcodes = [];
    if (items && items.length > 0)
      barcodes = items.map(_item => _item.barcode);

    let where = { serial: true, barcodes: barcodes };

    $http({
      method: "POST",
      url: "/api/stores_items/barcode_unit",
      data: {
        where: where

      }
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
    )
  };

  $scope.financialYear = function (date, callback) {
    if (site.feature('erp')) {

      $scope.busy = true;
      $scope.error = '';
      $http({
        method: "POST",
        url: "/api/financial_years/is_allowed_date",
        data: {
          date: new Date(date)
        }
      }).then(
        function (response) {
          $scope.busy = false;
          is_allowed_date = response.data.doc;
          callback(is_allowed_date);
        }
      );
    } else callback(true);

  };

});