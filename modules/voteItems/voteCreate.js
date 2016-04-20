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

      if (title) {
        var voteData = {
          title: title,
          description: desc,
          createdOn: new Date(),
          createdBy: Meteor.userId(),
          voteStatus: "draft"
        };

        Meteor.call("createVote", voteData, function (err, data){
          if (err) {
            console.log("There was an error creating the vote: " + err);
          } else {
            Router.go("voteInfo", { _id:data, edit:"edit" });
          };

        });
        // var newDoc =
        // console.log("new doc: " + newDoc);
        // Close the  modal if one is open
        $("#mainModal").modal("hide");

        // and clear all input fields for future use.
        $("#createVoteForm input[type='text']").val("");
        $("#createVoteForm textarea").val("");

        // Rerout the user to the newly created vote for editing
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