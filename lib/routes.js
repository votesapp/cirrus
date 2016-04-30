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

  this.route("/userAuth",{
    layoutTemplate: "bareApp",
    // template: "userAuth",
    data: {
      routeAccess: "public"
    }
  });

  this.route("/", {
    name: "home",
    template: "votesList",
    data: {
      navAction: [
        {name: "Search", navRoute: "home"}
      ]
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
    data: {
      navAction: [
        {name: "Search", navRoute: "home"}
      ],
      routeAccess: "public"
    }
  });

  this.route("/myVotes", {
    waitOn: function(){
      return Meteor.subscribe("myVotes");
    },
    data: {
      navAction: [
        {name: "Search", navRoute: "home"}
      ]
    }
  });

  this.route("/voteInfo/:_id/:edit?", {
    waitOn: function(){
      return [
        Meteor.subscribe("votesList"),
        Meteor.subscribe("voteChoices"),
        Meteor.subscribe("myVotes"),
        Meteor.subscribe("myBallots"),
        Meteor.subscribe("voteResults")
      ];
    },
    data: function () {
      var result = {};
      if (this.ready()) {
        var creator = votesCollection.findOne({_id:this.params._id}).createdBy;
        if (this.params.edit == "edit" && creator == Meteor.userId()) {
          result.edit = "edit";
          result.navAction = [{name: "Info", navRoute: "voteInfo"}];
        } else {
          result.navAction = [{name: "Edit", navRoute: "voteInfo"}];
        };
      }; // End if(this.ready())
      return result;
    },
    name: "voteInfo"
  });

  this.route("/voteChoice/:_id/:edit?", {
    waitOn: function(){
      return Meteor.subscribe("votesList") && Meteor.subscribe("voteChoices") && Meteor.subscribe("myBallots");
    },
    data: function () {
      var result = {};
      if (this.ready()) {
        var creator = choicesCollection.findOne({_id:this.params._id}).createdBy;
        if (this.params.edit == "edit" && creator == Meteor.userId()) {
          result.edit = "edit";
          result.navAction = [{name: "Info", navRoute: "voteInfo"}];
        } else {
          result.navAction = [{name: "Edit", navRoute: "voteInfo"}];
        };
      }; // End if(this.ready())
      return result;
    },
    name: "voteChoice"
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
    }
  });

  this.route("/voteResults", {
    data: {
      navAction: [
        {name: "Info", navRoute: "voteInfo"}
      ]
    }
  });

  this.route("/userProfile/:_id/:edit?",{
    name: "userProfile",
    data: function () {
      if (this.params._id == Meteor.userId()) {
        var result = {edit: this.params.edit}
        return result;
      };
    }
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
  if (!Meteor.userId()) {
    // if the user is not logged in, render the Login template
    this.redirect("userAuth");
    this.next();
  } else {
    // Otherwise proceed with the route
    this.next();
  }
});

Router.onAfterAction(function () {


});
