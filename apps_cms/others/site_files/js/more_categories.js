app.controller('more_categories', function ($scope, $http, $timeout) {

  $scope.loadMainCategories = function () {
    $scope.error = '';
    $scope.busy = true;
    $scope.mainCategories = [];
    $http({
      method: 'POST',
      url: '/api/main_categories/all',
      data: {
        where: {
          status: 'active',
        },
        select: { id: 1, name_ar: 1, name_en: 1, top_parent_id: 1, parent_id: 1 ,parent_list_id : 1},
      },
    }).then(
      function (response) {
        $scope.busy = false;
        if (response.data.done) {
          $scope.list = response.data.list;
        }
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };
  $scope.displayCategory = function (category) {
    console.log(category);
  };
  $scope.loadMainCategories();
});
