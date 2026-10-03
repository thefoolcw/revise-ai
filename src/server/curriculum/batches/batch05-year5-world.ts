import type { Subject } from '../authoredActivities';
export const year5World: Subject[] = [
['geography', [
 ['Biomes and environmental patterns', [
  ['Connect climate with a biome', 'Explain why broad climate patterns influence vegetation.',
   'A biome is a large ecological region associated with characteristic climate and living communities. Temperature and rainfall influence which plants can grow, but altitude, soils and human activity also matter. Tropical rainforests typically have warm conditions and substantial rainfall, whereas hot deserts have very limited precipitation. A biome label describes a broad pattern, not identical conditions in every square kilometre.',
   'Compare likely vegetation under frequent rain and under prolonged dryness.', ['Identify water availability as a limiting factor.', 'Frequent warmth and rain can support dense plant growth.', 'Dry conditions favour plants adapted to scarce water, though soils and other factors also matter.'], 'Climate shapes possibilities, not identical places.', 'Defining every desert as hot.', 'Low precipitation defines desert conditions; some deserts are cold.',
   'Can a desert be cold?', 'Yes.', 'Why might two places at similar latitude have different vegetation?', 'Altitude, rainfall, soils and human land use can differ, changing growing conditions despite similar latitude.'],
  ['Trace a consequence of forest removal', 'Explain a chain of environmental effects rather than a single isolated change.',
   'Removing forest reduces habitats and can expose soil to heavy rainfall. Roots no longer bind soil in the same way, and reduced interception can change how water reaches the ground. Consequences depend on slope, soil, rainfall and subsequent land use. Explain links in a causal chain rather than claiming every removal produces an identical outcome.',
   'Explain why clearing a steep forested slope may increase soil loss.', ['Fewer roots bind the soil after removal.', 'Rain can strike more exposed ground.', 'Water moving downslope may carry more loosened soil away.'], 'Name the link between each effect.', 'Saying trees stop all flooding or erosion everywhere.', 'Describe a contribution to risk rather than an absolute guarantee.',
   'What is habitat loss?', 'Reduction or removal of the places organisms depend on for living.', 'Why should land-use decisions consider people as well as ecosystems?', 'Land supports livelihoods and communities as well as habitats; decisions involve benefits, costs and who experiences them.']
 ]],
 ['Volcanoes and risk', [
  ['Explain a volcanic eruption pathway', 'Distinguish magma underground from lava at the surface.',
   'Magma is molten rock beneath Earth’s surface. When it reaches the surface it is called lava. Pressure and movement can drive magma and gases through fractures or vents. Eruptions vary: some release flowing lava, while others involve explosive ash and gas. A simple cone diagram is a model and does not describe every volcano’s shape or behaviour.',
   'Label molten rock before and after it exits a vent.', ['Below the surface, label the molten rock magma.', 'Trace its movement through a vent.', 'At the surface, label it lava.'], 'Magma below; lava above.', 'Using ash and lava as names for the same material.', 'Distinguish fragmented volcanic material from flowing molten rock.',
   'Does every eruption have the same level of explosiveness?', 'No.', 'Why can volcanic ash be dangerous even far from a lava flow?', 'Fine particles and falling material can affect breathing, buildings, transport and machinery beyond the area reached by lava.'],
  ['Distinguish hazard from risk', 'Explain why the same physical event can affect communities differently.',
   'A hazard is a potentially damaging process or event. Risk also depends on who or what is exposed and how vulnerable they are. An eruption near a well-prepared settlement may have different consequences from a similar event where warnings, transport and shelters are limited. Preparation reduces some risks but cannot guarantee that every consequence is prevented.',
   'Compare two settlements equally close to a volcano.', ['The physical hazard may be similar.', 'Compare warning systems, evacuation routes and people’s needs.', 'Differences in preparation and vulnerability can change the likely impacts.'], 'Hazard meets exposure and vulnerability.', 'Assuming distance alone determines risk.', 'Consider people, infrastructure, preparedness and the event’s characteristics.',
   'Does a warning system remove the volcano?', 'No; it can help people respond to the hazard.', 'Why might an evacuation plan need more than a map of roads?', 'It must consider timing, transport access, communication and people who need additional assistance.']
 ]]
]],
['computer-science', [
 ['Selection and variables', [
  ['Use an if-else decision', 'Choose between two actions according to a condition.',
   'Selection allows a program to respond differently when a condition is true or false. An if-else structure chooses one of two branches during each check. For a quiz, if the answer matches the expected answer, display success; otherwise display a retry message. Define what counts as a match, including whether capital letters matter.',
   'Plan feedback for a numeric answer expected to be 12.', ['Test whether the entered value equals 12.', 'If true, show “Correct”.', 'Otherwise show “Try again” rather than also showing success.'], 'One test, one chosen branch.', 'Running both branches regardless of the condition.', 'Trace the true or false result and follow only its branch.',
   'What two results can a Boolean condition have?', 'True or false.', 'Why might the text “12” need converting before comparison with a number?', 'Some languages distinguish text from numeric values, so explicit conversion can avoid an incorrect mismatch.'],
  ['Update a score variable', 'Explain assignment as changing a stored value.',
   'A variable holds a value that a program can use and update. A score starts at zero; each successful action may increase it by one. “Set score to 1” is different from “change score by 1”: setting repeatedly overwrites the total, while changing adds to its current value. Reset the score at the beginning of a new game.',
   'A player succeeds three times from an initial score of zero.', ['Initialise score to 0.', 'After each success, add 1 to the current score.', 'The score becomes 1, then 2, then 3.'], 'Set replaces; change adjusts.', 'Setting the score to one after every success.', 'Add to the stored total when counting repeated successes.',
   'Why initialise a score at the start?', 'So a new run begins from the intended value.', 'A score is 7. Compare setting it to 2 with increasing it by 2.', 'Setting gives 2; increasing gives 9. These instructions have different effects on the existing value.']
 ]],
 ['Testing and information quality', [
  ['Choose boundary test cases', 'Test inputs around the point where a program’s decision changes.',
   'A rule such as “score at least ten earns a badge” has a boundary at ten. Test nine, ten and eleven rather than only easy values far away. These reveal whether greater-than was used when greater-than-or-equal was required. Write expected results before running tests so a surprising output is not accepted merely because the computer produced it.',
   'Test a badge condition for score ≥ 10.', ['At 9, expect no badge.', 'At 10, expect a badge.', 'At 11, expect a badge.'], 'Below, on, above the boundary.', 'Testing only a very high score and missing an error at exactly ten.', 'Include the exact threshold and values immediately around it.',
   'Should score 10 pass an “at least ten” rule?', 'Yes.', 'A height rule allows values below 150. Should 149, 150 and 151 pass?', 'Only 149 passes. Below excludes the boundary itself; 150 and 151 fail.'],
  ['Evaluate a search result’s evidence', 'Distinguish ranking and confident presentation from reliable support.',
   'A search engine ranks results using many signals, not a simple guarantee of factual accuracy. A high result can be an advert, an outdated page or a well-promoted claim. Check the author or organisation, publication date and supporting evidence. For an important factual question, compare credible independent sources rather than several pages repeating one unsupported statement.',
   'A first result makes a surprising animal claim without a source.', ['Check whether it is advertising or ordinary content.', 'Look for author, date and evidence.', 'Compare a suitable expert or reference source before accepting it.'], 'Rank is not proof.', 'Counting copied versions of one claim as independent confirmation.', 'Trace whether the sources rely on the same original evidence.',
   'Does a recent date alone prove accuracy?', 'No.', 'Why is source relevance important as well as reputation?', 'An organisation may be credible in one field but not provide expert evidence for an unrelated claim.']
 ]]
]],
['french', [
 ['Preferences and negation', [
  ['Say what you do not like', 'Build a simple negative sentence around aimer.',
   'In standard written French, ne and pas surround the conjugated verb. Before a vowel, ne becomes n’: Je n’aime pas chanter means I do not like singing. The infinitive activity stays after pas. Informal speech may omit ne, but this lesson practises the full written form so the sentence structure is visible.',
   'Change J’aime dessiner into a negative sentence.', ['Place n’ before aime because it begins with a vowel sound.', 'Place pas after aime.', 'Write Je n’aime pas dessiner.'], 'N’ before, pas after the verb.', 'Putting both negative words before aime.', 'Wrap the conjugated verb, not the whole activity phrase.',
   'What does Je n’aime pas chanter mean?', 'I do not like singing.', 'Translate “I like drawing, but I do not like singing”.', 'J’aime dessiner, mais je n’aime pas chanter. Mais means but and introduces the contrasting preference.'],
  ['Give a reason with parce que', 'Extend a preference using a suitable reason phrase.',
   'Parce que means because. C’est intéressant means it is interesting; c’est amusant means it is fun. Join a preference to a reason: J’aime lire parce que c’est intéressant. Lire is the infinitive to read. The reason must fit the preference rather than being added as an unrelated vocabulary item.',
   'Say that you like singing because it is fun.', ['Start J’aime chanter.', 'Add parce que.', 'Finish c’est amusant.'], 'Preference, because, reason.', 'Using mais when the intention is to explain a reason.', 'Mais contrasts; parce que explains why.',
   'What does lire mean?', 'To read.', 'Translate Je n’aime pas courir parce que c’est difficile.', 'I do not like running because it is difficult. Courir means to run and difficile means difficult.']
 ]],
 ['Regular verbs and plural nouns', [
  ['Change an -er verb for je and nous', 'Use two present-tense forms of a regular French verb.',
   'For many regular -er verbs, remove -er to find the stem, then add the appropriate ending. With jouer, to play, je uses joue and nous uses jouons: je joue, nous jouons. The written endings distinguish forms even when some sounds are less obvious. Do not assume every French verb is regular.',
   'Form “we sing” from chanter.', ['Remove -er to obtain chant-.', 'For nous, add -ons.', 'Write nous chantons.'], 'Stem plus the subject’s ending.', 'Using the infinitive unchanged after every subject.', 'Choose the subject first, then form the matching verb.',
   'What does nous mean?', 'We.', 'Write “I play” and “we play” using jouer.', 'Je joue; nous jouons. The stem jou- remains and the ending changes with the subject.'],
  ['Describe more than one object', 'Use des and common written plural forms.',
   'Des can mean some before a plural noun: des livres, some books. Many French nouns add a written s in the plural, though it is often not pronounced as an English plural s. Articles signal number in speech as well as writing. There are irregular plurals, so this lesson focuses on familiar regular nouns.',
   'Change un livre to some books.', ['Replace singular un with plural des.', 'Add the regular plural s to livre.', 'Write des livres.'], 'Article signals number too.', 'Pronouncing every final plural s like an English s.', 'Listen to a reliable French model and distinguish written marking from pronunciation.',
   'What does des règles mean?', 'Some rulers.', 'Translate “I have some books” and identify both plural signals.', 'J’ai des livres. Des is plural and livres has the regular written plural s.']
 ]]
]],
['spanish', [
 ['Preferences and agreement', [
  ['Choose gusta or gustan', 'Express liking with singular and plural things.',
   'Me gusta el libro means I like the book; me gustan los libros means I like the books. In this construction, the thing liked controls the verb’s number: one book takes gusta, plural books take gustan. With an infinitive activity, use gusta: Me gusta leer, I like reading. Do not choose gustan simply because the speaker likes something very much.',
   'Say “I like the red books”.', ['Use los libros rojos for the plural noun phrase.', 'Choose gustan because libros is plural.', 'Write Me gustan los libros rojos.'], 'The liked thing chooses the number.', 'Using gustan after an infinitive activity.', 'Use gusta with activities such as leer or cantar.',
   'Which form fits Me ___ cantar?', 'Gusta.', 'Translate Me gusta el dibujo and Me gustan los dibujos.', 'I like the drawing; I like the drawings. The plural subject los dibujos changes gusta to gustan.'],
  ['Negate a preference and explain it', 'Use no and porque in a coherent preference sentence.',
   'Place no before me gusta to say you do not like an activity: No me gusta correr. Porque introduces a reason; es difícil means it is difficult. Spanish does not require a second negative word equivalent to French pas. Keep the reason connected to the activity, and distinguish porque, because, from the question ¿por qué?, why.',
   'Say “I do not like running because it is difficult”.', ['Begin No me gusta correr.', 'Add porque.', 'Finish es difícil.'], 'No before the preference; porque before the reason.', 'Copying the French two-part negation into Spanish.', 'Use the Spanish structure No me gusta ... .',
   'What does porque introduce?', 'A reason: because.', 'Translate Me gusta leer porque es interesante.', 'I like reading because it is interesting. Leer is the activity and interesante supplies the reason.']
 ]],
 ['Present-tense verbs and questions', [
  ['Conjugate a regular -ar verb', 'Build first-person singular and plural forms from a regular stem.',
   'Hablar means to speak. Remove -ar to obtain habl-, then add -o for I and -amos for we: hablo and hablamos. Spanish often omits the subject pronoun because the verb form identifies it. The same regular pattern forms canto and cantamos from cantar, though other verbs can be irregular.',
   'Write “we sing” using cantar.', ['Remove -ar to obtain cant-.', 'Add -amos for nosotros or nosotras.', 'Write cantamos; the subject pronoun is optional in a neutral sentence.'], 'Keep the stem; match the ending.', 'Using hablo for both I and we.', 'The subject determines the ending, even when the pronoun is omitted.',
   'What is the I form of hablar?', 'Hablo.', 'Translate “I sing” and “we speak”.', 'Canto; hablamos. The regular endings are -o and -amos respectively.'],
  ['Ask a location question', 'Use dónde and está for the location of one known object.',
   '¿Dónde está el libro? means Where is the book? Dónde asks where, and está gives the location of one object in this pattern. Spanish questions use opening and closing question marks. Compare el libro, the book, with un libro, a book: a location question often refers to a known object. This lesson does not treat ser and estar as interchangeable.',
   'Ask where the ruler is.', ['Choose ¿Dónde está ... ? for one object.', 'Use the definite feminine noun phrase la regla.', 'Write ¿Dónde está la regla?'], 'Dónde asks the place.', 'Using the indefinite article when referring to a specific already-mentioned ruler.', 'Choose la regla for the known ruler in this question.',
   'What does dónde ask for?', 'A location.', 'Translate ¿Dónde está el libro? and identify the definite article.', 'Where is the book? El means the before the masculine singular noun libro.']
 ]]
]],
['religious-studies', [
 ['Worldviews and diversity', [
  ['Distinguish organised and personal worldviews', 'Explain why a tradition’s teachings do not fully predict each person’s perspective.',
   'A worldview includes ideas about reality, meaning, values and how to live. An organised religious or non-religious tradition offers shared teachings and practices, but an individual’s outlook also reflects family, experience and interpretation. Describing a tradition is useful without assuming every adherent gives identical answers to every ethical question.',
   'Two members of one tradition disagree about a local policy.', ['Recognise their shared tradition.', 'Identify different experiences or interpretations they explain.', 'Avoid treating disagreement as proof that one person cannot belong.'], 'Shared tradition, individual perspective.', 'Using a label as a complete prediction of someone’s beliefs.', 'Listen to the person’s explanation as well as learning the tradition’s teachings.',
   'Can non-religious people have a worldview?', 'Yes.', 'Why distinguish a textbook summary from a personal interview?', 'The summary describes broader patterns; the interview gives one person’s perspective. Neither should automatically stand for every individual.'],
  ['Compare sources of moral guidance', 'Identify reasons people use when deciding how to act.',
   'People may draw moral guidance from sacred texts, community teaching, conscience, reason, law or concern for wellbeing. One person can use several sources. A moral argument should state the reason connecting an action to a value, rather than merely announcing that a group approves. Compare sources respectfully while still examining the quality of the reasoning.',
   'Someone refuses to spread a rumour because it may harm an innocent person.', ['Identify the proposed action: not spreading it.', 'Identify the stated concern: avoiding harm.', 'Explain the link between uncertainty, possible harm and restraint.'], 'Action, value, connecting reason.', 'Assuming a non-religious decision has no moral basis.', 'Ask what principles and reasoning support the decision.',
   'Can one moral choice draw on both religious teaching and concern for wellbeing?', 'Yes.', 'What additional reason might someone give for checking a rumour?', 'Respect for truth or fairness to the person affected, as well as avoiding harm.']
 ]],
 ['Practice and representation', [
  ['Explain pilgrimage without reducing it to tourism', 'Connect a journey with a religious purpose while recognising variation.',
   'A pilgrimage is a journey to a place of particular religious significance for the traveller or community. Hajj has a specific place in Islam, while other traditions have different pilgrimage practices. Travel can involve shared practical features with tourism, but intention, obligations and ritual meaning may differ. Not every believer can or does undertake every journey.',
   'Why is photographing a site not enough to explain a pilgrimage?', ['A photograph records visible features.', 'The journey’s religious purpose may not be visible.', 'Ask about participants’ intentions, practices and the significance of the destination.'], 'Journey plus meaning.', 'Assuming every visitor to a religious site is a pilgrim.', 'Distinguish the person’s purpose rather than relying only on location.',
   'Must all religious journeys follow the same practices?', 'No.', 'Why should descriptions acknowledge health, finances and other circumstances?', 'These can affect participation; absence from a journey does not by itself establish a person’s commitment or beliefs.'],
  ['Evaluate a representation of religion', 'Check whether a media example fairly represents its scope.',
   'A news report may focus on conflict or an unusual event because it is newsworthy. It cannot by itself represent the ordinary lives of everyone in a religious community. Check who is quoted, whose voices are absent and whether a specific claim is presented as universal. Fair evaluation can question stereotypes without ignoring real problems.',
   'A headline describes one leader’s statement as what all members believe.', ['Identify the actual speaker and their role.', 'Look for evidence of wider agreement or disagreement.', 'Limit the claim to what the report can support.'], 'Whose voice, how wide a claim?', 'Rejecting every critical report or accepting every generalisation.', 'Assess the evidence and scope of each claim separately.',
   'Does one interview establish every member’s view?', 'No.', 'What would improve a report about varied practice within a community?', 'Relevant voices from different participants, clear context and language that avoids unsupported claims about everyone.']
 ]]
]]
];
