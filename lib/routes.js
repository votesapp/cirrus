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
  yieldTemplates: {
    "navButtons": {to: "navButtons"}
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
        {name: "Prev", route: "home"},
        {name: "My Votes", route: "voteInfo"}
      ]
    }

  });

  this.route("/votesList", {
    data: {
      navAction: [
        {name: "Prev", route: "home"},
        {name: "Search", route: "home"},
        {name: "Gear", route: "home"}
      ],
      routeAccess: "public"
    }
  });

  this.route("/voteInfo", {
    data: {
      navAction: [
        {name: "Prev", route: "home"},
        {name: "Info", route: "voteInfo"},
        {name: "Edit", route: "voteEdit"}
      ]
    }
  });

  this.route("/voteOptionInfo");

  this.route("/voteResults", {
    data: {
      navAction: [
        {name: "Prev", route: "votesList"},
        {name: "Info", route: "voteInfo"}
      ]
    }
  });

  this.route("/voteEdit", {
    data: {
      navAction: [
        {name: "Prev", route: "votesList"},
        {name: "Info", route: "voteInfo"}
      ]
    }
  });

  this.route("/voteCreate", {
    data: {
      navAction: [
        {name: "Prev", route: "votesList"},
        {name: "Info", route: "voteInfo"}
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
  // then output error maybe?
  if (!Meteor.userId()) {
    // if (Router.data.routeAccess) {
      // console.log(Router.data.routeAccess);
    // };
    // if the user is not logged in, render the Login template
    this.render("userAuth");
  } else {
    // Otherwise proceed with the route
    this.next();
  }
});
