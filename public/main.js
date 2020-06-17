const db = firebase.firestore();

const eFileButton = document.getElementById('eFileButton');

const onEfile = () => {
  console.log('EFile clicked');
  db.collection('efile_operations')
    .add({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815,
    })
    .then(function (docRef) {
      console.log('Document written with ID: ', docRef.id);
    })
    .catch(function (error) {
      console.error('Error adding document: ', error);
    });
};

eFileButton.addEventListener('click', onEfile);
