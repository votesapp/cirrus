if (Meteor.isClient) {
  Meteor.startup(function () {
    // Code to run on client at startup
  });

  Template.body.helpers({
    // Global helpers (is it really global?)
    container: function () {
      return null;
    },

    currentVote: function () {
      return Session.get("currentVote");
    },

    currentVoteOption: function () {
      return Session.get("currentVoteOption");
    }

  });

  Template.body.events({
    // Global events to track
    "click [data-toggle='modal']" : function (event) {
      // TODO: this method needs to be refactored
      console.log("modal clicked");
      var content = event.currentTarget.dataset.modal;
      // optionally get the target from the href?
      if (content) {
        test = content.replace(/^\//,'');
        // get the value somehow...
        Session.set("modalTemplate", test);
      } else {

        content = event.currentTarget.getAttribute("href");
        test = content.replace(/^\//,'');
        Session.set("modalTemplate", test);
      };
      console.log(test);
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
