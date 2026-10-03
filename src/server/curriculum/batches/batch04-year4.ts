import { compileActivities, type Subject } from '../authoredActivities';

/** Requested continuation batch 4. Original Year 4 lessons, not board-certified specifications. */
const subjects: Subject[] = [
['maths', [
 ['Decimal place value', [
  ['Tenths as numbers', 'Connect tenths, fractions and decimal notation.',
   'Dividing one whole into ten equal parts creates tenths. Three of these parts are three tenths, written 0.3. The first digit after the decimal point counts tenths, not ones. On a number line, 0.3 lies between zero and one. A decimal point marks the boundary between whole-number places and fractional places; it is not itself a unit.',
   'Write thirteen tenths as a decimal.', ['Ten tenths make one whole.', 'Three tenths remain.', 'One whole and three tenths is 1.3.'], 'Ten tenths trade for one whole.', 'Writing thirteen tenths as 0.13.', '0.13 means thirteen hundredths; group the ten tenths into a whole first.',
   'How many tenths make one?', 'Ten.', 'Write seven tenths as a decimal, then seventeen tenths.', '0.7 and 1.7. Seventeen tenths contain ten tenths, or one whole, plus seven tenths.'],
  ['Compare hundredths accurately', 'Compare decimals using equal place-value units.',
   'A tenth contains ten hundredths, so 0.4 and 0.40 represent the same quantity. To compare 0.4 with 0.35, write both in hundredths: forty hundredths and thirty-five hundredths. More decimal digits do not automatically mean a larger number. A hundred-square model shows the quantities as forty shaded squares and thirty-five shaded squares.',
   'Which is greater: 0.6 or 0.58?', ['Rename 0.6 as 0.60.', 'Compare sixty with fifty-eight hundredths.', '0.6 is greater by two hundredths, or 0.02.'], 'Compare like-sized parts.', 'Choosing 0.58 because 58 is greater than 6.', 'Align the place values: six tenths are sixty hundredths.',
   'What is 0.5 written in hundredths?', '0.50, or fifty hundredths.', 'Order 0.72, 0.7 and 0.27, then find the difference between the largest two.', '0.27, 0.7, 0.72. The largest two differ by 0.02 because 0.70 is seventy hundredths.']
 ]],
 ['Multiplication and measures', [
  ['Multiply by partitioning', 'Multiply a two-digit number by a one-digit number using place value.',
   'Multiplication distributes across addition: six groups of twenty-three contain six groups of twenty and six groups of three. Splitting a number into tens and ones keeps each product manageable. Recombine the products only after calculating both. An estimate such as six times twenty helps detect an answer that is much too small.',
   'Calculate 23 × 6.', ['Partition 23 into 20 + 3.', 'Calculate 20 × 6 = 120 and 3 × 6 = 18.', 'Combine 120 + 18 = 138.'], 'Split, multiply both parts, recombine.', 'Multiplying the ones but forgetting that two tens represent twenty.', 'Keep the place-value unit attached: two tens times six is twelve tens.',
   'Why can 23 be split into 20 + 3?', 'The parts add to the same original quantity.', 'Calculate 14 × 4, then 36 × 7.', '56 and 252. For 36 × 7, calculate 30 × 7 = 210 and 6 × 7 = 42, then add.'],
  ['Separate area from perimeter', 'Distinguish covering a surface from measuring its boundary.',
   'Area measures the surface inside a shape; perimeter measures the distance around its edge. A rectangle six centimetres by four centimetres contains twenty-four square centimetres, but its boundary is twenty centimetres long. Square units describe covering; ordinary length units describe a boundary. Different rectangles can have equal area and different perimeters.',
   'Find the area and perimeter of a 5 cm by 3 cm rectangle.', ['Area uses rows of squares: 5 × 3 = 15.', 'Perimeter adds all sides: 5 + 3 + 5 + 3 = 16.', 'Report 15 cm² and 16 cm.'], 'Area covers; perimeter surrounds.', 'Writing a perimeter in square centimetres.', 'Check whether you measured a length or counted covering squares.',
   'Which quantity would help buy a border for a rectangular display?', 'Its perimeter.', 'Compare 6 cm by 2 cm and 4 cm by 3 cm rectangles.', 'Both have area 12 cm². Their perimeters are 16 cm and 14 cm, so equal area does not guarantee equal perimeter.']
 ]]
]],
['english-lang', [
 ['Cohesion and sentence openings', [
  ['Use fronted adverbials', 'Introduce a sentence with information about time, place or manner.',
   'An adverbial adds information about an action. Moving it to the front can guide a reader before the main event: “After the storm, we inspected the garden.” The opening locates the event in time. A comma normally separates the fronted adverbial from the main clause. Choose a useful opening rather than adding one mechanically to every sentence.',
   'Move the place phrase in “The fox waited beside the gate” to the front.', ['Identify beside the gate as the place adverbial.', 'Move it before the main clause.', 'Write “Beside the gate, the fox waited.”'], 'Set the scene, then state the action.', 'Putting a comma after any first word, including the subject.', 'Identify the complete fronted phrase before placing the comma.',
   'Does “Before sunrise” introduce time or place?', 'Time.', 'Rewrite “We crossed the stream carefully” with a manner opening.', '“Carefully, we crossed the stream.” Carefully tells how the crossing happened and is followed by a comma.'],
  ['Maintain clear pronoun reference', 'Use nouns and pronouns without confusing the reader.',
   'Pronouns such as she, he, it and they reduce repetition, but their reference must stay clear. “Maya met Erin after she finished practice” could mean either person finished. When two possible referents compete, repeat the name or restructure the sentence. Clarity matters more than avoiding every repeated noun.',
   'Clarify “Omar lent Ben his coat” when the coat belongs to Omar.', ['Notice his could refer to either boy.', 'Name the owner explicitly.', 'Write “Omar lent his own coat to Ben.”'], 'A pronoun needs a clear partner.', 'Assuming the reader knows which person a pronoun means.', 'Reread from the reader’s viewpoint and name the person if needed.',
   'What does they usually replace?', 'A plural noun phrase, or a person who uses singular they.', 'Clarify “The puppy chased the kitten until it hid” if the kitten hides.', '“The puppy chased the kitten until the kitten hid.” Repeating the noun removes the ambiguity.']
 ]],
 ['Accurate editing', [
  ['Mark plural possession', 'Place apostrophes to show ownership by regular and irregular plurals.',
   'Apostrophes for possession show a relationship, not simply more than one. One girl’s coat belongs to one girl; the girls’ coats belong to several girls. For a regular plural already ending in s, put the apostrophe after that s. Irregular plurals such as children take apostrophe-s: children’s games.',
   'Write a phrase for bags belonging to several teachers.', ['Make the plural teachers.', 'It already ends in s.', 'Add the apostrophe after s: teachers’ bags.'], 'Plural first; possession second.', 'Writing childrens’ because children refers to more than one.', 'Children is already plural without s, so use children’s.',
   'Does the plural word apples need an apostrophe by itself?', 'No.', 'Write phrases for one dog’s bowl and bowls belonging to several dogs.', 'The dog’s bowl; the dogs’ bowls. The apostrophe position distinguishes one owner from several.'],
  ['Punctuate a speech exchange', 'Organise direct speech with reporting clauses and speaker changes.',
   'A conversation needs both accurate speech punctuation and clear speaker changes. Begin a new paragraph when the speaker changes. Punctuation belonging to the spoken words stays inside the inverted commas. A question retains its question mark before the reporting clause: “Are you ready?” asked Kim. The reporting verb does not need an extra comma after that question mark.',
   'Punctuate Kim asking if Jo is ready and Jo answering yes.', ['Write “Are you ready?” asked Kim.', 'Begin a new paragraph for Jo.', 'Write “Yes, I am,” replied Jo.'], 'New voice, new paragraph.', 'Adding a comma after a question mark before closing the speech marks.', 'Use the question mark as the speech punctuation; do not double it with a comma.',
   'When should a dialogue start a new paragraph?', 'When the speaker changes.', 'Punctuate the spoken question Where is the key followed by asked Ravi.', '“Where is the key?” asked Ravi. The question mark is inside the speech marks and asked begins with a lower-case letter.']
 ]]
]],
['english-lit', [
 ['Evidence across a narrative', [
  ['Infer a concealed motive', 'Build an inference from several details rather than one isolated word.',
   'Read: “Ella said she did not mind the result. She folded the score sheet into tiny squares and would not look at the team photograph.” Her statement and actions may conflict. The actions suggest disappointment she does not want to show. An inference is stronger when several clues support it, but alternative explanations remain possible.',
   'Explain whether Ella seems genuinely unconcerned.', ['Her words claim she does not mind.', 'Her repeated folding and avoidance suggest discomfort.', 'She may be concealing disappointment, rather than feeling indifferent.'], 'Words and actions can disagree.', 'Treating a character’s spoken claim as certain proof of their feelings.', 'Compare speech with behaviour and describe the inference cautiously.',
   'Which detail shows Ella avoiding a reminder of the team?', 'She will not look at the team photograph.', 'Give a different possible explanation and identify what extra evidence would help.', 'She might feel embarrassed rather than disappointed. Earlier events explaining the result or her role could help distinguish these interpretations.'],
  ['Explain a turning point', 'Identify an event that changes a character’s choices or the plot direction.',
   'A turning point changes what can happen next; it is not merely the loudest event. In a story where a lost walker finds a map, the discovery changes the problem from being unable to choose a route to deciding which route is safest. Explain the situation before, the new information and its effect afterwards.',
   'Why might finding a map be a turning point?', ['Beforehand, the walker lacks route information.', 'The map introduces possible paths.', 'The character can now make a reasoned route choice.'], 'Before, change, consequence.', 'Choosing any exciting detail without showing its effect on the plot.', 'Ask what becomes possible or impossible because of the event.',
   'Must a turning point involve physical action?', 'No; a discovery or decision can change the plot.', 'A character learns that a rival secretly helped them. Explain a possible turning point.', 'The new information may change hostility into trust, altering later choices. The explanation should be checked against the actual story.']
 ]],
 ['Language and form', [
  ['Analyse a precise verb', 'Explain how a verb shapes a reader’s impression.',
   'Compare “The door closed” with “The door slammed”. Both describe closure, but slammed suggests sudden force and possibly anger, noise or urgency. The word alone does not prove which emotion caused it. Explain the additional impression and connect it with surrounding evidence. Precise verbs can do work that vague verbs plus many adverbs cannot.',
   'Compare “The figure walked” with “The figure crept”.', ['Both describe movement.', 'Crept suggests slow, careful or secretive movement.', 'The reader may become suspicious or cautious, depending on context.'], 'Action plus added impression.', 'Assigning the same fixed emotion to a verb in every passage.', 'Check what the surrounding sentences support.',
   'Which verb suggests sudden noisy closure: shut or slammed?', 'Slammed.', 'Explain the difference between “rain fell” and “rain hammered the roof”.', 'Hammered suggests repeated forceful impacts and a louder, more intense shower; it also gives the rain an action associated with striking.'],
  ['Compare poem structures', 'Connect repetition and line arrangement with an effect on the listener.',
   'A repeated line can provide a refrain, giving listeners a familiar return and emphasising an idea. A poem with steadily shortening lines may instead suggest dwindling sound or energy. Form and meaning interact, but no structure guarantees one effect. Quote or describe the actual pattern before explaining what it contributes.',
   'An original poem ends every verse with “Still the river runs”. What might this do?', ['Identify the repeated line as a refrain.', 'Notice its emphasis on continued movement.', 'The return can contrast the changing events in each verse with the river’s continuity.'], 'Name the pattern, explain its work.', 'Saying repetition is effective without stating what it emphasises.', 'Identify the recurring words and the idea they repeatedly foreground.',
   'What is a refrain?', 'A phrase or line returning at intervals in a poem or song.', 'Could repeating “Hurry, hurry” affect pace? Explain.', 'The repeated short command can create urgency and a quick pulse, especially when read briskly; performance and context also matter.']
 ]]
]],
['science-combined', [
 ['States and the water cycle', [
  ['Distinguish melting from dissolving', 'Explain two different changes using the substances involved.',
   'Melting changes a solid into its liquid state when enough energy is transferred to it. Ice becomes liquid water without another substance being required. Dissolving involves a substance mixing into a solvent: sugar can dissolve in water even while both stay below sugar’s melting temperature. A disappearing solid is therefore not automatically melting.',
   'Compare an ice cube warming with sugar stirred into water.', ['Ice changes from solid water to liquid water.', 'Sugar spreads through the water to form a solution.', 'The first change is melting; the second is dissolving.'], 'Melting changes state; dissolving mixes substances.', 'Calling every solid that disappears melted.', 'Ask whether a second substance acts as a solvent.',
   'Does ice need a solvent to melt?', 'No.', 'A puddle dries and water droplets appear on a cold glass. Name the changes.', 'Evaporation changes liquid water into water vapour; condensation changes water vapour into liquid droplets on the cold surface.'],
  ['Trace water through a cycle', 'Link evaporation, condensation and precipitation.',
   'Energy from the Sun helps water evaporate from surfaces. Water vapour can cool and condense into tiny liquid droplets that form clouds. When droplets or ice particles grow sufficiently, precipitation falls. Water may run into rivers or soak into soil. The cycle is not a single fixed route: different water can spend different times in each store.',
   'Trace some rainwater from a pond back to rain.', ['Pond water gains energy and some evaporates.', 'Vapour cools and condenses into cloud droplets.', 'Growing droplets eventually fall as precipitation.'], 'Evaporate, condense, precipitate.', 'Saying clouds are made only of invisible water vapour.', 'Clouds are visible because they contain tiny droplets or ice particles.',
   'What is precipitation?', 'Water falling from the atmosphere, such as rain, snow or hail.', 'Why can water evaporate on a day when it is not boiling?', 'Evaporation occurs from a liquid surface below boiling point; some surface particles have enough energy to escape.']
 ]],
 ['Sound and electrical circuits', [
  ['Connect vibration with pitch', 'Distinguish changes in pitch from changes in loudness.',
   'Sound begins with a vibrating source and travels through a material as vibrations are passed on. Faster vibrations correspond to higher pitch. Larger-amplitude vibrations generally make a louder sound under comparable conditions. On a safely held ruler extending over a desk edge, shortening the free section can make its vibration faster and its pitch higher.',
   'Compare a long and short free section of a ruler.', ['Pluck gently with adult guidance and keep volume comfortable.', 'Shorten the free section while keeping the setup similar.', 'The shorter section usually vibrates faster and produces a higher pitch.'], 'Faster vibration, higher pitch.', 'Calling a louder sound higher without checking pitch.', 'Compare the height of the note separately from its loudness.',
   'What must a sound source do?', 'Vibrate.', 'If the same note becomes louder without changing pitch, what changed?', 'The vibration amplitude increased while its frequency stayed approximately the same.'],
  ['Find a break in a simple circuit', 'Explain why a complete conducting loop is needed.',
   'A cell can drive an electric current around a complete conducting circuit. A gap stops current in a simple series circuit, so a lamp goes out. A switch deliberately opens or closes that path. Use only low-voltage classroom cells under supervision, never mains sockets, and avoid directly joining the cell terminals without a component.',
   'A lamp does not light because one wire misses the metal terminal.', ['Check the cell, lamp and connecting wires.', 'Identify the gap at the terminal.', 'Reconnect the conducting loop and test the lamp safely.'], 'Complete loop, conducting contacts.', 'Connecting to a plastic holder rather than a metal contact.', 'Trace the metal path through every connection.',
   'What does an open switch do?', 'It breaks the conducting path.', 'A circuit has a complete loop through a wooden strip but the lamp stays off. Why?', 'An ordinary dry wooden strip is a poor conductor, so a geometrically complete path is not necessarily an effective electrical path.']
 ]]
]],
['history', [
 ['Roman Britain', [
  ['Explain reasons for Roman expansion', 'Distinguish a historical cause from a later consequence.',
   'Roman conquest of Britain began under Emperor Claudius in AD 43, after earlier expeditions by Julius Caesar. Possible motives included political prestige, strategic control and access to resources. Roads and towns expanded under Roman rule, but these later developments should not automatically be treated as the original motives. Separate evidence about intentions from evidence about outcomes.',
   'Is the growth of Roman towns a cause or consequence of conquest?', ['Place conquest before the growth being discussed.', 'Identify town development as an outcome of rule.', 'Explain that an outcome is not by itself evidence of the initial motive.'], 'Before can explain; after can result.', 'Treating every later benefit as a proven reason for invasion.', 'Look for evidence about decision-makers and the situation before conquest.',
   'Which emperor is associated with the conquest beginning in AD 43?', 'Claudius.', 'Give two possible motives for expansion and explain why they are not identical.', 'Resources concern material gain; political prestige concerns power and reputation. Both may matter, but they answer different questions about motivation.'],
  ['Understand resistance in AD 60 or 61', 'Explain that conquered communities could respond differently to Roman rule.',
   'Boudica, queen of the Iceni, led a major revolt against Roman rule around AD 60 or 61. Roman treatment of local leaders and communities contributed to conflict. Ancient written accounts largely survive through Roman authors, so they require careful reading alongside archaeology. Do not assume everyone in Britain either welcomed Rome or opposed it in the same way.',
   'Why should we compare written accounts with destruction evidence?', ['Written accounts offer an author’s narrative and viewpoint.', 'Burnt layers or damaged settlements provide material evidence.', 'Comparing them can support or challenge claims about where destruction occurred.'], 'Resistance had causes; accounts have viewpoints.', 'Assuming a Roman account directly records every rebel’s thoughts.', 'Distinguish the author’s claims from independently supported evidence.',
   'Which people is Boudica associated with?', 'The Iceni.', 'Why is “all Britons had the same view of Rome” an unsafe claim?', 'Communities and individuals had different interests and experiences; surviving evidence does not support one universal response.']
 ]],
 ['Settlement and historical claims', [
  ['Use a Roman road as evidence', 'Connect a surviving feature with several plausible uses.',
   'Roman roads helped armies, officials, traders and messages move across controlled territory. A surviving straight road section can indicate engineering choices, but not every journey followed a perfectly straight route. Terrain, crossings and existing settlements affected routes. The same infrastructure can serve military and civilian purposes rather than having only one use.',
   'Explain why a road linking a fort and a town mattered.', ['A fort needed supplies and communication.', 'A town provided people, goods and services.', 'The road could support both military movement and trade.'], 'One feature, several functions.', 'Calling every straight modern road Roman without evidence.', 'Check archaeological records, maps and dating evidence.',
   'Name one non-military use of a Roman road.', 'Trade, official messages or civilian travel.', 'Why might an engineer choose a bridge crossing rather than the shortest straight line?', 'A usable safe crossing and terrain can matter more than the shortest map distance.'],
  ['Separate evidence from reconstruction', 'Evaluate what a museum reconstruction shows and what it infers.',
   'A reconstructed Roman room may combine excavated remains with informed choices about missing parts. Surviving floor mosaics can be direct evidence, while the exact wall colours or furniture arrangement may be less certain. Reconstructions help visitors imagine a space, but attractive detail should not be confused with proof. Read labels explaining the basis of each feature.',
   'A display rebuilds a room around an excavated mosaic.', ['Identify the original surviving floor evidence.', 'Ask which upper walls or furnishings were reconstructed.', 'Describe confidence separately for original remains and inferred details.'], 'Original trace or informed choice?', 'Assuming every visible object in a reconstruction came from that site.', 'Check the labels and supporting archaeological explanation.',
   'Can a reconstruction be useful even if some details are uncertain?', 'Yes, if the evidence and uncertainties are explained.', 'What would strengthen a claim about the room’s wall colour?', 'Surviving plaster with pigment from the relevant context, rather than colour chosen only for display.']
 ]]
]],
['geography', [
 ['River processes', [
  ['Explain erosion and deposition', 'Distinguish removing material from leaving it behind.',
   'A river can erode its bed and banks, transport material and deposit it when conditions reduce its ability to carry that load. Erosion removes; deposition builds up. These processes can happen at different places along one river at the same time. Do not assume a river carries every particle from its source to the sea without stopping.',
   'A river carries sand into a slower pool.', ['The sand is transported while the flow can carry it.', 'The flow slows in the pool.', 'Some sand settles, producing deposition.'], 'Erode away; deposit to stay.', 'Calling a new sand bank erosion.', 'Describe whether material is removed from or added to that location.',
   'What does transportation mean in a river system?', 'Movement of material carried by the river.', 'Why can a river’s shape change over time?', 'Erosion removes material and deposition adds it elsewhere, gradually altering the channel and nearby land.'],
  ['Interpret a river bend', 'Explain contrasting processes on a meander.',
   'On a typical meander, faster flow near the outside of the bend encourages bank erosion, while slower flow near the inside encourages deposition. This can create a steeper outer bank and a gentler inner slip-off slope. The pattern is a useful model, but real channels vary with floods, obstacles and bank material.',
   'Label likely erosion and deposition on a simple bend.', ['Find the outside of the bend.', 'Associate it with faster flow and erosion.', 'Label slower inner flow with deposition.'], 'Outer wears; inner layers.', 'Assuming the inside always has faster water because the route is shorter.', 'Use the observed flow pattern rather than only path length.',
   'Which side of a typical meander develops deposition?', 'The inside of the bend.', 'A photograph shows a sand bank on the inner bend. What process probably built it?', 'Deposition: transported sediment settled where the river’s ability to carry it was reduced.']
 ]],
 ['Cities and comparative evidence', [
  ['Compare London and Paris as river cities', 'Use shared criteria when comparing settlements.',
   'London lies on the Thames and Paris on the Seine. Both are capitals with river crossings and major transport systems, but a useful comparison needs common criteria: location, river use, transport or land use. One attractive photograph cannot establish typical conditions across either city. Dates matter when using population or transport figures.',
   'Compare river use in the two cities.', ['Identify the Thames and Seine correctly.', 'Choose the same criterion, such as crossings or riverside land use.', 'Use dated maps or evidence for each rather than mixing unrelated observations.'], 'Same question for both places.', 'Comparing one city’s population with the other’s weather as if they answer the same question.', 'Organise evidence under matched headings.',
   'Which river flows through Paris?', 'The Seine.', 'Why should two population figures use comparable boundaries?', 'A central-city population and a whole urban-region population cover different areas and can make a misleading comparison.'],
  ['Read a climate graph', 'Distinguish monthly patterns from daily weather.',
   'A climate graph often shows average monthly temperature with a line and monthly rainfall with bars. Read each axis and its unit before interpreting height. The graph summarises a period of observations rather than predicting the weather on a particular day. A warm average month may still contain cool or wet days.',
   'A graph shows July at 19°C and January at 5°C.', ['Identify these as average temperatures.', 'Subtract 5 from 19.', 'July’s average is 14°C higher; this does not describe every individual day.'], 'Axes first, pattern next.', 'Reading rainfall bars using the temperature scale.', 'Match each data series with its labelled axis and unit.',
   'What unit commonly measures rainfall depth?', 'Millimetres.', 'The wettest average month has 80 mm and the driest 35 mm. Find the difference and state its limit.', '45 mm. It compares monthly averages and does not prove how much rain will fall in those months next year.']
 ]]
]],
['computer-science', [
 ['Repetition in programs', [
  ['Replace repeated commands with a loop', 'Use a counted loop for an exact number of repetitions.',
   'A counted loop runs a block of instructions a specified number of times. To draw a square, repeating move and turn four times is clearer than copying eight separate commands. The turn must be a quarter-turn each time. Keep every action that needs repeating inside the loop; an instruction outside it runs separately.',
   'Plan a square with sides of 50 units.', ['Choose move 50 and turn right 90 degrees as the block.', 'Repeat the block four times.', 'The character returns to its start and original facing direction.'], 'Repeat the whole unit.', 'Putting the turn outside the loop.', 'Include both movement and turning in each repetition.',
   'How many right-angle turns make one full turn?', 'Four.', 'What happens if a square-drawing loop runs only three times?', 'It draws three sides and finishes at the fourth corner without drawing the final side back to the start.'],
  ['Distinguish counted and continuous loops', 'Choose repetition based on whether a definite count is needed.',
   'A repeat-ten loop stops after ten cycles, while a continuous loop keeps running until the program or loop is stopped. A clock animation may need continuing repetition; drawing a fixed polygon needs a known count. Continuous loops can overwhelm a program if they repeatedly create resources without control, so the intended stopping behaviour matters.',
   'Choose a loop for blinking a sprite until the stop button is pressed.', ['The number of blinks is not fixed in advance.', 'Use continuous repetition with an appropriate delay.', 'Provide the normal program stop control.'], 'Known count or ongoing behaviour?', 'Using a continuous loop for a task that must finish after six actions.', 'State the stopping requirement before selecting the loop.',
   'Which loop suits exactly eight drum beats?', 'A counted loop repeating eight times.', 'Why include a delay in a blinking animation?', 'Without a suitable pause, state changes may happen too quickly for the viewer to see a clear blink.']
 ]],
 ['Data and digital production', [
  ['Check data before making a chart', 'Identify missing, duplicated or inconsistent records.',
   'A chart can faithfully display poor data and still mislead. Before charting a survey, check whether each person was counted once, categories mean the same thing and missing responses are recorded. “No answer” is not necessarily “none”. Correct errors from evidence rather than inventing replacements to make the table look complete.',
   'A transport survey records the same pupil twice.', ['Check the source list to confirm the duplicate.', 'Remove only the extra record.', 'Recalculate category totals before drawing the chart.'], 'Check the table before the picture.', 'Treating every blank response as a zero or negative answer.', 'Distinguish missing information from an observed zero.',
   'Can a well-drawn graph prove its source data are reliable?', 'No.', 'Why should “walk” and “walking” usually be combined in a school-travel chart?', 'They describe the same category, so inconsistent labels would split one group misleadingly.'],
  ['Plan a responsible digital publication', 'Choose content and permissions for a shared digital product.',
   'Publishing a poster or slideshow involves more than arranging images. Check that information is accurate, images are licensed or permitted and personal details are appropriate to share. A school-approved platform does not make every upload safe. Plan the audience and ask a responsible adult before sharing identifiable images of children.',
   'Prepare a class-trip slideshow for a school audience.', ['Select accurate captions and suitable images.', 'Check school permissions for identifiable people.', 'Use the approved sharing method and review before publishing.'], 'Audience, accuracy, permission.', 'Assuming an image found online is free to reuse.', 'Check the licence or use material you are allowed to publish.',
   'Does crediting an image automatically grant permission to use it?', 'No.', 'Why might a publicly shared slideshow need different content from a private classroom version?', 'A public audience can include strangers, so personal details and permissions require additional care.']
 ]]
]],
['french', [
 ['Articles and classroom nouns', [
  ['Use un and une', 'Learn a noun together with its indefinite article.',
   'French nouns have grammatical gender. Un livre means a book; une règle means a ruler. The article is part of useful vocabulary learning, because gender is not reliably guessed from an object’s appearance. Grammatical gender describes words, not whether an object is suitable for a boy or girl. Listen to the whole noun phrase when practising.',
   'Say “a book and a ruler”.', ['Recall un livre as one phrase.', 'Recall une règle as another.', 'Join them with et: un livre et une règle.'], 'Learn the article with the noun.', 'Choosing une for an object because its owner is a girl.', 'The noun’s grammatical gender controls the article, not the owner.',
   'Which article accompanies livre in this lesson?', 'Un.', 'Translate une règle et un livre.', 'A ruler and a book. Et means and; each noun keeps its own article.'],
  ['Build a simple possession sentence', 'Use J’ai with an article and classroom noun.',
   'J’ai means I have. Combine it with a complete noun phrase: J’ai un livre. The apostrophe in j’ai replaces the vowel of je before ai. To list two items, join the noun phrases with et. Do not insert the English word have or remove the noun’s article when translating a straightforward countable item.',
   'Say “I have a ruler and a book”.', ['Start with J’ai.', 'Add une règle.', 'Continue et un livre: J’ai une règle et un livre.'], 'J’ai plus the complete noun phrase.', 'Writing Je ai as two full words.', 'Use the standard elided form J’ai.',
   'What does J’ai mean?', 'I have.', 'Translate “I have a book” and then change book to ruler.', 'J’ai un livre. J’ai une règle. Both the noun and its article change.']
 ]],
 ['Age and preferences', [
  ['Give an age with avoir', 'Use the French expression for age rather than translating English word for word.',
   'French states age with avoir, the verb to have: J’ai neuf ans means I am nine years old. Literally the structure is I have nine years. In this sentence ans means years. Practise huit, neuf, dix and onze as eight, nine, ten and eleven using a reliable spoken model.',
   'Say that a fictional speaker is ten years old.', ['Choose J’ai rather than Je suis.', 'Add dix.', 'Finish with ans: J’ai dix ans.'], 'French has its years.', 'Using Je suis dix ans because English uses I am.', 'Use the established age pattern J’ai ... ans.',
   'What does neuf mean?', 'Nine.', 'Translate J’ai huit ans, then write “I am eleven years old”.', 'I am eight years old. J’ai onze ans. The number changes, while the age pattern remains.'],
  ['Express a preference with j’aime', 'Build a preference sentence using a taught activity phrase.',
   'J’aime means I like. Follow it with an activity in its infinitive form, such as dessiner, to draw: J’aime dessiner. J’aime chanter means I like singing. The infinitive is the verb’s dictionary form. This pattern differs from naming a possessed object after J’ai, so keep the two expressions distinct.',
   'Say “I like drawing and singing”.', ['Begin J’aime.', 'Add dessiner.', 'Join et chanter: J’aime dessiner et chanter.'], 'J’ai: I have. J’aime: I like.', 'Using J’ai before an activity to mean I like it.', 'Choose the phrase for the intended meaning before adding vocabulary.',
   'Which taught infinitive means to sing?', 'Chanter.', 'Translate J’aime chanter and compose a sentence saying you like drawing.', 'I like singing. J’aime dessiner. The activity remains an infinitive after j’aime.']
 ]]
]],
['spanish', [
 ['Nouns and possession', [
  ['Learn un and una with nouns', 'Match a taught Spanish noun with its indefinite article.',
   'Un libro means a book and una regla means a ruler. Spanish nouns have grammatical gender, which affects articles. Many nouns ending in o are masculine and many ending in a are feminine, but this is not a rule without exceptions. Learn each noun with its article instead of assigning gender from an object’s owner.',
   'Say “a book and a ruler”.', ['Use un libro.', 'Use una regla.', 'Join them with y: un libro y una regla.'], 'Article and noun travel together.', 'Changing an object’s article according to who owns it.', 'Use the noun’s grammatical gender.',
   'What does y mean between noun phrases?', 'And.', 'Translate una regla y un libro.', 'A ruler and a book. Regla uses una; libro uses un in these phrases.'],
  ['Use tengo in a sentence', 'Express possession with a taught classroom noun phrase.',
   'Tengo means I have. Spanish often omits the subject pronoun because the verb form already identifies the speaker. Tengo un libro is therefore a complete sentence meaning I have a book. Yo tengo is also possible, especially for emphasis. Keep the appropriate article before a singular countable object.',
   'Say “I have a ruler”.', ['Choose Tengo.', 'Recall una regla.', 'Combine them: Tengo una regla.'], 'Tengo already includes the speaker.', 'Thinking every Spanish sentence must begin with yo.', 'Recognise that verb endings and forms often identify the subject.',
   'What does tengo mean?', 'I have.', 'Write “I have a book and a ruler”.', 'Tengo un libro y una regla. Both complete noun phrases follow tengo.']
 ]],
 ['Age and colour agreement', [
  ['Express age with tener', 'Use the Spanish age construction accurately.',
   'Spanish uses tener, to have, for age: Tengo nueve años means I am nine years old. The ñ in años represents a different sound from n and is part of the correct word. Practise ocho, nueve, diez and once as eight, nine, ten and eleven. Do not translate the English verb am directly in this pattern.',
   'Say “I am ten years old”.', ['Choose Tengo.', 'Add diez.', 'Finish años: Tengo diez años.'], 'Spanish has its years.', 'Using soy before a number of years.', 'Use Tengo ... años for your age.',
   'Which taught number means eight?', 'Ocho.', 'Translate Tengo once años, then write the sentence for a nine-year-old.', 'I am eleven years old. Tengo nueve años. The age expression stays the same while the number changes.'],
  ['Make a colour adjective agree', 'Use a taught colour adjective with masculine and feminine nouns.',
   'In these noun phrases, the colour follows the noun and agrees with its grammatical gender. Un libro rojo is a red book; una regla roja is a red ruler. Rojo changes to roja, but not every colour adjective follows this exact pattern: azul does not change for masculine versus feminine singular nouns. Learn the relevant pattern rather than applying o-to-a universally.',
   'Describe a red ruler.', ['Choose the feminine noun phrase una regla.', 'Place the colour after the noun.', 'Use roja: una regla roja.'], 'Noun first; check agreement.', 'Changing azul to an invented feminine form.', 'Learn which colour words vary and which keep the same singular form.',
   'What is the feminine form of rojo?', 'Roja.', 'Translate “a red book” and “a blue ruler”.', 'Un libro rojo; una regla azul. Rojo agrees by changing o/a, while azul keeps its singular form here.']
 ]]
]],
['art', [
 ['Colour relationships', [
  ['Use warm and cool colour contrasts', 'Explain a colour choice in relation to surrounding colours.',
   'Artists often describe reds, oranges and yellows as warm, and blues and many greens as cool. These are useful associations rather than fixed emotional laws. A small warm area against a cool background can attract attention through contrast. Pigment, lighting and neighbouring colours affect the result, so test combinations rather than assuming a colour always produces one feeling.',
   'Make a focal boat stand out on a blue sea.', ['Keep much of the surrounding sea in related cool colours.', 'Try a small orange boat shape.', 'Compare whether the contrast draws attention to the boat.'], 'Contrast depends on neighbours.', 'Saying blue always makes every viewer feel sad.', 'Describe the colour relationship and possible effect without universal claims.',
   'What does a focal point mean in an artwork?', 'An area intended to attract particular attention.', 'How could you reduce the boat’s visual prominence?', 'Use a colour closer to the background, reduce contrast or change its size and placement.'],
  ['Mix a controlled range of tones', 'Use repeated comparisons to make a deliberate tonal scale in paint.',
   'A tint lightens a colour through the addition of white; a shade darkens it through black in this classroom mixing approach. Black can dominate a mixture, so add very small amounts. Keep records of mixtures and compare adjacent swatches. A useful scale changes gradually rather than jumping from nearly white to almost black.',
   'Make three increasingly dark blue samples.', ['Start with an unmixed blue sample.', 'Add a very small amount of black to a second portion.', 'Increase the black slightly in a third portion and compare all three.'], 'Small additions give control.', 'Adding a large amount of black and losing the original colour.', 'Mix tiny additions into separate test portions first.',
   'What is a tint in paint mixing?', 'A colour lightened with white.', 'Why keep an unchanged sample beside the mixtures?', 'It provides a reference so you can judge how much each mixture changed.']
 ]],
 ['Drawing and print development', [
  ['Use negative space to check a drawing', 'Observe the shapes around an object as well as the object itself.',
   'Negative space is the area around or between the main objects in an image. The gap inside a chair’s back can be easier to compare than several separate bars. Drawing those gaps accurately can improve the proportions of the solid parts. Negative does not mean unimportant or necessarily dark; it describes a relationship to the chosen subject.',
   'Check a drawing of scissors lying flat.', ['Observe the shapes inside the handles.', 'Compare those spaces with your drawing.', 'Adjust the surrounding outlines to match the observed spaces.'], 'Draw the gap to check the thing.', 'Treating empty areas as irrelevant background.', 'Compare the shapes of spaces just as carefully as solid objects.',
   'Does negative space have to be black?', 'No.', 'How could looking between tree branches help a drawing?', 'The shapes and angles of the gaps can reveal whether branch positions and proportions are accurate.'],
  ['Develop a two-layer print', 'Plan alignment and colour order in a simple layered print.',
   'Layered printing places more than one print over the same area. Registration means aligning the layers consistently. Marking the paper position and testing on scrap paper helps. A lighter broad layer often works before a darker detailed layer, but the intended effect determines the order. Wet layers may mix or smudge, so follow the material’s drying guidance.',
   'Print a pale background shape with a darker detail layer.', ['Mark a consistent paper position.', 'Print the first layer and allow suitable drying.', 'Align and print the detail layer using the same registration marks.'], 'Place, print, align again.', 'Assuming the second layer will automatically line up by eye.', 'Use registration guides and a test print.',
   'What does registration mean in printing?', 'Accurate alignment of separate layers or colours.', 'Why might a deliberately offset layer be acceptable?', 'Misalignment can be an intentional artistic choice if it supports the planned effect rather than resulting from an unnoticed error.']
 ]]
]],
['design-tech', [
 ['Electrical products', [
  ['Design a low-voltage light for a user', 'Connect functional criteria with a safe circuit and housing.',
   'A model reading light needs a working lamp, an accessible switch and a stable housing. Use only approved low-voltage classroom components with adult supervision. The housing should support the parts without crushing wires or preventing access to the cell holder. A design drawing should show both the visible product and the circuit it contains.',
   'Plan a model light that can be switched on without opening its case.', ['Place the switch where the user can reach it.', 'Show a complete low-voltage circuit inside.', 'Plan a stable case with safe access for adult battery replacement.'], 'User outside, working system inside.', 'Designing an attractive case with no room for the components.', 'Measure components and plan their positions before making the housing.',
   'Why should a switch be accessible?', 'So the intended user can operate the product safely and conveniently.', 'Give a testable criterion beyond “the light works”.', 'For example, the model must remain upright when its switch is operated on a level table.'],
  ['Troubleshoot a made circuit product', 'Use a systematic sequence to locate a fault safely.',
   'A non-working model may have a loose contact, an incorrectly fitted component or an exhausted cell. Check one possibility at a time using known working components and adult guidance. Never bypass safety controls or connect to mains electricity. Record the fault and the correction so the evaluation explains more than simply whether the final product lit up.',
   'A lamp worked before the case was closed but now stays dark.', ['Disconnect power before inspecting the case.', 'Check whether closing it pulled a wire away from a contact.', 'Repair the secure connection with adult help and retest safely.'], 'One fault hypothesis, one safe check.', 'Replacing every component at once and losing the cause of the problem.', 'Change one factor at a time where safe and practical.',
   'Why inspect the housing as well as the circuit?', 'The housing can dislodge, pinch or obstruct components.', 'What would make a troubleshooting note useful?', 'It should state the observed problem, the check made, the confirmed fault and the successful correction.']
 ]],
 ['Structures and user testing', [
  ['Strengthen a frame with triangles', 'Explain how bracing changes a frame’s stability.',
   'A rectangular frame with flexible corner joints can lean into a parallelogram without changing the lengths of its sides. Adding a diagonal brace creates triangles and restricts that shape change. Stability still depends on joints, material and load; a triangular outline alone cannot guarantee safety. Use light classroom models rather than testing structures with body weight.',
   'Improve a wobbling rectangular model frame.', ['Gently observe how the corners move.', 'Add a suitable diagonal brace securely.', 'Repeat the same gentle test and compare sideways movement.'], 'A diagonal can stop the lean.', 'Assuming thicker decoration is equivalent to a structural brace.', 'Place material where it resists the observed movement.',
   'What shape change can an unbraced rectangle make?', 'It can lean into a parallelogram if its joints allow movement.', 'Why test the joints after adding a brace?', 'The brace can only transfer forces effectively if its connections hold as intended.'],
  ['Use user feedback critically', 'Distinguish an observed usability problem from a personal preference.',
   'User testing investigates whether a product serves its intended audience. “I could not reach the switch” identifies a functional problem, while “I prefer green” reports a preference. Both may inform design, but prioritise safety and essential use. Observe tasks and ask neutral questions instead of telling the user the answer you hope to hear.',
   'A tester struggles to open a small handle.', ['Observe which action is difficult.', 'Ask what made gripping hard without suggesting blame.', 'Consider changing handle size or position, then test again.'], 'Watch the task; ask neutrally.', 'Asking “You like my excellent design, don’t you?”', 'Use a neutral prompt such as “What was easy or difficult to use?”',
   'Why is leading feedback less reliable?', 'It can pressure the user to agree rather than report their experience.', 'Which should usually be addressed first: a sharp edge or a preferred colour?', 'The sharp edge, because safety is a fundamental requirement rather than a decorative preference.']
 ]]
]],
['music', [
 ['Rhythmic notation', [
  ['Read crotchets and paired quavers', 'Maintain a pulse while performing two common note values.',
   'In a simple classroom context where a crotchet receives one beat, two quavers share that same beat equally. The pulse does not double just because there are more notes. Count a beat and its halfway point as “one-and”. Learn the relationship through sound and movement before relying only on the symbols.',
   'Perform one crotchet followed by two quavers.', ['Keep two equally spaced beats.', 'Clap once on the first beat.', 'Clap on the second beat and its halfway point: one, two-and.'], 'Two quavers share one crotchet beat.', 'Giving each quaver a whole beat and lengthening the phrase.', 'Keep the underlying pulse steady while dividing a beat.',
   'How many quavers equal one crotchet in duration?', 'Two.', 'How many crotchet beats do four quavers occupy?', 'Two beats, when each pair divides one crotchet beat equally.'],
  ['Keep time through a notated rest', 'Count silent durations as part of a complete phrase.',
   'A rest has a duration even though no note sounds. In a four-beat phrase, a crotchet rest occupies the same time as one crotchet note. Count or feel the silent beat so the next entry stays in the correct place. Silence can create space, surprise or anticipation rather than being a gap outside the music.',
   'Perform crotchet, crotchet rest, two quavers, crotchet.', ['Count four steady beats.', 'Sound beat one, stay silent on beat two.', 'Play two equal sounds on beat three and one on beat four.'], 'Silence still takes time.', 'Removing the rest and starting the next note too soon.', 'Count the rest internally or use a silent movement.',
   'How long is a crotchet rest relative to a crotchet note?', 'The same duration.', 'Why can a group lose coordination if one player ignores rests?', 'That player’s later notes arrive early, no longer aligning with the shared pulse or other parts.']
 ]],
 ['Melodic and ensemble choices', [
  ['Shape a musical question and answer', 'Create related phrases with contrasting endings.',
   'A musical question-and-answer pair uses a first phrase that invites continuation and a second that responds. They may share rhythm or opening notes while ending differently. A return to a stable home note can help the answer feel settled in a tonal exercise. These are compositional choices, not spoken grammar translated into notes.',
   'Make two short phrases using C, D, E and G.', ['Create a first phrase ending on G.', 'Begin the response with a related rhythm.', 'Try ending the response on C and listen for a sense of return.'], 'Related start, responding finish.', 'Making two unrelated phrases without a recognisable connection.', 'Repeat or adapt one rhythmic or melodic feature.',
   'Must an answer phrase copy every note of the question?', 'No.', 'Name one way to relate the phrases without exact copying.', 'Keep the rhythm but alter pitches, or repeat an opening motif with a different ending.'],
  ['Balance parts during rehearsal', 'Adjust dynamics so an intended main part remains audible.',
   'Ensemble balance depends on the roles of the parts, not giving every instrument the same effort. A naturally loud percussion instrument may need a lighter touch behind a melody. Record a short rehearsal with permission or ask a listener to describe what they hear. Make a specific adjustment and compare the result.',
   'A shaker pattern hides a softly played tune.', ['Identify the tune as the intended main part.', 'Reduce or simplify the shaker part.', 'Replay and check that both roles can be heard.'], 'Equal importance is not equal volume.', 'Asking the melody to become uncomfortably loud to compete.', 'Reduce the competing part or change its texture first.',
   'What is ensemble balance?', 'The relative audibility of parts in relation to their intended roles.', 'Why listen from the audience position during rehearsal?', 'Sound balance can differ from what an individual performer hears beside their own instrument.']
 ]]
]],
['pe', [
 ['Attacking and defending decisions', [
  ['Create space with movement', 'Use direction and timing to make a safe passing opportunity.',
   'In a small-sided invasion game, moving away and then into a clear space can help a receiver become available. Timing matters: arriving too early may allow the space to close. Use non-contact rules, suitable equipment and adaptations for all participants. The aim is a useful option, not outpacing every other learner.',
   'A passing lane is blocked by another player.', ['Scan for a different safe lane.', 'Move at a suitable moment while keeping distance.', 'Signal readiness when the route becomes clear.'], 'Space plus timing makes an option.', 'Running constantly without checking the ball carrier’s view.', 'Move with a purpose and look for a usable passing line.',
   'Why can standing behind another player make receiving difficult?', 'The passing route and visibility may be blocked.', 'Give an adaptation that keeps the tactical learning while reducing speed demands.', 'Use walking-only play, wider zones or extra decision time so learners can still practise choosing space and timing.'],
  ['Defend by controlling space', 'Use position rather than unsafe contact to limit an attacking option.',
   'A defender can make a route less available by positioning themselves between an attacker and a target while following the game’s rules. Watch the situation rather than grabbing or pushing. A good defensive choice may slow play or guide it away from a dangerous area without winning the ball immediately.',
   'An attacker approaches a scoring zone in a non-contact game.', ['Identify the route to the target.', 'Move into a legal position with safe spacing.', 'Limit the route while avoiding body contact or obstruction outside the rules.'], 'Protect the space, respect the rule.', 'Treating defending as permission to push or grab.', 'Use positioning and anticipation within the agreed rules.',
   'Can defence succeed without immediately gaining possession?', 'Yes, by reducing options or delaying an attack.', 'Why should a defender look beyond the ball alone?', 'Other players and spaces indicate possible passes and help the defender choose a useful position.']
 ]],
 ['Athletics and performance feedback', [
  ['Pace a sustained activity', 'Adjust effort to maintain a planned activity over time.',
   'Pacing means distributing effort rather than using maximum speed at the start. For a suitable timed run, walk or wheel, begin at an effort that can be maintained and monitor comfort. Needs vary with fitness, disability, conditions and health; stop and tell an adult if feeling unwell. Compare a learner’s own attempts, not bodies or worth.',
   'A learner starts very fast and must stop early.', ['Identify the unsustainable opening effort.', 'Choose a gentler beginning for the next suitable attempt.', 'Review whether effort stayed more even and comfortable.'], 'Start with something left.', 'Thinking maximum speed is the goal of every activity.', 'Match effort to the task’s duration and the learner’s needs.',
   'What does pacing distribute?', 'Effort over the activity.', 'How can a pacing task be inclusive?', 'Use individual targets, suitable movement modes, planned rests and adult-guided adjustments rather than one identical speed for everyone.'],
  ['Use a criterion to assess a sequence', 'Give evidence-based feedback on a chosen performance feature.',
   'A criterion directs observation: “hold a controlled finish” is clearer than “perform well”. Watch for that feature during a short sequence and describe evidence before suggesting a change. Feedback should be specific, respectful and achievable. Several observers may notice different details, so compare their reasons rather than treating one impression as unquestionable.',
   'Assess a sequence for a controlled ending.', ['Agree what control looks like, such as a stable comfortable pause.', 'Observe the final transition and position.', 'Describe what happened and suggest one relevant adjustment.'], 'Criterion, evidence, next step.', 'Giving unrelated advice about speed when the agreed focus is balance.', 'Connect feedback to the chosen criterion.',
   'Why agree the criterion before observing?', 'It makes the purpose of the feedback clear and consistent.', 'Give useful feedback if the final shape is steady but the entry is rushed.', '“Your final position is stable; slow the last transition so you arrive with the same control.”']
 ]]
]],
['religious-studies', [
 ['Sacred texts and interpretation', [
  ['Explain why a text may be sacred', 'Distinguish a community’s view of a text from its physical form.',
   'A sacred text has special religious authority or significance for a community. Muslims regard the Qur’an as revelation from God; Christians use the Bible as sacred scripture, with differences in interpretation across traditions. The significance is not explained merely by an ornate cover. Describe beliefs accurately without requiring the learner to share them.',
   'Why is a plain copy of a sacred text not necessarily less significant than a decorated copy?', ['Distinguish physical decoration from the text’s religious role.', 'Identify the community’s beliefs about the words and their authority.', 'Explain that an expensive cover does not determine sacred status.'], 'Meaning and authority, not just appearance.', 'Assuming sacred means old, expensive or visually impressive.', 'Ask how the community understands and uses the text.',
   'Which text do Muslims regard as revelation from God?', 'The Qur’an.', 'Why should descriptions of scriptural interpretation allow for differences?', 'Members and traditions within a religion can understand and apply passages differently, even while recognising the text as sacred.'],
  ['Read a teaching in its context', 'Explain why surrounding information matters when interpreting a passage.',
   'A short quotation may lose important meaning when separated from its story, audience or historical setting. A command in a narrative is not automatically a general instruction to every reader. When studying a religious teaching, identify who is speaking, to whom and in what situation, then consider how a community interprets it today.',
   'A character says “Leave this place” during a danger scene.', ['Identify the speaker and immediate danger.', 'Recognise the instruction’s particular audience.', 'Do not assume the words command all later readers to leave their homes.'], 'Speaker, audience, situation.', 'Treating every sentence as the same kind of universal rule.', 'Check whether it is narrative, poetry, instruction or another form.',
   'What does context include?', 'Relevant surrounding words, audience, situation and setting.', 'Why might two people interpret a teaching differently?', 'They may emphasise different contextual details or belong to traditions with different approaches to interpretation.']
 ]],
 ['Ritual and ethical reasoning', [
  ['Connect a ritual with belonging', 'Explain how a repeated meaningful practice can express identity.',
   'A ritual is a patterned action carrying meaning in a community or personal life. Religious rituals may mark commitment, remembrance or stages of life. Not every repeated habit is a religious ritual, and participation can vary. Study the community’s explanation instead of assuming an unfamiliar action is pointless because its meaning is not immediately visible.',
   'A community lights a candle during remembrance.', ['Describe the visible action without guessing motives.', 'Ask how participants explain the candle’s meaning.', 'Connect the act with remembrance if that interpretation is supported.'], 'Describe the act; ask its meaning.', 'Assigning a meaning solely from your own associations.', 'Use participants’ accounts and relevant sources.',
   'Does every religious community use identical rituals?', 'No.', 'Why might a repeated ritual matter even when its actions look simple?', 'Shared meaning, memory and participation can make a simple action significant to those involved.'],
  ['Compare reasons for caring for nature', 'Recognise shared actions and different worldview explanations.',
   'Some religious people explain environmental care through responsibility towards a creator’s world; some non-religious people emphasise interdependence, wellbeing and duties to future generations. These are examples, not rigid categories: people may share several reasons. Compare the reasoning as well as the action, and avoid assuming disagreement in belief prevents cooperation.',
   'Two groups organise the same litter collection for different stated reasons.', ['Identify the shared practical action.', 'Describe each group’s explanation fairly.', 'Explain that cooperation can occur despite differences in worldview.'], 'Shared action, varied reasons.', 'Assuming every environmental action comes from the same belief.', 'Ask for the person’s or group’s actual explanation.',
   'Can religious and non-religious people work together on a shared concern?', 'Yes.', 'Give a reason why comparing explanations matters.', 'It helps us understand how people connect values and actions without erasing their differences.']
 ]]
]],
['pshe', [
 ['Online relationships and boundaries', [
  ['Respond to pressure in a group chat', 'Choose a safe response to harmful digital pressure.',
   'Group messages can make a request feel urgent or normal even when it is unkind. Sharing an embarrassing image can spread harm beyond the original group. Do not forward it to prove what happened; follow school guidance and ask a trusted adult how to preserve evidence safely. Leaving or muting a chat does not replace seeking help when someone is at risk.',
   'A chat asks everyone to repost an insulting image.', ['Do not repost or encourage it.', 'Use available reporting or blocking tools with adult guidance.', 'Tell a trusted adult what happened and ask for support.'], 'Do not amplify; get support.', 'Forwarding harmful content widely as a way of complaining about it.', 'Describe the concern to an adult and follow their safe evidence guidance.',
   'Does being sent an image give permission to spread it?', 'No.', 'Why might a bystander’s choice not to forward matter?', 'It limits the audience and avoids adding to the harm, while reporting can help the affected person receive support.'],
  ['Separate privacy from unsafe secrecy', 'Recognise when a request to keep information hidden needs adult help.',
   'Privacy can protect personal dignity, such as choosing not to share a diary. An unsafe secret may involve threats, harm or pressure not to tell a trusted adult. Children are not responsible for protecting someone who makes them feel unsafe. They can seek help even if they previously promised silence, and should keep telling until someone helps.',
   'Someone says you will be in trouble if you tell about an upsetting message.', ['Recognise pressure and a possible safety concern.', 'Find a trusted adult.', 'Explain the message and threat; the promise does not prevent seeking help.'], 'Safety is stronger than a forced secret.', 'Thinking any promise of secrecy must always be kept.', 'Seek trusted support for harm, threats or unsafe behaviour.',
   'Is asking for help about an unsafe secret disloyal?', 'No.', 'How is respecting a friend’s ordinary private information different from hiding a threat?', 'Ordinary privacy can be respected, but a threat or safety risk needs appropriate adult support.']
 ]],
 ['Decision-making and wellbeing', [
  ['Evaluate a spending trade-off', 'Explain how choosing one purchase can limit another.',
   'A budget sets an available amount. Choosing one item may leave less for another need or goal: this is a trade-off. Compare total cost, usefulness and timing rather than only the largest discount label. Financial circumstances differ between families, so discuss a fictional budget without judging what real people can afford.',
   'A character has £12, needs a £7 notebook pack and wants an £8 game.', ['The two items together cost £15.', 'The budget cannot cover both now.', 'Buying the needed pack leaves £5, so the game must wait or another plan is needed.'], 'Total cost before tempting offer.', 'Assuming a discounted item is affordable without checking the remaining budget.', 'Calculate the actual amount payable and what remains for other priorities.',
   'What is a trade-off?', 'Giving up or delaying one option when choosing another with limited resources.', 'A £20 budget must cover £13 of essentials. Can it also buy a £9 item?', 'Not within that budget: only £7 remains, leaving a £2 shortfall.'],
  ['Plan a supportive response to ongoing worry', 'Recognise when a concern goes beyond a short-lived difficulty.',
   'Worry sometimes helps us notice a problem, but persistent worry that affects sleep, learning or daily activity deserves support. A trusted adult can help identify next steps and seek appropriate professional help when needed. A calming activity may help in the moment, but it is not a test that someone must pass before being allowed to ask for help.',
   'A learner repeatedly cannot sleep because of school worries.', ['Tell a trusted adult about the pattern, not just one difficult night.', 'Explain how it affects daily life.', 'Agree supportive next steps and review whether they help.'], 'A lasting difficulty deserves lasting support.', 'Assuming a breathing exercise must solve every worry.', 'Use coping strategies alongside appropriate adult support, not as a replacement for it.',
   'Must a worry be an emergency before you can ask for help?', 'No.', 'Why is describing a pattern useful when seeking support?', 'It helps an adult understand frequency, impact and possible triggers, so support can match the actual difficulty.']
 ]]
]]
];
export const batchYear4 = compileActivities('year-4', subjects);
