Meteor.methods({

  createVote: function (voteData) {
    return votesCollection.insert(voteData);
  },

  updateVote: function (voteId, voteData) {
    return votesCollection.update({_id: voteId}, {$set: voteData});
  },

  addVoteArray: function (voteId, voteData) {
    return votesCollection.update({_id: voteId}, {$push: voteData});
  },

  deleteVote: function (voteId) {
    return votesCollection.remove(voteId);
  },

  createChoice: function (choiceData) {
    return choicesCollection.insert(choiceData);
  },

  updateChoice: function (choiceId, choiceData) {
    return choicesCollection.update({_id: choiceId}, {$set: choiceData});
  },

  deleteChoice: function (choiceId) {
    // Delete this choice and pull from any votes it is associated with
    // Should this be allowed? It should be prevented from votes that are published?
    votesCollection.update({choices: choiceId}, {$pull: {choices: choiceId}});
    return choicesCollection.remove(choiceId);
  },

  deleteChoices : function (voteId) {

    check(voteId, String);
    // Delete all of the options associated with a vote.
    // Usually because the vote was deleted elsewhere.
    // As with above choice deletion, we must restrict shared choices from
    // being removed from existing votes.
    return choicesCollection.remove({voteId:voteId});

  },

  createBallot: function (ballotData) {
    return ballotsCollection.insert(ballotData);
  },

  updateBallot: function (ballotId, ballotData) {
    return ballotsCollection.update({_id: ballotId},{$set: ballotData});
  },

  deleteBallot: function (ballotId) {
    return ballotsCollection.remove(ballotId);
  },

  addBallotResults: function (ballotData) {
    // Method to calculate vote results after ballot casting.
    // We can later create a seperate dedicated method if needed.
    var ballotId = ballotData._id;
    var voteId = ballotData.voteId;

    // Set the status in ballotData
    ballotData.ballotStatus = "completed";
    // We need to pull the initialized elements from object to not
    // overwrite existing record
    delete ballotData._id, ballotData.choicesInit, ballotData.voteId;

    Meteor.call("updateBallot", ballotId, ballotData);
    // Get the sorted results from the user's ballot
    // var ballotResults = ballotsCollection.findOne({_id:ballotId}).choicesCurr;
    var ballotResults = ballotData.choicesCurr;
    // TODO: Add a check to make sure this ballot ins't completed already?

    // TODO: Maybe here we can check for the duplication of the vote. this would mean
    // this method must be called first. Perhaps it is safest to call it from here?
    // This may be most secure way to prevent dumplicate voting attempts on the client.

    // 1. Get all ballots for this vote with the status "completed"
    var voteBallots = ballotsCollection.find({voteId: voteId, ballotStatus: "completed"}).fetch();
    var numVotes = voteBallots.length;

    // 2. Count the votes.
    var countObj = {};
    for (var i = voteBallots.length - 1; i >= 0; i--) {
      // Get the array of ballot selections inside a loop for each ballot
      var choicesArray = voteBallots[i].choicesCurr;
      // Assign a value to each item
      for (var j = choicesArray.length - 1; j >= 0; j--) {
        var value = choicesArray.length - j;
        var choice = choicesArray[j]._id;
        // Add the scores
        countObj[choice] = (countObj[choice]) ? countObj[choice] + value : value;
      };

    };

    return resultsCollection.upsert({voteId: voteId}, {$set: {voteCount: countObj, castBallots: numVotes}});

  },

  updateUser: function (userData) {
    // This method can be used for updating the Meteor.user.profile field
    return Meteor.users.update({_id:Meteor.userId()},{$set: userData});
  }

});


