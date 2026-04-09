import "./style.css";
import { createClient } from "@supabase/supabase-js";

const memoryPhotoOne = new URL("../asets/IMG_8477.JPG.jpeg", import.meta.url).href;
const memoryVideo = new URL("../asets/IMG_8478.MP4", import.meta.url).href;
const memoryPhotoTwo = new URL("../asets/IMG_8479.JPG.jpeg", import.meta.url).href;
const finalGiftVideo = new URL("../asets/IMG_8498.mp4", import.meta.url).href;

const profile = {
  herName: "Shaluu",
  yourName: "Your Name",
  memories: [
    {
      type: "image",
      src: memoryPhotoOne,
      caption: "Your smile in this one makes everything feel softer.",
    },
    {
      type: "video",
      src: memoryVideo,
      caption: "Our selfie moment. This one is my favorite little us-memory.",
    },
    {
      type: "image",
      src: memoryPhotoTwo,
      caption: "I keep coming back to this because it feels like home.",
    },
  ],
  compliments: [
    "You have a rare kind of warmth.",
    "You make ordinary moments feel special.",
    "You are stronger than you admit.",
    "Your smile can reset a bad day.",
    "You are still my favorite person to talk to.",
  ],
};

type ResponsePayload = Record<string, string | number | boolean | null>;

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const trackingEnabled = Boolean(supabase);
console.info("[tracking] supabase enabled:", trackingEnabled, {
  url_present: Boolean(supabaseUrl),
  key_present: Boolean(supabaseAnonKey),
});

declare global {
  interface Window {
    __TRACKING_DEBUG__?: {
      enabled: boolean;
      urlPresent: boolean;
      keyPresent: boolean;
    };
  }
}

window.__TRACKING_DEBUG__ = {
  enabled: trackingEnabled,
  urlPresent: Boolean(supabaseUrl),
  keyPresent: Boolean(supabaseAnonKey),
};

const sessionId = (() => {
  const key = "story_session_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  localStorage.setItem(key, generated);
  return generated;
})();

const trackResponse = async (
  eventName: string,
  payload: ResponsePayload = {},
) => {
  if (!supabase) {
    console.warn("[tracking] skipped insert; supabase not configured", { eventName });
    return;
  }
  const { error } = await supabase.from("experience_responses").insert({
    session_id: sessionId,
    event_name: eventName,
    payload,
    user_agent: navigator.userAgent,
    page_url: window.location.href,
  });
  if (error) {
    console.error("Supabase insert failed:", error.message, { eventName, payload });
  }
};

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

