angular.module('MyApp', ['ngResource', 
'ngSanitize', 
'ngAnimate',
 'ngRoute', 
 'ui.bootstrap', 
 'ngFileUpload', 
 'ngCookies',
 'ui.date']).config(["$routeProvider","$locationProvider","$httpProvider",function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "public/login.html",
		controller:"LoginController"
    })
    .when("/set_new_password", {
      templateUrl : "public/setNewPassword.html",
       controller:"LoginController"
    })
    .when("/dashboard", {
      templateUrl : "public/dashboard.html",
       controller:"DashboardController"
    })
    .when("/companies", {
      templateUrl : "public/companies.html",
       controller:"LoginController"
    })
    .when("/products", {
      templateUrl : "public/products.html",
       controller:"EntityController"
    })
    .when("/customers", {
      templateUrl : "public/customers.html",
       controller:"CustomerController"
    })
    .when("/vendors", {
      templateUrl : "public/vendors.html",
       controller:"CustomerController"
    })
    .when("/users", {
      templateUrl : "public/users.html",
       controller:"CustomerController"
    })
    .when("/orders", {
      templateUrl : "public/orderes.html",
       controller:"OrderController"
    })

    .when("/poorders", {
      templateUrl : "public/poorders.html",
       controller:"OrderController"
    })

    .when("/place_poorder", {
      templateUrl : "public/place_poorder.html",
       controller:"OrderController"
    })
    .when("/purchase_report", {
      templateUrl : "public/purchase_report.html",
       controller:"OrderController"
    })
    .when("/place_order", {
      templateUrl : "public/place_order.html",
       controller:"OrderController"
    })
    .when("/cart_filling", {
      templateUrl : "public/cart_filling.html",
       controller:"OrderController"
    })
    .when("/view_order", {
      templateUrl : "public/view_order.html",
       controller:"OrderController"
    })
    .when("/invoice_generate", {
      templateUrl : "public/invoice_generate.html",
       controller:"OrderController"
    })
    .when("/invoice", {
      templateUrl : "public/invoice.html",
       controller:"OrderController"
    })
    .when("/quick_invoice", {
      templateUrl : "public/quick_invoice.html",
       controller:"OrderController"
    })
    .when("/invoice_view", {
      templateUrl : "public/invoice_view.html",
       controller:"OrderController"
    })
    .when("/payment", {
      templateUrl : "public/payment.html",
       controller:"OrderController"
    })
    .when("/payment_collection", {
      templateUrl : "public/payment_collection.html",
       controller:"OrderController"
    })
    .when("/payment_process", {
      templateUrl : "public/payment_process.html",
       controller:"OrderController"
    })
    .when("/lumsum_payment_process", {
      templateUrl : "public/lumsum_payment_process.html",
       controller:"OrderController"
    })
    .when("/customer_order_report", {
      templateUrl : "public/customer_order_report.html",
      controller:"OrderController"
    })
    .when("/customer_payment_report",{
      templateUrl : "public/customer_payment_report.html",
      controller:"OrderController"
    })
    .when("/customer_order_report_cust", {
      templateUrl : "public/customer_order_report_cust.html",
      controller:"OrderController"
    })
    .when("/customer_payment_report_cust",{
      templateUrl : "public/customer_payment_report_cust.html",
      controller:"OrderController"
    })
    .when("/saled_qty_report", {
      templateUrl : "public/saled_qty_report.html",
      controller:"OrderController"
    })
    .when("/rate_card", {
      templateUrl : "public/rate_card.html",
      controller:"OrderController"
    })
    
    .when("/user_profile", {
      templateUrl : "public/user_profile.html",
      controller:"LoginController"
    })
    .when("/company_profile", {
      templateUrl : "public/company_profile.html",
      controller:"LoginController"
    })
	.otherwise({
		  redirectTo: ''
		});
}])