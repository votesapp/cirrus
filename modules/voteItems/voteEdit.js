// Helpers etc for voteEdit template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");

  Template.voteEdit.helpers({

    voteData : function () {
      // to get the info for the vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });

    },

    voteOptions : function () {

      // Careful on data context here...
      var recordId = Router.current().params._id;

      // There is some kind of bug in this query...
      // var returnArray = votesCollection.findOne(
      //   { _id:recordId },
      //   {fields: {voteItems: 1}}
      // ).voteItems;

      var returnArray = optionsCollection.find(
        {
          voteId: recordId
        }
      ).fetch();

      console.log("options object");
      console.log(returnArray);

      return returnArray;

    }

  });

  Template.voteEdit.events({

    "submit #addVoteItem": function (event) {
      event.preventDefault();
      var name = event.target.name.value;

      // Careful on the data context here...
      var recordId = Router.current().params._id;

      // var manId = Random.id();

      // votesCollection.update(
      //   {
      //     _id:recordId
      //   },
      //   {
      //     $push:{voteItems:{_id:manId, 'name':name, sorted:false}}
      //   }
      // );

      optionsCollection.insert(
        {
          name: name,
          voteId: recordId
        }
      );

      event.target.name.value = "";

    },

    "click .deleteVoteOption": function (event) {

      // var docId = Session.get('selectedVote');
      // var recordId = Router.current().params._id;
      var recordId = event.currentTarget.id;
      // var voteItem = event.currentTarget.name;
      console.log("trying to delete record: " + recordId);
      optionsCollection.remove(recordId);
      // votesCollection.update();

    }
  });
};