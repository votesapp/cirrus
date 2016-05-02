// Helpers etc for voteEdit template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");

  Template.voteEdit.helpers({

    editVoteData : function () {
      // to get the info for the vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });

    },

    editChoicesList : function () {

      var recordId = Router.current().params._id;
      var choicesArray = votesCollection.findOne({_id: recordId}).choices;
      var choicesData;
      if (choicesArray) {
        choicesData = choicesCollection.find({_id: {$in: choicesArray}}, {sort: {createdOn: -1}}).fetch();
      };

      return choicesData;
    }


  });

  Template.voteEdit.events({

    "blur [contenteditable=true]" : function (event) {
      // This is a function to handle editing of content by the user.
      // The user is allowed to edit the content in the DOM element
      // using the `contenteditable` attribute. This bypasses the
      // need for handling forms, allowing for real time updating and
      // saving of data. However it does present UI/UX challenges
      // in maintaining the state of the DOM whill giving power
      // over the DOM to the browser.

      // Get the data from the DOM of the element the user has edited.
      var docId = Router.current().params._id;
      var dataElement = event.currentTarget.dataset.field;

      // Parse the content
      // TODO: Develop more sophisticated parsing/stripping/etc.
      var dataContent = $(event.currentTarget).text();

      if (this[dataElement] != dataContent) {
        // If there was a change to the content

        console.log("there seems to be a change");

        // Update the collection based on the collected data.
        var updateObj = {};
        updateObj[dataElement] = dataContent;
        Meteor.call("updateVote", docId, updateObj, function (error, result){
          if (error) {
            console.log("Error: " + error);
          } else {
            console.log(result);
          };

        });
        // var result = votesCollection.update(docId,{$set: updateObj});
        // Do we need to clear the field to prevent duplication?
        // It seems like "editable" elements are so controlled by
        // browser that additional content posted to it is only
        // added to the editable element...
        // TODO: This can cause UI glitches as the DOM rerenders.
        // Maybe we can suppress reactive rendering instead of blanking
        // the element?

        // WHATIF: Instead of blaking the content, we set it to the value
        // that was used to update the collection. Maybe Meteor would
        // detect no change, and not rerender the element?
        event.currentTarget.innerHTML = "";

      };
    },

    "click [data-action='publishVote']" : function () {
      // Change the status of the vote to publish
      var voteId = Router.current().params._id;
      Meteor.call("updateVote", voteId, {voteStatus: "published", publishedOn: new Date()}, function (error, result) {
        if (error) {
          //throw error
        } else {
          Bert.alert("The vote was published!", "info");
          Router.go("myVotes");
        };
      });
    },


  });
};

