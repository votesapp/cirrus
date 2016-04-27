// authUser_client.js
// Client side javascript for Meteor app module

if (Meteor.isClient) {

	Template.userAuth.helpers({
		data: function () {
			return null;
		}
	});

	Template.userAuth.events({

		// Let the user sign up for an account
		"submit #signupForm" : function (event) {
			event.preventDefault();
			var email = event.target.email.value;
			var accessCode = event.target.code.value;
			var password = event.target.password.value;
			var passwordConfirm = event.target.passwordConfirm.value;

			// TODO: we need to create some validations

			// DO prefinery authentication to start with
			// var apiKey = Meteor.settings.prefineryKey;
			// var accessStr = accessCode + email;
			var checkResult;
			// var validCode = Meteor.call("checkBetaCode", email);
			Meteor.call("checkBetaCode", email, function (error, result){
				if (result) {
					console.log("The result: " + result);

					if (result == accessCode) {
						console.log("the access code is correct!");

						if (password == passwordConfirm) {
							console.log("The passwords match");

							var newUser = Accounts.createUser(
								{
									email: email,
									password: password
								},

								function (error) {
									console.log("we are callback after create user");
									if (error) {
										Bert.alert({
											title: "User Auth Error: ",
											message: error.reason,
											type: "warning"
										});
									} else {
										Router.go("home");
									};
								}

							);
						};

						return result;
					} else {

						Bert.alert({
							title: "User Auth Error: ",
							message: "Access code and email do not match.",
							type: "warning"
						});
					};

				} else {
					console.log("The error: " + error);
					Bert.alert({
						title: "User Auth Error: ",
						message: error.reason,
						type: "warning"
					});
				};
				return error;
			});
			// console.log("Valid code: " + validCode);

			// console.log(apiKey);
			// var codeHash = CryptoJS.SHA1(apiKey + email);
			// var codeHash = CryptoJS.SHA1("testingsubstring");
			// codeHash = codeHash.toString().substring(0,10);
			// console.log("Codehash: " + codeHash);

			// Accounts.createUser(
			// 	{
			// 		email: email,
			// 		password: password
			// 	},

			// 	function (error) {
			// 		if (error) {
			// 			Bert.alert({
			// 				title: "User Authentication",
			// 				message: error.reason,
			// 				type: "warning"
			// 			});
			// 		} else {
			// 			Router.go("home");
			// 		};
			// 	}

			// );
			// End Accounts.createUser()


		},

		// Let the user log in to their registered account
		"submit #loginForm" : function (event) {
			event.preventDefault();
			var email = event.target.email.value;
			var password = event.target.password.value;

			Meteor.loginWithPassword(email, password, function (error){
				if (error) {
					Bert.alert({
					  title: "User Authentication:",
					  message: error.reason,
					  type: "warning"
					});
				} else {
					Router.go("home");
				};
			}); // End Meteor.loginWithPassword()
		}

	});

};