app.innerHTML = `
  <main class="page">
    <div class="bg-orb orb-1"></div>
    <div class="bg-orb orb-2"></div>
    <div class="bg-orb orb-3"></div>
    <div id="particle-layer" class="particle-layer"></div>

    <section id="intro-screen" class="screen intro-screen visible">
      <div class="glass intro-card">
        <h1 id="intro-line-1" class="typing-line"></h1>
        <h2 id="intro-line-2" class="typing-line"></h2>
        <button id="enter-btn" class="btn primary">Enter if you promise to smile 😊</button>
      </div>
    </section>

    <section id="story-screen" class="screen story-screen">
      <section class="story-block">
        <div class="glass">
          <p class="label">About ${profile.herName}</p>
          <h2>The little things I adore</h2>
          <div id="compliment-grid" class="compliment-grid"></div>
        </div>
      </section>

      <section class="story-block">
        <div class="glass">
          <p class="label">Memory Lane</p>
          <h2>Moments that stay with me</h2>
          <div id="memory-grid" class="memory-grid"></div>
        </div>
      </section>

      <section class="story-block">
        <div class="glass centered">
          <p class="label">Hidden Message</p>
          <h2>Unlock one honest line</h2>
          <button id="unlock-btn" class="btn">Tap to unlock</button>
          <p id="hidden-msg" class="hidden-msg"></p>
        </div>
      </section>

      <section class="story-block">
        <div class="glass">
          <p class="label">Emotional Message</p>
          <h2>What I need you to know</h2>
          <p id="emotion-text-1" class="typing-line body-line"></p>
          <p id="emotion-text-2" class="typing-line body-line"></p>
          <p id="emotion-text-3" class="typing-line body-line"></p>
        </div>
      </section>

      <section class="story-block">
        <div class="glass">
          <p class="label">Apology</p>
          <h2>From me, directly</h2>
          <p id="apology-text-1" class="typing-line body-line"></p>
          <p id="apology-text-2" class="typing-line body-line"></p>
          <p id="apology-text-3" class="typing-line body-line"></p>
        </div>
      </section>

      <section class="story-block">
        <div class="glass centered">
          <p class="label">One Condition</p>
          <p class="feature-line">Fine... I'll let it go... BUT on one condition 😌</p>
          <button id="what-btn" class="btn">What?</button>
          <div id="deal-wrap" class="deal-wrap hidden">
            <p>No more making me feel like that again... deal?</p>
            <button id="deal-btn" class="btn primary">Deal 🤝</button>
          </div>
          <p id="resolution-text" class="resolution-text"></p>
          <p id="delay-line" class="delay-line"></p>
        </div>
      </section>

      <section class="story-block">
        <div class="glass centered">
          <p class="label">Final Gift</p>
          <h2>Okay... last thing. This one's for you.</h2>
          <button id="gift-btn" class="btn primary">Open it 🎁</button>
          <div id="gift-box" class="gift-box hidden">🎁</div>
          <div id="video-wrap" class="video-wrap hidden">
            <video controls playsinline preload="metadata">
              <source src="${finalGiftVideo}" type="video/mp4" />
            </video>
            <p>Just watch this till the end ❤️</p>
          </div>
        </div>
      </section>

      <section class="story-block">
        <div class="glass centered">
          <p class="label">One Playful Ask</p>
          <p class="feature-line">Can I ask something... you shouldn't say no 😌</p>
          <div class="choice-row">
            <button id="ask-yes-btn" class="btn">Yes</button>
            <button id="ask-no-btn" class="btn">No</button>
          </div>
          <p id="playful-reveal" class="resolution-text"></p>
          <p id="playful-wholesome" class="delay-line"></p>
          <div id="send-options" class="choice-row hidden">
            <button id="send-now-btn" class="btn">sending you now</button>
            <button id="send-night-btn" class="btn">will send at night</button>
          </div>
          <p id="send-choice-text" class="delay-line"></p>
        </div>
      </section>

      <section class="story-block">
        <div class="glass centered">
          <p class="feature-line">See... I can't stay upset with you.</p>
          <p class="feature-line">Not when it's you.</p>
          <button id="final-okay-btn" class="btn primary">Can we make it okay again?</button>
          <p id="final-warm-text" class="delay-line"></p>
        </div>
      </section>
    </section>

    <div id="scroll-guard" class="popup-backdrop hidden">
      <div class="popup-card">
        <p>Please pick one option first 😌</p>
        <button id="popup-ok-btn" class="btn">Okay</button>
      </div>
    </div>
  </main>
`;

const complimentsGrid = document.querySelector<HTMLDivElement>("#compliment-grid");
const memoryGrid = document.querySelector<HTMLDivElement>("#memory-grid");
const introLine1 = document.querySelector<HTMLHeadingElement>("#intro-line-1");
const introLine2 = document.querySelector<HTMLHeadingElement>("#intro-line-2");
const enterBtn = document.querySelector<HTMLButtonElement>("#enter-btn");
const introScreen = document.querySelector<HTMLDivElement>("#intro-screen");
const storyScreen = document.querySelector<HTMLDivElement>("#story-screen");
const unlockBtn = document.querySelector<HTMLButtonElement>("#unlock-btn");
const hiddenMsg = document.querySelector<HTMLParagraphElement>("#hidden-msg");
const whatBtn = document.querySelector<HTMLButtonElement>("#what-btn");
const dealWrap = document.querySelector<HTMLDivElement>("#deal-wrap");
const dealBtn = document.querySelector<HTMLButtonElement>("#deal-btn");
const resolutionText = document.querySelector<HTMLParagraphElement>("#resolution-text");
const giftBtn = document.querySelector<HTMLButtonElement>("#gift-btn");
const giftBox = document.querySelector<HTMLDivElement>("#gift-box");
const videoWrap = document.querySelector<HTMLDivElement>("#video-wrap");
const askYesBtn = document.querySelector<HTMLButtonElement>("#ask-yes-btn");
const askNoBtn = document.querySelector<HTMLButtonElement>("#ask-no-btn");
const playfulReveal = document.querySelector<HTMLParagraphElement>("#playful-reveal");
const playfulWholesome = document.querySelector<HTMLParagraphElement>("#playful-wholesome");
const sendOptions = document.querySelector<HTMLDivElement>("#send-options");
const sendNowBtn = document.querySelector<HTMLButtonElement>("#send-now-btn");
const sendNightBtn = document.querySelector<HTMLButtonElement>("#send-night-btn");
const sendChoiceText = document.querySelector<HTMLParagraphElement>("#send-choice-text");
const delayLine = document.querySelector<HTMLParagraphElement>("#delay-line");
const particleLayer = document.querySelector<HTMLDivElement>("#particle-layer");
const scrollGuard = document.querySelector<HTMLDivElement>("#scroll-guard");
const popupOkBtn = document.querySelector<HTMLButtonElement>("#popup-ok-btn");
const finalOkayBtn = document.querySelector<HTMLButtonElement>("#final-okay-btn");
const finalWarmText = document.querySelector<HTMLParagraphElement>("#final-warm-text");
const emotionText1 = document.querySelector<HTMLParagraphElement>("#emotion-text-1");
const emotionText2 = document.querySelector<HTMLParagraphElement>("#emotion-text-2");
const emotionText3 = document.querySelector<HTMLParagraphElement>("#emotion-text-3");
const apologyText1 = document.querySelector<HTMLParagraphElement>("#apology-text-1");
const apologyText2 = document.querySelector<HTMLParagraphElement>("#apology-text-2");
const apologyText3 = document.querySelector<HTMLParagraphElement>("#apology-text-3");

