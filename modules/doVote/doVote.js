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
      // below can be refactored
      var voterOptions = ballotsCollection.findOne({voteId : currId, createdBy: Meteor.userId()});
      var optionsArray = voterOptions.choicesCurr.map(function(obj) {
        if (obj.sortStatus != "sorted") {
          return obj._id;
        } else {
          return null;
        };
      });

      optionsArray = optionsArray.filter(function(val){
        return (val);
      });

      console.log(optionsArray);
      Session.set("currentVoteBallot", voterOptions._id);
      console.log("currentVoteBallot: " + voterOptions._id);

      // If there are no unsorted options, we will redirect
      // the user. Later we need to flag the full ballot as
      // completed, then conditionally redirect at router
      // level.
      if (optionsArray.length <= 1) {
        Router.go("voteConfirm");
      };

      // We need to select now from the optionsCollection
      // so that vote data is reactive and dynamic.
      // we may have to make this based on the ballot rather
      // than the vote? Since further features allow for
      // suggested options? It has to be this way, as the
      // vote must be associated with the ballot to provent
      // incorrect ballot state if there is drift between the
      // ballot and the vote data (possible?).
      // But we will refer to current option data so that
      // the options info will be up to date.
      var optionsData = optionsCollection.find({_id: {$in: optionsArray}}).fetch();

      console.log("getting the options via $in (array)");
      console.log(optionsData);

      // To allow iteration through pairs, we are using
      // the "step" value stored with the ballot.
      // This, combined with the comparedPairs array, will
      // allow us to save the state of the ballot & process.
      var s = voterOptions.step;
      var votePair = [
        {
          optionId: optionsArray[s],
          optionName: optionsCollection.findOne(
            {_id: optionsArray[s]},
            {name:1, _id:0}
          ).name
          // optionDesc: optionsData[s].description
        },
        {
          optionId: optionsArray[s-1],
          optionName: optionsCollection.findOne(
            {_id: optionsArray[s-1]},
            {name:1, _id:0}
          ).name
        }
      ];

      console.log("voterPair[]: ");
      console.log(votePair);
          // optionId: optionsData[s-1]._id,
          // optionName: optionsData[s-1].name,
          // optionDesc: optionsData[s-1].description

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
      // QUESTION: Can this be more load than wanted? Should
      // Session..() be used instead? Can cause lost ballot
      // state.
      var ballotId = Session.get("currentVoteBallot");
      var ballotRecord = ballotsCollection.findOne({_id:ballotId});
      var s = ballotRecord.step;

      // Get the choice pair as the user selected
      // This will be as in the order in choicesCurr
      // This pair sorting iterates "downward" through the 
      // Array starting with the last element.
      // var activeOptions = [ballotRecord.choicesCurr[nextStep],ballotRecord.choicesCurr[nextStep + 1]];
      var activeOptions = ballotRecord.choicesCurr.map(function(obj){
        return obj._id
      });

      console.log("getting active options");
      console.log(activeOptions);

      // We only need to update the array if the user 
      // selected the lower choice.

      if (activeOptions[s] === theSelection) {
        // The user selected the lower option, so swap them.
        var swapper = ballotRecord.choicesCurr[s];
        ballotRecord.choicesCurr[s] = ballotRecord.choicesCurr[s - 1];
        ballotRecord.choicesCurr[s - 1] = swapper;
        console.log("We had to swap the items: ");
        console.log(activeOptions);

        // now we must also update the document
        ballotsCollection.update({_id:ballotId},{$set: {choicesCurr: ballotRecord.choicesCurr}})
      };

      // below needs to be modified to get the number of
      // only those choices not sorted.
      var filteredOptions = [];
      var numOptions = ballotRecord.choicesCurr;
      var count = 0;
      for (var i = numOptions.length - 1; i >= 0; i--) {
        if (numOptions[i].sortStatus != "sorted") {
          count++;
          filteredOptions.push(numOptions[i]);
        };
        console.log("is it filtered?");
        console.log(filteredOptions);
         
      }; 


      console.log("numOptions: " + count);
      // get the number of elements without .sortStatus="sorted";
      var initNumOptions = ballotRecord.choicesInit.length;
      var numOffset = initNumOptions - count;
      console.log("the numOffset: " + numOffset);
      var nextStep = s - 1;

      if (nextStep === 0) {
        // then we are at the end of the list
        // here we will flag the last item...
        ballotRecord.choicesCurr[numOffset].sortStatus = "sorted";
        // maybe we can just decrement here to advance
        // through the array? It's a hack though...
        console.log("active ballotRecord.choicesCurr: ");
        console.log(ballotRecord.choicesCurr);

        // this is duplicat of above, but how to update only
        // if necessary without duplication?
        ballotsCollection.update({_id:ballotId},{$set: {choicesCurr: ballotRecord.choicesCurr}})

        // reset nextStep
        // perhaps best is to do the same .count() with
        // query from helper that gets limited options.
        nextStep = numOffset - 1;

      };
      console.log("this nextStep: " + nextStep);
      // Update the ballot state "step"

      // use conditional to redirect if all vote choices
      // are labelled as "sorted". This is done in helper
      // so as to redirect any other access.
      ballotsCollection.update(ballotId, {$set: {step: nextStep}});

      // Clear the selection indicator
      $(".VA-option-thumb").removeClass( "selected" );

    }

  });

};