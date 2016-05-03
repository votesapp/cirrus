// Helpers etc for voteEdit template

if (Meteor.isClient) {
  Meteor.subscribe("votesList");
  Meteor.subscribe("voteOptions");

  Template.voteEdit.helpers({

    editVoteData : function () {
      // to get the info for the vote
      var recordId = Router.current().params._id;

      return votesCollection.findOne({ _id:recordId });

    },

    editChoicesList : function () {

      var recordId = Router.current().params._id;
      var choicesArray = votesCollection.findOne({_id: recordId}).choices;
      var choicesData;
      if (choicesArray) {
        choicesData = choicesCollection.find({_id: {$in: choicesArray}}, {sort: {createdOn: -1}}).fetch();
      };

      return choicesData;
    }


  });

  Template.voteEdit.events({

    "blur textarea.VA-edit-live" : function (event) {
      event.preventDefault();

      // Get the data from the DOM of the element the user has edited.
      var docId = Router.current().params._id;
      var dataElement = event.currentTarget.dataset.field;
      var dataContent = $(event.currentTarget).val();

      // Check against "this" content for the field changes
      if (this[dataElement] !== dataContent) {

        console.log("there seems to be a change");

        // Update the collection based on the collected data.
        var updateObj = {};
        updateObj[dataElement] = dataContent;
        Meteor.call("updateVote", docId, updateObj, function (error, result){
          if (error) {
            console.log("Error: " + error);
          } else {
            console.log(result);
            // $(event.currentTarget).val(dataContent);
          };
        });
      };

    },

    "blur .VA-edit-live[contenteditable=true]" : function (event) {
      event.preventDefault();
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

      // Check against "this" content for the field changes
      if (this[dataElement] != dataContent) {

        console.log("there seems to be a change");

        // Update the collection based on the collected data.
        var updateObj = {};
        updateObj[dataElement] = dataContent;
        Meteor.call("updateVote", docId, updateObj, function (error, result){
          if (error) {
            console.log("Error: " + error);
          } else {
            console.log(result);
          };

        });
        // Do we need to clear the field to prevent duplication?
        // It seems like "editable" elements are so controlled by
        // browser that additional content posted to it is only
        // added to the editable element...
        // TODO: This can cause UI glitches as the DOM rerenders.
        // Maybe we can suppress reactive rendering instead of blanking
        // the element?

        // WHATIF: Instead of blaking the content, we set it to the value
        // that was used to update the collection. Maybe Meteor would
        // detect no change, and not rerender the element?
        event.currentTarget.innerHTML = "";

      };
    },

    "click [data-action='saveDraft']" : function () {
      // Right now this is a pseudo event and placeholder should we
      // need to change how votes are saved (instead of below)
      var voteId = Router.current().params._id;
      Bert.alert("The vote was saved", "info");
      Router.go("myVotes");

    },

    "click [data-action='publishVote']" : function () {
      // Change the status of the vote to publish
      var voteId = Router.current().params._id;
      Meteor.call("updateVote", voteId, {voteStatus: "published", publishedOn: new Date()}, function (error, result) {
        if (error) {
          //throw error
        } else {
          Bert.alert("The vote was published!", "info");
          Router.go("voteList");
        };
      });
    },

    "click [data-action='uploadImg']" : function (event) {
      event.preventDefault();
      console.log("clicked the uploadImg");
      // Upload the img
      if (event.target.tagName != "INPUT") {
        $("#fileInput").trigger('click');
      };
    },

    "change #fileInput" : function (event) {
      event.preventDefault();
      var voteId = Router.current().params._id;
      var files = event.currentTarget.files;
      console.log(files);
      if (files) {
        console.log("there was a key image file included");
        Cloudinary._upload_file(files[0], {}, function (error, result) {
          console.log("in cloudinary callback");
          if (error) {
            //Throw an error
            console.log("Error in cloudinary upload callback function");
            console.log(error);
          } else {
            console.log("We got a result from cloudinary!");
            console.log(result);
            Meteor.call("updateVote", voteId, {keyImage: result.public_id})
          };
        });
      };
    },
    
    "click [data-action='deleteVote']" : function (event) {
      event.preventDefault();

      var recordId = Router.current().params._id;

      // Delete the vote record
      Meteor.call("deleteVote", recordId, function (error, result) {
        if (error) {
          //throw error
        } else {
          // Then delete all the vote options associated with the vote
          // We are not doing this so choices will be able to be
          // re-used in the future.
          // Meteor.call("deleteChoices", recordId);

          // Notify the user of the success of the delete
          Bert.alert({
            title: "Vote Deleted",
            message: "The vote <b>" + recordId + "</b> was deleted.",
            type: "danger"
          });

          // Redirect the user to other content after the vote is deleted.
          // TODO: We can implement the "previous" function instead.
          Router.go("votesList");
        };
      });


    },


  });
};

