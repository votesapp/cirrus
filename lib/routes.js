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
    data: {
      routeAccess: "public"
    }
  });

  this.route("home", {
    name: "home",
    template: "votesList",
    path: "/",
    data: {
      navAction: [
        {name: "Search", navRoute: "home"}
      ]
    }

  });

  this.route("/votesList", {
    data: {
      navAction: [
        {name: "Search", navRoute: "home"}
      ],
      routeAccess: "public"
    }
  });

  this.route("/voteInfo", {
    path: "/voteInfo/:_id",
    data: {
      navAction: [
        {name: "Edit", navRoute: "voteEdit"}
      ]
    }
  });

  this.route("/voteOption", {
    path: "/voteOption/:_id"

  });

  this.route("/doVote", {
    layoutTemplate: "votingView"
  });

  this.route("/voteResults", {
    data: {
      navAction: [
        {name: "Info", navRoute: "voteInfo"}
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

  this.route("/voteEdit", {
    path: "/voteEdit/:_id",
    data: {
      navAction: [
        {name: "Info", navRoute: "voteInfo"}
      ]
    }
  });

  this.route("/userProfile");

  this.route("/userSettings");

  this.route("/(.*)", function () {
    this.redirect("/catchallpage");
  });

});

Router.onBeforeAction(function () {
  // add && data.routeAccess != "public"
  // for public access to routes
  // then output error maybe?
  if (!Meteor.userId()) {
    // if the user is not logged in, render the Login template
    this.render("userAuth");
  } else {
    // Otherwise proceed with the route
    this.next();
  }
});
