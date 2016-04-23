Meteor.methods({

  createVote: function (voteData) {
    return votesCollection.insert(voteData);
  },

  updateVote: function (voteId, voteData) {
    return votesCollection.update({_id: voteId}, {$set: voteData});
  },

  deleteVote: function (voteId) {
    votesCollection.remove(voteId);
  },

  createChoice: function (choiceData) {
    return choicesCollection.insert(choiceData);
  },

  updateChoice: function (choiceId, choiceData) {
    return choicesCollection.update({_id: choiceId}, {$set: choiceData})
  },

  deleteChoice: function (choiceId) {
    choicesCollection.remove(choiceId);
  },

  deleteChoices : function (voteId) {

    check(voteId, String);
    // Delete all of the options associated with a vote.
    // Usually because the vote was deleted elsewhere.
    choicesCollection.remove({voteId:voteId});

  },

  createBallot: function (ballotData) {
    return ballotsCollection.insert(ballotData);
  },

  updateBallot: function (ballotId, ballotData) {
    return ballotsCollection.update({_id: ballotId},{$set: ballotData});
  },

  deleteBallot: function (ballotId) {
    ballotsCollection.remove(ballotId);
  },

  addBallotResults: function (ballotId, voteId) {
    // Here we recalculate results if any?? YES since this is a serverside method.
    // We can later create a seperate dedicated method if needed.

    // Get the sorted results from the user's ballot
    var ballotResults = ballotsCollection.findOne({_id:ballotId}).choicesCurr;
    // add a check to make sure this ballot ins't completed already,
    // then add make it's status "completed"
    // var voteId = ballotResults.voteId;

    // Maybe here we can check for the duplication of the vote. this would mean
    // this method must be called first. Perhaps it is safest to call it from here?
    // This may be most secure way to prevent dumplicate voting attempts on the client.

    // Get all the ballots. We could do this by getting existing reults from
    // resultsCollection, but there is potential for drift of results from ballots.
    // 1. Get all ballots for this vote with the status "completed"
    var voteBallots = ballotsCollection.find({voteId: voteId, ballotStatus: "completed"}).fetch();

    console.log("making sure we have vote Ballots");
    console.log(voteBallots);
    console.log(voteBallots.length);

    // Count the votes.
    var countObj = {};
    for (var i = voteBallots.length - 1; i >= 0; i--) {
      // 1. Get the array of ballot selections inside a loop for each ballot
      var choicesArray = voteBallots[i].choicesCurr;
      console.log("in the ballots loop: " + i);
      // 1.1 Assign a value to each item
      for (var j = choicesArray.length - 1; j >= 0; j--) {
        // choicesArray[j]
        var value = choicesArray.length - j;
        var choice = choicesArray[j]._id;
        console.log("the value of this choice: " + choice + " is " + value);
        // Add the scores
        countObj[choice] = (countObj[choice]) ? countObj[choice] + value : value;
        console.log("And the score is: ");
        console.log(countObj[choice]);
      };

      // 2. Add the values to existing values in countArray
      console.log(" and now? " + i);



    };

    console.log("this is countObj: ");
    console.log(countObj);

    // TODO: Should we return ballot result instead?
    // Better semantically?
    Meteor.call("updateBallot", ballotId, {ballotStatus: "completed"})

    return resultsCollection.upsert({voteId: voteId}, {$set: {voteCount: countObj}});


    // return countObj;

  }

});