app.controller('changeBranch', function ($scope, $http) {

    $scope.busy = false;
    $scope.user = {};


    $scope.login = function (b) {
        $scope.error = '';
        $scope.user.branch = b.branch;

        $scope.busy = true;

        $http({
            method: 'POST',
            url: '/api/user/change-branch',
            data: {
                $encript : '123',
                branch: site.to123({
                    code: $scope.user.branch.code,
                    name_ar: $scope.user.branch.name_ar,
                    name_en: $scope.user.branch.name_en
                }),
            }
        }).then(function (response) {

            if (response.data.error) {
                $scope.error = response.data.error;
                $scope.busy = false;
            }
            if (response.data.done) {
                window.location.reload(true);
            }
        }, function (err) {
            $scope.busy = false;
            $scope.error = err;
        });

    };

    $scope.loadUserBranches = function () {

        $scope.company_list = [];

        $http({
            method: "POST",
            url: "/api/user/branches/all",
            data: {
                where: { email: '##user.email##' }
            }
        }).then(
            function (response) {
                $scope.busy = false;
                if (response.data.done && response.data.list.length > 0) {
                    $scope.branch_list = response.data.list;
                    $scope.company_list = [];
                    $scope.branch_list.forEach(b => {
                        let exist = false;
                        $scope.company_list.forEach(company => {
                            if (company.id === b.company.id) {
                                exist = true;
                                company.branch_list.push(b.branch);
                            }
                        });

                        if (!exist) {
                            b.company.branch_list = [b.branch];
                            $scope.company_list.push(b.company);
                        }

                    });
                }
            },
            function (err) {
                $scope.error = err;
            }
        )
    };

    $scope.loadUserBranches();

});