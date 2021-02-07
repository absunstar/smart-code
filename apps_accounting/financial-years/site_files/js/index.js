app.controller("financial_years", function ($scope, $http, $timeout) {
  $scope._search = {};

  $scope.financial_year = {};

  $scope.displayAddFinancialYear = function () {
    if ($scope.busy) {
      return
    };

    $scope.error = '';
    $scope._search = {};
    $scope.edit = true;
    $scope.financial_year = {
      image_url: '/images/financial_years.png',
      accounting_period_list: [{}],
      active: true,
      status: $scope.yearStatusList[0],
      period: 12,
      period_start: {
        date: new Date()
      }
    };

    if ($scope.count > 0) {
      let last_index = $scope.list.length - 1;


      if ($scope.list[last_index] && $scope.list[last_index].period_end) {
        let end_month = $scope.list[last_index].period_end.month + 1;
        let last_year = $scope.list[last_index].period_end.year;
        let last_day = new Date(last_year, end_month - 1, +1).getDate();

        $scope.financial_year.period_start.date = new Date(last_year, end_month, last_day);
        /*$scope.financial_year.period_start = {
          day: last_day,
          month: end_month,
          year: last_year
        };*/

      }
    }


    site.showModal('#financialYearAddModal');
  };

  $scope.addFinancialYear = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    const v = site.validated('#financialYearAddModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    };

    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/financial_years/add",
      data: $scope.financial_year
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#financialYearAddModal');
          $scope.list.push(response.data.doc);
        } else {
          $scope.error = '##word.code_already_exisit##';
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };


  $scope.allowClose5 = function (index) {
    let out = false;

    if ($scope.list && $scope.list.length > 0) {
      if ($scope.list[index + 1]) {
        out = $scope.list[index + 1].status.id == 2 ? false : true;
      }

    }
    return out;
  };


  $scope.displayUpdateFinancialYear = function (financial_year, index) {


    if ($scope.busy) {
      return
    };

    $scope.error = '';
    $scope._search = {};


    $scope.viewFinancialYear(financial_year, index);

    $scope.financial_year = {};


    site.showModal('#financialYearUpdateModal');
  };

  $scope.updateFinancialYear = function () {
    $scope.error = '';
    if ($scope.busy) {
      return;
    }
    const v = site.validated('#financialYearUpdateModal');
    if (!v.ok) {
      $scope.error = v.messages[0].ar;
      return;
    }
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/financial_years/update",
      data: $scope.financial_year
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#financialYearUpdateModal');
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

  $scope.displayViewFinancialYear = function (financial_year) {
    $scope.error = '';
    $scope.viewFinancialYear(financial_year, null);
    $scope.financial_year = {};
    site.showModal('#financialYearDetailsModal');
  };

  $scope.viewFinancialYear = function (financial_year, index) {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/financial_years/view",
      data: {
        id: financial_year.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          response.data.doc.date = new Date(response.data.doc.date);
          $scope.financial_year = response.data.doc;

          if ($scope.financial_year.accounting_period_list && $scope.financial_year.accounting_period_list[0] && index) {

            $scope.financial_year.accounting_period_list[0].showButtonClose = $scope.allowClose5(index);

            $scope.financial_year.accounting_period_list.forEach((itm, i) => {
              if (itm.showButton) {
                $scope.financial_year.accounting_period_list[i - 1].showButtonClose = true
              }
            });
          }

        } else {
          $scope.error = response.data.error;
        }
      },
      function (err) {
        console.log(err);
      }
    )
  };

  $scope.displayDeleteFinancialYear = function (financial_year) {
    $scope.error = '';
    $scope.viewFinancialYear(financial_year, null);
    $scope.financial_year = {};
    site.showModal('#financialYearDeleteModal');
  };

  $scope.deleteFinancialYear = function () {
    $scope.error = '';
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/financial_years/delete",
      data: {
        id: $scope.financial_year.id
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          site.hideModal('#financialYearDeleteModal');
          $scope.list.forEach((b, i) => {
            if (b.id == response.data.doc.id) {
              $scope.list.splice(i, 1);
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

  $scope.getFinancialYears = function (where) {
    $scope.error = '';
    $scope.busy = true;
    $scope.list = [];
    $scope.count = 0;

    $http({
      method: "POST",
      url: "/api/financial_years/all",
      data: {
        where: where
      }
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done && response.data.list.length > 0) {
          $scope.list = response.data.list;
          $scope.count = response.data.count;
          site.hideModal('#FinancialYearSearchModal');
          $scope.search = {};
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )

  };

  $scope.getFinancialYearsStatus = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.yearStatusList = [];
    $http({
      method: "POST",
      url: "/api/years_status/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.yearStatusList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.addFinancialYearsIntervals = function () {
    if ($scope.financial_year.period && $scope.financial_year.period_start) {
      let end_month = $scope.financial_year.period_start.date.getMonth() + $scope.financial_year.period - 1;
      let last_year = $scope.financial_year.period_start.date.getFullYear();
      let last_day = new Date(last_year, end_month + 1, -1).getDate() + 1;
      $scope.financial_year.period_end = {
        date: new Date(last_year, end_month, last_day)
      };
    }

    if ($scope.financial_year.period > 0) {
      from_month = $scope.financial_year.period_start.date.getMonth();
      to_month = $scope.financial_year.period_end.date.getMonth();
      m = to_month - from_month;
      let month_count = m + 1;

      month_count = month_count || 12;

      let peroid_month = parseInt(month_count / $scope.financial_year.period);

      let start_date = $scope.financial_year.period_start.date || new Date();
      let end_date = $scope.financial_year.period_start.date || new Date();
      let r_end_date = $scope.financial_year.period_end.date || new Date();

      $scope.financial_year.accounting_period_list = [];
      for (let i = 0; i < $scope.financial_year.period; i++) {

        start_date = start_date || $scope.financial_year.period_start.date;
        end_date = new Date(start_date.toString());
        end_date.setMonth(end_date.getMonth() + peroid_month - 1);
        end_date.setDate(new Date(end_date.getFullYear(), end_date.getMonth() + 1, -1).getDate() + 1);

        if (i === $scope.financial_year.period - 1) {
          end_date = r_end_date;
        }

        $scope.financial_year.accounting_period_list.push({
          code: new Date(start_date).getFullYear().toString() + ' - ' + site.toNumber(new Date(start_date).getMonth() +1 ) ,
          start: {
            date: start_date
          },
          end: {
            date: end_date
          },
          status: $scope.yearStatusList[0],
          showButton: false,
          showButtonUp: false,
          showButtonClose: false,
        });

        start_date = new Date(end_date);
        start_date.setDate(1);
        start_date.setMonth(start_date.getMonth() + 1);
      };
      let _op = false
      $scope.financial_year.accounting_period_list.forEach(item => {
        item.showButton = false;
        if (_op) {
          return;
        }
        if (item.status == $scope.yearStatusList[0]) {
          item.showButton = true;
          _op = true;

        }
      });
    }
  };

  $scope.allowClose = function () {
    let out = true;

    if ($scope.list && $scope.list.length > 0) {
      if ($scope.financial_year.id) {
        let old_year = $scope.list.filter(y => y.id == $scope.financial_year.id);
        if (old_year && old_year.status === $scope.yearStatusList[1]) {
          $scope.financial_year.accounting_period_list.forEach(p => {
            p.showButtonClose = false;
          })
          out = false
        }

      } else {
        let old_year = $scope.list[0];
        if (old_year && old_year.status === $scope.yearStatusList[1]) {
          $scope.financial_year.accounting_period_list.forEach(p => {
            p.showButtonClose = false;
          })
          out = false
        }
      }
    }
    return out;

  };

  $scope.allowClose2 = function () {
    let out = true;

    if ($scope.list && $scope.list.length > 0) {

      out = $scope.list[0].status.id == 2 ? false : true;

    }

    return out;
  };

  $scope.openPeriod = function (index) {

    $scope.last = $scope.financial_year.period - 1;

    if ($scope.financial_year.accounting_period_list[index].status != $scope.yearStatusList[1]) {
      $scope.financial_year.accounting_period_list[index].status = $scope.yearStatusList[1];
    };

    if ($scope.financial_year.accounting_period_list[index].status == $scope.yearStatusList[1]) {
      $scope.financial_year.accounting_period_list[index].showButton = false;
      if ($scope.financial_year.accounting_period_list[index + 1]) {
        $scope.financial_year.accounting_period_list[index + 1].showButton = true;
      }

    };

    let _close = false
    $scope.financial_year.accounting_period_list.forEach(item => {
      item.showButtonClose = false;
      if (item.status == $scope.yearStatusList[1]) {
        if (_close) {
          return;
        }
        item.showButtonClose = true;
        _close = true;
      }

    });

    if ($scope.edit) {
      $scope.allowClose2();
      $scope.financial_year.accounting_period_list[0].showButtonClose = $scope.allowClose2();
    }






    $scope.changeStatus();
  };

  $scope.openPeriodUp = function (index) {

    if ($scope.financial_year.accounting_period_list[index].status != $scope.yearStatusList[1]) {
      $scope.financial_year.accounting_period_list[index].status = $scope.yearStatusList[1];
    };

    let _close = false
    $scope.financial_year.accounting_period_list.forEach(item => {
      item.showButtonClose = false;
      if (item.status == $scope.yearStatusList[1]) {
        if (_close) {
          return;
        }
        item.showButtonClose = true;
        _close = true;
      }

    });

    let _index = 0;
    $scope.financial_year.accounting_period_list.forEach((item, index) => {
      item.showButtonUp = false;
      if (item.status == $scope.yearStatusList[2]) {
        _index = index;
      }

    });

    $scope.financial_year.accounting_period_list[_index].showButtonUp = true;

    $scope.changeStatus();

  };

  $scope.closePeriod = function (index) {

    let p = $scope.financial_year.accounting_period_list[index];

    if (p.status != $scope.yearStatusList[2]) {
      p.status = $scope.yearStatusList[2];
    };

    let _close = false
    $scope.financial_year.accounting_period_list.forEach(item => {
      item.showButtonClose = false;
      if (item.status == $scope.yearStatusList[1]) {
        if (_close) {
          return;
        }
        item.showButtonClose = true;
        _close = true;
      }

    });

    let _index = 0;
    $scope.financial_year.accounting_period_list.forEach((item, index) => {
      item.showButtonUp = false;
      if (item.status == $scope.yearStatusList[2]) {
        _index = index;
      }

    });

    $scope.financial_year.accounting_period_list[_index].showButtonUp = true;

    $scope.changeStatus();

  };


  $scope.changeStatus = function () {

    let is_all_close = true;
    let is_pending = false;
    let is_any_open = false;

    $scope.financial_year.accounting_period_list.forEach(acc => {
      if (acc.status == $scope.yearStatusList[1]) {
        is_any_open = true;
        is_all_close = false;
      } else if (acc.status == $scope.yearStatusList[0]) {
        is_all_close = false;

      } else if (acc.status == $scope.yearStatusList[2]) {

      }

    });

    if (is_any_open) {
      $scope.financial_year.status = $scope.yearStatusList[1]
    };

    if (is_all_close) {
      $scope.financial_year.status = $scope.yearStatusList[2]
    };

  };

  $scope.searchAll = function () {
    $scope.getFinancialYears($scope.search);
    site.hideModal('#FinancialYearSearchModal');
    $scope.search = {}
  };

  $scope.getFinancialYears();
  $scope.getFinancialYearsStatus();





  /*
    
    $scope.test = function () {
      $scope.busy = true;
      $scope.error = '';
      $http({
        method: "POST",
        url: "/api/financial_years/is_allowed_date",
        data: {
          date: new Date('2019-03-11 22:00:00.000Z')
        }
      }).then(
        function (response) {
          $scope.busy = false;
          if (response.data.done) {
            $scope.gov = response.data.doc;
          } else {
            $scope.error = response.data.error;
          }
        },
        function (err) {
          console.log(err);
        }
      )
    };
  
  
    $scope.test();
  */

  /* site.is_allowed_date({date:  $scope.check_return.period_start.date},(err, response)=>{
     // true or false
   }) */



});