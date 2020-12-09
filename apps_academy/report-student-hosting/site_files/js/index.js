app.controller("report_student_hosting", function ($scope, $http) {

  var Search = function () {
    return {
      customer: {},
      date: new Date()
    }
  };

  $scope.report = {};

  $scope.search = new Search();

  $scope.showSearch = function () {
    site.showModal('#searchModal');
    $scope.report.student_list = [];
  };

  $scope.searchAll = function () {

    $scope.customer = $scope.search.customer;
    $scope.getTicketList($scope.search.customer);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.getStudentList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/customers/all",
      data: {
        where:{
          active: true
        }}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.studentsList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getTicketList = function (customer) {

    $scope.report = {
      date: $scope.search.date,
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/hosting/student_hosting_report",
      data: {
        where: {
          'student_list.customer.id': customer.id,
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.bookList = response.data.list;
          $scope.report.student_list = $scope.report.student_list || [];
          $scope.report.total_payment = 0;
          $scope.report.total_paid = 0;
          $scope.report.rest = 0;

          $scope.bookList.forEach(b => {

            let price = 0;
            b.student_list.forEach(s => {

              if (s.customer.id == customer.id) {

                price = s.price || 0;
              }

            });

            let payment = 0;

            b.paid_list.forEach(p => {

              if (p.student_paid.id == customer.id) {

                payment += p.payment || 0;
              }

            });

            let rest = 0;

            rest = price - payment;

            $scope.report.student_list.push({
              type: b.type.ar,
              date: b.date,
              employee : b.employee.name,
              classroom: b.classroom.name,
              price: price,
              payment: payment,
              rest: rest
            })


            $scope.report.total_payment += price;
            $scope.report.total_paid += payment;
            $scope.report.rest = $scope.report.total_payment - $scope.report.total_paid;

          });

        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getStudentList();

});