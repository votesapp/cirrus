// Helpers, events, and scripts for voteInfo template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");

  Template.voteInfo.helpers({

    voteData : function () {
      // to get the info for the vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });
    },

    voteOptions : function () {
      var recordId = Router.current().params._id;

      var returnArray = optionsCollection.find(
        {
          voteId: recordId
        }
      );
      
      return returnArray;
    }

  });
};