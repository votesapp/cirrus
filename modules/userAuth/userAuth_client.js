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
			var password = event.target.password.value;

			Accounts.createUser(
				{
					email: email,
					password: password
				},

				function (error) {
					if (error) {
						// TODO: below is causing errors. We should create
						// a global error object, and use one function to 
						// output errors.
						Bert.alert({
							title: "User Authentication",
							message: error.reason,
							type: "warning"
						});
					};
				}

			); // End Accounts.createUser()

		},

		// Let the user log in to their registered account
		"submit #loginForm" : function (event) {
			event.preventDefault();
			var email = event.target.email.value;
			var password = event.target.password.value;

			Meteor.loginWithPassword(email, password, function (error){
				// var errReason = error.reason;
				if (error) {
					Bert.alert({
					  title: "User Authentication:",
					  message: error.reason,
					  type: "warning"
					});
				};
			}); // End Meteor.loginWithPassword()
		}

	});

};
