if (Meteor.isClient) {

  Template.voteResultsList.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
      self.subscribe("myVotes");
      self.subscribe("voteChoices");
      self.subscribe("myBallots");
      self.subscribe("voteResults");
    });
  });

  Template.voteResultsList.helpers({
    // we need to get the results
    resultsData : function () {
      var voteId = Router.current().params._id;
      var voteResults = resultsCollection.findOne({voteId: voteId}).voteCount;
      // We merge this with vote information
      var voteRecord = votesCollection.findOne({_id: voteId});
      voteRecord.voteCount = voteResults;

      // Also get the ballot option data...
      var choicesData = choicesCollection.find({voteId: voteId});
      var sortedChoices = [];

      if (voteResults) {

        var choicesArray = voteResults.map(function(obj) {
          return obj._id;
        });

        // Find all choices data from choices collection
        var choicesData = choicesCollection.find({_id: {$in: choicesArray}}).fetch();

        // Sort data according to the results array order
        for (var i = choicesData.length - 1; i >= 0; i--) {

          var temp = choicesData.filter(function(obj){
            return (obj._id == choicesArray[i]);
          });

          sortedChoices[i] = temp[0];

        };

      };
      console.log("sorted results:");
      console.log(sortedChoices);

      return sortedChoices;

    }

  });

  Template.voteResultsList.events({});

};