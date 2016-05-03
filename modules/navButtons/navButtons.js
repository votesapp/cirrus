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

  });

};