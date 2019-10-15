app.controller("notifications", function ($scope, $http, $interval) {

  $scope.search = {
    bySystem: true,
    system: 'security',
    byUser: false,
    user: null,
    message: '',
    value: '',
    fromDate: null,
    toDate: null,
    limit: 50
  };

  $scope.loadSystem = function () {
    $http({
      method: "POST",
      url: "/api/system/all",
    }).then(
      function (response) {
        if (response.data) {
          $scope.systemList = response.data;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadAll = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/notifications/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadUsers = function () {
    if ($scope.userList) {
      return
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/users/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.userList = response.data.users;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.searchAll = function () {
    $scope.busy = true;

    let where = {};

    if ($scope.search.source) {
      where['source.ar'] = $scope.search.source.ar;
    }

    if ($scope.search.user && $scope.search.user.id) {
      where['user.id'] = $scope.search.user.id;
    }

    if ($scope.search.message) {
      where['message.ar'] = $scope.search.message;
    }

    if ($scope.search.value) {
      where['value.ar'] = $scope.search.value;
    }

    if ($scope.search.fromDate) {
      where['date_from'] = $scope.search.fromDate;
    }

    if ($scope.search.toDate) {
      where['date_to'] = $scope.search.toDate;
    }

    $http({
      method: "POST",
      url: "/api/notifications/all",
      data: {
        where: where,
        limit: $scope.search.limit
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
          site.hideModal('#searchModal');
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
    site.hideModal('#SearchModal')
  };

  $scope.showAdd = (n) => {
    if (n.link.collection == 'students') {
      $scope.students = n.add;
      site.showModal('#studentsViewModal');
      document.querySelector('#studentsViewModal .tab-link').click();


    } else if (n.link.collection == 'academies') {
      $scope.academy = n.add;
      site.showModal('#academyDetailsModal');
      document.querySelector('#academyDetailsModal .tab-link').click();

    } else if (n.link.collection == 'create_course') {
      $scope.create_course = n.add;
      site.showModal('#createCourseViewModal');

    } else if (n.link.collection == 'account_course') {
      $scope.account_course = n.add;
      site.showModal('#accountCourseViewModal');

    } else if (n.link.collection == 'courses') {
      $scope.courses = n.add;
      site.showModal('#coursesViewModal');

    } else if (n.link.collection == 'book_course') {
      $scope.book_course = n.add;
      site.showModal('#bookCourseViewModal');
      document.querySelector('#bookCourseViewModal .tab-link').click();

    } else if (n.link.collection == 'employee') {
      $scope.employee = n.add;
      site.showModal('#employeeViewModal');
      document.querySelector('#employeeViewModal .tab-link').click();

    } else if (n.link.collection == 'employees_degrees') {
      $scope.employee_degree = n.add;
      site.showModal('#viewEmployeeDegreeModal');

    } else if (n.link.collection == 'jobs') {
      $scope.jobs = n.add;
      site.showModal('#jobsViewModal');

    } else if (n.link.collection == 'trainer') {
      $scope.trainer = n.add;
      site.showModal('#trainerViewModal');
      document.querySelector('#trainerViewModal .tab-link').click();

    } else if (n.link.collection == 'facilities_codes') {
      $scope.facility_code = n.add;
      site.showModal('#viewFacilityCodeModal');

    } else if (n.link.collection == 'safes') {
      $scope.safe = n.add;
      site.showModal('#viewSafeModal');

    } else if (n.link.collection == 'amounts_in') {
      $scope.amount_in = n.add;
      site.showModal('#viewAmountInModal');

    } else if (n.link.collection == 'amounts_out') {
      $scope.amount_out = n.add;
      site.showModal('#viewAmountOutModal');

    } else if (n.link.collection == 'in_out_names') {
      $scope.in_out_name = n.add;
      site.showModal('#viewInOutNameModal');

    } else if (n.link.collection == 'employees_insurances') {
      $scope.employee_insurance = n.add;
      site.showModal('#viewEmployeeInsuranceModal');

    } else if (n.link.collection == 'insurance_slide') {
      $scope.insurance_slide = n.add;
      site.showModal('#viewInsuranceSlideModal');

    } else if (n.link.collection == 'employees_advances') {
      $scope.employees_advances = n.add;
      site.showModal('#viewEmployeesAdvancesModal');

    } else if (n.link.collection == 'employee_discount') {
      $scope.employee_discount = n.add;
      site.showModal('#viewEmployeeDiscountModal');

    } else if (n.link.collection == 'employee_offer') {
      $scope.employee_offer = n.add;
      site.showModal('#viewemployeeOfferModal');

    } else if (n.link.collection == 'employees_advances_fin') {
      $scope.employees_advances_fin = n.add;
      site.showModal('#viewEmployeesAdvancesFinModal');

    } else if (n.link.collection == 'tenant') {
      $scope.tenant = n.add;
      site.showModal('#tenantViewModal');
      document.querySelector('#tenantViewModal .tab-link').click();

    } else if (n.link.collection == 'book_hall') {
      $scope.book_hall = n.add;
      site.showModal('#bookHallViewModal');

    } else if (n.link.collection == 'class_rooms') {
      $scope.class_rooms = n.add;
      site.showModal('#classRoomsViewModal');

    } else if (n.link.collection == 'disease') {
      $scope.disease = n.add;
      site.showModal('#diseaseViewModal');

    } else if (n.link.collection == 'medicine') {
      $scope.medicine = n.add;
      site.showModal('#medicineViewModal');

    } else if (n.link.collection == 'attend_leave') {
      $scope.attend_leave = n.add;
      site.showModal('#attendLeaveViewModal');

    } else if (n.link.collection == 'goves') {
      $scope.gov = n.add;
      site.showModal('#govViewModal');

    } else if (n.link.collection == 'lecture') {
      $scope.lecture = n.add;
      site.showModal('#lectureViewModal');

    } else if (n.link.collection == 'neighborhood') {
      $scope.neighborhood = n.add;
      site.showModal('#neighborhoodViewModal');

    } else if (n.link.collection == 'area') {
      $scope.area = n.add;
      site.showModal('#areaViewModal');

    } else if (n.link.collection == 'stores') {
      $scope.store = n.add;
      site.showModal('#viewStoreModal');

    } else if (n.link.collection == 'discount_types') {
      $scope.discount_type = n.add;
      site.showModal('#viewDiscountTypeModal');

    } else if (n.link.collection == 'tax_types') {
      $scope.tax_type = n.add;
      site.showModal('#viewTaxTypeModal');

    } else if (n.link.collection == 'stores_in') {
      $scope.store_in = n.add;
      site.showModal('#viewStoreInModal');

    } else if (n.link.collection == 'stores_items') {
      $scope.category_item = n.add;
      site.showModal('#viewCategoryItemModal');

    } else if (n.link.collection == 'stores_out') {
      $scope.store_out = n.add;
      site.showModal('#viewStoreOutModal');

    } else if (n.link.collection == 'stores_transfer') {
      $scope.store_out = n.add;
      site.showModal('#viewStoreTransferModal');

    } else if (n.link.collection == 'vendors') {
      $scope.vendor = n.add;
      site.showModal('#vendorDetailsModal');
      document.querySelector('#vendorDetailsModal .tab-link').click();

    } else if (n.link.collection == 'vendors_group') {
      $scope.vendor_group = n.add;
      site.showModal('#vendorGroupDetailsModal');
      
    } else {
      site.showModal('#displayModal');
      $('#displayContent').html(site.toHtmlTable(n.add));
    }
  };


  $scope.showUpdate = (n) => {
    if (n.link.collection == 'students') {
      $scope.students = n.update;
      site.showModal('#studentsViewModal');
      document.querySelector('#studentsViewModal .tab-link').click();

    } else if (n.link.collection == 'academies') {
      $scope.academy = n.update;
      site.showModal('#academyDetailsModal');
      document.querySelector('#academyDetailsModal .tab-link').click();

    } else if (n.link.collection == 'courses') {
      $scope.courses = n.update;
      site.showModal('#coursesViewModal');

    } else if (n.link.collection == 'create_course') {
      $scope.create_course = n.update;
      site.showModal('#createCourseViewModal');

    } else if (n.link.collection == 'account_course') {
      $scope.account_course = n.update;
      site.showModal('#accountCourseViewModal');

    } else if (n.link.collection == 'book_course') {
      $scope.book_course = n.update;
      site.showModal('#bookCourseViewModal');
      document.querySelector('#bookCourseViewModal .tab-link').click();

    } else if (n.link.collection == 'facilities_codes') {
      $scope.facility_code = n.update;
      site.showModal('#viewFacilityCodeModal');

    } else if (n.link.collection == 'safes') {
      $scope.safe = n.update;
      site.showModal('#viewSafeModal');

    } else if (n.link.collection == 'amounts_in') {
      $scope.amount_in = n.update;
      site.showModal('#viewAmountInModal');

    } else if (n.link.collection == 'amounts_out') {
      $scope.amount_out = n.update;
      site.showModal('#viewAmountOutModal');

    } else if (n.link.collection == 'in_out_names') {
      $scope.in_out_name = n.update;
      site.showModal('#viewInOutNameModal');

    } else if (n.link.collection == 'employees_insurances') {
      $scope.employee_insurance = n.update;
      site.showModal('#viewEmployeeInsuranceModal');

    } else if (n.link.collection == 'insurance_slide') {
      $scope.insurance_slide = n.update;
      site.showModal('#viewInsuranceSlideModal');

    } else if (n.link.collection == 'employees_advances') {
      $scope.employees_advances = n.update;
      site.showModal('#viewEmployeesAdvancesModal');

    } else if (n.link.collection == 'employee_discount') {
      $scope.employee_discount = n.update;
      site.showModal('#viewEmployeeDiscountModal');

    } else if (n.link.collection == 'employee_offer') {
      $scope.employee_offer = n.update;
      site.showModal('#viewemployeeOfferModal');

    } else if (n.link.collection == 'employees_advances_fin') {
      $scope.employees_advances_fin = n.update;
      site.showModal('#viewEmployeesAdvancesFinModal');

    } else if (n.link.collection == 'tenant') {
      $scope.tenant = n.update;
      site.showModal('#tenantViewModal');
      document.querySelector('#tenantViewModal .tab-link').click();

    } else if (n.link.collection == 'book_hall') {
      $scope.book_hall = n.update;
      site.showModal('#bookHallViewModal');

    } else if (n.link.collection == 'class_rooms') {
      $scope.class_rooms = n.update;
      site.showModal('#classRoomsViewModal');

    } else if (n.link.collection == 'disease') {
      $scope.disease = n.update;
      site.showModal('#diseaseViewModal');

    } else if (n.link.collection == 'medicine') {
      $scope.medicine = n.update;
      site.showModal('#medicineViewModal');

    } else if (n.link.collection == 'attend_leave') {
      $scope.attend_leave = n.update;
      site.showModal('#attendLeaveViewModal');

    } else if (n.link.collection == 'employee') {
      $scope.employee = n.update;
      site.showModal('#employeeViewModal');
      document.querySelector('#employeeViewModal .tab-link').click();

    } else if (n.link.collection == 'employees_degrees') {
      $scope.employee_degree = n.update;
      site.showModal('#viewEmployeeDegreeModal');

    } else if (n.link.collection == 'jobs') {
      $scope.jobs = n.update;
      site.showModal('#jobsViewModal');

    } else if (n.link.collection == 'trainer') {
      $scope.trainer = n.update;
      site.showModal('#trainerViewModal');
      document.querySelector('#trainerViewModal .tab-link').click();

    } else if (n.link.collection == 'goves') {
      $scope.gov = n.update;
      site.showModal('#govViewModal');

    }  else if (n.link.collection == 'lecture') {
      $scope.lecture = n.update;
      site.showModal('#lectureViewModal');

    } else if (n.link.collection == 'neighborhood') {
      $scope.neighborhood = n.update;
      site.showModal('#neighborhoodViewModal');

    } else if (n.link.collection == 'area') {
      $scope.area = n.update;
      site.showModal('#areaViewModal');

    } else if (n.link.collection == 'stores') {
      $scope.store = n.update;
      site.showModal('#viewStoreModal');

    } else if (n.link.collection == 'discount_types') {
      $scope.discount_type = n.update;
      site.showModal('#viewDiscountTypeModal');

    } else if (n.link.collection == 'tax_types') {
      $scope.tax_type = n.update;
      site.showModal('#viewTaxTypeModal');

    } else if (n.link.collection == 'stores_in') {
      $scope.store_in = n.update;
      site.showModal('#viewStoreInModal');

    } else if (n.link.collection == 'stores_items') {
      $scope.category_item = n.update;
      site.showModal('#viewCategoryItemModal');

    } else if (n.link.collection == 'stores_out') {
      $scope.store_out = n.update;
      site.showModal('#viewStoreOutModal');

    } else if (n.link.collection == 'vendors') {
      $scope.vendor = n.update;
      site.showModal('#vendorDetailsModal');
      document.querySelector('#vendorDetailsModal .tab-link').click();

    } else if (n.link.collection == 'vendors_group') {
      $scope.vendor_group = n.update;
      site.showModal('#vendorGroupDetailsModal');
      
    } else {
      site.showModal('#displayModal')
      $('#displayContent').html(site.toHtmlTable(n.update));
    }
  };

  $scope.showDelete = (n) => {
    if (n.link.collection == 'students') {
      $scope.students = n.delete;
      site.showModal('#studentsViewModal');
      document.querySelector('#studentsViewModal .tab-link').click();

    } else if (n.link.collection == 'courses') {
      $scope.courses = n.delete;
      site.showModal('#coursesViewModal');

    } else if (n.link.collection == 'create_course') {
      $scope.create_course = n.delete;
      site.showModal('#createCourseViewModal');

    } else if (n.link.collection == 'account_course') {
      $scope.account_course = n.delete;
      site.showModal('#accountCourseViewModal');

    } else if (n.link.collection == 'book_course') {
      $scope.book_course = n.delete;
      site.showModal('#bookCourseViewModal');
      document.querySelector('#bookCourseViewModal .tab-link').click();

    } else if (n.link.collection == 'academies') {
      $scope.academy = n.delete;
      site.showModal('#academyDetailsModal');
      document.querySelector('#academyDetailsModal .tab-link').click();

    } else if (n.link.collection == 'facilities_codes') {
      $scope.facility_code = n.delete;
      site.showModal('#viewFacilityCodeModal');

    } else if (n.link.collection == 'safes') {
      $scope.safe = n.delete;
      site.showModal('#viewSafeModal');

    } else if (n.link.collection == 'amounts_in') {
      $scope.amount_in = n.delete;
      site.showModal('#viewAmountInModal');

    } else if (n.link.collection == 'amounts_out') {
      $scope.amount_out = n.delete;
      site.showModal('#viewAmountOutModal');

    } else if (n.link.collection == 'in_out_names') {
      $scope.in_out_name = n.delete;
      site.showModal('#viewInOutNameModal');

    } else if (n.link.collection == 'employees_insurances') {
      $scope.employee_insurance = n.delete;
      site.showModal('#viewEmployeeInsuranceModal');

    } else if (n.link.collection == 'employees_advances') {
      $scope.employees_advances = n.delete;
      site.showModal('#viewEmployeesAdvancesModal');

    } else if (n.link.collection == 'employee_discount') {
      $scope.employee_discount = n.delete;
      site.showModal('#viewEmployeeDiscountModal');

    } else if (n.link.collection == 'insurance_slide') {
      $scope.insurance_slide = n.delete;
      site.showModal('#viewInsuranceSlideModal');

    } else if (n.link.collection == 'employee_offer') {
      $scope.employee_offer = n.delete;
      site.showModal('#viewemployeeOfferModal');

    } else if (n.link.collection == 'employees_advances_fin') {
      $scope.employees_advances_fin = n.delete;
      site.showModal('#viewEmployeesAdvancesFinModal');

    } else if (n.link.collection == 'tenant') {
      $scope.tenant = n.delete;
      site.showModal('#tenantViewModal');
      document.querySelector('#tenantViewModal .tab-link').click();

    } else if (n.link.collection == 'book_hall') {
      $scope.book_hall = n.delete;
      site.showModal('#bookHallViewModal');

    } else if (n.link.collection == 'class_rooms') {
      $scope.class_rooms = n.delete;
      site.showModal('#classRoomsViewModal');

    } else if (n.link.collection == 'disease') {
      $scope.disease = n.delete;
      site.showModal('#diseaseViewModal');

    } else if (n.link.collection == 'medicine') {
      $scope.medicine = n.delete;
      site.showModal('#medicineViewModal');

    } else if (n.link.collection == 'attend_leave') {
      $scope.attend_leave = n.delete;
      site.showModal('#attendLeaveViewModal');

    } else if (n.link.collection == 'employee') {
      $scope.employee = n.delete;
      site.showModal('#employeeViewModal');
      document.querySelector('#employeeViewModal .tab-link').click();

    } else if (n.link.collection == 'employees_degrees') {
      $scope.employee_degree = n.delete;
      site.showModal('#viewEmployeeDegreeModal');

    } else if (n.link.collection == 'jobs') {
      $scope.jobs = n.delete;
      site.showModal('#jobsViewModal');

    } else if (n.link.collection == 'trainer') {
      $scope.trainer = n.delete;
      site.showModal('#trainerViewModal');
      document.querySelector('#trainerViewModal .tab-link').click();

    } else if (n.link.collection == 'goves') {
      $scope.gov = n.delete;
      site.showModal('#govViewModal');

    }  else if (n.link.collection == 'lecture') {
      $scope.lecture = n.delete;
      site.showModal('#lectureViewModal');

    } else if (n.link.collection == 'neighborhood') {
      $scope.neighborhood = n.delete;
      site.showModal('#neighborhoodViewModal');

    } else if (n.link.collection == 'area') {
      $scope.area = n.delete;
      site.showModal('#areaViewModal');

    } else if (n.link.collection == 'stores') {
      $scope.store = n.delete;
      site.showModal('#viewStoreModal');

    } else if (n.link.collection == 'discount_types') {
      $scope.discount_type = n.delete;
      site.showModal('#viewDiscountTypeModal');

    } else if (n.link.collection == 'tax_types') {
      $scope.tax_type = n.delete;
      site.showModal('#viewTaxTypeModal');

    } else if (n.link.collection == 'stores_in') {
      $scope.store_in = n.delete;
      site.showModal('#viewStoreInModal');

    } else if (n.link.collection == 'stores_items') {
      $scope.category_item = n.delete;
      site.showModal('#viewCategoryItemModal');

    } else if (n.link.collection == 'stores_out') {
      $scope.store_out = n.delete;
      site.showModal('#viewStoreOutModal');

    } else if (n.link.collection == 'vendors') {
      $scope.vendor = n.delete;
      site.showModal('#vendorDetailsModal');
      document.querySelector('#vendorDetailsModal .tab-link').click();

    } else if (n.link.collection == 'vendors_group') {
      $scope.vendor_group = n.delete;
      site.showModal('#vendorGroupDetailsModal');
      
    } else {
      site.showModal('#displayModal')
      $('#displayContent').html(site.toHtmlTable(n.delete));
    }

  };

  $scope.loadAll();
  $scope.loadUsers();
  $scope.loadSystem();

});