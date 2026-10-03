import { compileActivities, type Subject } from '../authoredActivities';

/** Year 2 advances from concrete recognition to explanation, comparison,
 * two-digit operations, joined writing and planned investigations. Original content.
 */
const subjects: Subject[] = [
['maths', [
 ['Place value and calculation', [
  ['Partition two-digit numbers', 'Represent a two-digit number in more than one way.',
   'Forty-three is four tens and three ones. We can exchange one ten for ten ones without changing the total, so it is also three tens and thirteen ones. Use bundled sticks or base-ten equipment to see the exchange. Partitioning means splitting a whole into parts that still add to that whole.',
   'Show two ways to partition 52.', ['Use five tens and two ones: 50 + 2.', 'Exchange one ten for ten ones.', 'Four tens and twelve ones also make 52: 40 + 12.'], 'Exchange changes the parts, not the whole.', 'Thinking the digit 5 in 52 means five ones.', 'Name its position: five tens have a value of fifty.',
   'What is the value of the 6 in 67?', 'Sixty.', 'Write 34 using two tens and some ones.', 'Two tens and fourteen ones: 20 + 14 = 34.'],
  ['Add across a ten', 'Add two-digit numbers by combining tens and ones.',
   'To calculate 27 + 15, combine two tens with one ten and seven ones with five ones. This gives three tens and twelve ones. Exchange ten ones for one ten: four tens and two ones make forty-two. The exchange explains the answer rather than being a rule to copy without meaning.',
   'Calculate 27 + 15.', ['Combine tens: 20 + 10 = 30.', 'Combine ones: 7 + 5 = 12.', 'Combine 30 + 12 = 42.'], 'Ten ones can become one ten.', 'Writing 312 because there are three tens and twelve ones.', 'Exchange ten of the twelve ones to make a fourth ten.',
   'How many ones equal one ten?', 'Ten.', 'Calculate 36 + 17 and explain the exchange.', '53: three tens plus one ten is forty; six plus seven is thirteen; forty plus thirteen is fifty-three.']
 ]],
 ['Equal groups and fractions', [
  ['Read an array', 'Connect equal rows in an array to repeated addition.',
   'An array arranges objects in equal rows and columns. Three rows of four contain 4 + 4 + 4 = 12 objects. Turning the array shows four rows of three, still twelve. Multiplication describes equal groups; irregular rows do not directly show a single equal-group multiplication.',
   'Find the total in two rows of five counters.', ['Check that each row has five.', 'Add 5 + 5.', 'There are ten counters, so 2 × 5 = 10.'], 'Equal rows, equal groups.', 'Adding the number of rows to the number in a row.', 'Count the objects in every complete row, not just the two dimensions.',
   'What is important about the rows in an array?', 'Each row contains the same number.', 'There are five rows of two counters. How many altogether?', 'Ten: 2 + 2 + 2 + 2 + 2 = 10.'],
  ['Find a quarter of a quantity', 'Share a quantity into four equal parts.',
   'One quarter is one of four equal parts of a whole. For twelve counters, share one at a time into four groups until all are used. Each group contains three, so a quarter of twelve is three. Four groups alone are not enough: they must be equal and together use the whole.',
   'Find one quarter of twelve.', ['Set out twelve counters.', 'Share equally into four groups.', 'Each group has three; one quarter is three.'], 'Four equal parts; choose one.', 'Making groups of four instead of making four equal groups.', 'Label four group spaces before sharing.',
   'How many quarters make one whole?', 'Four equal quarters.', 'What is one quarter of twenty?', 'Five, because twenty shared equally into four groups gives five in each.']
 ]]
]],
['english-lang', [
 ['Sentence purpose and expansion', [
  ['Statements and questions', 'Choose sentence structure and punctuation for a purpose.',
   'A statement tells something: “The bird is nesting.” A question asks something: “Is the bird nesting?” Notice that the order of is and the bird changes in this example. Questions usually end with question marks, but punctuation alone does not reliably turn any statement into a well-formed written question.',
   'Turn “The boat is ready” into a question.', ['Identify the verb is.', 'Move is before the boat.', 'Write “Is the boat ready?”'], 'Ask clearly; mark the question.', 'Adding a question mark without considering word order.', 'Say the question aloud and check that it asks for information.',
   'What punctuation ends a direct question?', 'A question mark.', 'Turn “The children are outside” into a question.', '“Are the children outside?” Move are before the children and add a question mark.'],
  ['Expand a noun phrase', 'Add precise description to a noun phrase.',
   'A noun names a person, place or thing. In “the boat”, boat is the noun. “The small wooden boat” adds information about size and material. Choose details that help the reader picture the intended object rather than piling up unrelated adjectives. A noun phrase is not necessarily a whole sentence.',
   'Expand “a coat” to describe a waterproof yellow coat.', ['Keep coat as the main noun.', 'Choose useful describing words.', 'Write “a yellow waterproof coat”.'], 'Keep the noun; sharpen the picture.', 'Thinking every longer phrase is clearer.', 'Choose relevant descriptions and remove words that repeat an idea.',
   'Which is the noun in “the tall tree”?', 'Tree.', 'Expand “a box” using two useful details.', 'For example, “a small cardboard box”; small describes size and cardboard tells the material.']
 ]],
 ['Spelling and revision', [
  ['Use past tense consistently', 'Keep verbs in a recount aligned to the past.',
   'A recount tells events that have happened. Many past-tense verbs end in ed, such as jumped, but some change differently: go becomes went. Read each sentence in sequence to check time stays consistent. Do not add ed to an already irregular past form.',
   'Correct “Yesterday I walk to the park and saw a duck.”', ['Yesterday places the event in the past.', 'Change walk to walked.', 'Keep saw, which is already past tense.'], 'Check the time in every verb.', 'Writing goed instead of went.', 'Learn common irregular forms through meaningful sentences.',
   'What is the past tense of go?', 'Went.', 'Correct “Last night we play a game and ate supper.”', '“Last night we played a game and ate supper.” Play becomes played; ate is already past tense.'],
  ['Proofread in separate passes', 'Check spelling, punctuation and meaning systematically.',
   'Proofreading works best when attention has a clear job. First read for meaning: does each sentence say what you intended? Next check capitals and sentence endings. Finally check taught spellings, using sounding out or a reference where appropriate. Correcting everything at once can make small errors harder to spot.',
   'Proofread “on monday we went to the park” for capitals and punctuation.', ['Capitalise the sentence beginning.', 'Capitalise the day name Monday.', 'Add a full stop: On Monday we went to the park.'], 'One read, one checking job.', 'Checking only spelling and missing incomplete sentences.', 'Include a meaning check as well as spelling and punctuation.',
   'Do day names need capital letters?', 'Yes.', 'Proofread “we saw a frog. it jumped” for sentence capitals and endings.', '“We saw a frog. It jumped.” Each sentence begins with a capital and ends with a full stop.']
 ]]
]],
['english-lit', [
 ['Narrative connections', [
  ['Explain cause and consequence', 'Link two story events using evidence.',
   'Read: “Leo left the window open. A gust blew his drawing onto the wet path. He fetched a towel.” A cause helps explain why an event happened; a consequence is what followed because of it. The wind moved the drawing, and the open window allowed the wind to reach it.',
   'Why did Leo fetch a towel?', ['Recall that the drawing landed on a wet path.', 'Infer that it became wet.', 'He probably wanted to dry or protect the drawing.'], 'Because links the events.', 'Using an unrelated later event as the cause.', 'Trace what happened immediately before and look for a plausible connection.',
   'What blew the drawing outside?', 'A gust of wind.', 'What earlier action made the accident possible?', 'Leo left the window open, allowing wind to blow the drawing outside.'],
  ['Compare two characters’ responses', 'Use evidence to compare characters facing the same event.',
   'Read: “When the lights went out, Noor calmly found a torch. Ben called for an adult and stayed by the door.” Both respond to the same problem but act differently. Describe actions before judging feelings. Ben might be worried or simply following a safety rule; the text does not prove one emotion.',
   'Compare Noor and Ben.', ['Both notice the power interruption.', 'Noor finds a torch; Ben seeks adult help.', 'Their actions differ, and both may be sensible responses.'], 'Same event; compare the evidence.', 'Labelling one character foolish without support.', 'Explain what each does and consider more than one reason.',
   'Who finds a torch?', 'Noor.', 'Does the passage prove Ben is frightened? Explain.', 'No. Calling for an adult could reflect fear or a sensible safety choice; the feeling is not stated.']
 ]],
 ['Language choices', [
  ['Explore a simile', 'Explain what a simple comparison helps a reader imagine.',
   '“The pond was as smooth as glass” compares the pond’s surface with glass. It suggests stillness and a lack of ripples, not that the water is made of glass. A simile often uses like or as. Ask which feature is being compared rather than interpreting every word literally.',
   'Explain “the cloud was like a soft pillow”.', ['Identify cloud and pillow.', 'Notice the shared impression of softness or rounded shape.', 'Explain the image without claiming the cloud is a real pillow.'], 'Which shared feature?', 'Reading the comparison as a literal fact.', 'Name the similarity the writer wants us to imagine.',
   'What two words often introduce similes?', 'Like or as.', 'What does “the runner was as quick as lightning” suggest?', 'The runner seemed very fast; it is an exaggerated comparison, not a measured speed.'],
  ['Perform punctuation and emphasis', 'Use pauses and emphasis to communicate a text’s meaning.',
   'Reading aloud involves choosing pace, pauses and emphasis. In “Stop! The bridge is broken”, a sharp stop followed by clear explanation can convey urgency. A comma may guide a short pause, while a full stop marks an idea’s end. Expression should support meaning rather than make every word equally dramatic.',
   'Read “Wait, I can help you.” reassuringly.', ['Pause briefly after Wait.', 'Emphasise help gently.', 'Keep the pace calm rather than shouting.'], 'Voice follows meaning.', 'Shouting every word because expressive reading means loud reading.', 'Vary pace and emphasis, not only volume.',
   'What might an exclamation mark suggest?', 'Strong feeling or emphasis, depending on context.', 'How could you read “Where has everyone gone?” to show uncertainty?', 'Use a questioning tone, a thoughtful pace and appropriate emphasis; several performances can work.']
 ]]
]],
['science-combined', [
 ['Living things and habitats', [
  ['Living, dead or never alive?', 'Distinguish living things, things once alive and things never alive.',
   'A living plant grows and carries out life processes. A fallen dry leaf was part of a living plant but is no longer living. A stone has never been alive. Movement alone is not enough: a car moves but is not alive. Consider origin and life processes rather than one visible action.',
   'Sort a growing bean plant, a dry twig and a pebble.', ['The growing plant is living.', 'The twig came from a living plant and is now dead.', 'The pebble has never been alive.'], 'Alive now, alive before, never alive.', 'Classifying every still object as dead.', 'Ask whether it was ever part of a living thing.',
   'Has a wooden chair’s material ever been alive?', 'Yes; wood came from a tree.', 'Is a plastic toy alive because it moves with batteries?', 'No. Movement powered by a battery does not make it a living organism.'],
  ['Build a simple food chain', 'Use arrows to show a feeding relationship.',
   'A food chain shows how food energy passes between organisms. Grass is eaten by a rabbit, which may be eaten by a fox. Draw arrows from the food to the eater: grass → rabbit → fox. An arrow does not point at what an animal wants to catch; it shows the direction of energy transfer.',
   'Draw a chain linking grass, rabbit and fox.', ['Start with grass, a plant.', 'Draw an arrow to the rabbit that eats it.', 'Draw an arrow from rabbit to fox.'], 'Food points to feeder.', 'Pointing arrows from predator towards prey.', 'Read each arrow as “provides food energy to”.',
   'What does the rabbit eat in this chain?', 'Grass.', 'If fewer rabbits are available, why might foxes be affected?', 'Foxes may have less food from that source, although they can eat other prey.']
 ]],
 ['Growth and materials', [
  ['Plan a plant comparison', 'Keep relevant conditions similar when comparing a plant need.',
   'To explore a plant’s need for light, compare similar seedlings with similar soil, water and temperature but different light conditions. Observe over time and avoid claiming a result from one moment. A responsible adult prevents unnecessary prolonged harm and returns plants to suitable conditions after the comparison.',
   'Two similar seedlings receive the same water; one gets much less light.', ['Record their starting appearance.', 'Keep other conditions as similar as possible.', 'Compare later growth and colour, recording what actually happens.'], 'Change the question factor; compare the rest.', 'Changing water and light together and blaming only light.', 'Keep water similar while investigating light.',
   'Why use similar seedlings at the start?', 'So differences are less likely to come from starting with very different plants.', 'Name two conditions to keep similar when investigating light.', 'Water amount, soil, temperature or plant type; choose two relevant examples.'],
  ['Change shape without changing material', 'Describe bending, twisting, stretching and squashing.',
   'Some forces change an object’s shape without changing what it is made from. Bending a soft wire changes its shape but it remains metal. Stretching an elastic band makes it longer; it may return when released. Only test safe materials with adult supervision and never aim elastic at people.',
   'Squash a ball of modelling clay.', ['Notice its original rounded shape.', 'Press gently.', 'It becomes flatter but remains clay.'], 'Shape can change; material can stay.', 'Saying clay becomes a different material because it is flattened.', 'Separate the object’s shape from the substance it contains.',
   'What action makes something longer by pulling?', 'Stretching.', 'Does every material return to its original shape after bending?', 'No. Some stay changed or break; behaviour depends on the material and force.']
 ]]
]],
['history', [
 ['Studying a significant event', [
  ['Sequence the Great Fire of London', 'Place key features of the 1666 fire in a historical sequence.',
   'The Great Fire of London began in September 1666 in a bakery in Pudding Lane. Fire spread through parts of the city, where closely packed buildings and combustible materials helped it spread. Firefighting and the eventual reduction in wind contributed to control. London was rebuilt over subsequent years, not overnight.',
   'Order the beginning, spread and rebuilding.', ['The fire begins in Pudding Lane.', 'It spreads through part of London.', 'After the fire is controlled, rebuilding takes place.'], 'Begin, spread, respond, rebuild.', 'Saying the fire destroyed every part of London.', 'Describe extensive damage to parts of the city, not the whole city.',
   'In which year did the Great Fire begin?', '1666.', 'Why could closely packed wooden buildings help fire spread?', 'Burning material and heat could reach nearby combustible buildings more easily.'],
  ['Use a diary with care', 'Explain one value and one limit of a historical diary.',
   'Samuel Pepys wrote about events during the Great Fire. A diary can give a close account of what one person saw, heard and felt. It is not an all-seeing record: the writer could not be everywhere and may repeat information from others. Compare it with other evidence when making wider claims.',
   'Can one diary tell us what every Londoner experienced?', ['Identify whose viewpoint the diary records.', 'Notice that other people were in different places.', 'Use it as one valuable perspective, not everyone’s experience.'], 'One witness, one viewpoint.', 'Thinking a source from the time must be complete and perfectly accurate.', 'Ask what the writer directly observed and what they could not know.',
   'What kind of source is a diary written during an event?', 'A written first-hand or contemporary source, depending on the passage.', 'Why compare a diary with a map of the damaged area?', 'They answer different questions and can help check the extent and location of events.']
 ]],
 ['People and historical significance', [
  ['Explain significance with evidence', 'Give a reason why a historical person is remembered.',
   'Mary Seacole travelled to the Crimea during the Crimean War and provided care and supplies for soldiers. People may be remembered for the effects of their actions and for overcoming barriers. Saying someone is “famous” does not explain significance; identify what they did and why it mattered in context.',
   'Give a reason for studying Mary Seacole.', ['Name her work providing care and supplies.', 'Identify people affected by that work.', 'Explain that these actions form part of the history of wartime care.'], 'Action, effect, reason to remember.', 'Using fame alone as an explanation.', 'Connect a specific action to its effect or historical context.',
   'Which conflict is associated with Seacole’s work in Crimea?', 'The Crimean War.', 'What makes “she helped soldiers obtain care and supplies” stronger than “she was famous”?', 'It identifies an action and who benefited, providing a reason for significance.'],
  ['Compare experiences across time', 'Identify change and continuity using evidence from two periods.',
   'Compare school materials from two periods: a slate and chalk in one example, an exercise book and pencil in another. Both support recording learning; the materials and how work is kept differ. Do not assume all schools in a period were identical. Dates and location help make a careful comparison.',
   'Compare a reusable slate with a paper exercise book.', ['Identify their shared writing purpose.', 'Notice that a slate can be wiped for reuse.', 'An exercise book can preserve many pages of work.'], 'Same purpose, changing experience.', 'Assuming one object proves how every school worked.', 'Describe the specific examples and their source context.',
   'What does continuity mean in history?', 'Something that stays similar over time.', 'Give a continuity in the slate-and-book comparison.', 'Learners use both to record or practise written work.']
 ]]
]],
['geography', [
 ['World location', [
  ['Name continents and oceans', 'Distinguish a continent from an ocean on a world map.',
   'A continent is a very large land region; an ocean is a vast body of salt water. A common seven-continent model names Africa, Antarctica, Asia, Europe, North America, South America and Australia. Some resources use Oceania for a wider region including Australia. The five oceans are Pacific, Atlantic, Indian, Southern and Arctic.',
   'Is the Atlantic a continent or an ocean?', ['Locate the Atlantic between the Americas and Europe/Africa.', 'Notice that it is water.', 'Classify it as an ocean.'], 'Continents: land; oceans: water.', 'Calling a country a continent because it looks large.', 'Use the map labels and distinguish countries within continents.',
   'Which continent contains the UK?', 'Europe.', 'Name an ocean between Africa and Australia.', 'The Indian Ocean lies between Africa and Australia.'],
  ['Use the equator as a reference', 'Locate places relative to the equator and poles.',
   'The equator is an imaginary line around Earth halfway between the North and South Poles. It divides the Northern and Southern Hemispheres. Many places near it are warm, but climate also depends on height and other factors. A world map is flat, but Earth is approximately spherical.',
   'Locate the UK relative to the equator.', ['Find the equator on the map.', 'Find the UK above it on a north-up map.', 'The UK is in the Northern Hemisphere.'], 'Equator in the middle; poles at the ends.', 'Thinking the equator is a painted line on the ground everywhere.', 'Explain that it is a geographic reference line represented on maps.',
   'Which hemisphere lies south of the equator?', 'The Southern Hemisphere.', 'Why should we not say every equatorial place has identical weather?', 'Altitude, local conditions and time affect weather and climate, even at similar latitude.']
 ]],
 ['Comparing places and fieldwork', [
  ['Separate human and physical features', 'Classify features by whether they are natural or human-made.',
   'Physical features include rivers, hills and coastlines. Human features include roads, bridges and buildings. People can alter natural features: a river remains a physical feature even when its banks are managed. Explain the classification instead of assuming every feature near a town is human-made.',
   'Classify a river and the bridge crossing it.', ['The river is a natural water feature.', 'The bridge was built by people.', 'River is physical; bridge is human.'], 'Natural feature or built by people?', 'Calling all countryside features physical, including farm buildings.', 'Look at what the feature is and how it came to exist.',
   'Is a railway a human or physical feature?', 'Human.', 'A beach has a café beside it. Classify each.', 'The beach is a physical feature; the café is a human feature.'],
  ['Collect a simple tally', 'Record observations consistently and interpret a small data set.',
   'A tally records each observation with a mark, often grouped in fives. With an adult, count transport seen from a safe observation point for an agreed time. Decide categories before starting and count each item once. A short survey describes that period, not every day or every road.',
   'During five minutes you see three buses and seven bicycles.', ['Tally each category separately.', 'Count three bus marks and seven bicycle marks.', 'There were four more bicycles than buses in this observation.'], 'One observation, one mark.', 'Counting the same stationary vehicle repeatedly.', 'Agree whether to count passing vehicles and follow that rule consistently.',
   'Why agree the observation time?', 'So comparisons use similar periods.', 'A tally shows eight cars and five vans. How many vehicles altogether?', 'Thirteen, assuming the categories are separate and each vehicle was counted once.']
 ]]
]],
['computer-science', [
 ['Planning and debugging', [
  ['Predict before running', 'Trace a short movement program from a known starting direction.',
   'A program’s result depends on both its instructions and its starting state. A quarter-turn changes direction without moving to another square. Trace each instruction with a finger or arrow before running a robot. Keep a record of position and direction separately so turns do not accidentally become moves.',
   'Start facing north: forward, turn right, forward.', ['Move one square north.', 'Turn to face east without changing square.', 'Move one square east.'], 'A turn changes facing, not place.', 'Moving diagonally when an instruction only says turn.', 'Rotate the direction arrow in the same square.',
   'What direction follows a right turn from north?', 'East.', 'Start facing east: turn right, forward. Where do you move?', 'One square south, because the right turn changes the facing direction to south.'],
  ['Test an algorithm against a goal', 'Compare predicted and actual results to identify a bug.',
   'Testing is more informative when the goal is clear. Mark the target position and intended facing direction, then run a program from a fixed start. Stop at the first difference from the plan. A robot reaching the correct square but facing incorrectly may still fail the goal.',
   'A robot reaches the target but faces west instead of east.', ['Check whether the movement steps reached the right square.', 'Inspect the final turn instructions.', 'Correct the direction and retest from the original start.'], 'Check place and facing.', 'Declaring success based only on the square reached.', 'Compare every part of the stated goal.',
   'Why record a prediction?', 'It gives an expected result to compare with the test.', 'Why change only one suspect instruction before retesting?', 'It helps identify whether that change fixed the particular error.']
 ]],
 ['Data and digital choices', [
  ['Organise data in a table', 'Use consistent categories to organise a small set of information.',
   'A table uses rows and columns to organise records. For classroom plants, columns might be plant name and leaf count. Each row should refer to one plant. Agree what counts as a leaf and record missing information clearly. Consistent categories make comparisons meaningful.',
   'Record plant A with four leaves and plant B with six.', ['Create columns Plant and Leaves.', 'Enter A with 4 and B with 6 on separate rows.', 'Compare the leaf-count column: B has two more.'], 'One item per row; one kind of fact per column.', 'Mixing height and leaf count in the same column.', 'Use a separate labelled column for each type of measurement.',
   'What does a column heading explain?', 'What kind of information is recorded in that column.', 'How should you record an unobserved plant’s leaf count?', 'Mark it missing or not observed, rather than inventing a number.'],
  ['Question an online claim', 'Recognise that online information needs checking.',
   'Anyone can create online information, and confident wording does not guarantee truth. For a simple factual question, use age-appropriate sources selected with an adult and compare what they say. An advert may try to persuade rather than explain. Do not click unfamiliar links just to investigate a claim.',
   'A colourful page claims that every bird can fly.', ['Notice the claim uses every.', 'Recall flightless birds such as penguins.', 'Check an appropriate reliable source with an adult.'], 'Pause, question, check.', 'Trusting a claim because a page looks professional.', 'Consider the source and supporting evidence, not only appearance.',
   'Does colourful design prove information is correct?', 'No.', 'What could you do when two websites disagree about an animal fact?', 'Ask an adult to help compare reputable sources and check the evidence.']
 ]]
]],
['art', [
 ['Observation and tone', [
  ['Use pressure to vary tone', 'Create light and dark pencil marks through controlled pressure.',
   'Tone describes how light or dark an area appears. With a suitable pencil, light pressure often makes lighter marks and increased pressure makes darker marks. Build darkness gradually rather than pressing so hard the paper tears. A simple tonal scale helps compare several levels side by side.',
   'Make three squares from light to dark.', ['Shade the first with light pressure.', 'Add more layers to the second.', 'Make the third darkest while keeping control.'], 'Build dark gradually.', 'Assuming tone only means a different colour.', 'Compare lightness and darkness using just one pencil.',
   'Can one pencil make several tones?', 'Yes.', 'Why add layers instead of pressing as hard as possible?', 'Layers allow controlled darkening and reduce damage to paper.'],
  ['Notice proportion', 'Compare relative sizes before drawing an object.',
   'Proportion is the size relationship between parts. Before drawing a mug, compare the handle with the body and the height with the width. There is no need for exact measurement at first; use phrases such as roughly half as wide. Looking carefully helps avoid making every part the same size.',
   'The handle is much narrower than the mug body.', ['Sketch the body’s main shape.', 'Compare the handle’s width with the body.', 'Add a smaller handle in the observed position.'], 'Compare parts to the whole.', 'Drawing a tiny body with a huge handle without intending that effect.', 'Check relative sizes against the object, then revise lightly.',
   'What does proportion compare?', 'The sizes of parts relative to each other or the whole.', 'How could you check a drawing before adding detail?', 'Compare the main shapes, their relative sizes and where they meet.']
 ]],
 ['Print and sculpture', [
  ['Make a repeat print', 'Control spacing and orientation in a repeated print design.',
   'Printing transfers a mark from a surface to paper. Use a safe foam shape with washable paint. Apply a thin even coating, press without sliding and lift carefully. Repeat the print with planned spacing. A motif is the shape or design repeated; rotating it changes its orientation.',
   'Print three evenly spaced leaf motifs.', ['Test the paint amount on scrap paper.', 'Place each print after a similar gap.', 'Press and lift without dragging.'], 'Coat, press, lift.', 'Using so much paint that the shape loses detail.', 'Use a thinner even layer and test before printing the final design.',
   'What is a motif?', 'A design or shape repeated in a pattern.', 'What happens if you slide the printing shape while pressing?', 'The print may smear, making its edges and details less clear.'],
  ['Join a clay form securely', 'Make a simple joined form using a suitable joining method.',
   'Clay parts can separate if they are simply pressed together with little contact. With suitable clay and adult guidance, roughen the joining surfaces, add a little slip if appropriate and press together gently. Support narrow parts while working. Methods vary with the modelling material, so follow its instructions.',
   'Join a small clay handle to a thicker body.', ['Roughen the matching contact areas.', 'Use a little suitable slip and press together.', 'Blend and support the join without crushing the form.'], 'Prepare the join, then support it.', 'Attaching a heavy part through one tiny contact point.', 'Increase contact area or redesign the support.',
   'Why does contact area matter?', 'A larger suitable join can support the attached part more securely.', 'Would every modelling material use the same wet-clay method?', 'No. Joining methods depend on the material and its instructions.']
 ]]
]],
['design-tech', [
 ['Wheels and axles', [
  ['Explain a wheel-and-axle mechanism', 'Identify wheels, an axle and a support in a moving model.',
   'A wheel turns around an axle or turns with an axle, depending on the design. The axle support holds the assembly in position while allowing intended rotation. On a simple model vehicle, misaligned supports can make motion difficult. Use safe pre-cut components selected by an adult.',
   'A model car has two wheels on a rod passing through a straw support.', ['Identify the wheels.', 'Identify the rod as the axle.', 'Check that the rod can rotate within the support if that is the chosen design.'], 'Support holds; mechanism moves.', 'Gluing a rotating axle tightly to its support.', 'Keep intended moving surfaces free while securing non-moving parts.',
   'What is an axle?', 'A shaft associated with a rotating wheel or wheels.', 'Why might two crooked axle supports stop a vehicle rolling smoothly?', 'They can misalign the axle and increase rubbing or restrict rotation.'],
  ['Test and improve rolling', 'Use test evidence to improve a wheeled model.',
   'A rolling test needs a consistent start and surface. Release a model gently rather than changing the push each time. Observe whether wheels rub against the body, wobble or fail to turn. Improve the specific cause, then repeat the same test. Longer travel alone may not be the only design criterion.',
   'A wheel rubs against the vehicle body.', ['Observe where movement is restricted.', 'Create a safe small gap or adjust alignment.', 'Repeat the same rolling test.'], 'Find the friction; fix the fit.', 'Adding a stronger push instead of correcting the rubbing wheel.', 'Repair the mechanism rather than hide the problem with force.',
   'Why use the same surface for both tests?', 'Different surfaces affect friction and make comparison less fair.', 'What should you record besides distance?', 'Whether the model rolls straight, moves smoothly and remains safely assembled.']
 ]],
 ['Textiles and food design', [
  ['Plan a textile template', 'Use a template to make matching fabric pieces.',
   'A template is a pattern used to mark a repeatable shape. For a simple fabric pouch, two matching pieces help edges align. Leave an allowance around the intended pouch size for joining, following adult guidance. Use age-appropriate tools and chosen joining methods, such as supervised stitching or suitable fabric adhesive.',
   'Make two matching pouch panels.', ['Draw a paper template with the joining allowance.', 'Mark the shape twice on fabric.', 'Cut safely and compare the panels before joining.'], 'Plan once; match the pieces.', 'Cutting exactly the final inside size and losing space at the join.', 'Allow extra material for the chosen seam or joining method.',
   'Why use one template for both panels?', 'It helps produce matching shapes and sizes.', 'Why check the pieces before joining them?', 'It is easier to correct misalignment or size differences before assembly.'],
  ['Evaluate a food design respectfully', 'Compare a prepared food against agreed criteria and dietary needs.',
   'A food product should meet the intended user’s needs, including allergies and dietary requirements checked by an adult. For a fruit snack, criteria might include safe bite size, a range of textures and easy serving. Tasting is optional; nobody should be pressured to eat a food. Evaluation can use observation and user feedback.',
   'Evaluate a fruit cup for easy serving.', ['Check adult-confirmed dietary requirements.', 'Observe whether pieces fit safely in the serving container.', 'Ask the user whether it is convenient and suggest a specific improvement.'], 'User needs before personal favourites.', 'Calling a product bad solely because it is not your favourite flavour.', 'Evaluate agreed criteria and recognise different preferences.',
   'Who must check allergies before preparing food?', 'A responsible adult.', 'How could you evaluate presentation without tasting?', 'Observe arrangement, portion suitability and serving convenience, and gather willing user feedback.']
 ]]
]],
['music', [
 ['Pattern and structure', [
  ['Create an ostinato', 'Repeat a short musical pattern consistently.',
   'An ostinato is a pattern repeated many times. It may use rhythm, notes or both. Create a four-beat rhythm and repeat it while keeping the pulse steady. Repetition should preserve the pattern’s order and length; adding an extra beat each time changes it rather than repeating it.',
   'Repeat clap-rest-clap-clap over four beats.', ['Count four even beats.', 'Perform the pattern once.', 'Begin the same pattern again on the next first beat.'], 'Same pattern, steady return.', 'Pausing for an extra beat between repetitions.', 'Count continuously through the boundary between repeats.',
   'What makes an ostinato recognisable?', 'The same short pattern keeps returning.', 'Can an ostinato include a rest?', 'Yes. A planned silence can be part of the repeating pattern.'],
  ['Organise an ABA piece', 'Recognise a return to the opening section.',
   'ABA describes a structure with an opening section, a contrasting middle section and a return to the opening. A could be a gentle tapping pattern and B a different rhythm. The final A should be recognisably related to the first. Structure helps listeners follow and anticipate the music.',
   'Plan a short three-section percussion piece.', ['Choose a tapping pattern for A.', 'Choose a contrasting pattern for B.', 'Return to the original A pattern.'], 'Away, then back again.', 'Playing three unrelated sections and calling them ABA.', 'Make the final section a clear return of A.',
   'Which section returns in ABA?', 'A.', 'How could B contrast without becoming dangerously loud?', 'Use a different rhythm, instrument sound or pace while keeping safe volume.']
 ]],
 ['Listening and ensemble', [
  ['Describe tempo and dynamics separately', 'Use tempo and dynamics to describe two different musical features.',
   'Tempo describes speed; dynamics describe loudness. A piece can be slow and loud or fast and quiet. Listen for each feature separately before combining the description. Faster does not automatically mean louder. Comfortable listening volume protects hearing and allows details to be noticed.',
   'Describe a fast, softly played drum pattern.', ['Notice the quick pulse: fast tempo.', 'Notice the soft sound: quiet dynamics.', 'Describe both rather than using only “exciting”.'], 'Tempo: speed. Dynamics: loudness.', 'Using loud to mean fast.', 'Compare two examples where speed changes but volume stays similar.',
   'What does tempo describe?', 'The speed of the music.', 'If a tune becomes louder but keeps the same pulse, what changed?', 'Dynamics changed; tempo stayed the same.'],
  ['Start and finish together', 'Use shared cues to coordinate an ensemble performance.',
   'An ensemble is a group performing together. Agree a ready signal, a count-in and a finishing cue. Watch or use accessible signals while listening to others. Practise entering together before adding complex parts. A shared ending requires attention just as much as a shared beginning.',
   'A group plays four beats and stops together.', ['Follow the agreed count-in.', 'Play four even beats while listening.', 'Stop on the planned cue without an extra hit.'], 'Ready together, finish together.', 'Starting as soon as your instrument is ready.', 'Wait for the shared cue rather than acting independently.',
   'Why use a count-in?', 'It establishes when to begin and the intended tempo.', 'How could a group include someone who cannot easily see the leader?', 'Use an accessible audible or tactile agreed cue with suitable support.']
 ]]
]],
['pe', [
 ['Control and adaptation', [
  ['Send towards a moving partner', 'Adjust a controlled pass to a partner’s movement.',
   'Passing to a moving partner requires watching where they are going as well as where they are now. Begin with slow walking or wheeling and gentle rolling passes in a clear space. Agree a ready signal. Send towards an accessible receiving space, not at the person’s face or an unsafe distance.',
   'A partner moves slowly to the right.', ['Notice their direction and pace.', 'Roll gently towards their likely receiving position.', 'Ask whether the pass was reachable and adjust.'], 'Look ahead, send safely.', 'Aiming only at where the partner was before releasing.', 'Use slow predictable movement while learning to judge the pass.',
   'Why start with slow movement?', 'It makes judging direction and receiving space easier.', 'What should you do if your partner is not ready?', 'Wait for the agreed ready signal before sending.'],
  ['Improve through one clear target', 'Use a specific observation to refine a movement skill.',
   'Feedback is more useful when it names something changeable. “Your roll stopped short; try a little more force” is clearer than “do better”. Choose one target, practise and compare results. Adjust equipment or distance appropriately, and avoid judging someone’s ability from one attempt.',
   'Three rolls stop before the target.', ['Identify the repeated short finish.', 'Increase force slightly while keeping direction.', 'Compare the next attempts with the earlier ones.'], 'Notice one thing; change one thing.', 'Giving many instructions at once.', 'Choose one achievable target and allow practice time.',
   'What makes feedback useful?', 'It is specific, respectful and linked to an action the learner can change.', 'Give useful feedback for a pass that repeatedly goes too far.', '“Try a gentler release and see whether it stops closer to the target.”']
 ]],
 ['Sequences and game decisions', [
  ['Link balance with travel', 'Create a controlled sequence with clear transitions.',
   'A movement sequence can combine travelling, a balance and a change of direction. Plan the transition so you arrive steadily rather than dropping into the balance. Keep movements floor-level and appropriate to the learner. Practise the whole sequence slowly before increasing fluency.',
   'Travel three steps, balance briefly, then turn and finish.', ['Move with control towards the balance space.', 'Settle into a safe supported or unsupported balance.', 'Leave it smoothly, turn and hold a clear finish.'], 'Control the joins, not just the shapes.', 'Rushing between movements and losing stability.', 'Practise the transition separately at a slower pace.',
   'What is a transition?', 'The movement connecting two parts of a sequence.', 'Why include a clear starting and finishing position?', 'They make the sequence intentional and help show control.'],
  ['Choose space in a team game', 'Make a simple tactical choice using available space.',
   'In a small cooperative passing game, standing directly behind another player may make you hard to reach. Move into an open safe space where a partner can see a passing option. Tactics are choices that help achieve the game’s aim. Everyone should have an appropriate role and adapted access when needed.',
   'A teammate has the ball but all nearby routes are crowded.', ['Look for an open safe space.', 'Move there and signal readiness.', 'Offer a clearer passing option without pushing past others.'], 'Find space, show ready.', 'Following the ball into an already crowded area.', 'Spread out to create safe useful options.',
   'What is a simple tactic?', 'A planned choice that helps achieve the game’s aim.', 'Why might spreading out help a passing team?', 'It creates clearer routes and more options for the person sending the ball.']
 ]]
]],
['religious-studies', [
 ['Belief and practice', [
  ['Connect a belief with an action', 'Explain how a belief may influence a practice.',
   'Many religious and non-religious people believe helping others is important. In Islam, charity includes zakat, an obligation for eligible Muslims, and voluntary giving called sadaqah. These practices can express responsibility towards others. Avoid assuming every Muslim has the same financial circumstances or gives in an identical way.',
   'How might giving express care for others?', ['Identify the action: sharing resources.', 'Connect it to a belief about responsibility and need.', 'Recognise that the form and circumstances of giving vary.'], 'Belief can guide action.', 'Assuming only religious people act generously.', 'Compare motives respectfully across religious and non-religious examples.',
   'Does every act of kindness require money?', 'No.', 'Give a non-financial way someone could express care.', 'Offer appropriate time, practical help or supportive attention, with consent and safety in mind.'],
  ['Recognise diversity within a tradition', 'Avoid overgeneralising from one religious example.',
   'A visitor may describe how their family celebrates a festival, but one family does not represent every member of a religion. Customs can vary with place, community and personal circumstances. Use “some”, “many” and the visitor’s own wording carefully. Respectful enquiry makes room for different accounts.',
   'One Christian family attends a midnight Christmas service. Does every Christian family do this?', ['Identify the example as one family’s practice.', 'Recognise that attendance and customs vary.', 'Say some families attend that service, not all.'], 'One example is not everyone.', 'Turning a personal account into a universal rule.', 'Ask whether a claim describes this person, many people or all people.',
   'Why can “all” be risky in descriptions of practice?', 'It may erase real differences between people and communities.', 'Rewrite “All families celebrate in the same way” carefully.', '“Families may celebrate in different ways, even when they share a religious tradition.”']
 ]],
 ['Stories, symbols and meaning', [
  ['Interpret a symbol respectfully', 'Distinguish a symbol’s appearance from its meaning to a community.',
   'A symbol can carry meaning beyond its visible shape. The cross is an important Christian symbol connected with Jesus’s crucifixion and, for Christians, themes including hope and salvation. Its meaning is not simply “two crossing lines”. Learners can describe a belief accurately without being asked to adopt it.',
   'Explain why a cross in a church may matter to worshippers.', ['Describe the visible symbol.', 'Connect it to the Christian story of Jesus.', 'Recognise that it carries religious meaning for the community.'], 'Shape outside, meaning within a tradition.', 'Assuming a symbol has the same meaning in every context.', 'Ask where it is used and how the community explains it.',
   'Can we learn about a belief without sharing it?', 'Yes.', 'Why should we ask participants what a symbol means to them?', 'Their explanation helps us avoid guessing or reducing the symbol to decoration.'],
  ['Compare ideas about kindness', 'Compare a story’s ethical idea with a practical response.',
   'Religious stories and non-religious stories can prompt questions about care, fairness and responsibility. Consider an original story: a child gives up a turn to help a new pupil understand a game. Discuss who benefits and whether other solutions could also be fair. A story can raise questions without supplying one answer for every situation.',
   'Was helping the new pupil the only possible kind response?', ['Identify the need: understanding the game.', 'Recognise that explaining during a pause could also help.', 'Compare how different actions support inclusion.'], 'Ask who needs what.', 'Assuming kindness always means giving away your own turn.', 'Consider helpful actions that also respect everyone’s needs.',
   'Can two different actions both be kind?', 'Yes, depending on needs and consequences.', 'Suggest a way to include a newcomer without pressuring them to play.', 'Explain the rules and offer a choice to join, observe or try a different role.']
 ]]
]],
['pshe', [
 ['Respect and problem-solving', [
  ['Distinguish disagreement from repeated unkindness', 'Recognise when adult support is needed.',
   'Friends can disagree about a game without intending harm. Repeated targeted unkindness, exclusion or intimidation needs adult attention; a child should not be expected to manage it alone. Describe what happened, when and who was involved. Adults can assess the situation without requiring the child to label it perfectly.',
   'A pupil is repeatedly told they cannot join and is mocked each day.', ['Recognise the repeated pattern.', 'Tell a trusted adult what happened.', 'Keep seeking help rather than accepting it as normal friendship conflict.'], 'A pattern needs support.', 'Thinking a child must prove the word bullying before asking for help.', 'Report worrying behaviour regardless of the label.',
   'Can you ask for help after one upsetting incident?', 'Yes.', 'What details help an adult understand a concern?', 'What happened, where, when, who was involved and how it affected you.'],
  ['Negotiate a fair solution', 'Propose and evaluate a solution that considers different needs.',
   'A fair solution considers both people rather than automatically choosing the loudest voice. State each need, suggest options and check agreement. Equal time may help, but different circumstances can call for another arrangement. If a conflict feels unsafe, seek adult support instead of negotiating alone.',
   'Two learners need the same resource for different tasks.', ['Explain what each task needs.', 'Suggest timed turns or an alternative resource.', 'Check that both can complete their task and agree the plan.'], 'Needs, options, agreement.', 'Confusing winning an argument with solving the problem.', 'Judge the plan by whether it meets needs safely and fairly.',
   'Why check agreement after suggesting a plan?', 'A plan is not cooperative if one person is pressured into it.', 'What should you do if someone threatens you during a disagreement?', 'Move to safety and tell a trusted adult; you do not need to negotiate with a threat.']
 ]],
 ['Money and information', [
  ['Distinguish needs and wants', 'Explain a simple spending choice using a limited budget.',
   'A need supports essential care or living, while a want is something desirable but not essential in a particular situation. Context matters: a warm coat may be necessary, while an extra decorative badge may not be. Money is limited, so choices have trade-offs. Avoid judging families by what they can afford.',
   'A character has enough money for a needed lunch or an extra toy, but not both.', ['Identify the immediate need for food.', 'Recognise the toy as an optional want in this example.', 'Prioritise lunch and consider saving for the toy later.'], 'Need now; want can wait.', 'Treating every person’s needs as identical.', 'Ask about the person and situation before classifying.',
   'What does a limited budget mean?', 'There is only a certain amount available to spend.', 'Why might saving help with a want?', 'Putting money aside over time may make the purchase possible without neglecting current needs.'],
  ['Recognise persuasion in advertising', 'Identify an advert’s purpose and pause before responding.',
   'An advert aims to influence choices, often encouraging a purchase or click. Bright pictures, prizes and “only today” messages can create excitement or urgency. An advert is not proof that a product is needed or best. Ask an adult before purchases and never share personal details to claim an unexpected prize.',
   'An app advert says “Buy now or miss out!”', ['Notice the pressure to act quickly.', 'Pause rather than click.', 'Ask a trusted adult whether the purchase is appropriate and genuine.'], 'Pressure is a reason to pause.', 'Thinking an urgent message must be obeyed.', 'Take time to check the purpose, cost and source with an adult.',
   'What is a common purpose of advertising?', 'To persuade people to choose, buy or engage with something.', 'Why is “everyone has one” not a good reason by itself to buy?', 'It may be untrue and does not show whether the product meets your needs or budget.']
 ]]
]]
];
export const batch03 = compileActivities('year-2', subjects);
