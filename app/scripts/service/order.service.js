angular.module('MyApp')
  .factory('Order', ['$resource', function ($resource) {
    var endurl= 'http://103.252.7.5:8029';
    return{

      saveOrderDetails: function()
      {
        return $resource(endurl+'/api/saveOrderDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },
      saveQickInvoiceDetails: function()
      {
        return $resource(endurl+'/api/saveQickInvoiceDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },
      
      generateInvoice: function()
      {
        return $resource(endurl+'/api/generateInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      ListOrders: function()
      {
        return $resource(endurl+'/api/ListOrders',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      ListInvoice: function()
      {
        return $resource(endurl+'/api/ListInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getPaymentsList: function()
      {
        return $resource(endurl+'/api/getPaymentsList',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      savePaymentDetails: function()
      {
        return $resource(endurl+'/api/savePaymentDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      SavePaymentCollection: function()
      {
        return $resource(endurl+'/api/SavePaymentCollection',
        {}, { 'save': { method: 'POST',isArray:false } });
      },


      saveLumsumPaymentDetails: function()
      {
        return $resource(endurl+'/api/saveLumsumPaymentDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      shareInvoice: function()
      {
        return $resource(endurl+'/api/shareInvoice',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      shareRateCard: function()
      {
        return $resource(endurl+'/api/shareRateCard',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      shareOrderReport: function()
      {
        return $resource(endurl+'/api/shareOrderReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      sharePaymentReport: function()
      {
        return $resource(endurl+'/api/sharePaymentReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getOrderDetails: function()
      {
        return $resource(endurl+'/api/getOrderDetails/:orderid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getInvoicesOfCustomer: function()
      {
        return $resource(endurl+'/api/getInvoicesOfCustomer/:customerid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      deleteOrder: function()
      {
        return $resource(endurl+'/api/deleteOrder/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      removeItemFromCart: function()
      {
        return $resource(endurl+'/api/removeItemFromCart/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },
      
      confirmToDilivary: function()
      {
        return $resource(endurl+'/api/confirmToDilivary/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getInvoiceDetailsForPayment: function()
      {
        return $resource(endurl+'/api/getInvoiceDetailsForPayment/:orderid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      deletePaymentDetails: function()
      {
        return $resource(endurl+'/api/deletePaymentDetails/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getInvoiceListForLumsumPayment: function()
      {
        return $resource(endurl+'/api/getInvoiceListForLumsumPayment/:amount/:customerid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCustomerAdvancePayment: function()
      {
        return $resource(endurl+'/api/getCustomerAdvancePayment/:customerid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      getQtySaledReport: function()
      {
        return $resource(endurl+'/api/getQtySaledReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getOrderReport: function()
      {
        return $resource(endurl+'/api/getOrderReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getCustomerOrderReport: function()
      {
        return $resource(endurl+'/api/getCustomerOrderReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      
      getPaymentReport: function()
      {
        return $resource(endurl+'/api/getPaymentReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      getPendingPaymentsData: function()
      {
        return $resource(endurl+'/api/getPendingPaymentsData',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

// purchase

    SetPaidStatus: function()
      {
        return $resource(endurl+'/api/SetPaidStatus/:id',
        {}, { 'query': { method: 'GET',isArray:false } });
      },

      ListPOOrders: function()
      {
        return $resource(endurl+'/api/ListPOOrders',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      savePurchaseOrderDetails: function()
      {
        return $resource(endurl+'/api/savePurchaseOrderDetails',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      GetPurchaseReport: function()
      {
        return $resource(endurl+'/api/GetPurchaseReport',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

      GetDateWiseOrder: function()
      {
        return $resource(endurl+'/api/GetDateWiseOrder',
        {}, { 'save': { method: 'POST',isArray:false } });
      },

     
      getPurchaseOrderDetails: function()
      {
        return $resource(endurl+'/api/getPurchaseOrderDetails/:orderid',
        {}, { 'query': { method: 'GET',isArray:false } });
      },
    }
}]);