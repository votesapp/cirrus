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
  }

});