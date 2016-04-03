if (Meteor.isClient) {

  Template.navButtons.helpers({
    stateId: function () {

      console.log("data context for navButton myHelper helper");
      console.log(this);
      // console.log("parent data context for modalTemplate helper");
      // console.log(Template.parentData());
      // console.log("this is the parent template name");
      // console.log(Template.instance().parentView);
      // We can get the _id from the router
      // this will allow us to have "lead on" items
      // in the nav button which will react to the 
      // current state of the app.

      var idParam = Router.current().params._id;
      console.log("the idParam");
      console.log(idParam);
      return idParam;
    }

  });

  Template.navButtons.events({

    "click [data-action='previous']" : function (event) {
      event.preventDefault();

      // Simplest history implementation.
      // We will develop a more sophisticated history
      // to allow for more logical navigation in the app.
      history.go(-1);

    }
  });

};