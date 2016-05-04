// Events and helpers for voteConfirm

if (Meteor.isClient) {

  Template.voteConfirm.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
      self.subscribe("votesChoices");
      self.subscribe("myBallots");
    });

    var voteId = Router.current().params._id;
    var ballotData = ballotsCollection.findOne({voteId : voteId, createdBy: Meteor.userId()});

    if (!ballotData) {
      // There is no ballot, the user will need to
      // create one from the voting process.
      // Router.go("doVote",{_id:voteId});
      /* *********************************** */
      /* ******** Initialize Ballot ******** */
      /* *********************************** */
      console.log("This is a new ballot to initialize");

      // Build the initilization object and add it to the ballotsCollection
      // @params: 
      //   voteId(_id) - the _id of the vote being voted on.
      //   choicesInit(array) - an array of the initial choices shuffled state.
      //   choicesCurr(array) - the current state of the sort by the user.
      //   status[default=incomplete] - a field to track the status of the vote.
      //   step(int) - A step counter to track state of the ballot

      // Get an array of objects containing all of the vote choice _id's 
      var choicesArray =  votesCollection.findOne({_id: voteId}).choices;
      var choicesData = choicesCollection.find({_id: {$in: choicesArray}}).fetch();
      
      var voteChoices = choicesData.map(function(item){ 
        var obj = {_id:item._id};
        return obj;
      });

      console.log("voteId: " + voteId);
      console.log("the vote choices");
      console.log(voteChoices);

      // We now put these options in a random order to remove bias.
      // We are using the Fischer-Yates shuffle algorithm here.
      var voteShuffle = voteChoices, i = 0, j = 0, temp = null;

      for (i = voteShuffle.length - 1; i > 0; i -= 1) {
        j = Math.floor(Math.random() * (i + 1))
        temp = voteShuffle[i]
        voteShuffle[i] = voteShuffle[j]
        voteShuffle[j] = temp
      };

      console.log("shuffled choices: ");
      console.log(voteShuffle);

      // Initialize a step counter to track progress of the user through
      // each iteration of the sort, effectively storing the state of the ballot.
      // We subtract "1" to make it zero based.
      var theStep = voteShuffle.length - 1;

      // Initialize the ballot in the ballotsCollection
      var ballotData = {
        voteId : voteId,
        choicesInit : voteShuffle,
        choicesCurr : voteShuffle,
        createdOn: new Date(),
        createdBy: Meteor.userId(),
        ballotStatus: "incomplete",
        step: theStep
      }
      console.log("ballotData:");
      console.log(ballotData);

      Meteor.call("createBallot", ballotData, function (error, result) {
        if (error) {
          // throw error
        } else {
          console.log("Initialized new ballot");
          console.log(result);

          ballotData._id = result;
          Session.set("currentVoteBallot", ballotData);
        };

      });

    } else {

      if (ballotData.ballotStatus != "incomplete") {
        // Additional conditional for non "imcomplete"
        // or "completed" ballots

        if (ballotData.ballotStatus != "completed") {
          // The ballot is neither "incomplete" or
          // "completed", so initialize a new vote
          // Router.go("doVote",{_id:voteId});

        } else {
          // The ballot status is "completed"
          console.log("the ballot is completed.");
          Router.go("voteInfo",{_id:voteId});
        };
      };

    }; 

  });

 Template.voteConfirm.rendered = function () {
    // initialize draggable items / jQuery stuff
    $(function () {
      $( "#sortable" ).sortable();
      $( "#sortable" ).disableSelection();
    });
  }

  Template.voteConfirm.helpers({

    voteData : function () {
      var voteId = Router.current().params._id;
      var voteData = votesCollection.findOne({_id: voteId});
      return voteData;
    },

    ballotResults : function () {
      // Get the ballot results to be confirmed
      var voteId = Router.current().params._id;

      var ballotData = Session.get("currentVoteBallot");

      if (!ballotData) {
        // If there was no session ballot, get the saved ballot from the DB
        ballotData = ballotsCollection.findOne({voteId : voteId, createdBy: Meteor.userId()});
      };

      console.log("The ballot data:");
      console.log(ballotData);

      var sortedChoices = [];

      if (ballotData) {

        var choicesArray = ballotData.choicesCurr.map(function(obj) {
          return obj._id;
        });

        // Find all choices data from choices collection
        var choicesData = choicesCollection.find({_id: {$in: choicesArray}}).fetch();

        // Sort data according to the user ballot order
        for (var i = choicesData.length - 1; i >= 0; i--) {

          var temp = choicesData.filter(function(obj){
            return (obj._id == choicesArray[i]);
          });

          sortedChoices[i] = temp[0];

        };

      };

      console.log("sorted objects:");
      console.log(sortedChoices);

      return sortedChoices;
    }

  });

  Template.voteConfirm.events({

    "click [data-action='redoVote']" : function (event) {
      // This will let the user reset their ballot and redo the voting process

      var ballotId = Session.get("currentVoteBallot");
      var voteId = Router.current().params._id;

      console.log("the ballotId");
      console.log(ballotId._id);

      // Delete the ballot to restart vote with new ballot
      Meteor.call("deleteBallot", ballotId._id, function (error, result) {
        if (error) {
          //throw error
        } else {
          // Session.set("currentVoteBallot", null);
          Router.go("doVote", {_id: voteId});
        };
      });

    },

    "click [data-action='saveBallot']" : function(event) {
      // We will save the ballot data based on the DOM sort
      var userBallot = Session.get("currentVoteBallot");
      var ballotId = userBallot._id;
      var voteId = Router.current().params._id;

      var divs = document.getElementsByName("sort-item");
      var ids = [];
      for (var i = 0; i < divs.length; i++) {
        ids[i] = {};
        ids[i]._id = divs[i].id;
        ids[i].sortStatus = "sorted";
      };

      console.log("the ids array: ");
      console.log(ids);
      userBallot.choicesCurr = ids;

      Meteor.call("updateBallot", ballotId, userBallot, null, function (error, result) {
        if (error) {
          // throw an error
        } else {
          console.log("The current vote results");
          console.log(result);

          console.log("the vote id in ballot confirm event: ");
          console.log(voteId);

          Bert.alert("Ballot successfully saved", "info");
          Router.go("voteInfo", {_id: voteId});
          return result;
        };
      });


    },

    "click [data-action='confirmBallot']" : function(event) {
      // Update ballot status to completed

      // Add a session get to get the actual live ballot data.
      console.log("confirming the ballot");
      var userBallot = Session.get("currentVoteBallot");
      // var ballotId = userBallot._id;
      // var voteId = ballotsCollection.findOne({_id:ballotId}).voteId;
      // var voteId = userBallot.voteId;
      // var choicesSort = userBallot.choicesCurr;

      var voteId = Router.current().params._id;
      // var choicesSort = userBallot.choicesCurr;

      // var ids = $("[name='sort-item']").map(function () {return this.id;});
      var divs = document.getElementsByName("sort-item");
      var ids = [];
      for (var i = 0; i < divs.length; i++) {
        ids[i] = {};
        ids[i]._id = divs[i].id;
        ids[i].sortStatus = "sorted";
      };

      console.log("the ids array: ");
      console.log(ids);
      userBallot.choicesCurr = ids;


      // Update the status of the ballot
      // We can also update the voteResults.
      // The update method will do the results calculation so it will
      // be run on the server.
      // We should probably just pass along the sorted choices

      Meteor.call("addBallotResults", userBallot, function (error, result) {
        if (error) {
          // throw an error
        } else {
          console.log("The current vote results");
          console.log(result);

          console.log("the vote id in ballot confirm event: ");
          console.log(voteId);
          Bert.alert("Congratulations! Your vote counts", "info");

          Router.go("voteInfo", {_id: voteId});
          return result;
        };
      });

    }


  });


};

