app.controller("invoices", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.invoices = { payment_date: new Date() };

  $scope.displayAddInvoices = function () {
    $scope.error = '';
    $scope.invoices = {
      image_url: '/images/invoices.png',
      active: true/* ,
      immediate: false */

    };
    site.showModal('#invoicesAddModal');

  };

  $scope.addInvoices = function () {
    $scope.error = '';
    const v = site.validated('#invoicesAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/invoices/add",
      data: $scope.invoices
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#invoicesAddModal');
          $scope.getInvoicesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayPaymentInvoices = function (invoices) {
    $scope.error = '';
    $scope.current = invoices;
    $scope.current.payment_date = new Date();
    $scope.current.payment_paid_up = 0;
    $scope.current.payment_safe = {};

    site.showModal('#invoicesPaymentModal');
  };

  $scope.paymentInvoice = function () {
    $scope.error = '';

    if (!$scope.current.payment_safe.id) {
      $scope.error = "##word.should_select_safe##";
      return;
    };

    if (!$scope.current.payment_paid_up) {
      $scope.error = "##word.err_paid_up##";
      return;
    };

    $scope.current.remain_amount = $scope.current.remain_amount - $scope.current.payment_paid_up;

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/invoices/update",
      data: $scope.current
    }).then(
      function (response) {
        $scope.busy = false;

        if (response.data.done) {
          $scope.current.payment_list.push({
            paid_up: $scope.current.payment_paid_up,
            safe: $scope.current.payment_safe,
            date: $scope.current.payment_date,
          });
          $scope.getInvoicesList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsInvoices = function (invoices) {
    $scope.error = '';
    $scope.viewInvoices(invoices);
    $scope.invoices = {};
    site.showModal('#invoicesViewModal');
  };

  $scope.viewInvoices = function (invoices) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/invoices/view",
      data: {
        id: invoices.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.invoices = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteInvoices = function (invoices) {
    $scope.error = '';
    $scope.viewInvoices(invoices);
    $scope.invoices = {};
    site.showModal('#invoicesDeleteModal');
  };

  $scope.deleteInvoices = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/invoices/delete",
      data: {
        id: $scope.invoices.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#invoicesDeleteModal');
          $scope.getInvoicesList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  /*  $scope.getInvoicesGroupList = function (where) {
     $scope.busy = true;
     $scope.invoicesGroupList = [];
     $http({
       method: "POST",
       url: "/api/invoices_group/all",
       data: {
         where: where
       }
     }).then(
       function (response) {
         $scope.busy = false;
         if (response.data.done && response.data.list.length > 0) {
           $scope.invoicesGroupList = response.data.list;
         }
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
     )
   }; */
  /* 
    $scope.displayPaymentInvoices = function (invoices) {
      $scope.error = '';
      $scope.viewInvoices(invoices);
      invoices.payment_paid_up = 0;
      $scope.invoices.payment_date = new Date();
      site.showModal('#invoicesPaymentModal');
    }; */

  /*  $scope.paymentInvoice = function (invoices) {
     $scope.error = '';
 
   }; */

  $scope.getSafesList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/safes/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.safesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getInvoicesList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/invoices/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;

          $scope.count = response.data.count;
          site.hideModal('#invoicesSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#invoicesSearchModal');
  };

  $scope.searchAll = function () {
    $scope.getInvoicesList($scope.search);
    site.hideModal('#invoicesSearchModal');
    $scope.search = {};
  };

  $scope.getInvoicesList();
  $scope.getSafesList();
  /*   $scope.getInvoicesGroupList();
   */
});