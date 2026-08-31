import { app, auth, db } from "./firebase-config.js";

import {
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
/* =========================
   HTML ELEMENTS
========================= */

const anonymousId =
    document.getElementById(
        "anonymousId"
    );


const moodButtons =
    document.querySelectorAll(
        ".mood"
    );


const moodStatus =
    document.getElementById(
        "moodStatus"
    );


const chatMessages =
    document.getElementById(
        "chatMessages"
    );


const messageInput =
    document.getElementById(
        "messageInput"
    );


const sendButton =
    document.getElementById(
        "sendButton"
    );

const characterCount =
    document.getElementById(
        "characterCount"
    );

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


/* =========================
   VARIABLES
========================= */

let currentUser = null;

let currentMood = "";

/* =========================
   ANONYMOUS LOGIN
========================= */

signInAnonymously(auth)
    .catch(error => {

        console.error(
            "Anonymous login error:",
            error
        );

        anonymousId.textContent =
            "Offline mode";

    });


/* =========================
   AUTH STATE
========================= */

onAuthStateChanged(
    auth,
    user => {

        if (!user) {
            return;
        }

        currentUser = user;

        const shortId =
            user.uid.substring(
                0,
                6
            );

        anonymousId.textContent =
            `Anonymous #${shortId}`;

        listenForMessages();

    }
);


/* =========================
   MOOD SELECTION
========================= */

moodButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                moodButtons.forEach(
                    item => {

                        item.classList.remove(
                            "selected"
                        );

                    }
                );


                button.classList.add(
                    "selected"
                );


                currentMood =
                    button.dataset.mood;


                moodStatus.textContent =
                    `Current mood: ${currentMood};`

            }
        );

    }
);


/* =========================
   CHARACTER COUNTER
========================= */

messageInput.addEventListener(
    "input",
    () => {

        characterCount.textContent =
            `${messageInput.value.length} / 1000`;

    }
);


/* =========================
   HTML ESCAPE
========================= */

function escapeHTML(text) {

    const element =
        document.createElement(
            "div"
        );

    element.textContent = text;

    return element.innerHTML;

}


/* =========================
   SAFETY CHECK
========================= */

function safetyConcern(text) {

    const message =
        text.toLowerCase();


    const keywords = [

        "suicide",
        "kill myself",
        "end my life",
        "hurt myself",
        "self harm",
        "self-harm"

    ];


    return keywords.some(
        keyword =>
            message.includes(keyword)
    );

}


/* =========================
   SUPPORTIVE RESPONSE
========================= */

