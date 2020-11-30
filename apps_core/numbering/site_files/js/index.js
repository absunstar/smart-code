
let btn1 = document.querySelector('#numbering .tab-link');
if (btn1) {
  btn1.click();
}

app.controller("default_setting", function ($scope, $http) {
  $scope._search = {};


  $scope.setCirculate = function (type) {

    let index = 0;

    if (type === 'main') index = 0;
    else if (type === 'inventory') index = 1;
    else if (type === 'accounting') index = 2;
    else if (type === 'general') index = 3;
    else if (type === 'employees') index = 4;


    $scope.numbering.modules_list[index].screens_list.forEach(_ml => {

      _ml.type_numbering = $scope.numbering.modules_list[index].type_numbering;
      _ml.first_value = $scope.numbering.modules_list[index].first_value;
      _ml.last_value = 0;
      _ml.length_level = $scope.numbering.modules_list[index].length_level;
    });

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