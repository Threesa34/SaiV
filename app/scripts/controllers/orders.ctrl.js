angular.module('MyApp')
	.controller('OrderController', ['$scope', '$rootScope' ,'$http', '$route', '$location', '$window', '$timeout', 'Order','Entity', 'Customer', function ($scope, $rootScope, $http, $route, $location, $window, $timeout, Order, Entity, Customer) {

        $scope.CurrentDate = new Date();


        $scope.dateOptions = {
            changeYear: false,
            changeMonth: false,
            yearRange:new Date().getFullYear()+':-0',
            minDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            };

        $scope.dateOptionsFilters = {
            changeYear: true,
            changeMonth: true,
            yearRange:'2019:-0',
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

        $scope.getBackToOrderlist = function()
        {
            $window.sessionStorage.removeItem('orderid');
            $window.history.back();
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

        function reverseString(str){
            var stringRev ="";
            for(var i= 0; i<str.length; i++){
                stringRev = str[i]+stringRev;
            }
            return stringRev;
    }

    $scope.userDetails = {};
        function getSession()
        {
            Entity.getSession().query().$promise.then(function (response) {
                $scope.userDetails = response;    
            });   
        } getSession();

        $scope.getProductList = function()
        {
                Entity.getProductList().query().$promise.then(function (response) {
                    if(!response.status)
                        $scope.ProductsList = response.productsList;         
                });               
        };

        $scope.productTypes = function()
        {
               
                Entity.productTypes().query().$promise.then(function (response) {
                    $scope.product_type = response;
                    $scope.ProductsType=[{title:'All',value:''}];
                    $scope.product_type.map(function(value){
                        $scope.ProductsType.push({title:value,value:value})
                    });
                });
               
        };

        $scope.productUnits = function()
        {
                Entity.productUnits().query().$promise.then(function (response) {
                    $scope.productUnit = response;  
                }); 
        };

        $scope.validateEntries = function(data)
        {
                return ((data.qty != undefined && data.qty > 0) && data.unit != null)   
        };

        $scope.validateRecentlyUpdated = function(newObj, oldObj)
        {
            if(newObj != oldObj)
            {
                newObj.isRecentlyUpdated =true;
            }
        };

        $scope.validateCartQty = function(newObj)
        {
            if(!newObj.details_id)
            {
                newObj.qty = newObj.dil_qty;
                
            }
            else
            {
                    if(newObj.qty <= newObj.dil_qty)
                    {
                        newObj.isQtySame = true;
                    }
                    if(newObj.qty > newObj.dil_qty)
                    {
                        newObj.lowQty = true;
                    }     
            }
        };

        $scope.getCustomerList = function()
        {
                 Customer.getCustomerList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.CustomersList = response.customerList;
                });      
        };

        $scope.deleteOrder = function(orderid)
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
                    Order.deleteOrder().query({ id: orderid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
                        $scope.ListOrders();
                      })
                    });
                  }
                });
        }

        $scope.deletePurchaseOrder = function(orderid)
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
                    Order.deletePurchaseOrder().query({ id: orderid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
                        $scope.ListOrders();
                      })
                    });
                  }
                });
        }

     
       
        $scope.setCartStatus = function()
        {
                $scope.orderDetails.cartStatus = 1;
        }

        $scope.removeItemFromCart = function(data, index)
        {
            if(data.id != undefined)
            {
                Order.removeItemFromCart().query({ id: data.id}).$promise.then(function (response) { 
                    if(response.status == 0)
                    {
                        $scope.orderdetails.splice(index, 1);
                    }
                });
               
            }
            else{
                $scope.orderdetails.splice(index, 1);
            }
        }

        $scope.setDilivaryStatusofOrder = function(orderDetails)
        {
            Swal({
                title: 'Please confirm details',
                text: "",
                html: "<div><table><tr><td>Customer:</td><td>"+orderDetails.cust_name+"</td></tr><tr><td>Order Date(Y/M/D):</td><td>"+formatDate(orderDetails.orderdate)+"</td></tr><tr><td>Ordered By:</td><td>"+orderDetails.ordered_by+"</td></tr></table></div>",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Confirm'
              }).then(function(result)  {
                if (result.value) {
                    Order.confirmToDilivary().query({ id: orderDetails.id}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
                        $scope.ListOrders();
                      })
                    });
                  }
                });
        }

        $scope.getOrderDetails = function()
        {
            $scope.orderDetails = {};
            Order.getOrderDetails().query({'orderid':$window.sessionStorage.getItem('orderid')}).$promise.then(function (response) {
                     if(!response.status)
                     {
                        $scope.orderdetails = response.orderDetails;
                        if($scope.ProductsList && $scope.ProductsList.length > 0)
                        {
                            $scope.ProductsList.map(function(value){
                                $scope.orderdetails.map(function(orderitem){
                                    if(value.id == orderitem.productid)
                                    {
                                        value.qty = orderitem.qty;
                                        value.dil_qty = orderitem.dil_qty;
                                        value.unit = orderitem.unit;
                                        value.orderdetailsid = orderitem.details_id;
                                    }
                                });
                            });
                        }
                        $scope.orderDetails.customername = $scope.orderdetails[0].cust_name;
                        $scope.orderDetails.orderid = $scope.orderdetails[0].orderid;
                         $scope.orderDetails.orderdate = $scope.orderdetails[0].orderdate;
                     }
                });     
        };

        $scope.getTotal = function(){
            var total = 0;
            for(var i = 0; i < $scope.orderdetails.length; i++){
                var product = $scope.orderdetails[i];
                if(isNaN(product.netprice))
                {
                    product.netprice = 0;
                }
                total += (product.netprice);
            }
            
            return total;
        }


        $scope.getTotalInvoiceAmount = function(){
            var total = 0;
            if($scope.ProductsList && $scope.ProductsList.length > 0)
            {
            for(var i = 0; i < $scope.ProductsList.length; i++){
                var product = $scope.ProductsList[i];
                if(isNaN(product.netprice))
                {
                    product.netprice = 0;
                }
                total += (product.netprice);
            }
        }
            
            return total;
        }


        $scope.ListOrders = function(order_Date_from, orer_date_to)
        {


           /*  if(sessionStorage.getItem('fromDate') != undefined && sessionStorage.getItem('fromDate') != null && sessionStorage.getItem('fromDate') != '')
            {
                var from_orderDate = sessionStorage.getItem('fromDate');
                $scope.orderDate_from  = new Date(from_orderDate);
            }

            if(sessionStorage.getItem('toDate') != undefined && sessionStorage.getItem('toDate') != null && sessionStorage.getItem('toDate') != '')
            {
                var to_orderDate = sessionStorage.getItem('toDate');
                $scope.orderDate_to  = new Date(to_orderDate);

            } */

            // if(order_Date_from ||  orer_date_to)
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else 
                {
                    var from_orderDate =  new Date();
                }

                if(orer_date_to)
                {
                    var to_orderDate =  orer_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

   /*          sessionStorage.setItem('fromDate',from_orderDate)
            sessionStorage.setItem('toDate',to_orderDate) */

            Order.ListOrders().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.ordersList = response.ordersList;
            });
        };

        

        $scope.ListInvoice = function(invoiceDate_from, invoiceDate_to)
        {

           /*  if(sessionStorage.getItem('fromDate') != undefined && sessionStorage.getItem('fromDate') != null && sessionStorage.getItem('fromDate') != '')
            {
                var fromInvoiceDate = sessionStorage.getItem('fromDate');
                $scope.invoiceDate_from  = new Date(fromInvoiceDate);
            }

            if(sessionStorage.getItem('toDate') != undefined && sessionStorage.getItem('toDate') != null && sessionStorage.getItem('toDate') != '')
            {
                var toInvoiceDate = sessionStorage.getItem('toDate');
                $scope.invoiceDate_to  = new Date(toInvoiceDate);

            } */

            {
                if(invoiceDate_from)
                {
                    var fromInvoiceDate =  invoiceDate_from;
                }
                else 
                {
                    var fromInvoiceDate =  new Date();
                }

                if(invoiceDate_to)
                {
                    var toInvoiceDate =  invoiceDate_to;
                }
                else
                {
                    var toInvoiceDate =  fromInvoiceDate;
                }
            }


            Order.ListInvoice().save([{fromInvoiceDate:formatDate(fromInvoiceDate),toInvoiceDate:formatDate(toInvoiceDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.invoiceList = response.invoiceList;
            });
        };

        $scope.InitFunctions = function()
        {
            $scope.getProductList();
            $scope.productUnits();
            $scope.productTypes();
            // if($scope.userDetails.role != 'customer')
             $scope.getCustomerList();
        

            if($window.sessionStorage.getItem('orderid') != null && $window.sessionStorage.getItem('orderid') > 0)
            {
                $scope.getOrderDetails();
            }
        }

        $scope.AddNewProductsInOrderDetails = function()
        {
            if($scope.orderdetails[$scope.orderdetails.length -1].productid)
            {
                $scope.orderdetails.push({});
            }
        }

        $scope.getUnitofProduct = function(productrow)
        {
            var selectedproduct = $scope.ProductsList.filter(function(value){
                return productrow.productid == value.id;
            });
            
                productrow.unit = selectedproduct[0].unit;
            
        };

        $scope.setDilQtyAsQty = function(data)
        {
            data.dil_qty = data.qty;
            $scope.validateCartQty(data);
        }

        $scope.orderDetails = {};
        $scope.setCustomerDetails = function(customerDetails)
        {
            $scope.orderDetails.customername = customerDetails;
        }

        $scope.VerifyUserRole = function()
        {
            if($scope.userDetails.role == 'customer' || $scope.userDetails.role == 'customer_admin')
            {
                $scope.setCustomerDetails({customername:{id:$scope.userDetails.customerid}})
            }
        }


        function checkForStaffOrder(value)
        {
            var selectedProduct = $scope.ProductsList.filter(function(val){
                return val.id  == value.productid;
            });
            if(selectedProduct.length > 0)
            {
                if(selectedProduct[0].forstaff != null || selectedProduct[0].forstaff > 0)
                {
                    return selectedProduct[0].forstaff;
                }
                else
                {
                    return 0;
                }
            }
        }

        $scope.saveOrderDetails = function()
        {
        $scope.orderCartDetails = [];

            if($scope.ProductsList)
            {
                $scope.ProductsList.map(function(value){
                        if(value.qty != undefined && value.unit != null)
                        {
                            $scope.orderCartDetails.push(value);
                        }
                })
            }
            if($scope.orderdetails)
            {
                $scope.orderdetails.map(function(value){
                    if(value.dil_qty != undefined  && value.dil_qty != null  && value.dil_qty >= 0)
                    {
                        if(value.forstaff)
                        {
                            if(value.forstaff == null || value.forstaff <= 0 || value.forstaff  == '')
                            {
                                value.forstaff = 0;
                            }
                        }
                        else
                        {
                            value.forstaff = checkForStaffOrder(value);
                        }
                        $scope.orderCartDetails.push(value); 
                    }
                })
            }

            
        if($scope.orderCartDetails.length > 0)
            {
                

                /* if($scope.orderDetails.orderdate)
                {
                    $scope.orderDetails.orderdate = formatDate($scope.orderDetails.orderdate)
                } */
                $scope.orderCartDetails[0].customerdetails = $scope.orderDetails;
              
                Order.saveOrderDetails().save($scope.orderCartDetails).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function()  {
                        if(response.status == 0)
                        {
            
                        }
                        else
                        {
                            $scope.orderDetails = {};
                            $scope.getBackToOrderlist();
                            $scope.InitFunctions();
                        }
                    });
                });

            }
        };


        $scope.saveQickInvoiceDetails = function()
        {
        $scope.orderCartDetails = [];

            if($scope.ProductsList)
            {
                $scope.ProductsList.map(function(value){
                        if(value.qty != undefined && value.unit != null)
                        {
                            if(value.forstaff)
                        {
                            if(value.forstaff == null || value.forstaff <= 0 || value.forstaff  == '')
                            {
                                value.forstaff = 0;
                            }
                        }
                        else
                        {
                            value.forstaff = checkForStaffOrder(value);
                        }
                            $scope.orderCartDetails.push(value);
                        }
                })
            }
            

            
        if($scope.orderCartDetails.length > 0)
            {
                /* if($scope.orderDetails.orderdate)
                {
                    $scope.orderDetails.orderdate = formatDate($scope.orderDetails.orderdate)
                } */
                $scope.orderDetails.taxamt = 0;
                $scope.orderDetails.netamt = $scope.orderDetails.totalAmount + $scope.orderDetails.taxamt;
                $scope.orderCartDetails[0].customerdetails = $scope.orderDetails;
              
                Order.saveQickInvoiceDetails().save($scope.orderCartDetails).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function()  {
                        if(response.status == 0)
                        {
            
                        }
                        else
                        {
                            $scope.orderDetails = {};
                            location.reload();
                        }
                    });
                });

            }
        };

        $scope.ToggleForStaff = function(data)
        {
            if(data.forstaff == 1)
            {
                data.forstaff = 0;
            }
            else
            {
                data.forstaff = 1;
            }
        }

        $scope.ChangeProduct = function(data,oldproductid)
        {
            console.log(oldproductid)
            if(oldproductid.productid != data.productid)
                data.changed_item = oldproductid.productid;
            if(data.changed_item == data.productid)
                data.changed_item = null;
        }

        $scope.generateInvoice = function()
        {
            $scope.orderdetails[0].taxamt = 0;
            $scope.orderdetails[0].netamt = $scope.orderdetails[0].totalAmount + $scope.orderdetails[0].taxamt;
            Order.generateInvoice().save($scope.orderdetails).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function()  {
                    if(response.status == 0)
                    {
        
                    }
                    else
                    {
                        $scope.orderDetails = {};
                        $scope.getBackToOrderlist();
                        $scope.InitFunctions();
                    }
                });
            });
        }

        $scope.setSessionId = function(orderid)
        {
            $window.sessionStorage.setItem('orderid',orderid);
        }

        $scope.RedirectToInvoiceView = function(id,path)
        {
            $scope.setSessionId(id);
            $location.path( "/"+path );
        }

        $scope.paymentDateils = [];

        $scope.getInvoicesOfCustomer = function(customerDetails)
        {


            Order.getInvoicesOfCustomer().query({'customerid':customerDetails.id}).$promise.then(function (response) {
                if(!response.status)
                {
                    $window.sessionStorage.setItem('customerid',customerDetails.id);
                    $window.sessionStorage.setItem('customername',customerDetails.name);
                   $scope.CustomerInvoicesList = response.invoiceList;
                }
            });
        };

        $scope.getAllInvoicesCopies = function(customerDetails)
        {

            Order.getAllInvoicesCopies().save(customerDetails).$promise.then(function (response) {
                if(response.filesList)
                {
                    $scope.filesList = response.filesList;
                }
                if(response.status)
                {
                    $scope.filesList =[];
                }
            });
        };

        $scope.togglePaymentMethod = function(btntype)
        {
            if(btntype == 'orderwise')
            {
                $scope.paymentDateils.againestOrder = true;
                $scope.paymentDateils.paidlumpsum = false;
            }
            else
            {
                $scope.paymentDateils.againestOrder = false;
                $scope.paymentDateils.paidlumpsum = true;
            }
          
        }

        $scope.getInvoiceDetailsForPayment = function()
        {
            Order.getInvoiceDetailsForPayment().query({'orderid':$window.sessionStorage.getItem('orderid')}).$promise.then(function (response) {
                if(!response.status)
                {
                   $scope.PaymentinvoiceDetails = response.invoicedetails;
                }
                });
        }

        $scope.orderList = false;
        $scope.toggleOrderList = function()
        {
            if($scope.orderList == false)
            $scope.orderList = true;
            else
            $scope.orderList = false;
        }
       

        $scope.getPaymentsList = function(PaymentDate_from, PaymentDate_to)
            {
    
                {
                    if(PaymentDate_from)
                    {
                        var fromPaymentDate =  PaymentDate_from;
                    }
                    else
                    {
                        var fromPaymentDate =  new Date();
                    }
    
                    if(PaymentDate_to)
                    {
                        var toPaymentDate =  PaymentDate_to;
                    }
                    else
                    {
                        var toPaymentDate =  fromPaymentDate;
                    }
                }
    
                Order.getPaymentsList().save([{fromPaymentDate:formatDate(fromPaymentDate),toPaymentDate:formatDate(toPaymentDate)}]).$promise.then(function (response) {
                    if(!response.status)
                    $scope.PaymentsList = response.PaymentsList;
                }); 
        }

        $scope.savePaymentDetails = function()
        {
                Order.savePaymentDetails().save($scope.PaymentinvoiceDetails[0]).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function()  {
                        if(response.status == 0)
                        {
            
                        }
                        else
                        {
                            $scope.PaymentinvoiceDetails = [];
                            $scope.getBackToOrderlist();
                        }
                    });
                });
        }

        function getTotalAmount()
        {
            // return $scope.InvoiceListforPayments.reduce((sum, value) => sum + value.pendingpayment, 0)
            return $scope.InvoiceListforPayments.reduce(function(sum, value){sum + value.pendingpayment}, 0)
        }

        $scope.getInvoiceListForLumsumPayment = function(amount)
        {
            $scope.lumsumpaidamout = amount;
            if(amount)
            {
                Order.getInvoiceListForLumsumPayment().query({amount:amount, customerid:$window.sessionStorage.getItem('customerid')}).$promise.then(function(response){
                   
                        if(!response.status)
                        {
                            $scope.InvoiceListforPayments = response.invoiceList;
                            $scope.TotalPaymentAmount = getTotalAmount();
                        }
                });
            }
        }

        
        $scope.getCustomerAdvancePayment = function()
        {
            $scope.lumsumpaymentDetails = [];

                Order.getCustomerAdvancePayment().query({customerid:$window.sessionStorage.getItem('customerid')}).$promise.then(function(response){
                   
                        if(!response.status)
                        {
                            $scope.advanceAmount = response.amount;
                        }
                });
        }

        $scope.getPatmentDetails = function(paymentDetails)
        {
           $scope.paymentDetails = [paymentDetails] ;
        }

        $scope.deletePaymentDetails = function(paymentid)
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
                    Order.deletePaymentDetails().query({ id: paymentid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
                        $scope.getPaymentsList();
                      })
                    });
                  }
                });
        }

        $scope.PaymentMode = 'Cash';
        $scope.setPaymentMode = function(mode)
        {
            $scope.PaymentMode = mode;
        }

        $scope.getCustomerName = function()
        {
            return String($window.sessionStorage.getItem('customername'));
        }

       

        $scope.ValidatePaymentConditions = function()
        {
            if($scope.paymentamount != undefined && $scope.paymentamount > 0)
            {
                if($scope.lumsumpaymentDetails != undefined && ($scope.lumsumpaymentDetails[0].payment_date != undefined && $scope.lumsumpaymentDetails[0].payment_date != "Invalid Date") && ($scope.lumsumpaymentDetails[0].payment_mode != undefined))
                {
                   return true
                }
            }
            else
            {
                return false
            }

        }


        $scope.saveLumsumPaymentDetails = function()
        {

            $scope.InvoiceListforPayments[0].paymentDetails = $scope.lumsumpaymentDetails[0];
            Order.saveLumsumPaymentDetails().save($scope.InvoiceListforPayments).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                }).then(function()  {
                    if(response.status == 0)
                    {
        
                    }
                    else
                    {
                        $scope.lumsumpaymentDetails = [];
                        $scope.getBackToOrderlist();
                    }
                });
            });
        }

        $scope.getCompanyDetailsforInvoice = function()
        {
            Entity.getCompanyDetails().query({}).$promise.then(function(response){
              
                    if(!response.status)
                    {
                        $scope.companyDetails = response.companyDetails;
                    if($scope.orderdetails != undefined && $scope.orderdetails.length > 0)
                        {
                        if($scope.orderdetails[0].alternate_color_print != 1)
                        {
                            $scope.companyDetails[0].heading_color = '#000000';
                            $scope.companyDetails[0].desc_color = '#000000'; 
                        }

                        else
                        {

                            var time = new Date($scope.orderdetails[0].invoicedate).getDate();

                            if (time % 2 == 0) {
                                 $scope.companyDetails[0].heading_color = '#000000';
                                 $scope.companyDetails[0].desc_color = '#000000';
                            } else  {
                                var greeting = "Even Day";
                            }

                                if($scope.companyDetails[0].heading_color == undefined)
                                {
                                    $scope.companyDetails[0].heading_color = '#000000';
                                }
                                if($scope.companyDetails[0].desc_color == undefined)
                                {
                                    $scope.companyDetails[0].desc_color = '#000000';
                                }
                        }
                    }
                    else{
                        $scope.companyDetails[0].heading_color = '#000000';
                        $scope.companyDetails[0].desc_color = '#000000';
                    }
                    }
            });
        }

        $scope.printInvoice = function(divName) {    

            if($scope.orderdetails[0].alternate_color_print != 1)
            {
                $scope.companyDetails[0].heading_color = '#000000';
                $scope.companyDetails[0].desc_color = '#000000'; 
            }

            var time = new Date($scope.orderdetails[0].invoicedate).getDate();

            if (time % 2 == 0) {
                 $scope.companyDetails[0].heading_color = '#000000';
                 $scope.companyDetails[0].desc_color = '#000000';
            } else  {
                var greeting = "Even Day";
            }

            var printContents = document.getElementById(divName).innerHTML;
            var popupWin = window.open('', '_blank', 'width=300,height=300');
            popupWin.document.open();
            var htmlContent = '<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"><style>table.table-bordered > thead > tr > th{border:1.2px solid black;}</style></head><body onload="window.print()"><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 mt-4 pt-4" style="padding-right:5px;padding-left:7px;">' + printContents + '</div></div></body></html>';

            //'<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"></head><body onload="window.print()">' + printContents + '</body></html>'
            popupWin.document.write(htmlContent);
            popupWin.document.close();
          } 


          $scope.shareOrderReport = function(divName) {
            var printContents = document.getElementById(divName).innerHTML;
            // var billheader = document.getElementById('bill-header').innerHTML;

                var htmlContent = '<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"><style>table.table-bordered > thead > tr > th{border:1.2px solid black;}</style></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 mt-4 pt-4" style="padding-right:4px;padding-left:11.2px;position:relative;top:-20px;">' + printContents + '</div></div></body></html>';

                //var billHeaderContent = '<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 pl-2 pr-2">' + billheader + '</div></div></body></html>';

                var billHeaderContent = '';




                

                var height = $( '#'+divName ).height();
                var width = $( '#'+divName ).width();
                

                $scope.orderReportData[0].fromDate = $scope.orderDate_from;
                $scope.orderReportData[0].toDate = $scope.orderDate_to;

                Order.shareOrderReport().save({billheader:billHeaderContent,invoiceContent:htmlContent,orderData: $scope.orderReportData[0],size:{height:height,width:width}}).$promise.then(function(response){
                    window.open("http://localhost:8029/reports/"+response.filename);
                });

          } 

        $scope.sharePaymentReport = function(divName) {
            var printContents = document.getElementById(divName).innerHTML;
            // var billheader = document.getElementById('bill-header').innerHTML;

                var htmlContent = '<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"><style>table.table-bordered > thead > tr > th{border:1.2px solid black;}</style></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 mt-4 pt-4" style="padding-right:4px;padding-left:11.2px;position:relative;top:-20px;">' + printContents + '</div></div></body></html>';

                //var billHeaderContent = '<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 pl-2 pr-2">' + billheader + '</div></div></body></html>';

                var billHeaderContent = '';




                $( '#'+divName ).css('display','block');

                var height = $( '#'+divName ).height();
                var width = $( '#'+divName ).width();
            
                $( '#'+divName ).css('display','none');

                Order.sharePaymentReport().save({billheader:billHeaderContent,invoiceContent:htmlContent,customerName: $scope.customerName,size:{height:height,width:width}}).$promise.then(function(response){
                    $( '#'+divName ).css('display','none');
                    window.open("http://localhost:8029/reports/"+response.filename);
                });

          } 



          $scope.shareInvoice = function(divName) {


            if($scope.orderdetails[0].alternate_color_print != 1)
            {
                $scope.companyDetails[0].heading_color = '#000000';
                $scope.companyDetails[0].desc_color = '#000000'; 
            }

            var time = new Date($scope.orderdetails[0].invoicedate).getDate();

            if (time % 2 == 0) {
                 $scope.companyDetails[0].heading_color = '#000000';
                 $scope.companyDetails[0].desc_color = '#000000';
            } else  {
                var greeting = "Even Day";
            }


            var printContents = document.getElementById(divName).innerHTML;
            // var billheader = document.getElementById('bill-header').innerHTML;

                var htmlContent = '<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"><style>table.table-bordered > thead > tr > td{border:1.2px solid '+$scope.companyDetails[0].desc_color+' !important;}table.table-bordered > thead > tr > th{border:1.2px solid '+$scope.companyDetails[0].desc_color+' !important;}table.table-bordered > tbody > tr > td{border:1.2px solid '+$scope.companyDetails[0].desc_color+' !important;}</style></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 mt-4 pt-4" style="padding-right:4px;padding-left:11.2px;position:relative;top:-20px;">' + printContents + '</div></div></body></html>';

                //var billHeaderContent = '<html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 pl-2 pr-2">' + billheader + '</div></div></body></html>';

                var billHeaderContent = '';




                

                var height = $( '#'+divName ).height();
                var width = $( '#'+divName ).width();
                
               

                Order.shareInvoice().save({billheader:billHeaderContent,invoiceContent:htmlContent,orderData: $scope.orderdetails[0],size:{height:height,width:width}}).$promise.then(function(response){
                    window.open("http://localhost:8029/invoices/"+response.filename);
                });

          } 


          $scope.ListOrdersReport = function(order_Date_from, orer_date_to)
        {
            // if(order_Date_from ||  orer_date_to)
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else
                {
                    var from_orderDate =  new Date();
                }

                if(orer_date_to)
                {
                    var to_orderDate =  orer_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

           /*  Order.ListOrders().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.ordersList = response.ordersList;
            }); */
        };



        $scope.getTotalQtyFromReport = function(productid, cust_id)
        {
            if($scope.SaledReportData && $scope.SaledReportData != null)
            {
                var filteredData =  $scope.SaledReportData.filter(function(value){
                     return (value.product_id == productid && value.cust_id == cust_id)
                 })
                    return filteredData[0].total_qty;
            }
            else
            return 0
        }
      
        $scope.getQtySaledReport = function(order_Date_from, orer_date_to)
        {
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else
                {
                    var from_orderDate =  new Date();
                }

                if(orer_date_to)
                {
                    var to_orderDate =  orer_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

            Order.getQtySaledReport().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.SaledReportData = response.SaledReportData;

            });
        };

        $scope.getPaymentReport = function()
        {
            Order.getPaymentReport().save([]).$promise.then(function (response) {
                if(!response.status)
                $scope.paymentReportData = response.paymentReportData;

            });
            
        }

        $scope.getVendorPaymentReport = function()
        {
            Order.getVendorPaymentReport().save([]).$promise.then(function (response) {
                if(!response.status)
                $scope.vendorPaymentReportData = response.paymentReportData;

            });
            
        }

        $scope.selectedPayments = [];
        $scope.getPendingPaymentsData = function(id, cust_name)
        {
         
            $scope.customerName = cust_name;
            $scope.cust_id = id;
            Order.getPendingPaymentsData().save({cust_id:id}).$promise.then(function (response) {
                if(!response.status)
                {
                $scope.customrsPendingPaymentsData = response.pendingPaymentData;

                /* if(sessionStorage.getItem('prevId') != undefined && sessionStorage.getItem('prevId') == id)
                {
                   
                }
                else
                {$scope.selectedPayments = [];}

                sessionStorage.setItem('prevId',id); */
                }
            });
            
        }

        // $scope.PaymentCollection = false;
       
        $scope.SetItemInArray = function(obj)
        {
            if($scope.selectedPayments.length > 0)
            {
                var existitem = [];
                existitem = $scope.selectedPayments.filter(function(val){
                    return val.id == obj.id
                });
                if(existitem.length <= 0)
                {
                    obj.isSelected =  true;
                    $scope.selectedPayments.push(obj);
                }
                else
                {
                    $scope.selectedPayments.map(function(val, index){
                        if(val.id == obj.id)
                        $scope.selectedPayments.splice(index, 1);
                        obj.isSelected =  false;
                    });
                }
            }
            else
            {
                obj.isSelected =  true;
                $scope.selectedPayments.push(obj);
            }
        }


        $scope.getTotalActualPendingAmount = function()
        {
            if( $scope.customrsPendingPaymentsData != undefined &&  $scope.customrsPendingPaymentsData.length > 0){
                var total = 0;
                $scope.customrsPendingPaymentsData.map(function(value){
                    total = total + value.pendingpayment;
                });
                return total;
            }
        }

        $scope.getTotalPendingAmount = function()
        {
            if($scope.selectedPayments.length > 0)
            {
                    var total = 0;

                    $scope.selectedPayments.map(function(value){
                        total = total + value.pendingpayment;
                    });
                    return total;

            }
            else if( $scope.customrsPendingPaymentsData != undefined &&  $scope.customrsPendingPaymentsData.length > 0){
                var total = 0;
                $scope.customrsPendingPaymentsData.map(function(value){
                    total = total + value.pendingpayment;
                });
                return total;
            }
        }



        // VENDORS PAYMENT

        $scope.selectedVendorsPayments = [];
        $scope.getVendorsPendingPaymentsData = function(id, cust_name)
        {
         
            $scope.customerName = cust_name;
            $scope.vendor_id = id;
            Order.getVendorsPendingPaymentsData().save({vendor_id:id}).$promise.then(function (response) {
                if(!response.status)
                {
                $scope.vendorsPendingPaymentsData = response.pendingPaymentData;

                /* if(sessionStorage.getItem('prevId') != undefined && sessionStorage.getItem('prevId') == id)
                {
                   
                }
                else
                {$scope.selectedVendorsPayments = [];}

                sessionStorage.setItem('prevId',id); */
                }
            });
            
        }

        $scope.showitemsList = false;

        $scope.getPurchasedItemsList = function(purchasebject)
        {
            $scope.purchaseObject = purchasebject;
            
            Order.getPurchasedItemsList().save({purchase_id:purchasebject.id}).$promise.then(function (response) {
                if(!response.status)
                {
                $scope.purchaseItemsList = response.purchaseItemsList;

                $scope.showitemsList = true;
                }
            });
            
        }

        // $scope.PaymentCollection = false;
       
        $scope.SetItemInArrayForVendors = function(obj)
        {
            if($scope.selectedVendorsPayments.length > 0)
            {
                var existitem = [];
                existitem = $scope.selectedVendorsPayments.filter(function(val){
                    return val.id == obj.id
                });
                if(existitem.length <= 0)
                {
                    obj.isSelected =  true;
                    $scope.selectedVendorsPayments.push(obj);
                }
                else
                {
                    $scope.selectedVendorsPayments.map(function(val, index){
                        if(val.id == obj.id)
                        $scope.selectedVendorsPayments.splice(index, 1);
                        obj.isSelected =  false;
                    });
                }
            }
            else
            {
                obj.isSelected =  true;
                $scope.selectedVendorsPayments.push(obj);
            }
        }


        $scope.getTotalActualPendingAmountOfVendors = function()
        {
            if( $scope.vendorsPendingPaymentsData != undefined &&  $scope.vendorsPendingPaymentsData.length > 0){
                var total = 0;
                $scope.vendorsPendingPaymentsData.map(function(value){
                    total = total + value.pendingpayment;
                });
                return total;
            }
        }

        $scope.getTotalPendingAmountOfVendors = function()
        {
            if($scope.selectedVendorsPayments.length > 0)
            {
                    var total = 0;

                    $scope.selectedVendorsPayments.map(function(value){
                        total = total + value.pendingpayment;
                    });
                    return total;

            }
            else if( $scope.vendorsPendingPaymentsData != undefined &&  $scope.vendorsPendingPaymentsData.length > 0){
                var total = 0;
                $scope.vendorsPendingPaymentsData.map(function(value){
                    total = total + value.pendingpayment;
                });
                return total;
            }
        }

   
        

        // VENDORS PAYMENT



        $scope.FillSameQtyInCart = function()
        {
            if($scope.orderdetails != undefined && $scope.orderdetails.length > 0)
            {
                $scope.orderdetails.map(function(value){
                        value.dil_qty = value.qty;
                });
            }
        };

        $scope.bulkPaymentCollection = [];

        $scope.SavePaymentCollection = function()
        {

            var tempPayment = $scope.bulkPaymentCollection[0].paid_amt;
                
                var paymentKey = Object.keys($scope.bulkPaymentCollection[0]);

                if(tempPayment > 0)
                {
                $scope.selectedPayments.map(function(value){

                    value.customerid = $scope.cust_id;
                    if(tempPayment >= value.pendingpayment)
                    {
                        value.paid_amount = value.pendingpayment;
                        value.pending_amount = 0;
                        tempPayment = tempPayment - value.pendingpayment;
                    }
                    else
                    {
                        value.paid_amount = tempPayment;
                        value.pending_amount = value.pendingpayment - tempPayment;
                        tempPayment = 0;
                    }

                    if(paymentKey != undefined && paymentKey.length > 0)
                    {
                        paymentKey.map(function(val){
                            value[val] = $scope.bulkPaymentCollection[0][val];
                        });
                    }

                });

                Order.SavePaymentCollection().save($scope.selectedPayments).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function()  {
                        if(response.status == 0)
                        {
                            
                        }
                        else
                        {
                            $("#modalPendingPayments").modal('hide');
                            $scope.bulkPaymentCollection = [];
                            location.reload();
                        }
                    });
                });
            }

        }

        $scope.SaveVendorPaymentCollection = function()
        {

            var tempPayment = $scope.bulkPaymentCollection[0].paid_amt;
                
                var paymentKey = Object.keys($scope.bulkPaymentCollection[0]);

                if(tempPayment > 0)
                {
                $scope.selectedVendorsPayments.map(function(value){

                    value.vendorid = $scope.vendor_id;
                    if(tempPayment >= value.pendingpayment)
                    {
                        value.paid_amount = value.pendingpayment;
                        value.pending_amount = 0;
                        tempPayment = tempPayment - value.pendingpayment;
                    }
                    else
                    {
                        value.paid_amount = tempPayment;
                        value.pending_amount = value.pendingpayment - tempPayment;
                        tempPayment = 0;
                    }

                    if(paymentKey != undefined && paymentKey.length > 0)
                    {
                        paymentKey.map(function(val){
                            value[val] = $scope.bulkPaymentCollection[0][val];
                        });
                    }

                });

                Order.SaveVendorPaymentCollection().save($scope.selectedVendorsPayments).$promise.then(function(response){
                    Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                    }).then(function()  {
                        if(response.status == 0)
                        {
                            
                        }
                        else
                        {
                            $("#modalPendingPayments").modal('hide');
                            $scope.bulkPaymentCollection = [];
                            location.reload();
                        }
                    });
                });
            }

        }

        $scope.verifyAndSetItem = function(obj)
        {
           var existitem = $scope.selectedPayments.filter(function(val){
                return val.id == obj.id
            });
            if(existitem.length > 0)
            {
                obj.isSelected =  true;

            }
        }

        $scope.SetCustomerid = function(cust_id)
        {
            $scope.Customerid = cust_id;
        }

        

        $scope.getCustomerOrderReport = function(customerdetails, order_Date_from, order_date_to)
        {
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else
                {
                    var from_orderDate =  new Date();
                }

                if(order_date_to)
                {
                    var to_orderDate =  order_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

            Order.getCustomerOrderReport().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.customerOrderReportData = response.orderReportData;
            });
        };

        $scope.getOrderReport = function(customerdetails, order_Date_from, order_date_to)
        {
            if( ($scope.Customerid &&  $scope.Customerid > 0))
            {
                var customerid = $scope.Customerid;
                $scope.SetCustomerid(customerid)
            }
            if((customerdetails && customerdetails.id))
            {
                var customerid = customerdetails.id;
                $scope.SetCustomerid(customerid)
            }
           
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else
                {
                    var from_orderDate =  new Date();
                }

                if(order_date_to)
                {
                    var to_orderDate =  order_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

            Order.getOrderReport().save([{customerid:customerid, from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.orderReportData = response.orderReportData;
            });
        };

        $scope.CalculateTotalAmountInReport = function()
        {
            var totalamt = 0;
            $scope.orderReportData.map(function(value){
                totalamt = totalamt+ value.net_amount;
            })

           return totalamt;
        }

        // purchase

        $scope.deductAmount = function(data)
        {
            $scope.totalPoAmount =  $scope.totalPoAmount - ((data.price/10) * data.qty);
        }
        $scope.revertAmount = function(data)
        {
            $scope.totalPoAmount =  $scope.totalPoAmount + ((data.price/10) * data.qty);
        }

        $scope.getTotalPoAmount = function(datalist)
        {
            $scope.totalPoAmount = 0;
            if($scope.ProductsList && $scope.ProductsList.length > 0)
            {
                 $scope.ProductsList.map(function(value, index){   
                      
                        if(value.price == undefined)
                        {
                            value.price = 0;
                        }
                        if(value.qty == undefined)
                        {
                            value.qty = 0
                        }
                        $scope.totalPoAmount =  $scope.totalPoAmount + ((value.price/10) * value.qty);
                    });
            }
        }

        $scope.getPurchaseOrderDetails = function()
        {
            Order.getPurchaseOrderDetails().query({'orderid':$window.sessionStorage.getItem('orderid')}).$promise.then(function (response) {
                     if(!response.status)
                        $scope.purchaseOrderDetails = response.purchaseOrderDetails;
                        if($scope.ProductsList && $scope.ProductsList.length > 0)
                        {
                            $scope.ProductsList.map(function(value){
                                $scope.purchaseOrderDetails.map(function(orderitem){
                                    if(value.id == orderitem.productid)
                                    {
                                        value.qty = orderitem.qty;
                                        value.price = orderitem.price;
                                        value.unit = orderitem.unit;
                                        value.purchaseOrderDetailsId = orderitem.details_id;
                                    }
                                });
                            });
                        }
                            //$scope.purchaseOrderDetails[0].orderid = $scope.purchaseOrderDetails[0].orderid;
                             $scope.SelectedVendor = $scope.purchaseOrderDetails[0].vendorid;
                             $scope.poOrderdate = $scope.purchaseOrderDetails[0].orderdate;
                             $scope.totalPoAmount = $scope.purchaseOrderDetails[0].netamt;
                             
                });      
        };

        $scope.InitPurchaseFunctions = function()
        {
            $scope.getVendorList();
            $scope.getProductList();
            $scope.productUnits();
            $scope.productTypes();
            if($window.sessionStorage.getItem('orderid') != null && $window.sessionStorage.getItem('orderid') > 0)
            {
                $scope.getPurchaseOrderDetails();
            }
        }

        $scope.getVendorList = function()
        {
                 Customer.getVendorList().query().$promise.then(function (response) {
                     if(!response.status)
                        $scope.VendorsList = response.vendorsList;
                });      
        };



        $scope.ListPOOrders = function(order_Date_from, orer_date_to)
        {

            // if(order_Date_from ||  orer_date_to)
            {
                if(order_Date_from)
                {
                    var from_orderDate =  order_Date_from;
                }
                else
                {
                    var from_orderDate =  new Date();
                }

                if(orer_date_to)
                {
                    var to_orderDate =  orer_date_to;
                }
                else
                {
                    var to_orderDate =  from_orderDate;
                }
            }

            Order.ListPOOrders().save([{from_orderDate:formatDate(from_orderDate),to_orderDate:formatDate(to_orderDate)}]).$promise.then(function (response) {
                if(!response.status)
                $scope.poOrdersList = response.poOrdersList;
            });
        };


        $scope.SetPaidStatus = function(orderid)
        {
            Swal({
                title: 'Are you sure?',
                text: "Click on yes for confirm payemnt!",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes'
              }).then(function(result) {
                if (result.value) {
                    Order.SetPaidStatus().query({ id: orderid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function()  {
                        $scope.ListPOOrders();
                      })
                    });
                  }
                });
        }

       
      

        $scope.SelectedVendor = undefined;

        $scope.savePurchaseOrderDetails = function()
        {   
       
             if($scope.ProductsList && $scope.ProductsList.length > 0)
            {
                
                    var selectedItems = $scope.ProductsList.filter(function(value){
                        if(!$scope.purchaseOrderDetails)
                        {
                            return (value.purchaseOrderDetailsId || (value.price && value.price > 0 ) || (value.qty && value.qty > 0))
                        }
                        else
                        return ((value.price && value.price > 0 ) && (value.qty && value.qty > 0))
                    });
                

                if(selectedItems && selectedItems.length > 0)
                {
                    if($scope.purchaseOrderDetails && $scope.purchaseOrderDetails.length > 0)
                        selectedItems[0].orderid = $scope.purchaseOrderDetails[0].orderid;

                        selectedItems[0].vendorid = $scope.SelectedVendor;
                        selectedItems[0].orderdate = $scope.poOrderdate;
                        selectedItems[0].netamt = $scope.totalPoAmount;

                        Order.savePurchaseOrderDetails().save(selectedItems).$promise.then(function(response){
                            Swal({
                                type: response.type,
                                title: response.title,
                                text: response.message,
                            }).then(function()  {
                                if(response.status == 0)
                                {
                    
                                }
                                else
                                {
                                    $scope.orderDetails = {};
                                    $scope.getBackToOrderlist();
                                    $scope.InitPurchaseFunctions();
                                }
                            });
                        });
                }
                else
                {
                    Swal({
                        type: 'error',
                        title: 'Empty Bucket',
                        text: "Cart is empty.",
                      }).then(function()  {
                        
                      })
                }
            }
 
        };

        $scope.GetDateWiseOrder = function(productid)
        {
            $scope.poreport.productid = productid;
            Order.GetDateWiseOrder().save($scope.poreport).$promise.then(function(response){
                if(!response.status)
                {
                    $scope.purchaseOrderDetails = response.orderwisedata;
                    console.log($scope.purchaseOrderDetails);
                    $('#modalProdctOrders').modal({
                        show: true
                    }); 
                }
            });
        };

        $scope.GetPurchaseReport = function()
        {
            if($scope.poreport.vendorid)
            {
                if(!$scope.poreport.Date_from || $scope.poreport.Date_from == null || $scope.poreport.Date_from == '' || $scope.poreport.Date_from  == undefined)
                {
                    $scope.poreport.Date_from =  new Date();
                }

                if(!$scope.poreport.Date_to || $scope.poreport.Date_to == null || $scope.poreport.Date_to == '' || $scope.poreport.Date_to  == undefined)
                {
                    $scope.poreport.Date_to =  $scope.poreport.Date_from;
                }

                Order.GetPurchaseReport().save($scope.poreport).$promise.then(function(response){
                    if(response.status)
                    {

                    }
                    else
                    {
                        $scope.purchaseReport = response.purchaseReport
                    }
                });
                
            }
            else
            {
                Swal({
                    type: 'error',
                    title: 'Vondor not found!',
                    text: "Please selected vendor.",
                  }).then(function()  {
                    
                  })
            }
         
        };

        function sortSelectedItems()
        {
            $scope.ProductsList =  $scope.ProductsList.filter(function(val){
                return val.rate != undefined && val.rate != '' && val.rate != null
            })
        }


        function sortRatedProducts()
        {
            $scope.RatedProductsList = [];

            $scope.RatedProductsList = $scope.ProductsList.filter(function(value){
                    return value.rate != undefined && value.rate > 0;
            });
        }

        $scope.shareRateCard = function(sectionid)
        {
             sortRatedProducts();

             setTimeout(function(){
                

                // var height = ;

            var height = $( '#'+sectionid ).height();
            var width = '3.74in';

            var content = ' <html><head><link rel="stylesheet" type="text/css" href="http://localhost:8029/styles/style.css" /><link rel="stylesheet" href="http://localhost:8029/bower_components/bootstrap/dist/css/bootstrap.css"><style>table.table-bordered > thead > tr > td{border:1.2px solid black !important;}table.table-bordered > thead > tr > th{border:1.2px solid black !important;}table.table-bordered > tbody > tr > td{border:1.2px solid black !important;}</style></head><body><div class=""><div class="col-md-6 col-lg-6 col-6 col-sm-6 mt-4 pt-4" style="padding-right:4px;padding-left:11.2px;position:relative;top:-20px;"><table class="table table-striped table-bordered text-nowrap" style="margin-left: 2.5px;display: fixed;width: 3.74in;font-size:10px;">'+$('#'+sectionid).html()+'</table></div></div></body></html>';
            
            Order.shareRateCard().save({content:content,size:{height:height,width:width}}).$promise.then(function(response){
                window.open("http://localhost:8029/rate_cards/"+response.filename);
            });


              }, 3000); //run this after 3 seconds
            

        }

    }]);