const hiddenMessages = [
  "You matter to me way more than my ego.",
  "I never want us to become careless with each other.",
  "I still choose us, with better communication.",
  "Even on hard days, my care for you does not change.",
];

let noInteractionTimer: number | undefined;
let scrollWasLockedByPlayfulAsk = false;

const lockScroll = () => {
  document.body.style.overflow = "hidden";
  scrollWasLockedByPlayfulAsk = true;
};

const unlockScroll = () => {
  if (!scrollWasLockedByPlayfulAsk) return;
  document.body.style.overflow = "";
  scrollWasLockedByPlayfulAsk = false;
};

const showScrollGuard = () => {
  if (!scrollWasLockedByPlayfulAsk) return;
  scrollGuard?.classList.remove("hidden");
};

const hideScrollGuard = () => {
  scrollGuard?.classList.add("hidden");
};

const playSoftTone = (frequency: number, duration = 0.12) => {
  const audio = new window.AudioContext();
  const oscillator = audio.createOscillator();
  const gain = audio.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.value = 0.03;
  oscillator.connect(gain);
  gain.connect(audio.destination);
  oscillator.start();
  oscillator.stop(audio.currentTime + duration);
};

const typeText = async (el: HTMLElement | null, text: string, speed = 28) => {
  if (!el) return;
  el.textContent = "";
  for (const char of text) {
    el.textContent += char;
    await new Promise((resolve) => setTimeout(resolve, speed));
  }
};

const createHeartBurst = (x: number, y: number) => {
  for (let i = 0; i < 18; i += 1) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.textContent = "❤";
    const angle = (Math.PI * 2 * i) / 18;
    const distance = 70 + Math.random() * 35;
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1000);
  }
};

const createCursorHeart = (x: number, y: number) => {
  const heart = document.createElement("span");
  heart.className = "cursor-heart";
  heart.textContent = "❤";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 650);
};

const createParticles = () => {
  if (!particleLayer) return;
  for (let i = 0; i < 26; i += 1) {
    const dot = document.createElement("span");
    dot.className = "particle";
    dot.style.left = `${Math.random() * 100}%`;
    dot.style.animationDelay = `${Math.random() * 8}s`;
    dot.style.animationDuration = `${8 + Math.random() * 9}s`;
    particleLayer.appendChild(dot);
  }
};

profile.compliments.forEach((line) => {
  if (!complimentsGrid) return;
  const card = document.createElement("article");
  card.className = "compliment-card";
  card.textContent = line;
  complimentsGrid.appendChild(card);
});

profile.memories.forEach((memory) => {
  if (!memoryGrid) return;
  const item = document.createElement("figure");
  item.className = "memory-card";
  if (memory.type === "video") {
    item.innerHTML = `
      <video controls playsinline preload="metadata">
        <source src="${memory.src}" type="video/mp4" />
      </video>
      <figcaption>${memory.caption}</figcaption>
    `;
  } else {
    item.innerHTML = `
      <img src="${memory.src}" alt="memory with ${profile.herName}" />
      <figcaption>${memory.caption}</figcaption>
    `;
  }
  memoryGrid.appendChild(item);
});

createParticles();
typeText(introLine1, "Hey... wait...");
setTimeout(() => typeText(introLine2, "It's something I made for you."), 900);

