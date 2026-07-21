// JSON schema the model must fill in, via forced Anthropic tool-use.
// This mirrors the 8-section structure of the Practus persona 1-pager template.

const bulletItem = {
  type: "object",
  properties: {
    label: { type: "string", enum: ["observed", "inferred", "gap"] },
    text: { type: "string" }
  },
  required: ["label", "text"]
};

const personaReportSchema = {
  name: "emit_persona_report",
  description:
    "Emit the complete structured persona 1-pager as JSON, following the Practus persona-analyst methodology exactly. Every bullet must be labelled observed, inferred, or gap.",
  input_schema: {
    type: "object",
    properties: {
      person: {
        type: "object",
        properties: {
          name: { type: "string" },
          roleTitle: { type: "string", description: "e.g. 'Chief Operating Officer, Sanctum Wealth'" },
          subtitle: { type: "string", description: "Location | education | headline experience summary" },
          initials: { type: "string", description: "2-letter initials for the avatar" },
          badges: {
            type: "array",
            items: { type: "string" },
            description: "3-4 short badge labels, e.g. seniority, functional focus, sector tags"
          }
        },
        required: ["name", "roleTitle", "subtitle", "initials", "badges"]
      },
      sourceValidationNote: {
        type: "string",
        description: "1-3 sentence note on what sources were actually used (only the material provided in the input, no live browsing was performed) and any name-collision or data-quality caveats."
      },
      section1: {
        type: "object",
        properties: {
          factsLeft: { type: "array", items: bulletItem },
          factsRight: { type: "array", items: bulletItem },
          timeline: {
            type: "array",
            items: {
              type: "object",
              properties: {
                date: { type: "string" },
                role: { type: "string" },
                firm: { type: "string" }
              },
              required: ["date", "role", "firm"]
            }
          }
        },
        required: ["factsLeft", "factsRight", "timeline"]
      },
      section2: {
        type: "object",
        properties: {
          note: { type: "string", description: "Caveat about how much LinkedIn content was actually available in the provided input." },
          contentThemes: { type: "array", items: { type: "string" } },
          contentTypeBullets: { type: "array", items: bulletItem },
          engagementBullets: { type: "array", items: bulletItem }
        },
        required: ["note", "contentThemes", "contentTypeBullets", "engagementBullets"]
      },
      section3: {
        type: "object",
        properties: {
          note: { type: "string" },
          left: { type: "array", items: bulletItem },
          right: { type: "array", items: bulletItem }
        },
        required: ["note", "left", "right"]
      },
      section4: {
        type: "object",
        properties: {
          interestAreas: {
            type: "array",
            items: { type: "string" },
            description: "5-7 high-probability professional interest areas, short phrases."
          },
          hooks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                text: { type: "string" }
              },
              required: ["title", "text"]
            },
            description: "Ready-to-use conversation hooks, each tied to a specific item in the supplied material."
          }
        },
        required: ["interestAreas", "hooks"]
      },
      section5: {
        type: "object",
        properties: {
          resonates: { type: "array", items: { type: "string" } },
          avoid: { type: "array", items: { type: "string" } },
          openingLines: {
            type: "array",
            items: { type: "string" },
            description: "2-3 opening line variants for email/LinkedIn."
          },
          icebreakers: {
            type: "array",
            items: { type: "string" },
            description: "2-3 meeting icebreaker lines referencing a talk, article, milestone, or sector trend."
          }
        },
        required: ["resonates", "avoid", "openingLines", "icebreakers"]
      },
      section6: {
        type: "object",
        properties: {
          cards: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                body: { type: "string" },
                questions: {
                  type: "array",
                  items: { type: "string" },
                  description: "1-3 entry-point questions/hypotheses for this relevance area."
                }
              },
              required: ["title", "body", "questions"]
            },
            description: "One card per relevant Practus opportunity area: transformation, cost optimization, performance improvement, value creation. Omit an area only if genuinely not relevant to this person's role."
          }
        },
        required: ["cards"]
      },
      section7: {
        type: "object",
        properties: {
          flags: { type: "array", items: { type: "string" } },
          noFlagsFound: { type: "boolean" }
        },
        required: ["flags", "noFlagsFound"]
      },
      section8: {
        type: "object",
        properties: {
          overall: { type: "string", description: "e.g. 'High', 'Medium', 'Medium-High', 'Low'" },
          bars: {
            type: "array",
            items: {
              type: "object",
              properties: {
                label: { type: "string" },
                pct: { type: "number" },
                rating: { type: "string" }
              },
              required: ["label", "pct", "rating"]
            }
          },
          notes: { type: "array", items: { type: "string" } }
        },
        required: ["overall", "bars", "notes"]
      },
      optionalEnhancement: {
        type: "object",
        properties: {
          include: { type: "boolean" },
          psychDrivers: { type: "array", items: { type: "string" } },
          engagementStrategy: { type: "array", items: { type: "string" } }
        },
        required: ["include", "psychDrivers", "engagementStrategy"]
      }
    },
    required: [
      "person",
      "sourceValidationNote",
      "section1",
      "section2",
      "section3",
      "section4",
      "section5",
      "section6",
      "section7",
      "section8",
      "optionalEnhancement"
    ]
  }
};

module.exports = { personaReportSchema };
