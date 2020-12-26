const tf = require('@tensorflow/tfjs')
const path = require('path')

fileLocation = path.join(__dirname, 'JsModel', 'model.json')
console.log(fileLocation)

const model = tf.loadLayersModel('https://travelnet.herokuapp.com/TfModel/model.json')

venuesIn = tf.tensor([1, 4, 4, 5])

venuesOut = tf.tensor([3, 3, 2, 1])

model.then((layersModel) => {
  layersModel.compile({optimizer: tf.train.adam(0.1),
    loss: tf.losses.meanSquaredError})
  layersModel.fit(venuesIn, venuesOut, {epochs: 300})
      .then((response) => {
        layersModel.summary()
        console.log(response)
        const x = layersModel.predict(tf.tensor([1]))
        x.print()
      })
      .catch((err) => {
        console.log(err)
      })
}, (err) => {
  console.log('rejected')
  console.log(err)
})

