app.controller("pdfView", function ($scope, $http, $timeout) {
  $scope.baseURL = "";
  $scope.appName = "pdfView";
  $scope.modalID = "#pdfViewManageModal";
  $scope.modalSearchID = "#pdfViewSearchModal";
  $scope.mode = "add";
  $scope._search = {};
  $scope.structure = {
    image: {},
    active: true,
  };
  $scope.item = {};
  $scope.list = [];

  $scope.getAll = function (where) {
    $scope.busy = true;
    $scope.list = [];
    $http({
      method: "POST",
      url: `${$scope.baseURL}/api/${$scope.appName}/all`,
      data: {
        where: where,
      },
    }).then(
      function (response) {
        $scope.busy = false;
        $scope.file = response.data.file;
        console.log($scope.file);
        setTimeout(() => {
          let embed = document.querySelector('#file_1');
    
          if (embed) {
            embed.setAttribute(
              'src',
              `data:<%= ${$scope.file.type} %>;base64,<%= ${$scope.file.data.toString('base64')} %>`
            );
          }
          console.log(embed);
          
        }, 1000 *3);
      },
      function (err) {
        $scope.busy = false;
        $scope.error = err;
      }
    );
  };

  $scope.getAll();
});
