app.controller("db", function ($scope, $http) {

    $scope.collection_list = [{
        name: 'stores_items',
        ar: 'Store Items',
        en: 'Store Items'
    }];

    $scope.do_click = function (collection) {
        let input = document.querySelector('#input_' + collection.name);
        if (!input.getAttribute('x-handle')) {
            input.setAttribute('x-handle', 'yes')
            input.addEventListener('change', () => {
                $scope.import(input.files, collection)
            });
        }
        input.click();
    };

    $scope.import = function (files, collection) {
        var fd = new FormData();
        fd.append("collectionFile", files[0]);

        $http.post('/api/db/import', fd, {
            withCredentials: true,
            headers: {
                'Content-Type': undefined,
                'collection_name': collection.name
            },
            uploadEventHandlers: {
                progress: function (e) {
                    $scope.uploadStatus = "Uploading : " + Math.round((e.loaded * 100 / e.total)) + " %";
                    if (e.loaded == e.total) {
                        $scope.uploadStatus = "100%";
                    }
                }
            },
            transformRequest: angular.identity
        }).then(function (res) {
            if (res.data && res.data.done) {
                $scope.uploadStatus = "Data Imported to : " + res.data.collection_name
            }
        }, function (error) {
            $scope.uploadStatus = error;
        });
    };


    $scope.export = function (collection) {
        document.location.href = "/api/db/export?name=" + collection.name
    };



});