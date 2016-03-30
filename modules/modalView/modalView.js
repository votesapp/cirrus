// file for handling the modal view stuff

if (Meteor.isClient) {

  Template.modalView.helpers({
    // we can get the modal content here?
    modalContent : function () {
    return "voteCreate";
    },
    
    modalTemplate: function () {
      // here we can get and define the modal content template globally
      // meaning it will be available in the modal template
      return Session.get("modalTemplate");
    }
  });

  Template.modalView.events({
    // code...
  });

};