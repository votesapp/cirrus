// Code for votesList template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");

  Template.votesList.helpers({

    votesList: function () {
      return votesCollection.find({},{sort: {createdAt: -1}}).fetch();
    }

  });

  Template.votesList.events({
    // code...
  });



};