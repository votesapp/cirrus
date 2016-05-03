if (Meteor.isClient) {
  Meteor.startup(function () {
    // Code to run on client at startup
  });

  Template.body.helpers({
    // Global helpers (is it really global?)
    // NOTE: These are not being utilized

  });

  Template.body.events({
    // Global event for linking and navigating that
    // eliminates the need for wrapper anchor elements.
    "click [data-nav]": function (event) {
      event.preventDefault();
      var tar = event.currentTarget.dataset.nav;
      var theId = Router.current().params._id;
      Router.go(tar, {_id:theId});
    },

    // Global event for logging out the current user
    "click [data-action='logoutUser']": function (event) {
      event.preventDefault();
      Meteor.logout();
    },

    "click [data-action='previous']" : function (event) {
      event.preventDefault();

      // Simplest history implementation.
      // TODO: We will develop a more sophisticated history
      // to allow for more logical navigation in the app.
      history.go(-1);

    }

  });
};

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
};
