if (Meteor.isClient) {
  Meteor.startup(function () {
    // code to run on client at startup
  });
  // counter starts at 0
  Session.setDefault('counter', 0);

  Template.body.helpers({
    // Global helpers (is it really global?)
    container: function () {
      return null;
    }
  });

  Template.body.events({
    'click button': function () {
      // Global events to track
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
