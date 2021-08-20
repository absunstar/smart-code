let btn1 = document.querySelector('#doctors_visits .tab-link');
if (btn1) {
  btn1.click();
}
app.controller("patients_files", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.patients_files = {};

  $scope.displayDetails = function (customer) {
    $scope.busy = true;
    $scope.error = "";

    $http({
      method: "POST",
      url: "/api/patients_tickets/display_data",
      data: {
        type: "patient_file",
        where: { customer: customer },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.patients_files = response.data.cb;
      },
      function (err) {
        console.log(err);
      }
    );
  };

  $scope.getPatientList = function (ev) {
    $scope.busy = true;

    if (ev.which !== 13) {
      return;
    }

    $scope.customersList = [];
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        search: $scope.patient_search,
        select: {},
      },
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
    );
  };

  $scope.displayDetailsDoctorsVisits = function (visitId) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: "/api/doctors_visits/all",
      data: {
        where: { id: visitId },
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.doctors_visits = response.data.list[0];
          $scope.doctors_visits.$view = true;
          site.showModal("#doctorsVisitsViewModal");
          document.querySelector("#doctorsVisitsViewModal .tab-link").click();
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
});
