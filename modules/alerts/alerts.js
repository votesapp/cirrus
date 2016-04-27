if (Meteor.isClient) {
  // var alertsCollection = new Mongo.Collection(null);

  Template.alerts.onCreated(function () {

  });

  Template.alerts.helpers({

    alertMsgs : function () {
      // this is the alert data
      var alertsData = Session.get("alerts");
      var dataObj = [
        {title: "this message :)", type: "success", content: "This is the alert message"},
        {title: "2nd message", type: "info", content: "Here is another alert message"}
      ];

      return alertsData;
    }

  });

};