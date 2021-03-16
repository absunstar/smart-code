app.controller('company_register', function ($scope, $http) {

  $scope.busy = false;

  $scope.company = {
    image_url: '/images/company.png',
    calender_type: 'gegorian',
    active: true,
    branch_count: 3,
    store: 5,
    item: 100,
    unit: 5,
    currency: 5,
    customers_count: 50,
    employees_count: 20,
    users_count: 20,
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
    /*   let user_name = company.username
  
  
      let exist_domain = company.username.contains("@");
      if(!exist_domain){
        user_name = company.username + '@' + company.host;
      } */

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
              email: site.to123(response.data.doc.username),
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

            } else if (response.data.done) {

              window.location.href = "/";
              $scope.busy = false;

              $http({
                method: "POST",
                url: "/api/numbering/get",
                data: {
                  reset: true,
                  doc: response.data.doc

                }
              }).then(
                function (response) {
                  if (response.data.done) {
                  }
                },
                function (err) {
                  $scope.busy = false;
                  $scope.error = err;
                }
              )

            }

          }, function (err) {
            $scope.busy = false;
            $scope.error = err;
          });

        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*ername must be typed correctly*')) {
            $scope.error = "##word.err_username_contain##"
          } else if (response.data.error.like('*User Is Exist*')) {
            $scope.error = "##word.user_exists##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };
});