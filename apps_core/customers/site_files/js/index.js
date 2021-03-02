app.controller("customers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.customer = {};

  $scope.displayAddCustomer = function () {
    $scope.error = '';

    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,

      balance: 0,
      branch_list: [{
        charge: [{}]
      }],
      currency_list: [],
      opening_balance: [{ initial_balance: 0 }],
      bank_list: [{}],
      dealing_company: [{}]
    };

    if (site.feature('medical')) {
      $scope.customer.image_url = '/images/patients.png';
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];

    } else if (site.feature('school') || site.feature('academy')) {
      $scope.customer.image_url = '/images/student.png';
      $scope.customer.allergic_food_list = [{}];
      $scope.customer.allergic_drink_list = [{}];
      $scope.customer.medicine_list = [{}];
      $scope.customer.disease_list = [{}];

    }

    site.showModal('#customerAddModal');
    document.querySelector('#customerAddModal .tab-link').click();
  };

  $scope.addCustomer = function () {
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

    $http({
      method: "POST",
      url: "/api/customers/add",
      data: $scope.customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerAddModal');
          $scope.list = $scope.list || [];
          $scope.list.push(response.data.doc);
          $scope.getCustomersList();
          $scope.count = $scope.list.length;
        } else {
          $scope.error = response.data.error;

          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"

          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = "##word.err_maximum_adds##"

          } else if (response.data.error.like('*ername must be typed correctly*')) {
            $scope.error = "##word.err_username_contain##"
          }

        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateCustomer = function (customer) {
    $scope.error = '';
    $scope.detailsCustomer(customer);
    $scope.customer = {};
    site.showModal('#customerUpdateModal');
    document.querySelector('#customerUpdateModal .tab-link').click();
  };

  $scope.displaybankingAndAccounting = function (event) {

    site.showTabContent(event, '#bankingAndAccounting');

    let num = 0;
    let ln = $scope.customer.opening_balance;

    for (let i = 0; i < ln.length; i++) {
      if (ln[i].initial_balance > 0) {
        if (ln[i].balance_type == "credit") {
          num = num - parseInt(ln[i].initial_balance);
        } else {
          num = num + parseInt(ln[i].initial_balance);
        }
      }
    }

  };



  $scope.updateCustomer = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

    const v = site.validated('#customerUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/update",
      data: $scope.customer
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerUpdateModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list[i] = response.data.doc;
            }
          });
          $scope.getCustomersList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*ername must be typed correctly*')) {
            $scope.error = "##word.err_username_contain##"
          }

        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteCustomer = function (customer) {
    $scope.error = '';
    $scope.detailsCustomer(customer);
    $scope.customer = {};
    site.showModal('#customerDeleteModal');
    document.querySelector('#customerDeleteModal .tab-link').click();
  };

  $scope.deleteCustomer = function () {
    $scope.error = '';
    if ($scope.busy) {
      return
    }

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/customers/delete",
      data: {
        id: $scope.customer.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#customerDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
              $scope.count = $scope.list.length;
            }
          });
          $scope.getCustomersList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsCustomer = function (customer) {
    $scope.error = '';
    $scope.detailsCustomer(customer);
    $scope.customer = {};
    site.showModal('#customerDetailsModal');
    document.querySelector('#customerDetailsModal .tab-link').click();
  };

  $scope.detailsCustomer = function (customer, view) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/view",
      data: {
        id: customer.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.customer = response.data.doc;
          if ($scope.customer.opening_balance && $scope.customer.opening_balance.length > 0)
            $scope.customer.opening_balance.forEach(o_b => {
              o_b.$view = true
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

  $scope.getCustomersList = function (where) {
    $scope.error = '';
    $scope.busy = true;

    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getInsuranceCompaniesList = function () {
    $http({
      method: "POST",
      url: "/api/medical_insurance_companies/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.insuranceCompaniesList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.customerGroupList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getNationalitiesList = function () {
    $http({
      method: "POST",
      url: "/api/nationalities/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.nationalitiesList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };


  $scope.Gender = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.genderList = [];
    $http({
      method: "POST",
      url: "/api/gender/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.genderList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getBloodType = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.bloodTypeList = [];
    $http({
      method: "POST",
      url: "/api/blood_type/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.bloodTypeList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getSchoolGradesList = function () {
    $http({
      method: "POST",
      url: "/api/school_grades/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.schoolGradesList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getStudentsYearsList = function (school_grade) {
    $http({
      method: "POST",
      url: "/api/students_years/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        },
        where: {
          active: true,
          'school_grade.id': school_grade.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.studentsYearsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
      }
    )
  };

  $scope.getHallsList = function () {
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.hallsList = response.data.list;
      },
      function (err) {
        $scope.error = err;
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
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
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
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
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

  $scope.getDiseaseList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/disease/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.diseaseList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getMedicineList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/medicine/all",
      data: { where: { active: true } }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.medicineList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getFoodsList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/foods/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.foodsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getDrinksList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/drinks/all",
      data: {
        where: {
          active: true
        },
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.drinksList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadMaritalsStatus = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/maritals_status/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.maritals_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getHost = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.hostList = [];
    $http({
      method: "POST",
      url: "/api/host/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.hostList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadMilitariesStatus = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/militaries_status/all",
      data: {
        select: { id: 1, name_ar: 1, name_en: 1, code: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.militaries_status = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getGuideAccountList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/accounting_guide_accounts/all",
      data: {
        where: {
          status: 'active',
          type: 'detailed'
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.guideAccountList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadCurrencies = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/currency/all",
      data: {
        select: {
          id: 1,
          name_ar: 1, name_en: 1,
          minor_currency_ar: 1, minor_currency_en: 1,
          ex_rate: 1,
          code: 1
        },
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.currenciesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "customers"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledCodeCustomer = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope.getCustomersList($scope.search);
    site.hideModal('#customerSearchModal');
    $scope.search = {};
  };


  $scope.email_examble = '';
  $scope.host = '';
  if (typeof '##session.company.host##' === 'string') {
    $scope.email_examble = 'examble@##session.company.host##';
    $scope.host = '@##session.company.host##';

  } else {
    $scope.email_examble = 'you@examble.com';
    $scope.host = '@examble.com';

  }


  $scope.getCustomersList();
  $scope.getHost();
  $scope.loadCurrencies();
  $scope.getNumberingAuto();
  $scope.getCustomerGroupList();
  $scope.Gender();
  $scope.getGovList();
  $scope.getBloodType();
  $scope.getNationalitiesList();
  $scope.loadMaritalsStatus();
  $scope.loadMilitariesStatus();

  if (site.feature('erp')) {
    $scope.getGuideAccountList();
  }

  if (site.feature('medical')) {
    $scope.getInsuranceCompaniesList();
  }

  if (site.feature('school')) {
    $scope.getSchoolGradesList();
    $scope.getHallsList();
  }



  if (site.feature('gym') || site.feature('academy') || site.feature('school') || site.feature('medical')) {
    $scope.getDiseaseList();
    $scope.getMedicineList();
    $scope.getDrinksList();
    $scope.getFoodsList();
  }
});