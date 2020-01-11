app.controller("report_trainer_courses", function ($scope, $http) {

  var Search = function () {
    return {
      trainer: {},
      date: new Date()
    }
  };

  $scope.report = {};

  $scope.search = new Search();

  $scope.showSearch = function () {
    site.showModal('#searchModal');
    $scope.report.trainer_list = [];
  };

  $scope.searchAll = function () {

    $scope.trainer = $scope.search.trainer;
    $scope.getAccountCourseList($scope.search.trainer);

    site.hideModal('#searchModal');
    $scope.clearAll();
  };

  $scope.clearAll = function () {
    $scope.search = new Search();
  };

  $scope.gettrainerList = function () {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/trainer/all",
      data: {}
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.trainersList = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.getAccountCourseList = function (trainer) {

    $scope.report = {
      date: $scope.search.date,
    };

    $scope.busy = true;

    $http({
      method: "POST",
      url: "/api/account_course/trainer_report",
      data: {
        where: {
          'dates_list.trainer.id': trainer.id
        }
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.bookList = response.data.list;

          $scope.report.trainer_list = $scope.report.trainer_list || [];

          $scope.report.total_payment = 0;
          $scope.report.total_paid = 0;
          $scope.report.rest = 0;

          $scope.bookList.forEach(b => {

            let report_account = 0;

            b.dates_list.forEach(d => {

              if (d.trainer.id == trainer.id) {

                report_account += d.account_lectures || 0;
              }

            });

            b.paid_list = b.paid_list || [];
            let report_bayment = 0;

            b.paid_list.forEach(p => {

              if (p.trainer_paid.id == trainer.id) {
                report_bayment += p.payment || 0;
              }
            });

            let rest = 0;
            rest = report_account - report_bayment || 0;

            $scope.report.trainer_list.push({
              course: b.course.name,
              date_from: b.date_from,
              date_to: b.date_to,
              payment: report_bayment,
              price: report_account,
              rest: rest
            })


            $scope.report.total_payment += report_account;
            $scope.report.total_paid += report_bayment;
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

  $scope.gettrainerList();

});