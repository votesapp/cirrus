// File for collections


// Create main collection for votes
// This will contain all votes and related information
votesCollection = new Mongo.Collection("votesCollection");

// Here we wil store vote options or choice (and assocaited info)
// for each vote. We are using a seperate collection because we
// anticpate future rich and varied media and options to be
// available for each vote option.
optionsCollection = new Mongo.Collection("optionsCollection");

// Renaming above for better semantical association, less confusion
// optionsCollection = new Mongo.Collection("choicesCollection");

// This collection stores all user ballots for votes.
// It can considered to be parallel to the smart-contract data.
ballotsCollection = new Mongo.Collection("ballotsCollection");

// Create collection for votes results
// Vote results will be stored here for access and operation
// This may be managed in parallel with blockchain data
resultsCollection = new Mongo.Collection("resultsCollection");

// Plublications of collections for subscription
if (Meteor.isServer) {

  Meteor.publish("votesList", function () {

    var votesList = votesCollection.find({
      // we dont need to filter by user, but by published status
      // status: "published"
    });

    return votesList;
  });

  Meteor.publish("voteOptions", function () {

    var optionsList = optionsCollection.find();

    return optionsList;
  });

  // Meteor.publish("voteChoices", function () {

  //   var optionsList = choicesCollection.find();

  //   return optionsList;
  // });

  Meteor.publish("myVotes", function () {
    // this will be the list of all user votes
    var myVotes = votesCollection.find({creator: this.userId});

    return myVotes;
  });

  Meteor.publish("myBallots", function () {

    var ballotsList = ballotsCollection.find(
      {createdBy: this.userId}
      );

    return ballotsList;
  });

  Meteor.publish("voteResults", function () {
    // this will be the list of all vote results
    // may need to be combined with full votes list
    // above to create full spectrum of votes info
    // for browsing & selection...
    var voteResults = resultsCollection.find(
      // {createdBy : Meteor.userId()}
      {createdBy : this.userId}
      );

    return voteResults;
  });


};

if (Meteor.isClient) {
  // Meteor.subscribe("voteResults");
};

