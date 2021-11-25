app.controller('db', function ($scope, $http) {
    $scope.collection_list = [
        {
            name: 'item2',
            ar: 'ملف الاصناف',
            en: 'Items File',
        },
        {
            name: 'users_info',
            ar: 'المستخدمين',
            en: 'Users',
        },
        {
            name: 'companies',
            ar: 'الشركات',
            en: 'Companies',
        },
        {
            name: 'stores_items',
            ar: 'الأصناف المخزنية',
            en: 'Store Items',
        },
        {
            name: 'stores_in',
            en: 'Stores In / Purchase Invoice',
            ar: 'إذن وارد / فاتورة شراء',
        },
        {
            name: 'stores_out',
            en: 'Stores Out / Sales Invoice',
            ar: 'إذن صرف / فاتورة بيع',
        },
        {
            name: 'transfer_branch',
            en: 'Stores Transfer',
            ar: 'التحويلات المخزنية',
        },

        {
            name: 'stores_assemble',
            en: 'Items Assemble',
            ar: 'تجميع الأصناف',
        },
        {
            name: 'stores_dismantle',
            en: 'Items Dismantle',
            ar: 'تفكيك الأصناف',
        },
        {
            name: 'items_group',
            en: 'Items Groups',
            ar: 'مجموعات الأصناف',
        },
        {
            name: 'stores',
            en: 'Stores',
            ar: 'المخازن',
        },
        {
            name: 'units',
            en: 'Units',
            ar: 'الوحدات',
        },
        {
            name: 'currency',
            en: 'Currency',
            ar: 'العملات',
        },
        {
            name: 'safes',
            en: 'Safes',
            ar: 'الخزن',
        },
        {
            name: 'account_invoices',
            en: 'Account Invoices',
            ar: 'فواتير الحسابات',
        },
        {
            name: 'amounts_in',
            en: 'Amounts In Invoices',
            ar: 'فواتير الوارد',
        },
        {
            name: 'amounts_out',
            en: 'Amounts Out Invoices',
            ar: 'فواتير المنصرف',
        },
        {
            name: 'customers',
            en: 'Customers',
            ar: 'العملاء',
        },
        {
            name: 'vendors',
            en: 'Vendors',
            ar: 'الموردين',
        },
        {
            name: 'employee_list',
            en: 'Employees',
            ar: 'الموظفين',
        },
        {
            name: 'delegate_list',
            en: 'Delegates',
            ar: 'المناديب',
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

        $http
            .post('/api/db/import', fd, {
                withCredentials: true,
                headers: {
                    'Content-Type': undefined,
                    collection_name: collection.name,
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
                        $scope.uploadStatus = 'Data Imported to : ' + res.data.collection_name;
                    }
                },
                function (error) {
                    $scope.uploadStatus = error;
                },
            );
    };

    $scope.drop = function (collection) {
        $http({
            url: '/api/db/drop',
            method: 'post',
            data: {
                collection_name: collection.name,
            },
        }).then(
            function (res) {
                if (res.data.done) {
                    collection.dropMessage = res.data.err || res.data.result;
                }
            },
            function (error) {
                collection.dropMessage = error;
            },
        );
    };

    $scope.export = function (collection) {
        document.location.href = '/api/db/export?name=' + collection.name;
    };
});
