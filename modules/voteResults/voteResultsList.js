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
      // var voteRecord = votesCollection.findOne({_id: voteId});
      // voteRecord.voteCount = voteResults;
      // var list = {"you": 100, "me": 75, "foo": 116, "bar": 15};
      // var keysSorted = Object.keys(list).sort(function(a,b){return list[a]-list[b]});
      var choicesArray = Object.keys(voteResults).sort(function(a,b){return voteResults[b]-voteResults[a]});
      // console.log(keysSorted);
      // var choicesArray = Object.keys(voteResults);

      // Also get the ballot option data...
      // var choicesData = choicesCollection.find({voteId: voteId});
      var sortedChoices = [];

      if (voteResults) {


        // var choicesArray = voteResults.map(function(obj) {
        //   return obj.key(0);
        // });

        console.log("choicesArray in if()");
        console.log(choicesArray);


        // Find all choices data from choices collection
        var choicesData = choicesCollection.find({_id: {$in: choicesArray}}).fetch();
        console.log(choicesData);
        // Sort data records according to the results array order
        for (var i = choicesData.length - 1; i >= 0; i--) {

          var temp = choicesData.filter(function(obj){
            return (obj._id == choicesArray[i]);
          });
          // console.log(choicesData.filter(function(obj){return (obj._id == choicesArray[i])}));
          // add the score of the vote here
          // the sort value is in voteResults with the key in temp[0]
          // var getScore =
          // get the current id
          temp[0].score = voteResults[choicesArray[i]];

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