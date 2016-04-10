// Helpers, events, and scripts for voteInfo template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");
  // this is for initializing votes
  Meteor.subscribe("myBallots");

  Template.voteInfo.helpers({

    voteData : function () {
      // Get the data for the selected vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });
    },

    isVoteOwner : function () {
      // return if the vote is owned by the user
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId, createdBy: Meteor.userId()})

    },

    ballotStatus: function () {

      // This is so we can set the "next action" UI
      // component to give appropriate vote options
      // to the user depending on their account's
      // relationship to the vote.
      var recordId = Router.current().params._id;
      console.log("the _id of the vote: ");
      console.log(recordId);
      // Add check for ownership of vote in
      // addition to below
      // TODO: what happens when there is no status set?
      var profileVoted = ballotsCollection.findOne({voteId:recordId, createdBy:Meteor.userId()});

      // var ballotStatus = profileVoted.ballotStatus;
      console.log(profileVoted);

      var theStatus = {};
      // More conditionals are needed to check
      // for ownership and published status.
      if (profileVoted) {
        console.log("the stored status");
        console.log(profileVoted.ballotStatus);
        theStatus[profileVoted.ballotStatus] = true;
      } else {
        console.log("not status, new ballot required");
        theStatus.noBallot = true;
      };

      // We are overriding this helper to debug.
      // var status = "new";

      console.log("This is the status of this vote");
      console.log(theStatus);

      return theStatus;
    }
  });

  Template.voteInfo.events({

    "click [data-action='deleteVote']" : function (event) {
      event.preventDefault();

      // Delete the selected vote
      var recordId = Router.current().params._id;

      votesCollection.remove(recordId);

      // Then delete all the vote options associated with the vote
      // NOTE: Below has to be done through a method since it deletes
      // multiple records, which can not be done on the client side.
      Meteor.call("deleteOptions", recordId);

      // Notify the user of the success of the delete
      Bert.alert({
        title: "Vote Deleted",
        message: "The vote <b>" + recordId + "</b> was deleted.",
        type: "danger"
      });

      // Redirect the user to other content after the vote is deleted.
      // TODO: We can implement the "previous" function instead.
      Router.go("votesList");

    },

    // TODL: We need handlers for all the possible editing events.

    "blur [contenteditable=true]" : function (event) {
      // This is a function to handle editing of content by the user.
      // The user is allowed to edit the content in the DOM element
      // using the `contenteditable` attribute. This bypasses the
      // need for handling forms, allowing for real time updating and
      // saving of data. However it does present UI/UX challenges
      // in maintaining the state of the DOM whill giving power
      // over the DOM to the browser.

      // Get the data from the DOM of the element the user has edited.
      var docId = Router.current().params._id;
      var dataElement = event.currentTarget.dataset.field;

      // Parse the content
      // TODO: Develop more sophisticated parsing/stripping/etc.
      var dataContent = $(event.currentTarget).text();

      if (this[dataElement] != dataContent) {
        // If there was a change to the content

        console.log("there seems to be a change");

        // Update the collection based on the collected data.
        var updateObj = {};
        updateObj[dataElement] = dataContent;
        var result = votesCollection.update(docId,{$set: updateObj});
        // Do we need to clear the field to prevent duplication?
        // It seems like "editable" elements are so controlled by
        // browser that additional content posted to it is only
        // added to the editable element...
        // TODO: This can cause UI glitches as the DOM rerenders.
        // Maybe we can suppress reactive rendering instead of blanking
        // the element?
        console.log(result);

        // WHATIF: Instead of blaking the content, we set it to the value
        // that was used to update the collection. Maybe Meteor would
        // detect no change, and not rerender the element?
        event.currentTarget.innerHTML = "";

      } else {
        // TODO: Delete this statement and logic segment if not needed.
        console.log("there apparently was no change")
      };
    },

    "click [data-action='doVote']" : function (event) {
      event.preventDefault();
      // Prepare the data for voting....
      // Eventually we wont to do it onLoad of doVote template/module
      console.log("clicked 'doVote': ");
      console.log(this);

      // Get the vode ID. This is not the best way?
      // var voteId = this._id;

      var voteId = Router.current().params._id;

      // Let's add a check against this user having done the
      // vote already. The UI will block this, but routing makes
      // the template accessible (unless we restrict the route?).
      // This seems the best, last point of security against that.
      // get the array?
      // var profileVote = Meteor.user().profile.votes;
      // The below does not work because it is not supported by meteorDB.
      // var profileVoted =  Meteor.users.findOne(
      //   {'profile.votes.voteId' : voteId},
      //   {'profile.votes.$': 1}
      //   );


      // The below MUST include filter for user
      // so that multiple ballots from other users
      // aren't returned for the same vote.
      var existingBallot =  ballotsCollection.findOne(
        {voteId : voteId, createdBy: Meteor.userId()}
        );

      if (existingBallot) {
        // This user has started this vote already.
        // We will eventually change this to be if(status==="completed")
        // But also we must account for initialization conditions
        console.log("This vote: " + voteId + " already initialized for user: " + Meteor.userId());
        var voteStatus = existingBallot.ballotStatus;
        console.log("voter's vote:");
        console.log(voteStatus);

        if (voteStatus === "incomplete") {
          console.log("the user has not completed this vote. Redirect to voting");
          // add other conditionals for other statuses. If more than 3, do we want
          // to use switch()? is it worth it now?
          Router.go("doVote", {_id: voteId});
        } else {
          console.log("The vote was completed");
        };

      } else {
        // since profileVote != truthy, we will initialize the new vote for the user
        console.log("This is a new vote to initialize");
        // Get all of the vote choices for the vote
        // To initialize the ballot.
        var voteChoices = optionsCollection.find({voteId:voteId}).map(function(item){ 
          var obj = {_id:item._id};
          return obj;
        });

        console.log("the vote choices");
        console.log(voteChoices);

        // We now put these options in a random order to 
        // start the vote unbaised. 
        // We are using Fischer-Yates shuffle algorithm here.
        var voteShuffle = voteChoices, i = 0, j = 0, temp = null;

        for (i = voteShuffle.length - 1; i > 0; i -= 1) {
          j = Math.floor(Math.random() * (i + 1))
          temp = voteShuffle[i]
          voteShuffle[i] = voteShuffle[j]
          voteShuffle[j] = temp
        };

        console.log("shuffled choices: ");
        console.log(voteShuffle);

        // No we added it directly to the ballotsCollection, since
        // @params: 
        //   voteId - the _id of the vote being voted on.
        //   orderInit(array) - an array of the initial items shuffle.
        //   pairs(array) - track all pairs compared in the vote,
        //     which will allow us to eliminate duplicate comparisons.
        //   orderCurr(array) - the current state of the sort by the user.
        //   status[default=incomplete] - a field to track the status of the vote.

        // NOTE: This is only if ballots are going in
        // the users collection as a nested object.
        // The big downside is that you cant use
        // "dot" concatenation for nested array
        // filters beyone one level. So you can't do
        // that if storing ballot in Meteor.users

        // Build the object first
        // var voteObj = {
        //   voteId: voteId,
        //   orderInit: voteShuffle,
        //   status: "incomplete"
        // };

        // Initialize the vote in the user's profile field in users collection.
        // var result = Meteor.users.update(Meteor.userId(), {$push: {'profile.votes': voteObj}});

        var theStep = voteShuffle.length - 1;

        // Initialize the ballot in the ballotsCollection.
        var result = ballotsCollection.insert(
          {
            voteId : voteId,
            choicesInit : voteShuffle,
            choicesCurr : voteShuffle,
            createdOn: new Date(),
            createdBy: Meteor.userId(),
            ballotStatus: "incomplete",
            step: theStep
          }
        );
        console.log("initialized new vote");
        console.log(result);

        // Router.go('doVote',{ params: { "_id":voteId }});
        Router.go("doVote", {_id: voteId});

      }; // end if(profileVoted)




    }

  });
};

Meteor.methods({

  deleteOptions : function (voteId) {

    // Delete all of the options associated with a vote.
    // Usually because the vote was deleted elsewhere.
    optionsCollection.remove({voteId:voteId});

  }

});