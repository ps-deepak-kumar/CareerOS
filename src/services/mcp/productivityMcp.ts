export interface ScheduleSummary {
  workHours: number;
  studyHours: number;
  availableHours: number;
  workCompletionPercent: number;
  learningCompletionPercent: number;
}

export const productivityMcp = {
  get_available_time: async (date: string): Promise<{ total: number; buffer: number }> => {
    return { total: 24, buffer: 2.5 };
  },

  create_schedule: async (workTasksCount: number, studyTasksCount: number): Promise<ScheduleSummary> => {
    return {
      workHours: workTasksCount * 1.8,
      studyHours: studyTasksCount * 0.75,
      availableHours: 24 - (workTasksCount * 1.8) - (studyTasksCount * 0.75) - 8, // 8h sleep
      workCompletionPercent: 60,
      learningCompletionPercent: 25
    };
  }
};
