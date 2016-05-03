import { ReactiveVar } from 'meteor/reactive-var';

if (Meteor.isClient) {
  Template.myVotes.onCreated(function () {
    var self = this;

    // self.subscribe("myVotes");
    // When this todo list template is used, get
    // the tasks we need.
    self.autorun(function () {
      self.subscribe("myVotes");
    });

    this.filter = new ReactiveVar();
  });

  Template.myVotes.helpers({

    // Helpers for myVotes
    myVotesList : function () {
      const instance = Template.instance();

      const baseQuery = { createdBy: Meteor.userId() };

      const sort = { sort: { createdOn: -1 } };

      //return all of the votes
      let query = baseQuery;

      let inputChanged = instance.filter.get();
      // if input, filter votes
      if (inputChanged && inputChanged.length > 0) {
        query = {
          $and: [baseQuery
          , {
            title: new RegExp(inputChanged)
          }]
        };
      }
      
      return votesCollection.find(query, sort).fetch();

    },

    selectMenu : function () {
      var dropMenu = {};
      dropMenu.items = [
        {name: "Save Draft", action: "saveDraft"},
        {name: "Publish Vote", action: "publishVote"},
        {seperator: true},
        {name: "Delete Vote", action: "deleteVote"}
      ];
      dropMenu.config = {
        align: "",
        menuAlign: "dropdown-menu-right",
        style: "btn-default pull-right"
      };

      return dropMenu;
 
    },

    voteStatus: function () {
      // This has the data context of a document from the myVotesList helper
      if (this.voteStatus != "published") {
        return this.voteStatus;
      };
    }

  });

  Template.myVotes.events({
    'input .input-changed input'(event, instance) {
      instance.filter.set(event.target.value);
    }
  });
}
