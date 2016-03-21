// authUser_client.js
// Client side javascript for Meteor app module

if (Meteor.isClient) {

	Template.authUser.helpers({
		data: function () {
			return null;
		}
	});

	Template.authUser.events({

		"click some-button": function () {
			// do something
		}

	});


};