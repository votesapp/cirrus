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

      // There is some kind of bug in this query...
      // var returnArray = votesCollection.findOne(
      //   { _id:recordId },
      //   {fields: {voteItems: 1}}
      // ).voteItems;

      var returnArray = optionsCollection.find(
        {
          voteId: recordId
        }
      );
      
      return returnArray;

    }

  });
};