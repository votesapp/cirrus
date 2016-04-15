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
choicesCollection = new Mongo.Collection("choicesCollection");

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

  // This naming convention being depricated due to possible confusion
  Meteor.publish("voteOptions", function () {

    var optionsList = optionsCollection.find();

    return optionsList;
  });

  // This is the naming convention which will replace the above
  Meteor.publish("voteChoices", function () {

    var choicesList = choicesCollection.find();

    return choicesList;
  });

  Meteor.publish("myVotes", function () {

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

    var voteResults = resultsCollection.find(
      // {createdBy : this.userId}
      );

    return voteResults;
  });


};

if (Meteor.isClient) {
  // Meteor.subscribe("voteResults");
};

