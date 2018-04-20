const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var firestore = admin.firestore();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

exports.webhook = functions.https.onRequest((request, response) => {

  console.info('request.body.result.parameters', request.body.result.parameters);

  var speech, orders;

  switch (request.body.result.action) {
    case 'bookHotel': {

      let params = request.body.result.parameters;
      firestore.collection('orders')
        .add(params)
        .then((docRef) => {
          console.log("order added with ID ", docRef.id);

          response.send({
            speech: `ok ${params.name} your hotel booking request of
              ${params.roomType} room for
              ${params.persons} persons is forwarded we'll get back to your email address
              (${params.email}) shortly \n Have a good day ;)`
          });
          return null
        })
        .catch((err) => {
          console.error("Error in adding document ", err);
          response.send({
            speech: 'Error in adding document ' + err
          });
        });

      break;
    }

    case 'countBookings': {

      firestore.collection("orders").get()
        .then((querySnapshot) => {
          orders = [];

          querySnapshot.forEach(doc => orders.push(doc.data()));

          if(orders.length) {
            speech = `you have ${orders.length} orders, would you like to see them?\n`;

            response.send({
              speech: speech
            });
          } else {
            response.send({
              speech: 'you have\'nt order anything yet'
            });
          }

          return null
        })
        .catch((err) => {
          console.error("Error in getting orders ", err);
          response.send({
            speech: 'Error in getting orders ' + err
          });
        });

      break;
    }

    case 'showAllBookings': {

      firestore.collection("orders").get()
        .then((querySnapshot) => {
          orders = [];

          querySnapshot.forEach(doc => orders.push(doc.data()));

          speech = `here are your orders, \n The `;

          orders.forEach((order, i) => {
            speech += `${i+1} is hotel booking request for ${order.persons} ${order.roomType} rooms ordered by ${order.name} \n`;
          });

          response.send({
            speech: speech
          });
          return null
        })
        .catch((err) => {
          console.error("Error in getting orders ", err);
          response.send({
            speech: 'Error in getting orders ' + err
          });
        });

      break;
    }

    default: {
      response.send({
        speech: 'No actions matched in webhook'
      });
    }
  }




});
