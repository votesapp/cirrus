// Setting data contexts and actions for voteConfirm

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");
  Meteor.subscribe("myBallots");

  Template.voteConfirm.helpers({

    ballotResults : function () {
      // pass the ballot results to the template
      var recordId = Router.current().params._id;

      console.log("this is in voteConfirm.helpers ballotResults:")
      console.log(recordId);

      // var ballotData = ballotsCollection.find({voteId:recordId, createdBy:Meteor.userId()}).fetch();
      var ballotData = ballotsCollection.findOne({_id : recordId});
      console.log(Meteor.userId());
      console.log("The ballot data:");
      console.log(ballotData);

      // var userChoices = ballotData.choicesCurr;

      // Now we need to get the original choices data

      var choicesArray = ballotData.choicesCurr.map(function(obj) {
        return obj._id;
      });
      var choicesData = optionsCollection.find({_id: {$in: choicesArray}}).fetch();
      console.log("The choices data:");
      console.log(choicesData);

      var sortedChoices = [];
      // now we need to sort the data according to the user ballot
      for (var i = choicesData.length - 1; i >= 0; i--) {
        console.log(choicesData[i]);
        var temp = choicesData.filter(function(obj){
          return (obj._id == choicesArray[i]);
        });
        sortedChoices[i] = temp[0];
        console.log("sorted objects:");
        console.log(sortedChoices);

      };

      console.log("sorted objects:");
      console.log(sortedChoices);


      return sortedChoices;
    }

  });


};