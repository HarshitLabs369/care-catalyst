"use strict";

/*
 * CARE CATALYST — COMBINATION-BASED SYMPTOM SEARCH
 *
 * Educational demonstration only — NOT a diagnostic tool.
 * Conditions are ranked by overlap with a curated local catalogue.
 * The score is not a disease probability or a clinical prediction.
 */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("symptomForm");
    const input = document.getElementById("symptomSearch");
    const results = document.getElementById("symptomResults");

    if (!form || !input || !results) {
        console.error(
            "Care Catalyst: symptomForm, symptomSearch, or symptomResults was not found."
        );
        return;
    }

    const SOURCES = [
        {
            name: "MedlinePlus — Emergency care",
            url: "https://medlineplus.gov/patientinstructions/000593.htm"
        },
        {
            name: "NHS — Chest pain",
            url: "https://www.nhs.uk/symptoms/chest-pain/"
        },
        {
            name: "NHS — Shortness of breath",
            url: "https://www.nhs.uk/symptoms/shortness-of-breath/"
        }
    ];

    /*
     * Each symptom has searchable aliases and broad associated conditions.
     * This catalogue is illustrative, not exhaustive or clinically validated.
     */

    const SYMPTOMS = [
        {
            name: "Headache",
            aliases: ["headache", "head pain", "pain in head", "head hurts"],
            description: "Pain or discomfort in the head or scalp.",
            conditions: ["Tension-type headache", "Migraine", "Viral illness", "Dehydration"],
            care: "Seek professional advice if headaches recur, worsen, or interfere with daily life."
        },
        {
            name: "Migraine-like symptoms",
            aliases: ["migraine", "throbbing headache", "light sensitivity", "sensitivity to light", "photophobia"],
            description: "Some headaches involve throbbing pain, nausea, or sensitivity to light and sound.",
            conditions: ["Migraine", "Other headache disorders"],
            care: "A new or unusually severe headache needs medical assessment."
        },
        {
            name: "Dizziness",
            aliases: ["dizziness", "dizzy", "lightheaded", "light headed", "feeling faint"],
            description: "Dizziness can mean lightheadedness, imbalance, or a spinning sensation.",
            conditions: ["Inner-ear disorders", "Dehydration", "Medication effects", "Low blood pressure"],
            care: "Seek urgent care for sudden dizziness with weakness, speech problems, chest pain, or fainting."
        },
        {
            name: "Vertigo",
            aliases: ["vertigo", "room spinning", "spinning sensation", "world spinning"],
            description: "Vertigo is the sensation that you or your surroundings are moving or spinning.",
            conditions: ["Benign positional vertigo", "Inner-ear disorders", "Vestibular migraine"],
            care: "Seek advice for new, persistent, or recurring vertigo."
        },
        {
            name: "Fever",
            aliases: ["fever", "high temperature", "raised temperature", "temperature", "febrile"],
            description: "Fever can occur with infections and several other illnesses.",
            conditions: ["Viral infection", "Influenza", "COVID-19", "Other infections"],
            care: "Fever with confusion, severe breathing difficulty, or a stiff neck and severe headache needs urgent assessment."
        },
        {
            name: "Chills",
            aliases: ["chills", "shivering", "shivering with fever", "rigors"],
            description: "Chills are episodes of feeling cold or shivering, sometimes with fever.",
            conditions: ["Viral infection", "Influenza", "Other infections"],
            care: "Seek medical advice for severe or persistent chills, especially with fever."
        },
        {
            name: "Common cold symptoms",
            aliases: ["cold", "common cold", "runny nose", "blocked nose", "stuffy nose", "sneezing", "nasal congestion"],
            description: "Cold symptoms often include a runny or blocked nose, sneezing, and sore throat.",
            conditions: ["Common cold", "Allergic rhinitis", "Other upper respiratory infections"],
            care: "Seek advice if symptoms worsen, persist, or cause breathing difficulty."
        },
        {
            name: "Cough",
            aliases: ["cough", "coughing", "dry cough", "wet cough", "persistent cough", "phlegm", "mucus cough"],
            description: "Cough may occur with infections, allergies, asthma, reflux, or airway irritation.",
            conditions: ["Common cold", "Acute bronchitis", "Asthma", "Acid reflux"],
            care: "Seek assessment for a persistent or worsening cough. Coughing blood or severe breathing difficulty needs urgent care."
        },
        {
            name: "Sore throat",
            aliases: ["sore throat", "throat pain", "painful throat", "scratchy throat", "throat irritation"],
            description: "Throat pain may occur with infections, allergies, dryness, or irritation.",
            conditions: ["Viral pharyngitis", "Tonsillitis", "Strep throat", "Allergies"],
            care: "Seek urgent care if you cannot swallow saliva or have difficulty breathing."
        },
        {
            name: "Shortness of breath",
            aliases: ["shortness of breath", "breathlessness", "breathless", "difficulty breathing", "trouble breathing", "cant breathe", "cannot breathe", "gasping"],
            description: "Breathing difficulty has many possible causes and can sometimes be an emergency.",
            conditions: ["Asthma", "Respiratory infection", "Anaemia", "Heart or lung conditions"],
            care: "Severe or sudden breathing difficulty requires emergency help."
        },
        {
            name: "Wheezing",
            aliases: ["wheezing", "wheeze", "whistling breathing", "whistling sound when breathing"],
            description: "Wheezing is a whistling sound during breathing, often associated with narrowed airways.",
            conditions: ["Asthma", "Respiratory infections", "Allergic reactions", "Other airway conditions"],
            care: "Sudden wheezing with swelling or breathing difficulty can be an emergency."
        },
        {
            name: "Chest pain",
            aliases: ["chest pain", "chest pressure", "chest tightness", "chest discomfort", "pain in chest", "chest heaviness"],
            description: "Chest pain may arise from the heart, lungs, muscles, digestive system, or other causes.",
            conditions: ["Muscle strain", "Acid reflux", "Respiratory conditions", "Heart conditions"],
            care: "New or unexplained chest pain needs prompt assessment. Severe pressure, spreading pain, sweating, or breathlessness requires emergency help."
        },
        {
            name: "Palpitations",
            aliases: ["palpitations", "heart racing", "racing heart", "fast heartbeat", "irregular heartbeat", "heart fluttering", "pounding heart"],
            description: "Palpitations are sensations of a racing, pounding, fluttering, or irregular heartbeat.",
            conditions: ["Stress or anxiety", "Caffeine effects", "Medication effects", "Heart rhythm disorders"],
            care: "Seek urgent care if palpitations occur with chest pain, fainting, or severe breathlessness."
        },
        {
            name: "Abdominal pain",
            aliases: ["abdominal pain", "stomach pain", "belly pain", "tummy ache", "pain in abdomen", "stomach ache"],
            description: "Abdominal pain may arise from digestive, urinary, reproductive, or other conditions.",
            conditions: ["Indigestion", "Constipation", "Gastroenteritis", "Other abdominal conditions"],
            care: "Sudden or severe abdominal pain, a rigid abdomen, blood in vomit or stool, or pain with fainting needs urgent assessment."
        },
        {
            name: "Nausea",
            aliases: ["nausea", "feeling nauseous", "feel sick", "queasy", "sick to stomach"],
            description: "Nausea is the feeling that you may vomit.",
            conditions: ["Gastroenteritis", "Migraine", "Medication effects", "Reflux"],
            care: "Seek medical advice if nausea persists or you cannot keep fluids down."
        },
        {
            name: "Vomiting",
            aliases: ["vomiting", "vomit", "throwing up", "being sick", "puking"],
            description: "Vomiting can occur with infections, digestive problems, medicines, and other conditions.",
            conditions: ["Gastroenteritis", "Foodborne illness", "Migraine", "Medication effects"],
            care: "Repeated vomiting, dehydration, severe abdominal pain, or blood in vomit needs prompt assessment."
        },
        {
            name: "Diarrhoea",
            aliases: ["diarrhoea", "diarrhea", "loose motions", "loose stools", "watery stool", "frequent loose stools"],
            description: "Diarrhoea means passing loose or watery stools more often than usual.",
            conditions: ["Gastroenteritis", "Foodborne illness", "Medication effects", "Food intolerance"],
            care: "Seek care for blood in stools, severe pain, dehydration, or persistent symptoms."
        },
        {
            name: "Constipation",
            aliases: ["constipation", "hard stool", "hard stools", "difficulty passing stool", "infrequent bowel movements"],
            description: "Constipation can involve hard stools, straining, or infrequent bowel movements.",
            conditions: ["Low dietary fibre", "Dehydration", "Medication effects", "Functional constipation"],
            care: "Severe abdominal pain, vomiting, or inability to pass stool or gas needs urgent assessment."
        },
        {
            name: "Bloating",
            aliases: ["bloating", "bloated stomach", "stomach bloating", "gas in stomach", "excess gas", "flatulence"],
            description: "Bloating is a feeling of fullness or swelling in the abdomen.",
            conditions: ["Gas", "Constipation", "Food intolerance", "Irritable bowel syndrome"],
            care: "Seek advice if bloating persists or comes with weight loss, vomiting, or significant pain."
        },
        {
            name: "Heartburn",
            aliases: ["heartburn", "acid reflux", "acid indigestion", "burning in chest after eating", "sour taste"],
            description: "Heartburn is a burning feeling that may occur when stomach contents flow back into the oesophagus.",
            conditions: ["Gastro-oesophageal reflux", "Indigestion", "Other digestive conditions"],
            care: "Do not assume chest burning is reflux. New chest pressure with sweating or breathlessness needs emergency assessment."
        },
        {
            name: "Loss of appetite",
            aliases: ["loss of appetite", "poor appetite", "no appetite", "not hungry", "reduced appetite"],
            description: "Appetite can decrease during illness, stress, or changes in health.",
            conditions: ["Infections", "Digestive conditions", "Stress or depression", "Medication effects"],
            care: "Seek advice if appetite loss persists, causes weight loss, or prevents adequate fluid intake."
        },
        {
            name: "Difficulty swallowing",
            aliases: ["difficulty swallowing", "trouble swallowing", "painful swallowing", "food stuck in throat", "dysphagia"],
            description: "Swallowing difficulties may result from throat, oesophageal, neurological, or other conditions.",
            conditions: ["Throat infections", "Reflux-related irritation", "Oesophageal disorders", "Neurological conditions"],
            care: "Sudden swallowing difficulty or inability to swallow saliva requires urgent assessment."
        },
        {
            name: "Back pain",
            aliases: ["back pain", "backpain", "backache", "lower back pain", "upper back pain", "pain in back", "back hurts"],
            description: "Back pain can be associated with muscle strain, posture, injury, or other conditions.",
            conditions: ["Muscle strain", "Mechanical back pain", "Disc problems", "Other spinal conditions"],
            care: "Back pain with new leg weakness, numbness around the groin, or loss of bladder or bowel control needs emergency assessment."
        },
        {
            name: "Neck pain",
            aliases: ["neck pain", "stiff neck", "neck stiffness", "pain in neck"],
            description: "Neck pain may follow muscle strain, posture-related tension, or injury.",
            conditions: ["Muscle strain", "Cervical spondylosis", "Tension-related pain"],
            care: "A stiff neck with fever, severe headache, confusion, or rash needs urgent assessment."
        },
        {
            name: "Shoulder pain",
            aliases: ["shoulder pain", "pain in shoulder", "shoulder ache", "shoulder stiffness"],
            description: "Shoulder pain can involve muscles, tendons, joints, or referred pain from other areas.",
            conditions: ["Muscle strain", "Rotator cuff problems", "Shoulder bursitis", "Arthritis"],
            care: "Sudden severe pain after injury or shoulder pain with chest pressure or breathlessness needs urgent assessment."
        },
        {
            name: "Joint pain",
            aliases: ["joint pain", "painful joints", "joint ache", "joints hurting", "arthralgia"],
            description: "Joint pain can occur from injury, inflammation, infection, or wear-related changes.",
            conditions: ["Osteoarthritis", "Inflammatory arthritis", "Sprain", "Other joint disorders"],
            care: "A hot, swollen joint with fever or severe sudden joint pain needs prompt assessment."
        },
        {
            name: "Muscle pain",
            aliases: ["muscle pain", "muscle ache", "muscle aches", "myalgia", "sore muscles"],
            description: "Muscle aches may follow exercise, infections, medication effects, or other conditions.",
            conditions: ["Muscle overuse", "Viral illness", "Muscle strain", "Medication effects"],
            care: "Severe muscle pain with marked weakness or dark urine needs urgent assessment."
        },
        {
            name: "Body aches",
            aliases: ["body pain", "body ache", "body aches", "whole body pain", "whole body ache", "pain all over"],
            description: "Widespread aches can occur with viral illness, exertion, poor sleep, or other conditions.",
            conditions: ["Influenza", "Other viral infections", "Muscle overuse", "Other systemic conditions"],
            care: "Seek medical advice for severe, persistent, or worsening pain."
        },
        {
            name: "Leg cramps",
            aliases: ["leg cramps", "leg cramp", "cramps in legs", "calf cramps", "muscle cramps", "night cramps"],
            description: "Cramps are involuntary muscle contractions and may follow exertion or occur for other reasons.",
            conditions: ["Muscle fatigue", "Dehydration", "Medication effects", "Other muscle or circulation conditions"],
            care: "New one-sided leg swelling, redness, or warmth with pain needs prompt assessment."
        },
        {
            name: "Leg pain",
            aliases: ["leg pain", "pain in leg", "legs hurting", "thigh pain", "calf pain"],
            description: "Leg pain may come from muscles, joints, nerves, injury, or circulation problems.",
            conditions: ["Muscle strain", "Sciatica", "Joint disorders", "Circulation problems"],
            care: "Sudden one-sided swelling or pain, especially with breathlessness or chest pain, needs urgent assessment."
        },
        {
            name: "Knee pain",
            aliases: ["knee pain", "pain in knee", "knees hurting", "knee swelling"],
            description: "Knee pain can occur with injury, overuse, arthritis, or inflammation.",
            conditions: ["Knee sprain", "Tendon problems", "Osteoarthritis", "Other joint conditions"],
            care: "Seek prompt care for a severely swollen, hot knee, inability to bear weight, or significant injury."
        },
        {
            name: "Foot pain",
            aliases: ["foot pain", "feet pain", "heel pain", "pain in foot", "painful feet"],
            description: "Foot pain may relate to footwear, overuse, injury, or joint and tendon conditions.",
            conditions: ["Plantar fasciitis", "Muscle or tendon strain", "Sprain", "Other foot conditions"],
            care: "Seek medical advice for severe pain, inability to walk, or a foot wound with signs of infection."
        },
        {
            name: "Fatigue",
            aliases: ["fatigue", "tiredness", "tired", "exhaustion", "low energy", "feeling weak", "weakness", "lethargy"],
            description: "Fatigue is a feeling of tiredness or reduced energy that can have many causes.",
            conditions: ["Sleep deprivation", "Anaemia", "Thyroid disorders", "Infections", "Stress"],
            care: "Consult a healthcare professional for persistent or unexplained fatigue. Sudden one-sided weakness is an emergency."
        },
        {
            name: "Sleep problems",
            aliases: ["insomnia", "cannot sleep", "cant sleep", "difficulty sleeping", "poor sleep", "sleep problems", "sleeping too much"],
            description: "Sleep changes may be related to habits, stress, medicines, or health conditions.",
            conditions: ["Insomnia", "Stress or anxiety", "Sleep apnoea", "Mood disorders"],
            care: "Seek professional advice if sleep problems persist or affect daily functioning."
        },
        {
            name: "Anxiety-like symptoms",
            aliases: ["anxiety", "anxious", "panic", "panic attack", "nervousness", "racing thoughts"],
            description: "Anxiety can involve worry, restlessness, sweating, trembling, or a racing heartbeat.",
            conditions: ["Anxiety disorders", "Stress response", "Panic attacks", "Some physical health conditions"],
            care: "Do not assume new chest pain or breathing difficulty is anxiety."
        },
        {
            name: "Low mood",
            aliases: ["low mood", "sadness", "feeling sad", "depressed mood", "loss of interest", "hopelessness"],
            description: "Persistent low mood or loss of interest can affect daily activities and wellbeing.",
            conditions: ["Depression", "Stress", "Grief", "Other mental or physical health conditions"],
            care: "Consider speaking with a qualified health professional if symptoms persist."
        },
        {
            name: "Skin rash",
            aliases: ["rash", "skin rash", "itchy rash", "red rash", "skin irritation", "skin spots"],
            description: "Rashes may result from irritation, allergies, infections, medicines, or skin conditions.",
            conditions: ["Contact dermatitis", "Eczema", "Hives", "Viral skin eruptions"],
            care: "A rash with breathing difficulty or facial swelling is an emergency. A rapidly spreading rash with fever needs urgent assessment."
        },
        {
            name: "Itching",
            aliases: ["itching", "itchy skin", "itchy", "pruritus", "skin itching"],
            description: "Itching may be caused by dry skin, irritation, allergies, or other conditions.",
            conditions: ["Dry skin", "Eczema", "Contact dermatitis", "Allergic reactions"],
            care: "Seek care for persistent widespread itching or itching with jaundice."
        },
        {
            name: "Hives",
            aliases: ["hives", "urticaria", "raised itchy welts", "itchy welts"],
            description: "Hives are raised, often itchy areas of skin that may appear and disappear.",
            conditions: ["Allergic reactions", "Infections", "Medication reactions", "Other triggers"],
            care: "Hives with tongue or throat swelling, wheezing, or breathing difficulty require emergency help."
        },
        {
            name: "Hair loss",
            aliases: ["hair loss", "hair falling out", "thinning hair", "bald patches"],
            description: "Hair loss can be associated with genetics, stress, hormonal changes, nutritional issues, or skin conditions.",
            conditions: ["Pattern hair loss", "Telogen effluvium", "Alopecia areata", "Thyroid disorders"],
            care: "Seek advice for sudden, patchy, or unexplained hair loss."
        },
        {
            name: "Eye redness",
            aliases: ["red eye", "red eyes", "eye redness", "bloodshot eyes"],
            description: "Red eyes can be caused by irritation, dryness, infection, or inflammation.",
            conditions: ["Conjunctivitis", "Dry eye", "Allergic irritation", "Other eye conditions"],
            care: "A painful red eye with vision changes, severe headache, or light sensitivity needs urgent eye assessment."
        },
        {
            name: "Eye pain",
            aliases: ["eye pain", "pain in eye", "painful eyes", "eye ache"],
            description: "Eye pain may result from irritation, injury, infection, or other eye conditions.",
            conditions: ["Corneal irritation", "Eye inflammation", "Infection", "Other eye disorders"],
            care: "Severe eye pain, sudden vision loss, or eye injury needs urgent assessment."
        },
        {
            name: "Blurred vision",
            aliases: ["blurred vision", "blurry vision", "vision blurry", "poor vision", "vision changes"],
            description: "Blurred vision can arise from eye conditions or broader health problems.",
            conditions: ["Refractive error", "Dry eye", "Migraine-related visual symptoms", "Other eye conditions"],
            care: "Sudden vision loss or sudden visual changes with weakness or severe headache require emergency assessment."
        },
        {
            name: "Ear pain",
            aliases: ["ear pain", "earache", "pain in ear", "ear hurts"],
            description: "Ear pain may be associated with infection, wax, pressure, or referred pain.",
            conditions: ["Middle-ear infection", "Outer-ear infection", "Earwax blockage", "Pressure changes"],
            care: "Seek advice for persistent pain, discharge, hearing loss, or fever."
        },
        {
            name: "Hearing difficulty",
            aliases: ["hearing loss", "difficulty hearing", "cant hear", "cannot hear", "reduced hearing", "muffled hearing"],
            description: "Hearing changes can result from wax, infection, noise exposure, or inner-ear conditions.",
            conditions: ["Earwax blockage", "Ear infection", "Noise-related hearing loss", "Inner-ear disorders"],
            care: "Sudden hearing loss needs urgent medical assessment."
        },
        {
            name: "Toothache",
            aliases: ["toothache", "tooth pain", "teeth pain", "pain in tooth", "dental pain"],
            description: "Tooth pain may result from decay, gum disease, a cracked tooth, or infection.",
            conditions: ["Dental caries", "Gum disease", "Dental abscess", "Tooth fracture"],
            care: "Arrange dental assessment. Facial or neck swelling with difficulty swallowing or breathing is an emergency."
        },
        {
            name: "Mouth ulcers",
            aliases: ["mouth ulcer", "mouth ulcers", "canker sores", "sore inside mouth", "oral ulcer"],
            description: "Mouth ulcers are sores that can occur from irritation or other causes.",
            conditions: ["Minor mouth injury", "Aphthous ulcers", "Nutritional deficiencies", "Other oral conditions"],
            care: "Seek advice for persistent, recurring, or unusually large ulcers."
        },
        {
            name: "Frequent urination",
            aliases: ["frequent urination", "urinating frequently", "peeing often", "urine frequently", "passing urine often"],
            description: "Frequent urination can be related to fluid intake, urinary conditions, medicines, or metabolic problems.",
            conditions: ["Urinary tract infection", "Diabetes", "Overactive bladder", "Medication effects"],
            care: "Seek advice if persistent, particularly with excessive thirst, pain, fever, or blood in urine."
        },
        {
            name: "Painful urination",
            aliases: ["painful urination", "burning urination", "burning when peeing", "pain when urinating", "dysuria"],
            description: "Pain or burning during urination may occur with urinary tract irritation or infection.",
            conditions: ["Urinary tract infection", "Urethral irritation", "Some sexually transmitted infections"],
            care: "Seek medical advice, especially with fever, back or flank pain, vomiting, pregnancy, or blood in urine."
        },
        {
            name: "Blood in urine",
            aliases: ["blood in urine", "bloody urine", "red urine", "pink urine", "haematuria", "hematuria"],
            description: "Blood in urine can have several causes and should not be ignored.",
            conditions: ["Urinary tract infection", "Kidney stones", "Urinary tract conditions"],
            care: "Arrange prompt medical assessment, even if it happens only once."
        },
        {
            name: "Excessive thirst",
            aliases: ["excessive thirst", "very thirsty", "always thirsty", "increased thirst", "polydipsia"],
            description: "Excessive thirst may be related to dehydration, medicines, or metabolic conditions.",
            conditions: ["Dehydration", "Diabetes", "Medication effects", "Other metabolic conditions"],
            care: "Seek advice if persistent, particularly with frequent urination, vomiting, or unexplained weight loss."
        },
        {
            name: "Unexplained weight loss",
            aliases: ["weight loss", "losing weight", "unintentional weight loss", "unexplained weight loss", "weight dropping"],
            description: "Unintentional weight loss can have many causes and needs assessment.",
            conditions: ["Thyroid disorders", "Diabetes", "Digestive conditions", "Other systemic illnesses"],
            care: "Arrange medical assessment for unexplained weight loss."
        },
        {
            name: "Swelling",
            aliases: ["swelling", "swollen legs", "swollen ankles", "ankle swelling", "feet swelling", "oedema", "edema"],
            description: "Swelling can arise from injury, inflammation, medicines, or circulation and organ-related conditions.",
            conditions: ["Injury", "Venous circulation problems", "Medication effects", "Heart or kidney conditions"],
            care: "Sudden swelling with breathlessness or chest pain is an emergency. New one-sided leg swelling needs prompt assessment."
        },
        {
            name: "Numbness or tingling",
            aliases: ["numbness", "tingling", "pins and needles", "pins needles", "numb hands", "numb feet", "loss of sensation"],
            description: "Numbness or tingling can occur from nerve pressure, metabolic conditions, or other causes.",
            conditions: ["Nerve compression", "Peripheral neuropathy", "Vitamin deficiencies", "Other neurological conditions"],
            care: "Sudden numbness or weakness on one side, facial droop, or speech difficulty is an emergency."
        },
        {
            name: "Tremor",
            aliases: ["tremor", "shaky hands", "shaking hands", "trembling", "hand tremor", "uncontrollable shaking"],
            description: "Tremor is involuntary shaking that may be related to medicines, stress, metabolic issues, or neurological conditions.",
            conditions: ["Essential tremor", "Medication effects", "Low blood glucose", "Other neurological conditions"],
            care: "Sudden shaking with confusion, fainting, or severe weakness needs urgent assessment."
        },
        {
            name: "Memory problems",
            aliases: ["memory loss", "memory problems", "forgetfulness", "forgetful", "poor memory", "confusion"],
            description: "Memory changes may be associated with sleep, stress, medicines, mood, or neurological and medical conditions.",
            conditions: ["Sleep problems", "Medication effects", "Mood disorders", "Neurological conditions"],
            care: "Sudden confusion is an emergency. Gradual or persistent memory changes should be discussed with a healthcare professional."
        },
        {
            name: "Fainting",
            aliases: ["fainting", "fainted", "passed out", "loss of consciousness", "syncope"],
            description: "Fainting is a brief loss of consciousness that may have cardiovascular or other causes.",
            conditions: ["Vasovagal syncope", "Dehydration", "Blood pressure changes", "Heart rhythm disorders"],
            care: "Fainting with chest pain, breathing difficulty, injury, or failure to recover promptly requires emergency help."
        },
        {
            name: "Menstrual cramps",
            aliases: ["period pain", "menstrual cramps", "painful periods", "period cramps", "dysmenorrhea"],
            description: "Menstrual cramps are lower abdominal cramps associated with menstruation.",
            conditions: ["Primary menstrual cramps", "Endometriosis", "Fibroids", "Other gynaecological conditions"],
            care: "Seek assessment for severe, new, or worsening pain or unusually heavy bleeding."
        },
        {
            name: "Heavy menstrual bleeding",
            aliases: ["heavy periods", "heavy menstrual bleeding", "very heavy period", "excessive menstrual bleeding"],
            description: "Menstrual bleeding that is unusually heavy or prolonged can have several causes.",
            conditions: ["Hormonal changes", "Fibroids", "Bleeding disorders", "Other gynaecological conditions"],
            care: "Seek urgent care for heavy bleeding with fainting, severe weakness, or possible pregnancy."
        },
        {
            name: "Pregnancy-related nausea",
            aliases: ["morning sickness", "pregnancy nausea", "nausea during pregnancy", "vomiting during pregnancy"],
            description: "Nausea and vomiting can occur during pregnancy, but severity varies.",
            conditions: ["Pregnancy-related nausea", "Other digestive conditions"],
            care: "Seek advice if unable to keep fluids down, urinating very little, or feeling faint."
        },
        {
            name: "Menstrual irregularity",
            aliases: ["irregular periods", "missed period", "late period", "period late", "absent period"],
            description: "Menstrual changes may relate to pregnancy, stress, hormonal variation, or other conditions.",
            conditions: ["Pregnancy", "Polycystic ovary syndrome", "Thyroid disorders", "Stress-related changes"],
            care: "Consider a pregnancy test if relevant and seek professional advice for persistent irregularity."
        },
        {
            name: "Back and leg nerve pain",
            aliases: ["sciatica", "shooting leg pain", "pain down leg", "radiating back pain", "nerve pain in leg"],
            description: "Pain travelling from the back into the leg can occur when a nerve is irritated.",
            conditions: ["Sciatica", "Disc-related nerve irritation", "Other spinal conditions"],
            care: "New leg weakness, numbness around the groin, or bladder or bowel changes requires emergency assessment."
        },
        {
            name: "Fever with rash",
            aliases: ["fever and rash", "rash with fever", "skin rash and fever"],
            description: "Fever accompanied by a rash can occur in several infections and inflammatory conditions.",
            conditions: ["Viral infections", "Other infections", "Medication reactions"],
            care: "Seek urgent assessment for a rapidly spreading rash, confusion, severe headache, or marked illness."
        },
        {
            name: "Loss of smell or taste",
            aliases: ["loss of smell", "cant smell", "cannot smell", "loss of taste", "cant taste", "cannot taste"],
            description: "Changes in smell or taste may occur with respiratory infections, nasal conditions, or other causes.",
            conditions: ["Respiratory viral infections", "Sinus conditions", "Nasal inflammation"],
            care: "Seek advice if the change persists or comes with other concerning symptoms."
        },
        {
            name: "Dry mouth",
            aliases: ["dry mouth", "mouth feels dry", "xerostomia"],
            description: "Dry mouth may be associated with dehydration, medicines, or salivary gland conditions.",
            conditions: ["Dehydration", "Medication effects", "Salivary gland disorders"],
            care: "Seek advice if persistent or accompanied by difficulty swallowing."
        },
        {
            name: "Pale skin",
            aliases: ["pale skin", "looking pale", "pallor", "pale face"],
            description: "Paleness may be related to lighting, circulation, anaemia, or other conditions.",
            conditions: ["Anaemia", "Circulation changes", "Other medical conditions"],
            care: "Sudden marked paleness with chest pain, breathlessness, confusion, or fainting requires urgent help."
        },
        {
            name: "Night sweats",
            aliases: ["night sweats", "sweating at night", "excessive night sweating"],
            description: "Night sweats may relate to room temperature, medicines, hormonal changes, infections, or other conditions.",
            conditions: ["Environmental overheating", "Medication effects", "Hormonal changes", "Some infections"],
            care: "Seek advice for repeated unexplained night sweats, especially with fever or weight loss."
        },
        {
            name: "Excessive sweating",
            aliases: ["excessive sweating", "sweating too much", "heavy sweating", "hyperhidrosis", "sweating"],
            description: "Excessive sweating may occur with heat, exertion, anxiety, medicines, or medical conditions.",
            conditions: ["Heat or exertion", "Anxiety", "Medication effects", "Other medical conditions"],
            care: "Heavy sweating with chest pain, faintness, or breathing difficulty requires urgent assessment."
        },
        {
            name: "Difficulty concentrating",
            aliases: ["difficulty concentrating", "poor concentration", "brain fog", "cant concentrate", "cannot concentrate"],
            description: "Concentration difficulties may be associated with sleep, stress, mood, medicines, or illness.",
            conditions: ["Sleep deprivation", "Stress", "Mood disorders", "Other medical conditions"],
            care: "Sudden confusion or a sudden change in alertness requires emergency assessment."
        },
        {
            name: "Jaundice-like symptoms",
            aliases: ["yellow skin", "yellow eyes", "yellowing of eyes", "yellowing skin", "jaundice"],
            description: "Yellowing of the skin or whites of the eyes may indicate a problem involving the liver, bile ducts, or blood.",
            conditions: ["Liver conditions", "Bile duct conditions", "Some blood disorders"],
            care: "New yellowing of the eyes or skin needs prompt medical assessment."
        },
        {
            name: "Bleeding gums",
            aliases: ["bleeding gums", "gums bleeding", "gum bleeding"],
            description: "Bleeding gums may be related to gum inflammation, brushing, or other oral or medical conditions.",
            conditions: ["Gingivitis", "Periodontal disease", "Other causes of bleeding"],
            care: "Arrange dental assessment for recurring bleeding or swollen gums."
        },
        {
            name: "Nosebleed",
            aliases: ["nosebleed", "nose bleeding", "bleeding nose", "epistaxis"],
            description: "Nosebleeds can occur from dryness, irritation, injury, or other factors.",
            conditions: ["Dry nasal lining", "Nasal irritation", "Minor injury", "Other causes"],
            care: "Seek urgent help for heavy bleeding, breathing difficulty, or bleeding that does not stop after firm continuous pressure."
        },
        {
            name: "Painful muscle after exercise",
            aliases: ["muscle soreness after exercise", "post workout pain", "sore after gym", "exercise soreness"],
            description: "Muscle soreness can follow unfamiliar or intense exercise.",
            conditions: ["Delayed-onset muscle soreness", "Muscle strain"],
            care: "Severe pain, significant swelling, profound weakness, or dark urine after exercise needs urgent assessment."
        },
        {
            name: "Allergy symptoms",
            aliases: ["allergy", "allergies", "sneezing allergy", "allergic reaction", "hay fever"],
            description: "Allergies may cause sneezing, itching, watery eyes, nasal symptoms, or skin reactions.",
            conditions: ["Allergic rhinitis", "Allergic conjunctivitis", "Hives"],
            care: "Swelling of the tongue or throat, wheezing, or breathing difficulty can signal a life-threatening allergic reaction."
        },
        {
            name: "Burning feet",
            aliases: ["burning feet", "burning sensation in feet", "burning hands", "burning sensation in hands"],
            description: "A burning sensation in the hands or feet may arise from nerve, skin, or other conditions.",
            conditions: ["Peripheral neuropathy", "Skin irritation", "Nerve compression", "Other causes"],
            care: "Seek assessment for persistent symptoms, wounds, weakness, or loss of sensation."
        },
        {
            name: "Difficulty walking",
            aliases: ["difficulty walking", "trouble walking", "unsteady walking", "loss of balance", "walking difficulty"],
            description: "Walking difficulty may arise from injury, pain, balance problems, or neurological conditions.",
            conditions: ["Joint or muscle conditions", "Inner-ear disorders", "Neurological conditions"],
            care: "Sudden inability to walk or sudden imbalance with weakness or speech problems is an emergency."
        },
        {
            name: "Swollen lymph nodes",
            aliases: ["swollen lymph nodes", "swollen glands", "enlarged lymph nodes", "lump in neck"],
            description: "Swollen lymph nodes often occur when the immune system responds to infection, but other causes exist.",
            conditions: ["Viral infections", "Throat infections", "Other immune or medical conditions"],
            care: "Seek advice for persistent, enlarging, hard, or unexplained lumps."
        },
        {
            name: "Hoarse voice",
            aliases: ["hoarse voice", "hoarseness", "lost voice", "voice change", "raspy voice"],
            description: "Hoarseness can occur with viral illness, voice strain, reflux, or irritation.",
            conditions: ["Laryngitis", "Voice strain", "Reflux-related irritation"],
            care: "Seek advice if hoarseness persists. Breathing difficulty or inability to swallow requires urgent assessment."
        }
    ];

    /*
     * Combination condition profiles:
     * These explicit profiles allow selected combinations to be ranked
     * more meaningfully than simply combining separate symptom lists.
     *
     * "symptoms" must match the normalised symptom names above.
     * "aliases" provide additional wording users may enter.
     *
     * This is an illustrative demo catalogue, not a validated medical model.
     */

    const COMBINATION_PROFILES = [
        {
            name: "Influenza (flu)",
            symptoms: ["Fever", "Cough", "Body aches", "Fatigue", "Chills"],
            aliases: ["flu", "influenza"],
            description: "Influenza can cause fever, cough, muscle or body aches, fatigue, and chills. Other infections can cause similar symptoms."
        },
        {
            name: "Other viral respiratory infection",
            symptoms: ["Fever", "Cough", "Common cold symptoms", "Sore throat", "Body aches", "Fatigue"],
            aliases: ["viral respiratory infection", "viral infection"],
            description: "Several viral infections can cause combinations of respiratory symptoms and general aches."
        },
        {
            name: "COVID-19",
            symptoms: ["Fever", "Cough", "Fatigue", "Body aches", "Common cold symptoms", "Loss of smell or taste", "Sore throat"],
            aliases: ["covid", "covid 19", "coronavirus"],
            description: "COVID-19 can cause respiratory symptoms, fatigue, fever, aches, and sometimes changes in smell or taste. Symptoms alone cannot confirm it."
        },
        {
            name: "Common cold",
            symptoms: ["Common cold symptoms", "Cough", "Sore throat", "Fatigue"],
            aliases: ["common cold", "cold"],
            description: "A common cold often involves a runny or blocked nose, sneezing, sore throat, and sometimes a cough."
        },
        {
            name: "Allergic rhinitis",
            symptoms: ["Common cold symptoms", "Itching", "Eye redness", "Allergy symptoms"],
            aliases: ["hay fever", "seasonal allergies"],
            description: "Allergic rhinitis can cause sneezing, nasal symptoms, and itchy or watery eyes. Fever is not typical."
        },
        {
            name: "Migraine",
            symptoms: ["Headache", "Migraine-like symptoms", "Nausea", "Vomiting", "Dizziness"],
            aliases: ["migraine headache"],
            description: "Migraine can involve headache, nausea, vomiting, dizziness, and sensitivity to light. A first or unusually severe headache needs assessment."
        },
        {
            name: "Gastroenteritis",
            symptoms: ["Abdominal pain", "Nausea", "Vomiting", "Diarrhoea", "Fever", "Fatigue"],
            aliases: ["stomach bug", "gastrointestinal infection"],
            description: "Gastroenteritis may cause abdominal discomfort, vomiting, diarrhoea, nausea, and sometimes fever."
        },
        {
            name: "Foodborne illness",
            symptoms: ["Abdominal pain", "Nausea", "Vomiting", "Diarrhoea", "Fever"],
            aliases: ["food poisoning", "food poisoning symptoms"],
            description: "Foodborne illness can cause digestive symptoms. The cause and severity depend on the specific illness."
        },
        {
            name: "Gastro-oesophageal reflux",
            symptoms: ["Heartburn", "Nausea", "Bloating", "Cough"],
            aliases: ["gerd", "reflux"],
            description: "Reflux can cause heartburn and sometimes nausea or cough. Do not assume new chest pain is reflux."
        },
        {
            name: "Constipation-related symptoms",
            symptoms: ["Constipation", "Abdominal pain", "Bloating"],
            aliases: ["constipation"],
            description: "Constipation can be accompanied by abdominal discomfort and bloating."
        },
        {
            name: "Urinary tract infection",
            symptoms: ["Painful urination", "Frequent urination", "Fever", "Abdominal pain"],
            aliases: ["uti", "urine infection", "bladder infection"],
            description: "A urinary tract infection can cause painful or frequent urination. Fever or flank pain may indicate a more serious infection."
        },
        {
            name: "Possible kidney stone",
            symptoms: ["Abdominal pain", "Back pain", "Nausea", "Vomiting", "Blood in urine"],
            aliases: ["kidney stone", "kidney stones"],
            description: "Kidney stones may cause severe side or back pain, nausea, vomiting, or blood in urine. These symptoms need medical assessment."
        },
        {
            name: "Anaemia",
            symptoms: ["Fatigue", "Dizziness", "Pale skin", "Shortness of breath", "Headache"],
            aliases: ["anemia", "anaemia"],
            description: "Anaemia can cause tiredness, paleness, dizziness, headaches, or breathlessness. Testing is needed to establish whether anaemia is present."
        },
        {
            name: "Possible dehydration",
            symptoms: ["Dizziness", "Fatigue", "Headache", "Nausea", "Excessive thirst"],
            aliases: ["dehydration"],
            description: "Dehydration can contribute to thirst, dizziness, headache, and fatigue. These symptoms also have other causes."
        },
        {
            name: "Asthma",
            symptoms: ["Cough", "Shortness of breath", "Wheezing", "Chest pain"],
            aliases: ["asthma"],
            description: "Asthma can cause wheezing, coughing, chest tightness, and breathlessness. Severe breathing difficulty is an emergency."
        },
        {
            name: "Possible musculoskeletal back pain",
            symptoms: ["Back pain", "Muscle pain", "Leg pain"],
            aliases: ["mechanical back pain", "muscle-related back pain"],
            description: "Muscle or mechanical back pain can follow strain or posture-related stress. Neurological warning signs require urgent assessment."
        },
        {
            name: "Possible sciatica",
            symptoms: ["Back pain", "Leg pain", "Numbness or tingling"],
            aliases: ["sciatica", "pinched nerve"],
            description: "Sciatica may cause pain travelling from the back down a leg, sometimes with tingling or numbness."
        },
        {
            name: "Possible allergic reaction",
            symptoms: ["Hives", "Itching", "Skin rash", "Wheezing"],
            aliases: ["allergic reaction", "allergy reaction"],
            description: "Allergic reactions can cause itching, hives, or rash. Tongue or throat swelling and breathing difficulty require emergency help."
        },
        {
            name: "Possible conjunctivitis",
            symptoms: ["Eye redness"],
            aliases: ["pink eye"],
            description: "Conjunctivitis can cause red or irritated eyes. Eye pain or vision changes need urgent assessment."
        },
        {
            name: "Possible diabetes-related symptoms",
            symptoms: ["Excessive thirst", "Frequent urination", "Fatigue", "Unexplained weight loss", "Blurred vision"],
            aliases: ["diabetes", "high blood sugar"],
            description: "Excessive thirst, frequent urination, fatigue, and unexplained weight loss can occur with diabetes but are not specific to it. Medical testing is needed."
        },
        {
            name: "Possible thyroid disorder",
            symptoms: ["Fatigue", "Unexplained weight loss", "Hair loss", "Palpitations"],
            aliases: ["thyroid problem", "thyroid disease"],
            description: "Thyroid conditions can cause changes in energy, weight, hair, or heart rate. Symptoms vary and testing is required."
        },
        {
            name: "Possible panic attack",
            symptoms: ["Anxiety-like symptoms", "Palpitations", "Dizziness", "Shortness of breath", "Excessive sweating"],
            aliases: ["panic attack"],
            description: "Panic attacks can cause intense fear, racing heart, sweating, dizziness, and breathlessness. New physical symptoms must not automatically be attributed to anxiety."
        }
    ];

    const RED_FLAGS = [
        {
            terms: ["chest pain", "chest pressure", "chest tightness", "chest heaviness"],
            message: "New or unexplained chest pain needs prompt assessment. Severe pressure, spreading pain, sweating, or breathlessness requires emergency help."
        },
        {
            terms: ["shortness of breath", "breathlessness", "difficulty breathing", "trouble breathing", "gasping", "cant breathe", "cannot breathe"],
            message: "Severe or sudden breathing difficulty is an emergency. Contact local emergency services immediately."
        },
        {
            terms: ["fainting", "passed out", "loss of consciousness"],
            message: "Loss of consciousness can have serious causes. Seek emergency help if the person has not fully recovered, is injured, or has chest pain or breathing difficulty."
        },
        {
            terms: ["blood in urine", "bloody urine", "haematuria", "hematuria"],
            message: "Visible blood in urine needs prompt medical assessment, even if it happens only once."
        },
        {
            terms: ["vomiting blood", "blood in vomit", "coughing blood", "coughing up blood"],
            message: "Vomiting blood or coughing up blood needs urgent medical assessment. Call emergency services for substantial bleeding or breathing difficulty."
        },
        {
            terms: ["facial droop", "face drooping", "slurred speech", "difficulty speaking", "sudden weakness", "one sided weakness"],
            message: "Sudden facial droop, speech difficulty, or one-sided weakness can be signs of a stroke. Call emergency services immediately."
        },
        {
            terms: ["suicidal", "suicidal thoughts", "self harm", "want to die"],
            message: "If someone may harm themselves or is in immediate danger, stay with them if safe and contact local emergency services or an appropriate crisis service immediately."
        }
    ];

    function normalize(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/[’']/g, "")
            .replace(/[^a-z0-9\s-]/g, " ")
            .replace(/-/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        node.textContent = text;

        if (className) {
            node.className = className;
        }

        return node;
    }

    function makeCard(title, className) {
        const card = document.createElement("article");
        card.className = className || "feature-card";
        card.appendChild(element("h2", title));
        return card;
    }

    function findSymptom(term) {
        const normalized = normalize(term);

        return SYMPTOMS.find(function (item) {
            return normalize(item.name) === normalized ||
                item.aliases.some(function (alias) {
                    return normalize(alias) === normalized;
                });
        });
    }

    function findSuggestions(term) {
        const normalized = normalize(term);

        if (!normalized) return [];

        return SYMPTOMS.filter(function (item) {
            return normalize(item.name).includes(normalized) ||
                item.aliases.some(function (alias) {
                    return normalize(alias).includes(normalized);
                });
        }).slice(0, 6);
    }

    function findRedFlags(text) {
        const normalized = normalize(text);

        return RED_FLAGS.filter(function (flag) {
            return flag.terms.some(function (term) {
                return normalized.includes(normalize(term));
            });
        });
    }

    function addSources(parent) {
        const section = document.createElement("div");
        section.style.marginTop = "18px";
        section.appendChild(element("h3", "Trusted health information"));

        const list = document.createElement("ul");

        SOURCES.forEach(function (source) {
            const li = document.createElement("li");
            const link = document.createElement("a");

            link.href = source.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = source.name;
            link.style.color = "var(--primary)";

            li.appendChild(link);
            list.appendChild(li);
        });

        section.appendChild(list);
        parent.appendChild(section);
    }

    function addDisclaimerAndSources() {
        const disclaimer = document.createElement("aside");
        disclaimer.className = "safety-notice";

        disclaimer.appendChild(element("strong", "Important medical disclaimer"));
        disclaimer.appendChild(element(
            "p",
            "Care Catalyst is an educational demonstration, not a diagnostic tool. Its catalogue is not clinically validated or exhaustive. Rankings are based on symptom overlap, not a validated medical model or personal disease probability. Symptoms can have serious causes even when no match is found. Consult a qualified healthcare professional for medical advice."
        ));

        results.appendChild(disclaimer);
        addSources(results);
    }

    function renderSuggestions(term) {
        const suggestions = findSuggestions(term);

        if (!suggestions.length) return;

        const section = document.createElement("section");
        section.style.marginTop = "12px";
        section.appendChild(element("h3", "Possible symptom matches"));

        const row = document.createElement("div");
        row.className = "example-tags";

        suggestions.forEach(function (item) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "tag-button";
            button.textContent = item.name;

            button.addEventListener("click", function () {
                input.value = item.name;
                searchSymptoms(input.value);
            });

            row.appendChild(button);
        });

        section.appendChild(row);
        results.appendChild(section);
    }

    function renderCombinationResults(matchedSymptoms) {
        const matchedNames = matchedSymptoms.map(function (item) {
            return item.name;
        });

        const matchedNameSet = {};

        matchedNames.forEach(function (name) {
            matchedNameSet[normalize(name)] = true;
        });

        const profiles = COMBINATION_PROFILES.map(function (profile) {
            const profileSymptoms = profile.symptoms;
            const overlap = profileSymptoms.filter(function (name) {
                return matchedNameSet[normalize(name)];
            });

            const coverage = overlap.length / profileSymptoms.length;
            const inputCoverage = overlap.length / matchedNames.length;

            return {
                profile: profile,
                overlap: overlap,
                count: overlap.length,
                coverage: coverage,
                inputCoverage: inputCoverage
            };
        }).filter(function (item) {
            return item.count > 0;
        });

        profiles.sort(function (a, b) {
            // First prioritise conditions explaining more entered symptoms.
            // Then use profile coverage as a tie-breaker.
            if (b.inputCoverage !== a.inputCoverage) {
                return b.inputCoverage - a.inputCoverage;
            }

            if (b.coverage !== a.coverage) {
                return b.coverage - a.coverage;
            }

            return b.count - a.count;
        });

        results.appendChild(element("h2", "Possible conditions for this combination"));

        results.appendChild(element(
            "p",
            "Symptoms recognised: " + matchedNames.join(", "),
            "form-help"
        ));

        results.appendChild(element(
            "p",
            "Conditions below are ranked by overlap with your recognised symptoms. This is an educational matching score, not a probability that you have a condition.",
            "form-help"
        ));

        if (matchedNames.length < 2) {
            results.appendChild(element(
                "p",
                "You entered one recognised symptom. Add more symptoms to explore a combination.",
                "form-help"
            ));
        }

        if (!profiles.length) {
            results.appendChild(element(
                "p",
                "No condition profile matched these symptom topics in the combination catalogue. This does not mean there is no medical cause. The catalogue is limited.",
                "form-help"
            ));
        }

        profiles.slice(0, 8).forEach(function (item, index) {
            const card = makeCard(
                (index + 1) + ". " + item.profile.name,
                "feature-card"
            );

            card.style.marginBottom = "14px";

            card.appendChild(element("p", item.profile.description));

            card.appendChild(element(
                "p",
                "Symptoms matched: " + item.overlap.join(", ")
            ));

            card.appendChild(element(
                "p",
                "Catalogue overlap: " + item.count + " of " +
                    item.profile.symptoms.length + " symptoms listed for this condition."
            ));

            card.appendChild(element(
                "p",
                "This association does not establish a diagnosis. Other causes may fit the same symptoms."
            ));

            results.appendChild(card);
        });

        /*
         * Also show the existing catalogue's shared associations.
         * This preserves useful information when a combination profile
         * has not been created for a particular symptom.
         */

        const fallbackScores = {};

        matchedSymptoms.forEach(function (symptom) {
            symptom.conditions.forEach(function (condition) {
                if (!fallbackScores[condition]) {
                    fallbackScores[condition] = {
                        name: condition,
                        symptoms: []
                    };
                }

                if (fallbackScores[condition].symptoms.indexOf(symptom.name) === -1) {
                    fallbackScores[condition].symptoms.push(symptom.name);
                }
            });
        });

        const fallback = Object.keys(fallbackScores)
            .map(function (key) {
                return fallbackScores[key];
            })
            .filter(function (item) {
                return item.symptoms.length > 1;
            })
            .sort(function (a, b) {
                return b.symptoms.length - a.symptoms.length;
            });

        if (fallback.length) {
            const section = document.createElement("details");
            section.style.marginTop = "16px";
            section.appendChild(element(
                "summary",
                "Other shared associations from the symptom catalogue"
            ));

            fallback.slice(0, 10).forEach(function (item) {
                const card = makeCard(item.name, "feature-card");
                card.style.marginTop = "10px";

                card.appendChild(element(
                    "p",
                    "Associated in the catalogue with: " + item.symptoms.join(", ")
                ));

                section.appendChild(card);
            });

            results.appendChild(section);
        }
    }

    function searchSymptoms(rawInput) {
        const query = String(rawInput || "").trim();

        while (results.firstChild) {
            results.removeChild(results.firstChild);
        }

        if (!query) {
            results.appendChild(element(
                "p",
                "Enter one or more symptoms separated by commas."
            ));
            return;
        }

        const terms = query
            .split(/[,;\n]+|\s+\band\b\s+/i)
            .map(function (term) {
                return term.trim();
            })
            .filter(Boolean);

        const matched = [];
        const unknown = [];

        terms.forEach(function (term) {
            const match = findSymptom(term);

            if (match) {
                if (matched.indexOf(match) === -1) {
                    matched.push(match);
                }
            } else {
                unknown.push(term);
            }
        });

        const flags = findRedFlags(query);

        if (flags.length) {
            const warning = makeCard("Urgent warning signs", "safety-notice");

            warning.appendChild(element(
                "p",
                "Your search includes wording that can be associated with an emergency. This is a precautionary keyword check, not a medical assessment."
            ));

            flags.forEach(function (flag) {
                warning.appendChild(element("p", flag.message));
            });

            warning.appendChild(element(
                "p",
                "If these symptoms are severe or sudden, contact local emergency services. In India, dial 112 for an emergency."
            ));

            results.appendChild(warning);
        }

        if (matched.length) {
            renderCombinationResults(matched);
        }

        if (unknown.length) {
            const card = makeCard("Unrecognised search terms");

            card.appendChild(element(
                "p",
                "These terms were not included in the matching: " + unknown.join(", ") + "."
            ));

            card.appendChild(element(
                "p",
                "Use recognised phrases separated by commas, for example: fever, cough, body pain."
            ));

            results.appendChild(card);

            unknown.forEach(function (term) {
                renderSuggestions(term);
            });
        }

        if (!matched.length) {
            results.appendChild(element(
                "p",
                "No recognised symptoms were found. Try a different phrase or choose a suggestion."
            ));
        }

        addDisclaimerAndSources();
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        searchSymptoms(input.value);
    });

    document.querySelectorAll("[data-symptom]").forEach(function (button) {
        button.addEventListener("click", function () {
            input.value = button.dataset.symptom;
            searchSymptoms(input.value);
        });
    });

    input.setAttribute("autocomplete", "off");
    input.setAttribute(
        "aria-label",
        "Search one or more symptoms separated by commas"
    );
});