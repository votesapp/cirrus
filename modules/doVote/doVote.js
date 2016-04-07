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
      var voterOptions = resultsCollection.findOne({"voteId" : currId});
      var optionsArray = voterOptions.choicesInit;
      console.log(optionsArray);
      // resultsCollection.findOne({voteId:"zJwaHPAZYzNkcdGTg"}).choicesInit;


      // *** FOR NOW ***
      // We will just pass some dummy data
      var votePair = [
        {
          optionName: "Option One",
          optionDesc: "Describe Option One Briefly"
        },
        {
          optionName: "Option Two",
          optionDesc: "Brief description of Option Two"
        }
      ];

      // Random order the pair.
      // Use Fischer-Yates algorithm, or is there something similar
      // since it's binary? We could just do a "coin flip" on whether to swap.

      return votePair;

    }

  });

};