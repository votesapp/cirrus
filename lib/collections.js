// File for collections


// Create main collection for votes
// This will contain all votes items and information
votesCollection = new Mongo.Collection("votesCollection");

// Here we wil store voteOptions for each vote. We are using
// a seperate collection because we anticpate future rich
// and varied media and options to be available for each
// vote option.
optionsCollection = new Mongo.Collection("optionsCollection");

// Create collection for votes results
// Vote results will be stored here for access and operation
// This may be operated in parallel with blockchain data
resultsCollection = new Mongo.Collection("resultsCollection");

// Plublications of collections for subscription
if (Meteor.isServer) {

  Meteor.publish("votesList", function () {

    var votesList = votesCollection.find({
      // we dont need to filter by user, but by published status
      // status: "published"
      // creator: this.userId
    });

    return votesList;
  });

  Meteor.publish("myVotes", function () {
    // this will be the list of all user votes
    var myVotes = votesCollection.find({creator: this.userId});

    return myVotes;
  });

  Meteor.publish("voteOptions", function () {

    var optionsList = optionsCollection.find();

    return optionsList;
  });

  Meteor.publish("voteResults", function () {
    // this will be the list of all vote results
    // may need to be combined with full votes list
    // above to create full spectrum of votes info
    // for browsing & selection...
    var voteResults = resultsCollection.find();

    return voteResults;
  });


};

