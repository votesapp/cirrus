if (Meteor.isClient) {

  Template.voteChoicesList.helpers({
    voteChoicesx : function () {
      var recordId = Router.current().params._id;
      // We need a conditional to display results?
      console.log("logging 'this' in voteOptionsList helper: ");
      console.log(this);

      console.log("logging 'recordId' in voteOptionsList helper: ");
      console.log(recordId);

      // how is this possible without subscription above?
      // it's always subscribed in containing templates
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

  Template.voteChoicesList.events({

    "submit #addVoteChoice": function (event) {
      event.preventDefault();
      var name = event.target.name.value;

      // Careful on the data context here...
      var recordId = Router.current().params._id;

      optionsCollection.insert(
        {
          name: name,
          createdOn: new Date(),
          createdBy: Meteor.userId(),
          voteId: recordId
        }
      );

      event.target.name.value = "";

    },

    "click [data-action='deleteVoteChoice']": function (event) {
      event.preventDefault();
      // var docId = Session.get('selectedVote');
      // var recordId = Router.current().params._id;
      var recordId = event.target.name;
      // var voteItem = event.currentTarget.name;
      console.log("trying to delete record: ");
      console.log(recordId);
      // console.log(event);
      optionsCollection.remove(recordId);

    }
  });

};