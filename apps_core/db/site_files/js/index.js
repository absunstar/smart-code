app.controller('db', function ($scope, $http, $interval) {
    $scope.collection_list = [
        {
            name: 'itemsFile',
            Ar: 'ملف الاصناف',
            En: 'Items File',
        },
        {
            name: 'users_info',
            Ar: 'المستخدمين',
            En: 'Users',
        },
        {
            name: 'companies',
            Ar: 'الشركات',
            En: 'Companies',
        },
        {
            name: 'stores_items',
            Ar: 'الأصناف المخزنية',
            En: 'Store Items',
        },
        {
            name: 'stores_in',
            En: 'Stores In / Purchase Invoice',
            Ar: 'إذن وارد / فاتورة شراء',
        },
        {
            name: 'stores_out',
            En: 'Stores Out / Sales Invoice',
            Ar: 'إذن صرف / فاتورة بيع',
        },
        {
            name: 'transfer_branch',
            En: 'Stores Transfer',
            Ar: 'التحويلات المخزنية',
        },

        {
            name: 'stores_assemble',
            En: 'Items Assemble',
            Ar: 'تجميع الأصناف',
        },
        {
            name: 'stores_dismantle',
            En: 'Items Dismantle',
            Ar: 'تفكيك الأصناف',
        },
        {
            name: 'items_group',
            En: 'Items Groups',
            Ar: 'مجموعات الأصناف',
        },
        {
            name: 'stores',
            En: 'Stores',
            Ar: 'المخازن',
        },
        {
            name: 'units',
            En: 'Units',
            Ar: 'الوحدات',
        },
        {
            name: 'currency',
            En: 'Currency',
            Ar: 'العملات',
        },
        {
            name: 'safes',
            En: 'Safes',
            Ar: 'الخزن',
        },
        {
            name: 'account_invoices',
            En: 'Account Invoices',
            Ar: 'فواتير الحسابات',
        },
        {
            name: 'amounts_in',
            En: 'Amounts In Invoices',
            Ar: 'فواتير الوارد',
        },
        {
            name: 'amounts_out',
            En: 'Amounts Out Invoices',
            Ar: 'فواتير المنصرف',
        },
        {
            name: 'customers',
            En: 'Customers',
            Ar: 'العملاء',
        },
        {
            name: 'vendors',
            En: 'Vendors',
            Ar: 'الموردين',
        },
        {
            name: 'employee_list',
            En: 'Employees',
            Ar: 'الموظفين',
        },
        {
            name: 'delegate_list',
            En: 'Delegates',
            Ar: 'المناديب',
        },
    ];

    $scope.do_click = function (collection) {
        let input = document.querySelector('#input_' + collection.name);
        if (!input.getAttribute('x-handle')) {
            input.setAttribute('x-handle', 'yes');
            input.addEventListener('change', () => {
                $scope.import(input.files, collection);
            });
        }
        input.click();
    };

    $scope.import = function (files, collection) {
        var fd = new FormData();
        fd.append('collectionFile', files[0]);
        fd.append('collectionName', collection.name);

        $http
            .post('/api/db/import', fd, {
                withCredentials: true,
                headers: {
                    'Content-Type': undefined,
                },
                uploadEventHandlers: {
                    progress: function (e) {
                        collection.uploadStatus = 'Uploading : ' + Math.round((e.loaded * 100) / e.total) + ' %';
                        if (e.loaded == e.total) {
                            collection.uploadStatus = '100%';
                        }
                    },
                },
                transformRequest: angular.identity,
            })
            .then(
                function (res) {
                    if (res.data && res.data.done) {
                        $scope.uploadStatus = 'Data Imported to : ' + res.data.collectionName;
                    }
                },
                function (error) {
                    $scope.uploadStatus = error;
                },
            );
    };

    $scope.Delete = function (collection) {
        $http({
            url: '/api/db/deleteAll',
            method: 'post',
            data: {
                collectionName: collection.name,
            },
        }).then(
            function (res) {
                if (res.data.done) {
                    collection.DeleteAllMessage = res.data.err || res.data.result;
                }
            },
            function (error) {
                collection.DeleteAllMessage = error;
            },
        );
    };
    $scope.DeleteAll = function (collection) {
        $http({
            url: '/api/db/deleteAll',
            method: 'post',
            data: {
                collectionName: collection.name,
                where: {},
            },
        }).then(
            function (res) {
                if (res.data.done) {
                    collection.DeleteAllMessage = res.data.err || res.data.result;
                }
            },
            function (error) {
                collection.DeleteAllMessage = error;
            },
        );
    };
    $scope.getDbMesage = function () {
        $http({
            url: '/api/db/message',
            method: 'get',
        }).then(
            function (res) {
                if (res.data.done) {
                    $scope.dbMessage = res.data.message;
                }
            },
            function (error) {
                $scope.dbMessage = error;
            },
        );
    };
    $scope.export = function (collection, fileType) {
        $http({
            url: '/api/db/export',
            method: 'post',
            data: {
                collectionName: collection.name,
                fileType: fileType,
            },
        }).then((res) => {
            if (res.data.done && res.data.fileType) {
                if (res.data.fileType == 'json') {
                    document.location.href = '/api/db/download?file_path=' + res.data.file_json_path;
                } else {
                    document.location.href = '/api/db/download?file_path=' + res.data.file_xlsx_path;
                }
            }
        });
    };
    $scope.exportAll = function (collection, fileType) {
        $http({
            url: '/api/db/export',
            method: 'post',
            data: {
                collectionName: collection.name,
                fileType: fileType,
                where: {},
            },
        }).then((res) => {
            if (res.data.done && res.data.fileType) {
                if (res.data.fileType == 'json') {
                    document.location.href = '/api/db/download?file_path=' + res.data.file_json_path;
                } else {
                    document.location.href = '/api/db/download?file_path=' + res.data.file_xlsx_path;
                }
            }
        });
    };
    $interval(() => {
        $scope.getDbMesage();
    }, 1000 * 5);
});
