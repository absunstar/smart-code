
let btn1 = document.querySelector('#numbering .tab-link');
if (btn1) {
  btn1.click();
}

app.controller("numbering", function ($scope, $http) {
  $scope._search = {};


  $scope.setCirculate = function (type) {

    let index = 0;

    if (type === 'main') index = 0;
    else if (type === 'inventory') index = 1;
    else if (type === 'accounting') index = 2;
    else if (type === 'general_setting') index = 3;
    else if (type === 'hr') index = 4;


    $scope.numbering.screens_list.forEach(_sl => {
      if ($scope.circulate.type_numbering && type === _sl.category) {
        _sl.type_numbering = $scope.circulate.type_numbering;

        if ($scope.circulate.type_numbering.id == 3) {

          _sl.first_value = $scope.circulate.first_value || 1;
          _sl.last_value = 0;
          _sl.length_level = $scope.circulate.length_level || 0;


        } else if ($scope.circulate.type_numbering.id == 1) {

          let y = new Date().getFullYear();

          _sl.years_list = [{
            year: y,
            first_value: $scope.circulate.first_value || 1,
            last_value: 0,
            length_level: $scope.circulate.length_level || 0
          }]

        } else if ($scope.circulate.type_numbering.id == 2) {

          let y = new Date().getFullYear();
          let m = new Date().getMonth() + 1;

          _sl.months_list = [{
            year: y,
            month: m,
            first_value: $scope.circulate.first_value || 1,
            last_value: 0,
            length_level: $scope.circulate.length_level || 0
          }]

        }
      }
    });
    $scope.circulate = {};
  };

  $scope.loadNumbering = function () {
    $http({
      method: "POST",
      url: "/api/numbering/get",
      data: {}
    }).then(
      function (response) {

        if (response.data.done) {
          $scope.numbering = response.data.doc;
        } else {
          $scope.numbering = {};
        }
      }
    )
  };

  $scope.addYearMonth = function (c) {


    if (c.type_numbering.id == 1) {


      c.years_list.unshift({
        year: c.years_list[0].year + 1,
        first_value: c.first_value || 1,
        last_value: 0,
        length_level: c.length_level || 0
      })

    } else if (c.type_numbering.id == 2) {

      if (c.months_list[0].month == 12) {
        c.months_list.unshift({
          year: c.months_list[0].year + 1,
          month: 1,
          first_value: c.first_value || 1,
          last_value: 0,
          length_level: c.length_level || 0
        })
      } else {
        c.months_list.unshift({
          year: c.months_list[0].year,
          month: c.months_list[0].month + 1,
          first_value: c.first_value || 1,
          last_value: 0,
          length_level: c.length_level || 0
        })
      }



    }

  };



  $scope.viewCurrentNumbering = function (c) {

    let y = new Date().getFullYear();
    let m = new Date().getMonth() + 1;

    if (!c.years_list && c.type_numbering.id == 1) {
      c.years_list = [{
        year: y,
        first_value: 1,
        last_value: 0,
        length_level: 0
      }]

    } else if (!c.months_list && c.type_numbering.id == 2) {
      c.months_list = [{
        year: y,
        month: m,
        first_value: 1,
        last_value: 0,
        length_level: 0
      }]
    }

    $scope.current_screen = c;
    site.showModal('#yearMonthModal');

  };

  $scope.typeNumberingList = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.typeNumberingList = [];
    $http({
      method: "POST",
      url: "/api/type_numbering/all"
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.typeNumberingList = response.data;
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.saveNumbering = function (where) {
    $scope.busy = true;
    $http({
      method: "POST",
      url: "/api/numbering/save",
      data: $scope.numbering
    }).then(
      function (response) {
        $scope.busy = false;
        if (!response.data.done) {
          $scope.error = response.data.error
        }

      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    )
  };

  $scope.loadNumbering();
  $scope.typeNumberingList();
});