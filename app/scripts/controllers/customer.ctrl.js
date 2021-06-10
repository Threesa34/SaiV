angular.module('MyApp')
	.controller('CustomerController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Customer', 'Entity', function ($scope, $http, $route, $location, $window, $timeout, Customer, Entity) {

        $scope.userRoles = [{title:"Staff", value:"customer"},{title:"Admin", value:"customer_admin"}]
        $scope.CustomerDetails = [];
        $scope.CustomerTypes = function()
        {
                 Customer.CustomerTypes().query().$promise.then(function (response) {
                    $scope.customer_type = response;
                });      
        };


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

       

        
        $scope.productTypes = function()
        {
               
                Entity.productTypes().query().$promise.then(function (response) {
                    $scope.product_type = response;
                    $scope.Products_Type = [];
                    $scope.product_type.map(function(value){
                        $scope.Products_Type.push({title:value,value:value})
                    });
                });
               
        };

     $scope.getUserRole = function(role)
     {
        var roleexist = $scope.userRoles.filter(function(val){
            return val.value == role;
        });
        if(roleexist != undefined && roleexist.length > 0)
        {
            return roleexist[0].title;
        }
        else
        {
            return role;
        }
     }

       

        $scope.getCustomerList = function()
        {
                 Customer.getCustomerList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.CustomersList = response.customerList;
                });      
        };

        $scope.deleteCustomerDetails = function(id)
        {

            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then(function(result) {
                if (result.value) {
                    Customer.deleteCustomerDetails().query({ id: id}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function(){
                        $scope.getCustomerList();
                      })
                    });
                  }
                });
        };

        $scope.VerifyCustomerContacts = function()
        {
            if($scope.CustomerDetails[0].email && $scope.CustomerDetails[0].email != '' && $scope.CustomerDetails[0].email != null)
            {
                Customer.VerifyCustomerEmail().save($scope.CustomerDetails[0]).$promise.then(function(response){
                    if(response.result[0].emailexist > 0)
                    {
                        $scope.emailexist = "Email ID already exist in record";
                    }
                    else
                    {
                        $scope.emailexist = undefined;  
                    }
                });
            }

            if($scope.CustomerDetails[0].mobile && $scope.CustomerDetails[0].mobile != '' && $scope.CustomerDetails[0].mobile != 0 && $scope.CustomerDetails[0].mobile != null)
            {
                Customer.VerifyCustomerMobile().save($scope.CustomerDetails[0]).$promise.then(function(response){
                    if(response.result[0].mobileexist > 0)
                    {
                        $scope.mobileexist = "Mobile already exist in record";
                    }
                    else
                    {
                        $scope.mobileexist = undefined;
                    }
                });
            }
        };


        $scope.getCustomerDetails = function(customerdetails)
        {
            $scope.CustomerDetails = [];
            
            $scope.CustomerDetails.push(customerdetails);
            
            $scope.allowProductTypes = JSON.parse($scope.CustomerDetails[0].allowprdtypes);
            $scope._product_Types = $scope.allowProductTypes;
            
            $scope.Products_Type.map(function(value){
                if($scope.allowProductTypes != null)
                $scope.allowProductTypes.map(function(existval){
                    if(existval == value.value)
                    {
                        value.inStatus = true  
                    }
                })
            });

            if($scope._product_Types == null)
            {
                $scope._product_Types = [];
            }
        };

        $scope._product_Types = [];
        $scope.SetAllowProductType = function(productType)
        {
            if($scope._product_Types.length <= 0)
            {
                $scope._product_Types.push(productType.value);
                productType.inStatus = true;
            }
            else
            {
                var typeExist = $scope._product_Types.filter(function(value)
                {
                    return value == productType.value;
                });
                if(typeExist.length > 0)
                {
                    $scope._product_Types.splice($scope._product_Types.indexOf(productType.value), 1);
                    productType.inStatus = false;
                }
                else
                {
                    $scope._product_Types.push(productType.value);
                    productType.inStatus = true;
                }
            }
        }

        $scope.SaveCustomerDetails = function()
        {

            $scope.CustomerDetails[0]['allowprdtypes'] = JSON.stringify($scope._product_Types);
            Customer.SaveCustomerDetails().save($scope.CustomerDetails[0]).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                  }).then(function() {
                    $scope.getCustomerList();
                    if(response.status == 0)
                    {
                        $scope.CustomerDetails = [];
                        $scope._product_Types = [];
                    }
                  })
            });
        };




        $scope.getVendorList = function()
        {
                 Customer.getVendorList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.VendorsList = response.vendorsList;
                });      
        };


        $scope.getVendorDetails = function(vendordetails)
        {
            $scope.VendorDetails = [];
            $scope.VendorDetails.push(vendordetails);
        };



        $scope.deleteVendorDetails = function(id)
        {

            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then(function(result) {
                if (result.value) {
                    Customer.deleteVendorDetails().query({ id: id}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function(){
                        $scope.getVendorList();
                      })
                    });
                  }
                });
        };


        $scope.SaveVendorDetails = function()
        {

            Customer.SaveVendorDetails().save($scope.VendorDetails[0]).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                  }).then(function() {
                    $scope.getVendorList();
                    if(response.status == 0)
                    {
                        $scope.VendorDetails = [];
                    }
                  })
            });
        };


      

        

        // USER DETAILS

        $scope.getUserDetails = function(userdetails)
        {
            $scope.UserDetails = [];
            $scope.UserDetails.push(userdetails);
        };

        $scope.getUserList = function()
        {
                 Customer.getUserList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.UsersList = response.UsersList;
                });      
        };

        $scope.deleteUserDetails = function(id)
        {

            Swal({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!'
              }).then(function(result) {
                if (result.value) {
                    Customer.deleteUserDetails().query({ id: id}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function(){
                        $scope.getUserList();
                      })
                    });
                  }
                });
        };

        $scope.VerifyUserContacts = function()
        {
            if($scope.UserDetails[0].email && $scope.UserDetails[0].email != '' && $scope.UserDetails[0].email != null)
            {
                Customer.VerifyUserEmail().save($scope.UserDetails[0]).$promise.then(function(response){
                    if(response.result[0].emailexist > 0)
                    {
                        $scope.emailexist = "Email ID already exist in record";
                    }
                    else
                    {
                        $scope.emailexist = undefined;  
                    }
                });
            }

            if($scope.UserDetails[0].mobile && $scope.UserDetails[0].mobile != '' && $scope.UserDetails[0].mobile != 0 && $scope.UserDetails[0].mobile != null)
            {
                Customer.VerifyUserMobile().save($scope.UserDetails[0]).$promise.then(function(response){
                    if(response.result[0].mobileexist > 0)
                    {
                        $scope.mobileexist = "Mobile already exist in record";
                    }
                    else
                    {
                        $scope.mobileexist = undefined;
                    }
                });
            }
        };

        $scope.SaveUserDetails = function()
        {
            Customer.SaveUserDetails().save($scope.UserDetails[0]).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                  }).then(function() {
                    $scope.getUserList();
                    if(response.status == 0)
                    {
                        $scope.UserDetails = [];
                        $scope.getUserList();
                    }
                  })
            });
        };

    }]);