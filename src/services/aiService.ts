import OpenAI from 'openai';
import { AISuggestion, Objective, ContentAnalysis } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateObjectivesFromContent(content: string): Promise<Objective[]> {
  try {
    const prompt = `Analyze this content and generate appropriate learning objectives. Create both terminal and enabling objectives. Terminal objectives should be high-level outcomes, while enabling objectives should be specific steps to achieve the terminal objectives. Format as JSON array with objects containing:
    {
      type: "terminal" or "enabling",
      level: Bloom's level,
      verb: appropriate action verb,
      task: specific learning task,
      condition: learning conditions,
      criteria: measurable success criteria,
      parentId: null for terminal, terminal objective's id for enabling
    }
    
    Content to analyze: ${content}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const objectives = JSON.parse(response.choices[0].message.content || '[]');
    return objectives.map((obj: any) => ({
      ...obj,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Failed to generate objectives:', error);
    throw new Error('Failed to generate objectives from content');
  }
}

export async function validateObjective(objective: Objective): Promise<string[]> {
  try {
    const prompt = `Analyze this learning objective and provide specific improvement suggestions:
    Type: ${objective.type}
    Level: ${objective.level}
    Verb: ${objective.verb}
    Task: ${objective.task}
    Condition: ${objective.condition}
    Criteria: ${objective.criteria}

    Consider:
    1. SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound)
    2. Appropriate use of Bloom's taxonomy verbs
    3. Clarity and precision of language
    4. Measurability of success criteria
    5. Alignment with objective type (terminal vs enabling)
    
    Return an array of specific, actionable suggestions.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || '[]');
  } catch (error) {
    console.error('Validation error:', error);
    throw new Error('Failed to validate objective');
  }
}

export async function analyzeObjectiveAlignment(objectives: Objective[]): Promise<{
  alignmentIssues: string[];
  improvements: string[];
}> {
  try {
    const prompt = `Analyze these learning objectives for alignment and completeness:
    ${objectives.map(obj => `
      Type: ${obj.type}
      Level: ${obj.level}
      Verb: ${obj.verb}
      Task: ${obj.task}
      Condition: ${obj.condition}
      Criteria: ${obj.criteria}
      ${obj.parentId ? `Parent ID: ${obj.parentId}` : ''}
    `).join('\n')}

    Evaluate:
    1. Do enabling objectives properly support their terminal objectives?
    2. Are there any gaps in the learning progression?
    3. Is there appropriate coverage of all necessary skills/knowledge?
    4. Are the objectives properly sequenced?
    
    Return JSON with:
    {
      "alignmentIssues": [array of specific alignment problems],
      "improvements": [array of suggested improvements]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      alignmentIssues: result.alignmentIssues || [],
      improvements: result.improvements || []
    };
  } catch (error) {
    console.error('Alignment analysis error:', error);
    throw new Error('Failed to analyze alignment');
  }
}

export async function improveObjectives(objectives: Objective[]): Promise<Objective[]> {
  try {
    const prompt = `Improve these learning objectives while maintaining their relationships:
    ${objectives.map(obj => `
      Type: ${obj.type}
      Level: ${obj.level}
      Verb: ${obj.verb}
      Task: ${obj.task}
      Condition: ${obj.condition}
      Criteria: ${obj.criteria}
      ${obj.parentId ? `Parent ID: ${obj.parentId}` : ''}
    `).join('\n')}

    Return a JSON array of improved objectives with the same structure but better:
    1. More precise verbs from Bloom's taxonomy
    2. Clearer task descriptions
    3. More specific conditions
    4. More measurable criteria
    5. Maintained relationships between terminal and enabling objectives`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const improvedObjectives = JSON.parse(response.choices[0].message.content || '[]');
    return improvedObjectives.map((obj: any, index: number) => ({
      ...obj,
      id: objectives[index]?.id || crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Objectives improvement error:', error);
    throw new Error('Failed to improve objectives');
  }
}

export async function getDetailedFeedback(objective: Objective): Promise<{
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  examples: string[];
}> {
  try {
    const prompt = `Provide detailed feedback for this learning objective:
    Type: ${objective.type}
    Level: ${objective.level}
    Verb: ${objective.verb}
    Task: ${objective.task}
    Condition: ${objective.condition}
    Criteria: ${objective.criteria}

    Return JSON with:
    {
      "strengths": [specific strong points],
      "weaknesses": [areas needing improvement],
      "suggestions": [specific improvement suggestions],
      "examples": [example revisions]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Detailed feedback error:', error);
    throw new Error('Failed to get detailed feedback');
  }
}