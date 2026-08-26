export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const assessmentMcp = {
  create_quiz: async (topic: string): Promise<QuizQuestion[]> => {
    if (topic.toLowerCase().includes('attention') || topic.toLowerCase().includes('transformer')) {
      return [
        {
          id: 'q-1',
          question: 'What is the purpose of scaling the dot product by 1/sqrt(d_k) in Scaled Dot-Product Attention?',
          options: [
            'To reduce memory footprint during forward propagation.',
            'To prevent the dot products from growing large in magnitude, which pushes the softmax function into regions with extremely small gradients.',
            'To ensure the weight matrices Q and K remain orthogonal.',
            'To normalize the output vector coordinates to a range between -1 and 1.'
          ],
          correctIndex: 1,
          explanation: 'As d_k (vector dimension) grows large, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients (vanishing gradient problem). Scaling by 1/sqrt(d_k) stabilizes training.'
        },
        {
          id: 'q-2',
          question: 'In self-attention, what is the role of the Value (V) vector?',
          options: [
            'It represents the database search query issued by each word.',
            'It serves as the index lookup key representing word relevance.',
            'It contains the actual semantic content/representation of the input token that is weighted and aggregated to form the output.',
            'It acts as a positional offset to track sequence indices.'
          ],
          correctIndex: 2,
          explanation: 'The Query (Q) vector searches, the Key (K) vector is matched against, and the Value (V) vector represents the actual content that is aggregated based on the calculated attention scores.'
        },
        {
          id: 'q-3',
          question: 'Why does the standard Transformer architecture require Positional Encodings?',
          options: [
            'Because self-attention operates in parallel and is permutation-invariant (order-insensitive), losing sequential context.',
            'To accelerate matrix multiplication processes on GPU clusters.',
            'To scale the learning rate parameters dynamically.',
            'To enable sequence-to-sequence decoding limits.'
          ],
          correctIndex: 0,
          explanation: 'Unlike RNNs which process tokens sequentially, Transformers calculate self-attention in parallel. Since the dot-product calculations are permutation-invariant, positional encodings are added to token embeddings to inject order context.'
        }
      ];
    }

    return [
      {
        id: 'q-gen-1',
        question: `What is the fundamental concept behind ${topic}?`,
        options: [
          'It is a method for optimizing gradient descent algorithms.',
          'It represents the core principle of modular abstract mapping.',
          'It enables sequence scaling limits.',
          'None of the above.'
        ],
        correctIndex: 1,
        explanation: `The core principle of ${topic} relies on abstract mapping and parameter configuration.`
      }
    ];
  },

  evaluate_answer: async (questionId: string, selectedIndex: number): Promise<{ correct: boolean; explanation: string }> => {
    return { correct: true, explanation: 'Mock evaluator: Valid answer input verified.' };
  },

  save_quiz_result: async (goalId: string, score: number, total: number): Promise<{ saved: boolean }> => {
    return { saved: true };
  }
};
