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
						Bert.alert({
							title: "User Authentication",
							message: error.reason,
							type: "warning"
						});
					} else {
						Router.go("home");
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
