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

      var currId = Router.current().params._id;
      console.log("currId in optionPair helper:")
      console.log(currId);

      // Here we will present the pair of options to the template
      // Get the choices from the ballot.
      var voterOptions = ballotsCollection.findOne({voteId : currId, createdBy: Meteor.userId()});

      // Filter the result for only those choices which have not
      // been sorted by the user.
      var optionsArray = voterOptions.choicesCurr.map(function(obj) {
        if (obj.sortStatus != "sorted") {
          return obj._id;
        } else {
          return null;
        };
      });

      // Eliminate emptpy elements
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
        // There are not enough items left to compare. (ie. not two).
        // Add updating of ballot choice sorted status
        // Add updating of ballot status
        Router.go("voteConfirm");
      } else {
        // There are still items to compare
        // We need to select choice data from the optionsCollection
        // containing original choice info so that vote data is 
        // reactive and dynamic. This will ensure the choices info
        //  will be up to date.
        var optionsData = optionsCollection.find({_id: {$in: optionsArray}}).fetch();

        console.log("getting the options via $in (array)");
        console.log(optionsData);

        // To allow iteration through pairs, we are using
        // the "step" value stored with the ballot.
        // This, combined with the comparedPairs array, will
        // allow us to save the state of the ballot & process.
        // and also allow for the filtering out of redundency.
        var s = voterOptions.step;

        // Generate the choices pair to be considered by the user
        // based on the current ballot "step" and the number of choices
        // not labelled as "sorted" (ie. unsorted).
        // TODO: Add conditional to escape this when there is only
        // one option left. It this not handled above when we redirect?
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

        // Random order the pair with a "coin flip" to eliminate bias
        // based on the order of choices display order.
        var coinFlip = Math.floor(Math.random() * 2);

        if (coinFlip > 0) {
          // Swap the values
          var swapper = votePair[0];
          votePair[0] = votePair[1];
          votePair[1] = swapper;
        };

        // Send the vote pair to the view template data context
        return votePair;

      }; // End if(optionsArray.length <= 1)

    }

  });

  Template.doVote.events({

    "click .VA-option-thumb" : function (event) {
      event.preventDefault();

      // Process the user input to make a selection from choices
      console.log("clicked the option: ");
      var selectedOption = event.currentTarget.id;
      console.log(selectedOption);
      Session.set("selectedVoteOption", selectedOption);

      // Update the UI to reflect user's choice
      $(".VA-option-thumb").removeClass( "selected" );
      $(event.currentTarget).addClass( "selected" );

    },

    "click [data-action='confirmSelection']" : function (event) {
      event.preventDefault();

      // Process the user's vote ballot as indicated by use confirmation
      // of choice selection

      // Get the selected vote option:
      var theSelection = Session.get("selectedVoteOption");
      console.log("confirming the selection");
      console.log(theSelection);

      // This is where we process the vote choice selection

      // Get the relevant data
      var ballotId = Session.get("currentVoteBallot");
      // "ballotRecord" is used as the active ballot, and we will update
      // the actual ballot record with this document.
      var ballotRecord = ballotsCollection.findOne({_id:ballotId});
      var s = ballotRecord.step;

      // Get the choices id's from the user's ballot
      var activeChoices = ballotRecord.choicesCurr.map(function(obj){
        return obj._id
      });

      console.log("getting active options");
      console.log(activeChoices);

      // below needs to be modified to get the number of
      // only those choices not sorted.
      // Determin the current state ("step") of the vote, and reset the
      // choice "cycle" if needed.
      // Rather than track number of unsorted options at this point, we
      // will derive the current state, the state to update, and the next
      // state of the ballot based on the current step, and unsorted options
      // get the number of elements without .sortStatus="sorted";
      var initNumOptions = ballotRecord.choicesInit.length;
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

      var indexOffset = initNumOptions - count;
      console.log("number of unsorted choices: " + count);
      console.log("the indexOffset: " + indexOffset);
      // We only need to update the array if the user 
      // selected and "out of order" choice.

      // NOTE: Below is wrong. It will set the wrong item, since items being
      // compared are not out of full array, but out of unsorted options.
      var aElem = s + indexOffset;
      if (activeChoices[aElem] === theSelection) {
        // Swap the order of the options
        var swapper = ballotRecord.choicesCurr[aElem];
        ballotRecord.choicesCurr[aElem] = ballotRecord.choicesCurr[aElem - 1];
        ballotRecord.choicesCurr[aElem - 1] = swapper;
        console.log("We had to swap the items: ");
        console.log(activeChoices);

        // now we must also update the document
        ballotsCollection.update({_id:ballotId},{$set: {choicesCurr: ballotRecord.choicesCurr}})
      };

      // Update the iterative state of the ballot
      var nextStep = s - 1;

      if (nextStep == 0) {
        // then we are at the end of the list
        // here we will flag the last item...
        ballotRecord.choicesCurr[indexOffset].sortStatus = "sorted";
        console.log("active ballotRecord.choicesCurr: ");
        console.log(ballotRecord.choicesCurr);

        // this is duplicat of above, but how to update only
        // if necessary without duplication?
        // Should be safe as long as all operations on ballot are isolated
        // conditionally from one another.
        ballotsCollection.update({_id:ballotId},{$set: {choicesCurr: ballotRecord.choicesCurr}})

        // Reset the iteration
        // This is -2 because one less to increment, and one less to account for
        // zero indexed array that options are stored in.
        // count should never be less than 2, since the user must always compare
        // 2 options, otherwise the single last option is placed as last in sort.
        nextStep = count - 2;

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