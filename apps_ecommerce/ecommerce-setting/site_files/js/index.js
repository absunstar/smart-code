
let btn1 = document.querySelector('#setting_ecommerce .tab-link');
if (btn1) {
  btn1.click();
}

app.controller("ecommerce_setting", function ($scope, $http,$timeout) {
  $scope._search = {};

  $scope.product = {};
  $scope.product_group = {};
  $scope.shipping_company = {};
  $scope.eco_setting = {};

  $scope.displayAddProduct = function () {
    $scope.error = '';
    $scope.product = {
      image_url: '/images/product.png',
      price: 0,
      active: true
    };
    $scope.product.$add = true;
    site.showModal('#productContentModal');

  };

  $scope.addProduct = function () {
    $scope.error = '';
    const v = site.validated('#productContentModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/product/add",
      data: $scope.product
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productContentModal');
          $scope.getProductList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateProduct = function (product) {
    $scope.error = '';
    $scope.viewProduct(product,'update');
    $scope.product = {};
    site.showModal('#productContentModal');
  };

  $scope.updateProduct = function () {
    $scope.error = '';
    const v = site.validated('#productContentModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/product/update",
      data: $scope.product
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productContentModal');
          $scope.getProductList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsProduct = function (product) {
    $scope.error = '';
    $scope.viewProduct(product,'view');
    $scope.product = {};
    site.showModal('#productViewModal');
  };

  $scope.viewProduct = function (product, type) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/product/view",
      data: {
        id: product.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.product = response.data.doc;
        if(type == 'view')  $scope.product.$view = true;
        if(type == 'update')  $scope.product.$update = true;
        if(type == 'delete')  $scope.product.$delete = true;

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteProduct = function (product) {
    $scope.error = '';
    $scope.viewProduct(product,'delete');
    $scope.product = {};
    site.showModal('#productViewModal');
  };

  $scope.deleteProduct = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/product/delete",
      data: {
        id: $scope.product.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productViewModal');
          $scope.getProductList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getProductList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/product/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.productsList = response.data.list;
          $scope.productsCount = response.data.count;
          site.hideModal('#productSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getProductNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "products"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledProductCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadActiveSubstances = function () {
    $scope.busy = true;
    $scope.activeSubstancesList = [];
    $http({
      method: "POST",
      url: "/api/active_substances/all",
      data: {
        select: {
          id: 1,
          name_Ar: 1, name_En: 1,
          code: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.activeSubstancesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displayProductSearchModal = function () {
    $scope.error = '';
    site.showModal('#productSearchModal');

  };

  $scope.searchAllProduct = function () {

    $scope.getProductList($scope.search);
    site.hideModal('#productSearchModal');
    $scope.search = {};
  };















  $scope.displayAddProductGroup = function () {
    $scope.error = '';
    $scope.product_group = {
      image_url: '/images/product_group.png',
      active: true
    };
    $scope.product_group.$add = true;
    site.showModal('#productGroupContentModal');

  };

  $scope.addProductGroup = function () {
    $scope.error = '';
    const v = site.validated('#productGroupContentModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/product_group/add",
      data: $scope.product_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productGroupContentModal');
          $scope.getProductGroupList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateProductGroup = function (product_group) {
    $scope.error = '';
    $scope.viewProductGroup(product_group,'update');
    $scope.product_group = {};
    site.showModal('#productGroupContentModal');
  };

  $scope.updateProductGroup = function () {
    $scope.error = '';
    const v = site.validated('#productGroupContentModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/product_group/update",
      data: $scope.product_group
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productGroupContentModal');
          $scope.getProductGroupList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsProductGroup = function (product_group) {
    $scope.error = '';
    $scope.viewProductGroup(product_group,'view');
    $scope.product_group = {};
    site.showModal('#productGroupViewModal');
  };

  $scope.viewProductGroup = function (product_group, type) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/product_group/view",
      data: {
        id: product_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.product_group = response.data.doc;
        if(type == 'view')  $scope.product_group.$view = true;
        if(type == 'update')  $scope.product_group.$update = true;
        if(type == 'delete')  $scope.product_group.$delete = true;

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteProductGroup = function (product_group) {
    $scope.error = '';
    $scope.viewProductGroup(product_group,'delete');
    $scope.product_group = {};
    site.showModal('#productGroupViewModal');
  };

  $scope.deleteProductGroup = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/product_group/delete",
      data: {
        id: $scope.product_group.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#productGroupViewModal');
          $scope.getProductGroupList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getProductGroupList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/product_group/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.productsGroupsList = response.data.list;
          $scope.productsGroupsCount = response.data.count;
          site.hideModal('#productGroupSearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getProductGroupNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "products_groups"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledProductGroupCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displayProductGroupSearchModal = function () {
    $scope.error = '';
    site.showModal('#productGroupSearchModal');

  };

  $scope.searchAllProductGroup = function () {

    $scope.getProductGroupList($scope.search);
    site.hideModal('#productGroupSearchModal');
    $scope.search = {};
  };













  $scope.displayAddShippingCompany = function () {
    $scope.error = '';
    $scope.shipping_company = {
      image_url: '/images/shipping_company.png',
      active: true
    };
    $scope.shipping_company.$add = true;
    site.showModal('#shippingCompanyContentModal');

  };

  $scope.addShippingCompany = function () {
    $scope.error = '';
    const v = site.validated('#shippingCompanyContentModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shipping_company/add",
      data: $scope.shipping_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shippingCompanyContentModal');
          $scope.getShippingCompanyList();
        } else {
          $scope.error = response.data.error;
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"
          }
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateShippingCompany = function (shipping_company) {
    $scope.error = '';
    $scope.viewShippingCompany(shipping_company,'update');
    $scope.shipping_company = {};
    site.showModal('#shippingCompanyContentModal');
  };

  $scope.updateShippingCompany = function () {
    $scope.error = '';
    const v = site.validated('#shippingCompanyContentModal');
    if (!v.ok) {
      $scope.error = v.messages[0].Ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/shipping_company/update",
      data: $scope.shipping_company
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shippingCompanyContentModal');
          $scope.getShippingCompanyList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsShippingCompany = function (shipping_company) {
    $scope.error = '';
    $scope.viewShippingCompany(shipping_company,'view');
    $scope.shipping_company = {};
    site.showModal('#shippingCompanyViewModal');
  };

  $scope.viewShippingCompany = function (shipping_company, type) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/shipping_company/view",
      data: {
        id: shipping_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.shipping_company = response.data.doc;
        if(type == 'view')  $scope.shipping_company.$view = true;
        if(type == 'update')  $scope.shipping_company.$update = true;
        if(type == 'delete')  $scope.shipping_company.$delete = true;

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteShippingCompany = function (shipping_company) {
    $scope.error = '';
    $scope.viewShippingCompany(shipping_company,'delete');
    $scope.shipping_company = {};
    site.showModal('#shippingCompanyViewModal');
  };

  $scope.deleteShippingCompany = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/shipping_company/delete",
      data: {
        id: $scope.shipping_company.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#shippingCompanyViewModal');
          $scope.getShippingCompanyList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getShippingCompanyList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/shipping_company/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.shippingCompanyList = response.data.list;
          $scope.shippingCompanyCount = response.data.count;
          site.hideModal('#shippingCompanySearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getShippingCompanyNumberingAuto = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/get_automatic",
      data: {
        screen: "shipping_company"
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.disabledShippingCompanyCode = response.data.isAuto;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displayShippingCompanySearchModal = function () {
    $scope.error = '';
    site.showModal('#shippingCompanySearchModal');

  };

  $scope.searchAllShippingCompany = function () {

    $scope.getShippingCompanyList($scope.search);
    site.hideModal('#shippingCompanySearchModal');
    $scope.search = {};
  };










  $scope.displayAddCustomer = function () {
    $scope.error = '';

    $scope.customer = {
      image_url: '/images/customer.png',
      active: true,
      balance_creditor: 0,
      balance_debtor: 0,
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
      $scope.error = v.messages[0].Ar;
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
      $scope.error = v.messages[0].Ar;
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
          if (response.data.error.like('*Must Enter Code*')) {
            $scope.error = "##word.must_enter_code##"

          } else if (response.data.error.like('*maximum number of adds exceeded*')) {
            $scope.error = "##word.err_maximum_adds##"

          } else if (response.data.error.like('*ername must be typed correctly*')) {
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
          $scope.customersList = response.data.list;
          $scope.customersCount = response.data.count;
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCustomersNumberingAuto = function () {
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

  $scope.getGovList = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/goves/all",
      data: {
        where: {
          active: true,
        },
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 },
      },
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
        select: { id: 1, name_Ar: 1, name_En: 1, code: 1 },
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

  $scope.loadSetting = function (where) {
    $scope.eco_setting = {};
    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/eco_setting/get",
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.eco_setting = response.data.doc;
        } else {
          $scope.eco_setting = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.saveSetting = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/eco_setting/save",
      data: $scope.eco_setting,
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error;
        } else {
          site.showModal("#alert");
          $timeout(() => {
            site.hideModal("#alert");

          }, 1500);
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };


  $scope.loadSetting();
  $scope.getProductList();
  $scope.loadActiveSubstances();
  $scope.getProductGroupList();
  $scope.getProductNumberingAuto();
  $scope.getProductGroupNumberingAuto();
  $scope.getCustomersNumberingAuto();
  $scope.getCustomersList();
  $scope.getGovList();
  $scope.getShippingCompanyList();
  $scope.getShippingCompanyNumberingAuto();
});