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

// 👇 ADD THIS BELOW THE MOOD BUTTON CODE

const showMoreMoods = document.getElementById("showMoreMoods");
const moreMoods = document.getElementById("moreMoods");

showMoreMoods.addEventListener("click", () => {

    moreMoods.classList.toggle("show");

    if (moreMoods.classList.contains("show")) {
        showMoreMoods.textContent = "▲ Hide moods";
    } else {
        showMoreMoods.textContent = "▼ More moods";
    }

});


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


/* ========================
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
    <img src="my picture.png" alt="SafeSpace">
</div>

            <div class="bubble">

                <strong>
                    Feelora
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
                                <img src="my picture.png" alt="SafeSpace">
                            </div>

                            <div class="bubble">

                                <strong>
                                    Feelora
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
            "https://safespace-ai-server.onrender.com/api/chat",

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

    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    if (!currentMood) {
        alert("Please choose your mood first.");
        return;
    }

    if (!currentUser) {
        alert("Please wait for Feelora to connect.");
        return;
    }

    sendButton.disabled = true;

    await saveMessage(text, "student");

    messageInput.value = "";
    characterCount.textContent = "0 / 1000";

    setTimeout(async () => {

        try {

            const response = await getAIResponse(text);

            await saveMessage(
                response,
                "support"
            );

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

    }, 800);
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
            <h3>Your rating increased</h3>
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
            <h3>🌸 Your rating stayed the same</h3>
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

const motivationalQuotes = [
    {
        quote: "Today is a new opportunity to try again.",
        emoji: "🌅"
    },
    {
        quote: "Small steps still count as progress.",
        emoji: "🌱"
    },
    {
        quote: "Believe in yourself and keep moving forward.",
        emoji: "💪"
    },
    {
        quote: "Your effort matters.",
        emoji: "⭐"
    },
    {
        quote: "Be patient with yourself.",
        emoji: "🌸"
    },
    {
        quote: "Every day is a chance to learn and grow.",
        emoji: "🌻"
    },
    { quote: "Today is a new opportunity to try again.",
        emoji: "🌅"
    },
    {
        quote: "Small steps still count as progress.",
        emoji: "🌱"
    },
    {
        quote: "You can take things one moment at a time.",
        emoji: "🌿"
    },
    {
        quote: "Your effort matters, even when progress feels slow.",
        emoji: "⭐"
    },
    {
        quote: "Be patient with yourself as you learn and grow.",
        emoji: "🌸"
    },
    {
        quote: "You don't have to have everything figured out today.",
        emoji: "🦋"
    },
    {
        quote: "Every day gives you another chance to learn something new.",
        emoji: "🌻"
    },
    {
        quote: "It's okay to pause and give yourself some time.",
        emoji: "☁️"
    },
    {
        quote: "Your feelings are worth listening to.",
        emoji: "💚"
    },
    {
        quote: "One difficult moment does not define your whole day.",
        emoji: "🌤️"
    },
    {
        quote: "You are allowed to grow at your own pace.",
        emoji: "🌷"
    },
    {
        quote: "A little progress is still progress.",
        emoji: "✨"
    },
    {
        quote: "Give yourself credit for the things you keep trying to do.",
        emoji: "🏆"
    },
    {
        quote: "You can start again whenever you're ready.",
        emoji: "🌅"
    },
    {
        quote: "There is value in taking time to understand yourself.",
        emoji: "🪴"
    },
    {
        quote: "Your voice and feelings deserve to be heard.",
        emoji: "💬"
    },
    {
        quote: "Be kind to yourself while you're figuring things out.",
        emoji: "🤍"
    },
    {
        quote: "You can face today one small step at a time.",
        emoji: "👣"
    },
    {
        quote: "Rest can be part of moving forward.",
        emoji: "🌙"
    },
    {
        quote: "You don't need to compare your journey with anyone else's.",
        emoji: "🦋"
    },
    {
        quote: "Every small choice to care for yourself matters.",
        emoji: "💚"
    },
    {
        quote: "It's okay if today looks different from yesterday.",
        emoji: "🌈"
    },
    {
        quote: "Learning from a difficult day can help you grow.",
        emoji: "🌱"
    },
    {
        quote: "You deserve moments of peace in your day.",
        emoji: "🕊️"
    },
    {
        quote: "Keep making room for things that bring you calm and joy.",
        emoji: "🌼"
    },
    {
        quote: "You are still growing, even when you don't notice it.",
        emoji: "🌿"
    },
    {
        quote: "Take a breath, take your time, and take the next small step.",
        emoji: "🍃"
    },
    {
        quote: "Your progress is yours, and it doesn't have to look perfect.",
        emoji: "⭐"
    },
    {
        quote: "There is always something new you can discover about yourself.",
        emoji: "🔎"
    },
    {
        quote: "Whatever today brings, you can give yourself patience and care.",
        emoji: "💛"
    }  
];

const quoteElement =
    document.getElementById("dailyQuote");

if (quoteElement) {

    const today = new Date();

    const dateKey =
        today.getFullYear() * 10000 +
        (today.getMonth() + 1) * 100 +
        today.getDate();

    const quoteIndex =
        dateKey % motivationalQuotes.length;

    const dailyQuote =
        motivationalQuotes[quoteIndex];

    quoteElement.textContent =
        `${dailyQuote.emoji} “${dailyQuote.quote}”`;
}