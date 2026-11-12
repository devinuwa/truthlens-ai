export type LessonQuestion = {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  sections: { heading: string; paragraphs: string[]; example?: string }[];
  questions: LessonQuestion[];
};

export const LESSONS: Lesson[] = [
  {
    slug: "what-cybersecurity-means",
    title: "What cybersecurity means",
    minutes: 4,
    summary: "Cybersecurity is how you protect devices, accounts, and messages. It lowers risk. It is not a promise that nothing can go wrong.",
    sections: [
      {
        heading: "Three ideas, in plain words",
        paragraphs: [
          "Cybersecurity is the work of keeping your phone, your accounts, and your messages away from people who should not have them, and of keeping those things working.",
          "Private means only the right people can see it. Intact means nobody quietly changes it. Available means you can still open it when you need it. A scam, a stolen password, and a phone that will not turn on are three different failures of those ideas.",
        ],
      },
      {
        heading: "Tips reduce risk",
        paragraphs: [
          "The lessons in this Academy are an introduction. They show patterns that often cause harm, and a next step you can take.",
          "Following a tip does not make a phone, a website, or a message completely safe. A quiet result still does not prove who sent something.",
        ],
      },
    ],
    questions: [
      {
        prompt: "Which of these is a cybersecurity concern?",
        choices: ["Your favourite colour", "Someone asking you to send your password", "A reminder to bring a notebook"],
        correctIndex: 1,
        explanation: "A password is a key to an account. A favourite colour and a notebook reminder are not.",
      },
      {
        prompt: "If you follow every tip in this Academy, nothing bad can happen online.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "The lessons lower risk. They are not a guarantee.",
      },
      {
        prompt: "In this lesson, what does private mean?",
        choices: [
          "Only the people who should see the information can see it",
          "The information is posted for the whole school",
          "The information is deleted every night",
        ],
        correctIndex: 0,
        explanation: "Private means the wrong person does not get to read it.",
      },
    ],
  },
  {
    slug: "devices-and-updates",
    title: "Devices, locks, and updates",
    minutes: 4,
    summary: "A lock screen and an update are basic protection for the phone or computer you already use.",
    sections: [
      {
        heading: "The lock is the front door",
        paragraphs: [
          "A lock screen stops someone who picks up your phone from opening your chats, photos, and saved passwords. Use a code you do not share.",
          "If you hand the phone over, lock it first or stay while the other person uses it. An unlocked phone is an open door.",
        ],
      },
      {
        heading: "Updates close known holes",
        paragraphs: [
          "Phone and computer makers publish updates when they learn of a hole other people can use. Leaving the update for a long time leaves that hole open.",
          "Install apps from the store you already use. A file sent in a chat, especially one that promises a prize or free followers, is a common way to put a harmful program on a phone.",
        ],
        example: "“Install this file to claim your airtime.”",
      },
    ],
    questions: [
      {
        prompt: "A classmate asks to borrow your phone. What is the safer habit?",
        choices: [
          "Hand it over while it is unlocked and walk away",
          "Lock it first, or stay with them while they use it",
          "Turn off all future updates so the phone stays the same",
        ],
        correctIndex: 1,
        explanation: "An unlocked phone shows your chats and accounts. Stay, or lock it.",
      },
      {
        prompt: "An update can wait forever because the phone already works.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "The phone can work and still have a hole that an update would close.",
      },
      {
        prompt: "A chat sends a file and calls it a free game. What is the safer step?",
        choices: [
          "Install the file so you do not miss the game",
          "Do not install a program that arrived in a chat",
          "Forward the file to your classmates first",
        ],
        correctIndex: 1,
        explanation: "Use the store you already trust. A chat file can be something other than a game.",
      },
    ],
  },
  {
    slug: "harmful-software",
    title: "Harmful software",
    minutes: 4,
    summary: "Malware is a program that does something harmful you did not agree to.",
    sections: [
      {
        heading: "What it tries to do",
        paragraphs: [
          "Harmful software can watch what you type, lock your photos until you pay, or show a page that looks like your bank. People call this malware.",
          "It often arrives as a cracked app, a tool that promises free followers, or an attachment you were not expecting. The name of the file can say “invoice” or “photo” and still be a program.",
        ],
      },
      {
        heading: "What to do if you already opened it",
        paragraphs: [
          "Stop typing passwords into that app. Tell a trusted adult. Use the removal steps from the phone maker or the store you installed it from, if you can find those steps yourself.",
          "Deleting the icon you can see does not always remove the program. A scan is not a promise that the device is clean.",
        ],
      },
    ],
    questions: [
      {
        prompt: "Which download is the safer place to get a game?",
        choices: ["A file named free-followers from a stranger", "The store you already use for your other apps", "An attachment you were not expecting"],
        correctIndex: 1,
        explanation: "The store you already use is a smaller risk than a file from a stranger.",
      },
      {
        prompt: "A file named invoice cannot be harmful.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "The name is chosen by the sender. It does not tell you what the file will do.",
      },
      {
        prompt: "You installed something that now asks for your bank password. What is the first useful step?",
        choices: [
          "Type the password so the app will close",
          "Stop, and tell a trusted adult before you type any password into it",
          "Post the password so friends can check the app for you",
        ],
        correctIndex: 1,
        explanation: "Do not feed a password to a program you do not trust. Get a person who can help.",
      },
    ],
  },
  {
    slug: "shared-networks",
    title: "Shared and public networks",
    minutes: 4,
    summary: "A Wi-Fi name can be copied. A padlock on a website is not proof of who owns the site.",
    sections: [
      {
        heading: "The name of the network is a label",
        paragraphs: [
          "Anyone nearby can create a network and give it a familiar name, such as the name of a cafe or a school. The name is not proof of who is running it.",
          "On a network you do not know, avoid signing in to a bank or typing a password if you can wait. Mobile data, or the Wi-Fi at home, is a calmer place for that.",
        ],
        example: "A network named Free-School-WiFi appears while you are not at school.",
      },
      {
        heading: "The padlock is about the connection",
        paragraphs: [
          "A lock icon in the address bar means the connection to that site is encrypted, so people on the same network have a harder time reading it.",
          "The lock does not mean the site is the real bank, school, or shop. The address can still be a copy.",
        ],
      },
    ],
    questions: [
      {
        prompt: "A cafe network uses the cafe’s name. Does that prove the cafe is running it?",
        choices: ["Yes, the name is proof", "No. Someone else can copy the name", "Yes, if the signal is strong"],
        correctIndex: 1,
        explanation: "The name is a label. It can be copied.",
      },
      {
        prompt: "A padlock in the address bar means the site is definitely the real bank.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "The padlock describes the connection. It does not identify the owner of the site.",
      },
      {
        prompt: "You want to check a bank balance on a free network you do not know. What is the safer habit?",
        choices: [
          "Type the password now so you do not forget",
          "Wait for mobile data or a network you know",
          "Ask the nearest stranger if the network is safe",
        ],
        correctIndex: 1,
        explanation: "A bank sign-in can wait. Use a network you already trust.",
      },
    ],
  },
  {
    slug: "when-something-goes-wrong",
    title: "When something goes wrong",
    minutes: 4,
    summary: "If you shared a secret or sent money, tell a trusted adult and use the official channel. You are not to blame for being tricked.",
    sections: [
      {
        heading: "You can still act",
        paragraphs: [
          "Tell a trusted adult. Hiding the mistake gives the other person more time. You are not in trouble for being pressured or tricked.",
          "If you shared a password or a one-time code, change the password from the official app or from a bookmark you already use. If the site lets you sign out other sessions, use that.",
        ],
      },
      {
        heading: "Money and messages",
        paragraphs: [
          "If money has already left the account, contact the bank or the mobile-money service through the number on the card or inside the official app. Keep the message so you can show what happened.",
          "TruthLens can point at warning signs in the wording. It cannot reverse a payment or prove who sent the message.",
        ],
      },
    ],
    questions: [
      {
        prompt: "You typed a password into a page that arrived in a chat. What is the useful first step?",
        choices: [
          "Reply to the chat and ask them to delete it",
          "Change the password from the official app or a bookmark you already use",
          "Post the password so friends know to avoid that page",
        ],
        correctIndex: 1,
        explanation: "Change the key from a place you already trust. Do not send it out again.",
      },
      {
        prompt: "You should hide the mistake so nobody is disappointed.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "Tell a trusted adult. Hiding it helps the person who tricked you.",
      },
      {
        prompt: "Money has already left your account. What helps?",
        choices: [
          "Send more money so they will return the first amount",
          "Contact the bank through its own number or app, and keep the message",
          "Delete the chat so there is no record",
        ],
        correctIndex: 1,
        explanation: "Use the bank’s own channel. Keep the message. Do not send more.",
      },
    ],
  },
  {
    slug: "spotting-phishing",
    title: "Spotting phishing messages",
    minutes: 4,
    summary: "Learn the signs of a message that wants your password or a login code.",
    sections: [
      {
        heading: "What phishing tries to do",
        paragraphs: [
          "Phishing is a message that pretends to be a school, a bank, a game, or a friend so you will hand over a password or tap a fake login page.",
          "The sender can copy a logo and a name. The useful check is the request itself: are they asking you to reveal a secret, or to hurry?",
        ],
        example: "“Your exam portal will close in 20 minutes. Reply with the one-time code we just sent.”",
      },
      {
        heading: "What to do",
        paragraphs: [
          "Leave the message. Open the service from a bookmark or the official app, not from the link in the chat.",
          "If you already shared a code, change the password from the official site and tell a trusted adult.",
        ],
      },
    ],
    questions: [
      {
        prompt: "A message says your school email is locked and asks for your password. What is the safer step?",
        choices: [
          "Reply with the password so the account stays open",
          "Open the school site yourself from a bookmark you already use",
          "Forward the password to a classmate to check it",
        ],
        correctIndex: 1,
        explanation: "Use an address you already trust. Do not send the password back through the message.",
      },
      {
        prompt: "Why is a one-time code sensitive?",
        choices: [
          "It can let someone into the account while the code still works",
          "It is only a nickname",
          "It proves the message is official",
        ],
        correctIndex: 0,
        explanation: "A code is a temporary key. Anyone who receives it can try to sign in as you.",
      },
      {
        prompt: "A familiar logo on a message means the sender is the real organisation.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "Logos are easy to copy. Check the request and the address, not the picture.",
      },
    ],
  },
  {
    slug: "suspicious-links",
    title: "Recognising suspicious links",
    minutes: 4,
    summary: "Read a web address before you open it, and know which parts can mislead you.",
    sections: [
      {
        heading: "Which part of the address matters",
        paragraphs: [
          "The registered domain is near the end of the name, just before the first single slash. Extra words at the beginning can be chosen by a stranger.",
          "pay.google.com.example.com is not Google. The registered domain is example.com.",
        ],
        example: "https://google.com.secure-login.example.net/verify",
      },
      {
        heading: "Short links and number addresses",
        paragraphs: [
          "A short link hides the destination until it is opened. A string of numbers instead of a name is hard to recognise.",
          "TruthLens can describe these patterns. It does not open the site for you, and a quiet result is not a safety certificate.",
        ],
      },
    ],
    questions: [
      {
        prompt: "In https://accounts.example.com/login, which name is the registered domain?",
        choices: ["accounts", "example.com", "login"],
        correctIndex: 1,
        explanation: "example.com is the registered domain. “accounts” is only a label in front of it.",
      },
      {
        prompt: "A shortened link is safe because it looks tidy.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "A short link hides where it goes. Ask for the full address or look the organisation up yourself.",
      },
      {
        prompt: "What should you do with a link in an unexpected prize message?",
        choices: [
          "Open it quickly before it expires",
          "Leave it closed and find the organisation through a source you already trust",
          "Reply with your email password to confirm the prize",
        ],
        correctIndex: 1,
        explanation: "A deadline in the message is not a reason to skip the check.",
      },
    ],
  },
  {
    slug: "scholarship-job-scams",
    title: "Avoiding scholarship and job scams",
    minutes: 5,
    summary: "Real opportunities can be checked. Fees, secrecy, and surprise prizes deserve a pause.",
    sections: [
      {
        heading: "A real opportunity can be traced",
        paragraphs: [
          "A genuine scholarship, grant, competition, or internship has an organisation you can find, rules you can read, and a way to apply that does not depend on a private chat.",
          "TruthLens sample cards are labelled demonstration data. They are not live awards. Always read the verification label before you treat a listing as current.",
        ],
      },
      {
        heading: "Common traps",
        paragraphs: [
          "Someone says you were selected even though you never applied, then asks for a processing fee, airtime, or your bank details.",
          "Paying a stranger does not make an offer real. Look for the programme on the organisation's own website, and ask a teacher or parent if you are unsure.",
        ],
        example: "“You won a full scholarship. Pay a small release fee today and do not tell your parents until the money arrives.”",
      },
    ],
    questions: [
      {
        prompt: "Which request is a strong reason to stop and verify?",
        choices: [
          "The page lists eligibility rules and an official application form",
          "A stranger asks for a fee before a scholarship can be released",
          "The deadline is several weeks away",
        ],
        correctIndex: 1,
        explanation: "A fee demanded by a stranger, especially with secrecy, is a classic scam pattern.",
      },
      {
        prompt: "A card marked “Demonstration data” is a current scholarship you should apply for.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "Demonstration records are examples for learning. They are not verified live opportunities.",
      },
      {
        prompt: "How can you check an offer that names a university?",
        choices: [
          "Use only the link in the chat",
          "Find the university's website yourself and look for the same programme",
          "Send your identity number so they can confirm you faster",
        ],
        correctIndex: 1,
        explanation: "Start from the organisation, not from the message that contacted you.",
      },
    ],
  },
  {
    slug: "passwords-and-accounts",
    title: "Protecting passwords and accounts",
    minutes: 4,
    summary: "Use a different password for important accounts, and keep codes to yourself.",
    sections: [
      {
        heading: "Passwords are keys",
        paragraphs: [
          "A password, a one-time code, and a recovery email are keys to your account. Friends, strangers, and “support agents” in a chat should not be given those keys.",
          "A long password you do not reuse is harder to guess. A password manager, or a written copy kept at home by a trusted adult, is safer than using the same word everywhere.",
        ],
      },
      {
        heading: "Extra protection",
        paragraphs: [
          "Turn on a second step, such as an app code, for email and social accounts when the service offers it.",
          "If a device is shared, sign out when you finish. If you think someone else knows a password, change it from the official site.",
        ],
      },
    ],
    questions: [
      {
        prompt: "Which habit is safer?",
        choices: [
          "Use one short password for email, games, and school",
          "Use a different long password for email, and do not share the login code",
          "Send your password to a friend so they can help you sign in",
        ],
        correctIndex: 1,
        explanation: "Important accounts need their own secrets, and login codes should stay with you.",
      },
      {
        prompt: "A support agent in a chat asks for your one-time code. You should send it.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "Real support does not need your code. The code is how someone else signs in.",
      },
      {
        prompt: "You used the same password on a game and on your email, and the game was hacked. What helps?",
        choices: [
          "Wait and see",
          "Change the email password from the official email site and tell a trusted adult",
          "Post the password so friends can check it",
        ],
        correctIndex: 1,
        explanation: "Change the reused password on the important account, starting from a site you open yourself.",
      },
    ],
  },
  {
    slug: "cyberbullying",
    title: "Cyberbullying and reporting abuse",
    minutes: 4,
    summary: "You can leave a cruel conversation, keep a record, and ask for help.",
    sections: [
      {
        heading: "Bullying online is still bullying",
        paragraphs: [
          "Repeated insults, threats, rumours, or pressure in chats and comments can hurt. You do not have to answer, and you do not have to handle it alone.",
          "TruthLens can point at insulting or threatening language. It cannot know the sender's intent, and it cannot replace a person who can help you.",
        ],
      },
      {
        heading: "A practical sequence",
        paragraphs: [
          "Stop replying if the messages are cruel. Use block or mute tools the app provides.",
          "If you may need to report it, keep a copy somewhere private. Then tell a trusted adult, a teacher, or the platform's report tool. If you are in immediate danger, contact a local emergency service.",
        ],
        example: "A group chat keeps insulting you after you asked them to stop.",
      },
    ],
    questions: [
      {
        prompt: "Someone threatens you in a chat. What is a sound first response?",
        choices: [
          "Threaten them back so they stop",
          "Stop replying, keep a private copy if you can, and tell a trusted adult",
          "Send them a photo so they know you are serious",
        ],
        correctIndex: 1,
        explanation: "Do not escalate. Get a person who can help, and use the app's block and report tools.",
      },
      {
        prompt: "You are at fault if someone bullies you online.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "Cruel messages are not your fault. Asking for help is the right step.",
      },
      {
        prompt: "Why might you keep a copy of a bullying message?",
        choices: [
          "To post it publicly for revenge",
          "To show a trusted adult or a report form what happened",
          "To prove you should reply with an insult",
        ],
        correctIndex: 1,
        explanation: "A private copy can help a report. It is not for a public fight.",
      },
    ],
  },
  {
    slug: "pressure-tactics",
    title: "Recognising pressure and manipulation",
    minutes: 4,
    summary: "Secrecy, flattery, and artificial deadlines are tactics. You can pause.",
    sections: [
      {
        heading: "Pressure is a tactic, not a deadline you owe",
        paragraphs: [
          "Some messages try to make you decide before you can think. They use fear, flattery, guilt, or a clock.",
          "A request to hide the conversation from parents or teachers is a serious warning, especially if it comes with a request for photos, money, or a password.",
        ],
        example: "“If you really care, you will send it now and not tell anyone.”",
      },
      {
        heading: "You can slow down",
        paragraphs: [
          "Close the chat. Talk to someone you trust. A real friend, school, or employer can wait while you check.",
          "If someone has a private photo of you and threatens to share it, tell a trusted adult. You are not in trouble for being pressured.",
        ],
      },
    ],
    questions: [
      {
        prompt: "Which line is a pressure tactic?",
        choices: [
          "“Take your time and ask a parent if you are unsure.”",
          "“Do not tell your parents, and send the photo tonight.”",
          "“Here is the official page. The deadline is next month.”",
        ],
        correctIndex: 1,
        explanation: "Secrecy plus a personal photo is a reason to stop and get help.",
      },
      {
        prompt: "A short deadline means you should skip checking the sender.",
        choices: ["True", "False"],
        correctIndex: 1,
        explanation: "Urgency is often the point of the trick. Slowing down is a safety step.",
      },
      {
        prompt: "Someone is kind at first and then asks you to keep secrets from adults. What does that suggest?",
        choices: [
          "The friendship is definitely safe because they were kind",
          "Kindness does not cancel a request for secrecy. Tell a trusted adult",
          "You must send what they ask so they stay kind",
        ],
        correctIndex: 1,
        explanation: "Warm words can still be used to isolate you. Secrecy from trusted adults is the warning.",
      },
    ],
  },
  {
    slug: "verify-before-sharing",
    title: "Verifying claims before you share them",
    minutes: 4,
    summary: "A shocking post can be wrong. Check the source before you pass it on.",
    sections: [
      {
        heading: "Writing style is not proof",
        paragraphs: [
          "A message can be badly written and still be true, or polished and still be false. TruthLens does not decide that a claim is false just because of how it is written.",
          "Before you forward a story about a school, a prize, a danger, or a celebrity, look for who first published it and whether a source you already trust says the same thing.",
        ],
      },
      {
        heading: "A simple pause",
        paragraphs: [
          "Ask: who is saying this, how do they know, and what happens if I share it and it is wrong?",
          "Screenshots can be edited. A forwarded message has often lost its original source. If you cannot find a source, do not present the claim as fact.",
        ],
        example: "A screenshot says school is cancelled tomorrow, with no name and no date.",
      },
    ],
    questions: [
      {
        prompt: "TruthLens sees clumsy spelling and marks the claim false. Is that how this app works?",
        choices: [
          "Yes, spelling decides the facts",
          "No. Language checks are warning signs, not a fact-check of the claim",
          "Yes, if the message is long",
        ],
        correctIndex: 1,
        explanation: "The app looks for scam and pressure patterns. It does not judge a claim true or false from style alone.",
      },
      {
        prompt: "What is a better reason to trust a school announcement?",
        choices: [
          "It was forwarded by many classmates",
          "It is on the school's own notice channel that you already use",
          "It uses a lot of capital letters",
        ],
        correctIndex: 1,
        explanation: "Go back to the organisation's own channel instead of a copy that has been passed around.",
      },
      {
        prompt: "You cannot find where a shocking story came from. What should you do?",
        choices: [
          "Share it quickly so friends are warned",
          "Do not present it as fact until you can find a source",
          "Add your own details so it sounds complete",
        ],
        correctIndex: 1,
        explanation: "Passing on an unsourced claim can spread a false alarm or a rumour.",
      },
    ],
  },
  {
    slug: "personal-information",
    title: "Protecting personal information online",
    minutes: 4,
    summary: "Your address, school, identity numbers, and photos are worth protecting.",
    sections: [
      {
        heading: "Small details add up",
        paragraphs: [
          "Your full name, school, home address, phone number, identity numbers, and daily routine can be joined together by a stranger.",
          "A profile does not need your exact school, phone number, or location. TruthLens does not ask for those, and other apps do not always need them either.",
        ],
      },
      {
        heading: "Photos and forms",
        paragraphs: [
          "Before you post a photo, look at the background: uniforms, street signs, and house numbers can show where you are.",
          "A form that asks for identity numbers, a bank account, or a copy of an ID should be on an official site you opened yourself. If a chat asks for the same things, stop.",
        ],
      },
    ],
    questions: [
      {
        prompt: "Which detail is safer to leave off a public profile?",
        choices: ["A hobby you enjoy", "Your phone number and the name of your school", "A favourite subject"],
        correctIndex: 1,
        explanation: "A phone number and school make it easier for a stranger to find you. A hobby does not identify your home.",
      },
      {
        prompt: "A stranger needs your BVN or NIN to reserve a scholarship.",
        choices: ["That is a normal first step", "No. Stop and check with a trusted adult before sending identity numbers"],
        correctIndex: 1,
        explanation: "Identity numbers are valuable. Do not send them because a chat asked.",
      },
      {
        prompt: "Why look at the background of a photo before you post it?",
        choices: [
          "The background can reveal your school, street, or home",
          "Filters only work on backgrounds",
          "A plain background means the photo is unsafe",
        ],
        correctIndex: 0,
        explanation: "Signs, uniforms, and doors can tell a stranger where the photo was taken.",
      },
    ],
  },
];

export function getLesson(slug: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.slug === slug);
}

export function scoreQuiz(lesson: Lesson, answers: number[]): { score: number; total: number; correct: boolean[] } {
  const correct = lesson.questions.map((question, index) => answers[index] === question.correctIndex);
  return {
    score: correct.filter(Boolean).length,
    total: lesson.questions.length,
    correct,
  };
}
