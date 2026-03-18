import { NextRequest } from 'next/server';
import { getCurrentUser, handleApiError } from '@/lib/api-utils';
import { successResponse, errorResponse } from '@/utils/api-response';
import { prisma } from '@/lib/prisma';
import { AIInterviewService } from '@/services/ai-interview.service';
import { extractText } from 'unpdf';

/**
 * POST /api/interview-sets/generate
 * Generate interview questions from CV (PDF) + JD text
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return errorResponse('Authentication required', 401);
    }

    const formData: any = await req.formData();
    const cvFile = formData.get('cvFile') as File | null;
    const jdText = formData.get('jdText') as string | null;
    const difficulty = (formData.get('difficulty') as string) || 'MEDIUM';
    const totalQuestions = parseInt(formData.get('totalQuestions') as string) || 15;

    if (!cvFile) {
      return errorResponse('CV file (PDF) is required', 400);
    }
    if (!jdText || jdText.trim().length === 0) {
      return errorResponse('Job description text is required', 400);
    }

    // Extract text from PDF
    const arrayBuffer = await cvFile.arrayBuffer();
    const { text: pages } = await extractText(new Uint8Array(arrayBuffer), { mergePages: true });
    const cvText = Array.isArray(pages) ? pages.join('\n') : (pages as string);

    if (!cvText || cvText.trim().length < 50) {
      return errorResponse(
        'Could not extract sufficient text from the CV file. Please upload a valid PDF.',
        400
      );
    }

    // Strip null bytes (0x00) which are invalid in PostgreSQL UTF-8 text fields
    const sanitizedCvText = cvText.replace(/\x00/g, '');
    const sanitizedJdText = jdText.replace(/\x00/g, '');

    // Create the question set record first (status: GENERATING)
    const questionSet = await prisma.interviewQuestionSet.create({
      data: {
        userId: user.id,
        title: `Interview Set - ${new Date().toLocaleDateString('vi-VN')}`,
        cvText: sanitizedCvText,
        jdText: sanitizedJdText,
        difficulty: difficulty as any,
        totalQuestions,
        estimatedDuration: Math.ceil(totalQuestions * 3), // ~3 min per question
        status: 'GENERATING',
      },
    });

    try {
      // Generate questions via AI
      const generatedQuestions = await AIInterviewService.generateQuestionSet(
        sanitizedCvText,
        sanitizedJdText,
        difficulty as 'EASY' | 'MEDIUM' | 'HARD',
        totalQuestions
      );

      // Save questions to DB
      await prisma.interviewQuestion.createMany({
        data: generatedQuestions.map((q, index) => ({
          questionSetId: questionSet.id,
          orderIndex: index + 1,
          question: q.question,
          category: q.category,
          difficulty: q.difficulty as any,
          sampleAnswer: q.sampleAnswer,
        })),
      });

      // Update set status to READY
      const updatedSet = await prisma.interviewQuestionSet.update({
        where: { id: questionSet.id },
        data: {
          status: 'READY',
          title: generatedQuestions[0]?.category
            ? `${generatedQuestions[0].category} Interview - ${new Date().toLocaleDateString('vi-VN')}`
            : questionSet.title,
        },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
          _count: { select: { questions: true } },
        },
      });

      return successResponse(updatedSet, 'Interview questions generated successfully', 201);
    } catch (aiError) {
      // Mark as FAILED if AI generation fails
      await prisma.interviewQuestionSet.update({
        where: { id: questionSet.id },
        data: { status: 'FAILED' },
      });
      throw aiError;
    }
  } catch (error) {
    return handleApiError(error);
  }
}
