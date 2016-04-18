// Code for votesList template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");

  Template.votesList.helpers({

    votesList: function () {
      // Here we will develop filters for searching and displaying different
      // groups of votes.
      return votesCollection.find({},{sort: {createdOn: -1}}).fetch();
    }

  });

  Template.votesList.events({
    // code...
  });



};