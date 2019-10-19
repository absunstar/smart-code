app.controller("customers", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.customer = {};

  $scope.displayAddCustomer = function () {
    $scope.error = '';
    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
      allergic_food_list: [{}],
      allergic_drink_list: [{}],
      medicine_list: [{}],
      disease_list: [{}],
      /*       balance: 0,
             branch_list: [{
              charge: [{}]
            }], 
            currency_list: [],
        opening_balance: [{ initial_balance: 0 }], 
      
            bank_list: [{}],
            dealing_company: [{}] */
    };
    /*     $scope.showOpeningBalance = true;
     */
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
          $scope.list.push(response.data.doc);
          $scope.count = $scope.list.length;
        } else {
          $scope.error = 'Please Login First';
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
    $scope.showOpeningBalance = false;
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

    if ($scope.showOpeningBalance) {

      $scope.customer.balance = parseInt(num);
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
        } else {
          $scope.error = response.data.error;
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

  $scope.detailsCustomer = function (customer) {
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
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displaySendEmail = function () {
    $scope.error = '';
    site.showModal('#customerSendEmailModal');
  };

  $scope.getCustomerList = function (where) {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }

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

  $scope.getCustomerGroupList = function () {
    $http({
      method: "POST",
      url: "/api/customers_group/all",
      data: {
        select: {
          id: 1,
          name: 1
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

  $scope.getIndentfy = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.indentfyList = [];
    $http({
      method: "POST",
      url: "/api/indentfy_employee/all"

    }).then(
      function (response) {
        $scope.busy = false;
        $scope.indentfyList = response.data;
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

  $scope.searchAll = function () {

    let where = {};

    if ($scope.search.code) {

      where['code'] = $scope.search.code;
    }
    if ($scope.search.name_ar) {

      where['name_ar'] = $scope.search.name_ar;
    }
    if ($scope.search.name_en) {

      where['name_en'] = $scope.search.name_en;
    }
    if ($scope.search.nationality) {

      where['nationality'] = $scope.search.nationality;
    }
    if ($scope.search.gov) {

      where['gov'] = $scope.search.gov;
    }
    if ($scope.search.city) {

      where['city'] = $scope.search.city;
    }
    if ($scope.search.phone) {

      where['phone'] = $scope.search.phone;
    }
    if ($scope.search.mobile) {

      where['mobile'] = $scope.search.mobile;
    }
    where['active'] = 'all';

    $scope.getCustomerList(where);

    site.hideModal('#customerSearchModal');
    $scope.search = {}

  };


  $scope.getCustomerList();
  $scope.getCustomerGroupList();
  $scope.getGovList();
  $scope.getIndentfy();
  $scope.getBloodType();
});