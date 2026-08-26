import { Resource, initialResources } from '../../data/mockData';

export const resourceMcp = {
  search_youtube: async (query: string): Promise<Resource[]> => {
    return initialResources.filter(r => r.type === 'video' && r.title.toLowerCase().includes(query.toLowerCase()));
  },

  search_courses: async (query: string): Promise<Resource[]> => {
    return [
      {
        id: 'res-course-1',
        title: 'DeepLearning.AI: Generative Adversarial Networks & Sequence Models',
        type: 'course',
        difficulty: 'Intermediate',
        duration: '12 hours',
        whyRecommended: 'Perfect theoretical walkthrough of sequence mapping and latent variables.',
        url: 'https://coursera.org',
        completed: false
      }
    ];
  },

  search_books: async (query: string): Promise<Resource[]> => {
    return [
      {
        id: 'res-book-1',
        title: 'Speech and Language Processing by Daniel Jurafsky & James H. Martin',
        type: 'book',
        difficulty: 'Advanced',
        duration: 'Chapter 9-11',
        whyRecommended: 'The gold standard textbook mapping attention equations and syntax structures.',
        url: 'https://web.stanford.edu/~jurafsky/slp3/',
        completed: false
      }
    ];
  },

  search_papers: async (query: string): Promise<Resource[]> => {
    return initialResources.filter(r => r.type === 'paper');
  },

  search_documentation: async (query: string): Promise<Resource[]> => {
    return initialResources.filter(r => r.type === 'doc');
  }
};
