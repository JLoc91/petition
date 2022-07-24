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
    console.log("e.currentTarge: ", e.currentTarget);
    console.log("e: ", e);
    // console.log("window: ", window);

    // console.log("e.currentTarget.offsetLeft: ", e.currentTarget.offsetLeft);
    // console.log("e.currentTarget.offsetTop: ", e.currentTarget.offsetTop);
    // console.log("e.currentTarget.height: ", e.currentTarget.height);
    // console.log("e.currentTarget.width: ", e.currentTarget.width);
    // console.log("e.currentTarget.clientHeight: ", e.currentTarget.clientHeight);
    // console.log("e.currentTarget.clientWidth: ", e.currentTarget.clientWidth);
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
        // ctx.moveTo(
        //     e.pageX - canvas.offset().left,
        //     e.pageY - canvas.offset().top
        // );
        ctx.moveTo(
            e.pageX - e.currentTarget.offsetLeft,
            e.pageY - e.currentTarget.offsetTop
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
            // const drawX = e.originalEvent.touches[0].pageX;
            // const drawY = e.originalEvent.touches[0].pageY;
            ctx.lineTo(drawX, drawY);
            ctx.stroke();
            // console.log(
            //     "e.originalEvent.touches[0].pageX: ",
            //     e.originalEvent.touches[0].pageX
            // );
        } else {
            // const drawX = e.pageX - canvas.offset().left;
            // const drawY = e.pageY - canvas.offset().top;
            const drawX = e.pageX - e.currentTarget.offsetLeft;
            const drawY = e.pageY - e.currentTarget.offsetTop;
            ctx.lineTo(drawX, drawY);
            ctx.stroke();
            console.log("e.pageX: ", e.pageX);
            console.log(
                "e.currentTarget.offsetLeft: ",
                e.currentTarget.offsetLeft
            );
            console.log("drawX: ", drawX);
        }
    }
}

// for the menu
// const menuButton = $("#menu");
// const overlay = $("#overlay");
// const navigation = $("#navigation");
// const closeButton = $("#close-button");

// menuButton.on("click", showMenu);
// closeButton.on("click", closeMenuByButton);
// overlay.on("click", closeMenuByOverlay);

// function showMenu(e) {
//     console.log("Menu button clicked");
//     overlay.addClass("appear");
//     navigation.addClass("appear", "move-to-the-left");
// }
// function closeMenuByButton(e) {
//     console.log("Close button clicked");
//     overlay.removeClass("appear");
//     navigation.removeClass("appear", "move-to-the-left");
// }

// function closeMenuByOverlay(e) {
//     console.log("Overlay clicked");
//     overlay.removeClass("appear");
//     navigation.removeClass("appear", "move-to-the-left");
// }
