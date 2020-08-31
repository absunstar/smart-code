app.controller("DB_import_export", function ($scope, $http) {


  $scope.export_file_amount_in = function () {

    window.location.href="/api/amounts_in/export_file_amount_in"
  };

  $scope.import_file_amount_in = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/amounts_in/import_file_amount_in",
      data: $scope.amount_in

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
    
    
  };

  $scope.export_file_amount_out = function () {
    window.location.href="/api/amounts_out/export_file_amount_out"
  };

  $scope.import_file_amount_out = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/amounts_out/import_file_amount_out",
      data: $scope.amount_out

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
    
    
  };

  $scope.export_file_safes = function () {
    window.location.href="/api/safes/export_file_safes"

  };

  $scope.import_file_safes = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/safes/import_file_safes",
      data: $scope.safes

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
    
    
  };

  $scope.export_file_in_out_names = function () {
    window.location.href="/api/in_out_names/export_file_in_out_names"
  };

  $scope.import_file_in_out_names = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/in_out_names/import_file_in_out_names",
      data: $scope.in_out_names

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
    
    
  };

  $scope.export_file_employee_offer = function () {
    window.location.href="/api/employee_offer/export_file_employee_offer"
  };

  $scope.import_file_employee_offer = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/employee_offer/import_file_employee_offer",
      data: $scope.employee_offer

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.export_file_employee_discount = function () {
    window.location.href="/api/employee_discount/export_file_employee_discount"
  };

  $scope.import_file_employee_discount = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/employee_discount/import_file_employee_discount",
      data: $scope.employee_discount

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

 
  $scope.export_file_employees_advances = function () {
    window.location.href="/api/employees_advances/export_file_employees_advances"
  };

  $scope.import_file_employees_advances = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/employees_advances/import_file_employees_advances",
      data: $scope.employees_advances

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
    
  $scope.export_file_employees_insurances = function () {
    window.location.href="/api/employees_insurances/export_file_employees_insurances"

  };

  $scope.import_file_employees_insurances = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/employees_insurances/import_file_employees_insurances",
      data: $scope.employees_insurances

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.export_file_insurances_slides = function () {

    window.location.href="/api/insurances_slides/export_file_insurances_slides"
  };

  $scope.import_file_insurances_slides = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/insurances_slides/import_file_insurances_slides",
      data: $scope.insurances_slides

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  
  $scope.export_file_customers = function () {

    window.location.href="/api/customers/export_file_customers"

  };

  $scope.import_file_customers = function () {
    $scope.error = '';
    

    $http({
      method: "POST",
      url: "/api/customers/import_file_customers",
      data: $scope.customers

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.export_file_stores = function () {

    window.location.href="/api/stores/export_file_stores"
  };

  $scope.import_file_stores = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores/import_file_stores",
      data: $scope.stores

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

 
  $scope.export_file_stores_in = function () {

    window.location.href="/api/stores_in/export_file_stores_in"
  };

  $scope.import_file_stores_in = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_in/import_file_stores_in",
      data: $scope.stores_in

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.export_file_stores_out = function () {

    window.location.href="/api/stores_out/export_file_stores_out"

  };

  $scope.import_file_stores_out = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_out/import_file_stores_out",
      data: $scope.stores_out

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };   

  $scope.export_file_stores_items = function () {

    window.location.href="/api/stores_items/export_file_stores_items"

  };

  $scope.import_file_stores_items = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/stores_items/import_file_stores_items",
      data: $scope.stores_items

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };   

  $scope.export_file_transfer_branch = function () {

    window.location.href="/api/transfer_branch/export_file_transfer_branch"

  };

  $scope.import_file_transfer_branch = function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/transfer_branch/import_file_transfer_branch",
      data: $scope.transfer_branch

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };   


  $scope.export_file_tax_types = function () {

    window.location.href="/api/tax_types/export_file_tax_types"
  };

  $scope.import_file_tax_types= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/tax_types/import_file_tax_types",
      data: $scope.tax_types

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.export_file_discount_types = function () {

    window.location.href="/api/discount_types/export_file_discount_types"
  };

  $scope.import_file_discount_types= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/discount_types/import_file_discount_types",
      data: $scope.discount_types

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  
 
  
  $scope.export_file_goves = function () {

    window.location.href="/api/goves/export_file_goves"
  };

  $scope.import_file_goves= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/goves/import_file_goves",
      data: $scope.goves

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
   
  $scope.export_file_cities = function () {

    window.location.href="/api/cities/export_file_cities"
  };

  $scope.import_file_cities= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/cities/import_file_cities",
      data: $scope.cities

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.export_file_vendors = function () {

    window.location.href="/api/vendors/export_file_vendors"
  };

  $scope.import_file_vendors= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/vendors/import_file_vendors",
      data: $scope.vendors

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.vendors) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };



  $scope.export_file_employees = function () {

    window.location.href="/api/employees/export_file_employees"
  };

  $scope.import_file_employees= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/employees/import_file_employees",
      data: $scope.employees

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.employees) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };


  $scope.export_file_jobs = function () {

    window.location.href="/api/jobs/export_file_jobs"
  };

  $scope.import_file_jobs= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/employees/import_file_jobs",
      data: $scope.jobs

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.jobs) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  
  $scope.export_file_employees_degrees = function () {

    window.location.href="/api/employees_degrees/export_file_employees_degrees"
  };

  $scope.import_file_employees_degrees= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/employees_degrees/import_file_employees_degrees",
      data: $scope.employees_degrees

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.jobs) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
 
  $scope.export_file_militaries_status = function () {

    window.location.href="/api/militaries_status/export_file_militaries_status"
  };

  $scope.import_file_militaries_status= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/militaries_status/import_file_militaries_status",
      data: $scope.militaries_status

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.jobs) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };
  
  $scope.export_file_maritals_status = function () {

    window.location.href="/api/maritals_status/export_file_maritals_status"
  };

  $scope.import_file_maritals_status= function () {
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/maritals_status/import_file_maritals_status",
      data: $scope.maritals_status

    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.maritals_status) {
         loadAll()
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  
});