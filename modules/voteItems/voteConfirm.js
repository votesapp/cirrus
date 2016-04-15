// Setting data contexts and actions for voteConfirm

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");
  Meteor.subscribe("myBallots");

  Template.voteConfirm.helpers({

    ballotResults : function () {
      // pass the ballot results to the template
      var recordId = Router.current().params._id;

      // Get an array of choices _id's
      var ballotData = ballotsCollection.findOne({_id : recordId});
      console.log("The ballot data:");
      console.log(ballotData);
      var choicesArray = ballotData.choicesCurr.map(function(obj) {
        return obj._id;
      });

      // Find all choices data based on the array of _id's
      var choicesData = optionsCollection.find({_id: {$in: choicesArray}}).fetch();

      // Sort the data according to the user ballot choices order
      var sortedChoices = [];
      for (var i = choicesData.length - 1; i >= 0; i--) {
        var temp = choicesData.filter(function(obj){
          return (obj._id == choicesArray[i]);
        });
        sortedChoices[i] = temp[0];
      };

      console.log("sorted objects:");
      console.log(sortedChoices);

      return sortedChoices;
    }

  });

  Template.voteConfirm.events({

    "click [data-action='redoVote']" : function (event) {
      // This will let the user reset their ballot and redo the voting process

      // We delete the ballot, and redirect the user to doVote
      // which will cause re-initialization of a new ballot...
      var ballotId = Router.current().params._id;

      // We need the voteId before it is deleted since router._id is ballot id
      var voteId = ballotsCollection.findOne({_id:ballotId}).voteId;
      console.log("the voteId");
      console.log(voteId);

      // Delete the ballot
      var result = ballotsCollection.remove({_id:ballotId});

      // Redirect the user to initialize a new ballot and redo the vote
      Router.go("doVote",{_id:voteId});

    },

    "click [data-action='confirmBallot']" : function(event) {
      console.log("confirming the ballot");
      var ballotId = Router.current().params._id;
      // var ballotId = Session.get("currentVoteBallot");

      // Update the status of the ballot
      ballotsCollection.update({_id:ballotId},{$set: {ballotStatus: "completed"}});

      // Get the voteId and return user to info page to view vote results
      var voteId = ballotsCollection.findOne({_id:ballotId}).voteId;
      console.log("the vote id");
      console.log(voteId);

      Router.go("voteInfo", {_id: voteId});
    }


  });


};