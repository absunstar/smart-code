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

    const v = site.validated('#customerAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    $scope.busy = true;
    if ($scope.Gender) {
      if ($scope.Gender.type == 'male') {
        $scope.customer.indentfy = {
          name: 'male',
          ar: 'ذكر',
          en: 'Male',
        }

      } else if ($scope.Gender.type == 'female') {
        $scope.customer.indentfy = {
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
          /* document.location.href = '/order_customer'; */

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
        select: { id: 1, name: 1 }
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
        select: { id: 1, name: 1 }
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