enterBtn?.addEventListener("click", async () => {
  void trackResponse("enter_clicked", { her_name: profile.herName });
  playSoftTone(540);
  introScreen?.classList.remove("visible");
  introScreen?.classList.add("fade-out");
  setTimeout(() => {
    introScreen?.classList.add("hidden");
    storyScreen?.classList.add("visible");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 500);

  await typeText(emotionText1, `${profile.herName}, I know yesterday felt heavy between us.`, 23);
  await typeText(emotionText2, "I care about you too much to pretend it did not matter.", 23);
  await typeText(
    emotionText3,
    "I want us to handle hard moments better, not hurt each other while trying to be heard.",
    23,
  );
  await typeText(apologyText1, "I'm sorry for bursting out yesterday...", 27);
  await typeText(apologyText2, "I didn't mean to hurt you.", 27);
  await typeText(apologyText3, "I reacted that way because you're the only person I talk to like this ❤️", 27);
});

unlockBtn?.addEventListener("click", async () => {
  playSoftTone(620);
  const unlocked = hiddenMessages[Math.floor(Math.random() * hiddenMessages.length)];
  await typeText(hiddenMsg, unlocked, 22);
  void trackResponse("hidden_message_unlocked", { message: unlocked });
});

whatBtn?.addEventListener("click", () => {
  playSoftTone(430);
  dealWrap?.classList.remove("hidden");
  void trackResponse("condition_what_clicked");
});

dealBtn?.addEventListener("click", async (event) => {
  playSoftTone(700, 0.14);
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  document.body.classList.add("glow-pulse");
  setTimeout(() => document.body.classList.remove("glow-pulse"), 1300);
  if (delayLine) delayLine.textContent = "";
  await typeText(resolutionText, "That's all I wanted to hear.", 30);
  await new Promise((resolve) => setTimeout(resolve, 550));
  await typeText(resolutionText, "Come here... we're okay now ❤️", 30);
  void trackResponse("deal_accepted");
});

noInteractionTimer = window.setTimeout(() => {
  if (!resolutionText?.textContent && delayLine) {
    delayLine.textContent = "Don't overthink it... you already know what I'd choose 😌";
  }
}, 12000);

giftBtn?.addEventListener("click", () => {
  playSoftTone(520);
  giftBox?.classList.remove("hidden");
  giftBox?.classList.add("shake");
  setTimeout(() => {
    const x = window.innerWidth / 2;
    const y = window.scrollY + window.innerHeight / 2;
    createHeartBurst(x, y);
    giftBox?.classList.remove("shake");
    videoWrap?.classList.remove("hidden");
    videoWrap?.classList.add("fade-in");
  }, 850);
  if (noInteractionTimer) window.clearTimeout(noInteractionTimer);
  void trackResponse("gift_opened");
});

const showPlayfulResult = async (reply: "yes" | "no") => {
  void trackResponse("playful_choice", { choice: reply });
  if (reply === "yes") {
    await typeText(playfulReveal, "one boobiee pic pls 🥺👀", 26);
    await typeText(playfulWholesome, "dont you think so?this cute guy desreves this ❤️", 26);
    sendOptions?.classList.remove("hidden");
    if (sendChoiceText) sendChoiceText.textContent = "";
    lockScroll();
  } else {
    await typeText(playfulReveal, "Okayyy, fair 😌", 26);
    await typeText(playfulWholesome, "No pressure ever. I just like talking to you anyway ❤️", 26);
    sendOptions?.classList.add("hidden");
    if (sendChoiceText) sendChoiceText.textContent = "";
    unlockScroll();
  }
};

askYesBtn?.addEventListener("click", () => {
  playSoftTone(610, 0.1);
  showPlayfulResult("yes");
});

askNoBtn?.addEventListener("click", () => {
  playSoftTone(450, 0.1);
  showPlayfulResult("no");
});

sendNowBtn?.addEventListener("click", async () => {
  playSoftTone(640, 0.1);
  await typeText(sendChoiceText, "Aww, sweet. You made me smile already 😊", 24);
  sendOptions?.classList.add("hidden");
  unlockScroll();
  void trackResponse("send_option_selected", { option: "sending_you_now" });
});

sendNightBtn?.addEventListener("click", async () => {
  playSoftTone(500, 0.1);
  await typeText(sendChoiceText, "Perfect. Night vibes are better anyway 🌙", 24);
  sendOptions?.classList.add("hidden");
  unlockScroll();
  void trackResponse("send_option_selected", { option: "send_at_night" });
});

finalOkayBtn?.addEventListener("click", async (event) => {
  playSoftTone(720, 0.12);
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  createHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  document.body.classList.add("glow-pulse");
  setTimeout(() => document.body.classList.remove("glow-pulse"), 1300);
  await typeText(finalWarmText, "Always. We are okay. Come here ❤️", 28);
  void trackResponse("final_warm_button_clicked");
});

popupOkBtn?.addEventListener("click", () => {
  hideScrollGuard();
});

document.addEventListener(
  "wheel",
  (event) => {
    if (!scrollWasLockedByPlayfulAsk) return;
    event.preventDefault();
    showScrollGuard();
  },
  { passive: false },
);

document.addEventListener(
  "touchmove",
  (event) => {
    if (!scrollWasLockedByPlayfulAsk) return;
    event.preventDefault();
    showScrollGuard();
  },
  { passive: false },
);

document.addEventListener("mousemove", (event) => {
  if (Math.random() < 0.2) createCursorHeart(event.clientX, event.clientY);
});

document.addEventListener("click", (event) => {
  playSoftTone(360, 0.08);
  if ((event.target as HTMLElement).closest(".btn")) playSoftTone(680, 0.1);
});
