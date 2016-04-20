// Helpers, events, and scripts for voteInfo template

if (Meteor.isClient) {
  Template.voteInfo.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
      self.subscribe("myVotes");
      self.subscribe("voteChoices");
      self.subscribe("myBallots");
    });
  });

  Template.voteInfo.helpers({

    menuOptions : function () {
      // menu options for vote actions
      var menuItems = {
        options: {
          align: "pull-right",
          menuAlign: "dropdown-menu-right",
          defaultName: "Save Draft"
        },
        items: [
          {name: "Save Draft", action: "saveDraft"},
          {name: "Publish Vote", action: "publishVote"},
          {seperator: true},
          {name: "Delete Vote", action: "deleteVote"}
        ]
      }

      return menuItems;
    },

    voteData : function () {
      // Get the data for the selected vote
      var recordId = Router.current().params._id;
      console.log("The recordId: " + recordId);
      if (recordId) {
        return votesCollection.findOne({ _id:recordId });
      };
    },

    isVoteOwner : function () {
      // Check if the vote is owned by the user
      if (this._id) {
        return votesCollection.findOne({ _id:this._id, createdBy: Meteor.userId()})
      };
    },

    votePublished : function () {
      if (this.voteStatus == "published") {
        return true;
      };
    },

    ballotStatus: function () {
      // Used to set the "next action" UI component to give the user
      // appropriate vote options depending on their account's
      // ballot status for the vote.

      var userBallot = ballotsCollection.findOne({voteId:this._id, createdBy:Meteor.userId()});

      // Get the status of the vote.
      var theStatus = {};
      if (userBallot) {
        console.log("the stored status");
        console.log(userBallot.ballotStatus);
        // Set the key for the ballot status to the status, with a value of true.
        // This is for template view, since no comparison can be done in the view.
        theStatus[userBallot.ballotStatus] = true;
      } else {
        console.log("No ballot status, new ballot required.");
        theStatus.noBallot = true;
      };

      console.log("This is the status of this vote");
      console.log(theStatus);

      return theStatus;
    },

    choicesList : function () {
      // Return the vote choices
      var recordId = Router.current().params._id;
      var ballotData = choicesCollection.find({voteId : recordId}, {sort: {createdOn: -1}}).fetch();

      return ballotData;
    }
  });

  Template.voteInfo.events({

    "click [data-action='saveDraft']" : function () {
      // Right now this is a pseudo event and placeholder should we
      // need to change how votes are saved (instead of below)
      Bert.alert("The vote was saved", "info");

    },

    "click [data-action='publishVote']" : function () {
      // Change the status of the vote to publish
      var voteId = Router.current().params._id;
      Meteor.call("updateVote", voteId, {voteStatus: "published"});
      Bert.alert("The vote was published!", "info");
      Router.go("myVotes");
    },

    "click [data-action='deleteVote']" : function (event) {
      event.preventDefault();

      var recordId = Router.current().params._id;

      // Delete the vote record
      Meteor.call("deleteVote", recordId);

      // Then delete all the vote options associated with the vote
      Meteor.call("deleteChoices", recordId);

      // Notify the user of the success of the delete
      Bert.alert({
        title: "Vote Deleted",
        message: "The vote <b>" + recordId + "</b> was deleted.",
        type: "danger"
      });

      // Redirect the user to other content after the vote is deleted.
      // TODO: We can implement the "previous" function instead.
      Router.go("votesList");

    },

    // TODL: We need handlers for all the possible editing events.

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
        Meteor.call("updateVote", docId, updateObj, function (err, data){
          if (err) {
            console.log("Error: " + err);
          };
          var result = data;
          console.log(result);
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

      } else {
        // TODO: Delete this statement and logic segment if not needed.
        console.log("there apparently was no change")
      };
    },

    "click [data-action='doVote']" : function (event) {
      event.preventDefault();
      console.log("clicked 'doVote': ");
      console.log(this);

      var voteId = Router.current().params._id;

      Router.go("doVote", {_id: voteId});

    }

  });
};

Meteor.methods({


});