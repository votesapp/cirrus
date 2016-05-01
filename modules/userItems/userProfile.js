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

  Template.userProfileEdit.helpers({
    profileData : function () {
      // Can this not be replaced with {{currenUser}}?
      return Meteor.user();
    }
  });

  Template.userProfileEdit.events({

    "submit #profileForm" : function (event) {
      event.preventDefault();

      var userName = event.currentTarget.username.value;
      var userDesc = event.currentTarget.description.value;
      var userAvatar = event.currentTarget.avatar.files;

      // If there is an avatar upload we need to handle it!

      if (userAvatar) {
        console.log("there was a userAvatar file included");
        Cloudinary._upload_file(userAvatar[0], {}, function (error, result) {
          console.log("in cloudinary callback");
          if (error) {
            //Throw an error
            console.log("Error in cloudinary upload callback function");
            console.log(error);
          } else {
            console.log("We got a result from cloudinary!");
            console.log(result);
            Meteor.call("updateUser", {profile: {avatar: result.public_id}})
          };
        });
      };

      if (userName || userDesc) {

        var dataObj = {
          username: userName,
          profile: {
            description: userDesc
          }
        };

        Meteor.call("updateUser", dataObj, function (error, result) {
          if (error) {
            console.alert(error.reason);
          } else {
            Bert.alert("Updated user profile", "info");
          };
        });

      };


      Router.go("userProfile", {_id: Meteor.userId()});

    },

    "click #cancelEdit" : function () {

      Router.go("userProfile", {_id: Meteor.userId()});

    },

    "click #test-alert" : function () {
      console.alert("clicked #test-alert");
      // Meteor.alertsCollection.insert({title: "the title", type: "success", content: "Successfull!"})
      var alert = {title: "alert title", type: "success", content: "this is a new alert!"};
      Session.set("alert", alert);

    }

  });

};