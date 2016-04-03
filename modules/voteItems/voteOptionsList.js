if (Meteor.isClient) {

  Template.voteOptionsList.helpers({
    voteOptions : function () {
      var recordId = Router.current().params._id;

      var returnArray = optionsCollection.find(
        {
          voteId: recordId
        },
        {
          sort: {createdOn: -1}
        }
      );
      
      return returnArray;
    }

  });

  Template.voteOptionsList.events({

    "submit #addVoteOption": function (event) {
      event.preventDefault();
      var name = event.target.name.value;

      // Careful on the data context here...
      var recordId = Router.current().params._id;

      optionsCollection.insert(
        {
          name: name,
          createdOn: new Date(),
          voteId: recordId
        }
      );

      event.target.name.value = "";

    },

    "click [data-action='deleteVoteOption']": function (event) {
      event.preventDefault();
      // var docId = Session.get('selectedVote');
      // var recordId = Router.current().params._id;
      var recordId = event.target.name;
      // var voteItem = event.currentTarget.name;
      console.log("trying to delete record: ");
      console.log(event);
      optionsCollection.remove(recordId);
      // votesCollection.update();

    }
  });

};