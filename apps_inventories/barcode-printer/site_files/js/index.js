app.controller('barcode_printer', function ($scope, $http, $timeout) {
    $scope._search = {};
    $scope.startBarcodePrinter = function () {
        $scope.printingLanguageList = [
            {
                id: 1,
                ar: 'عربي',
                en: 'Arabic',
            },
            {
                id: 2,
                ar: 'إنجليزي',
                en: 'English',
            },
        ];
        $scope.barcode_printer = {
            image_url: '/images/barcode_printer.png',
            count_prints: 1,
            price: 0,
        };

        if ('##session.lang##' == 'ar') {
            $scope.barcode_printer.company_name = '##session.company.name_ar##';
            $scope.barcode_printer.print_lang = $scope.printingLanguageList[0];
        } else if ('##session.lang##' == 'en') {
            $scope.barcode_printer.company_name = '##session.company.name_en##';
            $scope.barcode_printer.print_lang = $scope.printingLanguageList[1];
        }
    };

    $scope.getItemsName = function (ev) {
        $scope.error = '';
        if (ev.which === 13) {
            $http({
                method: 'POST',
                url: '/api/stores_items/all',
                data: {
                    search: $scope.item.search_item_name,
                },
            }).then(
                function (response) {
                    $scope.busy = false;
                    if (response.data.done) {
                        if (response.data.list.length > 0) {
                            let foundSize = false;
                            response.data.list.forEach((_item) => {
                                if (_item.sizes && _item.sizes.length > 0)
                                    _item.sizes.forEach((_size) => {
                                        if (_size.barcode === $scope.item.search_item_name) {
                                            $scope.item.size = { ..._size };
                                            if ($scope.barcode_printer.print_lang.id) {
                                                if ($scope.barcode_printer.print_lang.id == 1) {
                                                    $scope.barcode_printer.company_name = '##session.company.name_ar##';

                                                    if ($scope.item.size.add_sizes) {
                                                        $scope.barcode_printer.item_name = _item.name_ar + '-' + $scope.item.size.size_ar;
                                                    } else {
                                                        $scope.barcode_printer.item_name = $scope.item.size.size_ar;
                                                    }
                                                } else if ($scope.barcode_printer.print_lang.id == 2) {
                                                    $scope.barcode_printer.company_name = '##session.company.name_en##';
                                                    if ($scope.item.size.add_sizes) {
                                                        $scope.barcode_printer.item_name = _item.name_en + '-' + $scope.item.size.size_en;
                                                    } else {
                                                        $scope.barcode_printer.item_name = $scope.item.size.size_en;
                                                    }
                                                }
                                            }

                                            $scope.barcode_printer.barcode = _size.barcode;
                                            $scope.barcode_printer.price = _size.price;
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
                },
            );
        }
    };

    $scope.print = function () {
        $scope.error = '';
        if ($scope.busy) return;
        $scope.busy = true;
        $scope.print = { ...$scope.barcode_printer };
        $timeout(() => {
            $('#barcodePrint').removeClass('hidden');

            JsBarcode('.barcode', $scope.print.barcode, {
                format: 'CODE128',
                displayValue: true,
                textMargin: 0,
                height: 50,
                fontSize: 25,
                fontOptions: 'bold',
            });

            if ($scope.defaultSettings.printer_program && $scope.defaultSettings.printer_program.barcode_printer && $scope.defaultSettings.printer_program.barcode_printer.ip) {
                let printerName = $scope.defaultSettings.printer_program.barcode_printer.ip.name.trim();
                $timeout(() => {
                    site.print(
                        {
                            content: document.querySelector('#barcodePage').innerHTML,
                            selector: '#barcodePrint',
                            ip: '127.0.0.1',
                            port: '60080',
                            printer: printerName,
                        },
                        () => {
                            /*    if (i === $scope.barcode_printer.count_prints) {
                  $timeout(() => {
                    $('#barcodePrint').addClass('hidden');
                  }, 2000);
                } */
                        },
                    );
                }, 1000 * 3);
            } else {
                $scope.error = '##word.barcode_printer_must_select##';
            }
        }, 1000);

        $scope.busy = false;
    };

    $scope.changePrinterLang = function () {
        if ($scope.barcode_printer.print_lang.id) {
            if ($scope.barcode_printer.print_lang.id == 1) {
                $scope.barcode_printer.company_name = '##session.company.name_ar##';

                if ($scope.item.size.add_sizes) {
                    $scope.barcode_printer.item_name = _item.name_ar + '-' + $scope.item.size.size_ar;
                } else {
                    $scope.barcode_printer.item_name = $scope.item.size.size_ar;
                }
            } else if ($scope.barcode_printer.print_lang.id == 2) {
                $scope.barcode_printer.company_name = '##session.company.name_en##';
                if ($scope.item.size.add_sizes) {
                    $scope.barcode_printer.item_name = _item.name_en + '-' + $scope.item.size.size_en;
                } else {
                    $scope.barcode_printer.item_name = $scope.item.size.size_en;
                }
            }
        }
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
            },
        );
    };

    $scope.getDefaultSettings();
    $scope.startBarcodePrinter();
});
