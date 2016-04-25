if (Meteor.isClient) {
  Template.myVotes.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
    });
  });

  Template.votesList.helpers({

    votesList: function () {
      // Here we will develop filters for searching and displaying different
      // groups of votes.
      return votesCollection.find({
        $or: [
          {voteStatus: "published"},
          {voteStatus: "closed"}
        ]},
        {sort: {publishedOn: -1, createdOn: -1}}).fetch();
    }

  });

  Template.votesList.events({
    // code...
  });



};