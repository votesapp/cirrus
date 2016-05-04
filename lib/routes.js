// File for containing application routing code


// TODO: We will need to work on our own custom
// controller for custom routing, private pages, nav 
// data.
// We can use a flag or data setting to create the
// "previous" button, which will not work like 
// "browserback" but will work more like the mobile 
// back, to only main sections, or sections above in a 
// hierarchy. 
// Using two paramters (such as @mainPage and 
// @nestedPage) we should be able to generate a logical 
// "previous" button.
// Using a nested conditional which will designate the "prev"
// button to be either the last previous mainPage, or
// the last page in a navigation hierarchy.

Router.configure({

  layoutTemplate: "mainApp",
  notFoundTemplate: "notFound",
  loadingTemplate: "loading",
  yieldTemplates:
  {
    "navBar": { to: "navBar"},
    "navButtons": { to: "navButtons"},
    "modalView": { to: "modalView"}
  }

});

Router.map(function (){

  this.route("/enterApp", {
    layoutTemplate: "bareApp"
  });

  this.route("/login",{
    layoutTemplate: "bareApp",
    data: {
      routeAccess: "public"
    }
  });

  this.route("/signup",{
    layoutTemplate: "bareApp",
    data: {
      routeAccess: "public"
    }
  });

  this.route("/", {
    name: "home",
    template: "votesList",
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Votes"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    }
  });

  this.route("/voteCreate", {
    data: {
      navAction: [
        {name: "Info", navRoute: "voteInfo"}
      ]
    }
  });

  this.route("/votesList", {
    waitOn: function(){
      return Meteor.subscribe("votesList");
    },
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Votes"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    }
  });

  this.route("/myVotes", {
    waitOn: function(){
      return Meteor.subscribe("myVotes");
    },
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "My Votes"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    }
  });

  this.route("/voteInfo/:_id", {
    waitOn: function(){
      return [
        Meteor.subscribe("votesList"),
        Meteor.subscribe("voteChoices"),
        Meteor.subscribe("myVotes"),
        Meteor.subscribe("myBallots"),
        Meteor.subscribe("voteResults")
      ];
    },

    onBeforeAction: function () {
      var voteRecord = votesCollection.findOne({_id:this.params._id});
      // Since someone who does not have access to this vote will not be
      // served the vote record from the subscription, we can redirect if
      // the record is not returned.
      if (!voteRecord) {
        // var theId = this.params._id;
        this.redirect("votesList");
      } else {
        // We can add conditional in case somehow the user is served the
        // wrong vote? This could be good later on when we start serving
        // archived votes. But we should always control in subscriptions.
        this.render();
      };
    },

    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Vote Info"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    },
    name: "voteInfo"
  });

  this.route("/voteInfo/:_id/edit", {
    waitOn: function(){
      return [
        Meteor.subscribe("votesList"),
        Meteor.subscribe("voteChoices"),
        Meteor.subscribe("myVotes"),
        Meteor.subscribe("myBallots"),
        Meteor.subscribe("voteResults")
      ];
    },

    onBeforeAction: function () {
      var voteRecord = votesCollection.findOne({_id:this.params._id});
      var creator = voteRecord.createdBy;
      var status = voteRecord.voteStatus;
      if (creator != Meteor.userId() || status != "draft") {
        var theId = this.params._id;
        this.redirect("/voteInfo/" + theId);
      } else {
        this.render();
      };
    },

    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Edit Vote"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    },
    name: "voteEdit"
  });

  // this.render('PostAside', {to: 'aside'});

  this.route("/voteChoice/:_id", {
    waitOn: function(){
      return Meteor.subscribe("votesList") && Meteor.subscribe("voteChoices") && Meteor.subscribe("myBallots");
    },
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Choice Info"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    },
    name: "voteChoice"
  });

  this.route("/voteChoice/:_id/edit", {
    waitOn: function(){
      return Meteor.subscribe("votesList") && Meteor.subscribe("voteChoices") && Meteor.subscribe("myBallots");
    },

    onBeforeAction: function () {
      var choiceRecord = choicesCollection.findOne({_id:this.params._id});
      var creator = choiceRecord.createdBy;
      // var status = voteRecord.voteStatus;
      if (creator != Meteor.userId()) {
        var theId = this.params._id;
        this.redirect("/voteInfo/" + theId);
      } else {
        this.render();
      };
    },
    
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Edit Choice"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    },
    name: "voteChoiceEdit"
  });

  this.route("/doVote/:_id", {
    layoutTemplate: "votingView",
    yieldTemplates: {
      "doVoteNav" : {to: "doVoteNav"},
      "modalView" : {to: "modalView"}
    },
    waitOn: function(){
      return [
        Meteor.subscribe("votesList"),
        Meteor.subscribe("voteChoices"),
        Meteor.subscribe("myVotes"),
        Meteor.subscribe("myBallots")
      ];
    },
    name: "doVote"
  });

  this.route("/voteConfirm/:_id", {
    name: "voteConfirm",
    waitOn: function(){
      return [
        Meteor.subscribe("votesList"),
        Meteor.subscribe("voteChoices"),
        Meteor.subscribe("myVotes"),
        Meteor.subscribe("myBallots")
      ];
    },
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Confirm Ballot"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    }
  });

  this.route("/voteResults", {
    data: {
      navAction: [
        {name: "Info", navRoute: "voteInfo"}
      ]
    }
  });

  this.route("/userProfile/:_id",{
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "User Profile"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    },
    name: "userProfile"
  });

  this.route("/userProfile/:_id/edit",{
    yieldRegions: {
      "navBar": { 
        to: "navBar",
        data: {title: "Edit Profile"}
      },
      "navButtons": { to: "navButtons"},
      "modalView": { to: "modalView"}
    },
    name: "userProfileEdit",
    
  });

  this.route("/userSettings");

  this.route("/notFound");

  this.route("/(.*)", function () {
    this.redirect("/notFound");
  });

});

Router.onBeforeAction(function () {
  // add && data.routeAccess != "public"
  // for public access to routes
  if (!Meteor.userId() && Router.current().route.getName() == "login") {
    // if the user is not logged in and trying to access /login, render the login template
    this.redirect("login");
    this.next();
  } else if (!Meteor.userId()) {
    // if the user is not logged in and not trying to access /login, render the signup template
    this.redirect("signup");
    this.next();
  } else {
    // Otherwise proceed with the route
    this.next();
  }
});

Router.onAfterAction(function () {


});