function generateResponse(
    text
) {

    const message =
        text.toLowerCase();


    /*
       SAFETY RESPONSE
    */

    if (
        safetyConcern(text)
    ) {

        return `

            <p>
                I'm glad you shared this.
            </p>

            <p>
                What you're experiencing
                deserves support from a real
                person who can help you.
            </p>

            <p>
                Please tell a trusted adult,
                such as a parent, guardian,
                teacher, school counselor,
                or another adult you trust.
            </p>

            <p>
                If you feel you may be in
                immediate danger, seek emergency
                help or go to the nearest
                emergency department.
            </p>

            <p>
                <strong>
                    You don't have to handle
                    this alone.
                </strong>
            </p>

        `;

    }


    /*
       SCHOOL
    */

    if (

        message.includes("school") ||
        message.includes("exam") ||
        message.includes("test") ||
        message.includes("homework") ||
        message.includes("assignment") ||
        message.includes("grade")

    ) {

        return `

            <p>
                It sounds like school has been
                putting a lot of pressure on you.
            </p>

            <p>
                Try focusing on one task at a
                time instead of thinking about
                everything at once.
            </p>

            <p>
                Taking short breaks can also
                give your mind time to rest.
            </p>

            <p>
                If the pressure becomes difficult
                to manage, consider talking with
                a trusted adult or school counselor.
            </p>

        `;

    }


    /*
       FRIENDSHIP
    */

    if (

        message.includes("friend") ||
        message.includes("friendship") ||
        message.includes("ignored") ||
        message.includes("left out") ||
        message.includes("bully") ||
        message.includes("bullying")

    ) {

        return `

            <p>
                Problems with friends can be
                difficult, especially when you
                feel ignored or left out.
            </p>

            <p>
                Give yourself some time to think
                about what happened.
            </p>

            <p>
                If someone is repeatedly bullying
                or hurting you, consider telling
                a trusted adult who can help.
            </p>

        `;

    }


    /*
       FAMILY
    */

    if (

        message.includes("family") ||
        message.includes("parent") ||
        message.includes("parents") ||
        message.includes("mom") ||
        message.includes("dad")

    ) {

        return `

            <p>
                Family problems can be difficult
                because they can affect us deeply.
            </p>

            <p>
                You don't have to solve everything
                immediately.
            </p>

            <p>
                Consider talking with a trusted
                adult who can listen and support you.
            </p>

        `;

    }


    /*
       LONELINESS
    */

    if (

        message.includes("lonely") ||
        message.includes("alone") ||
        message.includes("nobody")

    ) {

        return `

            <p>
                I'm sorry you're feeling lonely.
            </p>

            <p>
                If possible, try reaching out to
                someone you trust.
            </p>

            <p>
                You could simply say,
                "I'm having a difficult day.
                Can you listen for a while?"
            </p>

        `;

    }


    /*
       STRESS
    */

    if (

        message.includes("stress") ||
        message.includes("stressed") ||
        message.includes("pressure") ||
        message.includes("overwhelmed")

    ) {

        return `

            <p>
                It sounds like you're carrying
                a lot right now.
            </p>

            <p>
                Try focusing on one thing at a
                time and give yourself permission
                to take a short break.
            </p>

            <p>
                Talking with someone you trust
                can also help.
            </p>

        `;

    }


    /*
       WORRY
    */

    if (

        message.includes("worried") ||
        message.includes("worry") ||
        message.includes("nervous") ||
        message.includes("anxious")

    ) {

        return `

            <p>
                It sounds like something has
                been worrying you.
            </p>

            <p>
                Try focusing on what you can
                control right now.
            </p>

            <p>
                Talking about your worries with
                someone you trust may also help.
            </p>

        `;

    }


    /*
       DEFAULT
    */

    return `

        <p>
            Thank you for sharing that with me. 💚
        </p>

        <p>
            Putting your feelings into words
            can be an important first step.
        </p>

        <p>
            You don't have to figure everything
            out immediately.
        </p>

        <p>
            If you feel comfortable, consider
            talking with someone you trust.
        </p>

        <p>
            <strong>
                Your feelings matter.
            </strong>
        </p>

    `;

}


/* =========================
   SAVE MESSAGE
========================= */

async function saveMessage(
    text,
    sender
) {

    if (!currentUser) {

        return;

    }


    try {

        await addDoc(

            collection(
                db,
                "users",
                currentUser.uid,
                "messages"
            ),

            {

                text: text,

                sender: sender,

                mood: currentMood,

                createdAt:
                    serverTimestamp()

            }

        );

    }

    catch(error) {

        console.error(
            "Message error:",
            error
        );

    }

}


/* =========================
   DISPLAY MESSAGE
========================= */

