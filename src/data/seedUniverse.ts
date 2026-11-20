import type { UniverseData } from '../types/universe.ts';

export function createSeedUniverse(): UniverseData {
  return {
    settings: {
      welcomeHeading: 'Welcome to Your Little Universe, Mehak.',
      welcomeSubtitle:
        'A little world of surprises, unexpected smiles, playful challenges, and things worth discovering.',
      accessHint: 'The first name this universe was created for.',
      allowSubmissions: true,
      categories: ['Thoughtful', 'Playful', 'Deep', 'Bold', 'Cozy', 'Adventure'],
    },

    questions: [
      {
        id: 'q-1',
        mood: 'Thoughtful',
        prompt: 'What tiny, ordinary moment in a day quietly makes you feel the most at peace?',
      },
      {
        id: 'q-2',
        mood: 'Playful',
        prompt: 'If we had to pick a midnight snack right now with zero rules, what is winning first place?',
      },
      {
        id: 'q-3',
        mood: 'Deep',
        prompt: 'What is something about yourself that you hope the right person always notices without you ever having to point it out?',
      },
      {
        id: 'q-4',
        mood: 'Bold',
        prompt: 'What is one spontaneous plan you secretly hope someone suggests to you this week?',
      },
      {
        id: 'q-5',
        mood: 'Thoughtful',
        prompt: 'Which song instantly shifts your entire mood within its first ten seconds?',
      },
      {
        id: 'q-6',
        mood: 'Playful',
        prompt: 'If your mood today were a weather forecast and a dessert, what would both be?',
      },
      {
        id: 'q-7',
        mood: 'Deep',
        prompt: 'When do you feel most effortlessly like yourself around someone?',
      },
      {
        id: 'q-8',
        mood: 'Bold',
        prompt: 'What is a compliment you rarely hear, even though you secretly know it is true?',
      },
    ],

    wouldYouRather: [
      {
        id: 'wyr-1',
        category: 'Evenings',
        optionA: 'A spontaneous midnight adventure with zero itinerary',
        optionB: 'A thoughtfully planned candlelit evening down to the playlist',
        reactionA: 'Unscripted magic wins — the best stories almost always start after ten at night.',
        reactionB: 'Intentional details feel unforgettable when you can tell every single one was chosen for you.',
      },
      {
        id: 'wyr-2',
        category: 'Connection',
        optionA: 'A three-hour conversation where time completely disappears',
        optionB: 'An unexpected surprise waiting for you on an ordinary Tuesday',
        reactionA: 'When conversation flows like that, nowhere else in the world competes.',
        reactionB: 'Ordinary days turned memorable are the purest kind of romance.',
      },
      {
        id: 'wyr-3',
        category: 'Notes',
        optionA: 'A handwritten note tucked somewhere you will find later',
        optionB: 'A perfectly timed late-night voice message',
        reactionA: 'Ink on paper stays forever — something you can reread whenever you want a smile.',
        reactionB: 'Hearing the exact warmth in someone’s voice right when you need it is unbeatable.',
      },
      {
        id: 'wyr-4',
        category: 'Getaways',
        optionA: 'Watching a golden sunset from a quiet coastal cliff',
        optionB: 'Wandering glowing city streets in the rain under one umbrella',
        reactionA: 'Warm light, ocean breeze, and zero rush — pure cinema.',
        reactionB: 'Rainy city lights and warm coffee afterward feel straight out of a favorite film.',
      },
      {
        id: 'wyr-5',
        category: 'Playful',
        optionA: 'Cooking an ambitious recipe together and laughing if it goes slightly wrong',
        optionB: 'Dressing up and trying a hidden café neither of us has visited',
        reactionA: 'Kitchen chaos plus taste-testing beats perfection every single time.',
        reactionB: 'New atmosphere, great coffee, and people-watching together is top-tier.',
      },
    ],

    truthOrDares: [
      {
        id: 'tod-1',
        mode: 'Truth',
        intensity: 'Gentle',
        text: 'What is one small gesture that instantly makes you feel genuinely cared for?',
      },
      {
        id: 'tod-2',
        mode: 'Truth',
        intensity: 'Playful',
        text: 'What is a harmless little habit of yours that always makes people smile once they notice it?',
      },
      {
        id: 'tod-3',
        mode: 'Truth',
        intensity: 'Bold',
        text: 'What was the very first detail that caught your attention and stayed in your mind?',
      },
      {
        id: 'tod-4',
        mode: 'Truth',
        intensity: 'Gentle',
        text: 'If you could freeze one kind of evening atmosphere and revisit it anytime, what would it feel like?',
      },
      {
        id: 'tod-5',
        mode: 'Dare',
        intensity: 'Gentle',
        text: 'Send a song right now that feels like your exact mood today — no explanation allowed until it plays.',
      },
      {
        id: 'tod-6',
        mode: 'Dare',
        intensity: 'Playful',
        text: 'Give an unexpectedly specific three-word compliment on your next message.',
      },
      {
        id: 'tod-7',
        mode: 'Dare',
        intensity: 'Bold',
        text: 'Pick our next date idea from the Date Planner and lock in a day for it without overthinking.',
      },
      {
        id: 'tod-8',
        mode: 'Dare',
        intensity: 'Playful',
        text: 'Record a ten-second voice note describing your ideal weekend morning.',
      },
    ],

    quizQuestions: [
      {
        id: 'quiz-1',
        question: 'Which kind of evening wins almost every single time?',
        options: [
          'A quiet café corner with good conversation',
          'A loud crowded club until 3 AM',
          'Endless errands across town',
          'Watching a spreadsheet tutorial',
        ],
        correctIndex: 0,
        note: 'Good ambiance and uninterrupted conversation always win.',
      },
      {
        id: 'quiz-2',
        question: 'What is the fastest way to make an ordinary day feel special?',
        options: [
          'A thoughtful surprise out of nowhere',
          'Waiting for a major holiday',
          'Checking off chores in silence',
          'Skipping dessert completely',
        ],
        correctIndex: 0,
        note: 'Little unexpected moments matter more than grand calendars.',
      },
      {
        id: 'quiz-3',
        question: 'When picking a movie together, what usually takes the longest?',
        options: [
          'Scrolling for twenty minutes debating the exact vibe',
          'Picking the very first title in two seconds',
          'Watching the credits first',
          'Agreeing instantly with zero trailers',
        ],
        correctIndex: 0,
        note: 'Half the fun is debating the trailers together.',
      },
      {
        id: 'quiz-4',
        question: 'Which detail leaves the biggest impression in a conversation?',
        options: [
          'Remembering a tiny detail mentioned days earlier',
          'Sending one-word replies',
          'Looking at notifications the whole time',
          'Keeping everything strictly formal',
        ],
        correctIndex: 0,
        note: 'Genuine attention is always the rarest and warmest thing.',
      },
      {
        id: 'quiz-5',
        question: 'What is the ultimate golden-hour combination?',
        options: [
          'Warm skies, great music, and nowhere to rush',
          'Stuck in traffic with a dead battery',
          'A fluorescent waiting room',
          'Rushing through dinner in five minutes',
        ],
        correctIndex: 0,
        note: 'Slowing down together makes golden hour feel twice as long.',
      },
    ],

    heartSurprises: [
      {
        id: 'hs-1',
        kind: 'Compliment',
        message: 'You have a rare kind of warmth that makes even quiet moments feel brighter just by being there.',
      },
      {
        id: 'hs-2',
        kind: 'Romantic Note',
        message: 'If today has felt even slightly heavy, consider this your reminder that someone out here is genuinely rooting for your smile.',
      },
      {
        id: 'hs-3',
        kind: 'Question',
        message: 'What is one tiny wish you would love to come true before this month ends?',
      },
      {
        id: 'hs-4',
        kind: 'Surprise',
        message: 'Redeemable voucher: One uninterrupted coffee, dessert, or late-night walk of your choice — no veto allowed.',
      },
      {
        id: 'hs-5',
        kind: 'Playful Challenge',
        message: 'Pause for five seconds, take one slow breath, and pick a song that matches the exact smile on your face right now.',
      },
      {
        id: 'hs-6',
        kind: 'Compliment',
        message: 'The way you notice small details and care deeply about them is effortlessly captivating.',
      },
      {
        id: 'hs-7',
        kind: 'Romantic Note',
        message: 'Every corner of this little universe exists for one simple reason: you deserve thoughtful things made just for you.',
      },
      {
        id: 'hs-8',
        kind: 'Surprise',
        message: 'Hidden starlight note: Good energy always finds its way back — especially to a certain Karma Wali 🦄.',
        isEasterEgg: true,
      },
      {
        id: 'hs-9',
        kind: 'Playful Challenge',
        message: 'Next time we talk, ask one bold question you have been curious about all week.',
      },
    ],

    sentencePrompts: [
      { id: 'sp-1', starter: 'The most unexpected thing about you is...' },
      { id: 'sp-2', starter: 'One thing I would love to do with you is...' },
      { id: 'sp-3', starter: 'A perfect day would begin with...' },
      { id: 'sp-4', starter: 'Something that always makes me smile is...' },
      { id: 'sp-5', starter: 'Right now, I am secretly hoping for...' },
    ],

    flagScenarios: [
      {
        id: 'rf-1',
        scenario: 'Remembers your exact coffee or dessert order without ever having to ask twice.',
        feedbackGreen: 'Pure emerald green flag. Quiet attentiveness beats grand speeches every time.',
        feedbackRed: 'Wait — suspiciously good memory? We are ruling this dangerously charming instead.',
        feedbackDepends: 'Fair point — it only counts if they actually bring it on a chaotic day too.',
      },
      {
        id: 'rf-2',
        scenario: 'Says "I am five minutes away" while still choosing an outfit.',
        feedbackGreen: 'Graceful patience! Honestly, arriving looking great is a solid defense.',
        feedbackRed: 'Certified classic red flag — though usually forgiven if snacks are involved.',
        feedbackDepends: 'Depends completely on whether they send a hilarious update on the way.',
      },
      {
        id: 'rf-3',
        scenario: 'Builds a shared playlist and sneaks in songs that remind them of you.',
        feedbackGreen: 'Unquestionable green flag. Music is basically a love letter with a beat.',
        feedbackRed: 'Only a red flag if every single track is a dramatic breakup ballad.',
        feedbackDepends: 'Acceptable answer — we need to inspect the first three tracks first.',
      },
      {
        id: 'rf-4',
        scenario: 'Always insists on splitting the last bite of dessert right down the middle.',
        feedbackGreen: 'Top-tier green flag. Sharing the final bite is true diplomacy and affection.',
        feedbackRed: 'Plot twist: refusing to surrender the whole last bite is bold, indeed.',
        feedbackDepends: 'Depends entirely on whether it is tiramisu or chocolate cake.',
      },
      {
        id: 'rf-5',
        scenario: 'Texts "Did you get home safe?" and stays awake until you reply.',
        feedbackGreen: 'Timeless green flag. Thoughtfulness never goes out of style.',
        feedbackRed: 'No court in this universe would convict that as a red flag.',
        feedbackDepends: 'Only depends on whether they also send a warm goodnight right after.',
      },
    ],

    guessChallenges: [
      {
        id: 'gc-1',
        category: 'Cozy Ritual',
        answer: 'coffee',
        acceptedAliases: ['latte', 'espresso', 'cappuccino', 'iced coffee', 'chai'],
        hints: [
          'It turns sleepy mornings and slow café conversations into something magical.',
          'You can have it piping hot on rainy days or iced in the afternoon sun.',
          'Often served in a ceramic mug with warm foam on top.',
        ],
        revealNote: 'Coffee (or a cozy cup together) — the unofficial fuel of great conversations.',
      },
      {
        id: 'gc-2',
        category: 'Sky & Time',
        answer: 'sunset',
        acceptedAliases: ['golden hour', 'dusk', 'twilight'],
        hints: [
          'It paints the sky in champagne gold, blush pink, and soft violet.',
          'No two evenings ever look quite the same.',
          'The favorite hour for long walks and effortless photos.',
        ],
        revealNote: 'Sunset — nature’s own version of this universe’s color palette.',
      },
      {
        id: 'gc-3',
        category: 'Little Keepsake',
        answer: 'letter',
        acceptedAliases: ['handwritten note', 'note', 'love letter', 'envelope'],
        hints: [
          'It folds neatly and hides something meant for only one pair of eyes.',
          'Even better when sealed with wax or slipped inside a book.',
          'Words on paper that never vanish when a phone battery dies.',
        ],
        revealNote: 'A handwritten letter — quiet, personal, and timeless.',
      },
      {
        id: 'gc-4',
        category: 'Atmosphere',
        answer: 'music',
        acceptedAliases: ['playlist', 'song', 'songs', 'melody'],
        hints: [
          'It can shift the mood of an entire room in less than five seconds.',
          'Better when shared through two earbuds or on a night drive.',
          'Every favorite memory tends to have one playing in the background.',
        ],
        revealNote: 'Music — the fastest shortcut straight to a feeling.',
      },
    ],

    loveLanguageQuestions: [
      {
        id: 'll-1',
        prompt: 'After a long, tiring day, what instantly melts your stress away?',
        options: [
          { label: 'Hearing genuine, specific words about why you are appreciated', language: 'Words of Affirmation' },
          { label: 'Uninterrupted time together with phones tucked away', language: 'Quality Time' },
          { label: 'Someone quietly handling a chore or bringing your favorite comfort food', language: 'Acts of Service' },
          { label: 'A tiny thoughtful surprise someone spotted because it reminded them of you', language: 'Receiving Gifts' },
          { label: 'A long, warm hug that says everything without speaking', language: 'Physical Affection' },
        ],
      },
      {
        id: 'll-2',
        prompt: 'Which gesture stays in your mind for days afterward?',
        options: [
          { label: 'A heartfelt note or voice message sent just because', language: 'Words of Affirmation' },
          { label: 'Planning an evening solely so you can talk and laugh unhurried', language: 'Quality Time' },
          { label: 'Going out of their way to make your morning easier', language: 'Acts of Service' },
          { label: 'A small keepsake chosen with uncanny attention to your taste', language: 'Receiving Gifts' },
          { label: 'Holding your hand while walking through a lively street', language: 'Physical Affection' },
        ],
      },
      {
        id: 'll-3',
        prompt: 'When you want to show someone they matter, what comes most naturally to you?',
        options: [
          { label: 'Telling them clearly what you admire about them', language: 'Words of Affirmation' },
          { label: 'Carving out real space in your schedule just for them', language: 'Quality Time' },
          { label: 'Stepping in to help before they even need to ask', language: 'Acts of Service' },
          { label: 'Picking up a little treat or gift they mentioned once', language: 'Receiving Gifts' },
          { label: 'Leaning close, giving a warm embrace, or gentle reassuring touch', language: 'Physical Affection' },
        ],
      },
      {
        id: 'll-4',
        prompt: 'Which weekend plan sounds the most heartwarming?',
        options: [
          { label: 'Trading honest letters or deep compliments over slow coffee', language: 'Words of Affirmation' },
          { label: 'A full unhurried afternoon exploring somewhere new together', language: 'Quality Time' },
          { label: 'Having someone cook your favorite meal and handle every detail', language: 'Acts of Service' },
          { label: 'Exchanging little handpicked surprise parcels for no occasion', language: 'Receiving Gifts' },
          { label: 'A cozy movie night tucked right beside each other under a blanket', language: 'Physical Affection' },
        ],
      },
      {
        id: 'll-5',
        prompt: 'What makes a celebration feel truly unforgettable?',
        options: [
          { label: 'A sincere message that captures exactly who you are', language: 'Words of Affirmation' },
          { label: 'Being completely present together with zero distractions', language: 'Quality Time' },
          { label: 'Seeing all the behind-the-scenes effort put into making it seamless', language: 'Acts of Service' },
          { label: 'Opening something meaningful that proves they truly listen', language: 'Receiving Gifts' },
          { label: 'Warm closeness and affectionate moments throughout the night', language: 'Physical Affection' },
        ],
      },
    ],

    scratchCards: [
      {
        id: 'sc-1',
        title: 'Golden Hour Voucher',
        category: 'Small Reward',
        secretText: 'Redeemable anytime: One sunset walk and your absolute favorite dessert — my treat, zero negotiation.',
        accent: 'champagne',
      },
      {
        id: 'sc-2',
        title: 'Quiet Truth',
        category: 'Compliment',
        secretText: 'Your energy changes the entire atmosphere of a conversation in the very best way.',
        accent: 'blush',
      },
      {
        id: 'sc-3',
        title: 'Playlist Spark',
        category: 'Challenge',
        secretText: 'Send three songs that feel like your ideal evening — I will build a full playlist around them.',
        accent: 'lavender',
      },
      {
        id: 'sc-4',
        title: 'Pocket Note',
        category: 'Romantic Note',
        secretText: 'Some people feel like small talk. You feel like a favorite chapter worth rereading slowly.',
        accent: 'blush',
      },
    ],

    wheelSegments: [
      {
        id: 'ws-1',
        label: 'Send a song',
        actionDetail: 'Share one track right now that instantly matches your mood or makes you think of a great evening.',
        color: '#FFDCE8',
        textColor: '#702B4C',
      },
      {
        id: 'ws-2',
        label: 'Bold question',
        actionDetail: 'Ask one playful, honest question that you have been curious about — no dodging allowed.',
        color: '#E9DFFF',
        textColor: '#3F275E',
      },
      {
        id: 'ws-3',
        label: 'Plan a date',
        actionDetail: 'Head to the Date Planner and lock in one cozy or adventurous outing together.',
        color: '#F3D69B',
        textColor: '#5B3A12',
      },
      {
        id: 'ws-4',
        label: 'Share a moment',
        actionDetail: 'Tell a favorite little story from your week that deserves a proper spotlight.',
        color: '#702B4C',
        textColor: '#FFF9F5',
      },
      {
        id: 'ws-5',
        label: 'Play a game',
        actionDetail: 'Pick any mini-game from the Games arcade and try to set a fresh high score.',
        color: '#9274B8',
        textColor: '#FFF9F5',
      },
      {
        id: 'ws-6',
        label: 'Give a compliment',
        actionDetail: 'Trade one unexpectedly specific compliment — the more detailed, the better.',
        color: '#FCE7EF',
        textColor: '#702B4C',
      },
      {
        id: 'ws-7',
        label: 'Choose a movie',
        actionDetail: 'Pick the next film for a cozy watch-night — winner gets full snack authority.',
        color: '#EDE5FF',
        textColor: '#482F6B',
      },
      {
        id: 'ws-8',
        label: 'Fun challenge',
        actionDetail: 'Open Truth or Dare in the Love Zone and complete one Playful or Bold dare.',
        color: '#F7E3B5',
        textColor: '#5B3A12',
      },
    ],

    envelopes: [
      {
        id: 'env-1',
        label: 'Open when you need a smile',
        occasion: 'Anytime',
        salutation: 'Dear Mehak,',
        body: 'Even on the busiest, most ordinary days, there is something effortlessly bright about the way you carry yourself. Take a slow breath, drop your shoulders, and remember that you are deeply appreciated — just as you are.',
        closing: 'With warmth, always.',
        sealColor: 'burgundy',
      },
      {
        id: 'env-2',
        label: 'Open on a quiet late night',
        occasion: 'After Dark',
        salutation: 'Hey Mehak,',
        body: 'Late nights are for honest thoughts and gentle music. Whenever the world slows down and feels quiet, know that this little corner was built so you would always have somewhere cozy waiting for you.',
        closing: 'Sweet thoughts tonight.',
        sealColor: 'plum',
      },
      {
        id: 'env-3',
        label: 'Open when you want a tiny adventure',
        occasion: 'Spontaneous',
        salutation: 'To the explorer,',
        body: 'Consider this your official invitation to pick the next spot, the next snack, and the next soundtrack. Head over to Date Ideas whenever you feel like plotting something fun.',
        closing: 'Ready whenever you are.',
        sealColor: 'champagne',
      },
    ],

    mysteryRewards: [
      {
        id: 'mr-1',
        title: 'Dessert Veto Pass',
        kind: 'Reward',
        message: 'You have full executive authority over the next dessert stop — no debate, instant approval.',
      },
      {
        id: 'mr-2',
        title: 'Starlight Compliment',
        kind: 'Note',
        message: 'There is something remarkably calming and magnetic about your curiosity and warmth.',
      },
      {
        id: 'mr-3',
        title: 'Playlist Takeover',
        kind: 'Challenge',
        message: 'You control the next three songs on our drive or walk — zero skips allowed.',
      },
      {
        id: 'mr-4',
        title: 'Snap & Smile',
        kind: 'Hidden Gem',
        message: 'Rare pocket charm unlocked: fierce charm with a soft heart — unmistakable Mini Crocodile 🐊 energy.',
        isEasterEgg: true,
      },
      {
        id: 'mr-5',
        title: 'Cozy Movie Ticket',
        kind: 'Reward',
        message: 'Redeem for one cozy movie night with blankets, warm drinks, and zero phone distractions.',
      },
    ],

    // Intentionally empty — never invent shared memories or milestones.
    memories: [],

    compliments: [
      {
        id: 'cmp-1',
        title: 'Effortless Warmth',
        category: 'Presence',
        text: 'You make conversations feel easy, genuine, and worth lingering in longer than planned.',
      },
      {
        id: 'cmp-2',
        title: 'Thoughtful Eye',
        category: 'Perspective',
        text: 'You notice subtle details that most people rush right past, and it makes talking to you endlessly interesting.',
      },
      {
        id: 'cmp-3',
        title: 'Quiet Spark',
        category: 'Charm',
        text: 'You balance playful humor and genuine depth so naturally that every mood feels authentic.',
      },
      {
        id: 'cmp-4',
        title: 'Unmistakable Smile',
        category: 'Joy',
        text: 'When something truly delights you, it instantly lights up the entire moment around you.',
      },
      {
        id: 'cmp-5',
        title: 'Curious Heart',
        category: 'Spirit',
        text: 'Your curiosity turns ordinary afternoons into stories worth remembering.',
      },
      {
        id: 'cmp-6',
        title: 'Grace Under Pressure',
        category: 'Strength',
        text: 'Even when things get busy, you hold onto your kindness and poise in a way that is quietly inspiring.',
      },
    ],

    // Intentionally empty — never fabricate inside jokes pretending to be real shared history.
    insideJokes: [],

    bucketList: [
      {
        id: 'bl-1',
        title: 'Watch a golden-hour sunset with warm coffee in hand',
        category: 'Cozy',
        completed: false,
        createdAt: '2026-11-01T10:00:00.000Z',
      },
      {
        id: 'bl-2',
        title: 'Build a collaborative late-night playlist from scratch',
        category: 'Music',
        completed: false,
        createdAt: '2026-11-02T10:00:00.000Z',
      },
      {
        id: 'bl-3',
        title: 'Try a hidden café neither of us has visited yet',
        category: 'Food',
        completed: false,
        createdAt: '2026-11-03T10:00:00.000Z',
      },
      {
        id: 'bl-4',
        title: 'Cook an ambitious new dish together from start to finish',
        category: 'Adventure',
        completed: false,
        createdAt: '2026-11-04T10:00:00.000Z',
      },
    ],

    destinations: [
      {
        id: 'dest-1',
        name: 'Corner Artisanal Bakery & Café',
        category: 'Café',
        vibeNote: 'Warm pastries, window seats, and slow afternoon talk.',
      },
      {
        id: 'dest-2',
        name: 'Candlelit Rooftop Bistro',
        category: 'Restaurant',
        vibeNote: 'Golden string lights and unhurried dinner.',
      },
      {
        id: 'dest-3',
        name: 'Botanical Sunset Walk',
        category: 'Park',
        vibeNote: 'Quiet paths, twilight breeze, and great photos.',
      },
      {
        id: 'dest-4',
        name: 'Independent Bookstore & Vinyl Stroll',
        category: 'Shopping',
        vibeNote: 'Picking out one book or record for each other.',
      },
      {
        id: 'dest-5',
        name: 'Scenic Hillside Weekend Escape',
        category: 'Travel',
        vibeNote: 'Misty mornings, scenic views, and zero alarms.',
      },
    ],

    datePlans: [
      {
        id: 'dp-1',
        idea: 'Sunset walk followed by artisan gelato',
        plannedDate: '2026-11-28',
        notes: 'Bring a light jacket and pick two songs for the walk.',
        status: 'Upcoming',
      },
      {
        id: 'dp-2',
        idea: 'Cozy cinema night with handmade snacks',
        plannedDate: '2026-12-05',
        notes: 'Winner of Memory Match picks the first movie.',
        status: 'Dreaming',
      },
    ],

    submittedAnswers: [],
    sessions: [
      {
        id: 'sess-1-initial',
        sessionNumber: 1,
        startedAt: new Date().toISOString(),
        status: 'active',
      },
    ],
    answerRecords: [],
    quizAttempts: [],
    gameRecords: [],
    activityEvents: [],
  };
}
