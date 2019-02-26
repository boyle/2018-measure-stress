// Tracked variables
export const VESTIBULAR_DOMAIN = "VESTIBULAR_DOMAIN";
export const HYPERAROUSAL_DOMAIN = "HYPERAROUSAL_DOMAIN";
export const MOTOR_SYSTEM_DOMAIN = "MOTOR_SYSTEM_DOMAIN";
export const SENSORY_DOMAIN = "SENSORY_DOMAIN";
export const COGNITIVE_DOMAIN = "COGNITIVE_DOMAIN";
export const PAIN_LEVEL = "PAIN_LEVEL";
export const PERCEIVED_EXERTION = "PERCEIVED_EXERTION";

export default {
  VESTIBULAR_DOMAIN: {
    domain: VESTIBULAR_DOMAIN,
    label: "Vestibular Domain",
    color: "#E69F00",
    levels: {
      0: "No symptoms",
      1: "Stomach awareness/swallowing/burping",
      2: "Nausea",
      3: "Sensation of ground moving",
      4: "Vertigo (left/right spinning)",
      5: "Vertigo (back/forward somersaulting)",
      6: "Vertigo (left/right cartwheeling)",
      7: "Severe spatial disorientation",
      8: "Nystagmus",
      9: "Vomiting"
    }
  },

  HYPERAROUSAL_DOMAIN: {
    domain: HYPERAROUSAL_DOMAIN,
    label: "Hyperarousal Domain",
    color: "#56B4E9",
    levels: {
      0: "Baseline state",
      1: "Increased photophobia or hyperacusis",
      2: "Tunnel vision/visual-auditory fixation",
      3: "Rapid eye scanning/frequent head turn/fullness of head",
      4: "Tinnitus/migraine/light or noise sensitivity",
      5: "Flashback/catatonia/dissociation"
    }
  },

  MOTOR_SYSTEM_DOMAIN: {
    domain: MOTOR_SYSTEM_DOMAIN,
    label: "Motor Systems Domain",
    color: "#009E73",
    levels: {
      0: "Baseline state",
      1: "Decreased eccentric control of muscles/poor coordination",
      2: "Increased tone/disinhibition of spinal reflexes/garding posture",
      3: "Intermittent motor inhibition",
      4: "Complete motor inhibition"
    }
  },

  SENSORY_DOMAIN: {
    domain: SENSORY_DOMAIN,
    label: "Sensory Domain",
    color: "#F0E442",
    levels: {
      0: "Baseline state",
      1: "Tingling/burning",
      2: "Numbness",
      3: "Unable to situation part/whole body in space"
    }
  },

  COGNITIVE_DOMAIN: {
    domain: COGNITIVE_DOMAIN,
    color: "#0072B2",
    label: "Cognitive domain",
    levels: {
      0: "Baseline cognition",
      1: "Difficulty dual tasking",
      2: "Difficulty with single task",
      3: "Brain fog",
      4: "Confusion",
      5: "Catatonia"
    }
  },

  PAIN_LEVEL: {
    domain: PAIN_LEVEL,
    label: "Pain level",
    color: "#000000",
    levels: {
      0: "Pain level 0",
      1: "Pain level 1",
      2: "Pain level 2",
      3: "Pain level 3",
      4: "Pain level 4",
      5: "Pain level 5",
      6: "Pain level 6",
      7: "Pain level 7",
      8: "Pain level 8",
      9: "Pain level 9",
      10: "Pain level 10"
    }
  },

  PERCEIVED_EXERTION: {
    domain: PERCEIVED_EXERTION,
    label: "Perceived exertion",
    color: "#CC79A7",
    levels: {
      0: "Level 6",
      1: "Level 7",
      2: "Level 8",
      3: "Level 9",
      4: "Level 10",
      5: "Level 11",
      6: "Level 12",
      7: "Level 13",
      8: "Level 14",
      9: "Level 15",
      10: "Level 16",
      11: "Level 17",
      12: "Level 18",
      13: "Level 19",
      14: "Level 20"
    }
  }
};
