if (Meteor.isClient) {
  Template.myVotes.onCreated(function () {
    var self = this;

    // self.subscribe("myVotes");
    // When this todo list template is used, get
    // the tasks we need.
    self.autorun(function () {
      self.subscribe("myVotes");
    });
  });

  Template.myVotes.helpers({

    // Helpers for myVotes
    myVotesList : function () {
      return votesCollection.find({createdBy: Meteor.userId()},{sort: {createdOn: -1}});
    },

    draftStatus: function () {
      if (this.voteStatus == "draft") {
        return true
      };
    }

  });
}
