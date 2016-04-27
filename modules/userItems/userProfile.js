if (Meteor.isClient) {

  Template.userProfile.onCreated( function() {
    var self = this;

    self.autorun(function () {
    });

  });

  Template.userProfile.helpers({

    profileData : function () {
      // Get the user's profile data
      // var data = Meteor.user.profile();
      var data;
      var userData = Meteor.user();
      // if (userData.username) {
      //   data = {userName: userData.username};
      // };

      // console.log("the user profile data: ");
      // console.log(userName.username);
      return userData;

    }

  });

  Template.userProfile.events({

    "submit #profileForm" : function (event) {
      event.preventDefault();

      var userName = event.currentTarget.username.value;
      var userDesc = event.currentTarget.description.value;

      var dataObj = {
        username: userName,
        profile: {
          description: userDesc
        }
      };

      Meteor.call("updateUser", dataObj, function (error, result) {
        if (error) {
          console.alert(error.reason);
        };
      });

      Router.go("userProfile", {_id: Meteor.userId()});

    },

    "click #test-alert" : function () {
      console.warn("clicked #test-alert");
      // Meteor.alertsCollection.insert({title: "the title", type: "success", content: "Successfull!"})
      var alert = {title: "alert title", type: "success", content: "this is a new alert!"};
      Session.set("alert", alert);

    }

  });

};