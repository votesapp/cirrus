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

    },

    // We need handlers for all the possible editing events.

    "blur [contenteditable=true]" : function (event) {
      console.log("left editable area");
      var docId = Router.current().params._id;
      console.log("docId: " + docId);
      var dataElement = event.currentTarget.dataset.field;
      console.log("dataElement: " + dataElement);
      var dataHTML = event.currentTarget.innerHTML;
      console.log("dataHTML: " + dataHTML);
      var  dataContent = $(event.currentTarget).text();
      console.log("dataContent: ");
      console.log(dataContent);
      if (this[dataElement] != dataContent) {

        console.log("there seems to be a change");

        // maybe we can suppress reactive rendering instead of blaking
        // the element?
        var updateObj = {};
        updateObj[dataElement] = dataContent;
        // do we need to clear the field to prevent duplication?
        // It seems like "editable" elements are so controlled by
        // browser that additional content posted to it is only
        // added to the editable element...
        var result = votesCollection.update(docId,{$set: updateObj});
        console.log(result);
        event.currentTarget.innerHTML = "";

      } else {
        console.log("there apparently was no change")
      };
    }

  });
};

Meteor.methods({

  deleteOptions : function (voteId) {

    optionsCollection.remove({voteId:voteId});

  }

});