// Helpers, events, and scripts for voteInfo template

if (Meteor.isClient) {
  Template.voteInfo.onCreated(function () {
    var self = this;

    self.autorun(function () {
      self.subscribe("votesList");
      self.subscribe("voteChoices");
      self.subscribe("myVotes");
      self.subscribe("myBallots");
      self.subscribe("voteResults");
    });
  });


  Template.voteInfo.helpers({

    voteData : function () {
      // Get the data for the selected vote
      var recordId = Router.current().params._id;
      console.log("The recordId: " + recordId);
      if (recordId) {
        // Is this causing a problem on reactive re-render after deleteVote
        // causes undefined result from below before redirectin to new route?
        // NOTE: This is returning null on a vote that the user did note create
        // or that is not published/closed. This is because that record is not
        // served in a subscription. This is a good security measure, but
        // we should redirect the user if this is the case.
        var recordData = votesCollection.findOne({ _id:recordId })
        return (recordData) ? recordData : null;
      };
    },

    ballotStatus: function () {
      // Used to determin if the user can see results.

      var userBallot = ballotsCollection.findOne({voteId:this._id, createdBy:Meteor.userId()});

      // Get the status of the vote.
      var theStatus = {};
      if (userBallot) {
        console.log("the stored status");
        console.log(userBallot.ballotStatus);
        // Set the key for the ballot status to the status, with a value of true.
        // This is for template view, since no comparison can be done in the view.
        theStatus[userBallot.ballotStatus] = true;
        console.log(theStatus);

      } else {
        console.log("No ballot status, new ballot required.");
        theStatus.noBallot = true;
      };

      return theStatus;

    },

    choicesList : function () {
      // Return the vote choices
      var recordId = Router.current().params._id;
      var choicesArray = votesCollection.findOne({_id: recordId}).choices;
      console.log("in voteInfo.js/choicesList");
      console.log(choicesArray);
      var choicesData;
      if (choicesArray) {
        choicesData = choicesCollection.find({_id: {$in: choicesArray}}, {sort: {createdOn: -1}}).fetch();
      };

      return choicesData;
    },

    nextAction : function () {
      var actionItem;
      // var ballotStatus;
      var user = Meteor.userId();
      var creator = this.createdBy;
      var voteStatus = this.voteStatus;
      var userBallot = ballotsCollection.findOne({voteId:this._id, createdBy:Meteor.userId()});
      var ballotStatus = (userBallot) ? userBallot.ballotStatus : null ;

      // We also have access to "this" which is the voteData


      if (user !== creator) {


        if (voteStatus === "published") {
          // if an existing ballot or not

          if (userBallot) {
            // not creator, and published vote
            // CONTINUE VOTE
            if (ballotStatus ==="incomplete") {
              actionItem = {
                name: "Continue Vote",
                action: "doVote",
                style: "btn-info"
              };
            };
          } else {
            // not creator, published vote, no ballot
            // TAKE VOTE
            actionItem = {
              name: "Take Vote",
              action: "doVote",
              style: "btn-info"
            };
          };

        };  

      } else {
        // This is the creator of the vote

        if (voteStatus === "draft") {
          // EDIT VOTE
          actionItem = {
            name: "Edit Vote",
            action: "editVote",
            style: "btn-warning"
          };

        } else if (voteStatus === "published") {
          // if existing ballot, or not

          if (userBallot) {

            if (ballotStatus === "incomplete") {
              // published vote
              // CONTINUE VOTE
              actionItem = {
                name: "Continue Vote",
                action: "doVote",
                style: "btn-info"
              };

            } else {
              // published vote
              // CLOSE VOTE
            };

          } else {
            // creator, published vote, no ballot
            // TAKE VOTE
            actionItem = {
              name: "Take Vote",
              action: "doVote",
              style: "btn-info"
            };
          };

        } else if (voteStatus === "closed") {
          // ARCHIVE VOTE

        } else if (voteStatus === "archived") {
          // UNARCHIVE VOTE

        };


      }; // end if(user !== creator)

      return actionItem;

    },

    adminAction : function () {
      var adminItem;
      var user = Meteor.userId();
      var creator = this.createdBy;
      var voteStatus = this.voteStatus;
      console.log("logging creator/user");
      console.log("user: " + user);
      console.log("creator: " + creator);
      // var userBallot = ballotsCollection.findOne({voteId:this._id, createdBy:Meteor.userId()});
      // var ballotStatus = (userBallot) ? userBallot.ballotStatus : null ;

      if (user === creator) {

        if (voteStatus === "published") {
          adminItem = {
            name: "Close Vote",
            action: "closeVote",
            style: "btn-default"
          };
        } else if (voteStatus === "closed") {
          adminItem = {
            name: "Archive Vote",
            action: "archiveVote",
            style: "btn-default"
          };
        } else if (voteStatus === "archived") {
          adminItem = {
            name: "Unarchive Vote",
            action: "closeVote",
            style: "btn-default"
          };
        };

      } else {
        // User is not creator and can not do any admin stuff
        adminItem = null;
      };

      return adminItem;

    },

    dropMenuDatax : function () {
      // Menu options for vote actions dropdown menu. We are defining next actions for votes 
      // using this menu.
      // We rely on router access filtering to handle and resolve any conflicts.

      var ballotStatus;
      var user = Meteor.userId();
      var creator = this.createdBy;
      var dropMenu = {
        config: {
          align: "",
          menuAlign: "dropdown-menu-right",
          style: "btn-default btn-block"
        }
      };
      var edit = Router.current().params.edit;
      var userBallot = ballotsCollection.findOne({voteId:this._id, createdBy:Meteor.userId()});

      if (userBallot) {
        console.log("the stored status");
        console.log(userBallot.ballotStatus);
        // Set the key for the ballot status to the status, with a value of true.
        // This is for template view, since no comparison can be done in the view.
        ballotStatus = userBallot.ballotStatus;
      };

      if (edit == "edit") {

        // The user is assumed creator to access /edit
        console.log("we are having a 'edit' menu");
        dropMenu.items = [
          {name: "Save Draft", action: "saveDraft"},
          {name: "Publish Vote", action: "publishVote"},
          {seperator: true},
          {name: "Delete Vote", action: "deleteVote"}
        ];

      } else {

        if (user != creator) {
          console.log("this is not the vote creator")
          // User is not creator, and is not editing the vote
          // We are assuming that routes restrict access to non-published votes
          // for non-creators of the votes
          if (this.voteStatus != "published") {
            // display nothing
            dropMenu = null;
          } else {
            if (ballotStatus == "completed") {
              // we should not show a button
              dropMenu = null;
              console.log("completed ballot, non-creator. voteInfo.js:121, this is a bug");
            } else if (ballotStatus == "incomplete") {
              console.log("incomple ballot, but closed vote")
              dropMenu.items = [
                {name: "Continue Vote", action: "doVote"}
              ];
            } else {
              dropMenu.items = [
                {name: "Take Vote", action: "doVote"}
              ];
            };
          };


          dropMenu.config.style = "btn-info btn-block";

        } else {

          console.log("this user created this vote");
          // User is creator of vote, and not editing
          if (this.voteStatus == "published") {

            dropMenu.items = [
              {name: "Close Vote", action: "closeVote"},
              {name: "Archive Vote", action: "archiveVote"}
            ];
            if (ballotStatus == "incomplete"){
              // Put the voting action "Do Vote" as the first item in the menu
              dropMenu.items.unshift({name: "Continue Vote", action: "doVote"});
            } else if (ballotStatus != "completed") {
              // Put the voting "continue" action as the first item in the menu
              dropMenu.items.unshift({name: "Take Vote", action: "doVote"});
            };

          } else {

            // display options for creator of unpublished vote, not editing
            if (this.voteStatus == "draft") {
              dropMenu.items = [
                {name: "Edit Vote", action: "editVote"},
              ];

              dropMenu.config.style = "btn-warning btn-block";

            } else if (this.voteStatus == "closed"){
              // Allow the user to archive the vote
              dropMenu.items = [{name: "Archive Vote", action: "archiveVote"}];
            } else if (this.voteStatus == "archived") {
              // Allow the user to un-archive the vote to "closed" status
              dropMenu.items = [{name: "Unarchive Vote", action: "closeVote"}];
            };

          };
          
        };
      };

      if (dropMenu.items.length == 1) {
        // there is only one option, and flag as such
        dropMenu.config.singleton = true;
      };

      return dropMenu;
    }


  });

  Template.voteInfo.events({

    "click [data-action='editVote']" : function () {
      // Right now this is a pseudo event and placeholder should we
      // need to change how votes are saved (instead of below)
      var voteId = Router.current().params._id;
      Router.go("voteEdit", {_id:voteId, edit:"edit"});

    },

    "click [data-action='confirmVote']" : function () {
      // Right now this is a pseudo event and placeholder should we
      // need to change how votes are saved (instead of below)
      var voteId = Router.current().params._id;
      Router.go("voteConfirm", {_id:voteId, edit:"edit"});

    },

    "click [data-action='closeVote']" : function () {
      // Change the status of the vote to publish
      // TODO: We may need to check for ownership of the vote
      var voteId = Router.current().params._id;
      var creator = votesCollection.findOne({_id:voteId}).createdBy;
      if (creator === Meteor.userId()) {
        Meteor.call("updateVote", voteId, {voteStatus: "closed", closedOn: new Date()}, function (error, result) {
          if (error) {
            //throw error
          } else {
            Bert.alert("The vote was closed!", "info");
            Router.go("myVotes");
          };
        });
      };
    },

    "click [data-action='archiveVote']" : function () {
      // Change the status of the vote to publish
      var voteId = Router.current().params._id;
      Meteor.call("updateVote", voteId, {voteStatus: "archived", archivedOn: new Date()});
      Bert.alert("The vote was archived!", "info");
      Router.go("myVotes");
    },

    "click [data-action='doVote']" : function (event) {
      event.preventDefault();

      var voteId = Router.current().params._id;

      Router.go("doVote", {_id: voteId});

    }

  });
};
