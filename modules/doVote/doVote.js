// THe file for the scripting code relating to the vote process
// We may update this in the future to handle multiple voting methods.

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");
  Meteor.subscribe("voteResults");

  Template.doVote.helpers({

    currentVote : function () {

      var currId = Router.current().params._id;
      console.log(currId);
      var voteRecord = votesCollection.findOne({_id:currId});

      return voteRecord;

    },

    optionPair : function () {
      console.log("logging 'this' in doVote/optionPair");
      console.log(this);

      // Here we will present the pair of options to the template

      // ALL OF THE BELOW MAY BE DONE IN THE voteInfo template...
      // Get the list of options

      // Randomize the order
      // Use Fischer-Yates algorithm

      // Store the starting order in the users profile(?)
      // TODO: Do we want to store this somewhere else?

      // Initialize the vote.
      // This will include setting initial status of vote
      // options and progress.
      // Keeping these stored in DB will allow users to recover
      // or resume their voting process.
      // TODO: We may want to set this up on an onLoad method
      // for the template... Conditionally set based on the
      // status of the vote for the particular user.

      // Based on the staus of the vote, and it's options for this
      // user, present the current pair of options to be evaluated
      // to the user.

      var currId = Router.current().params._id;
      console.log("currId in optionPair helper:")
      console.log(currId);
      var voterOptions = resultsCollection.findOne({voteId : currId, createdBy: Meteor.userId()});
      var optionsArray = voterOptions.choicesInit;
      console.log(optionsArray);
      Session.set("currentVoteBallot", voterOptions._id);
      console.log("Current ballot: " + voterOptions._id);
      // resultsCollection.findOne({voteId:"zJwaHPAZYzNkcdGTg"}).choicesInit;

      // Need to include some kind of iteration through pairs...
      // We are using the "step" value stored with the "ballot"
      var s = voterOptions.step;
      var votePair = [
        {
          optionId: optionsArray[s]._id,
          optionName: optionsArray[s].name,
          optionDesc: optionsArray[s].description
        },
        {
          optionId: optionsArray[s+1]._id,
          optionName: optionsArray[s+1].name,
          optionDesc: optionsArray[s+1].description
        }
      ];

      // Random order the pair.
      // Since it's binary for now we could just do a "coin flip".
      var coinFlip = Math.floor(Math.random() * 2);

      if (coinFlip > 0) {
        // swap the values
        var swapper = votePair[0];
        votePair[0] = votePair[1];
        votePair[1] = swapper;
      };

      return votePair;

    }

  });

  Template.doVote.events({

    "click .VA-option-thumb" : function (event) {
      event.preventDefault();
      // Here is where we can take some UI options

      console.log("clicked the option: ");
      var selectedOption = event.currentTarget.id;
      console.log(selectedOption);
      Session.set("selectedVoteOption", selectedOption);

      $(".VA-option-thumb").removeClass( "selected" );
      $(event.currentTarget).addClass( "selected" );

    },

    "click [data-action='confirmSelection']" : function (event) {
      event.preventDefault();
      console.log("confirming the selection");
      var theSelection = Session.get("selectedVoteOption");
      console.log(theSelection);

      // This is where we process the vote choice selection
      // We will get UI info on what the user has selected (or use session?)
      var ballotId = Session.get("currentVoteBallot");
      var ballotRecord = resultsCollection.findOne(ballotId);
      var nextStep = ballotRecord.step + 1;
      var numOptions = ballotRecord.choicesInit.length - 1;

      if (nextStep >= numOptions) {
        nextStep = 0;
      };
      console.log("nextStep: " + nextStep);
      // add conditional to flip back to 0? if it's > max.length of options array.
      resultsCollection.update(ballotId, {$set: {step: nextStep}});

    }

  });

};