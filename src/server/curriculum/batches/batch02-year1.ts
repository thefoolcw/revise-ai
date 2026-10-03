import { compileActivities, type Subject } from '../authoredActivities';

/** Original Year 1 teaching sequences; not a complete or board-verified syllabus. */
const subjects: Subject[] = [
['maths', [
 ['Numbers to twenty', [
  ['A ten and some ones', 'Represent numbers from eleven to nineteen as ten and extra ones.',
   'A full ten-frame holds ten counters. To show fourteen, fill it once and put four counters beside it. Fourteen is ten and four, not one and four objects. Grouping ten helps us see a quantity without recounting everything. The digit 1 in 14 represents one ten.',
   'Build sixteen with counters.', ['Fill a ten-frame: ten.', 'Add six counters beside it.', 'Ten and six make sixteen.'], 'Teen: a ten and some more.', 'Reading 16 as six tens and one one.', 'The left digit counts tens; the right digit counts ones.',
   'How many ones join ten to make thirteen?', 'Three.', 'Show eighteen as a ten and ones. How many extra ones?', 'Eight: eighteen is ten and eight.'],
  ['Order numbers using a number line', 'Compare and order numbers within twenty.',
   'A number line places numbers in order with equal steps of one. Numbers increase as we move right. To compare 12 and 17, locate both and notice that 17 lies farther right. The distance between them is five steps, not six: count the jumps rather than the written endpoints.',
   'Order 15, 11 and 18 from smallest to greatest.', ['Find 11, 15 and 18 on the line.', 'Read their positions from left to right.', 'The order is 11, 15, 18.'], 'Right grows; left goes lower.', 'Counting the starting number as the first jump.', 'Start on the number and count only when moving to the next mark.',
   'Which is greater: 14 or 19?', '19.', 'What number is three steps to the right of 12?', '15: 13, 14, 15.']
 ]],
 ['Addition and subtraction', [
  ['Add by counting on', 'Add a small number by counting on from a known total.',
   'Addition combines quantities. If you already know there are eight blocks, keep eight in mind and count on three more rather than starting at one again. Each new block produces one new number: nine, ten, eleven. The equals sign means both sides have the same value.',
   'Calculate 8 + 3.', ['Start at eight.', 'Make three jumps: nine, ten, eleven.', 'Write 8 + 3 = 11.'], 'Keep the first; count the extra.', 'Saying eight as the first added block and stopping at ten.', 'Only say the next number when an extra block is added.',
   'What does the plus sign tell us to do?', 'Add or combine quantities.', 'Find 9 + 2 using counting on.', '11: start at nine and count ten, eleven.'],
  ['Subtract and check', 'Subtract within twenty and check using addition.',
   'Subtraction can mean taking away. Show twelve counters, remove four and count the eight left. Addition can check this: eight remaining plus four removed equals twelve at the start. Keep the starting quantity clear; subtraction order usually changes the result.',
   'Calculate 12 − 4.', ['Show twelve counters.', 'Remove four, leaving eight.', 'Check 8 + 4 = 12.'], 'Left plus removed equals start.', 'Removing the larger number just because it is larger.', 'Read the subtraction in order: start with twelve and remove four.',
   'In 12 − 4, which number tells us how many to remove?', 'Four.', 'There are fifteen apples; five are used. How many remain?', 'Ten; 15 − 5 = 10 and 10 + 5 = 15.']
 ]]
]],
['english-lang', [
 ['Phonics and spelling', [
  ['Two letters, one sound', 'Recognise a taught consonant digraph within a word.',
   'A digraph is two letters representing one phoneme. In ship, sh represents one sound, followed by /i/ and /p/: three sounds but four letters. Use only digraphs already taught in the school phonics programme. Blend the sounds, not individual letter names.',
   'Read ship.', ['Notice sh as one unit.', 'Say /sh/, /i/, /p/.', 'Blend to say ship.'], 'Two letters can team up.', 'Counting every letter as a separate sound.', 'Underline sh and give the pair one sound counter.',
   'How many letters form sh?', 'Two.', 'How many phonemes are in shop?', 'Three: /sh/, /o/, /p/.'],
  ['Segment words with a digraph', 'Spell a regular word containing a taught digraph.',
   'Say fish and stretch the word to hear /f/, /i/, /sh/. Three phonemes need three sound boxes, but the last box contains two letters. Sound boxes count phonemes, not letters. Read the completed spelling aloud to check that it represents the intended word.',
   'Spell fish.', ['Say /f/, /i/, /sh/.', 'Write f, i and sh in three sound boxes.', 'Blend the result: fish.'], 'A sound box may hold a pair.', 'Writing only s for the final /sh/.', 'Use the taught pair sh to represent the whole final sound.',
   'What letters represent the final sound of fish?', 'sh.', 'Segment and spell wish, using taught sounds.', '/w/, /i/, /sh/: w-i-sh.']
 ]],
 ['Sentence writing', [
  ['Build a complete sentence', 'Write a sentence with a capital letter, spaces and an end mark.',
   'A sentence expresses a complete idea. “The dog ran.” tells who and what happened. Say it aloud before writing. Begin with a capital, separate words with spaces and put a full stop after a statement. A capital alone does not make an incomplete phrase a sentence.',
   'Improve “the dog ran”.', ['Say the complete idea.', 'Capitalise The.', 'Add the full stop: The dog ran.'], 'Say it; space it; stop it.', 'Putting a full stop after every word.', 'Read the whole idea and stop at its end.',
   'What mark ends a simple statement?', 'A full stop.', 'Write a sentence about a bird flying.', 'For example, “The bird flew.” with a capital, spaces and full stop.'],
  ['Join ideas with and', 'Use and to join related ideas in a sentence.',
   'The word and can connect two related ideas. “I packed a hat. I packed a coat.” can become “I packed a hat and a coat.” Say the sentence again to check it still makes sense. Do not keep adding and forever; a new sentence can make writing easier to follow.',
   'Join “Sam ran” and “Sam jumped”.', ['Find the shared person, Sam.', 'Connect the actions with and.', 'Write “Sam ran and jumped.”'], 'And adds a related idea.', 'Leaving out the action in the second idea when it is different.', 'Reread to check both actions are included.',
   'Which word can join two related ideas?', 'And.', 'Join “I saw a cat” and “I saw a dog” without repeating I saw.', '“I saw a cat and a dog.”']
 ]]
]],
['english-lit', [
 ['Reading a short narrative', [
  ['Find an answer in the text', 'Retrieve a stated detail from a short passage.',
   'Read: “Ravi put a red kite beside the gate. After lunch he carried it to the park.” Retrieval means finding information the text actually states. If asked where the kite was first, look at the first sentence, not the final destination. Use the wording around the detail to check.',
   'What colour was Ravi’s kite?', ['Find the word kite.', 'Read the describing word before it.', 'The kite was red.'], 'Find it; check it; answer it.', 'Answering from a picture or personal guess instead of the passage.', 'Return to the sentence that gives the detail.',
   'Where did Ravi take the kite after lunch?', 'To the park.', 'Where was the kite before lunch?', 'Beside the gate.'],
  ['Infer from actions', 'Support a simple inference with an action from the story.',
   'Read: “Aisha heard thunder. She pulled her blanket close and called for Dad.” The text does not name her feeling. She might be frightened because she seeks comfort after thunder. An inference joins a story clue with what we know, but it is not a certainty.',
   'How might Aisha feel?', ['Notice the thunder.', 'Notice the blanket and call for Dad.', 'Suggest frightened or worried, supported by those actions.'], 'Clue plus thinking.', 'Saying an inferred feeling is definitely stated in the text.', 'Use “might” and explain the clue.',
   'Whom did Aisha call?', 'Dad.', 'What action suggests she wants comfort?', 'Pulling her blanket close or calling for Dad; either supports the inference.']
 ]],
 ['Poetry and oral storytelling', [
  ['Hear rhyme without forcing meaning', 'Identify rhyming words in a short original poem.',
   'Read: “A snail slid past the garden gate; / A beetle waved and whispered, wait.” Gate and wait share their ending sound. Rhyme depends on sound, not identical spelling. Some poems do not rhyme at all. Meaning and rhythm still make them poems.',
   'Which words rhyme in the two lines?', ['Read both line endings aloud.', 'Compare gate and wait.', 'They rhyme because their endings sound alike.'], 'Rhyme lives in sound.', 'Rejecting gate and wait because their endings look different.', 'Listen before comparing written letters.',
   'Must every poem rhyme?', 'No.', 'Which rhymes with light: night or leaf?', 'Night, because it shares the ending sound.'],
  ['Retell with a change', 'Retell a simple plot while deliberately changing one detail.',
   'Use this original plot: a fox loses a scarf, asks an owl for help and finds it on a branch. Retell the events in order, then change the lost object to a hat. Keep the search and discovery connected. A planned change is different from accidentally forgetting the sequence.',
   'Retell the plot with a hat instead of a scarf.', ['The fox loses a hat.', 'The owl helps search.', 'They find the hat on a branch.'], 'Keep the order; change one choice.', 'Changing the object halfway through without explanation.', 'Choose the new object before starting and use it consistently.',
   'Who helps the fox?', 'The owl.', 'Create a new ending that still solves the lost-object problem.', 'For example, the owl spots the hat beside the stream and returns it.']
 ]]
]],
['science-combined', [
 ['Plants and seasonal change', [
  ['Name a plant’s parts', 'Identify roots, stem, leaves and flowers on a flowering plant.',
   'Roots usually anchor a plant and take in water from the soil. The stem supports the plant and transports water. Leaves use light to help the plant make food. Some plants produce flowers, but a plant need not have visible flowers all year. Observe without pulling up wild plants.',
   'Label a drawing of a flowering plant.', ['Find roots below the soil line.', 'Trace the stem upwards to leaves.', 'Identify a flower if one is shown.'], 'Roots below; stem supports; leaves catch light.', 'Calling roots the plant’s food.', 'Roots absorb water and minerals; leaves help make food using light.',
   'Which part usually anchors a plant?', 'The roots.', 'A plant has leaves but no flower today. Is it still a plant?', 'Yes; flowers are not always present and some plants do not flower.'],
  ['Observe seasonal change', 'Describe a local change associated with a season.',
   'In the UK, many deciduous trees lose leaves in autumn and grow new leaves in spring. Evergreen trees keep leaves throughout the year, replacing them gradually. Day length also changes across seasons. Weather varies from day to day, so one cold day does not prove it is winter.',
   'Compare photographs of the same deciduous tree in summer and winter.', ['Notice the leafy summer crown.', 'Notice bare winter branches.', 'Describe leaf loss as a seasonal change in this tree.'], 'Same place; different season.', 'Saying all trees lose all their leaves in winter.', 'Compare deciduous and evergreen examples.',
   'Do evergreen trees usually stay leafy through winter?', 'Yes.', 'Why compare the same tree at different times?', 'It makes the change over time easier to identify.']
 ]],
 ['Animals and materials', [
  ['Sort animals by features', 'Use visible features to describe animal groups.',
   'Birds have feathers. Mammals have hair or fur and feed their young milk. A bat is a mammal even though it flies; flight alone does not define birds. Use reliable features rather than where an animal happens to be. Fish, amphibians and reptiles have other distinguishing features.',
   'A bat flies and has fur. Is it a bird?', ['Notice that flight is shared by different animals.', 'Look for fur rather than feathers.', 'A bat is a mammal, not a bird.'], 'Features first, not just movement.', 'Calling every flying animal a bird.', 'Use feathers as the key bird feature.',
   'What covering is characteristic of birds?', 'Feathers.', 'A robin has feathers. Which group does it belong to?', 'Birds; feathers are a characteristic feature of this group.'],
  ['Choose a material for a purpose', 'Connect a material property to a simple use.',
   'An object is a thing; a material is what it is made from. A window is an object often made from glass. Transparent materials let us see through them. For a toy rain cover, waterproof and flexible properties may matter more than transparency. Choose based on the job, not only appearance.',
   'Choose between tissue and waterproof plastic for a toy rain cover.', ['Identify the job: keep water out.', 'Compare how the materials react to water.', 'Choose the waterproof plastic, handled safely.'], 'Job first; property next.', 'Thinking one material is best for every job.', 'State the purpose before choosing.',
   'Is a spoon an object or a material?', 'An object.', 'Why is clear glass useful in a window?', 'It is transparent, so light passes through and we can see through it.']
 ]]
]],
['history', [
 ['Time and evidence', [
  ['Put events on a timeline', 'Order familiar events from earlier to later.',
   'A timeline arranges events in time order. Place being born before starting school and starting school before today. Equal-looking picture cards do not mean equal lengths of time have passed. Use before and after to explain the order without needing exact dates.',
   'Order today, first birthday and birth.', ['Birth is earliest.', 'The first birthday follows birth.', 'Today comes later.'], 'Earlier first, later next.', 'Ordering pictures by size rather than event time.', 'Ask what had to happen before each event.',
   'Does before mean earlier or later?', 'Earlier.', 'Which comes first: making a cake or eating that cake?', 'Making it, unless the events refer to different cakes.'],
  ['Ask what an old photograph shows', 'Distinguish visible evidence from a guess about the past.',
   'A photograph records a view at one moment. It may show clothes, buildings and transport, but not every part of daily life. Look closely before guessing. If a street photograph contains one bicycle, we can say a bicycle was present; we cannot conclude everyone travelled by bicycle.',
   'An old photo shows children outside a school.', ['Describe visible clothing and the building.', 'Identify what the photograph does not show, such as the lessons inside.', 'Ask a question another source might answer.'], 'See it or suppose it?', 'Assuming one picture represents everyone’s experience.', 'Say what this particular image shows and what remains unknown.',
   'Can a photograph show every event in a day?', 'No.', 'A picture shows a horse and cart. What can you safely say?', 'A horse and cart were visible when that photograph was taken.']
 ]],
 ['Homes and local change', [
  ['Compare household objects', 'Explain a similarity and a difference between old and current objects.',
   'Compare a hand-operated carpet sweeper with an electric vacuum cleaner using pictures or safe museum objects. Both help remove dirt from floors. One uses a person’s pushing motion and brushes; the other uses an electric motor to create suction. Older and newer objects may exist at the same time.',
   'What changed and what stayed the same?', ['Identify the shared cleaning purpose.', 'Compare how each works.', 'Explain that purpose stayed similar while the power source differed.'], 'Same job, different method.', 'Thinking the invention of a new object means everyone immediately used it.', 'People adopt technologies at different times and may keep older objects.',
   'What purpose do both cleaning objects share?', 'Removing dirt from floors.', 'Why might a household keep an older tool?', 'Cost, availability, preference or usefulness; these are possible reasons, not proven facts about one family.'],
  ['Investigate a local place', 'Use two sources to describe change in a familiar place.',
   'Compare an older and a recent image of the same street. Match a lasting landmark, such as a church or corner building, so you know the views are comparable. Describe additions and removals separately. An adult can help find dates and source information.',
   'An older image has a small shop; a current image shows a library in that building.', ['Match the building’s position.', 'Read the date and labels on each source.', 'Describe a change of use from shop to library, if the sources support it.'], 'Match the place; check the date.', 'Comparing two different streets as if they show change.', 'Use landmarks and source labels to establish location.',
   'Why do dates matter when comparing images?', 'They tell which view is earlier and how far apart the observations are.', 'If both pictures show the same clock tower, is that change or continuity?', 'Continuity: that feature remains, though details may still have changed.']
 ]]
]],
['geography', [
 ['Our school and maps', [
  ['Use a map key', 'Interpret a simple symbol using a map key.',
   'A map represents a place from above using simplified symbols. A key explains those symbols: a green square could mean a tree, but symbols are not universal unless agreed. Find the symbol in the key before deciding what it represents. A map is not a side-view drawing of buildings.',
   'A school map key says a blue circle means a water fountain.', ['Find the blue circle in the key.', 'Locate matching circles on the map.', 'Each marks a fountain’s position.'], 'The key unlocks the symbols.', 'Assuming blue always means a river.', 'Check the key for this particular map.',
   'What is a bird’s-eye view?', 'A view looking down from above.', 'The key uses a star for the office. What does a star on the map show?', 'The location of the office.'],
  ['Describe a route', 'Give clear directions using landmarks and turns.',
   'A route tells someone how to travel between places. Start with a named starting point, then give directions in order. Left and right depend on the traveller’s facing direction. Use safe classroom routes rather than sending children out alone.',
   'From the door, go straight to the table and turn left towards the book corner.', ['Start facing into the room at the door.', 'Move straight to the table.', 'Turn left from that facing direction.'], 'Start, landmark, turn.', 'Giving left from the viewpoint of someone facing the opposite way.', 'Stand facing the traveller’s direction before checking the turn.',
   'Why name a starting point?', 'The same instructions may lead somewhere different from another starting point.', 'How can a landmark improve a direction?', 'It tells the traveller where to turn or check their position.']
 ]],
 ['The UK and weather', [
  ['Find the UK’s countries', 'Name the four countries of the United Kingdom.',
   'The United Kingdom includes England, Scotland, Wales and Northern Ireland. London is the UK capital and the capital of England. Edinburgh, Cardiff and Belfast are the capitals of Scotland, Wales and Northern Ireland respectively. The Republic of Ireland is a separate country, not part of the UK.',
   'Match Wales with its capital.', ['Find Wales on a labelled UK map.', 'Locate Cardiff in Wales.', 'State that Cardiff is the capital of Wales.'], 'Four countries in one UK.', 'Treating England as another name for the whole UK.', 'Name England as one of the four UK countries.',
   'Which country has Edinburgh as its capital?', 'Scotland.', 'Name the four UK countries.', 'England, Scotland, Wales and Northern Ireland.'],
  ['Keep a weather record', 'Record weather consistently and describe a simple pattern.',
   'Observe weather from a safe place at roughly the same time each day. Record cloud, rain and wind using an agreed key. A week’s record describes that week, not the whole climate. More observations make a pattern clearer; missing days should be marked as missing, not invented.',
   'A five-day chart records rain on Monday and Thursday.', ['Count the days marked rainy.', 'There are two rainy days.', 'Say “It rained on two of the five observed days”.'], 'Observe, mark, compare.', 'Calling a missing observation a sunny day.', 'Leave a clear missing-data mark when no observation was made.',
   'Does a rainy week prove it always rains there?', 'No.', 'Three of five observed days were windy. How many were not marked windy?', 'Two, provided all five days have complete observations.']
 ]]
]],
['computer-science', [
 ['Instructions and programs', [
  ['Write an exact algorithm', 'Create an ordered set of instructions for a simple task.',
   'An algorithm is a clear sequence of steps for completing a task. For a floor robot, “go there” is unclear, but “move forward two squares” is precise if the start and facing direction are known. Plan on paper before using a device. People can act out algorithms too.',
   'Move from square A to a target two squares directly ahead.', ['Place the robot at A facing the target.', 'Give forward, forward.', 'Check that it stops on the target.'], 'Exact steps, agreed start.', 'Leaving the starting direction unstated.', 'Mark both the starting position and an arrow for the facing direction.',
   'What is an algorithm?', 'An ordered set of instructions for a task.', 'Why is “go to the nice place” unsuitable for a robot?', 'It does not specify an exact destination or action.'],
  ['Debug one instruction', 'Locate and correct an error in a short program.',
   'A bug is an error in a program. Debugging means finding and fixing it. Test one instruction at a time and compare the actual position with the planned position. Change the step that causes the first mismatch rather than replacing all instructions without checking.',
   'A robot should move two squares but its program says forward, forward, forward.', ['Run the steps slowly.', 'Notice it reaches the target after two steps.', 'Remove the extra forward instruction.'], 'Predict, test, fix.', 'Changing several steps at once and losing track of the cause.', 'Make one clear change and retest from the same start.',
   'What does debugging mean?', 'Finding and correcting errors.', 'Why reset to the original start before retesting?', 'So the result can be fairly compared with the intended route.']
 ]],
 ['Digital creation and safety', [
  ['Save and find a file', 'Save a digital creation using a meaningful name.',
   'A file stores digital work such as a drawing. Give it a useful name and save it in the location the teacher chooses. Closing an application is not always the same as saving. Reopen the file to check it was saved, and avoid including personal details in a public filename.',
   'Save a drawing of a red boat.', ['Choose Save with adult support.', 'Name it red-boat in the agreed folder.', 'Reopen it to check the drawing appears.'], 'Name, save, check.', 'Assuming work is saved because it is visible on screen.', 'Use the save function and confirm by reopening.',
   'Why use a meaningful filename?', 'It helps identify the work later.', 'Which is easier to find: picture123 or red-boat?', 'Red-boat, because it describes the drawing.'],
  ['Pause before sharing', 'Recognise personal information and seek adult help online.',
   'Personal information includes your home address, password and details that help locate you. A friendly-looking message is not proof that its sender is safe. If an app asks for information or something feels upsetting, stop and tell a trusted adult. Never test a suspicious request by sending real details.',
   'A game message asks for your home address to send a prize.', ['Do not type the address.', 'Stop interacting with the message.', 'Show a trusted adult.'], 'Pause, keep private, tell.', 'Trusting a request because it promises a prize.', 'Ask a trusted adult to check before sharing any personal information.',
   'Should you share your password with a game stranger?', 'No.', 'What should you do if you already shared something worrying?', 'Tell a trusted adult promptly; asking for help is the right thing to do.']
 ]]
]],
['art', [
 ['Line and observation', [
  ['Draw what you notice', 'Use observed lines and shapes to draw a familiar object.',
   'Place a leaf on the table and look before drawing. Notice the outside shape, stem and main veins. A drawing can simplify details while still recording observation. Look back at the leaf frequently instead of relying only on a remembered symbol for “leaf”.',
   'Draw a broad leaf with a central vein.', ['Trace the outline in the air.', 'Draw the outside shape lightly.', 'Add the central vein and a few observed branches.'], 'Look, draw, look again.', 'Drawing every leaf as the same pointed shape.', 'Compare this leaf’s actual width, edge and tip.',
   'What is an outline?', 'The line around the outer edge of a shape.', 'Why look back at the object while drawing?', 'To check details rather than only draw from memory.'],
  ['Make texture with marks', 'Choose repeated marks to suggest a surface texture.',
   'Texture is how a surface feels or appears to feel. Short repeated strokes can suggest fur; dots may suggest a rough surface. Try several marks before choosing. A drawing remains flat, but visual texture helps the viewer imagine a surface. There is no single required mark for every material.',
   'Suggest rough bark in a drawing.', ['Observe or examine a safe photograph of bark.', 'Try broken vertical marks.', 'Repeat and vary the marks to suggest irregular ridges.'], 'Repeat a mark to suggest a surface.', 'Thinking texture can only be shown with colour.', 'Try different line directions, spacing and shapes.',
   'Can a flat drawing suggest roughness?', 'Yes, through visual texture.', 'Choose a mark that could suggest grass and explain why.', 'Short upward strokes could suggest individual blades; other reasoned choices are valid.']
 ]],
 ['Colour and composition', [
  ['Mix secondary paint colours', 'Mix two primary paint colours and record the result.',
   'With classroom red, yellow and blue paints, mixing pairs usually produces orange, green and purple-like mixtures. Exact results depend on pigments. Mix small amounts and clean the brush between tests so leftover paint does not change the result. These are paint mixtures, not coloured-light mixtures.',
   'Mix yellow and blue paint.', ['Place small separate amounts on a palette.', 'Use a clean brush to mix them.', 'Observe and record the resulting green.'], 'Clean tools, clear colour tests.', 'Using a dirty brush and blaming the starting colours.', 'Clean the brush and repeat with fresh samples.',
   'What colour usually results from yellow and blue paint?', 'Green.', 'Which paint pair usually makes orange?', 'Red and yellow.'],
  ['Arrange a collage', 'Choose and arrange cut or torn shapes for a clear composition.',
   'Composition means how parts are arranged in an artwork. In a collage, try positions before gluing. Overlap can show one shape in front of another. Large and small shapes guide attention. Use child-safe tools with supervision and explain a choice rather than copying a single model.',
   'Create a tree in front of a house using paper shapes.', ['Place the house shape first.', 'Overlap part of it with the tree shape.', 'Check the arrangement before gluing.'], 'Arrange before you attach.', 'Gluing immediately and being unable to explore alternatives.', 'Move loose shapes into two possible arrangements before choosing.',
   'What does overlapping suggest?', 'That one shape or object is in front of another.', 'How could you make one part of a collage stand out?', 'Use a larger shape, a contrasting colour or a clear space around it.']
 ]]
]],
['design-tech', [
 ['Design and evaluation', [
  ['Design for a user', 'Identify who a product is for and what it must do.',
   'A design should meet a need. A pencil holder for a shared table must hold pencils, remain upright and be safe to use. These are design criteria, not just decoration choices. Sketch an idea and label the parts that help it do its job. An adult checks materials and tools.',
   'Plan a pencil holder.', ['Name the user: classmates.', 'List holding pencils and standing steadily as needs.', 'Draw a wide base and a container tall enough for pencils.'], 'Who, what, how?', 'Starting with decoration before considering the job.', 'Write or say two useful criteria first.',
   'Who is the user of a product?', 'The person or group who will use it.', 'Give a useful criterion for a toy bridge.', 'It should safely support the intended toy or span the intended gap.'],
  ['Evaluate against criteria', 'Test a made product against its intended purpose.',
   'Evaluation asks how well a product meets the design criteria. If a pencil holder looks attractive but tips over, it has not met the stability requirement. Test gently, record what happened and suggest a specific improvement. A test is useful even when the product needs changes.',
   'The holder falls when three pencils are added.', ['Compare the result with “stand steadily”.', 'Identify that the base may be too narrow.', 'Try a wider base and retest.'], 'Test the job, not just the look.', 'Saying “good” without evidence.', 'Describe what happened during the test and link it to a criterion.',
   'Why is “it looks nice” not a full evaluation?', 'It does not show whether the product works for its purpose.', 'What evidence would show a holder is stable?', 'It remains upright with the intended number of pencils during a sensible test.']
 ]],
 ['Structures and food preparation', [
  ['Strengthen a paper beam', 'Compare a flat and folded paper structure.',
   'Folding paper changes its shape and can make it resist bending. Compare equal-sized sheets spanning the same small gap. Fold one into a concertina and leave the other flat. Add identical light weights gradually with an adult. Keep the paper and gap the same for a fairer comparison.',
   'Which sheet holds a light toy more steadily?', ['Place the flat sheet across the gap.', 'Test the folded sheet across the same gap.', 'Compare bending under the same light load.'], 'Shape can add strength.', 'Using thicker paper for one test and blaming only the fold.', 'Use matching paper so the shape is the main change.',
   'What changed when the sheet was folded?', 'Its shape or structure.', 'Name one thing to keep the same in the comparison.', 'Paper size and type, gap width, or test load.'],
  ['Prepare fruit safely', 'Follow a supervised hygiene and preparation sequence.',
   'Before preparing food, an adult checks allergies and chooses suitable ingredients and tools. Wash hands and clean surfaces. Wash fruit as appropriate, use a child-safe tool with close supervision and keep fingers clear. Prepared fruit should be handled and stored according to adult guidance, not left indefinitely.',
   'Prepare a banana portion for a snack.', ['Wash hands and clean the workspace.', 'Peel the banana and cut safely with adult guidance.', 'Serve on a clean plate and tidy the area.'], 'Clean hands, safe tools, clean food.', 'Using the same dirty surface for food and craft materials.', 'Clean a suitable food-preparation area first.',
   'Who should check allergies and supervise tools?', 'A responsible adult.', 'Why wash hands before preparing food?', 'To reduce transfer of dirt and germs to food.']
 ]]
]],
['music', [
 ['Pulse and rhythm', [
  ['Keep pulse through a pause', 'Maintain an internal steady beat when sound briefly stops.',
   'Pulse is the regular beat underlying many pieces of music. Tap along with an adult’s steady count, then keep tapping while the adult is silent for two beats. When the count returns, compare timing without treating small mistakes as failure. The pulse can continue even when notes stop.',
   'Count one, two, three, four twice, leaving beats three and four silent in the second cycle.', ['Establish evenly spaced taps.', 'Continue taps through the silent counts.', 'Meet the next spoken one without speeding up.'], 'The beat can carry on in silence.', 'Stopping the pulse whenever no note is heard.', 'Imagine the count continuing through the gap.',
   'Does a musical rest always mean the pulse stops?', 'No.', 'How could you practise pulse without an instrument?', 'Use even taps, steps or nods, adapted to movement needs.'],
  ['Create a short rhythm', 'Organise sounds and rests over a steady pulse.',
   'Rhythm is the pattern of sound lengths and silences. Over four steady beats, clap on beats one, two and four, leaving beat three silent. Keep the underlying beat even. A simple drawn score can use a dot for a clap and a dash for a rest, with a key explaining the symbols.',
   'Perform dot, dot, dash, dot over four beats.', ['Count four even beats.', 'Clap on one and two.', 'Stay silent on three, then clap on four.'], 'Count every beat, sound or rest.', 'Skipping the silent beat and making the pattern shorter.', 'Keep counting through the rest.',
   'What does a rest represent?', 'A planned silence.', 'Create a four-beat pattern with two claps and two rests.', 'For example, clap-rest-clap-rest, with all four beat positions maintained.']
 ]],
 ['Pitch and expression', [
  ['Compare high and low sounds', 'Distinguish pitch from loudness.',
   'Pitch describes how high or low a sound is. Loudness describes how loud or quiet it is. A high note can be quiet and a low note can be loud. Use comfortable voice sounds or a suitable instrument, never excessively loud sounds. Hand height can represent pitch changes.',
   'An adult plays a quiet high note and a loud low note.', ['Listen to each note’s height.', 'Separate height from volume.', 'Identify the first as higher even though it is quieter.'], 'High is not the same as loud.', 'Choosing the louder note as the higher one.', 'Compare pitch at similar volume before varying loudness.',
   'Can a low note be quiet?', 'Yes.', 'What changes if the same note is played more softly?', 'Loudness changes; its pitch can remain the same.'],
  ['Choose sounds for a scene', 'Select and explain musical sounds for a simple story.',
   'Sound choices can suggest a setting or event. Soft taps might represent light rain, with faster or denser taps suggesting a heavier shower. These choices are interpretations rather than fixed rules. Plan a beginning, change and ending, then discuss whether listeners understood the intended scene.',
   'Represent rain beginning and then stopping.', ['Start with sparse soft taps.', 'Gradually add more taps.', 'Reduce the taps and finish with silence.'], 'Choose, shape, listen.', 'Playing every sound at maximum volume.', 'Use controlled contrasts that fit the story and protect hearing.',
   'What could silence suggest at the end of a rain piece?', 'The rain has stopped.', 'Suggest a sound choice for a gentle breeze and explain it.', 'A soft sustained rustling sound could suggest moving leaves; other reasoned choices are valid.']
 ]]
]],
['pe', [
 ['Sending and receiving', [
  ['Roll towards a target', 'Control direction and force when rolling a ball.',
   'Use a soft ball on a clear level surface. Face a wide target, lower the hand and release close to the floor so the ball rolls rather than bounces. Adapt position and equipment for access needs. Compare where the ball finishes and adjust one feature of the next attempt.',
   'A ball rolls to the left of a target.', ['Check the body and hand face the target.', 'Aim the release more centrally.', 'Roll again with similar force.'], 'Face, lower, roll.', 'Throwing downwards instead of releasing near the floor.', 'Practise a low gentle release.',
   'What should change if the ball stops short?', 'Use a little more force or reduce the distance.', 'How can you make a rolling task easier?', 'Use a wider target, shorter distance or suitable adapted ball.'],
  ['Receive a rolling ball', 'Stop a gently rolled ball with control.',
   'Watch the ball approach and place hands or suitable equipment in its path. Use a wide receiving shape and absorb the movement gently rather than striking it back. Begin with slow rolls over a short distance. Communicate readiness before a partner sends the ball.',
   'A partner rolls a soft ball towards you.', ['Signal that you are ready.', 'Watch and prepare a wide receiving shape.', 'Stop the ball gently and keep control.'], 'Ready, watch, receive.', 'Looking away before the ball arrives.', 'Use a clear ready signal and a slower roll.',
   'Why signal readiness?', 'So the sender knows you are prepared to receive safely.', 'What can partners change if receiving is difficult?', 'Reduce speed or distance, or use a larger suitable ball.']
 ]],
 ['Balance and teamwork', [
  ['Make a controlled balance', 'Hold a stable shape and move out of it safely.',
   'A balance is a controlled still position. Use a floor-level activity and choose a shape suitable for the learner. A wider base often makes balancing easier. Hold briefly while breathing normally, then return to a stable starting position. Never force painful positions or unsupported inversions.',
   'Compare a narrow and wider standing base with adult guidance.', ['Start on a safe flat surface.', 'Try a comfortable wider base.', 'Notice whether steadiness improves.'], 'Stable base, steady breathing.', 'Holding the breath while trying to stay still.', 'Breathe normally and shorten the hold if needed.',
   'What often makes a balance easier?', 'A wider stable base or suitable support.', 'Why practise getting out of a balance?', 'Control and safety matter during the transition as well as the hold.'],
  ['Play with agreed rules', 'Follow simple rules and support fair participation.',
   'Rules explain the goal, safe boundaries and how turns work. In a cooperative target game, a team can count how many rolls reach the target rather than eliminate learners who miss. Agree how to adapt distance or equipment fairly. Respectful communication matters more than winning.',
   'One teammate finds the target too far away.', ['Listen to the difficulty.', 'Agree a closer starting point or adapted equipment.', 'Continue with a fair opportunity for everyone.'], 'Safe, fair, included.', 'Assuming fair always means every learner uses identical equipment.', 'Fair participation may require appropriate adaptations.',
   'Why agree boundaries before a game?', 'To keep play safe and clear.', 'What is a supportive response when a teammate misses?', 'Encourage them and offer a useful suggestion without blame.']
 ]]
]],
['religious-studies', [
 ['Belonging and special places', [
  ['Describe belonging', 'Explain a way people express belonging to a group.',
   'People may belong to families, clubs, religious communities or non-religious groups. Shared actions, celebrations and responsibilities can express belonging. Not everyone belongs in the same way, and nobody should have to disclose personal beliefs. Compare examples respectfully without deciding one group matters more.',
   'A club welcomes a new member and explains a shared rule.', ['Identify the welcome.', 'Notice the shared activity or responsibility.', 'Explain how these may help someone feel included.'], 'Different groups, shared respect.', 'Assuming every person in a group thinks exactly alike.', 'Ask about the particular example and recognise individual differences.',
   'Can a person belong to more than one group?', 'Yes.', 'Suggest an action that could help someone feel welcome.', 'Introduce yourself, explain an activity or invite participation without pressure.'],
  ['Recognise a place of worship', 'Describe a purpose of a church and a mosque respectfully.',
   'Many Christians gather in churches and many Muslims gather in mosques for prayer and community activities. Buildings vary, and worship can also happen elsewhere. When studying a place, ask how people use it rather than assuming every building has identical features. Follow visitor guidance respectfully.',
   'Why might people gather at a mosque?', ['Identify it as a Muslim place of worship.', 'Name prayer as one purpose.', 'Recognise that community learning and meeting may happen there too.'], 'Place, people, purpose.', 'Assuming everyone in a religion attends the same type of building.', 'Use “many” and recognise variation in practice.',
   'Which religious community is associated with a church?', 'Christian communities.', 'Why should visitors follow the guidance of a place of worship?', 'To respect the community and use the space appropriately.']
 ]],
 ['Stories and celebrations', [
  ['Explore a story about care', 'Identify a moral idea in a religious story without assuming shared belief.',
   'In the Christian story of the Good Samaritan, a traveller is hurt and receives help from a Samaritan after others pass by. Many Christians understand it as teaching care beyond familiar groups. Retell the central action, then discuss the idea; learners may reflect without sharing the religious belief.',
   'What action shows care in the story?', ['Recall that the traveller is hurt.', 'Identify the Samaritan’s practical help.', 'Connect the help to caring for someone in need.'], 'Action first, meaning next.', 'Reducing care to saying kind words while ignoring practical need.', 'Discuss how helpful actions can meet a person’s needs.',
   'Who receives help in the story?', 'The injured traveller.', 'Give a safe everyday example of helping someone in need.', 'Tell a trusted adult when someone is hurt, or offer appropriate help with permission.'],
  ['Compare celebrations carefully', 'Recognise meaning and variation in celebrations.',
   'Many Christians celebrate Christmas in connection with Jesus’s birth. Many Muslims celebrate Eid al-Fitr at the end of Ramadan. Families may share food, greetings or gifts, but practices vary. A similarity in activity does not mean the celebrations have the same religious meaning.',
   'Two families share food at different celebrations. Are the meanings necessarily identical?', ['Notice the shared activity.', 'Ask which celebration each family observes.', 'Distinguish similar actions from different meanings.'], 'Similar action, possible different meaning.', 'Assuming every family celebrates in exactly the same way.', 'Use specific examples and allow for variation.',
   'Which celebration marks the end of Ramadan?', 'Eid al-Fitr.', 'Why ask what a celebration means to participants?', 'Their explanation helps us understand beyond visible food, gifts or decorations.']
 ]]
]],
['pshe', [
 ['Friendship and feelings', [
  ['Listen without deciding for someone', 'Respond supportively to another person’s stated feeling.',
   'A friend may feel differently from you about the same event. If a friend says they feel worried about a game, listen rather than insisting it is fun. Ask whether they want help, a different role or a break. Respect their answer and involve an adult when support is needed.',
   'A friend does not want to join a noisy game.', ['Listen to their explanation.', 'Offer a quieter role or another activity.', 'Accept their choice without teasing.'], 'Listen, ask, respect.', 'Assuming everyone enjoys what you enjoy.', 'Use the person’s own words about their feeling.',
   'Can friends prefer different activities?', 'Yes.', 'What could you say to a worried friend?', '“Would you like help or a break?” or another respectful supportive question.'],
  ['Repair a small disagreement', 'Use a specific apology and helpful action after a mistake.',
   'An apology names what happened and recognises its effect. “I knocked your model over; I am sorry” is more useful than blaming the other child. Ask how to help repair the situation. The other person need not forgive immediately, and repeated unkind behaviour needs adult support.',
   'You accidentally scatter someone’s puzzle pieces.', ['Stop and acknowledge the accident.', 'Apologise specifically.', 'Ask whether you can help collect or rebuild.'], 'Name it, apologise, repair.', 'Adding “but it was your fault” to avoid responsibility.', 'Describe your action honestly and offer a practical repair.',
   'Must someone accept an apology immediately?', 'No.', 'What action could follow an apology for spilling crayons?', 'Offer to help collect and sort them, if the other person agrees.']
 ]],
 ['Safety and healthy routines', [
  ['Identify a trusted support network', 'Name ways to seek help if something feels unsafe.',
   'A support network includes trusted adults at home, school or another safe setting. Practise how to describe a concern clearly. If one adult does not understand or help, tell another. A child is not responsible for solving unsafe adult behaviour and should not be asked to keep upsetting secrets.',
   'Something online makes you uncomfortable.', ['Stop interacting with it.', 'Find a trusted adult.', 'Explain or show what happened and keep asking until helped.'], 'Tell and keep telling.', 'Thinking asking again is being troublesome.', 'Safety concerns deserve attention even if the first response was unhelpful.',
   'What can you do if the first adult does not help?', 'Tell another trusted adult.', 'Why should a support network include more than one adult?', 'Someone else may be available or better able to help.'],
  ['Build a balanced daily routine', 'Explain the roles of sleep, movement, food and water in daily care.',
   'Bodies need regular sleep, suitable food, water and movement. Needs vary between people, and adults help plan routines. A quiet bedtime routine can support sleep; active play can support wellbeing. Do not label people good or bad by what they eat or how their bodies look.',
   'Plan a routine after an active afternoon.', ['Allow time for water and an appropriate meal.', 'Include a calmer activity before bed.', 'Follow a consistent bedtime plan with adult support.'], 'Different needs, regular care.', 'Thinking one healthy action replaces all other needs.', 'Explain that sleep, food, hydration and activity each have a role.',
   'Does drinking water replace the need for sleep?', 'No.', 'Name one calming activity that could fit before bedtime.', 'Reading, quiet conversation or another suitable relaxing routine.']
 ]]
]]
];
export const batch02 = compileActivities('year-1', subjects);
