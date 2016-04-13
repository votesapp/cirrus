// THe file for the scripting code relating to the vote process
// We may update this in the future to handle multiple voting methods.

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");
  Meteor.subscribe("voteChoices");

  Template.doVote.onCreated(function () {
    console.log("This template instance was created!!");
      // Get the vode ID. This is not the best way?
      // var voteId = this._id;

      var voteId = Router.current().params._id;

      // Let's add a check against this user having done the
      // vote already. The UI will block this, but routing makes
      // the template accessible (unless we restrict the route?).
      // This seems the best, last point of security against that.
      // get the array?


      // The below MUST include filter for user
      // so that multiple ballots from other users
      // aren't returned for the same vote.
      var existingBallot =  ballotsCollection.findOne(
        {voteId : voteId, createdBy: Meteor.userId()}
        );

      if (existingBallot) {
        // This user has started this vote already.
        // We will eventually change this to be if(status==="completed")
        // But also we must account for initialization conditions
        console.log("This vote: " + voteId + " already initialized for user: " + Meteor.userId());
        var voteStatus = existingBallot.ballotStatus;
        console.log("voter's vote:");
        console.log(voteStatus);

        if (voteStatus === "incomplete") {
          console.log("the user has not completed this vote. Redirect to voting");
          // Router.go("doVote", {_id: voteId});
        } else {
          // NOTE: We can add additional connditions and results here...
          // Also NOTE: We will need to redirect back to voteInfo if
          // voteStatus == "completed"
          console.log("The vote was completed");
          Router.go("voteInfo", {_id: voteId});
        };

      } else {
        // since existingBallot != truthy, we will initialize the new vote for the user

        /* ********************************* */
        /* ******** Initialize Vote ******** */
        /* ********************************* */
        console.log("This is a new vote to initialize");
        // Get all of the vote choice _id's for the vote to initialize the ballot.
        var voteChoices = optionsCollection.find({voteId:voteId}).map(function(item){ 
          var obj = {_id:item._id};
          return obj;
        });

        console.log("the vote choices");
        console.log(voteChoices);

        // We now put these options in a random order to start the vote unbaised. 
        // We are using Fischer-Yates shuffle algorithm here.
        var voteShuffle = voteChoices, i = 0, j = 0, temp = null;

        for (i = voteShuffle.length - 1; i > 0; i -= 1) {
          j = Math.floor(Math.random() * (i + 1))
          temp = voteShuffle[i]
          voteShuffle[i] = voteShuffle[j]
          voteShuffle[j] = temp
        };

        console.log("shuffled choices: ");
        console.log(voteShuffle);

        // No we added it directly to the ballotsCollection, since
        // @params: 
        //   voteId - the _id of the vote being voted on.
        //   orderInit(array) - an array of the initial items shuffle.
        //   pairs(array) - track all pairs compared in the vote,
        //     which will allow us to eliminate duplicate comparisons.
        //   orderCurr(array) - the current state of the sort by the user.
        //   status[default=incomplete] - a field to track the status of the vote.

        // We use a step counter to track progress of the user through
        // each iteration of the sort, storing the state of the ballot.
        var theStep = voteShuffle.length - 1;

        // Initialize the ballot in the ballotsCollection
        var result = ballotsCollection.insert(
          {
            voteId : voteId,
            choicesInit : voteShuffle,
            choicesCurr : voteShuffle,
            createdOn: new Date(),
            createdBy: Meteor.userId(),
            ballotStatus: "incomplete",
            step: theStep
          }
        );
        console.log("initialized new vote");
        console.log(result);

      }; // end if(existingBallot)

  });

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
        Router.go("voteConfirm", {_id: voterOptions._id});
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

      // We will derive the current state, the state to update, and the next
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

      var aElem = s + indexOffset;
      if (activeChoices[aElem] === theSelection) {
        // The user selected the lower ranked option, so we will swap the elements
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

      if (nextStep <= 0) {
        // then we are at the end of the list
        // here we will flag the last item...
        ballotRecord.choicesCurr[indexOffset].sortStatus = "sorted";
        console.log("active ballotRecord.choicesCurr: ");
        console.log(ballotRecord.choicesCurr);

        // this is duplicat of above, but how to update only
        // if necessary without duplication?
        // Should be safe as long as all operations on ballot are isolated
        // conditionally from one another.
        ballotsCollection.update({_id:ballotId},{$set: {choicesCurr: ballotRecord.choicesCurr}});

        // Reset the iteration
        // This is -2 because one less to increment, and one less to account for
        // zero indexed array that options are stored in.
        // count should never be less than 2, since the user must always compare
        // 2 options, otherwise the single last option is placed as last in sort.
        nextStep = count - 2;

        if (nextStep < 1) {
          // update the last remaining ballot choice to "sorted"
          ballotRecord.choicesCurr[indexOffset+1].sortStatus = "sorted";
          ballotsCollection.update({_id:ballotId},{$set: {choicesCurr: ballotRecord.choicesCurr}});
          // Now we can set the ballot status to "completed"
          // ballotsCollection.update({_id:ballotId},{$set: {ballotStatus: "completed"}});

        };
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