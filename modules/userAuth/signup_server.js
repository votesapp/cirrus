// signup_server.js

if (Meteor.isServer) {

  Meteor.methods({

    checkBetaCode : function (email) {
      var prefineryKey = Meteor.settings.prefineryKey;
      console.log("the key: " + prefineryKey);
      var codeHash = CryptoJS.SHA1(prefineryKey + email);
      // var codeHash = CryptoJS.SHA1("testingsubstring");
      codeHash = codeHash.toString().substring(0,10);
      console.log("codehash: " + codeHash);

      return codeHash;

    }

  });
  
};
