if (Meteor.isClient) {
  Meteor.startup(function () {
    // Code to run on client at startup
  });

  Template.body.helpers({
    // Global helpers (is it really global?)
    // NOTE: These are not being utilized
    GcurrentVote: function () {
      return Session.get("currentVote");
    },

    GcurrentVoteOption: function () {
      return Session.get("currentVoteOption");
    }

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
    }
  });
};

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
};
