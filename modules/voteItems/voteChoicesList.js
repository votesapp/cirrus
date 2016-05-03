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

      // Generate a random number
      var x = Math.floor(Math.random() * 16 +1);

      var choiceData = {
        name: name,
        createdOn: new Date(),
        createdBy: Meteor.userId(),
        keyColor: x
      };

      // Add the choice to the collection
      Meteor.call("createChoice", choiceData, function (error, result) {
        if (result) {
          // Add the choice to the array of choices for this vote
          Meteor.call("addVoteArray", recordId, {choices: result});
        };
      });

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
      Meteor.call("deleteChoice", recordId);

    }
  });

};

