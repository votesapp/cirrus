// signup_client.js
// Client side javascript for Meteor app module / handles signup

if (Meteor.isClient) {
	Template.signup.helpers({
		productionMode : function () {
			if (Meteor.settings.public.deployEnv != "development") {
				return true;
			} else {
				return null;
			};
		}
	});

	Template.signup.events({

		// Let the user sign up for an account
		"submit #signupForm" : function (event) {
			event.preventDefault();
			var email = event.target.email.value;
			var password = event.target.password.value;
			var passwordConfirm = event.target.passwordConfirm.value;
			var deploymentEnv = Meteor.settings.public.deployEnv;
			console.log("Deployment Environment: " + deploymentEnv);

			// if (deploymentEnv == "development") {
			if (true) {

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

			} else {


				// Authenticate in prefinery check callback
				var accessCode = event.target.code.value;
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


			};


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


		}

	});

};