function displayMessage(
    text,
    sender
) {

    const message =
        document.createElement(
            "div"
        );


    message.classList.add(
        "message"
    );


    if (
        sender === "student"
    ) {

        message.classList.add(
            "user"
        );


        message.innerHTML = `

            <div class="avatar">
                👤
            </div>

            <div class="bubble">

                <strong>
                    You
                </strong>

                <p>
                    ${escapeHTML(text)}
                </p>

            </div>

        `;

    }

    else {

        message.classList.add(
            "bot"
        );


        message.innerHTML = `

            <div class="avatar">
                🌱
            </div>

            <div class="bubble">

                <strong>
                    SafeSpace
                </strong>

                ${text}

            </div>

        `;

    }


    chatMessages.appendChild(
        message
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


/* =========================
   LISTEN FOR MESSAGES
========================= */

function listenForMessages() {

    if (!currentUser) {

        return;

    }


    const messagesRef =
        collection(
            db,
            "users",
            currentUser.uid,
            "messages"
        );


    const messagesQuery =
        query(
            messagesRef,
            orderBy(
                "createdAt"
            )
        );


    onSnapshot(
        messagesQuery,
        snapshot => {

            /*
               Keep the welcome message.
               Remove previous dynamic messages.
            */

            const dynamicMessages =
                chatMessages.querySelectorAll(
                    ".dynamic-message"
                );


            dynamicMessages.forEach(
                message =>
                    message.remove()
            );


            snapshot.forEach(
                documentSnapshot => {

                    const data =
                        documentSnapshot.data();


                    const message =
                        document.createElement(
                            "div"
                        );


                    message.classList.add(
                        "message",
                        "dynamic-message"
                    );


                    if (
                        data.sender ===
                        "student"
                    ) {

                        message.classList.add(
                            "user"
                        );


                        message.innerHTML = `

                            <div class="avatar">
                                👤
                            </div>

                            <div class="bubble">

                                <strong>
                                    You
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        data.text
                                    )}
                                </p>

                            </div>

                        `;

                    }

                    else {

                        message.classList.add(
                            "bot"
                        );


                        message.innerHTML = `

                            <div class="avatar">
                                🌱
                            </div>

                            <div class="bubble">

                                <strong>
                                    SafeSpace
                                </strong>

                                ${data.text}

                            </div>

                        `;

                    }


                    chatMessages.appendChild(
                        message
                    );

                }
            );


            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }
    );

}


/* =========================
   SEND MESSAGE
========================= */

async function getAIResponse(text) {
    try {
        const response = await fetch(
            "https://safespace-ai-server.onrender.com",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: text,
                    mood: currentMood
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "AI request failed"
            );
        }

        return data.reply;

    } catch (error) {
        console.error("AI error:", error);

        return `
            <p>
                I'm having trouble connecting to
                SafeSpace AI right now.
            </p>

            <p>
                Your message was still saved.
                Please try again in a moment.
            </p>
        `;
    }
}
async function sendMessage() {

    const text =
        messageInput.value.trim();


    if (!text) {

        return;

    }


    if (!currentMood) {

        alert(
            "Please choose your mood first."
        );

        return;

    }


    if (!currentUser) {

        alert(
            "Please wait for SafeSpace to connect."
        );

        return;

    }


    sendButton.disabled = true;


    /*
       SAVE STUDENT MESSAGE
    */

    await saveMessage(
        text,
        "student"
    );


    /*
       CLEAR INPUT
    */

    messageInput.value = "";

    characterCount.textContent =
        "0 / 1000";


    /*
       GENERATE SUPPORTIVE RESPONSE
    */

    setTimeout(
        async () => {
try {

    // Keep safety responses local
    if (safetyConcern(text)) {

       const response =
    await getAIResponse(text);

        await saveMessage(
            response,
            "support"
        );

    } else {

        // Send the student's message to our AI server
        const aiResponse = await fetch(
            "https://safespace-ai-server.onrender.com",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    message: text,
                    mood: currentMood
                })
            }
        );

        if (!aiResponse.ok) {
            throw new Error("AI server error");
        }

        const data =
            await aiResponse.json();

        await saveMessage(
            data.reply,
            "support"
        );
    }

} catch (error) {

    console.error(
        "AI response error:",
        error
    );

    await saveMessage(
        "I'm having trouble connecting right now. Please try again in a moment.",
        "support"
    );

} finally {

    sendButton.disabled = false;
}


            sendButton.disabled =
                false;

        },
        800
    );

}


/* =========================
   BUTTON
========================= */

