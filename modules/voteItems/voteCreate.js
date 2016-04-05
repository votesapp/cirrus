// helpers etc for voteCreate template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");

  Template.voteCreate.helpers({

  });

  Template.voteCreate.events({

    "submit #createVoteForm" : function (event) {
      event.preventDefault();

      // Create the vote and add to collection

      // Get data from the DOM
      var title = event.target.title.value;
      var desc = event.target.description.value;

      if (title) {
        var newDoc = votesCollection.insert(
          {
            title: title,
            createdOn: new Date(),
            description: desc,
            // completed: false,
            createdBy: Meteor.userId()
          }
        );
        // console.log("new doc: " + newDoc);

        // Close the  modal if one is open
        $("#mainModal").modal("hide");

        // and clear all input fields for future use.
        $("#createVoteForm input[type='text']").val("");
        $("#createVoteForm textarea").val("");

        // Rerout the user to the newly created vote for editing
        Router.go("voteEdit", { _id:newDoc });
      } else {
        // Create an alert because the form was not valid
        Bert.alert({
          title: "Form error",
          message: "No vote title was entered.",
          type: "warning"
        });
      };

    }
  });

};