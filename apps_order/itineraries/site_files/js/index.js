app.controller("itineraries", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.itinerary = {};

  $scope.displayAddItinerary = function () {
    $scope.error = '';
    $scope.itinerary = {
      image_url: '/images/itinerary.png',
      date: new Date(),
      active: true
    };
    site.showModal('#itineraryAddModal');
  };

  $scope.addItinerary = function () {
    $scope.error = '';
    const v = site.validated('#itineraryAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.itinerary.date) > new Date()) {
      $scope.error = "##word.date_exceed##";
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/itineraries/add",
      data: $scope.itinerary
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itineraryAddModal');
          $scope.getItineraryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayUpdateItinerary = function (itinerary) {
    $scope.error = '';
    $scope.viewItinerary(itinerary);
    $scope.itinerary = {};
    site.showModal('#itineraryUpdateModal');
  };

  $scope.updateItinerary = function () {
    $scope.error = '';
    const v = site.validated('#itineraryUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }

    if (new Date($scope.itinerary.date) > new Date()) {
      $scope.error = "##word.date_exceed##";
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/itineraries/update",
      data: $scope.itinerary
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itineraryUpdateModal');
          site.hideModal('#itineraryViewModal');
          $scope.getItineraryList();
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDetailsItinerary = function (itinerary) {
    $scope.error = '';
    $scope.viewItinerary(itinerary);
    $scope.itinerary = {};
    site.showModal('#itineraryViewModal');
  };

  $scope.viewItinerary = function (itinerary) {
    $scope.busy = true;
    $scope.error = '';
    $http({
      method: "POST",
      url: "/api/itineraries/view",
      data: {
        id: itinerary.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.itinerary = response.data.doc;
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteItinerary = function (itinerary) {
    $scope.error = '';
    $scope.viewItinerary(itinerary);
    $scope.itinerary = {};
    site.showModal('#itineraryDeleteModal');
  };

  $scope.deleteItinerary = function () {
    $scope.busy = true;
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/itineraries/delete",
      data: {
        id: $scope.itinerary.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#itineraryDeleteModal');
          $scope.getItineraryList();
        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.getItineraryList = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/itineraries/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#itinerarySearchModal');
          $scope.search = {};

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }

    )

  };

  $scope.loadVendors = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/vendors/all",
      data: {
        select: {
          id: 1,
          name_ar: 1,
          name_en: 1,
          balance: 1,
          tax_identification_number: 1
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.vendorsList = response.data.list;
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

  $scope.loadDelegates = function () {
    $scope.busy = true;
    $scope.delegatesList = [];
    $http({
      method: "POST",
      url: "/api/delegates/all",
      data: {
        where: {
          active: true
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.delegatesList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.addItineraryList = function () {
    $scope.error = '';
    $scope.itinerary.itinerary_list = $scope.itinerary.itinerary_list || [];

    let obj = {};

    if ($scope.itinerary.customer && $scope.itinerary.customer.id) {

      obj.target_type = { ar: 'عميل', en: 'Customer' };
      obj.target = $scope.itinerary.customer;
      $scope.itinerary.customer = {};

    } else if ($scope.itinerary.vendor && $scope.itinerary.vendor.id) {

      obj.target_type = { ar: 'مورد', en: 'Vendor' };
      obj.target = $scope.itinerary.vendor;
      $scope.itinerary.vendor = {};

    };

    obj.status = 1;
    obj.required = $scope.itinerary.required;

    $scope.itinerary.required = '';

    $scope.itinerary.itinerary_list.unshift(obj);

  };

  $scope.targetDetails = function (obj) {
    $scope.error = '';
    $scope.target_details = obj;
    site.showModal('#itineraryTargetViewModal');

  };

  $scope.confirmEdit = function () {
    $scope.error = '';

    $http({
      method: "POST",
      url: "/api/itineraries/update",
      data: $scope.itinerary
    }).then(
      function (response) {
        if (response.data.done) {
          site.hideModal('#itineraryViewModal');
        } else {
          $scope.error = 'Please Login First';
        }
      },
      function (err) {
        console.log(err);
      }
    )

  };


  $scope.displaySearchModal = function () {
    $scope.error = '';
    site.showModal('#itinerarySearchModal');
  };

  $scope.searchAll = function () {

    $scope.getItineraryList($scope.search);
    site.hideModal('#itinerarySearchModal');
    $scope.search = {};
  };

  $scope.getItineraryList({ date: new Date() });
  $scope.loadDelegates();
  $scope.loadVendors();

});