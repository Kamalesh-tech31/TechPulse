import { supabase } from '../config/supabase';

export class LearningService {
  static async getProgress(userId: string) {
    // 1. Fetch completed lessons
    const { data: lessons, error: lessonsError } = await supabase
      .from('lesson_completion')
      .select('lesson_id')
      .eq('user_id', userId);

    if (lessonsError) throw lessonsError;

    // 2. Fetch quiz results
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quiz_results')
      .select('module_id, highest_score, passed')
      .eq('user_id', userId);

    if (quizzesError) throw quizzesError;

    // 3. Fetch overall progress
    const { data: overall, error: overallError } = await supabase
      .from('user_learning_progress')
      .select('completed_lessons, progress_percentage, final_assessment_passed')
      .eq('user_id', userId)
      .maybeSingle();

    if (overallError) throw overallError;

    const completedLessons = (lessons || []).map(l => l.lesson_id);
    const completedQuizzes = (quizzes || []).filter(q => q.passed).map(q => q.module_id);
    const quizScores: Record<number, number> = {};
    (quizzes || []).forEach(q => {
      quizScores[q.module_id] = q.highest_score;
    });
    const finalAssessmentPassed = overall ? overall.final_assessment_passed : false;
    const progressPercentage = overall ? overall.progress_percentage : 0;

    return {
      completedLessons,
      completedQuizzes,
      quizScores,
      finalAssessmentPassed,
      progressPercentage
    };
  }

  static async completeLesson(userId: string, lessonId: string) {
    const { data: insertData, error: insertError } = await supabase
      .from('lesson_completion')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        completed_at: new Date().toISOString()
      }, { onConflict: 'user_id,lesson_id' })
      .select('*')
      .single();

    if (insertError) throw insertError;

    // Automatically recalculate progress and update user_learning_progress table
    await LearningService.recalculateProgress(userId);

    return insertData;
  }

  static async saveQuizResult(userId: string, moduleId: number, score: number, questionsCount: number) {
    const passed = (score / questionsCount) * 100 >= 75; // >= 75% score required to pass

    // First fetch existing to check if this is a new highest score
    const { data: existing, error: fetchError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const highestScore = existing ? Math.max(existing.highest_score, score) : score;
    const isPassed = existing ? (existing.passed || passed) : passed;

    const { data: insertData, error: insertError } = await supabase
      .from('quiz_results')
      .upsert({
        user_id: userId,
        module_id: moduleId,
        highest_score: highestScore,
        passed: isPassed,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,module_id' })
      .select('*')
      .single();

    if (insertError) throw insertError;

    // Automatically recalculate progress and update user_learning_progress table
    await LearningService.recalculateProgress(userId);

    return insertData;
  }

  static async passFinalAssessment(userId: string) {
    // First, update final_assessment_passed status inside user_learning_progress
    const { error: upsertError } = await supabase
      .from('user_learning_progress')
      .upsert({
        user_id: userId,
        final_assessment_passed: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (upsertError) throw upsertError;

    // Recalculate progress to update progress_percentage & completed_lessons fields
    const data = await LearningService.recalculateProgress(userId);
    return data;
  }

  static async recalculateProgress(userId: string) {
    // 1. Get completed lessons count
    const { count: lessonsCount, error: lessonsError } = await supabase
      .from('lesson_completion')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (lessonsError) throw lessonsError;
    const completedLessonsCount = lessonsCount || 0;

    // 2. Get completed quizzes count
    const { count: quizzesCount, error: quizzesError } = await supabase
      .from('quiz_results')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('passed', true);

    if (quizzesError) throw quizzesError;
    const completedQuizzesCount = quizzesCount || 0;

    // 3. Get final assessment passed status
    const { data: overallProgress, error: overallError } = await supabase
      .from('user_learning_progress')
      .select('final_assessment_passed')
      .eq('user_id', userId)
      .maybeSingle();

    if (overallError) throw overallError;
    const finalAssessmentPassed = overallProgress ? overallProgress.final_assessment_passed : false;

    // 4. Calculate progress percentage
    // Total items: 35 lessons + 7 quizzes + 1 final assessment = 43
    const totalItems = 35 + 7 + 1;
    const completedItems = completedLessonsCount + completedQuizzesCount + (finalAssessmentPassed ? 1 : 0);
    const progressPercentage = Math.round((completedItems / totalItems) * 100) || 0;

    // 5. Update user_learning_progress
    const { data, error } = await supabase
      .from('user_learning_progress')
      .upsert({
        user_id: userId,
        completed_lessons: completedLessonsCount,
        progress_percentage: progressPercentage,
        final_assessment_passed: finalAssessmentPassed,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }
}
