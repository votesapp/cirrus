// login_client.js
// Client side javascript for Meteor app module / handles login

if (Meteor.isClient) {
	Template.login.helpers({
		productionMode : function () {
			if (Meteor.settings.public.deployEnv != "development") {
				return true;
			} else {
				return null;
			};
		}
	});

	Template.login.events({

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
