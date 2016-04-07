// Helpers, events, and scripts for voteInfo template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");
  // this is for initializing votes
  Meteor.subscribe("voteResults");

  Template.voteInfo.helpers({

    voteData : function () {
      // Get the data for the selected vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });
    },

    voteStatus : function () {

      var profileVoted =  resultsCollection.findOne(
        {voteId : voteId}
        );

      var status = "status";
      // var status = profileVoted.status;

      // var voteStatus = {};
      // voteStatus[status] = true;
      return status;
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
      var voteId = this._id;

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
      var profileVoted =  resultsCollection.findOne(
        {voteId : voteId}
        );


      console.log("voter's vote:");
      console.log(voteStatus);

      if (profileVoted) {
        // This user has started this vote already.
        // We will eventually change this to be if(status==="completed")
        // But also we must account for initialization conditions
        console.log("This vote: " + voteId + " already initialized for user: " + Meteor.userId());
        var voteStatus = profileVoted.status;

        if (voteStatus === "incomplete") {
          console.log("the user has not completed this vote. Redirect to voting");
          // add other conditionals for other statuses. If more than 3, do we want
          // to use switch()? is it worth it now?
          Router.go("doVote", {_id: voteId});
        };

      } else {
        // since profileVote != truthy, we will initialize the new vote for the user
        console.log("This is a new vote to initialize");
        // Get all of the vote choices for the vote
        var voteChoices = optionsCollection.find({voteId:voteId}).fetch();

        console.log("the vote choices");
        console.log(voteChoices);

        // We now put these options in a random order to start the vote unbaised. 
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

        // We add this to the users profile.
        // No we added it directly to the resultsCollection, since
        // this is where it will end up in some form anyway, and it
        // makes it easier to query.
        // using: Meteor.users.profile.votesData{}
        // @params: 
        //   voteId - the _id of the vote being voted on.
        //   orderInit(array) - an array of the initial items shuffle.
        //   pairs(array) - track all pairs compared in the vote,
        //     which will allow us to eliminate duplicate comparisons.
        //   orderCurr(array) - the current state of the sort by the user.
        //   status[default=incomplete] - a field to track the status of the vote.

        // Build the object first

        // var voteObj = {
        //   voteId: voteId,
        //   orderInit: voteShuffle,
        //   status: "incomplete"
        // };

        // Initialize the vote in the user's profile field in users collection.
        // var result = Meteor.users.update(Meteor.userId(), {$push: {'profile.votes': voteObj}});

        // Initialize the vote in the resultsCollection.
        var result = resultsCollection.insert(
          {
            voteId : voteId,
            choicesInit : voteShuffle,
            createdOn: new Date(),
            status: "incomplete"
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

    // Delete the options associated with a vote.
    // Usually because a vote was deleted elsewhere.
    optionsCollection.remove({voteId:voteId});

  }

});