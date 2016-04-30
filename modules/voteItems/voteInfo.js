// Helpers, events, and scripts for voteInfo template

if (Meteor.isClient) {
  Template.voteInfo.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
      self.subscribe("voteChoices");
      self.subscribe("myVotes");
      self.subscribe("myBallots");
      self.subscribe("voteResults");
    });
  });


  Template.voteInfo.helpers({

    voteData : function () {
      // Get the data for the selected vote
      var recordId = Router.current().params._id;
      console.log("The recordId: " + recordId);
      if (recordId) {
        // Is this causing a problem on reactive re-render after deleteVote
        // causes undefined result from below before redirectin to new route?
        var recordData = votesCollection.findOne({ _id:recordId })
        return (recordData) ? recordData : null;
      };
    },

    ballotStatus: function () {
      // Used to determin if the user can see results.

      var userBallot = ballotsCollection.findOne({voteId:this._id, createdBy:Meteor.userId()});

      // Get the status of the vote.
      var theStatus = {};
      if (userBallot) {
        console.log("the stored status");
        console.log(userBallot.ballotStatus);
        // Set the key for the ballot status to the status, with a value of true.
        // This is for template view, since no comparison can be done in the view.
        theStatus[userBallot.ballotStatus] = true;
        console.log(theStatus);

      } else {
        console.log("No ballot status, new ballot required.");
        theStatus.noBallot = true;
      };

      return theStatus;

    },

    choicesList : function () {
      // Return the vote choices
      var recordId = Router.current().params._id;
      var choicesArray = votesCollection.findOne({_id: recordId}).choices;
      var choicesData = choicesCollection.find({_id: {$in: choicesArray}}, {sort: {createdOn: -1}}).fetch();

      return choicesData;
    },

    voteResults : function () {
      // We are using the voteResults helpers for this instead...
    },

    dropMenuData : function () {
      // Menu options for vote actions dropdown menu. We are defining next actions for votes 
      // using this menu.
      // We rely on router access filtering to handle and resolve any conflicts.

      var ballotStatus;
      var user = Meteor.userId();
      var creator = this.createdBy;
      var dropMenu = {
        config: {
          align: "",
          menuAlign: "dropdown-menu-right",
          style: "btn-default"
        }
      };
      var edit = Router.current().params.edit;
      var userBallot = ballotsCollection.findOne({voteId:this._id, createdBy:Meteor.userId()});

      if (userBallot) {
        console.log("the stored status");
        console.log(userBallot.ballotStatus);
        // Set the key for the ballot status to the status, with a value of true.
        // This is for template view, since no comparison can be done in the view.
        ballotStatus = userBallot.ballotStatus;
      };

      if (edit == "edit") {

        // The user is assumed creator to access /edit
        console.log("we are having a 'edit' menu");
        dropMenu.items = [
          {name: "Save Draft", action: "saveDraft"},
          {name: "Publish Vote", action: "publishVote"},
          {seperator: true},
          {name: "Delete Vote", action: "deleteVote"}
        ];

      } else {

        if (user != creator) {
          console.log("this is not the vote creator")
          // User is not creator, and is not editing the vote
          // We are assuming that routes restrict access to non-published votes
          // for non-creators of the votes
          if (this.voteStatus != "published") {
            // display nothing
            dropMenu.items = null;
          } else {
            if (ballotStatus == "completed") {
              // we should not show a button
              dropMenu.items = null;
              console.log("completed ballot, non-creator. voteInfo.js:121, this is a bug");
            } else if (ballotStatus == "incomplete") {
              console.log("incomple ballot, but closed vote")
              dropMenu.items = [
                {name: "Continue Vote", action: "doVote"}
              ];
            } else {
              dropMenu.items = [
                {name: "Take Vote", action: "doVote"}
              ];
            };
          };


          dropMenu.config.style = "btn-info";

        } else {

          console.log("this user created this vote");
          // User is creator of vote, and not editing
          if (this.voteStatus == "published") {

            dropMenu.items = [
              {name: "Close Vote", action: "closeVote"},
              {name: "Archive Vote", action: "archiveVote"}
            ];
            if (ballotStatus == "incomplete"){
              // Put the voting action "Do Vote" as the first item in the menu
              dropMenu.items.unshift({name: "Continue Vote", action: "doVote"});
            } else if (ballotStatus != "completed") {
              // Put the voting "continue" action as the first item in the menu
              dropMenu.items.unshift({name: "Take Vote", action: "doVote"});
            };

          } else {

            // display options for creator of unpublished vote, not editing
            if (this.voteStatus == "draft") {
              dropMenu.items = [
                {name: "Edit Vote", action: "editVote"},
              ];

              dropMenu.config.style = "btn-warning";

            } else if (this.voteStatus == "closed"){
              // Allow the user to archive the vote
              dropMenu.items = [{name: "Archive Vote", action: "archiveVote"}];
            } else if (this.voteStatus == "archived") {
              // Allow the user to un-archive the vote to "closed" status
              dropMenu.items = [{name: "Unarchive Vote", action: "closeVote"}];
            };

          };
          
        };
      };

      if (dropMenu.items.length == 1) {
        // there is only one option, and flag as such
        dropMenu.config.singleton = true;
      };

      return dropMenu;
    }


  });

  Template.voteInfo.events({

    "click [data-action='saveDraft']" : function () {
      // Right now this is a pseudo event and placeholder should we
      // need to change how votes are saved (instead of below)
      var voteId = Router.current().params._id;
      Bert.alert("The vote was saved", "info");
      Router.go("voteInfo", {_id:voteId});

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

    "click [data-action='closeVote']" : function () {
      // Change the status of the vote to publish
      // TODO: We may need to check for ownership of the vote
      var voteId = Router.current().params._id;
      Meteor.call("updateVote", voteId, {voteStatus: "closed", closedOn: new Date()}, function (error, result) {
        if (error) {
          //throw error
        } else {
          Bert.alert("The vote was closed!", "info");
          Router.go("myVotes");
        };
      });
    },

    "click [data-action='archiveVote']" : function () {
      // Change the status of the vote to publish
      var voteId = Router.current().params._id;
      Meteor.call("updateVote", voteId, {voteStatus: "archived", archivedOn: new Date()});
      Bert.alert("The vote was archived!", "info");
      Router.go("myVotes");
    },

    "click [data-action='editVote']" : function () {
      // Right now this is a pseudo event and placeholder should we
      // need to change how votes are saved (instead of below)
      var voteId = Router.current().params._id;
      Router.go("voteInfo", {_id:voteId, edit:"edit"});

    },

    "click [data-action='deleteVote']" : function (event) {
      event.preventDefault();

      var recordId = Router.current().params._id;

      // Delete the vote record
      Meteor.call("deleteVote", recordId, function (error, result) {
        if (error) {
          //throw error
        } else {
          // Then delete all the vote options associated with the vote
          // We are not doing this so choices will be able to be
          // re-used in the future.
          // Meteor.call("deleteChoices", recordId);

          // Notify the user of the success of the delete
          Bert.alert({
            title: "Vote Deleted",
            message: "The vote <b>" + recordId + "</b> was deleted.",
            type: "danger"
          });

          // Redirect the user to other content after the vote is deleted.
          // TODO: We can implement the "previous" function instead.
          Router.go("votesList");
        };
      });


    },

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

      var voteId = Router.current().params._id;

      Router.go("doVote", {_id: voteId});

    }

  });
};
