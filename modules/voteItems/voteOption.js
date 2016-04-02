// Javascript file for voteOption template

if (Meteor.isClient) {
  Meteor.subscribe("voteOptions");

  Template.voteOption.helpers({

    optionRecord : function () {
      console.log("logging this from optionRecord helper");
      console.log(this);

      // This will likely break when using modals. Get
      // paramas from the session...
      if (this._id) {
        var recordId = this._id;
      } else {
        var recordId = Router.current().params._id;
      };

      return optionsCollection.findOne({_id:recordId});

    }

  }); // End helpers

};