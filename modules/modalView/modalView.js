// file for handling the modal view stuff

if (Meteor.isClient) {

  Template.modalView.helpers({
    // we can get the modal content here?
    modalContent : function () {
    return "voteCreate";
    },

    modalTemplate: function () {
      // console.log("data context for modalTemplate helper");
      // console.log(this);
      // console.log("parent data context for modalTemplate helper");
      // console.log(Template.parentData());
      // console.log("this is the parent template name");
      // console.log(Template.instance().parentView);

      // console.log("logging this from modalContent helper.");
      // console.log(this);
      // var id = Router.current().params._id;
      // var id = this._id;
      // instead of getting the _id from the route, we need
      // a target _id when triggered from elements targeting
      // other collection documents
      var data = Session.get("modalRoute");
      // here we can get and define the modal content template globally
      // meaning it will be available in the modal template
      // var data = {
      //   _id: id,
      //   template: theTemplate
      // };
      return data;
    }
  });

  Template.body.events({
    // Handle global use of myModal

    "click [data-toggle='myModal']" : function (event) {
      event.preventDefault();

      // Function to trigger modals manually via jQuery. This 
      // allows us to wait on load, and better set and 
      // synchronize the modal and it's content. Automatically
      // triggering the modal from the DOM causes AJAX
      // collisions and errors when combined with dynamically
      // loading modal content through Blaze templates.

      // This function also allows us to parse routing data
      // in the target element through it's URL parameter in
      // either the href or data-template attributes, and set
      // modal content dynamically based on that URL, similarly
      // to what a router would do, but with rendering the
      // content in a modal popup, hopefully with the same
      // or a similar data context.




      // This checks for acceptable elements to trigger modal.
      // We do this to UI "cards", which will have nested events,
      // can trigger a modal like a thumbnail, without collision of events.

      var eTag = event.target.tagName;
      if (eTag != "A" && eTag != "BUTTON" || event.target == event.currentTarget) {
        var template;
        // Get parameter values from DOM properties
        var modalTarget = event.currentTarget.dataset.target;
        var content = event.currentTarget.dataset.template;

        if (content) {
          // If a template was found, then we use it.
          template = content.split('/')[1];
          // template = content.replace(/^\//,'');
        } else {
          // Otherwise look to the href element propery.
          content = event.currentTarget.getAttribute("href");
          template = content.split('/')[1];
          // template = content.replace(/^\//,'');
        };
        var routeId = content.split('/')[2];

        var modalRoute = {
          _id: routeId,
          template: template
        };

        // We track the template in a session variable to easily
        // access in the modal helper. Esesentially the route is stored here,
        // without having been rendered by a router.
        // TODO: Add full parsing of all route params, data, and other properties
        Session.set("modalRoute", modalRoute);

        $(modalTarget).modal("toggle");

      };
      console.log("event.currentTarget is: ");
      console.log(event.currentTarget);
      console.log("event.target is: ");
      console.log(event.target);
      console.log("event.target.tagName is: ");
      console.log(event.target.tagName);

    }

  });

  Template.modalView.events({
    // code...
    "submit .modal-body form" : function () {
      // we submitted the form, registered in the modalView tempalte
      // console.log("submit triggered in modalView template");
    }
  });

};