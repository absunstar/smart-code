module.exports = function init(site) {
    const $stores_items = site.connectCollection('stores_items');
    const $items_group = site.connectCollection('items_group');
    const $units = site.connectCollection('units');

    const $itemsFile = site.connectCollection('itemsFile');

    site.on('[transfer_branch][stores_items][add_balance]', (obj, callback, next) => {
        // console.log(new Date().getTime() + ' : [transfer_branch][stores_items][add_balance]')

        // console.log(new Date().getTime() + ' : add_balance_list_action()')
        if (obj.unit && obj.unit.id) {
            if (obj.patch_list && obj.patch_list.length > 0) {
                obj.patch_list.forEach((_pl) => {
                    delete _pl.select;
                });
            }
            let total_unit = obj.count * obj.unit.convert;
            total_unit = site.toNumber(total_unit);

            let totalPriceAll = obj.price * site.toNumber(total_unit);
            let totalCostAll = obj.cost * site.toNumber(total_unit);

            let totalPrice = obj.price * site.toNumber(obj.count);
            let totalCost = obj.cost * site.toNumber(obj.count);

            let obj_branch = {
                name_ar: obj.branch.name_ar,
                name_en: obj.branch.name_en,
                code: obj.branch.code,
                start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(total_unit) : 0,
                current_count: obj.type == 'sum' ? site.toNumber(total_unit) : -Math.abs(total_unit),

                total_buy_cost: obj.type == 'sum' ? totalCostAll : 0,
                total_buy_count: obj.type == 'sum' ? site.toNumber(total_unit) : 0,

                total_sell_price: obj.type == 'minus' ? totalPriceAll : 0,
                total_sell_count: obj.type == 'minus' ? site.toNumber(total_unit) : 0,

                average_cost: site.toNumber(totalCostAll) / site.toNumber(total_unit),
                size_units_list: [
                    {
                        id: obj.unit.id,
                        name_ar: obj.unit.name_ar,
                        name_en: obj.unit.name_en,
                        barcode: obj.unit.barcode,
                        current_count: obj.type == 'sum' ? obj.count : -Math.abs(obj.count),
                        start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(obj.count) : 0,

                        total_buy_cost: obj.type == 'sum' ? totalCost : 0,
                        total_buy_count: obj.type == 'sum' ? site.toNumber(obj.count) : 0,

                        total_sell_price: obj.type == 'minus' ? totalPrice : 0,
                        total_sell_count: obj.type == 'minus' ? site.toNumber(obj.count) : 0,

                        average_cost: site.toNumber(totalCost) / site.toNumber(obj.count),
                    },
                ],
                stores_list: [
                    {
                        store: obj.store,
                        start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(total_unit) : 0,
                        current_count: obj.type == 'sum' ? site.toNumber(total_unit) : -Math.abs(total_unit),

                        total_buy_cost: obj.type == 'sum' ? totalCostAll : 0,
                        total_buy_count: obj.type == 'sum' ? site.toNumber(total_unit) : 0,

                        total_sell_price: obj.type == 'minus' ? totalPriceAll : 0,
                        total_sell_count: obj.type == 'minus' ? site.toNumber(total_unit) : 0,

                        average_cost: site.toNumber(totalCost) / site.toNumber(total_unit),
                        size_units_list: [
                            {
                                patch_list: obj.patch_list,
                                id: obj.unit.id,
                                name_ar: obj.unit.name_ar,
                                name_en: obj.unit.name_en,
                                barcode: obj.unit.barcode,
                                start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(obj.count) : 0,
                                current_count: obj.type == 'sum' ? obj.count : -Math.abs(obj.count),

                                total_buy_cost: obj.type == 'sum' ? totalCost : 0,
                                total_buy_count: obj.type == 'sum' ? site.toNumber(obj.count) : 0,

                                total_sell_price: obj.type == 'minus' ? totalPrice : 0,
                                total_sell_count: obj.type == 'minus' ? site.toNumber(obj.count) : 0,

                                average_cost: site.toNumber(totalCost) / site.toNumber(obj.count),
                            },
                        ],
                    },
                ],
            };

            let obj_store = {
                store: obj.store,
                start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(total_unit) : 0,
                current_count: obj.type == 'sum' ? site.toNumber(total_unit) : -Math.abs(total_unit),

                total_buy_cost: obj.type == 'sum' ? totalCostAll : 0,
                total_buy_count: obj.type == 'sum' ? site.toNumber(total_unit) : 0,

                total_sell_price: obj.type == 'minus' ? totalPriceAll : 0,
                total_sell_count: obj.type == 'minus' ? site.toNumber(total_unit) : 0,

                average_cost: site.toNumber(totalCost) / site.toNumber(total_unit),
                size_units_list: [
                    {
                        patch_list: obj.patch_list,
                        id: obj.unit.id,
                        name_ar: obj.unit.name_ar,
                        name_en: obj.unit.name_en,
                        barcode: obj.unit.barcode,
                        start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(obj.count) : 0,
                        current_count: obj.type == 'sum' ? obj.count : -Math.abs(obj.count),

                        total_buy_cost: obj.type == 'sum' ? totalCost : 0,
                        total_buy_count: obj.type == 'sum' ? site.toNumber(obj.count) : 0,

                        total_sell_price: obj.type == 'minus' ? totalPrice : 0,
                        total_sell_count: obj.type == 'minus' ? site.toNumber(obj.count) : 0,

                        average_cost: site.toNumber(totalCost) / site.toNumber(obj.count),
                    },
                ],
            };

            $stores_items.findOne(
                {
                    'sizes.barcode': obj.barcode,
                    'company.id': obj.company.id,
                },
                (err, doc) => {
                    if (!err && doc && doc.sizes && doc.sizes.length > 0) {
                        doc.sizes.forEach((_size) => {
                            if (_size.barcode === obj.barcode) {
                                let total_complex_av = 0;

                                if (_size.item_complex) {
                                    if (_size.complex_items && _size.complex_items.length > 0) _size.complex_items.map((_complex) => (total_complex_av += _complex.unit.average_cost * _complex.count));

                                    if (_size.value_add) {
                                        if (_size.value_add.type == 'percent') total_complex_av = total_complex_av + (site.toNumber(_size.value_add.value) * total_complex_av) / 100;
                                        else total_complex_av = total_complex_av + site.toNumber(_size.value_add.value);
                                    }
                                }
                                total_complex_av = site.toNumber(total_complex_av);

                                if (obj.source_type && obj.source_type.id == 3 && obj.store_in) {
                                    if (obj.type == 'sum') _size.start_count = site.toNumber(_size.start_count || 0) + site.toNumber(total_unit);
                                    else if (obj.type == 'minus') _size.start_count = site.toNumber(_size.start_count || 0) - site.toNumber(total_unit);
                                }

                                if (obj.type == 'sum') {
                                    _size.current_count = site.toNumber(_size.current_count || 0) + site.toNumber(total_unit);

                                    if (obj.returnSell) {
                                        _size.total_sell_price = (_size.total_sell_price || 0) - totalPriceAll;
                                        _size.total_sell_count = (_size.total_sell_count || 0) - site.toNumber(total_unit);
                                    }
                                } else if (obj.type == 'minus') {
                                    _size.current_count = site.toNumber(_size.current_count) - site.toNumber(total_unit);
                                    _size.total_sell_price = (_size.total_sell_price || 0) + totalPriceAll;
                                    _size.total_sell_count = (_size.total_sell_count || 0) + site.toNumber(total_unit);
                                }

                                if (obj.set_average == 'sum_average') {
                                    _size.total_buy_cost = (_size.total_buy_cost || 0) + totalCostAll;
                                    _size.total_buy_count = (_size.total_buy_count || 0) + site.toNumber(total_unit);
                                } else if (obj.set_average == 'minus_average') {
                                    _size.total_buy_cost = (_size.total_buy_cost || 0) - totalCostAll;
                                    _size.total_buy_count = (_size.total_buy_count || 0) - site.toNumber(total_unit);
                                }

                                if (obj.assemble) _size.average_cost = total_complex_av;
                                else if (!obj.item_complex && obj.set_average) _size.average_cost = site.toNumber(_size.total_buy_cost) / site.toNumber(_size.total_buy_count);

                                _size.average_cost = site.toNumber(_size.average_cost);

                                _size.size_units_list.forEach((_unitSize) => {
                                    if (obj.unit && _unitSize.id == obj.unit.id) {
                                        if (obj.type == 'sum') {
                                            _unitSize.current_count = (_unitSize.current_count || 0) + obj.count;
                                            if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                _unitSize.start_count = site.toNumber(_unitSize.start_count || 0) + site.toNumber(obj.count);

                                            if (obj.returnSell) {
                                                _unitSize.total_sell_price = (_unitSize.total_sell_price || 0) - totalPrice;
                                                _unitSize.total_sell_count = (_unitSize.total_sell_count || 0) - site.toNumber(obj.count);
                                            }
                                        } else if (obj.type == 'minus') {
                                            _unitSize.current_count = (_unitSize.current_count || 0) - obj.count;
                                            if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                _unitSize.start_count = site.toNumber(_unitSize.start_count || 0) - site.toNumber(obj.count);
                                            _unitSize.total_sell_price = (_unitSize.total_sell_price || 0) + totalPrice;
                                            _unitSize.total_sell_count = (_unitSize.total_sell_count || 0) + site.toNumber(obj.count);
                                        }

                                        if (obj.set_average == 'sum_average') {
                                            _unitSize.total_buy_cost = (_unitSize.total_buy_cost || 0) + totalCost;
                                            _unitSize.total_buy_count = (_unitSize.total_buy_count || 0) + site.toNumber(obj.count);
                                        } else if (obj.set_average == 'minus_average') {
                                            _unitSize.total_buy_cost = (_unitSize.total_buy_cost || 0) - totalCost;
                                            _unitSize.total_buy_count = (_unitSize.total_buy_count || 0) - site.toNumber(obj.count);
                                        }

                                        if (obj.assemble) _unitSize.average_cost = total_complex_av;
                                        else if (!obj.item_complex && obj.set_average) _unitSize.average_cost = site.toNumber(_unitSize.total_buy_cost) / site.toNumber(_unitSize.total_buy_count);

                                        _unitSize.average_cost = site.toNumber(_unitSize.average_cost);

                                        // _unitSize.cost = site.toNumber(obj.cost)
                                        // _unitSize.price = site.toNumber(obj.price)

                                        if (obj.set_average) {
                                            $stores_items.findMany(
                                                {
                                                    where: {
                                                        'sizes.complex_items.barcode': obj.barcode,
                                                        'company.id': obj.company.id,
                                                    },
                                                },
                                                (err, comolex_docs) => {
                                                    if (comolex_docs && comolex_docs.length > 0)
                                                        comolex_docs.forEach((_complexDoc) => {
                                                            if (_complexDoc.sizes && _complexDoc.sizes.length > 0)
                                                                _complexDoc.sizes.forEach((_complexSize) => {
                                                                    if (_complexSize.complex_items && _complexSize.complex_items.length > 0) {
                                                                        _complexSize.complex_items.forEach((_complexItem) => {
                                                                            if (_complexItem.barcode === obj.barcode && _complexItem.unit.id == obj.unit.id)
                                                                                _complexItem.unit.average_cost = _unitSize.average_cost;
                                                                        });
                                                                    }
                                                                });
                                                            $stores_items.update(_complexDoc, () => {});
                                                        });
                                                },
                                            );
                                        }
                                    }
                                });

                                if (_size.branches_list && _size.branches_list.length > 0) {
                                    let foundBranch = false;
                                    let indxBranch = 0;
                                    _size.branches_list.map((b, i_b) => {
                                        if (b.code == obj.branch.code) {
                                            foundBranch = true;
                                            indxBranch = i_b;
                                        }
                                    });

                                    let foundStore = false;
                                    let indxStore = 0;
                                    _size.branches_list[indxBranch].stores_list = _size.branches_list[indxBranch].stores_list || [];
                                    _size.branches_list[indxBranch].stores_list.map((s, i_s) => {
                                        if (obj.store && s.store.id == obj.store.id) {
                                            foundStore = true;
                                            indxStore = i_s;
                                        }
                                    });

                                    if (foundBranch) {
                                        let unit_branch = false;

                                        _size.branches_list[indxBranch].size_units_list.forEach((_unitBranch) => {
                                            if (obj.unit && _unitBranch.id == obj.unit.id) {
                                                if (obj.type == 'sum') {
                                                    if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                        _unitBranch.start_count = site.toNumber(_unitBranch.start_count || 0) + site.toNumber(obj.count);
                                                    _unitBranch.current_count = (_unitBranch.current_count || 0) + obj.count;

                                                    if (obj.returnSell) {
                                                        _unitBranch.total_sell_price = (_unitBranch.total_sell_price || 0) - totalPrice;
                                                        _unitBranch.total_sell_count = (_unitBranch.total_sell_count || 0) - site.toNumber(obj.count);
                                                    }
                                                } else if (obj.type == 'minus') {
                                                    if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                        _unitBranch.start_count = site.toNumber(_unitBranch.start_count || 0) - site.toNumber(obj.count);

                                                    _unitBranch.current_count = (_unitBranch.current_count || 0) - obj.count;
                                                    _unitBranch.total_sell_price = (_unitBranch.total_sell_price || 0) + totalPrice;
                                                    _unitBranch.total_sell_count = (_unitBranch.total_sell_count || 0) + site.toNumber(obj.count);
                                                }

                                                if (obj.set_average == 'sum_average') {
                                                    _unitBranch.total_buy_cost = (_unitBranch.total_buy_cost || 0) + totalCost;
                                                    _unitBranch.total_buy_count = (_unitBranch.total_buy_count || 0) + site.toNumber(obj.count);
                                                } else if (obj.set_average == 'minus_average') {
                                                    _unitBranch.total_buy_cost = (_unitBranch.total_buy_cost || 0) - totalCost;
                                                    _unitBranch.total_buy_count = (_unitBranch.total_buy_count || 0) - site.toNumber(obj.count);
                                                }

                                                if (obj.assemble) _unitBranch.average_cost = total_complex_av;
                                                else if (!obj.item_complex && obj.set_average)
                                                    _unitBranch.average_cost = site.toNumber(_unitBranch.total_buy_cost) / site.toNumber(_unitBranch.total_buy_count);

                                                _unitBranch.average_cost = site.toNumber(_unitBranch.average_cost);

                                                unit_branch = true;
                                            }
                                        });
                                        if (!unit_branch) {
                                            _size.branches_list[indxBranch].size_units_list.push({
                                                id: obj.unit.id,
                                                name_ar: obj.unit.name_ar,
                                                name_en: obj.unit.name_en,
                                                barcode: obj.unit.barcode,
                                                start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(obj.count) : 0,
                                                current_count: obj.type == 'sum' ? obj.count : -Math.abs(obj.count),

                                                total_buy_cost: obj.type == 'sum' ? totalCost : 0,
                                                total_buy_count: obj.type == 'sum' ? site.toNumber(obj.count) : 0,

                                                total_sell_price: obj.type == 'minus' ? totalPrice : 0,
                                                total_sell_count: obj.type == 'minus' ? site.toNumber(obj.count) : 0,
                                                average_cost: site.toNumber(totalCost) / site.toNumber(obj.count),
                                            });
                                        }

                                        if (obj.type == 'sum') {
                                            if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                _size.branches_list[indxBranch].start_count = (_size.branches_list[indxBranch].start_count || 0) + site.toNumber(total_unit);
                                            _size.branches_list[indxBranch].current_count = _size.branches_list[indxBranch].current_count + site.toNumber(total_unit);

                                            if (obj.returnSell) {
                                                _size.branches_list[indxBranch].total_sell_price = (_size.branches_list[indxBranch].total_sell_price || 0) - totalPriceAll;
                                                _size.branches_list[indxBranch].total_sell_count = (_size.branches_list[indxBranch].total_sell_count || 0) - site.toNumber(total_unit);
                                            }
                                        } else if (obj.type == 'minus') {
                                            if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                _size.branches_list[indxBranch].start_count = (_size.branches_list[indxBranch].start_count || 0) - site.toNumber(total_unit);

                                            _size.branches_list[indxBranch].current_count = _size.branches_list[indxBranch].current_count - site.toNumber(total_unit);
                                            _size.branches_list[indxBranch].total_sell_price = (_size.branches_list[indxBranch].total_sell_price || 0) + totalPriceAll;
                                            _size.branches_list[indxBranch].total_sell_count = (_size.branches_list[indxBranch].total_sell_count || 0) + site.toNumber(total_unit);
                                        }

                                        if (obj.set_average == 'sum_average') {
                                            _size.branches_list[indxBranch].total_buy_cost = (_size.branches_list[indxBranch].total_buy_cost || 0) + totalCostAll;
                                            _size.branches_list[indxBranch].total_buy_count = (_size.branches_list[indxBranch].total_buy_count || 0) + site.toNumber(total_unit);
                                        } else if (obj.set_average == 'minus_average') {
                                            _size.branches_list[indxBranch].total_buy_cost = (_size.branches_list[indxBranch].total_buy_cost || 0) - totalCostAll;
                                            _size.branches_list[indxBranch].total_buy_count = (_size.branches_list[indxBranch].total_buy_count || 0) - site.toNumber(total_unit);
                                        }

                                        if (obj.assemble) _size.branches_list[indxBranch].average_cost = total_complex_av;
                                        else if (!obj.item_complex && obj.set_average)
                                            _size.branches_list[indxBranch].average_cost =
                                                site.toNumber(_size.branches_list[indxBranch].total_buy_cost) / site.toNumber(_size.branches_list[indxBranch].total_buy_count);

                                        _size.branches_list[indxBranch].average_cost = site.toNumber(_size.branches_list[indxBranch].average_cost);

                                        if (_size.branches_list[indxBranch].stores_list && _size.branches_list[indxBranch].stores_list.length > 0) {
                                            if (foundStore) {
                                                let unit_store = false;
                                                if (obj.stock) _size.branches_list[indxBranch].stores_list[indxStore].hold = false;

                                                _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.forEach((_unitStore) => {
                                                    if (obj.unit && _unitStore.id == obj.unit.id) {
                                                        if (_unitStore.patch_list && _unitStore.patch_list.length > 0) {
                                                            // if (obj.patch_list && obj.patch_list.length > 0)
                                                            //   obj.patch_list.map(_patch1 => {
                                                            //     let found_patch = _unitStore.patch_list.some(_pp => _patch1.patch == _pp.patch && _patch1.validit == _pp.validit)
                                                            //     if (!found_patch) _unitStore.patch_list.push(_patch1)

                                                            //   });

                                                            if (obj.patch_list && obj.patch_list.length > 0) {
                                                                let foundPatshList = [];

                                                                obj.patch_list.forEach((_patch) => {
                                                                    let foundPatsh = _unitStore.patch_list.some((_p1) => _patch.patch === _p1.patch);

                                                                    if (!foundPatsh) foundPatshList.push(_patch);

                                                                    _unitStore.patch_list.forEach((_patchStore) => {
                                                                        if (_patch.patch === _patchStore.patch && _patch.validit === _patchStore.validit) {
                                                                            if (obj.type == 'sum') {
                                                                                _patchStore.count = _patchStore.count + _patch.count;
                                                                            } else if (obj.type == 'minus') {
                                                                                _patchStore.count = _patchStore.count - _patch.count;
                                                                            }
                                                                            //  else {
                                                                            //   _unitStore.patch_list.push(_patch)
                                                                            // }
                                                                        }
                                                                    });
                                                                });

                                                                foundPatshList.forEach((fP) => {
                                                                    _unitStore.patch_list.push(fP);
                                                                });

                                                                let filter_patch = _unitStore.patch_list.filter((_p) => _p.count !== 0);
                                                                _unitStore.patch_list = filter_patch;

                                                                if (_unitStore.patch_list.length === 1 && _unitStore.patch_list[0].count === 0) _unitStore.patch_list = [];
                                                            }
                                                        } else {
                                                            _unitStore.patch_list = obj.patch_list;
                                                        }

                                                        if (obj.type == 'sum') {
                                                            _unitStore.current_count = (_unitStore.current_count || 0) + obj.count;
                                                            if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                                _unitStore.start_count = site.toNumber(_unitStore.start_count || 0) + site.toNumber(obj.count);

                                                            if (obj.returnSell) {
                                                                _unitStore.total_sell_price = (_unitStore.total_sell_price || 0) - totalPrice;
                                                                _unitStore.total_sell_count = (_unitStore.total_sell_count || 0) - site.toNumber(obj.count);
                                                            }
                                                        } else if (obj.type == 'minus') {
                                                            _unitStore.current_count = (_unitStore.current_count || 0) - obj.count;
                                                            if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                                _unitStore.start_count = site.toNumber(_unitStore.start_count || 0) - site.toNumber(obj.count);
                                                            _unitStore.total_sell_price = (_unitStore.total_sell_price || 0) + totalPrice;
                                                            _unitStore.total_sell_count = (_unitStore.total_sell_count || 0) + site.toNumber(obj.count);
                                                        }

                                                        if (obj.set_average == 'sum_average') {
                                                            _unitStore.total_buy_cost = (_unitStore.total_buy_cost || 0) + totalCost;
                                                            _unitStore.total_buy_count = (_unitStore.total_buy_count || 0) + site.toNumber(obj.count);
                                                        } else if (obj.set_average == 'minus_average') {
                                                            _unitStore.total_buy_cost = (_unitStore.total_buy_cost || 0) - totalCost;
                                                            _unitStore.total_buy_count = (_unitStore.total_buy_count || 0) - site.toNumber(obj.count);
                                                        }

                                                        if (obj.assemble) _unitStore.average_cost = total_complex_av;
                                                        else if (!obj.item_complex && obj.set_average)
                                                            _unitStore.average_cost = site.toNumber(_unitStore.total_buy_cost) / site.toNumber(_unitStore.total_buy_count);

                                                        _unitStore.average_cost = site.toNumber(_unitStore.average_cost);

                                                        unit_store = true;
                                                    }
                                                });

                                                if (!unit_store) {
                                                    _size.branches_list[indxBranch].stores_list[indxStore].size_units_list.push({
                                                        patch_list: obj.patch_list,
                                                        id: obj.unit.id,
                                                        name_ar: obj.unit.name_ar,
                                                        name_en: obj.unit.name_en,
                                                        barcode: obj.unit.barcode,
                                                        start_count: obj.source_type && obj.source_type.id == 3 && obj.store_in ? site.toNumber(obj.count) : 0,
                                                        current_count: obj.type == 'sum' ? obj.count : -Math.abs(obj.count),

                                                        total_buy_cost: obj.type == 'sum' ? totalCost : 0,
                                                        total_buy_count: obj.type == 'sum' ? site.toNumber(obj.count) : 0,

                                                        total_sell_price: obj.type == 'minus' ? totalPrice : 0,
                                                        total_sell_count: obj.type == 'minus' ? site.toNumber(obj.count) : 0,
                                                        average_cost: site.toNumber(totalCost) / site.toNumber(obj.count),
                                                    });
                                                }

                                                if (obj.type == 'sum') {
                                                    if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                        _size.branches_list[indxBranch].stores_list[indxStore].start_count =
                                                            site.toNumber(_size.branches_list[indxBranch].stores_list[indxStore].start_count || 0) + site.toNumber(total_unit);
                                                    _size.branches_list[indxBranch].stores_list[indxStore].current_count =
                                                        site.toNumber(_size.branches_list[indxBranch].stores_list[indxStore].current_count || 0) + site.toNumber(total_unit);

                                                    if (obj.returnSell) {
                                                        _size.branches_list[indxBranch].stores_list[indxStore].total_sell_price =
                                                            (_size.branches_list[indxBranch].stores_list[indxStore].total_sell_price || 0) - totalPrice;
                                                        _size.branches_list[indxBranch].stores_list[indxStore].total_sell_count =
                                                            (_size.branches_list[indxBranch].stores_list[indxStore].total_sell_count || 0) - site.toNumber(total_unit);
                                                    }
                                                } else if (obj.type == 'minus') {
                                                    if (obj.source_type && obj.source_type.id == 3 && obj.store_in)
                                                        _size.branches_list[indxBranch].stores_list[indxStore].start_count =
                                                            site.toNumber(_size.branches_list[indxBranch].stores_list[indxStore].start_count || 0) - site.toNumber(total_unit);
                                                    _size.branches_list[indxBranch].stores_list[indxStore].current_count =
                                                        site.toNumber(_size.branches_list[indxBranch].stores_list[indxStore].current_count || 0) - site.toNumber(total_unit);
                                                    _size.branches_list[indxBranch].stores_list[indxStore].total_sell_price =
                                                        (_size.branches_list[indxBranch].stores_list[indxStore].total_sell_price || 0) + totalPrice;
                                                    _size.branches_list[indxBranch].stores_list[indxStore].total_sell_count =
                                                        (_size.branches_list[indxBranch].stores_list[indxStore].total_sell_count || 0) + site.toNumber(total_unit);
                                                }

                                                if (obj.set_average == 'sum_average') {
                                                    _size.branches_list[indxBranch].stores_list[indxStore].total_buy_cost =
                                                        (_size.branches_list[indxBranch].stores_list[indxStore].total_buy_cost || 0) + totalCostAll;
                                                    _size.branches_list[indxBranch].stores_list[indxStore].total_buy_count =
                                                        (_size.branches_list[indxBranch].stores_list[indxStore].total_buy_count || 0) + site.toNumber(total_unit);
                                                } else if (obj.set_average == 'minus_average') {
                                                    _size.branches_list[indxBranch].stores_list[indxStore].total_buy_cost =
                                                        (_size.branches_list[indxBranch].stores_list[indxStore].total_buy_cost || 0) - totalCostAll;
                                                    _size.branches_list[indxBranch].stores_list[indxStore].total_buy_count =
                                                        (_size.branches_list[indxBranch].stores_list[indxStore].total_buy_count || 0) - site.toNumber(total_unit);
                                                }

                                                if (obj.assemble) _size.branches_list[indxBranch].stores_list[indxStore].average_cost = total_complex_av;
                                                else if (!obj.item_complex && obj.set_average)
                                                    _size.branches_list[indxBranch].stores_list[indxStore].average_cost =
                                                        site.toNumber(_size.branches_list[indxBranch].stores_list[indxStore].total_buy_cost) /
                                                        site.toNumber(_size.branches_list[indxBranch].stores_list[indxStore].total_buy_count);

                                                _size.branches_list[indxBranch].stores_list[indxStore].average_cost = site.toNumber(
                                                    _size.branches_list[indxBranch].stores_list[indxStore].average_cost,
                                                );
                                            } else _size.branches_list[indxBranch].stores_list.push(obj_store);
                                        } else _size.branches_list[indxBranch].stores_list = [obj_store];
                                    } else _size.branches_list.push(obj_branch);
                                } else _size.branches_list = [obj_branch];
                            }

                            // if (_size.item_complex) {
                            //   _size.complex_items.forEach(_complex_item => {
                            //     _complex_item.count = _complex_item.count * obj.count
                            //     site.quee('[transfer_branch][stores_items][add_balance]', Object.assign({}, _complex_item))
                            //   })
                            // }
                        });

                        // doc.sizes.forEach(ziiii => {
                        //   ziiii.branches_list.forEach(bbbbbb => {
                        //     bbbbbb.stores_list.forEach(ssssssss => {
                        //       ssssssss.size_units_list.forEach(element => {
                        //       });
                        //     });
                        //   });
                        // });

                        $stores_items.update(doc, (err, doooc) => {
                            if (obj.current_status == 'stock') {
                                site.holdingItems({ ...obj.transaction_obj });
                            }

                            // doooc.doc.sizes.forEach(ziiii => {
                            //   ziiii.branches_list.forEach(bbbbbb => {
                            //     bbbbbb.stores_list.forEach(ssssssss => {
                            //       ssssssss.size_units_list.forEach(element => {
                            //         console.log("new Doc", element, doooc.doc.id);
                            //       });
                            //     });
                            //   });
                            // });

                            // doooc.old_doc.sizes.forEach(ziiii => {
                            //   ziiii.branches_list.forEach(bbbbbb => {
                            //     bbbbbb.stores_list.forEach(ssssssss => {
                            //       ssssssss.size_units_list.forEach(element => {
                            //       });
                            //     });
                            //   });
                            // });

                            next();
                        });
                    } else {
                        next();
                    }
                },
            );
        } else {
            next();
        }
    });

    site.holdingItems = function (obj) {
        let where = {};
        let barcodes = obj.items.map((_item) => _item.barcode);

        where['company.id'] = obj.company.id;

        where['sizes.barcode'] = {
            $in: barcodes,
        };

        $stores_items.findMany(
            {
                where: where,
            },
            (err, docs) => {
                docs.forEach((_doc) => {
                    if (_doc.sizes && _doc.sizes.length > 0) {
                        _doc.sizes.forEach((_size) => {
                            obj.items.forEach((_item) => {
                                if (_size.barcode === _item.barcode) {
                                    if (_size.branches_list && _size.branches_list.length > 0) {
                                        _size.branches_list.forEach((_branch) => {
                                            if (_branch.code == obj.branch.code) {
                                                if (_branch.stores_list && _branch.stores_list.length > 0) {
                                                    _branch.stores_list.forEach((_storeHold) => {
                                                        if (_storeHold.store && _storeHold.store.id == obj.store.id) {
                                                            if (obj.hold) {
                                                                _storeHold.hold = true;
                                                            } else {
                                                                _storeHold.hold = false;
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            });
                        });
                    }
                    $stores_items.updateOne(_doc);
                });
            },
        );
    };

    site.get({
        name: 'stores_items',
        path: __dirname + '/site_files/html/index.html',
        parser: 'html',
        compress: true,
    });

    site.get({
        name: 'images',
        path: __dirname + '/site_files/images/',
    });

    site.post({
        name: '/api/items_types/all',
        path: __dirname + '/site_files/json/items_types.json',
    });

    site.post('/api/stores_items/add', (req, res) => {
        let response = {};
        response.done = false;
        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }
        let stores_items_doc = req.body.category_item;
        let item_doc = req.body.item;
        // stores_items_doc.$req = req
        // stores_items_doc.$res = res

        stores_items_doc.company = site.get_company(req);
        stores_items_doc.branch = site.get_branch(req);

        stores_items_doc.add_user_info = site.security.getUserFinger({
            $req: req,
            $res: res,
        });

        site.getBarcodesList(req, (cbBarcodesList) => {
            site.getDefaultSetting(req, (settingCallback) => {
                if (!stores_items_doc.add_sizes) {
                    item_doc.size_ar = stores_items_doc.name_ar;
                    item_doc.size_en = stores_items_doc.name_en;
                    item_doc.start_count = 0;
                    item_doc.current_count = 0;
                    item_doc.total_sell_price = 0;
                    item_doc.total_sell_count = 0;
                    item_doc.total_buy_cost = 0;
                    item_doc.total_buy_count = 0;
                    item_doc.size_units_list = [];
                    stores_items_doc.units_list.forEach((_size_unit) => {
                        item_doc.size_units_list.push({
                            id: _size_unit.id,
                            name_ar: _size_unit.name_ar,
                            name_en: _size_unit.name_en,
                            convert: _size_unit.convert,
                            barcode: _size_unit.barcode,
                            price: _size_unit.price,
                            cost: _size_unit.cost,
                            current_count: 0,
                            start_count: 0,
                            average_cost: _size_unit.average_cost,
                            discount: { ..._size_unit.discount },
                        });
                    });
                    stores_items_doc.sizes = [item_doc];
                }

                if (stores_items_doc.sizes && stores_items_doc.sizes.length < 1 && stores_items_doc.add_sizes) {
                    response.error = 'Should Add Items';
                    res.json(response);
                    return;
                }

                let err_barcode = false;

                stores_items_doc.sizes.forEach((_size) => {
                    if (settingCallback && settingCallback.inventory && !settingCallback.inventory.auto_barcode_generation) {
                        if (!_size.barcode || _size.barcode == null) {
                            response.error = 'Must Enter Barcode';
                            res.json(response);
                            return;
                        }

                        let err_barcode1 = cbBarcodesList.some((_itemSize) => _itemSize.barcode === _size.barcode);
                        if (err_barcode1) {
                            err_barcode = true;
                        }
                    }

                    _size.item_type = stores_items_doc.item_type;

                    _size.size_units_list.forEach((_size_unit) => {
                        let indx = stores_items_doc.units_list.findIndex((_unit1) => _unit1.id == _size_unit.id);
                        if (stores_items_doc.units_list[indx] && stores_items_doc.units_list[indx].convert) _size_unit.convert = stores_items_doc.units_list[indx].convert;

                        if (!_size_unit.average_cost) _size_unit.average_cost = _size_unit.cost;

                        _size_unit.current_count = 0;
                        _size_unit.start_count = 0;
                    });
                });

                if (err_barcode) {
                    response.error = 'Barcode Exists';
                    res.json(response);
                    return;
                }

                let unitDiscount = false;
                let foundBarcodeUnit = false;
                let notBarcodeUnit = false;
                let sizesList = [];
                let existBarcodeUnitList = [];

                stores_items_doc.sizes.forEach((_size) => {
                    let total_complex_av = 0;

                    if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) {
                        _size.complex_items.map((_complex) => (total_complex_av += _complex.unit.average_cost * _complex.count));

                        if (_size.value_add) {
                            if (_size.value_add.type == 'percent') total_complex_av = total_complex_av + (site.toNumber(_size.value_add.value) * total_complex_av) / 100;
                            else total_complex_av = total_complex_av + site.toNumber(_size.value_add.value);
                        }
                    }

                    if (_size.kitchen_branch_list && _size.kitchen_branch_list.length > 0) {
                        _size.branches_list = [];

                        _size.kitchen_branch_list.forEach((_kB) => {
                            let obj = {
                                code: _kB.code,
                                name_ar: _kB.name_ar,
                                name_en: _kB.name_en,
                                kitchen: _kB.kitchen,
                                start_count: 0,
                                current_count: 0,
                                total_buy_cost: 0,
                                total_buy_count: 0,
                                total_sell_price: 0,
                                total_sell_count: 0,
                                average_cost: 0,
                                size_units_list: [],
                            };

                            _size.size_units_list.forEach((_u) => {
                                obj.size_units_list.push({
                                    id: _u.id,
                                    name_ar: _u.name_ar,
                                    name_en: _u.name_en,
                                    barcode: _u.barcode,
                                    start_count: 0,
                                    total_buy_cost: 0,
                                    total_buy_count: 0,
                                    total_sell_price: 0,
                                    total_sell_count: 0,
                                    average_cost: 0,
                                });
                            });
                            _size.branches_list.push(obj);
                        });
                        delete _size.kitchen_branch_list;
                    }

                    _size.size_units_list.forEach((_unit) => {
                        if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) _unit.average_cost = total_complex_av;
                        _unit.average_cost = site.toNumber(_unit.average_cost);
                        if (_unit.barcode === undefined) {
                            notBarcodeUnit = true;
                        }
                        let notFoundBarcodeUnitList = sizesList.some((_FbUL) => _FbUL === _size.barcode);
                        if (!notFoundBarcodeUnitList) sizesList.push(_size.barcode);
                        if (_unit.discount && _unit.discount.value > _unit.discount.max) unitDiscount = true;

                        let fonudExistBu = cbBarcodesList.some((_unit1) => _unit1.barcode === _unit.barcode);
                        if (fonudExistBu) {
                            let foundExistBarcodeUnitList = existBarcodeUnitList.some((_ExBuL) => _ExBuL === _size.barcode);
                            if (!foundExistBarcodeUnitList) existBarcodeUnitList.push(_unit.barcode);
                            foundBarcodeUnit = true;
                        }
                    });
                });

                if (unitDiscount) {
                    response.error = `DiscountUG (${sizesList})`;
                    res.json(response);
                    return;
                }

                if (settingCallback && settingCallback.inventory && settingCallback.inventory.auto_unit_barcode_generation != true) {
                    if (notBarcodeUnit) {
                        response.error = `EnterBU (${sizesList})`;
                        res.json(response);
                        return;
                    }

                    if (foundBarcodeUnit) {
                        response.error = `ExistBu (${existBarcodeUnitList})`;
                        res.json(response);
                        return;
                    }
                }

                $stores_items.findMany(
                    {
                        where: {
                            'company.id': site.get_company(req).id,
                        },
                    },
                    (err, docs, count) => {
                        if (!err && count >= site.get_company(req).item) {
                            response.error = 'The maximum number of adds exceeded';
                            res.json(response);
                        } else {
                            let num_obj = {
                                company: site.get_company(req),
                                screen: 'category_items',
                                date: new Date(),
                            };

                            let cb = site.getNumbering(num_obj);
                            if (!stores_items_doc.code && !cb.auto) {
                                response.error = 'Must Enter Code';
                                res.json(response);
                                return;
                            } else if (cb.auto) {
                                stores_items_doc.code = cb.code;
                            }

                            let opening_balances_obj = {
                                image_url: stores_items_doc.image_url,
                                company: stores_items_doc.company,
                                branch: stores_items_doc.branch,
                                name_ar: stores_items_doc.name_ar,
                                name_en: stores_items_doc.name_en,
                                add_user_info: stores_items_doc.add_user_info,
                                item_group: stores_items_doc.item_group,
                                sizes: stores_items_doc.sizes,
                            };
                            site.quee('[stores_items][stores_in][openingBalance]', opening_balances_obj);

                            // stores_items_doc.sizes.forEach(_size => {
                            //   if (_size.opening_palnce_list) {
                            //     delete _size.opening_palnce_list
                            //   }
                            // })

                            $stores_items.add(stores_items_doc, (err, doc) => {
                                if (!err) {
                                    response.done = true;

                                    // let d = new Date().getDate().toString();
                                    // let h = new Date().getHours().toString();
                                    let y = new Date().getFullYear().toString();

                                    let num = Math.floor(Math.random() * 100).toString();
                                    let docIdString = doc.id.toString();

                                    doc.sizes.forEach((_size, i_size) => {
                                        if (!_size.barcode || _size.barcode == null) _size.barcode = doc.company.id + docIdString + num  + i_size;

                                        _size.size_units_list.forEach((_size_unit, _i) => {
                                            let indx = doc.units_list.findIndex((_unit1) => _unit1.id == _size_unit.id);
                                            _size_unit.convert = (doc.units_list[indx] || _size_unit || {}).convert; //amr

                                            if (!_size_unit.average_cost) _size_unit.average_cost = _size_unit.cost;

                                            if (!_size_unit.barcode || _size_unit.barcode == null) _size_unit.barcode = doc.company.id + docIdString + (_size_unit.id || 0) + num + i_size + _i;
                                        });
                                    });
                                    $stores_items.update(doc);
                                } else response.error = err.message;
                                res.json(response);
                            });
                        }
                    },
                );
            });
        });
    });

    site.post('/api/stores_items/update', (req, res) => {
        let response = {};
        response.done = false;

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        let stores_items_doc = req.body.category_item;

        stores_items_doc.edit_user_info = site.security.getUserFinger({
            $req: req,
            $res: res,
        });

        site.getBarcodesList(req, (cbBarcodesList) => {
            site.getDefaultSetting(req, (settingCallback) => {
                if (!stores_items_doc.add_sizes) {
                    stores_items_doc.sizes[0].size_ar = stores_items_doc.name_ar;
                    stores_items_doc.sizes[0].size_en = stores_items_doc.name_en;
                }

                if (stores_items_doc.sizes && stores_items_doc.sizes.length < 1 && stores_items_doc.add_sizes) {
                    response.error = 'Should Add Items';
                    res.json(response);
                    return;
                }

                let err_barcode = false;

                stores_items_doc.sizes.forEach((_size) => {
                    if (settingCallback && settingCallback.inventory && !settingCallback.inventory.auto_barcode_generation) {
                        if (!_size.barcode || _size.barcode == null) {
                            response.error = 'Must Enter Barcode';
                            res.json(response);
                            return;
                        }

                        // let err_barcode1 = cbBarcodesList.some(_itemSize => _itemSize === _size.barcode);
                        cbBarcodesList.forEach((_cbBarList) => {
                            if (_cbBarList.barcode === _size.barcode && _cbBarList.id != stores_items_doc.id) {
                                err_barcode = true;
                            }
                        });
                        // if (err_barcode1) {
                        //   err_barcode = true
                        // }
                    }

                    _size.item_type = stores_items_doc.item_type;

                    _size.size_units_list.forEach((_size_unit) => {
                        let indx = stores_items_doc.units_list.findIndex((_unit1) => _unit1.id == _size_unit.id);
                        if (stores_items_doc.units_list[indx] && stores_items_doc.units_list[indx].convert) _size_unit.convert = stores_items_doc.units_list[indx].convert;

                        if (!_size_unit.average_cost) _size_unit.average_cost = _size_unit.cost;

                        _size_unit.current_count = 0;
                        _size_unit.start_count = 0;
                    });
                });

                if (err_barcode) {
                    response.error = 'Barcode Exists';
                    res.json(response);
                    return;
                }

                let unitDiscount = false;
                let foundBarcodeUnit = false;
                let notBarcodeUnit = false;
                let sizesList = [];
                let existBarcodeUnitList = [];

                stores_items_doc.sizes.forEach((_size) => {
                    let total_complex_av = 0;

                    if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) {
                        _size.complex_items.map((_complex) => (total_complex_av += _complex.unit.average_cost * _complex.count));

                        if (_size.value_add) {
                            if (_size.value_add.type == 'percent') total_complex_av = total_complex_av + (site.toNumber(_size.value_add.value) * total_complex_av) / 100;
                            else total_complex_av = total_complex_av + site.toNumber(_size.value_add.value);
                        }
                    }

                    _size.size_units_list.forEach((_unit) => {
                        if (_size.item_complex && _size.complex_items && _size.complex_items.length > 0) _unit.average_cost = total_complex_av;
                        _unit.average_cost = site.toNumber(_unit.average_cost);
                        if (_unit.barcode === undefined) {
                            notBarcodeUnit = true;
                        }
                        let notFoundBarcodeUnitList = sizesList.some((_FbUL) => _FbUL === _size.barcode);
                        if (!notFoundBarcodeUnitList) sizesList.push(_size.barcode);
                        if (_unit.discount && _unit.discount.value > _unit.discount.max) unitDiscount = true;

                        // let fonudExistBu = cbBarcodesList.some(_unit1 => _unit1.barcode === _unit.barcode);

                        cbBarcodesList.forEach((_unit1) => {
                            if (_unit1.barcode === _unit.barcode && _unit1.id != stores_items_doc.id) {
                                let foundExistBarcodeUnitList = existBarcodeUnitList.some((_ExBuL) => _ExBuL === _size.barcode);
                                if (!foundExistBarcodeUnitList) existBarcodeUnitList.push(_unit.barcode);
                                foundBarcodeUnit = true;
                            }
                        });

                        // if (fonudExistBu) {

                        //   let foundExistBarcodeUnitList = existBarcodeUnitList.some(_ExBuL => _ExBuL === _size.barcode);
                        //   if (!foundExistBarcodeUnitList) existBarcodeUnitList.push(_unit.barcode);
                        //   foundBarcodeUnit = true;
                        // }
                    });
                });

                if (unitDiscount) {
                    response.error = `DiscountUG (${sizesList})`;
                    res.json(response);
                    return;
                }

                if (settingCallback && settingCallback.inventory && settingCallback.inventory.auto_unit_barcode_generation != true) {
                    if (notBarcodeUnit) {
                        response.error = `EnterBU (${sizesList})`;
                        res.json(response);
                        return;
                    }

                    if (foundBarcodeUnit) {
                        response.error = `ExistBu (${existBarcodeUnitList})`;
                        res.json(response);
                        return;
                    }
                }

                let d = new Date().getDate().toString();
                let h = new Date().getHours().toString();
                let m = new Date().getMinutes().toString();
                let docIdString = doc.id.toString();
                stores_items_doc.sizes.forEach((_size, i) => {
                    _size.item_type = stores_items_doc.item_type;
                    if (!_size.barcode || _size.barcode == null) _size.barcode = stores_items_doc.company.id + docIdString + d + h + m + i;

                    _size.size_units_list.forEach((_size_unit, _i) => {
                        let indx = 0;
                        indx = stores_items_doc.units_list.findIndex((_unit1) => _unit1.id == _size_unit.id);
                        _size_unit.convert = stores_items_doc.units_list[indx] ? stores_items_doc.units_list[indx].convert : 1;

                        if (!_size_unit.average_cost) _size_unit.average_cost = _size_unit.cost;

                        if (!_size_unit.barcode || _size_unit.barcode == null) _size_unit.barcode = stores_items_doc.company.id + docIdString + (_size_unit.id || 0) + d + h + m + i + _i;
                    });
                });

                if (stores_items_doc._id) {
                    $stores_items.edit(
                        {
                            where: {
                                _id: stores_items_doc._id,
                            },
                            set: stores_items_doc,
                            $req: req,
                            $req: req,
                            $res: res,
                        },
                        (err, item_doc) => {
                            if (!err) {
                                response.done = true;
                                let obj = { sizes_list: [] };
                                let exist = false;
                                let foundNameAr = false;
                                let foundNameEn = false;

                                obj.company = item_doc.doc.company;

                                if (item_doc.doc.name_ar === item_doc.old_doc.name_ar) foundNameAr = true;
                                if (item_doc.doc.name_en === item_doc.old_doc.name_en) foundNameEn = true;

                                item_doc.doc.sizes.forEach((_size) => {
                                    let foundSize = false;
                                    let foundNameEn = false;
                                    item_doc.old_doc.sizes.map((old_size) => {
                                        if (_size.size_ar === old_size.size_ar) foundSize = true;
                                        if (_size.size_en === old_size.size_en) foundNameEn = true;
                                    });

                                    if (!foundSize || !foundNameEn || !foundNameAr || !foundNameEn) {
                                        obj.sizes_list.push({
                                            size_ar: _size.size_ar,
                                            barcode: _size.barcode,
                                            size_en: _size.size_en,
                                            name_ar: item_doc.doc.name_ar,
                                            name_en: item_doc.doc.name_en,
                                        });
                                        exist = true;
                                    }
                                });

                                if (exist) site.quee('[stores_items][item_name][change]', obj);
                            } else response.error = err.message;
                            res.json(response);
                        },
                    );
                } else res.json(response);
            });
        });
    });

    site.post('/api/stores_items/delete', (req, res) => {
        let response = {};
        response.done = false;

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        let id = req.body.id;

        let barcodes = req.body.category_item.sizes.map((_size) => _size.barcode);

        let data = {
            name: 'stores_item',
            barcodes,
            company_id: req.body.category_item.company.id,
        };

        site.getItemToDelete(data, (callback) => {
            if (callback == true) {
                response.error = 'Cant Delete Its Exist In Other Transaction';
                res.json(response);
                return;
            } else {
                if (id) {
                    $stores_items.delete(
                        {
                            id: id,
                            $req: req,
                            $res: res,
                        },
                        (err, result) => {
                            if (!err) {
                                response.done = true;
                            }
                            res.json(response);
                        },
                    );
                } else {
                    res.json(response);
                }
            }
        });
    });

    site.post('/api/stores_items/view', (req, res) => {
        let response = {};
        response.done = false;

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        $stores_items.findOne(
            {
                where: {
                    _id: site.mongodb.ObjectID(req.body._id),
                },
            },
            (err, doc) => {
                if (!err) {
                    response.done = true;
                    response.doc = doc;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.post('/api/stores_items/all', (req, res) => {
        let response = {};

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        let where = req.body.where || {};
        let store_id = where['store_id'];
        let unit_id = where['unit_id'];
        let barcode = where['barcode'];
        let limit = where.limit || undefined;
        let search = req.body.search;
        let sort = { id: -1 };

        site.getDefaultSetting(req, (callback) => {
            if (req.body.group) {
                if (req.body.group.type === 'all') {
                    if (callback.inventory && callback.inventory.number_best_selling) {
                        limit = callback.inventory.number_best_selling;
                    }
                    sort = { 'sizes.total_sell_count': -1 };
                } else {
                    where['item_group.id'] = req.body.group.id;
                }
            }
            if (search != undefined) {
                where.$or = [];
                where.$or.push({
                    'sizes.size_ar': site.get_RegExp(search, 'i'),
                });

                where.$or.push({
                    'sizes.size_en': site.get_RegExp(search, 'i'),
                });

                where.$or.push({
                    'sizes.barcode': search,
                });

                where.$or.push({
                    'sizes.active_substance.name_ar': search,
                });

                where.$or.push({
                    'sizes.active_substance.name_en': search,
                });

                where.$or.push({
                    'sizes.size_units_list.barcode': search,
                });

                where.$or.push({
                    name_ar: site.get_RegExp(search, 'i'),
                });

                where.$or.push({
                    name_en: site.get_RegExp(search, 'i'),
                });

                where.$or.push({
                    'item_group.name_ar': search,
                });

                where.$or.push({
                    'item_group.name_en': search,
                });
            }

            where['company.id'] = site.get_company(req).id;

            if (where['name_ar']) {
                where['name_ar'] = site.get_RegExp(where['name_ar'], 'i');
            }
            if (where['name_en']) {
                where['name_en'] = site.get_RegExp(where['name_en'], 'i');
            }

            if (where['size_ar']) {
                where['sizes.size_ar'] = site.get_RegExp(where['size_ar'], 'i');
                delete where['size_ar'];
            }

            if (where['size_en']) {
                where['sizes.size_en'] = site.get_RegExp(where['size_en'], 'i');
                delete where['size_en'];
            }

            if (where['barcode']) {
                where['$or'] = [{ 'sizes.barcode': where['barcode'] }, { 'sizes.size_units_list.barcode': where['barcode'] }];

                delete where['barcode'];
            }

            if (where['store_id']) {
                delete where['store_id'];
                delete where['unit_id'];
            }

            if (where['item_group']) {
                where['item_group.id'] = where['item_group'].id;
                delete where['item_group'];
            }

            if (where['limit']) {
                delete where['limit'];
            }

            if (where.work_patch) {
                where['sizes.work_patch'] = true;
                delete where['work_patch'];
            }

            if (where.work_serial) {
                where['sizes.work_serial'] = true;
                delete where['work_serial'];
            }

            if (where.item_complex) {
                where['sizes.item_complex'] = true;
                delete where['item_complex'];
            }
            response.done = false;
            $stores_items.findMany(
                {
                    select: req.body.select,
                    limit: limit || 100,
                    where: where,
                    sort: sort,
                },
                (err, docs, count) => {
                    if (!err) {
                        response.done = true;
                        let patch_list = [];
                        if (store_id && barcode && docs && docs.length === 1) {
                            if (docs[0].sizes && docs[0].sizes.length > 0)
                                docs[0].sizes.forEach((_size) => {
                                    if (_size.branches_list && _size.branches_list.length > 0 && _size.barcode === barcode)
                                        _size.branches_list.forEach((_branch) => {
                                            if (_branch.stores_list && _branch.stores_list.length > 0)
                                                _branch.stores_list.forEach((_store) => {
                                                    if (_store.store && _store.store.id === store_id)
                                                        _store.size_units_list.forEach((_unit) => {
                                                            if (_unit.id === unit_id) {
                                                                patch_list = _unit.patch_list;
                                                            }
                                                        });
                                                });
                                        });
                                });
                        }

                        response.list = docs;
                        response.patch_list = patch_list;
                        response.count = docs.length;
                    } else {
                        response.error = err.message;
                    }
                    res.json(response);
                },
            );
        });
    });

    site.post('/api/stores_items/handel_kitchen', (req, res) => {
        let response = {
            done: false,
        };
        let where = req.body.where || {};

        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
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

                    docs.forEach((_docs) => {
                        _docs.sizes.forEach((_size) => {
                            if (_size.branches_list && _size.branches_list.length > 0) {
                                _size.branches_list.forEach((_branch) => {
                                    _branch.kitchen = _size.kitchen;
                                });
                            }
                        });
                        $stores_items.update(_docs);
                    });
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.post('/api/stores_items/handel_company', (req, res) => {
        let response = {
            done: false,
        };

        let where = req.body.where || {};
        let company = site.get_company(req);
        let branch = site.get_branch(req);

        $stores_items.findMany(
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

                    docs.forEach((_docs) => {
                        _docs.company = company;
                        _docs.branch = branch;
                        _docs.sizes.forEach((_size) => {
                            _size.branches_list = [];
                        });
                        $stores_items.update(_docs);
                    });
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.stores_items_import_busy = false;
    site.post('/api/stores_items/import', (req, res) => {
        let response = {
            done: false,
            busy: site.stores_items_import_busy,
        };

        res.json(response);

        $itemsFile.findMany(
            {
                where: {
                    'company.id': site.get_company(req).id,
                    'branch.id': site.get_branch(req).id,
                },
                sort: req.body.sort || {
                    id: -1,
                },
            },
            (err, oldDocs) => {
                site.dbMessage = 'Load ItemsFile : ' + oldDocs.length;
                console.log(site.dbMessage);

                let unitsList = [];
                let itemsGroupList = [];

                $units.deleteMany({
                    where: {
                        'company.id': site.get_company(req).id,
                        'branch.id': site.get_branch(req).id,
                    },
                });
                $items_group.deleteMany({
                    where: {
                        'company.id': site.get_company(req).id,
                        'branch.id': site.get_branch(req).id,
                    },
                });
                $stores_items.deleteMany({
                    where: {
                        'company.id': site.get_company(req).id,
                        'branch.id': site.get_branch(req).id,
                    },
                });

                oldDocs.forEach((_oldDoc) => {
                    let unitExists = unitsList.some((u) => u.name_ar === _oldDoc.unit.trim());
                    if (!unitExists) {
                        unitsList.push({ name_en: _oldDoc.unit.trim(), name_ar: _oldDoc.unit.trim() });
                    }

                    let groupExists = itemsGroupList.some((g) => g.name_ar === _oldDoc.category_name_ar.trim());
                    if (!groupExists) {
                        itemsGroupList.push({ name_en: _oldDoc.category_name_en.trim(), name_ar: _oldDoc.category_name_ar.trim() });
                    }
                });

                unitsList.forEach((u, i) => {
                    $units.add(
                        {
                            name_en: u.name_en,
                            name_ar: u.name_ar,
                            company: site.get_company(req),
                            branch: site.get_branch(req),
                            code: i + 1,
                            image_url: '/images/unit.png',
                            active: true,
                        },
                        (err, doc) => {
                            if (!err && doc) {
                                unitsList[i] = doc;
                            }
                        },
                    );
                });

                itemsGroupList.forEach((g, i) => {
                    $items_group.add(
                        {
                            name_en: g.name_en,
                            name_ar: g.name_ar,
                            company: site.get_company(req),
                            branch: site.get_branch(req),
                            image_url: '/images/product_group.png',
                            active: true,
                            code: i + 1,
                        },
                        (err, doc) => {
                            itemsGroupList[i] = doc;
                        },
                    );
                });

                site.dbMessage = 'Add UnitList : ' + unitsList.length + ' \n Add ItemsGroupsList : ' + itemsGroupList.length;
                console.log(site.dbMessage);

                setTimeout(() => {
                    oldDocs.forEach((_oldDoc, i) => {
                        let itemGroup = itemsGroupList.find((g) => {
                            return g.name_ar === _oldDoc.category_name_ar.trim();
                        });
                        let itemUnit = unitsList.find((u) => {
                            return u.name_ar === _oldDoc.unit.trim();
                        });

                        $stores_items.add(
                            {
                                image_url: '/images/store_item.png',
                                allow_sell: true,
                                allow_buy: true,
                                is_pos: true,
                                with_discount: false,
                                item_type: {
                                    id: 1,
                                    name: 'store_item',
                                    en: 'Store Item',
                                    ar: 'صنف مخزني',
                                },
                                main_unit: itemUnit,
                                name_en: _oldDoc.name_en,
                                name_ar: _oldDoc.name_ar,
                                item_group: itemGroup,
                                units_list: [
                                    {
                                        id: itemUnit.id,
                                        name_ar: itemUnit.name_ar,
                                        name_en: itemUnit.name_en,
                                        convert: 1,
                                        start_count: 0,
                                        current_count: 0,
                                        cost: _oldDoc.cost,
                                        price: _oldDoc.price,
                                        average_cost: 0,
                                        discount: {
                                            value: 0,
                                            max: 0,
                                            type: 'number',
                                        },
                                        barcode: _oldDoc.barcode,
                                    },
                                ],
                                sizes: [
                                    {
                                        cost: 0,
                                        price: _oldDoc.price,
                                        discount: {
                                            value: 0,
                                            max: 0,
                                            type: 'number',
                                        },
                                        image_url: '/images/item_sizes.png',
                                        barcode: _oldDoc.barcode,
                                        size_ar: _oldDoc.name_ar,
                                        size_en: _oldDoc.name_en,
                                        start_count: 0,
                                        current_count: 0,
                                        total_sell_price: 0,
                                        total_sell_count: 0,
                                        total_buy_cost: 0,
                                        total_buy_count: 0,
                                        size_units_list: [
                                            {
                                                id: itemUnit.id,
                                                name_ar: itemUnit.name_ar,
                                                name_en: itemUnit.name_en,
                                                convert: 1,
                                                start_count: 0,
                                                cost: 0,
                                                price: _oldDoc.price,
                                                average_cost: 0,
                                                discount: {
                                                    value: 0,
                                                    max: 0,
                                                    type: 'number',
                                                },
                                                barcode: _oldDoc.barcode,
                                            },
                                        ],
                                        item_type: {
                                            id: 1,
                                            name: 'store_item',
                                            en: 'Store Item',
                                            ar: 'صنف مخزني',
                                        },
                                    },
                                ],
                                company: site.get_company(req),
                                branch: site.get_branch(req),
                                add_user_info: site.security.getUserFinger({
                                    $req: req,
                                    $res: res,
                                }),
                                code: _oldDoc.id,
                            },
                            (err, doc) => {
                                if (!err && doc) {
                                    site.dbMessage = 'Add Item :' + doc.id;
                                    console.log(site.dbMessage);
                                } else {
                                    site.dbMessage = err.message;
                                    console.log(site.dbMessage);
                                }
                            },
                        );
                    });
                }, 1000 * 5);
            },
        );
    });

    site.post('/api/stores_items/V_S_barcodes', (req, res) => {
        let response = {
            done: false,
        };
        let where = req.body.where || {};

        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
            {
                select: req.body.select || {},
                where: where,
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit,
            },
            (err, docs, count) => {
                if (!err) {
                    response.done = true;

                    let barcodes_list = [];
                    docs.forEach((_doc) => {
                        if (_doc.sizes && _doc.sizes.length > 0) {
                            _doc.sizes.forEach((_sizes) => {
                                barcodes_list.push(_sizes.barcode);
                            });
                        }
                    });

                    // let findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) != index)
                    // console.log(findDuplicates(barcodes_list));

                    response.count = count;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.post('/api/stores_items/reset_items', (req, res) => {
        let response = {
            done: false,
        };
        let where = req.body.where || {};

        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
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

                    docs.forEach((_docs) => {
                        if (_docs.sizes && _docs.sizes.length > 0)
                            _docs.sizes.forEach((_sizes) => {
                                _sizes.start_count = 0;
                                _sizes.current_count = 0;
                                _sizes.total_buy_cost = 0;
                                _sizes.total_buy_count = 0;
                                _sizes.total_sell_price = 0;
                                _sizes.total_sell_count = 0;
                                _sizes.branches_list = [];

                                if (_sizes.size_units_list && _sizes.size_units_list.length > 0)
                                    _sizes.size_units_list.forEach((_units_size) => {
                                        _units_size.current_count = 0;
                                        _units_size.start_count = 0;
                                        _units_size.total_buy_cost = 0;
                                        _units_size.total_buy_count = 0;
                                        _units_size.total_sell_price = 0;
                                        _units_size.total_sell_count = 0;
                                        _units_size.average_cost = _units_size.cost;
                                    });
                            });

                        if (!_docs.item_group || (_docs.item_group && !_docs.item_group.id)) {
                            $stores_items.delete({
                                id: _docs.id,
                            });
                        } else {
                            $stores_items.update(_docs);
                        }
                    });
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.post('/api/stores_items/handel_items', (req, res) => {
        let response = {
            done: false,
        };
        let where = req.body.where || {};

        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
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
                        let store = {};
                        let unit = {};

                        if (callback.inventory) {
                            if (callback.inventory.store) store = callback.inventory.store;
                            if (callback.inventory.unit) unit = callback.inventory.unit;
                        }

                        docs.forEach((_doc) => {
                            _doc.main_unit = unit;

                            _doc.units_list = [
                                {
                                    id: unit.id,
                                    name_ar: unit.name_ar,
                                    name_en: unit.name_en,
                                    convert: 1,
                                },
                            ];

                            let d = new Date().getDate().toString();
                            let h = new Date().getHours().toString();
                            let m = new Date().getMinutes().toString();

                            if (_doc.sizes && _doc.sizes.length > 0)
                                _doc.sizes.forEach((_sizes) => {
                                    let _barcode = _doc.id + _doc.company.id + d + h + m + i;
                                    let _barcodeUnit = _doc.id + _doc.company.id + _doc.branch.code + (unit.id || 0) + d + h + m + i;

                                    if (unit.id) {
                                        _sizes.size_units_list = [
                                            {
                                                id: unit.id,
                                                name_ar: unit.name_ar,
                                                name_en: unit.name_en,
                                                barcode: _barcode,
                                                current_count: _sizes.current_count,
                                                start_count: _sizes.start_count,
                                                price: _sizes.price,
                                                cost: _sizes.cost,
                                                discount: _sizes.discount,
                                                total_buy_cost: _sizes.total_buy_cost,
                                                total_buy_count: _sizes.total_buy_count,
                                                total_sell_price: _sizes.total_sell_price,
                                                total_sell_count: _sizes.total_sell_count,
                                                average_cost: _sizes.average_cost,
                                                convert: 1,
                                            },
                                        ];

                                        if (_sizes.branches_list && _sizes.branches_list.length > 0) {
                                            _sizes.branches_list.forEach((_branch) => {
                                                _branch.size_units_list = [
                                                    {
                                                        id: unit.id,
                                                        name_ar: unit.name_ar,
                                                        name_en: unit.name_en,
                                                        barcode: _barcodeUnit,
                                                        current_count: _branch.current_count,
                                                        start_count: _branch.start_count,
                                                        total_buy_cost: _branch.total_buy_cost,
                                                        total_buy_count: _branch.total_buy_count,
                                                        total_sell_price: _branch.total_sell_price,
                                                        total_sell_count: _branch.total_sell_count,
                                                        average_cost: _branch.average_cost,
                                                    },
                                                ];

                                                if (_branch.stores_list && _branch.stores_list.length > 0)
                                                    _branch.stores_list.forEach((_store) => {
                                                        _store.size_units_list = [
                                                            {
                                                                id: unit.id,
                                                                name_ar: unit.name_ar,
                                                                name_en: unit.name_en,
                                                                barcode: _barcodeUnit,
                                                                current_count: _store.current_count,
                                                                start_count: _store.start_count,
                                                                total_buy_cost: _store.total_buy_cost,
                                                                total_buy_count: _store.total_buy_count,
                                                                total_sell_price: _store.total_sell_price,
                                                                total_sell_count: _store.total_sell_count,
                                                                average_cost: _store.average_cost,
                                                            },
                                                        ];
                                                    });
                                            });
                                        }
                                    }

                                    // if (_sizes.discount == (null || undefined))
                                    //   _sizes.discount = { max: 0, value: 0, type: 'number' }

                                    // if (_sizes.branches_list == (null || undefined) && _sizes.current_count != 0) {

                                    //   let totalCost = site.toNumber(_sizes.cost) * site.toNumber(_sizes.current_count);

                                    //   let obj_branch = {
                                    //     name_ar: _docs.branch.name_ar,
                                    //     code: _docs.branch.code,
                                    //     start_count: 0,
                                    //     current_count: site.toNumber(_sizes.current_count),
                                    //     total_buy_cost: totalCost,
                                    //     total_buy_count: site.toNumber(_sizes.current_count),
                                    //     average_cost: site.toNumber(totalCost) / site.toNumber(_sizes.current_count),
                                    //     stores_list: [{
                                    //       store: store,
                                    //       start_count: 0,
                                    //       current_count: site.toNumber(_sizes.current_count),
                                    //       cost: site.toNumber(_sizes.cost),
                                    //       price: site.toNumber(_sizes.price),
                                    //       total_buy_cost: totalCost,
                                    //       total_buy_count: site.toNumber(_sizes.current_count),
                                    //       average_cost: site.toNumber(totalCost) / site.toNumber(_sizes.current_count)
                                    //     }]
                                    //   }
                                    //   _sizes.branches_list = [obj_branch]
                                    // }
                                });
                            $stores_items.update(_doc);
                        });
                    });
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.getKitchenToDelete = function (data, callback) {
        let where = {};

        if (data.name == 'kitchen') where['sizes.kitchen.id'] = data.id;

        $stores_items.findOne(
            {
                where: where,
            },
            (err, docs, count) => {
                if (!err) {
                    if (docs) callback(true);
                    else callback(false);
                }
            },
        );
    };

    site.getUnitToDelete = function (id, callback) {
        let where = {};

        where['units_list.id'] = id;

        $stores_items.findOne(
            {
                where: where,
            },
            (err, docs, count) => {
                if (!err) {
                    if (docs) callback(true);
                    else callback(false);
                }
            },
        );
    };

    site.post('/api/stores_items/sizes_all', (req, res) => {
        let response = {
            done: false,
        };

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        let where = req.body.where || {};
        let search = req.body.search;

        if (search) {
            where.$or = [];

            where.$or.push({
                'sizes.size_ar': site.get_RegExp(search, 'i'),
            });

            where.$or.push({
                'sizes.size_en': site.get_RegExp(search, 'i'),
            });

            where.$or.push({
                'sizes.barcode': search,
            });

            where.$or.push({
                'sizes.active_substance.name_ar': search,
            });

            where.$or.push({
                'sizes.active_substance.name_en': search,
            });

            where.$or.push({
                'sizes.size_units_list.barcode': search,
            });

            where.$or.push({
                name_ar: site.get_RegExp(search, 'i'),
            });

            where.$or.push({
                name_en: site.get_RegExp(search, 'i'),
            });

            where.$or.push({
                'item_group.name_ar': search,
            });

            where.$or.push({
                'item_group.name_en': search,
            });
        }

        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
            {
                select: req.body.select || {},
                where: where,
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit,
            },
            (err, docs, count) => {
                if (!err) {
                    let arr_sizes = [];

                    response.done = true;

                    if (docs && docs.length > 0) {
                        docs.forEach((_item) => {
                            if (_item.sizes && _item.sizes.length > 0) {
                                _item.sizes.forEach((_size) => {
                                    _size.unit = _size.size_units_list.find((_unit) => {
                                        return _unit.id === _item.main_unit.id;
                                    });
                                    _size.information_instructions = _item.information_instructions;
                                    _size.name_ar = _item.name_ar;
                                    _size.name_en = _item.name_en;
                                    _size.itm_id = _item.id;
                                    _size.stores_item_name_ar = _item.name_ar;
                                    _size.stores_item_name_en = _item.name_en;
                                    if (req.body.barcode != _size.barcode) arr_sizes.unshift(_size);
                                });
                            }
                        });
                    }
                    response.count = count;
                    response.list = arr_sizes;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.get('/api/stores_items/size_type', (req, res) => {
        let response = {
            done: false,
        };

        if (!req.session.user) {
            response.error = 'Please Login First';
            res.json(response);
            return;
        }

        let where = req.body.where || {};

        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
            {
                select: req.body.select || {},
                where: where,
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit,
            },
            (err, docs, count) => {
                if (!err) {
                    response.done = true;
                    let list_err = [];
                    if (docs && docs.length > 0) {
                        docs.forEach((item) => {
                            if (item.sizes && item.sizes.length > 0)
                                item.sizes.forEach((_size) => {
                                    if (typeof _size.size_ar != 'string') {
                                        list_err.push({ barcode: _size.barcode });
                                    }
                                });
                        });
                    }
                    response.list = list_err;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.post('/api/stores_items/barcode_unit', (req, res) => {
        let response = {
            done: false,
        };
        let where = req.body.where || {};

        where['company.id'] = site.get_company(req).id;

        if (where.serial) {
            where['$or'] = [{ 'sizes.work_patch': true }, { 'sizes.work_serial': true }];

            where['company.id'] = site.get_company(req).id;
            where['sizes.barcode'] = {
                $in: where.barcodes,
            };

            delete where.serial;
            delete where.barcodes;
        }

        $stores_items.findMany(
            {
                select: req.body.select || {},
                where: where,
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit,
            },
            (err, docs, count) => {
                if (!err) {
                    response.done = true;
                    let barcodeArr = [];
                    let serialArr = [];
                    if (docs && docs.length > 0) {
                        docs.forEach((item) => {
                            if (item.sizes && item.sizes.length > 0)
                                item.sizes.forEach((_size) => {
                                    if (_size.size_units_list && _size.size_units_list.length > 0)
                                        _size.size_units_list.forEach((_unit) => {
                                            if (_unit.barcode) barcodeArr.push(_unit.barcode);
                                        });

                                    if (_size.branches_list && _size.branches_list.length > 0) {
                                        _size.branches_list.forEach((_branch) => {
                                            if (_branch.stores_list && _branch.stores_list.length > 0) {
                                                _branch.stores_list.forEach((_store) => {
                                                    if (_store.size_units_list && _store.size_units_list.length > 0) {
                                                        _store.size_units_list.forEach((_sizeUnit) => {
                                                            if (_sizeUnit.patch_list && _sizeUnit.patch_list.length > 0) {
                                                                _sizeUnit.patch_list.forEach((_p) => {
                                                                    serialArr.push(_p.patch);
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                        });
                    }

                    response.count = count;
                    response.list = barcodeArr;
                    response.serial_list = serialArr;
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.getBarcodesList = function (req, callback) {
        let where = {};
        where['company.id'] = site.get_company(req).id;

        if (where.serial) {
            where['$or'] = [{ 'sizes.work_patch': true }, { 'sizes.work_serial': true }];

            where['company.id'] = site.get_company(req).id;
            where['sizes.barcode'] = {
                $in: where.barcodes,
            };

            delete where.serial;
            delete where.barcodes;
        }

        $stores_items.findMany(
            {
                select: req.body.select || {},
                where: where,
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit,
            },
            (err, docs) => {
                if (!err) {
                    let barcodeArr = [];
                    let serialArr = [];
                    if (docs && docs.length > 0) {
                        docs.forEach((item) => {
                            if (item.sizes && item.sizes.length > 0)
                                item.sizes.forEach((_size) => {
                                    barcodeArr.push({ barcode: _size.barcode, id: item.id });
                                    if (_size.size_units_list && _size.size_units_list.length > 0)
                                        _size.size_units_list.forEach((_unit) => {
                                            if (_unit.barcode)
                                                barcodeArr.push({
                                                    barcode: _unit.barcode,
                                                    id: item.id,
                                                });
                                        });

                                    if (_size.branches_list && _size.branches_list.length > 0) {
                                        _size.branches_list.forEach((_branch) => {
                                            if (_branch.stores_list && _branch.stores_list.length > 0) {
                                                _branch.stores_list.forEach((_store) => {
                                                    if (_store.size_units_list && _store.size_units_list.length > 0) {
                                                        _store.size_units_list.forEach((_sizeUnit) => {
                                                            if (_sizeUnit.patch_list && _sizeUnit.patch_list.length > 0) {
                                                                _sizeUnit.patch_list.forEach((_p) => {
                                                                    serialArr.push(_p.patch);
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                        });
                    }

                    callback(barcodeArr);
                } else {
                    callback(null);
                }
            },
        );
    };

    site.getItemsSizes = function (req, callback) {
        let where = {};
        let barcodes = [];

        if (req.body.items && req.body.items.length > 0) {
            barcodes = req.body.items.map((_item) => _item.barcode);
            where['sizes.barcode'] = {
                $in: barcodes,
            };
        }
        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
            {
                select: req.body.select || {},
                where: where,
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit,
            },
            (err, docs) => {
                if (!err) {
                    let arr_sizes = [];
                    if (docs && docs.length > 0) {
                        docs.forEach((item) => {
                            if (item.sizes && item.sizes.length > 0)
                                item.sizes.forEach((_size) => {
                                    _size.itm_id = item.id;
                                    _size.stores_item_name_ar = item.name_ar;
                                    _size.stores_item_name_en = item.name_en;
                                    arr_sizes.unshift(_size);
                                });
                        });
                    }
                    callback(arr_sizes);
                } else {
                    callback(null);
                }
            },
        );
    };

    site.getItemsAverageCost = function (companyId, complexItems, callback) {
        let barcodes = complexItems.map((_complex) => _complex.barcode);

        $stores_items.findMany(
            {
                select: req.body.select || {},
                where: {
                    'company.id': companyId,
                    'sizes.barcode': barcodes,
                },
                sort: req.body.sort || {
                    id: -1,
                },
                limit: req.body.limit,
            },
            (err, docs) => {
                if (!err) {
                    if (docs && docs.length > 0) {
                        let total_average = 0;
                        docs.forEach((_item) => {
                            if (complexItems && complexItems.length > 0)
                                complexItems.forEach((_complex) => {
                                    if (_item.sizes && _item.sizes.length > 0)
                                        _item.sizes.forEach((_size) => {
                                            if (_size.barcode === _complex.barcode) {
                                                _size.size_units_list.forEach((_unit) => {
                                                    if (_unit.id == _complex.unit.id) total_average += _unit.average_cost;
                                                });
                                            }
                                        });
                                });
                        });

                        callback(total_average);
                    }
                }
            },
        );
    };

    site.post('/api/stores_items/handel_zeft', (req, res) => {
        let response = {
            done: false,
        };
        let where = req.body.where || {};

        where['company.id'] = site.get_company(req).id;

        $stores_items.findMany(
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
                        let unit = {};

                        if (callback.inventory) {
                            if (callback.inventory.unit) unit = callback.inventory.unit;
                        }

                        docs.forEach((_doc) => {
                            _doc.main_unit = unit;

                            _doc.units_list = [
                                {
                                    id: unit.id,
                                    name_ar: unit.name_ar,
                                    name_en: unit.name_en,
                                    convert: 1,
                                },
                            ];

                            if (_doc.sizes && _doc.sizes.length > 0) {
                                _doc.sizes.forEach((_sizes) => {
                                    if (unit.id) {
                                        let y = new Date().getFullYear().toString();
                                        let docIdString = doc.id.toString();

                                        let _barcode = docIdString + _doc.company.id + y + Math.floor(Math.random() * 100);
                                        let _barcodeUnit = docIdString + _doc.company.id + unit.id + Math.floor(Math.random() * 100) + y;

                                        _sizes.barcode = _barcode;
                                        _sizes.current_count = 0;
                                        _sizes.start_count = 0;
                                        _sizes.item_complex = false;
                                        delete _sizes.complex_items;
                                        delete _sizes.value_add;
                                        _sizes.size_units_list[0].cost = site.toNumber(_sizes.size_units_list[0].cost);
                                        _sizes.size_units_list = [
                                            {
                                                id: unit.id,
                                                name_ar: unit.name_ar,
                                                name_en: unit.name_en,
                                                barcode: _barcodeUnit,
                                                current_count: 0,
                                                start_count: 0,
                                                cost: _sizes.size_units_list[0].cost,
                                                price: _sizes.size_units_list[0].price,
                                                average_cost: _sizes.size_units_list[0].cost,
                                                discount: {
                                                    value: 0,
                                                    max: 0,
                                                    type: 'number',
                                                },
                                                total_buy_cost: 0,
                                                total_buy_count: 0,
                                                total_sell_price: 0,
                                                total_sell_count: 0,
                                                average_cost: 0,
                                                convert: 1,
                                            },
                                        ];

                                        _sizes.branches_list = [];
                                    }
                                });
                            }
                            $stores_items.update(_doc);
                        });
                    });
                } else {
                    response.error = err.message;
                }
                res.json(response);
            },
        );
    });

    site.isAllowOverDraft = function (req, itemsCb, callback) {
        let where = {};
        let store = req.body.store;
        let barcodes = itemsCb.map((_item) => _item.barcode);

        let objFound = { current: [], cb: [], notFound: [] };

        let cbObj = {
            value: false,
            notFoundUnit: false,
        };

        where['company.id'] = site.get_company(req).id;

        where['sizes.barcode'] = {
            $in: barcodes,
        };

        site.getDefaultSetting(req, (cbSetting) => {
            if (cbSetting.inventory && cbSetting.inventory.overdraft == true) {
                cbObj.overdraft = true;
            } else {
                cbObj.overdraft = false;
            }

            $stores_items.findMany(
                {
                    select: req.body.select || {},
                    where: where,
                    sort: req.body.sort || {
                        id: -1,
                    },
                },
                (err, docs) => {
                    if (!err) {
                        if (docs && docs.length > 0) {
                            docs.forEach((_item) => {
                                if (_item.sizes && _item.sizes.length > 0) {
                                    _item.sizes.forEach((currentSize) => {
                                        itemsCb.forEach((cbSize) => {
                                            if (currentSize.barcode === cbSize.barcode && currentSize.size_ar === cbSize.size_ar) {
                                                let foundUnit = false;
                                                let foundStores = false;
                                                let foundBranch = false;

                                                if (currentSize.branches_list && currentSize.branches_list.length > 0) {
                                                    currentSize.branches_list.forEach((branchesList) => {
                                                        if (branchesList.stores_list && branchesList.stores_list.length > 0) {
                                                            if (branchesList.code === req.body.branch.code) {
                                                                foundBranch = true;
                                                                branchesList.stores_list.forEach((storesList) => {
                                                                    if (storesList.size_units_list && storesList.size_units_list.length > 0) {
                                                                        if (storesList.store && store.id === storesList.store.id) {
                                                                            foundStores = true;

                                                                            storesList.size_units_list.forEach((sizeUnits) => {
                                                                                if (cbSize.unit && sizeUnits.id === cbSize.unit.id) {
                                                                                    foundUnit = true;
                                                                                    objFound.current.push({
                                                                                        unit: cbSize.unit,
                                                                                        store: storesList.store,
                                                                                        barcode: currentSize.barcode,
                                                                                    });
                                                                                    objFound.cb.push({ cbSize });
                                                                                    let over = 0;
                                                                                    over = site.toNumber(sizeUnits.current_count) - site.toNumber(cbSize.count);
                                                                                    if (site.toNumber(over) < 0) {
                                                                                        cbObj.value = true;
                                                                                    }
                                                                                }
                                                                            });
                                                                        }
                                                                    } else {
                                                                        objFound.notFound.push({
                                                                            id: _item.id,
                                                                            barcode: currentSize.barcode,
                                                                            action: 'notUnit',
                                                                        });
                                                                        cbObj.value = true;
                                                                    }
                                                                });
                                                            }
                                                        } else {
                                                            objFound.notFound.push({
                                                                id: _item.id,
                                                                barcode: currentSize.barcode,
                                                                action: 'notStore',
                                                            });

                                                            cbObj.value = true;
                                                        }
                                                    });
                                                } else {
                                                    objFound.notFound.push({
                                                        id: _item.id,
                                                        barcode: currentSize.barcode,
                                                        action: 'notBranch',
                                                    });
                                                    cbObj.value = true;
                                                }

                                                if (!foundStores) {
                                                    objFound.notFound.push({
                                                        id: _item.id,
                                                        barcode: currentSize.barcode,
                                                        action: 'notFoundStore',
                                                    });
                                                    cbObj.value = true;
                                                } else if (!foundUnit) {
                                                    objFound.notFound.push({
                                                        id: _item.id,
                                                        barcode: currentSize.barcode,
                                                        action: 'notFoundunit',
                                                    });
                                                    cbObj.value = true;
                                                    cbObj.notFoundUnit = true;
                                                } else if (!foundBranch) {
                                                    objFound.notFound.push({
                                                        id: _item.id,
                                                        barcode: currentSize.barcode,
                                                        action: 'notFoundBranch',
                                                    });
                                                    cbObj.value = true;
                                                }
                                            }
                                        });
                                    });
                                }
                            });
                        }
                    } else {
                        console.log(err);
                    }
                    cbObj.overObj = objFound;
                    callback(cbObj);
                },
            );
        });
    };
};
