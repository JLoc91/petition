// this is where your canvas / signature code will go
const canvas = $("canvas");
const submit = $("#submit");
const signatureInput = $("[name='signature']");
const ctx = canvas[0].getContext("2d");
let mousedown = false;

canvas.on("mousedown", makeSignature);

function makeSignature(e) {
    e.preventDefault();
    console.log("start drawing!!!!!!!!!!!!!!!!!!!!!!!!!!");
    mousedown = true;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(e.pageX - canvas.offset().left, e.pageY - canvas.offset().top);
}

$(document).on("mouseup", function () {
    const dataURL = canvas[0].toDataURL();
    canvas.val(dataURL);
    signatureInput.val(dataURL);

    // console.log("dataURL: ", dataURL);
    // console.log("drawing over???????????????????????????????");
    // console.log("canvas.val(): ", canvas.val());
    mousedown = false;
    // canvas.off("mousemove");
});

canvas.on("mousemove", (e) => {
    if (mousedown) {
        const drawX = e.pageX - canvas.offset().left;
        const drawY = e.pageY - canvas.offset().top;

        // console.log("e.pageX: ", e.pageX);

        ctx.lineTo(drawX, drawY);
        ctx.stroke();
        // console.log("drawX: ", drawX);
        // console.log("drawY: ", drawY);
    }
});

// submit.on("mouseup", makeSubmit);

// function makeSubmit() {
//     const firstInput = $("[name='first']").val();
//     const lastInput = $("[name='last']").val();
//     const
//     const canvasInput = canvas.val();
//     console.log("firstInput: ", firstInput);
//     console.log("lastInput: ", lastInput);
//     console.log("canvasInput: ", canvasInput);
// }
