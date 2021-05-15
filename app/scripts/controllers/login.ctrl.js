angular.module('MyApp')
	.controller('LoginController', ['$scope', '$http', '$route', '$location', '$window', '$timeout', 'Upload', 'Entity', 'Authenticate', 'Customer', function ($scope, $http, $route, $location, $window, $timeout, Upload, Entity, Authenticate, Customer) {

		var endurl= 'http://103.252.7.5:8029';
		$scope.fieltype = 'password';
		$scope.AuthenticateUser = function () {
			Authenticate.authUser().save($scope.user).$promise.then(function (response) {
					if (response.success === true) {
						if (response.firstlogin == 0 || response.firstlogin == null) {
							$location.path('/set_new_password');
						} else
							$location.path('/dashboard');
					}
					if (response.success === false) {
						$scope.errormsg = response.message
					}
				},
				function (err) {

				});
		};

		$scope.checkuserSession = function()
        {
            $http.get("http://103.252.7.5:8029/api/checkuserSession")
            .then(function(response) {
              if(response.data.status == false)
                {
                  if(location.href != 'http://103.252.7.5:8029/#!/')
                     location.href = "http://103.252.7.5:8029"
                }
            });
        }
        $scope.checkuserSession();

		$scope.SignOut = function()
		{
			Authenticate.SignOut().query().$promise.then(function (response) {
                $location.path('/');
            });
		};

		$scope.changeFieldType = function () {
			if ($scope.fieltype == 'password') {
				$scope.fieltype = 'text';
				document.getElementById("password-eye").classList.remove('fa-eye');
				document.getElementById("password-eye").classList.add('fa-eye-slash');
			} else {
				$scope.fieltype = 'password';
				document.getElementById("password-eye").classList.remove('fa-eye-slash');
				document.getElementById("password-eye").classList.add('fa-eye');
			}
		}


		/* PAGINATION */


		$scope.checkcurrpage = function (myValue) {

			if (myValue == null || myValue == 0)
				myValue = 1;

			if (!myValue) {
				window.document.getElementById("mypagevalue").value = $scope.currentPage + 1;
				var element = window.document.getElementById("mypagevalue");
				if (element)
					element.focus();
				$scope.currentPage = $scope.currentPage;
				$scope.myValue = null;
			} else {
				$scope.dispval = "";
				if (myValue - 1 <= 0) {
					$scope.currentPage = 0;
				} else {
					$scope.currentPage = myValue - 1;

					if (!$scope.currentPage) {
						$scope.currentPage = 0;
					}
				}
			}
		};

		$scope.pagination = function (listdata) {
			$scope.recordsdisplay = [{
				value: 10,
				name: 10
			}, {
				value: 25,
				name: 25
			}, {
				value: 50,
				name: 50
			}, {
				value: 100,
				name: 100
			}, {
				value: listdata.length,
				name: 'All'
			}]
			$scope.currentPage = 0;
			$scope.pageSize = 10;
			if ($scope.myValue > listdata.length) {
				$scope.myValue = 1;
			}
			$(".loader").fadeOut("slow");
			$scope.numberOfPages = function () {
				return Math.ceil(listdata.length / $scope.pageSize);
			};
		};


		/* PAGINATION */


		/* PASSWORD STRAINTH */


		function scorePassword(pass) {
			var score = 0;
			if (!pass)
				return score;

			// award every unique letter until 5 repetitions
			var letters = new Object();
			for (var i = 0; i < pass.length; i++) {
				letters[pass[i]] = (letters[pass[i]] || 0) + 1;
				score += 5.0 / letters[pass[i]];
			}

			// bonus points for mixing it up
			var variations = {
				digits: /\d/.test(pass),
				lower: /[a-z]/.test(pass),
				upper: /[A-Z]/.test(pass),
				nonWords: /\W/.test(pass),
			}

			variationCount = 0;
			for (var check in variations) {
				variationCount += (variations[check] == true) ? 1 : 0;
			}
			score += (variationCount - 1) * 10;

			return parseInt(score);
		}

		function checkPassStrength(pass) {
			var score = scorePassword(pass);
			if (score > 80) {
				if ($scope.confirm_password === $scope.UserDetails[0].password) {
					$('#resetpassbtn').prop('disabled', false);
				}
				return "Strong";
			}
			if (score > 60) {
				if ($scope.confirm_password === $scope.UserDetails[0].password) {
					$('#resetpassbtn').prop('disabled', false);
				}
				return "Good";
			}
			if (score >= 30) {
				return "Weak";
			}


			return "";
		}

		function ColorPassword(pass) {
			var score = scorePassword(pass);
			if (score > 80)
				return "green";
			if (score > 60)
				return "#FFDB00";
			if (score >= 30)
				return "red";

			return "";
		}

		$scope.verfiPasswordConf = function (password, confpassword) {
			if (confpassword) {
				if (confpassword != password) {
					$scope.passstrenth = "Password and confirm password does not match";
					$('#resetpassbtn').prop('disabled', true);
				}
				if (confpassword === password) {
					$scope.passstrenth = (checkPassStrength(password));
				}
			}
		};


		$scope.verifyPasswordStrongness = function (passkey) {
			if (!passkey || passkey === '')
				$scope.passwordcalc = false;
			else
				$scope.passwordcalc = true;

			$scope.passstrenth = (checkPassStrength(passkey));
			$scope.passscore = (scorePassword(passkey));
			$scope.prgcol = (ColorPassword(passkey));

			$scope.verfiPasswordConf(passkey, $scope.confirm_password);

		};

		/* PASSWORD STRAINTH */


		$scope.SetNewPassword = function () {
			Authenticate.SetNewPassword().save($scope.UserDetails).$promise.then(function (response) {
				if (response.status == true) {
					Swal({
						type: response.type,
						title: response.title,
						text: response.message,
					}).then(function () {
						if (response.forgotpassword == 1) {
							$location.path('/');
							$scope.$apply();
						} else {
							$location.path('/dashboard');
							$scope.$apply();
						}
					});
				} else {
					Swal({
						type: response.type,
						title: response.title,
						text: response.message,
					})
				}
			});
		};

		//time
		$scope.time = 60;

		//timer callback
		var timer = function () {
			if ($scope.time > 0) {
				$scope.time -= 1;
				$timeout(timer, 1000);
			}
		}

		$scope.arrayObj = [{
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}, {
			otp: ''
		}];
		$scope.focusIndex = 0;

		$scope.SetFocus = function (index) {
			$scope.focusIndex = index;
		};


		$scope.SubmitOtpAnResetpassword = function () {
			var OTP = '';
			$scope.arrayObj.map(function (indval) {
				OTP = OTP + '' + indval.otp;
			});

			Authenticate.verifyOTP().query({otp:OTP.trim()}).$promise.then(function (response) {
				if (response.status === 0) {
					$('#myModal').modal('hide');
					$location.path('/set_new_password');
				} else {
					Swal({
					type: "error",
					title: "Oops!",
					text: "OTP does not match",
				})
				}
			});
		};


		$scope.ForgotPassword = function () {

			Authenticate.ForgotPassword().save($scope.user).$promise.then(function (response) {
				if (response.success === true) {
					$scope.sentotpmessage = response.message;

					$timeout(function () {
						$scope.showbtn = true;
						$timeout(timer, 1000);
					}, 20000);

				} else {
					Swal({
						type: response.type,
						title: response.title,
						text: response.message,
					}).then(function () {
						location.reload();
					})
				}
			});
		};


		$scope.openNav = false;

		$scope.ToggleNavbar = function () {
			$scope.openNav = true;
			var className = $('#sidenav').attr('class');
			if (className == 'main_sidebar animated slideInLeft') {
				$("#sidenav").removeClass("slideInLeft").addClass("slideOutLeft");
				$(".container-fluid *").attr("disabled", false);
			} else {
				$("#sidenav").addClass("slideInLeft").removeClass("slideOutLeft");
				$(".container-fluid *").attr("disabled", "disabled");
			}
		};

		$scope.hideNavbar = function () {
			$("#sidenav").removeClass("slideInLeft").addClass("slideOutLeft");
			$(".container-fluid *").attr("disabled", false);
		}


		$scope.RedirectLink = function (path) {
			$location.path(path);
		}


		function getSession()
        {
            Entity.getSession().query().$promise.then(function (response) {
                $scope.userDetails = response;    
            });   
		} getSession();
		


		// COMPANY DETAILS	

		$scope.VerifyCompanyContacts = function()
		{
			if($scope.CompanyDetails[0].email && $scope.CompanyDetails[0].email != '' && $scope.CompanyDetails[0].email != null)
            {
                Entity.VerifyCompanyEmail().save($scope.CompanyDetails[0]).$promise.then(function(response){
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

            if($scope.CompanyDetails[0].mobile && $scope.CompanyDetails[0].mobile != '' && $scope.CompanyDetails[0].mobile != 0 && $scope.CompanyDetails[0].mobile != null)
            {
                Entity.VerifyCompanyMobile().save($scope.CompanyDetails[0]).$promise.then(function(response){
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
		}

		$scope.CompanyDetails = [];
		$scope.SaveCompanyDetails = function()
		{
			if ($scope.form.file.$valid && $scope.logoimg) {
				var passeddata = {
				  file: $scope.logoimg,
				  CompanyDetails: $scope.CompanyDetails[0]
				}
			  } else {
				var passeddata = {
					CompanyDetails: $scope.CompanyDetails[0]
				}
			  }
			  Upload.upload({
				url: endurl+'/api/SaveCompanyDetails',
				data: passeddata
			  }).then(function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				// console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
			  });
		}
	
		$scope.getCompanyList = function()
		{
			Entity.getCompanyList().query().$promise.then(function(response){
				if(!response.status)
					$scope.CompanysList = response.companyList;
			});
		}

		$scope.deleteCompanyDetails = function(status, companyid)
		{

			Swal({
                title: 'Are you sure?',
                // text: status == 0?"You won't be able to revert this!":,
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: status == 0?'Yes, delete it!':"Yes, restore it!"
              }).then(function(result) {
                if (result.value) {
                    Entity.deleteCompanyDetails().query({companyid:companyid}).$promise.then(function (response) {   
                      Swal({
                        type: response.type,
                        title: response.title,
                        text: response.message,
                      }).then(function(){
                        $scope.getCompanyList();
                      })
                    });
                  }
                });
		}


		$scope.btnlbl = 'Approval'
		$scope.SetCompanyApproval = function()
		{
			if($scope.CompanyDetails && $scope.CompanyDetails.length > 0)
			{
				if($scope.CompanyDetails[0].approval != undefined && $scope.CompanyDetails[0].approval == 0)
				{
					$scope.CompanyDetails[0].approval = 1;
					$scope.btnlbl = "Disable";
				}
				else
				{
					$scope.CompanyDetails[0].approval = 0;
					$scope.btnlbl = "Aprrove"
				}
			}
		}

		$scope.getCompanyDetails = function(companyDetails)
		{
			$scope.CompanyDetails = [];

			$scope.CompanyDetails.push(companyDetails);
			if($scope.CompanyDetails[0].approval != undefined && $scope.CompanyDetails[0].approval == 0)
				{
					$scope.btnlbl = "Aprrove"
					
				}
				else
				{
					$scope.btnlbl = "Disable";
				}
		}

		$scope.getCompanyProfile = function()
		{
			Entity.getCompanyDetails().query().$promise.then(function(response){
				if(!response.status)
					$scope.CompanyDetails = response.companyDetails;
			});
		}

		$scope.getUserProfileData = function()
		{
			Entity.getUserProfileData().query().$promise.then(function(response){
				if(!response.status)
					$scope.userProfile = response.userProfile;
			});
		}


		$scope.VerifyUserContacts = function()
        {
            if($scope.userProfile[0].email && $scope.userProfile[0].email != '' && $scope.userProfile[0].email != null)
            {
                Customer.VerifyUserEmail().save($scope.userProfile[0]).$promise.then(function(response){
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

            if($scope.userProfile[0].mobile && $scope.userProfile[0].mobile != '' && $scope.userProfile[0].mobile != 0 && $scope.userProfile[0].mobile != null)
            {
                Customer.VerifyUserMobile().save($scope.userProfile[0]).$promise.then(function(response){
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

		$scope.SaveUserProfile = function()
		{
			Customer.SaveUserDetails().save($scope.userProfile[0]).$promise.then(function(response){
                Swal({
                    type: response.type,
                    title: response.title,
                    text: response.message,
                  }).then(function() {
                    if(response.status == 0)
                    {
                        $scope.getUserProfileData();
                    }
                  })
            });
		}

		$scope.setImagePreview = function(imgdata)
		{
			var reader = new FileReader();
			reader.onload = function(event) {
				$("#logoimg").attr("src",event.target.result);
			}
			reader.readAsDataURL(imgdata.files[0]);
		}

		$scope.SaveCompanyProfile = function()
		{
			if ($scope.form.file.$valid && $scope.logoimg) {
				var passeddata = {
				  file: $scope.logoimg,
				  CompanyDetails: $scope.CompanyDetails[0]
				}
			  } else {
				var passeddata = {
					CompanyDetails: $scope.CompanyDetails[0]
				}
			  }
			  Upload.upload({
				url: endurl+'/api/SaveCompanyDetails',
				data: passeddata
			  }).then(function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (resp) {
				Swal({
				  type: resp.data.type,
				  title: resp.data.title,
				  text: resp.data.message,
				}).then(function()  {
				  location.reload();
				})
			  }, function (evt) {
				var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
				// console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
			  });
		}


	}]);