if (Meteor.isClient) {

  Template.doVoteNav.onCreated(function () {

  });

  Template.doVoteNav.helpers({

    currentBallot : function () {
      return Session.get("currentVoteBallot");
    }

  });

  Template.doVoteNav.events({

  });

};