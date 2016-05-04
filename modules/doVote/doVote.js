// THe file for the scripting code relating to the vote process
// We may update this in the future to handle multiple voting methods.

if (Meteor.isClient) {

  Template.doVote.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
      self.subscribe("voteChoices");
      self.subscribe("myVotes");
      self.subscribe("myBallots");
    });
    console.log("This template instance was created!!");

    var voteId = Router.current().params._id;
    console.log(voteId);
    var voteData = votesCollection.findOne({_id:voteId});
    console.log(voteData);


    // Only votes that are published can have a ballot cast for them
    if (voteData.voteStatus != "published") {
      // TODO: we can move this to the router?
      Router.go("voteInfo", {_id: voteId});
    };

    // Find the user's existing ballot for this vote
    var existingBallot = ballotsCollection.findOne({voteId : voteId, createdBy: Meteor.userId()});

    if (existingBallot) {

      var ballotStatus = existingBallot.ballotStatus;

      console.log("This vote: " + voteId + " already initialized for user: " + Meteor.userId());
      console.log("Voter's ballot status:");
      console.log(ballotStatus);

      if (ballotStatus != "incomplete") {
        // User can not edit this ballot.
        Router.go("voteInfo", {_id: voteId});

      } else {
        console.log("The ballotStatus was incomplete");
        // Route the user back to voteInfo if they have already completed the vote

        // Check if all options are already sorted
        var numChoices = existingBallot.choicesCurr;
        var count = 0;

        for (var i = numChoices.length - 1; i >= 0; i--) {
          if (numChoices[i].sortStatus != "sorted") {
            count++;
          };
        }; 

        if (count <= 1) {
          Router.go("voteConfirm", {_id: voteId});
        } else {
          Session.set("currentVoteBallot", existingBallot);
        };

      };

      // Get the choices from the user's ballot
      // var voterBallot = ballotsCollection.findOne({voteId : currId, createdBy: Meteor.userId()});
      // var voterBallot = Session.get("currentVoteBallot");

      // Filter and transpose the result for only those choices which have not
      // been sorted by the user.

      // var choicesArray = voterBallot.choicesCurr.map(function(obj) {
      //   if (obj.sortStatus != "sorted") {
      //     return obj._id;
      //   } else {
      //     return null;
      //   };
      // });
      // Eliminate the empty array elements created by map() above
      // choicesArray = choicesArray.filter(function(val){
      //   return (val);
      // });

      // console.log(choicesArray);
      // If we set this above, we no longer need this here.
      // Session.set("currentVoteBallot", voterBallot._id);
      // console.log("currentVoteBallot: " + voterBallot._id);

      // If there are no unsorted options, we will redirect the user to confirm their ballot
      // User's can only get to this if they have a ballot that is not "completed" so
      // they cannot re-confirm their vote.
      // if (choicesArray.length <= 1) {
        // There are not enough items left to compare. (ie. not two).
        // Add updating of ballot choice sorted status
        // Add updating of ballot status
        // This is added in the voteConfirm event below
        // Router.go("voteConfirm", {_id: voteId});

      // }; // End if(optionsArray.length <= 1)


      /* ************************************************** */
      /* we are finishing checking existing vote and ballot */
      /* ************************************************** */

    } else {
      // There is no existing ballot, initialize a new ballot for the user

      /* *********************************** */
      /* ******** Initialize Ballot ******** */
      /* *********************************** */
      console.log("This is a new ballot to initialize");

      // Build the initilization object and add it to the ballotsCollection
      // @params: 
      //   voteId(_id) - the _id of the vote being voted on.
      //   choicesInit(array) - an array of the initial choices shuffled state.
      //   choicesCurr(array) - the current state of the sort by the user.
      //   status[default=incomplete] - a field to track the status of the vote.
      //   step(int) - A step counter to track state of the ballot

      // Get an array of objects containing all of the vote choice _id's 
      var choicesArray =  votesCollection.findOne({_id: voteId}).choices;
      var choicesData = choicesCollection.find({_id: {$in: choicesArray}}).fetch();
      
      var voteChoices = choicesData.map(function(item){ 
        var obj = {_id:item._id};
        return obj;
      });

      console.log("voteId: " + voteId);
      console.log("the vote choices");
      console.log(voteChoices);

      // We now put these options in a random order to remove bias.
      // We are using the Fischer-Yates shuffle algorithm here.
      var voteShuffle = voteChoices, i = 0, j = 0, temp = null;

      for (i = voteShuffle.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1))
        temp = voteShuffle[i]
        voteShuffle[i] = voteShuffle[j]
        voteShuffle[j] = temp
      };

      console.log("shuffled choices: ");
      console.log(voteShuffle);

      // Initialize a step counter to track progress of the user through
      // each iteration of the sort, effectively storing the state of the ballot.
      // We subtract "1" to make it zero based.
      var theStep = voteShuffle.length - 1;

      // Initialize the ballot in the ballotsCollection
      var ballotData = {
        voteId : voteId,
        choicesInit : voteShuffle,
        choicesCurr : voteShuffle,
        createdOn: new Date(),
        createdBy: Meteor.userId(),
        ballotStatus: "incomplete",
        step: theStep
      }
      console.log("ballotData:");
      console.log(ballotData);

      Meteor.call("createBallot", ballotData, function (error, result) {
        if (error) {
          // throw error
        } else {
          console.log("Initialized new ballot");
          console.log(result);

          ballotData._id = result;
          Session.set("currentVoteBallot", ballotData);
        };

      });

    }; // end if(existingBallot)

    // This is where we can add the ballot to the user session.

  });

  Template.doVote.onDestroyed(function () {
    var userBallot = Session.get("currentVoteBallot");
    // delete ballotData._id, ballotData.choicesInit, ballotData.voteId, userBallot.ballotStatus;
    Meteor.call("updateBallot", userBallot._id, userBallot, null, function (error, result) {
      // this will be after updating the ballot
      if (error) {
        //throw error
      } else {
        Bert.alert("The ballot was saved", "info");
      };
    });
  });

  Template.doVote.helpers({

    currentVote : function () {

      var currId = Router.current().params._id;
      console.log(currId);
      return votesCollection.findOne({_id:currId});

    },

    votePair : function () {
      console.log("logging 'this' in doVote/votePair");
      console.log(this);

      var currId = Router.current().params._id;
      console.log("currId in votePair helper:")
      console.log(currId);

      // Genereate and present the pair of options to the template

      // Get the choices from the user's ballot
      // var voterBallot = ballotsCollection.findOne({voteId : currId, createdBy: Meteor.userId()});
      var voterBallot = Session.get("currentVoteBallot");

      // Filter and transpose the result for only those choices which have not
      // been sorted by the user.
      var choicesArray;
      if (!voterBallot) {
        return null;
      } else {

        choicesArray = voterBallot.choicesCurr.map(function(obj) {
          if (obj.sortStatus != "sorted") {
            return obj._id;
          } else {
            return null;
          };
        });
        // Eliminate the empty array elements created by map() above
        choicesArray = choicesArray.filter(function(val){
          return (val);
        });
        console.log(choicesArray);
        // If we set this above, we no longer need this here.
        // Session.set("currentVoteBallot", voterBallot._id);
        console.log("currentVoteBallot: " + voterBallot._id);

        // Get the current state of the iteration
        var s = voterBallot.step;

        var choiceA = choicesCollection.findOne({_id: choicesArray[s]});
        var choiceB = choicesCollection.findOne({_id: choicesArray[s-1]});

        var votePair = [
          {
            choiceId: choiceA._id,
            // choiceName: choicesCollection.findOne(
            //   {_id: choicesArray[s]},
            //   {name:1, _id:0}
            // ).name,
            choiceName: choiceA.name,
            // choiceDesc: choicesCollection.findOne(
            //   {_id: choicesArray[s]},
            //   {name:1, _id:0}
            // ).description
            keyColor: choiceA.keyColor
            // optionDesc: optionsData[s].description
          },
          {
            choiceId: choiceB._id,
            // choiceName: choicesCollection.findOne(
            //   {_id: choicesArray[s-1]},
            //   {name:1, _id:0}
            // ).name,
            choiceName: choiceB.name,
            // choiceDesc: choicesCollection.findOne(
            //   {_id: choicesArray[s]},
            //   {name:1, _id:0}
            // ).description
            keyColor: choiceB.keyColor
          }
        ];

        console.log("voterPair[]: ");
        console.log(votePair);

        // TODO: Add tracking of pairs to reduce redundency
        // ballotsCollection.update({_id:...},{choicePairs:votePair});

        // Random order the pair with a "coin flip" to eliminate bias
        var coinFlip = Math.floor(Math.random() * 2);

        if (coinFlip > 0) {
          var swapper = votePair[0];
          votePair[0] = votePair[1];
          votePair[1] = swapper;
        };

        // Send the vote pair to the view
        return votePair;
      }; // end if(!voterBallot)




    }

  });

  Template.doVote.events({

    "click .VA-choice-thumbx" : function (event) {
      // This is not in use at the moment. Consider for removal.
      event.preventDefault();

      // Process the user input to make a selection from choices
      console.log("clicked the option: ");
      var selectedChoice = event.currentTarget.id;
      console.log(selectedChoice);
      Session.set("selectedVoteChoice", selectedChoice);

      // var theSelection = event.currentTarget.id;

      // Update the UI to reflect user's choice
      $(".VA-choice-thumb").removeClass( "selected" );
      $(event.currentTarget).addClass( "selected" );
      $("[data-action='confirmSelection']").removeClass( "disabled" );

    },

    "click [data-action='confirmSelection']" : function (event) {
      event.preventDefault();
      var eTag = event.target.tagName;
      if (eTag != "A" && eTag != "BUTTON" || event.target == event.currentTarget) {
        // This means we accept the target that was clicked
        // Process the user's vote ballot as indicated by use confirmation
        // of choice selection

        // Get the selected vote option:
        // We will now be getting this from the DOM
        var theSelection = event.currentTarget.dataset.item;
        // var theSelection = Session.get("selectedVoteChoice");
        console.log("confirming the selection");
        console.log(theSelection);

        // This is where we process the vote choice selection

        // "ballotRecord" is used as the active ballot, and we will update
        // the actual ballot record with this object.
        var ballotRecord = Session.get("currentVoteBallot");
        var ballotId = ballotRecord._id;

        // Get the current ballot step
        var s = ballotRecord.step;

        // Get the choices id's from the user's ballot
        var activeChoices = ballotRecord.choicesCurr.map(function(obj){
          return obj._id
        });

        console.log("getting active options");
        console.log(activeChoices);

        // We will derive the current state, and update the state of the ballot
        // based on the current step, and unsorted options

        var numChoices = ballotRecord.choicesCurr;
        var filteredOptions = [];
        var count = 0;

        for (var i = numChoices.length - 1; i >= 0; i--) {
          if (numChoices[i].sortStatus != "sorted") {
            count++;
            filteredOptions.push(numChoices[i]);
          };
        }; 

        console.log("number of unsorted choices: " + count);


        var indexOffset = numChoices.length - count;
        console.log("the indexOffset: " + indexOffset);

        // We only need to update the array if the user 
        // selected an "out of order" choice. aElem is the lower choice
        var aElem = s + indexOffset;
        var theChoices = ballotRecord.choicesCurr;
        if (activeChoices[aElem] === theSelection) {
          // The user selected the "lower" ranked option, so we will swap the elements
          var swapper = theChoices[aElem];
          theChoices[aElem] = theChoices[aElem - 1];
          theChoices[aElem - 1] = swapper;
          console.log("We had to swap the items: ");
          console.log(activeChoices);

        };

        // Update the iterative state of the ballot
        var nextStep = s - 1;

        if (nextStep <= 0) {
          // then we are at the end of the cycle
          // here we will flag the last item...
          ballotRecord.choicesCurr[indexOffset].sortStatus = "sorted";
          if (count <= 2) {
            // THere are less than enough items to compare.
            // This is because after this confirmation of selection, there will be one less choice
            // so that means one last choice
            // Go to voteConfirm
            // ballotRecord.choicesCurr[indexOffset - 1].sortStatus = "sorted";
            Router.go("voteConfirm", {_id: ballotRecord.voteId});
          } else {


          };
          console.log("active ballotRecord.choicesCurr: ");
          console.log(ballotRecord.choicesCurr);

          // Reset the iteration
          // This is -2 because one less to increment, and one less to account for
          // zero indexed array that options are stored in.
          nextStep = count - 2;

          // The count should never be less than 2 (zero based "1"), since the user must always compare
          // 2 options, otherwise the single last option is placed as last with status "sorted"
          if (nextStep < 1) {
            ballotRecord.choicesCurr[indexOffset+1].sortStatus = "sorted";
          };

        };
        
        // Update the ballot state "step"
        ballotRecord.step = nextStep;
        console.log("this nextStep: " + nextStep);
        Session.set("currentVoteBallot", ballotRecord);

/* ****************** */
        } else {
          // Otherwise we reject the click event
          console.log("event.currentTarget is: ");
          console.log(event.currentTarget);
          console.log("event.target is: ");
          console.log(event.target);
          console.log("event.target.tagName is: ");
          console.log(event.target.tagName);
        };


      // };


      // Reset the selection UI
      // $(".VA-choice-thumb").removeClass( "selected" );
      // $("[data-action='confirmSelection']").addClass( "disabled" );

    },

    "click [data-action='prevStep']" : function (event) {
      event.preventDefault();
      // Meteor.call("updateBallot", step: -1);

    }

  });

};

