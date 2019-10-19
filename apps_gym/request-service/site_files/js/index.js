app.controller("request_service", function ($scope, $http, $timeout) {

  $scope.request_service = {};

  $scope.displayAddRequestService = function () {
    $scope.error = '';
    $scope.discount = {};
    $scope.request_service = {
      image_url: '/images/request_service.png',
      active: true,
      service_count: 1
      /* capaneighborhood : " - طالب", */
/*       immediate: false
 */    };
    site.showModal('#requestServiceAddModal');
  };

  $scope.addRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceAddModal');

    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/add",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceAddModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceUpdateModal');
  };

  $scope.updateRequestService = function () {
    $scope.error = '';
    const v = site.validated('#requestServiceUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/update",
      data: $scope.request_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceUpdateModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.updateAttendService = function (attend_service) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/request_service/update",
      data: attend_service
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#attendServiceModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.displayDetailsRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceViewModal');
  };

  $scope.viewRequestService = function (request_service) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/request_service/view",
      data: {
        id: request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.request_service = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteRequestService = function (request_service) {
    $scope.error = '';
    $scope.viewRequestService(request_service);
    $scope.request_service = {};
    site.showModal('#requestServiceDeleteModal');

  };

  $scope.deleteRequestService = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/request_service/delete",
      data: {
        id: $scope.request_service.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#requestServiceDeleteModal');
          $scope.getRequestServiceList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getRequestServiceList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/request_service/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#requestServiceSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getCustomerList = function (ev) {
    $scope.error = '';
    $scope.busy = true;
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/customers/all",
        data: {
          search: $scope.search_customer
          /*  select: {
            id: 1,
            name_ar: 1,
            name_en: 1,
          } */
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done && response.data.list.length > 0) {
            $scope.customersList = response.data.list;
          }
        },
        function (err) {
          $scope.busy = false;
          $scope.error = err;
        }
      )
    };
  };

  $scope.getService = function (ev) {
    $scope.error = '';
    if (ev.which === 13) {
      $http({
        method: "POST",
        url: "/api/service/all",
        data: {
          where: { name: $scope.search_service },
          select: { id: 1, name: 1, services_price: 1, selectedServicesList: 1, attend_count: 1, available_period: 1, complex_service: 1 }
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            if (response.data.list.length > 0) {
              $scope.servicesList = response.data.list;
            }
          }
        },
        function (err) {
          console.log(err);
        }
      );
    }
  };

  $scope.getHallList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/hall/all",
      data: {
        select: { id: 1, name: 1, capaneighborhood: 1 }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.hallsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/employees/all",
      data: {
        where: {
          'job.trainer': true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.trainersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadDiscountTypes = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/discount_types/all",
      data: {
        select: {
          id: 1,
          name: 1,
          value: 1,
          type: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.discount_types = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  /*  $scope.getPeriod = function () {
     $scope.busy = true;
     $scope.periodList = [];
     $http({
       method: "POST",
       url: "/api/period_class/all"
 
     }).then(
       function (response) {
         $scope.busy = false;
         $scope.periodList = response.data;
       },
       function (err) {
         $scope.busy = false;
         $scope.error = err;
       }
     )
   }; */

  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#requestServiceSearchModal');
  };

  $scope.changeService = function (request_service) {
    request_service.service_name = $scope.service.name;
    request_service.selectedServicesList = $scope.service.selectedServicesList;
    request_service.attend_count = $scope.service.attend_count || null;
    request_service.available_period = $scope.service.available_period || 0;
    request_service.services_price = $scope.service.services_price || 0;
    $scope.service = {};
  };

  $scope.startDateToDay = function () {
    $scope.request_service.date_from = new Date();
  };

  $scope.attendNow = function (s) {
    $scope.attend_service.attend_service_list = $scope.attend_service.attend_service_list || [];

    $scope.attend_service.attend_service_list.unshift({
      id: s.id,
      name: s.name || $scope.attend_service.service_name,
      attend_date: new Date(),
      attend_time: {
        hour: new Date().getHours(),
        minute: new Date().getMinutes()
      }
    })
  };

  $scope.leaveNow = function (s) {
    s.leave_date = new Date();
    s.leave_time = {
      hour: new Date().getHours(),
      minute: new Date().getMinutes()
    };
  };

  $scope.showAttendServices = function (service) {

    $scope.attend_service = service;

    if ($scope.attend_service.selectedServicesList && $scope.attend_service.selectedServicesList.length > 0) {

      

    } else {

    }

    $scope.attend_service.selectedServicesList.forEach(attend_service => {
      if ($scope.attend_service.attend_service_list && $scope.attend_service.attend_service_list.length > 0) {
        attend_service.total_attend_count = attend_service.total_attend_count * service.service_count
        attend_service.current_ttendance = $scope.attend_service.attend_service_list.length;
      } else attend_service.current_ttendance = 0;

      attend_service.remain = attend_service.total_attend_count - attend_service.current_ttendance || 0;
    });

    $scope.attend_service.attend_service_list = $scope.attend_service.attend_service_list || [];

    site.showModal('#attendServiceModal');

  };

  $scope.addDiscount = function () {
    $scope.error = '';
    if (!$scope.discount.value) {

      $scope.error = '##word.error_discount##';
      return;
    } else {
      $scope.discount.type = 'number';

      $scope.request_service.discountes = $scope.request_service.discountes || [];
      $scope.request_service.discountes.push({
        name: $scope.discount.name,
        value: $scope.discount.value,
        type: $scope.discount.type
      });

    };
  };

  $scope.calc = function () {
    $scope.error = '';
    $timeout(() => {
      $scope.request_service.total_discount = 0;
      $scope.request_service.paid_require = Number($scope.request_service.services_price);
      if ($scope.request_service.discountes && $scope.request_service.discountes.length > 0) {
        $scope.request_service.discountes.forEach(ds => {
          if (ds.type === "percent") {
            $scope.request_service.total_discount * parseFloat(ds.value) / 100;
          } else {
            $scope.request_service.total_discount += parseFloat(ds.value);
          };
        });
      };
      $scope.request_service.paid_require = (Number($scope.request_service.services_price) * Number($scope.request_service.service_count || 1)) - $scope.request_service.total_discount;
    }, 200);
  };


  $scope.deleteDiscount = function (_ds) {
    $scope.request_service.discountes.splice($scope.request_service.discountes.indexOf(_ds), 1);
  };


  $scope.searchAll = function () {
    $scope.getRequestServiceList($scope.search);
    site.hideModal('#requestServiceSearchModal');
    $scope.search = {};

  };

  $scope.getRequestServiceList();
  /*   $scope.getPeriod();
   */
  $scope.getHallList();
  $scope.getTrainerList();
  $scope.loadDiscountTypes();
});