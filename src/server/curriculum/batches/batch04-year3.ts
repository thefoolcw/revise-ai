import { compileActivities, type Subject } from '../authoredActivities';

/** Original Year 3 sequences. KS2 progression adds three-digit arithmetic,
 * explanatory writing, controlled enquiry, source comparison and first languages.
 */
const subjects: Subject[] = [
['maths', [
 ['Three-digit calculation', [
  ['Exchange across a hundred', 'Add three-digit numbers using place-value exchanges.',
   'In 268 + 157, add quantities with the same place value. Eight ones and seven ones make fifteen: exchange ten for one ten. Six tens plus five tens plus that extra ten make twelve tens; exchange ten tens for one hundred. Exchanges preserve the total while changing its representation.',
   'Calculate 268 + 157.', ['Ones: 8 + 7 = 15, leaving five ones and one extra ten.', 'Tens: 6 + 5 + 1 = 12, leaving two tens and one extra hundred.', 'Hundreds: 2 + 1 + 1 = 4, so the answer is 425.'], 'Exchange into the next place.', 'Forgetting an exchanged ten when adding the tens column.', 'Record each exchange in its destination column and include it once.',
   'How many tens equal one hundred?', 'Ten tens.', 'Calculate 346 + 178.', '524: fourteen ones produce an extra ten; twelve tens produce an extra hundred.'],
  ['Subtract with an exchange', 'Explain a place-value exchange when subtracting.',
   'For 432 − 158, two ones cannot give eight ones without an exchange in this positive-number calculation. Exchange one of the three tens for ten ones, giving twelve ones and two tens. Later exchange a hundred for ten tens. Each exchange changes the parts but not the starting value.',
   'Calculate 432 − 158.', ['Exchange one ten: 12 − 8 = 4 ones.', 'Two tens need another exchange: 12 − 5 = 7 tens.', 'Three hundreds remain; 3 − 1 = 2, so the result is 274.'], 'Rename the quantity before subtracting.', 'Subtracting the smaller digit from the larger in every column.', 'Keep the subtraction order and exchange when needed.',
   'Does exchanging a hundred for ten tens change the total?', 'No.', 'Calculate 521 − 136 and check with addition.', '385; checking gives 385 + 136 = 521.']
 ]],
 ['Fractions and multiplication', [
  ['Unit fractions on a number line', 'Locate a unit fraction by making equal intervals.',
   'The denominator tells how many equal parts make one whole. To mark one sixth, divide the interval from zero to one into six equal intervals. The first interval ends at one sixth. Count spaces between marks, not just the marks: six intervals require seven boundary marks including zero and one.',
   'Mark one quarter between zero and one.', ['Split the whole interval into four equal spaces.', 'Start at zero and move one space.', 'That point is one quarter.'], 'Denominator counts equal spaces.', 'Making unequal sections or counting boundary marks as parts.', 'Check equal interval lengths and count the spaces.',
   'Which is larger, one half or one quarter of the same whole?', 'One half.', 'How many one-sixth steps reach one whole?', 'Six, because six equal sixths make one whole.'],
  ['Use known facts to multiply', 'Derive an unfamiliar multiplication from known equal groups.',
   'If you know 5 × 8 = 40, then 6 × 8 is one more group of eight: 40 + 8 = 48. This is distributive reasoning: split six groups into five groups and one group. A diagram of equal rows makes clear why the extra amount is eight rather than one.',
   'Find 7 × 4 using 5 × 4.', ['Five groups of four make twenty.', 'Two more groups of four make eight.', 'Twenty plus eight gives 28.'], 'Split groups, keep group size.', 'Adding two rather than two groups of four.', 'Name both the number of groups and the size of each group.',
   'What is one extra group of eight worth?', 'Eight.', 'Use 5 × 6 to find 6 × 6.', '30 + 6 = 36, because six groups are five groups plus one more group of six.']
 ]]
]],
['english-lang', [
 ['Sentence relationships', [
  ['Give reasons with because', 'Use a subordinate clause to explain a reason.',
   'A clause contains a verb. “We stayed inside” is a main clause that can stand alone. “Because the path was icy” adds a reason but is incomplete on its own in this context. Join them to show the relationship. The reason must logically explain the main action, not simply add any fact.',
   'Combine “The match stopped” and “heavy rain flooded the pitch”.', ['Identify the main event: the match stopped.', 'Identify the reason: rain flooded the pitch.', 'Write “The match stopped because heavy rain flooded the pitch.”'], 'Because answers why.', 'Leaving only a because clause as a complete explanation.', 'Check that the sentence includes the main event as well as its reason.',
   'Which clause can stand alone: “We waited” or “because it rained”?', '“We waited.”', 'Complete “The plant wilted because…” with a sensible reason.', 'For example, “The plant wilted because it had too little water.”'],
  ['Use the present perfect', 'Distinguish a past event connected to now from a simple past statement.',
   'The present perfect uses has or have with a past participle: “She has finished.” It can connect a completed action with its present result. “She finished yesterday” uses simple past and names a finished past time. Forms differ for some verbs: write becomes written after has or have.',
   'Change “I finished my model” to emphasise its result now.', ['Choose have for I.', 'Use the participle finished.', 'Write “I have finished my model.”'], 'Has or have plus the participle.', 'Writing “She has went”.', 'Use gone after has; went is the simple past form.',
   'Which helper matches “he”: has or have?', 'Has.', 'Complete “They have ___ a story” using write.', 'Written: “They have written a story.”']
 ]],
 ['Organisation and punctuation', [
  ['Group related ideas into paragraphs', 'Organise information by topic rather than arbitrary sentence count.',
   'A paragraph gathers related ideas. A report about a fox might have one paragraph about appearance and another about food. Start a new paragraph when the focus changes, not automatically after three sentences. Plan topic groups before writing so details do not jump repeatedly between subjects.',
   'Sort facts about red fur, a bushy tail, hunting mice and eating berries.', ['Group fur and tail as appearance.', 'Group mice and berries as food.', 'Use separate paragraphs for the two topic groups.'], 'One main focus per paragraph.', 'Starting a new paragraph after every sentence without a change of focus.', 'Check which sentences develop the same topic.',
   'What can signal the need for a new paragraph?', 'A change of topic, time, place or focus.', 'Where would a sentence about a fox’s den fit in an appearance-and-food report?', 'It could begin a new paragraph about habitat or shelter rather than being forced into either existing topic.'],
  ['Punctuate direct speech', 'Identify the spoken words and enclose them in inverted commas.',
   'Direct speech records the words a character says. In “Please wait,” said Jo, the spoken words are Please wait, not said Jo. Inverted commas go around the speech, and punctuation belongs inside them. A reporting clause tells who spoke. This lesson uses double inverted commas consistently.',
   'Punctuate Jo’s words: Please wait.', ['Identify the speech: Please wait.', 'Place it inside inverted commas.', 'Write “Please wait,” said Jo.'], 'Speech marks wrap the spoken words.', 'Putting said Jo inside the speech marks.', 'Separate the words spoken from the narrator’s reporting clause.',
   'What does a reporting clause tell us?', 'Who spoke, and sometimes how.', 'Punctuate the sentence in which Ali says, “I am ready”.', '“I am ready,” said Ali. The comma is inside the closing speech mark.']
 ]]
]],
['english-lit', [
 ['Inference and viewpoint', [
  ['Trace a character’s change', 'Explain a change in a character using evidence from two moments.',
   'Read: “Before the race, Tessa hid behind her brother and whispered. After finishing, she waved to the crowd and asked about the next race.” Compare the two moments. Her actions suggest growing confidence, but identify the clues rather than simply labelling her brave. A change should be supported at both ends.',
   'How does Tessa seem to change?', ['At first she hides and whispers.', 'Later she waves and wants another race.', 'These contrasting actions suggest increased confidence.'], 'Before clue, after clue, explain the change.', 'Using only the ending to describe a change.', 'Compare evidence from earlier and later in the text.',
   'Which early action might suggest uncertainty?', 'Hiding behind her brother or whispering.', 'Why does asking about another race support the confidence inference?', 'It suggests she is now willing or eager to repeat the experience.'],
  ['Separate narrator and character knowledge', 'Recognise that a character may not know what the reader knows.',
   'Read: “Niko searched the garden for his keys. Inside, his sister placed them on the kitchen table.” The reader knows where the keys are because the narrator tells us, but Niko may not. Keeping these viewpoints separate helps explain why a character acts in a way that seems unnecessary to the reader.',
   'Why does Niko keep searching outside?', ['Identify what the reader knows about the table.', 'Check whether Niko has been told.', 'He may still believe the keys are in the garden.'], 'Who knows which fact?', 'Assuming every character knows every narrated event.', 'Track what each character has seen or been told.',
   'Who places the keys on the table?', 'Niko’s sister.', 'Does the passage prove that Niko knows the keys are inside?', 'No. The narrator informs the reader, not necessarily Niko.']
 ]],
 ['Poetic language and evidence', [
  ['Explain personification', 'Describe the effect of giving human actions to a non-human thing.',
   '“The wind whispered through the reeds” gives the wind a human speaking action. This personification suggests a quiet rustling sound. The wind is not literally using words. Explain both what is described and what the chosen human action makes the reader imagine.',
   'Explain “The tired house sighed in the storm”.', ['Identify the house as non-human.', 'Notice sighed as a human-like action.', 'Suggest creaking sounds and a weary atmosphere.'], 'Human action, non-human subject.', 'Calling every adjective personification.', 'Look for a human quality or action attributed to something non-human.',
   'Is “the red boat” personification?', 'No; red is a colour, not a specifically human action or quality.', 'Explain “The sun smiled on the field”.', 'The sun is given a human expression, suggesting warmth, brightness or a cheerful atmosphere.'],
  ['Choose a short quotation', 'Support an interpretation with a relevant brief quotation.',
   'Evidence works best when it directly supports the point. In “The narrow tunnel swallowed the last strip of daylight”, the phrase “swallowed the last strip of daylight” supports a threatening or enclosed impression. Copy only the useful words accurately and explain their connection; a quotation alone is not an explanation.',
   'Support the idea that the tunnel feels dark.', ['State that the tunnel seems dark and enclosing.', 'Quote “the last strip of daylight”.', 'Explain that even the remaining light disappears.'], 'Point, short evidence, explanation.', 'Copying a whole paragraph without explaining it.', 'Choose the smallest relevant phrase and connect it to the point.',
   'Should a quotation be copied accurately?', 'Yes.', 'Which word in the tunnel sentence suggests a powerful consuming action?', '“Swallowed”; it gives the tunnel an active, consuming quality.']
 ]]
]],
['science-combined', [
 ['Rocks and soils', [
  ['Compare rock properties', 'Describe rocks using observable properties and careful tests.',
   'Rocks differ in grain size, appearance, hardness and permeability. Appearance alone does not establish every property. Compare safe labelled samples with adult guidance, and use the same simple test for each. A rock that crumbles in one sample should not lead to a claim that all rocks are soft.',
   'Compare whether two rock samples allow a little water to soak in.', ['Use similar dry sample sizes where possible.', 'Apply the same small amount of water.', 'Observe absorption over the same time and record differences.'], 'Observe a property; test a claim.', 'Assuming a shiny rock must be waterproof.', 'Test permeability separately from appearance.',
   'What does permeable mean?', 'It allows water to pass through connected spaces.', 'Why use the same observation time for both rocks?', 'Different waiting times could make the comparison misleading.'],
  ['Explain soil as a mixture', 'Identify several components of soil.',
   'Soil is a mixture containing rock particles, organic matter, air and water. Organic matter includes material from living things as it breaks down. Different particle sizes affect how soil holds water and air. Handle soil with adult guidance, avoid unknown contaminated sites and wash hands afterwards.',
   'Observe a safe soil sample in a clear tray.', ['Look for small mineral particles.', 'Notice pieces of decaying leaf or root.', 'Explain that air and water may occupy spaces between particles.'], 'Particles, organic matter, air, water.', 'Describing soil as only tiny stones.', 'Include organic material and the spaces containing air and water.',
   'What is one source of organic matter in soil?', 'Decaying leaves, roots or other once-living material.', 'Why might two soils drain water differently?', 'Their particle sizes and pore spaces differ, affecting how water moves through them.']
 ]],
 ['Light and forces', [
  ['Explain a shadow', 'Describe why an opaque object can form a shadow.',
   'We see an object when light from it or reflected by it enters our eyes. A shadow forms where an opaque object blocks light from reaching a surface. Darkness is an absence of light, not a material an object sends out. Use a torch safely and never look directly at the Sun.',
   'Place an opaque card between a torch and a wall.', ['Shine the torch on the wall.', 'Move the card into the light path.', 'The blocked region on the wall becomes a shadow.'], 'Block light; make a shadow.', 'Thinking shadows are reflections of an object’s colour.', 'Compare different coloured opaque cards blocking the same light.',
   'What type of object blocks light effectively?', 'An opaque object.', 'Why does a shadow disappear when the torch is switched off?', 'Without the torch’s illuminated background, the specific contrast made by blocking that light disappears.'],
  ['Predict magnetic attraction', 'Recognise that magnets attract some metals, not all materials or all metals.',
   'Magnets attract iron and many steels because of their composition. They do not attract every metal: aluminium and copper are not attracted by an ordinary classroom magnet in the same way. Test safe objects and record results. Material matters more than an object being shiny; magnets are not toys to swallow.',
   'Compare a steel paper clip and an aluminium foil piece.', ['Predict using the named materials.', 'Bring a classroom magnet close under supervision.', 'The steel clip is attracted; the aluminium foil is not in this test.'], 'Some metals, not all metals.', 'Calling every shiny object magnetic.', 'Identify or test the material instead of relying on shine.',
   'Is wood normally attracted by a classroom magnet?', 'No.', 'Does one attracted steel object prove every metal is magnetic?', 'No. Different metals have different magnetic properties.']
 ]]
]],
['history', [
 ['Prehistory and evidence', [
  ['Understand archaeological evidence', 'Explain how objects can inform ideas about life before written records.',
   'Archaeologists study material remains such as tools, buildings and bones. For periods without surviving written records, these can provide vital evidence. A tool’s shape and wear may suggest its use, but an interpretation should be tested against other finds. Missing evidence does not prove an activity never happened.',
   'A stone tool has a sharp worked edge.', ['Describe the edge and deliberate shaping.', 'Suggest cutting or scraping as possible uses.', 'Compare wear marks and similar finds before making a stronger claim.'], 'Find, describe, interpret, compare.', 'Claiming certainty about a tool’s use from its shape alone.', 'Explain the evidence and acknowledge alternative interpretations.',
   'What does an archaeologist study?', 'Material remains of past human activity.', 'Why might wooden objects survive less often than stone tools?', 'Wood can decay more readily, depending on burial conditions, so surviving evidence is uneven.'],
  ['Recognise change in farming', 'Explain a consequence of adopting farming while recognising gradual change.',
   'In prehistoric Britain, farming developed after long periods of hunting and gathering. Growing crops and keeping animals could support more settled communities, but the change was gradual and varied. Farming did not mean people instantly stopped hunting or that life became easy; crops could fail and work remained demanding.',
   'How might crop growing encourage settlement?', ['Crops need tending over a growing season.', 'People benefit from staying near their fields.', 'This can support more permanent settlement.'], 'A new practice changes daily choices.', 'Imagining one day when everyone abandoned hunting.', 'Describe gradual and varied change, with practices overlapping.',
   'Does farming guarantee a successful harvest?', 'No.', 'Give a reason farmers might store grain.', 'To keep food for later seasons or times when fresh crops are unavailable.']
 ]],
 ['Ancient Egypt', [
  ['Connect the Nile with settlement', 'Explain why the Nile mattered to ancient Egyptian communities.',
   'The Nile provided water, transport routes and fertile land along parts of its valley. Flooding historically deposited sediment useful for farming. People still needed to organise planting, irrigation and storage. Avoid saying all of Egypt was fertile: large areas were desert, so the river corridor was especially important.',
   'Why might a settlement develop near the Nile?', ['Identify access to water.', 'Connect fertile nearby land with crops.', 'Add transport as another useful river function.'], 'Water, farming, travel.', 'Calling the whole country equally fertile.', 'Distinguish the river valley from surrounding desert areas.',
   'What did flood sediment help support?', 'Farming on suitable nearby land.', 'Why did a useful river not remove the need for planning?', 'Communities still had to manage water, grow and store food, and respond to seasonal conditions.'],
  ['Compare tomb evidence with everyday life', 'Recognise that surviving sources can overrepresent wealthy people.',
   'Some Egyptian tombs contain elaborate objects and images made for wealthy or powerful people. These reveal beliefs and resources, but they do not directly show how every person lived. Ordinary homes and tools provide other perspectives. Ask whose life a source represents and who is missing.',
   'Does a gold burial object show that every Egyptian owned gold?', ['Identify the object’s wealthy burial context.', 'Recognise unequal access to resources.', 'Avoid extending this evidence to everyone.'], 'Whose evidence survives?', 'Treating a ruler’s tomb as a typical household.', 'Compare sources from different social groups and settings.',
   'Why might wealthy burials leave more elaborate surviving objects?', 'They could use more resources and durable materials.', 'What additional evidence could help investigate ordinary work?', 'Everyday tools, remains of homes, work records or images interpreted in context.']
 ]]
]],
['geography', [
 ['Location and mapping', [
  ['Use compass directions', 'Describe relative positions with the four main compass directions.',
   'North, east, south and west describe directions rather than a traveller’s left and right. On a north-up map, east is to the right, but rotating the paper does not change real-world east. Check the north arrow before giving a direction. A compass rose helps relate the map to directions.',
   'A school lies above a park on a north-up map.', ['Check the north arrow points upward.', 'Compare the school’s position with the park.', 'The school is north of the park.'], 'Check north before naming direction.', 'Assuming the top of every map is north.', 'Read the north arrow or orientation information.',
   'Which direction is opposite east?', 'West.', 'If a library is west of a station, where is the station relative to the library?', 'East of the library; reversing the relationship reverses the direction.'],
  ['Read a simple grid reference', 'Locate a square using horizontal position before vertical position.',
   'A simple classroom grid can label columns A, B, C and rows 1, 2, 3. A reference such as B2 names the column then the row. This introductory grid differs from full numerical map references, but it develops the same habit of locating across before up. Always check the map’s labelling system.',
   'Find C3 on a labelled grid.', ['Locate column C across the grid.', 'Find row 3.', 'Choose the square where they meet.'], 'Across first, then the row.', 'Reading row 3 before checking column C and choosing the wrong square.', 'Trace both labels to their intersection.',
   'What does B identify in the reference B2?', 'The labelled column.', 'A tree is in column A, row 4. Give its reference.', 'A4, using this grid’s column-then-row convention.']
 ]],
 ['Rivers and human choices', [
  ['Follow a river system', 'Describe source, channel, tributary and mouth.',
   'A river flows downhill under gravity from its source through a channel towards its mouth, which may meet a sea, lake or another river. A tributary joins a larger river. Rivers do not have to flow south; map direction depends on the landscape. Distinguish elevation from north-south position.',
   'A small stream joins a larger river before it reaches the sea.', ['Identify the stream as a tributary.', 'Follow the larger river’s channel.', 'The place it enters the sea is its mouth.'], 'High to low, not north to south.', 'Assuming every river flows down the page.', 'Use flow arrows or elevation information, not page position alone.',
   'What is a tributary?', 'A stream or river that joins another river.', 'Can a river flow north? Explain.', 'Yes. It can flow north if the land slopes downhill in that direction.'],
  ['Evaluate a riverside site', 'Consider both benefits and risks when choosing a settlement location.',
   'Rivers can provide water, transport and attractive land, but some nearby sites face flooding. A good geographical decision considers several factors rather than choosing the prettiest view. Maps of elevation, flood history and routes provide evidence. A past flood does not tell us the exact date of the next one.',
   'Compare a low riverside site with a higher nearby site.', ['Identify easy water access at the low site.', 'Consider possible flood exposure.', 'Compare access and safety at the higher site before recommending.'], 'Benefits and risks together.', 'Treating a useful river as either entirely good or entirely bad.', 'Weigh multiple factors using evidence about the particular location.',
   'Name one possible benefit of a riverside location.', 'Water access, transport, fertile nearby land or recreation, depending on the site.', 'Why consult more than a photograph before choosing a site?', 'A photograph may not reveal flood risk, elevation, access routes or seasonal conditions.']
 ]]
]],
['computer-science', [
 ['Sequencing in a visual program', [
  ['Order events deliberately', 'Explain how command order changes a program’s output.',
   'In a visual program, commands run in a defined sequence after a starting event. A character that moves before speaking may appear in a different place from one that speaks first. Reset its position between tests so the starting state stays the same. Instructions should express the intended story or task.',
   'Make a character move to the door and then say Hello.', ['Choose a clear start event.', 'Place the movement command before the speech command.', 'Run from the agreed starting position and check the sequence.'], 'Order controls the story.', 'Testing without resetting the character’s position.', 'Use an initial-position command or reset manually each time.',
   'Why can swapping two commands change the result?', 'They happen in a different order and may act on a changed state.', 'If a character speaks too early, what should you inspect?', 'The position of the speech command relative to movement and any waiting commands.'],
  ['Break a task into parts', 'Decompose a simple animation into manageable steps.',
   'Decomposition means breaking a larger task into smaller parts. For an animation of a character crossing a road, identify starting, checking, moving and finishing actions. Build and test a part before combining it with the next. The model is a program task, not a replacement for real road-safety instruction.',
   'Plan a character entering a room and introducing itself.', ['Set the starting scene and character position.', 'Animate movement into the room.', 'Add the introduction and a clear ending.'], 'Small parts make a testable whole.', 'Trying to add every effect before checking basic movement.', 'Test the essential sequence first, then add optional detail.',
   'What does decomposition mean?', 'Breaking a task into smaller manageable parts.', 'Why test parts separately?', 'It makes errors easier to locate before the parts interact.']
 ]],
 ['Information and networks', [
  ['Explain a network connection', 'Describe why digital devices may be connected.',
   'A network connects devices so they can communicate and share resources. A school computer may send work to a shared printer through a network. The internet is a much larger network of networks, while the World Wide Web is one service using it. Not every local network needs an internet connection for every task.',
   'Several classroom computers use one printer.', ['Identify each computer and the printer as devices.', 'Describe connections carrying print information.', 'Explain that sharing a printer is one benefit of a network.'], 'Connected devices share information.', 'Using internet and every kind of network as exact synonyms.', 'Distinguish a local network from the wider internet.',
   'Can a local network share a printer?', 'Yes.', 'Does a printer connection prove a device can access every website?', 'No. Local resource sharing and access to internet services are different capabilities.'],
  ['Use branching questions', 'Classify objects with questions that divide a group.',
   'A branching database uses questions, often with yes/no answers, to narrow down possibilities. Good questions refer to clear properties shared by some objects but not all. In a set of shapes, “Does it have three sides?” can separate triangles. Avoid vague questions such as “Is it nice?” because people may disagree.',
   'Separate a triangle, square and circle.', ['Ask “Does it have straight sides?” to separate the circle.', 'For straight-sided shapes, ask “Does it have three sides?”', 'Yes identifies the triangle; no leaves the square in this set.'], 'Clear questions divide the possibilities.', 'Choosing a subjective question with no consistent answer.', 'Use observable properties and test every object through the branches.',
   'Why is “Is it beautiful?” a poor classification question?', 'It depends on opinion rather than a consistent property.', 'Suggest a yes/no question separating a circle from a square.', '“Does it have corners?” gives no for a circle and yes for a square.']
 ]]
]],
['french', [
 ['Greetings and identity', [
  ['Greet politely', 'Choose a simple French greeting for a context.',
   'Bonjour is a standard daytime greeting. Salut is informal and suits friends or familiar peers. Au revoir means goodbye. Practise the phrases aloud with a teacher or reliable audio: French sounds do not map exactly to English spelling. A polite greeting depends on the situation, not just the translation.',
   'You greet a teacher in the morning.', ['Choose a polite daytime greeting.', 'Say Bonjour.', 'When leaving, say Au revoir.'], 'Bonjour to greet; au revoir to leave.', 'Using au revoir when arriving.', 'Connect each phrase to its function in a short role-play.',
   'Which phrase means goodbye?', 'Au revoir.', 'Which is the safer greeting for an unfamiliar adult: salut or bonjour?', 'Bonjour is the standard polite daytime greeting; salut is more informal.'],
  ['Say your name', 'Introduce yourself using Je m’appelle.',
   'Je m’appelle means “My name is” in an introduction. Follow it with your chosen name: Je m’appelle Léa. The apostrophe joins words in a standard French form; do not pronounce an English-style pause at it. Comment tu t’appelles ? is an informal question asking someone’s name.',
   'Introduce a fictional person named Sam.', ['Begin Je m’appelle.', 'Add Sam.', 'Say the whole introduction: Je m’appelle Sam.'], 'Phrase first, name next.', 'Translating the English words one at a time into an invented French phrase.', 'Learn the complete useful expression as a spoken unit.',
   'What does Je m’appelle introduce?', 'A person’s name.', 'Answer Comment tu t’appelles ? using the name Noor.', 'Je m’appelle Noor. The name follows the introduction phrase.']
 ]],
 ['Numbers and classroom language', [
  ['Count from one to five', 'Recognise and use the first five French number words.',
   'The numbers one to five are un, deux, trois, quatre, cinq. Link each spoken word with a quantity rather than only chanting a list. French pronunciation needs listening practice; written English approximations can mislead. Start with safe classroom objects and mix the quantities so recall is not only sequential.',
   'Count three pencils.', ['Touch one pencil for un.', 'Touch the next for deux.', 'Touch the third for trois: three pencils.'], 'A word for each quantity.', 'Knowing the chant but not recognising trois on its own.', 'Practise number cards in a shuffled order.',
   'Which number is deux?', 'Two.', 'Which French word names a group of five?', 'Cinq. It represents five objects, regardless of their arrangement.'],
  ['Respond to classroom commands', 'Recognise two common classroom instructions in French.',
   'Écoutez means listen when addressing a group or speaking politely. Répétez means repeat in the same form. A teacher may say Écoutez, model a word, then say Répétez. Listen to the model before echoing. Commands are learned through meaning and action, not just copying written letters.',
   'The teacher says Écoutez, then Bonjour, then Répétez.', ['Listen when Écoutez is said.', 'Hear the model Bonjour.', 'Repeat Bonjour after Répétez.'], 'Listen first, repeat next.', 'Speaking over the model immediately after Écoutez.', 'Wait for the instruction to repeat.',
   'Which instruction asks you to repeat?', 'Répétez.', 'What should you do when a teacher says Écoutez ?', 'Listen to the next spoken information or model rather than immediately speaking.']
 ]]
]],
['spanish', [
 ['Greetings and identity', [
  ['Use everyday greetings', 'Choose a Spanish greeting or farewell for a simple exchange.',
   'Hola means hello, buenos días is a morning greeting and adiós means goodbye. The h in hola is silent. Listen to fluent audio or a teacher rather than pronouncing each letter as in English. Spanish is spoken in many countries, so voices and some everyday choices vary.',
   'Greet a teacher in the morning and then leave.', ['Choose Buenos días for the morning.', 'Listen and respond politely.', 'Use Adiós when leaving.'], 'Hola has a silent h.', 'Pronouncing hola with a strong English h sound.', 'Listen to the model and begin with the vowel sound.',
   'What does adiós mean?', 'Goodbye.', 'Which phrase is a morning greeting?', 'Buenos días; it is commonly used to greet someone in the morning.'],
  ['Introduce yourself', 'Use Me llamo to give a name.',
   'Me llamo introduces your name: Me llamo Ana. ¿Cómo te llamas? asks someone’s name informally. Spanish uses an opening inverted question mark and a closing question mark. The pronunciation of ll varies by region; follow a reliable model consistently without treating regional differences as mistakes.',
   'Answer the name question as a fictional person called Alex.', ['Recognise ¿Cómo te llamas? as a name question.', 'Start Me llamo.', 'Say Me llamo Alex.'], 'Me llamo plus a name.', 'Adding the English phrase my name inside the Spanish sentence.', 'Use the complete Spanish expression before the name.',
   'What information does ¿Cómo te llamas? ask for?', 'Your name.', 'Write an introduction using the name Sara.', 'Me llamo Sara. The phrase introduces the speaker’s name.']
 ]],
 ['Numbers and classroom language', [
  ['Connect number words with quantities', 'Use Spanish numbers from one to five.',
   'Uno, dos, tres, cuatro and cinco name one, two, three, four and five. Practise matching a number card to objects as well as reciting in order. Sound-letter relationships differ from English; listen to the words and repeat. Here we use the number words independently, before learning noun agreement.',
   'Match cuatro to a group of counters.', ['Recall that cuatro is four.', 'Count a group of four counters.', 'Choose that group, not a group chosen by size or spacing.'], 'Count the quantity, not the pattern.', 'Confusing tres and cuatro because both appear in the counting chant.', 'Practise them individually with three and four objects.',
   'Which Spanish word means two?', 'Dos.', 'Put tres, uno and cinco in increasing numerical order.', 'Uno, tres, cinco: one, three, five.'],
  ['Listen and repeat in class', 'Recognise escucha and repite in a one-to-one classroom exchange.',
   'Escucha means listen when addressing one person informally. Repite means repeat in the same form. These commands differ from forms used for a whole group or more formal address. Practise a one-to-one exchange so the context matches the language, and wait for the model before repeating.',
   'A teacher says Escucha, then Hola, then Repite to one learner.', ['Listen after Escucha.', 'Notice the model Hola.', 'Say Hola after Repite.'], 'Escucha first; repite after.', 'Assuming one command form is used for every audience.', 'Learn this as a one-person informal example and notice other forms later.',
   'Which instruction means repeat in this example?', 'Repite.', 'Why should you wait after escucha rather than immediately echo it?', 'It asks you to listen to the model that follows, not necessarily to repeat the command itself.']
 ]]
]],
['art', [
 ['Space and observation', [
  ['Use overlapping to show depth', 'Arrange shapes to suggest foreground and background.',
   'In a flat image, overlap can suggest which object is nearer. If a tree shape covers part of a house shape, the tree usually appears in front. Foreground is the nearer area; background appears farther away. This is a visual convention, not a claim that the paper itself has deep space.',
   'Draw a fence in front of a field and distant house.', ['Place the house and field farther back in the composition.', 'Draw the fence across part of the scene.', 'Let the fence obscure selected details behind it.'], 'Near shapes can hide far shapes.', 'Drawing every object with a complete visible outline despite overlap.', 'Decide which parts are hidden before adding final lines.',
   'What is the foreground?', 'The part of the pictured scene that appears nearest.', 'Why might a partly hidden object appear behind another?', 'The visible overlap suggests the nearer object blocks part of our view.'],
  ['Observe light and shade', 'Use tonal contrast to suggest a simple form.',
   'A rounded object often has a lighter side facing a light source and a darker side away from it. Observe a safely lit ball and identify broad areas before details. The cast shadow on the table is different from shading on the ball itself. Artistic simplification can clarify the form.',
   'Shade a ball lit from the left.', ['Leave the left-facing area lighter.', 'Build darker tone on the opposite side.', 'Add a separate cast shadow where the ball blocks light reaching the surface.'], 'Light side, shaded side, cast shadow.', 'Putting the darkest shading on the side facing the main light without observing.', 'Check the actual light direction before choosing tones.',
   'Is a cast shadow part of the ball’s own surface?', 'No; it falls on another surface.', 'Why use gradual tonal change on a rounded form?', 'It can suggest the surface turning gradually away from the light.']
 ]],
 ['Pattern and artistic decisions', [
  ['Develop a motif through rotation', 'Create a pattern by deliberately transforming a repeated shape.',
   'A motif is a repeated design element. Rotating a motif turns it around a point while preserving its basic shape. Try quarter-turn rotations of an arrow-shaped paper motif before drawing or printing. Plan spacing and direction so the transformation is intentional rather than accidental.',
   'Arrange four arrows around a centre.', ['Place the first arrow.', 'Turn the next by a quarter-turn.', 'Continue the turns to create a planned circular arrangement.'], 'Same motif, changed direction.', 'Changing both the shape and direction without recognising which created the effect.', 'Hold the motif shape constant while exploring rotation.',
   'Does rotating a motif necessarily change its size?', 'No.', 'How could you make a pattern feel more regular?', 'Use consistent spacing and a deliberate repeating transformation.'],
  ['Explain and revise a composition', 'Evaluate an artwork using its intended effect.',
   'An artist can revise work by comparing the result with an intention. If the aim is a calm scene, crowded shapes and many sharp contrasts may work differently from wide spaces and repeated gentle forms. There are no universal colour rules for feelings. Explain the choices and consider how a viewer responds.',
   'A planned calm scene feels crowded.', ['Identify the intended calm effect.', 'Try removing or moving some shapes.', 'Compare the new spacing and decide whether it supports the intention.'], 'Intention, choice, effect.', 'Treating personal dislike as proof that an artwork is unsuccessful.', 'Evaluate the relationship between choices and the stated purpose.',
   'Must everyone respond to an artwork identically?', 'No.', 'Give a specific revision rather than saying “make it better”.', 'For example, increase space around the focal shape so it is easier to notice.']
 ]]
]],
['design-tech', [
 ['Levers and linkages', [
  ['Identify a lever’s pivot', 'Explain how a simple lever turns around a pivot.',
   'A lever is a rigid bar turning around a pivot. Pushing one part can move another part. In a cardboard moving-picture mechanism, a paper fastener may act as a pivot, but an adult should prepare sharp holes and check components. The pivot should secure the parts without preventing the intended turn.',
   'Make a cardboard arm wave around a fixed shoulder pivot.', ['Identify the shoulder as the fixed pivot.', 'Attach the arm with suitable adult-prepared materials.', 'Move the arm gently and observe rotation around the pivot.'], 'A lever turns around its pivot.', 'Fixing the bar along its whole length so it cannot rotate.', 'Secure the pivot point while leaving room for intended movement.',
   'What is a pivot?', 'The point or axis around which a part turns.', 'Why might a tightly crushed fastener stop a model arm moving?', 'It may create too much friction or clamp the parts so rotation is restricted.'],
  ['Transmit motion with a linkage', 'Describe how connected bars can transfer movement.',
   'A linkage connects moving parts so an input movement produces an output elsewhere. Cardboard strips joined with suitable pivots can move together. The exact output depends on where joints are placed and which points are fixed. Test a simple model rather than assuming every linkage moves the same way.',
   'Pull one strip and observe a connected strip move.', ['Identify the input strip you move.', 'Watch the connecting pivot.', 'Describe the output strip’s direction and range of movement.'], 'Input through a joint to output.', 'Calling every connected strip a fixed support.', 'Distinguish fixed points from points intended to move.',
   'What is an input movement?', 'The movement applied to operate the mechanism.', 'Why mark which pivot is fixed in a diagram?', 'It helps explain and reproduce the mechanism’s actual movement.']
 ]],
 ['Design requirements and testing', [
  ['Turn a need into measurable criteria', 'Write criteria that can be checked through a suitable test.',
   'A design criterion describes something a product should achieve. “A holder should carry six pencils without tipping” is easier to test than “make a good holder”. Criteria should be realistic, safe and relevant to the user. Appearance may matter too, but should be described clearly enough for discussion.',
   'Improve the criterion “a strong bridge”.', ['Name the intended load: a specific light toy.', 'Name the gap it must span.', 'State that it should hold the toy across that gap without collapsing in a safe test.'], 'A useful criterion can be checked.', 'Setting a vague adjective with no test or context.', 'Specify the user, task and observable result.',
   'Why is “good” alone a weak criterion?', 'It does not state what success would look like.', 'Write a testable criterion for a desk organiser.', 'For example, it must hold six pencils upright without tipping on a level desk.'],
  ['Record a controlled product test', 'Compare versions using consistent test conditions.',
   'A design improvement should be checked against the same task as the first version. For two bridge models, keep gap width and load placement consistent. Record what fails as well as what succeeds. If several features change, be cautious about claiming which single change caused the improvement.',
   'Compare a flat-card bridge with a folded-card bridge.', ['Use matching card and the same gap.', 'Place the same light load at the same position.', 'Compare bending and stability, then record the result.'], 'Same test, clear comparison.', 'Changing the load and gap at the same time as the design.', 'Keep test conditions consistent so the design comparison is meaningful.',
   'Why record a failed test?', 'It identifies a limitation and guides a specific improvement.', 'If two design features change together, can you prove which caused success?', 'Not from that comparison alone; test changes separately if you need to isolate their effects.']
 ]]
]],
['music', [
 ['Melody and notation', [
  ['Create a short melodic phrase', 'Organise a few pitches into a repeatable musical idea.',
   'A melody is an organised sequence of pitches with rhythm. Choose three available notes and create a short phrase with a clear start and finish. Keep the pattern short enough to remember and repeat. A musical idea is not improved simply by adding every note available; selection and shape matter.',
   'Create a phrase using notes C, D and E.', ['Choose a short order such as C-D-E-D-C.', 'Give the notes a repeatable rhythm.', 'Play it again and check that the ending feels deliberate.'], 'Choose, shape, repeat.', 'Changing the phrase completely each time while claiming to repeat it.', 'Record pitch order and rhythm using suitable notation or a clear diagram.',
   'What does pitch describe?', 'How high or low a musical sound is.', 'How could you create contrast using the same three notes?', 'Change their order, rhythm or direction while keeping within the chosen note set.'],
  ['Use a graphic score accurately', 'Represent musical choices using an explained visual system.',
   'A graphic score uses symbols, shapes or lines to represent sounds. A key explains meaning: a long line might mean a sustained sound, while dots mark short sounds. Time usually moves in an agreed direction. A useful score is consistent enough that another learner can interpret the planned idea.',
   'Notate a long sound followed by three short sounds.', ['Define a line as long and dots as short.', 'Place the line before three dots in the agreed reading direction.', 'Perform the sequence and check it matches the key.'], 'Symbols need shared meanings.', 'Changing what a symbol means halfway through without explanation.', 'Keep the key consistent or clearly mark a new instruction.',
   'What makes a graphic score readable by another performer?', 'A clear key and consistent organisation.', 'Why agree which direction represents time?', 'So performers know the intended order of the sounds.']
 ]],
 ['Ensemble and listening', [
  ['Layer an ostinato under a melody', 'Maintain a repeated part while hearing a different part.',
   'In layered music, one group can repeat an ostinato while another plays a melody. The repeated part should remain steady rather than follow every change in the melody. Rehearse separately before combining. Balance means listening so one part does not unintentionally overpower the other.',
   'Add a four-beat tapping ostinato under a short tune.', ['Practise the ostinato alone until stable.', 'Start the tune with a shared count-in.', 'Keep the ostinato unchanged and adjust volume to hear both parts.'], 'Keep your pattern; listen to the whole.', 'Copying the melody’s rhythm instead of maintaining the ostinato.', 'Rehearse the repeated pattern while another person speaks a contrasting rhythm.',
   'Must different layers always play the same rhythm?', 'No.', 'What should an ensemble do if the accompaniment hides the melody?', 'Reduce or rebalance its volume, or change instrumentation, so the intended parts can be heard.'],
  ['Describe musical evidence', 'Support a listening impression with a specific musical feature.',
   'A piece may seem energetic because of a quick tempo, repeated short notes or strong accents. Those are musical observations; “I like it” is a personal response. Both are valid, but an explanation needs a connection between the feature and the impression. Listeners may respond differently to the same feature.',
   'Explain why an extract might feel urgent.', ['Notice a fast pulse or repeated accented notes.', 'Describe the feature specifically.', 'Connect it to a sense of hurry without claiming every listener must agree.'], 'Feature plus effect.', 'Using a feeling word without identifying anything in the music.', 'Name tempo, dynamics, texture, pitch movement or rhythm as evidence.',
   'Is “the tempo is fast” an observation or a preference?', 'An observation.', 'Improve “It sounds calm” with musical evidence.', 'For example, “It sounds calm to me because the tempo is slow and the notes are softly sustained.”']
 ]]
]],
['pe', [
 ['Movement and performance', [
  ['Control changes of direction', 'Adjust speed and body or equipment position before turning.',
   'Changing direction safely requires control before the turn, not just speed afterwards. Use clear spaced markers and suitable walking, running or wheeling movement. Slow as needed, look towards the next route and avoid crossing another learner’s path. Adapt turns and surface conditions to the learner and equipment.',
   'Move through a gentle zigzag of markers.', ['Look ahead to the next marker.', 'Reduce speed before the turn.', 'Change direction within your safe space, then continue.'], 'Look, control, turn.', 'Trying to turn sharply at maximum speed.', 'Widen the route and practise slower controlled changes first.',
   'Why look ahead before a turn?', 'To plan the direction and check that the path is clear.', 'How can a zigzag task be adapted?', 'Increase marker spacing, reduce speed or use an accessible route and suitable equipment.'],
  ['Compose a movement sequence with contrast', 'Use changes in level, speed or direction intentionally.',
   'A sequence can become clearer through contrast: a slow reach may follow quicker travelling, or a high comfortable shape may contrast with a lower one. Use safe levels appropriate to the learner, without forcing extreme positions. Plan transitions so contrast does not become uncontrolled movement.',
   'Create a sequence showing a change from calm to energetic.', ['Choose a slow controlled opening.', 'Add a quicker but safe travelling section.', 'Finish with a deliberate steady shape.'], 'Contrast with control.', 'Increasing speed until the sequence becomes unsafe.', 'Use smaller movement or different direction as another form of contrast.',
   'Name a contrast other than loudness or speed.', 'Level, direction, shape or movement size.', 'Why rehearse transitions as well as individual actions?', 'The connections determine whether the whole sequence remains controlled and clear.']
 ]],
 ['Team decisions and reflection', [
  ['Create a passing option', 'Use movement and communication to support a teammate.',
   'In a small-sided game, the player without the ball can help by moving into visible space. A useful option has a safe passing route and a ready receiver. Avoid crowding the ball carrier. Adapt rules so all learners can contribute, rather than measuring success only by speed.',
   'A teammate has no clear passing route.', ['Scan for unoccupied safe space.', 'Move where the teammate can see you.', 'Signal readiness without demanding an unsafe pass.'], 'Be seen, be ready, make space.', 'Standing behind another player and calling louder.', 'Change position to make the route clearer.',
   'Can a player help without touching the ball?', 'Yes, by creating space or a passing option.', 'Why might two teammates moving to the same gap be unhelpful?', 'They may crowd the route and remove the clear option they intended to create.'],
  ['Use evidence in a performance review', 'Identify a specific strength and an achievable next step.',
   'A review should describe what happened, not label someone talented or untalented. “Four passes reached a ready receiver” gives evidence. A next step might be scanning before passing. Choose a manageable focus and compare later performance under similar conditions, while recognising that game situations vary.',
   'A learner sends accurate passes but often before the receiver is ready.', ['Recognise direction control as a strength.', 'Identify timing as the next focus.', 'Practise waiting for a clear ready signal.'], 'Evidence, strength, next step.', 'Giving only a score with no useful action.', 'Link the observation to one change the learner can practise.',
   'Why avoid judging ability from one attempt?', 'A single attempt can be affected by many temporary factors.', 'Give respectful feedback for a rushed turn.', '“You chose the route well; try slowing before the marker so the turn stays controlled.”']
 ]]
]],
['religious-studies', [
 ['Beliefs and interpretation', [
  ['Distinguish belief from historical description', 'Use careful language when describing a religious claim.',
   'Learning about religion involves describing what people believe as well as studying historical practices and sources. “Christians believe Jesus rose from the dead” reports a religious belief; it does not ask the learner to profess that belief. Use accurate respectful language and recognise differences within communities.',
   'Rewrite “Everyone believes the same thing about Jesus” carefully.', ['Recognise different religious and non-religious views.', 'Identify the particular Christian belief being discussed.', 'Attribute it clearly rather than presenting it as everyone’s view.'], 'Say whose belief you describe.', 'Treating description as a requirement to agree.', 'Explain that accurate learning and personal belief are different matters.',
   'Can people study a religion they do not follow?', 'Yes.', 'Why is “many Christians believe…” sometimes more careful than “everyone believes…”?', 'It identifies a community and avoids falsely including people with other beliefs.'],
  ['Compare interpretations of a story', 'Explain how a story can prompt more than one supported interpretation.',
   'A religious story may be understood through different questions: what it says about care, responsibility, trust or belonging. Compare interpretations by asking which details support each. Respect does not mean every interpretation fits every detail equally well; reasons and context still matter.',
   'Two readers see a helping story as about kindness and about crossing group boundaries.', ['Identify actions showing care.', 'Identify whether the helped person belongs to a different group.', 'Explain how both readings may be supported by different details.'], 'Different reading, stated reason.', 'Choosing an interpretation only because it sounds pleasing.', 'Connect the idea to details actually present in the story.',
   'What strengthens an interpretation?', 'Relevant evidence and a clear explanation.', 'Can two interpretations both be reasonable?', 'Yes, if each is supported and does not ignore important context or details.']
 ]],
 ['Community and ethical choices', [
  ['Understand a practice in context', 'Explain a purpose of communal worship without generalising to everyone.',
   'Communal worship can include prayer, music, readings or shared reflection, depending on the tradition and community. Participants may value expressing belief, learning together and belonging. Some worship privately or participate differently. Study a specific example before comparing it with another community’s practice.',
   'Explain why a community might gather for a shared reading.', ['Identify the reading as part of the practice.', 'Connect it with learning or reflecting on shared beliefs.', 'Recognise that individuals may experience it differently.'], 'Practice, purpose, variation.', 'Assuming attendance means every participant has identical thoughts.', 'Distinguish the shared activity from individual experience.',
   'Does all worship have to happen in a group?', 'No.', 'Why ask about a practice’s purpose rather than only listing visible actions?', 'Purpose helps explain its meaning to participants, beyond outward appearance.'],
  ['Reason about fairness and generosity', 'Give reasons for an ethical choice while considering different needs.',
   'Religious and non-religious worldviews can encourage fairness and generosity, though their explanations may differ. Equal sharing is sometimes fair, but needs may differ: someone without a pencil may need one more urgently than someone with several. Consider relevant circumstances and avoid assumptions about a person’s worth.',
   'A class has spare pencils and one learner has none.', ['Identify the need to participate.', 'Consider providing a pencil to the learner without one.', 'Explain that meeting a need can support fairness even if everyone does not receive an extra pencil.'], 'Fairness considers relevant need.', 'Assuming fair always means identical treatment in every circumstance.', 'Ask what allows each person to participate appropriately.',
   'Can generosity take a form other than money?', 'Yes: time, attention or practical support.', 'Why might two people support the same kind action for different reasons?', 'Their religious or non-religious beliefs and experiences may provide different motivations.']
 ]]
]],
['pshe', [
 ['Relationships and boundaries', [
  ['Respect changing consent', 'Recognise that permission can be withdrawn.',
   'Someone may agree to a game, photo or friendly contact and later change their mind. Respecting a boundary means stopping when asked, not arguing that the earlier yes lasts forever. Consent needs to be freely given. If someone pressures or threatens a child, a trusted adult should help.',
   'A friend first joins a tickling game, then says stop.', ['Stop immediately.', 'Give space and check they are comfortable.', 'Do not restart unless they freely choose a suitable interaction.'], 'A yes can change to no.', 'Treating earlier permission as permanent.', 'Check current willingness and respect a stop signal.',
   'Does friendship remove the right to say no?', 'No.', 'What should you do if someone ignores your request to stop?', 'Seek safety and tell a trusted adult; keep telling until you get help.'],
  ['Manage peer pressure', 'Use a safe response when a group urges an unwanted action.',
   'Peer pressure can involve teasing, promises of belonging or claims that everyone is doing something. Pause and consider safety and your own boundaries. A simple refusal, changing activity or seeking adult help can be appropriate. You do not need a perfect argument to refuse an unsafe or uncomfortable request.',
   'A group asks you to send an embarrassing photo of another child.', ['Do not share the image.', 'Say you are not comfortable and leave the interaction if needed.', 'Tell a trusted adult about the pressure.'], 'Pause, choose, get support.', 'Thinking staying in a group requires agreeing to every request.', 'Healthy friendships allow respectful refusal.',
   'Does “everyone does it” prove an action is safe or kind?', 'No.', 'Give a brief refusal that does not invite a long argument.', '“No, I am not sharing that,” followed by leaving or seeking adult support if necessary.']
 ]],
 ['Wellbeing and media', [
  ['Notice a helpful coping strategy', 'Reflect on whether a coping choice supports wellbeing.',
   'Coping strategies are ways of responding to difficulty. Talking to a trusted person, taking a safe break or breaking a task into parts may help. A strategy is not equally useful for everyone or every situation. If worry persists or interferes with daily life, seek trusted adult support rather than relying on self-help alone.',
   'A large homework task feels overwhelming.', ['Tell an adult how it feels.', 'Split the task into a small first step.', 'Try a short work period and review whether the plan helps.'], 'Notice, try, review, seek support.', 'Assuming one strategy must work because it helped a friend.', 'Evaluate your own needs with adult guidance and try an appropriate alternative.',
   'Is needing help a sign of failure?', 'No.', 'What should happen if worry keeps affecting sleep or daily activities?', 'Tell a trusted adult and seek appropriate support; persistent difficulties deserve attention.'],
  ['Question a persuasive image', 'Recognise that images may be selected or edited to influence a viewer.',
   'An image can be cropped, filtered or staged. Even an unedited photograph shows only a selected moment and angle. Advertisers and other creators may choose images to encourage a response. Ask who made it, why it was shared and what may be outside the frame. Avoid judging real people’s worth from edited appearances.',
   'An advert shows only the tidiest corner of a crowded room.', ['Notice what is visible.', 'Consider what the crop leaves out.', 'Avoid concluding that the entire room looks the same.'], 'A frame is a choice.', 'Assuming a photograph shows the whole situation.', 'Look for context and additional reliable information.',
   'Must an image be digitally edited to be selective?', 'No; framing and timing already select what is shown.', 'Why might an advert choose an unusually perfect-looking image?', 'To influence feelings or purchases; the image may not represent typical experience.']
 ]]
]]
];
export const batch04 = compileActivities('year-3', subjects);
