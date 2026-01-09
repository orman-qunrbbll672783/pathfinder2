# PathFinder - Situation-Based AI Reasoning Architecture

## Core Principle
**Different situation = Different AI reasoning = Different outcome**

NOT: Different situation → Same questions → Same universities

---

## Situation Analysis & AI Response Strategy

### 1. "I don't know what to do next" (Exploration Mode)

**User Mental State**: Confused, overwhelmed, no clear direction

**AI Reasoning Goals**:
- Understand their interests, skills, constraints
- Explore ALL options (not just universities)
- Help them discover what they want
- No pressure to decide

**Questions AI Should Ask** (Dynamic, conversational):
- "What are you currently doing?"
- "What excites you? What scares you?"
- "Have you considered alternatives to traditional university?"
- "What matters most: money, time, career, passion?"

**AI Output**:
- Exploration map (universities, bootcamps, gap year, work, apprenticeships)
- Pros/cons of each direction
- "You don't have to decide now" reassurance
- Suggested next steps for exploration

**NOT**: 3 university recommendations

---

### 2. "I want to study abroad" (Execution Mode)

**User Mental State**: Clear goal, needs concrete plan

**AI Reasoning Goals**:
- Validate if study abroad is realistic
- Find best paths based on constraints
- Provide actionable timeline

**Questions AI Should Ask**:
- Budget level
- Target country (if any)
- Field of study
- Timeline urgency

**AI Output**:
- 3-5 university paths with fit scores
- Scholarship matches
- Visa requirements
- Timeline with deadlines

**This is the ONLY card that defaults to universities**

---

### 3. "I already chose but feel unsure" (Validation Mode)

**User Mental State**: Doubt, second-guessing, need reassurance

**AI Reasoning Goals**:
- Understand what they chose
- Analyze if it's a good decision
- Surface hidden risks
- Provide validation OR suggest reconsideration

**Questions AI Should Ask**:
- "What did you choose?"
- "Why are you unsure?"
- "What are your main doubts?"

**AI Output**:
- Decision analysis (strengths/weaknesses of their choice)
- Risk assessment
- "Here's what you might have missed"
- Reassurance if it's good, alternatives if it's not

**NOT**: New university options (unless they want to reconsider)

---

### 4. "Something went wrong" (Recovery Mode)

**User Mental State**: Crisis, stress, need immediate help

**AI Reasoning Goals**:
- Understand the problem
- Generate recovery plan
- Provide emotional support + practical solutions
- Show fallback options

**Questions AI Should Ask**:
- "What happened?"
- "When did it happen?"
- "What have you tried?"

**AI Output**:
- Emergency recovery plan
- Immediate actions (next 48 hours)
- Short-term solutions (1-4 weeks)
- Long-term fallbacks (if needed)
- Emotional support messaging

**NOT**: University recommendations (unless that's the fallback)

---

### 5. "I just want to explore safely" (Browse Mode)

**User Mental State**: Curious but not ready to commit

**AI Reasoning Goals**:
- Provide information without pressure
- Let them explore at their own pace
- No profile collection (unless they want)

**Questions AI Should Ask**:
- Minimal or none
- "What would you like to know about?"
- "Any specific country or field you're curious about?"

**AI Output**:
- General insights (country comparisons, cost ranges, timelines)
- Interactive exploration (click to learn more)
- No decisions required
- "Come back when you're ready"

**NOT**: Profile form or path recommendations

---

## Technical Implementation

### New Flow Architecture

```typescript
// OLD (Wrong):
Card → /profile → Same questions → /paths → Universities

// NEW (Correct):
Card → Azure AI Reasoning → Dynamic Flow → Situation-Specific Outcome
```

### Files to Create/Modify

1. **`lib/ai-reasoning/situation-analyzer.ts`**
   - Analyzes which card was selected
   - Calls Azure OpenAI to reason about user needs
   - Returns dynamic question set + flow strategy

2. **`app/api/analyze-situation/route.ts`**
   - API endpoint for AI reasoning
   - Takes: situation type + optional context
   - Returns: questions to ask + flow type

3. **`app/journey/[situation]/page.tsx`**
   - Dynamic page based on situation
   - Different UI per situation
   - AI-driven conversation

4. **`lib/ai-reasoning/outcome-generator.ts`**
   - Generates situation-specific outcomes
   - Exploration map for "don't know"
   - Validation report for "unsure"
   - Recovery plan for "something wrong"
   - Universities for "study abroad"

### Azure OpenAI Prompts Per Situation

#### Exploration Mode Prompt:
```
You are helping a student who doesn't know what to do next.
They are confused and overwhelmed.

Your goal: Help them explore options WITHOUT pushing them toward universities.

Ask open-ended questions about:
- Their interests and skills
- Their constraints (money, time, location)
- What they've considered
- What scares them

Then suggest multiple paths:
- Traditional university
- Bootcamps/certificates
- Gap year + work
- Apprenticeships
- Online learning

Be supportive. No pressure. Help them discover.
```

#### Validation Mode Prompt:
```
You are helping a student who already made a choice but feels unsure.

Your goal: Validate their decision OR help them reconsider.

Ask:
- What did they choose?
- Why are they unsure?
- What are their doubts?

Then analyze:
- Is this a good fit for them?
- What risks did they miss?
- Should they proceed or reconsider?

Be honest but supportive.
```

#### Recovery Mode Prompt:
```
You are helping a student in crisis. Something went wrong.

Your goal: Provide immediate help and recovery plan.

Ask:
- What happened? (visa rejected, money issues, failed course, etc.)
- When did it happen?
- What have they tried?

Then provide:
- Immediate actions (next 48 hours)
- Short-term plan (1-4 weeks)
- Long-term fallbacks
- Emotional support

Be empathetic and practical.
```

---

## Key Differences Summary

| Situation | Questions | AI Focus | Output |
|-----------|-----------|----------|--------|
| Don't know | Open-ended, exploratory | Discover interests | Exploration map |
| Study abroad | Targeted, practical | Find best paths | University recommendations |
| Unsure | Reflective, analytical | Validate decision | Decision analysis |
| Something wrong | Crisis-focused | Solve problem | Recovery plan |
| Explore safely | Minimal, optional | Inform without pressure | General insights |

---

## Implementation Priority

1. ✅ Create AI reasoning layer
2. ✅ Build situation-specific prompts
3. ✅ Create dynamic journey pages
4. ✅ Implement outcome generators
5. ✅ Test each flow independently

---

## Success Criteria

- User selects "I don't know" → Gets exploration, NOT universities
- User selects "Unsure" → Gets validation, NOT new options
- User selects "Something wrong" → Gets recovery plan, NOT universities
- User selects "Study abroad" → Gets universities (only this one!)
- User selects "Explore" → Gets info, NO pressure

**Each card must feel completely different.**
