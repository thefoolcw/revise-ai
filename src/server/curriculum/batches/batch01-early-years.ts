import { compileActivities, type Subject } from '../authoredActivities';

/** Original adult-guided activities, not an exam-board specification.
 * Nursery: listening, play and concrete exploration. Reception: independent
 * explanation, symbol–sound connections, composition and simple enquiry.
 * Each tuple is authored content, not a year-substitution template.
 */
const nursery: Subject[] = [
['ey-comm', [
 ['Listening carefully', [
  ['Find the sound', 'Distinguish two familiar sounds by listening.',
   'An adult makes a quiet clap and then taps a wooden spoon on a bowl. Listen before looking. A clap is short and soft; the bowl may ring. Naming the object is less important than noticing how the sounds differ. Offer pointing or gesture as well as speech.',
   'The adult taps the bowl behind a screen. Which object made the sound?', ['Listen to both sounds with the objects visible.', 'Hide the objects and repeat the bowl sound.', 'Point to the bowl and uncover it to check.'],
   'Ears first, eyes next.', 'Guessing before the sound finishes.', 'Pause and replay the sound; let the child listen again.',
   'Which part of our body helps us hear?', 'Our ears.', 'Compare a clap with a gentle tap on a table. Describe one difference.', 'The clap may sound sharper and the table tap duller. Accept an accurate description of the actual sounds.'],
  ['One instruction at a time', 'Follow a short instruction containing an object and an action.',
   'A direction tells us what to do. Say “Put the bear on the chair” once, slowly. Give thinking time. On means resting on top, not underneath. Demonstrate only if needed, then try again with another toy. Use familiar objects and avoid treating a language difference as disobedience.',
   'Put the car in the box.', ['Find the car.', 'Find the box.', 'Place the car inside, not beside it.'], 'Listen, find, do.', 'Moving the first object without listening to the place word.', 'Repeat the complete short instruction and emphasise “in”.',
   'What does “in the box” mean?', 'Inside the box.', 'Put a spoon on a plate. Where should the spoon finish?', 'Resting on top of the plate.']
 ]],
 ['Talking together', [
  ['Take a talking turn', 'Listen and respond in a short shared conversation.',
   'Conversation goes back and forth. An adult describes a toy, then pauses so the child can add a word, gesture or sentence. A talking object can show whose turn it is. Listening does not require eye contact; responding to the idea is what matters.',
   'Adult: “My bus is blue.” Child: “Mine is red.”', ['Let the adult finish.', 'Notice the colour being discussed.', 'Add something about your own bus.'], 'Talk, pause, listen.', 'Thinking a louder voice wins a turn.', 'Use a pause or agreed signal instead of shouting.',
   'What can you do while someone else is speaking?', 'Listen and wait for a turn.', 'Your friend says “I have a dog.” Give a connected response.', 'For example, “What is its name?” or “I have a cat.”'],
  ['Describe a hidden toy', 'Use descriptive words to identify an object.',
   'Words such as soft, long and round help someone picture an object they cannot see. Start with a bag containing two safe, familiar toys. Describe a feature rather than just saying “that one”. Compare features with touch only if the child is comfortable.',
   'A soft bear and a hard toy car are in a bag. “It is soft and has ears.”', ['Feel or look at each toy.', 'Notice softness and ears.', 'Choose the bear and explain your clue.'], 'A clue tells something true.', 'Giving a clue shared by every object, such as “it is a toy”.', 'Add a distinguishing feature such as wheels or fur.',
   'Which word describes how a teddy feels?', 'Soft, fluffy or another accurate texture word.', 'Describe a ball without saying “ball”.', 'For example, “It is round and rolls.”']
 ]]
]],
['ey-literacy', [
 ['Sound play', [
  ['Hear a rhyme', 'Notice words with the same ending sound.',
   'Rhyming words sound alike at the end: cat and hat. Say them naturally and stretch the ending slightly. The first sound can change while the ending stays. This is a listening game, so there is no need to read letters or explain spelling.',
   'Do cat and hat rhyme?', ['Say cat.', 'Say hat.', 'Listen for the shared “at” ending.'], 'Same ending, rhyming friends.', 'Choosing words because their first sound is the same.', 'Compare the endings: cat and cup start alike but do not rhyme.',
   'Do sun and fun rhyme?', 'Yes: both end with the sound “un”.', 'Which rhymes with dog: log or duck?', 'Log; dog and log share their ending sound.'],
  ['Clap a name', 'Hear the beats in a spoken word.',
   'Some words have one spoken beat and others have more. Clap once for each syllable, not for each letter. Use the child’s own pronunciation of a familiar name. Begin with a clear two-beat word such as rabbit before longer words.',
   'Clap rabbit.', ['Say rabbit naturally.', 'Say rab-bit with two beats.', 'Clap twice.'], 'One clap for each spoken beat.', 'Clapping once for each letter.', 'Listen without showing written words.',
   'How many beats are in cat?', 'One.', 'Clap banana. How many claps?', 'Three: ba-na-na.']
 ]],
 ['Books and marks', [
  ['Find the beginning of a book', 'Handle a picture book and identify its cover.',
   'A book has a front cover, pages and a back cover. The cover often gives clues about the story. For an English-language book we usually turn pages from right to left as we read from front to back. Other writing systems may use a different direction.',
   'A cover shows a duck in rain. What could the story include?', ['Look at the cover picture.', 'Name the duck and rain.', 'Predict a wet adventure, then open the book to find out.'], 'Cover clues come first.', 'Treating a prediction as something that must be correct.', 'Explain that a prediction is an idea we check as we read.',
   'Where might you find a book’s title?', 'On its cover.', 'Show an adult how to turn one page gently.', 'Hold near the edge and turn one page without pulling or tearing.'],
  ['Marks carry meaning', 'Explain the meaning of a self-made mark.',
   'Drawing, scribbling and early writing let us record an idea. Offer thick crayons and large paper. Ask “Tell me about your marks” rather than guessing. An adult can write the child’s spoken words alongside the marks, showing how speech can be recorded.',
   'A child draws a loop and says it is a shopping bag.', ['Make a mark.', 'Say what it represents.', 'Ask an adult to record “bag” beside it.'], 'Make a mark, tell its story.', 'Demanding correct letters before a child can explore marks.', 'Value the intended message and model writing without replacing the child’s work.',
   'Can a drawing tell someone an idea?', 'Yes.', 'Make a pretend shopping list and explain two marks.', 'Accept marks intentionally representing two items, such as milk and apples.']
 ]]
]],
['ey-maths', [
 ['Small quantities', [
  ['Count three treasures', 'Count up to three objects with one number per object.',
   'Counting tells how many objects are in a group. Touch or move each large object once while saying one number. The last number tells the total. Use large blocks, not small choking hazards. An adult supervises and models slowly.',
   'Three blocks need counting.', ['Touch the first: one.', 'Touch the second: two.', 'Touch the third: three; say “three blocks altogether”.'], 'One touch, one number.', 'Counting the same block twice.', 'Move each counted block to a new row.',
   'What does the last counting number tell us?', 'How many there are altogether.', 'Count two cups, then add one. How many now?', 'Three; count all three cups once.'],
  ['Which group has more?', 'Compare two small groups by matching objects.',
   'More means a greater number, not a longer-looking row. Match one toy plate to each bear. If a bear has no plate, there are more bears than plates. Matching helps us compare before we can confidently count larger groups.',
   'There are three bears and two plates.', ['Give each of two bears one plate.', 'Notice one bear has no plate.', 'Say there are more bears.'], 'Match pairs; look for leftovers.', 'Choosing the group spread over more space.', 'Move the objects into matching pairs.',
   'What does “the same number” mean?', 'Every object in one group can have one partner in the other, with none left.', 'Compare two cars with two blocks spread far apart.', 'The groups have the same number: two each.']
 ]],
 ['Shape and pattern', [
  ['Roll or stack?', 'Explore curved and flat surfaces using safe solid objects.',
   'A ball has a curved surface and rolls easily. A block has flat faces and can stand steadily on a flat face. Try a gentle push on a clear floor. Some objects, such as a cylinder, can both roll and stand depending on how they are placed.',
   'Can a ball sit steadily on top of another ball?', ['Try with adult help.', 'Notice the curved surfaces slip.', 'Compare two flat-faced blocks.'], 'Flat faces help stacks stay.', 'Assuming every round-looking object can only roll.', 'Test different positions of a cylinder, such as a sealed cardboard tube.',
   'Which usually stacks more steadily: blocks or balls?', 'Blocks on their flat faces.', 'Place a cylinder on its side, then on its end. What changes?', 'It rolls on its curved side and can stand on a flat end.'],
  ['Copy an alternating pattern', 'Copy and continue a repeating two-part pattern.',
   'A pattern repeats in a predictable order. Put out red, blue, red, blue blocks. Say the colours while pointing. The repeating unit is red-blue, not just the last colour. A movement pattern works too: clap, tap, clap, tap.',
   'Red, blue, red, blue, red: what comes next?', ['Say the sequence.', 'Find red-blue repeating.', 'Put blue after the last red.'], 'Find the bit that repeats.', 'Choosing a favourite colour instead of following the order.', 'Return to the first pair and repeat it aloud.',
   'What repeats in clap, tap, clap, tap?', 'Clap-tap.', 'Continue stomp, clap, stomp, clap with two actions.', 'Stomp, then clap.']
 ]]
]],
['ey-world', [
 ['Living things nearby', [
  ['Care for a seed', 'Observe a seed and describe basic plant care.',
   'A seed can grow into a plant. Place a bean seed in a pot with an adult; seeds are not for eating in this activity. Keep compost damp rather than flooded. Once shoots appear, give the plant light. Growth takes days, so changes may not be visible immediately.',
   'The compost feels dry. What should we do?', ['Touch the surface with adult guidance.', 'Add a little water.', 'Check again tomorrow rather than keep pouring.'], 'Damp, not drowned.', 'Expecting a plant to appear after one watering.', 'Return over several days and record changes with drawings.',
   'What do we add when the compost is dry?', 'A little water.', 'Name one change you might see as a seed grows.', 'A root or shoot may appear, followed by leaves.'],
  ['Observe a small animal safely', 'Notice an animal’s features without harming it.',
   'Watch a snail or another local animal in its habitat with an adult. Describe what you can see: a shell, movement or feelers. We observe gently rather than poke or collect unknown creatures. Wash hands after outdoor exploration.',
   'A snail moves beneath a leaf.', ['Watch without touching.', 'Describe the shell and slow movement.', 'Leave the snail where it lives.'], 'Look closely, leave safely.', 'Assuming an animal is a toy to pick up.', 'Keep a respectful distance and let an adult guide observation.',
   'Where should we leave an animal we find?', 'In its habitat, unless an adult identifies a safety concern.', 'Name a visible feature of a snail.', 'A shell, soft body or feelers.']
 ]],
 ['Weather and materials', [
  ['Describe today’s weather', 'Use observation to describe current weather.',
   'Weather is what the air and sky are like now. Look through a window with an adult. Is rain falling? Are leaves moving in wind? Cloudy and rainy are not the same: clouds can be present without rain. Choose clothing using both weather and temperature.',
   'Clouds fill the sky but the ground is dry.', ['Look for falling rain.', 'Notice the clouds.', 'Describe it as cloudy, not necessarily rainy.'], 'Look now; say what you see.', 'Calling every cloudy day rainy.', 'Look for actual falling rain or fresh wetness.',
   'What can moving leaves tell us?', 'There may be wind.', 'What might help keep us dry in rain?', 'A suitable waterproof coat, with adult help.'],
  ['Soft, hard, smooth and rough', 'Describe and compare safe materials by touch.',
   'An object is what a thing is; its material is what it is made from. A wooden spoon and fabric cloth feel different. Use safe objects with no sharp edges. Texture words describe surfaces, while soft and hard describe how easily something gives under pressure.',
   'Compare a cloth and a wooden block.', ['Gently touch each.', 'Squeeze the cloth, then press the block.', 'Describe the cloth as soft and the block as hard.'], 'Touch gently; choose a describing word.', 'Thinking all objects of one colour feel the same.', 'Compare colour separately from texture.',
   'What is a wooden spoon made from?', 'Wood.', 'Which would usually be more comfortable as a cushion: fabric or a hard block?', 'Soft fabric with suitable filling; it gives under gentle pressure.']
 ]]
]],
['ey-pse', [
 ['Feelings and support', [
  ['Name a feeling', 'Use a word, picture or gesture to communicate a feeling.',
   'People can feel happy, sad, worried or cross. Feelings can change and all feelings are allowed. Faces give clues but do not tell us everything; ask rather than assume. An adult can offer feeling pictures and accept pointing as communication.',
   'A tower falls and a child frowns.', ['Notice what happened.', 'Ask “Are you feeling cross or something else?”', 'Accept the child’s answer and offer support.'], 'Name it; share it.', 'Saying someone must be happy because they smile.', 'Ask how they feel instead of relying only on a face.',
   'Can two people feel differently about the same event?', 'Yes.', 'You feel worried. Show one way to tell a trusted adult.', 'Say “I feel worried”, point to a feeling picture, or use an agreed signal.'],
  ['Ask for help', 'Identify a trusted adult and practise asking for support.',
   'We do not have to solve every problem alone. A trusted adult at home or nursery can help when something hurts, feels unsafe or is difficult. Practise a clear phrase and a gesture. If the first adult does not help, tell another trusted adult.',
   'A coat zip is stuck.', ['Stop pulling hard.', 'Find a trusted adult.', 'Say or signal “Please help with my zip”.'], 'Stop, tell, get help.', 'Keeping a worrying problem secret because someone said to.', 'Tell a trusted adult about anything that feels unsafe or upsetting.',
   'Who could help at nursery?', 'A familiar nursery practitioner or another trusted supervising adult.', 'What could you do if the first adult does not hear you?', 'Try again or tell another trusted adult.']
 ]],
 ['Playing with others', [
  ['Wait for a turn', 'Use a supported strategy for sharing a resource.',
   'Two people may want the same toy. Taking turns lets both use it without grabbing. Adults should make waiting manageable, using a short timer or a clear finishing point and another activity while waiting. A child does not need to surrender a toy instantly.',
   'Two children want the same truck.', ['Ask for a turn.', 'Agree a short finishing point with adult help.', 'Pass the truck when the turn ends.'], 'Ask, wait, swap.', 'Grabbing because waiting feels difficult.', 'Ask an adult to help make a fair plan.',
   'What can you say instead of grabbing?', '“Can I have a turn when you finish?”', 'Suggest something to do while waiting.', 'Choose another toy or help build the road, with agreement.'],
  ['Care for shared things', 'Help return resources to their places.',
   'Putting things away keeps paths clear and helps the next person find them. Picture labels can show where resources belong. Tidying is a shared job, not a punishment. Adults model safe carrying and help with heavy objects.',
   'Blocks lie across a walkway.', ['Stop running through the area.', 'Carry a few blocks safely.', 'Place them in the labelled block basket.'], 'Use it, care for it, return it.', 'Carrying too many blocks and dropping them.', 'Take small loads and ask for help with heavy items.',
   'Why keep a walkway clear?', 'So people can move safely without tripping.', 'Where should a picture book go after reading?', 'In the agreed book space, handled gently.']
 ]]
]],
['ey-phys', [
 ['Moving safely', [
  ['Start and stop', 'Respond to a movement signal within a clear space.',
   'Moving games develop control as well as speed. Clear a flat space and agree a stop signal. Children may walk, wheel or move in a way suited to them. On the signal, stop safely rather than suddenly bumping into others.',
   'Move slowly until an adult holds up a red card.', ['Check the space.', 'Move at a controlled pace.', 'Stop when the agreed card appears.'], 'Space, signal, stop.', 'Looking only at the floor and missing the signal.', 'Use both an audible and visible signal when helpful.',
   'What should we check before moving?', 'That the space is clear and safe.', 'Why should we avoid racing close to another child?', 'We need room to stop without colliding.'],
  ['Balance along a path', 'Adjust position to move along a broad floor path.',
   'Balance means controlling our body or equipment while staying steady. Use a broad tape path on the floor, never a high beam for this activity. Move slowly and choose suitable adult support. Arms, posture and speed can help balance.',
   'Follow a straight tape path.', ['Look ahead at the path.', 'Move slowly.', 'Pause and reset if you move off it.'], 'Slow and steady.', 'Thinking stepping off the path means failure.', 'Widen the path or offer support; practise at a comfortable level.',
   'Does slowing down often help control?', 'Yes.', 'How could we make the path easier?', 'Make it wider or shorter and offer suitable support.']
 ]],
 ['Hands and self-care', [
  ['Pinch and place', 'Practise controlled hand movements with large safe objects.',
   'Finger control develops through play. Move large fabric pieces into a tray using fingers or child-safe tongs. An adult chooses objects too large to swallow and stays nearby. The aim is controlled release, not a race.',
   'Move a large fabric square into a bowl.', ['Open fingers or tongs.', 'Grip the fabric gently.', 'Move over the bowl and release.'], 'Open, grip, move, let go.', 'Squeezing tightly without releasing over the target.', 'Practise opening and closing slowly before moving objects.',
   'What must you do to let the fabric drop?', 'Open the grip.', 'Why use a wide bowl at first?', 'It is an easier target while control develops.'],
  ['Wash hands thoroughly', 'Follow a supported handwashing sequence.',
   'Soap and water remove dirt and many germs. Use running water at a safe temperature with adult help. Wet hands, use soap, rub palms, backs, between fingers and around thumbs for at least twenty seconds, rinse and dry. Wash before food and after using the toilet.',
   'Hands are dirty after outdoor play.', ['Wet and soap hands.', 'Rub all surfaces for at least twenty seconds.', 'Rinse and dry with a clean towel.'], 'Wet, soap, rub, rinse, dry.', 'Rinsing quickly without soap.', 'Use soap and rub all hand surfaces before rinsing.',
   'Do we wash only the palms?', 'No: backs, between fingers and thumbs too.', 'Name a time when hands need washing.', 'Before eating, after the toilet, or after dirty outdoor play.']
 ]]
]],
['ey-arts', [
 ['Colour and mark-making', [
  ['Explore a tool’s marks', 'Compare marks made by two different art tools.',
   'A thick crayon and a sponge make different marks. Put washable, child-safe materials on a protected surface. Try pressing, dragging and dabbing. There is no single correct picture: the learning is in noticing how a movement changes the mark.',
   'Compare a dragged crayon with a dabbed sponge.', ['Drag the crayon across paper.', 'Dab the sponge once.', 'Describe the line and patch.'], 'Move the tool; watch the mark.', 'Judging every mark by whether it looks like a real object.', 'Ask how it was made and what the child notices.',
   'Which movement often makes a line?', 'Dragging a crayon or brush.', 'How could you make separate dots?', 'Lift the tool between short touches or dabs.'],
  ['Mix two paint colours', 'Observe a colour change when paints are mixed.',
   'Use small amounts of washable red and yellow paint. Mix them in a tray and watch orange appear. Exact shades depend on the paints and amounts. Paint mixing is different from mixing coloured light. The child describes what actually happens.',
   'Mix a little red paint into yellow.', ['Look at the starting colours.', 'Stir them together.', 'Compare the new orange with each starting colour.'], 'Two paints, one new mixture.', 'Expecting all paints to make exactly the same shade.', 'Compare your mixture rather than insisting on a particular shade.',
   'Which two paints did we mix?', 'Red and yellow.', 'What colour would you usually expect from red and yellow paint?', 'Orange, though the shade depends on the paints.']
 ]],
 ['Music and imagination', [
  ['Copy a short rhythm', 'Repeat a simple sequence of sounds and silences.',
   'Rhythm is a pattern of sounds in time. An adult claps twice, pauses, then invites the child to echo. Start slowly. A child may tap, vocalise or use an accessible instrument. Listening to the silence matters as much as making the sounds.',
   'Adult claps: clap, clap, pause.', ['Listen to the whole pattern.', 'Wait for your turn.', 'Copy two claps and then stop.'], 'Listen, echo, leave a space.', 'Clapping continuously instead of copying the pattern.', 'Use a shorter pattern and show a clear stop gesture.',
   'Is a pause part of a rhythm?', 'Yes.', 'Copy one tap followed by two quick taps.', 'An echo with one separate tap and then two closer taps; allow developmentally appropriate timing.'],
  ['Make-believe with an object', 'Use an object to represent something in pretend play.',
   'In pretend play one object can stand for another. A large block might be a phone or a loaf of bread. Explain the pretend meaning to a partner so they can join in. Pretending is different from claiming an object really has changed.',
   'A block becomes a pretend phone.', ['Say “This is my pretend phone”.', 'Act out answering it.', 'Let a partner respond to the pretend conversation.'], 'Pretend it; show it; share it.', 'Correcting imaginative play because a block is not a real phone.', 'Acknowledge the real object and join the agreed pretend story.',
   'Does a pretend phone need to work like a real phone?', 'No.', 'Use a scarf as something in a pretend story.', 'For example, a river, blanket or superhero cape used safely with adult supervision.']
 ]]
]]
];

const reception: Subject[] = [
['ey-comm', [
 ['Listening and explaining', [
  ['Follow two connected directions', 'Remember and carry out two linked actions in order.',
   'Some instructions have two parts joined by “then”. Repeat the actions in your own words before starting. Use familiar place words, then gradually introduce behind or beside. The adult checks understanding and allows extra processing time rather than repeatedly adding words.',
   'Put the bear beside the box, then bring the cup.', ['Say “bear beside, then cup”.', 'Place the bear next to the box.', 'Bring the cup after the first action.'], 'First, then.', 'Doing the last action first because it is easiest to remember.', 'Rehearse both actions in order and use picture cues if needed.',
   'What does “then” tell us?', 'Which action comes next.', 'Explain the difference between in and beside a box.', 'In means inside; beside means next to, outside it.'],
  ['Explain how you know', 'Give a reason using an observed clue.',
   'An explanation connects an idea to evidence. “The path is wet because it rained” gives a possible cause, but a hose could also wet it. Look for additional clues. Adults model “I think ... because ...” and welcome more than one sensible possibility.',
   'A coat drips and rain is falling outside. Why is it wet?', ['Notice the dripping coat.', 'Notice the rain.', 'Explain that rain probably made the coat wet.'], 'An idea plus a clue.', 'Treating any guess as certain.', 'Use “might” when evidence does not establish one answer.',
   'Which word often introduces a reason?', 'Because.', 'The floor is wet near a tipped cup. Suggest a cause and a clue.', 'Water may have spilled from the cup; the tipped cup is the clue.']
 ]],
 ['Story talk', [
  ['Retell in order', 'Retell a short event using beginning, middle and end.',
   'A retelling keeps the main events in their original order. Hear a short story: a child plants a seed, waters it, and later sees a shoot. Use three drawings as prompts. Include what changed, not just a list of objects in the pictures.',
   'Retell the seed story.', ['First the child plants a seed.', 'Next the child waters and cares for it.', 'Later a shoot appears.'], 'First, next, finally.', 'Putting the shoot before the planting.', 'Move the picture cards into event order and retell again.',
   'Which happens first: planting or seeing a shoot?', 'Planting.', 'Retell getting ready for a rainy walk in three steps.', 'For example: check the weather, put on a coat, go outside with an adult.'],
  ['Ask a useful question', 'Choose a question that helps find missing information.',
   'Questions help us learn what we do not know. Who asks about a person; where asks about a place; why asks for a reason. Listen to the answer before asking again. Role-play a lost toy problem using precise questions.',
   'A friend says “I lost my bear.” What question helps you search?', ['Notice that the place is missing.', 'Ask “Where did you last see it?”', 'Use the answer to decide where to look.'], 'Choose the question for the gap.', 'Repeating a question after it has already been answered.', 'Say back the answer and ask for a different missing detail.',
   'Which question word asks about a person?', 'Who.', 'Ask a question to find the reason someone wears boots.', '“Why are you wearing boots?”']
 ]]
]],
['ey-literacy', [
 ['Sound to word', [
  ['Blend a simple word', 'Blend three taught phonemes to read a regular word.',
   'Letters can represent speech sounds. Once s, a and t have been taught in the child’s phonics programme, point to each and say its pure sound without adding “uh”. Blend the sounds smoothly to read sat. Practise only with correspondences already taught.',
   'Read s-a-t.', ['Point and say /s/, /a/, /t/.', 'Join the sounds without a long pause.', 'Say sat and use it in “The cat sat”.'], 'Say the sounds; slide them together.', 'Using letter names instead of sounds for blending.', 'Model pure phonemes and keep the final consonant short.',
   'Which word is made by /m/ /a/ /t/?', 'Mat, once these sounds have been taught.', 'Blend /p/ /i/ /n/.', 'Pin. Use only if p, i and n are already taught.'],
  ['Segment to spell', 'Hear the separate phonemes in a regular three-sound word.',
   'Spelling reverses blending: say a word, hear its sounds, then choose taught letters. For map, stretch the spoken word and count /m/, /a/, /p/. Use letter tiles if handwriting makes the task difficult. Check by blending the completed word.',
   'Spell map with letter tiles.', ['Say map.', 'Identify /m/, /a/, /p/ in order.', 'Choose m, a, p and blend to check.'], 'Say, stretch, select, check.', 'Choosing one letter for the whole word.', 'Use one counter per phoneme before selecting letters.',
   'How many phonemes are in map?', 'Three.', 'Segment sun into sounds.', '/s/, /u/, /n/: three sounds.']
 ]],
 ['Understanding and recording', [
  ['Use story evidence', 'Explain a character’s likely feeling using a story event.',
   'A story may show feelings without naming them. In our short story, Mia loses her favourite toy, searches under the bed and asks for help. Worried is a reasonable suggestion because the toy matters to her. Different interpretations can be valid when supported by the story.',
   'How might Mia feel when she cannot find her toy?', ['Recall that it is her favourite toy.', 'Suggest worried or sad.', 'Explain the connection to losing it.'], 'Feeling plus story clue.', 'Inventing an event that was not in the story.', 'Point to something actually heard or seen in the story.',
   'What did Mia lose?', 'Her favourite toy.', 'Mia finds the toy and hugs it. How might she feel now, and why?', 'Happy or relieved because she has found it; accept other supported feelings.'],
  ['Write a short message', 'Record a simple sentence using taught sounds and words.',
   'A message tells a reader something. Rehearse “A cat sat” aloud, count the words and write with taught correspondences. Use a capital at the start, spaces between words and a full stop at the end. An adult supports words beyond the child’s current phonics knowledge.',
   'Write “A cat sat.”', ['Say the whole sentence.', 'Write each word with a space after it.', 'Reread and add a full stop.'], 'Say it, write it, read it.', 'Running all words together.', 'Point to each spoken word and leave a visible gap between written words.',
   'Why do we leave spaces?', 'They help a reader see separate words.', 'Where does the full stop belong in “A cat sat”?', 'After sat, at the end of the sentence.']
 ]]
]],
['ey-maths', [
 ['Composition within five', [
  ['See a small quantity', 'Recognise small quantities without counting every item.',
   'Subitising means seeing how many in a small group without counting one by one. Show up to three dots briefly, then build towards five using familiar arrangements. Ask how the child saw the group: four can look like two and two. Do not demand speed.',
   'Four dots are arranged as two pairs.', ['Notice one pair.', 'Notice another pair.', 'Say two and two make four.'], 'See parts; know the whole.', 'Guessing from how much space the dots cover.', 'Rearrange the same dots and check that the number stays the same.',
   'What is two and two altogether?', 'Four.', 'Five dots look like three and two. How many altogether?', 'Five; three and two compose five.'],
  ['Find number partners', 'Find two parts that compose five.',
   'A whole quantity can be split into parts. Put five large counters on a mat, slide two to one side and three to the other. The total remains five because none were added or removed. Explore zero and five as well as one and four.',
   'Five counters: two are visible and the rest are under a cup.', ['Recall the whole is five.', 'Count on from two: three, four, five.', 'Three counters are hidden.'], 'Parts together make the whole.', 'Treating the hidden part as the whole amount.', 'Show all five, split them again and name each part.',
   'What joins one to make five?', 'Four.', 'Find two different pairs making five.', 'For example, two and three; one and four. Zero and five is also valid.']
 ]],
 ['Pattern and measurement', [
  ['Repeat a three-part unit', 'Continue a pattern by identifying its complete repeating unit.',
   'More complex patterns may repeat red-red-blue rather than alternating colours. Place two complete units before asking for a continuation. Mark each whole unit with a space, then remove the spaces. A repeated unit must recur in the same order.',
   'Red, red, blue, red, red, blue: what comes next?', ['Group the sequence as red-red-blue twice.', 'Start another unit.', 'Place red, then red, then blue.'], 'Circle the whole repeat.', 'Assuming every pattern alternates two colours.', 'Say the entire three-item unit before continuing.',
   'What repeats in clap-clap-tap, clap-clap-tap?', 'Clap-clap-tap.', 'Continue red-red-blue-red-red with one colour.', 'Blue, completing the second unit.'],
  ['Compare lengths fairly', 'Compare lengths by aligning starting points.',
   'To compare two ribbons, straighten them and align one end. The ribbon reaching farther is longer. If starting points differ, position can fool us. Use descriptive comparisons before formal units; do not stretch elastic materials because their length changes.',
   'Two ribbons start at different places. Which is longer?', ['Lay them straight.', 'Line up their left ends.', 'Compare their right ends.'], 'Same start, compare the end.', 'Calling the ribbon farther to the right longer without lining up ends.', 'Align one end and compare again.',
   'What must line up for a fair comparison?', 'One end of each object.', 'Two aligned strips finish at the same point. Compare their lengths.', 'They are the same length.']
 ]]
]],
['ey-world', [
 ['Change over time', [
  ['Record plant growth', 'Compare observations of a plant on different days.',
   'An observation records what we actually notice. Draw the same plant on day one and a week later, using the same viewpoint. Compare number of leaves and height with a nearby marker. A plant may grow slowly; a drawing should show what is there, not what we hoped would happen.',
   'First drawing: two leaves. Later drawing: four leaves.', ['Count leaves in each drawing.', 'Compare two with four.', 'Describe two more leaves, without claiming every plant grows at that rate.'], 'Look, record, compare.', 'Adding imagined flowers to an observation drawing.', 'Keep imaginary pictures separate from observation records.',
   'Why label drawings with dates?', 'To know when each observation was made.', 'A plant has three leaves on both dates. What should you record?', 'No change in visible leaf number, even if another feature changed.'],
  ['Talk about past and present', 'Use evidence to describe how an everyday object has changed.',
   'Past means before now; present means now. Compare a photograph of an older telephone with a current phone. Both can help people communicate, but the shapes and functions differ. One photograph does not show every phone used in the past.',
   'An old phone has a cord and dial; a current mobile has a screen.', ['Name what is visible in each picture.', 'Describe one difference.', 'Describe their shared communication purpose.'], 'Before now; now.', 'Thinking every old object is broken or useless.', 'Compare features and uses rather than judging age.',
   'Does “past” mean now or before now?', 'Before now.', 'Give one similarity between the two phones.', 'Both can be used to talk to someone at a distance.']
 ]],
 ['Investigating places and materials', [
  ['Draw a route map', 'Represent a familiar route using a simple map.',
   'A map shows places using marks or symbols rather than a full picture of every detail. With an adult, map a safe route from the classroom door to the book corner. Keep landmarks in order. A key explains a symbol such as a square for a table.',
   'Door, table, book corner lie along a route.', ['Mark the door.', 'Add the table between door and book corner.', 'Draw a route line and explain the symbols.'], 'Places, symbols, route.', 'Drawing beautiful objects but omitting where they are relative to each other.', 'Place landmarks in the correct order before decorating.',
   'What does a map key explain?', 'What the symbols mean.', 'Why is a landmark helpful on a route?', 'It helps us recognise where we are or where to turn.'],
  ['Test a waterproof cover', 'Compare materials using a simple fair test.',
   'Waterproof material resists water passing through. Put equal-sized paper and plastic pieces over separate empty cups with adult help. Add the same small amount of water to each and wait the same time. Look underneath. Results describe these samples, not every kind of paper or plastic.',
   'Which sample protects the cup from water?', ['Use the same amount of water.', 'Wait equally long.', 'Compare whether water reached each cup.'], 'Same test; change one material.', 'Pouring much more water on one sample.', 'Keep water amount and waiting time the same.',
   'What does waterproof mean here?', 'Water does not pass through the tested material.', 'Why use the same amount of water?', 'So the comparison is fairer and material is the main difference.']
 ]]
]],
['ey-pse', [
 ['Managing feelings', [
  ['Choose a calming strategy', 'Practise a safe way to respond to a strong feeling.',
   'Feeling angry is allowed; hurting someone is not. With a trusted adult, recognise a body clue such as tight hands. Try stepping to a safe quiet place or taking comfortable slow breaths. Practise when calm and choose what helps this child rather than insisting one technique works for everyone.',
   'A game feels frustrating.', ['Notice tense hands.', 'Pause and tell an adult.', 'Choose a short quiet break, then decide whether to return.'], 'Notice, pause, choose.', 'Thinking calming down means the feeling was wrong.', 'Validate the feeling while setting a safe boundary for actions.',
   'Are feelings the same as actions?', 'No; we can feel angry and choose not to hit.', 'Suggest a safe response when a tower falls.', 'Ask for help, take a break, or rebuild when ready.'],
  ['Keep trying with a new plan', 'Respond to a manageable challenge by changing strategy.',
   'Persistence is not doing the same unsuccessful thing forever. Set a small goal, try, notice what happened and adjust with help. Rest is allowed. For a falling tower, a wider base may work better than simply adding more blocks to the top.',
   'A tall narrow tower keeps falling.', ['Notice the narrow base.', 'Try more blocks at the bottom.', 'Build slowly and compare stability.'], 'Try, notice, change.', 'Calling yourself bad at building after one collapse.', 'Describe the strategy, not the child’s worth: “This base needs changing”.',
   'Can asking for help be part of persistence?', 'Yes.', 'A puzzle piece will not fit. What can you try?', 'Check its shape, turn it gently or look for another place; do not force it.']
 ]],
 ['Cooperation and boundaries', [
  ['Solve a shared-play problem', 'Agree a plan that considers two people’s needs.',
   'Cooperation means listening to each person and finding an acceptable plan. If two children want different roles, name both wishes without blame. Offer alternatives such as taking turns or adding another role. An adult supports negotiation and checks that neither child is pressured.',
   'Both children want to drive the pretend bus.', ['Hear both wishes.', 'Suggest taking turns on different journeys.', 'Agree when the roles will swap.'], 'Two voices, one agreed plan.', 'Letting the louder person always decide.', 'Give each child space to speak and check agreement.',
   'Must everyone want exactly the same thing to cooperate?', 'No.', 'Suggest a fair alternative to grabbing a shared resource.', 'Agree turns or choose another resource together, with adult help if needed.'],
  ['Respect a clear no', 'Recognise personal boundaries and seek help when needed.',
   'People can choose whether to join a game or have a hug. Ask first and respect a no. Necessary care should be explained by a trusted adult. If a touch, request or secret makes a child uncomfortable or unsafe, they can tell a trusted adult and keep telling until helped.',
   'You ask for a hug and your friend says no.', ['Stop and give space.', 'Accept the answer without teasing.', 'Offer a wave if your friend wants one.'], 'Ask; listen; respect.', 'Thinking a friend must agree to a hug.', 'Friendship does not remove the right to say no.',
   'What should you do when a friend says stop in a game?', 'Stop and check they are comfortable.', 'Who can help if someone ignores your boundary?', 'A trusted adult; tell another if the first does not help.']
 ]]
]],
['ey-phys', [
 ['Coordinated movement', [
  ['Aim an underarm throw', 'Coordinate a controlled throw towards a nearby target.',
   'Use a soft large beanbag and a clear supervised space. Face a wide floor target, bring the throwing arm gently back, swing forward and release towards it. Adapt posture or equipment for the child. Accuracy develops through adjusting direction and force, not throwing as hard as possible.',
   'The beanbag lands beyond the hoop.', ['Notice where it landed.', 'Reduce the force.', 'Try again from the same starting place.'], 'Face, swing, release.', 'Increasing force whenever a throw misses.', 'Compare the miss: too far needs less force; direction may need adjustment.',
   'What could help if the beanbag goes too far?', 'Use less force.', 'How can we make the target task easier?', 'Use a larger target or shorten the distance.'],
  ['Link movements in sequence', 'Remember and perform a short controlled movement sequence.',
   'A movement sequence joins actions in an order. Choose three accessible actions such as stretch, turn and freeze. Rehearse them separately, then connect them. Keep enough space and turn slowly. Control and expression matter more than copying one body shape exactly.',
   'Perform stretch, turn, freeze.', ['Stretch comfortably.', 'Turn slowly in a clear space.', 'Hold a steady finish.'], 'Start, link, finish.', 'Rushing the turn and losing control.', 'Slow the sequence and practise the transition.',
   'What does a freeze show?', 'A controlled pause or finish.', 'Design a three-action sequence with a clear ending.', 'For example, reach, step, hold; adapt actions to the child’s movement needs.']
 ]],
 ['Tool control and health', [
  ['Cut along a broad path', 'Use child-safe scissors with adult guidance.',
   'An adult checks readiness and chooses suitable safety scissors, including adapted scissors if needed. Sit or stand securely at a table. Keep fingers away from the blades and cut away from the body. Turn the paper gradually while making short controlled snips. Carry scissors only as directed by an adult.',
   'Cut a broad straight line on paper.', ['Position hands safely with adult support.', 'Open and close scissors in small snips.', 'Move the paper forward while keeping fingers clear.'], 'Small snips, safe fingers.', 'Trying to cut quickly with fingers in front of the blades.', 'Stop, reposition with adult help, and use slow short snips.',
   'Should fingers be in the cutting path?', 'No.', 'Why start with a broad straight line?', 'It allows practice of control before narrow lines or curves.'],
  ['Notice rest and activity needs', 'Recognise that bodies need movement, rest, food and water.',
   'After active play, breathing and heartbeat often become faster. Rest allows them to settle. Water supports hydration, and varied food provides energy and nutrients. Body needs differ; do not compare speed, body shape or food choices as measures of worth. Ask an adult if feeling unwell.',
   'After a movement game you feel hot and thirsty.', ['Pause in a safe place.', 'Tell the supervising adult.', 'Rest and have water as appropriate.'], 'Move, notice, care.', 'Ignoring discomfort to keep up with others.', 'Pause and ask for support; activity should be adapted to the child.',
   'Name one thing bodies need besides activity.', 'Rest, water or suitable food.', 'What should you do if you feel dizzy during play?', 'Stop safely and tell a trusted adult immediately.']
 ]]
]],
['ey-arts', [
 ['Design choices', [
  ['Mix a lighter shade', 'Observe how adding white changes a paint colour.',
   'Mix a small amount of white into blue paint. The mixture usually becomes a lighter blue, called a tint. Add white gradually and compare each sample side by side. This differs from simply adding water, which thins paint and may let more paper show through.',
   'Make a pale blue sky colour.', ['Start with blue paint.', 'Mix in a little white.', 'Add more white if a lighter tint is wanted.'], 'White makes a tint lighter.', 'Assuming water and white paint have the same effect.', 'Compare a watered sample with one containing white.',
   'What usually happens when white is added to blue paint?', 'It becomes a lighter blue.', 'How could you keep a record of three tints?', 'Paint three labelled swatches using increasing amounts of white.'],
  ['Build and improve a model', 'Choose a joining method and revise a simple design.',
   'A model is a made representation, such as a bridge for a toy. Explore safe cardboard and tape. Overlap pieces so tape has enough surface to hold, then test with a light toy. If the deck bends, add a support underneath rather than only decorating it.',
   'A cardboard bridge bends in the middle.', ['Test gently with a light toy.', 'Notice where it bends.', 'Add a central support and retest.'], 'Make, test, improve.', 'Treating decoration as a solution to a weak joint.', 'Strengthen the joint or support before adding decoration.',
   'Why test a model?', 'To see whether it works for its purpose.', 'What might help a long unsupported cardboard deck?', 'A support under the middle or a stronger folded structure.']
 ]],
 ['Performance and expression', [
  ['Keep a steady beat', 'Maintain an even pulse while listening to a short song.',
   'A beat is a regular pulse, like evenly spaced footsteps. A rhythm can place different patterns over that beat. Tap an even pulse with an adult while listening to a familiar song. Keep taps equally spaced rather than copying every syllable.',
   'Tap four evenly spaced beats while an adult speaks a varied rhythm.', ['Listen for the adult’s steady pulse.', 'Tap once on each pulse.', 'Keep spacing even while the spoken words vary.'], 'Beat stays steady; words can vary.', 'Tapping every spoken syllable instead of the pulse.', 'Practise the pulse alone, then add words.',
   'Are beat and word rhythm always the same?', 'No.', 'How could you show a steady beat without clapping?', 'Tap a drum, nod or use another comfortable repeated movement at even intervals.'],
  ['Show a character through movement', 'Make deliberate expressive choices in pretend performance.',
   'A performer uses voice, gesture and pace to suggest a character. A cautious explorer might move slowly and look carefully around. Explain the choice so the audience can understand it. There is more than one valid interpretation; avoid stereotypes about how groups of people move or speak.',
   'Show an explorer entering an unfamiliar forest.', ['Decide the explorer feels cautious.', 'Choose slow steps and careful looking.', 'Explain how the movements show caution.'], 'Choose a feeling; show a clue.', 'Making random movements without connecting them to the character.', 'Choose one clear intention and a movement that communicates it.',
   'What could slow careful movement suggest?', 'Caution, concentration or another supported interpretation.', 'Show a character who has just found a lost toy. Explain one choice.', 'For example, relaxed shoulders to show relief; accept a reasoned expressive choice.']
 ]]
]]
];

export const batch01 = [...compileActivities('nursery', nursery), ...compileActivities('reception', reception)];
