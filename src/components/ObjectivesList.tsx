import React, { useState } from 'react';
import { Trash2, MessageCircle, Loader, CheckCircle2 } from 'lucide-react';
import { Objective } from '../types';
import ObjectiveFeedback from './ObjectiveFeedback';
import { getDetailedFeedback, analyzeObjectiveAlignment } from '../services/aiService';

interface ObjectivesListProps {
  objectives: Objective[];
  onDelete: (id: string) => void;
}

function ObjectivesList({ objectives, onDelete }: ObjectivesListProps) {
  const [detailedFeedback, setDetailedFeedback] = useState<Record<string, {
    strengths: string[];
    improvements: string[];
    examples: string[];
    explanation: string;
  }>>({});

  const [alignmentAnalysis, setAlignmentAnalysis] = useState<{
    alignment: {
      coverage: string[];
      gaps: string[];
      progression: string[];
    };
    suggestions: string[];
    explanation: string;
  } | null>(null);

  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleGetDetailedFeedback = async (objective: Objective) => {
    if (loading[objective.id]) return;

    setLoading(prev => ({ ...prev, [objective.id]: true }));
    try {
      const feedback = await getDetailedFeedback(objective);
      setDetailedFeedback(prev => ({
        ...prev,
        [objective.id]: feedback
      }));
    } catch (error) {
      console.error('Failed to get detailed feedback:', error);
    } finally {
      setLoading(prev => ({ ...prev, [objective.id]: false }));
    }
  };

  const handleAnalyzeAlignment = async () => {
    if (objectives.length < 2) return;
    
    try {
      const analysis = await analyzeObjectiveAlignment(objectives);
      setAlignmentAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze alignment:', error);
    }
  };

  if (objectives.length === 0) return null;

  return (
    <div className="space-y-6">
      {objectives.length >= 2 && (
        <button
          onClick={handleAnalyzeAlignment}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <CheckCircle2 size={18} />
          Analyze Objective Alignment
        </button>
      )}

      {alignmentAnalysis && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Objective Alignment Analysis</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Coverage</h5>
              <ul className="list-disc list-inside space-y-1">
                {alignmentAnalysis.alignment.coverage.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600">{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Learning Progression</h5>
              <ul className="list-disc list-inside space-y-1">
                {alignmentAnalysis.alignment.progression.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600">{item}</li>
                ))}
              </ul>
            </div>

            {alignmentAnalysis.alignment.gaps.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Potential Gaps</h5>
                <ul className="list-disc list-inside space-y-1">
                  {alignmentAnalysis.alignment.gaps.map((gap, index) => (
                    <li key={index} className="text-sm text-gray-600">{gap}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h5 className="text-sm font-medium text-indigo-900 mb-2">Learning Insight</h5>
              <p className="text-sm text-indigo-700">{alignmentAnalysis.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {objectives.map((objective) => (
        <div
          key={objective.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full">
                  {objective.level.charAt(0).toUpperCase() + objective.level.slice(1)}
                </span>
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
                  {objective.type}
                </span>
                <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
                  {objective.verb}
                </span>
              </div>
              
              <p className="text-gray-900 font-medium mb-2">
                {objective.verb} {objective.task}
              </p>
              
              {objective.condition && (
                <p className="text-gray-600 text-sm mb-1">
                  <span className="font-medium">Condition:</span> {objective.condition}
                </p>
              )}
              
              <p className="text-gray-600 text-sm">
                <span className="font-medium">Success Criteria:</span> {objective.criteria}
              </p>

              {detailedFeedback[objective.id] && (
                <ObjectiveFeedback feedback={detailedFeedback[objective.id]} />
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleGetDetailedFeedback(objective)}
                disabled={loading[objective.id]}
                className={`p-2 rounded-lg transition-colors ${
                  loading[objective.id] 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-400 hover:text-indigo-500 hover:bg-gray-100'
                }`}
              >
                {loading[objective.id] ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <MessageCircle size={18} />
                )}
              </button>
              <button
                onClick={() => onDelete(objective.id)}
                disabled={loading[objective.id]}
                className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ObjectivesList;