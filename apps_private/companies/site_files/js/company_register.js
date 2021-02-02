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
    customers_count: 100,
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