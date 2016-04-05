if (Meteor.isClient) {

  Template.navButtons.helpers({

    stateId: function () {

      // Getting the current route _id for use in template
      // for nested access.
      // TODO: Is this necessary?
      var idParam = Router.current().params._id;

      return idParam;
    }

  });

  Template.navButtons.events({

    "click [data-action='previous']" : function (event) {
      event.preventDefault();

      // Simplest history implementation.
      // TODO: We will develop a more sophisticated history
      // to allow for more logical navigation in the app.
      history.go(-1);

    }
  });

};