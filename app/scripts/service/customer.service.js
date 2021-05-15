angular.module('MyApp')
  .factory('Customer', ['$resource', function ($resource) {
    var endurl= 'http://103.252.7.5:8029';
    return{

        CustomerTypes: function () {
            return $resource(endurl+'/api/CustomerTypes',
                {}, { 'query': { method: 'GET',isArray:true } });
        },
        getCustomerList: function()
        {
            return $resource(endurl+'/api/getCustomerList',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        deleteCustomerDetails: function()
        {
            return $resource(endurl+'/api/deleteCustomerDetails/:id',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        SaveCustomerDetails: function()
        {
            return $resource(endurl+'/api/SaveCustomerDetails',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyCustomerEmail: function()
        {
            return $resource(endurl+'/api/VerifyCustomerEmail',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyCustomerMobile: function()
        {
            return $resource(endurl+'/api/VerifyCustomerMobile',
                {}, { 'save': { method: 'POST',isArray:false } });
        },


        // USERS DETAILS


        getUserList: function()
        {
            return $resource(endurl+'/api/getUserList',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        deleteUserDetails: function()
        {
            return $resource(endurl+'/api/deleteUserDetails/:id',
                {}, { 'query': { method: 'GET',isArray:false } });
        },

        SaveUserDetails: function()
        {
            return $resource(endurl+'/api/SaveUserDetails',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyUserEmail: function()
        {
            return $resource(endurl+'/api/VerifyUserEmail',
                {}, { 'save': { method: 'POST',isArray:false } });
        },

        VerifyUserMobile: function()
        {
            return $resource(endurl+'/api/VerifyUserMobile',
                {}, { 'save': { method: 'POST',isArray:false } });
        },


        // Vendor details

        SaveVendorDetails: function()
        {
            return $resource(endurl+'/api/SaveVendorDetails',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        getVendorList: function()
        {
            return $resource(endurl+'/api/getVendorList',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
        deleteVendorDetails: function()
        {
            return $resource(endurl+'/api/deleteVendorDetails/:id',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
 

        // Vendor details

    }
}]);