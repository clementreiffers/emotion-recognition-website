const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const results = document.getElementById("showEmotion");

let modelForFaceDetection;
let modelForEmotionRecognition;
// declare a canvas variable and get its context
let ctx = canvas.getContext("2d");
let x1, y1, x2, y2;
let currentEmotion = "";


const emotions = {
    0: "😡 angry",
    1: "🤮 disgust",
    2: "😨 fear",
    3: "😄 happy",
    4: "😐 neutral",
    5: "😭 sad",
    6: "😯 surprise",
}

const setupCamera = async () => {
    navigator.mediaDevices
        .getUserMedia({
            video: {width: canvas.width, height: canvas.height},
            audio: false,
        })
        .then((stream) => {
            video.srcObject = stream;
        });
    modelForFaceDetection = await blazeface.load();
    modelForEmotionRecognition = await tf.loadLayersModel('https://raw.githubusercontent.com/Im-Rises/emotion-recognition-website/main/resnet50js_ferplus/model.json');

};

const getIndexOfMax = (pred) => R.indexOf(getMax(pred), pred);

const getMax = (pred) => {
    let acc = 0;
    for (let i of pred) if (i > acc) acc = i;
    return acc;
}

const getBestEmotion = (pred) => emotions[getIndexOfMax(pred)];

const magnifyResults = (pred) => {
    let emotionsWithValue = [];
    let magnified = "";
    for (let i in pred) emotionsWithValue.push(emotions[i] + " : " + parseInt(pred[i] * 100));
    for (let i in emotionsWithValue) magnified += '<p>' + emotionsWithValue[i].toString().replace(/,/g, ' ') + '%</p>';
    return magnified;
}

const drawOnCanvas = () => {
    ctx.reset();
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
}

const detectFaces = async () => {
    drawOnCanvas();

    const face = await modelForFaceDetection.estimateFaces(video, false);

    if (face.length > 0) {
        // save face to test_face_extract folder
        let [x1, y1] = face[0].topLeft;
        let [x2, y2] = face[0].bottomRight;
        let width = x2 - x1;
        let height = y2 - y1;

        ctx.lineWidth = "10";
        ctx.strokeStyle = "red";

        // Recalculate real coordinates to catch completely the face
        x1 = x1 + width / 8;
        y1 = y1 - height / 2;
        width -= width / 4;
        height += height * 2 / 3;

        // Draw rectangle
        ctx.rect(x1, y1, width, height);
        ctx.stroke();


        tf.engine().startScope();
        //
        // let newctx = ctx;
        // // newctx.scale(80, 80);
        // let myImageData = ctx.getImageData(0, 0, 80, 80).data;
        // // console.log(myImageData);
        //
        // let rgbArray = []
        // for (let i = 0; i < myImageData.length; i += 4) {
        //     // rgbArray.push([myImageData[i], myImageData[i + 1], myImageData[i + 2]])
        //     rgbArray.push(myImageData[i]);
        //     rgbArray.push(myImageData[i + 1]);
        //     rgbArray.push(myImageData[i + 2]);
        // }
        //
        // myImageData = tf.tensor4d(rgbArray, [1,80, 80, 3]);
        //
        //
        // let prediction = Array.from(modelForEmotionRecognition.predict(myImageData).dataSync());
        // currentEmotion = getBestEmotion(prediction);
        // results.innerHTML = magnifyResults(prediction);








        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const uint8array = new Uint8Array(imageData.data.buffer);
        const rgbaTens4d = tf.tensor4d(uint8array, [1, canvas.height, canvas.width, 4]);
        const rgbTens4d= tf.slice4d(rgbaTens4d, [0, 0, 0, 0], [-1,-1, -1, 3]);
        const smallImg = tf.image.resizeBilinear(rgbTens4d, [80, 80]);
        let prediction = Array.from(modelForEmotionRecognition.predict(smallImg).dataSync());
        currentEmotion = getBestEmotion(prediction);
        results.innerHTML = magnifyResults(prediction);






        // let prediction = Array.from(modelForEmotionRecognition.predict(rgbArray).dataSync());

        // ctx.scale(80,80);

        // // Face to image
        // let img = ctx.getImageData(x1, y1, width, height);
        // console.log(img);


        // let test = createImageBitmap(ctx.getImageData(x1, y1, width, height));
        // console.log(test);

        // let myFaceImageData = ctx.getImageData(x1,y1,width,height);
        // console.log(myFaceImageData.data)
        // tf.image.resizeBilinear(myFaceImageData.data,[80,80]);


        // let myFaceImageData = new ImageData(100,100);
        // // console.log(myFaceImageData);
        // myFaceImageData.width=80;
        // myFaceImageData.height=80;
        // console.log(myFaceImageData);

        // let myImageDataWidth = ctx.getImageData(x1, y1, width, height).width;
        // let myImageDataHeight = ctx.getImageData(x1, y1, width, height).height;
        //
        // let myImageData = ctx.getImageData(x1, y1, width, height)["data"];
        // // let dataArray = imageData.data
        // let rgbArray = []
        // for (let i = 0; i < myImageData.length; i += 4) {
        //     // rgbArray.push([myImageData[i], myImageData[i+1], myImageData[i+2]])
        //     rgbArray.push(myImageData[i]);
        //     rgbArray.push(myImageData[i + 1]);
        //     rgbArray.push(myImageData[i + 2]);
        // }

        // console.log(rgbArray)
        // myImageData = tf.tensor3d(rgbArray, [myImageDataWidth, myImageDataHeight, 3]);
        // myImageData = tf.image.resizeBilinear(myImageData,[80, 80, 3]);
        // console.log(myImageData);

        // tf.image.resizeNearestNeighbor(rgbArray, [80, 80]);

        // const x = tf.tensor1d(rgbArray);
        // x.resize([80,80]).println();
        // const x = tf.tensor1d([1, 2, 3, 4]);
        // x.reshape([2, 2]).print()

        // let resized = tf.browser.fromPixels(ctx.getImageData(x1,y1,width,height));


        // console.log(test);
        // let resized = tf.browser.fromPixels(test).resizeBilinear([80, 80]);
        // let resized = test.reshape([1, 80, 80, 3]);

        // Data leak detected in image resizing
        // // let resized = tf.browser.fromPixels(img).resizeNearestNeighbor([80, 80]);
        // // let resized = tf.browser.fromPixels(img).resizeBicubic([80, 80]);
        // let resized = tf.browser.fromPixels(img).resizeBilinear([80, 80]);
        // resized = resized.reshape([1, 80, 80, 3]);

        // let prediction = Array.from(modelForEmotionRecognition.predict(resized).dataSync());
        // currentEmotion = getBestEmotion(prediction);
        // results.innerHTML = magnifyResults(prediction);
        tf.engine().endScope();
        // }
    }
};

setupCamera();
video.addEventListener("loadeddata", async () => {
    setInterval(detectFaces, 100);
});
