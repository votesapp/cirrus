if (Meteor.isClient) {

  // We are setting data contexts for this template from the
  // parent template, as this template is assumed to always be
  // be nested inside another template with a data context. That 
  // context will be passed by the calling template.

  Template.voteChoicesList.events({

    "submit #addVoteChoice": function (event) {
      event.preventDefault();
      var name = event.target.name.value;

      // Careful on the data context here...
      var recordId = Router.current().params._id;

      choicesCollection.insert(
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
      choicesCollection.remove(recordId);

    }
  });

};