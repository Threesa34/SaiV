angular.module('MyApp')
	.controller('DashboardController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Dashboard', function ($scope, $http, $route, $location, $window, $timeout, Upload, Dashboard) {
        

        $scope.dateOptionsFilters = {
            changeYear: true,
            changeMonth: true,
            yearRange:'2019:-0',
            };

        function formatDate(date){
           
            if(date)
            {
                var dd = new Date(date).getDate();
                var mm = new Date(date).getMonth()+1;
                var yy = new Date(date).getFullYear();
            }
        
            return yy+'/'+mm+'/'+dd;
    }


    $scope.checkuserSession = function()
        {
            $http.get("http://localhost:8029/api/checkuserSession")
            .then(function(response) {
              if(response.data.status == false)
                {
                  if(location.href != 'http://localhost:8029/#!/')
                     location.href = "http://localhost:8029"
                }
            });
        }
        $scope.checkuserSession();

        $scope.GetTotalOrderQty = function(freomDate, toDate)
        {
            Dashboard.GetTotalOrderQty().save([{from_dsDate:formatDate(freomDate),to_dsDate:formatDate(toDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.OrderQuantityList = response.OrderQuantityList;
            });
        }
        
        $scope.getDashboardValues = function(Date_from, date_to)
        {

            // if(Date_from ||  date_to)
            {
                if(Date_from)
                {
                    var from_dsDate =  Date_from;
                }
                else
                {
                    var from_dsDate =  new Date();
                }

                if(date_to)
                {
                    var to_dsDate =  date_to;
                }
                else
                {
                    var to_dsDate =  from_dsDate;
                }
            }

             $scope.GetTotalOrderQty(from_dsDate, to_dsDate);

            Dashboard.getDashboardValues().save([{from_dsDate:formatDate(from_dsDate),to_dsDate:formatDate(to_dsDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.dashboardValues = response.dashboardValues;
            });
        };

        $scope.SendNotifuication = function()
        {
            Dashboard.ExeNotification('sample User',"Sample message sent from device")
        }

    }]);

