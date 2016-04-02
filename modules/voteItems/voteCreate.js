// helpers etc for voteCreate template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");

  Template.voteCreate.helpers({

  });

  Template.voteCreate.events({

    "submit #createVoteForm" : function (event) {
      // Create the vote and add to collection
      event.preventDefault();
      var title = event.target.title.value;
      var desc = event.target.description.value;
      console.log("clicked submit on voteCreateForm");

      if (title) {
        console.log(title);
        var newDoc = votesCollection.insert(
          {
            title: title,
            createdOn: new Date(),
            description: desc,
            // completed: false,
            createdBy: Meteor.userId()
          }
        );
        console.log("new doc: " + newDoc);
        // Close the  modal if one is open
        $("#mainModal").modal("hide");
        // and clear all input fields for future use.
        $("#createVoteForm input[type='text']").val("");
        $("#createVoteForm textarea").val("");

        Router.go("voteEdit", { _id:newDoc });
      } else {
        // send up an alert because the form was not valie
        Bert.alert({
          title: "Form error",
          message: "No vote title was entered.",
          type: "warning"
        });
      };



    }
  });

};