sendButton.addEventListener(
    "click",
    sendMessage
);


/* =========================
   ENTER KEY
========================= */

messageInput.addEventListener(
    "keydown",
    event => {

        if (

            event.key === "Enter" &&
            !event.shiftKey

        ) {

            event.preventDefault();

            sendMessage();

        }

    }
);


/* =========================
   RESET
========================= */

logoutButton.addEventListener(
    "click",
    () => {

        const confirmation =
            confirm(
                "Reset this anonymous session?"
            );


        if (!confirmation) {

            return;

        }


        location.reload();

    }
);

/* =========================
   BEFORE / AFTER FEELING CALCULATOR
========================= */

const feelingRatings =
    document.querySelectorAll(".feeling-rating");

const afterFeelingRatings =
    document.querySelectorAll(".after-feeling-rating");

const beforeStatus =
    document.getElementById("beforeStatus");

const afterStatus =
    document.getElementById("afterStatus");

const afterRatingButton =
    document.getElementById("afterRatingButton");

const afterFeelingArea =
    document.getElementById("afterFeelingArea");

const feelingResult =
    document.getElementById("feelingResult");


let beforeRating = null;
let afterRating = null;


/* =========================
   BEFORE RATING
========================= */

feelingRatings.forEach(button => {

    button.addEventListener("click", () => {

        feelingRatings.forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        beforeRating =
            Number(button.dataset.rating);

        beforeStatus.textContent =
            `Before rating: ${beforeRating}/5`;

        afterRatingButton.disabled = false;

    });

});


/* =========================
   START AFTER RATING
========================= */

afterRatingButton.addEventListener(
    "click",
    () => {

        if (beforeRating === null) {
            alert(
                "Please choose your before-feeling rating first."
            );
            return;
        }

        afterFeelingArea.style.display = "block";

        afterRatingButton.disabled = true;

        afterFeelingArea.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }
);


/* =========================
   AFTER RATING
========================= */

afterFeelingRatings.forEach(button => {

    button.addEventListener("click", async () => {

        afterFeelingRatings.forEach(item => {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        afterRating =
            Number(button.dataset.rating);

        afterStatus.textContent =
            `After rating: ${afterRating}/5`;

        calculateFeelingChange();

    });

});


/* =========================
   CALCULATE CHANGE
========================= */

async function calculateFeelingChange() {

    if (
        beforeRating === null ||
        afterRating === null
    ) {
        return;
    }

    const change =
        afterRating - beforeRating;

    let resultMessage = "";

    if (change > 0) {

        resultMessage = `
            <h3>💚 Your rating increased</h3>
            <p>
                Before: <strong>${beforeRating}/5</strong>
            </p>
            <p>
                After: <strong>${afterRating}/5</strong>
            </p>
            <p>
                Change: <strong>+${change}</strong>
            </p>
            <p>
                Your self-reported feeling rating improved
                after using SafeSpace.
            </p>
        `;

    }
    else if (change === 0) {

        resultMessage = `
            <h3>🌱 Your rating stayed the same</h3>
            <p>
                Before: <strong>${beforeRating}/5</strong>
            </p>
            <p>
                After: <strong>${afterRating}/5</strong>
            </p>
            <p>
                Change: <strong>0</strong>
            </p>
            <p>
                Your self-reported rating stayed the same
                during this session.
            </p>
        `;

    }
    else {

        resultMessage = `
            <h3>💛 Thank you for checking in</h3>
            <p>
                Before: <strong>${beforeRating}/5</strong>
            </p>
            <p>
                After: <strong>${afterRating}/5</strong>
            </p>
            <p>
                Change: <strong>${change}</strong>
            </p>
            <p>
                Your rating did not increase during this
                session. Consider talking with someone
                you trust if you need additional support.
            </p>
        `;

    }

    feelingResult.innerHTML = resultMessage;

    await saveFeelingResult(
        beforeRating,
        afterRating,
        change
    );

}
