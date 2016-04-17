// Javascript file for voteChoice template

if (Meteor.isClient) {
  Template.voteChoice.onCreated(function () {
    var self = this;

    // When this todo list template is used, get
    // the tasks we need.
    self.autorun(function () {
      self.subscribe("voteChoices");
    });
  });
  // Meteor.subscribe("voteChoices");

  Template.voteChoice.helpers({

    choiceRecord : function () {
      console.log("logging this from choiceRecord helper");
      console.log(this);

      // This will likely break when using modals. Get
      // paramas from the session...
      if (this._id) {
        var recordId = this._id;
      } else {
        var recordId = Router.current().params._id;
      };

      return choicesCollection.findOne({_id:recordId});

    }

  }); // End helpers


  Template.voteChoice.events({

    // if we set everything as editable in the template,
    // but then on template load, either remove all editable,
    // or leave them there based on route.current().data.editable
    // being true or not, then we can eliminate a lot of
    // the markup? Does this really save anything?
    "blur [contenteditable=true]" : function (event) {
      console.log("left editable area");
      console.log("checking this: ");
      console.log(this);
      var docId = Router.current().params._id;
      console.log("docId: " + docId);
      var dataElement = event.currentTarget.dataset.field;
      console.log("dataElement: " + dataElement);
      var dataHTML = event.currentTarget.innerHTML;
      console.log("dataHTML: " + dataHTML);
      var  dataContent = $(event.currentTarget).text();
      console.log("dataContent: ");
      console.log(dataContent);
      if (this[dataElement] != dataContent) {

        console.log("there seems to be a change");

        // maybe we can suppress reactive rendering instead of blaking
        // the element?
        var updateObj = {};
        updateObj[dataElement] = dataContent;
        // do we need to clear the field to prevent duplication?
        // It seems like "editable" elements are so controlled by
        // browser that additional content posted to it is only
        // added to the editable element...
        var result = choicesCollection.update(docId,{$set: updateObj});
        console.log(result);
        event.currentTarget.innerHTML = "";

      } else {
        console.log("there apparently was no change")
      };
      // update object

    }

  });

};