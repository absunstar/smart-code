app.controller('company_register', function ($scope, $http) {

  $scope.busy = false;

  $scope.company = {
    image_url: '/images/company.png',
    calender_type: 'gegorian',
    active: true,
    branch_count: 1,
    store: 1,
    item: 100,
    unit: 1,
    currency: 1,
    customers_count: 50,
    employees_count: 5,
    users_count: 10,
    branch_list: [{
      code: 1,
      name_ar: 'الفرع الرئيسى',
      name_en: 'Main Branch',
      charge: [{}]
    }],
    bank_list: [{}]
  };

  document.querySelector('#companyRegisterModal .tab-link').click();

  $scope.addcompanyRegister = function (company) {
    if ($scope.busy) {
      return;
    }

    $scope.error = '';
    const v = site.validated('#companyRegisterModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    let user_name = company.username


    let exist_domain = company.username.includes("@");
    if(!exist_domain){
      user_name = company.username + '@' + company.host;
    }
    
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/companies/add",
      data: company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#companyRegisterModal');
          $http({
            method: 'POST',
            url: '/api/user/login',
            data: {
              $encript: '123',
              email: site.to123(user_name),
              password: site.to123(company.password),
              company: site.to123({
                id: response.data.doc.id,
                name_ar: company.name_ar,
                name_en: company.name_en,
                item: company.item,
                store: company.store,
                unit: company.unit,
                currency: company.currency,
                host: company.host,
                customers_count: company.customers_count,
                employees_count: company.employees_count,
                users_count: company.users_count
              }),
              branch: site.to123({
                code: company.branch_list[0].code,
                name_ar: company.branch_list[0].name_ar,
                name_en: company.branch_list[0].name_en
              }),
            }
          }).then(function (response) {
            if (response.data.error) {
              $scope.error = response.data.error;
              $scope.busy = false;
            }
            if (response.data.done) {
              window.location.href = "/";
              $scope.busy = false;
            }
          }, function (err) {
            $scope.busy = false;
            $scope.error = err;
          });

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
});