if (Meteor.isClient) {
  Meteor.startup(function () {
    // Code to run on client at startup
  });

  Template.body.helpers({
    // Global helpers (is it really global?)
    container: function () {
      return null;
    }
  });

  Template.body.events({
    // Global events to track
    "click .demo" : function (event) {
      console.log(".demo clicked");
      console.log(event);
      // code...
    },

    // Global event for linking and navigating that
    // eliminates the need for wrapper anchor tags
    "click [data-nav]": function (event) {
      var tar = event.currentTarget.dataset.nav;
      Router.go(tar);
    },

    // Global event for logging out the current user
    "click [data-action='logoutUser']": function (event) {
      event.preventDefault();
      Meteor.logout();
    }
  });
};

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
};
