import asciify from 'asciify-image';

const options = {
  fit: 'box',
  width: 200,
  height: 100,
};

asciify('src/assets/images/header.png', options)
  .then((asciified) => {
    // Print asciified image to console
    console.log(asciified);
  })
  .catch((err) => {
    // Print error to console
    console.error(err);
  });
