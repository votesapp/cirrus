if (Meteor.isClient) {

  Template.dropdownSelect.onRendered(function () {
    $(".VA-dropdown-menu > li:first-child").addClass("active");
  });

  Template.dropdownSelect.helpers({

    menuOptionsx : function () {


      // get the menu options from somewhere

    }

  });

  Template.dropdownSelect.events({

    "click .VA-dropdown-menu li > a" : function (event) {
      console.log("clicked the list item in VA-dropdown-select");

      console.log("compaing currentTarget vs Target");
      console.log(event.target);
      console.log(event.currentTarget.dataset.menuaction);

      var menuAction = event.currentTarget.dataset.menuaction;
      // Set the action somehow. ignore if doesnt exist, as will simply fail
      // TODO: Below will not work with multiple menus...
      $(".VA-dropdown-menu > li").removeClass("active")
      $(event.currentTarget).parent("li").addClass("active");
      $(".VA-dropdown-action").attr("data-action", menuAction);
      $(".VA-dropdown-toggle").html(event.currentTarget.text + "&nbsp;<span class='caret'></span>");

    }

  });


};