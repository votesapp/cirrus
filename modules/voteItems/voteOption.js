// Javascript file for voteOption template

if (Meteor.isClient) {
  Meteor.subscribe("voteOptions");

  Template.voteOption.helpers({

    voteOption : function () {

      // This will likely break when using modals. Get
      // paramas from the session...
      var recordId = Router.current().params._id;

      return optionsCollection.findOne({_id:recordId});

    }

  }); // End helpers

};