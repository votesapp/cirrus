// helpers etc for voteCreate template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");

  Template.voteCreate.helpers({

  });

  Template.voteCreate.events({

    "submit #createVoteForm" : function (event) {
      // create the vote
      event.preventDefault();
      var title = event.target.title.value;
      var desc = event.target.description.value;
      console.log("clicked submit on voteCreateForm");

      // clear the form
      $("#createVoteForm input[type='text']").val("");
      $("#createVoteForm textarea").val("");

      if (title) {
        console.log(title);
        votesCollection.insert(
          {
            title: title,
            createdOn: new Date(),
            description: desc,
            // completed: false,
            createdBy: Meteor.userId()
          }
        );
      };
    }
  });

};