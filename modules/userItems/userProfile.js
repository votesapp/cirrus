if (Meteor.isClient) {

  Template.userProfile.onCreated( function() {

  });

  Template.userProfile.helpers({

    profileData : function () {
      // Get the user's profile data
      // var data = Meteor.user.profile();
      var data = {userName: "The Boss Man"};

      // console.log("the user profile data: ");
      console.log(data);
      return data;

    }

  });

  Template.userProfile.events({

    "submit #profileForm" : function (event) {
      event.preventDefault();

    }

  });

};