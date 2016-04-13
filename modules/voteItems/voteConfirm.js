// Setting data contexts and actions for voteConfirm

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");
  Meteor.subscribe("myBallots");

  Template.voteConfirm.helpers({

    ballotResults : function () {
      // pass the ballot results to the template
      var recordId = Router.current().params._id;

      console.log("this is in voteConfirm.helpers ballotResults:")
      console.log(recordId);

      var ballotData = ballotsCollection.findOne({_id : recordId});
      console.log(Meteor.userId());
      console.log("The ballot data:");
      console.log(ballotData);


      // Now we need to get the original choices data
      var choicesArray = ballotData.choicesCurr.map(function(obj) {
        return obj._id;
      });
      var choicesData = optionsCollection.find({_id: {$in: choicesArray}}).fetch();
      console.log("The choices data:");
      console.log(choicesData);

      var sortedChoices = [];
      // now we need to sort the data according to the user ballot
      for (var i = choicesData.length - 1; i >= 0; i--) {
        console.log(choicesData[i]);
        var temp = choicesData.filter(function(obj){
          return (obj._id == choicesArray[i]);
        });
        sortedChoices[i] = temp[0];
        console.log("sorted objects:");
        console.log(sortedChoices);

      };

      console.log("sorted objects:");
      console.log(sortedChoices);


      return sortedChoices;
    }

  });

  Template.voteConfirm.events({

    "click [data-action='redoVote']" : function (event) {
      // This will let the user reset their ballot and redo the voting process

      // First change ballot status
      // What if we just delete the ballot, and redirect them to doVote
      // That will cause re-initialization of a new ballot...

      // We just need the ballot _id...
      var ballotId = Router.current().params._id;
      console.log("clicked redoVote");
      console.log(ballotId);

      var voteId = ballotsCollection.findOne({_id:ballotId}).voteId;
      // We need the voteId before it is deleted
      console.log("the voteId");
      console.log(voteId);

      var result = ballotsCollection.remove({_id:ballotId});

      Router.go("doVote",{_id:voteId});

      // Remove sorted status from ballot options (maybe just delete)

    },

    "click [data-action='confirmBallot']" : function(event) {
      console.log("confirming the ballot");
      var ballotId = Session.get("currentVoteBallot");
      ballotsCollection.update({_id:ballotId},{$set: {ballotStatus: "completed"}});
      var voteId = ballotsCollection.findOne({_id:ballotId}).voteId;
      console.log("the vote id");
      console.log(voteId);

      Router.go("voteInfo", {_id: voteId});
    }


  });


};