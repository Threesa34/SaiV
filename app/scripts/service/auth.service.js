angular.module('MyApp')
  .factory('Authenticate', ['$resource', function ($resource) {
    var endurl= 'http://localhost:8029';
    return{

        authUser: function () {
            return $resource(endurl+'/api/authUser',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        SetNewPassword: function () {
            return $resource(endurl+'/api/SetNewPassword',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        ForgotPassword: function () {
            return $resource(endurl+'/api/ForgotPassword',
                {}, { 'save': { method: 'POST',isArray:false } });
        },
        verifyOTP: function () {
            return $resource(endurl+'/api/verifyOTP/:otp',
                {}, { 'query': { method: 'GET',isArray:false } });
        },
		getUserDetails: function () {
            return $resource(endurl+'/api/getUserDetails/:userid', {});
        },

		SignOut: function () {
            return $resource(endurl+'/api/SignOut/',
            {}, { 'query': { method: 'GET',isArray:false } });
        },
        checkConnection: function()
        {
            return "connected"
        }
    }

  }]);