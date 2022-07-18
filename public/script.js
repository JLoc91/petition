// this is where your canvas / signature code will go
const canvas = $("canvas");
const submit = $("#submit");
const signatureInput = $("[name='signature']");
const ctx = canvas[0].getContext("2d");
let trigger = false;
const startTrigger = ["touchstart", "mousedown"];
const moveTrigger = ["touchmove", "mousemove"];
const endTrigger = ["touchend", "mouseup"];

const mobileCondition =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform);

if (mobileCondition) {
    console.log("MOBILE");
    canvas.on(startTrigger[0], startSignature);
    $(document).on(endTrigger[0], endSignature);
    canvas.on(moveTrigger[0], writeSignature);
} else {
    console.log("NOOOOOOOT MOBILE");

    canvas.on(startTrigger[1], startSignature);
    $(document).on(endTrigger[1], endSignature);
    canvas.on(moveTrigger[1], writeSignature);
}

function startSignature(e) {
    e.preventDefault();
    console.log("start drawing!!!!!!!!!!!!!!!!!!!!!!!!!!");
    trigger = true;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (mobileCondition) {
        ctx.moveTo(
            e.originalEvent.touches[0].pageX - canvas.offset().left,
            e.originalEvent.touches[0].pageY - canvas.offset().top
        );
    } else {
        ctx.moveTo(
            e.pageX - canvas.offset().left,
            e.pageY - canvas.offset().top
        );
    }
}

function endSignature() {
    const dataURL = canvas[0].toDataURL();
    canvas.val(dataURL);
    signatureInput.val(dataURL);
    trigger = false;
}

function writeSignature(e) {
    if (trigger) {
        if (mobileCondition) {
            console.log("mal wieder mobile");
            const drawX =
                e.originalEvent.touches[0].pageX - canvas.offset().left;
            const drawY =
                e.originalEvent.touches[0].pageY - canvas.offset().top;
            ctx.lineTo(drawX, drawY);
            ctx.stroke();
            console.log(
                "e.originalEvent.touches[0].pageX: ",
                e.originalEvent.touches[0].pageX
            );
        } else {
            const drawX = e.pageX - canvas.offset().left;
            const drawY = e.pageY - canvas.offset().top;
            ctx.lineTo(drawX, drawY);
            ctx.stroke();
            console.log("e.pageX: ", e.pageX);
        }
    }
}
