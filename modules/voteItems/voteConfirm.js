// Events and helpers for voteConfirm

if (Meteor.isClient) {

  Template.voteConfirm.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesChoices");
      self.subscribe("myBallots");
    });

    var voteId = Router.current().params._id;
    var ballotData = ballotsCollection.findOne({voteId : voteId, createdBy: Meteor.userId()});

    if (!ballotData) {
      // There is no ballot, the user will need to
      // create one from the voting process.
      Router.go("doVote",{_id:voteId});

    } else {

      if (ballotData.ballotStatus != "incomplete") {
        // Additional conditional for non "imcomplete"
        // or "completed" ballots

        if (ballotData.ballotStatus != "completed") {
          // The ballot is neither "incomplete" or
          // "completed", so initialize a new vote
          Router.go("doVote",{_id:voteId});

        } else {
          // The ballot status is "completed"
          console.log("the ballot is completed.");
          Router.go("voteInfo",{_id:voteId});
        };
      };
    }; 
  });

  Template.voteConfirm.rendered = function () {
    // initialize draggable items / jQuery stuff
    $(function () {
      $( "#sortable" ).sortable();
      $( "#sortable" ).disableSelection();
    });
  }

  Template.voteConfirm.helpers({

    ballotResults : function () {

      // Get the ballot results to be confirmed
      var voteId = Router.current().params._id;

      var ballotData = Session.get("currentVoteBallot");

      if (!ballotData) {
        // If there was no session ballot, get the saved ballot from the DB
        ballotData = ballotsCollection.findOne({voteId : voteId, createdBy: Meteor.userId()});
      };

      console.log("The ballot data:");
      console.log(ballotData);

      var sortedChoices = [];

      if (ballotData) {

        var choicesArray = ballotData.choicesCurr.map(function(obj) {
          return obj._id;
        });

        // Find all choices data from choices collection
        var choicesData = choicesCollection.find({_id: {$in: choicesArray}}).fetch();

        // Sort data according to the user ballot order
        for (var i = choicesData.length - 1; i >= 0; i--) {

          var temp = choicesData.filter(function(obj){
            return (obj._id == choicesArray[i]);
          });

          sortedChoices[i] = temp[0];

        };

      };

      console.log("sorted objects:");
      console.log(sortedChoices);

      return sortedChoices;
    }

  });

  Template.voteConfirm.events({

    "click [data-action='redoVote']" : function (event) {
      // This will let the user reset their ballot and redo the voting process

      var ballotId = Session.get("currentVoteBallot");
      var voteId = Router.current().params._id;

      console.log("the ballotId");
      console.log(ballotId._id);

      // Delete the ballot to restart vote with new ballot
      Meteor.call("deleteBallot", ballotId._id, function (error, result) {
        if (error) {
          //throw error
        } else {
          Session.set("currentVoteBallot", null);
          Router.go("doVote", {_id: voteId});
        };
      });

    },

    "click [data-action='confirmBallot']" : function(event) {
      // Update ballot status to completed

      // Add a session get to get the actual live ballot data.
      console.log("confirming the ballot");
      var userBallot = Session.get("currentVoteBallot");
      // var ballotId = userBallot._id;
      // var voteId = ballotsCollection.findOne({_id:ballotId}).voteId;
      var voteId = Router.current().params._id;
      // var choicesSort = userBallot.choicesCurr;

      var divs = document.getElementsByName("drag-div");
      var ids = [];
      for (var i = 0; i < divs.length; i++) {
        ids[i] = {};
        ids[i]._id = divs[i].id;
      }

      userBallot.choicesCurr = ids;

      // Update the status of the ballot
      // We can also update the voteResults.
      // The update method will do the results calculation so it will
      // be run on the server.
      // We should probably just pass along the sorted choices

      Meteor.call("addBallotResults", userBallot, function (error, result) {
        if (error) {
          // throw an error
        } else {
          console.log("The current vote results");
          console.log(result);

          console.log("the vote id in ballot confirm event: ");
          console.log(voteId);

          Router.go("voteInfo", {_id: voteId});
          return result;
        };
      });

    }


  });

};


