if (Meteor.isClient) {

  Template.navBar.events({

    "click .navbar-fixed-top" : function () {
    //TODO: potentially add not:(.dropdown) for the event trigger

      $('.navbar .collapse').collapse('hide');
      //TODO: check if add not:(.collapsed) for efficieny
      // Also is this better to do with a callback for
      // the actual function being accessed though the click?
      // This would mean misclicks wouldn't close the navbar.

    }

  });

};