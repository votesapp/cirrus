// file for handling the modal view stuff

if (Meteor.isClient) {

  Template.modalView.helpers({
    // we can get the modal content here?
    modalContent : function () {
    return "voteCreate";
    },

    modalTemplate: function () {
      // console.log("data context for modalTemplate helper");
      // console.log(this);
      // console.log("parent data context for modalTemplate helper");
      // console.log(Template.parentData());
      // console.log("this is the parent template name");
      // console.log(Template.instance().parentView);

      // console.log("logging this from modalContent helper.");
      // console.log(this);
      // var id = Router.current().params._id;
      // var id = this._id;
      // instead of getting the _id from the route, we need
      // a target _id when triggered from elements targeting
      // other collection documents
      var data = Session.get("modalRoute");
      // here we can get and define the modal content template globally
      // meaning it will be available in the modal template
      // var data = {
      //   _id: id,
      //   template: theTemplate
      // };
      return data;
    }
  });

  Template.modalView.events({
    // code...
    "submit .modal-body form" : function () {
      // we submitted the form, registered in the modalView tempalte
      // console.log("submit triggered in modalView template");
    }
  });

};