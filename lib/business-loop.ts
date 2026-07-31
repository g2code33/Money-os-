export const buildToEarnLoop = [
  "discover",
  "validate",
  "build",
  "launch",
  "sell",
  "measure",
  "learn"
] as const;

export type LoopStage = (typeof buildToEarnLoop)[number];

export type LoopSignal = {
  stage: LoopStage;
  metric: string;
  expectedEvidence: string;
};

export const loopSignals: LoopSignal[] = [
  { stage: "discover", metric: "problem count", expectedEvidence: "People complain about or search for this problem" },
  { stage: "validate", metric: "willingness to pay", expectedEvidence: "Competitors, paid tools, preorders, interviews, or paid pilots" },
  { stage: "build", metric: "MVP completion", expectedEvidence: "Working solution that solves one painful problem" },
  { stage: "launch", metric: "qualified visitors", expectedEvidence: "Target users reach the offer" },
  { stage: "sell", metric: "customers/revenue", expectedEvidence: "Real payment or signed pilot" },
  { stage: "measure", metric: "profit and conversion", expectedEvidence: "Revenue, costs, leads, conversion rates" },
  { stage: "learn", metric: "decision update", expectedEvidence: "Memory record explaining what to repeat or stop" }
];
