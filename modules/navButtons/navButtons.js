if (Meteor.isClient) {

  Template.navButtons.helpers({
    myHelper: function () {

      console.log("data context for navButton myHelper helper");
      console.log(this);
      console.log("parent data context for modalTemplate helper");
      console.log(Template.parentData());
      console.log("this is the parent template name");
      console.log(Template.instance().parentView);
      return null;
    }

  });

};