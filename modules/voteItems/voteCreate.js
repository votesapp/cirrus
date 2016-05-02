// helpers etc for voteCreate template

if (Meteor.isClient) {
  Template.voteCreate.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
    });
  });

  Template.voteCreate.helpers({

  });

  Template.voteCreate.events({

    "submit #createVoteForm" : function (event) {
      event.preventDefault();

      // Create the vote and add to collection

      // Get data from the DOM
      var title = event.target.title.value;
      var desc = event.target.description.value;

      if (title && desc) {
        var voteData = {
          title: title,
          description: desc,
          createdOn: new Date(),
          createdBy: Meteor.userId(),
          voteStatus: "draft"
        };

        Meteor.call("createVote", voteData, function (error, result){
          if (error) {
            console.log("There was an error creating the vote: " + error);
          } else {
            Router.go("voteEdit", { _id:result});
          };

        });
        // var newDoc =
        // console.log("new doc: " + newDoc);
        // Close the  modal if one is open
        // TODO: This should be handled in the modalRouter
        $("#mainModal").modal("hide");

        // and clear all input fields for future use.
        $("#createVoteForm input[type='text']").val("");
        $("#createVoteForm textarea").val("");

        // Rerout the user to the newly created vote for editing
      } else {
        // Create an alert because the form was not valid
        Bert.alert({
          title: "Form error",
          message: "Title and description required for vote creation and editing.",
          type: "warning"
        });
      };

    }
  });

};