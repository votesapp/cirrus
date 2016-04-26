if (Meteor.isClient) {

  Template.alertsList.helpers({

    alertMsgs : function () {
      var dataObj = [
        {title: "this message :)", type: "success", content: "This is the alert message"},
        {title: "2nd message", type: "info", content: "Here is another alert message"}
      ];
      
      return dataObj;
    }

  });


};