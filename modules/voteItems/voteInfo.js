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

  Template.voteInfo.events({

    "click [data-action='deleteVote']" : function (event) {
      event.preventDefault();
      var recordId = Router.current().params._id;

      votesCollection.remove(recordId);
      // Below has to be done through method since it deletes
      // multiple records, which can not be dont on the client side.
      Meteor.call("deleteOptions", recordId);

      Bert.alert({
        title: "Vote Deleted",
        message: "The vote <b>" + recordId + "</b> was deleted.",
        type: "danger"
      });

      // We will need to redirect after vote deletion
      Router.go("votesList");

    }

  });
};

Meteor.methods({

  deleteOptions : function (voteId) {

    optionsCollection.remove({voteId:voteId});

  }

});