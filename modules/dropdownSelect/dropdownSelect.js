if (Meteor.isClient) {


  Template.dropdownSelect.helpers({

    menuOptionsx : function () {

      // get the menu options from somewhere

    }

  });

  Template.dropdownSelect.events({

    "click .VA-dropdown-select li > a" : function (event) {
      console.log("clicked the list item in VA-dropdown-select");

      console.log("compaing currentTarget vs Target");
      console.log(event.target);
      console.log(event.currentTarget.dataset.menuaction);

      var menuAction = event.currentTarget.dataset.menuaction;
      // Set the action somehow. ignore if doesnt exist, as will simply fail
      // TODO: Below will now work with multiple menus...
      $(".VA-dropdown-action").attr("data-action", menuAction);
      $(".VA-dropdown-toggle").html(event.currentTarget.text + "&nbsp;<span class='caret'></span>");

    }

  });


};