app.controller("register", function ($scope, $http) {
  $scope.busy = false;

  $scope.register = function () {
    $scope.error = "";
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/user/register",
      data: {
        $encript: "123",
        email: site.to123($scope.userEmail),
        password: site.to123($scope.userPassword),
      },
    }).then(
      function (response) {
        if (response.data.error) {
          $scope.error = response.data.error;
          $scope.busy = false;
        }
        if (response.data.user) {
          window.location.href = "/";
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  /*  $scope.showRegisterModal = function () {
     $scope.customer = {
       image_url: '/images/customer.png'
     };
 
     site.showModal('#customerRegisterModal')
   }; */

  $scope.registerCustomer = function () {
    $scope.error = "";
    if ($scope.busy) {
      return;
    }
    $scope.busy = true;

    const v = site.validated("#customerRegisterModal");
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      $scope.busy = false;
      return;
    }
    if ($scope.customer.password != $scope.customer.password_return) {
      $scope.error = "##word.password_err_match##";
      $scope.busy = false;
      return;
    }

    if (site.feature("medical")) {
      if (!$scope.customer.image_url) {
        $scope.customer.image_url = "/images/patients.png";
      }
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicines_list = [];
      $scope.customer.disease_list = [{}];
    } else if (site.feature("school") || site.feature("academy")) {
      if (!$scope.customer.image_url) {
        $scope.customer.image_url = "/images/student.png";
      }
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicines_list = [];
      $scope.customer.disease_list = [{}];
    }

    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer,
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal("#customerRegisterModal");
          $http({
            method: "POST",
            url: "/api/user/login",
            data: {
              $encript: "123",
              email: site.to123(response.data.doc.username),
              password: site.to123(response.data.doc.password),
              company: site.to123({
                id: response.data.doc.company.id,
                name_ar: response.data.doc.company.name_ar,
                name_en: response.data.doc.company.name_en,
                item: response.data.doc.company.item,
                store: response.data.doc.company.store,
                unit: response.data.doc.company.unit,
                currency: response.data.doc.company.currency,
                host: response.data.doc.company.host,
                customers_count: response.data.doc.company.customers_count,
                employees_count: response.data.doc.company.employees_count,
                users_count: response.data.doc.company.users_count,
                tax_number: response.data.doc.company.tax_number,
              }),
              branch: site.to123({
                code: response.data.doc.branch.code,
                name_ar: response.data.doc.branch.name_ar,
                name_en: response.data.doc.branch.name_en,
              }),
            },
          }).then(
            function (response) {
              if (response.data.error) {
                $scope.error = response.data.error;
                if (response.data.error.like("*Must Enter Code*")) {
                  $scope.error = "##word.must_enter_code##";
                } else if (
                  response.data.error.like("*maximum number of adds exceeded*")
                ) {
                  $scope.error = "##word.err_maximum_adds##";
                } else if (
                  response.data.error.like("*ername must be typed correctly*")
                ) {
                  $scope.error = "##word.err_username_contain##";
                } else if (response.data.error.like("*User Is Exist*")) {
                  $scope.error = "##word.user_exists##";
                }
                $scope.busy = false;
              } else if (response.data.done) {
                if (site.feature("ecommerce") || site.feature("erp") || site.feature("pos") || site.feature("restaurant"))
                  document.location.href = "/order_customer";
                else document.location.href = "/";

                $scope.busy = false;
              }
            },
            function (err) {
              $scope.busy = false;
              $scope.error = err;
            }
          );
        } else {
          $scope.error = "Please Login First";
        }
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.Gender = function () {
    $scope.error = "";
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all",
    }).then(
      function (response) {
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getGovList = function (companyId) {
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
          "company.id": companyId,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
    }).then(
      function (response) {
        if (response.data.done && response.data.list.length > 0) {
          $scope.govList = response.data.list;
        }
      },
      function (err) {
        $scope.error = err;
      }
    );
  };

  $scope.getCityList = function (gov) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/city/all",
      data: {
        where: {
          "gov.id": gov.id,
          active: true,
        },
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 },
      },
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
    );
  };

  $scope.getAreaList = function (city) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/area/all",
      data: {
        where: {
          "city.id": city.id,
          active: true,
        },
      },
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
    );
  };

  $scope.getCompanyList = function () {
    $scope.company_list = [];

    $http({
      method: "POST",
      url: "/api/companies/all",
      data: {},
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
    );
  };

  $scope.getCompanyList();
  $scope.Gender();
});
