angular.module('MyApp')
  .factory('Entity', ['$resource', 'Upload', function ($resource, Upload) {
    var endurl= 'http://localhost:8029';
    return{

        VerifyCompanyEmail: function () {
          return $resource(endurl+'/api/VerifyCompanyEmail',
              {}, { 'save': { method: 'POST',isArray:false } });
      },
      VerifyCompanyMobile: function () {
          return $resource(endurl+'/api/VerifyCompanyMobile',
              {}, { 'save': { method: 'POST',isArray:false } });
      },

      ImporProductsDetails: function () {
          return $resource(endurl+'/api/ImporProductsDetails',
              {}, { 'save': { method: 'POST',isArray:false } });
      },

      getSession: function () {
          return $resource(endurl+'/api/getSession',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getProductList: function () {
          return $resource(endurl+'/api/getProductList',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      productTypes: function () {
          return $resource(endurl+'/api/productTypes',
              {}, { 'query': { method: 'GET',isArray:true } });
      },

      productUnits: function () {
          return $resource(endurl+'/api/productUnits',
              {}, { 'query': { method: 'GET',isArray:true } });
      },

      deleteProductDetails: function () {
          return $resource(endurl+'/api/deleteProductDetails/:id',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCompanyList: function () {
          return $resource(endurl+'/api/getCompanyList/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      deleteCompanyDetails: function () {
          return $resource(endurl+'/api/deleteCompanyDetails/:companyid',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getCompanyDetails: function () {
          return $resource(endurl+'/api/getCompanyDetails/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },

      getUserProfileData: function () {
          return $resource(endurl+'/api/getUserProfileData/',
              {}, { 'query': { method: 'GET',isArray:false } });
      },
    }
  }]);