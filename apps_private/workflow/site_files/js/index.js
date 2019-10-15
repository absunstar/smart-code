app.controller('workflowController', function ($scope, $http, $timeout) {

    $scope.names = [];
    for (let i = 0; i < 10; i++) {
        $scope.names.push({
            id: i,
            name: 'name ' + i
        });
    }

    $scope.log = function (m) {
        console.log(m);
    };

    $scope.propertyName = 'date';
    $scope.reverse = true;

    $scope.sortBy = function (propertyName) {
        $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
        $scope.propertyName = propertyName;
    };

    $scope.displayAddWorkflow = function () {
        site.showModal('#workflowAddModal');
    };

    $scope.addWorkflow = function () {

    };


    $scope.displayUpdateWorkflow = function () {

    };

    $scope.updateWorkflow = function () {

    };


    $scope.displayDeleteWorkflow = function () {

    };

    $scope.deleteWorkflow = function () {

    };



    $scope.getWorkflowList = function () {
        $http({        
            method: 'POST',
                    url:   '/api/workflow/all'
        }).then(function  (response)  {        
            $scope.workflowList = response.data;  
        });
    };







    $scope.getWorkflowList();


});