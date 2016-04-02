// Helpers etc for voteEdit template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");

  Template.voteEdit.helpers({

    voteData : function () {
      // to get the info for the vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });

    },

    voteOptions : function () {

      // Careful on data context here...
      var recordId = Router.current().params._id;

      // There is some kind of bug in this query...
      // var returnArray = votesCollection.findOne(
      //   { _id:recordId },
      //   {fields: {voteItems: 1}}
      // ).voteItems;

      var returnArray = optionsCollection.find(
        {
          voteId: recordId
        },
        {
          sort: {createdOn: -1}
        }
      ).fetch();

      console.log("options object");
      console.log(returnArray);

      return returnArray;

    }

  });

  Template.voteEdit.events({


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

    },

    "submit #addVoteOption": function (event) {
      event.preventDefault();
      var name = event.target.name.value;

      // Careful on the data context here...
      var recordId = Router.current().params._id;

      optionsCollection.insert(
        {
          name: name,
          createdOn: new Date(),
          voteId: recordId
        }
      );

      event.target.name.value = "";

    },

    "click [data-action='deleteVoteOption']": function (event) {
      event.preventDefault();
      // var docId = Session.get('selectedVote');
      // var recordId = Router.current().params._id;
      var recordId = event.target.id;
      // var voteItem = event.currentTarget.name;
      console.log("trying to delete record: ");
      console.log(event);
      optionsCollection.remove(recordId);
      // votesCollection.update();

    }
  });
};

Meteor.methods({

  deleteOptions : function (voteId) {

    optionsCollection.remove({voteId:voteId});

  }

});