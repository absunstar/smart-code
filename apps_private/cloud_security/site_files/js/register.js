app.controller('register', function ($scope, $http) {

  $scope.busy = false;

  $scope.register = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: 'POST',
      url: '/api/user/register',
      data: {
        $encript: '123',
        email: site.to123($scope.userEmail),
        password: site.to123($scope.userPassword)
      }
    }).then(function (response) {

      if (response.data.error) {
        $scope.error = response.data.error;
        $scope.busy = false;
      }
      if (response.data.user) {
        window.location.href = "/";
      }
    }, function (err) {
      $scope.busy = false;
      $scope.error = err;
    });

  };

  /*  $scope.showRegisterModal = function () {
     $scope.customer = {
       image_url: '/images/customer.png'
     };
 
     site.showModal('#customerRegisterModal')
   }; */

  $scope.registerCustomer = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated('#customerRegisterModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    };
    if ($scope.customer.password != $scope.customer.password_return) {
      $scope.error = "##word.password_err##";
      $scope.busy = false;
      return;
    };

    if ($scope.Gender) {
      if ($scope.Gender.type == 'male') {
        $scope.customer.gender = {
          name: 'male',
          ar: 'ذكر',
          en: 'Male',
        }

      } else if ($scope.Gender.type == 'female') {
        $scope.customer.gender = {
          name: 'female',
          ar: 'أنثى',
          en: 'Female',
        }
      }
    }

    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerRegisterModal');
          $http({
            method: 'POST',
            url: '/api/user/login',
            data: {
              $encript: '123',
              email: site.to123($scope.customer.username),
              password: site.to123($scope.customer.password),
              company: site.to123({
                id: $scope.customer.company.id,
                name_ar: $scope.customer.company.name_ar,
                name_en: $scope.customer.company.name_en,
                item: $scope.customer.company.item,
                store: $scope.customer.company.store,
                unit: $scope.customer.company.unit,
                currency: $scope.customer.company.currency,
                host: $scope.customer.company.host,
                customers_count: $scope.customer.company.customers_count,
                employees_count: $scope.customer.company.employees_count,
                users_count: $scope.customer.company.users_count
              }),
              branch: site.to123({
                code: $scope.customer.branch.code,
                name_ar: $scope.customer.branch.name_ar,
                name_en: $scope.customer.branch.name_en
              }),
            }
          }).then(function (response) {

            if (response.data.error) {
              $scope.error = response.data.error;
              $scope.busy = false;
            }
            if (response.data.done) {
              document.location.href = '/order_customer';
              $scope.busy = false;
            }
          }, function (err) {
            $scope.busy = false;
            $scope.error = err;
          });


        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true
        },
        select: { id: 1, name: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          'gov.id': gov.id,
          active: true
        },
        select: { id: 1, name: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.cityList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          'city.id': city.id,
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.areaList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCompanyList = function () {

    $scope.company_list = [];

    $http({
      method: "POST",
      url: "/api/companies/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.company_list = response.data.list;

        }
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.getCompanyList();
  $scope.getGovList();
});