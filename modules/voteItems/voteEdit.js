// Helpers etc for voteEdit template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");

  Template.voteEdit.helpers({

    voteData : function () {
      // to get the info for the vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });

    }


  });

  Template.voteEdit.events({



  });
};

