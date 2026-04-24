// ─────────────────────────────────────────────
// Type definitions
// ─────────────────────────────────────────────

export interface QuizOption {
  label: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Quiz {
  question: string;
  options: QuizOption[];
  correctLabel: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface Spot {
  id: string;
  name: string;
  aoyagiNote: string;       // Aoyagi's note upon arriving at the spot (before the story)
  aoyagiNoteAfter?: string; // Note after the story (second page)
  story: string;             // Story text (paragraphs separated by \n\n)
  nextHint: string;          // Bridge to the next spot
  quiz: Quiz;
}

export interface ResultTitle {
  minCorrect: number;
  maxCorrect: number;
  title: string;
  message: string;
}

export interface Scenario {
  title: string;
  subtitle: string;
  prologue: string;       // Prologue narration
  prologueNote: string;   // First page of the notebook
  spots: Spot[];
  epilogue: string;
  resultTitles: ResultTitle[];
}

// ─────────────────────────────────────────────
// Scenario data (v5)
// ─────────────────────────────────────────────

export const scenario: Scenario = {
  title: 'A Journey to Decode Names',
  subtitle: "The Notebook Aoyagi Left Behind",

  prologue: `April. One week since enrollment.

Get off at the Center Zone bus stop, head to the lecture building, eat in the cafeteria at noon, study a bit in the library, take the bus home. The same route every day. I barely know the names of any buildings.

Today I came to the Central Library again. As I walked between the shelves looking for a seat, I found something out of place in the corner of a shelf.

A notebook. Written on the cover in thick pen:

"The Secrets Behind This Campus's Names — Aoyagi"

I opened the first page.`,

  prologueNote: `To whoever finds this.

I'm Aoyagi, and I just graduated from this university. Over four years, I noticed something: the facilities on this campus have names that are almost impossible to read. 嚶鳴天空広場. 皎皎舎. 亭亭舎. When I enrolled, I couldn't read a single one.

I got curious and looked them up — every name had a reason behind it. And the reasons were fascinating. But I almost never met anyone who knew.

So I'm leaving this notebook. Please visit these 7 places in order.

Only the last page is sealed. Don't open it until you reach the 7th spot.

Let's start with the first location. Head to the plaza in the Center Zone. Hundreds of people walk past every day, but no one stops to look.`,

  spots: [
    // ─── SPOT 01 ─── Rising
    {
      id: 'yamakawa',
      name: '山川健次郎 (First President) Bust',
      aoyagiNote: `In four years, I only saw three people stop in front of this bust. And two of them were international students trying to take a commemorative photo.`,
      story: `Near Shiiki Hall. A single bronze bust. I would have walked right past it without being told. In fact, I had been walking past it until today.

I look at the pedestal. "山川健次郎. First President of Kyushu Imperial University."`,
      aoyagiNoteAfter: `山川健次郎. Born into an Aizu samurai family. During the Boshin War, he was the same age as the Byakkotai youth soldiers. He survived the fighting, became a physicist, and served as president of both Tokyo Imperial University and Kyushu Imperial University.

This bust was donated in 2012 by the city of Aizu-Wakamatsu. A gift that traveled across more than a century.

As long as someone remembers a name, the person doesn't disappear. That's what this bust is.`,
      nextHint: `Next, go to the 4th floor of Center Building No. 2. There's a place called "嚶鳴天空広場." Can you read it? I couldn't at first either. But when I learned the origin of this name, I got chills.`,
      quiz: {
        question: 'The bust of First President 山川健次郎 was donated to Kyushu University from a specific city. Where?',
        options: [
          { label: 'A', text: 'Tokyo' },
          { label: 'B', text: 'Aizu-Wakamatsu' },
          { label: 'C', text: 'Fukuoka' },
          { label: 'D', text: 'Kyoto' },
        ],
        correctLabel: 'B',
        explanation: 'Donated by Aizu-Wakamatsu City in May 2012. 山川健次郎 was from the Aizu domain, experienced the Boshin War, and went on to serve as president of both Tokyo Imperial University and Kyushu Imperial University.',
      },
    },

    // ─── SPOT 02 ─── Development
    {
      id: 'oumei',
      name: '嚶鳴天空広場 (Oumei Sky Plaza)',
      aoyagiNote: `On my first day, a senior told me to meet at "Oumei Plaza" — and I was completely lost. "Oumei????"`,
      story: `4th floor of Center Building No. 2. An open space with seats and power outlets. It also has an English name: Q-Commons.

On a plaque is another name: "嚶鳴天空広場."`,
      aoyagiNoteAfter: `"嚶鳴" — a phrase from the 詩経 (Book of Songs), China's oldest poetry anthology. "嚶其鳴矣、求其友声." The sound of birds calling out to each other. By extension, the image of people learning and growing together through mutual encouragement.

A 3,000-year-old poem became the name of a campus plaza. It's written clearly on the university's official website. But I wonder if anyone has actually read it.`,
      nextHint: `So there's a place with a 3,000-year-old poem in its name. Are there others? There are. On the west side of the Center Zone is a building called "皎皎舎" (Koukousha). The way that name was chosen is another good story.`,
      quiz: {
        question: 'Which Chinese classic is the origin of "嚶鳴 (Oumei)"?',
        options: [
          { label: 'A', text: 'The Analects of Confucius' },
          { label: 'B', text: 'Beishan Yiwen' },
          { label: 'C', text: 'Book of Songs (詩経)' },
          { label: 'D', text: 'Tao Te Ching' },
        ],
        correctLabel: 'C',
        explanation: 'The origin is "嚶其鳴矣、求其友声" from the 詩経 (Book of Songs). This is explicitly stated on the official website of Kyushu University\'s Institute for Advanced Study.',
      },
    },

    // ─── SPOT 03 ─── Development
    {
      id: 'koukousha',
      name: '皎皎舎 (Koukousha)',
      aoyagiNote: `I drank coffee here for four years. I didn't learn the meaning of the name until my third year.`,
      story: `West side of the Center Zone. A wooden building on a slope. "皎皎舎 (Koukousha)."

Inside, there's a study zone with 20,000 books and a café with soft-serve ice cream.`,
      aoyagiNoteAfter: `"皎皎" — the gentle, enveloping quality of moonlight or sunlight. From 北山移文 (Beishan Yiwen) by Kong Zhigui, a writer from China's Northern and Southern Dynasties period.

This name was chosen by public nomination. Someone thought "this building suits moonlight" and submitted that idea, and it was selected.

I don't know who that person was. But because of them, every day we were drinking coffee in "a place bathed in moonlight."`,
      nextHint: `Look at the building next to 皎皎舎. There's another one: "亭亭舎 (Teiteisha)." If 皎皎 comes from 北山移文, then 亭亭 probably comes from the same source. Correct. But with this one, there's an even bigger story than the name — a tale spanning 100 years.`,
      quiz: {
        question: 'How was the name "皎皎舎" decided?',
        options: [
          { label: 'A', text: 'Named by the university founder' },
          { label: 'B', text: 'Given by the architect at the time of design' },
          { label: 'C', text: 'Selected through public nomination; from Kong Zhigui\'s 北山移文' },
          { label: 'D', text: 'Named through a naming rights purchase by Fukuoka City' },
        ],
        correctLabel: 'C',
        explanation: 'A facility donated to the university by the Kyushu University Co-op. The name was determined by public nomination. "皎皎" represents the gentle, enveloping quality of moonlight or sunlight.',
      },
    },

    // ─── SPOT 04 ─── Development
    {
      id: 'teiteisha',
      name: '亭亭舎 (Teiteisha)',
      aoyagiNote: `I took many naps on the tatami here. It might have been my favorite place in four years.`,
      story: `The moment you slide open the door, the scent of rush grass. A 51-tatami-mat space. Sunken kotatsu tables and a veranda where afternoon light streams in.

"亭亭" — the image of a young tree growing straight and tall. From the same 北山移文 as 皎皎.

Moonlight and a growing young tree. These two buildings stand side by side with names that form a pair.`,
      aoyagiNoteAfter: `But the bigger story here isn't the name — it's the history of the building.

亭亭舎 is a revival of the "student gathering facility" of Fukuoka Prefectural High School under the old education system (founded 1921). Old-system Fukuoka High School → Kyushu University's Faculty of General Education (Ropponmatsu) → Ropponmatsu campus closed in 2009 → Reborn in 2015 as this tatami space in Ito.

"A place for students to gather and talk" survived 100 years, moving from place to place. The building is new. But the "spirit of the space" is 100 years old.`,
      nextHint: `We've had classics and history so far. Hungry yet? Next is a cafeteria — one you can't even notice from outside. Go down to the basement level of Big Sand.`,
      quiz: {
        question: 'What tradition does 亭亭舎 "revive"?',
        options: [
          { label: 'A', text: 'The tea ceremony culture of the Hakozaki campus' },
          { label: 'B', text: 'The student gathering facility from old-system Fukuoka High School (founded 1921)' },
          { label: 'C', text: 'The Meiji-era dormitory dining hall' },
          { label: 'D', text: 'The prewar Kyushu Imperial University martial arts hall' },
        ],
        correctLabel: 'B',
        explanation: 'A tradition passed down over 100 years: Old-system Fukuoka High School → Kyushu University Faculty of General Education (Ropponmatsu) → Ito Campus. Both "亭亭" and "皎皎" come from the same 北山移文.',
      },
    },

    // ─── SPOT 05 ─── Turning Point
    {
      id: 'chikashoku',
      name: 'Big Sand Underground Cafeteria',
      aoyagiNote: `In the first semester of my first year, I didn't know this cafeteria existed. A senior said "let's go to the basement cafeteria" and it was the first time I went down. I thought it was a hidden dungeon.`,
      story: `Big Sand. It looks like an ordinary building from outside. But when you descend the stairs to the lower floor, a large cafeteria appears.

A semi-underground structure. You wouldn't notice it just by walking outside. Yet it has the most seats in the Center Zone. Beyond the terrace seating, there's a view of the satoyama woodland.`,
      aoyagiNoteAfter: `My recommendation: the chicken tempura oyakodon and the chicken tempura set. The chicken tempura oyakodon was my best meal of four years. Eating it on the terrace while looking at the satoyama is something special.

By the way, the name "underground cafeteria" wasn't decided by anyone. It's semi-underground, so it naturally came to be called that. The official name is "Big Dining." But everyone calls it "chika-shoku" (basement cafeteria).`,
      nextHint: `Next, head to the East Zone. There's a cafeteria on the rooftop of the Central Library called "Big Sky." The story behind that name is a good one.`,
      quiz: {
        question: 'Why is the Big Sand underground cafeteria called the "underground cafeteria"?',
        options: [
          { label: 'A', text: 'Because it connects directly to a subway station' },
          { label: 'B', text: 'Because it has a special kitchen that uses groundwater' },
          { label: 'C', text: 'Because the building has a semi-underground structure that is hard to notice from outside' },
          { label: 'D', text: 'Because it was renovated from a former air-raid shelter' },
        ],
        correctLabel: 'C',
        explanation: 'A cafeteria on the basement level of Big Sand. Due to the semi-underground structure, it is hard to notice from outside, yet it has the most seats in the Center Zone. The terrace has a view of the satoyama.',
      },
    },

    // ─── SPOT 06 ─── Turning Point
    {
      id: 'bigsky',
      name: 'Big Sky Cafeteria',
      aoyagiNote: `When I learned the origin of this name, I thought: "So that's what naming something really means."`,
      story: `The rooftop space of the Central Library. An open, glass-walled cafeteria.

"Big Sky."`,
      aoyagiNoteAfter: `This name was chosen through public nomination.

The reason it was selected: "There are no tall buildings nearby, so this will surely become a place where the sky looks big and feels great."

Someone imagined a cafeteria that hadn't been completed yet, and gave it a name.

皎皎舎 draws on a 1,500-year-old Chinese poem. 亭亭舎 carries 100 years of history. Big Sky came from a single moment of imagination. Different eras, different scales. But all of them — someone chose those words by thinking about that place.

I looked up at the sky from the terrace. — Sure enough, the sky looks big.`,
      nextHint: `The last place. Go to the 2nd floor of West Building No. 2. There's a Foucault pendulum. This one isn't about a name. But it's where everything connects. When you arrive, open the last page.`,
      quiz: {
        question: 'What is the origin of the name "Big Sky"?',
        options: [
          { label: 'A', text: 'From a nearby mountain name' },
          { label: 'B', text: 'It means "wide open space" in a Kyushu dialect' },
          { label: 'C', text: 'Selected through public nomination — "because the sky will look big here"' },
          { label: 'D', text: 'From an expression in an English textbook' },
        ],
        correctLabel: 'C',
        explanation: 'Decided by open nomination from inside and outside the university. The selection reason was "there are no tall buildings around, so the sky will look big here." Published in official Kyushu University topics.',
      },
    },

    // ─── SPOT 07 ─── Resolution
    {
      id: 'foucault',
      name: 'Foucault Pendulum (フーコーの振り子)',
      aoyagiNote: '',
      story: `West Building No. 2, atrium on the 2nd floor. A giant pendulum hangs from the ceiling, swinging slowly.

The Foucault pendulum. A recreation of the experiment conducted by French physicist Foucault at the Panthéon in Paris in 1851.

The pendulum swings in a fixed direction. Yet over time, it appears to change direction. The pendulum isn't moving differently. The Earth is rotating.

The last page of the notebook. Break the seal.`,
      aoyagiNoteAfter: `Thank you for visiting all 7 spots.

This campus is always in motion. From Ropponmatsu to Ito. From Hakozaki to Motoka. Buildings move, students change. Like a pendulum, it never stops.

But names remain.

嚶鳴 — a 3,000-year-old poem. 皎皎 — moonlight. 亭亭 — a 100-year memory. Big Sky — someone's imagined sky.

I don't know the faces of the people who chose these names. But the words they picked are carved into plaques, catching someone's eye every day.

I barely noticed for four years. So you're already ahead of me.

One more thing — if there's ever a naming contest for a new facility, try submitting an entry. Only those who have thought about this place can become the people who named it.

— Aoyagi`,
      nextHint: '',
      quiz: {
        question: 'What does the Foucault pendulum demonstrate?',
        options: [
          { label: 'A', text: 'That gravity varies by location' },
          { label: 'B', text: 'That the Earth rotates on its axis' },
          { label: 'C', text: 'That air resistance does not affect oscillation' },
          { label: 'D', text: 'That the Moon\'s gravity acts on a pendulum' },
        ],
        correctLabel: 'B',
        explanation: 'Conducted by Foucault at the Paris Panthéon in 1851. The pendulum swings in a fixed direction, but because the Earth rotates, it appears to change direction when viewed from the ground.',
      },
    },
  ],

  epilogue: `I got on the bus home. I closed the notebook and looked out the window.

I could see someone charging their phone in 嚶鳴天空広場. They don't know what the name means. I could see someone coming out of 皎皎舎 with a café latte. They don't know they were bathed in moonlight.

Until yesterday, I was the same.

I put the notebook in my bag. — Actually, no. Forget it.

I'll put it back on the library shelf.

In the scenery you've been overlooking, your own story is now waiting.`,

  resultTitles: [
    {
      minCorrect: 0,
      maxCorrect: 2,
      title: 'The One Who Walked Past',
      message: "There's still a lot you don't know. But Aoyagi didn't notice until third year, so you'll be fine.",
    },
    {
      minCorrect: 3,
      maxCorrect: 4,
      title: 'The One Who Noticed the Names',
      message: '嚶鳴, 皎皎, 亭亭 — try saying them out loud starting tomorrow. Just being able to read them feels a little special.',
    },
    {
      minCorrect: 5,
      maxCorrect: 6,
      title: 'The One Who Uncovered the Origins',
      message: "You'll never walk past a nameplate again. Now try telling someone else.",
    },
    {
      minCorrect: 7,
      maxCorrect: 7,
      title: 'The One Who Named This Place',
      message: 'Next time there\'s a naming contest, submit an entry.',
    },
  ],
};
