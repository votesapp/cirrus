// Events and helpers for voteConfirm

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteChoices");
  Meteor.subscribe("myBallots");

  Template.voteConfirm.helpers({

    ballotResults : function () {
      var recordId = Router.current().params._id;

      var ballotData = ballotsCollection.findOne({voteId : recordId, createdBy: Meteor.userId()});

      console.log("The ballot data:");
      console.log(ballotData);

      var sortedChoices = [];

      if (!ballotData) {

        Router.go("doVote",{_id:recordId});

      } else {

        if (ballotData.ballotStatus != "incomplete") {
          // Additional conditional for non "imcomplete"
          // or "completed" ballots
          if (ballotData.ballotStatus != "completed") {
            // The ballot is neither "incomplete" or
            // "completed", so initialize a new vote
            Router.go("doVote",{_id:recordId});
          };

        } else {
          // The ballot is "incomplete", prep vote data
          var choicesArray = ballotData.choicesCurr.map(function(obj) {
            return obj._id;
          });

          // Find all choices data from choices collection
          var choicesData = choicesCollection.find({_id: {$in: choicesArray}}).fetch();

          // Sort data according to the user ballot choices order
          for (var i = choicesData.length - 1; i >= 0; i--) {
            var temp = choicesData.filter(function(obj){
              return (obj._id == choicesArray[i]);
            });
            sortedChoices[i] = temp[0];
          };

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
      // var voteId = Router.current().params._id;

      console.log("the ballotId");
      console.log(ballotId);

      // Delete the ballot to restart vote with new ballot
      ballotsCollection.remove({_id:ballotId});

      // Redirect the user to initialize a new ballot and redo the vote
      // Router.go("doVote",{_id:voteId});

    },

    "click [data-action='confirmBallot']" : function(event) {
      console.log("confirming the ballot");
      // var ballotId = Router.current().params._id;
      var ballotId = Session.get("currentVoteBallot");

      // Update the status of the ballot
      ballotsCollection.update({_id:ballotId},{$set: {ballotStatus: "completed"}});

      // Get the voteId and return user to info page to view vote results
      var voteId = ballotsCollection.findOne({_id:ballotId}).voteId;
      console.log("the vote id");
      console.log(voteId);

      // Router.go("voteInfo", {_id: voteId});
    }


  });


};