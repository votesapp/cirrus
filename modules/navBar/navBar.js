if (Meteor.isClient) {

  Template.navBar.events({

    "click .navbar-fixed-top" : function () {
    //TODO: potentially add not:(.dropdown) for the event trigger

      $('.navbar .collapse').collapse('hide');
      //TODO: check if add not:(.collapsed) for efficieny

    }

  });

};