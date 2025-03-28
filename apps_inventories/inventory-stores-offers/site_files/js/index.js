app.controller("stores_offer", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.store_offer = {};
  $scope.search = {};
  $scope.item = {
    sizes: []
  };

  $scope.deleteRow = function (itm) {
    $scope.error = '';
    $scope.store_offer.items.splice($scope.store_offer.items.indexOf(itm), 1);
  };

  $scope.deleteitem = function (itm) {
    $scope.error = '';
    $scope.item.sizes.splice($scope.item.sizes.indexOf(itm), 1);
  };

  $scope.newStoreOffer = function () {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.error = '';
        $scope.item = {}
        $scope.store_offer = {
          image_url: '/images/store_offer.png',
          shift: $scope.shift,
          active: true,
          offer_value: {
            value: 0,
            max: 0,
            type: 'percent',
          },
          offer_type: $scope.offerTypes[1],
          items: [],
          startup_date: new Date(),
        };

       /*  if ($scope.defaultSettings.inventory) {
          if ($scope.defaultSettings.inventory.store)
            $scope.store_offer.store = $scope.defaultSettings.inventory.store

        } */
        site.showModal('#addStoreOfferModal');
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

    const v = site.validated('#addStoreOfferModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }


    if (new Date($scope.store_offer.startup_date) > new Date($scope.store_offer.deadline_date)) {

      $scope.error = "##word.stores_offer_err_date##";
      return;

    };

    if ($scope.store_offer.items.length > 0) {

      $scope.financialYear($scope.store_offer.date, is_allowed_date => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';
        } else {

          $scope.busy = true;
          $http({
            method: "POST",
            url: "/api/stores_offer/add",
            data: $scope.store_offer
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                site.hideModal('#addStoreOfferModal');

                $scope.loadAll();

              } else {
                $scope.error = response.data.error;
                if (response.data.error.like('*n`t Found Open Shi*')) {
                  $scope.error = "##word.open_shift_not_found##"
                } else if (response.data.error.like('*n`t Open Perio*')) {
                  $scope.error = "##word.should_open_period##"
                } else if (response.data.error.like('*Must Enter Code*')) {
                  $scope.error = "##word.must_enter_code##"
                }
              }

            },
            function (err) {
              $scope.error = err.message;
            }
          )
        }
      })
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };

  $scope.remove = function (store_offer) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_offer);
        $scope.store_offer = {};
        site.showModal('#deleteStoreOfferModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.view = function (store_offer) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_offer/view",
      data: {
        _id: store_offer._id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.store_offer = response.data.doc;
        } else $scope.error = response.data.error;
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.details = function (store_offer) {
    $scope.error = '';
    $scope.view(store_offer);
    $scope.store_offer = {};
    site.showModal('#viewStoreOfferModal');
  };

  $scope.delete = function (store_offer) {
    $scope.error = '';

    $scope.financialYear(store_offer.date, is_allowed_date => {
      if (!is_allowed_date) {
        $scope.error = '##word.should_open_period##';

      } else {
        $scope.busy = true;
        $http({
          method: "POST",
          url: "/api/stores_offer/delete",
          data: store_offer
        }).then(
          function (response) {
            $scope.busy = false;
            if (response.data.done) {
              site.hideModal('#deleteStoreOfferModal');
              $scope.loadAll();
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

  $scope.addToItems = function () {
    $scope.error = '';
    let foundSize = false;

    if ($scope.item.sizes && $scope.item.sizes.length > 0)
      $scope.item.sizes.forEach(_size => {
        foundSize = $scope.store_offer.items.some(_itemSize => _itemSize.barcode === _size.barcode);
        if (!foundSize) {
          $scope.store_offer.items.unshift({
            image_url: $scope.item.image_url,
            name_Ar: _size.name_Ar,
            name_En: _size.name_En,
            item_group: _size.item_group,
            size_Ar: _size.size_Ar,
            size_en: _size.size_en,
            size_units_list: _size.size_units_list,
            item_complex: _size.item_complex,
            complex_items: _size.complex_items,
            barcode: _size.barcode,
            ticket_code: _size.ticket_code,
            add_sizes: _size.add_sizes,
          });
        }
      });

    $scope.item.sizes = [];
  };

  $scope.getItemsName = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
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

                if (_item.sizes && _item.sizes.length > 0)
                  _item.sizes.forEach(_size => {
                    let foundUnit = false;
                    _size.add_sizes = _item.add_sizes;

                    if (_size.size_units_list && _size.size_units_list.length > 0)
                      _size.size_units_list.forEach(_unit => {

                        _unit.discount = Object.assign({}, $scope.store_offer.offer_value);
                        if ((_unit.barcode === $scope.item.search_item_name) && typeof _unit.barcode == 'string') {
                          foundUnit = true;
                        }

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
                              /*     if (_store.store.id == $scope.store_offer.store.id) {
                                    foundStore = true;
                                    indxStore = i;
                                  } */
                                });
                                _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                  if (foundStore && _unitStore.id == _unit.id) {

                                    _unit.store_count = _unitStore.current_count || 0;
                                  }
                                });
                              }
                            }
                          }
                        }
                      });
                    if ((_size.barcode === $scope.item.search_item_name) || foundUnit) {
                      _size.name_Ar = _item.name_Ar;
                      _size.name_En = _item.name_En;
                      _size.item_group = _item.item_group;

                      foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _size.barcode);
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

  $scope.itemsStoresOffer = function () {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];
    let foundSize = false;
    if ($scope.item.itm && $scope.item.itm.sizes && $scope.item.itm.sizes.length > 0)
      $scope.item.itm.sizes.forEach(_item => {
        _item.add_sizes = $scope.item.itm.add_sizes;
        _item.name_Ar = $scope.item.itm.name_Ar;
        _item.name_En = $scope.item.itm.name_En;
        _item.item_group = $scope.item.itm.item_group;

        if (_item.size_units_list && _item.size_units_list.length > 0)
          _item.size_units_list.forEach(_unit => {

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
                     /*  if (_store.store.id == $scope.store_offer.store.id) {
                        foundStore = true;
                        indxStore = i;
                      } */
                    });
                    _item.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                      if (foundStore && _unitStore.id == _unit.id) {

                        _unit.store_count = _unitStore.current_count || 0;

                      }
                    });
                  }
                }
              }
            }
          });

        foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _item.barcode);
        if (!foundSize) $scope.item.sizes.unshift(_item);
      });
  };


  $scope.offerItemsGroup = function (item_group) {
    $scope.error = '';
    $scope.item.sizes = $scope.item.sizes || [];

    where = { item_group: item_group }
    $http({
      method: "POST",
      url: "/api/stores_items/all",
      data: { where: where }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          if (response.data.list.length > 0) {
            let foundSize = false;
            response.data.list.forEach(_list => {

              if (_list.sizes && _list.sizes.length > 0)
                _list.sizes.forEach(_size => {
                  _size.add_sizes = _list.add_sizes;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {
                      _unit.discount = Object.assign({}, $scope.store_offer.offer_value);
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
                             /*    if (_store.store.id == $scope.store_offer.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                } */
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id) {

                                  _unit.store_count = _unitStore.current_count || 0

                                }
                              });
                            }
                          }
                        }
                      }
                    });

                  _size.name_Ar = _list.name_Ar;
                  _size.name_En = _list.name_En;
                  _size.item_group = _list.item_group;
                  foundSize = $scope.item.sizes.some(_itemSize => _itemSize.barcode === _size.barcode);
                  if (!foundSize) $scope.item.sizes.unshift(_size);

                });
            });

            if (foundSize) $scope.error = '##word.dublicate_item##';
          }

        } else {
          $scope.error = response.data.error;
        };
      },
      function (err) {
        console.log(err);
      }
    );
  }

  $scope.getBarcode = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/stores_items/all",
        data: {
          where: { barcode: $scope.search_barcode }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              let foundSize = false;

              if (response.data.list[0].sizes && response.data.list[0].sizes.length > 0)
                response.data.list[0].sizes.forEach(_size => {
                  let foundUnit = false;
                  _size.add_sizes = response.data.list[0].add_sizes;

                  if (_size.size_units_list && _size.size_units_list.length > 0)
                    _size.size_units_list.forEach(_unit => {
                      _unit.discount = Object.assign({}, $scope.store_offer.offer_value);
                      if ((_unit.barcode === $scope.search_barcode) && typeof _unit.barcode == 'string') {
                        foundUnit = true;
                      }

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
                             /*    if (_store.store.id == $scope.store_offer.store.id) {
                                  foundStore = true;
                                  indxStore = i;
                                } */
                              });
                              _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach(_unitStore => {

                                if (foundStore && _unitStore.id == _unit.id) {

                                  _unit.store_count = _unitStore.current_count || 0;

                                }
                              });
                            }
                          }
                        }
                      }
                    });

                  if ((_size.barcode === $scope.search_barcode) || foundUnit) {

                    _size.name_Ar = response.data.list[0].name_Ar;
                    _size.name_En = response.data.list[0].name_En;
                    _size.item_group = response.data.list[0].item_group;

                    foundSize = $scope.store_offer.items.some(_itemSize => _itemSize.barcode === _size.barcode);

                    if (!foundSize) $scope.store_offer.items.unshift(_size);
                  }

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

  $scope.edit = function (store_offer) {
    $scope.error = '';
    $scope.get_open_shift((shift) => {
      if (shift) {
        $scope.view(store_offer);
        $scope.store_offer = {};
        $scope.edit_price = false;
        site.showModal('#updateStoreOfferModal');
      } else $scope.error = '##word.open_shift_not_found##';
    });
  };

  $scope.update = function (store_offer) {
    $scope.error = '';
    $scope.busy = true;


    if (new Date($scope.store_offer.startup_date) > new Date($scope.store_offer.deadline_date)) {
      $scope.error = "##word.stores_offer_err_date##";
      return;

    };

    if (store_offer.items && store_offer.items.length > 0) {

      $scope.financialYear(store_offer.date, is_allowed_date => {
        if (!is_allowed_date) {
          $scope.error = '##word.should_open_period##';

        } else {

          $http({
            method: "POST",
            url: "/api/stores_offer/update",
            data: store_offer
          }).then(
            function (response) {
              $scope.busy = false;
              if (response.data.done) {
                site.hideModal('#updateStoreOfferModal');
                $scope.loadAll();
              } else {
                $scope.error = '##word.error##';
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
    } else {
      $scope.error = "##word.must_enter_quantity##";
      return;
    }
  };

  $scope.loadOfferTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/stores_offer/offer_types/all',
      data: {},
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.offerTypes = response.data;
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
      method: "POST",
      url: "/api/items_group/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {

          $scope.categories = response.data.list;
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
    site.hideModal('#StoresOfferSearchModal');

  };

  $scope.loadAll = function (where) {
    $scope.error = '';
    $scope.list = [];
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/stores_offer/all",
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

  $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {

      if ($scope.store_offer.items && $scope.store_offer.items.length > 0)
        $scope.store_offer.items.forEach(_item => {
          if (_item.size_units_list && _item.size_units_list.length > 0)
            _item.size_units_list.forEach(_itmUnit => {
              _itmUnit.discount = Object.assign({}, $scope.store_offer.offer_value);
            });
        });

    }, 300);
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

  $scope.get_open_shift = function (callback) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shifts/get_open_shift",
      data: {
        where: { active: true },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1, from_date: 1, from_time: 1, to_date: 1, to_time: 1 }
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

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "items_offers"
      }
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
    )
  };

  $scope.getNumberingAuto();
  $scope.loadCategories();
  $scope.getDefaultSettings();
  $scope.loadOfferTypes();
  $scope.loadAll();
});