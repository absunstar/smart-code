app.controller('login', function ($scope, $http) {
  $scope.busy = false;
  $scope.user = {};

  $scope.tryLogin = function (ev) {
    if (ev.which == 13) {
      $scope.loadUserBranches();
    }
  };

  $scope.login = function (b) {
    $scope.error = '';
    console.log('b', b);
    const v = site.validated('#loginModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.user.company = b.company;
    $scope.user.branch = b.branch;

    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/login',
      data: {
        $encript: '123',
        email: site.to123($scope.user.email),
        password: site.to123($scope.user.password),
        company: site.to123({
          id: $scope.user.company.id,
          nameAr: $scope.user.company.nameAr,
          nameEn: $scope.user.company.nameEn,
          item: $scope.user.company.item,
          store: $scope.user.company.store,
          unit: $scope.user.company.unit,
          currency: $scope.user.company.currency,
          usersCount: $scope.user.company.usersCount,
          customersCount: $scope.user.company.customersCount,
          employeesCount: $scope.user.company.employeesCount,
          host: $scope.user.company.host,
          taxNumber: $scope.user.company.taxNumber,
          mobile: $scope.user.company.mobile,
          phone: $scope.user.company.phone,
        }),
        branch: site.to123({
          code: $scope.user.branch.code,
          nameAr: $scope.user.branch.nameAr,
          nameEn: $scope.user.branch.nameEn,
        }),
      },
    }).then(
      function (response) {
        console.log('response', response);

        if (response.data.error) {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
        if (response.data.done) {
          window.location.reload(true);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  
  $scope.loadUserBranches = function (ev) {
    $scope.companyList = [];
    if (ev && ev.which !== 13) {
      return;
    }

    $http({
      method: 'POST',
      url: '/api/user/branches/all',
      data: {
        where: { email: $scope.user.email },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.branchList = response.data.list;
          $scope.companyList = [];
          $scope.branchList.forEach((b) => {
            let exist = false;
            $scope.companyList.forEach((company) => {
              if (company.id === b.company.id) {
                exist = true;
                company.branchList.push(b.branch);
              }
            });

            if (!exist) {
              b.company.branchList = [b.branch];
              $scope.companyList.push(b.company);
            }
          });

          if ($scope.branchList.length === 1 && $scope.user.email && $scope.user.password) {
            $scope.login($scope.branchList[0]);
          }

          $scope.$applyAsync();
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };
});
