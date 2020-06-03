const tf = require('@tensorflow/tfjs')
const path = require('path')

fileLocation = path.join(__dirname, 'JsModel', 'model.json')
console.log(fileLocation)

const model = tf.loadLayersModel('https://travelnet.herokuapp.com/TfModel')

venuesIn = [1, 4, 4, 5]

venuesOut = [3, 3, 2, 1]

model.then((layersModel) => {
    layersModel.fit(venuesIn, venuesOut, {epochs:300})
    .then((info) => {
        console.log('complete')
        console.log(info)
    })
    .catch((err) => {
        console.log('err')
        console.log(err)
    })
}, (err) => {
    console.log('rejected')
    console.log(err)
})
