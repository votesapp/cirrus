if (Meteor.isClient) {

  Template.doVoteNav.onCreated(function () {

  });

  Template.doVoteNav.helpers({

    currentBallot : function () {
      // here we will define conditionals for UI
      var ballotObj = Session.get("currentVoteBallot");
      var numChoices = ballotObj.choicesCurr;
      var optsNum = ballotObj.choicesCurr.length;

      // define a thresholed

      console.log(optsNum);

      // we want a minimum value of 1, but only when optionsNum is > 5
      // and then the value below that will be rounded...
      var x = 5 - optsNum;
      var sortThreshold = (x <= 0) ? 1 : x + 1; 

      console.log("in doVoteNav.js:22, getting values of ");
      console.log(sortThreshold);

      var sortedOptions = [];
      var count = 0;

      for (var i = numChoices.length - 1; i >= 0; i--) {
        if (numChoices[i].sortStatus == "sorted") {
          count++;
          // sortedOptions.push(numChoices[i]);
        };
      }; 

      console.log("sorted count: ");
      console.log(count);

      if (count < sortThreshold) {
        ballotObj.accel = "disabled";
      } else {
        // ballotObj.accel = null;
      };

      // ballotObj.accel = "disabled";

      // return Session.get("currentVoteBallot");
      return ballotObj;
    }

  });

  Template.doVoteNav.events({

  });

};